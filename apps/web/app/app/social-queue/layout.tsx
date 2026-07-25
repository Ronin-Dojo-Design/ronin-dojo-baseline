import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

/**
 * Authoritative gate for the social approval-queue (SESSION_0686) — the belt-reviews idiom:
 * the segment layout gates the queue on `social-queue.manage` (admin `"*"` covers it; a future
 * VA arrives via an FI-019 per-user override grant, never a role widening).
 */
export default async function ({ children }: LayoutProps<"/app/social-queue">) {
  await requirePermission(APP_AREA_PERMISSIONS.socialQueue)
  return children
}
