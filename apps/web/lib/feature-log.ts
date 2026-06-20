/**
 * Canonical feature log for Black Belt Legacy (BBLApp v4.4).
 *
 * Single source of truth for the in-app `/changelog` (What's New) page. The root `FEATURES.md`
 * mirrors this for GitHub readers — keep the two in sync (or regenerate FEATURES.md from here).
 *
 * Status meaning:
 * - `live`    — set and in production for all visitors/members.
 * - `beta`    — built and usable, still hardening; close, not final.
 * - `planned` — directional, not a commitment or a date.
 */

export type FeatureStatus = "live" | "beta" | "planned"

export type FeatureItem = {
  name: string
  description: string
  /** Optional emphasis, e.g. "closest to GA". */
  note?: string
}

export type ChangelogEntry = {
  /** Display label, e.g. "June 2026 — MVP launch". */
  period: string
  items: string[]
}

export const FEATURE_LOG = {
  version: "v4.4",
  milestone: "MVP — Live",
  launchedOn: "June 19, 2026",
  site: "https://blackbeltlegacy.com",
} as const

export const LIVE_FEATURES: FeatureItem[] = [
  {
    name: "Lineage network (timeline-tree)",
    description:
      "The signature feature: a chronological tree of who promoted whom, with provable provenance — “Promoted by X · date,” year-stamped connectors, ordered by time.",
  },
  {
    name: "Public lineage viewer",
    description:
      "Browse trees with a node drawer, search, and selected-path highlighting; responsive on mobile.",
  },
  {
    name: "Member & practitioner profiles",
    description: "Each person has a profile with rank history and trust signals.",
  },
  {
    name: "Public directory",
    description: "Searchable directory of people and schools.",
  },
  {
    name: "One-click profile claims",
    description:
      "Claim your profile with a magic link (no passwords) or social sign-in; claims bind to your email and reconcile on every sign-in.",
  },
  {
    name: "Admin claim review",
    description:
      "Approve / deny / needs-info on claims, with a full audit trail and a notification email to the claimant on every decision.",
  },
  {
    name: "Rank history & awards",
    description: "Belt and rank record per practitioner, surfaced on profiles and the timeline.",
  },
  {
    name: "Paid memberships",
    description:
      "Premium and Elite via Stripe checkout → signed webhook → entitlements, with a billing portal.",
  },
  {
    name: "Comp & gift memberships",
    description: "Audited complimentary and gifted grants (e.g. for claim approvals and testers).",
  },
  {
    name: "Lifecycle emails",
    description: "Welcome, claim approved/denied, and payment receipts.",
  },
  {
    name: "Schools & organizations",
    description: "Membership, invites, roles, settings, and per-org theming.",
  },
]

// Ordered closest-to-GA first.
export const BETA_FEATURES: FeatureItem[] = [
  {
    name: "Video library",
    description: "A library of training and reference video.",
    note: "Closest to GA",
  },
  { name: "Technique graph", description: "A connected map of techniques." },
  { name: "Curriculum", description: "Structured rank and program curriculum." },
  {
    name: "Certificates",
    description: "Issuable certificates with public verification codes.",
  },
  { name: "Merch / gear", description: "Storefront with Printful fulfillment." },
]

export const PLANNED_FEATURES: FeatureItem[] = [
  { name: "Deeper lineage", description: "Secondary cross-lineage links and focal choreography." },
  { name: "Member media galleries", description: "Richer per-profile media." },
]

export const CHANGELOG: ChangelogEntry[] = [
  {
    period: "June 2026 — MVP launch",
    items: [
      "Black Belt Legacy launched at blackbeltlegacy.com (June 19): public lineage network, one-click magic-link claims, and live paid Premium/Elite memberships, end to end.",
      "Lifecycle emails went live — including a claimant notification on every claim decision (approve and deny).",
      "Full member roster, member photos, and the Dirty Dozen lineage migrated to production.",
      "Social sign-in now binds and reconciles profile claims the same as magic-link.",
    ],
  },
]
