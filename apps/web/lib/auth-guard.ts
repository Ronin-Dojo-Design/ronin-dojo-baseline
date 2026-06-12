import { redirect } from "next/navigation"
import { getServerSession } from "~/lib/auth"
import type { SessionUser } from "~/server/orpc/context"
import { can } from "~/server/orpc/permissions"
import type { Permission } from "~/server/orpc/roles"
import { db } from "~/services/db"

/**
 * Authoritative auth check for Server Components — the non-bypassable counterpart
 * to the proxy's optimistic cookie redirect. Resolves the session and redirects
 * anonymous callers to the login page, returning a guaranteed non-null user.
 *
 * Use it at the top of any `/app` layout or page that requires a signed-in user.
 */
export const requireUser = async (): Promise<SessionUser> => {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/login")
  }

  return session.user
}

/**
 * Authoritative permission gate for an `/app` route segment. Requires a signed-in
 * user holding `permission`, redirecting anyone who lacks it back to the dashboard
 * index. Authorization is evaluated by the same `can()` used everywhere else, so
 * the route guard and the procedure/UI gates share a single source of truth.
 *
 * @example
 *   // app/app/users/layout.tsx
 *   export default async function ({ children }: LayoutProps<"/app/users">) {
 *     await requirePermission("users.manage")
 *     return children
 *   }
 */
export const requirePermission = async (permission: Permission): Promise<SessionUser> => {
  const user = await requireUser()

  if (!can(user, permission)) {
    redirect("/app")
  }

  return user
}

/**
 * Ronin delta (SOT-ADR D4/D5, SESSION_0365 grill option b): gate for the lineage
 * areas of `/app`. Admits a user who either holds `permission` via flat roles
 * (admin `"*"`) OR has ANY active `LineageTreeAccess` grant — a TREE_ADMIN /
 * TREE_EDITOR / BRANCH_EDITOR / NODE_EDITOR steward must reach the lineage
 * management surfaces without a global role. Which trees/branches/nodes they may
 * actually touch inside those surfaces is enforced per-action (and, as entity
 * routers migrate, per-procedure via `canForResource`) — this guard only scopes
 * the SHELL: grantees get the lineage area, not the whole dashboard (fixes the
 * legacy `/admin` looseness where any grantee saw every area).
 */
export const requireLineageAccess = async (
  permission: Permission = "lineage.manage",
): Promise<SessionUser> => {
  const user = await requireUser()

  if (can(user, permission)) {
    return user
  }

  const grant = await db.lineageTreeAccess.findFirst({
    where: { userId: user.id, revokedAt: null },
    select: { id: true },
  })

  if (!grant) {
    redirect("/app")
  }

  return user
}

/**
 * Non-redirecting variant for nav/sidebar visibility: does this user have any
 * active lineage grant? Pairs with `can()` so the sidebar can show the lineage
 * section to grantees the same way `requireLineageAccess` admits them.
 */
export const hasAnyLineageGrant = async (userId: string): Promise<boolean> => {
  const grant = await db.lineageTreeAccess.findFirst({
    where: { userId, revokedAt: null },
    select: { id: true },
  })

  return grant !== null
}
