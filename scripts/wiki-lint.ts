/**
 * wiki-lint.ts — Static analysis for the LLM wiki
 *
 * Checks for broken links, orphan pages, missing backlinks, stale frontmatter,
 * empty bodies, and missing required JETTY 3.0 fields.
 *
 * Inspired by llm-wiki-compiler's lint rules pattern (pure static analysis,
 * no LLM calls, structured diagnostics).
 *
 * Usage: bun run scripts/wiki-lint.ts [--fix]
 *
 * Exit code 0 = clean, 1 = violations found
 */

import { readdir, readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { execFileSync } from "node:child_process"
import path from "node:path"

const REPO_ROOT = path.resolve(import.meta.dir, "..")

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DOCS_ROOT = path.resolve(import.meta.dir, "../docs")
const WIKI_ROOT = path.join(DOCS_ROOT, "knowledge/wiki")
const INDEX_PATH = path.join(WIKI_ROOT, "index.md")
const MIN_BODY_LENGTH = 50

const REQUIRED_FRONTMATTER = ["title", "slug", "type", "status", "created", "updated"]
// health was removed from JETTY 3.0 in SESSION_0027 — status field handles freshness
const RECOMMENDED_FRONTMATTER: string[] = []

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LintResult {
  rule: string
  severity: "error" | "warning"
  file: string
  message: string
  line?: number
}

interface ParsedPage {
  filePath: string
  relativePath: string
  frontmatter: Record<string, unknown>
  body: string
  bodyLength: number
  markdownLinks: Array<{ target: string; line: number }>
  frontmatterLinks: string[] // pairs_with + backlinks + parent
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: content }

  const yamlBlock = match[1]
  const body = match[2]

  // Simple YAML parser — handles flat key: value and arrays
  const fm: Record<string, unknown> = {}
  let currentKey = ""
  let currentArray: string[] | null = null

  for (const line of yamlBlock.split("\n")) {
    const arrayItem = line.match(/^\s+-\s+(.+)/)
    if (arrayItem && currentKey) {
      if (!currentArray) {
        currentArray = []
        fm[currentKey] = currentArray
      }
      currentArray.push(arrayItem[1].replace(/^["']|["']$/g, ""))
      continue
    }

    const kvMatch = line.match(/^(\w[\w_-]*)\s*:\s*(.*)/)
    if (kvMatch) {
      currentKey = kvMatch[1]
      const value = kvMatch[2].trim().replace(/^["']|["']$/g, "")
      currentArray = null
      if (value === "" || value === "[]") {
        fm[currentKey] = value === "[]" ? [] : undefined
      } else {
        fm[currentKey] = value
      }
    }
  }

  return { frontmatter: fm, body }
}

function extractMarkdownLinks(content: string): Array<{ target: string; line: number }> {
  const links: Array<{ target: string; line: number }> = []
  const lines = content.split("\n")
  // Match [text](relative-path.md) but not http/https URLs
  const linkPattern = /\[([^\]]*)\]\((?!https?:\/\/)([^)]+\.md[^)]*)\)/g

  for (let i = 0; i < lines.length; i++) {
    for (const match of lines[i].matchAll(linkPattern)) {
      links.push({ target: match[2], line: i + 1 })
    }
  }
  return links
}

function extractFrontmatterLinks(fm: Record<string, unknown>): string[] {
  const links: string[] = []
  for (const key of ["pairs_with", "backlinks", "parent"]) {
    const val = fm[key]
    if (Array.isArray(val)) {
      links.push(...val.filter((v): v is string => typeof v === "string"))
    } else if (typeof val === "string" && val) {
      links.push(val)
    }
  }
  return links
}

// ---------------------------------------------------------------------------
// File scanning
// ---------------------------------------------------------------------------

async function findAllMarkdownFiles(dir: string): Promise<string[]> {
  const results: string[] = []
  if (!existsSync(dir)) return results

  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // Skip raw imports/source archives; active docs are checked elsewhere.
      // graphify-out is generated navigation aid (per docs/runbooks/dev-environment/graphify-repo-memory.md)
      // — its auto-generated cross-references aren't authored wiki content.
      if (
        entry.name === "templates" ||
        entry.name === "node_modules" ||
        entry.name === "_imports" ||
        entry.name === "source" ||
        entry.name === "ronin_dojo_baseline_systems_pack" ||
        entry.name === "graphify-out"
      ) continue
      results.push(...await findAllMarkdownFiles(fullPath))
    } else if (entry.name.endsWith(".md") && !entry.name.startsWith("_template")) {
      results.push(fullPath)
    }
  }
  return results
}

async function parsePage(filePath: string): Promise<ParsedPage> {
  const content = await readFile(filePath, "utf-8")
  const { frontmatter, body } = parseFrontmatter(content)
  const markdownLinks = extractMarkdownLinks(body)
  const frontmatterLinks = extractFrontmatterLinks(frontmatter)

  return {
    filePath,
    relativePath: path.relative(DOCS_ROOT, filePath),
    frontmatter,
    body,
    bodyLength: body.replace(/\s/g, "").length,
    markdownLinks,
    frontmatterLinks,
  }
}

// ---------------------------------------------------------------------------
// Lint rules
// ---------------------------------------------------------------------------

function R1_brokenLinks(pages: ParsedPage[]): LintResult[] {
  const results: LintResult[] = []

  for (const page of pages) {
    for (const link of page.markdownLinks) {
      // Strip anchor fragments (#section) from the link target
      const targetPath = link.target.split("#")[0]
      if (!targetPath) continue // pure anchor link like #section

      // Skip example/placeholder links
      if (targetPath === "relative-path.md") continue

      const resolvedPath = path.resolve(path.dirname(page.filePath), targetPath)
      if (!existsSync(resolvedPath)) {
        results.push({
          rule: "R1",
          severity: "error",
          file: page.relativePath,
          message: `Broken link: ${link.target}`,
          line: link.line,
        })
      }
    }
  }
  return results
}

function R2_missingBacklinks(pages: ParsedPage[]): LintResult[] {
  const results: LintResult[] = []
  const pagesBySlug = new Map<string, ParsedPage>()

  // Build slug index
  for (const page of pages) {
    const slug = page.frontmatter.slug
    if (typeof slug === "string") {
      pagesBySlug.set(slug, page)
    }
    // Also index by relative path fragments
    pagesBySlug.set(page.relativePath, page)
  }

  for (const page of pages) {
    const pairsWith = page.frontmatter.pairs_with
    if (!Array.isArray(pairsWith)) continue

    for (const pair of pairsWith) {
      if (typeof pair !== "string") continue
      // Find the target page
      const target = pages.find(p =>
        p.relativePath.includes(pair) ||
        p.frontmatter.slug === pair
      )
      if (!target) continue

      // Check if target has this page in pairs_with or backlinks
      const targetPairs = Array.isArray(target.frontmatter.pairs_with) ? target.frontmatter.pairs_with : []
      const targetBacklinks = Array.isArray(target.frontmatter.backlinks) ? target.frontmatter.backlinks : []
      const allTargetRefs = [...targetPairs, ...targetBacklinks]

      const pageSlug = page.frontmatter.slug as string
      const hasReverse = allTargetRefs.some(ref =>
        typeof ref === "string" && (
          ref === pageSlug ||
          page.relativePath.includes(ref) ||
          ref.includes(pageSlug)
        )
      )

      if (!hasReverse) {
        results.push({
          rule: "R2",
          severity: "warning",
          file: page.relativePath,
          message: `pairs_with "${pair}" but target does not link back`,
        })
      }
    }
  }
  return results
}

function R3_orphanPages(pages: ParsedPage[]): LintResult[] {
  const results: LintResult[] = []

  // Only check wiki pages
  const wikiPages = pages.filter(p => p.filePath.startsWith(WIKI_ROOT))
  if (!existsSync(INDEX_PATH)) return results

  const indexPage = pages.find(p => p.filePath === INDEX_PATH)
  if (!indexPage) return results

  const indexContent = indexPage.body

  for (const page of wikiPages) {
    if (page.filePath === INDEX_PATH) continue
    // Check if the page filename appears in the index
    const filename = path.basename(page.filePath)
    const dirAndFile = path.relative(WIKI_ROOT, page.filePath)
    if (!indexContent.includes(filename) && !indexContent.includes(dirAndFile)) {
      results.push({
        rule: "R3",
        severity: "warning",
        file: page.relativePath,
        message: "Page not referenced in wiki/index.md (orphan)",
      })
    }
  }
  return results
}

/** Repo-relative paths with uncommitted changes under docs/ (changed "now"). */
function gitDirtyDocs(): Set<string> {
  const set = new Set<string>()
  try {
    const out = execFileSync("git", ["status", "--porcelain", "--", "docs"], {
      cwd: REPO_ROOT,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    })
    for (const line of out.split("\n")) {
      const f = line.slice(3).trim()
      if (f) set.add(f)
    }
  } catch {
    /* ignore */
  }
  return set
}

/**
 * R4 — Stale frontmatter (per docs/protocols/wiki-lint.md): flag a doc that was
 * **changed this session** (uncommitted working-tree edit) without bumping its
 * `updated` field to today. This is the real, actionable bug — editing a doc but
 * leaving a lying `updated` — scoped to the current diff, like the protocol says
 * ("compare `git diff --name-only` against `updated`"). It replaces the old
 * 30-day calendar threshold, which nagged stable reference docs that simply
 * hadn't changed, and doesn't re-flag docs touched by historical bulk commits
 * (renames/reformats) that never warranted an `updated` bump. A clean working
 * tree yields zero R4 warnings. Opt out entirely with `stable: true`.
 */
function R4_staleFrontmatter(pages: ParsedPage[]): LintResult[] {
  const results: LintResult[] = []
  const today = new Date().toISOString().slice(0, 10)
  const dirty = gitDirtyDocs()

  // Document types and paths that are intentionally stable and should not
  // trigger staleness warnings. These are reference docs, not living work.
  const STABLE_TYPES = new Set([
    "session--open", "session--implement", "session--review", "session--plan",
    "adr", "decision",
    "file",   // point-in-time reference docs — they don't rot
    "plan",   // plans are signed-off or superseded, not living
  ])
  const STABLE_PATH_PATTERNS = [
    /sprints\/_archive\//,       // archived sessions
    /sprints\/SESSION_\d{4}\.md/, // all closed sessions (they don't change after close)
    /architecture\/decisions\//,  // ADRs
    /knowledge\/wiki\/files\//,   // wiki file explainer pages
    /knowledge\/wiki\/component-porting\//, // component port maps
    /knowledge\/wiki\/content-engine\//,    // content engine reference
    /knowledge\/wiki\/concepts\//,          // concept pages
    /^_archive\//,               // top-level archive
    /^agents\//,                 // agent role definitions (stable reference)
    /^protocols\//,              // protocols (stable unless actively revised)
    /^knowledge\/JETTY/,         // JETTY spec (stable reference)
    /^knowledge\/jetty-/,        // JETTY profiles (stable reference)
    /^knowledge\/how-to-/,       // how-to guides (stable reference)
    /^runbooks\/sops\//,         // SOPs (stable unless actively revised)
  ]

  for (const page of pages) {
    const updated = page.frontmatter.updated
    if (typeof updated !== "string") continue

    // Explicit opt-out for intentionally-static reference docs.
    if (page.frontmatter.stable === "true") continue

    // Skip stable document types
    const docType = page.frontmatter.type
    if (typeof docType === "string" && STABLE_TYPES.has(docType)) continue

    // Skip stable document status — closed sessions, superseded docs
    const status = page.frontmatter.status
    if (typeof status === "string" && (status === "closed" || status === "superseded" || status === "archived" || status === "signed-off" || status === "deprecated")) continue

    // Skip stable path patterns
    if (STABLE_PATH_PATTERNS.some(p => p.test(page.relativePath))) continue

    if (Number.isNaN(new Date(updated).getTime())) continue

    // Only check files changed THIS session (uncommitted). Historical commits are
    // water under the bridge; a clean tree is silent.
    const repoRel = path.relative(REPO_ROOT, page.filePath)
    if (!dirty.has(repoRel)) continue

    if (updated < today) {
      results.push({
        rule: "R4",
        severity: "warning",
        file: page.relativePath,
        message: `changed this session but 'updated: ${updated}' isn't today (${today}) — bump 'updated' or set 'stable: true'`,
      })
    }
  }
  return results
}

function R5_missingFrontmatter(pages: ParsedPage[]): LintResult[] {
  const results: LintResult[] = []

  // Only check wiki pages and architecture docs
  const checkPages = pages.filter(p =>
    p.filePath.startsWith(WIKI_ROOT) ||
    p.filePath.includes("architecture/")
  )

  for (const page of checkPages) {
    // Skip if no frontmatter at all (some docs are plain markdown)
    if (Object.keys(page.frontmatter).length === 0) continue

    for (const field of REQUIRED_FRONTMATTER) {
      if (!page.frontmatter[field]) {
        results.push({
          rule: "R5",
          severity: "error",
          file: page.relativePath,
          message: `Missing required frontmatter field: ${field}`,
        })
      }
    }

    for (const field of RECOMMENDED_FRONTMATTER) {
      if (!page.frontmatter[field]) {
        results.push({
          rule: "R5",
          severity: "warning",
          file: page.relativePath,
          message: `Missing recommended frontmatter field: ${field}`,
        })
      }
    }
  }
  return results
}

function R6_emptyPages(pages: ParsedPage[]): LintResult[] {
  const results: LintResult[] = []

  for (const page of pages) {
    if (page.bodyLength < MIN_BODY_LENGTH) {
      results.push({
        rule: "R6",
        severity: "warning",
        file: page.relativePath,
        message: `Body too short (${page.bodyLength} chars, min ${MIN_BODY_LENGTH})`,
      })
    }
  }
  return results
}

// R7 removed — health scores dropped in SESSION_0027
function R7_healthDrift(_pages: ParsedPage[]): LintResult[] {
  return []
}

/**
 * R8 — Markdown formatting checks (SESSION_0155)
 *
 * Catches the most common agent-generated formatting issues:
 * - Heading immediately followed by list item (no blank line)
 * - List immediately followed by heading (no blank line)
 *
 * These correspond to markdownlint MD022 + MD032 which only run in-editor
 * and are invisible to agents generating markdown in chat.
 */
function R8_markdownFormatting(pages: ParsedPage[]): LintResult[] {
  const results: LintResult[] = []
  const fs = require("node:fs") as typeof import("node:fs")

  for (const page of pages) {
    const lines = page.body.split("\n")

    // Compute frontmatter line offset so reported line numbers are file-relative.
    let fmOffset = 0
    if (Object.keys(page.frontmatter).length > 0) {
      const raw = fs.readFileSync(page.filePath, "utf-8")
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/)
      fmOffset = fmMatch ? fmMatch[0].split("\n").length - 1 : 0
    }

    let inCodeFence = false

    for (let i = 0; i < lines.length - 1; i++) {
      const current = lines[i]
      const fileLine = i + 1 + fmOffset

      // Track fenced code blocks — skip formatting checks inside them
      if (/^```/.test(current.trim())) {
        inCodeFence = !inCodeFence
        continue
      }
      if (inCodeFence) continue

      const next = lines[i + 1]

      // Heading followed immediately by list item (no blank line)
      if (/^#{1,6}\s/.test(current) && /^\s*[-*+]\s/.test(next)) {
        results.push({
          rule: "R8",
          severity: "warning",
          file: page.relativePath,
          message: `Heading on line ${fileLine} immediately followed by list (missing blank line)`,
          line: fileLine,
        })
      }

      // Non-blank, non-list, non-heading, non-table, non-blockquote line
      // followed by list item. Excludes:
      //   - table rows (|)
      //   - blockquote lines (>)
      //   - "**Label:** value" definition-style lines (common before lists in session files)
      //   - indented continuation lines (part of a multi-line list item)
      if (
        current.trim() !== "" &&
        !/^\s*[-*+]\s/.test(current) &&
        !/^\s*\d+[.)]\s/.test(current) &&
        !/^#{1,6}\s/.test(current) &&
        !/^\s*\|/.test(current) &&
        !/^\s*>/.test(current) &&
        !/^\s{2,}/.test(current) && // indented continuation of a list item
        /^\s*[-*+]\s/.test(next)
      ) {
        const trimmed = current.trim()
        if (
          (/^\*\*/.test(trimmed) || /^[A-Za-z]/.test(trimmed)) &&
          // Don't flag "**Label:** value" lines — definition-style pattern
          !/^\*\*[^*]+:\*\*\s/.test(trimmed)
        ) {
          results.push({
            rule: "R8",
            severity: "warning",
            file: page.relativePath,
            message: `Text on line ${fileLine} immediately followed by list (missing blank line)`,
            line: fileLine,
          })
        }
      }
    }
  }
  return results
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🔍 Wiki lint — scanning docs/...\n")

  // Scan all markdown files under docs/
  const allFiles = await findAllMarkdownFiles(DOCS_ROOT)
  console.log(`Found ${allFiles.length} markdown files\n`)

  // Parse all pages
  const pages = await Promise.all(allFiles.map(parsePage))

  // Run all rules
  const results: LintResult[] = [
    ...R1_brokenLinks(pages),
    ...R2_missingBacklinks(pages),
    ...R3_orphanPages(pages),
    ...R4_staleFrontmatter(pages),
    ...R5_missingFrontmatter(pages),
    ...R6_emptyPages(pages),
    ...R7_healthDrift(pages),
    ...R8_markdownFormatting(pages),
  ]

  // Group by severity
  const errors = results.filter(r => r.severity === "error")
  const warnings = results.filter(r => r.severity === "warning")

  // Print results
  if (results.length === 0) {
    console.log("✅ No lint violations found.\n")
    process.exit(0)
  }

  // Group by rule
  const byRule = new Map<string, LintResult[]>()
  for (const r of results) {
    const existing = byRule.get(r.rule) ?? []
    existing.push(r)
    byRule.set(r.rule, existing)
  }

  const ruleNames: Record<string, string> = {
    R1: "Broken links",
    R2: "Missing backlinks",
    R3: "Orphan pages",
    R4: "Stale frontmatter",
    R5: "Missing frontmatter",
    R6: "Empty/thin pages",
    R7: "Health score drift",
    R8: "Markdown formatting",
  }

  for (const [rule, items] of byRule) {
    console.log(`\n--- ${rule}: ${ruleNames[rule] ?? rule} (${items.length}) ---`)
    for (const item of items) {
      const lineInfo = item.line ? `:${item.line}` : ""
      const icon = item.severity === "error" ? "❌" : "⚠️"
      console.log(`  ${icon} ${item.file}${lineInfo} — ${item.message}`)
    }
  }

  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`)
  process.exit(errors.length > 0 ? 1 : 0)
}

main().catch(err => {
  console.error("Wiki lint failed:", err)
  process.exit(2)
})
