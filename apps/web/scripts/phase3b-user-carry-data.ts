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

const DEFAULT_CUID2_PATTERN = "^[a-z][a-z0-9]{23}$"
const FULL_REWRITE_TRANSACTION_TIMEOUT_MS = 600_000

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0]

type StringPrimaryKey = {
  table: string
  column: string
}

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

async function listSingleColumnStringPrimaryKeys(tx: Tx): Promise<StringPrimaryKey[]> {
  return tx.$queryRawUnsafe<StringPrimaryKey[]>(
    `WITH pk_columns AS (
       SELECT
         tc.table_name,
         kcu.column_name,
         COUNT(*) OVER (PARTITION BY tc.table_name, tc.constraint_name) AS pk_column_count
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = 'public'
         AND tc.constraint_type = 'PRIMARY KEY'
         AND tc.table_name <> '_prisma_migrations'
     )
     SELECT pk.table_name AS table, pk.column_name AS column
     FROM pk_columns pk
     JOIN information_schema.columns c
       ON c.table_schema = 'public'
      AND c.table_name = pk.table_name
      AND c.column_name = pk.column_name
     WHERE pk.pk_column_count = 1
       AND c.data_type IN ('text', 'character varying', 'character')
     ORDER BY pk.table_name`,
  )
}

async function assertStringPrimaryKeyReferencesCascade(tx: Tx, primaryKeys: StringPrimaryKey[]) {
  await tx.$executeRawUnsafe(
    `CREATE TEMP TABLE phase3b_string_primary_keys (
       table_name text NOT NULL,
       column_name text NOT NULL,
       PRIMARY KEY (table_name, column_name)
     ) ON COMMIT DROP`,
  )
  await tx.$executeRawUnsafe(
    `INSERT INTO phase3b_string_primary_keys (table_name, column_name)
     SELECT table_name, column_name
     FROM jsonb_to_recordset($1::jsonb) AS x(table_name text, column_name text)`,
    JSON.stringify(primaryKeys.map(pk => ({ table_name: pk.table, column_name: pk.column }))),
  )

  const failures = await tx.$queryRawUnsafe<Array<{ message: string }>>(
    `SELECT
       tc.table_name || '.' || kcu.column_name || ' -> ' ||
       ccu.table_name || '.' || ccu.column_name || ' has ON UPDATE ' || rc.update_rule AS message
     FROM information_schema.referential_constraints rc
     JOIN information_schema.table_constraints tc
       ON tc.constraint_name = rc.constraint_name
      AND tc.constraint_schema = rc.constraint_schema
     JOIN information_schema.key_column_usage kcu
       ON kcu.constraint_name = tc.constraint_name
      AND kcu.constraint_schema = tc.constraint_schema
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = rc.unique_constraint_name
      AND ccu.constraint_schema = rc.unique_constraint_schema
     JOIN phase3b_string_primary_keys pk
       ON pk.table_name = ccu.table_name
      AND pk.column_name = ccu.column_name
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND rc.update_rule <> 'CASCADE'
     ORDER BY tc.table_name, kcu.column_name`,
  )

  if (failures.length > 0) {
    throw new Error(
      `Cannot safely rewrite primary keys without ON UPDATE CASCADE: ${failures.map(f => f.message).join("; ")}`,
    )
  }
}

async function rewriteStringPrimaryKeysToCuid2(tx: Tx): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  const primaryKeys = await listSingleColumnStringPrimaryKeys(tx)

  await assertStringPrimaryKeyReferencesCascade(tx, primaryKeys)
  await tx.$executeRawUnsafe(
    `CREATE TEMP TABLE phase3b_cuid2_rewrite_map (
       old_id text PRIMARY KEY,
       new_id text NOT NULL UNIQUE
     ) ON COMMIT DROP`,
  )

  for (const { table, column } of primaryKeys) {
    const rows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT "${column}" AS id
       FROM "${table}"
       WHERE "${column}" !~ $1
       ORDER BY "${column}"`,
      DEFAULT_CUID2_PATTERN,
    )
    if (rows.length > 0) {
      const rewriteMap = rows.map(row => ({ old_id: row.id, new_id: createId() }))
      await tx.$executeRawUnsafe(`TRUNCATE phase3b_cuid2_rewrite_map`)
      await tx.$executeRawUnsafe(
        `INSERT INTO phase3b_cuid2_rewrite_map (old_id, new_id)
         SELECT old_id, new_id
         FROM jsonb_to_recordset($1::jsonb) AS x(old_id text, new_id text)`,
        JSON.stringify(rewriteMap),
      )
      await tx.$executeRawUnsafe(
        `UPDATE "${table}" target
         SET "${column}" = rewrite.new_id
         FROM phase3b_cuid2_rewrite_map rewrite
         WHERE target."${column}" = rewrite.old_id`,
      )
    }
    counts[`${table}.${column}`] = rows.length
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

      const rewritten = await rewriteStringPrimaryKeysToCuid2(tx)
      console.log("cuid2 string PK rewrite:", rewritten)

      const deleted = await detachAndDeletePlaceholderUsers(tx)
      console.log(`hard-deleted placeholder Users: ${deleted}`)

      await assertBrianAdminSurvives(tx)
      await printBeforeAfter("after", tx)
    },
    { timeout: FULL_REWRITE_TRANSACTION_TIMEOUT_MS },
  )
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
