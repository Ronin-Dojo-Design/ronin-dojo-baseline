import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

export default async function ({ children }: LayoutProps<"/app/content">) {
  await requirePermission(APP_AREA_PERMISSIONS.content)
  return children
}
