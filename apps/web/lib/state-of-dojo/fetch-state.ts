/**
 * fetch-state — the runtime, server-side feed for the in-app `/app/state` State-of-Dojo panel
 * (SESSION_0603 WS-A, G-023 slice-2).
 *
 * Mirrors `lib/loop-board/fetch-ledgers.ts`: reads the projection sources from the **public `main`**
 * branch at request time (`revalidate`-cached, resilient), so `/app/state` reflects `main` regardless
 * of Vercel deploy cadence — the docs the projection reads (`docs/sprints/*`, `goals-ledger.md`) are
 * governance files that skip the prod build via `vercel.json`'s `ignoreCommand`, yet the panel updates
 * because it reads from git, not the bundle.
 *
 * DRY: the SAME pure parse core the render script uses (`./parse`) classifies the fetched contents here
 * — one feed/classify law, three consumers (script feed, HTML renderer, this in-app feed). The RISK
 * items + open-PR count ride in through the existing loop-board backlog fetch (which already carries the
 * token-gated GitHub PR source), so there is no second PR query to maintain.
 *
 * ── App-feed boundary (named, not a bug) ─────────────────────────────────────────────────────────
 * The Bun render script reads ALL local session files; this in-app feed lists `docs/sprints/` via the
 * GitHub contents API and reads the most-recent `MAX_SESSIONS` from the raw CDN. That covers every
 * non-`done` session (always recent) + the recent `done` head — matching the work board's `done`-column
 * cap. Older closed sessions live behind the board's "+N more". Documented in
 * `docs/protocols/state-of-project-projection.md`.
 */
import "server-only"
import type { Item } from "~/lib/loop-board/ledger-parse"
import { fetchLedgerBacklog } from "~/lib/loop-board/fetch-ledgers"
import { type GoalDetail, parseGoalsDetail, parseSessionFile, type SessionDetail } from "./parse"

const LEDGER_REPO = process.env.LOOP_BOARD_LEDGER_REPO ?? "Ronin-Dojo-Design/ronin-dojo-baseline"
const LEDGER_BRANCH = process.env.LOOP_BOARD_LEDGER_BRANCH ?? "main"
const RAW_BASE = `https://raw.githubusercontent.com/${LEDGER_REPO}/${LEDGER_BRANCH}`
const API_BASE = `https://api.github.com/repos/${LEDGER_REPO}`

const GOALS_LEDGER_PATH = "docs/knowledge/wiki/goals-ledger.md"
const SPRINTS_DIR = "docs/sprints"

/** Sessions/goals change far less often than the loop board's ~60s cadence — a longer window also keeps
 * the single rate-limited GitHub-API listing call well under the unauthenticated 60/hr ceiling. */
const STATE_REVALIDATE_SECONDS = 300

/** Cap the in-app board to the most-recent N sessions (see the app-feed boundary note above). */
const MAX_SESSIONS = 80

/** Optional token: raises the GitHub-API rate limit for the one listing call. Unset on Vercel until
 * provisioned — the listing then degrades to "no sessions" (honest empty), never a crash. */
const GH_TOKEN = process.env.LOOP_BOARD_GH_TOKEN ?? process.env.GITHUB_TOKEN

export type StateFeed = {
  sessions: SessionDetail[]
  goals: GoalDetail[]
  /** Open RISK-register rows (cross-brand — risk rows carry no lane facet yet; protocol). */
  riskItems: Item[]
  /** Live open-PR count, folded in via the loop-board backlog fetch (0 when the PR source is off). */
  prCount: number
  /** Which sources contributed — surfaced so the panel can render an honest degraded state. */
  meta: { sessionsLoaded: number; goalsLoaded: boolean; degraded: boolean }
}

type ContentsEntry = { name: string; type: string }

const SESSION_FILE_RE = /^SESSION_(\d{4})\.md$/

/** List `docs/sprints/` via the GitHub contents API and return the most-recent-N session filenames
 * (highest number first). Resilient: any non-200 / error → `[]` (panel shows an honest empty board). */
async function listRecentSessionFiles(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/contents/${SPRINTS_DIR}?ref=${LEDGER_BRANCH}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
      },
      next: { revalidate: STATE_REVALIDATE_SECONDS },
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
      next: { revalidate: STATE_REVALIDATE_SECONDS },
    })
    return res.ok ? await res.text() : null
  } catch {
    return null
  }
}

/** Build the `/app/state` feed from `main`. Every source is independently resilient — a failure in one
 * degrades that section to an honest empty, never the whole panel. */
export async function fetchStateFeed(): Promise<StateFeed> {
  const [sessionFiles, goalsRaw, backlog] = await Promise.all([
    listRecentSessionFiles(),
    fetchRaw(GOALS_LEDGER_PATH),
    // Reuse the proven loop-board backlog fetch for RISK rows + the token-gated open-PR count.
    fetchLedgerBacklog().catch(() => null),
  ])

  const sessionContents = await Promise.all(
    sessionFiles.map(async name => {
      const content = await fetchRaw(`${SPRINTS_DIR}/${name}`)
      return content ? parseSessionFile(`${SPRINTS_DIR}/${name}`, content) : null
    }),
  )
  const sessions = sessionContents.filter((s): s is SessionDetail => s !== null)

  const goals = goalsRaw ? parseGoalsDetail(goalsRaw) : []
  const items = backlog?.items ?? []
  const riskItems = items.filter(i => i.ledger === "RISK")
  const prCount = items.filter(i => i.ledger === "PR").length

  return {
    sessions,
    goals,
    riskItems,
    prCount,
    meta: {
      sessionsLoaded: sessions.length,
      goalsLoaded: goals.length > 0,
      degraded: sessions.length === 0 || goalsRaw === null,
    },
  }
}
