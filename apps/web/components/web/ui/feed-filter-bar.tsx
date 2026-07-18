"use client"

import { LayoutGridIcon, ListIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Sticky } from "~/components/web/ui/sticky"
import { cx } from "~/lib/utils"

/**
 * FeedFilterBar — the shared sticky filter bar for the community (`/posts`) and blog (`/blog`) feeds
 * (SESSION_0495 C2-1). Extracts the verbatim-duplicated sticky-bar structure (flair/type pill tablist +
 * grid/list view toggle) that `community-feed.tsx` and `post-feed.tsx` had each hand-rolled (the 0493
 * D-ledger dup row). ONE bar → the mobile fixes (C1-1 mobile sticky, C1-3 edge-fade + tighter pill
 * padding) land for BOTH feeds at once, `/blog` inheriting them for free.
 *
 * Presentation only: filter state stays in each feed (client-side over the server-fetched set — the blog
 * precedent). The bar renders the pills from `tabs`, the view toggle, and an optional `trailing` slot
 * (community's style select + New-post button; blog passes nothing).
 */

export type FeedFilterTab = {
  /** Stable value used for selection + React key. */
  value: string
  label: ReactNode
  /** Optional leading pill icon (community per-type flair; blog has none). */
  icon?: LucideIcon
}

export type FeedView = "grid" | "list"

type FeedFilterBarProps = {
  tabs: FeedFilterTab[]
  activeTab: string
  onTabChange: (value: string) => void
  /** Accessible name for the filter pill group (prop name kept for consumer stability). */
  tablistLabel: string
  view: FeedView
  onViewChange: (view: FeedView) => void
  gridViewLabel: string
  listViewLabel: string
  /** Trailing controls right of the view toggle (style select, New-post button). */
  trailing?: ReactNode
}

/** Pill style shared by every feed tab — active = primary fill, else muted hover. */
const tabClassName = (active: boolean) =>
  cx(
    // C1-3: tighter horizontal padding at max-sm so more pills fit + are discoverable before the fade.
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1.5 text-sm font-medium transition-colors",
    "px-3 sm:px-4",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    active
      ? "bg-primary text-primary-foreground"
      : "text-secondary-foreground hover:bg-muted hover:text-foreground",
  )

/** Grid/list toggle button style. */
const toggleClassName = (active: boolean) =>
  cx(
    "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    active
      ? "bg-background text-foreground shadow-sm"
      : "text-muted-foreground hover:text-foreground",
  )

export const FeedFilterBar = ({
  tabs,
  activeTab,
  onTabChange,
  tablistLabel,
  view,
  onViewChange,
  gridViewLabel,
  listViewLabel,
  trailing,
}: FeedFilterBarProps) => {
  return (
    // C1-1: `mobile` opts the bar into stickiness on mobile too (default `Sticky` is `md:sticky` only).
    <Sticky mobile isOverlay className="border-b bg-background/80 backdrop-blur">
      <div className="flex items-center justify-between gap-4 py-3">
        {/* Filter pill group. The edge-fade (C1-3) hints there's more to scroll on narrow screens
            where the row truncates to a couple of pills — WebKit-safe mask gradient, decorative.
            SESSION_0557 Desi P1: these are FILTERS, not tabs — the old `role="tablist"/"tab"`
            promised arrow-key navigation + tabpanels that never existed. `role="group"` +
            `aria-pressed` is the exact idiom the grid/list toggle below already uses. */}
        <div className="relative -mx-1 min-w-0 flex-1">
          <div
            className="flex items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1.5rem),transparent)]"
            role="group"
            aria-label={tablistLabel}
          >
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={activeTab === tab.value}
                  onClick={() => onTabChange(tab.value)}
                  className={tabClassName(activeTab === tab.value)}
                >
                  {Icon && <Icon className="size-4 shrink-0" />}
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Grid / list view toggle. */}
          <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              aria-pressed={view === "grid"}
              aria-label={gridViewLabel}
              className={toggleClassName(view === "grid")}
            >
              <LayoutGridIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange("list")}
              aria-pressed={view === "list"}
              aria-label={listViewLabel}
              className={toggleClassName(view === "list")}
            >
              <ListIcon className="size-4" />
            </button>
          </div>

          {trailing}
        </div>
      </div>
    </Sticky>
  )
}
