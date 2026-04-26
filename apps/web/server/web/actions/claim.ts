"use server"

import { getDomain } from "@primoui/utils"
import { revalidateTag } from "next/cache"
import { headers } from "next/headers"
import { after } from "next/server"
import { getTranslations } from "next-intl/server"
import { siteConfig } from "~/config/site"
import { EmailVerifyDomain } from "~/emails/verify-domain"
import { auth } from "~/lib/auth"
import { sendEmail } from "~/lib/email"
import { getIP, isRateLimited } from "~/lib/rate-limiter"
import { userActionClient } from "~/lib/safe-actions"
import { createClaimToolEmailSchema, createClaimToolOtpSchema } from "~/server/web/shared/schema"
import { db } from "~/services/db"

/**
 * Check rate limiting for claim actions
 */
const checkRateLimit = async (action: string) => {
  const ip = await getIP()
  const rateLimitKey = `claim-${action}:${ip}`

  if (await isRateLimited(rateLimitKey, "claim")) {
    throw new Error("Too many requests. Please try again later")
  }

  return { ip, rateLimitKey }
}

/**
 * Get tool by slug and verify it's claimable
 */
const getClaimableTool = async (id: string) => {
  const tool = await db.tool.findUnique({
    where: { id },
  })

  if (!tool) {
    throw new Error("Tool not found")
  }

  if (tool.ownerId) {
    throw new Error("This tool has already been claimed")
  }

  return tool
}

/**
 * Verify that email domain matches tool website domain
 */
const verifyEmailDomain = (email: string, toolWebsiteUrl: string) => {
  const toolDomain = getDomain(toolWebsiteUrl)
  const emailDomain = email.split("@")[1]

  if (toolDomain !== emailDomain) {
    throw new Error("Email domain must match the tool's website domain")
  }
}

/**
 * Generate and send OTP email
 */
const generateAndSendOtp = async (email: string) => {
  const { token: otp } = await auth.api.generateOneTimeToken({
    headers: await headers(),
  })

  if (!otp) {
    throw new Error("Failed to send OTP")
  }

  // Send OTP email
  after(async () => {
    const to = email
    const subject = `Your ${siteConfig.name} Verification Code`
    await sendEmail({ to, subject, react: EmailVerifyDomain({ to, otp }) })
  })

  return otp
}

/**
 * Claim tool for a user and revalidate cache
 */
const claimToolForUser = async (toolId: string, userId: string) => {
  const tool = await db.tool.update({
    where: { id: toolId },
    data: { ownerId: userId },
  })

  // Revalidate tools
  revalidateTag("tools", "infinite")
  revalidateTag(`tool-${tool.slug}`, "infinite")
}

/**
 * Send OTP to verify domain ownership
 */
export const sendToolClaimOtp = userActionClient
  .inputSchema(async () => {
    const t = await getTranslations("schema")
    return createClaimToolEmailSchema(t)
  })
  .action(async ({ parsedInput: { toolId, email } }) => {
    // Check rate limiting
    await checkRateLimit("otp")

    // Get and validate tool
    const tool = await getClaimableTool(toolId)

    // Verify email domain
    verifyEmailDomain(email, tool.websiteUrl)

    // Generate and send OTP
    await generateAndSendOtp(email)

    return { success: true }
  })

/**
 * Verify OTP and claim tool
 */
export const verifyToolClaimOtp = userActionClient
  .inputSchema(async () => {
    const t = await getTranslations("schema")
    return createClaimToolOtpSchema(t)
  })
  .action(async ({ parsedInput: { toolId, otp } }) => {
    // Check rate limiting
    await checkRateLimit("verify")

    // Get and validate tool
    const tool = await getClaimableTool(toolId)

    // Verify otp
    const { user } = await auth.api.verifyOneTimeToken({
      body: { token: otp },
    })

    // Claim tool and revalidate
    await claimToolForUser(tool.id, user.id)

    // Revalidate tool
    revalidateTag(`tool-${tool.slug}`, "infinite")

    return { success: true }
  })
