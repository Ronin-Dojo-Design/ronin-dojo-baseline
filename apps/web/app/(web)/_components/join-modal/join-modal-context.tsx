"use client"

import { createContext, useContext } from "react"

export type JoinModalApi = { open: () => void; close: () => void }

/**
 * Tiny context module (no UI imports) so the everywhere-rendered `JoinCtaButton`
 * can read the modal API without pulling the wizard/Drawer into the header bundle.
 * The heavy provider lives in `join-modal-provider.tsx`. (SESSION_0445 #7)
 */
export const JoinModalContext = createContext<JoinModalApi | null>(null)

/**
 * Access the global Join-the-Legacy modal. Returns `null` when rendered outside
 * the provider (e.g. a signed-in view where the CTA is hidden, or a brand without
 * the modal) — callers fall back to navigating to `/lineage/join`.
 */
export function useJoinModal(): JoinModalApi | null {
  return useContext(JoinModalContext)
}
