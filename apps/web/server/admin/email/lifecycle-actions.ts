"use server"

import { z } from "zod"
import { Brand } from "~/.generated/prisma/client"
import { sendEmail } from "~/lib/email"
import { adminActionClient } from "~/lib/safe-actions"
import {
  LIFECYCLE_CATALOG_KEYS,
  buildLifecycleEmailElement,
  getLifecycleCatalogEntry,
} from "~/server/admin/email/lifecycle-catalog"

const sendLifecycleTestSchema = z.object({
  kind: z.enum(LIFECYCLE_CATALOG_KEYS),
  toEmail: z.string().trim().email(),
  recipientName: z.string().trim().max(120).optional().or(z.literal("")),
})

/**
 * Sends an explicit one-off test of a lifecycle template to a chosen address.
 *
 * This is the operator "send me a copy" path — analogous to `sendBblEmailCatalogTest`.
 * It does NOT go through `notifyUserOfLifecycleEvent`, so the `EMAIL_LIFECYCLE_DRYRUN`
 * gate that governs *automatic* lifecycle sends (ADR 0031) is left completely intact;
 * automatic events keep honoring the dry-run flag. The per-brand BBL sender config is
 * still enforced by `sendEmail` (it throws in prod when the BBL sender env is missing).
 */
export const sendBblLifecycleTest = adminActionClient
  .inputSchema(sendLifecycleTestSchema)
  .action(async ({ parsedInput }) => {
    const entry = getLifecycleCatalogEntry(parsedInput.kind)

    const result = await sendEmail({
      brand: Brand.BBL,
      to: parsedInput.toEmail,
      subject: entry.sample.subject,
      react: buildLifecycleEmailElement(entry, { firstName: parsedInput.recipientName }),
    })

    if (result?.error) {
      throw new Error(result.error.message)
    }

    return {
      id: result?.data?.id ?? "local-resend-disabled",
      to: parsedInput.toEmail,
      subject: entry.sample.subject,
    }
  })
