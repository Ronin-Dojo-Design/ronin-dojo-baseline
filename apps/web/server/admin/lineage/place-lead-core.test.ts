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

/**
 * A minimal discipline → rank-system → rank chain in a FRESH (non-BJJ) discipline; returns
 * the created Rank id. Used for the discipline-scope negative case — the declared-belt mint
 * is BJJ-scoped (`ensureDeclaredRankAward`), so a rank outside BJJ must never be minted.
 */
async function makeRank(tx: Tx): Promise<string> {
  const discipline = await tx.discipline.create({
    data: { name: uid("discipline"), slug: uid("discipline") },
    select: { id: true },
  })
  const rankSystem = await tx.rankSystem.create({
    data: { name: uid("rank-system"), disciplineId: discipline.id },
    select: { id: true },
  })
  const rank = await tx.rank.create({
    data: { name: uid("blue"), sortOrder: 6, rankSystemId: rankSystem.id },
    select: { id: true },
  })
  return rank.id
}

/**
 * A SEEDED BJJ rank id (the declared-belt mint is discipline-scoped to BJJ). Reads the same
 * ladder the app resolves via `getBjjDisciplineId` — never a parallel discipline. The seed
 * ranks are read, never mutated.
 */
async function bjjRankId(tx: Tx): Promise<string> {
  const rank = await tx.rank.findFirstOrThrow({
    where: { rankSystem: { discipline: { code: "bjj" } } },
    select: { id: true },
  })
  return rank.id
}

/**
 * A Join-the-Legacy lead carrying `meta.trainedUnderNodeId` (`Lead.organizationId` is required).
 * Pass `currentRankId` to also carry the signup's declared belt (the rank they named on the form).
 */
async function makeLead(
  tx: Tx,
  {
    email,
    trainedUnderNodeId,
    currentRankId,
  }: { email: string; trainedUnderNodeId: string; currentRankId?: string },
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
      meta: {
        source: "join-the-legacy",
        trainedUnderNodeId,
        ...(currentRankId ? { currentRankId } : {}),
      },
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

  it("mints the DECLARED belt (UNVERIFIED self-submit) when the lead names a BJJ currentRankId, idempotently", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeCanonicalTree(tx)
      const root = await makePerson(tx, "rigan", { treeId })
      const instructor = await makePerson(tx, "tony", { treeId, parentMemberId: root.memberId })
      const actorUserId = await makeUser(tx, `${uid("actor")}@test.local`)
      const email = `${uid("belt")}@test.local`
      await makeUser(tx, email)
      // The declared-belt mint is discipline-scoped to BJJ, so the named rank must be a
      // real seeded BJJ rank for the mint to fire.
      const rankId = await bjjRankId(tx)
      const leadId = await makeLead(tx, {
        email,
        trainedUnderNodeId: instructor.nodeId,
        currentRankId: rankId,
      })

      const result = await placeLeadIntoLineage(tx, { leadId, actorUserId, brand: BRAND })

      // The declared belt is minted as a self-submit award (source STATED, UNVERIFIED, no
      // approver) — a steward verifies it later via verifyRankEntry; nothing here promotes it.
      const award = await tx.rankAward.findFirst({
        where: { passportId: result.passportId, rankId },
        select: { source: true, verificationStatus: true, awardedById: true },
      })
      expect(award).not.toBeNull()
      expect(award?.source).toBe("STATED")
      expect(award?.verificationStatus).toBe("UNVERIFIED")
      expect(award?.awardedById).toBeNull()

      // …and its canonical RankEntry is synced UNVERIFIED (the compatibility anchor).
      const entry = await tx.rankEntry.findFirst({
        where: { passportId: result.passportId, rankId },
        select: { status: true },
      })
      expect(entry?.status).toBe("UNVERIFIED")

      // Idempotent — a re-run (auto-place then manual place) never double-mints the belt.
      await placeLeadIntoLineage(tx, { leadId, actorUserId, brand: BRAND })
      const awardCount = await tx.rankAward.count({
        where: { passportId: result.passportId, rankId },
      })
      expect(awardCount).toBe(1)
    })
  })

  it("mints NO belt when the lead carries no currentRankId (nothing declared → nothing minted)", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeCanonicalTree(tx)
      const root = await makePerson(tx, "rigan", { treeId })
      const instructor = await makePerson(tx, "tony", { treeId, parentMemberId: root.memberId })
      const actorUserId = await makeUser(tx, `${uid("actor")}@test.local`)
      const email = `${uid("nobelt")}@test.local`
      await makeUser(tx, email)
      const leadId = await makeLead(tx, { email, trainedUnderNodeId: instructor.nodeId })

      const result = await placeLeadIntoLineage(tx, { leadId, actorUserId, brand: BRAND })

      const awardCount = await tx.rankAward.count({ where: { passportId: result.passportId } })
      expect(awardCount).toBe(0)
      const entryCount = await tx.rankEntry.count({ where: { passportId: result.passportId } })
      expect(entryCount).toBe(0)
    })
  })

  it("mints NO belt when the declared rank is OUTSIDE the BJJ discipline (public mint is discipline-scoped)", async () => {
    // Security regression: `ensureDeclaredRankAward` is reachable UNAUTHENTICATED (public
    // Join-the-Legacy signup → autoPlaceSignupOnLineage) with `currentRankId` only
    // length-validated. An out-of-discipline rank cuid (another discipline's / another
    // product's rank) must NOT mint a RankAward onto the public canonical tree — the mint
    // is BJJ-scoped, mirroring the belt-router self-submit guard.
    await inRolledBackTx(async tx => {
      const treeId = await makeCanonicalTree(tx)
      const root = await makePerson(tx, "rigan", { treeId })
      const instructor = await makePerson(tx, "tony", { treeId, parentMemberId: root.memberId })
      const actorUserId = await makeUser(tx, `${uid("actor")}@test.local`)
      const email = `${uid("offdiscipline")}@test.local`
      await makeUser(tx, email)
      // A rank in a FRESH non-BJJ discipline — resolves to a real Rank, but not a BJJ one.
      const nonBjjRankId = await makeRank(tx)
      const leadId = await makeLead(tx, {
        email,
        trainedUnderNodeId: instructor.nodeId,
        currentRankId: nonBjjRankId,
      })

      const result = await placeLeadIntoLineage(tx, { leadId, actorUserId, brand: BRAND })

      // Placement still succeeds (membership is automatic) — only the belt mint is skipped.
      expect(result.alreadyPlaced).toBe(false)

      // NO award/entry for the out-of-discipline rank (nor any other rank).
      const award = await tx.rankAward.findFirst({
        where: { passportId: result.passportId, rankId: nonBjjRankId },
        select: { id: true },
      })
      expect(award).toBeNull()
      const awardCount = await tx.rankAward.count({ where: { passportId: result.passportId } })
      expect(awardCount).toBe(0)
      const entryCount = await tx.rankEntry.count({ where: { passportId: result.passportId } })
      expect(entryCount).toBe(0)

      // …and the placement audit records the mint as null (nothing minted).
      const audit = await tx.auditLog.findFirst({
        where: { action: "lineage.lead.placed-on-tree", entityId: result.memberId },
        select: { after: true },
      })
      expect(
        (audit?.after as { rankAwardMinted?: unknown } | null)?.rankAwardMinted ?? null,
      ).toBeNull()
    })
  })
})
