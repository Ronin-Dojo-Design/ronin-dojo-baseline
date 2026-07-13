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
 *   (package.json wraps it: `bun --env-file=.env.e2e scripts/setup-e2e-db.ts`, so DATABASE_URL/
 *    DIRECT_URL already point at ronindojo_e2e when this executes.)
 *
 * Idempotent — safe to re-run.
 */
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL unset — run via `bun --env-file=.env.e2e scripts/setup-e2e-db.ts`")
}

const dbUrl = new URL(DATABASE_URL)
const dbName = dbUrl.pathname.replace(/^\//, "")

// Safety rail: this script CREATES the target DB. Refuse to touch anything that isn't an explicit
// e2e database (never prodsnap/dev). The `.env.e2e` DB name must contain "e2e".
if (!/e2e/.test(dbName)) {
  throw new Error(
    `Refusing to provision non-e2e database "${dbName}". Point DATABASE_URL at ronindojo_e2e (.env.e2e).`,
  )
}

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
  // Inherits process.env (DATABASE_URL/DIRECT_URL from --env-file=.env.e2e), so the CLI's
  // prisma.config.ts (`DIRECT_URL ?? DATABASE_URL` locally) targets ronindojo_e2e.
  execFileSync("bunx", ["prisma", "migrate", "deploy"], { stdio: "inherit", env: process.env })
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
