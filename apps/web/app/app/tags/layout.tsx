import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

export default async function Layout({ children }: LayoutProps<"/app/tags">) {
  await requirePermission(APP_AREA_PERMISSIONS.tags)

  return children
}
