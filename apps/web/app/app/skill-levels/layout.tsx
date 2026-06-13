import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

export default async function SkillLevelsLayout({ children }: LayoutProps<"/app/skill-levels">) {
  await requirePermission(APP_AREA_PERMISSIONS.skillLevels)

  return children
}
