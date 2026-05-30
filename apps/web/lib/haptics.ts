/**
 * Progressive haptic feedback via the Web Vibration API.
 *
 * Reality check (SESSION_0304): the Vibration API is supported on Android Chrome
 * and most Android browsers, but **iOS Safari does not implement it at all** —
 * there is no web path to the Taptic Engine. These helpers therefore degrade to a
 * silent no-op everywhere the API is missing (iOS web, desktop without hardware,
 * SSR). Real, reliable haptics on iOS require a PWA/native shell (Capacitor) — see
 * `docs/runbooks/design/motion-system.md` (Phase 3) and the wiring ledger.
 *
 * Always feature-detect through these helpers; never call `navigator.vibrate`
 * directly. Respecting the user's reduced-motion / reduced-interaction preference
 * is the caller's job at the interaction site.
 */

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
}

/** Fire a vibration pattern (ms, or [on, off, on, …]). No-ops where unsupported. */
function vibrate(pattern: number | number[]): boolean {
  if (!canVibrate()) return false
  try {
    return navigator.vibrate(pattern)
  } catch {
    return false
  }
}

/** Light confirmation tap — buttons, toggles, selections. */
export function hapticTap(): void {
  vibrate(8)
}

/** Selection change — checkbox/division toggles. */
export function hapticSelect(): void {
  vibrate(5)
}

/** Positive outcome — registration started, action committed. */
export function hapticSuccess(): void {
  vibrate([10, 40, 18])
}

/** Cautionary outcome — destructive confirm, error. */
export function hapticWarning(): void {
  vibrate([16, 30, 16])
}

export const haptics = {
  tap: hapticTap,
  select: hapticSelect,
  success: hapticSuccess,
  warning: hapticWarning,
  isSupported: canVibrate,
}
