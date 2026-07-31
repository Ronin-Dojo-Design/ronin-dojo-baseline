/**
 * Environment-aware prebuild migration gate (SESSION_0730).
 *
 * `prebuild` used to run `prisma migrate deploy` unconditionally, which meant
 * EVERY Vercel build applied the branch's committed migrations to whatever DB
 * its environment's DATABASE_URL named — including PREVIEW builds, which (until
 * the env-scoping fix) carried the prod Neon URL. Net effect: a migration file
 * in any pushed PR reached PROD at first preview build, hours before merge or
 * review. Harmless for additive migrations; catastrophic for a drop (the exact
 * shape of the queued G-011 RankAward table-drop, #380).
 *
 * The gate:
 * - Local build (`bun run build`, no VERCEL env)  → migrate deploy (unchanged —
 *   applies to the local .env DB, keeping local gate parity).
 * - Vercel PRODUCTION build (VERCEL_ENV=production) → migrate deploy (the one
 *   sanctioned prod-apply path; the file must be committed or nothing applies).
 * - Vercel PREVIEW/DEVELOPMENT build → SKIP, loudly. Preview environments get
 *   their own Neon branch DB via Vercel env scoping; until a preview DB is
 *   configured, a preview whose code needs a new column will 500 at runtime —
 *   that is the safe failure, not a silent prod write.
 *
 * Exit code propagates from prisma (never pipe through tail — PL-010).
 */
const vercelEnv = process.env.VERCEL_ENV
const onVercel = process.env.VERCEL === "1" || vercelEnv !== undefined

if (onVercel && vercelEnv !== "production") {
  console.log(
    `[prebuild-migrate] SKIP: VERCEL_ENV=${vercelEnv ?? "unset"} — migrations apply only in the ` +
      "production build (or local builds against the local DB). A preview build must never " +
      "migrate a shared/prod database; see docs/runbooks/database/schema-migration.md.",
  )
  process.exit(0)
}

console.log(
  `[prebuild-migrate] APPLY: ${onVercel ? "Vercel production build" : "local build"} — running prisma migrate deploy.`,
)
const { spawnSync } = await import("node:child_process")
const proc = spawnSync("bunx", ["prisma", "migrate", "deploy"], { stdio: "inherit" })
process.exit(proc.status ?? 1)
