/**
 * SESSION_0041.5 — Integration tests for technique queries.
 * Proves: brand isolation, isPublished filtering, slug 404 for wrong brand, filter combos.
 *
 * Run: cd apps/web && bun test server/web/techniques
 */

// @ts-expect-error - bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: () => {},
}))

import type { Brand } from "~/.generated/prisma/client"
import { searchTechniques, findTechniqueBySlug } from "~/server/web/techniques/queries"
import { db } from "~/services/db"

// --- Test fixtures ---

const TS = Date.now()
const BRAND_A: Brand = "BASELINE_MARTIAL_ARTS"
const BRAND_B: Brand = "RONIN_DOJO_DESIGN"

let orgA: string
let orgB: string
let disciplineId: string
let disciplineBId: string

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
})

afterAll(async () => {
  // Cleanup in reverse dependency order
  await db.technique.deleteMany({ where: { slug: { contains: `${TS}` } } })
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
      const ourTechniques = result.techniques.filter((t: any) =>
        t.slug.includes(`${TS}`),
      )
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
