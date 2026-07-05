import { BottomNav } from "~/components/web/nav/bottom-nav"
import { Mab } from "~/components/web/nav/mab"
import { isAdmin } from "~/lib/authz-predicates"
import { getServerSession } from "~/lib/auth"
import { can } from "~/server/orpc/permissions"
import { findApprovedStyleOptions } from "~/server/web/community/queries"

/**
 * MobileShell — the B0/B1 server wrapper that mounts the mobile chrome (SESSION_0500).
 *
 * Resolves the session + `can()` permissions SERVER-SIDE (so `SessionUser`/`can()` never
 * enter the client bundle — the Sidebar precedent) and passes plain booleans to the client
 * `Mab`. The `BottomNav` is always mounted (session-aware on the client via `useSession`);
 * the `Mab` is ADMIN-ONLY for now and only mounted when the admin has at least one permitted
 * action.
 *
 * Mounted once in `(web)/layout`. Everything it renders is `md:hidden`, so desktop is
 * untouched.
 */
export const MobileShell = async ({ userAvatarUrl }: { userAvatarUrl?: string | null }) => {
  const session = await getServerSession()
  const user = session?.user ?? null

  // ADMIN-ONLY gate for the whole MAB (operator, B1). Each action is additionally can()-gated;
  // under today's flat roles all four are admin-only, but the per-action gate keeps the
  // widening path honest (promotion path documented in lib/mab-preferences.ts).
  const showMab = isAdmin(user)

  const permissions = {
    claim: showMab && can(user, "claims.manage"),
    post: showMab && can(user, "posts.manage"),
    upload: showMab && can(user, "media.manage"),
    promotion: showMab && can(user, "tournaments.manage"),
  }

  const anyMabAction =
    permissions.claim || permissions.post || permissions.upload || permissions.promotion

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
