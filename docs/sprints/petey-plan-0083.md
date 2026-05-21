---
title: "Petey plan 0083 — Radix → @base-ui/react migration lane"
slug: petey-plan-0083
type: petey-plan
status: active
created: 2026-05-20
updated: 2026-05-20
last_agent: codex-session-0211
pairs_with:
  - docs/sprints/SESSION_0209.md
  - docs/sprints/SESSION_0210.md
  - docs/sprints/SESSION_0211.md
  - docs/architecture/uplift/epic-2026-05-19.md
  - docs/knowledge/wiki/drift-register.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey plan 0083 — Radix → @base-ui/react migration lane

## Context

Discovered during SESSION_0209 bow-in: upstream (`dirstarter_template` @ `7e724b6`) has migrated all 18 of its common primitives from `radix-ui` to `@base-ui/react ^1.3.0`. Ronin still ships 23 common primitives on `radix-ui ^1.4.3`. This was previously surfaced as a partial deferral in [SESSION_0208](./SESSION_0208.md) for `PopoverTrigger render={…}` only.

Operator direction (2026-05-20): no users yet; do the full migration right; **continue step by step like Phase 1, reviewing and refactoring as we go**.

This file is the lane plan. Each phase below becomes one SESSION file. SESSION_0209 executes Phase 1.

## Phase boundaries — honest re-scoping (mid-Phase 1)

Initial bow-in scope assumed "Slot-only" primitives were a free swap (`Slot.Root` → `slot()` util). Mid-session discovery proved otherwise: upstream's port also adopts the `useRender` + `render={…}` consumer API (replacing `asChild`), uses the `cva` *slots* API (only available via `tailwind-variants`, not Ronin's current `cva` package), and changes per-primitive API surface (TooltipBase removed, HoverCard renamed to PreviewCard, Accordion's `Content` → `Panel`, etc.). Each of these is a call-site refactor, not a 1-file swap.

Re-phased to **honest, verifiable chunks**:

- Phase 1 (SESSION_0209): Foundation only. Deps + slot util + toaster + empty-list move + two genuinely-safe leaf primitives (separator + avatar). Plant the seed; everything else is honest follow-on.
- **Phase 2 — re-split at SESSION_0210 bow-in (2026-05-20).** Initial Phase 2 framing ("zero `asChild`, mechanical replace" of Box/Heading/AnimatedContainer) proved wrong on bow-in audit: upstream Box now exports only `boxVariants` (the component is gone — 59 JSX sites + 14 internal-primitive consumers to refactor) and upstream Heading adopts `useRender` + `render={…}`, removing both `as` and `asChild` props (140 `<Hn as="…">` rewrites). AnimatedContainer is the only truly-mechanical primitive. Re-split:
  - Phase 2a (SESSION_0210): `lib/utils.ts` cva→tailwind-variants (re-export `tv as cva`, `cn as cx`, `VariantProps`; drop unused `compose`; keep `popoverAnimationClasses` Radix-shape — Phase 7 will swap to Base UI semantics) + `animated-container.tsx` mechanical `Slot.Root` → `slot()` + repath 2 stray `from "cva"` imports onto `~/lib/utils`.
  - Phase 2b (SESSION_0211): `heading.tsx` migration complete. Adopted `useRender` + `render={…}` per upstream; exact AST close proof found 211 direct Heading JSX tags plus 60 `IntroTitle` wrapper tags with zero remaining `as`/`asChild` props. The earlier 140-count estimate was superseded by the residual AST/typecheck gates.
  - Phase 2c (SESSION_0212): `box.tsx` migration. Delete the `Box` component (upstream only ships `boxVariants`). Refactor 59 `<Box>` JSX sites and 14 internal-primitive consumers (`card`, `switch`, `checkbox`, `textarea`, `input`, `radio-group`, `select`, `dialog`, `drawer`, `overlay-image`, `cta-form`, `user-menu`, `row-checkbox`) to inline `boxVariants` on a real element.
- Phase 3 (SESSION_0213): Slot-only primitives with `asChild` consumer migration: Badge (2 sites), Card (3 sites), Stack (9 sites), Form (audit), Button (30 sites). High-volume consumer refactor pass.
- Phase 4 (SESSION_0214): Tooltip migration. ~41 call sites of `<Tooltip tooltip="…">` rewriting to the new `<Tooltip><TooltipTrigger render={…}/><TooltipContent>…</TooltipContent></Tooltip>` shape. Possibly split if estimate proves too large.
- Phase 5 (SESSION_0215): HoverCard (PreviewCard rename + Positioner wrapper) + Accordion (Card-render dep + data-attr rename `data-[state=*]` → `data-*`).
- Phase 6 (SESSION_0216): Form primitives: checkbox, radio-group, switch, label, plus `field.tsx` and `button-group.tsx` sanity pass.
- Phase 7 (SESSION_0217): Popover family — dialog, popover, dropdown-menu, select, drawer. Includes the L5-deferred `<PopoverTrigger render={…}>` call-site sweep across data-table-faceted-filter / data-table-view-options / date-range-picker / admin actions / dashboard / web nav. Also updates `popoverAnimationClasses` constant content to Base UI semantics (`data-open`/`data-closed`). Likely the heaviest call-site phase.
- Phase 8 (SESSION_0218): Command (cmdk → cmdk-base + slot util) + tabs + new **admin Cmd+K palette** (the L6 epic's one substantive missing easy win) + dep cleanup (`radix-ui` + `cmdk` + `cva` removed from `apps/web/package.json`) + final tsc/biome/test/build/wiki-lint sweep.

Phase boundaries are *guidance* — Petey at each bow-in reserves the right to split or merge phases based on actual scope discovered. The contract is: each session ships a green typecheck/biome/test/build/wiki-lint and a closable artifact.

## Lane goal

Migrate every Ronin `components/common/*.tsx` consumer of `radix-ui` to `@base-ui/react`, port the upstream `~/lib/slot.ts` util, install `cmdk-base` and `tailwind-variants` where upstream uses them, update every call site that depends on a changed primitive API (`asChild` → `render={…}` etc.), and remove `radix-ui` from `apps/web/package.json` when the migration is complete.

**Drift register entry:** `D-016` (created during SESSION_0209 close).

## Per-primitive inventory (bow-in snapshot — updated mid-session)

| Phase | Primitive | Notes |
| --- | --- | --- |
| 1 ✓ | `lib/slot.ts` | New util ported from upstream. |
| 1 ✓ | `components/common/toaster.tsx` | Drift reconcile (next-themes + CSS-variable styling). |
| 1 ✓ | `components/common/empty-list.tsx` | Moved from `components/web/empty-list.tsx`. 10 import sites repathed. |
| 1 ✓ | `components/common/separator.tsx` | Radix `Separator.Root` → `@base-ui/react/separator` `Separator`. 0 call sites needed updating (no `decorative` prop usage in repo). |
| 1 ✓ | `components/common/avatar.tsx` | Radix `Avatar.Root/Image/Fallback` → `@base-ui/react/avatar` same shape. 11 call sites: no API change. |
| 2a ✓ | `lib/utils.ts` | Migrate `cva` package → `tailwind-variants` `tv` aliased as `cva` (unlocks `slots` API). `popoverAnimationClasses` stays Radix-shape (Phase 7). |
| 2a ✓ | `animated-container.tsx` | Mechanical `Slot.Root` → `slot()`; 12 consumer sites unchanged. |
| 2a ✓ | `from "cva"` import sweep | Repath `ads-picker.tsx` + `admin/sidebar.tsx` `cx` imports onto `~/lib/utils`. |
| 2b ✓ | `heading.tsx` | Adopted `useRender` + `render={…}`; dropped legacy `as` + `asChild` props. Exact AST close proof: 211 Heading JSX tags + 60 `IntroTitle` wrapper tags, 0 remaining `as`/`asChild`, 61 direct Heading render callbacks + 1 `IntroTitle` render callback. |
| 2c | `box.tsx` | Delete `Box` component (upstream only ships `boxVariants`). Refactor 59 `<Box>` JSX sites + 14 internal-primitive consumers (`card`, `switch`, `checkbox`, `textarea`, `input`, `radio-group`, `select`, `dialog`, `drawer`, `overlay-image`, `cta-form`, `user-menu`, `row-checkbox`). |
| 3 | `badge.tsx` | 2 `asChild` sites + adopts `useRender` + cva slots `affix`. |
| 3 | `card.tsx` | 3 `asChild` sites + `useRender`. **Blocks Accordion (Phase 5).** |
| 3 | `stack.tsx` | 9 `asChild` sites + `useRender`. |
| 3 | `form.tsx` | Internal Slot — audit. |
| 3 | `button.tsx` | 30 `asChild` sites — heaviest single primitive. |
| 4 | `tooltip.tsx` | 41 `<Tooltip tooltip="…">` call sites. TooltipBase wrapper removed upstream. New composition: `<Tooltip><TooltipTrigger render={…}/><TooltipContent>…</TooltipContent></Tooltip>`. |
| 5 | `hover-card.tsx` | Renamed to PreviewCard internally; adds Positioner. |
| 5 | `accordion.tsx` | Depends on Card (Phase 3). `data-[state=*]` → `data-*`; `Content` → `Panel`. |
| 6 | `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `label.tsx` | Form primitives. |
| 6 | `field.tsx`, `button-group.tsx` (already L5-ported) | Sanity pass. |
| 7 | `dialog.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `select.tsx`, `drawer.tsx` | Popover family. `asChild` → `render={…}` call-site sweep. Picks up the L5-deferred PopoverTrigger work. |
| 8 | `command.tsx` | cmdk → cmdk-base + slot util. |
| 8 | `tabs.tsx` | Verify upstream availability; migrate or accept lone Radix dep. |
| 8 | `admin/command-palette.tsx` | NEW — admin Cmd+K palette (L6 epic carry-over). |
| 8 | `package.json` | Remove `radix-ui` + `cmdk`. |

## Decisions reserved for in-phase Petey review

- **Vaul peer-dep on Radix in drawer.tsx** (Phase 7) — confirm Vaul still ships its own Radix dep so removing top-level `radix-ui` doesn't break Vaul. If Vaul moves to Base UI, follow; else accept indirect Radix dep via Vaul.
- **`@base-ui/react/menu` vs dropdown-menu naming** (Phase 7) — verify the upstream import path.
- **Tabs upstream availability** (Phase 8) — if upstream omits, decide: `@base-ui/react/tabs` (if exposed) vs hand-rolled vs keeping `radix-ui` as a lone dep.
- **Hover-card vs PreviewCard upstream** — confirm rename pattern (likely re-export under both names).

## Risk + mitigation

- **Risk:** `useRender` + `render={…}` API change is per-call-site, not per-primitive. Underestimating the call-site count per phase is the dominant risk.
  **Mitigation:** Petey re-grills at each bow-in with actual call-site counts. Phases split when count exceeds session budget.
- **Risk:** Base UI's positioner API (`<X.Positioner>` wrapping `<X.Popup>`) is structurally different from Radix's `Portal + Content`. Forgetting Positioner renders elements at viewport (0,0).
  **Mitigation:** Each popover-family migration includes a Playwright spot-check before phase close.
- **Risk:** `lib/utils.ts` swap from `cva` package to `tailwind-variants` may surface object-form signature mismatches in existing primitives.
  **Mitigation:** Phase 2 typecheck is the gating step.

## Tracking

- Drift register `D-016` (Radix→Base UI migration) — created at end of SESSION_0209. Each phase ticks off its checklist items in `D-016`.
- Lane ledger appends a row per phase.
- Wiki `custom-component-inventory.md` updated each phase for changed primitives.

## Cross-references

- [SESSION_0209](./SESSION_0209.md) — Phase 1 implementation.
- [SESSION_0210](./SESSION_0210.md) — Phase 2a implementation (utils + AnimatedContainer + cva import sweep).
- [SESSION_0211](./SESSION_0211.md) — Phase 2b implementation (Heading useRender + render callbacks).
- [SESSION_0208](./SESSION_0208.md) — L5 UI primitives Part 1; documented the original PopoverTrigger deferral.
- [Epic 2026-05-19](../architecture/uplift/epic-2026-05-19.md) — overall uplift lane plan.
- [Drift register](../knowledge/wiki/drift-register.md) — `D-016`.
