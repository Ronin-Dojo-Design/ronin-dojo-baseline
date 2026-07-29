/**
 * FS-0031 — provision the local e2e database (`ronindojo_e2e`) so the Playwright suite runs against
 * a DB whose data shape MATCHES CI. CI's e2e DB (`.github/workflows/playwright.yml`) is ONLY
 * `prisma migrate deploy`; the sole fixture is the tournament, seeded by Playwright's `globalSetup`
 * (`e2e/global-setup.ts`, plus the SESSION_0717 BJJ base-reference seed) at test time — ZERO posts,
 * ZERO extra orgs. So this script does the SAME: DROP the DB → recreate → `prisma migrate deploy` →
 * nothing else. `globalSetup` adds the base reference + tournament fixture identically in both
 * places. The drop (SESSION_0717) makes `local == CI` ENFORCED, not merely a default a drifted DB
 * could violate — the very failure FS-0031 warned about but did not prevent.
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

// createdb/dropdb are off the sandbox PATH; Postgres.app ships them at absolute paths (work locally).
const PG_BIN_ABS = "/Applications/Postgres.app/Contents/Versions/latest/bin"
const CREATEDB_ABS = `${PG_BIN_ABS}/createdb`
const DROPDB_ABS = `${PG_BIN_ABS}/dropdb`

/** Shared host/port/user connection flags (never the target db name). */
function pgConnArgs(): string[] {
  const args: string[] = []
  if (dbUrl.hostname) args.push("-h", dbUrl.hostname)
  if (dbUrl.port) args.push("-p", dbUrl.port)
  if (dbUrl.username) args.push("-U", dbUrl.username)
  return args
}

/**
 * local == CI, ENFORCED (SESSION_0717). Drop the e2e DB every run so a drifted local DB — e.g. one
 * that got the full `prisma/seed.ts` once — can NEVER mask a CI-shape failure again. FS-0031 already
 * *said* "keep the e2e DB CI-minimal"; it was a written rule, not an enforced reset, so the local DB
 * silently drifted (a real BJJ-discipline drift reddened CI while passing locally). The
 * `assertLiteralLocalE2eUrls` guard above guarantees this only ever targets the e2e DB, never dev/prod.
 */
function resetDatabase() {
  const bin = existsSync(DROPDB_ABS) ? DROPDB_ABS : "dropdb"
  // --if-exists: first-run no-op; --force: terminate stale connections (Postgres 13+).
  execFileSync(bin, [...pgConnArgs(), "--if-exists", "--force", dbName], { stdio: "pipe" })
  console.log(`✓ dropped ${dbName} (reset to CI-shape)`)
}

function ensureDatabase() {
  const bin = existsSync(CREATEDB_ABS) ? CREATEDB_ABS : "createdb"
  try {
    execFileSync(bin, [...pgConnArgs(), dbName], { stdio: "pipe" })
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
  resetDatabase()
  ensureDatabase()
  migrateDeploy()
  // No data seed — the BJJ base reference + tournament fixture are added by Playwright's globalSetup
  // at test time (as in CI); every other data-dependent spec self-seeds via the auth-db bridges.
  // The drop above enforces the CI-minimal shape rather than trusting it (local == CI).
  console.log("✓ e2e DB ready (dropped + migrate deploy only — CI-minimal shape, local == CI)")
}

main()
