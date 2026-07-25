/**
 * Node-side wrapper for the org-claim DB bridge (WL-P2-13, SESSION_0696).
 * Mirrors the seed-belt-review helper shape: one `execFileSync("bun", …)` hop
 * because the generated Prisma client only imports cleanly under Bun.
 */
import { execFileSync } from "node:child_process"
import type { OrgClaimState } from "./org-claim-db"

export type { OrgClaimState } from "./org-claim-db"

/** Read the newest claim (id + status) for (org, claimant) and the org's current ownerId. */
export function readOrgClaimState(orgId: string, claimantUserId: string): OrgClaimState {
  const payload = Buffer.from(JSON.stringify({ orgId, claimantUserId }), "utf-8").toString("base64")
  const raw = execFileSync("bun", ["e2e/helpers/org-claim-db.ts", "read-state", payload], {
    cwd: process.cwd(),
    encoding: "utf-8",
  })

  return JSON.parse(raw) as OrgClaimState
}
