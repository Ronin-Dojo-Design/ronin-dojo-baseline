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
  const approvedClaimant = await db.user.create({
    data: {
      id: tag("approved-claimant"),
      name: tag("Approved Claimant"),
      email: `${tag("approved-claimant")}@test.local`,
    },
  })

  await db.passport.create({
    data: {
      userId: approvedClaimant.id,
      displayName: "Original Display Name",
      avatarUrl: "https://example.com/original-avatar.jpg",
    },
  })

  const discipline = await db.discipline.create({
    data: {
      id: tag("discipline"),
      brand: TEST_BRAND,
      name: tag("Discipline"),
      slug: tag("discipline"),
      code: tag("DISC").slice(0, 16),
    },
  })

  const rankSystem = await db.rankSystem.create({
    data: {
      id: tag("rank-system"),
      brand: TEST_BRAND,
      name: tag("Rank System"),
      disciplineId: discipline.id,
    },
  })

  const rank = await db.rank.create({
    data: {
      id: tag("rank"),
      brand: TEST_BRAND,
      rankSystemId: rankSystem.id,
      sortOrder: 1,
      name: tag("Black Belt"),
      shortName: "BB",
    },
  })

  const rankAward = await db.rankAward.create({
    data: {
      id: tag("rank-award"),
      passport: {
        connectOrCreate: {
          where: { userId: approvedClaimant.id },
          create: { userId: approvedClaimant.id },
        },
      },
      rank: { connect: { id: rank.id } },
      awardedAt: new Date(Date.UTC(2020, 0, 1)),
    },
  })

  const node = await db.lineageNode.create({
    data: {
      id: tag("node"),
      passport: {
        connectOrCreate: {
          where: { userId: approvedClaimant.id },
          create: { userId: approvedClaimant.id },
        },
      },
      slug: tag("node-slug"),
      bio: "Original lineage bio",
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
  })

  const tree = await db.lineageTree.create({
    data: {
      id: tag("tree"),
      brand: TEST_BRAND,
      slug: tag("tree-slug"),
      name: tag("Test Lineage Tree"),
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
    },
  })

  const member = await db.lineageTreeMember.create({
    data: {
      id: tag("member"),
      treeId: tree.id,
      nodeId: node.id,
      rankAwardId: rankAward.id,
      visualSortOrder: 0,
    },
  })

  await db.lineageTreeAccess.create({
    data: {
      id: tag("node-editor-grant"),
      treeId: tree.id,
      userId: approvedClaimant.id,
      role: "NODE_EDITOR",
      nodeId: node.id,
      memberId: member.id,
    },
  })

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

    const [passport, node] = await Promise.all([
      db.passport.findUnique({ where: { userId: fx!.approvedClaimantUserId } }),
      db.lineageNode.findUnique({ where: { id: fx!.nodeId } }),
    ])

    expect(passport?.displayName).toBe("New")
    expect(node?.bio).toBe("New bio")
  })
})
