import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

export default async function ({ children }: LayoutProps<"/app/brand-settings">) {
  await requirePermission(APP_AREA_PERMISSIONS.brandSettings)
  return children
}
