"use server"

import { Brand } from "~/.generated/prisma/client"
import type { AuthzUser } from "~/lib/authz"
import { userActionClient } from "~/lib/safe-actions"
import { generateUniqueSlug } from "~/lib/slug"
import { assertLineageAxisEquivalence } from "~/server/web/promotion-events/editor-authorization-equivalence"
import {
  type AuthorizablePromotionEvent,
  type AuthorizableRankAward,
  canAuthorPromotionEvent,
  canAuthorRankAwards,
  resolvePromotionEventAuthoringScope,
} from "~/server/web/promotion-events/editor-authorization"
import { PROMOTION_EVENT_EDITOR_ERROR } from "~/server/web/promotion-events/editor-errors"
import {
  type UpsertPromotionEventInput,
  upsertPromotionEventSchema,
} from "~/server/web/promotion-events/editor-schemas"
import type { db as appDb } from "~/services/db"

type AppDb = typeof appDb

type PromotionEventSnapshot = {
  id: string
  title: string
  slug: string | null
  eventDate: string
  location: string | null
  description: string | null
  hostOrganizationId: string | null
  rankAwardIds: string[]
}

type PromotionEventSnapshotSource = Omit<PromotionEventSnapshot, "eventDate" | "rankAwardIds"> & {
  eventDate: Date
  rankAwards: Array<{ id: string }>
}

export type UpsertPromotionEventResult = {
  id: string
  slug: string | null
}

const authorizableRankAwardSelect = {
  id: true,
  awardedById: true,
  organizationId: true,
  promotionEventId: true,
  passport: {
    select: {
      lineageNode: {
        select: { id: true },
      },
    },
  },
} as const

const authorizablePromotionEventSelect = {
  id: true,
  title: true,
  slug: true,
  eventDate: true,
  location: true,
  description: true,
  hostOrganizationId: true,
  rankAwards: {
    select: authorizableRankAwardSelect,
  },
} as const

const uniqueIds = (ids: string[]) => Array.from(new Set(ids))

const snapshotEvent = (
  event: PromotionEventSnapshotSource | null,
): PromotionEventSnapshot | undefined => {
  if (!event) return undefined

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    eventDate: event.eventDate.toISOString(),
    location: event.location,
    description: event.description,
    hostOrganizationId: event.hostOrganizationId,
    rankAwardIds: event.rankAwards.map(award => award.id),
  }
}

const getEventYear = (date: Date) => date.getUTCFullYear()

function brandRelevantEventWhere(brand: Brand) {
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

function brandRelevantRankAwardWhere(brand: Brand) {
  return {
    OR: [
      { organization: { is: { brand } } },
      { promotionEvent: { is: brandRelevantEventWhere(brand) } },
      { organizationId: null },
    ],
  }
}

async function generatePromotionEventSlug({
  db,
  title,
  eventDate,
  currentEventId,
  currentSlug,
}: {
  db: AppDb
  title: string
  eventDate: Date
  currentEventId: string | null
  currentSlug: string | null
}) {
  return generateUniqueSlug({
    source: `${title}-${getEventYear(eventDate)}`,
    currentSlug: currentSlug ?? undefined,
    isSlugTaken: async slug => {
      const existing = await db.promotionEvent.findFirst({
        where: {
          slug,
          ...(currentEventId ? { id: { not: currentEventId } } : {}),
        },
        select: { id: true },
      })

      return Boolean(existing)
    },
  })
}

export const applyPromotionEventEditorUpsert = async ({
  db,
  brand,
  user,
  input,
}: {
  db: AppDb
  brand: Brand
  user: AuthzUser
  input: UpsertPromotionEventInput
}): Promise<UpsertPromotionEventResult> => {
  return db.$transaction(
    async tx => {
      const txDb = tx as AppDb
      const rankAwardIds = uniqueIds(input.rankAwardIds)

      const [currentEvent, hostOrganization, selectedAwards, scope] = await Promise.all([
        input.id
          ? txDb.promotionEvent.findFirst({
              where: { id: input.id, ...brandRelevantEventWhere(brand) },
              select: authorizablePromotionEventSelect,
            })
          : Promise.resolve(null),
        input.hostOrganizationId
          ? txDb.organization.findFirst({
              where: { id: input.hostOrganizationId, brand },
              select: { id: true },
            })
          : Promise.resolve(null),
        rankAwardIds.length > 0
          ? txDb.rankAward.findMany({
              where: {
                id: { in: rankAwardIds },
                ...brandRelevantRankAwardWhere(brand),
              },
              select: authorizableRankAwardSelect,
            })
          : Promise.resolve([]),
        resolvePromotionEventAuthoringScope({ db: txDb, brand, user }),
      ])

      if (input.id && !currentEvent) {
        throw new Error(PROMOTION_EVENT_EDITOR_ERROR.EVENT_NOT_FOUND)
      }

      if (input.hostOrganizationId && !hostOrganization) {
        throw new Error(PROMOTION_EVENT_EDITOR_ERROR.HOST_ORGANIZATION_NOT_FOUND)
      }

      if (selectedAwards.length !== rankAwardIds.length) {
        throw new Error(PROMOTION_EVENT_EDITOR_ERROR.RANK_AWARD_NOT_FOUND)
      }

      const selectedAwardsById = new Map(selectedAwards.map(award => [award.id, award]))
      const selectedAwardsInInputOrder = rankAwardIds.map(id => selectedAwardsById.get(id)!)

      const awardsAlreadyLinkedElsewhere = selectedAwardsInInputOrder.some(
        award => award.promotionEventId && award.promotionEventId !== currentEvent?.id,
      )
      if (awardsAlreadyLinkedElsewhere) {
        throw new Error(PROMOTION_EVENT_EDITOR_ERROR.RANK_AWARD_ALREADY_LINKED)
      }

      if (
        !canAuthorPromotionEvent({
          scope,
          event: currentEvent as AuthorizablePromotionEvent | null,
          hostOrganizationId: input.hostOrganizationId,
          awards:
            selectedAwardsInInputOrder.length > 0
              ? selectedAwardsInInputOrder
              : ((currentEvent?.rankAwards ?? []) as AuthorizableRankAward[]),
          userId: user.id,
        })
      ) {
        throw new Error(PROMOTION_EVENT_EDITOR_ERROR.EDITOR_ACCESS_REQUIRED)
      }

      if (
        !canAuthorRankAwards({
          scope,
          awards: selectedAwardsInInputOrder,
          userId: user.id,
        })
      ) {
        throw new Error(PROMOTION_EVENT_EDITOR_ERROR.RANK_AWARD_ACCESS_REQUIRED)
      }

      // Stage 1 (item-5) dev-only shadow equivalence check — runs the canonical
      // `canForResource` lineage-grant decision ALONGSIDE the authoritative hand-rolled
      // one and logs divergence. Never changes the outcome above and never throws.
      await assertLineageAxisEquivalence({
        db: txDb,
        user,
        scope,
        awards: selectedAwardsInInputOrder,
      })

      const slug = await generatePromotionEventSlug({
        db: txDb,
        title: input.title,
        eventDate: input.eventDate,
        currentEventId: currentEvent?.id ?? null,
        currentSlug: currentEvent?.slug ?? null,
      })

      const eventData = {
        title: input.title,
        slug,
        eventDate: input.eventDate,
        location: input.location,
        description: input.description,
        hostOrganizationId: input.hostOrganizationId,
      }

      const saved = currentEvent
        ? await txDb.promotionEvent.update({
            where: { id: currentEvent.id },
            data: eventData,
            select: { id: true, slug: true },
          })
        : await txDb.promotionEvent.create({
            data: eventData,
            select: { id: true, slug: true },
          })

      await txDb.rankAward.updateMany({
        where: {
          promotionEventId: saved.id,
          ...(rankAwardIds.length > 0 ? { id: { notIn: rankAwardIds } } : {}),
        },
        data: { promotionEventId: null },
      })

      if (rankAwardIds.length > 0) {
        await txDb.rankAward.updateMany({
          where: { id: { in: rankAwardIds } },
          data: { promotionEventId: saved.id },
        })
      }

      const after = {
        ...eventData,
        id: saved.id,
        eventDate: input.eventDate.toISOString(),
        rankAwardIds,
        auditNote: input.auditNote,
      }

      await txDb.auditLog.create({
        data: {
          brand,
          action: currentEvent ? "promotion_event.updated" : "promotion_event.created",
          entityType: "PromotionEvent",
          entityId: saved.id,
          organizationId: input.hostOrganizationId,
          userId: user.id,
          before: snapshotEvent(currentEvent),
          after,
        },
      })

      return saved
    },
    { isolationLevel: "Serializable", maxWait: 30000, timeout: 30000 },
  )
}

export const upsertPromotionEvent = userActionClient
  .inputSchema(upsertPromotionEventSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const result = await applyPromotionEventEditorUpsert({
      db,
      brand: Brand.BBL,
      user,
      input: parsedInput,
    })

    revalidate({
      paths: [
        "/app/profile",
        "/app/events",
        `/app/events/${result.id}`,
        "/events",
        ...(result.slug ? [`/events/${result.slug}`] : []),
      ],
      tags: ["promotion-events", ...(result.slug ? [`promotion-event-${result.slug}`] : [])],
    })

    return result
  })
