/**
 * SESSION_0187 TASK_03 — end-to-end safe-action test for `updateLineageNodeProfile`.
 *
 * Invokes the next-safe-action-wrapped export through the full `userActionClient`
 * middleware chain (auth + brand + db + revalidate) using the reusable
 * `installSafeActionMocks` harness. Sibling helper-level tests live in
 * `node-profile-actions.test.ts`; this file proves the wrapper itself wires up.
 *
 * Run: cd apps/web && bun test --timeout 90000 \
 *        server/web/lineage/node-profile-actions.safe-action.test.ts
 *
 * Author: Cody / SESSION_0187 TASK_03.
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Install mocks BEFORE any import that touches `~/server`, `~/lib/auth`, etc.
// `mock.module` registers eagerly when this top-level statement runs, and static
// imports below resolve after this point, so the action module picks up the
// mocked dependencies.
installSafeActionMocks({ brand: "BBL" })

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { updateLineageNodeProfile } from "~/server/web/lineage/node-profile-actions"
import { seedNodeProfileActionCoreFixture } from "~/server/web/lineage/node-profile-actions.test-fixture"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const TS = Date.now()
const tag = (name: string) => `session-0187-${TS}-${name}`

type Fixtures = {
  treeId: string
  treeSlug: string
  nodeId: string
  memberId: string
  rankAwardId: string
  disciplineId: string
  rankSystemId: string
  rankId: string
  approvedClaimantUserId: string
  userIds: string[]
}

let fx: Fixtures | null = null

beforeAll(async () => {
  const { approvedClaimant, discipline, rankSystem, rank, rankAward, node, tree, member } =
    await seedNodeProfileActionCoreFixture({ brand: TEST_BRAND, tag })

  fx = {
    treeId: tree.id,
    treeSlug: tree.slug,
    nodeId: node.id,
    memberId: member.id,
    rankAwardId: rankAward.id,
    disciplineId: discipline.id,
    rankSystemId: rankSystem.id,
    rankId: rank.id,
    approvedClaimantUserId: approvedClaimant.id,
    userIds: [approvedClaimant.id],
  }
})

afterAll(async () => {
  if (!fx) return

  await db.lineageTreeAccess.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageTree.deleteMany({ where: { id: fx.treeId } })
  await db.lineageNode.deleteMany({ where: { id: fx.nodeId } })
  await db.rankAward.deleteMany({ where: { id: fx.rankAwardId } })
  await db.rank.deleteMany({ where: { id: fx.rankId } })
  await db.rankSystem.deleteMany({ where: { id: fx.rankSystemId } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
  await db.passport.deleteMany({ where: { userId: { in: fx.userIds } } })
  await db.user.deleteMany({ where: { id: { in: fx.userIds } } })
})

describe("updateLineageNodeProfile — safe-action wrapper", () => {
  it("returns serverError 'User not authenticated' when no session is present", async () => {
    setTestSession(null)

    const result = await updateLineageNodeProfile({
      treeId: fx!.treeId,
      nodeId: fx!.nodeId,
      displayName: "New",
      bio: "New bio",
      avatarUrl: "",
    })

    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
  })

  it("applies the update for an authorized NODE_EDITOR claimant", async () => {
    setTestSession({ id: fx!.approvedClaimantUserId })

    const result = await updateLineageNodeProfile({
      treeId: fx!.treeId,
      nodeId: fx!.nodeId,
      displayName: "New",
      bio: "New bio",
      avatarUrl: "",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.treeId).toBe(fx!.treeId)
    expect(result?.data?.nodeId).toBe(fx!.nodeId)
    expect(result?.data?.memberId).toBe(fx!.memberId)
    expect(result?.data?.treeSlug).toBe(fx!.treeSlug)

    const passport = await db.passport.findUnique({
      where: { userId: fx!.approvedClaimantUserId },
    })

    expect(passport?.displayName).toBe("New")
    // Bio Slice A (SESSION_0510 TASK_04): bio folded onto the Passport (the SoT); the
    // writer no longer touches `LineageNode.bio`.
    expect(passport?.bio).toBe("New bio")
  })
})
