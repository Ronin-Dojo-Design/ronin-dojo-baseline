// @ts-expect-error - bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidatePath: () => {},
  revalidateTag: () => {},
  updateTag: () => {},
}))

let promotionEventRows: any[] = []
let rankAwardRows: any[] = []
let promotionEventFindManyCalls: any[] = []
let rankAwardFindManyCalls: any[] = []

mock.module("~/services/db", () => ({
  db: {
    promotionEvent: {
      findMany: (args: any) => {
        promotionEventFindManyCalls.push(args)
        return Promise.resolve(promotionEventRows)
      },
      findUnique: () => Promise.resolve(null),
    },
    rankAward: {
      findMany: (args: any) => {
        rankAwardFindManyCalls.push(args)
        return Promise.resolve(rankAwardRows)
      },
    },
  },
}))

const eventDate = new Date("2026-04-10T00:00:00.000Z")

const awardSummaryRow = {
  id: "award-1",
  awardedAt: eventDate,
  location: "Combat Submission Wrestling Headquarters",
  // Phase 3c (SOT-ADR D1): the promotee (earner) is Passport-rooted.
  passport: {
    id: "passport-1",
    displayName: "Erik Paulson",
    avatarUrl: null,
    user: { id: "user-1", name: "Erik Paulson", image: null },
    lineageNode: { slug: "erik-paulson" },
  },
  rank: {
    id: "rank-1",
    name: "7th Degree Coral Belt",
    shortName: "CB7",
    colorHex: "#f97316",
    sortOrder: 700,
    rankSystem: {
      id: "rank-system-1",
      name: "Brazilian Jiu-Jitsu",
      discipline: { id: "discipline-1", name: "Brazilian Jiu-Jitsu", slug: "bjj", code: "bjj" },
    },
  },
  awardedBy: { id: "user-2", name: "Rigan Machado", image: null },
  awardedByPassport: null,
  organization: { id: "org-1", name: "CSW", slug: "csw", brand: "BBL", city: null, state: null },
}

const promotionEventRow = {
  id: "event-1",
  title: "Coral Belt Ceremony",
  slug: "coral-belt-ceremony",
  eventDate,
  location: "Combat Submission Wrestling Headquarters",
  description: "Promotion ceremony",
  hostOrganization: {
    id: "org-1",
    name: "CSW",
    slug: "csw",
    brand: "BBL",
    city: null,
    state: null,
  },
  rankAwards: [awardSummaryRow],
  mediaAttachments: [],
  _count: { rankAwards: 1, mediaAttachments: 0 },
}

describe("promotion event public queries", () => {
  beforeEach(() => {
    promotionEventRows = []
    rankAwardRows = []
    promotionEventFindManyCalls = []
    rankAwardFindManyCalls = []
  })

  it("keeps the event index brand-aware while allowing global unattached events", async () => {
    const { findPublicPromotionEvents } = await import("./queries")

    await findPublicPromotionEvents("BBL" as never)

    const where = promotionEventFindManyCalls[0].where
    expect(where.slug).toEqual({ not: null })
    expect(where.OR).toContainEqual({ hostOrganization: { is: { brand: "BBL" } } })
    expect(where.OR).toContainEqual({
      rankAwards: { some: { organization: { is: { brand: "BBL" } } } },
    })
    expect(where.OR).toContainEqual({
      hostOrganizationId: null,
      rankAwards: { none: { organizationId: { not: null } } },
    })
  })

  it("queries org timelines by hosted events and awarding-school rank awards", async () => {
    const { getPromotionTimelineForOrganization } = await import("./queries")

    await getPromotionTimelineForOrganization("org-1")

    expect(promotionEventFindManyCalls[0].where).toMatchObject({
      slug: { not: null },
      hostOrganizationId: "org-1",
    })
    expect(rankAwardFindManyCalls[0].where).toEqual({ organizationId: "org-1" })
  })

  it("deduplicates hosted and awarded event rows into one timeline entry", async () => {
    promotionEventRows = [promotionEventRow]
    rankAwardRows = [{ ...awardSummaryRow, promotionEvent: promotionEventRow }]
    const { getPromotionTimelineForOrganization } = await import("./queries")

    const timeline = await getPromotionTimelineForOrganization("org-1")

    expect(timeline).toHaveLength(1)
    const entry = timeline[0]!
    expect(entry).toMatchObject({
      id: "event-1",
      href: "/events/coral-belt-ceremony",
      source: "hosted-and-awarded",
      awardedHereCount: 1,
      totalAwardCount: 1,
    })
    expect(entry.awards[0]!).toMatchObject({
      personName: "Erik Paulson",
      rankShortName: "CB7",
      promoterName: "Rigan Machado",
    })
  })
})
