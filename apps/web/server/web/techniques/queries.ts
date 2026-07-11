import { performance } from "node:perf_hooks"
import { cacheLife, cacheTag } from "next/cache"
import type { Brand, Prisma } from "~/.generated/prisma/client"
import { parseSort } from "~/server/web/_shared/sortable"
import {
  type TechniqueRail,
  techniqueManyPayload,
  techniqueOnePayload,
  techniqueRailPayload,
} from "~/server/web/techniques/payloads"
import type { TechniqueFilterParams } from "~/server/web/techniques/schema"
import { db } from "~/services/db"

const SORTABLE_TECHNIQUE_COLUMNS = ["name", "curriculum_order"] as const

export const searchTechniques = async (
  search: TechniqueFilterParams,
  brand: Brand,
  where?: Prisma.TechniqueWhereInput,
) => {
  "use cache"

  cacheTag("techniques")
  cacheLife("minutes")

  const { q, category, position, discipline, belt, sort, page, perPage } = search
  const start = performance.now()
  const skip = (page - 1) * perPage
  const take = perPage
  const { sortBy, sortOrder } = parseSort(sort, SORTABLE_TECHNIQUE_COLUMNS)

  const whereQuery: Prisma.TechniqueWhereInput = {
    brand,
    isPublished: true,
    ...(category && { category: category as any }),
    ...(position && { position: position as any }),
    ...(discipline && { discipline: { slug: discipline } }),
    // Single-belt facet (Stream D1): exact match on the tagged belt FK. `belt` is a
    // `Rank.id`; techniques with a null `beltLevelMinId` (currently all of them) match
    // no belt. No min/max range — the operator's KISS scalar-belt model.
    ...(belt && { beltLevelMinId: belt }),
  }

  if (q) {
    whereQuery.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  }

  const [techniques, total] = await db.$transaction([
    db.technique.findMany({
      orderBy: sortBy
        ? { [sortBy]: sortOrder }
        : [{ isFoundational: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      where: { ...whereQuery, ...where },
      select: techniqueManyPayload,
      take,
      skip,
    }),

    db.technique.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  console.log(`Techniques search: ${Math.round(performance.now() - start)}ms`)

  return { techniques, total, page, perPage }
}

// --- Video rails (Stream D2) ---

/** Techniques with no `category` AND no belt fall into a single trailing rail. */
export const UNCATEGORIZED_RAIL = "UNCATEGORIZED"
const RAIL_ITEM_CAP = 15
const MAX_RAILS = 8
const MIN_RAIL_ITEMS = 2

/** The belt identity of a belt-rail (label + `Rank.colorHex` accent). */
export type TechniqueRailBelt = { name: string; colorHex: string | null }

export type TechniqueRailGroup = {
  /** Stable rail key: `cat:<enum>`, `belt:<rankId>`, or the uncategorized sentinel. */
  key: string
  /** The positional `TechniqueCategory` enum for a category rail; null for a belt rail. */
  category: string | null
  /** Present for a belt rail (drives the `Rank.name` title + colour accent); null otherwise. */
  belt: TechniqueRailBelt | null
  /** Total techniques in the rail (the carousel shows a capped subset). */
  total: number
  techniques: TechniqueRail[]
}

type RailBucket = {
  key: string
  category: string | null
  belt: (TechniqueRailBelt & { sortOrder: number }) | null
  techniques: TechniqueRail[]
}

/**
 * Browse-by-rail technique carousels (Stream D2, hybrid grouping). One cached fetch of the
 * brand's published techniques, grouped in memory (per-group queries would pipeline the
 * local pg adapter):
 *   - a technique WITH a positional `category` → its per-category rail;
 *   - a technique with NO category but a tagged belt (`beltLevelMin`) → its per-belt rail;
 *   - neither → the single uncategorized rail.
 * Belt rails order by `Rank.sortOrder` (white→blue→purple) and lead; category rails follow
 * biggest-first; the uncategorized rail is last. Each rail is capped for the carousel.
 */
export const getTechniqueRails = async (brand: Brand): Promise<TechniqueRailGroup[]> => {
  "use cache"

  cacheTag("techniques")
  cacheLife("minutes")

  const techniques = await db.technique.findMany({
    where: { brand, isPublished: true },
    orderBy: [{ isFoundational: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: techniqueRailPayload,
    take: 500,
  })

  const buckets = new Map<string, RailBucket>()
  for (const technique of techniques) {
    let bucket: Omit<RailBucket, "techniques">
    if (technique.category) {
      bucket = { key: `cat:${technique.category}`, category: technique.category, belt: null }
    } else if (technique.beltLevelMin) {
      const { id, name, colorHex, sortOrder } = technique.beltLevelMin
      bucket = { key: `belt:${id}`, category: null, belt: { name, colorHex, sortOrder } }
    } else {
      bucket = { key: UNCATEGORIZED_RAIL, category: UNCATEGORIZED_RAIL, belt: null }
    }

    const existing = buckets.get(bucket.key)
    if (existing) {
      existing.techniques.push(technique)
    } else {
      buckets.set(bucket.key, { ...bucket, techniques: [technique] })
    }
  }

  // Order: belt rails first (by Rank.sortOrder), then category rails (biggest-first),
  // then the uncategorized rail. `railRank` groups the three kinds; ties break within kind.
  const railRank = (b: RailBucket) => (b.belt ? 0 : b.key === UNCATEGORIZED_RAIL ? 2 : 1)

  return [...buckets.values()]
    .filter(b => b.techniques.length >= MIN_RAIL_ITEMS)
    .sort((a, b) => {
      const kindDelta = railRank(a) - railRank(b)
      if (kindDelta !== 0) return kindDelta
      if (a.belt && b.belt) return a.belt.sortOrder - b.belt.sortOrder
      return b.techniques.length - a.techniques.length
    })
    .slice(0, MAX_RAILS)
    .map(({ key, category, belt, techniques: list }) => ({
      key,
      category,
      belt: belt ? { name: belt.name, colorHex: belt.colorHex } : null,
      total: list.length,
      techniques: list.slice(0, RAIL_ITEM_CAP),
    }))
}

export const findTechniqueBySlug = async (slug: string, brand: Brand) => {
  "use cache"

  cacheTag(`technique-${slug}`)
  cacheLife("minutes")

  return db.technique.findFirst({
    where: { slug, brand, isPublished: true },
    select: techniqueOnePayload,
  })
}
