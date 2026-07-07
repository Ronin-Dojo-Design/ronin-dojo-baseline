import "dotenv/config"

import { readFileSync, writeFileSync } from "node:fs"
import { db } from "~/services/db"

/**
 * SESSION_0508 (WL-P2-21, TASK_05 build — petey-plan-0457 Slice A1) — retire the 2 leftover
 * UNPUBLISHED `rigan-machado-bjj-lineage` clone trees (PR #162 consolidation residue). Member
 * rows, visual groups, access grants and claim requests CASCADE on tree delete (schema-confirmed:
 * `LineageTreeMember.tree` / `LineageVisualGroup.tree` / `LineageTreeAccess.tree` /
 * `LineageClaimRequest.tree` are all onDelete: Cascade).
 *
 * Hard guards (any failure REFUSES / aborts the tx):
 *  - Only trees with slug `rigan-machado-bjj-lineage` AND isPublished=false are candidates;
 *    every candidate is re-asserted unpublished (query-scoped AND row-checked).
 *  - ORPHAN GUARD: refuse if any clone member's node would lose its LAST LineageTreeMember
 *    anywhere (judged from live data, not hardcoded counts) — offenders are listed.
 *  - Refuse if any candidate carries LineageClaimRequest rows unless `--cascade-claims` is
 *    passed (rows are printed + captured in the backup either way).
 *  - Refuse if any candidate carries PassportClaimRequest / Bookmark / LineageTreeAccess refs.
 *  - In-tx post-asserts: canonical `rigan-machado-lineage` still exists, still published, member
 *    count untouched; zero clone trees remain.
 *
 * JSON backup (trees + members + groups + claim requests w/ evidence) written BEFORE apply;
 * `--rollback <file>` restores it (two-pass pointer restore — member↔group FKs are circular).
 * Idempotent: a second --apply finds nothing to do and says so.
 *
 *   bun scripts/remove-residual-lineage-clones.ts                     # dry-run (default)
 *   bun scripts/remove-residual-lineage-clones.ts --apply             # delete + JSON backup
 *   bun scripts/remove-residual-lineage-clones.ts --rollback <file>   # restore from a backup
 *
 * Prod (HELD on operator go #2): SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod scripts/… --apply
 */

const CLONE_SLUG = "rigan-machado-bjj-lineage"
const CANONICAL_SLUG = "rigan-machado-lineage"

const args = process.argv.slice(2)
const isApply = args.includes("--apply")
const cascadeClaims = args.includes("--cascade-claims")
const rollbackIdx = args.indexOf("--rollback")
const rollbackFile = rollbackIdx >= 0 ? args[rollbackIdx + 1] : null

// oxlint-disable-next-line no-explicit-any -- tx client surface (prior-art pattern).
type Tx = any

type Backup = {
  ts: string
  canonicalTreeId: string
  trees: Array<Record<string, unknown>>
  members: Array<Record<string, unknown>>
  groups: Array<Record<string, unknown>>
  claimRequests: Array<Record<string, unknown>>
}

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v)

function serializeDates(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, iso(v)]))
}

async function dryRunOrApply(apply: boolean) {
  // ── Reads (ALL outside the tx) ──────────────────────────────────────────────
  const clones = await db.lineageTree.findMany({
    where: { slug: CLONE_SLUG, isPublished: false },
    select: {
      id: true,
      brand: true,
      scopeType: true,
      slug: true,
      name: true,
      description: true,
      visibility: true,
      isPublished: true,
      isClaimable: true,
      defaultRootMemberId: true,
      createdAt: true,
      organizationId: true,
      disciplineId: true,
      styleId: true,
      ownerNodeId: true,
      _count: {
        select: {
          members: true,
          visualGroups: true,
          accessGrants: true,
          claimRequests: true,
          passportClaimRequests: true,
          representInPassportClaims: true,
          bookmarks: true,
        },
      },
    },
  })
  const cloneIds = clones.map((t: { id: string }) => t.id)

  const canonical = await db.lineageTree.findFirst({
    where: { slug: CANONICAL_SLUG, isPublished: true },
    select: { id: true, brand: true },
  })
  if (!canonical) throw new Error(`REFUSE: no PUBLISHED tree with slug "${CANONICAL_SLUG}".`)
  const canonicalPreCount = await db.lineageTreeMember.count({ where: { treeId: canonical.id } })

  console.log("── remove-residual-lineage-clones ──────────────────────")
  console.log(
    `MODE:            ${apply ? "APPLY" : "DRY-RUN"}${cascadeClaims ? " (+cascade-claims)" : ""}`,
  )
  console.log(
    `canonical tree:  ${canonical.id} (${canonical.brand}/${CANONICAL_SLUG}, ${canonicalPreCount} members — untouched)`,
  )
  console.log(`clone trees to DELETE: ${clones.length}`)
  console.table(
    clones.map((t: Record<string, unknown>) => ({
      treeId: t.id,
      brand: t.brand,
      slug: t.slug,
      published: t.isPublished,
      members: (t._count as Record<string, number>).members,
      groups: (t._count as Record<string, number>).visualGroups,
      claims: (t._count as Record<string, number>).claimRequests,
    })),
  )

  if (clones.length === 0) {
    console.log("\n(nothing to delete — no unpublished clone trees remain. No-op.)")
    return
  }

  // ── Guards ──────────────────────────────────────────────────────────────────
  for (const t of clones) {
    if (t.isPublished || t.slug !== CLONE_SLUG) {
      throw new Error(`REFUSE: tree ${t.id} is not an unpublished clone (${t.brand}/${t.slug}).`)
    }
    const c = t._count as Record<string, number>
    if (c.passportClaimRequests > 0 || c.representInPassportClaims > 0) {
      throw new Error(
        `REFUSE: tree ${t.id} is referenced by PassportClaimRequest rows — review first.`,
      )
    }
    if (c.bookmarks > 0) {
      throw new Error(`REFUSE: tree ${t.id} has ${c.bookmarks} bookmark(s) — review first.`)
    }
    if (c.accessGrants > 0) {
      throw new Error(`REFUSE: tree ${t.id} has ${c.accessGrants} access grant(s) — review first.`)
    }
  }

  // Claim requests riding the clones (would cascade) — print + gate.
  const claimRequests = await db.lineageClaimRequest.findMany({
    where: { treeId: { in: cloneIds } },
    include: {
      evidence: true,
      node: { select: { slug: true } },
      claimant: { select: { email: true } },
    },
  })
  if (claimRequests.length) {
    console.log(
      `\n⚠ ${claimRequests.length} LineageClaimRequest row(s) would CASCADE with the clones:`,
    )
    console.table(
      claimRequests.map((r: Record<string, unknown>) => ({
        id: r.id,
        status: r.status,
        node: (r.node as { slug: string | null }).slug,
        claimant: (r.claimant as { email: string }).email,
        createdAt: iso(r.createdAt),
        evidence: (r.evidence as unknown[]).length,
      })),
    )
    if (!cascadeClaims) {
      throw new Error(
        `REFUSE: ${claimRequests.length} claim request(s) ride the clone trees. Re-run with --cascade-claims to acknowledge (rows are captured in the backup).`,
      )
    }
  }

  // ORPHAN GUARD — judged from live data: for every node placed on a clone, it must keep at
  // least one LineageTreeMember on a tree OUTSIDE the delete set.
  const cloneMembers = await db.lineageTreeMember.findMany({
    where: { treeId: { in: cloneIds } },
    select: {
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
      node: { select: { slug: true, passport: { select: { displayName: true } } } },
    },
  })
  const nodeIds = [...new Set(cloneMembers.map((m: { nodeId: string }) => m.nodeId))]
  const outsidePlacements = await db.lineageTreeMember.groupBy({
    by: ["nodeId"],
    where: { nodeId: { in: nodeIds }, treeId: { notIn: cloneIds } },
    _count: { _all: true },
  })
  const outsideByNode = new Map<string, number>(
    outsidePlacements.map((p: { nodeId: string; _count: { _all: number } }) => [
      p.nodeId,
      p._count._all,
    ]),
  )
  const orphans = cloneMembers.filter(
    (m: { nodeId: string }) => (outsideByNode.get(m.nodeId) ?? 0) === 0,
  )
  const distinctOrphans = [
    ...new Map(
      orphans.map(
        (m: {
          nodeId: string
          node: { slug: string | null; passport: { displayName: string | null } | null }
        }) => [
          m.nodeId,
          {
            nodeId: m.nodeId,
            slug: m.node.slug ?? "(no slug)",
            name: m.node.passport?.displayName ?? "(unknown)",
          },
        ],
      ),
    ).values(),
  ]
  console.log(
    `\norphan guard: ${nodeIds.length} distinct node(s) on the clones · ${distinctOrphans.length} would lose their LAST placement`,
  )
  if (distinctOrphans.length) {
    console.table(distinctOrphans)
    throw new Error(
      `REFUSE: deleting the clones would orphan ${distinctOrphans.length} node(s) (last tree placement). Run migrate-founders-to-canonical.ts first.`,
    )
  }

  const groups = await db.lineageVisualGroup.findMany({ where: { treeId: { in: cloneIds } } })

  if (!apply) {
    console.log("\n(dry-run — nothing changed. Re-run with --apply to delete.)")
    return
  }

  // ── Backup BEFORE apply ─────────────────────────────────────────────────────
  const backup: Backup = {
    ts: new Date().toISOString(),
    canonicalTreeId: canonical.id,
    trees: clones.map((t: Record<string, unknown>) => {
      const { _count, ...row } = t
      void _count
      return serializeDates(row)
    }),
    members: cloneMembers.map((m: Record<string, unknown>) => {
      const { node, ...row } = m
      void node
      return serializeDates(row)
    }),
    groups: groups.map((g: Record<string, unknown>) => serializeDates(g)),
    claimRequests: claimRequests.map((r: Record<string, unknown>) => {
      const { node, claimant, evidence, ...row } = r
      void node
      void claimant
      return {
        ...serializeDates(row),
        evidence: (evidence as Array<Record<string, unknown>>).map(e => serializeDates(e)),
      }
    }),
  }
  const backupPath = `/tmp/residual-lineage-clones-backup-${Date.now()}.json`
  writeFileSync(backupPath, JSON.stringify(backup, null, 2))
  console.log(`\nbackup (written BEFORE apply) → ${backupPath}`)

  // ── ONE Serializable transaction ───────────────────────────────────────────
  await db.$transaction(
    async (tx: Tx) => {
      const deleted = await tx.lineageTree.deleteMany({
        where: { id: { in: cloneIds }, slug: CLONE_SLUG, isPublished: false },
      })
      if (deleted.count !== cloneIds.length) {
        throw new Error(
          `ABORT: expected to delete ${cloneIds.length} clone tree(s), deleteMany hit ${deleted.count}.`,
        )
      }
      // Canonical untouched.
      const canonicalNow = await tx.lineageTree.findUnique({
        where: { id: canonical.id },
        select: { slug: true, isPublished: true, _count: { select: { members: true } } },
      })
      if (!canonicalNow?.isPublished || canonicalNow.slug !== CANONICAL_SLUG) {
        throw new Error("ABORT: canonical published tree missing/changed after delete.")
      }
      if (canonicalNow._count.members !== canonicalPreCount) {
        throw new Error(
          `ABORT: canonical member count moved (${canonicalPreCount} → ${canonicalNow._count.members}).`,
        )
      }
      // No node lost its last placement (re-judged post-delete inside the tx).
      const placementsLeft = await tx.lineageTreeMember.groupBy({
        by: ["nodeId"],
        where: { nodeId: { in: nodeIds } },
        _count: { _all: true },
      })
      if (placementsLeft.length !== nodeIds.length) {
        throw new Error(
          `ABORT: ${nodeIds.length - placementsLeft.length} node(s) lost their last tree placement.`,
        )
      }
      // Zero clones remain.
      const remaining = await tx.lineageTree.count({ where: { slug: CLONE_SLUG } })
      if (remaining !== 0) throw new Error(`ABORT: ${remaining} clone tree(s) still present.`)
    },
    { isolationLevel: "Serializable", maxWait: 30_000, timeout: 60_000 },
  )

  console.log(
    `\n✅ APPLIED — deleted ${clones.length} clone tree(s) (${cloneMembers.length} member rows, ${groups.length} groups, ${claimRequests.length} claim request(s) cascaded).`,
  )
  console.log(`   Backup for --rollback: ${backupPath}`)
}

async function rollback(file: string) {
  const backup = JSON.parse(readFileSync(file, "utf8")) as Backup
  await db.$transaction(
    async (tx: Tx) => {
      // 1. Trees (defaultRootMemberId is a bare column — safe to set before members exist).
      for (const t of backup.trees) {
        await tx.lineageTree.create({
          data: { ...t, createdAt: new Date(t.createdAt as string) },
        })
      }
      // 2. Groups WITHOUT parentMemberId (members don't exist yet — circular FK pair).
      for (const g of backup.groups) {
        await tx.lineageVisualGroup.create({
          data: {
            ...g,
            parentMemberId: null,
            promotionDate: g.promotionDate ? new Date(g.promotionDate as string) : null,
            createdAt: new Date(g.createdAt as string),
          },
        })
      }
      // 3. Members WITHOUT parent pointers (rows reference each other).
      for (const m of backup.members) {
        await tx.lineageTreeMember.create({
          data: {
            ...m,
            primaryVisualParentMemberId: null,
            createdAt: new Date(m.createdAt as string),
          },
        })
      }
      // 4. Second pass — restore the circular pointers.
      for (const m of backup.members) {
        if (m.primaryVisualParentMemberId) {
          await tx.lineageTreeMember.update({
            where: { id: m.id },
            data: { primaryVisualParentMemberId: m.primaryVisualParentMemberId },
          })
        }
      }
      for (const g of backup.groups) {
        if (g.parentMemberId) {
          await tx.lineageVisualGroup.update({
            where: { id: g.id },
            data: { parentMemberId: g.parentMemberId },
          })
        }
      }
      // 5. Claim requests + evidence.
      for (const r of backup.claimRequests) {
        const { evidence, ...row } = r
        await tx.lineageClaimRequest.create({
          data: {
            ...row,
            reviewedAt: row.reviewedAt ? new Date(row.reviewedAt as string) : null,
            createdAt: new Date(row.createdAt as string),
          },
        })
        for (const e of evidence as Array<Record<string, unknown>>) {
          await tx.lineageClaimEvidence.create({
            data: { ...e, createdAt: new Date(e.createdAt as string) },
          })
        }
      }
    },
    { isolationLevel: "Serializable", maxWait: 30_000, timeout: 60_000 },
  )
  console.log(
    `✅ ROLLED BACK from ${file} — restored ${backup.trees.length} tree(s), ${backup.members.length} member(s), ${backup.groups.length} group(s), ${backup.claimRequests.length} claim request(s).`,
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
