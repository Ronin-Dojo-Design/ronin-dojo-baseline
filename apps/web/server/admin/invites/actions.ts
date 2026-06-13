/**
 * @added   SESSION_0147 (2026-05-12)
 * @why     Admin CRUD actions for invite management (create, revoke, delete)
 * @wired   app/app/invites/ (list, new, detail pages)
 */
"use server"

import { after } from "next/server"
import * as z from "zod"
import { Prisma } from "~/.generated/prisma/client"
import { notifyUserOfInvite } from "~/lib/notifications"
import { adminActionClient } from "~/lib/safe-actions"
import { inviteSchema } from "~/server/admin/invites/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const createInvite = adminActionClient
  .inputSchema(inviteSchema)
  .action(
    async ({
      parsedInput: { id, meta, compTier, compTermDays, ...input },
      ctx: { db, revalidate, brand, user },
    }) => {
      const metaObject = meta ? { ...meta } : {}
      if (compTier && compTier !== "NONE") {
        metaObject.comp = {
          tier: compTier,
          ...(compTermDays ? { termDays: compTermDays } : {}),
        }
      }

      const inviteMeta =
        Object.keys(metaObject).length > 0
          ? (metaObject as Prisma.InputJsonObject)
          : meta === null
            ? Prisma.JsonNull
            : undefined

      const invite = await db.invite.create({
        data: {
          ...input,
          brand,
          createdById: user.id,
          meta: inviteMeta,
        },
        include: { organization: { select: { name: true } } },
      })

      after(async () => {
        revalidate({
          paths: ["/app/invites"],
          tags: ["invites", `invite-${invite.id}`],
        })

        // Send invite email if target email is in meta. Wrapped in try/catch so a
        // Resend failure cannot mask a successful invite creation in the dashboard.
        const targetEmail = (meta as Record<string, unknown> | null)?.email as string | undefined
        if (targetEmail) {
          try {
            await notifyUserOfInvite({
              brand,
              to: targetEmail,
              organizationName: invite.organization.name,
              inviteCode: invite.code,
              expiresAt: invite.expiresAt,
            })
          } catch (error) {
            console.error("[notify] invite email failed", { inviteId: invite.id, error })
          }
        }
      })

      return invite
    },
  )

export const revokeInvite = adminActionClient
  .inputSchema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput: { id }, ctx: { db, revalidate } }) => {
    const invite = await db.invite.update({
      where: { id },
      data: { status: "REVOKED" },
    })

    after(async () => {
      revalidate({
        paths: ["/app/invites"],
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
      paths: ["/app/invites"],
      tags: ["invites"],
    })

    return true
  })
