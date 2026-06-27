import { Brand, type Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { LeadsTableSchema } from "~/server/admin/leads/schema"
import { leadFollowUpPayload, leadPayload } from "~/server/web/lead/payloads"
import { db } from "~/services/db"

// ---------------------------------------------------------------------------
// Paginated list (mirrors server/admin/tools/queries.ts → findTools)
// Brand-scoped per ADR 0004.
// ---------------------------------------------------------------------------

export const findLeads = async (search: LeadsTableSchema, where?: Prisma.LeadWhereInput) => {
  const { name, perPage, operator, status, source, organizationId } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.LeadOrderByWithRelationInput>(search)

  const expressions: (Prisma.LeadWhereInput | undefined)[] = [
    // Filter by name (first or last)
    name
      ? {
          OR: [
            { firstName: { contains: name, mode: "insensitive" } },
            { lastName: { contains: name, mode: "insensitive" } },
          ],
        }
      : undefined,

    // Filter by date range
    createdAtRangeExpression<Prisma.LeadWhereInput>(fromDate, toDate),

    // Filter by status
    status.length > 0 ? { status: { in: status } } : undefined,

    // Filter by source
    source.length > 0 ? { source: { in: source } } : undefined,

    // Filter by organization
    organizationId ? { organizationId } : undefined,
  ]

  const whereQuery = buildAdminListWhere<Prisma.LeadWhereInput>({
    baseWhere: { brand: Brand.BBL },
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: leads,
    total,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.lead.findMany({
        where: whereQuery,
        select: {
          ...leadPayload,
          organization: { select: { id: true, name: true, slug: true } },
        },
        orderBy: [...orderBy, { createdAt: "asc" }],
        take: perPage,
        skip: offset,
      }),
    count: () => db.lead.count({ where: whereQuery }),
  })

  return { leads, total, pageCount }
}

export type FindLeadsResult = Awaited<ReturnType<typeof findLeads>>
export type LeadRow = FindLeadsResult["leads"][number]

// ---------------------------------------------------------------------------
// Single lead with follow-ups (for detail page)
// ---------------------------------------------------------------------------

export const findLeadById = async (id: string) => {
  return db.lead.findFirst({
    where: { id, brand: Brand.BBL },
    select: {
      ...leadPayload,
      organization: { select: { id: true, name: true, slug: true } },
      followUps: {
        select: {
          ...leadFollowUpPayload,
          assignedTo: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export type LeadDetail = NonNullable<Awaited<ReturnType<typeof findLeadById>>>

// ---------------------------------------------------------------------------
// Org list for filter/selector
// ---------------------------------------------------------------------------

export const findOrganizationList = async () => {
  return db.organization.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}
