/**
 * fetch-catalog — the runtime, server-side feed for the in-app Component + Card catalog panels
 * (SESSION_0606, G-023 WS-B). Mirrors `./fetch-state.ts`: lists `docs/knowledge/wiki/files/` via
 * the GitHub contents API and reads each spec from the raw CDN, at request time on the **public
 * `main`** branch (`revalidate`-cached, resilient) — so the catalog reflects `main` regardless of
 * Vercel deploy cadence, same as `/app/state`.
 *
 * ONE source, two facets: `component-catalog-panel.tsx` renders every row; `card-catalog-panel.tsx`
 * filters the SAME `rows` to `kind === "card"` (ADR 0040) — neither panel maintains a second fetch.
 */
import "server-only"
import { type CatalogRow, parseComponentSpecFile } from "./component-catalog-parse"

const LEDGER_REPO = process.env.LOOP_BOARD_LEDGER_REPO ?? "Ronin-Dojo-Design/ronin-dojo-baseline"
const LEDGER_BRANCH = process.env.LOOP_BOARD_LEDGER_BRANCH ?? "main"
const RAW_BASE = `https://raw.githubusercontent.com/${LEDGER_REPO}/${LEDGER_BRANCH}`
const API_BASE = `https://api.github.com/repos/${LEDGER_REPO}`

const FILES_DIR = "docs/knowledge/wiki/files"

/** Spec files change far less often than sessions (`fetch-state.ts`'s 300s) — a longer window keeps
 * the one listing call well under the unauthenticated 60/hr GitHub-API rate ceiling. */
const CATALOG_REVALIDATE_SECONDS = 900

/** Optional token: raises the GitHub-API rate limit for the one listing call. Unset on Vercel until
 * provisioned — the listing then degrades to "no rows" (honest empty), never a crash. Reuses the
 * loop-board/state-feed env names — one token, three consumers. */
const GH_TOKEN = process.env.LOOP_BOARD_GH_TOKEN ?? process.env.GITHUB_TOKEN

export type CatalogFeed = {
  rows: CatalogRow[]
  /** Which sources contributed — surfaced so a panel can render an honest degraded state. */
  meta: { loaded: number; degraded: boolean }
}

type ContentsEntry = { name: string; type: string }

const SKIP_NAMES = new Set(["README.md"])

/** List `docs/knowledge/wiki/files/` via the GitHub contents API and return every spec `.md`
 * filename (the catalog index + `_template/` subdir are excluded — `_template/` reports as a `dir`
 * entry, filtered by `type === "file"`; `README.md` is the catalog index, not a spec).
 * Resilient: any non-200 / error → `[]` (panel shows an honest empty catalog). */
async function listSpecFiles(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/contents/${FILES_DIR}?ref=${LEDGER_BRANCH}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
      },
      next: { revalidate: CATALOG_REVALIDATE_SECONDS },
    })
    if (!res.ok) return []
    const entries = (await res.json()) as ContentsEntry[]
    if (!Array.isArray(entries)) return []
    return entries
      .filter(e => e.type === "file" && e.name.endsWith(".md") && !SKIP_NAMES.has(e.name))
      .map(e => e.name)
      .sort()
  } catch {
    return []
  }
}

/** Fetch one raw spec file from `main`; `null` on any failure (caller filters). */
async function fetchRaw(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${RAW_BASE}/${path}`, {
      next: { revalidate: CATALOG_REVALIDATE_SECONDS },
    })
    return res.ok ? await res.text() : null
  } catch {
    return null
  }
}

/** Build the component/card catalog feed from `main`. Failure degrades to an honest empty rows
 * list, never a crash — same resilience posture as `fetchStateFeed`. */
export async function fetchCatalogFeed(): Promise<CatalogFeed> {
  const names = await listSpecFiles()
  const parsed = await Promise.all(
    names.map(async name => {
      const content = await fetchRaw(`${FILES_DIR}/${name}`)
      return content ? parseComponentSpecFile(`${FILES_DIR}/${name}`, content) : null
    }),
  )
  const rows = parsed.filter((r): r is CatalogRow => r !== null)

  return {
    rows,
    meta: { loaded: rows.length, degraded: names.length === 0 },
  }
}
