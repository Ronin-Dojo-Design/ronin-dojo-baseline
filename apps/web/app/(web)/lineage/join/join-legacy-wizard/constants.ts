import type { JoinLegacyFormValues } from "./schema"

export const bblPortalFontClass = "[font-family:var(--font-bbl-body),system-ui,sans-serif]"
export const bblHeadingClass =
  "[font-family:var(--font-bbl-heading),system-ui,sans-serif] font-extrabold uppercase italic tracking-[0.02em]"

export const roleLabels: Record<JoinLegacyFormValues["role"], string> = {
  STUDENT: "Student / practitioner",
  BLACK_BELT: "Black belt",
  INSTRUCTOR: "Instructor",
  SCHOOL_OWNER: "School owner",
  OTHER: "Other / representative",
}

export const goalLabels: Record<JoinLegacyFormValues["primaryGoal"], string> = {
  CLAIM_PROFILE: "Claim my legacy profile",
  PRESERVE_LINEAGE: "Preserve lineage history",
  PROMOTE_SCHOOL: "Represent my school",
  CONNECT_COMMUNITY: "Connect with the BJJ community",
  EXPLORE: "Explore Black Belt Legacy",
}

export const discoveryLabels: Record<JoinLegacyFormValues["discoverySource"], string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  GOOGLE: "Google/search",
  FRIEND: "Friend or teammate",
  INSTRUCTOR: "Instructor or school",
  EVENT: "Event or seminar",
  OTHER: "Other",
}

export const pathCards: Array<{
  value: JoinLegacyFormValues["membershipPath"]
  title: string
  eyebrow: string
  description: string
  bullets: string[]
}> = [
  {
    value: "FREE",
    title: "Free profile",
    eyebrow: "Start verified",
    description: "Submit your lineage, profile, and claim intent for steward review.",
    bullets: ["Private steward review", "Claimable Passport intake", "Upgrade later"],
  },
  {
    value: "PREMIUM",
    title: "Premium lineage membership",
    eyebrow: "Most popular",
    description: "Save the same review intake, then choose a paid lineage membership tier.",
    bullets: ["Enhanced profile", "Lineage membership checkout", "Built for active practitioners"],
  },
  {
    value: "ELITE",
    title: "Elite lineage support",
    eyebrow: "Schools & leaders",
    description: "For instructors, academies, and multi-generation legacy stewardship.",
    bullets: ["School-friendly intake", "Legacy support", "Priority steward context"],
  },
]

export const STEP_META = [
  { id: "path", label: "Path", title: "Choose your path" },
  { id: "identity", label: "Identity", title: "Tell us who you are" },
  { id: "lineage", label: "Lineage", title: "Share your legacy" },
] as const
