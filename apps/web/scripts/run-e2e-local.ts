/**
 * FS-0031 — launcher for the local e2e suite against the CI-minimal `ronindojo_e2e` DB.
 *
 * MUST be invoked as a DIRECT child of `bun --env-file=.env.e2e` (see the `test:e2e:local`
 * package script) so DATABASE_URL/DIRECT_URL land in THIS process's env as REAL exported vars.
 * We then exec `playwright test` with that env explicitly.
 *
 * Why not just `bun --env-file=.env.e2e x playwright test`? Bun's `x` (bunx) hop spawns a fresh bun
 * that re-resolves `.env` and DROPS the `--env-file` overrides, so the Playwright→auth-db bridge
 * (e2e/helpers/auth-db.ts) silently falls back to `.env` (ronindojo_prodsnap). The minted admin
 * session then lives in prodsnap while the e2e-backed dev server reads ronindojo_e2e → every
 * /app/* route 307-redirects (session invalid) and no table renders. Passing the resolved env
 * EXPLICITLY to the child (real inherited vars survive bun's `.env` auto-load) fixes that.
 *
 * Writes Playwright's JSON report to .e2e-run-evidence.json for the FS-0031 pre-push guard.
 * Any extra args are forwarded to `playwright test` (e.g. `-- admin-collection-conformance
 * --project=chromium`).
 */
import { execFileSync } from "node:child_process"
import { assertLiteralLocalE2eUrls } from "./e2e-db-env"

try {
  assertLiteralLocalE2eUrls(process.env.DATABASE_URL, process.env.DIRECT_URL)
} catch (error) {
  console.error(
    `✗ Refusing to run: ${(error as Error).message}. Invoke via \`bun run test:e2e:local\` ` +
      "with both .env.e2e URLs set to the literal ronindojo_e2e database.",
  )
  process.exit(1)
}

const passthrough = process.argv.slice(2)

try {
  execFileSync("bunx", ["playwright", "test", "--reporter=line,json", ...passthrough], {
    stdio: "inherit",
    env: {
      ...process.env,
      // Playwright's JSON reporter writes here → the FS-0031 evidence artifact.
      PLAYWRIGHT_JSON_OUTPUT_NAME: ".e2e-run-evidence.json",
      // Force local mode so playwright.config.ts `reuseExistingServer: !CI` reuses the dev server
      // you started on :3000 instead of spawning the FS-0002-banned `bun run dev`.
      CI: "",
    },
  })
} catch (err) {
  // Playwright already printed the failures; mirror its non-zero exit for the guard / CLI.
  process.exit((err as { status?: number })?.status ?? 1)
}
