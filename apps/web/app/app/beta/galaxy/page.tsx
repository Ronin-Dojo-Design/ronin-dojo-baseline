import { GalaxyRoute } from "~/components/web/lineage/galaxy/galaxy-route"
import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { getBblGalaxyData } from "~/server/web/lineage/galaxy-data"

/**
 * Lineage Galaxy beta preview (SESSION_0523) — the 3D constellation of the
 * VERIFIED public lineage, exposed here before public GA.
 *
 * Reuses the already-built galaxy seam UNCHANGED: `getBblGalaxyData` (server
 * loader → published BBL tree → verified-only graph, or `null` → the viewer's
 * mock fallback) + `GalaxyRoute` (the `ssr:false` client boundary that lazy-loads
 * three.js/R3F). The `beta.view` permission IS the gate — deliberately NOT the
 * `NEXT_PUBLIC_GALAXY_ENABLED` flag on the public `/lineage/galaxy` route, which
 * stays the later GA-promotion path.
 *
 * Verified membership derives from the top non-PENDING `RankEntry` via
 * `memberTrustStatus` (WL-P2-46 / LR 0008), with the beltless-member fallback.
 */
export default async function BetaGalaxyPage() {
  // Defense-in-depth (mirrors `lineage-journey/page.tsx:36`): leaf-segment flight
  // requests don't reliably re-run the parent beta layout gate.
  await requirePermission(APP_AREA_PERMISSIONS.beta)

  const data = await getBblGalaxyData()
  return <GalaxyRoute data={data} />
}
