import type { Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  clampListPageParams,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { PostsTableSchema } from "~/server/admin/posts/schema"
import { db } from "~/services/db"

const postAdminSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  publishedAt: true,
  updatedAt: true,
  author: { select: { name: true } },
} satisfies Prisma.PostSelect

export type PostAdminRow = Prisma.PostGetPayload<{
  select: typeof postAdminSelect
}>

/** Only scalar columns rendered by the collection may reach Prisma `orderBy`. */
const POST_ORDERABLE = new Set<keyof Prisma.PostOrderByWithRelationInput>([
  "title",
  "status",
  "publishedAt",
  "updatedAt",
])

const DEFAULT_POST_SORT = [{ id: "updatedAt", desc: true }]

const resolvePostSort = (sort: Array<{ id: string; desc: boolean }>) => {
  const allowed = sort.filter(item =>
    POST_ORDERABLE.has(item.id as keyof Prisma.PostOrderByWithRelationInput),
  )

  return allowed.length > 0 ? allowed : DEFAULT_POST_SORT
}

/**
 * Paginated Posts for the ADR 0045 `AdminCollection`. The caller supplies the
 * BBL brand scope as `extraWhere`; search filters are composed underneath it.
 */
export const findPosts = async (search: PostsTableSchema, extraWhere?: Prisma.PostWhereInput) => {
  const { title, operator, status } = search
  const { page, perPage } = clampListPageParams(search.page, search.perPage)
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.PostOrderByWithRelationInput>({
      ...search,
      page,
      perPage,
      sort: resolvePostSort(search.sort),
    })

  const expressions: (Prisma.PostWhereInput | undefined)[] = [
    title ? { title: { contains: title, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.PostWhereInput>(fromDate, toDate),
    status.length > 0 ? { status: { in: status } } : undefined,
  ]

  const whereQuery = buildAdminListWhere<Prisma.PostWhereInput>({
    expressions,
    extraWhere,
    operator,
  })

  return runAdminListTransaction({
    perPage,
    findMany: () =>
      db.post.findMany({
        where: whereQuery,
        select: postAdminSelect,
        orderBy: [...orderBy, { id: "asc" }],
        take: perPage,
        skip: offset,
      }),
    count: () => db.post.count({ where: whereQuery }),
  })
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
