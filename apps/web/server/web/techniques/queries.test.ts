/**
 * SESSION_0041.5 — Integration tests for technique queries.
 * Proves: brand isolation, isPublished filtering, slug 404 for wrong brand, filter combos.
 *
 * Run: cd apps/web && bun test server/web/techniques
 */

// @ts-expect-error - bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: () => {},
}))

import type { Brand } from "~/.generated/prisma/client"
import { findTechniqueBySlug, searchTechniques } from "~/server/web/techniques/queries"
import { db } from "~/services/db"

// --- Test fixtures ---

const TS = Date.now()
// Belt fixtures use a NON-numeric marker so they never match the `slug.includes(${TS})`
// filters the existing assertions use (they'd otherwise inflate those counts).
const BELT = `bx${Math.random().toString(36).slice(2, 8)}`
const BRAND_A: Brand = "BASELINE_MARTIAL_ARTS"
const BRAND_B: Brand = "RONIN_DOJO_DESIGN"

let orgA: string
let orgB: string
let disciplineId: string
let disciplineBId: string
let whiteRankId: string
let blueRankId: string
let purpleRankId: string

beforeAll(async () => {
  // Create orgs for each brand
  const orgARecord = await db.organization.create({
    data: {
      name: `Test Org A ${TS}`,
      slug: `test-org-a-${TS}`,
      brand: BRAND_A,
    },
  })
  orgA = orgARecord.id

  const orgBRecord = await db.organization.create({
    data: {
      name: `Test Org B ${TS}`,
      slug: `test-org-b-${TS}`,
      brand: BRAND_B,
    },
  })
  orgB = orgBRecord.id

  // Create a discipline for filter tests
  const disc = await db.discipline.create({
    data: {
      name: `Karate ${TS}`,
      slug: `karate-${TS}`,
      brand: BRAND_A,
    },
  })
  disciplineId = disc.id

  const discB = await db.discipline.create({
    data: {
      name: `Arnis ${TS}`,
      slug: `arnis-${TS}`,
      brand: BRAND_B,
    },
  })
  disciplineBId = discB.id

  // Seed techniques: Brand A — 3 published, 1 unpublished
  await db.technique.createMany({
    data: [
      {
        name: `Front Kick ${TS}`,
        slug: `front-kick-${TS}`,
        brand: BRAND_A,
        organizationId: orgA,
        disciplineId,
        isPublished: true,
        category: "STRIKE",
        position: "STANDING",
      },
      {
        name: `Round Kick ${TS}`,
        slug: `round-kick-${TS}`,
        brand: BRAND_A,
        organizationId: orgA,
        disciplineId,
        isPublished: true,
        category: "STRIKE",
        position: "STANDING",
      },
      {
        name: `Armbar ${TS}`,
        slug: `armbar-${TS}`,
        brand: BRAND_A,
        organizationId: orgA,
        disciplineId,
        isPublished: true,
        category: "SUBMISSION",
        position: "GUARD",
      },
      {
        name: `Draft Technique ${TS}`,
        slug: `draft-technique-${TS}`,
        brand: BRAND_A,
        organizationId: orgA,
        disciplineId,
        isPublished: false,
        category: "STRIKE",
        position: "STANDING",
      },
    ],
  })

  // Seed techniques: Brand B — 1 published
  await db.technique.create({
    data: {
      name: `Brand B Technique ${TS}`,
      slug: `brand-b-technique-${TS}`,
      brand: BRAND_B,
      organizationId: orgB,
      disciplineId: disciplineBId,
      isPublished: true,
      category: "STRIKE",
      position: "STANDING",
    },
  })

  // Belt fixtures (D1): a rank system + 3 ranks on Brand A's discipline, plus techniques
  // tagged with a single belt via `beltLevelMinId` (exact-match facet). Slugs carry the
  // BELT marker (not TS) so they don't affect the existing `${TS}` count assertions.
  const rankSystem = await db.rankSystem.create({
    data: { name: `Belt RS ${BELT}`, disciplineId },
  })
  const whiteRank = await db.rank.create({
    data: { name: `White ${BELT}`, sortOrder: 1, rankSystemId: rankSystem.id },
  })
  const blueRank = await db.rank.create({
    data: { name: `Blue ${BELT}`, sortOrder: 6, rankSystemId: rankSystem.id },
  })
  const purpleRank = await db.rank.create({
    data: { name: `Purple ${BELT}`, sortOrder: 11, rankSystemId: rankSystem.id },
  })
  whiteRankId = whiteRank.id
  blueRankId = blueRank.id
  purpleRankId = purpleRank.id

  await db.technique.createMany({
    data: [
      {
        name: `Belt Armbar ${BELT}`,
        slug: `belt-armbar-${BELT}`,
        brand: BRAND_A,
        organizationId: orgA,
        disciplineId,
        isPublished: true,
        category: "SUBMISSION",
        beltLevelMinId: blueRank.id,
      },
      {
        name: `Belt Triangle ${BELT}`,
        slug: `belt-triangle-${BELT}`,
        brand: BRAND_A,
        organizationId: orgA,
        disciplineId,
        isPublished: true,
        category: "SUBMISSION",
        beltLevelMinId: whiteRank.id,
      },
      {
        name: `Belt Untagged ${BELT}`,
        slug: `belt-untagged-${BELT}`,
        brand: BRAND_A,
        organizationId: orgA,
        disciplineId,
        isPublished: true,
        category: "SUBMISSION",
      },
    ],
  })
})

afterAll(async () => {
  // Cleanup in reverse dependency order (belt fixtures first: techniques → ranks → system)
  await db.technique.deleteMany({ where: { slug: { contains: BELT } } })
  await db.technique.deleteMany({ where: { slug: { contains: `${TS}` } } })
  await db.rank.deleteMany({ where: { rankSystem: { name: { contains: BELT } } } })
  await db.rankSystem.deleteMany({ where: { name: { contains: BELT } } })
  await db.discipline.deleteMany({ where: { slug: { in: [`karate-${TS}`, `arnis-${TS}`] } } })
  await db.organization.deleteMany({ where: { slug: { contains: `${TS}` } } })
})

// --- Default search params ---
const defaultParams = {
  q: "",
  sort: "",
  page: 1,
  perPage: 50,
  category: "",
  position: "",
  discipline: "",
  belt: "",
}

// --- Tests ---

describe("searchTechniques", () => {
  describe("brand isolation", () => {
    it("returns only Brand A techniques when queried with Brand A", async () => {
      const result = await searchTechniques(defaultParams, BRAND_A)
      const slugs = result.techniques.map((t: any) => t.slug)

      expect(slugs).toContain(`front-kick-${TS}`)
      expect(slugs).toContain(`round-kick-${TS}`)
      expect(slugs).toContain(`armbar-${TS}`)
      expect(slugs).not.toContain(`brand-b-technique-${TS}`)
    })

    it("returns only Brand B techniques when queried with Brand B", async () => {
      const result = await searchTechniques(defaultParams, BRAND_B)
      const slugs = result.techniques.map((t: any) => t.slug)

      expect(slugs).toContain(`brand-b-technique-${TS}`)
      expect(slugs).not.toContain(`front-kick-${TS}`)
      expect(slugs).not.toContain(`round-kick-${TS}`)
      expect(slugs).not.toContain(`armbar-${TS}`)
    })
  })

  describe("isPublished filtering", () => {
    it("excludes unpublished techniques from results", async () => {
      const result = await searchTechniques(defaultParams, BRAND_A)
      const slugs = result.techniques.map((t: any) => t.slug)

      expect(slugs).not.toContain(`draft-technique-${TS}`)
    })

    it("count excludes unpublished techniques", async () => {
      const result = await searchTechniques(defaultParams, BRAND_A)
      // Should be 3 published Brand A techniques (from our seed, possibly more from other tests)
      const ourTechniques = result.techniques.filter((t: any) => t.slug.includes(`${TS}`))
      expect(ourTechniques.length).toBe(3)
    })
  })

  describe("filter combinations", () => {
    it("filters by category", async () => {
      const params = { ...defaultParams, category: "STRIKE" }
      const result = await searchTechniques(params, BRAND_A)
      const ours = result.techniques.filter((t: any) => t.slug.includes(`${TS}`))

      expect(ours.length).toBe(2) // front-kick + round-kick (not armbar=SUBMISSION, not draft)
    })

    it("filters by position", async () => {
      const params = { ...defaultParams, position: "GUARD" }
      const result = await searchTechniques(params, BRAND_A)
      const ours = result.techniques.filter((t: any) => t.slug.includes(`${TS}`))

      expect(ours.length).toBe(1) // armbar only
      expect(ours[0].slug).toBe(`armbar-${TS}`)
    })

    it("filters by discipline slug", async () => {
      const params = { ...defaultParams, discipline: `karate-${TS}` }
      const result = await searchTechniques(params, BRAND_A)
      const ours = result.techniques.filter((t: any) => t.slug.includes(`${TS}`))

      expect(ours.length).toBe(3) // all 3 published Brand A techniques have this discipline
    })

    it("combines category + position filters", async () => {
      const params = { ...defaultParams, category: "STRIKE", position: "STANDING" }
      const result = await searchTechniques(params, BRAND_A)
      const ours = result.techniques.filter((t: any) => t.slug.includes(`${TS}`))

      expect(ours.length).toBe(2) // front-kick + round-kick
    })

    it("text search narrows results", async () => {
      const params = { ...defaultParams, q: `Front Kick ${TS}` }
      const result = await searchTechniques(params, BRAND_A)
      const ours = result.techniques.filter((t: any) => t.slug.includes(`${TS}`))

      expect(ours.length).toBe(1)
      expect(ours[0].slug).toBe(`front-kick-${TS}`)
    })
  })

  describe("belt facet (D1 — exact match on beltLevelMinId)", () => {
    it("returns only techniques tagged with the selected belt", async () => {
      const params = { ...defaultParams, belt: blueRankId }
      const result = await searchTechniques(params, BRAND_A)
      const slugs = result.techniques.map((t: any) => t.slug)

      expect(slugs).toContain(`belt-armbar-${BELT}`) // tagged Blue
      expect(slugs).not.toContain(`belt-triangle-${BELT}`) // tagged White
      expect(slugs).not.toContain(`belt-untagged-${BELT}`) // no tagged belt
    })

    it("selecting a different belt returns its own techniques", async () => {
      const params = { ...defaultParams, belt: whiteRankId }
      const result = await searchTechniques(params, BRAND_A)
      const slugs = result.techniques.map((t: any) => t.slug)

      expect(slugs).toContain(`belt-triangle-${BELT}`)
      expect(slugs).not.toContain(`belt-armbar-${BELT}`)
    })

    it("returns nothing for a belt no technique is tagged with", async () => {
      const params = { ...defaultParams, belt: purpleRankId }
      const result = await searchTechniques(params, BRAND_A)
      const ours = result.techniques.filter((t: any) => t.slug.includes(BELT))

      expect(ours.length).toBe(0)
    })

    it("no belt filter includes both tagged and untagged techniques", async () => {
      const result = await searchTechniques(defaultParams, BRAND_A)
      const slugs = result.techniques.map((t: any) => t.slug)

      expect(slugs).toContain(`belt-armbar-${BELT}`)
      expect(slugs).toContain(`belt-untagged-${BELT}`)
    })

    it("selects the tagged belt on the returned payload", async () => {
      const params = { ...defaultParams, belt: blueRankId }
      const result = await searchTechniques(params, BRAND_A)
      const armbar = result.techniques.find((t: any) => t.slug === `belt-armbar-${BELT}`)

      expect(armbar?.beltLevelMin?.id).toBe(blueRankId)
    })
  })
})

describe("findTechniqueBySlug", () => {
  it("returns technique when slug and brand match", async () => {
    const result = await findTechniqueBySlug(`front-kick-${TS}`, BRAND_A)
    expect(result).not.toBeNull()
    expect(result!.slug).toBe(`front-kick-${TS}`)
  })

  it("returns null when slug exists but brand does not match", async () => {
    // front-kick belongs to Brand A — query with Brand B should return null
    const result = await findTechniqueBySlug(`front-kick-${TS}`, BRAND_B)
    expect(result).toBeNull()
  })

  it("returns null for unpublished technique even with correct brand", async () => {
    const result = await findTechniqueBySlug(`draft-technique-${TS}`, BRAND_A)
    expect(result).toBeNull()
  })

  it("returns null for non-existent slug", async () => {
    const result = await findTechniqueBySlug(`does-not-exist-${TS}`, BRAND_A)
    expect(result).toBeNull()
  })
})
