import { BottomNav } from "~/components/web/nav/bottom-nav"
import { Mab } from "~/components/web/nav/mab"
import { shouldMountMab } from "~/components/web/nav/mab-mount"
import { isAdmin } from "~/lib/authz-predicates"
import { getServerSession } from "~/lib/auth"
import { Brand } from "~/.generated/prisma/client"
import { can } from "~/server/orpc/permissions"
import { canCreateCommunityPostForUser } from "~/server/web/community/permissions"
import { findApprovedStyleOptions } from "~/server/web/community/queries"
import { canCreateTechniqueForUser } from "~/server/web/techniques/permissions"

/**
 * MobileShell — the B0/B1 server wrapper that mounts the mobile chrome (SESSION_0500).
 *
 * Resolves the session + `can()` permissions SERVER-SIDE (so `SessionUser`/`can()` never
 * enter the client bundle — the Sidebar precedent) and passes plain booleans to the client
 * `Mab`. The `BottomNav` is LOGGED-IN-only (it self-gates on the client via `useSession` and
 * renders nothing for guests).
 *
 * @changed SESSION_0529 (Slice 3B) — the MAB mount is no longer admin-only: it also mounts for
 * any user passing `canCreateTechniqueForUser` (Elite / staff / RBAC), who gets (typically) a
 * one-action fan. The four pre-existing actions stay ADMIN-gated exactly as before (`admin &&
 * can(...)`) so broadening the mount does not broaden them.
 *
 * Mounted once PER layout tree (v2, SESSION_0500): in the `(web)` public layout AND the `/app`
 * console layout, so a signed-in member keeps the bottom nav across both. Not hoisted to the
 * root layout — that would add a session + Passport query to every request (incl. `/admin`)
 * and put member chrome on the admin task-board surface. Everything it renders is `md:hidden`,
 * so desktop is untouched.
 */
export const MobileShell = async ({ userAvatarUrl }: { userAvatarUrl?: string | null }) => {
  const session = await getServerSession()
  const user = session?.user ?? null

  const admin = isAdmin(user)

  // Authoring capability (SESSION_0529 Slice 3B): RBAC `techniques.manage` short-circuits via
  // `can()` before any DB hit (admins pay nothing extra); members resolve staff-role/entitlement.
  const technique = user != null && (await canCreateTechniqueForUser(user, Brand.BBL))

  // Community-post capability (FI-028): the post action is no longer admin-only — it opens to any
  // member passing `canCreateCommunityPostForUser` (Premium / Elite / Legend / staff / RBAC). Free
  // members lose it (the ONE intended behavior change). Request-cached, so this shares the same
  // lookup `shouldMountMab` and the `/posts` page resolve.
  const post = user != null && (await canCreateCommunityPostForUser(user, Brand.BBL))

  const permissions = {
    // The other three B1 actions stay admin-only (operator, B1) — each additionally can()-gated;
    // under today's flat roles all three are admin-only, but the per-action gate keeps the widening
    // path honest (promotion path documented in lib/mab-preferences.ts).
    claim: admin && can(user, "claims.manage"),
    post,
    upload: admin && can(user, "media.manage"),
    promotion: admin && can(user, "tournaments.manage"),
    technique,
  }

  // THE shared mount predicate (SESSION_0529 review fix, Doug P2-3) — ≡ (admin ∨
  // permissions.technique) by construction, and the community feed hides its own mobile FAB off
  // the same helper, so the two create-affordances can never collide at the shared corner.
  // `canCreateTechniqueForUser` is request-cached, so this re-check costs no extra lookup.
  const showMab = await shouldMountMab(user)

  const anyMabAction =
    permissions.claim ||
    permissions.post ||
    permissions.upload ||
    permissions.promotion ||
    permissions.technique

  // Only fetch the community styles (for the Create-Post dialog) when the MAB will render its
  // post action — signed-out / non-admin visitors skip the query.
  const postStyles = permissions.post ? await findApprovedStyleOptions() : []

  return (
    <>
      <BottomNav userAvatarUrl={userAvatarUrl} />

      {showMab && anyMabAction && <Mab permissions={permissions} postStyles={postStyles} />}
    </>
  )
}
