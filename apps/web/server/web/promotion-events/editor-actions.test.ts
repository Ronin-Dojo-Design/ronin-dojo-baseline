// @ts-expect-error - bun:test is a Bun runtime module
import { describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidatePath: () => {},
  revalidateTag: () => {},
  updateTag: () => {},
}))

// The helper under test receives `brand` directly as a parameter, so no
// brand-context mock is needed (production code inlines Brand.BBL post brand-prune).
mock.module("~/lib/auth", () => ({
  getServerSession: () => Promise.resolve(null),
}))

import { applyPromotionEventEditorUpsert } from "~/server/web/promotion-events/editor-actions"
import { PROMOTION_EVENT_EDITOR_ERROR } from "~/server/web/promotion-events/editor-errors"

const brand = "BASELINE_MARTIAL_ARTS" as const
const editorUser = { id: "user-editor", role: "user" }

type FakeDbState = {
  scopeOrganizationIds?: string[]
  hostOrganizationIds?: string[]
  events?: any[]
  rankAwards?: any[]
  audits?: any[]
}

const makeAward = (overrides: Partial<any> = {}) => ({
  id: "award-1",
  awardedById: "promoter-1",
  organizationId: "other-org",
  promotionEventId: null,
  passport: { lineageNode: { id: "node-1" } },
  ...overrides,
})

function makeDb(state: FakeDbState = {}) {
  const events = state.events ?? []
  const rankAwards = state.rankAwards ?? []
  const audits = state.audits ?? []

  const db: any = {
    $transaction: async (callback: (tx: any) => Promise<unknown>) => callback(db),
    organization: {
      findMany: async () => (state.scopeOrganizationIds ?? []).map(id => ({ id })),
      findFirst: async ({ where }: any) => {
        if (where.brand !== brand) return null
        return (state.hostOrganizationIds ?? []).includes(where.id) ? { id: where.id } : null
      },
    },
    lineageTree: {
      findMany: async () => [],
    },
    promotionEvent: {
      findFirst: async ({ where }: any) => {
        if (where.slug) {
          return (
            events.find(event => event.slug === where.slug && event.id !== where.id?.not) ?? null
          )
        }

        if (where.id) {
          return events.find(event => event.id === where.id) ?? null
        }

        return null
      },
      create: async ({ data }: any) => {
        const event = {
          id: "event-created",
          slug: data.slug,
          ...data,
          rankAwards: [],
        }
        events.push(event)
        return { id: event.id, slug: event.slug }
      },
      update: async ({ where, data }: any) => {
        const event = events.find(row => row.id === where.id)
        Object.assign(event, data)
        return { id: event.id, slug: event.slug }
      },
    },
    rankAward: {
      findMany: async ({ where }: any) => {
        const ids = where.id?.in ?? []
        return rankAwards.filter(award => ids.includes(award.id))
      },
      updateMany: async ({ where, data }: any) => {
        for (const award of rankAwards) {
          if (
            where.id?.in?.includes(award.id) ||
            award.promotionEventId === where.promotionEventId
          ) {
            award.promotionEventId = data.promotionEventId
          }
        }
        return { count: rankAwards.length }
      },
    },
    auditLog: {
      create: async ({ data }: any) => {
        audits.push(data)
        return data
      },
    },
  }

  return { db, events, audits, rankAwards }
}

const input = {
  id: null,
  title: "Editor Test Ceremony",
  eventDate: new Date("2026-06-01T00:00:00.000Z"),
  location: "Denver, CO",
  description: "Promotion ceremony",
  hostOrganizationId: "org-1",
  rankAwardIds: [],
  auditNote: "Create promotion event in focused authorization test.",
}

const expectRejectsWithMessage = async (promise: Promise<unknown>, message: string) => {
  try {
    await promise
    throw new Error("Expected promise to reject")
  } catch (error) {
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe(message)
  }
}

describe("promotion event editor actions", () => {
  it("allows an authorized host-organization editor to create and audit an event", async () => {
    const { db, events, audits } = makeDb({
      scopeOrganizationIds: ["org-1"],
      hostOrganizationIds: ["org-1"],
    })

    const result = await applyPromotionEventEditorUpsert({
      db,
      brand,
      user: editorUser,
      input,
    })

    expect(result).toEqual({
      id: "event-created",
      slug: "editor-test-ceremony-2026",
    })
    expect(events[0].hostOrganizationId).toBe("org-1")
    expect(audits[0]).toMatchObject({
      action: "promotion_event.created",
      entityType: "PromotionEvent",
      entityId: "event-created",
      organizationId: "org-1",
      userId: "user-editor",
    })
  })

  it("rejects event creation when the user has no event-authoring grant", async () => {
    const { db } = makeDb({ hostOrganizationIds: ["org-1"] })

    await expectRejectsWithMessage(
      applyPromotionEventEditorUpsert({
        db,
        brand,
        user: editorUser,
        input,
      }),
      PROMOTION_EVENT_EDITOR_ERROR.EDITOR_ACCESS_REQUIRED,
    )
  })

  it("rejects linking a rank award outside the user's award-authoring scope", async () => {
    const { db } = makeDb({
      scopeOrganizationIds: ["org-1"],
      hostOrganizationIds: ["org-1"],
      rankAwards: [makeAward()],
    })

    await expectRejectsWithMessage(
      applyPromotionEventEditorUpsert({
        db,
        brand,
        user: editorUser,
        input: {
          ...input,
          rankAwardIds: ["award-1"],
          auditNote: "Attempt to link an out-of-scope rank award.",
        },
      }),
      PROMOTION_EVENT_EDITOR_ERROR.RANK_AWARD_ACCESS_REQUIRED,
    )
  })
})
