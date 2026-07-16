import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

/** Authoritative gate for the belt-review queue and every addressable review detail. */
export default async function ({ children }: LayoutProps<"/app/belt-reviews">) {
  await requirePermission(APP_AREA_PERMISSIONS.beltReviews)
  return children
}
