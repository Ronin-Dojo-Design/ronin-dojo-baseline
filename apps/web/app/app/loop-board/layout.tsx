import type { ReactNode } from "react"
import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

// Admin-gated operator surface (the Loop-of-Loops ledger board). `admin: ["*"]` passes —
// covers Brian + Tony. Same layout-gate convention as the other /app areas.
export default async function Layout({ children }: { children: ReactNode }) {
  await requirePermission(APP_AREA_PERMISSIONS.loopBoard)

  return children
}
