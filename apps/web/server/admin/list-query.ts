import { isTruthy } from "@dirstack/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import { db } from "~/services/db"

type SortDirection = "asc" | "desc"

type AdminListSearch = {
  page: number
  perPage: number
  sort: Array<{ id: string; desc: boolean }>
  from?: string | null
  to?: string | null
  operator: string
}

type BuildAdminListWhereArgs<TWhere extends object> = {
  baseWhere?: TWhere
  expressions: Array<TWhere | undefined>
  extraWhere?: TWhere
  operator: string
  omitEmptyOperator?: boolean
}

export const getAdminListQueryParts = <TOrderBy = Record<string, SortDirection>>(
  search: AdminListSearch,
) => {
  const { page, perPage, sort, from, to } = search

  return {
    offset: (page - 1) * perPage,
    orderBy: sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as TOrderBy),
    fromDate: from ? startOfDay(new Date(from)) : undefined,
    toDate: to ? endOfDay(new Date(to)) : undefined,
  }
}

export const createdAtRangeExpression = <TWhere extends object>(
  fromDate: Date | undefined,
  toDate: Date | undefined,
) => {
  return fromDate || toDate ? ({ createdAt: { gte: fromDate, lte: toDate } } as TWhere) : undefined
}

export const buildAdminListWhere = <TWhere extends object>({
  baseWhere,
  expressions,
  extraWhere,
  operator,
  omitEmptyOperator = false,
}: BuildAdminListWhereArgs<TWhere>): TWhere => {
  const filteredExpressions = expressions.filter(isTruthy)

  return {
    ...baseWhere,
    ...(filteredExpressions.length || !omitEmptyOperator
      ? { [operator.toUpperCase()]: filteredExpressions }
      : {}),
    ...extraWhere,
  } as TWhere
}

const getPageCount = (total: number, perPage: number) => Math.ceil(total / perPage)

export const runAdminListTransaction = async <TRows>({
  findMany,
  count,
  perPage,
}: {
  findMany: () => Prisma.PrismaPromise<TRows>
  count: () => Prisma.PrismaPromise<number>
  perPage: number
}) => {
  const [rows, total] = await db.$transaction([findMany(), count()])

  return {
    rows,
    total,
    pageCount: getPageCount(total, perPage),
  }
}

export const runAdminListParallel = async <TRows>({
  findMany,
  count,
  perPage,
}: {
  findMany: () => Promise<TRows>
  count: () => Promise<number>
  perPage: number
}) => {
  const [rows, total] = await Promise.all([findMany(), count()])

  return {
    rows,
    total,
    pageCount: getPageCount(total, perPage),
  }
}
