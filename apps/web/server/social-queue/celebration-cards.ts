import { OG_CARD_RANK_PROMOTION } from "~/components/web/og/promotion-card-params"
import { getOpenGraphImageUrl } from "~/lib/opengraph"
import { evaluateApprovalConsent } from "~/server/social-queue/transitions"
import { getLineageAncestryForPassport } from "~/server/web/lineage/ancestry"
import { publicPassportPayload } from "~/server/web/passport/public-payloads"
import { projectPublicPassport } from "~/server/web/passport/public-projection"
import { db } from "~/services/db"

/**
 * Celebration-card feeder — the social approval-queue's FIRST real feed (SESSION_0688,
 * stacking on SESSION_0686's `SocialQueueItem` + `socialQueue` router; spec E2 in
 * `social-content-flywheel-draft.md`).
 *
 * A VERIFIED belt promotion (`RankEntry`) becomes ONE DRAFT queue item whose payload is the
 * render-input snapshot for the celebration card (spec §2.4): card params (member name, belt
 * color from `Rank.colorHex`, lineage line), the OG-render URL for the card image, a caption
 * seed, and the CTA path. NOTHING here publishes, approves, or schedules — the item lands in
 * `DRAFT` and waits for a human in `/app/social-queue` (0686's status machine untouched).
 *
 * ═══ TRIGGER SEAM ONLY ═══
 * `enqueueRankPromotionCelebration` is an explicit server fn for a LATER admin/event-hook
 * wire-up (operator decision). It is deliberately NOT called from the promotion flow, any
 * cron, or any router in this slice — no auto-fire exists.
 *
 * ═══ CONSENT AT ENQUEUE (fails closed) ═══
 * The gate reuses 0686's `evaluateApprovalConsent` (never a parallel consent check). Since
 * fork F2 was ratified (SESSION_0705 — `Passport.allowSocialCelebration`, opt-in, default
 * OFF), the FULL consent check applies at enqueue: no subject Passport, not account-claimed
 * (a placeholder person cannot have consented), or no affirmative opt-in → NOTHING is
 * generated. Approve re-runs the same check LIVE regardless (enqueue-time consent is
 * necessary, not sufficient).
 * - PUBLIC-DATA FLOOR (flywheel ground rule 3): the member's rank display must be public
 *   (`projectPublicPassport` — `showRanks === false` or no public awards → nothing is
 *   generated). Only already-public profile fields ever enter the payload.
 */

/** Payload contract carried by RANK_PROMOTION celebration drafts (spec §2.4 snapshot). */
export type RankPromotionCelebrationPayload = {
  kind: "rank-promotion-celebration-card"
  /** Display headline — the queue list's subject line AND the OG card title. */
  headline: string
  /**
   * Celebration-card params — same *shape family* as the #288/#292 `PromotionCardInput`
   * prototype, but deliberately divergent: `beltColorHex` is nullable here (renderer falls
   * back to brand accent) and `lineageLine` replaces the prototype's `academyName`.
   */
  card: {
    name: string
    beltName: string
    /** `Rank.colorHex` verbatim; null = renderer falls back to the brand accent. */
    beltColorHex: string | null
    /** Human-formatted award date (UTC-stable). */
    date: string
    /** "Founder → … → member" promotion line; null when no PUBLIC up-chain exists. */
    lineageLine: string | null
  }
  /**
   * RELATIVE OG-render URL (`/api/og?…`) — origin-free so the stored payload never bakes in
   * an environment host; the queue surface renders it same-origin. Since SESSION_0705
   * (renderer graduation) the URL carries `card=rank-promotion` + the card params, so
   * `/api/og` renders the belt-colored `OgPromotionCard`; title/description ride along so any
   * consumer that ignores the card params still gets the generic OgBase fallback. Legacy
   * payloads (title/description only) keep rendering OgBase — null-safe by construction.
   */
  ogImageUrl: string
  /** Relative CTA path for the eventual post link (UTM decoration is the publisher's job). */
  ctaPath: string
}

export type EnqueueCelebrationResult =
  | { outcome: "created"; id: string; subjectKey: string }
  /** The `@@unique([source, subjectKey])` conflict-noop — a replayed event never duplicates. */
  | { outcome: "duplicate"; subjectKey: string }
  | {
      outcome: "skipped"
      reason: "not-found" | "not-verified" | "consent" | "rank-not-public"
    }

/**
 * Enqueue-time consent gate — DELEGATES to 0686's `evaluateApprovalConsent` for the
 * `MEMBER_OPT_IN` basis (one consent brain, never two). Post-F2 (SESSION_0705) the full
 * check applies: only a live, account-claimed subject holding the affirmative
 * `allowSocialCelebration` opt-in generates a draft. Approve re-checks live regardless.
 */
export const canEnqueueMemberOptInDraft = (
  passport: { userId: string | null; allowSocialCelebration: boolean } | null,
): boolean => evaluateApprovalConsent({ consentBasis: "MEMBER_OPT_IN", passport }).ok

/** UTC-pinned long date ("July 24, 2026") so payload snapshots are machine-stable. */
const formatAwardDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(date)

/**
 * Pure payload builder — exported for unit tests; `enqueueRankPromotionCelebration` is the
 * only production caller.
 */
export const buildRankPromotionCelebrationPayload = (input: {
  displayName: string
  beltName: string
  beltColorHex: string | null
  awardedAt: Date
  lineageLine: string | null
  /** Public directory slug, when one exists (drives the CTA path). */
  slug: string | null
}): RankPromotionCelebrationPayload => {
  const headline = `${input.displayName} promoted to ${input.beltName}`
  const date = formatAwardDate(input.awardedAt)

  return {
    kind: "rank-promotion-celebration-card",
    headline,
    card: {
      name: input.displayName,
      beltName: input.beltName,
      beltColorHex: input.beltColorHex,
      date,
      lineageLine: input.lineageLine,
    },
    // Empty origin → a relative `/api/og?…` path (see the payload contract doc above).
    // `card=rank-promotion` + params → the belt-colored OgPromotionCard render path
    // (SESSION_0705 graduation); title/description ride along as the OgBase fallback.
    ogImageUrl: getOpenGraphImageUrl(
      {
        title: headline,
        description: input.lineageLine ?? undefined,
        card: OG_CARD_RANK_PROMOTION,
        name: input.displayName,
        beltName: input.beltName,
        beltColorHex: input.beltColorHex ?? undefined,
        date,
        lineageLine: input.lineageLine ?? undefined,
      },
      "",
    ),
    ctaPath: input.slug ? `/directory/${input.slug}` : "/lineage",
  }
}

/** Caption seed — operator-editable in the queue; never auto-posted (nothing publishes). */
const buildCaptionSeed = (payload: RankPromotionCelebrationPayload): string => {
  const line = payload.card.lineageLine ? ` The line continues: ${payload.card.lineageLine}.` : ""
  return `${payload.headline}.${line} Every promotion is a link in the chain — claim your place in the legacy.`
}

/** Duck-typed Prisma P2002 check (unique-violation) — the enqueue dedupe conflict-noop. */
const isUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002"

/**
 * THE TRIGGER SEAM: turn one VERIFIED belt promotion into one DRAFT celebration queue item.
 *
 * Callable from a later admin action / event hook (that wiring is an explicit operator
 * decision — NOT taken here). Idempotent by `subjectKey` (`award:<rankEntryId>` — the
 * RankEntry id is the durable promotion identity per the RankEntry-only direction, G-011):
 * a replayed event conflict-noops, and a previously REJECTED item is never resurrected
 * (the unique key hits the existing terminal row).
 */
export const enqueueRankPromotionCelebration = async (input: {
  rankEntryId: string
}): Promise<EnqueueCelebrationResult> => {
  const entry = await db.rankEntry.findUnique({
    where: { id: input.rankEntryId },
    select: {
      id: true,
      status: true,
      passportId: true,
      // The canonical PUBLIC identity select (ADR 0025) — the projector applies the
      // showRanks redaction below; no private field is ever read. `allowSocialCelebration`
      // (fork F2, SESSION_0705) rides alongside for the consent gate ONLY — it never enters
      // the payload.
      passport: { select: { ...publicPassportPayload, allowSocialCelebration: true } },
      rank: { select: { name: true, colorHex: true } },
      rankAward: { select: { awardedAt: true } },
      createdAt: true,
    },
  })

  if (!entry) return { outcome: "skipped", reason: "not-found" }

  // Only VERIFIED promotions celebrate — an unverified/disputed award is not a public fact.
  if (entry.status !== "VERIFIED") return { outcome: "skipped", reason: "not-verified" }

  // CONSENT (fails closed): the FULL post-F2 check via 0686's gate — see the module doc.
  const subjectUserId = entry.passport.user?.id ?? null
  if (
    !canEnqueueMemberOptInDraft({
      userId: subjectUserId,
      allowSocialCelebration: entry.passport.allowSocialCelebration,
    })
  ) {
    return { outcome: "skipped", reason: "consent" }
  }

  // PUBLIC-DATA FLOOR: the ONE redaction audit point. Hidden ranks → no belt card, ever.
  const dto = projectPublicPassport(entry.passport)
  if (dto.ranks.length === 0) return { outcome: "skipped", reason: "rank-not-public" }

  // Lineage line via the existing ancestry read model ([founder … member]; [] = no chain).
  const ancestry = await getLineageAncestryForPassport(entry.passportId)
  const lineageLine =
    ancestry.length > 0 ? ancestry.map(step => step.displayName).join(" → ") : null

  const payload = buildRankPromotionCelebrationPayload({
    displayName: dto.displayName,
    beltName: entry.rank.name,
    beltColorHex: entry.rank.colorHex,
    awardedAt: entry.rankAward?.awardedAt ?? entry.createdAt,
    lineageLine,
    // `/directory/[slug]` is visibility-gated — a non-PUBLIC profile would 404 the CTA, so
    // fall back to /lineage for anything but PUBLIC (the projector returns slug regardless).
    slug: entry.passport.directoryProfile?.visibility === "PUBLIC" ? dto.slug : null,
  })

  const subjectKey = `award:${entry.id}`

  try {
    const item = await db.socialQueueItem.create({
      data: {
        source: "RANK_PROMOTION",
        subjectKey,
        payload,
        caption: buildCaptionSeed(payload),
        consentBasis: "MEMBER_OPT_IN",
        // DRAFT is the schema default AND the whole point — stated explicitly so no future
        // edit can quietly change where feeder items land. Nothing here approves/publishes.
        status: "DRAFT",
        passportId: entry.passportId,
      },
      select: { id: true },
    })
    return { outcome: "created", id: item.id, subjectKey }
  } catch (error) {
    if (isUniqueViolation(error)) return { outcome: "duplicate", subjectKey }
    throw error
  }
}
