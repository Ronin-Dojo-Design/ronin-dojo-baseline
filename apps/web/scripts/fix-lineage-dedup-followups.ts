import "dotenv/config"

import { writeFileSync } from "node:fs"
import { db } from "~/services/db"

/**
 * SESSION_0508 follow-ups (operator-requested) — two targeted lineage data fixes:
 *
 *  1. ERIK slug: the D-034 Erik swap repointed the placeholder's DirectoryProfile to the
 *     rich `erik-paulson` node but left its slug `erik-james-paulson` → the real Erik was
 *     reachable at /directory/erik-james-paulson. Rename the slug to `erik-paulson`.
 *
 *  2. RENATO duplicate: `renato-magno` (rich: 2 rank awards, anchors 5 students, on canonical)
 *     and `renato-magno-baptista` (thin dup of the SAME man: 0 awards, anchors nobody, also
 *     under Rigan) both render on the public tree. Delete the baptista duplicate wholesale
 *     (Passport delete cascades node + member + edges + directoryProfile), keep the rich node.
 *
 * Dry-run by default (prints + backs up, no writes). `--apply` to execute.
 *   cd apps/web
 *   SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod scripts/fix-lineage-dedup-followups.ts
 *   SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod scripts/fix-lineage-dedup-followups.ts --apply
 */

const APPLY = process.argv.includes("--apply")

// Explicit targets (resolved read-only vs prod, SESSION_0508).
const ERIK_PROFILE_ID = "a2ztilqbzlrsn91lhu256fju"
const ERIK_OLD_SLUG = "erik-james-paulson"
const ERIK_NEW_SLUG = "erik-paulson"

const RENATO_KEEP_NODE_SLUG = "renato-magno"
const RENATO_DUP_NODE_ID = "bdvs2scjfpkxr3cuhelmsp6q" // renato-magno-baptista
const RENATO_DUP_PASSPORT_ID = "dhvtbd776gs6iwl3bnemuuno"

async function main() {
  console.log(`MODE: ${APPLY ? "APPLY" : "DRY-RUN"}\n`)

  // ============ FIX 1 — Erik slug ============
  const erik = await db.directoryProfile.findUnique({
    where: { id: ERIK_PROFILE_ID },
    select: {
      id: true,
      slug: true,
      passport: { select: { displayName: true, lineageNode: { select: { slug: true } } } },
    },
  })
  if (!erik) throw new Error(`GUARD: Erik profile ${ERIK_PROFILE_ID} not found`)
  if (erik.slug !== ERIK_OLD_SLUG) {
    console.log(
      `FIX 1 (Erik slug): SKIP — slug is already "${erik.slug}", not "${ERIK_OLD_SLUG}" (already fixed?)`,
    )
  } else {
    if (erik.passport?.lineageNode?.slug !== ERIK_NEW_SLUG) {
      throw new Error(
        `GUARD: Erik profile passport node is "${erik.passport?.lineageNode?.slug}", expected "${ERIK_NEW_SLUG}" — aborting`,
      )
    }
    const clash = await db.directoryProfile.count({ where: { slug: ERIK_NEW_SLUG } })
    if (clash > 0) throw new Error(`GUARD: target slug "${ERIK_NEW_SLUG}" already taken — aborting`)
    console.log(
      `FIX 1 (Erik slug): RENAME profile ${erik.id}  "${ERIK_OLD_SLUG}" → "${ERIK_NEW_SLUG}"  (passport "${erik.passport?.displayName}", node erik-paulson)`,
    )
  }

  // ============ FIX 2 — Renato duplicate ============
  const keeper = await db.lineageNode.findFirst({
    where: { slug: RENATO_KEEP_NODE_SLUG },
    select: {
      id: true,
      slug: true,
      passport: { select: { rankAwardsEarned: { select: { id: true } } } },
      relationshipsFrom: { select: { id: true } }, // OUT edges = students anchored
      treeMembers: { select: { tree: { select: { slug: true, isPublished: true } } } },
    },
  })
  if (!keeper) throw new Error(`GUARD: keeper node ${RENATO_KEEP_NODE_SLUG} not found — aborting`)
  const keeperOnCanonicalPub = keeper.treeMembers.some(
    m => m.tree.slug === "rigan-machado-lineage" && m.tree.isPublished,
  )
  if (!keeperOnCanonicalPub)
    throw new Error(`GUARD: keeper ${RENATO_KEEP_NODE_SLUG} not on published canonical — aborting`)

  const dup = await db.lineageNode.findUnique({
    where: { id: RENATO_DUP_NODE_ID },
    select: {
      id: true,
      slug: true,
      passportId: true,
      passport: {
        select: {
          id: true,
          displayName: true,
          userId: true,
          rankAwardsEarned: { select: { id: true } },
          affiliations: { select: { id: true } },
          directoryProfile: { select: { id: true, slug: true } },
        },
      },
      relationshipsFrom: { select: { id: true, type: true, toNode: { select: { slug: true } } } },
      relationshipsTo: { select: { id: true, type: true, fromNode: { select: { slug: true } } } },
      treeMembers: { select: { id: true, tree: { select: { slug: true } } } },
    },
  })

  if (!dup) {
    console.log(
      `FIX 2 (Renato dup): SKIP — node ${RENATO_DUP_NODE_ID} not found (already removed?)`,
    )
  } else {
    if (dup.passportId !== RENATO_DUP_PASSPORT_ID)
      throw new Error(`GUARD: dup passportId ${dup.passportId} ≠ expected — aborting`)
    if (dup.passport?.userId)
      throw new Error(
        `GUARD: dup passport has a User (${dup.passport.userId}) — refusing to delete a claimed identity`,
      )
    // Anchors-nobody guard: no OUT INSTRUCTOR_STUDENT edges AND no member visual-parents to its member row.
    const anchoredEdges = dup.relationshipsFrom.filter(r => r.type === "INSTRUCTOR_STUDENT")
    if (anchoredEdges.length > 0)
      throw new Error(
        `GUARD: dup anchors ${anchoredEdges.length} student edge(s) — would orphan; aborting`,
      )
    const dupMemberIds = dup.treeMembers.map(m => m.id)
    const visualChildren = dupMemberIds.length
      ? await db.lineageTreeMember.count({
          where: { primaryVisualParentMemberId: { in: dupMemberIds } },
        })
      : 0
    if (visualChildren > 0)
      throw new Error(
        `GUARD: ${visualChildren} member(s) visual-parent to the dup — would fall to root; aborting`,
      )
    if (dup.passport && dup.passport.rankAwardsEarned.length > 0)
      throw new Error(
        `GUARD: dup passport has ${dup.passport.rankAwardsEarned.length} rank award(s) — not a bare duplicate; review before delete`,
      )

    console.log(
      `\nFIX 2 (Renato dup): DELETE duplicate "${dup.slug}" (passport "${dup.passport?.displayName}")`,
    )
    console.log(
      `  keeper: ${keeper.slug} — ${keeper.passport?.rankAwardsEarned.length} award(s), ${keeper.relationshipsFrom.length} student edge(s), on published canonical ✓`,
    )
    console.log(
      `  cascade on Passport delete → node ${dup.id}, ${dup.treeMembers.length} member(s), ${dup.relationshipsFrom.length + dup.relationshipsTo.length} edge(s), directoryProfile ${dup.passport?.directoryProfile?.slug ?? "none"}`,
    )
    console.log(
      `  dup passport: 0 User, ${dup.passport?.rankAwardsEarned.length} awards, ${dup.passport?.affiliations.length} affiliations — bare duplicate ✓`,
    )
  }

  // ---- Backup ----
  const backup = { at: new Date().toISOString(), erik, renatoKeeper: keeper, renatoDup: dup }
  const backupPath = `/tmp/lineage-dedup-followups-${APPLY ? "apply" : "dryrun"}.json`
  writeFileSync(backupPath, JSON.stringify(backup, null, 2))
  console.log(`\nBackup written: ${backupPath}`)

  if (!APPLY) {
    console.log("\nDRY-RUN — no writes. Re-run with --apply to execute.")
    return
  }

  // ---- Apply (one transaction) ----
  await db.$transaction(async tx => {
    if (erik?.slug === ERIK_OLD_SLUG) {
      await tx.directoryProfile.update({
        where: { id: ERIK_PROFILE_ID },
        data: { slug: ERIK_NEW_SLUG },
      })
    }
    if (dup) {
      // Passport delete cascades node + members + edges + directoryProfile (all onDelete: Cascade).
      await tx.passport.delete({ where: { id: RENATO_DUP_PASSPORT_ID } })
    }
  })
  console.log("\n✅ APPLIED.")
  console.log(
    `   Erik slug: ${erik?.slug === ERIK_OLD_SLUG ? `renamed → ${ERIK_NEW_SLUG}` : "skipped"}`,
  )
  console.log(`   Renato dup: ${dup ? "deleted (cascade)" : "skipped"}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => process.exit(0))
