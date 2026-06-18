"use server"

import { after } from "next/server"
import { z } from "zod"
import { EmailBblTeaserWelcome } from "~/emails/bbl-teaser-welcome"
import { getRequestBrand } from "~/lib/brand-context"
import { sendEmail } from "~/lib/email"
import { publicActionClient } from "~/lib/safe-actions"

const captureEmailSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().max(160).optional(),
})

/**
 * Public (unauthenticated) pre-launch email capture for the brand teaser landing
 * page (SESSION_0411).
 *
 * Replaces the dead WordPress endpoint the legacy monorepo modal POSTed to — the
 * capture now persists to THIS app's `BblEmailCapture` table. Deduped on `email`:
 * a re-submit updates the name and keeps the existing row (no duplicate, no error).
 *
 * A confirmation email is sent best-effort via `after()` and is guarded by
 * `sendEmail`, which no-ops when `RESEND_API_KEY` is empty — so the capture always
 * succeeds even when email sending is disabled (CI, local, sender-rep guard).
 */
export const captureBblEmail = publicActionClient
  .inputSchema(captureEmailSchema)
  .action(async ({ parsedInput, ctx: { db } }) => {
    const brand = await getRequestBrand()
    const email = parsedInput.email.trim().toLowerCase()
    const name = parsedInput.name?.trim() || null

    const capture = await db.bblEmailCapture.upsert({
      where: { email },
      // Keep the existing row on conflict; only refresh the name if a new one was given.
      update: name ? { name } : {},
      create: { email, name, brand, source: "teaser" },
      select: { id: true, email: true, name: true, createdAt: true },
    })

    after(async () => {
      try {
        await sendEmail({
          brand,
          to: email,
          subject: "You're on the Black Belt Legacy early-access list",
          react: EmailBblTeaserWelcome({ to: email, name: capture.name }),
        })
      } catch (error) {
        // Best-effort only — the capture is already persisted above.
        console.error("[bbl] teaser welcome email failed", { email, error })
      }
    })

    return { id: capture.id, email: capture.email }
  })
