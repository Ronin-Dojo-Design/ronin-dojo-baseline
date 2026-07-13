/**
 * FS-0031 guard — block shipping an `apps/web/e2e/**`-touching diff without evidence the affected
 * spec was actually RUN locally. FS-0031 was three consecutive red-`main` pushes because new
 * Playwright assertions were shipped "verified by inspection" — the suite couldn't be run locally
 * as-configured. The corrective fix is a small seeded e2e DB (`scripts/setup-e2e-db.ts`) PLUS this
 * evidence gate.
 *
 * NOT a git hook. Run it at bow-out / pre-push (see docs/rituals/closing.md). You MAY wire a local
 * pre-push hook yourself that calls it, but this repo does not install one (supply-chain caution).
 *
 * Usage:
 *   bun run e2e:evidence:check                    # gate
 *   bun run e2e:evidence:check --waiver="reason"  # explicit escape hatch (prints the reason)
 *
 * Evidence = apps/web/.e2e-run-evidence.json (Playwright JSON reporter, written by
 * `bun run test:e2e:local`). It must be (a) newer than every touched e2e file, (b) a passing run
 * (stats.unexpected === 0, expected > 0), and (c) include every touched *.spec.ts.
 */
import { execFileSync } from "node:child_process"
import { existsSync, statSync } from "node:fs"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const E2E_PREFIX = "apps/web/e2e/"
const EVIDENCE_REL = "apps/web/.e2e-run-evidence.json"

const RECIPE = `
FS-0031 — never land a new/changed e2e assertion without running the affected spec locally first.
Recipe (sidesteps the FS-0002-banned \`bun dev\` + the heavy prodsnap tx-timeout):

  cd apps/web
  bun run e2e:db:setup                                  # small seeded ronindojo_e2e (idempotent)
  bun run dev:e2e &                                     # loadEnvFile launcher — NOT \`bun --env-file next dev\` (poisons Turbopack's PostCSS worker; FS-0031)
  bun run test:e2e:local -- <spec> --project=chromium   # runs + writes .e2e-run-evidence.json

Then re-run this guard. Override only with a real reason:
  bun run e2e:evidence:check --waiver="why this diff ships without a local run"
`

function sh(cmd: string, args: string[]): string {
  try {
    return execFileSync(cmd, args, { encoding: "utf-8" }).trim()
  } catch {
    return ""
  }
}

function repoRoot(): string {
  return sh("git", ["rev-parse", "--show-toplevel"]) || process.cwd()
}

/** Base ref to diff against: prefer origin/main, fall back to main, then HEAD. */
function baseRef(): string {
  for (const ref of ["origin/main", "main"]) {
    if (sh("git", ["rev-parse", "--verify", ref])) return ref
  }
  return "HEAD"
}

/**
 * Every path changed vs the base — committed, staged, unstaged, and untracked.
 * Both git invocations run with `-C root` so their output is repo-root-relative
 * regardless of the caller's cwd: `git diff --name-only` is always root-relative,
 * but `git ls-files --others` is *cwd-relative*, so running the guard from
 * `apps/web` (the documented recipe cwd) would otherwise emit untracked specs as
 * `e2e/…` and slip the `apps/web/e2e/` filter — exactly the FS-0031 marquee case
 * (a brand-new assertion). Pinning both to `root` keeps them consistent.
 */
function changedPaths(root: string, base: string): Set<string> {
  const paths = new Set<string>()
  // Working tree (incl. staged + unstaged committed changes) vs base.
  for (const p of sh("git", ["-C", root, "diff", "--name-only", base]).split("\n")) {
    if (p) paths.add(p)
  }
  // New, not-yet-tracked files.
  for (const p of sh("git", ["-C", root, "ls-files", "--others", "--exclude-standard"]).split(
    "\n",
  )) {
    if (p) paths.add(p)
  }
  return paths
}

/** Recursively collect every spec file path referenced by a Playwright JSON report. */
function reportSpecFiles(report: unknown): Set<string> {
  const files = new Set<string>()
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return
    const n = node as Record<string, unknown>
    if (typeof n.file === "string") files.add(n.file)
    for (const key of ["suites", "specs", "tests"]) {
      const child = n[key]
      if (Array.isArray(child)) child.forEach(walk)
    }
  }
  walk(report)
  return files
}

function fail(message: string): never {
  console.error(`✗ FS-0031 e2e-evidence guard: ${message}`)
  console.error(RECIPE)
  process.exit(1)
}

function main() {
  const waiverArg = process.argv.find(a => a.startsWith("--waiver"))
  const root = repoRoot()
  const base = baseRef()

  const touched = [...changedPaths(root, base)].filter(p => p.startsWith(E2E_PREFIX)).sort()
  if (touched.length === 0) {
    console.log("✓ FS-0031 e2e-evidence guard: no apps/web/e2e/** diff — nothing to gate.")
    return
  }

  if (waiverArg) {
    const reason = waiverArg.includes("=") ? waiverArg.slice(waiverArg.indexOf("=") + 1) : "(none)"
    console.log(`⚠ FS-0031 e2e-evidence guard WAIVED — reason: ${reason}`)
    console.log(`  waived e2e diff:\n${touched.map(p => `    ${p}`).join("\n")}`)
    return
  }

  console.log(`FS-0031 e2e-evidence guard — ${touched.length} touched e2e path(s):`)
  for (const p of touched) console.log(`  · ${p}`)

  const evidenceAbs = join(root, EVIDENCE_REL)
  if (!existsSync(evidenceAbs)) {
    fail(`no run evidence at ${EVIDENCE_REL} — the affected spec was never run locally.`)
  }
  const evidenceMtime = statSync(evidenceAbs).mtimeMs

  // (a) Evidence must be newer than every touched e2e file.
  const staleFiles = touched.filter(p => {
    const abs = join(root, p)
    if (!existsSync(abs)) return false // deleted/renamed — nothing to run for it
    return statSync(abs).mtimeMs > evidenceMtime
  })
  if (staleFiles.length > 0) {
    fail(
      `run evidence is older than these edited e2e file(s) — re-run them:\n${staleFiles
        .map(p => `    ${p}`)
        .join("\n")}`,
    )
  }

  // Parse the report.
  let report: { stats?: { expected?: number; unexpected?: number } }
  try {
    report = JSON.parse(readFileSync(evidenceAbs, "utf-8"))
  } catch (err) {
    fail(`could not parse ${EVIDENCE_REL}: ${(err as Error).message}`)
  }

  // (b) Must be a passing run.
  const expected = report.stats?.expected ?? 0
  const unexpected = report.stats?.unexpected ?? 0
  if (unexpected > 0)
    fail(`the recorded run had ${unexpected} failing test(s) — evidence rejected.`)
  if (expected < 1) fail("the recorded run executed 0 tests — evidence rejected.")

  // (c) Every touched *.spec.ts must appear in the report. Playwright's JSON `file` paths are
  // relative to the project testDir (e.g. "admin/foo.spec.ts"); the touched path is repo-relative
  // ("apps/web/e2e/admin/foo.spec.ts"), so match by suffix (robust to testDir vs rootDir bases).
  const ranSpecs = [...reportSpecFiles(report)]
  const touchedSpecs = touched.filter(p => p.endsWith(".spec.ts"))
  const uncovered = touchedSpecs.filter(p => {
    if (!existsSync(join(root, p))) return false // deleted spec
    return !ranSpecs.some(f => p === f || p.endsWith(`/${f}`) || p.endsWith(f))
  })
  if (uncovered.length > 0) {
    fail(
      `these edited spec(s) are NOT in the recorded run — run them:\n${uncovered
        .map(p => `    ${p}`)
        .join("\n")}`,
    )
  }

  console.log(
    `✓ FS-0031 e2e-evidence guard: fresh passing run (${expected} test(s)) covers every touched spec.`,
  )
}

main()
