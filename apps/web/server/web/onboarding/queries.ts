import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"
import type { OnboardingTier } from "~/components/web/onboarding/tier-features"

export type OnboardingState = {
  /** Derived membership tier driving the tour's feature list + upgrade nudge. */
  tier: OnboardingTier
  /** The account's Passport avatar URL, if any (prefills the wizard). */
  avatarUrl: string | null
  /** Whether the account's Passport already has an avatar. */
  hasAvatar: boolean
  /** Whether the account's Passport already has at least one rank award. */
  hasRank: boolean
}

/**
 * Resolve everything the onboarding surfaces need in a single round-trip.
 *
 * Baseline has no per-user "tier" column (the monorepo's WordPress membership
 * tier), so we derive one from the same signals `canUploadMedia` uses — account
 * role, ACTIVE membership role codes, and organization ownership — mapped to the
 * tiers in `tier-features.ts`. The Passport flags let the profile-enhancement
 * wizard auto-open only for genuinely incomplete profiles.
 */
export async function getOnboardingState({
  userId,
  role,
  brand,
}: {
  userId: string
  role: string | null | undefined
  brand: Brand
}): Promise<OnboardingState> {
  const [passport, ownerMembership, instructorMembership, ownedOrg, rankCount] = await Promise.all([
    db.passport.findUnique({
      where: { userId },
      select: { avatarUrl: true },
    }),
    db.membership.findFirst({
      where: {
        userId,
        brand,
        status: "ACTIVE",
        roleAssignments: { some: { role: { code: { in: ["OWNER", "ORG_ADMIN"] } } } },
      },
      select: { id: true },
    }),
    db.membership.findFirst({
      where: {
        userId,
        brand,
        status: "ACTIVE",
        roleAssignments: { some: { role: { code: { in: ["INSTRUCTOR", "COACH"] } } } },
      },
      select: { id: true },
    }),
    db.organization.findFirst({ where: { ownerId: userId, brand }, select: { id: true } }),
    db.passport
      .findUnique({ where: { userId }, select: { _count: { select: { rankAwardsEarned: true } } } })
      .then(p => p?._count.rankAwardsEarned ?? 0),
    // Cheap fallback: any ACTIVE membership at all → at least "premium".
  ])

  const hasActiveMembership =
    !!ownerMembership ||
    !!instructorMembership ||
    !!(await db.membership.findFirst({
      where: { userId, brand, status: "ACTIVE" },
      select: { id: true },
    }))

  let tier: OnboardingTier = "free"
  if (role === "admin") {
    tier = "admin"
  } else if (ownerMembership || ownedOrg) {
    tier = "school_owner"
  } else if (instructorMembership) {
    tier = "instructor"
  } else if (hasActiveMembership) {
    tier = "premium"
  }

  return {
    tier,
    avatarUrl: passport?.avatarUrl ?? null,
    hasAvatar: !!passport?.avatarUrl,
    hasRank: rankCount > 0,
  }
}
