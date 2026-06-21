/**
 * BoardStore — the persistence PORT (ADR 0033 D2).
 *
 * The reusable core persists through this interface only. `localStorage`, a Mammoth
 * backend, or `wp-json/bbl/v1/...` are all *adapters* that satisfy it. No brand-specific
 * endpoint ever appears in the board. This is what makes "brand-agnostic" TRUE, not asserted:
 * swap the adapter, not the board.
 */

import type { BoardState } from "./types"

export interface BoardStore {
  /** Load persisted board state, or `null` if nothing is stored yet. */
  load(configId: string): Promise<BoardState | null>
  /** Persist board state (debounced by the caller). */
  save(state: BoardState): Promise<void>
}

/**
 * In-memory adapter — the default. Holds state for the process lifetime.
 * Used in tests and SSR; the localStorage adapter layers on top for the browser.
 */
export function createMemoryBoardStore(seed?: BoardState[]): BoardStore {
  const byConfig = new Map<string, BoardState>()
  for (const s of seed ?? []) {
    byConfig.set(s.configId, s)
  }
  return {
    load(configId) {
      return Promise.resolve(byConfig.get(configId) ?? null)
    },
    save(state) {
      byConfig.set(state.configId, state)
      return Promise.resolve()
    },
  }
}

/**
 * localStorage adapter — the browser default for the MVP (pre-backend).
 * Keyed by config id so multiple boards coexist. Gracefully degrades to memory
 * when `window`/`localStorage` is unavailable (SSR, tests).
 */
export function createLocalStorageBoardStore(namespace = "ui-kit.kanban"): BoardStore {
  const key = (configId: string) => `${namespace}.${configId}.v1`
  const memoryFallback = createMemoryBoardStore()

  function storage(): Storage | null {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return null
      }
      return window.localStorage
    } catch {
      // Private mode / disabled storage throws on access.
      return null
    }
  }

  return {
    load(configId) {
      const ls = storage()
      if (!ls) {
        return memoryFallback.load(configId)
      }
      const raw = ls.getItem(key(configId))
      if (!raw) {
        return Promise.resolve(null)
      }
      try {
        return Promise.resolve(JSON.parse(raw) as BoardState)
      } catch {
        return Promise.resolve(null)
      }
    },
    save(state) {
      const ls = storage()
      if (!ls) {
        return memoryFallback.save(state)
      }
      ls.setItem(key(state.configId), JSON.stringify(state))
      return Promise.resolve()
    },
  }
}
