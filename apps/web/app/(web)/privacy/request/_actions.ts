"use server"

import { after } from "next/server"
import { z } from "zod"
import type { DataSubjectRequestType } from "~/.generated/prisma/client"
import { notifyUserOfDsrSubmission } from "~/lib/notifications"
import { userActionClient } from "~/lib/safe-actions"

const dsrSubmitSchema = z.object({
  type: z.enum(["EXPORT", "DELETE", "RECTIFY"]),
  reason: z.string().trim().max(1000),
  confirm: z.boolean().refine(v => v === true, "Please confirm before submitting."),
})

export const submitDataSubjectRequest = userActionClient
  .schema(dsrSubmitSchema)
  .action(async ({ parsedInput, ctx }) => {
    const created = await ctx.db.dataSubjectRequest.create({
      data: {
        userId: ctx.user.id,
        type: parsedInput.type as DataSubjectRequestType,
        reason: parsedInput.reason || null,
      },
      select: { id: true, submittedAt: true, type: true },
    })

    const recipient = ctx.user.email
    const firstName = ctx.user.name?.split(" ")[0] ?? null

    after(async () => {
      if (!recipient) return
      try {
        await notifyUserOfDsrSubmission({
          to: recipient,
          firstName,
          requestId: created.id,
          type: created.type,
          submittedAt: created.submittedAt,
        })
      } catch (error) {
        console.error("[notifyUserOfDsrSubmission] Failed to send confirmation email", {
          requestId: created.id,
          error,
        })
      }
    })

    return { requestId: created.id }
  })
