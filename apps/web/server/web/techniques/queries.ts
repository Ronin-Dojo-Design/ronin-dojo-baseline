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

/** Techniques with no `category` are grouped into a single trailing rail. */
export const UNCATEGORIZED_RAIL = "UNCATEGORIZED"
const RAIL_ITEM_CAP = 15
const MAX_RAILS = 8
const MIN_RAIL_ITEMS = 2

export type TechniqueRailGroup = {
  category: string
  /** Total techniques in the category (the rail is capped at {@link RAIL_ITEM_CAP}). */
  total: number
  techniques: TechniqueRail[]
}

/**
 * Per-category technique rails for the browse-by-category carousels (Stream D2). One
 * cached fetch of the brand's published techniques, grouped by the positional `category`
 * enum in memory (per-category queries would pipeline the local pg adapter). Rails are
 * ordered biggest-first with the uncategorized rail last; each is capped for the carousel.
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

  const groups = new Map<string, TechniqueRail[]>()
  for (const technique of techniques) {
    const key = technique.category ?? UNCATEGORIZED_RAIL
    const list = groups.get(key)
    if (list) {
      list.push(technique)
    } else {
      groups.set(key, [technique])
    }
  }

  return [...groups.entries()]
    .filter(([, list]) => list.length >= MIN_RAIL_ITEMS)
    .sort((a, b) => {
      if (a[0] === UNCATEGORIZED_RAIL) return 1
      if (b[0] === UNCATEGORIZED_RAIL) return -1
      return b[1].length - a[1].length
    })
    .slice(0, MAX_RAILS)
    .map(([category, list]) => ({
      category,
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
