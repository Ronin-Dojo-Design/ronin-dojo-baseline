// @ts-expect-error - bun:test is a Bun runtime module
import { describe, expect, it, mock } from "bun:test"

// Hermetic: stub Next's cache directives (they throw outside a request) and the global db with an
// in-memory technique table filtered by a minimal Prisma-`where` evaluator, then drive the REAL
// discovery queries so the AND/OR wiring of the ADR 0046 D4 filter is exercised end-to-end.
mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
}))

/** Minimal evaluator for the operators the discovery composition uses: scalar eq, `{ not: null }`, AND, OR. */
function matchesWhere(row: Record<string, unknown>, where: Record<string, any>): boolean {
  return Object.entries(where).every(([key, cond]) => {
    if (key === "AND") return (cond as any[]).every(sub => matchesWhere(row, sub))
    if (key === "OR") return (cond as any[]).some(sub => matchesWhere(row, sub))
    const value = row[key]
    if (cond !== null && typeof cond === "object") {
      if ("not" in cond) return cond.not === null ? value != null : value !== cond.not
      return true // relation/contains filters unused in this test
    }
    return value === cond
  })
}

const dataset: Array<Record<string, unknown>> = [
  // Canonical / org-owned library technique — always discoverable.
  {
    id: "t-org",
    brand: "BBL",
    isPublished: true,
    organizationId: "org-1",
    isFeatured: false,
    category: "SUBMISSION",
    beltLevelMin: null,
    mediaAttachments: [],
  },
  // Authored, PROMOTED to the library (staff flipped isFeatured) — surfaces despite null org.
  {
    id: "t-featured",
    brand: "BBL",
    isPublished: true,
    organizationId: null,
    isFeatured: true,
    category: "SUBMISSION",
    beltLevelMin: null,
    mediaAttachments: [],
  },
  // Authored PROFILE-ONLY (null org, not featured) — must stay OFF discovery.
  {
    id: "t-profile-only",
    brand: "BBL",
    isPublished: true,
    organizationId: null,
    isFeatured: false,
    category: "SUBMISSION",
    beltLevelMin: null,
    mediaAttachments: [],
  },
]

const findManyWheres: any[] = []
mock.module("~/services/db", () => ({
  db: {
    technique: {
      findMany: async ({ where }: any) => {
        findManyWheres.push(where)
        return dataset.filter(r => matchesWhere(r, where))
      },
      count: async ({ where }: any) => dataset.filter(r => matchesWhere(r, where)).length,
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  },
}))

import { getTechniqueRails, searchTechniques } from "~/server/web/techniques/queries"

const defaultParams = {
  q: "",
  sort: "",
  page: 1,
  perPage: 24,
  category: "",
  position: "",
  discipline: "",
  belt: "",
}

describe("technique discovery filter (ADR 0046 D4 — no leak)", () => {
  it("(c)+(d) searchTechniques hides authored profile-only rows but surfaces featured ones", async () => {
    const { techniques } = await searchTechniques(defaultParams as any, "BBL" as any)
    const ids = techniques.map((t: any) => t.id)

    expect(ids).toContain("t-org")
    expect(ids).toContain("t-featured") // (d) isFeatured promotes it into the browse
    expect(ids).not.toContain("t-profile-only") // (c) profile-only stays off the canonical browse
  })

  it("(c)+(d) getTechniqueRails applies the same discovery filter to the rail source query", async () => {
    findManyWheres.length = 0
    await getTechniqueRails("BBL" as any)

    const where = findManyWheres.at(-1)
    const passedIds = dataset.filter(r => matchesWhere(r, where)).map(r => r.id)

    expect(passedIds).toContain("t-org")
    expect(passedIds).toContain("t-featured")
    expect(passedIds).not.toContain("t-profile-only")
  })
})
