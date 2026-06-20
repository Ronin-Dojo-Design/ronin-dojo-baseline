import { render } from "@react-email/components"
import type { ReactElement } from "react"
import { EmailLifecycleNotification, type LifecycleLineItem } from "~/emails/lifecycle-notification"
import type { LifecycleEmailKind, LifecycleTier } from "~/lib/notifications"

/**
 * Admin-facing catalog of the lifecycle email library (`lib/notifications.ts`).
 *
 * The lifecycle system already powers every membership / billing / claim email,
 * but nothing surfaced those templates for an operator to preview or test — the
 * legacy BBLApp had a full catalog browser, this app did not. This module mirrors
 * the existing `catalog.tsx` shape (sample context → plaintext preview) so the
 * admin can browse all kinds and send an explicit one-off test.
 *
 * IMPORTANT: this is the *preview/test* surface only. Automatic lifecycle sends
 * remain governed by the `EMAIL_LIFECYCLE_DRYRUN` gate (ADR 0031) in
 * `notifyUserOfLifecycleEvent` — nothing here changes that behavior.
 */

export type LifecycleCatalogCategory = "Membership" | "Billing" | "Lineage" | "Admin"

type LifecycleSample = {
  subject: string
  heading: string
  intro: string
  tier?: LifecycleTier
  details?: LifecycleLineItem[]
  ctaLabel?: string
  ctaUrl?: string
  secondaryNote?: string
}

type LifecycleCatalogEntry = {
  kind: LifecycleEmailKind
  title: string
  category: LifecycleCatalogCategory
  recipient: "member" | "admin"
  description: string
  sample: LifecycleSample
}

const PROFILE_URL = "https://blackbeltlegacy.com/me"
const BILLING_URL = "https://blackbeltlegacy.com/app/membership"

// Mirrors LIFECYCLE_FEATURES in `lib/notifications.ts` so the preview renders the
// same "what this tier includes" block a real lifecycle email would.
const PREMIUM_FEATURE =
  "Premium+: full card (avatar/school/bio) + full profile (location, organizations, rank history, email, social links, QR share)."
const TIER_FEATURES: Record<LifecycleTier, string[]> = {
  free: ["Free: claim + verification badge only."],
  premium: [PREMIUM_FEATURE],
  elite: [PREMIUM_FEATURE, "Elite/Legend inherit Premium (Elite = comp-gift tier)."],
  legend: [PREMIUM_FEATURE, "Elite/Legend inherit Premium (Elite = comp-gift tier)."],
}

export const LIFECYCLE_CATALOG: LifecycleCatalogEntry[] = [
  {
    kind: "new-member-welcome",
    title: "New member welcome",
    category: "Membership",
    recipient: "member",
    description: "Sent when a new membership activates.",
    sample: {
      subject: "Welcome to Black Belt Legacy",
      heading: "Welcome to the lineage",
      intro: "Your membership is active. Here is everything that comes with it.",
      tier: "premium",
      ctaLabel: "View your profile",
      ctaUrl: PROFILE_URL,
    },
  },
  {
    kind: "upgrade-premium",
    title: "Upgrade to Premium",
    category: "Membership",
    recipient: "member",
    description: "Confirms an upgrade to the Premium tier.",
    sample: {
      subject: "Your Premium membership is active",
      heading: "You're on Premium now",
      intro: "Thanks for upgrading. Your full lineage profile is unlocked.",
      tier: "premium",
      details: [{ label: "Tier", value: "Premium" }],
      ctaLabel: "View your profile",
      ctaUrl: PROFILE_URL,
    },
  },
  {
    kind: "upgrade-elite",
    title: "Upgrade to Elite",
    category: "Membership",
    recipient: "member",
    description: "Confirms an upgrade to the Elite tier.",
    sample: {
      subject: "Your Elite membership is active",
      heading: "Welcome to Elite",
      intro: "You now have the full Black Belt Legacy experience.",
      tier: "elite",
      details: [{ label: "Tier", value: "Elite" }],
      ctaLabel: "View your profile",
      ctaUrl: PROFILE_URL,
    },
  },
  {
    kind: "comp-granted",
    title: "Complimentary membership granted",
    category: "Membership",
    recipient: "member",
    description: "Sent when an operator gifts a comp tier.",
    sample: {
      subject: "A gift: your Black Belt Legacy membership",
      heading: "A gift, founder to founder",
      intro: "We've activated a complimentary Elite membership on your account — no card required.",
      tier: "elite",
      ctaLabel: "Claim your profile",
      ctaUrl: PROFILE_URL,
    },
  },
  {
    kind: "downgrade-confirmation",
    title: "Downgrade confirmation",
    category: "Membership",
    recipient: "member",
    description: "Confirms a tier downgrade at period end.",
    sample: {
      subject: "Your membership change is confirmed",
      heading: "Your plan has changed",
      intro: "Your membership will move to the new tier at the end of the current period.",
      details: [{ label: "New tier", value: "Free" }],
      ctaLabel: "Manage membership",
      ctaUrl: BILLING_URL,
    },
  },
  {
    kind: "subscription-ended",
    title: "Subscription ended",
    category: "Membership",
    recipient: "member",
    description: "Sent when a subscription fully ends.",
    sample: {
      subject: "Your Black Belt Legacy membership has ended",
      heading: "Your membership has ended",
      intro: "Your profile stays on the tree — you can reactivate any time.",
      ctaLabel: "Reactivate membership",
      ctaUrl: BILLING_URL,
    },
  },
  {
    kind: "membership-expiring",
    title: "Membership expiring",
    category: "Membership",
    recipient: "member",
    description: "Heads-up before a membership lapses.",
    sample: {
      subject: "Your membership is expiring soon",
      heading: "Your membership is about to expire",
      intro: "Renew now to keep your full lineage profile active.",
      ctaLabel: "Renew now",
      ctaUrl: BILLING_URL,
    },
  },
  {
    kind: "trial-ending",
    title: "Trial ending",
    category: "Membership",
    recipient: "member",
    description: "Reminder near the end of a trial.",
    sample: {
      subject: "Your trial ends soon",
      heading: "Your trial is almost up",
      intro: "Add a payment method to keep your membership running without interruption.",
      ctaLabel: "Continue membership",
      ctaUrl: BILLING_URL,
    },
  },
  {
    kind: "win-back",
    title: "Win-back",
    category: "Membership",
    recipient: "member",
    description: "Re-engagement for lapsed members.",
    sample: {
      subject: "Your place in the lineage is still here",
      heading: "Come back to the tree",
      intro: "We kept your profile exactly as you left it. Pick up where you left off.",
      ctaLabel: "Reactivate",
      ctaUrl: BILLING_URL,
    },
  },
  {
    kind: "payment-receipt",
    title: "Payment receipt",
    category: "Billing",
    recipient: "member",
    description: "Receipt after a successful charge.",
    sample: {
      subject: "Your Black Belt Legacy receipt",
      heading: "Thanks — payment received",
      intro: "Here's your receipt for this membership payment.",
      details: [
        { label: "Amount", value: "$99.00 USD" },
        { label: "Tier", value: "Premium" },
      ],
      ctaLabel: "View billing",
      ctaUrl: BILLING_URL,
    },
  },
  {
    kind: "payment-failed",
    title: "Payment failed",
    category: "Billing",
    recipient: "member",
    description: "Sent when a charge fails.",
    sample: {
      subject: "We couldn't process your payment",
      heading: "Your payment didn't go through",
      intro: "Update your payment method to keep your membership active.",
      ctaLabel: "Update payment method",
      ctaUrl: BILLING_URL,
    },
  },
  {
    kind: "refund-confirmation",
    title: "Refund confirmation",
    category: "Billing",
    recipient: "member",
    description: "Confirms a processed refund.",
    sample: {
      subject: "Your refund is on the way",
      heading: "Refund processed",
      intro: "We've issued your refund. It can take a few business days to appear.",
      details: [{ label: "Amount", value: "$99.00 USD" }],
    },
  },
  {
    kind: "renewal-reminder",
    title: "Renewal reminder",
    category: "Billing",
    recipient: "member",
    description: "Upcoming-renewal heads-up.",
    sample: {
      subject: "Your membership renews soon",
      heading: "A quick renewal heads-up",
      intro: "Your membership will renew automatically on the date below.",
      details: [{ label: "Renews", value: "July 1, 2026" }],
      ctaLabel: "Manage membership",
      ctaUrl: BILLING_URL,
    },
  },
  {
    kind: "renewal-confirmation",
    title: "Renewal confirmation",
    category: "Billing",
    recipient: "member",
    description: "Confirms a successful renewal.",
    sample: {
      subject: "Your membership renewed",
      heading: "You're all set for another term",
      intro: "Your membership renewed successfully. Thanks for staying with us.",
      details: [{ label: "Amount", value: "$99.00 USD" }],
      ctaLabel: "View billing",
      ctaUrl: BILLING_URL,
    },
  },
  {
    kind: "rank-promotion",
    title: "Rank promotion",
    category: "Lineage",
    recipient: "member",
    description: "Celebrates a rank/belt promotion on the tree.",
    sample: {
      subject: "Congratulations on your promotion",
      heading: "A new rank on the lineage",
      intro: "Your promotion has been recorded on the Black Belt Legacy tree.",
      details: [{ label: "Rank", value: "Black belt — 1st degree" }],
      ctaLabel: "View your profile",
      ctaUrl: PROFILE_URL,
    },
  },
  {
    kind: "profile-claim-approved",
    title: "Profile claim approved",
    category: "Lineage",
    recipient: "member",
    description: "Sent when a lineage node claim is approved.",
    sample: {
      subject: "Your profile claim is approved",
      heading: "Your profile is yours",
      intro: "Your claim was approved. You now own and can edit your lineage profile.",
      ctaLabel: "Open your profile",
      ctaUrl: PROFILE_URL,
    },
  },
  {
    kind: "profile-claim-rejected",
    title: "Profile claim rejected",
    category: "Lineage",
    recipient: "member",
    description: "Sent when a claim needs more verification.",
    sample: {
      subject: "About your profile claim",
      heading: "We need a bit more to verify this",
      intro: "We couldn't approve this claim yet. Reply with a little more detail and we'll help.",
      secondaryNote: "This is not a rejection of you — just a verification step.",
    },
  },
  {
    kind: "admin-dispute-alert",
    title: "Admin: claim dispute alert",
    category: "Admin",
    recipient: "admin",
    description: "Internal alert when two people claim the same node.",
    sample: {
      subject: "Claim dispute needs review",
      heading: "A claim needs your review",
      intro: "Two accounts are contesting the same lineage node. Review and resolve in admin.",
      details: [{ label: "Node", value: "chris-haueter" }],
      ctaLabel: "Open admin review",
      ctaUrl: "https://blackbeltlegacy.com/admin/claims",
    },
  },
]

export const LIFECYCLE_CATALOG_KEYS = LIFECYCLE_CATALOG.map(entry => entry.kind) as [
  LifecycleEmailKind,
  ...LifecycleEmailKind[],
]

export const getLifecycleCatalogEntry = (kind: LifecycleEmailKind) => {
  const entry = LIFECYCLE_CATALOG.find(item => item.kind === kind)
  if (!entry) {
    throw new Error(`Unknown lifecycle email kind: ${kind}`)
  }
  return entry
}

/** Build the email element for an entry — shared by the preview and the test send. */
export const buildLifecycleEmailElement = (
  entry: LifecycleCatalogEntry,
  overrides?: { firstName?: string | null },
): ReactElement => {
  return EmailLifecycleNotification({
    to: "preview@example.com",
    firstName: overrides?.firstName?.trim() || "there",
    eyebrow: "Black Belt Legacy",
    heading: entry.sample.heading,
    intro: entry.sample.intro,
    details: entry.sample.details,
    features: entry.sample.tier ? TIER_FEATURES[entry.sample.tier] : undefined,
    ctaLabel: entry.sample.ctaLabel,
    ctaUrl: entry.sample.ctaUrl,
    secondaryNote: entry.sample.secondaryNote,
  })
}

export type LifecycleCatalogPreview = {
  kind: LifecycleEmailKind
  title: string
  category: LifecycleCatalogCategory
  recipient: "member" | "admin"
  description: string
  subject: string
  body: string
}

export const getLifecycleCatalogPreviews = async (): Promise<LifecycleCatalogPreview[]> => {
  return await Promise.all(
    LIFECYCLE_CATALOG.map(async entry => ({
      kind: entry.kind,
      title: entry.title,
      category: entry.category,
      recipient: entry.recipient,
      description: entry.description,
      subject: entry.sample.subject,
      body: await render(buildLifecycleEmailElement(entry), { plainText: true }),
    })),
  )
}
