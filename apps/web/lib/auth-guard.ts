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
 * management areas of `/app`. Admits a user who either holds `permission` via
 * flat roles (admin `"*"`) OR has an active **TREE_ADMIN** `LineageTreeAccess`
 * grant — exact parity with the legacy `/admin` gate (`hasLineageAdminAccess` /
 * `withLineageAdminPage`, both TREE_ADMIN-only). Unlike the legacy shell,
 * grantees get ONLY the lineage area, not the whole dashboard.
 *
 * Branch/node-scoped editor roles (BRANCH_EDITOR / NODE_EDITOR / TREE_EDITOR)
 * do NOT enter the management area today (same as legacy); they gain their own
 * scoped surfaces via `canForResource` as Phases 4/6 land — broaden the grant
 * filter here only alongside those surfaces.
 */
export const requireLineageAccess = async (
  permission: Permission = "lineage.manage",
): Promise<SessionUser> => {
  const user = await requireUser()

  if (can(user, permission)) {
    return user
  }

  const grant = await db.lineageTreeAccess.findFirst({
    where: { userId: user.id, role: "TREE_ADMIN", revokedAt: null },
    select: { id: true },
  })

  if (!grant) {
    redirect("/app")
  }

  return user
}

/**
 * Non-redirecting variant for nav/sidebar visibility: does this user have an
 * active TREE_ADMIN lineage grant? Pairs with `can()` so the sidebar shows the
 * lineage section to exactly the users `requireLineageAccess` admits.
 */
export const hasAnyLineageGrant = async (userId: string): Promise<boolean> => {
  const grant = await db.lineageTreeAccess.findFirst({
    where: { userId, role: "TREE_ADMIN", revokedAt: null },
    select: { id: true },
  })

  return grant !== null
}
