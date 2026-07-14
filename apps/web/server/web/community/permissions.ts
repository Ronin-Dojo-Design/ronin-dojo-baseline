import { cache } from "react"
import type { Brand } from "~/.generated/prisma/client"
import { LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS } from "~/lib/entitlements/lineage-tier-policy"
import type { SessionUser } from "~/server/orpc/context"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { db as appDb } from "~/services/db"

type AppDb = typeof appDb

/**
 * The staff roles that may create community posts for a brand. Deliberately the tighter
 * OWNER/INSTRUCTOR pair (matching `canCreateTechniqueForUser`), NOT the broader media-authoring set.
 */
const COMMUNITY_POST_STAFF_ROLES = ["OWNER", "INSTRUCTOR"] as const

/**
 * Can this user CREATE a community post? (FI-028 — the participation-ladder CREATE gate.)
 *
 * Participation ladder (operator-ratified SESSION_0535): Free = READ posts · Premium = CREATE posts
 * · Elite = AUTHOR techniques. This tightens community-post CREATE from "any signed-in member" to
 * Premium ∨ Elite ∨ Legend ∨ staff ∨ RBAC/admin — free members lose post-creation (the ONE intended
 * behavior change; grandfather is forward-only, existing posts stay published). Mirrors the shape of
 * `canCreateTechniqueForUser` — it composes the SAME three existing seams (NOT a 5th authz system),
 * though the entitlement leg here is a direct per-request query, not the technique gate's
 * cross-request-cached `hasEntitlement`:
 *   1. `can()` RBAC — platform `posts.manage` (admin via the `*` grant).
 *   2. ANY lineage-tier entitlement — an active `LINEAGE_PREMIUM` / `LINEAGE_ELITE` / `LINEAGE_LEGEND`
 *      grant. The tier-key SET (not a PREMIUM-only check) is deliberate: paid Elite/Legend keys are
 *      written from `PricingPlan.entitlementGrants` (DB-configured) and are NOT code-guaranteed to
 *      also carry PREMIUM, so checking the whole ladder set (`LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS`)
 *      is the robust gate.
 *   3. Staff role — an active OWNER/INSTRUCTOR `Membership` in this brand.
 *
 * `database` is injectable (default global client) so callers can thread a transaction/mock db for
 * hermetic tests — matching `canCreateTechniqueForUser`.
 *
 * `cache()`-wrapped: the `MobileShell` mount predicate + `/posts` page FAB gate + the composer's
 * `canCreate` prop all resolve this on the SAME request, so per-request memoization collapses them to
 * one lookup (keyed by arg identity; `getServerSession` is request-cached, so `user` is
 * reference-stable within a request). The entitlement leg runs BEFORE the membership query, so the
 * common hot path (a paid member with no staff role) matches on the first query and skips the second
 * DB roundtrip — the same ordering rationale as the technique gate (both legs here are per-request
 * DB reads, not a cross-request cache).
 */
export const canCreateCommunityPostForUser = cache(
  async (user: SessionUser, brand: Brand, database: AppDb = appDb): Promise<boolean> => {
    if (can(user, APP_AREA_PERMISSIONS.posts)) {
      return true
    }

    const now = new Date()

    const tierGrant = await database.userEntitlement.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
        entitlement: {
          brand,
          key: { in: [...LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS] },
        },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      select: { id: true },
    })
    if (tierGrant) {
      return true
    }

    const staff = await database.membership.findFirst({
      where: {
        userId: user.id,
        brand,
        status: "ACTIVE",
        roleAssignments: { some: { role: { code: { in: [...COMMUNITY_POST_STAFF_ROLES] } } } },
      },
      select: { id: true },
    })
    return Boolean(staff)
  },
)
