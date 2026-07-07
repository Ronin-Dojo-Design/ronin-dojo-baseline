/**
 * FI-003 — `placeLeadIntoLineage` helper-level integration test (SOP §5d rolled-back-tx pattern).
 *
 * `placeLeadIntoLineage(tx, input)` runs inside a caller's transaction, so this calls it DIRECTLY —
 * NO mock seams (no session / next-safe-action) and NO teardown: every fixture lives inside a
 * transaction that is always rolled back. Brand is a plain string (non-BBL is fine — the placement
 * logic is brand-agnostic; the tree fixture carries the same brand the call passes).
 *
 * Coverage:
 *   - places a student UNDER a mid-tree anchor (instructor deep in the tree, not the root);
 *   - the placed member is NOT claimable and Unverified, and NO claim row is created (a signup is
 *     never a claim — Claim is ONLY the WP-import placeholder flow, ADR 0035 / SESSION_0474);
 *   - idempotent re-run → `alreadyPlaced: true`, no duplicate member/edge, still not claimable;
 *   - a lead whose email has NO User mints an accountless placeholder Passport (`placeholderCreated`),
 *     not claimable, no claim row (Jay Farrell — account attaches on sign-in, not via a claim);
 *   - the "David" case: a student-user with a PENDING PassportClaimRequest on their own Passport does
 *     not throw and does not touch the claim row.
 *
 * Run: cd apps/web && bun run test server/admin/lineage/place-lead-core.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

import { placeLeadIntoLineage } from "~/server/admin/lineage/place-lead-core"
import { db } from "~/services/db"

const BRAND = "BASELINE_MARTIAL_ARTS" as const

const TS = Date.now()
let seq = 0
const uid = (name: string) => `al-${TS}-${seq++}-${name}`

// biome-ignore lint/suspicious/noExplicitAny: tx client surface.
type Tx = any

class Rollback extends Error {}

async function inRolledBackTx(body: (tx: Tx) => Promise<void>): Promise<void> {
  try {
    await db.$transaction(async (tx: Tx) => {
      await body(tx)
      throw new Rollback()
    })
  } catch (error) {
    if (!(error instanceof Rollback)) throw error
  }
}

/** A person = Passport + LineageNode; when `treeId` given, also a member under `parentMemberId`. */
async function makePerson(
  tx: Tx,
  name: string,
  opts: { treeId?: string; parentMemberId?: string | null } = {},
): Promise<{ passportId: string; nodeId: string; memberId: string | null }> {
  const passport = await tx.passport.create({
    data: { displayName: uid(name) },
    select: { id: true },
  })
  const node = await tx.lineageNode.create({
    data: { passportId: passport.id, visibility: "PUBLIC", verificationStatus: "PENDING" },
    select: { id: true },
  })
  let memberId: string | null = null
  if (opts.treeId) {
    const member = await tx.lineageTreeMember.create({
      data: {
        treeId: opts.treeId,
        nodeId: node.id,
        primaryVisualParentMemberId: opts.parentMemberId ?? null,
      },
      select: { id: true },
    })
    memberId = member.id
  }
  return { passportId: passport.id, nodeId: node.id, memberId }
}

/** A canonical-slug tree (the helper hard-codes `rigan-machado-lineage`). */
async function makeCanonicalTree(tx: Tx): Promise<string> {
  const tree = await tx.lineageTree.create({
    data: {
      brand: BRAND,
      slug: "rigan-machado-lineage",
      name: uid("canonical"),
      visibility: "PUBLIC",
    },
    select: { id: true },
  })
  return tree.id
}

async function makeUser(tx: Tx, email: string): Promise<string> {
  const user = await tx.user.create({
    data: { id: uid("user"), name: uid("user"), email },
    select: { id: true },
  })
  return user.id
}

async function makeOrg(tx: Tx): Promise<string> {
  const org = await tx.organization.create({
    data: { brand: BRAND, name: uid("org"), slug: uid("org") },
    select: { id: true },
  })
  return org.id
}

/** A Join-the-Legacy lead carrying `meta.trainedUnderNodeId` (`Lead.organizationId` is required). */
async function makeLead(
  tx: Tx,
  { email, trainedUnderNodeId }: { email: string; trainedUnderNodeId: string },
): Promise<string> {
  const organizationId = await makeOrg(tx)
  const lead = await tx.lead.create({
    data: {
      brand: BRAND,
      email,
      firstName: "Test",
      lastName: "Student",
      source: "WEBSITE",
      organizationId,
      meta: { source: "join-the-legacy", trainedUnderNodeId },
    },
    select: { id: true },
  })
  return lead.id
}

describe("placeLeadIntoLineage — FI-003", () => {
  it("places the student UNDER a mid-tree instructor anchor, Unverified + not claimable + no claim row", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeCanonicalTree(tx)
      // Root → mid → instructor: a chain so the anchor sits mid-tree, not at the root.
      const root = await makePerson(tx, "rigan", { treeId })
      const mid = await makePerson(tx, "bob-bass", { treeId, parentMemberId: root.memberId })
      const instructor = await makePerson(tx, "tony-hua", { treeId, parentMemberId: mid.memberId })
      const actorUserId = await makeUser(tx, `${uid("actor")}@test.local`)
      const email = `${uid("thien")}@test.local`
      await makeUser(tx, email)
      const leadId = await makeLead(tx, { email, trainedUnderNodeId: instructor.nodeId })

      const result = await placeLeadIntoLineage(tx, { leadId, actorUserId, brand: BRAND })

      expect(result.alreadyPlaced).toBe(false)
      expect(result.placeholderCreated).toBe(false)
      expect(result.visualParentMemberId).toBe(instructor.memberId)
      expect(result.trainedUnderRelationshipId).not.toBeNull()

      // Filed under the instructor AND not claimable (a signup is never claimable — Claim is only the
      // WP-import placeholder flow, ADR 0035 / SESSION_0474).
      const member = await tx.lineageTreeMember.findUnique({
        where: { id: result.memberId },
        select: { primaryVisualParentMemberId: true, isClaimable: true },
      })
      expect(member?.primaryVisualParentMemberId).toBe(instructor.memberId)
      expect(member?.isClaimable).toBe(false)

      // The student's node is Unverified (never flipped).
      const node = await tx.lineageNode.findUnique({
        where: { id: result.nodeId },
        select: { isVerified: true },
      })
      expect(node?.isVerified).toBe(false)

      // No claim row was created for a signup (placement is NOT a claim).
      const claimCount = await tx.passportClaimRequest.count({
        where: { passportId: result.passportId },
      })
      expect(claimCount).toBe(0)

      // VERIFIED INSTRUCTOR_STUDENT edge, instructor → student.
      const edge = await tx.lineageRelationship.findUnique({
        where: { id: result.trainedUnderRelationshipId as string },
        select: {
          type: true,
          fromNodeId: true,
          toNodeId: true,
          verificationStatus: true,
        },
      })
      expect(edge?.type).toBe("INSTRUCTOR_STUDENT")
      expect(edge?.fromNodeId).toBe(instructor.nodeId)
      expect(edge?.toNodeId).toBe(result.nodeId)
      expect(edge?.verificationStatus).toBe("VERIFIED")
    })
  })

  it("is idempotent — a re-run returns alreadyPlaced with no duplicate member/edge", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeCanonicalTree(tx)
      const root = await makePerson(tx, "rigan", { treeId })
      const instructor = await makePerson(tx, "tony", { treeId, parentMemberId: root.memberId })
      const actorUserId = await makeUser(tx, `${uid("actor")}@test.local`)
      const email = `${uid("dup")}@test.local`
      await makeUser(tx, email)
      const leadId = await makeLead(tx, { email, trainedUnderNodeId: instructor.nodeId })

      const first = await placeLeadIntoLineage(tx, { leadId, actorUserId, brand: BRAND })
      const second = await placeLeadIntoLineage(tx, { leadId, actorUserId, brand: BRAND })

      expect(first.alreadyPlaced).toBe(false)
      expect(second.alreadyPlaced).toBe(true)
      expect(second.memberId).toBe(first.memberId)
      expect(second.nodeId).toBe(first.nodeId)

      const memberCount = await tx.lineageTreeMember.count({
        where: { treeId, nodeId: first.nodeId },
      })
      expect(memberCount).toBe(1)

      // Still not claimable after the idempotent re-run.
      const member = await tx.lineageTreeMember.findUnique({
        where: { id: first.memberId },
        select: { isClaimable: true },
      })
      expect(member?.isClaimable).toBe(false)
      const edgeCount = await tx.lineageRelationship.count({
        where: {
          type: "INSTRUCTOR_STUDENT",
          fromNodeId: instructor.nodeId,
          toNodeId: first.nodeId,
        },
      })
      expect(edgeCount).toBe(1)
    })
  })

  it("mints an accountless placeholder Passport when the lead has no User (Jay Farrell case)", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeCanonicalTree(tx)
      const root = await makePerson(tx, "rigan", { treeId })
      const instructor = await makePerson(tx, "brian", { treeId, parentMemberId: root.memberId })
      const actorUserId = await makeUser(tx, `${uid("actor")}@test.local`)
      const email = `${uid("jay")}@test.local` // NO User created for this email
      const leadId = await makeLead(tx, { email, trainedUnderNodeId: instructor.nodeId })

      const result = await placeLeadIntoLineage(tx, { leadId, actorUserId, brand: BRAND })

      expect(result.placeholderCreated).toBe(true)
      expect(result.visualParentMemberId).toBe(instructor.memberId)

      // The minted Passport is accountless (userId null) — the account attaches on sign-in via the
      // pending-binding mechanism, NOT via a claim.
      const passport = await tx.passport.findUnique({
        where: { id: result.passportId },
        select: { userId: true },
      })
      expect(passport?.userId).toBeNull()

      // The placeholder is NOT claimable and has NO claim row (a signup is never a claim).
      const member = await tx.lineageTreeMember.findUnique({
        where: { id: result.memberId },
        select: { isClaimable: true },
      })
      expect(member?.isClaimable).toBe(false)
      const claimCount = await tx.passportClaimRequest.count({
        where: { passportId: result.passportId },
      })
      expect(claimCount).toBe(0)
    })
  })

  it("re-placing an ACCOUNTLESS lead is idempotent — no duplicate placeholder Passport/member (lead-scoped guard)", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeCanonicalTree(tx)
      const root = await makePerson(tx, "rigan", { treeId })
      const instructor = await makePerson(tx, "brian", { treeId, parentMemberId: root.memberId })
      const actorUserId = await makeUser(tx, `${uid("actor")}@test.local`)
      const email = `${uid("jay-idem")}@test.local` // NO User — each run would otherwise mint a fresh placeholder
      const leadId = await makeLead(tx, { email, trainedUnderNodeId: instructor.nodeId })

      const first = await placeLeadIntoLineage(tx, { leadId, actorUserId, brand: BRAND })
      const second = await placeLeadIntoLineage(tx, { leadId, actorUserId, brand: BRAND })

      expect(first.placeholderCreated).toBe(true)
      // The re-run short-circuits on `lead.meta.placedMemberId` — same member/passport, no new mint.
      expect(second.alreadyPlaced).toBe(true)
      expect(second.placeholderCreated).toBe(false)
      expect(second.memberId).toBe(first.memberId)
      expect(second.passportId).toBe(first.passportId)

      // Exactly ONE member for this person on the tree (no duplicate placeholder).
      const memberCount = await tx.lineageTreeMember.count({
        where: { treeId, nodeId: first.nodeId },
      })
      expect(memberCount).toBe(1)
    })
  })

  it("does not throw or touch a pending PassportClaimRequest on the student's own Passport (David case)", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeCanonicalTree(tx)
      const root = await makePerson(tx, "rigan", { treeId })
      const instructor = await makePerson(tx, "tony", { treeId, parentMemberId: root.memberId })
      const actorUserId = await makeUser(tx, `${uid("actor")}@test.local`)
      const email = `${uid("david")}@test.local`
      const userId = await makeUser(tx, email)
      // The student user already owns a Passport with a PENDING claim on it (David's real-prod shape).
      const ownPassport = await tx.passport.create({
        data: { displayName: "David", userId },
        select: { id: true },
      })
      const claim = await tx.passportClaimRequest.create({
        data: {
          brand: BRAND,
          passportId: ownPassport.id,
          claimantUserId: userId,
          status: "PENDING",
        },
        select: { id: true, status: true, passportId: true },
      })
      const leadId = await makeLead(tx, { email, trainedUnderNodeId: instructor.nodeId })

      const result = await placeLeadIntoLineage(tx, { leadId, actorUserId, brand: BRAND })

      // Placed on the student's OWN existing Passport (ensurePassportForUser found it).
      expect(result.passportId).toBe(ownPassport.id)
      expect(result.visualParentMemberId).toBe(instructor.memberId)

      // The pending claim row is untouched.
      const after = await tx.passportClaimRequest.findUnique({
        where: { id: claim.id },
        select: { status: true, passportId: true },
      })
      expect(after?.status).toBe("PENDING")
      expect(after?.passportId).toBe(ownPassport.id)
    })
  })
})
