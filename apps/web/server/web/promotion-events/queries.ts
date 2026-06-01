import { cacheLife, cacheTag } from "next/cache"
import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"
import {
  type PromotionEventCard,
  type PromotionEventDetail,
  type PromotionTimelineAwardRow,
  promotionEventCardPayload,
  promotionEventDetailPayload,
  promotionTimelineAwardPayload,
} from "./payloads"

type TimelineSource = "hosted" | "awarded" | "hosted-and-awarded" | "award"

type PromotionTimelineAwardSummary = {
  id: string
  personName: string
  rankName: string
  rankShortName: string | null
  awardedAt: Date | null
  promoterName: string | null
  organizationName: string | null
}

export type PromotionTimelineEntry = {
  id: string
  title: string
  href: string | null
  date: Date | null
  location: string | null
  description: string | null
  hostOrganizationName: string | null
  hostOrganizationSlug: string | null
  source: TimelineSource
  awardedHereCount: number
  totalAwardCount: number
  photoCount: number
  awards: PromotionTimelineAwardSummary[]
}

const summarizeAward = (
  award: PromotionEventCard["rankAwards"][number] | PromotionTimelineAwardRow,
): PromotionTimelineAwardSummary => ({
  id: award.id,
  personName: award.user.name ?? "Unnamed promotee",
  rankName: award.rank.name,
  rankShortName: award.rank.shortName,
  awardedAt: award.awardedAt,
  promoterName: award.awardedBy?.name ?? null,
  organizationName: award.organization?.name ?? null,
})

const timelineEntryFromEvent = ({
  event,
  hosted,
  awardedHereIds,
}: {
  event: PromotionEventCard
  hosted: boolean
  awardedHereIds: Set<string>
}): PromotionTimelineEntry => {
  const source: TimelineSource =
    hosted && awardedHereIds.size > 0 ? "hosted-and-awarded" : hosted ? "hosted" : "awarded"

  return {
    id: event.id,
    title: event.title,
    href: event.slug ? `/events/${event.slug}` : null,
    date: event.eventDate,
    location:
      event.location ??
      ([event.hostOrganization?.city, event.hostOrganization?.state].filter(Boolean).join(", ") ||
        null),
    description: event.description,
    hostOrganizationName: event.hostOrganization?.name ?? null,
    hostOrganizationSlug: event.hostOrganization?.slug ?? null,
    source,
    awardedHereCount: awardedHereIds.size,
    totalAwardCount: event._count.rankAwards,
    photoCount: event._count.mediaAttachments,
    awards: event.rankAwards.map(summarizeAward),
  }
}

const compareTimelineEntries = (a: PromotionTimelineEntry, b: PromotionTimelineEntry) => {
  const aTime = a.date?.getTime() ?? 0
  const bTime = b.date?.getTime() ?? 0
  if (aTime !== bTime) return bTime - aTime
  return a.title.localeCompare(b.title)
}

export const findPromotionEventSlugs = async (): Promise<Array<{ slug: string }>> => {
  "use cache"

  cacheTag("promotion-events")
  cacheLife("hours")

  const events = await db.promotionEvent.findMany({
    where: { slug: { not: null } },
    select: { slug: true },
    orderBy: { eventDate: "desc" },
  })

  return events
    .map(event => event.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map(slug => ({ slug }))
}

export const getPromotionEventBySlug = async (
  slug: string,
): Promise<PromotionEventDetail | null> => {
  "use cache"

  cacheTag("promotion-events", `promotion-event-${slug}`)
  cacheLife("minutes")

  return await db.promotionEvent.findUnique({
    where: { slug },
    select: promotionEventDetailPayload,
  })
}

export const findPublicPromotionEvents = async (brand: Brand): Promise<PromotionEventCard[]> => {
  "use cache"

  cacheTag("promotion-events", `promotion-events-${brand}`)
  cacheLife("minutes")

  return await db.promotionEvent.findMany({
    where: {
      slug: { not: null },
      OR: [
        { hostOrganization: { is: { brand } } },
        { rankAwards: { some: { organization: { is: { brand } } } } },
        {
          hostOrganizationId: null,
          rankAwards: { none: { organizationId: { not: null } } },
        },
      ],
    },
    select: promotionEventCardPayload,
    orderBy: [{ eventDate: "desc" }, { title: "asc" }],
  })
}

export const getPromotionTimelineForOrganization = async (
  organizationId: string,
): Promise<PromotionTimelineEntry[]> => {
  "use cache"

  cacheTag(`organization-promotion-timeline-${organizationId}`)
  cacheLife("minutes")

  const [hostedEvents, awardedRanks] = await Promise.all([
    db.promotionEvent.findMany({
      where: {
        slug: { not: null },
        hostOrganizationId: organizationId,
      },
      select: promotionEventCardPayload,
      orderBy: [{ eventDate: "desc" }, { title: "asc" }],
    }),
    db.rankAward.findMany({
      where: { organizationId },
      select: promotionTimelineAwardPayload,
      orderBy: [{ awardedAt: "desc" }, { createdAt: "desc" }],
    }),
  ])

  const eventsById = new Map<
    string,
    { event: PromotionEventCard; hosted: boolean; awardedHereIds: Set<string> }
  >()

  for (const event of hostedEvents) {
    eventsById.set(event.id, { event, hosted: true, awardedHereIds: new Set() })
  }

  const unlinkedAwardEntries: PromotionTimelineEntry[] = []

  for (const award of awardedRanks) {
    if (award.promotionEvent) {
      const existing = eventsById.get(award.promotionEvent.id)
      if (existing) {
        existing.awardedHereIds.add(award.id)
      } else {
        eventsById.set(award.promotionEvent.id, {
          event: award.promotionEvent,
          hosted: false,
          awardedHereIds: new Set([award.id]),
        })
      }
      continue
    }

    const summary = summarizeAward(award)
    unlinkedAwardEntries.push({
      id: `award-${award.id}`,
      title: `${summary.personName} promoted to ${summary.rankName}`,
      href: null,
      date: award.awardedAt,
      location: award.location,
      description: null,
      hostOrganizationName: null,
      hostOrganizationSlug: null,
      source: "award",
      awardedHereCount: 1,
      totalAwardCount: 1,
      photoCount: 0,
      awards: [summary],
    })
  }

  return [
    ...Array.from(eventsById.values()).map(timelineEntryFromEvent),
    ...unlinkedAwardEntries,
  ].sort(compareTimelineEntries)
}
