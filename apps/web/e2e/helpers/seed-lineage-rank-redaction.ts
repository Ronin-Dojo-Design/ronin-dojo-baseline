import { execFileSync } from "node:child_process"

/**
 * Fixture for SESSION_0265_TASK_03: public DOM-level rank-redaction proof.
 *
 * Seeds two PUBLIC members on a published public tree, each holding a rank
 * award. Member-A's DirectoryProfile.showRanks=true (positive control) and
 * Member-B's DirectoryProfile.showRanks=false (the case under test for the
 * SESSION_0264_TASK_04A redaction contract).
 */
export interface LineageRankRedactionFixture {
  treeId: string
  treeSlug: string
  treeName: string
  viewerUserId: string
  viewerPremiumEntitlementId: string
  memberA: {
    userId: string
    nodeId: string
    memberId: string
    displayName: string
    rankAwardId: string
    rankName: string
    rankShortName: string
    rankSystemName: string
    disciplineName: string
  }
  memberB: {
    userId: string
    nodeId: string
    memberId: string
    displayName: string
    rankAwardId: string
    rankName: string
    rankShortName: string
    rankSystemName: string
    disciplineName: string
  }
  userIds: string[]
  nodeIds: string[]
  memberIds: string[]
  groupIds: string[]
  rankIds: string[]
  rankAwardIds: string[]
  rankSystemId: string
  rankSystemIds: string[]
  disciplineId: string
}

function runRankRedactionCommand<T>(command: string, fixture?: LineageRankRedactionFixture): T {
  const args = ["e2e/helpers/seed-lineage-rank-redaction-db.ts", command]

  if (fixture) {
    args.push(Buffer.from(JSON.stringify(fixture), "utf-8").toString("base64"))
  }

  const raw = execFileSync("bun", args, {
    cwd: process.cwd(),
    encoding: "utf-8",
  })

  return raw ? (JSON.parse(raw) as T) : (undefined as T)
}

export async function seedLineageRankRedactionFixture(): Promise<LineageRankRedactionFixture> {
  return runRankRedactionCommand<LineageRankRedactionFixture>("seed")
}

export async function cleanupLineageRankRedactionFixture(
  fixture: LineageRankRedactionFixture,
): Promise<void> {
  runRankRedactionCommand<void>("cleanup", fixture)
}
