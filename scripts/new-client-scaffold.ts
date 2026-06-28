#!/usr/bin/env bun
/**
 * new-client-scaffold.ts
 *
 * SESSION_0462 — the MECHANICAL half of `/new-client-recipe`
 * (docs/runbooks/onboarding/new-client-runbook.md). The runbook is the source of
 * truth; this script automates only the deterministic copy-and-stamp work — the
 * judgment (schema from the client brief, brand tokens, deploy wiring) stays with
 * the human/agent following the runbook.
 *
 * What it does (and ONLY this):
 *   - scaffolds clients/<name>/ from a reference product (default mammoth-build-crm)
 *   - copies the product-AGNOSTIC config verbatim (tsconfig, next.config, postcss,
 *     tailwind, .gitignore, prisma.config.ts)
 *   - generates NAME-STAMPED starters (package.json, .env.example, a minimal
 *     prisma/schema.prisma with NO models, a runnable app/ skeleton, README)
 *   - optionally `createdb <name>_dev` (local Postgres.app) under --apply --createdb
 *
 * What it deliberately does NOT do (the runbook's gated/judgment steps):
 *   - standalone `bun install` (gate 1)   - design the schema from the brief
 *   - `prisma migrate dev` (gate 2)        - brand token block (step 6)
 *   - deploy / Neon (gate 3)               - product docs / governance (steps 8-9)
 *
 * SAFETY (operator-script-caution): **dry-run by default** — prints the plan and
 * writes NOTHING. Pass --apply to write. Refuses to overwrite an existing target.
 *
 * Usage:
 *   bun scripts/new-client-scaffold.ts <product-name>            # DRY-RUN (default): print the plan
 *   bun scripts/new-client-scaffold.ts <product-name> --apply    # actually scaffold clients/<name>/
 *   bun scripts/new-client-scaffold.ts <product-name> --apply --createdb   # + createdb <name>_dev (local)
 *   bun scripts/new-client-scaffold.ts <product-name> --from=other-client  # copy a different reference
 *   bun scripts/new-client-scaffold.ts --help
 *
 * <product-name> must be kebab-case: ^[a-z][a-z0-9-]*$ (it becomes the dir name,
 * the package name, and the <name>_dev database name).
 */

import { execFileSync } from "node:child_process"
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, resolve } from "node:path"

const ROOT = resolve(import.meta.dir, "..")
const ARGS = process.argv.slice(2)

// ── arg parsing ────────────────────────────────────────────────────────────
const FLAGS = new Set(ARGS.filter(a => a.startsWith("--")).map(a => a.split("=")[0]))
const FROM_ARG = ARGS.find(a => a.startsWith("--from="))
// Present-but-empty (`--from=`) is an operator typo, not "use the default" — surface it.
const FROM = FROM_ARG === undefined ? "mammoth-build-crm" : FROM_ARG.slice("--from=".length)
const NAME = ARGS.find(a => !a.startsWith("--"))
const APPLY = FLAGS.has("--apply")
const CREATEDB = FLAGS.has("--createdb")
const HELP = FLAGS.has("--help") || FLAGS.has("-h")

const POSTGRES_APP_CREATEDB =
  "/Applications/Postgres.app/Contents/Versions/latest/bin/createdb"

function die(msg: string): never {
  console.error(`\n  ✗ ${msg}\n`)
  process.exit(1)
}

if (HELP || !NAME) {
  console.log(
    [
      "",
      "  new-client-scaffold — the mechanical half of /new-client-recipe (dry-run by default)",
      "",
      "  Usage:",
      "    bun scripts/new-client-scaffold.ts <product-name>           # DRY-RUN: print the plan, write nothing",
      "    bun scripts/new-client-scaffold.ts <product-name> --apply   # scaffold clients/<name>/",
      "    bun scripts/new-client-scaffold.ts <product-name> --apply --createdb   # + createdb <name>_dev",
      "    bun scripts/new-client-scaffold.ts <product-name> --from=<reference>   # default: mammoth-build-crm",
      "",
      "  <product-name> = kebab-case (^[a-z][a-z0-9-]*$). Becomes the dir, package name, and <name>_dev DB.",
      "",
      "  After scaffolding, follow docs/runbooks/onboarding/new-client-runbook.md for the gated steps",
      "  (standalone bun install, schema design from the brief, migrate, brand tokens, deploy).",
      "",
    ].join("\n"),
  )
  process.exit(HELP ? 0 : 1)
}

// ── validation ─────────────────────────────────────────────────────────────
if (!/^[a-z][a-z0-9-]*$/.test(NAME)) {
  die(`Invalid product name "${NAME}". Use kebab-case: ^[a-z][a-z0-9-]*$ (e.g. acme-roofing).`)
}
// --from is a bare client dir name — reject empty / path-traversal so the copy
// source can never escape clients/ (it's read-only, but keep it tight).
if (FROM === "" || FROM.includes("/") || FROM.includes("..")) {
  die(`Invalid --from value "${FROM}". Use a bare client dir name (e.g. mammoth-build-crm).`)
}

const SRC = join(ROOT, "clients", FROM)
const DEST = join(ROOT, "clients", NAME)
const DB_NAME = `${NAME.replace(/-/g, "_")}_dev`

if (!existsSync(SRC)) {
  die(`Reference product not found: clients/${FROM}. Pass --from=<existing-client>.`)
}
if (existsSync(DEST)) {
  die(`Target already exists: clients/${NAME}. Remove it first (this script never deletes).`)
}

// kebab-case → Title Case for human-facing titles/descriptions.
const TITLE = NAME.split("-")
  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
  .join(" ")

// ── plan ───────────────────────────────────────────────────────────────────
// Product-AGNOSTIC config copied verbatim from the reference. Each must exist in
// the reference or the scaffold is incomplete (we verify below).
const COPY_VERBATIM = [
  "tsconfig.json",
  "next.config.mjs",
  "postcss.config.mjs",
  "tailwind.config.ts",
  ".gitignore",
  "prisma.config.ts",
]

type Action =
  | { kind: "mkdir"; rel: string }
  | { kind: "copy"; rel: string }
  | { kind: "gen"; rel: string; content: string; note: string }

const actions: Action[] = []

// Reference package.json → stamped starter (name/version/description reset; the
// scripts + deps are the platform contract, kept as-is).
const refPkgPath = join(SRC, "package.json")
if (!existsSync(refPkgPath)) die(`Reference is missing package.json: clients/${FROM}/package.json`)
const refPkg = JSON.parse(readFileSync(refPkgPath, "utf8")) as Record<string, unknown>
const stampedPkg = {
  ...refPkg,
  name: NAME,
  version: "0.1.0",
  description: `${TITLE} — client product (own DB per ADR 0038, shared kernel per ADR 0033). Scaffolded by scripts/new-client-scaffold.ts.`,
}

// Verify every verbatim-copy source exists before we promise to copy it.
const missing = COPY_VERBATIM.filter(f => !existsSync(join(SRC, f)))
if (missing.length > 0) {
  die(`Reference clients/${FROM} is missing expected files: ${missing.join(", ")}`)
}

// dirs
for (const d of ["app", "components", "lib", "prisma"]) actions.push({ kind: "mkdir", rel: d })
// verbatim copies
for (const f of COPY_VERBATIM) actions.push({ kind: "copy", rel: f })
// generated, name-stamped files
actions.push({
  kind: "gen",
  rel: "package.json",
  note: "name/version/description stamped; scripts + deps inherited",
  content: JSON.stringify(stampedPkg, null, 2) + "\n",
})
actions.push({
  kind: "gen",
  rel: ".env.example",
  note: `DATABASE_URL → ${DB_NAME}`,
  content: envExample(),
})
actions.push({
  kind: "gen",
  rel: "prisma/schema.prisma",
  note: "starter generator+datasource, NO models (translate the brief)",
  content: schemaStarter(),
})
actions.push({ kind: "gen", rel: "app/layout.tsx", note: "runnable skeleton", content: layoutStarter() })
actions.push({ kind: "gen", rel: "app/page.tsx", note: "runnable skeleton", content: pageStarter() })
actions.push({ kind: "gen", rel: "app/globals.css", note: "neutral starter tokens (swap for brand)", content: globalsStarter() })
actions.push({ kind: "gen", rel: "README.md", note: "points at the runbook", content: readmeStarter() })

// ── print plan ─────────────────────────────────────────────────────────────
const mode = APPLY ? "APPLY (writing files)" : "DRY-RUN (no files written)"
console.log(`\n  new-client-scaffold — ${mode}`)
console.log(`  product : ${NAME}  (title "${TITLE}")`)
console.log(`  from    : clients/${FROM}`)
console.log(`  target  : clients/${NAME}/`)
console.log(`  database: ${DB_NAME}${CREATEDB ? "  (--createdb requested)" : ""}\n`)

const tag = { mkdir: "mkdir", copy: "copy ", gen: "gen  " } as const
for (const a of actions) {
  if (a.kind === "gen") console.log(`    [${tag.gen}] clients/${NAME}/${a.rel}  — ${a.note}`)
  else if (a.kind === "copy") console.log(`    [${tag.copy}] clients/${NAME}/${a.rel}  ← clients/${FROM}/${a.rel}`)
  else console.log(`    [${tag.mkdir}] clients/${NAME}/${a.rel}/`)
}
if (CREATEDB) {
  console.log(`    [createdb] ${POSTGRES_APP_CREATEDB} ${DB_NAME}`)
}

// ── execute (only with --apply) ──────────────────────────────────────────────
if (!APPLY) {
  console.log(`\n  Dry-run only — nothing written. Re-run with --apply to scaffold.\n`)
  printNextSteps()
  process.exit(0)
}

mkdirSync(DEST, { recursive: true })
for (const a of actions) {
  const dest = join(DEST, a.rel)
  if (a.kind === "mkdir") {
    mkdirSync(dest, { recursive: true })
  } else if (a.kind === "copy") {
    mkdirSync(dirname(dest), { recursive: true })
    cpSync(join(SRC, a.rel), dest)
  } else {
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, a.content)
  }
}
console.log(`\n  ✓ Scaffolded clients/${NAME}/`)

if (CREATEDB) {
  try {
    const bin = existsSync(POSTGRES_APP_CREATEDB) ? POSTGRES_APP_CREATEDB : "createdb"
    execFileSync(bin, [DB_NAME], { stdio: "inherit" })
    console.log(`  ✓ Created database ${DB_NAME}`)
  } catch (err) {
    console.error(`  ✗ createdb ${DB_NAME} failed: ${(err as Error).message}`)
    console.error(`    Create it manually: ${POSTGRES_APP_CREATEDB} ${DB_NAME}`)
  }
}

printNextSteps()

// ── generators ───────────────────────────────────────────────────────────────
function envExample(): string {
  return [
    `# ${TITLE} — its OWN database (ADR 0038: one database per product).`,
    "#",
    "# Each product owns its own DATABASE_URL; there is no shared DB and no",
    "# cross-product foreign keys. Copy this file to `.env` (gitignored) for local dev.",
    "#",
    "# Local dev = Postgres.app. Omitting the user lets libpq default to your macOS",
    "# username (trust auth). Set an explicit user if yours differs.",
    `DATABASE_URL="postgresql://localhost:5432/${DB_NAME}"`,
    "",
  ].join("\n")
}

function schemaStarter(): string {
  return [
    `// ${TITLE} — its OWN database (ADR 0038: one database per product).`,
    "//",
    "// No BBL models, no shared prisma package, no cross-product foreign keys. Each",
    "// product owns its schema + DATABASE_URL + migrations.",
    "//",
    "// Prisma 7 moved the Migrate connection URL out of schema.prisma — it lives in",
    "// prisma.config.ts (DATABASE_URL). The datasource below has provider ONLY; do",
    "// NOT add an inline `url`. The generated client lands in ../.generated/prisma.",
    "//",
    "// TODO: translate the client brief (docs/business/leads/...) into models here.",
    "",
    "generator client {",
    '  provider   = "prisma-client"',
    '  engineType = "client"',
    '  output     = "../.generated/prisma"',
    "}",
    "",
    "datasource db {",
    '  provider = "postgresql"',
    "}",
    "",
  ].join("\n")
}

function layoutStarter(): string {
  return [
    'import type { Metadata } from "next"',
    'import "./globals.css"',
    "",
    "export const metadata: Metadata = {",
    `  title: "${TITLE}",`,
    `  description: "${TITLE} — scaffolded by scripts/new-client-scaffold.ts (ADR 0034 + 0038).",`,
    "}",
    "",
    "export default function RootLayout({ children }: { children: React.ReactNode }) {",
    "  return (",
    '    <html lang="en">',
    "      <body>{children}</body>",
    "    </html>",
    "  )",
    "}",
    "",
  ].join("\n")
}

function pageStarter(): string {
  return [
    "export default function Home() {",
    "  return (",
    '    <main style={{ padding: "4rem", maxWidth: 720, margin: "0 auto" }}>',
    `      <h1>${TITLE}</h1>`,
    "      <p>",
    "        Scaffolded by <code>scripts/new-client-scaffold.ts</code>. Next: follow{\" \"}",
    "        <code>docs/runbooks/onboarding/new-client-runbook.md</code> — standalone{\" \"}",
    "        <code>bun install</code>, design the schema from the client brief, then{\" \"}",
    "        <code>bunx prisma migrate dev</code>.",
    "      </p>",
    "    </main>",
    "  )",
    "}",
    "",
  ].join("\n")
}

function globalsStarter(): string {
  return [
    `/* ${TITLE} — starter tokens. Swap these for the brand token block`,
    "   (new-client-runbook step 6). Every color is a CSS variable so the brand swap",
    "   is a one-file change; tailwind.config.ts maps them to utility classes. */",
    "@tailwind base;",
    "@tailwind components;",
    "@tailwind utilities;",
    "",
    ":root {",
    "  --bg: #0b0b0c;",
    "  --surface: #141416;",
    "  --surface-elevated: #1c1c1f;",
    "  --border: #2a2a2e;",
    "  --primary: #6366f1;",
    "  --primary-hover: #4f46e5;",
    "  --primary-deep: #4338ca;",
    "  --text-primary: #f4f4f5;",
    "  --text-muted: #a1a1aa;",
    "  --font-display: ui-sans-serif, system-ui, sans-serif;",
    "  --font-sans: ui-sans-serif, system-ui, sans-serif;",
    "}",
    "",
    "body {",
    "  background: var(--bg);",
    "  color: var(--text-primary);",
    "  font-family: var(--font-sans);",
    "}",
    "",
  ].join("\n")
}

function readmeStarter(): string {
  return [
    `# ${TITLE}`,
    "",
    "A client product in the Ronin Dojo monorepo — its **own database** (ADR 0038) over the",
    "**shared kernel** (`@ronin-dojo/ui-kit`, ADR 0033). Scaffolded by",
    "`scripts/new-client-scaffold.ts`.",
    "",
    "> Status: **scaffolded skeleton**. Follow the runbook to wire the schema, brand, and deploy.",
    "",
    "## Next steps (runbook)",
    "",
    "See [`docs/runbooks/onboarding/new-client-runbook.md`](../../docs/runbooks/onboarding/new-client-runbook.md):",
    "",
    "1. **Standalone bun install** (gate 1) — `cd clients/" + NAME + " && bun install` (own `bun.lock`; root untouched).",
    "2. **Schema** (gate 2) — translate the client brief into `prisma/schema.prisma`, then `bunx prisma migrate dev --name init`; prove isolation.",
    "3. **Brand token block** — swap the starter CSS variables in `app/globals.css`.",
    "4. **Docs + governance** — PRD/STORIES under `docs/product/" + NAME + "/`, wiki + ledger.",
    "5. **Deploy + Neon** (gate 3) — own Vercel project + `ignoreCommand`; deferred to SHIP.",
    "",
    "## Run (after install)",
    "",
    "```bash",
    "cd clients/" + NAME,
    "bun install        # standalone — own bun.lock",
    "bun run dev        # http://localhost:3000",
    "bun run typecheck",
    "```",
    "",
  ].join("\n")
}

function printNextSteps(): void {
  console.log(
    [
      "  Next (gated — see docs/runbooks/onboarding/new-client-runbook.md):",
      `    1. cd clients/${NAME} && bun install      # gate 1 — standalone; root bun.lock must stay untouched`,
      `    2. design prisma/schema.prisma from the client brief, then bunx prisma migrate dev --name init   # gate 2`,
      "    3. swap app/globals.css starter tokens for the brand token block",
      "    4. PRD/STORIES + wiki/ledger governance",
      "    5. deploy + Neon at SHIP (gate 3 — operator-gated)",
      "",
    ].join("\n"),
  )
}
