/**
 * fetch-ledgers — the realtime, server-side ledger reader for `/app/loop-board`.
 *
 * Reads the 9 governance ledgers from the **public `main`** branch via `raw.githubusercontent.com`
 * (the repo is public — verified 200 unauthenticated), so the board reflects `main` regardless of
 * Vercel deploy cadence (docs-only ledger commits skip the prod build via `vercel.json`'s
 * `ignoreCommand`, yet the board still updates — that's why we read from git, not from the bundle).
 *
 * Resilient: a ledger whose fetch fails contributes 0 items (logged in the result) rather than
 * breaking the whole projection. Cached `revalidate` seconds so it's near-realtime, not per-request.
 */

import "server-only"
import {
  aggregateFromContents,
  LEDGER_FILES,
  LEDGER_ORDER,
  type Item,
  type LedgerCode,
} from "./ledger-parse"

const LEDGER_REPO = process.env.LOOP_BOARD_LEDGER_REPO ?? "Ronin-Dojo-Design/ronin-dojo-baseline"
const LEDGER_BRANCH = process.env.LOOP_BOARD_LEDGER_BRANCH ?? "main"
const RAW_BASE = `https://raw.githubusercontent.com/${LEDGER_REPO}/${LEDGER_BRANCH}`

/** Seconds the fetched ledger content is cached before re-fetching `main`. */
const LOOP_BOARD_REVALIDATE_SECONDS = 60

export type LedgerBacklog = {
  items: Item[]
  source: { repo: string; branch: string }
  /** Ledgers whose fetch failed (non-200 or network error) — excluded from the projection. */
  failedLedgers: LedgerCode[]
}

/** Fetch + aggregate the open ledger backlog from the public `main` branch. */
export async function fetchLedgerBacklog(): Promise<LedgerBacklog> {
  const failedLedgers: LedgerCode[] = []

  const entries = await Promise.all(
    LEDGER_ORDER.map(async (code): Promise<readonly [LedgerCode, string | undefined]> => {
      try {
        const res = await fetch(`${RAW_BASE}/${LEDGER_FILES[code]}`, {
          next: { revalidate: LOOP_BOARD_REVALIDATE_SECONDS },
        })
        if (!res.ok) {
          failedLedgers.push(code)
          return [code, undefined]
        }
        return [code, await res.text()]
      } catch {
        failedLedgers.push(code)
        return [code, undefined]
      }
    }),
  )

  const contents: Partial<Record<LedgerCode, string>> = {}
  for (const [code, text] of entries) {
    if (text != null) contents[code] = text
  }

  return {
    items: aggregateFromContents(contents),
    source: { repo: LEDGER_REPO, branch: LEDGER_BRANCH },
    failedLedgers,
  }
}
