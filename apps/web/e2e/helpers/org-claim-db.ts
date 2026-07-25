/**
 * Bun-only DB bridge for the org-claim loop spec (WL-P2-13, SESSION_0696).
 *
 * Read-only state probe: the spec seeds through the shared auth helpers
 * (`createTestUser` / `createTestOrg`) and asserts DB truth here — the claim
 * row's status plus the org's `ownerId` (the approval side-effect under test).
 * Playwright runs in Node while the generated Prisma client imports cleanly
 * under Bun, so this follows the auth-db / seed-*-db CLI-bridge pattern.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"
import { assertLiteralLocalE2eUrls } from "../../scripts/e2e-db-env"

assertLiteralLocalE2eUrls(process.env.DATABASE_URL, process.env.DIRECT_URL, {
  isCi: process.env.CI === "true",
})
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export type OrgClaimState = {
  claim: { id: string; status: string } | null
  orgOwnerId: string | null
}

const decodePayload = <T>(): T | undefined => {
  const encoded = process.argv[3]
  if (!encoded) return undefined
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8")) as T
}

async function readState(payload: {
  orgId: string
  claimantUserId: string
}): Promise<OrgClaimState> {
  const [claim, org] = await Promise.all([
    prisma.profileClaimRequest.findFirst({
      where: { organizationId: payload.orgId, claimantUserId: payload.claimantUserId },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true },
    }),
    prisma.organization.findUnique({
      where: { id: payload.orgId },
      select: { ownerId: true },
    }),
  ])

  return { claim, orgOwnerId: org?.ownerId ?? null }
}

const command = process.argv[2]

if (command === "read-state") {
  const payload = decodePayload<{ orgId: string; claimantUserId: string }>()
  if (!payload?.orgId || !payload.claimantUserId) throw new Error("Missing orgId/claimantUserId")

  process.stdout.write(JSON.stringify(await readState(payload)))
} else {
  throw new Error(`Unknown org-claim-db command: ${command ?? "<missing>"}`)
}
