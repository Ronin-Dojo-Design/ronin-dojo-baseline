#!/usr/bin/env bun
/**
 * session-cost.ts — audit-grade session token/cost summary (SESSION_0574, option 3).
 *
 * Read-only. Sums per-turn `message.usage` from a Claude Code session transcript
 * (~/.claude/projects/<project>/<session>.jsonl) and prices it with the model's
 * published per-MTok rates. Pairs with the statusline telemetry tee
 * (~/.claude/telemetry/<session_id>.json — see ~/.claude/statusline-telemetry.ts),
 * which supplies transcript_path + the harness's own total_cost_usd for cross-check.
 *
 * Usage:
 *   bun scripts/session-cost.ts --latest              # newest telemetry payload whose cwd is this repo
 *   bun scripts/session-cost.ts --session=<uuid>      # telemetry payload by session id
 *   bun scripts/session-cost.ts --transcript=<path>   # price a transcript directly (no payload needed)
 *   [--json]                                          # machine-readable output
 *
 * Notes:
 * - Usage rows are deduped by message id (last occurrence wins) — streamed turns can
 *   restate the same message with running usage.
 * - Sums THIS transcript only: subagent work billed inside the session appears in the
 *   main transcript's usage totals as reported by the harness; separate agent transcript
 *   files are not crawled. The harness's total_cost_usd (payload) is the reconciliation
 *   reference when present.
 * - Pricing table is a point-in-time snapshot (2026-07, per-MTok USD); cache write = 5-min
 *   TTL rate (1.25x input). Update alongside model launches.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs"
import { join } from "node:path"

// [input, output, cacheRead, cacheWrite5m] per MTok
const RATES: Record<string, [number, number, number, number]> = {
  "fable-5": [10, 50, 1, 12.5],
  "mythos-5": [10, 50, 1, 12.5],
  "opus-4": [5, 25, 0.5, 6.25],
  "sonnet-5": [3, 15, 0.3, 3.75],
  "sonnet-4": [3, 15, 0.3, 3.75],
  "haiku-4-5": [1, 5, 0.1, 1.25],
}
const rateFor = (model: string) =>
  Object.entries(RATES).find(([k]) => model.includes(k))?.[1] ?? null

const ARGS = process.argv.slice(2)
const JSON_OUT = ARGS.includes("--json")
const arg = (name: string) => ARGS.find(a => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=")

const TELEMETRY = `${process.env.HOME}/.claude/telemetry`

function pickPayload(): any | null {
  const bySession = arg("session")
  if (bySession) {
    const f = join(TELEMETRY, `${bySession}.json`)
    return existsSync(f) ? JSON.parse(readFileSync(f, "utf-8")) : null
  }
  if (!ARGS.includes("--latest") || !existsSync(TELEMETRY)) return null
  const cwd = process.cwd()
  const candidates = readdirSync(TELEMETRY)
    .filter(n => n.endsWith(".json"))
    .map(n => join(TELEMETRY, n))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
  for (const f of candidates) {
    try {
      const p = JSON.parse(readFileSync(f, "utf-8"))
      const wd = p.workspace?.current_dir ?? p.cwd ?? ""
      if (wd === cwd || wd.startsWith(cwd) || cwd.startsWith(wd)) return p
    } catch { /* skip unparseable */ }
  }
  return null
}

const payload = pickPayload()
const transcriptPath = arg("transcript") ?? payload?.transcript_path
if (!transcriptPath || !existsSync(transcriptPath)) {
  console.error(
    "No transcript found. Pass --transcript=<path>, or --latest/--session=<id> with the\n" +
    "statusline telemetry tee active (~/.claude/statusline-telemetry.ts writes ~/.claude/telemetry/).",
  )
  process.exit(2)
}

// Sum usage per model, deduping by message id (last wins).
type Usage = { input: number; output: number; cacheRead: number; cacheWrite: number; turns: number }
const byMessage = new Map<string, { model: string; u: any }>()
let lineNo = 0
for (const line of readFileSync(transcriptPath, "utf-8").split("\n")) {
  lineNo++
  if (!line.trim()) continue
  let row: any
  try { row = JSON.parse(line) } catch { continue }
  const msg = row?.message
  if (row?.type !== "assistant" || !msg?.usage) continue
  const id = msg.id ?? `line-${lineNo}`
  byMessage.set(id, { model: msg.model ?? "unknown", u: msg.usage })
}

const perModel = new Map<string, Usage>()
for (const { model, u } of byMessage.values()) {
  const t = perModel.get(model) ?? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, turns: 0 }
  t.input += u.input_tokens ?? 0
  t.output += u.output_tokens ?? 0
  t.cacheRead += u.cache_read_input_tokens ?? 0
  t.cacheWrite += u.cache_creation_input_tokens ?? 0
  t.turns++
  perModel.set(model, t)
}

const rows = [...perModel.entries()].map(([model, t]) => {
  const r = rateFor(model)
  const cost = r
    ? (t.input * r[0] + t.output * r[1] + t.cacheRead * r[2] + t.cacheWrite * r[3]) / 1_000_000
    : null
  return { model, ...t, total: t.input + t.output + t.cacheRead + t.cacheWrite, est_cost_usd: cost }
})
const grand = {
  tokens: rows.reduce((s, r) => s + r.total, 0),
  output_tokens: rows.reduce((s, r) => s + r.output, 0),
  est_cost_usd: rows.every(r => r.est_cost_usd != null) ? rows.reduce((s, r) => s + (r.est_cost_usd ?? 0), 0) : null,
  harness_cost_usd: typeof payload?.cost?.total_cost_usd === "number" ? payload.cost.total_cost_usd : null,
  session_id: payload?.session_id ?? null,
  transcript: transcriptPath,
}

if (JSON_OUT) {
  console.log(JSON.stringify({ rows, ...grand }, null, 2))
} else {
  console.log("")
  for (const r of rows) {
    console.log(`  ${r.model}  (${r.turns} turns)`)
    console.log(`    input ${r.input.toLocaleString()} · output ${r.output.toLocaleString()} · cache-read ${r.cacheRead.toLocaleString()} · cache-write ${r.cacheWrite.toLocaleString()}`)
    console.log(`    est cost: ${r.est_cost_usd != null ? `$${r.est_cost_usd.toFixed(2)}` : "unknown model rates"}`)
  }
  console.log(`\n  TOTAL: ${grand.tokens.toLocaleString()} tokens (${grand.output_tokens.toLocaleString()} output) · est $${grand.est_cost_usd?.toFixed(2) ?? "?"}` +
    (grand.harness_cost_usd != null ? ` · harness /cost says $${grand.harness_cost_usd.toFixed(2)}` : " · no telemetry payload (statusline tee not active this session?)"))
  console.log("")
}
