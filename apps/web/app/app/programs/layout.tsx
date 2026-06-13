import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

export default async function ProgramsLayout({ children }: LayoutProps<"/app/programs">) {
  await requirePermission(APP_AREA_PERMISSIONS.programs)

  return children
}
