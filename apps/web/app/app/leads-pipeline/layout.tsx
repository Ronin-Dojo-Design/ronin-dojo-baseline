import type { ReactNode } from "react"
import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

// The BBL Lead Pipeline (Slice 6). Same layout-gate convention as the other /app
// areas — `leads.manage` (admin `["*"]` passes; covers Brian + Tony).
export default async function Layout({ children }: { children: ReactNode }) {
  await requirePermission(APP_AREA_PERMISSIONS.leads)

  return children
}
