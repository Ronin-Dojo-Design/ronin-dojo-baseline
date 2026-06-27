import type { Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { PostsTableSchema } from "~/server/admin/posts/schema"
import { db } from "~/services/db"

export const findPosts = async (search: PostsTableSchema, where?: Prisma.PostWhereInput) => {
  const { title, perPage, operator, status } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.PostOrderByWithRelationInput>(search)

  const expressions: (Prisma.PostWhereInput | undefined)[] = [
    title ? { title: { contains: title, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.PostWhereInput>(fromDate, toDate),
    status.length > 0 ? { status: { in: status } } : undefined,
  ]

  const whereQuery = buildAdminListWhere<Prisma.PostWhereInput>({
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: posts,
    total,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.post.findMany({
        where: whereQuery,
        include: { author: { select: { id: true, name: true } } },
        orderBy: [...orderBy, { createdAt: "asc" }],
        take: perPage,
        skip: offset,
      }),
    count: () => db.post.count({ where: whereQuery }),
  })

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
