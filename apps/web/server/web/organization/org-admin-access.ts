"use server"

import { db } from "~/services/db"

/**
 * Check if a user has admin access to an organization.
 * Authorized = org owner OR has a membership with ORG_ADMIN role.
 *
 * @returns `true` if authorized, `false` otherwise.
 */
export async function hasOrgAdminAccess(userId: string, organizationId: string): Promise<boolean> {
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
