/**
 * @added   SESSION_0147 (2026-05-12)
 * @why     Admin queries for invite listing, detail, and code lookup
 * @wired   app/app/invites/ (list, detail pages), server/invites/queries.ts (shared code lookup)
 */
import { isTruthy } from "@dirstack/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import type { InvitesTableSchema } from "~/server/admin/invites/schema"
import { db } from "~/services/db"

export const findInvites = async (search: InvitesTableSchema, where?: Prisma.InviteWhereInput) => {
  const { code, status, type, organizationId, page, perPage, sort, from, to, operator } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.InviteWhereInput | undefined)[] = [
    code ? { code: { contains: code, mode: "insensitive" } } : undefined,
    status.length ? { status: { in: status } } : undefined,
    type.length ? { type: { in: type } } : undefined,
    organizationId ? { organizationId } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.InviteWhereInput = {
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [invites, invitesTotal] = await db.$transaction([
    db.invite.findMany({
      where: { ...whereQuery, ...where },
      orderBy,
      take: perPage,
      skip: offset,
      include: {
        organization: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { claims: true } },
      },
    }),

    db.invite.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(invitesTotal / perPage)
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
