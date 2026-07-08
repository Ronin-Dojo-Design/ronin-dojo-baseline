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
  claimantPremiumEntitlementId: string
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
  /**
   * SESSION_0265 — drag/reorder e2e additive fixture.
   *
   * Three sibling members all parented under `claimTargetMemberId`
   * (publicMember), giving the editor canvas a non-trivial drag surface:
   * - `siblingMemberIds` start in `siblingGroupAId` with ascending sortOrders.
   * - `siblingGroupBId` is a second sibling group under the same parent so
   *   cross-visual-group moves still satisfy the same-parent guard in
   *   `handleDragEnd` (lineage-tree-canvas.tsx).
   */
  siblingParentMemberId: string
  siblingGroupAId: string
  siblingGroupBId: string
  siblingGroupBLabel: string
  siblingMemberIds: [string, string, string]
  siblingNodeIds: [string, string, string]
  siblingNames: [string, string, string]
  siblingInitialSortOrders: [number, number, number]
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
  passportBio: string | null
  rankAwardedAt: string | null
  promoterRelationship: {
    fromNodeId: string
    toNodeId: string
    rankAwardId: string | null
    verificationStatus: string
    isVerified: boolean
  } | null
  siblings: Array<{
    id: string
    nodeId: string
    visualSortOrder: number
    visualGroupId: string | null
    primaryVisualParentMemberId: string | null
  }>
  siblingRelationshipCount: number
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
