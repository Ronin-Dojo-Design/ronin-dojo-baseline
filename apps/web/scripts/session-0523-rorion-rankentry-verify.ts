/**
 * SESSION_0523 B1 — targeted RankEntry re-sync for an OFF-canonical-tree IMPORTED member.
 *
 * The SESSION_0522 belt-backfill was scoped to `rigan-machado-lineage`, so IMPORTED-award
 * members off that tree kept a stale `RankEntry.status = UNVERIFIED` even though the global
 * `rankEntryStatusForAward` rule now derives IMPORTED → VERIFIED. Live re-grounding found
 * exactly ONE: Rorion Gracie (Red Belt 9th Degree). Operator-authorized to verify
 * (SESSION_0523).
 *
 * Mirrors the SESSION_0522 Part-A treatment of IMPORTED entries: KEEP the RankAward IMPORTED
 * (provenance + belt-gate read-only), only flip the derived RankEntry.status → VERIFIED
 * (durable — future syncs re-derive IMPORTED → VERIFIED). Idempotent; targets ONLY entries
 * whose award is IMPORTED and whose stored status is UNVERIFIED.
 *
 * Dry-run by default. Apply: cd apps/web &&
 *   bun --env-file=/Users/brianscott/dev/ronin-0522/apps/web/.env.prod \
 *     scripts/session-0523-rorion-rankentry-verify.ts --apply
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const APPLY = process.argv.includes("--apply")
const connectionString: string =
  process.env.DATABASE_URL ??
  (() => {
    throw new Error("DATABASE_URL missing — run with --env-file=.env.prod")
  })()
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

async function main() {
  const host = connectionString.replace(/^.*@/, "").replace(/\/.*$/, "").split("?")[0]
  console.log(`DB host: ${host}  |  mode: ${APPLY ? "APPLY (writes)" : "DRY RUN (no writes)"}`)
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    console.log("REFUSING: local DB, not prod — aborting.")
    return
  }

  // The stale class: stored entry UNVERIFIED while its award provenance is IMPORTED.
  const stale = await db.rankEntry.findMany({
    where: { status: "UNVERIFIED", rankAward: { verificationStatus: "IMPORTED" } },
    select: {
      id: true,
      passport: { select: { displayName: true } },
      rankAward: { select: { verificationStatus: true, rank: { select: { name: true } } } },
    },
  })

  console.log(`\nStale IMPORTED entries found: ${stale.length}`)
  for (const e of stale) {
    console.log(
      `  ${e.passport?.displayName ?? "(no passport)"} — ${e.rankAward?.rank?.name ?? "?"} — entry UNVERIFIED → VERIFIED (award kept ${e.rankAward?.verificationStatus})`,
    )
  }

  if (stale.length === 0) {
    console.log("\nNothing to do — already consistent.")
    return
  }

  if (!APPLY) {
    console.log("\nDRY RUN — no writes. Re-run with --apply to verify the above.")
    return
  }

  const result = await db.rankEntry.updateMany({
    where: { status: "UNVERIFIED", rankAward: { verificationStatus: "IMPORTED" } },
    data: { status: "VERIFIED" },
  })
  console.log(
    `\nAPPLIED — ${result.count} RankEntry row(s) set VERIFIED (awards untouched / still IMPORTED).`,
  )

  // Re-query proof.
  const remaining = await db.rankEntry.count({
    where: { status: "UNVERIFIED", rankAward: { verificationStatus: "IMPORTED" } },
  })
  console.log(`Post-apply stale IMPORTED entries: ${remaining} (expect 0).`)
}

main()
  .then(() => db.$disconnect())
  .catch(async e => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
