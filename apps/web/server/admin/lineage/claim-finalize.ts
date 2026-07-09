import { Brand } from "~/.generated/prisma/client"
import {
  bblClaimCompTermDays,
  getLineageCompEntitlementKeys,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import type { LineageCompGrantSpec } from "~/lib/entitlements/lineage-comp"
import { DIRTY_DOZEN_LABEL } from "~/lib/lineage/dirty-dozen"
import { CLAIM_REVIEW_ERROR } from "~/server/admin/lineage/claim-review-errors"
import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"
import { grantComp } from "~/server/entitlements/comp-grants"
import { attachAccount } from "~/server/identity/person-service"

/**
 * Shared APPROVED-branch side-effects for person claims — `finalizePassportClaim`
 * (SESSION_0412 FIX #3; generalized to node-optional at SESSION_0437 / ADR 0036).
 *
 * Every approved person claim (admin review, BBL one-click token-accept, the new
 * unified `reviewPassportClaim`) needs the SAME identity merge + access + comp
 * wiring. This is the single source of that truth so the callers can never drift.
 * The claim is keyed on a **Passport** (identity SoT, ADR 0025); lineage node/tree
 * context is OPTIONAL:
 *
 *   ALWAYS (identity):
 *   - guard the claimant owns no OTHER lineage node (protects the signup-Passport delete),
 *   - attach the claimant account to the claimed Passport (deleting the claimant's
 *     empty signup Passport so the unique account link is free),
 *   - mint the asserted RankAward (FI-006), and
 *   - grant the comp (manual `compOverride` wins for any brand; else BBL auto-comps Elite).
 *
 *   ONLY WHEN node context is present (a lineage claim):
 *   - resolve + require the tree member,
 *   - guard against another claimant already approved for the node,
 *   - grant / repair the NODE_EDITOR access row, and
 *   - detect the Dirty-Dozen cohort for the comp term.
 *
 * A directory-only person (Passport with no LineageNode) therefore gets a REAL
 * identity attach + brand entitlement — this is what un-stubs the old person
 * ProfileClaimRequest approval (ADR 0036 §3).
 *
 * It does NOT mutate the claim row's status, auto-cancel sibling claims, or write
 * the audit log — the caller owns those (see `cancelSiblingPassportClaims` for Gap 2).
 */

/** Prisma transaction client surface (callers pass `tx`). */
type Tx = any

/**
 * The minimal claim shape the finalize needs — caller fetches it inside the tx.
 * Keyed on the Passport; node/tree are optional door context (ADR 0036).
 */
export type FinalizePassportClaimInput = {
  id: string
  claimantUserId: string
  /** Identity key — the Passport being claimed. */
  passportId: string
  /** Current owner of that Passport (null = claimable placeholder). */
  passportUserId: string | null
  // FI-006: rank asserted at claim time; if set, approval creates an awarded RankAward.
  claimedRankId?: string | null
  // SESSION_0442: registered lineage selections asserted in the join wizard. On approval each
  // materializes into the real graph, the same way `claimedRankId` mints a RankAward:
  //   - claimedSchoolId      → a TRAINS_AT Affiliation (passport-keyed; works without a node)
  //   - trainedUnderNodeId   → an INSTRUCTOR_STUDENT edge (instructor → the claimed node)
  //   - representTreeId       → a LineageTreeMember row for the claimed node
  // The two node edges require the claim to carry a node; they no-op for a directory-only person.
  claimedSchoolId?: string | null
  trainedUnderNodeId?: string | null
  representTreeId?: string | null
  // Door context — present for a lineage claim, null for a directory-only person.
  treeId?: string | null
  nodeId?: string | null
  /**
   * When the lineage ADMIN path approves a legacy `LineageClaimRequest`, pass its id
   * here so the "another claimant already approved this node" guard (which still reads
   * the legacy table until P5) excludes the row being approved. Unified callers leave
   * this undefined.
   */
  excludeLineageClaimId?: string | null
}

export type FinalizePassportClaimResult = {
  accessGrantId: string | null
  compGrantIds: string[]
  ownershipTransferred: boolean
  passportAccountAttached: boolean
  // FI-006: id of the RankAward created from the claimed rank on approval, or null.
  rankAwardId: string | null
  // SESSION_0442: ids of the lineage selections materialized on approval, or null when the
  // selection was absent / could not apply (e.g. a node edge on a directory-only claim).
  affiliationId: string | null
  trainedUnderRelationshipId: string | null
  representMemberId: string | null
  // SESSION_0443 (ADR 0037): the instructor member the student was filed under (visual parent
  // seeded from the INSTRUCTOR_STUDENT edge), or null when there was no instructor to anchor to /
  // the instructor is not a member of the tree (student left at root for the steward).
  visualParentMemberId: string | null
}

/** NODE_EDITOR access grant for a node claim — creates the access row or repairs an existing one. */
const grantNodeEditorAccess = async (
  tx: Tx,
  {
    treeId,
    nodeId,
    memberId,
    claimantUserId,
    actorUserId,
  }: {
    treeId: string
    nodeId: string
    memberId: string
    claimantUserId: string
    actorUserId: string
  },
): Promise<string> => {
  const existingGrant = await tx.lineageTreeAccess.findFirst({
    where: {
      treeId,
      userId: claimantUserId,
      role: "NODE_EDITOR",
      revokedAt: null,
      OR: [{ nodeId }, { memberId }],
    },
    select: { id: true, nodeId: true, memberId: true },
  })

  if (!existingGrant) {
    const grant = await tx.lineageTreeAccess.create({
      data: {
        treeId,
        userId: claimantUserId,
        grantedById: actorUserId,
        role: "NODE_EDITOR",
        nodeId,
        memberId,
      },
      select: { id: true },
    })
    return grant.id
  }

  if (existingGrant.nodeId === nodeId && existingGrant.memberId === memberId) {
    return existingGrant.id
  }

  const repaired = await tx.lineageTreeAccess.update({
    where: { id: existingGrant.id },
    data: { nodeId, memberId },
    select: { id: true },
  })
  return repaired.id
}

/**
 * petey-plan-0477 Slice V3 (belt-PR rebase, TASK_04): materialize a promotion claim's photo
 * evidence onto the minted award's `RankMilestone`. The verification submission doubles as the
 * journey-photo capture (Locked-decision 4, soft-gate) — a certificate/instructor photo the member
 * uploaded to prove the promotion becomes belt-journey media once the belt is real.
 *
 * Only evidence rows carrying a `mediaId` (an uploaded photo) can materialize; url/text-only rows
 * are a link/note, not a photo, so they are skipped. Ensures the milestone exists (create if absent
 * — `rankAwardId` is `@unique`, so this is the 1:1 milestone for the just-minted award), then
 * attaches each photo idempotently (a re-approval must not duplicate an existing attachment).
 *
 * `purpose` is derived from the evidence `label`: "cert"→`certificate`, "instructor"→`instructor`,
 * else `certificate` (the default for an unlabelled promotion photo). The `MediaAttachment.purpose`
 * column is the shared string convention (Locked #2), matching the belt milestone media galleries.
 */
const MILESTONE_MEDIA_DEFAULT_PURPOSE = "certificate"

const purposeFromEvidenceLabel = (label: string | null): string => {
  const normalized = label?.toLowerCase() ?? ""
  if (normalized.includes("cert")) return "certificate"
  if (normalized.includes("instructor")) return "instructor"
  return MILESTONE_MEDIA_DEFAULT_PURPOSE
}

const materializeEvidenceToMilestone = async (
  tx: Tx,
  { claimId, rankAwardId }: { claimId: string; rankAwardId: string },
): Promise<void> => {
  // Only photo evidence (a mediaId) can become milestone media; url/text-only rows are links.
  const photos: Array<{ mediaId: string | null; label: string | null }> =
    await tx.passportClaimEvidence.findMany({
      where: { claimRequestId: claimId, mediaId: { not: null } },
      select: { mediaId: true, label: true },
    })
  if (photos.length === 0) return

  // Ensure the 1:1 milestone for the award exists (rankAwardId is @unique → upsert is safe).
  const milestone = await tx.rankMilestone.upsert({
    where: { rankAwardId },
    create: { rankAwardId },
    update: {},
    select: { id: true },
  })

  for (const photo of photos) {
    if (!photo.mediaId) continue
    // Idempotent: a re-approval must not duplicate an existing (milestone, media) attachment.
    const existing = await tx.mediaAttachment.findFirst({
      where: { rankMilestoneId: milestone.id, mediaId: photo.mediaId },
      select: { id: true },
    })
    if (existing) continue
    await tx.mediaAttachment.create({
      data: {
        rankMilestoneId: milestone.id,
        mediaId: photo.mediaId,
        purpose: purposeFromEvidenceLabel(photo.label),
      },
    })
  }
}

/**
 * FI-006 (ADR 0035 §4): mint the claimant's asserted RankAward on the claimed Passport. Idempotent —
 * an existing award for that rank is returned untouched. STATED source + VERIFIED (admin vouched).
 */
const mintAssertedRankAward = async (
  tx: Tx,
  {
    passportId,
    claimedRankId,
    actorUserId,
  }: { passportId: string; claimedRankId: string; actorUserId: string },
): Promise<string> => {
  const existing = await tx.rankAward.findFirst({
    where: { passportId, rankId: claimedRankId },
    select: { id: true, verificationStatus: true, awardedById: true },
  })
  if (existing) {
    // SESSION_0492 FIX 4 (MED): an award may already exist for this rank when it was
    // minted between submit and approve (e.g. admin add-person seeded an UNVERIFIED
    // award). Approval is authoritative, so bring the existing award UP to the approved
    // state — VERIFIED + stamp the approver as `awardedById` (which also locks it
    // read-only via `isFactEditable`). Idempotent: re-approving an already-VERIFIED,
    // already-stamped award writes the same values (a no-op-equivalent).
    if (existing.verificationStatus !== "VERIFIED" || existing.awardedById !== actorUserId) {
      await tx.rankAward.update({
        where: { id: existing.id },
        data: { verificationStatus: "VERIFIED", awardedById: actorUserId },
      })
    }
    await syncRankEntryFromAward(tx, existing.id)
    return existing.id
  }

  const created = await tx.rankAward.create({
    data: {
      passportId,
      rankId: claimedRankId,
      source: "STATED",
      verificationStatus: "VERIFIED",
      awardedById: actorUserId,
    },
    select: { id: true },
  })
  await syncRankEntryFromAward(tx, created.id)
  return created.id
}

/**
 * SESSION_0442: materialize the claimant's asserted SCHOOL into a TRAINS_AT Affiliation on the
 * claimed Passport. Idempotent — an existing affiliation to that org is returned untouched.
 * Passport-keyed, so it applies even to a directory-only person (no lineage node).
 */
const materializeClaimedSchool = async (
  tx: Tx,
  { passportId, organizationId }: { passportId: string; organizationId: string },
): Promise<string> => {
  const existing = await tx.affiliation.findFirst({
    where: { passportId, organizationId },
    select: { id: true },
  })
  if (existing) return existing.id

  const created = await tx.affiliation.create({
    data: { passportId, organizationId, role: "TRAINS_AT", isCurrent: true },
    select: { id: true },
  })
  return created.id
}

/**
 * SESSION_0442: materialize "trained under X" into an INSTRUCTOR_STUDENT edge — the instructor
 * (`fromNode`) → the claimed node (`toNode`), the direction the visual/secondary-link layer reads.
 * VERIFIED on approval (operator decision, mirroring the RankAward). Idempotent on (from, to, type);
 * skips a self-edge. Returns null when there is no claimed node to anchor the student end.
 */
export const materializeTrainedUnder = async (
  tx: Tx,
  {
    trainedUnderNodeId,
    claimedNodeId,
  }: { trainedUnderNodeId: string; claimedNodeId: string | null },
): Promise<string | null> => {
  if (!claimedNodeId || claimedNodeId === trainedUnderNodeId) return null

  const existing = await tx.lineageRelationship.findFirst({
    where: { type: "INSTRUCTOR_STUDENT", fromNodeId: trainedUnderNodeId, toNodeId: claimedNodeId },
    select: { id: true },
  })
  if (existing) return existing.id

  const created = await tx.lineageRelationship.create({
    data: {
      type: "INSTRUCTOR_STUDENT",
      fromNodeId: trainedUnderNodeId,
      toNodeId: claimedNodeId,
      isVerified: true,
      verificationStatus: "VERIFIED",
    },
    select: { id: true },
  })
  return created.id
}

/**
 * SESSION_0442: materialize "represents tree Y" by adding the claimed node as a member of that
 * tree. Idempotent via the `@@unique([treeId, nodeId])`. Returns null when there is no claimed
 * node to add.
 */
const materializeRepresentTree = async (
  tx: Tx,
  { representTreeId, claimedNodeId }: { representTreeId: string; claimedNodeId: string | null },
): Promise<string | null> => {
  if (!claimedNodeId) return null

  const existing = await tx.lineageTreeMember.findUnique({
    where: { treeId_nodeId: { treeId: representTreeId, nodeId: claimedNodeId } },
    select: { id: true },
  })
  if (existing) return existing.id

  const created = await tx.lineageTreeMember.create({
    data: { treeId: representTreeId, nodeId: claimedNodeId },
    select: { id: true },
  })
  return created.id
}

/**
 * SESSION_0443 (ADR 0037): file a student under their branch head by SEEDING the visual placement
 * from the `INSTRUCTOR_STUDENT` edge — set the student member's `primaryVisualParentMemberId` to the
 * instructor's member in the same tree. Provenance (the edge) is truth; this is the editable display
 * projection seeded from it, so a steward can re-place later. Returns the instructor member id when it
 * files, else null:
 *   - instructor is not a member of that tree → leave the student at root (steward decides);
 *   - the student member already has a visual parent → do not clobber a prior steward placement;
 *   - self-reference → skip.
 */
export const materializeVisualPlacement = async (
  tx: Tx,
  {
    treeId,
    studentMemberId,
    studentNodeId,
    trainedUnderNodeId,
  }: {
    treeId: string
    studentMemberId: string
    studentNodeId: string | null
    trainedUnderNodeId: string
  },
): Promise<string | null> => {
  if (trainedUnderNodeId === studentNodeId) return null

  const instructorMember = await tx.lineageTreeMember.findUnique({
    where: { treeId_nodeId: { treeId, nodeId: trainedUnderNodeId } },
    select: { id: true },
  })
  if (!instructorMember || instructorMember.id === studentMemberId) return null

  const student = await tx.lineageTreeMember.findUnique({
    where: { id: studentMemberId },
    select: { primaryVisualParentMemberId: true },
  })
  if (student?.primaryVisualParentMemberId) return student.primaryVisualParentMemberId

  await tx.lineageTreeMember.update({
    where: { id: studentMemberId },
    data: { primaryVisualParentMemberId: instructorMember.id },
  })
  return instructorMember.id
}

/**
 * Comp grant: a manual `compOverride` wins for any brand; otherwise BBL auto-comps the Elite tier
 * (Dirty Dozen cohort for life, everyone else one year). No grant for non-BBL without an override.
 */
const grantClaimComp = async (
  tx: Tx,
  {
    brand,
    claimId,
    claimantUserId,
    actorUserId,
    compOverride,
    dirtyDozen,
    now,
  }: {
    brand: Brand
    claimId: string
    claimantUserId: string
    actorUserId: string
    compOverride?: LineageCompGrantSpec | null
    dirtyDozen: boolean
    now: Date
  },
): Promise<string[]> => {
  if (!compOverride && brand !== Brand.BBL) return []

  const entitlementKeys = getLineageCompEntitlementKeys(
    compOverride ? compOverride.tier : LINEAGE_ELITE_ENTITLEMENT_KEY,
  )
  const term = compOverride
    ? compOverride.termDays
      ? { days: compOverride.termDays }
      : null
    : (() => {
        const days = bblClaimCompTermDays(dirtyDozen)
        return days ? { days } : null
      })()

  const compResult = await grantComp({
    db: tx,
    brand,
    grantorUserId: actorUserId,
    granteeUserId: claimantUserId,
    entitlementKeys,
    term,
    reason: `lineage-claim-${claimId}`,
    now,
  })
  return compResult.grants.map((grant: { id: string }) => grant.id)
}

type AssertedSelectionsResult = {
  rankAwardId: string | null
  affiliationId: string | null
  trainedUnderRelationshipId: string | null
  representMemberId: string | null
  visualParentMemberId: string | null
}

/**
 * SESSION_0443: materialize ALL asserted claim selections in one place — the registered wizard picks
 * (claimedRankId → RankAward, ADR 0035; claimedSchoolId → Affiliation; trainedUnderNodeId →
 * INSTRUCTOR_STUDENT edge; representTreeId → tree member; + ADR 0037 visual placement). Extracted from
 * `finalizePassportClaim` to keep that orchestrator's complexity bounded — each selection's own logic
 * lives in the materializers above. Every selection is independent and skipped when its ref is absent.
 */
const materializeAssertedSelections = async (
  tx: Tx,
  {
    claim,
    treeId,
    nodeId,
    memberId,
    actorUserId,
  }: {
    claim: FinalizePassportClaimInput
    treeId: string | null
    nodeId: string | null
    memberId: string | null
    actorUserId: string
  },
): Promise<AssertedSelectionsResult> => {
  const result: AssertedSelectionsResult = {
    rankAwardId: null,
    affiliationId: null,
    trainedUnderRelationshipId: null,
    representMemberId: null,
    visualParentMemberId: null,
  }

  // Asserted RankAward (FI-006, ADR 0035 §4) — keyed on the claimed Passport.
  if (claim.claimedRankId) {
    result.rankAwardId = await mintAssertedRankAward(tx, {
      passportId: claim.passportId,
      claimedRankId: claim.claimedRankId,
      actorUserId,
    })
  }
  // School is passport-keyed (works without a node); the two node edges anchor on the claimed node.
  if (claim.claimedSchoolId) {
    result.affiliationId = await materializeClaimedSchool(tx, {
      passportId: claim.passportId,
      organizationId: claim.claimedSchoolId,
    })
  }
  if (claim.trainedUnderNodeId) {
    result.trainedUnderRelationshipId = await materializeTrainedUnder(tx, {
      trainedUnderNodeId: claim.trainedUnderNodeId,
      claimedNodeId: nodeId,
    })
  }
  if (claim.representTreeId) {
    result.representMemberId = await materializeRepresentTree(tx, {
      representTreeId: claim.representTreeId,
      claimedNodeId: nodeId,
    })
  }

  // ADR 0037: seed the student's visual parent from the instructor edge so they render UNDER their
  // branch head. Target the represented tree (else the claim's node tree); the student member is the
  // one just created/resolved there.
  if (claim.trainedUnderNodeId) {
    const placementTreeId = claim.representTreeId ?? treeId
    const studentMemberId = result.representMemberId ?? memberId ?? null
    if (placementTreeId && studentMemberId) {
      result.visualParentMemberId = await materializeVisualPlacement(tx, {
        treeId: placementTreeId,
        studentMemberId,
        studentNodeId: nodeId,
        trainedUnderNodeId: claim.trainedUnderNodeId,
      })
    }
  }

  return result
}

export const finalizePassportClaim = async (
  tx: Tx,
  {
    claim,
    brand,
    actorUserId,
    compOverride,
    now = new Date(),
  }: {
    claim: FinalizePassportClaimInput
    brand: Brand
    actorUserId: string
    /** Admin-supplied manual comp override; takes precedence over the BBL auto-grant. */
    compOverride?: LineageCompGrantSpec | null
    now?: Date
  },
): Promise<FinalizePassportClaimResult> => {
  let accessGrantId: string | null = null
  let compGrantIds: string[] = []
  let ownershipTransferred = false
  let passportAccountAttached = false

  const hasNode = claim.nodeId != null && claim.treeId != null
  const treeId = claim.treeId ?? null
  const nodeId = claim.nodeId ?? null

  // --- Node-only guards + member resolution ------------------------------------------------
  let member: { id: string } | null = null
  if (hasNode) {
    member = await tx.lineageTreeMember.findUnique({
      where: { treeId_nodeId: { treeId: treeId as string, nodeId: nodeId as string } },
      select: { id: true },
    })

    if (!member) {
      throw new Error(CLAIM_REVIEW_ERROR.NODE_NOT_IN_TREE)
    }

    const alreadyApproved = await tx.lineageClaimRequest.findFirst({
      where: {
        treeId: treeId as string,
        nodeId: nodeId as string,
        status: "APPROVED",
        ...(claim.excludeLineageClaimId ? { NOT: { id: claim.excludeLineageClaimId } } : {}),
      },
      select: { id: true, claimantUserId: true },
    })

    if (alreadyApproved && alreadyApproved.claimantUserId !== claim.claimantUserId) {
      throw new Error(CLAIM_REVIEW_ERROR.NODE_ALREADY_APPROVED)
    }
  }

  // The claimant must not already own a DIFFERENT lineage node — ALWAYS checked (a
  // directory-only claim still deletes the claimant's signup Passport below, which would
  // cascade-delete any node that Passport owns). For a node claim, exclude the claimed node.
  const claimantExistingNode = await tx.lineageNode.findFirst({
    where: {
      passport: { userId: claim.claimantUserId },
      ...(nodeId ? { NOT: { id: nodeId } } : {}),
    },
    select: { id: true },
  })

  if (claimantExistingNode) {
    throw new Error(CLAIM_REVIEW_ERROR.CLAIMANT_HAS_NODE)
  }

  // --- Identity attach (ALWAYS) ------------------------------------------------------------
  // D1: attach the claimant account to the claimed Passport. One attach lights up every
  // satellite (profile + node + ranks + affiliations) at once.
  if (claim.passportUserId !== claim.claimantUserId) {
    // Claim merge (SESSION_0392): every signed-up user has a Passport (signup's identity shell).
    // Claiming means "I AM this imported person", so the claimant's own signup Passport is
    // superseded by the richer claimed identity. The CLAIMANT_HAS_NODE guard above already
    // ensured that Passport owns no lineage node; delete it (its empty signup directory profile
    // cascades) so the account is free to bind to the claimed Passport. The claimant User and
    // all account-side CARRY rows (memberships, entitlements, …) are untouched.
    const claimantPassport = await tx.passport.findUnique({
      where: { userId: claim.claimantUserId },
      select: { id: true },
    })
    if (claimantPassport && claimantPassport.id !== claim.passportId) {
      await tx.passport.delete({ where: { id: claimantPassport.id } })
    }

    await attachAccount({ passportId: claim.passportId, userId: claim.claimantUserId }, tx)
    ownershipTransferred = true
    passportAccountAttached = true
  }

  // --- NODE_EDITOR access grant (node claims only) -----------------------------------------
  if (hasNode && member) {
    accessGrantId = await grantNodeEditorAccess(tx, {
      treeId: treeId as string,
      nodeId: nodeId as string,
      memberId: member.id,
      claimantUserId: claim.claimantUserId,
      actorUserId,
    })
  }

  // --- Asserted selections (RankAward / school / trained-under edge / represent tree / visual ----
  // placement) — all the registered wizard picks materialized into real graph facts on approval.
  const selections = await materializeAssertedSelections(tx, {
    claim,
    treeId,
    nodeId,
    memberId: member?.id ?? null,
    actorUserId,
  })

  // --- Comp grant --------------------------------------------------------------------------
  // Dirty-Dozen cohort drives the BBL comp term; the signal is the claimed node's visual group
  // (a directory-only person with no node defaults to non-DD).
  const dirtyDozen =
    hasNode && member
      ? (
          await tx.lineageTreeMember.findUnique({
            where: { treeId_nodeId: { treeId: treeId as string, nodeId: nodeId as string } },
            select: { visualGroup: { select: { label: true } } },
          })
        )?.visualGroup?.label === DIRTY_DOZEN_LABEL
      : false

  compGrantIds = await grantClaimComp(tx, {
    brand,
    claimId: claim.id,
    claimantUserId: claim.claimantUserId,
    actorUserId,
    compOverride,
    dirtyDozen,
    now,
  })

  return {
    accessGrantId,
    compGrantIds,
    ownershipTransferred,
    passportAccountAttached,
    rankAwardId: selections.rankAwardId,
    affiliationId: selections.affiliationId,
    trainedUnderRelationshipId: selections.trainedUnderRelationshipId,
    representMemberId: selections.representMemberId,
    visualParentMemberId: selections.visualParentMemberId,
  }
}

/** The minimal claim shape a promotion finalize needs — the member's Passport + the asserted belt. */
export type FinalizeRankPromotionInput = {
  id: string
  /** The member's OWN Passport (a promotion is never an identity attach). */
  passportId: string
  /** The belt asserted above the ceiling; approval mints it as a VERIFIED award. */
  claimedRankId?: string | null
}

export type FinalizeRankPromotionResult = {
  rankAwardId: string | null
  /** True when this approval flipped an as-yet-unverified node the member owns (first-promotion verify). */
  nodeVerified: boolean
}

/**
 * Approve a `RANK_PROMOTION` claim (petey-plan-0477 Slice V3; ADR 0035 Amendment 1, B1).
 *
 * Deliberately NOT `finalizePassportClaim`: that path assumes an UNCLAIMED placeholder and
 * runs the identity attach (delete signup Passport + `attachAccount`), the `CLAIMANT_HAS_NODE`
 * guard, NODE_EDITOR grants, and the Elite comp — every one of which is wrong for a promotion,
 * which is on the member's ALREADY-owned Passport. A promotion verifies a **belt**, not an
 * identity, so this does exactly three things and nothing else:
 *
 *   1. Mint the asserted belt as a **VERIFIED** `RankAward` (reuse `mintAssertedRankAward`,
 *      idempotent on `[passportId, rankId]`). This is the whole point — a self-declared belt
 *      that lived only on the claim record becomes awarded truth (ADR 0035 §4/§5: no UNVERIFIED
 *      award ever existed to leak; the pending belt was never on the tree).
 *   2. Materialize the claim's photo `PassportClaimEvidence` (certificate / instructor photos the
 *      member uploaded as the soft-gate) onto the minted award's `RankMilestone` as media —
 *      wired at the belt-PR rebase (TASK_04) now that `RankMilestone` is on `main` (Slice 2). The
 *      verification submission doubles as the journey-photo capture (Locked-decision 4); a claim
 *      with no photo evidence simply materializes nothing.
 *   3. If the member's node is still unverified, flip `isVerified` — approving a member's first
 *      promotion also verifies the person (the SESSION_0474 on-ramp). A verified member is a
 *      no-op. `LineageNode.isVerified` stays the ONE per-member trust flag (never a per-belt axis).
 *
 * No comp grant (a routine promotion is not a lineage-claim comp trigger; the member's entitlement
 * comes from their tier). The caller owns the status flip + audit.
 */
export const finalizeRankPromotion = async (
  tx: Tx,
  { claim, actorUserId }: { claim: FinalizeRankPromotionInput; actorUserId: string },
): Promise<FinalizeRankPromotionResult> => {
  let rankAwardId: string | null = null
  if (claim.claimedRankId) {
    rankAwardId = await mintAssertedRankAward(tx, {
      passportId: claim.passportId,
      claimedRankId: claim.claimedRankId,
      actorUserId,
    })
    // The submitted photo evidence becomes belt-journey media on the newly-real belt.
    await materializeEvidenceToMilestone(tx, { claimId: claim.id, rankAwardId })
  }

  // Approving the promotion verifies the person too, but only flips an as-yet-unverified node the
  // member owns (a first promotion); an already-verified founder is untouched. `passportId` is
  // @unique on LineageNode, so there is at most one.
  let nodeVerified = false
  const node = await tx.lineageNode.findUnique({
    where: { passportId: claim.passportId },
    select: { id: true, isVerified: true },
  })
  if (node && !node.isVerified) {
    await tx.lineageNode.update({ where: { id: node.id }, data: { isVerified: true } })
    nodeVerified = true
  }

  return { rankAwardId, nodeVerified }
}

/**
 * Gap 2 (ADR 0036 §3): when a claim on a Passport is finalized as the winner, auto-cancel every
 * OTHER claimant's open claim (PENDING / NEEDS_INFO) on the same Passport so a won identity can no
 * longer be double-claimed through a second door. Returns the cancelled claim ids. The caller is
 * responsible for the surrounding tx + audit; this only flips status.
 */
export const cancelSiblingPassportClaims = async (
  tx: Tx,
  {
    passportId,
    winnerClaimId,
    reviewerUserId,
    now = new Date(),
  }: { passportId: string; winnerClaimId: string; reviewerUserId: string; now?: Date },
): Promise<string[]> => {
  const siblings = await tx.passportClaimRequest.findMany({
    where: {
      passportId,
      status: { in: ["PENDING", "NEEDS_INFO"] },
      NOT: { id: winnerClaimId },
    },
    select: { id: true },
  })
  if (siblings.length === 0) return []

  await tx.passportClaimRequest.updateMany({
    where: { id: { in: siblings.map((s: { id: string }) => s.id) } },
    data: {
      status: "CANCELLED",
      reviewerNote: `Auto-cancelled: this person was claimed via another request (${winnerClaimId}).`,
      reviewedById: reviewerUserId,
      reviewedAt: now,
    },
  })

  return siblings.map((s: { id: string }) => s.id)
}
