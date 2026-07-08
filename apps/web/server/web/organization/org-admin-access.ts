"use server"

import { isAdmin } from "~/lib/authz-predicates"
import { db } from "~/services/db"

/**
 * Check if a user has admin access to an organization.
 * Authorized = platform admin (role "admin") OR org owner OR an ORG_ADMIN membership.
 *
 * Platform admins manage every org (operator directive, SESSION_0448) — without this,
 * a platform admin is denied self-service org settings for orgs they didn't personally
 * own/ORG_ADMIN (e.g. the WP-imported orgs whose `ownerId` is null).
 *
 * @returns `true` if authorized, `false` otherwise.
 */
export async function hasOrgAdminAccess(userId: string, organizationId: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } })
  // Deliberate platform-admin short-circuit (SESSION_0448) across axis 3 — route it
  // through the `isAdmin()` identity predicate, NOT a new `can()` key (authz-conformance
  // sweep item 3). Behavior preserved: platform admins manage every org.
  if (isAdmin(user)) return true

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { ownerId: true },
  })

  if (!org) return false
  if (org.ownerId === userId) return true

  const adminMembership = await db.membership.findFirst({
    where: {
      userId,
      organizationId,
      roleAssignments: {
        some: { role: { code: "ORG_ADMIN" } },
      },
    },
  })

  return !!adminMembership
}

/**
 * Assert admin access — throws if not authorized.
 * Use in server actions where you want to abort on unauthorized.
 */
export async function assertOrgAdminAccess(userId: string, organizationId: string): Promise<void> {
  const authorized = await hasOrgAdminAccess(userId, organizationId)
  if (!authorized) {
    throw new Error("ACCESS_DENIED")
  }
}
