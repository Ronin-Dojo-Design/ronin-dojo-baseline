import { cache } from "react"
import type { Brand } from "~/.generated/prisma/client"
import { LINEAGE_ELITE_ENTITLEMENT_KEY } from "~/lib/entitlements/lineage-comp"
import type { SessionUser } from "~/server/orpc/context"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { hasEntitlement } from "~/server/web/entitlements/queries"
import { db as appDb } from "~/services/db"

type AppDb = typeof appDb

/**
 * The staff roles that may author techniques for a school (ADR 0046 D5). Deliberately the tighter
 * OWNER/INSTRUCTOR pair (matching the org-canonical create path), NOT the broader media-authoring set.
 */
const TECHNIQUE_STAFF_ROLES = ["OWNER", "INSTRUCTOR"] as const

/**
 * Can this user AUTHOR a technique? (ADR 0046 D5.) Mirrors `canUploadMediaForUser` — capability-based,
 * not membership-gated. BBL's roster is placeholder Passports via `LineageTree` (no OWNER/INSTRUCTOR
 * `Membership` rows), so the old org-membership-only gate locked EVERY BBL member out of authoring; this
 * opens it to Elite members without inventing a 5th authz system — it composes the three existing seams:
 *   1. `can()` RBAC — platform `techniques.manage` (admin via the `*` grant).
 *   2. Staff role — an active OWNER/INSTRUCTOR `Membership` in this brand.
 *   3. Elite entitlement — an active `LINEAGE_ELITE` grant (paid or comped).
 *
 * `database` is injectable so the create path can thread its transaction/mock db for hermetic tests;
 * production callers use the global client (matching `canUploadMediaForUser`).
 *
 * @changed SESSION_0529 review fix (perf): (1) React `cache()`-wrapped — the MobileShell mount
 * predicate + page-level checks (techniques tab, posts-page FAB gate) resolve this on the SAME
 * request, so per-request memoization collapses them to one lookup (keyed by arg identity;
 * `getServerSession` is itself request-cached, so `user` is reference-stable within a request).
 * (2) The CACHED entitlement leg (`hasEntitlement`, cross-request "use cache") now runs BEFORE the
 * uncached membership query, so the common hot path (Elite member, no staff role) skips the
 * per-request DB roundtrip. Same three OR'd legs — order only, no behavior change.
 */
export const canCreateTechniqueForUser = cache(
  async (user: SessionUser, brand: Brand, database: AppDb = appDb): Promise<boolean> => {
    if (can(user, APP_AREA_PERMISSIONS.techniques)) {
      return true
    }

    if (await hasEntitlement(user.id, LINEAGE_ELITE_ENTITLEMENT_KEY, brand)) {
      return true
    }

    const staff = await database.membership.findFirst({
      where: {
        userId: user.id,
        brand,
        status: "ACTIVE",
        roleAssignments: { some: { role: { code: { in: [...TECHNIQUE_STAFF_ROLES] } } } },
      },
      select: { id: true },
    })
    return Boolean(staff)
  },
)
