import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { INBOX_BRANDS, INBOX_SORTABLE_COLUMNS, INBOX_TRIAGE_STATUSES } from "~/server/inbox/schema"
import { authedProcedure } from "~/server/orpc/procedure"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { db } from "~/services/db"

/**
 * Admin inbound-email read/triage router (G-033 slice 1, SESSION_0639; ADR 0024 full-oRPC
 * direction — no next-safe-action surface here). Rows are written ONLY by the Resend webhook
 * (`app/api/resend/webhooks/route.ts`); this router is the read/triage side consumed by the
 * `/app/inbox` AdminCollection.
 *
 * Authz: REUSES the existing `email.manage` area key (`APP_AREA_PERMISSIONS.email` — the
 * `/app/email` gate) on both procedures — an inbound-email inbox is squarely the email admin
 * area, so a new authz NEED maps to the EXISTING key, never a new system (repo rule: 4 authz
 * systems, never a 5th). admin `"*"` covers it; no grant plumbing.
 */

const triageStatusSchema = z.enum(INBOX_TRIAGE_STATUSES)

/**
 * Brand filter as validated string literals (`server/inbox/schema.ts`) — the values of the
 * Prisma `Brand` enum without value-importing it (the known client-shared trap; this input
 * type flows into the client's router typings).
 */
const brandFilterSchema = z.enum(INBOX_BRANDS)

/** Sortable columns — a subset of the `/app/inbox` table's accessor keys (shared constant). */
const sortableColumnSchema = z.enum(INBOX_SORTABLE_COLUMNS)

const listInput = z.object({
  triageStatus: z.union([triageStatusSchema, z.literal("all")]).default("UNREAD"),
  /** Faceted brand filter (empty = all brands, including unresolved-null rows). */
  brand: z.array(brandFilterSchema).max(INBOX_BRANDS.length).default([]),
  /** Case-insensitive contains match on the sender (toolbar search field). */
  fromAddress: z.string().max(320).optional(),
  page: z.number().int().min(1).max(10_000).default(1),
  perPage: z.number().int().min(1).max(100).default(25),
  sort: z
    .array(z.object({ id: sortableColumnSchema, desc: z.boolean() }))
    .max(3)
    .default([{ id: "receivedAt", desc: true }]),
})

const setTriageStatusInput = z.object({
  id: z.string().min(1).max(191),
  triageStatus: triageStatusSchema,
})

/** List select — rawPayload/bodies deliberately excluded (list stays light; no detail page yet). */
const LIST_SELECT = {
  id: true,
  fromAddress: true,
  toAddress: true,
  subject: true,
  brand: true,
  receivedAt: true,
  triageStatus: true,
} as const

const list = authedProcedure
  .meta({ permission: APP_AREA_PERMISSIONS.email })
  .input(listInput)
  .handler(async ({ input }) => {
    const where = {
      ...(input.triageStatus === "all" ? {} : { triageStatus: input.triageStatus }),
      ...(input.brand.length > 0 ? { brand: { in: input.brand } } : {}),
      ...(input.fromAddress
        ? { fromAddress: { contains: input.fromAddress, mode: "insensitive" as const } }
        : {}),
    }

    const orderBy = [
      ...input.sort.map(({ id, desc }) => ({ [id]: desc ? "desc" : "asc" }) as const),
      { receivedAt: "desc" as const },
    ]

    const [rows, total] = await db.$transaction([
      db.inboundEmail.findMany({
        where,
        select: LIST_SELECT,
        orderBy,
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
      }),
      db.inboundEmail.count({ where }),
    ])

    return { rows, total, pageCount: Math.ceil(total / input.perPage) }
  })

const setTriageStatus = authedProcedure
  .meta({ permission: APP_AREA_PERMISSIONS.email })
  .input(setTriageStatusInput)
  .handler(async ({ input }) => {
    // updateMany + count check instead of update: a stale row id must surface as NOT_FOUND, not
    // as a raw Prisma P2025.
    const { count } = await db.inboundEmail.updateMany({
      where: { id: input.id },
      data: { triageStatus: input.triageStatus },
    })
    if (count === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Inbound email not found" })
    }

    return { id: input.id, triageStatus: input.triageStatus }
  })

export const inbox = {
  list,
  setTriageStatus,
}
