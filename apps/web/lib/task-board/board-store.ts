/**
 * BoardStore — the persistence PORT (ADR 0033 D2).
 *
 * The board core NEVER references a concrete backend. It talks to this interface;
 * `localStorage`, `wp-json/bbl/v1/admin/taskboard`, and any future Mammoth backend
 * are *adapters*. This is what makes the board genuinely brand-agnostic instead of
 * asserting it — the BBL endpoint string lives only in `wp-json-board-store.ts`,
 * never in the hook or the component.
 */

import type { BoardData } from "./types"

export type BoardStore = {
  /** Read the persisted board. Returns null when nothing is stored yet. */
  load: () => Promise<BoardData | null>
  /** Persist the whole board document. */
  save: (data: BoardData) => Promise<void>
}

const STORAGE_KEY = "bbl_admin_taskboard_v1"

/** Default adapter: synchronous browser localStorage, wrapped in promises. */
export const localStorageBoardStore: BoardStore = {
  load: async () => {
    if (typeof window === "undefined") return null
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as unknown
      return isBoardData(parsed) ? parsed : null
    } catch {
      return null
    }
  },
  save: async data => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Quota / privacy-mode errors are non-fatal — the in-memory board still works.
    }
  },
}

/**
 * Server-syncing adapter (ADR 0033 D2). Reads localStorage first (offline cache),
 * then reconciles with the server endpoint. The endpoint string is confined to
 * this adapter — the core never sees it.
 *
 * NOTE: the BBL endpoint is WP-side (`wp-json/bbl/v1/admin/taskboard`) and is not
 * yet implemented in this repo. Until it exists this adapter degrades to the
 * localStorage cache, so wiring it now is safe.
 */
export function createWpJsonBoardStore(
  endpoint = "/wp-json/bbl/v1/admin/taskboard",
  fetchImpl: typeof fetch = fetch,
): BoardStore {
  return {
    load: async () => {
      const cached = await localStorageBoardStore.load()
      try {
        const res = await fetchImpl(endpoint, {
          method: "GET",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        })
        if (!res.ok) return cached
        const data = (await res.json()) as unknown
        return isBoardData(data) ? data : cached
      } catch {
        // Offline / endpoint missing → serve the localStorage cache.
        return cached
      }
    },
    save: async data => {
      // Mirror to the offline cache first so a failed PUT never loses data.
      await localStorageBoardStore.save(data)
      try {
        await fetchImpl(endpoint, {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      } catch {
        // Server unreachable — the cache already holds the change; reconcile later.
      }
    },
  }
}

/** Narrow an unknown payload to BoardData (defensive against corrupt storage). */
export function isBoardData(value: unknown): value is BoardData {
  if (typeof value !== "object" || value === null) return false
  const v = value as Record<string, unknown>
  return Array.isArray(v.projects) && Array.isArray(v.tasks)
}

export { STORAGE_KEY }
