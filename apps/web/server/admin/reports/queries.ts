import type { Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import { db } from "~/services/db"
import type { ReportsTableSchema } from "./schema"

export const findReports = async (search: ReportsTableSchema) => {
  const { message, perPage, operator, type } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.ReportOrderByWithRelationInput>(search)

  const expressions: (Prisma.ReportWhereInput | undefined)[] = [
    // Filter by message
    message ? { message: { contains: message, mode: "insensitive" } } : undefined,

    // Filter by type
    type.length > 0 ? { type: { in: type } } : undefined,

    // Filter by createdAt
    createdAtRangeExpression<Prisma.ReportWhereInput>(fromDate, toDate),
  ]

  const where = buildAdminListWhere<Prisma.ReportWhereInput>({
    expressions,
    operator,
  })

  // Transaction is used to ensure both queries are executed in a single transaction
  const {
    rows: reports,
    total: reportsTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.report.findMany({
        where,
        orderBy,
        take: perPage,
        skip: offset,
        include: { tool: { select: { slug: true, name: true } } },
      }),
    count: () => db.report.count({ where }),
  })

  return { reports, reportsTotal, pageCount }
}

export const findReportById = async (id: string) => {
  return db.report.findUnique({
    where: { id },
  })
}
