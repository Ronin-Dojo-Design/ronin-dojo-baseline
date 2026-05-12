import { isTruthy } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
import { type Prisma, PostStatus } from "~/.generated/prisma/client"
import type { PostsTableSchema } from "~/server/admin/posts/schema"
import { db } from "~/services/db"

export const findPosts = async (search: PostsTableSchema, where?: Prisma.PostWhereInput) => {
  const { title, sort, page, perPage, from, to, operator, status } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.PostWhereInput | undefined)[] = [
    title ? { title: { contains: title, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
    status.length > 0 ? { status: { in: status } } : undefined,
  ]

  const whereQuery: Prisma.PostWhereInput = {
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [posts, total] = await db.$transaction([
    db.post.findMany({
      where: { ...whereQuery, ...where },
      include: { author: { select: { id: true, name: true } } },
      orderBy: [...orderBy, { createdAt: "asc" }],
      take: perPage,
      skip: offset,
    }),

    db.post.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(total / perPage)
  return { posts, total, pageCount }
}

export const findPostBySlug = async (slug: string) => {
  return db.post.findUnique({
    where: { slug },
    include: { author: { select: { id: true, name: true, image: true } } },
  })
}

export const findPostById = async (id: string) => {
  return db.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      tools: { select: { id: true, name: true } },
    },
  })
}
