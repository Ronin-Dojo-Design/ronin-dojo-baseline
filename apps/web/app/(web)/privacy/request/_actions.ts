"use server"

import { z } from "zod"
import type { DataSubjectRequestType } from "~/.generated/prisma/client"
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
      select: { id: true },
    })

    return { requestId: created.id }
  })
