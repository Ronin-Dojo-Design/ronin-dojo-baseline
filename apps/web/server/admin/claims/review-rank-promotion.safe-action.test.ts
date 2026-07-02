/**
 * petey-plan-0477 Slice V5 (SESSION_0491) — reviewPassportClaim instructor-scoped authz.
 *
 * The V5 "Done means": an instructor holding a resource-scoped `claim.review` grant
 * (LineageTreeAccess) on the student's tree CAN approve a RANK_PROMOTION claim →
 * VERIFIED award + milestone media appear; a signed-in user with NO grant CANNOT
 * (authorization error, claim untouched); a global admin CAN. Also pins the two
 * non-regression guarantees: IDENTITY claims stay admin-only, and promotion decisions
 * now notify the member (the post-commit email block keys on the derived nodeId).
 *
 * The action IS the security boundary here (SOP §5c — the authz gate lives inside
 * `reviewPassportClaim`, not in a middleware or extractable helper), so this wrapped
 * file carries the full guard coverage. The email seam is stubbed (unit tests MUST
 * NOT send real Resend emails — mirrors claim-review-actions.test.ts).
 *
 * Run: cd apps/web && bun run test server/admin/claims/review-rank-promotion.safe-action.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// IMPORTANT: install safe-action mocks BEFORE any module that touches `~/server`,
// `~/lib/auth`, `next/headers`, `next/cache`, or `next/server` is imported.
import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

// Stub the post-commit lifecycle-email schedulers so the test stays hermetic (the real
// modules use next/server after() + Resend). Recording arrays double as the proof that
// promotion decisions now notify the member (SESSION_0491 build item 4).
const approvedEmailCalls: { userId: string; nodeId: string }[] = []
const rejectedEmailCalls: { userId: string; nodeId: string; reviewerNote?: string | null }[] = []
mock.module("~/server/web/lineage/claim-approved-email", () => ({
  scheduleClaimApprovedEmail: (args: { userId: string; nodeId: string }) =>
    approvedEmailCalls.push(args),
}))
mock.module("~/server/web/lineage/claim-rejected-email", () => ({
  scheduleClaimRejectedEmail: (args: {
    userId: string
    nodeId: string
    reviewerNote?: string | null
  }) => rejectedEmailCalls.push(args),
}))

import { reviewPassportClaim } from "~/server/admin/claims/passport-claim-review-actions"
import { db } from "~/services/db"

const TS = Date.now()
const PREFIX = `s0491-rrp-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

type MemberFixture = {
  userId: string
  passportId: string
  nodeId: string
  memberId: string
}

type Fixture = {
  treeId: string
  rankId: string
  mediaId: string
  member1: MemberFixture
  member2: MemberFixture
  member3: MemberFixture
  instructorUserId: string
  outsiderUserId: string
  adminUserId: string
  promoClaim1Id: string
  promoClaim2Id: string
  promoClaim3Id: string
  identityClaimId: string
  identityPassportId: string
}

let fx: Fixture | null = null

const createUser = async (name: string, role: "user" | "admin" = "user") => {
  return db.user.create({
    data: { id: tag(name), name: tag(name), email: `${tag(name)}@test.local`, role },
    select: { id: true },
  })
}

/** A member: user + owned Passport + LineageNode + LineageTreeMember in `treeId`. */
const createMember = async (name: string, treeId: string): Promise<MemberFixture> => {
  const user = await createUser(name)
  const passport = await db.passport.create({
    data: { id: tag(`${name}-passport`), displayName: tag(name), userId: user.id },
    select: { id: true },
  })
  const node = await db.lineageNode.create({
    data: { id: tag(`${name}-node`), passportId: passport.id, visibility: "PUBLIC" },
    select: { id: true },
  })
  const member = await db.lineageTreeMember.create({
    data: { id: tag(`${name}-member`), treeId, nodeId: node.id },
    select: { id: true },
  })
  return { userId: user.id, passportId: passport.id, nodeId: node.id, memberId: member.id }
}

const createPromotionClaim = async (member: MemberFixture, rankId: string, mediaId?: string) => {
  // Claim id is Prisma-generated (databaseIdSchema needs a cuid — tag() ids fail it).
  const claim = await db.passportClaimRequest.create({
    data: {
      type: "RANK_PROMOTION",
      passportId: member.passportId,
      claimantUserId: member.userId,
      brand: "BBL",
      status: "PENDING",
      claimedRankId: rankId,
      ...(mediaId ? { evidence: { create: [{ label: "Certificate photo", mediaId }] } } : {}),
    },
    select: { id: true },
  })
  return claim.id
}

beforeAll(async () => {
  const admin = await createUser("admin", "admin")
  const instructor = await createUser("instructor")
  const outsider = await createUser("outsider")

  const tree = await db.lineageTree.create({
    data: {
      id: tag("tree"),
      brand: "BBL",
      slug: tag("tree"),
      name: tag("Tree"),
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
    },
    select: { id: true },
  })

  const member1 = await createMember("member1", tree.id)
  const member2 = await createMember("member2", tree.id)
  const member3 = await createMember("member3", tree.id)

  // The instructor's resource-scoped grant: TREE_EDITOR carries `claim.review` tree-wide.
  await db.lineageTreeAccess.create({
    data: {
      id: tag("grant"),
      treeId: tree.id,
      userId: instructor.id,
      role: "TREE_EDITOR",
      grantedById: admin.id,
    },
  })

  const rank = await db.rank.findFirst({
    where: { rankSystem: { discipline: { code: "bjj" } } },
    select: { id: true },
  })
  if (!rank) throw new Error("Test requires a seeded BJJ rank")

  const media = await db.media.create({
    data: {
      id: tag("media"),
      brand: "BBL",
      type: "IMAGE",
      url: `https://example.com/${tag("cert")}.jpg`,
      uploadedById: member1.userId,
    },
    select: { id: true },
  })

  const promoClaim1Id = await createPromotionClaim(member1, rank.id, media.id)
  const promoClaim2Id = await createPromotionClaim(member2, rank.id)
  const promoClaim3Id = await createPromotionClaim(member3, rank.id)

  // An IDENTITY claim (unowned placeholder Passport) — must STAY admin-only.
  const identityPassport = await db.passport.create({
    data: { id: tag("placeholder"), displayName: tag("Placeholder Person") },
    select: { id: true },
  })
  const identityClaim = await db.passportClaimRequest.create({
    data: {
      passportId: identityPassport.id,
      claimantUserId: outsider.id,
      brand: "BBL",
      status: "PENDING",
    },
    select: { id: true },
  })

  fx = {
    treeId: tree.id,
    rankId: rank.id,
    mediaId: media.id,
    member1,
    member2,
    member3,
    instructorUserId: instructor.id,
    outsiderUserId: outsider.id,
    adminUserId: admin.id,
    promoClaim1Id,
    promoClaim2Id,
    promoClaim3Id,
    identityClaimId: identityClaim.id,
    identityPassportId: identityPassport.id,
  }
})

afterAll(async () => {
  if (!fx) return
  await db.auditLog.deleteMany({ where: { userId: { startsWith: PREFIX } } })
  await db.mediaAttachment.deleteMany({ where: { mediaId: fx.mediaId } })
  await db.passportClaimEvidence.deleteMany({
    where: { claimRequest: { passportId: { startsWith: PREFIX } } },
  })
  await db.passportClaimRequest.deleteMany({ where: { passportId: { startsWith: PREFIX } } })
  // RankMilestone cascades off the award delete.
  await db.rankAward.deleteMany({ where: { passportId: { startsWith: PREFIX } } })
  await db.lineageTreeAccess.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageTree.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.lineageNode.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.media.deleteMany({ where: { id: fx.mediaId } })
  await db.passport.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
})

describe("reviewPassportClaim — RANK_PROMOTION instructor-scoped review (Slice V5)", () => {
  it("returns serverError 'User not authenticated' when no session", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession(null)

    const result = await reviewPassportClaim({ claimId: fx.promoClaim1Id, decision: "APPROVED" })

    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
  })

  it("a signed-in user with NO grant cannot review a promotion — claim untouched", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.outsiderUserId, role: "user" })

    const result = await reviewPassportClaim({ claimId: fx.promoClaim1Id, decision: "APPROVED" })

    expect(result?.serverError).toBe("User not authorized")
    expect(result?.data).toBeUndefined()

    const claim = await db.passportClaimRequest.findUnique({
      where: { id: fx.promoClaim1Id },
      select: { status: true },
    })
    expect(claim?.status).toBe("PENDING")
    const award = await db.rankAward.findFirst({
      where: { passportId: fx.member1.passportId },
      select: { id: true },
    })
    expect(award).toBeNull()
  })

  it("a TREE_EDITOR (claim.review on the member's tree) CAN approve → VERIFIED award + milestone media + member notified", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.instructorUserId, role: "user" })

    const result = await reviewPassportClaim({
      claimId: fx.promoClaim1Id,
      decision: "APPROVED",
      reviewerNote: "Verified at the academy",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.status).toBe("APPROVED")
    expect(result?.data?.rankAwardId).not.toBeNull()
    // The promotion result surfaces the member's own node (submit stored none).
    expect(result?.data?.nodeId).toBe(fx.member1.nodeId)

    const award = await db.rankAward.findUnique({
      where: { id: result!.data!.rankAwardId as string },
      select: { verificationStatus: true, source: true, passportId: true, rankId: true },
    })
    expect(award?.verificationStatus).toBe("VERIFIED")
    expect(award?.source).toBe("STATED")
    expect(award?.passportId).toBe(fx.member1.passportId)
    expect(award?.rankId).toBe(fx.rankId)

    // The photo evidence materialized onto the award's milestone (TASK_04 wire).
    const milestone = await db.rankMilestone.findUnique({
      where: { rankAwardId: result!.data!.rankAwardId as string },
      select: { id: true, media: { select: { mediaId: true } } },
    })
    expect(milestone).not.toBeNull()
    expect(milestone?.media.map(m => m.mediaId)).toContain(fx.mediaId)

    // The member got the claim-decision notice (post-commit email block fired).
    expect(approvedEmailCalls).toContainEqual(
      expect.objectContaining({ userId: fx.member1.userId, nodeId: fx.member1.nodeId }),
    )
  }, 30_000)

  it("a TREE_EDITOR CANNOT review an IDENTITY claim — that path stays admin-only", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.instructorUserId, role: "user" })

    const result = await reviewPassportClaim({ claimId: fx.identityClaimId, decision: "APPROVED" })

    expect(result?.serverError).toBe("User not authorized")

    const claim = await db.passportClaimRequest.findUnique({
      where: { id: fx.identityClaimId },
      select: { status: true },
    })
    expect(claim?.status).toBe("PENDING")
    // The placeholder Passport was NOT attached to anyone.
    const passport = await db.passport.findUnique({
      where: { id: fx.identityPassportId },
      select: { userId: true },
    })
    expect(passport?.userId).toBeNull()
  })

  it("a global admin CAN approve a promotion (flat-role path unchanged)", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })

    const result = await reviewPassportClaim({ claimId: fx.promoClaim2Id, decision: "APPROVED" })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.status).toBe("APPROVED")

    const award = await db.rankAward.findFirst({
      where: { passportId: fx.member2.passportId, rankId: fx.rankId },
      select: { verificationStatus: true },
    })
    expect(award?.verificationStatus).toBe("VERIFIED")
  }, 30_000)

  it("a DENIED promotion also notifies the member (derived nodeId, rejected notice)", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })

    const result = await reviewPassportClaim({
      claimId: fx.promoClaim3Id,
      decision: "DENIED",
      reviewerNote: "No record of this promotion",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.status).toBe("DENIED")
    expect(result?.data?.nodeId).toBe(fx.member3.nodeId)

    // Denial mints nothing.
    const award = await db.rankAward.findFirst({
      where: { passportId: fx.member3.passportId },
      select: { id: true },
    })
    expect(award).toBeNull()

    expect(rejectedEmailCalls).toContainEqual(
      expect.objectContaining({ userId: fx.member3.userId, nodeId: fx.member3.nodeId }),
    )
  }, 30_000)
})
