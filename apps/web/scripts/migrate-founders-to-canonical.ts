import "dotenv/config"

import { readFileSync, writeFileSync } from "node:fs"
import { DIRTY_DOZEN_LABEL } from "~/lib/lineage/dirty-dozen"
import { repointPromoterIdentityForMerge } from "~/server/identity/repoint-promoter-identity"
import { db } from "~/services/db"

/**
 * SESSION_0508 (D-034, TASK_01) — migrate the 4 founders from the unpublished
 * `rigan-machado-bjj-lineage` clone trees onto the published canonical `rigan-machado-lineage`.
 * Data-only (NO schema change). Encodes the 8 operator-ratified forks (SESSION_0508 grill):
 *
 *  (a) Topology mirrors the clones: Carlos Gracie Sr (root) → Carlos Gracie Jr → Rigan (re-parent
 *      Rigan's existing canonical member row); Erik Paulson + Rick Minter are Rigan's STUDENTS
 *      (clone placement: parent=Rigan, sort 5 and 7).
 *  (b) Recreate minimal new LineageTreeMember rows — the clone rows are the placement SPEC only.
 *  (c) NO verification writes, NO new provenance edges (all 4 already have VERIFIED edges).
 *  (d) Erik swap-in-place: repoint the canonical `erik-james-paulson` member row's nodeId → the
 *      rich `erik-paulson` node (member id/placement kept; sort mirrors the clone spec); DELETE
 *      the backfilled duplicate rigan→erik-james-paulson edge; DELETE the placeholder node +
 *      passport; the placeholder's DirectoryProfile is repointed to the rich passport if it is
 *      the only profile, else deleted (decided from data; printed in dry-run).
 *  (e) Tree `defaultRootMemberId` → Carlos Sr's new member row.
 *  (f) Erik + Rick join the existing "Dirty Dozen" visual group on canonical (found by label).
 *
 * Engineering: all reads OUTSIDE the tx; ONE Serializable transaction for the mutation with
 * generous maxWait/timeout (Neon cold-start P2028); in-tx asserts (canonical published + slug,
 * member count moves by exactly the planned creates, founder slugs resolved, no pre-existing
 * published-tree row deleted) — any mismatch throws and rolls back. JSON backup of every row
 * about to be created/updated/deleted is written BEFORE the tx (path echoed). Idempotent: a
 * second --apply finds nothing to do and says so.
 *
 *   bun scripts/migrate-founders-to-canonical.ts                     # dry-run (default)
 *   bun scripts/migrate-founders-to-canonical.ts --apply             # mutate + JSON backup
 *   bun scripts/migrate-founders-to-canonical.ts --rollback <file>   # restore from a backup
 *   … --expect-members=77   # STRICT pre-count assert (use on the gated prod run)
 *
 * Prod (HELD on operator go): SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod scripts/… --apply
 */

const CANONICAL_SLUG = "rigan-machado-lineage"
const CLONE_SLUG = "rigan-machado-bjj-lineage"

const SR_SLUG = "carlos-gracie-sr"
const JR_SLUG = "carlos-gracie-jr"
const RIGAN_SLUG = "rigan-machado"
const ERIK_RICH_SLUG = "erik-paulson"
const ERIK_PLACEHOLDER_SLUG = "erik-james-paulson"
const RICK_SLUG = "rick-minter"

// Ratified placement fallback (only used if the clone spec rows are gone, e.g. re-run after
// clone retirement). Values verified against the clone trees at SESSION_0508 discovery.
const FALLBACK_SPEC = {
  [SR_SLUG]: { visualSortOrder: 0, isClaimable: false },
  [JR_SLUG]: { visualSortOrder: 1, isClaimable: false },
  [ERIK_RICH_SLUG]: { visualSortOrder: 5, isClaimable: true },
  [RICK_SLUG]: { visualSortOrder: 7, isClaimable: true },
} as const

const args = process.argv.slice(2)
const isApply = args.includes("--apply")
const rollbackIdx = args.indexOf("--rollback")
const rollbackFile = rollbackIdx >= 0 ? args[rollbackIdx + 1] : null
const expectArg = args.find(a => a.startsWith("--expect-members="))
const expectMembers = expectArg ? Number(expectArg.split("=")[1]) : null

// oxlint-disable-next-line no-explicit-any -- tx client surface (prior-art pattern).
type Tx = any

type MemberSnapshot = {
  id: string
  treeId: string
  nodeId: string
  visualSortOrder: number
  showPromotionDatePublic: boolean
  showRankPublic: boolean
  isClaimable: boolean
  isCollapsedDefault: boolean
  primaryVisualParentMemberId: string | null
  visualGroupId: string | null
  createdAt: string
}

type Backup = {
  ts: string
  treeId: string
  // Creates are identified for rollback by the @@unique(treeId,nodeId) pair — ids are DB-minted.
  plannedCreates: Array<{ nodeId: string; nodeSlug: string }>
  // Before-images for updates.
  riganMemberBefore: { id: string; primaryVisualParentMemberId: string | null } | null
  erikMemberBefore: MemberSnapshot | null
  treeDefaultRootBefore: string | null
  groupAssignBefore: Array<{ memberId: string; visualGroupId: string | null }>
  profileBefore: { id: string; passportId: string } | null
  profileDecision: "repoint" | "delete" | "none"
  // Full images for deletes (Erik placeholder cleanup).
  deletedEdge: Record<string, unknown> | null
  deletedNode: Record<string, unknown> | null
  deletedPassport: Record<string, unknown> | null
  deletedProfile: Record<string, unknown> | null
}

const MEMBER_SELECT = {
  id: true,
  treeId: true,
  nodeId: true,
  visualSortOrder: true,
  showPromotionDatePublic: true,
  showRankPublic: true,
  isClaimable: true,
  isCollapsedDefault: true,
  primaryVisualParentMemberId: true,
  visualGroupId: true,
  createdAt: true,
} as const

function toSnapshot(m: Record<string, unknown>): MemberSnapshot {
  return {
    id: m.id as string,
    treeId: m.treeId as string,
    nodeId: m.nodeId as string,
    visualSortOrder: m.visualSortOrder as number,
    showPromotionDatePublic: m.showPromotionDatePublic as boolean,
    showRankPublic: m.showRankPublic as boolean,
    isClaimable: m.isClaimable as boolean,
    isCollapsedDefault: m.isCollapsedDefault as boolean,
    primaryVisualParentMemberId: (m.primaryVisualParentMemberId as string | null) ?? null,
    visualGroupId: (m.visualGroupId as string | null) ?? null,
    createdAt: (m.createdAt as Date).toISOString(),
  }
}

async function resolveNodeBySlug(slug: string) {
  return db.lineageNode.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      visibility: true,
      isVerified: true,
      verificationStatus: true,
      bio: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
      passportId: true,
      passport: { select: { displayName: true, userId: true } },
    },
  })
}

async function dryRunOrApply(apply: boolean) {
  // ── Reads (ALL outside the tx — Neon cold-start P2028) ─────────────────────
  const canonical = await db.lineageTree.findFirst({
    where: { slug: CANONICAL_SLUG, isPublished: true },
    select: { id: true, brand: true, slug: true, isPublished: true, defaultRootMemberId: true },
  })
  if (!canonical) throw new Error(`REFUSE: no PUBLISHED tree with slug "${CANONICAL_SLUG}".`)

  const preCount = await db.lineageTreeMember.count({ where: { treeId: canonical.id } })
  console.log("── migrate-founders-to-canonical ───────────────────────")
  console.log(`MODE:            ${apply ? "APPLY" : "DRY-RUN"}`)
  console.log(`canonical tree:  ${canonical.id} (${canonical.brand}/${canonical.slug}, published)`)
  console.log(
    `member count:    ${preCount}${expectMembers !== null ? ` (expected ${expectMembers})` : ""}`,
  )
  if (expectMembers !== null && preCount !== expectMembers) {
    throw new Error(
      `REFUSE: --expect-members=${expectMembers} but canonical has ${preCount} members (delta ${preCount - expectMembers}).`,
    )
  }

  const [sr, jr, rigan, erikRich, erikPlaceholder, rick] = await Promise.all([
    resolveNodeBySlug(SR_SLUG),
    resolveNodeBySlug(JR_SLUG),
    resolveNodeBySlug(RIGAN_SLUG),
    resolveNodeBySlug(ERIK_RICH_SLUG),
    resolveNodeBySlug(ERIK_PLACEHOLDER_SLUG), // may be gone after a prior apply
    resolveNodeBySlug(RICK_SLUG),
  ])
  for (const [slug, node] of [
    [SR_SLUG, sr],
    [JR_SLUG, jr],
    [RIGAN_SLUG, rigan],
    [ERIK_RICH_SLUG, erikRich],
    [RICK_SLUG, rick],
  ] as const) {
    if (!node) throw new Error(`REFUSE: founder slug "${slug}" did not resolve to a LineageNode.`)
  }
  // Narrow for TS — the loop above threw on null.
  if (!sr || !jr || !rigan || !erikRich || !rick) throw new Error("unreachable")

  const canonicalMemberFor = (nodeId: string) =>
    db.lineageTreeMember.findUnique({
      where: { treeId_nodeId: { treeId: canonical.id, nodeId } },
      select: MEMBER_SELECT,
    })
  const [srMember, jrMember, riganMember, erikRichMember, erikPlaceholderMember, rickMember] =
    await Promise.all([
      canonicalMemberFor(sr.id),
      canonicalMemberFor(jr.id),
      canonicalMemberFor(rigan.id),
      canonicalMemberFor(erikRich.id),
      erikPlaceholder ? canonicalMemberFor(erikPlaceholder.id) : Promise.resolve(null),
      canonicalMemberFor(rick.id),
    ])

  if (!riganMember) {
    throw new Error(`REFUSE: Rigan has no member row on the canonical tree — assumption broken.`)
  }

  // Placement spec: the clone rows are the spec; fall back to the ratified constants if the
  // clones are already retired. Prefer the BBL clone (brand matches canonical).
  const cloneSpecRows = await db.lineageTreeMember.findMany({
    where: {
      tree: { slug: CLONE_SLUG, isPublished: false },
      node: { slug: { in: [SR_SLUG, JR_SLUG, ERIK_RICH_SLUG, RICK_SLUG] } },
    },
    select: {
      visualSortOrder: true,
      showPromotionDatePublic: true,
      showRankPublic: true,
      isClaimable: true,
      isCollapsedDefault: true,
      node: { select: { slug: true } },
      tree: { select: { brand: true } },
    },
  })
  const pickSpec = (slug: string) => {
    const rows = cloneSpecRows.filter(
      (r: { node: { slug: string | null } }) => r.node.slug === slug,
    )
    const bbl = rows.find((r: { tree: { brand: string } }) => r.tree.brand === canonical.brand)
    const row = bbl ?? rows[0]
    if (row) {
      return {
        visualSortOrder: row.visualSortOrder as number,
        showPromotionDatePublic: row.showPromotionDatePublic as boolean,
        showRankPublic: row.showRankPublic as boolean,
        isClaimable: row.isClaimable as boolean,
        isCollapsedDefault: row.isCollapsedDefault as boolean,
        source: `clone:${row.tree.brand}`,
      }
    }
    const fb = FALLBACK_SPEC[slug as keyof typeof FALLBACK_SPEC]
    return {
      visualSortOrder: fb.visualSortOrder,
      showPromotionDatePublic: true,
      showRankPublic: true,
      isClaimable: fb.isClaimable,
      isCollapsedDefault: false,
      source: "fallback(ratified)",
    }
  }
  const srSpec = pickSpec(SR_SLUG)
  const jrSpec = pickSpec(JR_SLUG)
  const erikSpec = pickSpec(ERIK_RICH_SLUG)
  const rickSpec = pickSpec(RICK_SLUG)

  // Dirty Dozen group on canonical (fork f) — found by label at runtime.
  const dirtyDozen = await db.lineageVisualGroup.findFirst({
    where: { treeId: canonical.id, label: DIRTY_DOZEN_LABEL },
    select: { id: true, label: true },
  })
  if (!dirtyDozen) {
    throw new Error(`REFUSE: visual group "${DIRTY_DOZEN_LABEL}" not found on the canonical tree.`)
  }

  // ── Erik placeholder audit (fork d) ────────────────────────────────────────
  // The duplicate backfilled edge rigan→erik-james-paulson (SESSION_0493 backfill).
  const dupEdge = erikPlaceholder
    ? await db.lineageRelationship.findFirst({
        where: {
          type: "INSTRUCTOR_STUDENT",
          fromNodeId: rigan.id,
          toNodeId: erikPlaceholder.id,
        },
      })
    : null
  const richEdge = await db.lineageRelationship.findFirst({
    where: { type: "INSTRUCTOR_STUDENT", fromNodeId: rigan.id, toNodeId: erikRich.id },
    select: { id: true, verificationStatus: true },
  })
  if (!richEdge || richEdge.verificationStatus !== "VERIFIED") {
    throw new Error(
      "REFUSE: rigan→erik-paulson VERIFIED edge missing — fork (c) assumption broken.",
    )
  }

  // Placeholder blast radius: refuse if it carries anything beyond the known shape.
  let placeholderPassport: Record<string, unknown> | null = null
  let placeholderProfile: Record<string, unknown> | null = null
  let richProfile: { id: string; slug: string | null } | null = null
  if (erikPlaceholder) {
    const full = await db.lineageNode.findUnique({
      where: { id: erikPlaceholder.id },
      select: {
        _count: {
          select: {
            treeMembers: true,
            relationshipsFrom: true,
            relationshipsTo: true,
            accessGrants: true,
            claimRequests: true,
            pendingClaims: true,
            passportClaimRequests: true,
            trainedUnderInPassportClaims: true,
            ownedLineageTrees: true,
          },
        },
      },
    })
    if (!full) throw new Error("REFUSE: placeholder node vanished between reads.")
    placeholderPassport = await db.passport.findUnique({
      where: { id: erikPlaceholder.passportId },
    })
    placeholderProfile = await db.directoryProfile.findUnique({
      where: { passportId: erikPlaceholder.passportId },
    })
    richProfile = await db.directoryProfile.findUnique({
      where: { passportId: erikRich.passportId },
      select: { id: true, slug: true },
    })

    const c = full._count
    if (
      c.relationshipsFrom !== 0 ||
      c.relationshipsTo !== (dupEdge ? 1 : 0) ||
      c.treeMembers !== (erikPlaceholderMember ? 1 : 0) ||
      c.accessGrants !== 0 ||
      c.claimRequests !== 0 ||
      c.pendingClaims !== 0 ||
      c.passportClaimRequests !== 0 ||
      c.trainedUnderInPassportClaims !== 0 ||
      c.ownedLineageTrees !== 0
    ) {
      console.log("placeholder ref counts:", JSON.stringify(c))
      throw new Error(
        "REFUSE: erik-james-paulson placeholder carries unexpected references — not the known 0493-backfill shape. STOP and report.",
      )
    }
    const pp = placeholderPassport as { userId: string | null } | null
    if (pp?.userId) {
      throw new Error(
        "REFUSE: placeholder passport has a USER attached — never delete a claimed identity.",
      )
    }
  }

  // ── Plan the mutations (computed vs canonical state → idempotent) ──────────
  type PlanRow = {
    op: "CREATE" | "UPDATE" | "DELETE"
    entity: string
    id: string
    slug: string
    detail: string
  }
  const plan: PlanRow[] = []

  const createSr = !srMember
  const createJr = !jrMember
  const createRick = !rickMember

  if (createSr) {
    plan.push({
      op: "CREATE",
      entity: "LineageTreeMember",
      id: "(new)",
      slug: SR_SLUG,
      detail: `root (parent=null), sort=${srSpec.visualSortOrder}, claimable=${srSpec.isClaimable} [${srSpec.source}]`,
    })
  }
  if (createJr) {
    plan.push({
      op: "CREATE",
      entity: "LineageTreeMember",
      id: "(new)",
      slug: JR_SLUG,
      detail: `parent=${SR_SLUG}, sort=${jrSpec.visualSortOrder}, claimable=${jrSpec.isClaimable} [${jrSpec.source}]`,
    })
  }
  if (createRick) {
    plan.push({
      op: "CREATE",
      entity: "LineageTreeMember",
      id: "(new)",
      slug: RICK_SLUG,
      detail: `parent=${RIGAN_SLUG} (existing member ${riganMember.id}), sort=${rickSpec.visualSortOrder}, group="${dirtyDozen.label}" [${rickSpec.source}]`,
    })
  }

  // Re-parent Rigan under Carlos Jr (existing jr member or the one created this run).
  const riganNeedsReparent = jrMember
    ? riganMember.primaryVisualParentMemberId !== jrMember.id
    : true // jr member is being created this run → rigan must point at it
  if (riganNeedsReparent && !createJr && !jrMember) {
    throw new Error("unreachable: jr member neither exists nor is planned")
  }
  if (riganNeedsReparent) {
    plan.push({
      op: "UPDATE",
      entity: "LineageTreeMember",
      id: riganMember.id,
      slug: RIGAN_SLUG,
      detail: `primaryVisualParentMemberId: ${riganMember.primaryVisualParentMemberId ?? "null"} → ${jrMember ? jrMember.id : `(new ${JR_SLUG} member)`}`,
    })
  }

  // Erik swap-in-place (fork d).
  let erikSwap = false
  if (erikPlaceholder && erikPlaceholderMember) {
    if (erikRichMember) {
      throw new Error(
        "REFUSE: BOTH erik nodes have canonical member rows — nodeId repoint would violate @@unique(treeId,nodeId). STOP and report.",
      )
    }
    erikSwap = true
    plan.push({
      op: "UPDATE",
      entity: "LineageTreeMember",
      id: erikPlaceholderMember.id,
      slug: `${ERIK_PLACEHOLDER_SLUG}→${ERIK_RICH_SLUG}`,
      detail: `nodeId: ${erikPlaceholder.id} → ${erikRich.id}; sort: ${erikPlaceholderMember.visualSortOrder} → ${erikSpec.visualSortOrder}; group: ${erikPlaceholderMember.visualGroupId ?? "null"} → "${dirtyDozen.label}"`,
    })
    if (dupEdge) {
      plan.push({
        op: "DELETE",
        entity: "LineageRelationship",
        id: dupEdge.id,
        slug: `${RIGAN_SLUG}→${ERIK_PLACEHOLDER_SLUG}`,
        detail: "duplicate backfilled INSTRUCTOR_STUDENT edge (0493 backfill)",
      })
    }
    plan.push({
      op: "DELETE",
      entity: "LineageNode",
      id: erikPlaceholder.id,
      slug: ERIK_PLACEHOLDER_SLUG,
      detail: "placeholder node (0 awards, 0 claims, no user)",
    })
    plan.push({
      op: "DELETE",
      entity: "Passport",
      id: erikPlaceholder.passportId,
      slug: ERIK_PLACEHOLDER_SLUG,
      detail: `placeholder passport ("${(placeholderPassport as { displayName?: string })?.displayName}")`,
    })
  } else if (erikPlaceholder && !erikPlaceholderMember) {
    throw new Error(
      "REFUSE: placeholder erik-james-paulson node exists but has NO canonical member row — not the expected shape. STOP and report.",
    )
  } else if (!erikPlaceholder && !erikRichMember) {
    throw new Error(
      "REFUSE: neither erik-james-paulson (placeholder) nor a canonical erik-paulson member exists — cannot place Erik. STOP and report.",
    )
  }

  // DirectoryProfile decision (fork d) — decided from data, printed always.
  let profileDecision: Backup["profileDecision"] = "none"
  if (erikSwap) {
    console.log("\nErik DirectoryProfiles (both passports):")
    console.table([
      {
        passport: `${ERIK_PLACEHOLDER_SLUG} (placeholder)`,
        profileId: (placeholderProfile as { id?: string })?.id ?? "(none)",
        slug: (placeholderProfile as { slug?: string })?.slug ?? "—",
      },
      {
        passport: `${ERIK_RICH_SLUG} (rich)`,
        profileId: richProfile?.id ?? "(none)",
        slug: richProfile?.slug ?? "—",
      },
    ])
    if (placeholderProfile && !richProfile) {
      profileDecision = "repoint"
      plan.push({
        op: "UPDATE",
        entity: "DirectoryProfile",
        id: (placeholderProfile as { id: string }).id,
        slug: (placeholderProfile as { slug: string | null }).slug ?? "(no slug)",
        detail: `passportId: ${erikPlaceholder?.passportId} → ${erikRich.passportId} (placeholder's profile is the ONLY one → repoint)`,
      })
    } else if (placeholderProfile && richProfile) {
      profileDecision = "delete"
      plan.push({
        op: "DELETE",
        entity: "DirectoryProfile",
        id: (placeholderProfile as { id: string }).id,
        slug: (placeholderProfile as { slug: string | null }).slug ?? "(no slug)",
        detail: `rich passport already has profile ${richProfile.id} → delete the placeholder's`,
      })
    }
    console.log(`profile decision: ${profileDecision.toUpperCase()}`)
  }

  // defaultRootMemberId → Carlos Sr's member (fork e).
  const rootNeedsRepoint = srMember ? canonical.defaultRootMemberId !== srMember.id : true // sr member created this run
  if (rootNeedsRepoint) {
    plan.push({
      op: "UPDATE",
      entity: "LineageTree",
      id: canonical.id,
      slug: canonical.slug,
      detail: `defaultRootMemberId: ${canonical.defaultRootMemberId ?? "null"} → ${srMember ? srMember.id : `(new ${SR_SLUG} member)`}`,
    })
  }

  // Group adds (fork f) for already-existing member rows (rick create + erik swap set it inline).
  const groupAssignBefore: Backup["groupAssignBefore"] = []
  if (erikRichMember && erikRichMember.visualGroupId !== dirtyDozen.id) {
    groupAssignBefore.push({
      memberId: erikRichMember.id,
      visualGroupId: erikRichMember.visualGroupId,
    })
    plan.push({
      op: "UPDATE",
      entity: "LineageTreeMember",
      id: erikRichMember.id,
      slug: ERIK_RICH_SLUG,
      detail: `visualGroupId: ${erikRichMember.visualGroupId ?? "null"} → "${dirtyDozen.label}"`,
    })
  }
  if (rickMember && rickMember.visualGroupId !== dirtyDozen.id) {
    groupAssignBefore.push({ memberId: rickMember.id, visualGroupId: rickMember.visualGroupId })
    plan.push({
      op: "UPDATE",
      entity: "LineageTreeMember",
      id: rickMember.id,
      slug: RICK_SLUG,
      detail: `visualGroupId: ${rickMember.visualGroupId ?? "null"} → "${dirtyDozen.label}"`,
    })
  }

  const plannedCreates = [createSr, createJr, createRick].filter(Boolean).length

  console.log(
    `\nMUTATION TABLE (${plan.length} operations · +${plannedCreates} members → ${preCount + plannedCreates}):`,
  )
  if (plan.length) console.table(plan)

  if (plan.length === 0) {
    console.log("\n(nothing to do — canonical already carries the founders. No-op.)")
    return
  }

  if (!apply) {
    console.log("\n(dry-run — nothing changed. Re-run with --apply to mutate.)")
    return
  }

  // ── Backup BEFORE apply ─────────────────────────────────────────────────────
  const backup: Backup = {
    ts: new Date().toISOString(),
    treeId: canonical.id,
    plannedCreates: [
      ...(createSr ? [{ nodeId: sr.id, nodeSlug: SR_SLUG }] : []),
      ...(createJr ? [{ nodeId: jr.id, nodeSlug: JR_SLUG }] : []),
      ...(createRick ? [{ nodeId: rick.id, nodeSlug: RICK_SLUG }] : []),
    ],
    riganMemberBefore: riganNeedsReparent
      ? { id: riganMember.id, primaryVisualParentMemberId: riganMember.primaryVisualParentMemberId }
      : null,
    erikMemberBefore: erikSwap && erikPlaceholderMember ? toSnapshot(erikPlaceholderMember) : null,
    treeDefaultRootBefore: rootNeedsRepoint ? canonical.defaultRootMemberId : null,
    groupAssignBefore,
    profileBefore:
      erikSwap && profileDecision === "repoint" && placeholderProfile
        ? {
            id: (placeholderProfile as { id: string }).id,
            passportId: (placeholderProfile as { passportId: string }).passportId,
          }
        : null,
    profileDecision,
    deletedEdge: dupEdge
      ? {
          ...dupEdge,
          createdAt: dupEdge.createdAt.toISOString(),
          updatedAt: dupEdge.updatedAt.toISOString(),
          startedAt: dupEdge.startedAt?.toISOString() ?? null,
          endedAt: dupEdge.endedAt?.toISOString() ?? null,
        }
      : null,
    deletedNode: erikSwap && erikPlaceholder ? { ...erikPlaceholder, passport: undefined } : null,
    deletedPassport: erikSwap ? placeholderPassport : null,
    deletedProfile: erikSwap && profileDecision === "delete" ? placeholderProfile : null,
  }
  const backupPath = `/tmp/migrate-founders-backup-${Date.now()}.json`
  writeFileSync(backupPath, JSON.stringify(backup, null, 2))
  console.log(`\nbackup (written BEFORE apply) → ${backupPath}`)

  // The 77 pre-existing canonical member ids — none may be deleted.
  const preIds = (
    await db.lineageTreeMember.findMany({ where: { treeId: canonical.id }, select: { id: true } })
  ).map((m: { id: string }) => m.id)

  // ── ONE Serializable transaction ───────────────────────────────────────────
  await db.$transaction(
    async (tx: Tx) => {
      // In-tx re-asserts: canonical is published + slug matches, count unchanged since read.
      const treeNow = await tx.lineageTree.findUnique({
        where: { id: canonical.id },
        select: { slug: true, isPublished: true },
      })
      if (!treeNow?.isPublished || treeNow.slug !== CANONICAL_SLUG) {
        throw new Error("ABORT: canonical tree is no longer the published rigan-machado-lineage.")
      }
      const countNow = await tx.lineageTreeMember.count({ where: { treeId: canonical.id } })
      if (countNow !== preCount) {
        throw new Error(`ABORT: member count moved under us (${preCount} → ${countNow}).`)
      }

      // Acquire the shared identity graph lock tiers before any mutation in this transaction. The
      // later Erik swap can then delete the stale Passport without losing active/review provenance.
      if (erikSwap && erikPlaceholder) {
        await repointPromoterIdentityForMerge(tx, erikPlaceholder.passportId, erikRich.passportId)
      }

      // 1. Carlos Sr (root) + Carlos Jr.
      let srMemberId = srMember?.id ?? null
      if (createSr) {
        const created = await tx.lineageTreeMember.create({
          data: {
            treeId: canonical.id,
            nodeId: sr.id,
            primaryVisualParentMemberId: null,
            visualSortOrder: srSpec.visualSortOrder,
            showPromotionDatePublic: srSpec.showPromotionDatePublic,
            showRankPublic: srSpec.showRankPublic,
            isClaimable: srSpec.isClaimable,
            isCollapsedDefault: srSpec.isCollapsedDefault,
          },
          select: { id: true },
        })
        srMemberId = created.id
      }
      let jrMemberId = jrMember?.id ?? null
      if (createJr) {
        const created = await tx.lineageTreeMember.create({
          data: {
            treeId: canonical.id,
            nodeId: jr.id,
            primaryVisualParentMemberId: srMemberId,
            visualSortOrder: jrSpec.visualSortOrder,
            showPromotionDatePublic: jrSpec.showPromotionDatePublic,
            showRankPublic: jrSpec.showRankPublic,
            isClaimable: jrSpec.isClaimable,
            isCollapsedDefault: jrSpec.isCollapsedDefault,
          },
          select: { id: true },
        })
        jrMemberId = created.id
      }

      // 2. Re-parent Rigan under Carlos Jr.
      if (riganNeedsReparent) {
        await tx.lineageTreeMember.update({
          where: { id: riganMember.id },
          data: { primaryVisualParentMemberId: jrMemberId },
        })
      }

      // 3. Rick Minter as Rigan's student (+ Dirty Dozen group, fork f).
      if (createRick) {
        await tx.lineageTreeMember.create({
          data: {
            treeId: canonical.id,
            nodeId: rick.id,
            primaryVisualParentMemberId: riganMember.id,
            visualSortOrder: rickSpec.visualSortOrder,
            showPromotionDatePublic: rickSpec.showPromotionDatePublic,
            showRankPublic: rickSpec.showRankPublic,
            isClaimable: rickSpec.isClaimable,
            isCollapsedDefault: rickSpec.isCollapsedDefault,
            visualGroupId: dirtyDozen.id,
          },
        })
      }

      // 4. Erik swap-in-place (fork d).
      if (erikSwap && erikPlaceholder && erikPlaceholderMember) {
        if (dupEdge) {
          await tx.lineageRelationship.delete({ where: { id: dupEdge.id } })
        }
        await tx.lineageTreeMember.update({
          where: { id: erikPlaceholderMember.id },
          data: {
            nodeId: erikRich.id,
            primaryVisualParentMemberId: riganMember.id,
            visualSortOrder: erikSpec.visualSortOrder,
            visualGroupId: dirtyDozen.id,
          },
        })
        if (profileDecision === "repoint" && placeholderProfile) {
          await tx.directoryProfile.update({
            where: { id: (placeholderProfile as { id: string }).id },
            data: { passportId: erikRich.passportId },
          })
        } else if (profileDecision === "delete" && placeholderProfile) {
          await tx.directoryProfile.delete({
            where: { id: (placeholderProfile as { id: string }).id },
          })
        }
        // The placeholder node must have NO remaining tree placements before it dies.
        const remaining = await tx.lineageTreeMember.count({
          where: { nodeId: erikPlaceholder.id },
        })
        if (remaining !== 0) {
          throw new Error(
            `ABORT: placeholder node still has ${remaining} tree placement(s) after the repoint.`,
          )
        }
        await tx.lineageNode.delete({ where: { id: erikPlaceholder.id } })
        await tx.passport.delete({ where: { id: erikPlaceholder.passportId } })
      }

      // 5. Group adds for pre-existing member rows (fork f).
      for (const g of groupAssignBefore) {
        await tx.lineageTreeMember.update({
          where: { id: g.memberId },
          data: { visualGroupId: dirtyDozen.id },
        })
      }

      // 6. defaultRootMemberId → Carlos Sr (fork e).
      if (rootNeedsRepoint) {
        await tx.lineageTree.update({
          where: { id: canonical.id },
          data: { defaultRootMemberId: srMemberId },
        })
      }

      // ── Post-asserts (any mismatch throws → whole tx rolls back) ──────────
      const postCount = await tx.lineageTreeMember.count({ where: { treeId: canonical.id } })
      if (postCount !== preCount + plannedCreates) {
        throw new Error(
          `ABORT: member count is ${postCount}, expected ${preCount + plannedCreates} (${preCount}+${plannedCreates}).`,
        )
      }
      const survivors = await tx.lineageTreeMember.count({ where: { id: { in: preIds } } })
      if (survivors !== preIds.length) {
        throw new Error(
          `ABORT: ${preIds.length - survivors} pre-existing published-tree member row(s) would be deleted.`,
        )
      }
      const roots = await tx.lineageTreeMember.findMany({
        where: { treeId: canonical.id, primaryVisualParentMemberId: null },
        select: { id: true, node: { select: { slug: true } } },
      })
      if (roots.length !== 1 || roots[0].node.slug !== SR_SLUG) {
        throw new Error(
          `ABORT: expected exactly one root (${SR_SLUG}); got [${roots.map((r: { node: { slug: string | null } }) => r.node.slug).join(", ")}].`,
        )
      }
      const erikOnCanonical = await tx.lineageTreeMember.count({
        where: { treeId: canonical.id, node: { slug: ERIK_RICH_SLUG } },
      })
      if (erikOnCanonical !== 1) {
        throw new Error(
          `ABORT: expected exactly ONE ${ERIK_RICH_SLUG} member; got ${erikOnCanonical}.`,
        )
      }
    },
    { isolationLevel: "Serializable", maxWait: 30_000, timeout: 60_000 },
  )

  console.log(
    `\n✅ APPLIED — ${plan.length} operation(s); canonical now ${preCount + plannedCreates} members.`,
  )
  console.log(`   Backup for --rollback: ${backupPath}`)
}

async function rollback(file: string) {
  const backup = JSON.parse(readFileSync(file, "utf8")) as Backup
  await db.$transaction(
    async (tx: Tx) => {
      // 1. Recreate the placeholder passport → node → edge (FK order).
      if (backup.deletedPassport) {
        const p = backup.deletedPassport as Record<string, unknown>
        await tx.passport.create({
          data: {
            ...p,
            dob: p.dob ? new Date(p.dob as string) : null,
            startedTrainingAt: p.startedTrainingAt ? new Date(p.startedTrainingAt as string) : null,
            createdAt: new Date(p.createdAt as string),
          },
        })
      }
      if (backup.deletedNode) {
        const n = backup.deletedNode as Record<string, unknown>
        await tx.lineageNode.create({
          data: {
            id: n.id,
            slug: n.slug,
            visibility: n.visibility,
            isVerified: n.isVerified,
            verificationStatus: n.verificationStatus,
            bio: n.bio ?? null,
            archivedAt: n.archivedAt ? new Date(n.archivedAt as string) : null,
            createdAt: new Date(n.createdAt as string),
            passportId: n.passportId,
          },
        })
      }
      if (backup.deletedEdge) {
        const e = backup.deletedEdge as Record<string, unknown>
        await tx.lineageRelationship.create({
          data: {
            id: e.id,
            type: e.type,
            description: e.description ?? null,
            startedAt: e.startedAt ? new Date(e.startedAt as string) : null,
            endedAt: e.endedAt ? new Date(e.endedAt as string) : null,
            isVerified: e.isVerified,
            verificationStatus: e.verificationStatus,
            createdAt: new Date(e.createdAt as string),
            fromNodeId: e.fromNodeId,
            toNodeId: e.toNodeId,
            rankAwardId: e.rankAwardId ?? null,
          },
        })
      }
      // 2. Restore the Erik member row (nodeId back to the placeholder + old placement).
      if (backup.erikMemberBefore) {
        const m = backup.erikMemberBefore
        await tx.lineageTreeMember.update({
          where: { id: m.id },
          data: {
            nodeId: m.nodeId,
            primaryVisualParentMemberId: m.primaryVisualParentMemberId,
            visualSortOrder: m.visualSortOrder,
            visualGroupId: m.visualGroupId,
          },
        })
      }
      // 3. Restore / recreate the DirectoryProfile linkage.
      if (backup.profileBefore) {
        await tx.directoryProfile.update({
          where: { id: backup.profileBefore.id },
          data: { passportId: backup.profileBefore.passportId },
        })
      }
      if (backup.deletedProfile) {
        const dp = backup.deletedProfile as Record<string, unknown>
        await tx.directoryProfile.create({
          data: { ...dp, createdAt: new Date(dp.createdAt as string) },
        })
      }
      // 4. Restore group assignments on pre-existing members.
      for (const g of backup.groupAssignBefore) {
        await tx.lineageTreeMember.update({
          where: { id: g.memberId },
          data: { visualGroupId: g.visualGroupId },
        })
      }
      // 5. Restore Rigan's parent + the tree's default root.
      if (backup.riganMemberBefore) {
        await tx.lineageTreeMember.update({
          where: { id: backup.riganMemberBefore.id },
          data: {
            primaryVisualParentMemberId: backup.riganMemberBefore.primaryVisualParentMemberId,
          },
        })
      }
      if (backup.treeDefaultRootBefore !== null || backup.plannedCreates.length) {
        await tx.lineageTree.update({
          where: { id: backup.treeId },
          data: { defaultRootMemberId: backup.treeDefaultRootBefore },
        })
      }
      // 6. Delete the members this migration created (identified by treeId+nodeId).
      for (const c of backup.plannedCreates) {
        await tx.lineageTreeMember.deleteMany({
          where: { treeId: backup.treeId, nodeId: c.nodeId },
        })
      }
    },
    { isolationLevel: "Serializable", maxWait: 30_000, timeout: 60_000 },
  )
  console.log(
    `✅ ROLLED BACK from ${file} — removed ${backup.plannedCreates.length} created member(s), restored Rigan/Erik/root/profile state.`,
  )
}

async function main() {
  if (rollbackFile) {
    await rollback(rollbackFile)
  } else {
    await dryRunOrApply(isApply)
  }
  await db.$disconnect()
}

main().catch(async error => {
  console.error(error)
  await db.$disconnect()
  process.exit(1)
})
