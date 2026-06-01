import type { Brand, Prisma } from "~/.generated/prisma/client"
import type { AuthzUser } from "~/lib/authz"
import {
  buildAuthorizedRankAwardWhere,
  canAuthorPromotionEvent,
  resolvePromotionEventAuthoringScope,
} from "~/server/web/promotion-events/editor-authorization"
import { db } from "~/services/db"

type EditorEventRow = Prisma.PromotionEventGetPayload<{
  select: typeof editablePromotionEventPayload
}>

const editableRankAwardPayload = {
  id: true,
  awardedAt: true,
  location: true,
  awardedById: true,
  organizationId: true,
  promotionEventId: true,
  user: {
    select: {
      name: true,
      lineageNode: { select: { id: true } },
    },
  },
  rank: {
    select: {
      name: true,
      shortName: true,
    },
  },
  awardedBy: {
    select: { name: true },
  },
  organization: {
    select: { name: true, brand: true },
  },
} satisfies Prisma.RankAwardSelect

const editablePromotionEventPayload = {
  id: true,
  title: true,
  slug: true,
  eventDate: true,
  location: true,
  description: true,
  hostOrganizationId: true,
  hostOrganization: {
    select: { id: true, name: true, slug: true, brand: true },
  },
  rankAwards: {
    select: editableRankAwardPayload,
    orderBy: [{ awardedAt: "asc" as const }, { createdAt: "asc" as const }],
  },
  _count: {
    select: {
      rankAwards: true,
      mediaAttachments: true,
    },
  },
} satisfies Prisma.PromotionEventSelect

export type EditablePromotionEventSummary = {
  id: string
  title: string
  slug: string | null
  eventDate: Date
  location: string | null
  hostOrganizationName: string | null
  rankAwardCount: number
  photoCount: number
}

export type PromotionEventEditorOrganizationOption = {
  id: string
  name: string
  slug: string
}

export type PromotionEventEditorRankAwardOption = {
  id: string
  label: string
  detail: string
}

export type PromotionEventEditorEvent = {
  id: string
  title: string
  slug: string | null
  eventDate: string
  location: string
  description: string
  hostOrganizationId: string
  rankAwardIds: string[]
}

export type PromotionEventEditorData = {
  event: PromotionEventEditorEvent | null
  hostOrganizations: PromotionEventEditorOrganizationOption[]
  rankAwards: PromotionEventEditorRankAwardOption[]
  canCreate: boolean
}

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10)

const formatAwardLabel = (award: Prisma.RankAwardGetPayload<{ select: typeof editableRankAwardPayload }>) => {
  const person = award.user.name ?? "Unnamed promotee"
  const rank = award.rank.shortName ?? award.rank.name
  return `${person} — ${rank}`
}

const formatAwardDetail = (
  award: Prisma.RankAwardGetPayload<{ select: typeof editableRankAwardPayload }>,
) => {
  const date = award.awardedAt ? formatDateInput(award.awardedAt) : "Unknown date"
  const promoter = award.awardedBy?.name ? `Promoter: ${award.awardedBy.name}` : null
  const organization = award.organization?.name ? `School: ${award.organization.name}` : null
  const location = award.location ? `Location: ${award.location}` : null

  return [date, promoter, organization, location].filter(Boolean).join(" · ")
}

function brandRelevantEventWhere(brand: Brand): Prisma.PromotionEventWhereInput {
  return {
    OR: [
      { hostOrganization: { is: { brand } } },
      { rankAwards: { some: { organization: { is: { brand } } } } },
      {
        hostOrganizationId: null,
        rankAwards: { none: { organizationId: { not: null } } },
      },
    ],
  }
}

function brandRelevantRankAwardWhere(brand: Brand): Prisma.RankAwardWhereInput {
  return {
    OR: [
      { organization: { is: { brand } } },
      { promotionEvent: { is: { hostOrganization: { is: { brand } } } } },
      { organizationId: null },
    ],
  }
}

const toEditorEvent = (event: EditorEventRow): PromotionEventEditorEvent => ({
  id: event.id,
  title: event.title,
  slug: event.slug,
  eventDate: formatDateInput(event.eventDate),
  location: event.location ?? "",
  description: event.description ?? "",
  hostOrganizationId: event.hostOrganizationId ?? "",
  rankAwardIds: event.rankAwards.map(award => award.id),
})

export async function findEditablePromotionEvents({
  brand,
  user,
}: {
  brand: Brand
  user: AuthzUser
}): Promise<EditablePromotionEventSummary[]> {
  const scope = await resolvePromotionEventAuthoringScope({ db, brand, user })

  const rankAwardWhere = buildAuthorizedRankAwardWhere({
    scope,
    userId: user.id,
  })

  const candidateWhere: Prisma.PromotionEventWhereInput = scope.isGlobalAdmin
    ? brandRelevantEventWhere(brand)
    : {
        AND: [
          brandRelevantEventWhere(brand),
          {
            OR: [
              ...(scope.organizationIds.size > 0
                ? [{ hostOrganizationId: { in: Array.from(scope.organizationIds) } }]
                : []),
              { rankAwards: { some: rankAwardWhere } },
            ],
          },
        ],
      }

  const events = await db.promotionEvent.findMany({
    where: candidateWhere,
    select: editablePromotionEventPayload,
    orderBy: [{ eventDate: "desc" }, { title: "asc" }],
    take: 100,
  })

  return events
    .filter(event =>
      canAuthorPromotionEvent({
        scope,
        event,
        hostOrganizationId: event.hostOrganizationId,
        awards: event.rankAwards,
        userId: user.id,
      }),
    )
    .map(event => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      eventDate: event.eventDate,
      location: event.location,
      hostOrganizationName: event.hostOrganization?.name ?? null,
      rankAwardCount: event._count.rankAwards,
      photoCount: event._count.mediaAttachments,
    }))
}

export async function getPromotionEventEditorData({
  brand,
  user,
  eventId,
}: {
  brand: Brand
  user: AuthzUser
  eventId?: string
}): Promise<PromotionEventEditorData | null> {
  const scope = await resolvePromotionEventAuthoringScope({ db, brand, user })

  const event = eventId
    ? await db.promotionEvent.findFirst({
        where: { id: eventId, ...brandRelevantEventWhere(brand) },
        select: editablePromotionEventPayload,
      })
    : null

  if (eventId && !event) {
    return null
  }

  if (
    event &&
    !canAuthorPromotionEvent({
      scope,
      event,
      hostOrganizationId: event.hostOrganizationId,
      awards: event.rankAwards,
      userId: user.id,
    })
  ) {
    return null
  }

  const currentAwardIds = event?.rankAwards.map(award => award.id) ?? []
  const [hostOrganizations, rankAwards] = await Promise.all([
    db.organization.findMany({
      where: {
        brand,
        ...(scope.isGlobalAdmin ? {} : { id: { in: Array.from(scope.organizationIds) } }),
      },
      select: { id: true, name: true, slug: true },
      orderBy: [{ name: "asc" }],
      take: 100,
    }),
    db.rankAward.findMany({
      where: scope.isGlobalAdmin
        ? {
            OR: [
              brandRelevantRankAwardWhere(brand),
              ...(currentAwardIds.length > 0 ? [{ id: { in: currentAwardIds } }] : []),
            ],
          }
        : buildAuthorizedRankAwardWhere({
            scope,
            userId: user.id,
            extraIds: currentAwardIds,
          }),
      select: editableRankAwardPayload,
      orderBy: [{ awardedAt: "desc" }, { createdAt: "desc" }],
      take: 120,
    }),
  ])

  const canCreate = Boolean(
    scope.isGlobalAdmin ||
      scope.organizationIds.size > 0 ||
      scope.canAuthorHostlessEvents ||
      rankAwards.length > 0,
  )

  return {
    event: event ? toEditorEvent(event) : null,
    hostOrganizations,
    rankAwards: rankAwards.map(award => ({
      id: award.id,
      label: formatAwardLabel(award),
      detail: formatAwardDetail(award),
    })),
    canCreate,
  }
}
