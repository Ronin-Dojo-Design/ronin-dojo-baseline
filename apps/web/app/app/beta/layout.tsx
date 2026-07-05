import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

// Area gate (SESSION_0498 TASK_04): the beta/preview area — in-flight features
// shown LIVE before public GA. `beta.view` is an axis-1 capability key; admin
// `"*"` covers it today, named non-admin testers ride FI-019 override grants
// (authz research-review §FI-019 — a new authz need = a new KEY, never a new
// system). Anonymous → /auth/login; signed-in without the key → /app.
export default async function ({ children }: LayoutProps<"/app/beta">) {
  await requirePermission(APP_AREA_PERMISSIONS.beta)
  return children
}
