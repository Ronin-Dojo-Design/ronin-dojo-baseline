/**
 * fetch-token-cost — the runtime, server-side feed for the in-app token-cost panel (SESSION_0608,
 * G-023 WS-D). MIRRORS `~/lib/state-of-dojo/fetch-state.ts`'s shape (same session-listing idiom,
 * same resilience posture, same revalidate window) rather than importing its private helpers —
 * this feed reads a different slice of the same `docs/sprints/*` files (the `telemetry:`
 * frontmatter block, via `./token-cost-parse`) and is deliberately a standalone, self-contained
 * file so WS-D stays pairwise-disjoint from WS-A's owned file.
 */
import "server-only"
import {
  aggregateCostSeries,
  type CostPoint,
  parseSessionCostFile,
  type SessionCostDetail,
  summarizeByModel,
  type ModelCostSummary,
} from "./token-cost-parse"

const LEDGER_REPO = process.env.LOOP_BOARD_LEDGER_REPO ?? "Ronin-Dojo-Design/ronin-dojo-baseline"
const LEDGER_BRANCH = process.env.LOOP_BOARD_LEDGER_BRANCH ?? "main"
const RAW_BASE = `https://raw.githubusercontent.com/${LEDGER_REPO}/${LEDGER_BRANCH}`
const API_BASE = `https://api.github.com/repos/${LEDGER_REPO}`

const SPRINTS_DIR = "docs/sprints"

/** Telemetry changes only at session close — a longer window keeps the one rate-limited GitHub-API
 * listing call well under the unauthenticated 60/hr ceiling (same rationale as `fetch-state.ts`). */
const TOKEN_COST_REVALIDATE_SECONDS = 300

/** Cap the scan to the most-recent N sessions (telemetry is a brand-new convention — recent
 * sessions are where it lives; scanning the full ~300-session archive on every request buys
 * nothing yet). */
const MAX_SESSIONS = 80

/** Optional token: raises the GitHub-API rate limit for the one listing call. Unset on Vercel
 * until provisioned — the listing then degrades to "no sessions" (honest empty), never a crash. */
const GH_TOKEN = process.env.LOOP_BOARD_GH_TOKEN ?? process.env.GITHUB_TOKEN

type ContentsEntry = { name: string; type: string }

const SESSION_FILE_RE = /^SESSION_(\d{4})\.md$/

/** List `docs/sprints/` via the GitHub contents API and return the most-recent-N session
 * filenames (highest number first). Resilient: any non-200 / error → `[]`. */
async function listRecentSessionFiles(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/contents/${SPRINTS_DIR}?ref=${LEDGER_BRANCH}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
      },
      next: { revalidate: TOKEN_COST_REVALIDATE_SECONDS },
    })
    if (!res.ok) return []
    const entries = (await res.json()) as ContentsEntry[]
    if (!Array.isArray(entries)) return []
    return entries
      .filter(e => e.type === "file" && SESSION_FILE_RE.test(e.name))
      .sort(
        (a, b) =>
          Number(b.name.match(SESSION_FILE_RE)?.[1]) - Number(a.name.match(SESSION_FILE_RE)?.[1]),
      )
      .slice(0, MAX_SESSIONS)
      .map(e => e.name)
  } catch {
    return []
  }
}

/** Fetch one raw file from `main`; `null` on any failure (caller filters). */
async function fetchRaw(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${RAW_BASE}/${path}`, {
      next: { revalidate: TOKEN_COST_REVALIDATE_SECONDS },
    })
    return res.ok ? await res.text() : null
  } catch {
    return null
  }
}

export type TokenCostFeed = {
  /** Sessions carrying at least one telemetry row, sorted ascending by session number. */
  sessions: SessionCostDetail[]
  series: CostPoint[]
  byModel: ModelCostSummary[]
  totalInput: number
  totalOutput: number
  totalCostUsd: number
  meta: { sessionsScanned: number; sessionsWithTelemetry: number; degraded: boolean }
}

/** Build the token-cost feed from `main`. Independently resilient at every step — a listing or
 * fetch failure degrades to an honest empty feed, never a crash. */
export async function fetchTokenCostFeed(): Promise<TokenCostFeed> {
  const sessionFiles = await listRecentSessionFiles()

  const contents = await Promise.all(
    sessionFiles.map(async name => {
      const content = await fetchRaw(`${SPRINTS_DIR}/${name}`)
      return content ? parseSessionCostFile(`${SPRINTS_DIR}/${name}`, content) : null
    }),
  )
  const sessions = contents
    .filter((s): s is SessionCostDetail => s !== null)
    .sort((a, b) => Number(a.number) - Number(b.number))

  return {
    sessions,
    series: aggregateCostSeries(sessions),
    byModel: summarizeByModel(sessions),
    totalInput: sessions.reduce((s, x) => s + x.totalInput, 0),
    totalOutput: sessions.reduce((s, x) => s + x.totalOutput, 0),
    totalCostUsd: sessions.reduce((s, x) => s + x.totalCostUsd, 0),
    meta: {
      sessionsScanned: sessionFiles.length,
      sessionsWithTelemetry: sessions.length,
      degraded: sessionFiles.length === 0,
    },
  }
}
