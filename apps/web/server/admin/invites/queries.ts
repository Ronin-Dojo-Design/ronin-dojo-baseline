/**
 * @added   SESSION_0147 (2026-05-12)
 * @why     Admin queries for invite listing, detail, and code lookup
 * @wired   app/app/invites/ (list, detail pages), server/invites/queries.ts (shared code lookup)
 */
import type { Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { InvitesTableSchema } from "~/server/admin/invites/schema"
import { db } from "~/services/db"

export const findInvites = async (search: InvitesTableSchema, where?: Prisma.InviteWhereInput) => {
  const { code, status, type, organizationId, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.InviteOrderByWithRelationInput>(search)

  const expressions: (Prisma.InviteWhereInput | undefined)[] = [
    code ? { code: { contains: code, mode: "insensitive" } } : undefined,
    status.length ? { status: { in: status } } : undefined,
    type.length ? { type: { in: type } } : undefined,
    organizationId ? { organizationId } : undefined,
    createdAtRangeExpression<Prisma.InviteWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.InviteWhereInput>({
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: invites,
    total: invitesTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.invite.findMany({
        where: whereQuery,
        orderBy,
        take: perPage,
        skip: offset,
        include: {
          organization: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { claims: true } },
        },
      }),
    count: () => db.invite.count({ where: whereQuery }),
  })

  return { invites, invitesTotal, pageCount }
}

export const findInviteById = async (id: string) => {
  return db.invite.findUnique({
    where: { id },
    include: {
      organization: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      claims: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { claimedAt: "desc" },
      },
    },
  })
}

export const findInviteByCode = async (code: string) => {
  return db.invite.findUnique({
    where: { code },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          disciplines: {
            select: { discipline: { select: { id: true, name: true } } },
          },
        },
      },
      _count: { select: { claims: true } },
    },
  })
}
