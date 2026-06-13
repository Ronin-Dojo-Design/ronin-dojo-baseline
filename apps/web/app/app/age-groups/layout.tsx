import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

export default async function AgeGroupsLayout({ children }: LayoutProps<"/app/age-groups">) {
  await requirePermission(APP_AREA_PERMISSIONS.ageGroups)

  return children
}
