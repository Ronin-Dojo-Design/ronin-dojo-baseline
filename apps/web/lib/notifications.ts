import {
  type Brand,
  type DataSubjectRequestStatus,
  type DataSubjectRequestType,
  type MembershipStatus,
  type Tool,
  ToolStatus,
} from "~/.generated/prisma/client"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { EmailAdminBblJoinLegacy } from "~/emails/admin-bbl-join-legacy"
import { EmailAdminFeedback } from "~/emails/admin-feedback"
import { EmailAdminSubmissionPremium } from "~/emails/admin-submission-premium"
import { EmailBblBuildTour } from "~/emails/bbl-build-tour"
import { EmailBblClaimYourProfile } from "~/emails/bbl-claim-your-profile"
import { EmailBblFirstTesterWelcome } from "~/emails/bbl-first-tester-welcome"
import { EmailBblJoinLegacyConfirmation } from "~/emails/bbl-join-legacy-confirmation"
import { EmailBblTheLongRoad } from "~/emails/bbl-the-long-road"
import { EmailDsrStatusUpdate } from "~/emails/dsr-status-update"
import { EmailDsrSubmissionConfirmation } from "~/emails/dsr-submission-confirmation"
import { EmailInviteNotification } from "~/emails/invite-notification"
import { EmailLifecycleNotification, type LifecycleLineItem } from "~/emails/lifecycle-notification"
import { EmailMagicLink } from "~/emails/magic-link"
import { EmailMembershipStatusChange } from "~/emails/membership-status-change"
import { EmailMembershipWelcome, type MembershipWelcomeStatus } from "~/emails/membership-welcome"
import { EmailMerchOrderConfirmation } from "~/emails/merch-order-confirmation"
import { EmailMerchShipmentNotification } from "~/emails/merch-shipment-notification"
import { EmailSubmission } from "~/emails/submission"
import { EmailSubmissionPremium } from "~/emails/submission-premium"
import { EmailSubmissionPublished } from "~/emails/submission-published"
import { EmailSubmissionScheduled } from "~/emails/submission-scheduled"
import {
  EmailTournamentRegistrationConfirmation,
  type TournamentRegistrationPaymentStatus,
} from "~/emails/tournament-registration-confirmation"
import { env } from "~/env"
import { getBrandSenderEmail, sendEmail } from "~/lib/email"
import { isRateLimited } from "~/lib/rate-limiter"
import { countSubmittedTools } from "~/server/web/tools/queries"

/**
 * Returns true when this (template, recipient) pair has been sent too frequently and the
 * caller should silently skip.
 *
 * @added   SESSION_0258 (2026-05-25) — addresses SESSION_0257 Finding 01.
 * @why     Duplicate-suppression at the helper boundary: catches double-clicks on admin
 *          transition buttons, rapid resubmits, and Stripe-webhook retries without
 *          requiring every call-site to coordinate. Fail-open if redis isn't configured
 *          (dev), so it cannot break local flows.
 */
const shouldSkipForRateLimit = async (key: string): Promise<boolean> => {
  const limited = await isRateLimited(`email:${key}`, "email_notify")
  if (limited) {
    console.warn(`[notify] rate-limited skip: ${key}`)
  }
  return limited
}

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
 * @param brand - Optional brand override; falls back to siteConfig.name
 * @returns The email that was sent
 */
export const notifySubmitterOfToolScheduled = async (tool: Tool, brand?: Brand) => {
  if (!tool.submitterEmail || !tool.publishedAt || tool.status !== ToolStatus.Scheduled) {
    return
  }

  const siteName = brand ? getBrandSiteConfig(brand).name : siteConfig.name
  const to = tool.submitterEmail
  const subject = `Great news! ${tool.name} is scheduled for publication on ${siteName} 🎉`

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
 * @param brand - Optional brand override; falls back to siteConfig.name
 * @returns The email that was sent
 */
export const notifySubmitterOfToolPublished = async (tool: Tool, brand?: Brand) => {
  if (!tool.submitterEmail || !tool.publishedAt || tool.status !== ToolStatus.Published) {
    return
  }

  const siteName = brand ? getBrandSiteConfig(brand).name : siteConfig.name
  const to = tool.submitterEmail
  const subject = `${tool.name} has been published on ${siteName} 🎉`

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

// ---------------------------------------------------------------------------
// Printful fulfillment notifications
// ---------------------------------------------------------------------------

export type ShipmentNotificationParams = {
  customerEmail: string
  customerName?: string | null
  trackingNumber?: string | null
  trackingUrl?: string | null
  carrier?: string | null
}

/**
 * Notify a customer that their merch order has shipped.
 *
 * @see app/api/printful/webhooks/route.ts — package_shipped handler
 */
export const notifyCustomerOfShipment = async (params: ShipmentNotificationParams) => {
  const to = params.customerEmail
  const subject = "📦 Your TuffBuffs order has shipped!"

  return await sendEmail({
    to,
    subject,
    react: EmailMerchShipmentNotification({
      to,
      customerName: params.customerName,
      trackingNumber: params.trackingNumber,
      trackingUrl: params.trackingUrl,
      carrier: params.carrier,
    }),
  })
}

export type PrintfulFailureNotificationParams = {
  merchOrderId: string
  customerEmail: string
  reason: string
}

/**
 * Notify admin when a Printful order fails or a package is returned.
 *
 * @see app/api/printful/webhooks/route.ts — order_failed / package_returned handlers
 */

// ---------------------------------------------------------------------------
// Dry-run gated lifecycle notifications (SESSION_0411)
// ---------------------------------------------------------------------------

export type LifecycleTier = "free" | "premium" | "elite" | "legend"

// FI-012: member-facing benefit copy. These strings render into lifecycle emails
// (e.g. the claim-approved welcome), so they must read to a member — NOT the internal
// tier-spec shorthand ("Premium+", "comp-gift tier", "Elite/Legend inherit Premium")
// that previously leaked into the inbox. Exported as the SINGLE source so the admin
// email-preview catalog renders the exact strings a real email sends.
export const LIFECYCLE_FEATURES: Record<LifecycleTier, string[]> = {
  free: ["Your claimed profile and a verified badge on the lineage tree."],
  premium: [
    "A full profile: your photo, school, bio, rank history, and social links.",
    "Your place on the lineage tree, connected to your students and instructors.",
    "A shareable profile link and QR code.",
  ],
  elite: [
    "A full profile: your photo, school, bio, rank history, and social links.",
    "Your place on the lineage tree, connected to your students and instructors.",
    "A shareable profile link and QR code.",
  ],
  legend: [
    "A full profile: your photo, school, bio, rank history, and social links.",
    "Your place on the lineage tree, connected to your students and instructors.",
    "A shareable profile link and QR code.",
  ],
}

export type LifecycleEmailKind =
  | "new-member-welcome"
  | "refund-confirmation"
  | "subscription-ended"
  | "upgrade-premium"
  | "upgrade-elite"
  | "payment-receipt"
  | "payment-failed"
  | "renewal-reminder"
  | "renewal-confirmation"
  | "trial-ending"
  | "membership-expiring"
  | "downgrade-confirmation"
  | "win-back"
  | "comp-granted"
  | "rank-promotion"
  | "profile-claim-approved"
  | "profile-claim-rejected"
  | "admin-dispute-alert"

export type LifecycleNotificationParams = {
  brand: Brand
  kind: LifecycleEmailKind
  to: string
  firstName?: string | null
  subject: string
  heading: string
  intro: string
  tier?: LifecycleTier | null
  details?: LifecycleLineItem[]
  ctaLabel?: string
  ctaUrl?: string
  rateLimitKey: string
  secondaryNote?: string
}

export const isLifecycleEmailDryRun = () =>
  env.EMAIL_LIFECYCLE_DRYRUN !== "0" && env.EMAIL_LIFECYCLE_DRYRUN !== "false"

export const notifyUserOfLifecycleEvent = async (params: LifecycleNotificationParams) => {
  if (await shouldSkipForRateLimit(`lifecycle:${params.kind}:${params.rateLimitKey}`)) return

  const features = params.tier ? LIFECYCLE_FEATURES[params.tier] : []

  if (isLifecycleEmailDryRun()) {
    console.log("[email:lifecycle:dry-run]", {
      kind: params.kind,
      brand: params.brand,
      to: params.to,
      subject: params.subject,
      tier: params.tier,
      details: params.details,
    })
    return
  }

  return await sendEmail({
    brand: params.brand,
    to: params.to,
    subject: params.subject,
    react: EmailLifecycleNotification({
      to: params.to,
      firstName: params.firstName,
      eyebrow: "Black Belt Legacy",
      heading: params.heading,
      intro: params.intro,
      details: params.details,
      features,
      ctaLabel: params.ctaLabel,
      ctaUrl: params.ctaUrl,
      secondaryNote: params.secondaryNote,
    }),
  })
}

// ---------------------------------------------------------------------------
// Data Subject Request (privacy/GDPR) notifications
// ---------------------------------------------------------------------------

const DSR_TYPE_SUBJECT_LABEL: Record<DataSubjectRequestType, string> = {
  EXPORT: "data export",
  DELETE: "account deletion",
  RECTIFY: "data rectification",
}

export type DsrSubmissionConfirmationParams = {
  to: string
  firstName?: string | null
  requestId: string
  type: DataSubjectRequestType
  submittedAt: Date
}

export const notifyUserOfDsrSubmission = async (params: DsrSubmissionConfirmationParams) => {
  if (await shouldSkipForRateLimit(`dsr-submission:${params.to}`)) return

  const subject = `We've received your ${DSR_TYPE_SUBJECT_LABEL[params.type]} request`

  return await sendEmail({
    to: params.to,
    subject,
    react: EmailDsrSubmissionConfirmation({
      to: params.to,
      firstName: params.firstName,
      requestId: params.requestId,
      type: params.type,
      submittedAt: params.submittedAt,
    }),
  })
}

export type DsrStatusUpdateParams = {
  to: string
  firstName?: string | null
  requestId: string
  type: DataSubjectRequestType
  previousStatus: DataSubjectRequestStatus
  newStatus: DataSubjectRequestStatus
  notes?: string | null
}

export const notifyUserOfDsrStatusUpdate = async (params: DsrStatusUpdateParams) => {
  if (await shouldSkipForRateLimit(`dsr-status:${params.to}:${params.newStatus}`)) return

  const subject = `Update on your ${DSR_TYPE_SUBJECT_LABEL[params.type]} request`

  return await sendEmail({
    to: params.to,
    subject,
    react: EmailDsrStatusUpdate({
      to: params.to,
      firstName: params.firstName,
      requestId: params.requestId,
      type: params.type,
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
      notes: params.notes,
    }),
  })
}

// ---------------------------------------------------------------------------
// Membership lifecycle notifications (SESSION_0258 — admin transitions only;
// self-service + system-driven paths deferred to SESSION_0259)
// ---------------------------------------------------------------------------

export type MembershipStatusChangeParams = {
  brand?: Brand
  to: string
  firstName?: string | null
  organizationName: string
  disciplineName: string
  previousStatus: MembershipStatus
  newStatus: MembershipStatus
}

export const notifyMemberOfMembershipStatusChange = async (
  params: MembershipStatusChangeParams,
) => {
  if (await shouldSkipForRateLimit(`membership-status:${params.to}:${params.newStatus}`)) return

  const subject = `Your ${params.organizationName} membership is now ${params.newStatus.toLowerCase()}`

  return await sendEmail({
    brand: params.brand,
    to: params.to,
    subject,
    react: EmailMembershipStatusChange({
      to: params.to,
      firstName: params.firstName,
      organizationName: params.organizationName,
      disciplineName: params.disciplineName,
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
    }),
  })
}

// ---------------------------------------------------------------------------
// Membership welcome notifications (SESSION_0259 — fresh-membership semantics
// for self-service join paths: claimInvite, joinByInviteCode, joinOrganization.
// Distinct from membership-status-change which renders a Prev → New arrow for
// true transitions.)
// ---------------------------------------------------------------------------

export type MembershipWelcomeParams = {
  brand?: Brand
  to: string
  firstName?: string | null
  organizationName: string
  disciplineName: string
  status: MembershipWelcomeStatus
}

export const notifyMemberOfMembershipWelcome = async (params: MembershipWelcomeParams) => {
  if (await shouldSkipForRateLimit(`membership-welcome:${params.to}:${params.organizationName}`))
    return

  const subject =
    params.status === "ACTIVE"
      ? `Welcome to ${params.organizationName}`
      : `Your ${params.organizationName} membership request is pending`

  return await sendEmail({
    brand: params.brand,
    to: params.to,
    subject,
    react: EmailMembershipWelcome({
      to: params.to,
      firstName: params.firstName,
      organizationName: params.organizationName,
      disciplineName: params.disciplineName,
      status: params.status,
    }),
  })
}

// ---------------------------------------------------------------------------
// Invite notifications (SESSION_0258 — refactored from inline sendEmail in
// server/admin/invites/actions.ts onto this helper)
// ---------------------------------------------------------------------------

export type InviteNotificationParams = {
  brand?: Brand
  to: string
  organizationName: string
  inviteCode: string
  expiresAt?: Date | null
}

export const notifyUserOfInvite = async (params: InviteNotificationParams) => {
  if (await shouldSkipForRateLimit(`invite:${params.to}:${params.inviteCode}`)) return

  const subject = `You're invited to join ${params.organizationName}`

  return await sendEmail({
    brand: params.brand,
    to: params.to,
    subject,
    react: EmailInviteNotification({
      to: params.to,
      organizationName: params.organizationName,
      inviteCode: params.inviteCode,
      expiresAt: params.expiresAt,
    }),
  })
}

// ---------------------------------------------------------------------------
// Tournament registration notifications (SESSION_0258 — fired from the Stripe
// webhook fulfillment path after registration row is created; admin walk-in
// path deferred to SESSION_0259 since no admin-creation action exists today)
// ---------------------------------------------------------------------------

export type TournamentRegistrationParams = {
  to: string
  firstName?: string | null
  tournamentName: string
  divisionName: string
  rank?: string | null
  orgName?: string | null
  paymentStatus?: TournamentRegistrationPaymentStatus
}

export const notifyUserOfTournamentRegistration = async (params: TournamentRegistrationParams) => {
  if (await shouldSkipForRateLimit(`tournament-registration:${params.to}:${params.tournamentName}`))
    return

  const subject = `You're registered for ${params.tournamentName}`

  return await sendEmail({
    to: params.to,
    subject,
    react: EmailTournamentRegistrationConfirmation({
      to: params.to,
      firstName: params.firstName,
      tournamentName: params.tournamentName,
      divisionName: params.divisionName,
      rank: params.rank,
      orgName: params.orgName,
      paymentStatus: params.paymentStatus,
    }),
  })
}

// ---------------------------------------------------------------------------
// Black Belt Legacy Join the Legacy notifications (SESSION_0278)
// ---------------------------------------------------------------------------

export type BblJoinLegacyMembershipPath = "FREE" | "PREMIUM" | "ELITE"

export type BblJoinLegacyNotificationParams = {
  brand: Brand
  to: string
  firstName?: string | null
  fullName: string
  membershipPath: BblJoinLegacyMembershipPath
  leadId: string
  rankSummary?: string | null
  trainedUnder?: string | null
  represent?: string | null
  checkoutUrl?: string | null
  appUrl?: string | null
  claimCreated?: boolean
}

export const notifyUserOfBblJoinLegacy = async (params: BblJoinLegacyNotificationParams) => {
  if (await shouldSkipForRateLimit(`bbl-join-legacy:${params.to}`)) return

  return await sendEmail({
    brand: params.brand,
    to: params.to,
    subject: "We received your Black Belt Legacy lineage information",
    react: EmailBblJoinLegacyConfirmation({
      to: params.to,
      firstName: params.firstName,
      membershipPath: params.membershipPath,
      checkoutUrl: params.checkoutUrl,
      claimCreated: params.claimCreated,
    }),
  })
}

export type BblClaimYourProfileParams = {
  brand: Brand
  to: string
  firstName?: string | null
  profileName: string
  claimUrl: string
  compTier?: "ELITE"
  isLifetime?: boolean
}

/**
 * The "claim your profile" launch announcement to an existing member whose
 * profile was imported as a placeholder Passport (SESSION_0403). Sent in bulk by
 * the claim-announcement admin action; rate-limit-guarded per recipient.
 */
export const notifyMemberOfBblClaimYourProfile = async (params: BblClaimYourProfileParams) => {
  if (await shouldSkipForRateLimit(`bbl-claim:${params.to}`)) return

  return await sendEmail({
    brand: params.brand,
    to: params.to,
    subject: "Claim your Black Belt Legacy profile",
    react: EmailBblClaimYourProfile({
      to: params.to,
      firstName: params.firstName,
      profileName: params.profileName,
      claimUrl: params.claimUrl,
      compTier: params.compTier,
      isLifetime: params.isLifetime,
    }),
  })
}

export type BblFounderLongRoadParams = {
  brand: Brand
  to: string
  firstName?: string | null
  /** The minted, email-bound magic link that one-click claims the recipient's node. */
  claimUrl: string
  /** "founder" = Bob's letter. "tony" = Tony sees the letter verbatim + a short preface. */
  variant?: "founder" | "tony"
}

/**
 * The founder's claim email (SESSION_0418): when Bob Bass — the genius behind
 * Black Belt Legacy — claims his own profile, he does NOT get the generic
 * "claim your profile" note. He gets "The Long Road": Brian Scott's 8-year
 * testament, founder to founder, with his one-click claim link carried inside.
 */
export const notifyFounderOfTheLongRoad = async (params: BblFounderLongRoadParams) => {
  const isTony = params.variant === "tony"
  if (await shouldSkipForRateLimit(`bbl-founder-long-road:${params.to}`)) return

  return await sendEmail({
    brand: params.brand,
    to: params.to,
    subject: isTony
      ? "Black Belt Legacy is live — and the letter I sent Bob"
      : "A first look at Black Belt Legacy — and the long road that got us here",
    react: EmailBblTheLongRoad({
      to: params.to,
      claimUrl: params.claimUrl,
      variant: params.variant,
    }),
  })
}

export type BblBuildTourParams = {
  brand: Brand
  to: string
  /** "founder" = Bob ("Mr. Bass," + both-inbox footer). "tony" = Tony ("Tony," + his inbox). */
  variant?: "founder" | "tony"
}

/** "Explore the Build" — live docs navigator + knowledge-graph links (transparency, no asks). */
export const notifyFounderOfBuildTour = async (params: BblBuildTourParams) => {
  if (await shouldSkipForRateLimit(`bbl-build-tour:${params.to}`)) return

  return await sendEmail({
    brand: params.brand,
    to: params.to,
    subject: "A window into everything we built for Black Belt Legacy",
    react: EmailBblBuildTour({ to: params.to, variant: params.variant }),
  })
}

export type BblFirstTesterWelcomeParams = {
  brand: Brand
  to: string
  /** First-person salutation name (e.g. "Brian"). */
  recipientName: string
  /** The minted, email-bound magic link that one-click signs in + claims the node. */
  claimUrl: string
}

/**
 * The operator's warm thank-you to a loyal member who is BBL's first non-admin
 * tester (SESSION_0420): years of loyalty acknowledged, the invite to be the
 * first real claim, a friction-feedback ask, the lifetime-membership gift, the
 * gear/certificate offer, and the login + auto-claim explainer with the
 * recipient's one-click claim link inside.
 */
export const notifyMemberOfBblFirstTesterWelcome = async (params: BblFirstTesterWelcomeParams) => {
  if (await shouldSkipForRateLimit(`bbl-first-tester:${params.to}`)) return

  return await sendEmail({
    brand: params.brand,
    to: params.to,
    subject: "Thank you — and a first look at the new Black Belt Legacy",
    react: EmailBblFirstTesterWelcome({
      to: params.to,
      recipientName: params.recipientName,
      claimUrl: params.claimUrl,
    }),
  })
}

export type BblFreeSignupMagicLinkParams = {
  brand: Brand
  to: string
  firstName?: string | null
  /** The minted, email-bound magic link that provisions the free account and lands on `/me`. */
  verifyUrl: string
}

/**
 * Free signup (no profile claim): a guest chose the FREE path without selecting
 * a lineage node, so there is nothing to claim — they just need an account. We
 * mint a `/me` magic link and ship it as the verify-your-email message
 * (SESSION_0418). Better Auth provisions the User + identity shell when the link
 * is verified; clicking lands them on `/me` with free-tier access.
 */
export const notifyUserOfBblFreeSignup = async (params: BblFreeSignupMagicLinkParams) => {
  if (await shouldSkipForRateLimit(`bbl-free-signup:${params.to}`)) return

  return await sendEmail({
    brand: params.brand,
    to: params.to,
    subject: "Confirm your Black Belt Legacy account",
    react: EmailMagicLink({ to: params.to, url: params.verifyUrl }),
  })
}

export const notifyAdminOfBblJoinLegacy = async (params: BblJoinLegacyNotificationParams) => {
  const to = getBrandSenderEmail(params.brand)

  return await sendEmail({
    brand: params.brand,
    to,
    subject: `New Black Belt Legacy intake: ${params.fullName}`,
    replyTo: params.to,
    react: EmailAdminBblJoinLegacy({
      to,
      fullName: params.fullName,
      email: params.to,
      membershipPath: params.membershipPath,
      rankSummary: params.rankSummary,
      trainedUnder: params.trainedUnder,
      represent: params.represent,
      adminLeadUrl: `${params.appUrl ?? siteConfig.url}/admin/leads/${params.leadId}`,
      checkoutUrl: params.checkoutUrl,
      claimCreated: params.claimCreated,
    }),
  })
}

// ---------------------------------------------------------------------------
// Site feedback widget notifications (SESSION_0420)
// ---------------------------------------------------------------------------

export type FeedbackNotificationParams = {
  brand: Brand
  /** The submitter's email (also used as Reply-To so the operator can reply directly). */
  email: string
  message: string
}

/**
 * Notify the operator inbox when a visitor submits the public feedback widget.
 *
 * Feedback already persists to the Report table (type = Feedback), surfaced in the
 * admin Reports view at /app/reports — but nobody is pinged about it. This puts a
 * copy in the brand inbox (welcome@blackbeltlegacy.com for BBL via getBrandSenderEmail)
 * with the submitter as Reply-To, so feedback actually gets seen. Rate-limit-guarded
 * per submitter to absorb double-submits.
 */
export const notifyAdminOfFeedback = async (params: FeedbackNotificationParams) => {
  if (await shouldSkipForRateLimit(`feedback:${params.email}`)) return

  const to = getBrandSenderEmail(params.brand)
  const siteName = getBrandSiteConfig(params.brand).name

  return await sendEmail({
    brand: params.brand,
    to,
    subject: `New ${siteName} feedback from ${params.email}`,
    replyTo: params.email,
    react: EmailAdminFeedback({
      to,
      fromEmail: params.email,
      message: params.message,
      siteName,
      adminReportsUrl: `${siteConfig.url}/app/reports`,
    }),
  })
}

export const notifyAdminOfPrintfulFailure = async (params: PrintfulFailureNotificationParams) => {
  const to = siteConfig.email
  const subject = `⚠️ Printful order issue: ${params.merchOrderId}`

  return await sendEmail({
    to,
    subject,
    react: EmailMerchShipmentNotification({
      to,
      customerName: `ADMIN ALERT — Customer: ${params.customerEmail}`,
      trackingNumber: `Reason: ${params.reason}`,
    }),
  })
}
