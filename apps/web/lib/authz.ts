import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Authorization helpers — pure where possible, async only where they need a DB lookup.
 *
 * Every API route + server action that touches brand-scoped data should call one of
 * these. The brand-scope Prisma extension at `~/prisma/extensions/brand-scope` is
 * belt-and-suspenders, not a substitute for these checks.
 *
 * See `~/docs/architecture/auth.md` and ADRs 0004 / 0008 for the underlying model.
 */

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type AuthzUser = {
  id: string
  role?: string | null
  lastActiveBrandId?: Brand | null
}

// -----------------------------------------------------------------------------
// Pure checks
// -----------------------------------------------------------------------------

export const isAdmin = (user: AuthzUser | null | undefined): boolean => {
  return user?.role === "admin"
}

// -----------------------------------------------------------------------------
// Brand resolution
// -----------------------------------------------------------------------------

/**
 * Resolve the brand the user is currently working in.
 *
 * Order:
 *   1. `activeBrandCookie` (set by the brand switcher) — if user has a membership
 *      in that brand OR is admin, return it.
 *   2. `user.lastActiveBrandId` — last brand they switched to.
 *   3. The user's only `Membership.brand`, if they have exactly one.
 *   4. `null` — caller decides what to do (typically: redirect to onboarding).
 */
export const getActiveBrandId = async (
  user: AuthzUser,
  activeBrandCookie?: string | null,
): Promise<Brand | null> => {
  const userBrands = await getUserBrands(user.id)

  // (1) Cookie wins if valid for this user.
  if (activeBrandCookie && isBrand(activeBrandCookie)) {
    if (isAdmin(user) || userBrands.includes(activeBrandCookie)) {
      return activeBrandCookie
    }
  }

  // (2) Fall back to the persisted preference.
  if (user.lastActiveBrandId && (isAdmin(user) || userBrands.includes(user.lastActiveBrandId))) {
    return user.lastActiveBrandId
  }

  // (3) If they have exactly one brand membership, that's it.
  if (userBrands.length === 1) {
    return userBrands[0]
  }

  // (4) Multi-brand user with no preference; admin browsing without context.
  return null
}

/** Distinct list of brands the user has any membership in. */
export const getUserBrands = async (userId: string): Promise<Brand[]> => {
  const rows = await db.membership.findMany({
    where: { userId },
    select: { brand: true },
    distinct: ["brand"],
  })
  return rows.map(r => r.brand)
}

/** Should the brand switcher be visible to this user? Per ADR 0008. */
export const shouldShowBrandSwitcher = async (user: AuthzUser): Promise<boolean> => {
  if (isAdmin(user)) return true
  const brands = await getUserBrands(user.id)
  return brands.length > 1
}

// -----------------------------------------------------------------------------
// Resource-level checks
// -----------------------------------------------------------------------------

/** True if user has any membership in the brand, or is an admin. */
export const isInSameBrand = async (user: AuthzUser, brand: Brand): Promise<boolean> => {
  if (isAdmin(user)) return true
  const brands = await getUserBrands(user.id)
  return brands.includes(brand)
}

/**
 * True if user can edit the organization: admin, direct owner, OR active member
 * with OWNER/ORG_ADMIN/INSTRUCTOR at that organization.
 */
export const canEditOrganization = async (
  user: AuthzUser,
  organizationId: string,
): Promise<boolean> => {
  if (isAdmin(user)) return true
  const organization = await db.organization.findFirst({
    where: {
      id: organizationId,
      OR: [
        { ownerId: user.id },
        {
          memberships: {
            some: {
              userId: user.id,
              status: "ACTIVE",
              roleAssignments: {
                some: { role: { code: { in: ["OWNER", "ORG_ADMIN", "INSTRUCTOR"] } } },
              },
            },
          },
        },
      ],
    },
    select: { id: true },
  })
  return Boolean(organization)
}

/**
 * True if user can award ranks at the organization: admin, OR holds INSTRUCTOR/OWNER/COACH
 * role at that organization.
 */
export const canAwardRank = async (user: AuthzUser, organizationId: string): Promise<boolean> => {
  if (isAdmin(user)) return true
  const membership = await db.membership.findFirst({
    where: {
      userId: user.id,
      organizationId,
      roleAssignments: {
        some: { role: { code: { in: ["OWNER", "INSTRUCTOR", "COACH"] } } },
      },
    },
    select: { id: true },
  })
  return Boolean(membership)
}

/** True if user can read the organization's roster: admin, OR any membership at the org. */
export const canViewOrgRoster = async (
  user: AuthzUser,
  organizationId: string,
): Promise<boolean> => {
  if (isAdmin(user)) return true
  const membership = await db.membership.findFirst({
    where: { userId: user.id, organizationId },
    select: { id: true },
  })
  return Boolean(membership)
}

/**
 * True if user can manage merch products for the brand:
 * admin, OR holds OWNER/ORG_ADMIN at any organization in the brand.
 *
 * @see docs/sprints/SESSION_0112.md TASK_06
 */
export const canManageMerch = async (user: AuthzUser, brand: Brand): Promise<boolean> => {
  if (isAdmin(user)) return true
  const membership = await db.membership.findFirst({
    where: {
      userId: user.id,
      brand,
      status: "ACTIVE",
      roleAssignments: {
        some: { role: { code: { in: ["OWNER", "ORG_ADMIN"] } } },
      },
    },
    select: { id: true },
  })
  return Boolean(membership)
}

// -----------------------------------------------------------------------------
// Internal
// -----------------------------------------------------------------------------

const BRANDS = new Set<string>(["RONIN_DOJO_DESIGN", "BASELINE_MARTIAL_ARTS", "BBL", "WEKAF"])

const isBrand = (value: string): value is Brand => BRANDS.has(value)
