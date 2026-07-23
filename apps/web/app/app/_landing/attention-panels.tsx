import { CardCatalogPanel } from "~/components/app/state-of-dojo/card-catalog-panel"
import { ComponentCatalogPanel } from "~/components/app/state-of-dojo/component-catalog-panel"
import { CookbookPanel } from "~/components/app/state-of-dojo/cookbook-panel"
import { StatePanel } from "~/components/app/state-of-dojo/state-panel"
import { TokenCostPanel } from "~/components/app/state-of-dojo/token-cost/token-cost-panel"
import { Stack } from "~/components/common/stack"

/**
 * WS-3 mount (SESSION_0613, G-026) — mounts the five SESSION_0593 "State of the
 * Dojo" read-projection panels (State · Component Catalog · Card Catalog · Cookbook ·
 * Token Cost) into the `/app` landing seam that WS-1 (SESSION_0600) staged as
 * placeholders. (Token Cost added SESSION_0619 — it was orphaned at `/app/token-cost`,
 * WL-P2-70; the visible "Attention" label was dropped the same session per operator.)
 * Each panel is self-fetching — it owns its own `<Suspense>` boundary
 * and empty state — and placement-agnostic; the landing renders them `compact` for
 * the attention strip (compact trims each panel's secondary table/ladder chrome).
 *
 * Layout: `sm:grid-cols-2` (max 2-across). The real panels are data-rich (work
 * board, catalogs, cookbook) with intrinsic tab strips wider than a 4-across column
 * on desktop (WS-1's placeholder stubs were width-flexible and hid this) — 2-across
 * gives each panel enough width to hold its own layout without horizontal overflow,
 * and collapses to 1-across at mobile.
 *
 * This lane mounts behind SESSION_0593's frozen import-path contract: it does NOT
 * import panel internals or edit `components/app/state-of-dojo/**`, and it does NOT
 * create the `app/app/{state,component-catalog,card-catalog,cookbook}` route dirs.
 */
export function AttentionPanels() {
  return (
    <Stack direction="column" size="sm" className="w-full">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatePanel compact />
        <ComponentCatalogPanel compact />
        <CardCatalogPanel compact />
        <CookbookPanel compact />
        <TokenCostPanel compact />
      </div>
    </Stack>
  )
}
