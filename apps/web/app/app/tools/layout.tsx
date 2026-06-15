import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

export default async function Layout({ children }: LayoutProps<"/app/tools">) {
  await requirePermission(APP_AREA_PERMISSIONS.tools)

  return children
}
