"use server"

import { z } from "zod"
import { Brand } from "~/.generated/prisma/client"
import { EmailBblClaimYourProfile } from "~/emails/bbl-claim-your-profile"
import { sendEmail } from "~/lib/email"
import { adminActionClient } from "~/lib/safe-actions"

const sendBblClaimInviteSchema = z.object({
  toEmail: z.string().trim().email(),
  firstName: z.string().trim().max(80).optional().or(z.literal("")),
  profileName: z.string().trim().min(1).max(120),
  claimUrl: z
    .string()
    .trim()
    .url()
    .refine(value => ["http:", "https:"].includes(new URL(value).protocol), {
      message: "Use a valid http or https URL",
    }),
  isLifetime: z.boolean().optional(),
})

export const sendBblClaimInvite = adminActionClient
  .inputSchema(sendBblClaimInviteSchema)
  .action(async ({ parsedInput }) => {
    const result = await sendEmail({
      brand: Brand.BBL,
      to: parsedInput.toEmail,
      subject: "Claim your Black Belt Legacy profile",
      react: EmailBblClaimYourProfile({
        to: parsedInput.toEmail,
        firstName: parsedInput.firstName || null,
        profileName: parsedInput.profileName,
        claimUrl: parsedInput.claimUrl,
        compTier: "ELITE",
        isLifetime: parsedInput.isLifetime ?? false,
      }),
    })

    if (result?.error) {
      throw new Error(result.error.message)
    }

    return {
      id: result?.data?.id ?? "local-resend-disabled",
      to: parsedInput.toEmail,
    }
  })
