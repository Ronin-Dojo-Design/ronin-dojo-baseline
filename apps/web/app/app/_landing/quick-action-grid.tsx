"use client"

import type { QuickAction } from "./app-quick-actions"
import { QuickActionTile } from "./quick-action-tile"

/**
 * The quick-action bento grid — the desktop launcher (Command Deck bento idiom).
 * A CSS grid of `QuickActionTile`s; pairs with the mobile `QuickActionCarousel`.
 */
export function QuickActionGrid({ actions }: { actions: QuickAction[] }) {
  if (actions.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map(action => (
        <QuickActionTile key={action.id} action={action} />
      ))}
    </div>
  )
}
