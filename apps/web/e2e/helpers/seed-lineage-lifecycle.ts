import { execFileSync } from "node:child_process"

export interface LineageLifecycleFixture {
  treeId: string
  treeSlug: string
  treeName: string
  searchToken: string
  claimTargetNodeId: string
  claimTargetMemberId: string
  claimTargetName: string
  placeholderUserId: string
  claimantUserId: string
  adminUserId: string
  treeEditorUserId: string
  hiddenNames: {
    unlisted: string
    restricted: string
    private: string
  }
  hiddenGroupLabels: {
    unlisted: string
    restricted: string
    private: string
  }
  userIds: string[]
  nodeIds: string[]
  memberIds: string[]
  groupIds: string[]
  rankAwardId: string
  rankId: string
  rankSystemId: string
  disciplineId: string
}

export interface LineageLifecycleState {
  claim: {
    id: string
    status: string
    claimantNote: string | null
    reviewerNote: string | null
    evidence: Array<{ label: string | null; url: string | null; text: string | null }>
  } | null
  nodeOwnerId: string | null
  placeholderArchivedAt: string | null
  accessGrant: { id: string; role: string; userId: string } | null
  passportDisplayName: string | null
  nodeBio: string | null
  rankAwardedAt: string | null
  promoterRelationship: {
    fromNodeId: string
    toNodeId: string
    rankAwardId: string | null
    verificationStatus: string
    isVerified: boolean
  } | null
}

function runLineageLifecycleCommand<T>(command: string, fixture?: LineageLifecycleFixture): T {
  const args = ["e2e/helpers/seed-lineage-lifecycle-db.ts", command]

  if (fixture) {
    args.push(Buffer.from(JSON.stringify(fixture), "utf-8").toString("base64"))
  }

  const raw = execFileSync("bun", args, {
    cwd: process.cwd(),
    encoding: "utf-8",
  })

  return raw ? (JSON.parse(raw) as T) : (undefined as T)
}

export async function seedLineageLifecycleFixture(): Promise<LineageLifecycleFixture> {
  return runLineageLifecycleCommand<LineageLifecycleFixture>("seed")
}

export async function readLineageLifecycleState(
  fixture: LineageLifecycleFixture,
): Promise<LineageLifecycleState> {
  return runLineageLifecycleCommand<LineageLifecycleState>("state", fixture)
}

export async function cleanupLineageLifecycleFixture(fixture: LineageLifecycleFixture) {
  runLineageLifecycleCommand<void>("cleanup", fixture)
}
