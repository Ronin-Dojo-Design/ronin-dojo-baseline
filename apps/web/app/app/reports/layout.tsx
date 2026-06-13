import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

export default async function ({ children }: LayoutProps<"/app/reports">) {
  await requirePermission(APP_AREA_PERMISSIONS.reports)
  return children
}
