"use server"

import { tryCatch } from "@dirstack/utils"
import { getTranslations } from "next-intl/server"
import { z } from "zod"
import { PlanningIntakeStatus } from "~/.generated/prisma/client"
import { getIP, isRateLimited } from "~/lib/rate-limiter"
import { adminActionClient } from "~/lib/safe-actions"
import { createPlanningIntakeSchema } from "~/server/web/shared/schema"

// =============================================================================
// PlanningIntake actions (SESSION_0592) — the admins-only feature-widget's write surface.
// Imitates `server/web/actions/report.ts`'s structure (safe-action client + rate-limit +
// tryCatch), NOT an overload of `Report` (SESSION_0589 pinned decision). BOTH the create and
// the triage status-update run through `adminActionClient` — the widget, the action, and the
// triage view all gate on the SAME admin authz (no separate permission key needed at the
// action layer; `/app/planning-intake` additionally gates on `planningIntake.manage` for the
// route itself, mirroring every other `/app/*` admin surface).
// =============================================================================

/**
 * Create a raw idea/bug/design-note/PL-candidate row. IP-rate-limited like `reportTool`/
 * `reportFeedback` (defense-in-depth against a runaway client, not an abuse control — the
 * caller is already an authenticated admin). `createdById` is derived from the session,
 * never from client input.
 */
export const createPlanningIntake = adminActionClient
  .inputSchema(async () => {
    const t = await getTranslations("schema")
    return createPlanningIntakeSchema(t)
  })
  .action(async ({ parsedInput: { category, body, imageUrls }, ctx: { db, user } }) => {
    const ip = await getIP()
    const rateLimitKey = `planning-intake:${ip}`

    if (await isRateLimited(rateLimitKey, "planning_intake")) {
      throw new Error("Too many submissions. Please try again later.")
    }

    const result = await tryCatch(
      db.planningIntake.create({
        data: {
          category,
          body,
          imageUrls,
          createdById: user.id,
        },
      }),
    )

    if (result.error) {
      console.error("Failed to create planning intake:", result.error)
      return { success: false, error: "Failed to save. Please try again later." }
    }

    return { success: true }
  })

const updatePlanningIntakeStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(PlanningIntakeStatus),
})

/**
 * The triage control — flips a row's status (`/app/planning-intake`). `PROMOTED` is set by
 * hand once an admin has actually authored the `planning-ledger.md` PL row (never automated).
 */
export const updatePlanningIntakeStatus = adminActionClient
  .inputSchema(updatePlanningIntakeStatusSchema)
  .action(async ({ parsedInput: { id, status }, ctx: { db, revalidate } }) => {
    const result = await tryCatch(db.planningIntake.update({ where: { id }, data: { status } }))

    if (result.error) {
      console.error("Failed to update planning intake status:", result.error)
      throw new Error("Failed to update status. Please try again.")
    }

    revalidate({ paths: ["/app/planning-intake"] })

    return { success: true, status: result.data.status }
  })
