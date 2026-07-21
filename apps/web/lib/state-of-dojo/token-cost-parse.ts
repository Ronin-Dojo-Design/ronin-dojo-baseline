/**
 * token-cost-parse.ts — pure parser: session `telemetry:` frontmatter → per-session cost rows
 * (SESSION_0608, G-023 WS-D). Schema documented at
 * `docs/protocols/state-of-dojo-telemetry-schema.md`.
 *
 * SELF-CONTAINED on purpose (mirrors `~/lib/state-of-dojo/parse.ts`): no `fs`, no network, no
 * `server-only`, no React — the caller supplies raw file contents, so this runs under Bun (test)
 * and in a React Server Component (`fetch-token-cost.ts`) identically. Projection-only law: this
 * module NEVER writes back to a session file — `docs/sprints/*` stays the single source of truth.
 *
 * Reuses `frontmatterField` from `./parse` (the ONE frontmatter reader) rather than re-deriving a
 * flat-scalar reader; only the nested `telemetry:` list needs a dedicated small block parser,
 * since `frontmatterField` only handles single-line scalar values.
 */
import { frontmatterField } from "./parse"

export type TelemetryRow = {
  model: string
  input: number
  output: number
  costUsd: number
}

export type SessionCostDetail = {
  number: string
  title: string
  rows: TelemetryRow[]
  totalInput: number
  totalOutput: number
  totalCostUsd: number
}

// --- telemetry block parsing --------------------------------------------------------------

const TELEMETRY_KEY_RE = /^telemetry:\s*$/
/** `  - model: claude-sonnet-5` — starts a new list item, first field inline. */
const LIST_ITEM_RE = /^ {2}- (\w+):\s*(.*)$/
/** `    input: 310000` — a continuation field of the current list item (4-space indent). */
const LIST_CONT_RE = /^ {4}(\w+):\s*(.*)$/
/** Blank or comment-only lines are tolerated inside the block (never terminate it). */
const IGNORABLE_LINE_RE = /^\s*(#.*)?$/

const stripQuotes = (v: string) => v.trim().replace(/^["']|["']$/g, "")

function finalizeRow(fields: Record<string, string>): TelemetryRow | null {
  const model = fields.model ? stripQuotes(fields.model) : ""
  const input = Number(fields.input)
  const output = Number(fields.output)
  const costUsd = Number(fields.costUsd)
  if (!model || !Number.isFinite(input) || !Number.isFinite(output) || !Number.isFinite(costUsd)) {
    return null
  }
  return { model, input, output, costUsd }
}

/**
 * Parse the structured `telemetry:` YAML-list block out of a document's frontmatter. Returns `[]`
 * when the key is absent OR carries the legacy freeform-string form (e.g. SESSION_0587's original
 * `telemetry: "lanes=…"` — a scalar on the SAME line as the key never matches `TELEMETRY_KEY_RE`,
 * which requires the key alone on its line, list items on the following lines). Any row missing a
 * required field is dropped, not thrown (resilient — malformed telemetry degrades to fewer rows,
 * never a crash).
 */
export function parseTelemetryBlock(content: string): TelemetryRow[] {
  const block = content.match(/^---\n([\s\S]*?)\n---/)
  if (!block) return []
  const lines = block[1].split("\n")
  const startIdx = lines.findIndex(l => TELEMETRY_KEY_RE.test(l))
  if (startIdx === -1) return []

  const rows: TelemetryRow[] = []
  let current: Record<string, string> | null = null

  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    const itemMatch = line.match(LIST_ITEM_RE)
    if (itemMatch) {
      if (current) {
        const row = finalizeRow(current)
        if (row) rows.push(row)
      }
      current = { [itemMatch[1]]: itemMatch[2] }
      continue
    }
    const contMatch = line.match(LIST_CONT_RE)
    if (contMatch && current) {
      current[contMatch[1]] = contMatch[2]
      continue
    }
    if (IGNORABLE_LINE_RE.test(line)) continue
    break // dedent out of the telemetry block (next top-level frontmatter key)
  }
  if (current) {
    const row = finalizeRow(current)
    if (row) rows.push(row)
  }
  return rows
}

// --- session parsing -----------------------------------------------------------------------

const SESSION_FILENAME_RE = /SESSION_(\d{4})\.md$/

/** Parse one `docs/sprints/SESSION_NNNN.md` file's frontmatter into a `SessionCostDetail`.
 * Returns `null` for a non-matching filename OR a session with zero telemetry rows (caller
 * filters — most sessions carry no telemetry today; that's an honest empty, not a defect). */
export function parseSessionCostFile(path: string, content: string): SessionCostDetail | null {
  const m = path.match(SESSION_FILENAME_RE)
  if (!m) return null
  const rows = parseTelemetryBlock(content)
  if (rows.length === 0) return null

  const number = m[1]
  const rawTitle = frontmatterField(content, "title") ?? `Session ${number}`
  const title = rawTitle.replace(/^SESSION\s+\d+\s*[—–-]\s*/i, "")

  return {
    number,
    title,
    rows,
    totalInput: rows.reduce((s, r) => s + r.input, 0),
    totalOutput: rows.reduce((s, r) => s + r.output, 0),
    totalCostUsd: rows.reduce((s, r) => s + r.costUsd, 0),
  }
}

// --- aggregation for the chart --------------------------------------------------------------

export type CostPoint = { number: string; costUsd: number }

/** Sessions with telemetry, sorted by session number ascending, mapped to the chart's minimal
 * point shape — a separate step from `SessionCostDetail` so the chart component stays decoupled
 * from the richer per-model row shape it doesn't need. */
export function aggregateCostSeries(sessions: SessionCostDetail[]): CostPoint[] {
  return [...sessions]
    .sort((a, b) => Number(a.number) - Number(b.number))
    .map(s => ({ number: s.number, costUsd: s.totalCostUsd }))
}

// --- per-model breakdown -------------------------------------------------------------------

export type ModelCostSummary = {
  model: string
  input: number
  output: number
  costUsd: number
}

/** Roll every row across every session up into one total per model — the "by model" facet of
 * the cost table. */
export function summarizeByModel(sessions: SessionCostDetail[]): ModelCostSummary[] {
  const byModel = new Map<string, ModelCostSummary>()
  for (const session of sessions) {
    for (const row of session.rows) {
      const existing = byModel.get(row.model)
      if (existing) {
        existing.input += row.input
        existing.output += row.output
        existing.costUsd += row.costUsd
      } else {
        byModel.set(row.model, {
          model: row.model,
          input: row.input,
          output: row.output,
          costUsd: row.costUsd,
        })
      }
    }
  }
  return [...byModel.values()].sort((a, b) => b.costUsd - a.costUsd)
}
