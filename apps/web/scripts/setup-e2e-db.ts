/**
 * FS-0031 — provision the local e2e database (`ronindojo_e2e`) so the Playwright suite runs against
 * a DB whose data shape MATCHES CI. CI's e2e DB (`.github/workflows/playwright.yml`) is ONLY
 * `prisma migrate deploy`; the sole fixture is the tournament, seeded by Playwright's `globalSetup`
 * (`e2e/global-setup.ts` → `e2e/helpers/seed-tournament.ts`) at test time — ZERO posts, ZERO extra
 * orgs. So this script does the SAME: ensure the DB exists → `prisma migrate deploy` → nothing else.
 * `globalSetup` adds the tournament fixture identically in both places, so local == CI by default.
 *
 * WHY no data seed here (removed SESSION_0534): the earlier version seeded ~4 Posts + 2 Orgs
 * (WL-P2-58). That made the local DB RICHER than CI, so a data-dependent assertion could pass
 * locally yet fail on CI's empty DB — it reddened `main` twice (FS-0031 in-session recurrence).
 * Data-dependent specs now carry their OWN fixtures in-test (the `createTestPost`/`createTestOrg`
 * bridges in `e2e/helpers/auth.ts`), so they are seed-independent and green on the minimal DB.
 *
 * Run:  cd apps/web && bun run e2e:db:setup
 *   (package.json loads `.env.e2e`; the script validates DATABASE_URL and forces the Prisma child's
 *    DATABASE_URL + DIRECT_URL to that same e2e target.)
 *
 * Idempotent — safe to re-run.
 */
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { assertLiteralLocalE2eUrls, e2ePrismaChildEnv, LOCAL_E2E_DATABASE_NAME } from "./e2e-db-env"

const configuredDatabaseUrl = process.env.DATABASE_URL
assertLiteralLocalE2eUrls(configuredDatabaseUrl, process.env.DIRECT_URL)

// Give the validated value a stable `string` type before it is captured by migrateDeploy().
const e2eDatabaseUrl: string = configuredDatabaseUrl
const dbUrl = new URL(e2eDatabaseUrl)
const dbName = LOCAL_E2E_DATABASE_NAME

// createdb is off the sandbox PATH; Postgres.app ships it at an absolute path (works locally).
const CREATEDB_ABS = "/Applications/Postgres.app/Contents/Versions/latest/bin/createdb"

function ensureDatabase() {
  const args: string[] = []
  if (dbUrl.hostname) args.push("-h", dbUrl.hostname)
  if (dbUrl.port) args.push("-p", dbUrl.port)
  if (dbUrl.username) args.push("-U", dbUrl.username)
  args.push(dbName)

  const bin = existsSync(CREATEDB_ABS) ? CREATEDB_ABS : "createdb"
  try {
    execFileSync(bin, args, { stdio: "pipe" })
    console.log(`✓ created database ${dbName}`)
  } catch (err) {
    const stderr = String(
      (err as { stderr?: Buffer | string })?.stderr ?? (err as Error)?.message ?? "",
    )
    // Postgres has no `CREATE DATABASE IF NOT EXISTS`; an existing DB is the idempotent no-op.
    if (/already exists/i.test(stderr)) {
      console.log(`✓ database ${dbName} already exists`)
    } else {
      throw new Error(`createdb failed for ${dbName}: ${stderr}`)
    }
  }
}

function migrateDeploy() {
  console.log("→ prisma migrate deploy…")
  // Prisma config prefers DIRECT_URL and imports dotenv/config, which can fill a missing value from
  // the default `.env`. Force BOTH child URLs to the e2e URL validated above; never let a stale
  // prodsnap DIRECT_URL override the safety rail.
  execFileSync("bunx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: e2ePrismaChildEnv(process.env, e2eDatabaseUrl),
  })
}

function main() {
  console.log(`FS-0031 e2e DB setup → ${dbName}`)
  ensureDatabase()
  migrateDeploy()
  // No data seed — the tournament fixture is added by Playwright's globalSetup at test time (as in
  // CI); every other data-dependent spec self-seeds via the auth-db bridges. Keeping this DB at the
  // CI-minimal shape is the whole point (local == CI).
  console.log("✓ e2e DB ready (migrate deploy only — CI-minimal shape)")
}

main()
