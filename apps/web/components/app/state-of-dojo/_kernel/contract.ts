/**
 * FROZEN PANEL CONTRACT — State-of-Dojo projection framework (ratified SESSION_0593, built WS-A/0603).
 *
 * This file is the single, unambiguous contract that the downstream fan-out builds against:
 *   - SESSION_0599 WS-3 (`DashboardLanding` shell) MOUNTS these panels by import.
 *   - WS-B (component/card catalog) and WS-C (cookbook) REPLACE this session's placeholder panels
 *     with real ones at the SAME path + SAME export + SAME signature.
 *
 * ── The four panels ────────────────────────────────────────────────────────────────────────────
 *   components/app/state-of-dojo/state-panel.tsx             → export `StatePanel`            (REAL, WS-A)
 *   components/app/state-of-dojo/component-catalog-panel.tsx → export `ComponentCatalogPanel` (placeholder → WS-B)
 *   components/app/state-of-dojo/card-catalog-panel.tsx      → export `CardCatalogPanel`      (placeholder → WS-B)
 *   components/app/state-of-dojo/cookbook-panel.tsx          → export `CookbookPanel`         (placeholder → WS-C)
 *
 * ── Every panel is, without exception ──────────────────────────────────────────────────────────
 *   1. A NAMED export (PascalCase of the file). No default export — import `{ StatePanel }`.
 *   2. A self-fetching async React Server Component: it fetches its OWN data (never handed props/data).
 *   3. Placement-agnostic: the root has NO outer margin, width, or max-width — the mounting shell
 *      (0599) owns placement (`Wrapper`/grid). A panel only ever sets internal spacing.
 *   4. The owner of its own `<Suspense>` boundary AND its own empty state — the mount site adds
 *      neither. Shape: a sync wrapper component returns `<Suspense fallback={…}><Inner/></Suspense>`,
 *      where `Inner` is the `async` data-fetching component. So `<StatePanel />` streams + skeletons
 *      for free at the mount site.
 *   5. Typed by `ProjectionPanelProps` below — the ONLY prop is optional `compact`.
 *
 * Do NOT widen this type per-panel. A panel needing more context fetches it itself (rule 2); the
 * mount contract stays `{ compact? }` so 0599 can mount any of the four identically.
 */
export type ProjectionPanelProps = {
  /**
   * Dense variant for tight mount slots (e.g. a landing-grid cell vs a full `/app/state` route).
   * Compact trims secondary sections + tightens spacing; it never changes WHAT data a panel shows,
   * only how much chrome. Panels must render correctly with `compact` both unset and `true`.
   */
  compact?: boolean
}
