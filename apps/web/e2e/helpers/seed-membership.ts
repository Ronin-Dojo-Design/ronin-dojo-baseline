/**
 * Playwright membership seed helper — Node-side shim.
 *
 * Playwright runs this file in Node, but the generated Prisma TS client needs
 * Bun. DB work is shelled out to `seed-membership-db.ts` via a Bun CLI bridge
 * (same pattern as `auth.ts` → `auth-db.ts`).
 */
import { execFileSync } from "node:child_process"

export interface MembershipFixture {
  organizationId: string
  disciplineId: string
  membershipId: string
  roleId: string
}

function runMembershipDbCommand<T>(command: string, payload?: unknown): T {
  const args = ["e2e/helpers/seed-membership-db.ts", command]

  if (payload !== undefined) {
    args.push(Buffer.from(JSON.stringify(payload), "utf-8").toString("base64"))
  }

  const raw = execFileSync("bun", args, {
    cwd: process.cwd(),
    encoding: "utf-8",
  })

  return raw ? (JSON.parse(raw) as T) : (undefined as T)
}

/**
 * Seeds an Organization, Discipline, Role, and a PENDING Membership
 * for the given userId. Returns IDs for test assertions and cleanup.
 */
export async function seedMembership(userId: string): Promise<MembershipFixture> {
  return runMembershipDbCommand<MembershipFixture>("seed-membership", { userId })
}

/**
 * Cleans up all seeded membership test data.
 * Call in afterAll to leave the DB clean.
 */
export async function cleanupMembershipFixture(fixture: MembershipFixture): Promise<void> {
  runMembershipDbCommand<void>("cleanup-membership", fixture)
}
