"use server"

import { tryCatch } from "@primoui/utils"
import { getTranslations } from "next-intl/server"
import { reportsConfig } from "~/config/reports"
import { getIP, isRateLimited } from "~/lib/rate-limiter"
import { actionClient, userActionClient } from "~/lib/safe-actions"
import { createFeedbackSchema, createReportToolSchema } from "~/server/web/shared/schema"
import { db } from "~/services/db"

export const reportTool = (reportsConfig.requireSignIn ? userActionClient : actionClient)
  .inputSchema(async () => {
    const t = await getTranslations("schema")
    return createReportToolSchema(t)
  })
  .action(async ({ parsedInput: { toolId, type, email, message } }) => {
    const ip = await getIP()
    const rateLimitKey = `report:${ip}`

    // Rate limiting check
    if (await isRateLimited(rateLimitKey, "report")) {
      throw new Error("Too many requests. Please try again later.")
    }

    const result = await tryCatch(
      db.report.create({
        data: {
          type,
          email,
          message,
          toolId,
        },
      }),
    )

    if (result.error) {
      console.error("Failed to report tool:", result.error)
      return { success: false, error: "Failed to report tool. Please try again later." }
    }

    return { success: true }
  })

export const reportFeedback = actionClient
  .inputSchema(async () => {
    const t = await getTranslations("schema")
    return createFeedbackSchema(t)
  })
  .action(async ({ parsedInput: { email, message } }) => {
    const ip = await getIP()
    const rateLimitKey = `feedback:${ip}`

    // Rate limiting check
    if (await isRateLimited(rateLimitKey, "report")) {
      throw new Error("Too many requests. Please try again later.")
    }

    const result = await tryCatch(
      db.report.create({
        data: {
          type: "Feedback",
          email,
          message,
        },
      }),
    )

    if (result.error) {
      console.error("Failed to send feedback:", result.error)
      return { success: false, error: "Failed to send feedback. Please try again later." }
    }

    return { success: true }
  })
