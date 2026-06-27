import "dotenv/config"

import { readFileSync, writeFileSync } from "node:fs"
import { db } from "~/services/db"

/**
 * SESSION_0457 (WL-P2-21, Slice A1 — SURGICAL scope, operator-approved 2026-06-27).
 *
 * Remove Brian Truelson's two REDUNDANT memberships on the unpublished `rigan-machado-bjj-lineage`
 * clone trees, leaving his ONE published canonical (`rigan-machado-lineage`) membership intact.
 *
 * Deliberately does NOT delete the clone trees: the coverage audit
 * (`audit-clone-member-coverage.ts`) proved each clone is the LAST tree placement for 4 founders
 * (Carlos Gracie Sr/Jr, Erik Paulson, Rick Minter) who are missing from the canonical tree —
 * wholesale tree deletion would orphan them. That is a separate, behavior-affecting decision.
 *
 * Hard guards: only deletes LineageTreeMember rows whose tree is `isPublished=false` AND slug is
 * the clone slug; refuses to run if Brian's canonical published membership is absent (never strand
 * him). Idempotent — re-running after apply is a no-op.
 *
 *   bun scripts/remove-brian-clone-memberships.ts                 # dry-run (default): report only
 *   bun scripts/remove-brian-clone-memberships.ts --apply         # delete + write backup to /tmp
 *   bun scripts/remove-brian-clone-memberships.ts --rollback <f>  # restore from a backup JSON
 *
 * Prod: SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod scripts/remove-brian-clone-memberships.ts …
 */

const TARGET_NODE_SLUG = "brian-truelson"
const CLONE_SLUG = "rigan-machado-bjj-lineage"
const CANONICAL_SLUG = "rigan-machado-lineage"

const args = process.argv.slice(2)
const isApply = args.includes("--apply")
const rollbackIdx = args.indexOf("--rollback")
const rollbackFile = rollbackIdx >= 0 ? args[rollbackIdx + 1] : null

// biome-ignore lint/suspicious/noExplicitAny: tx client surface.
type Tx = any

type MemberRow = {
  id: string
  treeId: string
  nodeId: string
  visualSortOrder: number
  showPromotionDatePublic: boolean
  showRankPublic: boolean
  isClaimable: boolean
  isCollapsedDefault: boolean
  rankAwardId: string | null
  primaryVisualParentMemberId: string | null
  visualGroupId: string | null
  createdAt: string
}

type Backup = {
  ts: string
  nodeId: string
  nodeSlug: string
  deletedMembers: MemberRow[]
  // children whose primaryVisualParentMemberId pointed at a deleted member (SetNull on delete).
  childPointerRestores: Array<{ childMemberId: string; parentMemberId: string }>
}

async function resolveNode(tx: Tx) {
  const select = {
    id: true,
    slug: true,
    passport: { select: { displayName: true, userId: true } },
  } as const
  let node = await tx.lineageNode.findUnique({ where: { slug: TARGET_NODE_SLUG }, select })
  if (!node) {
    const profile = await tx.directoryProfile.findUnique({
      where: { slug: TARGET_NODE_SLUG },
      select: { passport: { select: { lineageNode: { select } } } },
    })
    node = profile?.passport?.lineageNode ?? null
  }
  return node as {
    id: string
    slug: string
    passport: { displayName: string | null; userId: string | null }
  } | null
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
  rankAwardId: true,
  primaryVisualParentMemberId: true,
  visualGroupId: true,
  createdAt: true,
} as const

function toMemberRow(m: Record<string, unknown>): MemberRow {
  return {
    id: m.id as string,
    treeId: m.treeId as string,
    nodeId: m.nodeId as string,
    visualSortOrder: m.visualSortOrder as number,
    showPromotionDatePublic: m.showPromotionDatePublic as boolean,
    showRankPublic: m.showRankPublic as boolean,
    isClaimable: m.isClaimable as boolean,
    isCollapsedDefault: m.isCollapsedDefault as boolean,
    rankAwardId: (m.rankAwardId as string | null) ?? null,
    primaryVisualParentMemberId: (m.primaryVisualParentMemberId as string | null) ?? null,
    visualGroupId: (m.visualGroupId as string | null) ?? null,
    createdAt: (m.createdAt as Date).toISOString(),
  }
}

async function dryRunOrApply(apply: boolean) {
  // Reads + guards run WITHOUT a transaction (Neon cold-start can exceed the default 2s tx maxWait,
  // and the dry-run is pure reads). Only the actual delete wraps in a tx, with generous timeouts.
  const node = await resolveNode(db)
  if (!node) throw new Error(`no lineage node for slug "${TARGET_NODE_SLUG}"`)

  // The clone memberships to remove — scoped at the query level to UNPUBLISHED clone trees only.
  const toDelete = await db.lineageTreeMember.findMany({
    where: { nodeId: node.id, tree: { slug: CLONE_SLUG, isPublished: false } },
    select: { ...MEMBER_SELECT, tree: { select: { brand: true, slug: true, isPublished: true } } },
  })

  // The canonical membership that MUST survive.
  const canonical = await db.lineageTreeMember.findFirst({
    where: { nodeId: node.id, tree: { slug: CANONICAL_SLUG, isPublished: true } },
    select: { id: true, tree: { select: { brand: true, slug: true, isPublished: true } } },
  })

  // Blast radius: anything referencing the members we'd delete.
  const ids = toDelete.map((m: { id: string }) => m.id)
  const children = ids.length
    ? await db.lineageTreeMember.findMany({
        where: { primaryVisualParentMemberId: { in: ids } },
        select: { id: true, primaryVisualParentMemberId: true },
      })
    : []
  const groupsAsParent = ids.length
    ? await db.lineageVisualGroup.count({ where: { parentMemberId: { in: ids } } })
    : 0
  const accessGrants = ids.length
    ? await db.lineageTreeAccess.count({
        where: { OR: [{ rootMemberId: { in: ids } }, { memberId: { in: ids } }] },
      })
    : 0

  console.log("── remove-brian-clone-memberships ──────────────────────")
  console.log(`MODE:            ${apply ? "APPLY" : "DRY-RUN"}`)
  console.log(`node:            ${node.slug} (${node.passport?.displayName}) ${node.id}`)
  console.log(
    `account claimed: ${node.passport?.userId ? "YES — " + node.passport.userId : "no (unclaimed)"}`,
  )
  console.log(
    `\ncanonical membership (KEEP): ${canonical ? `${canonical.id} on ${canonical.tree.brand}/${canonical.tree.slug}` : "❌ MISSING"}`,
  )
  console.log(`clone memberships to DELETE: ${toDelete.length}`)
  console.table(
    toDelete.map(
      (m: { id: string; tree: { brand: string; slug: string; isPublished: boolean } }) => ({
        memberId: m.id,
        tree: `${m.tree.brand}/${m.tree.slug}`,
        published: m.tree.isPublished,
      }),
    ),
  )
  console.log(
    `blast radius — visualChildren pointing here: ${children.length} · groupsAsParent: ${groupsAsParent} · accessGrants: ${accessGrants}`,
  )

  // ── Guards ────────────────────────────────────────────────────────────
  if (!canonical) {
    throw new Error(
      "REFUSE: Brian has no published canonical membership — deleting clones would strand him.",
    )
  }
  for (const m of toDelete) {
    if (m.tree.isPublished || m.tree.slug !== CLONE_SLUG) {
      throw new Error(
        `REFUSE: membership ${m.id} is not an unpublished clone (${m.tree.brand}/${m.tree.slug} published=${m.tree.isPublished}).`,
      )
    }
  }
  if (groupsAsParent > 0 || accessGrants > 0) {
    throw new Error(
      `REFUSE: members are referenced by ${groupsAsParent} visual group(s) / ${accessGrants} access grant(s) — review before deleting (cascade risk).`,
    )
  }

  const backup: Backup = {
    ts: new Date().toISOString(),
    nodeId: node.id,
    nodeSlug: node.slug,
    deletedMembers: toDelete.map((m: Record<string, unknown>) => toMemberRow(m)),
    childPointerRestores: children.map(
      (c: { id: string; primaryVisualParentMemberId: string | null }) => ({
        childMemberId: c.id,
        parentMemberId: c.primaryVisualParentMemberId as string,
      }),
    ),
  }

  if (apply && ids.length) {
    await db.$transaction(
      async (tx: Tx) => {
        await tx.lineageTreeMember.deleteMany({ where: { id: { in: ids } } })
        // Re-assert the canonical membership survived (same tx, post-delete read).
        const stillThere = await tx.lineageTreeMember.findFirst({
          where: { id: canonical.id },
          select: { id: true },
        })
        if (!stillThere)
          throw new Error("POST-CHECK FAILED: canonical membership vanished — rolling back tx.")
      },
      { maxWait: 15000, timeout: 20000 },
    )
  }

  const result = { backup, deleted: ids.length }

  if (apply) {
    if (result.deleted === 0) {
      console.log("\n(nothing to delete — already clean. No-op.)")
      return
    }
    const path = `/tmp/brian-clone-memberships-backup-${Date.now()}.json`
    writeFileSync(path, JSON.stringify(result.backup, null, 2))
    console.log(`\n✅ APPLIED — deleted ${result.deleted} membership(s). Backup → ${path}`)
    console.log("   Backup JSON (also printed in case the file write failed):")
    console.log(JSON.stringify(result.backup))
  } else {
    console.log("\n(dry-run — nothing changed. Re-run with --apply to delete.)")
  }
}

async function rollback(file: string) {
  const backup = JSON.parse(readFileSync(file, "utf8")) as Backup
  await db.$transaction(async (tx: Tx) => {
    for (const m of backup.deletedMembers) {
      await tx.lineageTreeMember.upsert({
        where: { treeId_nodeId: { treeId: m.treeId, nodeId: m.nodeId } },
        update: {},
        create: {
          id: m.id,
          treeId: m.treeId,
          nodeId: m.nodeId,
          visualSortOrder: m.visualSortOrder,
          showPromotionDatePublic: m.showPromotionDatePublic,
          showRankPublic: m.showRankPublic,
          isClaimable: m.isClaimable,
          isCollapsedDefault: m.isCollapsedDefault,
          rankAwardId: m.rankAwardId,
          primaryVisualParentMemberId: m.primaryVisualParentMemberId,
          visualGroupId: m.visualGroupId,
          createdAt: new Date(m.createdAt),
        },
      })
    }
    // Restore any child→parent visual pointers that SetNull'd on delete.
    for (const c of backup.childPointerRestores) {
      await tx.lineageTreeMember.update({
        where: { id: c.childMemberId },
        data: { primaryVisualParentMemberId: c.parentMemberId },
      })
    }
  })
  console.log(
    `✅ ROLLED BACK from ${file} — restored ${backup.deletedMembers.length} membership(s) + ${backup.childPointerRestores.length} child pointer(s).`,
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
