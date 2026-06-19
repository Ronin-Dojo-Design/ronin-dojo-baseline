/**
 * Onboarding tier → feature mapping (client-safe, no Prisma import).
 *
 * Baseline-adapted port of BBLApp's `roleTierMapper` (monorepo
 * `src/brands/blackbeltlegacy/utils/roleTierMapper.js`). The monorepo keyed
 * features off a WordPress membership tier; baseline has no per-user tier enum,
 * so {@link resolveOnboardingTier} (server) derives one of these tiers from the
 * account's role + memberships/entitlements and passes it to the onboarding
 * tour. Feature copy uses baseline's ubiquitous language (Passport, Directory,
 * Lineage) rather than the monorepo's hardcoded strings.
 */

export type OnboardingTier = "free" | "premium" | "instructor" | "school_owner" | "admin"

export const TIER_LABELS: Record<OnboardingTier, string> = {
  free: "Free Member",
  premium: "Premium Member",
  instructor: "Instructor",
  school_owner: "School Owner",
  admin: "Administrator",
}

export const TIER_FEATURES: Record<OnboardingTier, string[]> = {
  free: ["Your martial arts Passport", "A public directory profile", "Browse lineage trees"],
  premium: [
    "Everything in Free",
    "Full technique library",
    "Save your favorites",
    "Promotion-history timeline",
  ],
  instructor: [
    "Everything in Premium",
    "Manage students & lineage",
    "Upload photos & videos",
    "Create techniques & events",
  ],
  school_owner: [
    "Everything in Instructor",
    "An organization profile",
    "Multiple instructors",
    "Member management",
  ],
  admin: ["Full platform access", "User & content management", "Brand settings"],
}

// Ordered low → high so we can pick the "next" tier for an upgrade nudge.
const TIER_ORDER: OnboardingTier[] = ["free", "premium", "instructor", "school_owner", "admin"]

export function getTierLabel(tier: OnboardingTier): string {
  return TIER_LABELS[tier] ?? TIER_LABELS.free
}

export function getTierFeatures(tier: OnboardingTier): string[] {
  return TIER_FEATURES[tier] ?? TIER_FEATURES.free
}

export type UpgradeCta = {
  message: string
  targetTier: OnboardingTier
  targetTierLabel: string
}

/**
 * Free members are nudged toward Premium on the final tour step (mirrors the
 * monorepo's role/tier-mismatch upgrade CTA). Paid/staff tiers get the plain
 * "Get Started" close instead.
 */
export function getUpgradeCta(tier: OnboardingTier): UpgradeCta | null {
  if (tier !== "free") return null
  const targetTier: OnboardingTier = "premium"
  const targetTierLabel = getTierLabel(targetTier)
  return {
    message: `Upgrade to ${targetTierLabel} to unlock the full technique library, favorites, and your promotion-history timeline.`,
    targetTier,
    targetTierLabel,
  }
}

const TIER_SET = new Set<OnboardingTier>(TIER_ORDER)

/** Coerce an arbitrary string to a known tier, defaulting to `free`. */
export function normalizeTier(value: string | null | undefined): OnboardingTier {
  if (value && TIER_SET.has(value as OnboardingTier)) return value as OnboardingTier
  return "free"
}
