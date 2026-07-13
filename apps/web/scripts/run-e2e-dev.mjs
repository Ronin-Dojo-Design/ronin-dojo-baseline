/**
 * FS-0031 (SESSION_0534) — launch the LOCAL e2e dev server against the seeded `ronindojo_e2e` DB.
 *
 * WHY this exists instead of `bun --env-file=.env.e2e next dev --turbo`: that form runs `next` under
 * the BUN runtime, which injects a bun loader into child processes' `NODE_OPTIONS`. Turbopack's
 * PostCSS worker is a plain Node process and chokes on it (0533 residual). This launcher runs under
 * Node (no bun in the chain → no injected NODE_OPTIONS), loads `.env.e2e` via `process.loadEnvFile`
 * (NOT by exporting env through a bun `--env-file` hop), then spawns `next dev --turbo` (FS-0002 —
 * never `bun dev`/`pnpm dev`) inheriting that clean env.
 *
 * Run:  cd apps/web && node scripts/run-e2e-dev.mjs   (or `bun run dev:e2e`, which just invokes node)
 */
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

// scripts/run-e2e-dev.mjs → apps/web
const appDir = dirname(dirname(fileURLToPath(import.meta.url)))
const envPath = join(appDir, ".env.e2e")

if (!existsSync(envPath)) {
  console.error(
    `✗ ${envPath} not found. Copy .env → .env.e2e and point DATABASE_URL/DIRECT_URL at ` +
      `ronindojo_e2e (see apps/web/.env.e2e.example).`,
  )
  process.exit(1)
}

// `process.loadEnvFile` (like `--env-file`) does NOT override vars already present in process.env,
// and `bun run dev:e2e` auto-loads the default `.env` (prodsnap DB) before this runs — so drop the DB
// URLs first, guaranteeing the `.env.e2e` values win whether launched via `node …` or `bun run …`.
delete process.env.DATABASE_URL
delete process.env.DIRECT_URL

// Load the e2e env into THIS process's env WITHOUT a bun `--env-file` hop (no NODE_OPTIONS injection).
process.loadEnvFile(envPath)

if (!/ronindojo_e2e/.test(process.env.DATABASE_URL ?? "")) {
  console.error(
    `✗ Refusing to start: DATABASE_URL is not the e2e DB (got ${process.env.DATABASE_URL ?? "<unset>"}). ` +
      "Point .env.e2e at ronindojo_e2e.",
  )
  process.exit(1)
}

// FS-0002: `next dev --turbo` (never `bun dev`). npx resolves the workspace-hoisted `next` binary;
// running it under Node keeps the Turbopack PostCSS worker's NODE_OPTIONS clean.
const child = spawn("npx", ["next", "dev", "--turbo"], {
  cwd: appDir,
  stdio: "inherit",
  env: process.env,
})

child.on("exit", code => process.exit(code ?? 0))
