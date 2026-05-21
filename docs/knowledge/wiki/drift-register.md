---
title: Drift Register
slug: drift-register
type: protocol
status: active
created: 2026-04-27
updated: 2026-05-21
last_agent: codex-session-0215
source_pages:
  - docs/knowledge/wiki/concepts/open-brain-repo-memory.md
  - docs/sprints/SESSION_0017.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Drift Register

Track contradictions, stale claims, and unresolved tensions between sources. Each entry stays open until resolved by a session or ADR.

## Entries

### D-001 — Wiki log stale after SESSION_0007

- **Source A:** `wiki/log.md`
- **Source B:** SESSION files 0008–0016
- **Decision needed:** Backfill log
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-002 — S2–S4 entities missing `payloads.ts`

- **Source A:** `s2-s4-pattern-audit.md`
- **Source B:** Dirstarter `tools/payloads.ts` pattern
- **Decision needed:** Create payload files
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-003 — Org queries use `include` not `select`

- **Source A:** `organization/queries.ts`
- **Source B:** Dirstarter pattern, payload-based `select`
- **Decision needed:** Refactor queries
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-004 — `/me` page uses raw headings, not `<Intro>`

- **Source A:** `app/(web)/me/page.tsx`
- **Source B:** Dirstarter page shell pattern
- **Decision needed:** Update page
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-005 — Cache pattern not applied to read queries

- **Source A:** Ronin queries using React `cache` only
- **Source B:** Dirstarter `"use cache"` + `cacheTag` + `cacheLife`
- **Decision needed:** Needs research; auth-scoped data risk
- **Status:** resolved
- **Resolved in:** SESSION_0059; public queries upgraded to `"use cache"` + `cacheTag` + `cacheLife`, auth-scoped queries intentionally kept with React `cache()`.

### D-006 — `packages/api-client` not installed in workspace

- **Source A:** SESSION_0016
- **Source B:** `pnpm-workspace.yaml`
- **Decision needed:** Run `pnpm install`
- **Status:** deferred
- **Resolved in:** SESSION_0060; no consumers, keep for future use.

### D-007 — Dirstarter package identity vs Ronin identity

- **Source A:** `package.json` name field
- **Source B:** Project identity
- **Decision needed:** Rename later as transitional cleanup
- **Status:** deferred
- **Resolved in:** not resolved

### D-008 — Local `dirstarter_template/` inaccessible to remote agents

- **Source A:** SESSION_0016 L1 constraint
- **Source B:** GitHub/Codex context
- **Decision needed:** Document expected reference; consider committing key patterns as wiki pages
- **Status:** resolved
- **Resolved in:** SESSION_0039; `dirstarter-baseline-index.md` created.

### D-009 — ADR 0010 status conflict

- **Source A:** `0010-cache-strategy.md` said accepted
- **Source B:** SESSION_0018 said draft/proposed
- **Decision needed:** Revert to `proposed`; create cache risk register
- **Status:** resolved
- **Resolved in:** SESSION_0019

### D-010 — Program plan superseded by May 18 all-brand launch

- **Source A:** `program-plan.md`, 12-sprint MVP
- **Source B:** Brian directive SESSION_0019
- **Decision needed:** Lock launch strategy in SESSION_0020
- **Status:** resolved
- **Resolved in:** SESSION_0060; WORKFLOW_5.0 governs session calendar, program-plan layered architecture sections remain valid, frontmatter updated.

### D-011 — 13+ schema entities missing for full launch

- **Source A:** `SCHEMA_NEEDS_MANIFEST.md`
- **Source B:** `schema.prisma`, 31 models at the time
- **Decision needed:** Schema reconciliation in SESSION_0020
- **Status:** resolved
- **Resolved in:** SESSION_0059; manifest deprecated, all gaps addressed in `s2-schema-additions.md`.

### D-012 — Dirstarter source audit not completed

- **Source A:** SESSION_0019 plan
- **Source B:** none
- **Decision needed:** Carry to future session
- **Status:** resolved
- **Resolved in:** SESSION_0039; `dirstarter-baseline-index.md` inventoried 300+ files.

### D-013 — Admin auth behavior: 404 vs redirect

- **Source A:** `auth-hoc.tsx`, redirects to `/`
- **Source B:** `auth.md`, says 404
- **Decision needed:** Pick one and align both
- **Status:** resolved
- **Resolved in:** SESSION_0058; aligned to 404 via `notFound`.

### D-014 — Dirstarter `Tool` residue conflicts with monetization reuse

- **Source A:** `schema.prisma` TODO(remove-before-prod), MB-005
- **Source B:** `directory-monetization-roadmap.md`, active `/submit` and `/advertise` flows
- **Decision needed:** Decide quarantine, promotion, or replacement before production
- **Status:** resolved
- **Resolved in:** SESSION_0039; Option B, repurpose Tool to Directory Listing. See `dirstarter-baseline-index.md` section 14.

### D-015 — `wiki/log.md` claimed active append-only status but was stale since SESSION_0031

- **Source A:** `docs/knowledge/wiki/log.md` frontmatter/status
- **Source B:** Current closing/project practice uses SESSION files, Project Log, wiki index, and MB registry
- **Decision needed:** Mark old wiki log as superseded historical context
- **Status:** resolved
- **Resolved in:** 2026-05-08; `wiki/log.md` marked superseded. Routine docs/runbook changes should not be appended there.

### D-016 — Radix → @base-ui/react primitive runtime migration

- **Source A:** Ronin `apps/web/components/common/*.tsx` — 23 primitives on `radix-ui ^1.4.3` + `cmdk ^1.1.1` + `radix-ui` `Slot.Root` for `asChild` composition.
- **Source B:** Upstream `dirstarter_template @ 7e724b6 components/common/*.tsx` — 18 primitives on `@base-ui/react ^1.3.0` + `cmdk-base ^1.0.0` + custom `~/lib/slot.ts` util + `useRender` consumer API (`render={…}` replacing `asChild`).
- **Decision needed:** Migrate all Ronin common primitives to upstream's `@base-ui/react` runtime; remove `radix-ui` and `cmdk` from `apps/web/package.json` when complete.
- **Status:** open (Phase 1 + 2a + 2b + 2c + 3 + 4 + 5 complete; Phases 6–8 pending per [petey-plan-0083](../../sprints/petey-plan-0083.md)).
- **Opened:** SESSION_0209 (2026-05-20). Replaces the prior SESSION_0208 partial deferral for `<PopoverTrigger render={…}>` alone — that work is rolled into Phase 7 here.
- **Re-phased at SESSION_0210 bow-in (2026-05-20):** original Phase 2 framing assumed Box/Heading/AnimatedContainer were "mechanical Slot-only swaps." Bow-in audit proved upstream Box deletes the `Box` component (59 JSX + 14 internal consumers) and upstream Heading adopts `useRender` (140 `<Hn as="…">` rewrites). Only AnimatedContainer is mechanical. Phase 2 re-split into 2a (utils + AnimatedContainer + cva import sweep), 2b (Heading), 2c (Box). Phases 3-8 shift by 2 session targets (now SESSION_0213-0218).

#### Phase 1 — SESSION_0209 (2026-05-20) ✅ complete

- [x] Install `@base-ui/react ^1.3.0`, `cmdk-base ^1.0.0`, `tailwind-variants ^3.2.2` in `apps/web`.
- [x] Port `apps/web/lib/slot.ts` from upstream.
- [x] Reconcile `apps/web/components/common/toaster.tsx` (next-themes integration + CSS-variable styling).
- [x] Move `empty-list.tsx` from `components/web/` → `components/common/`; repath 10 import sites.
- [x] Migrate `separator.tsx` (Radix → `@base-ui/react/separator`; 0 `decorative` consumer sites).
- [x] Migrate `avatar.tsx` (Radix → `@base-ui/react/avatar`; 11 consumer sites unchanged).

#### Phase 2a — SESSION_0210 (2026-05-20) ✅ complete

- [x] Migrate `apps/web/lib/utils.ts` from `cva` package to `tailwind-variants` — re-export `tv as cva`, `cn as cx`, `VariantProps`; drop unused `compose`/`defineConfig`/`extendTailwindMerge` wiring. Keep `popoverAnimationClasses` Radix-state shape (Phase 7 will swap to Base UI semantics).
- [x] Migrate `apps/web/components/common/animated-container.tsx` (`Slot.Root` → `slot()` from `~/lib/slot`; 12 consumer sites unchanged).
- [x] Repath stray `import { cx } from "cva"` consumers (`apps/web/components/web/ads/ads-picker.tsx`, `apps/web/components/admin/sidebar.tsx`) onto `~/lib/utils`.

#### Phase 2b — SESSION_0211 (2026-05-20) ✅ complete

- [x] Migrate `apps/web/components/common/heading.tsx`. Adopt `useRender` + `render={…}` per upstream. Drop legacy `as` and `asChild` props.
- [x] Rewrite legacy Heading `as="…"` call sites to the new `render={…}` shape. Exact AST residual check found 211 direct Heading JSX tags plus 60 `IntroTitle` wrapper tags with 0 remaining `as`/`asChild` props, 61 direct Heading render callbacks, and 1 `IntroTitle` render callback. The prior 140-count handoff was treated as an estimate; residual AST/typecheck gates are the close proof.

#### Phase 2c — SESSION_0212 (2026-05-20) ✅ complete

- [x] Migrate `apps/web/components/common/box.tsx`. Delete the `Box` component and `BoxProps` export; upstream only ships `boxVariants`.
- [x] Refactor current `Box` / `BoxProps` consumers to inline `boxVariants` on a real element. Exact AST close proof found 0 remaining `<Box>` JSX tags and 0 `Box` / `BoxProps` imports; current tree has 12 `boxVariants` import consumers. The earlier 59-call-site handoff was superseded by exact current-tree AST counts.

#### Phase 3 — SESSION_0213 (2026-05-20) ✅ complete

- [x] Migrate Slot-only primitives with `asChild` consumer migration: `badge.tsx`, `card.tsx`, `stack.tsx`, `form.tsx`, `button.tsx`. Adopt `useRender` + `render={…}` API.
- [x] Additional `Slot.Root` → `slot()` cleanup landed in direct consumers (`command.tsx`, data-table/header/filter, web nav, dashboard table). `Slottable` intentionally retained for `nav-link.tsx` and `tag.tsx`.

#### Phase 4 — SESSION_0215 (2026-05-21) ✅ complete

- [x] Migrate `tooltip.tsx` from Ronin's Radix wrapper API to upstream Base UI compound parts.
- [x] Rewrite 43 legacy `<Tooltip tooltip="…">` wrapper call sites plus 3 provider call sites. Close proof found zero residual `tooltip`, `delayDuration`, `disableHoverableContent`, or `Tooltip.Provider` usage on imported Tooltip parts.

#### Phase 5 — SESSION_0214 (2026-05-21) ✅ complete

- [x] Migrate `hover-card.tsx` (PreviewCard rename + Positioner wrapper). `ToolHoverCard` now uses Base UI trigger `render` instead of Radix `asChild`.
- [x] Migrate `accordion.tsx` (depends on Phase 3 Card render-prop; `data-[state=*]` → `data-*`; `Content` → `Panel`).
- [x] Phase 5 intentionally ran before Phase 4 because bow-in counts showed Tooltip at 46 JSX tags across 25 files, while HoverCard + Accordion were 7 JSX tags across 2 files.

#### Phase 6 — SESSION_0216 (complete)

- [x] Migrate `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `label.tsx`.
- [x] Sanity pass on `field.tsx` and `button-group.tsx` (already L5-ported).
- [x] Consumer fixes: 4 DataTable select-all columns migrated from `checked="indeterminate"` to `indeterminate={bool}` prop.
- [x] Label dropped Radix `LabelPrimitive.Root` for plain `<label>`; preserved Ronin `labelVariants` + `isRequired`.

#### Phase 7 — SESSION_0217 (planned)

- [ ] Migrate `dialog.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `select.tsx`, `drawer.tsx`.
- [ ] Sweep `<PopoverTrigger asChild>` → `<PopoverTrigger render={…}>` across all call sites including data-table-faceted-filter, data-table-view-options, date-range-picker (the L5-deferred work).
- [ ] Update `popoverAnimationClasses` constant in `apps/web/lib/utils.ts` to Base UI semantics (`data-open`/`data-closed`).

#### Phase 8 — SESSION_0218 (planned)

- [ ] Migrate `command.tsx` (cmdk → cmdk-base + slot util).
- [ ] Migrate `tabs.tsx`.
- [ ] Build new admin Cmd+K palette (`apps/web/components/admin/command-palette.tsx`) — L6 epic carry-over.
- [ ] Remove `radix-ui` + `cmdk` + `cva` from `apps/web/package.json`.
- [ ] Full sweep: zero residual `radix-ui` / `cmdk` / `cva` imports across `apps/web/`.
- [ ] Final tsc/biome/test/build/Playwright/wiki-lint.
