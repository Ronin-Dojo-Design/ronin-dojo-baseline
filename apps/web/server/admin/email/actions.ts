"use server"

import { z } from "zod"
import { sendEmail } from "~/lib/email"
import { adminActionClient } from "~/lib/safe-actions"
import { BBL_EMAIL_TEMPLATE_KEYS, createBblEmailPayload } from "~/server/admin/email/catalog"

const sendBblEmailTestSchema = z.object({
  templateKey: z.enum(BBL_EMAIL_TEMPLATE_KEYS),
  toEmail: z.string().trim().email(),
  recipientName: z.string().trim().max(120).optional().or(z.literal("")),
  personalMessage: z.string().trim().max(1200).optional().or(z.literal("")),
  joinUrl: z
    .string()
    .trim()
    .url()
    .refine(value => ["http:", "https:"].includes(new URL(value).protocol), {
      message: "Use a valid http or https URL",
    })
    .optional()
    .or(z.literal("")),
})

export const sendBblEmailCatalogTest = adminActionClient
  .inputSchema(sendBblEmailTestSchema)
  .action(async ({ parsedInput }) => {
    const payload = createBblEmailPayload({
      templateKey: parsedInput.templateKey,
      to: parsedInput.toEmail,
      recipientName: parsedInput.recipientName,
      personalMessage: parsedInput.personalMessage,
      joinUrl: parsedInput.joinUrl,
    })

    const result = await sendEmail({
      ...payload,
      to: parsedInput.toEmail,
    })

    if (result?.error) {
      throw new Error(result.error.message)
    }

    return {
      id: result?.data?.id ?? "local-resend-disabled",
      to: parsedInput.toEmail,
      subject: payload.subject,
    }
  })
