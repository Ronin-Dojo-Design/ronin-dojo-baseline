import type { Brand } from "~/.generated/prisma/client"
import type { SessionUser } from "~/server/orpc/context"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS, MEDIA_UPLOAD_PERMISSION } from "~/server/orpc/roles"
import { canUploadMedia } from "~/server/web/entitlements/queries"

export async function canUploadMediaForUser(user: SessionUser, brand: Brand): Promise<boolean> {
  return (
    can(user, MEDIA_UPLOAD_PERMISSION) ||
    can(user, APP_AREA_PERMISSIONS.media) ||
    (await canUploadMedia(user.id, brand))
  )
}
