import { db } from "~/services/db"
import { BBL_ROUTES, MARQUEE_PHOTOS } from "../bbl-landing-content"

/**
 * Promotion-marquee data — the rosters shown in the "Recent Promotions" carousel.
 * Server-only: pulled from `PromotionEvent` → `RankAward` at render (the lineage
 * tree is the source of truth, ADR 0016). Kept apart from the presentational
 * `bbl-promotion-marquee.tsx` so the orchestrator can fetch this eagerly while the
 * carousel component itself stays a lazy boundary.
 */

export type MarqueeMemberView = {
  name: string
  rank: string
  /** `Rank.colorHex` (DB) — drives the data-driven belt swatch, never a literal. */
  colorHex: string | null
  image?: string
  date?: string
}

export type MarqueeRow = {
  key: string
  label: string
  href: string
  members: MarqueeMemberView[]
}

/** "Coral Belt (Red/Black) - 7th Degree" -> "7th Degree Coral Belt" (display only; tree stays SoT). */
const formatRankName = (rank: string) => {
  const gm = rank.includes("Grand Master")
  const cleaned = rank
    .replace(/\s*\(Grand Master\)\s*/, "")
    .replace(/\s*\(Red\/(?:Black|White)\)\s*/, " ")
  const match = cleaned.match(/^(.+?Belt)\s*-\s*(\d+(?:st|nd|rd|th) Degree)$/)
  const base = match ? `${match[2]} ${match[1].trim()}` : rank
  return gm ? `${base} — Grand Master` : base
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })

type MarqueePassport = {
  displayName: string | null
  avatarUrl: string | null
  user: { name: string | null; image: string | null } | null
}

/**
 * @changed SESSION_0392 (Phase 3c) — RankAward earner is the Passport, not User. Name/photo
 * prefer Passport identity, then fall back to the linked account (placeholders have no user).
 * The null-passport guard lives in `toMember`, so this merge stays flat (no deep chains).
 */
const memberIdentity = (
  passport: MarqueePassport,
): { name: string | null; avatar: string | null } => {
  const account = passport.user
  if (!account) return { name: passport.displayName, avatar: passport.avatarUrl }
  return {
    name: passport.displayName ?? account.name,
    avatar: passport.avatarUrl ?? account.image,
  }
}

const toMember = (award: {
  passport: MarqueePassport | null
  rank: { name: string; colorHex: string | null }
}): MarqueeMemberView[] => {
  const passport = award.passport
  if (!passport) return []
  const { name, avatar } = memberIdentity(passport)
  if (!name) return []
  return [
    {
      name,
      rank: formatRankName(award.rank.name),
      colorHex: award.rank.colorHex,
      image: avatar ?? MARQUEE_PHOTOS[name],
    },
  ]
}

/** Rosters come from the lineage tree (PromotionEvent -> RankAward, ADR 0016). */
export const getPromotionMarqueeRows = async (): Promise<MarqueeRow[]> => {
  const memberSelect = {
    passport: {
      select: { displayName: true, avatarUrl: true, user: { select: { name: true, image: true } } },
    },
    rank: { select: { name: true, colorHex: true } },
  } as const

  const [events, individualAwards] = await Promise.all([
    db.promotionEvent.findMany({
      orderBy: { eventDate: "desc" },
      take: 2,
      select: {
        id: true,
        title: true,
        slug: true,
        eventDate: true,
        location: true,
        rankAwards: { select: memberSelect },
      },
    }),
    // Recent top-rank promotions awarded outside a recorded ceremony (e.g. Meyer, Will).
    db.rankAward.findMany({
      where: {
        promotionEventId: null,
        awardedAt: { gte: new Date("2024-01-01") },
        OR: [{ rank: { name: { contains: "Coral" } } }, { rank: { name: { contains: "Red" } } }],
      },
      orderBy: { awardedAt: "desc" },
      take: 8,
      select: { ...memberSelect, awardedAt: true },
    }),
  ])

  const rows: MarqueeRow[] = []
  const [latestEvent, ...olderEvents] = events.filter(event => event.rankAwards.length > 0)

  if (latestEvent) {
    rows.push({
      key: latestEvent.id,
      label: [latestEvent.title, formatDate(latestEvent.eventDate), latestEvent.location]
        .filter(Boolean)
        .join(" · "),
      href: latestEvent.slug ? `/events/${latestEvent.slug}` : BBL_ROUTES.lineage,
      members: latestEvent.rankAwards.flatMap(toMember),
    })
  }

  // Older ceremonies + individual promotions share one row; every card carries its date.
  const olderMembers = [
    ...olderEvents.flatMap(event =>
      event.rankAwards.flatMap(award =>
        toMember(award).map(member => ({ ...member, date: formatDate(event.eventDate) })),
      ),
    ),
    ...individualAwards.flatMap(award =>
      toMember(award).map(member => ({
        ...member,
        date: award.awardedAt ? formatDate(award.awardedAt) : undefined,
      })),
    ),
  ]

  if (olderMembers.length > 0) {
    rows.push({
      key: "recent-promotions",
      label: "More Recent Promotions",
      href: BBL_ROUTES.lineage,
      members: olderMembers,
    })
  }

  return rows
}
