import { z } from "zod"
import { APP_AREA_PERMISSIONS, MEDIA_UPLOAD_PERMISSION } from "~/server/orpc/roles"

export const GRANTABLE_USER_PERMISSION_KEYS = [
  APP_AREA_PERMISSIONS.beta,
  MEDIA_UPLOAD_PERMISSION,
] as const

export type GrantableUserPermissionKey = (typeof GRANTABLE_USER_PERMISSION_KEYS)[number]

export const grantableUserPermissionSchema = z.enum(GRANTABLE_USER_PERMISSION_KEYS)

const GRANTABLE_USER_PERMISSION_META: Record<
  GrantableUserPermissionKey,
  {
    label: string
    description: string
  }
> = {
  [APP_AREA_PERMISSIONS.beta]: {
    label: "Beta preview",
    description: "Access the beta preview workspace without platform admin.",
  },
  [MEDIA_UPLOAD_PERMISSION]: {
    label: "Media upload",
    description: "Use media uploaders without granting media library management.",
  },
}

export const GRANTABLE_USER_PERMISSIONS = GRANTABLE_USER_PERMISSION_KEYS.map(grant => ({
  grant,
  ...GRANTABLE_USER_PERMISSION_META[grant],
}))
