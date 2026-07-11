import type { Brand, DirectoryVisibility } from "~/.generated/prisma/client"
import { directoryProfileDetailPayload } from "~/server/web/directory/payloads"
import { projectDirectoryDetailProfile } from "~/server/web/directory/profile-projection"
import { getLineageProfileDetailRenderPolicyForUser } from "~/server/web/entitlements/lineage-tier-policy"
import { db } from "~/services/db"

type ProfileViewer = {
  viewerUserId?: string | null
  viewerRole?: string | null
}

/**
 * Find a single directory profile by slug for the detail page.
 *
 * Privacy rules:
 * - HIDDEN profiles → never returned (→ page 404)
 * - MEMBERS_ONLY → only if viewerUserId is provided (authenticated)
 * - PUBLIC → always returned
 * - Per-field flags strip sensitive data at the projection layer
 *
 * @changed SESSION_0502 (TASK_03):
 *  - Single detail fetch (the free-preview branch is gone — a claimed free profile now
 *    renders the full BASIC profile; only rich media is gated, in the projector).
 *  - Claimable-placeholder fallback: a real person whose profile is visible but is NOT under
 *    a published brand-claimable tree resolves via a second slug-only lookup (respecting
 *    visibility) and is returned flagged `isClaimablePlaceholder` → the page renders the claim
 *    teaser instead of a 404. `null` (→ 404) is reserved for genuinely-missing / HIDDEN rows.
 */
export const findProfileBySlug = async ({
  slug,
  brand,
  viewerUserId,
  viewerRole,
}: {
  slug: string
  brand: Brand
} & ProfileViewer) => {
  const allowedVisibility: DirectoryVisibility[] = viewerUserId
    ? ["PUBLIC", "MEMBERS_ONLY"]
    : ["PUBLIC"]

  // Primary lookup: the profile must be under this brand (account-side Membership OR
  // lineage-tree membership — same two paths as the listing, see profile-where.ts).
  let profile = await db.directoryProfile.findFirst({
    where: {
      slug,
      visibility: { in: allowedVisibility },
      passport: {
        OR: [
          { user: { memberships: { some: { organization: { brand } } } } },
          { lineageNode: { treeMembers: { some: { tree: { brand } } } } },
        ],
      },
    },
    select: directoryProfileDetailPayload,
  })

  // Fallback (SESSION_0502): a real, visible person who is NOT in a published brand tree —
  // e.g. an imported placeholder with no tree membership yet. Rather than 404, resolve them
  // by slug alone (still honoring visibility) so the page can render the claim teaser. HIDDEN
  // rows never match either lookup, so they stay 404.
  //
  // ASSUMES single-brand-per-DB (ADR 0038 — each product runs its own database). This slug-only
  // lookup drops the brand filter, so on a shared multi-product DB it could resolve another
  // product's PUBLIC profile on BBL's `/directory/[slug]`. Separate DBs make that unreachable in
  // production; if products are ever co-located in one DB, re-scope this by a brand column.
  if (!profile) {
    profile = await db.directoryProfile.findFirst({
      where: { slug, visibility: { in: allowedVisibility } },
      select: directoryProfileDetailPayload,
    })
  }

  if (!profile) return null

  // Phase 3c: identity is Passport-rooted; `passport.user` is the attached account (null = placeholder).
  const account = profile.passport.user
  const policy = await getLineageProfileDetailRenderPolicyForUser({
    userId: account?.id ?? null,
    brand,
  })

  // Doug LOW-3 (SESSION_0515): thread the resolved `renderPolicy` back as an ADDITIVE sibling so
  // the `loadProfileViewBySlug` loader can reuse it (same userId → identical policy) instead of
  // re-querying `getLineageProfileDetailRenderPolicyForUser`. All gated projection fields are
  // unchanged — this only adds a key existing consumers ignore.
  return {
    ...projectDirectoryDetailProfile({ profile, policy, viewerUserId, viewerRole, brand }),
    renderPolicy: policy,
  }
}
