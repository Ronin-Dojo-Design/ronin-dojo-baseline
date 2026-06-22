import { isTruthy } from "@dirstack/utils"
import { endOfDay, startOfDay } from "date-fns"
import { Brand, type Prisma } from "~/.generated/prisma/client"
import type { LeadsTableSchema } from "~/server/admin/leads/schema"
import { leadFollowUpPayload, leadPayload } from "~/server/web/lead/payloads"
import { db } from "~/services/db"

// ---------------------------------------------------------------------------
// Paginated list (mirrors server/admin/tools/queries.ts → findTools)
// Brand-scoped per ADR 0004.
// ---------------------------------------------------------------------------

export const findLeads = async (search: LeadsTableSchema, where?: Prisma.LeadWhereInput) => {
  const { name, sort, page, perPage, from, to, operator, status, source, organizationId } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

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
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,

    // Filter by status
    status.length > 0 ? { status: { in: status } } : undefined,

    // Filter by source
    source.length > 0 ? { source: { in: source } } : undefined,

    // Filter by organization
    organizationId ? { organizationId } : undefined,
  ]

  const whereQuery: Prisma.LeadWhereInput = {
    brand: Brand.BBL,
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [leads, total] = await db.$transaction([
    db.lead.findMany({
      where: { ...whereQuery, ...where },
      select: {
        ...leadPayload,
        organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [...orderBy, { createdAt: "asc" }],
      take: perPage,
      skip: offset,
    }),

    db.lead.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(total / perPage)
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
