"use cache"

import { cacheLife, cacheTag } from "next/cache"
import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Check if a user has a specific active entitlement.
 */
export async function hasEntitlement(
  userId: string,
  entitlementKey: string,
  brand: Brand,
): Promise<boolean> {
  cacheTag(`user-entitlements-${userId}`)
  cacheLife("seconds")

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
 * Consolidated into a single DB round-trip using parallel promises.
 * Cached with 60s TTL, invalidated on grant/revoke via `user-entitlements-{userId}` tag.
 */
export async function canUploadMedia(userId: string, brand: Brand): Promise<boolean> {
  cacheTag(`user-entitlements-${userId}`)
  cacheLife("seconds")

  // Run all 3 checks in parallel (single round-trip per check, all concurrent)
  const [entitlementGrant, roleBasedMembership, ownedOrg] = await Promise.all([
    // Check 1: Explicit entitlement grant
    db.userEntitlement.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        entitlement: { key: "S3_UPLOAD", brand },
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      select: { id: true },
    }),
    // Check 2: Role-based — INSTRUCTOR, COACH, OWNER, ORG_ADMIN
    db.membership.findFirst({
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
      select: { id: true },
    }),
    // Check 3: Organization owner
    db.organization.findFirst({
      where: { ownerId: userId, brand },
      select: { id: true },
    }),
  ])

  return !!(entitlementGrant || roleBasedMembership || ownedOrg)
}
