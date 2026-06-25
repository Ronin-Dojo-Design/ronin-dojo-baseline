"use client"

import dynamic from "next/dynamic"
import { useMemo, useState, type ReactNode } from "react"
import type { JoinWizardOptions } from "~/server/web/lineage/join-options"
import { JoinLegacyDrawer } from "~/app/(web)/lineage/join/join-legacy-drawer"
import { JoinModalContext, type JoinModalApi } from "./join-modal-context"

// Lazy chunk: the wizard (forms + comboboxes + cropper) only loads when the modal
// is first opened, so mounting the provider on every page costs nothing upfront.
const JoinLegacyForm = dynamic(
  () => import("~/app/(web)/lineage/join/join-legacy-form").then(m => m.JoinLegacyForm),
  {
    loading: () => <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>,
  },
)

/**
 * Mounts a single, app-wide Join-the-Legacy form modal so the nav "Join" CTA pops
 * the intake form in place instead of routing to `/lineage/join` (SESSION_0445 #7 —
 * a real signup, Jay Farrell, found the page navigation confusing). Generic entry:
 * no preselected claim node (the `?node=` claim-link flow still uses the page).
 *
 * `joinOptions` is server-loaded once in the web layout and passed down so no
 * Prisma reaches the client bundle; when absent (signed-in views that never show
 * the CTA) the provider is inert and renders no drawer.
 */
export function JoinModalProvider({
  joinOptions,
  children,
}: {
  joinOptions: JoinWizardOptions | null
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  // `formKey` remounts the wizard fresh on each open so reopening after a submit
  // starts a clean form instead of the stale success state (review fix). It doubles
  // as the "has ever opened" gate that defers the lazy wizard chunk until first open.
  const [formKey, setFormKey] = useState(0)
  const api = useMemo<JoinModalApi>(
    () => ({
      open: () => {
        setFormKey(k => k + 1)
        setOpen(true)
      },
      close: () => setOpen(false),
    }),
    [],
  )

  return (
    <JoinModalContext.Provider value={joinOptions ? api : null}>
      {children}
      {joinOptions && (
        <JoinLegacyDrawer open={open} onOpenChange={setOpen}>
          {formKey > 0 && (
            <JoinLegacyForm key={formKey} claimableTree={null} joinOptions={joinOptions} />
          )}
        </JoinLegacyDrawer>
      )}
    </JoinModalContext.Provider>
  )
}
