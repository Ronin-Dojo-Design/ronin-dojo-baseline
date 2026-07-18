/**
 * cd apps/web && bun test server/web/techniques/graph-query.test.ts
 *
 * SESSION_0569 Doug P3 (WL-P2-64-style query-shape pinning) — the technique-graph query feeds
 * hover tooltips whose DTO is TEXT ONLY by construction (`node-tooltip.ts`). The no-leak contract
 * starts at the SELECT: the curriculum sub-select must stay scalar-only (id/title/notes + course
 * scalars). These tests pin, via a mocked Prisma recorder (no real DB, no network), the EXACT
 * select shape so adding a media relation/field (media, mediaUrl, mediaAttachments, …) to the
 * graph query fails here before it can ever reach the client.
 *
 * Mirrors the hermetic recorder style of `permissions.test.ts`: `next/cache` is stubbed (the
 * module is a `"use cache"` query, precedent `queries.discovery.test.ts`) and `~/services/db` is
 * replaced by an in-memory recorder BEFORE the module under test is imported.
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

// Stub the cache directives BEFORE importing the "use cache" query module (they throw outside a
// Next request context).
mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
}))

type FindManyArgs = {
  where: Record<string, unknown>
  select: Record<string, unknown>
  orderBy?: unknown
}

const techniqueQueries: FindManyArgs[] = []
const prerequisiteQueries: FindManyArgs[] = []

mock.module("~/services/db", () => ({
  db: {
    technique: {
      findMany: async (args: FindManyArgs) => {
        techniqueQueries.push(args)
        return []
      },
    },
    techniquePrerequisite: {
      findMany: async (args: FindManyArgs) => {
        prerequisiteQueries.push(args)
        return []
      },
    },
  },
}))

/** The pinned scalar-only curriculum-item sub-select (the tooltip no-media contract's DB edge). */
const CURRICULUM_ITEM_SELECT = {
  id: true,
  title: true,
  notes: true,
  course: {
    select: {
      title: true,
      slug: true,
      rank: { select: { colorHex: true, sortOrder: true } },
    },
  },
}

beforeEach(() => {
  techniqueQueries.length = 0
  prerequisiteQueries.length = 0
})

describe("getBjjTechniqueGraph query shape", () => {
  it("pins the EXACT technique select — scalar node fields + colorHex belt + curriculum text only", async () => {
    const { getBjjTechniqueGraph } = await import("./graph-query")

    await getBjjTechniqueGraph("BBL" as never)

    expect(techniqueQueries).toHaveLength(1)
    // `toEqual` pins the WHOLE shape: adding ANY key (a media relation, a url column, a spread
    // include) — or dropping one the DTO derives from — fails here.
    expect(techniqueQueries[0]?.select).toEqual({
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      position: true,
      difficultyLevel: true,
      isFoundational: true,
      teachingCues: true,
      beltLevelMin: { select: { colorHex: true } },
      curriculumLinks: {
        orderBy: { sortOrder: "asc" },
        select: { curriculumItem: { select: CURRICULUM_ITEM_SELECT } },
      },
    })
  })

  it("keeps the curriculum sub-select free of every media key (type-encoded no-leak, DB edge)", async () => {
    const { getBjjTechniqueGraph } = await import("./graph-query")

    await getBjjTechniqueGraph("BBL" as never)

    const curriculumLinks = techniqueQueries[0]?.select.curriculumLinks as {
      select: { curriculumItem: { select: Record<string, unknown> } }
    }
    const itemSelect = curriculumLinks.select.curriculumItem.select

    expect(itemSelect).toEqual(CURRICULUM_ITEM_SELECT)
    for (const bannedKey of [
      "media",
      "mediaId",
      "mediaUrl",
      "mediaType",
      "mediaAttachments",
      "thumbnailUrl",
      "posterUrl",
      "videoUrl",
    ]) {
      expect(bannedKey in itemSelect).toBe(false)
    }
  })

  it("scopes the graph to published, graph-tagged techniques of the requested brand", async () => {
    const { getBjjTechniqueGraph } = await import("./graph-query")

    await getBjjTechniqueGraph("BBL" as never)

    expect(techniqueQueries[0]?.where).toEqual({
      brand: "BBL",
      isPublished: true,
      tags: { some: { slug: "bjj-technique-graph" } },
    })
    // The edge query only ever selects slugs + description — no media surface there either.
    expect(prerequisiteQueries).toHaveLength(1)
    expect(prerequisiteQueries[0]?.select).toEqual({
      technique: { select: { slug: true } },
      prerequisite: { select: { slug: true } },
      description: true,
    })
  })
})
