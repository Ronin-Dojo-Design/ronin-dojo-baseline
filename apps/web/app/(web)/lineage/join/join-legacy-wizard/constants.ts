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
    description: "Submit your lineage, profile, and claim intent for steward review at no cost.",
    bullets: ["Free to start", "Private steward review", "Upgrade later"],
  },
  {
    value: "PREMIUM",
    title: "Premium Member — $35/year",
    eyebrow: "Full profile",
    description: "Complete the intake first, then continue to the $35/year Premium checkout.",
    bullets: ["Enhanced profile", "Annual membership", "Built for active practitioners"],
  },
  {
    value: "ELITE",
    title: "Elite Member — $65/year",
    eyebrow: "Schools & leaders",
    description:
      "For instructors, school owners, and legacy stewards. Verified BJJ black belts can use the $45/year Elite rate.",
    bullets: ["School-friendly intake", "Priority steward context", "$45/year black-belt rate"],
  },
]

export const STEP_META = [
  { id: "path", label: "Path", title: "Choose your path" },
  { id: "identity", label: "Identity", title: "Tell us who you are" },
  { id: "lineage", label: "Lineage", title: "Share your legacy" },
] as const
