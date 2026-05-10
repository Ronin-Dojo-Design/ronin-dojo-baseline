import { type Tool, ToolStatus } from "~/.generated/prisma/client"
import { siteConfig } from "~/config/site"
import { EmailAdminSubmissionPremium } from "~/emails/admin-submission-premium"
import { EmailMerchOrderConfirmation } from "~/emails/merch-order-confirmation"
import { EmailSubmission } from "~/emails/submission"
import { EmailSubmissionPremium } from "~/emails/submission-premium"
import { EmailSubmissionPublished } from "~/emails/submission-published"
import { EmailSubmissionScheduled } from "~/emails/submission-scheduled"
import { sendEmail } from "~/lib/email"
import { countSubmittedTools } from "~/server/web/tools/queries"

/**
 * Notify the submitter of a tool submission
 *
 * @param tool - The tool to notify the submitter of
 * @returns The email that was sent
 */
export const notifySubmitterOfToolSubmitted = async (tool: Tool) => {
  if (!tool.submitterEmail) {
    return
  }

  const to = tool.submitterEmail
  const subject = `🙌 Thanks for submitting ${tool.name}!`
  const queue = await countSubmittedTools({})

  return await sendEmail({
    to,
    subject,
    react: EmailSubmission({ to, tool, queue }),
  })
}

/**
 * Notify the submitter of a tool scheduled for publication
 *
 * @param tool - The tool to notify the submitter of
 * @returns The email that was sent
 */
export const notifySubmitterOfToolScheduled = async (tool: Tool) => {
  if (!tool.submitterEmail || !tool.publishedAt || tool.status !== ToolStatus.Scheduled) {
    return
  }

  const to = tool.submitterEmail
  const subject = `Great news! ${tool.name} is scheduled for publication on ${siteConfig.name} 🎉`

  return await sendEmail({
    to,
    subject,
    react: EmailSubmissionScheduled({ to, tool }),
  })
}

/**
 * Notify the submitter of a tool published
 *
 * @param tool - The tool to notify the submitter of
 * @returns The email that was sent
 */
export const notifySubmitterOfToolPublished = async (tool: Tool) => {
  if (!tool.submitterEmail || !tool.publishedAt || tool.status !== ToolStatus.Published) {
    return
  }

  const to = tool.submitterEmail
  const subject = `${tool.name} has been published on ${siteConfig.name} 🎉`

  return await sendEmail({
    to,
    subject,
    react: EmailSubmissionPublished({ to, tool }),
  })
}

/**
 * Notify the submitter of a premium tool
 *
 * @param tool - The tool to notify the submitter of
 * @returns The email that was sent
 */
export const notifySubmitterOfPremiumTool = async (tool: Tool) => {
  if (!tool.submitterEmail) {
    return
  }

  const to = tool.submitterEmail
  const subject = `🙌 Thank you for ${tool.isFeatured ? "featuring" : "expediting"} ${tool.name}!`

  return await sendEmail({
    to,
    subject,
    react: EmailSubmissionPremium({ to, tool }),
  })
}

/**
 * Notify the admin of a premium tool
 *
 * @param tool - The tool to notify the admin of
 * @returns The email that was sent
 */
export const notifyAdminOfPremiumTool = async (tool: Tool) => {
  const to = siteConfig.email
  const subject = `New tool ${tool.isFeatured ? "featured" : "expedited"}: ${tool.name}`

  return await sendEmail({
    to,
    subject,
    replyTo: tool.submitterEmail ?? undefined,
    react: EmailAdminSubmissionPremium({ to, tool }),
  })
}

/**
 * Notify a customer of a merch order confirmation
 *
 * @param params - Order details from Stripe checkout session
 * @returns The email that was sent
 */
export type MerchOrderNotificationParams = {
  customerEmail: string
  productName: string
  amountCents: number
  shippingCents: number
  totalCents: number
  size?: string | null
  color?: string | null
  shippingName?: string | null
  shippingLine1?: string | null
  shippingLine2?: string | null
  shippingCity?: string | null
  shippingState?: string | null
  shippingPostalCode?: string | null
}

export const notifyCustomerOfMerchOrder = async (params: MerchOrderNotificationParams) => {
  const to = params.customerEmail
  const subject = `🛍️ Your TuffBuffs order is confirmed — ${params.productName}`

  return await sendEmail({
    to,
    subject,
    react: EmailMerchOrderConfirmation({
      to,
      productName: params.productName,
      amountCents: params.amountCents,
      shippingCents: params.shippingCents,
      totalCents: params.totalCents,
      size: params.size ?? undefined,
      color: params.color ?? undefined,
      shippingName: params.shippingName ?? undefined,
      shippingLine1: params.shippingLine1 ?? undefined,
      shippingLine2: params.shippingLine2 ?? undefined,
      shippingCity: params.shippingCity ?? undefined,
      shippingState: params.shippingState ?? undefined,
      shippingPostalCode: params.shippingPostalCode ?? undefined,
    }),
  })
}
