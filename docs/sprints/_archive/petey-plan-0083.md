---
title: "Petey plan 0083 — Radix → @base-ui/react migration lane"
slug: petey-plan-0083
type: petey-plan
status: closed
created: 2026-05-20
updated: 2026-05-21
last_agent: copilot-session-0218
pairs_with:
  - docs/sprints/SESSION_0209.md
  - docs/sprints/SESSION_0210.md
  - docs/sprints/SESSION_0211.md
  - docs/sprints/SESSION_0212.md
  - docs/sprints/SESSION_0213.md
  - docs/sprints/SESSION_0214.md
  - docs/sprints/SESSION_0215.md
  - docs/sprints/SESSION_0217.md
  - docs/sprints/SESSION_0218.md
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
  - Phase 2c (SESSION_0212): `box.tsx` migration complete. Deleted the `Box` component and `BoxProps` export; current-tree exact AST close proof found 0 remaining `<Box>` JSX tags and 0 `Box` / `BoxProps` imports. The earlier 59-site handoff estimate was superseded by the residual AST/typecheck gates.
- Phase 3 (SESSION_0213): Complete. Slot-only primitives with `asChild` consumer migration: Badge, Card, Stack, Form, Button. High-volume consumer refactor pass; `Slottable` retained for web/ui `nav-link` + `tag`.
- Phase 4 (SESSION_0215): Complete. Tooltip migration shipped in one pass: Base UI primitive + 43 legacy wrapper consumers and 3 provider call sites rewritten to compound composition.
- Phase 5 (SESSION_0214): Complete. Ran before Tooltip because it was smaller. HoverCard (PreviewCard rename + Positioner wrapper) + Accordion (Card-render dep + data-attr rename `data-[state=*]` → `data-*`).
- Phase 6 (SESSION_0216): Complete. Checkbox, RadioGroup, Switch, Label migrated to Base UI. Label dropped Radix for plain `<label>`. 4 DataTable select-all consumers fixed (`indeterminate` prop). Field and ButtonGroup confirmed non-Radix.
- Phase 7 (SESSION_0217): Complete. Popover family — dialog, popover, dropdown-menu, select, drawer migrated to Base UI. `popoverAnimationClasses` updated to Base UI semantics. ~55 consumer `asChild` → `render={}` call sites swept. Select `onValueChange` type signatures fixed. Consumer `data-[state=open]` → `data-open` selectors fixed.
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
| 2c ✓ | `box.tsx` | Deleted `Box` component and `BoxProps`; upstream only ships `boxVariants`. Current exact AST close proof: 0 `<Box>` JSX tags, 0 `Box` / `BoxProps` imports, 12 `boxVariants` import consumers. |
| 3 ✓ | `badge.tsx` | Adopted `useRender` + cva slots `affix`; consumer `asChild` sites migrated. |
| 3 ✓ | `card.tsx` | Adopted `useRender`; unblocked Accordion Phase 5. |
| 3 ✓ | `stack.tsx` | Adopted `useRender`; consumer `asChild` sites migrated. |
| 3 ✓ | `form.tsx` | Internal `Slot.Root` audit complete; `FormControl` uses `slot()`. |
| 3 ✓ | `button.tsx` | Adopted `useRender` + slots API; high-volume `asChild` consumer migration complete. |
| 4 ✓ | `tooltip.tsx` | Migrated to upstream Base UI compound API. Exact close proof: 132 Tooltip-family JSX tags across 25 files (43 Tooltip roots + 43 Trigger render calls + 43 Content calls + 3 providers), 0 legacy `tooltip` props, 0 `delayDuration`, 0 `disableHoverableContent`, 0 `Tooltip.Provider`, 0 Radix import in the primitive. |
| 5 ✓ | `hover-card.tsx` | Renamed to PreviewCard internally; adds Positioner. `ToolHoverCard` migrated off `asChild`. |
| 5 ✓ | `accordion.tsx` | Depends on Card (Phase 3). `data-[state=*]` → `data-*`; `Content` → `Panel`. |
| 6 | `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `label.tsx` | Form primitives. |
| 6 | `field.tsx`, `button-group.tsx` (already L5-ported) | Sanity pass. |
| 7 ✓ | `dialog.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `select.tsx`, `drawer.tsx` | Popover family. `asChild` → `render={…}` call-site sweep. Picks up the L5-deferred PopoverTrigger work. |
| 8 ✓ | `command.tsx` | cmdk → cmdk-base. |
| 8 ✓ | `tabs.tsx` | Radix → `@base-ui/react/tabs`; `data-[state=active]` → `data-selected`. |
| 8 ✓ | `admin/command-palette.tsx` | NEW — admin Cmd+K palette. |
| 8 ✓ | `web/ui/{tile,container,nav-link,tag,sticky}.tsx` | Radix `Slot` → `useRender` + `render={…}`. `Slottable` deleted. |
| 8 ✓ | `package.json` | Removed `radix-ui`, `cmdk`, `cva`, `@radix-ui/react-accordion`. Added `@dirstack/utils`. |

## Decisions reserved for in-phase Petey review

- **Vaul peer-dep on Radix in drawer.tsx** (Phase 7) — confirm Vaul still ships its own Radix dep so removing top-level `radix-ui` doesn't break Vaul. If Vaul moves to Base UI, follow; else accept indirect Radix dep via Vaul.
- **`@base-ui/react/menu` vs dropdown-menu naming** (Phase 7) — verify the upstream import path.
- **Tabs upstream availability** (Phase 8) — if upstream omits, decide: `@base-ui/react/tabs` (if exposed) vs hand-rolled vs keeping `radix-ui` as a lone dep.
- **Hover-card vs PreviewCard upstream** — resolved SESSION_0214: keep Ronin export names while wrapping Base UI `PreviewCard`.

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
- [SESSION_0212](./SESSION_0212.md) — Phase 2c implementation (Box deletion + boxVariants consumers).
- [SESSION_0213](./SESSION_0213.md) — Phase 3 implementation (Badge, Card, Stack, Form, Button).
- [SESSION_0214](./SESSION_0214.md) — Phase 5 implementation (HoverCard, Accordion).
- [SESSION_0215](./SESSION_0215.md) — Phase 4 implementation (Tooltip).
- [SESSION_0208](./SESSION_0208.md) — L5 UI primitives Part 1; documented the original PopoverTrigger deferral.
- [Epic 2026-05-19](../../architecture/uplift/epic-2026-05-19.md) — overall uplift lane plan.
- [Drift register](../../knowledge/wiki/drift-register.md) — `D-016`.
