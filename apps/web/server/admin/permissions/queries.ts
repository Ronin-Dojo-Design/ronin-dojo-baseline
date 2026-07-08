import {
  GRANTABLE_USER_PERMISSION_KEYS,
  GRANTABLE_USER_PERMISSIONS,
  type GrantableUserPermissionKey,
} from "~/server/admin/permissions/grantable"
import { db } from "~/services/db"

export type UserPermissionGrantState = {
  grant: GrantableUserPermissionKey
  label: string
  description: string
  isGranted: boolean
  grantedAt: Date | null
  grantedByName: string | null
  reason: string | null
}

export async function findUserPermissionGrantStates(
  userId: string,
): Promise<UserPermissionGrantState[]> {
  const grants = await db.userPermissionGrant.findMany({
    where: {
      userId,
      grant: { in: [...GRANTABLE_USER_PERMISSION_KEYS] },
      revokedAt: null,
    },
    select: {
      grant: true,
      reason: true,
      createdAt: true,
      grantedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const grantByKey = new Map(grants.map(grant => [grant.grant, grant]))

  return GRANTABLE_USER_PERMISSIONS.map(permission => {
    const activeGrant = grantByKey.get(permission.grant)
    if (activeGrant) {
      const grantedBy = activeGrant.grantedBy
      return {
        ...permission,
        isGranted: true,
        grantedAt: activeGrant.createdAt,
        grantedByName: grantedBy ? grantedBy.name || grantedBy.email : null,
        reason: activeGrant.reason,
      }
    }

    return {
      ...permission,
      isGranted: false,
      grantedAt: null,
      grantedByName: null,
      reason: null,
    }
  })
}
