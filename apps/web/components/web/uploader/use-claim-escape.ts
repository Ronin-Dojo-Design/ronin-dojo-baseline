"use client"

import { useEffect } from "react"

/**
 * Claims the Escape key for the crop flow while `active` (SESSION_0499 Desi
 * P1/P2). The cropper is a raw `fixed inset-0` overlay, NOT a Dialog — a host
 * Base UI `Dialog` under it still owns Escape via its document-level dismiss
 * listener, so mid-crop Escape closed the HOST dialog and discarded its unsaved
 * fields. A capture-phase window listener + `stopImmediatePropagation` beats
 * that listener: Escape cancels the crop; the host dialog and its dirty state
 * survive.
 *
 * Mounted in TWO places per crop flow (idempotent duplicate — both call the
 * same cancel path, and the first-registered listener's
 * `stopImmediatePropagation` silences the second):
 *
 * - the uploader component, gated on its crop phase — this covers the
 *   lazy-chunk Suspense FALLBACK window, where the cropper (and its own
 *   listener) hasn't mounted yet but Escape would already reach the host
 *   dialog (SESSION_0499 fallow-fix P2);
 * - the cropper itself, so a directly-mounted `ImageCropper` keeps the fix
 *   without depending on its host.
 *
 * Long-term fix stays the one in the cropper docblock: rebuild the overlay ON
 * `~/components/common/dialog` so Base UI's dismissal stack owns key handling.
 *
 * @added   SESSION_0499 (2026-07-05)
 * @why     Mid-crop Escape must cancel the CROP, not dismiss the host dialog's dirty fields (Desi P1/P2)
 * @wired   image-field-uploader.tsx (crop phase incl. Suspense fallback), cropper.tsx (direct mounts)
 */
export function useClaimEscape(active: boolean, onCancel: () => void) {
  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      event.stopImmediatePropagation()
      onCancel()
    }
    window.addEventListener("keydown", onKeyDown, { capture: true })
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true })
  }, [active, onCancel])
}
