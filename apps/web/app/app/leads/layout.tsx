import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

export default async function ({ children }: LayoutProps<"/app/leads">) {
  await requirePermission(APP_AREA_PERMISSIONS.leads)
  return children
}
