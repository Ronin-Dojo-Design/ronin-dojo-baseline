import { RankAwardSource, RankAwardVerificationStatus } from "~/.generated/prisma/client"
import type { Brand } from "~/.generated/prisma/client"
import { parseLeadLineageMeta } from "~/server/admin/leads/lineage-selections"
import {
  materializeTrainedUnder,
  materializeVisualPlacement,
} from "~/server/admin/lineage/claim-finalize"
import { getBjjDisciplineId } from "~/server/belt/queries"
import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"
import { createPassport, ensurePassportForUser } from "~/server/identity/person-service"
import {
  CREATE_LINEAGE_MEMBER_ERROR,
  createLineageMember,
} from "~/server/web/lineage/create-lineage-member"
import type { db as appDb } from "~/services/db"

type AppDb = typeof appDb

/** Prisma transaction client surface (caller passes `tx`). */
// biome-ignore lint/suspicious/noExplicitAny: tx client surface.
type Tx = any

export const CANONICAL_TREE_SLUG = "rigan-machado-lineage"

export const PLACE_LEAD_ERROR = {
  LEAD_NOT_FOUND: "Lead not found.",
  NOT_JOIN_LEGACY: "This lead is not a Join-the-Legacy signup.",
  NO_INSTRUCTOR: "This lead did not name a registered instructor (no trainedUnderNodeId).",
  TREE_NOT_FOUND: "Canonical lineage tree not found.",
  INSTRUCTOR_NOT_FOUND: "The named instructor node no longer exists.",
} as const

export type PlaceLeadIntoLineageResult = {
  /** True when the student was already a member of the tree — the action was a no-op. */
  alreadyPlaced: boolean
  passportId: string
  nodeId: string
  memberId: string
  /** The instructor member the student was filed under, or null when the instructor is not a tree member. */
  visualParentMemberId: string | null
  trainedUnderRelationshipId: string | null
  /** True when the student got a brand-new accountless placeholder Passport (lead had no User). */
  placeholderCreated: boolean
}

/**
 * Mint the lead's DECLARED belt — the rank they named on the Join-the-Legacy form
 * (`meta.currentRankId`), which placement historically dropped (the Jay Farrell /
 * Tony's-students bug). Inside the placement transaction, create the member's stated
 * `RankAward` for that rank — `source: STATED`, `verificationStatus: UNVERIFIED` (a
 * self-submit; a steward verifies it via `verifyRankEntry`) — then sync the canonical
 * `RankEntry`. Mirrors the create shape in `server/admin/users/actions.ts` (createPerson).
 *
 * Discipline-scoped: mints ONLY when the named rank belongs to the BBL BJJ discipline.
 * This helper is reachable UNAUTHENTICATED (public Join-the-Legacy signup →
 * `createJoinLegacyInterest`'s `after()` hook → `autoPlaceSignupOnLineage` →
 * `placeLeadIntoLineage`) with `currentRankId` only length-validated, so without this
 * guard an anon could mint a `RankAward` for ANY rank cuid — a different discipline's or
 * another product's rank — onto the public canonical tree. Mirrors the belt-router
 * self-submit discipline guard (`server/belt/router.ts`); an out-of-discipline rank is
 * skipped exactly like an unknown rank (no mint). No ceiling check is applied: a fresh
 * signup is award-less (ceiling resolves null → every declaration would reject), which
 * would drop a legit high belt (Jay Farrell). The belt stays UNVERIFIED + steward-reviewed
 * — that is the accepted control for "is this belt real".
 *
 * Idempotent + defensive: skips when the lead named no rank, when the id no longer
 * resolves to a Rank, when the rank is not in the BJJ discipline, or when the member
 * already holds ANY award for that rank — so a re-run (auto-place then manual place) never
 * double-mints. Returns the minted award id, or null when nothing was minted.
 */
async function ensureDeclaredRankAward(
  tx: Tx,
  { passportId, currentRankId }: { passportId: string; currentRankId: string | null },
): Promise<string | null> {
  if (!currentRankId) return null

  const rank = await tx.rank.findUnique({
    where: { id: currentRankId },
    select: { id: true, rankSystem: { select: { disciplineId: true } } },
  })
  if (!rank) return null

  // Discipline-scope the mint (public unauthenticated reachability — see docstring): only
  // the declared belt for a BBL BJJ rank is minted. An out-of-discipline rank is skipped
  // with the same semantics as an unknown rank. Discipline id is stable reference data.
  const bjjDisciplineId = await getBjjDisciplineId(tx)
  if (rank.rankSystem?.disciplineId !== bjjDisciplineId) return null

  const existing = await tx.rankAward.findFirst({
    where: { passportId, rankId: currentRankId },
    select: { id: true },
  })
  if (existing) return null

  const award = await tx.rankAward.create({
    data: {
      passportId,
      rankId: currentRankId,
      source: RankAwardSource.STATED,
      verificationStatus: RankAwardVerificationStatus.UNVERIFIED,
    },
    select: { id: true },
  })
  await syncRankEntryFromAward(tx, award.id)
  return award.id
}

/**
 * FI-003 — the transactional core of "PLACE a Join-the-Legacy signup on the canonical lineage tree
 * UNDER the instructor they named". This is NOT an approval or a verification: membership is automatic
 * (ADR 0035 / bbl-verification-claim-display-model, SESSION_0474) — a new self-submit is *placed* under
 * their declared instructor on every lineage surface and starts **Unverified**. Placement is not gated
 * behind any approval; the SEPARATE existing Verify toggle (Brian / Tony Hua / the member's RBAC
 * instructor) is the only thing that flips `LineageNode.isVerified`. This core never verifies (never
 * flips `LineageNode.isVerified`) and never marks the member claimable. It DOES mint the signup's
 * **declared belt** — the rank they named on the form (`meta.currentRankId`) — as an UNVERIFIED
 * self-submit `RankAward` so their belt is not silently dropped; a steward verifies it separately.
 *
 * Runs INSIDE an existing `$transaction` (caller passes `tx`) so it stays directly unit-testable via
 * the SOP §5d rolled-back-tx pattern (no session mocks) AND is reused by two callers with no forked
 * implementation: (a) auto-placement at signup inside `createJoinLegacyInterest`, and (b) the manual
 * steward fallback action in `place-lead.ts` (thin `adminActionClient` wrapper) for leads that weren't
 * auto-placed (instructor didn't resolve, or pre-existing leads).
 *
 * Placement machinery is REUSED wholesale from the `PassportClaimRequest` approval path (ADR 0037
 * branch-head placement) — no new schema, no `canAnchorStudents` toggle, no new authz. Being a member
 * of the canonical tree IS the on-tree presence; the canvas/timeline render arbitrary depth, so a
 * student under a mid-tree anchor needs zero UI changes.
 *
 * Steps:
 *   1. Read the lead, assert it is a Join-the-Legacy signup carrying `meta.trainedUnderNodeId`.
 *   2. Resolve the student's Passport:
 *        - lead has a User (by email) → `ensurePassportForUser` (bind to / mint the account's Passport);
 *        - lead has NO User (e.g. Jay Farrell — no finished account) → mint an ACCOUNTLESS placeholder
 *          Passport from the lead's name. The account attaches on his next sign-in via the existing
 *          pending-binding mechanism — this is NOT a claim and the placeholder is NOT claimable.
 *   3. `createLineageMember` on the canonical tree → the student's `LineageNode` + `LineageTreeMember`,
 *      then force `LineageTreeMember.isClaimable = false` (a signup is never claimable — Claim is ONLY
 *      the WP-import placeholder flow; a signup must not get a claim CTA).
 *   4. `materializeTrainedUnder` → the VERIFIED `INSTRUCTOR_STUDENT` edge (instructor → student).
 *   5. `materializeVisualPlacement` → seed `primaryVisualParentMemberId` = the instructor's member so
 *      the student renders UNDER them (instructor-not-a-member → left at root, existing semantics).
 *   6. `ensureDeclaredRankAward` → mint the belt the signup NAMED on the form (`meta.currentRankId`)
 *      as an UNVERIFIED self-submit `RankAward` + synced `RankEntry` (idempotent — skips if the rank
 *      is unknown or the member already holds it).
 *   7. Audit-log write.
 *
 * Idempotent: a re-run finds the student already a member (`createLineageMember` throws
 * `MEMBER_EXISTS`) → resolves the existing placement (and heals the declared belt if it was never
 * minted) and returns `alreadyPlaced: true`; the edge, visual, and belt-mint materializers are all
 * idempotent. Verification stays Unverified — nothing here ever sets `LineageNode.isVerified`
 * (self-submit truth, ADR 0035).
 */
export const placeLeadIntoLineage = async (
  tx: Tx,
  { leadId, actorUserId, brand }: { leadId: string; actorUserId: string; brand: Brand },
): Promise<PlaceLeadIntoLineageResult> => {
  const lead = await tx.lead.findFirst({
    where: { id: leadId, brand },
    select: { id: true, email: true, firstName: true, lastName: true, meta: true },
  })
  if (!lead) throw new Error(PLACE_LEAD_ERROR.LEAD_NOT_FOUND)

  const meta = lead.meta as Record<string, unknown> | null
  const source = meta && typeof meta === "object" ? (meta as { source?: unknown }).source : null
  if (source !== "join-the-legacy") throw new Error(PLACE_LEAD_ERROR.NOT_JOIN_LEGACY)

  const { trainedUnderNodeId, currentRankId } = parseLeadLineageMeta(lead.meta)
  if (!trainedUnderNodeId) throw new Error(PLACE_LEAD_ERROR.NO_INSTRUCTOR)

  // Canonical tree (brand-scoped) must exist.
  const tree = await tx.lineageTree.findFirst({
    where: { slug: CANONICAL_TREE_SLUG, brand },
    select: { id: true },
  })
  if (!tree) throw new Error(PLACE_LEAD_ERROR.TREE_NOT_FOUND)

  // The named instructor node must still exist.
  const instructorNode = await tx.lineageNode.findUnique({
    where: { id: trainedUnderNodeId },
    select: { id: true },
  })
  if (!instructorNode) throw new Error(PLACE_LEAD_ERROR.INSTRUCTOR_NOT_FOUND)

  // --- Lead-scoped idempotency (accountless placeholders) ----------------------------------
  // An account-bound lead re-resolves to the SAME Passport (`ensurePassportForUser`), so the
  // `MEMBER_EXISTS` guard below makes re-runs a no-op. An ACCOUNTLESS lead (Jay Farrell) has no
  // stable identity key — `createPassport` would mint a FRESH placeholder each run, producing a
  // duplicate member. Guard that by recording the placed member id on `lead.meta.placedMemberId`
  // and short-circuiting when it still resolves. This makes placement idempotent for every shape.
  const priorPlacedMemberId =
    meta && typeof meta === "object"
      ? ((meta as { placedMemberId?: unknown }).placedMemberId ?? null)
      : null
  if (typeof priorPlacedMemberId === "string" && priorPlacedMemberId) {
    const priorMember = await tx.lineageTreeMember.findFirst({
      where: { id: priorPlacedMemberId, treeId: tree.id },
      select: {
        id: true,
        nodeId: true,
        primaryVisualParentMemberId: true,
        node: { select: { passportId: true } },
      },
    })
    if (priorMember) {
      // Heal the declared belt for a member placed before the mint existed (idempotent —
      // no-ops when they already hold the award).
      await ensureDeclaredRankAward(tx, {
        passportId: priorMember.node.passportId,
        currentRankId,
      })
      return {
        alreadyPlaced: true,
        passportId: priorMember.node.passportId,
        nodeId: priorMember.nodeId,
        memberId: priorMember.id,
        visualParentMemberId: priorMember.primaryVisualParentMemberId,
        trainedUnderRelationshipId: null,
        placeholderCreated: false,
      }
    }
    // The recorded member was removed — fall through and re-place (the marker is stale).
  }

  // --- Resolve the student's Passport ------------------------------------------------------
  // Bind to the EXISTING User's Passport when the account exists; otherwise mint an accountless
  // placeholder (lead never signed up — Jay Farrell case; the account attaches on sign-in).
  const studentUser = await tx.user.findUnique({
    where: { email: lead.email },
    select: { id: true },
  })

  const displayName = [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim() || lead.email

  let passportId: string
  let placeholderCreated = false
  if (studentUser) {
    // Binds to the account's existing Passport (all 4 prod signups already have one); the name is only
    // used if the account somehow lacks a Passport and one must be minted (createPassportSchema refine).
    const passport = await ensurePassportForUser(studentUser.id, { displayName }, tx as AppDb)
    passportId = passport.id
  } else {
    const passport = await createPassport({ displayName }, tx as AppDb)
    passportId = passport.id
    placeholderCreated = true
  }

  // --- Place the student on the canonical tree (idempotent) --------------------------------
  // createLineageMember upserts the node and throws MEMBER_EXISTS when the node is already a member —
  // that is the idempotency signal: resolve the existing placement and return no-op.
  let nodeId: string
  let memberId: string
  let alreadyPlaced = false
  try {
    const placement = await createLineageMember({
      db: tx as AppDb,
      brand,
      actorUserId,
      memberPassportId: passportId,
      treeId: tree.id,
      // No parent here — `materializeTrainedUnder` + `materializeVisualPlacement` below file the
      // student under their instructor (the VERIFIED `INSTRUCTOR_STUDENT` edge). Passing a parent
      // would have `createLineageMember` write its own (Unverified) `INSTRUCTOR_STUDENT` edge; the
      // materializers own that here so this stays the single source (and no rank promotion applies).
      parentMemberId: null,
    })
    nodeId = placement.nodeId
    memberId = placement.memberId
  } catch (error) {
    if (error instanceof Error && error.message === CREATE_LINEAGE_MEMBER_ERROR.MEMBER_EXISTS) {
      const node = await tx.lineageNode.findUnique({
        where: { passportId },
        select: { id: true },
      })
      if (!node) throw error
      const member = await tx.lineageTreeMember.findUnique({
        where: { treeId_nodeId: { treeId: tree.id, nodeId: node.id } },
        select: { id: true },
      })
      if (!member) throw error
      nodeId = node.id
      memberId = member.id
      alreadyPlaced = true
    } else {
      throw error
    }
  }

  // A signup is NEVER claimable — Claim is ONLY the WP-import placeholder flow (a placeholder
  // Passport with `user == null` that a real person later claims). `createLineageMember` /
  // `LineageTreeMember` default `isClaimable` to true, so force it false here (also heals a member
  // placed before this fix on an idempotent re-run). Placement does NOT create any claim/claimable
  // state — the accountless placeholder attaches its account on sign-in, not via a claim.
  await tx.lineageTreeMember.update({
    where: { id: memberId },
    data: { isClaimable: false },
  })

  // --- Materialize the instructor edge + visual placement (both idempotent) ----------------
  const trainedUnderRelationshipId = await materializeTrainedUnder(tx, {
    trainedUnderNodeId,
    claimedNodeId: nodeId,
  })
  const visualParentMemberId = await materializeVisualPlacement(tx, {
    treeId: tree.id,
    studentMemberId: memberId,
    studentNodeId: nodeId,
    trainedUnderNodeId,
  })

  // Mint the signup's declared belt (the rank named on the form) as an UNVERIFIED
  // self-submit award — otherwise a join-signup's belt is silently dropped. A steward
  // verifies it later via `verifyRankEntry`.
  const rankAwardMinted = await ensureDeclaredRankAward(tx, { passportId, currentRankId })

  await tx.auditLog.create({
    data: {
      brand,
      action: "lineage.lead.placed-on-tree",
      entityType: "LineageTreeMember",
      entityId: memberId,
      userId: actorUserId,
      after: {
        leadId: lead.id,
        passportId,
        nodeId,
        memberId,
        treeId: tree.id,
        trainedUnderNodeId,
        visualParentMemberId,
        trainedUnderRelationshipId,
        placeholderCreated,
        alreadyPlaced,
        rankAwardMinted,
      },
    },
  })

  // Record the placed member id on the lead so a later re-run (esp. an accountless placeholder that
  // would otherwise mint a fresh Passport) short-circuits to a no-op above. Merge into existing meta.
  await tx.lead.update({
    where: { id: lead.id },
    data: {
      meta: {
        ...(meta && typeof meta === "object" && !Array.isArray(meta) ? meta : {}),
        placedMemberId: memberId,
      },
    },
  })

  return {
    alreadyPlaced,
    passportId,
    nodeId,
    memberId,
    visualParentMemberId,
    trainedUnderRelationshipId,
    placeholderCreated,
  }
}

/**
 * Resolve a User id to attribute the placement audit-log row to. The `AuditLog.userId` FK is required,
 * but a guest signup has no account yet (it's provisioned later on magic-link verify). Prefer the
 * signed-in user when present; otherwise attribute to the canonical tree's owner, else the first
 * platform admin. Returns null only when the DB somehow has no admin/owner (auto-placement then skips
 * — best-effort, never blocks the signup). Reused so both callers write a valid audit actor.
 */
export const resolvePlacementActorUserId = async (
  db: AppDb,
  { sessionUserId, brand }: { sessionUserId?: string | null; brand: Brand },
): Promise<string | null> => {
  if (sessionUserId) return sessionUserId

  const tree = await db.lineageTree.findFirst({
    where: { slug: CANONICAL_TREE_SLUG, brand },
    select: { ownerNode: { select: { passport: { select: { userId: true } } } } },
  })
  const ownerUserId = tree?.ownerNode?.passport?.userId
  if (ownerUserId) return ownerUserId

  const admin = await db.user.findFirst({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  })
  return admin?.id ?? null
}

/**
 * FI-003 auto-placement — the best-effort wrapper called from `createJoinLegacyInterest`'s post-commit
 * `after()` hook when a NEW signup (not a claim of an existing node) named a resolvable instructor.
 * Places the signup on the canonical tree under that instructor at submit time: Unverified, NOT
 * claimable, bound to the signup's account (or an accountless placeholder that attaches on sign-in).
 *
 * MUST NOT break the signup — placement runs in its OWN transaction AFTER the lead has committed, and
 * any failure (instructor no longer a canonical member, race, DB error) is swallowed + logged. A
 * placement failure never loses the lead or the account. Idempotent: re-running for an already-placed
 * lead is a no-op. Skips silently when no valid audit actor can be resolved.
 */
export const autoPlaceSignupOnLineage = async (
  db: AppDb,
  { leadId, sessionUserId, brand }: { leadId: string; sessionUserId?: string | null; brand: Brand },
): Promise<void> => {
  try {
    const actorUserId = await resolvePlacementActorUserId(db, { sessionUserId, brand })
    if (!actorUserId) return

    await db.$transaction(tx => placeLeadIntoLineage(tx, { leadId, actorUserId, brand }))
  } catch (error) {
    // Best-effort: a placement failure must never lose the lead or the account. The manual steward
    // "Place on lineage tree" control on /app/leads/[id] remains the fallback for these leads.
    console.error("[lineage] auto-placement of Join-the-Legacy signup failed", { leadId, error })
  }
}
