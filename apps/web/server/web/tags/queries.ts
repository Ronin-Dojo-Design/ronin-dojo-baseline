import { cacheLife, cacheTag } from "next/cache"
import { type Prisma, ToolStatus } from "~/.generated/prisma/client"
import { tagManyPayload, tagOnePayload } from "~/server/web/tags/payloads"
import type { TagsFilterParams } from "~/server/web/tags/schema"
import { db } from "~/services/db"

export const searchTags = async (search: TagsFilterParams, where?: Prisma.TagWhereInput) => {
  "use cache"

  cacheTag("tags")
  cacheLife("infinite")

  const { q, letter, sort, page, perPage } = search
  const start = performance.now()
  const skip = (page - 1) * perPage
  const take = perPage
  const [sortBy, sortOrder] = sort.split(".")

  const whereQuery: Prisma.TagWhereInput = {
    tools: { some: { status: ToolStatus.Published } },
    ...(q && { name: { contains: q, mode: "insensitive" } }),
  }

  // Filter by letter if provided
  if (letter) {
    if (/^[A-Za-z]$/.test(letter)) {
      // Single alphabet letter - find tags starting with this letter
      whereQuery.name = {
        startsWith: letter.toUpperCase(),
        mode: "insensitive",
      }
    } else {
      // Non-alphabetic character (e.g., "#" for numbers/symbols) - find tags that don't start with alphabet letters
      whereQuery.NOT = {
        OR: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(char => ({
          name: { startsWith: char, mode: "insensitive" },
        })),
      }
    }
  }

  const [tags, total] = await db.$transaction([
    db.tag.findMany({
      orderBy: sortBy ? { [sortBy]: sortOrder } : { name: "asc" },
      where: { ...whereQuery, ...where },
      select: tagManyPayload,
      take,
      skip,
    }),

    db.tag.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  console.log(`Tags search: ${Math.round(performance.now() - start)}ms`)

  return { tags, total, page, perPage }
}

// @changed SESSION_0397 — params narrowed to `{ where?, orderBy? }` (was the full `Prisma.Tag*Args`).
// Spreading the deep FindManyArgs/FindFirstArgs forced TS to instantiate the recursive `TagInclude`
// generics, which tipped over the instantiation-depth limit (TS2321) once the polymorphic Bookmark
// FKs grew Tag's relation graph. Both call sites only ever pass `where`, so this is a real fix (no
// `@ts-expect-error` needed) rather than chasing the heisenbug between the two queries.
export const findTagSlugs = async ({
  where,
  orderBy,
}: {
  where?: Prisma.TagWhereInput
  orderBy?: Prisma.TagOrderByWithRelationInput
} = {}) => {
  "use cache"

  cacheTag("tags")
  cacheLife("infinite")

  return db.tag.findMany({
    orderBy: orderBy ?? { name: "asc" },
    where: { tools: { some: { status: ToolStatus.Published } }, ...where },
    select: { slug: true, updatedAt: true },
  })
}

export const findTag = async ({ where }: { where?: Prisma.TagWhereInput } = {}) => {
  "use cache"

  cacheTag("tag", `tag-${where?.slug}`)
  cacheLife("infinite")

  return db.tag.findFirst({
    where,
    select: tagOnePayload,
  })
}
