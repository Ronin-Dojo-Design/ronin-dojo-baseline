import "dotenv/config"

import { writeFileSync } from "node:fs"
import { db } from "~/services/db"

/**
 * SESSION_0508 P0 cleanup — remove the junk the Baseline-domain signup leak created.
 * TARGETED BY EXPLICIT ID (never by email/pattern): a blind email-dedup would wrongly
 * collapse the operator's shared-email test leads (ronindojodesign@gmail.com ×3).
 *
 * Deletes:
 *  1. Two DEAD LineagePendingClaim rows pointing at Tony Hua's ALREADY-CLAIMED node
 *     (phan + đạt) — they can never finalize (his passport has a userId) and would only
 *     mislead. Real students get their OWN nodes under Tony via FI-003, not a claim of him.
 *  2. Two duplicate Phan leads (9:59 + 10:01 retries) — keep the earliest, best-quality
 *     record (9:50, "Phan Nguyễn", proper diacritics).
 *
 * Dry-run by default (prints + backs up, no writes). `--apply` to execute.
 *   cd apps/web
 *   SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod scripts/cleanup-tony-hua-signup-mess.ts
 *   SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod scripts/cleanup-tony-hua-signup-mess.ts --apply
 */

const APPLY = process.argv.includes("--apply")

const TONY_NODE_ID = "uz6bv38prs7u35avccwuuowa"

// Explicit targets (resolved read-only vs prod, SESSION_0508).
const DEAD_PENDING_CLAIM_IDS = [
  "kfq5i1mjknsc94tilkg3ht15", // phan  → Tony, unconsumed
  "q7gf7rnt3lvo7nwk8iuig51o", // đạt   → Tony, unconsumed
]
const PHAN_LEAD_KEEP_ID = "paqg442cisod9ttb3ml3whis" // 9:50 "Phan Nguyễn"
const PHAN_DUP_LEAD_IDS = [
  "er7j0bssk5qcc88mkd2hktpu", // 9:59 "Phan Nguyen"
  "ee3w5ix89s3ylnc3i4ekb2mo", // 10:01 "phan nguyen"
]
const PHAN_EMAIL = "nguyenphan161195@gmail.com"

async function main() {
  console.log(`MODE: ${APPLY ? "APPLY" : "DRY-RUN"}\n`)

  // ---- Resolve + guard each target (re-fetch; abort if it doesn't match expectations) ----
  const claims = await db.lineagePendingClaim.findMany({
    where: { id: { in: DEAD_PENDING_CLAIM_IDS } },
    select: { id: true, email: true, nodeId: true, consumedAt: true, createdAt: true, brand: true },
  })
  for (const c of claims) {
    if (c.nodeId !== TONY_NODE_ID || c.consumedAt !== null) {
      throw new Error(`GUARD: pending claim ${c.id} no longer matches (nodeId/consumedAt changed) — aborting`)
    }
  }

  const keep = await db.lead.findUnique({
    where: { id: PHAN_LEAD_KEEP_ID },
    select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
  })
  if (!keep || keep.email !== PHAN_EMAIL) {
    throw new Error(`GUARD: keeper lead ${PHAN_LEAD_KEEP_ID} missing or email mismatch — aborting`)
  }

  const dupLeads = await db.lead.findMany({
    where: { id: { in: PHAN_DUP_LEAD_IDS } },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      meta: true,
      followUps: { select: { id: true } },
    },
  })
  for (const l of dupLeads) {
    if (l.email !== PHAN_EMAIL) {
      throw new Error(`GUARD: dup lead ${l.id} email mismatch (${l.email}) — aborting`)
    }
    if (l.followUps.length > 0) {
      throw new Error(`GUARD: dup lead ${l.id} has ${l.followUps.length} followUp(s) — refusing to cascade-delete; reassign first`)
    }
  }

  // ---- Report ----
  console.log("=== DELETE — dead pending claims (→ Tony's already-claimed node) ===")
  for (const c of claims) console.log(`  ${c.id}  ${c.email}  created ${c.createdAt.toISOString()}`)
  console.log(`\n=== KEEP — canonical Phan lead ===`)
  console.log(`  ${keep.id}  "${keep.firstName} ${keep.lastName ?? ""}".trim  created ${keep.createdAt.toISOString()}`)
  console.log(`\n=== DELETE — duplicate Phan leads ===`)
  for (const l of dupLeads) console.log(`  ${l.id}  "${l.firstName} ${l.lastName ?? ""}".trim  created ${l.createdAt.toISOString()}`)

  if (claims.length !== DEAD_PENDING_CLAIM_IDS.length)
    console.log(`\n⚠ expected ${DEAD_PENDING_CLAIM_IDS.length} pending claims, found ${claims.length} (already gone?)`)
  if (dupLeads.length !== PHAN_DUP_LEAD_IDS.length)
    console.log(`⚠ expected ${PHAN_DUP_LEAD_IDS.length} dup leads, found ${dupLeads.length} (already gone?)`)

  // ---- Backup ----
  const backup = { at: new Date().toISOString(), claims, keptLead: keep, deletedLeads: dupLeads }
  const backupPath = `/tmp/tony-hua-cleanup-backup-${APPLY ? "apply" : "dryrun"}.json`
  writeFileSync(backupPath, JSON.stringify(backup, null, 2))
  console.log(`\nBackup written: ${backupPath}`)

  if (!APPLY) {
    console.log("\nDRY-RUN — no writes. Re-run with --apply to execute.")
    return
  }

  // ---- Apply (one transaction) ----
  const result = await db.$transaction(async tx => {
    const dc = await tx.lineagePendingClaim.deleteMany({ where: { id: { in: claims.map(c => c.id) } } })
    const dl = await tx.lead.deleteMany({ where: { id: { in: dupLeads.map(l => l.id) } } })
    return { claimsDeleted: dc.count, leadsDeleted: dl.count }
  })
  console.log(`\nAPPLIED: ${result.claimsDeleted} pending claim(s) + ${result.leadsDeleted} duplicate lead(s) deleted.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => process.exit(0))
