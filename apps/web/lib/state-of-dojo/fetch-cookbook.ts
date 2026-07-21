/**
 * fetch-cookbook — the runtime, server-side feed for the in-app `/app/cookbook` Cookbook panel
 * (SESSION_0607 WS-C, G-023). Mirrors `./fetch-state.ts`: reads the projection sources from the
 * **public `main`** branch at request time (`revalidate`-cached, resilient), so the panel reflects
 * `main` regardless of Vercel deploy cadence — `docs/protocols/**` are governance files that skip
 * the prod build via `vercel.json`'s `ignoreCommand`, yet this feed updates because it reads from
 * git, not the bundle.
 *
 * Two sources: `docs/protocols/SOT_Cookbook.md` (the router table, read via raw CDN) + every file
 * under `docs/protocols/recipes/` (listed via the GitHub contents API, each read via raw CDN). The
 * pure `./cookbook-parse` core (no fs/network) turns both into the final `CookbookEntry[]`.
 */
import "server-only"
import {
  buildCookbookEntries,
  type CookbookEntry,
  parseRecipeFrontmatter,
  parseRouterRows,
  type RecipeCardRaw,
} from "./cookbook-parse"

const LEDGER_REPO = process.env.LOOP_BOARD_LEDGER_REPO ?? "Ronin-Dojo-Design/ronin-dojo-baseline"
const LEDGER_BRANCH = process.env.LOOP_BOARD_LEDGER_BRANCH ?? "main"
const RAW_BASE = `https://raw.githubusercontent.com/${LEDGER_REPO}/${LEDGER_BRANCH}`
const API_BASE = `https://api.github.com/repos/${LEDGER_REPO}`

const COOKBOOK_PATH = "docs/protocols/SOT_Cookbook.md"
const RECIPES_DIR = "docs/protocols/recipes"

/** The cookbook changes rarely — a long window keeps the one rate-limited GitHub-API listing call
 * well under the unauthenticated 60/hr ceiling (same posture as `fetch-state.ts`). */
const COOKBOOK_REVALIDATE_SECONDS = 300

/** Optional token: raises the GitHub-API rate limit for the one listing call. Unset on Vercel until
 * provisioned — the listing then degrades to "no recipes" (honest empty), never a crash. */
const GH_TOKEN = process.env.LOOP_BOARD_GH_TOKEN ?? process.env.GITHUB_TOKEN

export type CookbookFeed = {
  entries: CookbookEntry[]
  /** Which sources contributed — surfaced so the panel can render an honest degraded state. */
  meta: { routerLoaded: boolean; recipesLoaded: number; degraded: boolean }
}

type ContentsEntry = { name: string; type: string }

/** Fetch one raw file from `main`; `null` on any failure (caller filters). */
async function fetchRaw(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${RAW_BASE}/${path}`, {
      next: { revalidate: COOKBOOK_REVALIDATE_SECONDS },
    })
    return res.ok ? await res.text() : null
  } catch {
    return null
  }
}

/** List `docs/protocols/recipes/*.md` via the GitHub contents API. Resilient: any non-200/error →
 * `[]` (the panel shows an honest empty cookbook rather than crashing). */
async function listRecipeFiles(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/contents/${RECIPES_DIR}?ref=${LEDGER_BRANCH}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
      },
      next: { revalidate: COOKBOOK_REVALIDATE_SECONDS },
    })
    if (!res.ok) return []
    const entries = (await res.json()) as ContentsEntry[]
    if (!Array.isArray(entries)) return []
    return entries.filter(e => e.type === "file" && e.name.endsWith(".md")).map(e => e.name)
  } catch {
    return []
  }
}

/** Build the `/app/cookbook` feed from `main`. Every source is independently resilient — a failure
 * in one degrades that section to an honest empty, never the whole panel. */
export async function fetchCookbookFeed(): Promise<CookbookFeed> {
  const [routerRaw, recipeFiles] = await Promise.all([fetchRaw(COOKBOOK_PATH), listRecipeFiles()])

  const recipeContents = await Promise.all(
    recipeFiles.map(async name => {
      const path = `${RECIPES_DIR}/${name}`
      const content = await fetchRaw(path)
      return content ? parseRecipeFrontmatter(path, content) : null
    }),
  )
  const cards = recipeContents.filter((c): c is RecipeCardRaw => c !== null)

  const routerRows = routerRaw ? parseRouterRows(routerRaw) : []
  const entries = buildCookbookEntries(cards, routerRows)

  return {
    entries,
    meta: {
      routerLoaded: routerRaw !== null,
      recipesLoaded: cards.length,
      degraded: routerRaw === null || cards.length === 0,
    },
  }
}
