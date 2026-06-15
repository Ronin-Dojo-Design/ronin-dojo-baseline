/**
 * Phase 3 pre-backfill assertion gate (READ-ONLY — never mutates).
 *
 * Run: `bun run apps/web/scripts/phase3-preflight-assert.ts`
 *
 * This MUST pass before any Phase 3b destructive backfill / column-drop runs. It proves the three
 * invariants the user-carry migration depends on (PHASE3_USER_CARRY_PREFLIGHT §5/§7):
 *
 *   (A) Passport↔User is 1:1 today — no duplicate `Passport.userId`. The satellite backfill
 *       (`passportId = SELECT id FROM Passport WHERE userId = satellite.userId`) is only
 *       deterministic if this holds.
 *   (B) No identity-satellite row points at a `userId` with no matching Passport — such an orphan
 *       would backfill NULL and then fail the future NOT-NULL flip.
 *   (C) No `isPlaceholder` User is referenced by any CARRY-side FK (account/actor/commerce). D1's
 *       whole premise is that a placeholder never legitimately held account-side state; a hit here is
 *       a data defect to reconcile manually — NOT to cascade-delete (we hard-delete placeholders in
 *       3b only AFTER this passes).
 *
 * The authoritative run is pre-3b against the migration-target DB. Against the local seed DB this is
 * a logic + sanity smoke.
 *
 * @added SESSION_0390 (Phase 3a)
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

/**
 * REPOINT identity satellites: a placeholder Passport IS allowed to own these (they move to
 * `passportId` in 3b). The earner half of RankAward and the promoted FightRecord (SESSION_0390) are
 * included; the RankAward promoter (`awardedById`) is a CARRY actor and is deliberately NOT here.
 */
const SATELLITE_USER_FKS: ReadonlyArray<{ table: string; column: string }> = [
  { table: "DirectoryProfile", column: "userId" },
  { table: "LineageNode", column: "userId" },
  { table: "Affiliation", column: "userId" },
  { table: "RankAward", column: "userId" },
  { table: "FightRecord", column: "userId" },
]

function n(rows: Array<{ n: bigint }>): number {
  return Number(rows[0]?.n ?? 0n)
}

async function main(): Promise<void> {
  const failures: string[] = []
  console.log("Phase 3 pre-backfill assertion gate (read-only)\n")

  // ---- (A) Passport↔User 1:1 integrity --------------------------------------------------------
  const dupes = await db.$queryRawUnsafe<Array<{ userId: string; n: bigint }>>(
    `SELECT "userId", COUNT(*)::bigint AS n FROM "Passport"
     WHERE "userId" IS NOT NULL GROUP BY "userId" HAVING COUNT(*) > 1`,
  )
  const totalPassports = n(await db.$queryRawUnsafe(`SELECT COUNT(*)::bigint AS n FROM "Passport"`))
  const accountless = n(
    await db.$queryRawUnsafe(`SELECT COUNT(*)::bigint AS n FROM "Passport" WHERE "userId" IS NULL`),
  )
  const placeholders = n(
    await db.$queryRawUnsafe(
      `SELECT COUNT(*)::bigint AS n FROM "User" WHERE "isPlaceholder" = true`,
    ),
  )
  console.log(
    `(A) Passport↔User 1:1 — total Passports: ${totalPassports}, accountless (userId NULL): ${accountless}, placeholder Users: ${placeholders}`,
  )
  if (dupes.length > 0) {
    failures.push(
      `(A) ${dupes.length} duplicate Passport.userId value(s) — Passport↔User is NOT 1:1.`,
    )
    for (const d of dupes)
      console.log(`    DUPLICATE userId=${d.userId} (${Number(d.n)} passports)`)
  } else {
    console.log("    ✓ no duplicate Passport.userId")
  }

  // ---- (B) Orphan check per identity satellite -------------------------------------------------
  console.log("\n(B) Satellite orphan check (userId with no matching Passport):")
  for (const { table, column } of SATELLITE_USER_FKS) {
    const orphans = n(
      await db.$queryRawUnsafe(
        `SELECT COUNT(*)::bigint AS n FROM "${table}" s
         LEFT JOIN "Passport" p ON p."userId" = s."${column}"
         WHERE s."${column}" IS NOT NULL AND p."id" IS NULL`,
      ),
    )
    if (orphans > 0) {
      failures.push(`(B) ${table}.${column}: ${orphans} row(s) point at a User with no Passport.`)
      console.log(`    ✗ ${table}.${column}: ${orphans} orphan(s)`)
    } else {
      console.log(`    ✓ ${table}.${column}: 0 orphans`)
    }
  }

  // ---- (C) Placeholder-as-actor check (catalog-driven) ----------------------------------------
  // Discover EVERY FK column that references User.id from the live catalog, then exempt the identity
  // satellites + the Passport root. Whatever remains is CARRY (account/actor) — a placeholder must
  // never appear there. Catalog-driven so it can't drift as columns are added/removed.
  const userFks = await db.$queryRawUnsafe<Array<{ table_name: string; column_name: string }>>(
    `SELECT tc.table_name, kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND ccu.table_name = 'User' AND ccu.column_name = 'id'
     ORDER BY tc.table_name, kcu.column_name`,
  )
  const exempt = new Set<string>([
    ...SATELLITE_USER_FKS.map(f => `${f.table}.${f.column}`),
    "Passport.userId",
  ])
  const carryFks = userFks.filter(f => !exempt.has(`${f.table_name}.${f.column_name}`))

  const placeholderIds = (
    await db.user.findMany({ where: { isPlaceholder: true }, select: { id: true } })
  ).map(u => u.id)

  console.log(
    `\n(C) Placeholder-as-actor check — ${carryFks.length} CARRY FK columns reference User.id; ${placeholderIds.length} placeholder User(s) to check:`,
  )
  if (placeholderIds.length === 0) {
    console.log("    ✓ no placeholder Users — nothing to check")
  } else {
    for (const fk of carryFks) {
      const hits = n(
        await db.$queryRawUnsafe(
          `SELECT COUNT(*)::bigint AS n FROM "${fk.table_name}" WHERE "${fk.column_name}" = ANY($1::text[])`,
          placeholderIds,
        ),
      )
      if (hits > 0) {
        failures.push(
          `(C) ${fk.table_name}.${fk.column_name}: ${hits} row(s) reference a placeholder User (account-side defect).`,
        )
        console.log(`    ✗ ${fk.table_name}.${fk.column_name}: ${hits}`)
      }
    }
    if (failures.every(f => !f.startsWith("(C)"))) {
      console.log("    ✓ no placeholder User referenced by any CARRY FK")
    }
  }

  // ---- Verdict --------------------------------------------------------------------------------
  console.log("\n" + "=".repeat(72))
  if (failures.length > 0) {
    console.log(`FAIL — ${failures.length} assertion(s) failed. Do NOT run Phase 3b backfill:`)
    for (const f of failures) console.log(`  • ${f}`)
    process.exitCode = 1
  } else {
    console.log("PASS — all Phase 3 pre-backfill assertions hold. Safe to proceed to 3b.")
  }
}

main()
  .catch(err => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
