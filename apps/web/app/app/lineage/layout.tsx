import { requireLineageAccess } from "~/lib/auth-guard"

// Area gate (SESSION_0365 grill option b): admin via `lineage.manage` ("*")
// OR an active TREE_ADMIN LineageTreeAccess grant — exact parity with the
// legacy /admin lineage gate, but scoped to THIS area only.
export default async function ({ children }: LayoutProps<"/app/lineage">) {
  await requireLineageAccess()
  return children
}
