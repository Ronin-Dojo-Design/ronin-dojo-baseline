/**
 * state-of-dojo/cookbook-parse.ts — pure parsing/classification for the "Cookbook" projection
 * (SESSION_0607 WS-C, G-023). Mirrors `./parse.ts`'s shape: SELF-CONTAINED (no `fs`, no network, no
 * `server-only`, no React) so the same core can run under Bun or inside a React Server Component —
 * the caller supplies raw file contents; this module only classifies/shapes them.
 *
 * Two sources, one projection:
 *   - `docs/protocols/SOT_Cookbook.md` — the router table ("When the task is… | Run | Why"). Each
 *     row's `Run` cell may link to one or more `docs/protocols/recipes/*.md` cards; those links are
 *     the row's "when to use this card" + "why" context.
 *   - `docs/protocols/recipes/*.md` — the recipe cards themselves (frontmatter: title/slug/tags/
 *     pairs_with). This is the entry set the panel renders (per `SOT_Cookbook.md`'s own "Recipe
 *     cards vs sequence skills" section — a "recipe" is specifically a `recipes/*.md` file).
 *
 * `buildCookbookEntries` combines the two: every recipe card becomes one `CookbookEntry`, enriched
 * with the router row that links to it (when found) and tagged with a `PipelineStage` inferred from
 * its slug/tags (falling back to title/content — see `classifyRecipeStage`).
 */

import { frontmatterField } from "./parse"

// --- pipeline-stage vocabulary -------------------------------------------------------------

/** The 5-stage lifecycle a recipe card sits in: idea (decision/discovery) → plan (staging/scoping)
 * → build (execute the work) → review (verify/quality) → ship (merge/push/deploy gate). Distinct
 * from `Phase` (`./parse.ts`) — that vocabulary buckets a session/goal's STATUS; this one buckets a
 * *recipe's* place in the workflow it's run from. */
export type PipelineStage = "idea" | "plan" | "build" | "review" | "ship"

/** Display order for grouping — idea first (earliest lifecycle stage) through ship (last). */
export const PIPELINE_STAGES: readonly PipelineStage[] = [
  "idea",
  "plan",
  "build",
  "review",
  "ship",
] as const

export const PIPELINE_STAGE_LABEL: Record<PipelineStage, string> = {
  idea: "Idea",
  plan: "Plan",
  build: "Build",
  review: "Review",
  ship: "Ship",
}

// --- frontmatter list field (block-style YAML list: `key:\n  - a\n  - b`) ------------------

/** Pull a block-style YAML list field (`tags:` / `pairs_with:`) out of a doc's frontmatter. Tiny
 * sibling of `frontmatterField` (which only handles flat scalars) — kept here rather than widening
 * that function, since `parse.ts`'s frontmatter fields (title/status/lane) are always flat scalars
 * and never need list parsing. */
export function frontmatterList(content: string, key: string): string[] {
  const block = content.match(/^---\n([\s\S]*?)\n---/)
  if (!block) return []
  const startRe = new RegExp(`^${key}\\s*:\\s*$`)
  const out: string[] = []
  let collecting = false
  for (const rawLine of block[1].split("\n")) {
    if (!collecting) {
      if (startRe.test(rawLine.trim())) collecting = true
      continue
    }
    const item = rawLine.match(/^\s+-\s*(.+)$/)
    if (item) {
      out.push(item[1].trim().replace(/^["']|["']$/g, ""))
      continue
    }
    if (rawLine.trim() === "") continue // blank line inside/after the list — keep collecting
    break // next top-level key (no leading indent) ends the list
  }
  return out
}

// --- recipe card frontmatter -----------------------------------------------------------------

export type RecipeCardRaw = {
  path: string
  slug: string
  title: string
  tags: string[]
  pairsWith: string[]
}

/** Parse one `docs/protocols/recipes/*.md` file's frontmatter. `null` when title/slug is missing
 * (defensive — every real card has both; a caller filters a directory listing without a separate
 * check). */
export function parseRecipeFrontmatter(path: string, content: string): RecipeCardRaw | null {
  const title = frontmatterField(content, "title")
  const slug = frontmatterField(content, "slug")
  if (!title || !slug) return null
  return {
    path,
    slug,
    title,
    tags: frontmatterList(content, "tags"),
    pairsWith: frontmatterList(content, "pairs_with"),
  }
}

// --- stage classification ---------------------------------------------------------------------

/** Ordered (most-specific-first) keyword tests, checked against the SLUG first — the stable,
 * curated identifier, least prone to prose/tag false-positives. Two real collisions drove this:
 * (1) several `new-brand-*` cards carry an `onboarding` TAG (they're plan-stage inputs INTO the
 * onboarding flow) alongside the one card that IS the onboarding build itself — keying off tags
 * would tag all of them BUILD; the slug alone disambiguates (`new-brand-onboarding` vs `-intake`/
 * `-interview-*`/`-setup`). (2) `live-fanout-sweep`'s TITLE contains the word "review" in its
 * "dispatch → review → merge" parenthetical, which would wrongly tag it REVIEW if title were
 * checked before slug. Falls back to tags, then `title + content`, only when the slug itself
 * doesn't resolve — forward-compatible for a future recipe card this curated list doesn't cover. */
const STAGE_KEYWORDS: Record<PipelineStage, RegExp> = {
  ship: /merge-wave|hot-fix|\bship\b/,
  review: /review|quality|hostile|mobile-optimization|ui-ux|verify/,
  build: /recipe-lane\b|orchestrator|onboarding|fanout-sweep|\bbuild\b/,
  plan: /planning-lane|epic-plan|intake|interview|new-brand-setup|\bplan\b/,
  idea: /grill|research|recommend|brainstorm|\bidea\b/,
}

const STAGE_PRIORITY: readonly PipelineStage[] = ["ship", "review", "build", "plan", "idea"]

function matchStage(haystack: string): PipelineStage | undefined {
  const lower = haystack.toLowerCase()
  return STAGE_PRIORITY.find(stage => STAGE_KEYWORDS[stage].test(lower))
}

/** Infer a recipe's pipeline stage from its slug first, then tags, then title/content. Defaults to
 * `build` (the most common bucket — most cards execute work) when nothing matches. */
export function classifyRecipeStage(input: {
  slug: string
  tags: string[]
  title: string
  content?: string
}): PipelineStage {
  return (
    matchStage(input.slug) ??
    matchStage(input.tags.join(" ")) ??
    matchStage(`${input.title} ${input.content ?? ""}`) ??
    "build"
  )
}

// --- router table (SOT_Cookbook.md) -------------------------------------------------------------

export type RouterRow = {
  when: string
  run: string
  why: string
  /** `docs/protocols/recipes/*.md` paths linked from the `run` cell (resolved relative to
   * `docs/protocols/`, the router doc's own directory). Empty when the row points only at a skill
   * or a non-recipe protocol doc (e.g. `/diagnose`, `petey-plan.md`). */
  recipePaths: string[]
}

const ROUTER_HEADING_RE = /^##\s+The router\s*$/i
const TABLE_ROW_RE = /^\|(.+)\|\s*$/
const SEPARATOR_ROW_RE = /^[\s|:-]+$/
const MD_LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g
const SOT_COOKBOOK_DIR = "docs/protocols"

/** `[text](../recipes/lane.md)` style relative path → absolute repo path, resolved against
 * `docs/protocols/` (no `node:path` — this module stays fs-free/edge-safe, mirroring `parse.ts`'s
 * hand-rolled-regex convention over pulling in a Node builtin). */
function resolveRelativePath(baseDir: string, rel: string): string {
  const stack = baseDir.split("/").filter(Boolean)
  for (const seg of rel.split("/")) {
    if (seg === "" || seg === ".") continue
    if (seg === "..") stack.pop()
    else stack.push(seg)
  }
  return stack.join("/")
}

/** Extract every `recipes/*.md` link from a router row's `Run` cell. */
export function extractRecipePaths(run: string): string[] {
  const out: string[] = []
  for (const m of run.matchAll(MD_LINK_RE)) {
    const target = m[2].trim()
    if (/^https?:\/\//.test(target)) continue
    const resolved = resolveRelativePath(SOT_COOKBOOK_DIR, target)
    if (resolved.startsWith("docs/protocols/recipes/") && resolved.endsWith(".md")) {
      out.push(resolved)
    }
  }
  return out
}

function splitTableRow(inner: string): string[] {
  return inner.split("|").map(c => c.trim())
}

/** Parse the `## The router` markdown table into rows. Scans only after that heading (so a later
 * table elsewhere in the doc, if one is ever added, isn't mistaken for the router). */
export function parseRouterRows(content: string): RouterRow[] {
  const lines = content.split("\n")
  const headingIdx = lines.findIndex(l => ROUTER_HEADING_RE.test(l.trim()))
  const scanLines = headingIdx === -1 ? lines : lines.slice(headingIdx + 1)

  const rows: RouterRow[] = []
  let sawSeparator = false
  for (const line of scanLines) {
    const m = line.match(TABLE_ROW_RE)
    if (!m) {
      if (sawSeparator) break // table block ended
      continue
    }
    if (SEPARATOR_ROW_RE.test(m[1])) {
      sawSeparator = true // the `| --- | --- | --- |` row marks the header/data boundary
      continue
    }
    if (!sawSeparator) continue // header row — skip
    const cells = splitTableRow(m[1])
    if (cells.length < 3) continue
    const [when, run, why] = cells
    rows.push({ when, run, why, recipePaths: extractRecipePaths(run) })
  }
  return rows
}

// --- combine: recipe cards + router context → the cookbook projection --------------------------

export type CookbookEntry = RecipeCardRaw & {
  stage: PipelineStage
  /** The router row's "When the task is…" cell, when a router row links this card. */
  when?: string
  /** The router row's "Why" cell, when a router row links this card. */
  why?: string
}

/** Build the final `CookbookEntry[]` — one per recipe card, stage-tagged, enriched with router
 * context, sorted by title. A card referenced by more than one router row (none today) takes the
 * FIRST row found; a card referenced by none renders with `when`/`why` unset (still a valid card —
 * the panel shows it without the router blurb). */
export function buildCookbookEntries(
  cards: RecipeCardRaw[],
  routerRows: RouterRow[],
): CookbookEntry[] {
  const rowByPath = new Map<string, RouterRow>()
  for (const row of routerRows) {
    for (const path of row.recipePaths) {
      if (!rowByPath.has(path)) rowByPath.set(path, row)
    }
  }
  return cards
    .map(card => {
      const row = rowByPath.get(card.path)
      return {
        ...card,
        stage: classifyRecipeStage({ slug: card.slug, tags: card.tags, title: card.title }),
        when: row?.when,
        why: row?.why,
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}

// --- group entries by pipeline stage (for the tabbed panel) ------------------------------------

export type StageGroup = { stage: PipelineStage; entries: CookbookEntry[] }

/** Bucket entries into one group per `PipelineStage` (in `PIPELINE_STAGES` display order) and pick
 * the tab to open by default — the FIRST stage that actually has entries, falling back to the first
 * stage when every group is empty. Pure/presentation-shaping split out of `CookbookPanelContent` so
 * the grouping + default-tab logic is unit-testable without rendering the RSC. */
export function groupEntriesByStage(entries: CookbookEntry[]): {
  grouped: StageGroup[]
  defaultStage: PipelineStage
} {
  const grouped = PIPELINE_STAGES.map(stage => ({
    stage,
    entries: entries.filter(e => e.stage === stage),
  }))
  const defaultStage = grouped.find(g => g.entries.length > 0)?.stage ?? PIPELINE_STAGES[0]
  return { grouped, defaultStage }
}
