#!/usr/bin/env bun
/**
 * skills-index.ts
 *
 * The GENERATED half of the SSL (skills-index). Reads every
 * `.claude/skills/*​/SKILL.md`, parses its YAML frontmatter (`name`,
 * `description`), flags alias/redirect stubs, and emits an alphabetical markdown
 * table into `docs/knowledge/wiki/skills-index.md` BETWEEN the generated markers
 * `<!-- GENERATED:skills START -->` / `<!-- GENERATED:skills END -->`.
 *
 * WHY generated: skills get "discussed but never built" — but the inverse rot is
 * a hand-maintained "built" list drifting from the SKILL.md source of truth. The
 * built half is regenerated (run at bow-out via /gu-adjacent) so it never lies;
 * only the discussed-not-built gap (the "Proposed / SSL backlog" section, OUTSIDE
 * the markers) is hand-tracked. Everything outside the markers is preserved.
 *
 * Idempotent — re-runnable; replaces only the marked block.
 *
 * Usage:
 *   bun scripts/skills-index.ts          # regenerate the Built table in place
 *   bun scripts/skills-index.ts --check  # exit 1 if the file is out of date (no write)
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const ROOT = resolve(import.meta.dir, "..")
const SKILLS_DIR = resolve(ROOT, ".claude/skills")
const OUT = resolve(ROOT, "docs/knowledge/wiki/skills-index.md")
const START = "<!-- GENERATED:skills START -->"
const END = "<!-- GENERATED:skills END -->"
const CHECK = process.argv.slice(2).includes("--check")

type Skill = { name: string; description: string; aliasOf: string | null }

/** Pull `name:` / `description:` from a SKILL.md's leading `---` frontmatter block. */
function parseFrontmatter(md: string): { name: string; description: string } | null {
  const m = md.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return null
  const fm: Record<string, string> = {}
  const lines = m[1].split("\n")
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^(\w[\w_-]*)\s*:\s*(.*)$/)
    if (!kv) continue
    const key = kv[1]
    const raw = kv[2].trim()
    if (/^[|>][+-]?$/.test(raw)) {
      // YAML block scalar (`>` folded / `|` literal): gather the indented continuation
      // lines that follow. Collapsed to a single cell downstream, so fold either style.
      const parts: string[] = []
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) parts.push(lines[++i].trim())
      fm[key] = parts.join(" ")
    } else {
      fm[key] = raw.replace(/^["']|["']$/g, "")
    }
  }
  if (!fm.name) return null
  return { name: fm.name, description: fm.description ?? "" }
}

/**
 * A skill is an ALIAS (a deprecated redirect stub) when its frontmatter or body
 * says "Renamed to /X" — its `aliasOf` points at the canonical `X`. The mirror
 * phrasing "Aliases the former /Y" lives on the CANONICAL skill (it absorbed an
 * old name), so that skill is NOT itself an alias and is left unflagged.
 */
function detectAlias(description: string, body: string): string | null {
  const m = `${description}\n${body}`.match(/Renamed to\s+\*{0,2}\/([\w-]+)/i)
  return m ? m[1] : null
}

/** Escape a value for a single markdown table cell. */
function cell(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim()
}

function collectSkills(): Skill[] {
  const skills: Skill[] = []
  for (const entry of readdirSync(SKILLS_DIR, { withFileTypes: true })) {
    // Many skills are symlinks into `.agents/skills/` (installed via `npx skills add`) —
    // `isDirectory()` is false for a symlink, so accept symlinks too and let the
    // `SKILL.md` existence check (which follows the link) do the real filtering.
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue
    const skillPath = resolve(SKILLS_DIR, entry.name, "SKILL.md")
    if (!existsSync(skillPath)) continue
    const md = readFileSync(skillPath, "utf-8")
    const fm = parseFrontmatter(md)
    if (!fm) continue
    const body = md.replace(/^---\n[\s\S]*?\n---/, "")
    skills.push({
      name: fm.name,
      description: fm.description,
      aliasOf: detectAlias(fm.description, body),
    })
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

function renderTable(skills: Skill[]): string {
  const rows = skills.map(
    s => `| \`/${cell(s.name)}\` | ${cell(s.description)} | ${s.aliasOf ? `\`/${s.aliasOf}\`` : "—"} |`,
  )
  return ["| Skill | Description | Alias of |", "| --- | --- | --- |", ...rows].join("\n")
}

function splice(file: string, generated: string): string {
  const s = file.indexOf(START)
  const e = file.indexOf(END)
  if (s === -1 || e === -1 || e < s) {
    throw new Error(
      `Generated markers not found (or out of order) in ${OUT} — expected ${START} … ${END}`,
    )
  }
  const before = file.slice(0, s + START.length)
  const after = file.slice(e)
  return `${before}\n\n${generated}\n\n${after}`
}

function main() {
  if (!existsSync(OUT)) {
    throw new Error(`${OUT} does not exist — create the wiki page with the generated markers first`)
  }
  const skills = collectSkills()
  const table = renderTable(skills)
  const current = readFileSync(OUT, "utf-8")
  const next = splice(current, table)

  if (CHECK) {
    if (next !== current) {
      console.error(`✗ ${OUT} is out of date — run: bun scripts/skills-index.ts`)
      process.exit(1)
    }
    console.log(`✓ skills-index.md up to date (${skills.length} skills)`)
    return
  }

  if (next !== current) writeFileSync(OUT, next)
  const aliases = skills.filter(s => s.aliasOf).length
  console.log(
    `skills-index.md regenerated — ${skills.length} skills (${aliases} alias stub(s)) between the generated markers.`,
  )
}

main()
