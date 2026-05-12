/**
 * @added   SESSION_0147 (2026-05-12)
 * @why     Admin CRUD actions for invite management (create, revoke, delete)
 * @wired   app/admin/invites/ (list, new, detail pages)
 */
"use server"

import { after } from "next/server"
import * as z from "zod"
import { Prisma } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import { inviteSchema } from "~/server/admin/invites/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const createInvite = adminActionClient
  .inputSchema(inviteSchema)
  .action(async ({ parsedInput: { id, meta, ...input }, ctx: { db, revalidate, brand, user } }) => {
    const invite = await db.invite.create({
      data: {
        ...input,
        brand,
        createdById: user.id,
        meta: meta === null ? Prisma.JsonNull : meta ? (meta as Prisma.InputJsonObject) : undefined,
      },
    })

    after(async () => {
      revalidate({
        paths: ["/admin/invites"],
        tags: ["invites", `invite-${invite.id}`],
      })
    })

    return invite
  })

export const revokeInvite = adminActionClient
  .inputSchema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput: { id }, ctx: { db, revalidate } }) => {
    const invite = await db.invite.update({
      where: { id },
      data: { status: "REVOKED" },
    })

    after(async () => {
      revalidate({
        paths: ["/admin/invites"],
        tags: ["invites", `invite-${invite.id}`],
      })
    })

    return invite
  })

export const deleteInvites = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.invite.deleteMany({
      where: { id: { in: ids } },
    })

    revalidate({
      paths: ["/admin/invites"],
      tags: ["invites"],
    })

    return true
  })
