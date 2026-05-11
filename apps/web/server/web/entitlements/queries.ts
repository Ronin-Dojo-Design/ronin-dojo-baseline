"use server"

import { db } from "~/services/db"
import type { Brand } from "~/.generated/prisma/client"

/**
 * Check if a user has a specific active entitlement.
 */
export async function hasEntitlement(
  userId: string,
  entitlementKey: string,
  brand: Brand,
): Promise<boolean> {
  const grant = await db.userEntitlement.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      entitlement: { key: entitlementKey, brand },
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
    },
  })
  return !!grant
}

/**
 * Check if a user can upload media (S3).
 *
 * Returns true if ANY of:
 * 1. User has an active S3_UPLOAD UserEntitlement (manual admin grant or subscription)
 * 2. User has an active Membership with a role of INSTRUCTOR, COACH, OWNER, or ORG_ADMIN
 * 3. User owns an Organization in this brand
 *
 * Tier-based auto-grant (premium/elite/legend) requires pricing plan / subscription
 * integration — deferred until Stripe webhook wiring in a future session.
 */
export async function canUploadMedia(
  userId: string,
  brand: Brand,
): Promise<boolean> {
  // Check 1: Explicit entitlement grant
  const hasGrant = await hasEntitlement(userId, "S3_UPLOAD", brand)
  if (hasGrant) return true

  // Check 2: Role-based — INSTRUCTOR, COACH, OWNER, ORG_ADMIN
  const roleBasedMembership = await db.membership.findFirst({
    where: {
      userId,
      brand,
      status: "ACTIVE",
      roleAssignments: {
        some: {
          role: {
            code: { in: ["INSTRUCTOR", "COACH", "OWNER", "ORG_ADMIN"] },
          },
        },
      },
    },
  })
  if (roleBasedMembership) return true

  // Check 3: Organization owner
  const ownedOrg = await db.organization.findFirst({
    where: { ownerId: userId, brand },
  })
  if (ownedOrg) return true

  return false
}
