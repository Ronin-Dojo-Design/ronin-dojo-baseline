import type { Brand } from "~/.generated/prisma/client"
import { isAdmin } from "~/lib/authz-predicates"
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

// `isAdmin` lives in the db-free `lib/authz-predicates` module (so client components can import it
// without dragging Prisma into the browser bundle) and is re-exported here — server code keeps
// importing it from `~/lib/authz`, one predicate. (SESSION_0495 C2-8.)
export { isAdmin }

// -----------------------------------------------------------------------------
// Brand resolution
// -----------------------------------------------------------------------------

/** Distinct list of brands the user has any membership in. Internal to `isInSameBrand`. */
const getUserBrands = async (userId: string): Promise<Brand[]> => {
  const rows = await db.membership.findMany({
    where: { userId },
    select: { brand: true },
    distinct: ["brand"],
  })
  return rows.map(r => r.brand)
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

