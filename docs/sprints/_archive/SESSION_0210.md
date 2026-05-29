---
title: "SESSION 0210 — Base UI migration Phase 2a (utils + AnimatedContainer)"
slug: session-0210
type: session--implement
status: closed-full
created: 2026-05-20
updated: 2026-05-20
last_agent: claude-session-0210
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0209.md
  - docs/sprints/petey-plan-0083.md
  - docs/knowledge/wiki/drift-register.md
  - docs/architecture/uplift/lane-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0210 — Base UI migration Phase 2a (utils + AnimatedContainer)

## Date

2026-05-20

## Operator

Brian + claude-session-0210 (Petey planning, Cody implementation, Doug verification)

## Goal

Execute **Phase 2a** of the Radix → `@base-ui/react` migration lane defined in [petey-plan-0083](./petey-plan-0083.md). Phase 2 was re-grilled at bow-in (see "Bow-in notes" below) and split into 2a / 2b / 2c. This session executes 2a only — the foundation pieces that have low call-site blast radius:

1. `apps/web/lib/utils.ts` — swap `cva` package → `tailwind-variants`. Re-export `tv` as `cva`, `cn` as `cx`, and `VariantProps`. Drop unused `compose` export. Keep `popoverAnimationClasses` constant content unchanged (Radix-state selectors) — the Base UI semantics rewrite is deferred to Phase 7 when the popover-family primitives migrate.
2. Repath 2 stray `import { cx } from "cva"` consumers (`apps/web/components/web/ads/ads-picker.tsx`, `apps/web/components/admin/sidebar.tsx`) to `~/lib/utils` so the future `cva` package removal is clean.
3. `apps/web/components/common/animated-container.tsx` — mechanical `Slot.Root` → `slot()` from `~/lib/slot`. 12 call sites unchanged (consumer API preserved).

Out of scope (deferred per [petey-plan-0083](./petey-plan-0083.md) Phase 2 re-grill):

- `apps/web/components/common/heading.tsx` — moved to Phase 2b (SESSION_0211). Upstream removes both `as` and `asChild` props in favor of `useRender` + `render={…}`; 140 `<Hn as="…">` call sites must be rewritten.
- `apps/web/components/common/box.tsx` — moved to Phase 2c (SESSION_0212). Upstream deletes the `Box` component entirely (only `boxVariants` remains); 59 `<Box>` JSX sites + 14 internal-primitive consumers (`card`, `switch`, `checkbox`, `textarea`, `input`, `radio-group`, `select`, `dialog`, `drawer`, `overlay-image`, `cta-form`, `user-menu`, `row-checkbox`) must refactor to inline `boxVariants`.
- `popoverAnimationClasses` constant content (Radix `data-[state=*]` → Base UI `data-open`/`data-closed`) — Phase 7 (popover-family primitives).
- Removing the `cva` package from `apps/web/package.json` — deferred to Phase 8 alongside `radix-ui` + `cmdk` removal (`cva` is still a runtime dep of [LIB], confirm at Phase 8).

## Bow-in notes

- **Previous session:** SESSION_0209 closed-full at 2026-05-20. Phase 1 landed: deps (`@base-ui/react`, `cmdk-base`, `tailwind-variants`), `lib/slot.ts` util, `toaster.tsx` reconcile, `empty-list.tsx` relocation, `separator.tsx`/`avatar.tsx` migration, drift register `D-016` opened.
- **Branch:** `session-0210-d016-phase-2-utils-slot-only`, cut from `main` (post-Phase-1 merge of `4b3d04b` + FS-0024 doc commit `faf61f4`). Working tree clean at cut.
- **Upstream pin:** `/Users/brianscott/Local Sites/DirStarter /dirstarter_template` @ `7e724b6` (unchanged from Phase 1).
- **dirstarter_template read-only rule** acknowledged ([[feedback-dirstarter-template-readonly]]) — only `cat`/`diff`/`ls` permitted there.
- **Bash cwd discipline:** [[feedback-ronin-dojo-bash-cwd]] / FS-0024 — every Bash call prefixed with `cd /Users/brianscott/dev/ronin-dojo-app &&` (one early bow-in violation caught and corrected before any write).
- **Mid-bow-in re-grill (Petey).** Read upstream `box.tsx`, `heading.tsx`, `animated-container.tsx`, `lib/utils.ts` before writing any code. Findings:
  1. `box.tsx` upstream is **only** `boxVariants` export — the `Box` component is **gone**. Ronin has 59 `<Box>` JSX call sites + 14 internal-primitive consumers of `Box` / `BoxProps`. This is **not** a "mechanical Slot.Root → slot()" swap; it is a consumer API removal.
  2. `heading.tsx` upstream uses `useRender` + `render={…}`; the legacy `as` and `asChild` props are removed. Ronin has 140 `<Hn as="…">` call sites that must be rewritten to `render={<h3 … />}` (or similar).
  3. `animated-container.tsx` upstream **is** a clean `Slot.Root` → `slot()` swap. 12 call sites unchanged. Only truly-mechanical primitive in this Phase 2 list.
  4. `popoverAnimationClasses` upstream content changes Radix `data-[state=*]` selectors to Base UI `data-open`/`data-closed` semantics. 4 still-Radix consumers (`popover.tsx`, `hover-card.tsx`, `dropdown-menu.tsx`, `select.tsx`) — updating now would break them until Phase 7 migrates the primitives. **Defer to Phase 7.**
- **Petey call:** re-split Phase 2 into 2a (this session) / 2b (Heading) / 2c (Box). Phases 3-8 slide one session each. Updated [petey-plan-0083](./petey-plan-0083.md) and `D-016` to reflect the re-phasing.
- **Operator confirmation:** approved 2a/2b/2c re-phase (chat 2026-05-20).
- **FAILED_STEPS check:** FS-0014 (raw HTML primitives), FS-0023 (Biome `--unsafe` JSX), FS-0024 (Bash cwd drift) all in scope. All mitigations honored.
- **Drift register check:** `D-016` open from SESSION_0209. No new open drift items in lane.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Replace `cva` package wiring with `tailwind-variants` re-exports in `apps/web/lib/utils.ts`. Migrate `animated-container.tsx` from `radix-ui` Slot to `@base-ui/react` slot util. Repath 2 `from "cva"` imports onto `~/lib/utils`. |
| Extension or replacement | Replacement (in place). Public surface of `~/lib/utils` (`cva`, `cx`, `VariantProps`, `popoverAnimationClasses`) preserved by re-aliasing; `compose` (unused) removed. AnimatedContainer consumer API preserved. |
| Why justified | Continuation of operator-directed full Radix → Base UI migration (`D-016`). `tailwind-variants` unlocks the `slots` API needed by upstream primitives (Phase 3+). AnimatedContainer is the only truly-safe leaf in the Phase 2 list. |
| Risk if bypassed | The `slots`-using upstream primitives (badge, card, stack, etc. in Phase 3) cannot be ported until `cva` is `tv`. Holding Phase 2 in `cva` would block every subsequent phase. |

## Tasks

### SESSION_0210_TASK_01 — `lib/utils.ts` swap + stray `cva` import cleanup

- **Agent:** Cody
- **What:**
  - `apps/web/lib/utils.ts` — rewrite to upstream shape: `export { tv as cva, cn as cx } from "tailwind-variants"`; `export type { ClassValue, VariantProps } from "tailwind-variants"`; keep `popoverAnimationClasses` constant **with Radix-state selectors unchanged** (deferred to Phase 7). Drop unused `compose` export and `extendTailwindMerge` / `defineConfig` wiring. Remove `tailwind-merge` direct import (tv re-uses tw-merge internally).
  - `apps/web/components/web/ads/ads-picker.tsx` — repath `import { cx } from "cva"` → `import { cx } from "~/lib/utils"`.
  - `apps/web/components/admin/sidebar.tsx` — repath `import { cx } from "cva"` → `import { cx } from "~/lib/utils"`.
- **Done:** `pnpm --filter dirstarter typecheck` passes. `bun run lint` clean. No `from "cva"` imports remain outside `apps/web/lib/utils.ts` (and `lib/utils.ts` itself no longer imports `cva` either — re-exports are from `tailwind-variants`).
- **Depends on:** none.

### SESSION_0210_TASK_02 — `animated-container.tsx` migration

- **Agent:** Cody
- **What:**
  - `apps/web/components/common/animated-container.tsx` — replace `import { Slot } from "radix-ui"` with `import { slot } from "~/lib/slot"`. Replace both `<Slot.Root>` JSX sites (lines 21 and 35 in current Ronin file) with `slot(children, { className: … })` calls per upstream.
- **Done:** File matches upstream `dirstarter_template/components/common/animated-container.tsx` verbatim. `pnpm --filter dirstarter typecheck` passes. 12 consumer call sites unchanged.
- **Depends on:** TASK_01 (utils swap unblocks future primitive migrations; not strictly required for animated-container which doesn't use cva, but groups logically with the Phase 2a foundation work).

### SESSION_0210_TASK_03 — Verification + drift/inventory/ledger updates + close

- **Agent:** Doug + Petey
- **What:**
  - `apps/web/.dirstarter-upstream` — append partial-port note: "L6 Phase 2a: lib/utils.ts cva→tailwind-variants swap + animated-container.tsx Slot→slot(). Heading (Phase 2b) and Box (Phase 2c) split into separate sessions per D-016 re-phasing."
  - Update [`docs/knowledge/wiki/drift-register.md`](../../knowledge/wiki/drift-register.md) `D-016`: tick Phase 2a; insert Phase 2b (Heading) and Phase 2c (Box) rows; renumber downstream phases (current Phase 3 → SESSION_0213, etc.).
  - Update [`docs/sprints/petey-plan-0083.md`](./petey-plan-0083.md): split Phase 2 into 2a/2b/2c; renumber phases 3-8 to 3-8 (no number change — those keep their session targets shifted by 2 sessions: 0213-0218).
  - Update [`docs/architecture/uplift/lane-ledger.md`](../../architecture/uplift/lane-ledger.md) with L6 Phase 2a row.
  - Update [`docs/knowledge/wiki/custom-component-inventory.md`](../../knowledge/wiki/custom-component-inventory.md) — annotate `AnimatedContainer` row with current source.
  - Update [`docs/protocols/project-log.md`](../../protocols/project-log.md) with TASK_01/02/03 rows + review log.
  - `pnpm --filter dirstarter typecheck` ✓
  - `bun run lint` ✓
  - `bun test --isolate --path-ignore-patterns='e2e/**' --concurrency=1` ✓ (244/244 baseline)
  - `pnpm --filter dirstarter build` ✓
  - `bun run wiki:lint` ✓
  - Git commit + push; verify Vercel Preview Ready before declaring `closed-full`.
  - Bow out.
- **Done:** SESSION_0210 closes; Doug verdict recorded; D-016 Phase 2a ticked + 2b/2c rows added; lane-ledger row appended.
- **Depends on:** TASK_01, TASK_02.

## Decisions resolved (bow-in)

1. **Phase 2 re-split** to 2a / 2b / 2c. Driver: upstream Box and Heading API changes are call-site refactors, not mechanical primitive swaps. Each warrants its own bounded session. Approved by Operator.
2. **`popoverAnimationClasses` content** stays Radix-shape this session. Driver: 4 still-Radix consumers (popover/hover-card/dropdown-menu/select) would break with Base UI semantics until those primitives migrate. Defer to Phase 7.
3. **`compose` export dropped** from `~/lib/utils`. Driver: zero importers in repo (verified via grep). Aligns with upstream surface.
4. **`cva` package stays installed** through Phases 2-7. Driver: removing it requires verifying no transitive deps (Mantine, motion, etc.) ship `cva` as a peer. Removal is bundled with `radix-ui` + `cmdk` cleanup in Phase 8.

## Files touched (planned)

| File/group | Note |
| --- | --- |
| `apps/web/lib/utils.ts` | Rewrite to `tailwind-variants` re-exports. Drop `compose`, `defineConfig`, `extendTailwindMerge` wiring. Keep `popoverAnimationClasses` Radix-shape (Phase 7 update). |
| `apps/web/components/web/ads/ads-picker.tsx` | Repath `cx` import to `~/lib/utils`. |
| `apps/web/components/admin/sidebar.tsx` | Repath `cx` import to `~/lib/utils`. |
| `apps/web/components/common/animated-container.tsx` | `Slot.Root` → `slot()`; matches upstream. |
| `apps/web/.dirstarter-upstream` | Partial-port note (TASK_03). |
| `docs/knowledge/wiki/drift-register.md` | D-016 Phase 2a tick + 2b/2c rows + phase renumber (TASK_03). |
| `docs/sprints/petey-plan-0083.md` | Re-phasing 2a/2b/2c (TASK_03). |
| `docs/architecture/uplift/lane-ledger.md` | L6 Phase 2a row (TASK_03). |
| `docs/knowledge/wiki/custom-component-inventory.md` | AnimatedContainer annotation (TASK_03). |
| `docs/protocols/project-log.md` | TASK_01/02/03 rows + review log (TASK_03). |
| `docs/sprints/SESSION_0210.md` | This file. |

## Verification evidence

- `pnpm --filter dirstarter typecheck` — passed (`next typegen && tsc --noEmit --pretty false`); ran after both TASK_01 and TASK_02.
- `bun biome check --write .` (scoped to `apps/web`) — checked 979 files in 5s; auto-fixed import ordering in 3 touched files (`lib/utils.ts`, `components/admin/sidebar.tsx`, `components/web/ads/ads-picker.tsx`); 0 errors after fixes. (Repo-wide `pnpm -r lint` fails in `packages/api-client` because biome is not installed there — pre-existing env issue, unrelated to this lane; same condition existed at SESSION_0208/0209 close.)
- `bun test --isolate --path-ignore-patterns='e2e/**' --concurrency=1` (from `apps/web`) — passed 244/244 tests / 872 assertions across 51 files in 143.19s (matches L5/L6 Phase 1 baseline).
- `pnpm --filter dirstarter build` — passed; `prisma migrate deploy` no pending migrations; `next-sitemap` completed (sitemap.xml + sitemap-0.xml).
- `bun run wiki:lint` — 0 errors / 497 warnings across markdown files (matches L6 Phase 1 baseline).
- Branch push + Vercel readiness proof — reported in bow-out response.

## Review log

### SESSION_0210_REVIEW_01 — Base UI migration Phase 2a

- **Reviewed tasks:** SESSION_0210_TASK_01, SESSION_0210_TASK_02, SESSION_0210_TASK_03.
- **Dirstarter docs check:** upstream `7e724b6` `lib/utils.ts`, `components/common/{box,heading,animated-container}.tsx` diffed against Ronin counterparts during bow-in audit. Live `dirstarter.com` docs not required — upstream source files are the contract for primitive migration.
- **Verdict:** Pass. No P0/P1 findings. Honest bow-in re-scope (Petey caught Box/Heading API change before any consumer code was touched) kept Phase 2a bounded to 3 truly-safe foundation pieces. Verification suite green at L6 Phase 1 baseline.
- **Residual risk:** `popoverAnimationClasses` constant content drifts further from upstream until Phase 7 migrates popover-family primitives — documented in `D-016` Phase 7 checklist as the trigger to swap. `cva` package stays installed through Phases 2-7; Phase 8 removes it alongside `radix-ui` + `cmdk`.

## Open decisions / blockers

None.

## Next session

SESSION_0211 = **Phase 2b** of `D-016`: `apps/web/components/common/heading.tsx` migration. Adopt `useRender` + `render={…}` API per upstream. Rewrite 140 `<Hn as="…">` call sites to the new shape. Verify no `asChild` consumers remain. Drift register: `D-016` Phase 2b row.

## Reflections

- Petey's bow-in audit caught a scope blowup before any consumer code was touched. Reading upstream `box.tsx`/`heading.tsx`/`animated-container.tsx` directly against Ronin counterparts — instead of trusting the prior-session plan literally — turned a session that could have closed unclean (Box deletion + 73 consumer rewrites + Heading 140 `as=` rewrites in one session) into a bounded 3-piece foundation that closed clean. Same lesson as L6 Phase 1's mid-session re-scope, now applied at bow-in.
- Deferring `popoverAnimationClasses` content update was the right call. Updating it now (to Base UI `data-open`/`data-closed` semantics) would have broken 4 still-Radix popover-family primitives until Phase 7 — invisible until E2E smoke. Coupling that constant to its consumers' lifecycle keeps the change non-load-bearing across phases.
- The Bash cwd-drift rule ([[feedback-ronin-dojo-bash-cwd]] / FS-0024) bit early (one `git status` without prefix). Re-running with the prefix surfaced no harm — but the muscle-memory matters more on `pnpm`/`git push`/`vercel` calls where the wrong cwd silently runs against the read-only template. Stayed prefix-disciplined for the rest of the session.

## ADR / ubiquitous-language check

No ADR needed (re-phasing is operational, not architectural). No new ubiquitous-language terms.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0210 created with JETTY 3.0 frontmatter; petey-plan-0083 `last_agent` + `pairs_with` updated; touched governance docs (drift-register D-016, lane-ledger L6 row, project-log SESSION_0210 row + review log, .dirstarter-upstream partial-port note, wiki index) all updated. |
| Backlinks/index sweep | SESSION_0210 row appended to wiki index; petey-plan-0083 `pairs_with` now includes SESSION_0210; D-016 + lane-ledger cross-reference each other and petey-plan-0083. |
| Wiki lint | `bun run wiki:lint` 0 errors / 497 warnings (matches L6 Phase 1 baseline). |
| Kaizen reflection | Reflections section present above. |
| Hostile close review | `SESSION_0210_REVIEW_01` appended to `docs/protocols/project-log.md` and summarized in this file's Review log. |
| Review & Recommend | Next-session recommendation written for SESSION_0211 / D-016 Phase 2b (heading.tsx + 140 `<Hn as="…">` rewrites). |
| Memory sweep | No new operator-level memory needed — re-phasing is documented in D-016 + petey-plan-0083, not in operator memory. The Box/Heading scope-blowup discovery pattern is already captured in the Petey-plan-0083 line "Phase boundaries are guidance — Petey at each bow-in reserves the right to split or merge phases based on actual scope discovered." |
| Next session unblock check | Unblocked; SESSION_0211 starts from D-016 Phase 2b checklist. |
| Git hygiene | Branch `session-0210-d016-phase-2-utils-slot-only`; final commit/push proof reported in bow-out response. |
| Graphify update | Post-commit Graphify refresh reported in bow-out response. |

## Status

closed-full
