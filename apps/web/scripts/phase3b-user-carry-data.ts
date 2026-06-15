/**
 * Phase 3b user-carry data migration.
 *
 * Runs the destructive data half after the additive Phase 3a columns exist and after the
 * `RankAward.awardedByPassportId` support migration is applied.
 *
 * Order:
 * 1. Mint Passports for satellite-bearing Users that lack one.
 * 2. Copy historical RankAward promoters to Passport and null placeholder actor FKs.
 * 3. Backfill satellite passportId values by Passport.userId lookup.
 * 4. Regenerate identity-table primary keys to cuid2 values; FK ON UPDATE CASCADE carries refs.
 * 5. Null old satellite userId references for placeholders, assert no CARRY rows, detach Passports,
 *    then hard-delete placeholder Users.
 *
 * It intentionally does NOT drop old userId columns. The schema/drop migration is a separate step
 * after this script and the preflight gate pass.
 *
 * Run from apps/web:
 *   PHASE3B_ALLOW_DESTRUCTIVE=1 bun run scripts/phase3b-user-carry-data.ts
 */
import { createId } from "@paralleldrive/cuid2"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"
import { PHASE3_IDENTITY_SATELLITE_USER_FKS } from "./phase3-identity-satellites"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const IDENTITY_ID_TABLES = [
  "Passport",
  "DirectoryProfile",
  "LineageNode",
  "Affiliation",
  "RankAward",
  "FightRecord",
] as const

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0]

function requireDestructiveFlag() {
  if (process.env.PHASE3B_ALLOW_DESTRUCTIVE !== "1") {
    throw new Error("Set PHASE3B_ALLOW_DESTRUCTIVE=1 to run the Phase 3b data migration.")
  }
}

function firstCount(rows: Array<{ n: bigint }>): number {
  return Number(rows[0]?.n ?? 0n)
}

async function assertPromoterPassportColumn(tx: Tx) {
  const rows = await tx.$queryRawUnsafe<Array<{ n: bigint }>>(
    `SELECT COUNT(*)::bigint AS n
     FROM information_schema.columns
     WHERE table_name = 'RankAward' AND column_name = 'awardedByPassportId'`,
  )
  if (firstCount(rows) !== 1) {
    throw new Error("Missing RankAward.awardedByPassportId. Apply migration 20260615120000 first.")
  }
}

async function mintMissingPassports(tx: Tx): Promise<number> {
  const missing = await tx.$queryRawUnsafe<
    Array<{ id: string; name: string; image: string | null }>
  >(
    `SELECT DISTINCT u."id", u."name", u."image"
     FROM "User" u
     WHERE NOT EXISTS (SELECT 1 FROM "Passport" p WHERE p."userId" = u."id")
       AND (
         EXISTS (SELECT 1 FROM "DirectoryProfile" s WHERE s."userId" = u."id")
         OR EXISTS (SELECT 1 FROM "LineageNode" s WHERE s."userId" = u."id")
         OR EXISTS (SELECT 1 FROM "Affiliation" s WHERE s."userId" = u."id")
         OR EXISTS (SELECT 1 FROM "RankAward" s WHERE s."userId" = u."id")
         OR EXISTS (SELECT 1 FROM "FightRecord" s WHERE s."userId" = u."id")
         OR EXISTS (SELECT 1 FROM "RankAward" s WHERE s."awardedById" = u."id")
       )
     ORDER BY u."name", u."id"`,
  )

  for (const user of missing) {
    const parts = user.name.trim().split(/\s+/).filter(Boolean)
    const legalFirstName = parts[0] ?? null
    const legalLastName = parts.length > 1 ? parts.slice(1).join(" ") : null

    await tx.$executeRawUnsafe(
      `INSERT INTO "Passport"
       ("id", "displayName", "legalFirstName", "legalLastName", "avatarUrl", "userId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      createId(),
      user.name,
      legalFirstName,
      legalLastName,
      user.image,
      user.id,
    )
  }

  return missing.length
}

async function reconcilePromoterPassports(tx: Tx): Promise<{
  copied: number
  nulledPlaceholderActors: number
}> {
  const copied = await tx.$executeRawUnsafe(
    `UPDATE "RankAward" ra
     SET "awardedByPassportId" = p."id"
     FROM "Passport" p
     WHERE ra."awardedById" IS NOT NULL
       AND p."userId" = ra."awardedById"
       AND ra."awardedByPassportId" IS DISTINCT FROM p."id"`,
  )

  const nulledPlaceholderActors = await tx.$executeRawUnsafe(
    `UPDATE "RankAward" ra
     SET "awardedById" = NULL
     FROM "User" u
     WHERE ra."awardedById" = u."id"
       AND u."isPlaceholder" = true`,
  )

  return { copied, nulledPlaceholderActors }
}

async function backfillSatellitePassportIds(tx: Tx): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}

  for (const fk of PHASE3_IDENTITY_SATELLITE_USER_FKS) {
    counts[fk.table] = await tx.$executeRawUnsafe(
      `UPDATE "${fk.table}" s
       SET "${fk.passportColumn}" = p."id"
       FROM "Passport" p
       WHERE s."${fk.column}" IS NOT NULL
         AND p."userId" = s."${fk.column}"
         AND s."${fk.passportColumn}" IS DISTINCT FROM p."id"`,
    )
  }

  return counts
}

async function assertSatellitePassportIds(tx: Tx) {
  const failures: string[] = []

  for (const fk of PHASE3_IDENTITY_SATELLITE_USER_FKS) {
    const rows = await tx.$queryRawUnsafe<Array<{ n: bigint }>>(
      `SELECT COUNT(*)::bigint AS n FROM "${fk.table}" WHERE "${fk.passportColumn}" IS NULL`,
    )
    const count = firstCount(rows)
    if (count > 0) failures.push(`${fk.table}.${fk.passportColumn}: ${count} NULL row(s)`)
  }

  if (failures.length > 0) {
    throw new Error(`Satellite passportId backfill incomplete: ${failures.join("; ")}`)
  }
}

async function rewriteIdentityPrimaryKeys(tx: Tx): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}

  for (const table of IDENTITY_ID_TABLES) {
    const rows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT "id" FROM "${table}" ORDER BY "id"`,
    )
    for (const row of rows) {
      await tx.$executeRawUnsafe(
        `UPDATE "${table}" SET "id" = $1 WHERE "id" = $2`,
        createId(),
        row.id,
      )
    }
    counts[table] = rows.length
  }

  return counts
}

async function assertNoPlaceholderCarryRows(tx: Tx) {
  const userFks = await tx.$queryRawUnsafe<Array<{ table_name: string; column_name: string }>>(
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
    ...PHASE3_IDENTITY_SATELLITE_USER_FKS.map(fk => `${fk.table}.${fk.column}`),
    "Passport.userId",
  ])
  const carryFks = userFks.filter(fk => !exempt.has(`${fk.table_name}.${fk.column_name}`))
  const placeholderIds = (
    await tx.user.findMany({ where: { isPlaceholder: true }, select: { id: true } })
  ).map(user => user.id)

  const failures: string[] = []
  for (const fk of carryFks) {
    const rows = await tx.$queryRawUnsafe<Array<{ n: bigint }>>(
      `SELECT COUNT(*)::bigint AS n
       FROM "${fk.table_name}"
       WHERE "${fk.column_name}" = ANY($1::text[])`,
      placeholderIds,
    )
    const count = firstCount(rows)
    if (count > 0) failures.push(`${fk.table_name}.${fk.column_name}: ${count}`)
  }

  if (failures.length > 0) {
    throw new Error(`Placeholder User(s) still own CARRY rows: ${failures.join("; ")}`)
  }
}

async function nullOutPlaceholderSatelliteUserIds(tx: Tx): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}

  for (const fk of PHASE3_IDENTITY_SATELLITE_USER_FKS) {
    await tx.$executeRawUnsafe(
      `ALTER TABLE "${fk.table}" ALTER COLUMN "${fk.column}" DROP NOT NULL`,
    )
    counts[fk.table] = await tx.$executeRawUnsafe(
      `UPDATE "${fk.table}" s
       SET "${fk.column}" = NULL
       FROM "User" u
       WHERE s."${fk.column}" = u."id"
         AND u."isPlaceholder" = true`,
    )
  }

  return counts
}

async function detachAndDeletePlaceholderUsers(tx: Tx): Promise<number> {
  const nulledSatellites = await nullOutPlaceholderSatelliteUserIds(tx)
  console.log("nulled old placeholder satellite userIds:", nulledSatellites)

  await assertNoPlaceholderCarryRows(tx)

  await tx.$executeRawUnsafe(
    `UPDATE "Passport" p
     SET "userId" = NULL
     FROM "User" u
     WHERE p."userId" = u."id"
       AND u."isPlaceholder" = true`,
  )

  return await tx.$executeRawUnsafe(`DELETE FROM "User" WHERE "isPlaceholder" = true`)
}

async function assertBrianAdminSurvives(tx: Tx) {
  const rows = await tx.$queryRawUnsafe<Array<{ n: bigint }>>(
    `SELECT COUNT(*)::bigint AS n
     FROM "User"
     WHERE "isPlaceholder" = false AND ("role" = 'admin' OR "name" ILIKE '%Brian Scott%')`,
  )
  if (firstCount(rows) < 1) {
    throw new Error("Expected at least one non-placeholder admin/Brian Scott User after migration.")
  }
}

async function printBeforeAfter(label: string, tx: Tx) {
  const rows = await tx.$queryRawUnsafe<
    Array<{ users: bigint; placeholders: bigint; passports: bigint; accountless_passports: bigint }>
  >(
    `SELECT
       (SELECT COUNT(*)::bigint FROM "User") AS users,
       (SELECT COUNT(*)::bigint FROM "User" WHERE "isPlaceholder" = true) AS placeholders,
       (SELECT COUNT(*)::bigint FROM "Passport") AS passports,
       (SELECT COUNT(*)::bigint FROM "Passport" WHERE "userId" IS NULL) AS accountless_passports`,
  )
  const row = rows[0]!
  console.log(
    `${label}: users=${Number(row.users)}, placeholderUsers=${Number(row.placeholders)}, passports=${Number(row.passports)}, accountlessPassports=${Number(row.accountless_passports)}`,
  )
}

async function main() {
  requireDestructiveFlag()

  console.log("Phase 3b user-carry data migration")
  console.log("Target DB:", process.env.DATABASE_URL?.replace(/:\/\/.*@/, "://***@") ?? "(unset)")

  await db.$transaction(
    async tx => {
      await assertPromoterPassportColumn(tx)
      await printBeforeAfter("before", tx)

      const minted = await mintMissingPassports(tx)
      console.log(`minted Passports: ${minted}`)

      const promoter = await reconcilePromoterPassports(tx)
      console.log(
        `promoters: copiedToPassport=${promoter.copied}, nulledPlaceholderActors=${promoter.nulledPlaceholderActors}`,
      )

      const backfilled = await backfillSatellitePassportIds(tx)
      console.log("satellite backfill:", backfilled)
      await assertSatellitePassportIds(tx)

      const rewritten = await rewriteIdentityPrimaryKeys(tx)
      console.log("cuid2 identity PK rewrite:", rewritten)

      const deleted = await detachAndDeletePlaceholderUsers(tx)
      console.log(`hard-deleted placeholder Users: ${deleted}`)

      await assertBrianAdminSurvives(tx)
      await printBeforeAfter("after", tx)
    },
    { timeout: 120_000 },
  )
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
