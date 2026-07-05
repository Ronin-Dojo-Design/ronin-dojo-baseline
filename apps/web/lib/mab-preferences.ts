/**
 * MAB (Multi-Action Button) per-device preferences — B1 persistence (SESSION_0500).
 *
 * v1 storage is **per-device `localStorage`** (zero migration): both the on/off toggle
 * AND the drag position (a 4-corner snap zone) live here. This is deliberate for the
 * admin-only launch — a single admin on a single device does not need cross-device sync,
 * and it keeps this lane migration-free.
 *
 * PROMOTION PATH — when the MAB opens beyond admins:
 *   The **on/off toggle** should move to a per-account preference (a `User` column, e.g.
 *   `mabEnabled Boolean @default(true)`, + a `setMabEnabled` write action + a server-read
 *   that seeds `defaultEnabled` on the shell). The DRAG POSITION can stay per-device
 *   (it's a physical-ergonomics choice, not an account setting) or also promote — either
 *   is fine. At that point this module becomes a client cache over the server value, not
 *   the source of truth. Do NOT add a schema column now (no need until non-admins get the MAB).
 *
 * All reads are SSR/no-`window` safe (return the default) so the client shell hydrates to a
 * stable node before the effect reconciles the stored value.
 */

/** The four snap corners the MAB can dock to. Default = thumb-right (`bottom-right`). */
export type MabCorner = "bottom-right" | "bottom-left" | "top-right" | "top-left"

export const MAB_CORNERS: readonly MabCorner[] = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
]

export const DEFAULT_MAB_CORNER: MabCorner = "bottom-right"

const ENABLED_KEY = "bbl.mab.enabled"
const CORNER_KEY = "bbl.mab.corner"

/**
 * Cross-component sync event. `localStorage`'s native `storage` event only fires in OTHER
 * tabs, not the tab that made the write — so the MAB (mounted in the shell) and the toggle
 * (in the "More" drawer) coordinate via this same-tab custom event.
 */
export const MAB_ENABLED_EVENT = "bbl:mab-enabled-changed"

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

/** Read the MAB on/off toggle. Defaults to ON (enabled) when unset or unavailable. */
export function readMabEnabled(): boolean {
  if (!isBrowser()) return true
  try {
    const raw = window.localStorage.getItem(ENABLED_KEY)
    if (raw === null) return true
    return raw === "1"
  } catch {
    return true
  }
}

/** Persist the MAB on/off toggle. Silent no-op where storage is unavailable. */
export function writeMabEnabled(enabled: boolean): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(ENABLED_KEY, enabled ? "1" : "0")
  } catch {
    // Storage full / disabled (private mode) — preference simply doesn't persist.
  }
  // Notify same-tab listeners (the MAB re-reads on this event; storage events don't self-fire).
  try {
    window.dispatchEvent(new CustomEvent(MAB_ENABLED_EVENT, { detail: enabled }))
  } catch {
    // CustomEvent unavailable (ancient env) — the write still landed; sync just won't fire.
  }
}

function isMabCorner(value: string | null): value is MabCorner {
  return value !== null && (MAB_CORNERS as readonly string[]).includes(value)
}

/** Read the docked corner. Defaults to `bottom-right` (thumb-right) when unset. */
export function readMabCorner(): MabCorner {
  if (!isBrowser()) return DEFAULT_MAB_CORNER
  try {
    const raw = window.localStorage.getItem(CORNER_KEY)
    return isMabCorner(raw) ? raw : DEFAULT_MAB_CORNER
  } catch {
    return DEFAULT_MAB_CORNER
  }
}

/** Persist the docked corner. Silent no-op where storage is unavailable. */
export function writeMabCorner(corner: MabCorner): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(CORNER_KEY, corner)
  } catch {
    // Storage full / disabled — corner simply doesn't persist across reloads.
  }
}
