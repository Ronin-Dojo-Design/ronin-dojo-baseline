import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

export default async function ScheduleLayout({ children }: LayoutProps<"/app/schedule">) {
  await requirePermission(APP_AREA_PERMISSIONS.schedule)

  return children
}
