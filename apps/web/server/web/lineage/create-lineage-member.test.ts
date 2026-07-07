/**
 * SESSION_0358 TASK_02 — createLineageMember (the first runtime lineage member-create).
 *
 * Run: cd apps/web && bun test server/web/lineage/create-lineage-member.test.ts
 *
 * Integration test against the local DB; fixtures are tagged + torn down. Verifies that placing a
 * person under a parent creates a LineageNode + LineageTreeMember, the canonical INSTRUCTOR_STUDENT
 * "listed under" tree-placement edge (parent → member, what the canvas/timeline walk), and — when a
 * rankAwardId is supplied — a SEPARATE optional PROMOTED_BY edge carrying that award (ADR 0016).
 * Both edge writes are idempotent (SESSION_0508), and the guards are enforced.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import type { Brand } from "~/.generated/prisma/client"
import {
  CREATE_LINEAGE_MEMBER_ERROR,
  createLineageMember,
} from "~/server/web/lineage/create-lineage-member"
import { db } from "~/services/db"

const TS = Date.now()
const PREFIX = `s358-clm-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`
const email = (name: string) => `${tag(name)}@placeholder.invalid`
const TEST_BRAND: Brand = "BASELINE_MARTIAL_ARTS"

type Fixtures = {
  disciplineId: string
  rankSystemId: string
  rankId: string
  treeId: string
  parentUserId: string
  parentPassportId: string
  parentNodeId: string
  parentMemberId: string
  childUserId: string
  childPassportId: string
  childRankAwardId: string
}

let fx: Fixtures

beforeAll(async () => {
  const discipline = await db.discipline.create({ data: { name: tag("disc"), slug: tag("disc") } })
  const rankSystem = await db.rankSystem.create({
    data: { name: tag("rs"), disciplineId: discipline.id },
  })
  const rank = await db.rank.create({
    data: { name: tag("rank"), sortOrder: 1, rankSystemId: rankSystem.id },
  })

  const tree = await db.lineageTree.create({
    data: { brand: TEST_BRAND, slug: tag("tree"), name: tag("tree") },
  })

  const parentUser = await db.user.create({
    data: { name: tag("parent"), email: email("parent"), isPlaceholder: true },
  })
  const parentPassport = await db.passport.create({
    data: { userId: parentUser.id },
    select: { id: true },
  })
  const parentNode = await db.lineageNode.create({
    data: { passport: { connect: { id: parentPassport.id } } },
  })
  const parentMember = await db.lineageTreeMember.create({
    data: { treeId: tree.id, nodeId: parentNode.id },
  })

  const childUser = await db.user.create({
    data: { name: tag("child"), email: email("child"), isPlaceholder: true },
  })
  const childPassport = await db.passport.create({
    data: { userId: childUser.id },
    select: { id: true },
  })
  const childRankAward = await db.rankAward.create({
    data: {
      passport: { connect: { id: childPassport.id } },
      rank: { connect: { id: rank.id } },
      source: "STATED",
      verificationStatus: "UNVERIFIED",
    },
  })

  fx = {
    disciplineId: discipline.id,
    rankSystemId: rankSystem.id,
    rankId: rank.id,
    treeId: tree.id,
    parentUserId: parentUser.id,
    parentPassportId: parentPassport.id,
    parentNodeId: parentNode.id,
    parentMemberId: parentMember.id,
    childUserId: childUser.id,
    childPassportId: childPassport.id,
    childRankAwardId: childRankAward.id,
  }
})

afterAll(async () => {
  const testUsers = await db.user.findMany({
    where: { email: { startsWith: PREFIX } },
    select: { id: true },
  })
  const userIds = testUsers.map(user => user.id)

  // AuditLog.userId is RESTRICT, so clear the helper's audit rows before deleting the actor users.
  await db.auditLog.deleteMany({ where: { userId: { in: userIds } } })
  // Deleting users cascades their LineageNode → LineageTreeMember + LineageRelationship + RankAward.
  await db.user.deleteMany({ where: { id: { in: userIds } } })
  await db.lineageTree.deleteMany({ where: { slug: { startsWith: PREFIX } } })
  await db.rank.deleteMany({ where: { rankSystemId: fx.rankSystemId } })
  await db.rankSystem.deleteMany({ where: { id: fx.rankSystemId } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
})

describe("createLineageMember", () => {
  it("places a person under a parent: member (visual parent) + INSTRUCTOR_STUDENT tree edge + separate PROMOTED_BY edge carrying the rank award", async () => {
    const result = await createLineageMember({
      db,
      brand: TEST_BRAND,
      actorUserId: fx.parentUserId,
      memberPassportId: fx.childPassportId,
      treeId: fx.treeId,
      parentMemberId: fx.parentMemberId,
      rankAwardId: fx.childRankAwardId,
    })

    expect(result.memberId).toBeTruthy()
    expect(result.relationshipId).toBeTruthy()
    expect(result.trainedUnderRelationshipId).toBeTruthy()

    const member = await db.lineageTreeMember.findUnique({
      where: { id: result.memberId },
      select: { primaryVisualParentMemberId: true, nodeId: true, treeId: true },
    })
    expect(member?.treeId).toBe(fx.treeId)
    expect(member?.primaryVisualParentMemberId).toBe(fx.parentMemberId)

    // SESSION_0508: the TREE-PLACEMENT edge is INSTRUCTOR_STUDENT (parent → member) — this is what
    // the canvas + ancestry timeline walk. Exactly one such edge exists for (parent, member).
    const trainedUnderEdges = await db.lineageRelationship.findMany({
      where: {
        type: "INSTRUCTOR_STUDENT",
        fromNodeId: fx.parentNodeId,
        toNodeId: member?.nodeId,
      },
      select: { id: true },
    })
    expect(trainedUnderEdges).toHaveLength(1)
    expect(trainedUnderEdges[0]?.id).toBe(result.trainedUnderRelationshipId)

    // The rank award rides a SEPARATE, OPTIONAL PROMOTED_BY edge (ADR 0016), not the member row
    // (ADR 0035) and not the tree structure.
    const relationship = await db.lineageRelationship.findUnique({
      where: { id: result.relationshipId as string },
      select: { type: true, fromNodeId: true, toNodeId: true, rankAwardId: true },
    })
    expect(relationship?.type).toBe("PROMOTED_BY")
    expect(relationship?.fromNodeId).toBe(fx.parentNodeId)
    expect(relationship?.toNodeId).toBe(member?.nodeId)
    expect(relationship?.rankAwardId).toBe(fx.childRankAwardId)
  })

  it("under a parent WITHOUT a rankAwardId: writes the INSTRUCTOR_STUDENT tree edge but NO PROMOTED_BY (listed-under ≠ promotion)", async () => {
    const listedUser = await db.user.create({
      data: { name: tag("listed"), email: email("listed"), isPlaceholder: true },
    })
    const listedPassport = await db.passport.create({
      data: { userId: listedUser.id },
      select: { id: true },
    })

    const result = await createLineageMember({
      db,
      brand: TEST_BRAND,
      actorUserId: fx.parentUserId,
      memberPassportId: listedPassport.id,
      treeId: fx.treeId,
      parentMemberId: fx.parentMemberId,
      // no rankAwardId — this parent is purely the "listed under" instructor.
    })

    expect(result.trainedUnderRelationshipId).toBeTruthy()
    // No promotion recorded → no PROMOTED_BY edge.
    expect(result.relationshipId).toBeNull()

    const promotedBy = await db.lineageRelationship.findMany({
      where: {
        type: "PROMOTED_BY",
        fromNodeId: fx.parentNodeId,
        toNodeId: result.nodeId,
      },
    })
    expect(promotedBy).toHaveLength(0)

    const trainedUnder = await db.lineageRelationship.findMany({
      where: {
        type: "INSTRUCTOR_STUDENT",
        fromNodeId: fx.parentNodeId,
        toNodeId: result.nodeId,
      },
    })
    expect(trainedUnder).toHaveLength(1)
  })

  it("is idempotent on the INSTRUCTOR_STUDENT edge: a pre-existing edge is reused, never double-written (safe to compose with materializeTrainedUnder / place-lead-core)", async () => {
    const composeUser = await db.user.create({
      data: { name: tag("compose"), email: email("compose"), isPlaceholder: true },
    })
    const composePassport = await db.passport.create({
      data: { userId: composeUser.id },
      select: { id: true },
    })
    const composeNode = await db.lineageNode.create({
      data: { passport: { connect: { id: composePassport.id } } },
      select: { id: true },
    })

    // Simulate place-lead-core / materializeTrainedUnder already having written the (VERIFIED) edge.
    const preExisting = await db.lineageRelationship.create({
      data: {
        type: "INSTRUCTOR_STUDENT",
        fromNodeId: fx.parentNodeId,
        toNodeId: composeNode.id,
        isVerified: true,
        verificationStatus: "VERIFIED",
      },
      select: { id: true },
    })

    const result = await createLineageMember({
      db,
      brand: TEST_BRAND,
      actorUserId: fx.parentUserId,
      memberPassportId: composePassport.id,
      treeId: fx.treeId,
      parentMemberId: fx.parentMemberId,
    })

    // Reused the existing edge — no duplicate.
    expect(result.trainedUnderRelationshipId).toBe(preExisting.id)
    const edges = await db.lineageRelationship.findMany({
      where: {
        type: "INSTRUCTOR_STUDENT",
        fromNodeId: fx.parentNodeId,
        toNodeId: composeNode.id,
      },
      select: { id: true },
    })
    expect(edges).toHaveLength(1)
  })

  it("rejects placing the same person in the same tree twice (MEMBER_EXISTS)", async () => {
    await expect(
      createLineageMember({
        db,
        brand: TEST_BRAND,
        actorUserId: fx.parentUserId,
        memberPassportId: fx.childPassportId,
        treeId: fx.treeId,
        parentMemberId: fx.parentMemberId,
        rankAwardId: fx.childRankAwardId,
      }),
    ).rejects.toThrow(CREATE_LINEAGE_MEMBER_ERROR.MEMBER_EXISTS)
  })

  it("rejects an unknown tree (TREE_NOT_FOUND)", async () => {
    await expect(
      createLineageMember({
        db,
        brand: TEST_BRAND,
        actorUserId: fx.parentUserId,
        memberPassportId: fx.parentPassportId,
        treeId: "tree-does-not-exist",
      }),
    ).rejects.toThrow(CREATE_LINEAGE_MEMBER_ERROR.TREE_NOT_FOUND)
  })

  it("places a root member (no parent, no edge)", async () => {
    const rootUser = await db.user.create({
      data: { name: tag("root"), email: email("root"), isPlaceholder: true },
    })
    const rootPassport = await db.passport.create({
      data: { userId: rootUser.id },
      select: { id: true },
    })

    const result = await createLineageMember({
      db,
      brand: TEST_BRAND,
      actorUserId: fx.parentUserId,
      memberPassportId: rootPassport.id,
      treeId: fx.treeId,
    })

    expect(result.memberId).toBeTruthy()
    expect(result.relationshipId).toBeNull()

    const member = await db.lineageTreeMember.findUnique({
      where: { id: result.memberId },
      select: { primaryVisualParentMemberId: true },
    })
    expect(member?.primaryVisualParentMemberId).toBeNull()
  })
})
