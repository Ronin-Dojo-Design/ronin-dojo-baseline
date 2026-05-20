#!/usr/bin/env bun
/**
 * check-vercel-env-parity.ts
 *
 * Vercel environment-variable parity guard (FS-0023).
 * Reports required deploy env names that are missing from Production
 * or Preview scopes in Vercel. Never prints secret values.
 *
 * Usage:
 *   bun scripts/check-vercel-env-parity.ts          # live check via `vercel env ls`
 *   bun scripts/check-vercel-env-parity.ts --dry-run # parse env.ts only, skip Vercel call
 */

import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const DRY_RUN = process.argv.includes("--dry-run")

// ---------------------------------------------------------------------------
// 1. Parse required variable names from apps/web/env.ts
//    and add deploy-only names consumed outside T3 Env.
// ---------------------------------------------------------------------------

const envTsPath = resolve(import.meta.dir, "../apps/web/env.ts")
const envTsContent = readFileSync(envTsPath, "utf-8")

/**
 * Extract variable names from the env.ts schema that are required —
 * i.e. NOT marked `.optional()` and NOT having `.default(...)` as their
 * terminal validator (which makes them effectively optional at deploy time).
 */
function parseRequiredVars(source: string): string[] {
  const required: string[] = []

  // Match lines like `VAR_NAME: z.string().min(1),` or `VAR_NAME: z.url().min(1),`
  // Exclude lines containing `.optional()` or `.default(`
  const varPattern = /^\s+([A-Z][A-Z0-9_]*)\s*:\s*z\./gm
  let match: RegExpExecArray | null

  while ((match = varPattern.exec(source)) !== null) {
    const name = match[1]
    // Grab the rest of the line to check qualifiers
    const lineEnd = source.indexOf("\n", match.index)
    const line = source.slice(match.index, lineEnd === -1 ? undefined : lineEnd)

    if (line.includes(".optional()") || line.includes(".default(")) {
      continue
    }
    required.push(name)
  }

  return required
}

const requiredEnvVars = parseRequiredVars(envTsContent)
const requiredVercelOnlyVars = ["DIRECT_URL"]
const requiredVars = [...new Set([...requiredEnvVars, ...requiredVercelOnlyVars])]

console.log(`\n🔍 Required deploy env var names (${requiredVars.length}):`)
for (const v of requiredVars) {
  console.log(`   ${v}`)
}

if (DRY_RUN) {
  console.log("\n⏭️  --dry-run: skipping Vercel API check.\n")
  process.exit(0)
}

// ---------------------------------------------------------------------------
// 2. Fetch Vercel env var list (names + scopes only)
// ---------------------------------------------------------------------------

let vercelOutput: string
try {
  vercelOutput = execSync("vercel env ls", {
    encoding: "utf-8",
    timeout: 30_000,
    cwd: resolve(import.meta.dir, ".."),
  })
} catch (e: unknown) {
  const msg = e instanceof Error ? e.message : String(e)
  console.error(`\n❌ Failed to run \`vercel env ls\`: ${msg}`)
  console.error("   Ensure the Vercel CLI is installed and authenticated.")
  process.exit(1)
}

// ---------------------------------------------------------------------------
// 3. Parse the table into { name → Set<scope> }
// ---------------------------------------------------------------------------

interface VarScopes {
  [name: string]: Set<string>
}

function parseVercelEnvLs(output: string): VarScopes {
  const result: VarScopes = {}
  const lines = output.split("\n")

  for (const line of lines) {
    // Table rows start with a space then the var name (all caps / underscores)
    const m = line.match(/^\s+([A-Z][A-Z0-9_]*)\s+Encrypted\s+(.+?)\s{2,}/)
    if (!m) continue
    const name = m[1]
    const scopes = m[2]
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    result[name] = new Set(scopes)
  }

  return result
}

const vercelVars = parseVercelEnvLs(vercelOutput)

// ---------------------------------------------------------------------------
// 4. Check parity — every required var should be in both Production & Preview
// ---------------------------------------------------------------------------

const REQUIRED_SCOPES = ["production", "preview"] as const

interface Issue {
  name: string
  missingScopes: string[]
  presentScopes: string[]
}

const issues: Issue[] = []

for (const name of requiredVars) {
  const scopes = vercelVars[name]
  if (!scopes) {
    issues.push({ name, missingScopes: [...REQUIRED_SCOPES], presentScopes: [] })
    continue
  }
  const missing = REQUIRED_SCOPES.filter((s) => !scopes.has(s))
  if (missing.length > 0) {
    issues.push({
      name,
      missingScopes: missing,
      presentScopes: [...scopes],
    })
  }
}

// ---------------------------------------------------------------------------
// 5. Report
// ---------------------------------------------------------------------------

if (issues.length === 0) {
  console.log(
    `\n✅ All ${requiredVars.length} required vars present in both Production and Preview.\n`,
  )
  process.exit(0)
}

console.log(`\n⚠️  Parity issues found (${issues.length}):\n`)

for (const issue of issues) {
  if (issue.presentScopes.length === 0) {
    console.log(`   ❌ ${issue.name} — NOT SET in Vercel at all`)
  } else {
    console.log(
      `   ⚠️  ${issue.name} — missing from: ${issue.missingScopes.join(", ")} (present in: ${issue.presentScopes.join(", ")})`,
    )
  }
}

console.log(
  "\n   Fix: Vercel → Settings → Environment Variables → edit each var above",
  "\n   and check the missing environment checkbox(es).\n",
)

process.exit(1)
