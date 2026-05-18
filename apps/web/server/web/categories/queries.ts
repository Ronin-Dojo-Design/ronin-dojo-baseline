import { cacheLife, cacheTag } from "next/cache"
import { type Prisma, ToolStatus } from "~/.generated/prisma/client"
import { categoryManyPayload, categoryOnePayload } from "~/server/web/categories/payloads"
import { db } from "~/services/db"

export const findCategories = async ({
  where,
  orderBy,
  take,
}: Pick<Prisma.CategoryFindManyArgs, "where" | "orderBy" | "take"> = {}) => {
  "use cache"

  cacheTag("categories")
  cacheLife("infinite")

  return db.category.findMany({
    take,
    orderBy: orderBy ?? { name: "asc" },
    where: { tools: { some: { status: ToolStatus.Published } }, ...where },
    select: categoryManyPayload,
  })
}

export const findCategorySlugs = async ({
  where,
  orderBy,
}: Pick<Prisma.CategoryFindManyArgs, "where" | "orderBy"> = {}) => {
  "use cache"

  cacheTag("categories")
  cacheLife("infinite")

  return db.category.findMany({
    orderBy: orderBy ?? { name: "asc" },
    where: { tools: { some: { status: ToolStatus.Published } }, ...where },
    select: { slug: true, updatedAt: true },
  })
}

export const findCategory = async ({ where }: Pick<Prisma.CategoryFindFirstArgs, "where"> = {}) => {
  "use cache"

  cacheTag("category", `category-${where?.slug}`)
  cacheLife("infinite")

  return db.category.findFirst({
    where,
    select: categoryOnePayload,
  })
}
