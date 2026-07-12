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
    slug: "org-armbar",
    isPublished: true,
    organizationId: "org-1",
    authorPassportId: null,
    isFeatured: false,
    category: "SUBMISSION",
    beltLevelMin: null,
    mediaAttachments: [],
  },
  // Authored, PROMOTED to the library (staff flipped isFeatured) — surfaces despite null org.
  {
    id: "t-featured",
    brand: "BBL",
    slug: "featured-berimbolo",
    isPublished: true,
    organizationId: null,
    authorPassportId: "pass-author",
    isFeatured: true,
    category: "SUBMISSION",
    beltLevelMin: null,
    mediaAttachments: [],
  },
  // Authored PROFILE-ONLY (null org, not featured) — must stay OFF discovery.
  {
    id: "t-profile-only",
    brand: "BBL",
    slug: "profile-only-armbar",
    isPublished: true,
    organizationId: null,
    authorPassportId: "pass-author",
    isFeatured: false,
    category: "SUBMISSION",
    beltLevelMin: null,
    // A premium clip — the authored read must still compose with the per-clip gate (no-leak).
    mediaAttachments: [
      {
        id: "att-premium",
        isPremium: true,
        passportId: "pass-author",
        media: {
          type: "VIDEO",
          url: "https://r2.example.com/secret-reel.mp4",
          thumbnailUrl: "https://r2.example.com/poster.jpg",
          title: "Secret reel",
          mimeType: "video/mp4",
          altText: null,
        },
      },
    ],
  },
  // Authored DRAFT — the public authored read must NOT return unpublished rows.
  {
    id: "t-draft",
    brand: "BBL",
    slug: "draft-kimura",
    isPublished: false,
    organizationId: null,
    authorPassportId: "pass-author",
    isFeatured: false,
    category: "SUBMISSION",
    beltLevelMin: null,
    mediaAttachments: [],
  },
]

const findManyWheres: any[] = []
const findFirstWheres: any[] = []
mock.module("~/services/db", () => ({
  db: {
    technique: {
      findMany: async ({ where }: any) => {
        findManyWheres.push(where)
        return dataset.filter(r => matchesWhere(r, where))
      },
      findFirst: async ({ where }: any) => {
        findFirstWheres.push(where)
        return dataset.find(r => matchesWhere(r, where)) ?? null
      },
      count: async ({ where }: any) => dataset.filter(r => matchesWhere(r, where)).length,
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  },
}))

import {
  findAuthoredTechnique,
  findTechniqueBySlug,
  getTechniqueRails,
  searchTechniques,
} from "~/server/web/techniques/queries"
import { gateTechniqueMedia } from "~/server/web/techniques/technique-media-gate"

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

  it("(3C) staff isFeatured flip round-trips a profile-only row onto/off the canonical surfaces", async () => {
    const row = dataset.find(r => r.id === "t-profile-only")!
    try {
      // Promote (what `applySetTechniqueFeatured` persists) → browse + rails + canonical watch.
      row.isFeatured = true

      const { techniques } = await searchTechniques(defaultParams as any, "BBL" as any)
      expect(techniques.map((t: any) => t.id)).toContain("t-profile-only")

      findManyWheres.length = 0
      await getTechniqueRails("BBL" as any)
      const railWhere = findManyWheres.at(-1)
      expect(dataset.filter(r => matchesWhere(r, railWhere)).map(r => r.id)).toContain(
        "t-profile-only",
      )

      const watch = await findTechniqueBySlug("profile-only-armbar", "BBL" as any)
      expect((watch as any)?.id).toBe("t-profile-only")

      // Demote → all three drop it again.
      row.isFeatured = false

      const after = await searchTechniques(defaultParams as any, "BBL" as any)
      expect(after.techniques.map((t: any) => t.id)).not.toContain("t-profile-only")

      const watchAfter = await findTechniqueBySlug("profile-only-armbar", "BBL" as any)
      expect(watchAfter).toBeNull()
    } finally {
      row.isFeatured = false
    }
  })
})

describe("findAuthoredTechnique — un-gated authored read (SESSION_0529 Slice 3B)", () => {
  const authoredArgs = {
    authorPassportId: "pass-author",
    slug: "profile-only-armbar",
    brand: "BBL" as any,
  }

  it("returns the author's PROFILE-ONLY row (no discovery filter) — and the where always carries the author key", async () => {
    findFirstWheres.length = 0
    const technique = await findAuthoredTechnique(authoredArgs)

    expect(technique?.id).toBe("t-profile-only")
    // The read must never become a second public discovery path: the where is ALWAYS
    // author-keyed + published-only, and never applies the D4 OR-filter.
    const where = findFirstWheres.at(-1)
    expect(where.authorPassportId).toBe("pass-author")
    expect(where.isPublished).toBe(true)
    expect(where.OR).toBeUndefined()
    expect(where.AND).toBeUndefined()
  })

  it("404-seam: a slug under a DIFFERENT passport does not resolve (author-keying)", async () => {
    const technique = await findAuthoredTechnique({
      ...authoredArgs,
      authorPassportId: "pass-someone-else",
    })
    expect(technique).toBeNull()
  })

  it("404-seam: an UNPUBLISHED authored row does not resolve on the public read", async () => {
    const technique = await findAuthoredTechnique({ ...authoredArgs, slug: "draft-kimura" })
    expect(technique).toBeNull()
  })

  it("still gates premium: an unentitled viewer's locked tile ships NO playable url", async () => {
    const technique = await findAuthoredTechnique(authoredArgs)
    const gated = gateTechniqueMedia((technique as any).mediaAttachments, false)

    expect(gated.tiles).toHaveLength(1)
    const tile = gated.tiles[0]
    expect(tile.locked).toBe(true)
    // No-leak invariant: the locked tile's media has no `url` key at all.
    expect("url" in tile.media).toBe(false)
    expect(JSON.stringify(gated)).not.toContain("secret-reel")
  })

  it("the author (entitled) still gets the playable url", async () => {
    const technique = await findAuthoredTechnique(authoredArgs)
    const gated = gateTechniqueMedia((technique as any).mediaAttachments, true)

    expect(gated.tiles[0].locked).toBe(false)
    expect((gated.tiles[0].media as any).url).toBe("https://r2.example.com/secret-reel.mp4")
  })
})
