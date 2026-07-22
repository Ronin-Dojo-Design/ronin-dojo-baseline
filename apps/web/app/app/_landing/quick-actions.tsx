"use client"

import { useMemo, useState } from "react"
import { type QuickActionTriggerId, resolveQuickActions } from "./app-quick-actions"
import { QuickActionCarousel } from "./quick-action-carousel"
import { QuickActionDrawers } from "./quick-action-drawers"
import { QuickActionGrid } from "./quick-action-grid"

/**
 * The `/app` landing quick-action island (SESSION_0600 WS-1). The ONE client owner
 * of the quick-action surface: it resolves the server-allowed action ids into
 * runtime `QuickAction`s (binding `trigger` `onSelect`s to open the app-local
 * drawers), then renders the grid + carousel + drawers.
 *
 * The server permission-gates the config (`filterAppQuickActions`) and passes only
 * the allowed ids — the icons/labels are re-derived here from `APP_QUICK_ACTIONS`
 * (the `command-deck` server/client split). Grid and carousel render responsively
 * (grid ≥ sm, carousel < sm) so one viewport never shows the same actions twice.
 */
export function QuickActions({ allowedIds }: { allowedIds: string[] }) {
  const [openDrawer, setOpenDrawer] = useState<QuickActionTriggerId | null>(null)

  const actions = useMemo(() => resolveQuickActions(allowedIds, setOpenDrawer), [allowedIds])

  if (actions.length === 0) {
    return null
  }

  return (
    <>
      <div className="sm:hidden">
        <QuickActionCarousel actions={actions} />
      </div>
      <div className="max-sm:hidden">
        <QuickActionGrid actions={actions} />
      </div>

      <QuickActionDrawers
        open={openDrawer}
        onOpenChange={next => {
          if (!next) {
            setOpenDrawer(null)
          }
        }}
      />
    </>
  )
}
