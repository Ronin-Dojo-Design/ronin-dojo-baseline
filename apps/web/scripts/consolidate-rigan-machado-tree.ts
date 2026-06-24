import "dotenv/config"

import { readFileSync, writeFileSync } from "node:fs"
import { db } from "~/services/db"

/**
 * SESSION_0443 (ADR 0037, TASK_03) — collapse the two BBL lineage trees into ONE canonical,
 * brand-agnostic `rigan-machado-lineage`.
 *
 * Today BBL has TWO trees: `bbl-lineage` (the real 77-member WP roster, Rigan-rooted via edges but
 * with `defaultRootMemberId`/`disciplineId` unset and NO visual groups) and the thinner cloned
 * `rigan-machado-bjj-lineage` (20 curated members WITH the bjj discipline + Dirty Dozen / Coral Belt
 * visual groups) that the public discipline page currently renders. This wires the full roster up as
 * the canonical public tree and retires the clone.
 *
 * Apply (one transaction — atomic):
 *   1. `bbl-lineage.defaultRootMemberId` → its sole root member (Rigan Machado).
 *   2. `bbl-lineage.disciplineId`        → bjj (copied from the clone).
 *   3. Migrate the clone's LineageVisualGroups onto `bbl-lineage` (match members by nodeId; the
 *      `DIRTY_DOZEN_LABEL` group also drives the lifetime-comp decision in claim-finalize, so it MUST
 *      carry over). Idempotent by (treeId, label).
 *   4. Rename `bbl-lineage` → `rigan-machado-lineage`.
 *   5. Unpublish the clone (`isPublished=false`) — kept as a row for rollback, not deleted.
 *
 * Rollback by design: `--apply` first writes a before-state JSON backup, then mutates. `--rollback
 * <backup.json>` restores the source tree's slug/discipline/root + the clone's isPublished and deletes
 * the groups this migration created (member `visualGroupId` auto-nulls via the SetNull FK; the source
 * had zero groups beforehand, so the revert is exact).
 *
 *   bun scripts/consolidate-rigan-machado-tree.ts                 # dry-run (default): report only
 *   bun scripts/consolidate-rigan-machado-tree.ts --apply         # mutate + write backup to /tmp
 *   bun scripts/consolidate-rigan-machado-tree.ts --rollback <f>  # restore from a backup JSON
 *
 * Prod: run with `bun --env-file=.env.prod …` (HELD on operator go). Verify on prodsnap first.
 */

const BRAND = "BBL" as const
const SOURCE_SLUG = "bbl-lineage"
const TARGET_SLUG = "rigan-machado-lineage"
const CLONE_SLUG = "rigan-machado-bjj-lineage"

const args = process.argv.slice(2)
const isApply = args.includes("--apply")
const rollbackIdx = args.indexOf("--rollback")
const rollbackFile = rollbackIdx >= 0 ? args[rollbackIdx + 1] : null

// biome-ignore lint/suspicious/noExplicitAny: tx client surface.
type Tx = any

type Backup = {
  ts: string
  sourceTreeId: string
  source: { slug: string; disciplineId: string | null; defaultRootMemberId: string | null }
  cloneTreeId: string | null
  clone: { isPublished: boolean } | null
  createdGroupIds: string[]
}

async function resolveContext(tx: Tx) {
  const source = await tx.lineageTree.findFirst({
    where: { brand: BRAND, slug: { in: [SOURCE_SLUG, TARGET_SLUG] } },
    select: { id: true, slug: true, disciplineId: true, defaultRootMemberId: true },
  })
  if (!source) throw new Error(`source tree (${SOURCE_SLUG}/${TARGET_SLUG}) not found for ${BRAND}`)

  const clone = await tx.lineageTree.findFirst({
    where: { brand: BRAND, slug: CLONE_SLUG },
    select: { id: true, slug: true, disciplineId: true, isPublished: true },
  })

  const rootMember = await tx.lineageTreeMember.findFirst({
    where: { treeId: source.id, primaryVisualParentMemberId: null },
    select: { id: true, node: { select: { passport: { select: { displayName: true } } } } },
  })

  // Map source members by nodeId so we can re-point clone group memberships onto the full roster.
  const sourceMembers = await tx.lineageTreeMember.findMany({
    where: { treeId: source.id },
    select: { id: true, nodeId: true },
  })
  const sourceMemberByNode = new Map<string, string>(
    sourceMembers.map((m: { id: string; nodeId: string }) => [m.nodeId, m.id]),
  )

  return { source, clone, rootMember, sourceMemberByNode }
}

async function dryRunOrApply(apply: boolean) {
  const ctx = await db.$transaction(async (tx: Tx) => {
    const { source, clone, rootMember, sourceMemberByNode } = await resolveContext(tx)

    const rootIsMultiple =
      (await tx.lineageTreeMember.count({
        where: { treeId: source.id, primaryVisualParentMemberId: null },
      })) > 1
    if (!rootMember) throw new Error("no root member (null visual parent) in the source tree")
    if (rootIsMultiple) {
      throw new Error(
        "source tree has MORE THAN ONE root member — refuse to guess the canonical root",
      )
    }

    const bjjDisciplineId = source.disciplineId ?? clone?.disciplineId ?? null

    // Plan the visual-group migration (clone → source), matching members by nodeId.
    const cloneGroups = clone
      ? await tx.lineageVisualGroup.findMany({
          where: { treeId: clone.id },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            label: true,
            groupType: true,
            promotionDate: true,
            showPublicLabel: true,
            sortOrder: true,
            parentMemberId: true,
            promotionEventId: true,
            members: { select: { nodeId: true } },
            parentMember: { select: { nodeId: true } },
          },
        })
      : []

    console.log("── consolidate-rigan-machado-tree ──────────────────────")
    console.log(`MODE:            ${apply ? "APPLY" : "DRY-RUN"}`)
    console.log(`source tree:     ${source.id} (slug=${source.slug})`)
    console.log(`  → rename slug: ${source.slug} → ${TARGET_SLUG}`)
    console.log(`  → root member: ${rootMember.id} (${rootMember.node?.passport?.displayName})`)
    console.log(`  → disciplineId: ${source.disciplineId ?? "NULL"} → ${bjjDisciplineId ?? "NULL"}`)
    console.log(`clone tree:      ${clone?.id ?? "(none)"} (unpublish: ${clone ? "yes" : "n/a"})`)
    console.log(`visual groups to migrate: ${cloneGroups.length}`)

    const createdGroupIds: string[] = []

    if (apply) {
      // 1+2: root + discipline.
      await tx.lineageTree.update({
        where: { id: source.id },
        data: { defaultRootMemberId: rootMember.id, disciplineId: bjjDisciplineId },
      })

      // 3: migrate visual groups (idempotent by treeId+label).
      for (const g of cloneGroups) {
        const parentMemberId = g.parentMember
          ? (sourceMemberByNode.get(g.parentMember.nodeId) ?? null)
          : null
        let target = await tx.lineageVisualGroup.findFirst({
          where: { treeId: source.id, label: g.label },
          select: { id: true },
        })
        if (!target) {
          target = await tx.lineageVisualGroup.create({
            data: {
              treeId: source.id,
              label: g.label,
              groupType: g.groupType,
              promotionDate: g.promotionDate,
              showPublicLabel: g.showPublicLabel,
              sortOrder: g.sortOrder,
              parentMemberId,
              promotionEventId: g.promotionEventId,
            },
            select: { id: true },
          })
          createdGroupIds.push(target.id)
        }
        // Assign source members (matched by node) into the migrated group.
        for (const m of g.members) {
          const sourceMemberId = sourceMemberByNode.get(m.nodeId)
          if (!sourceMemberId) continue
          await tx.lineageTreeMember.update({
            where: { id: sourceMemberId },
            data: { visualGroupId: target.id },
          })
        }
      }

      // 4: rename. 5: unpublish clone.
      await tx.lineageTree.update({ where: { id: source.id }, data: { slug: TARGET_SLUG } })
      if (clone) {
        await tx.lineageTree.update({ where: { id: clone.id }, data: { isPublished: false } })
      }
    }

    return {
      backup: {
        ts: new Date().toISOString(),
        sourceTreeId: source.id,
        source: {
          slug: source.slug,
          disciplineId: source.disciplineId,
          defaultRootMemberId: source.defaultRootMemberId,
        },
        cloneTreeId: clone?.id ?? null,
        clone: clone ? { isPublished: clone.isPublished } : null,
        createdGroupIds,
      } satisfies Backup,
      migratedGroups: cloneGroups.length,
    }
  })

  if (apply) {
    const path = `/tmp/rigan-consolidate-backup-${Date.now()}.json`
    writeFileSync(path, JSON.stringify(ctx.backup, null, 2))
    console.log(`\n✅ APPLIED. Backup (for --rollback) written to:\n   ${path}`)
    console.log(
      `   migrated ${ctx.migratedGroups} group(s); ${ctx.backup.createdGroupIds.length} created.`,
    )
  } else {
    console.log("\n(dry-run — nothing changed. Re-run with --apply to mutate.)")
  }
}

async function rollback(file: string) {
  const backup = JSON.parse(readFileSync(file, "utf8")) as Backup
  await db.$transaction(async (tx: Tx) => {
    // Delete groups this migration created (member.visualGroupId auto-nulls via SetNull FK).
    if (backup.createdGroupIds.length) {
      await tx.lineageVisualGroup.deleteMany({ where: { id: { in: backup.createdGroupIds } } })
    }
    // Restore the source tree's slug / discipline / root.
    await tx.lineageTree.update({
      where: { id: backup.sourceTreeId },
      data: {
        slug: backup.source.slug,
        disciplineId: backup.source.disciplineId,
        defaultRootMemberId: backup.source.defaultRootMemberId,
      },
    })
    // Re-publish the clone.
    if (backup.cloneTreeId && backup.clone) {
      await tx.lineageTree.update({
        where: { id: backup.cloneTreeId },
        data: { isPublished: backup.clone.isPublished },
      })
    }
  })
  console.log(
    `✅ ROLLED BACK from ${file} — restored slug=${backup.source.slug}, re-published clone, removed ${backup.createdGroupIds.length} migrated group(s).`,
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
