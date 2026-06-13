import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

export default async function ({ children }: LayoutProps<"/app/posts">) {
  await requirePermission(APP_AREA_PERMISSIONS.posts)
  return children
}
