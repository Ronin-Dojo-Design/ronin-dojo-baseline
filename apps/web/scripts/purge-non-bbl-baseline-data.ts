/**
 * SESSION_0450 — BANKED / PARKED TOOL — do NOT run against prod without a fresh decision.
 *
 * ⚠ This was built + dry-run-verified (prod + prodsnap) but DELIBERATELY NOT APPLIED. At
 * SESSION_0450 the operator decided to KEEP the legacy Baseline dataset: it is brand-hidden on BBL
 * (the public courses page calls `searchCourses(..., Brand.BBL)` + `where:{brand}`), so it causes no
 * harm in prod, and it is the seed for a future `baselinemartialarts.com` product (the multi-product
 * model — see CLAUDE.md). The `brand` column is therefore NOT a vestige to drop; it is the
 * still-load-bearing BBL-vs-future-Baseline separator. The Stage-2 column drop is PARKED.
 *
 * This script remains as the verified, reversible removal tool for WHEN that Baseline data is
 * actually extracted to its own product — run it only AFTER the data has been migrated out.
 *
 * Purges the legacy multi-brand demo dataset (BASELINE_MARTIAL_ARTS + the two stray WEKAF /
 * RONIN_DOJO_DESIGN rows) that lives co-resident on prod, isolated from the live BBL data ONLY by
 * the `brand` column — see SESSION_0450 + [[brand-vestige-trim-inventory]].
 *
 * VERIFIED-SAFE delete set (audited against a fresh prodsnap == prod, SESSION_0450):
 *   - 0 RankAwards / BeltTestRegistrations reference the 16 BASELINE ranks (they are unused).
 *   - 0 UserEntitlements reference the 21 deleted Entitlements (32 EntitlementGrants cascade).
 *   - 0 Tournaments, 0 cross-brand rank/tree refs from KEPT (BBL/null) rows.
 *   - The ONE RESTRICT blocker is Brian's own demo SAFETY Certification → "Baseline Martial Arts";
 *     it is deleted first (the only Certification in the DB; a test cert on demo content).
 *   - Deleting a LineageTree removes only its membership/visual-group rows; the underlying
 *     people/passports/nodes are untouched, so the BASELINE `rigan-machado-bjj-lineage` orphan
 *     (17 members) is non-destructive to drop.
 *   - NULL-brand reference data (179 Ranks, Disciplines, Roles, …) is KEPT (brand IS NULL, never
 *     in DELETE_BRANDS) — the column simply drops there in Phase 2.
 *
 * DRY-RUN by default: runs the full delete inside ONE transaction, asserts (a) zero non-BBL rows
 * remain and (b) BBL integrity counts are unchanged, then ROLLS BACK and reports. Nothing is
 * written. Pass --apply to COMMIT.
 *
 *   Local prodsnap (dry-run):  bun scripts/purge-non-bbl-baseline-data.ts
 *   Local prodsnap (apply):    bun scripts/purge-non-bbl-baseline-data.ts --apply
 *   PROD (dry-run, review):    bun --env-file=.env.prod scripts/purge-non-bbl-baseline-data.ts
 *   PROD (DELETE, on "go"):    bun --env-file=.env.prod scripts/purge-non-bbl-baseline-data.ts --apply
 *
 * ⚠ ROLLBACK = restore from the pg_dump taken immediately before --apply (this is a multi-table
 * cascade delete; the dump is the rollback artifact, not a JSON backup). Always dry-run against
 * prod FIRST and eyeball the counts before --apply.
 */
// Load `.env` first so the prod-overlay pattern works: `bun --env-file=.env.prod` sets DATABASE_URL
// (+ resend vars), and dotenv fills the remaining required env (BETTER_AUTH_*, NEXT_PUBLIC_*) from
// `.env` WITHOUT overriding the already-set --env-file values. Must precede the `~/services/db`
// (→ env.ts) import, which validates the full env at module load.
import "dotenv/config"
import { db } from "~/services/db"

const APPLY = process.argv.includes("--apply")

// The three non-BBL brands to purge. NEVER includes BBL; `brand IS NULL` reference data is
// excluded by construction (an `in` filter never matches NULL).
const DELETE_BRANDS = ["BASELINE_MARTIAL_ARTS", "WEKAF", "RONIN_DOJO_DESIGN"] as const
const brandFilter = { brand: { in: DELETE_BRANDS as unknown as string[] } } as const

class DryRunRollback extends Error {}

// biome-ignore lint/suspicious/noExplicitAny: tx client surface.
type Tx = any

async function bblIntegrity(client: Tx) {
  const [orgs, trees, treeMembers, courses, pricing, users, passports] = await Promise.all([
    client.organization.count({ where: { brand: "BBL" } }),
    client.lineageTree.count({ where: { brand: "BBL" } }),
    client.lineageTreeMember.count({ where: { tree: { brand: "BBL" } } }),
    client.course.count({ where: { brand: "BBL" } }),
    client.pricingPlan.count({ where: { brand: "BBL" } }),
    client.user.count(),
    client.passport.count(),
  ])
  return { orgs, trees, treeMembers, courses, pricing, users, passports }
}

async function remainingNonBbl(client: Tx) {
  const [
    organization,
    course,
    pricingPlan,
    entitlement,
    lineageTree,
    rank,
    rankSystem,
    contentVariant,
    program,
    classSchedule,
    membership,
    invite,
    auditLog,
    certification,
  ] = await Promise.all([
    client.organization.count({ where: brandFilter }),
    client.course.count({ where: brandFilter }),
    client.pricingPlan.count({ where: brandFilter }),
    client.entitlement.count({ where: brandFilter }),
    client.lineageTree.count({ where: brandFilter }),
    client.rank.count({ where: brandFilter }),
    client.rankSystem.count({ where: brandFilter }),
    client.contentVariant.count({ where: brandFilter }),
    client.program.count({ where: brandFilter }),
    client.classSchedule.count({ where: brandFilter }),
    client.membership.count({ where: brandFilter }),
    client.invite.count({ where: brandFilter }),
    client.auditLog.count({ where: brandFilter }),
    client.certification.count({ where: { organization: brandFilter } }),
  ])
  const byTable = {
    organization,
    course,
    pricingPlan,
    entitlement,
    lineageTree,
    rank,
    rankSystem,
    contentVariant,
    program,
    classSchedule,
    membership,
    invite,
    auditLog,
    certification,
  }
  const total = Object.values(byTable).reduce((a, b) => a + (b as number), 0)
  return { byTable, total }
}

const host = process.env.DATABASE_URL?.split("@")[1]?.split("/")[1] ?? "(unknown)"
console.log(`DB: ${host}`)
console.log(`mode: ${APPLY ? "APPLY (will COMMIT deletes)" : "DRY-RUN (rolls back)"}\n`)

const before = await bblIntegrity(db)
const beforeNonBbl = await remainingNonBbl(db)
console.log("BBL integrity BEFORE:", before)
console.log(`non-BBL rows BEFORE: total=${beforeNonBbl.total}`, beforeNonBbl.byTable, "\n")

if (beforeNonBbl.total === 0) {
  console.log("Nothing to purge — DB already single-brand-BBL. Exiting.")
  process.exit(0)
}

try {
  const deleted = await db.$transaction(
    async (tx: Tx) => {
      const d: Record<string, number> = {}
      // FK-safe order. Most org children cascade; the rest are explicit brand-scoped deletes.
      // 1. Brian's demo SAFETY cert — RESTRICT blocker on the org delete.
      d.certification = (
        await tx.certification.deleteMany({ where: { organization: brandFilter } })
      ).count
      // 2. BASELINE ranks (0 awards) then their rank systems (RankSystem <- Rank is RESTRICT).
      d.rank = (await tx.rank.deleteMany({ where: brandFilter })).count
      d.rankSystem = (await tx.rankSystem.deleteMany({ where: brandFilter })).count
      // 3. Entitlements (cascade EntitlementGrant; 0 UserEntitlements).
      d.entitlement = (await tx.entitlement.deleteMany({ where: brandFilter })).count
      // 4. Lineage trees (cascade members / visual groups / access / claim reqs / bookmarks).
      d.lineageTree = (await tx.lineageTree.deleteMany({ where: brandFilter })).count
      // 5. Content variants + audit logs (not org-cascaded).
      d.contentVariant = (await tx.contentVariant.deleteMany({ where: brandFilter })).count
      d.auditLog = (await tx.auditLog.deleteMany({ where: brandFilter })).count
      // 6. The 2 demo orgs LAST — cascades Course / PricingPlan / Program / ClassSchedule /
      //    Membership / Invite + the rest of the org subtree.
      d.organization = (await tx.organization.deleteMany({ where: brandFilter })).count

      // Assertions (inside the tx, before commit/rollback):
      const remaining = await remainingNonBbl(tx)
      if (remaining.total !== 0) {
        throw new Error(
          `ABORT: ${remaining.total} non-BBL rows still remain after purge: ${JSON.stringify(
            remaining.byTable,
          )}`,
        )
      }
      const after = await bblIntegrity(tx)
      const drift = Object.entries(before).filter(
        ([k, v]) => (after as Record<string, number>)[k] !== v,
      )
      if (drift.length > 0) {
        throw new Error(
          `ABORT: BBL integrity changed: ${JSON.stringify(drift)} (before=${JSON.stringify(
            before,
          )} after=${JSON.stringify(after)})`,
        )
      }
      console.log("BBL integrity AFTER (in-tx, unchanged):", after)

      if (!APPLY) throw new DryRunRollback(JSON.stringify(d))
      return d
    },
    { timeout: 120_000 },
  )
  console.log("\n✅ APPLIED — deleted:", deleted)
  process.exit(0)
} catch (e) {
  if (e instanceof DryRunRollback) {
    console.log("\nDRY-RUN would delete (rolled back, nothing written):", JSON.parse(e.message))
    console.log("Re-run with --apply to COMMIT.")
    process.exit(0)
  }
  console.error("\n✗ PURGE ABORTED:", (e as Error).message.split("\n")[0])
  process.exit(1)
}
