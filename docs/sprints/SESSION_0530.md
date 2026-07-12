---
title: "SESSION 0530 — FI-027 Techniques AdminCollection (+ WL-P2-52 authoring-UX polish)"
slug: session-0530
type: session--implement
status: closed
created: 2026-07-12
updated: 2026-07-12
last_agent: claude-session-0530
sprint: S53
pairs_with:
  - docs/sprints/SESSION_0529.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0530 — FI-027 Techniques AdminCollection (+ WL-P2-52 authoring-UX polish)

## Date

2026-07-12

## Operator

Brian + claude-session-0530 (Petey orchestrating on Opus; Cody build → Giddy + Doug + Desi verify wave)

## Goal

Build **FI-027 — the Techniques AdminCollection**: `/app/techniques/page.tsx` as an index data-table
SIBLING of `/app/tools` (the AdminCollection PATTERN, ADR 0045 — not a mount underneath), completing the
ADR-0046 promote loop (staff have the 3C Feature toggle but NO discovery surface to find authored
techniques awaiting promotion). Columns: name · author (Passport) · school (org) · featured · published ·
premium-mix; default **"Pending promotion"** view (authored ∧ published ∧ ¬featured); `can(techniques.manage)`
-gated (inline, NOT a subtree layout — the author-accessible `[id]`/`new` routes stay open); row → the
existing `[id]` editor. Optional companion: a bundled cut of **WL-P2-52** (Desi 3B/3C UX polish — copy/
affordance only, no authz/leak surface). Hold at the push gate.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0529.md` (its `Next session` block + the follow-up grill
  decisions FI-027/FI-028) + `POST_LAUNCH_SOT.md` FI-027/028 rows + ADR 0045 + ADR 0046 + memory
  `admin-collection-one-surface-law`.
- Carryover: SESSION_0529 landed Slices 3B (member authoring UI) + 3C (staff `isFeatured` promote) and
  was pushed/merged to `main` (`59a9d47c`). 3C shipped the Feature toggle on `/app/techniques/[id]` but
  flagged **NO admin techniques data-table** — that discovery surface is FI-027, this session.

### Branch and worktree

- Branch: `session-0530-fi027`
- Worktree: `/Users/brianscott/dev/ronin-0530` (created off `origin/main`; bootstrapped — `.env` copied,
  `bun install`, Prisma client generated).
- Status at bow-in: clean fresh worktree off `origin/main`.
- Current HEAD at bow-in: `59a9d47c`.

### Concurrency guard (RESOLVED — no live lanes)

- `git worktree list`: canonical checkout + a STALE Codex worktree (detached HEAD `552ad883` at
  `~/.codex/worktrees/b717` — do NOT touch, per handoff) + this new `../ronin-0530`. Highest remote
  session branch is `session-0515`; highest SESSION file is 0529 (merged). **0530 is the next free
  number**; no live lane collides with the technique/admin files this session touches.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin data-table kit (`components/data-table/*` via `AdminCollection`), Prisma (read query only — NO migration; the columns exist from 3A/3C). |
| Extension or replacement | Extension — a new conformed `AdminCollection` surface (columns + query), zero new frame; mirrors the SESSION_0515 three-file shape (claims exemplar). |
| Why justified | ADR 0045 law: every admin list is the SAME frame with different columns + query. FI-027 is the discovery half of the ADR-0046 promote loop (3C shipped the toggle without a list). |
| Risk if bypassed | Authored techniques are invisible to staff → the promote loop is dead (staff can't find what to feature); a hand-rolled list would violate the one-surface law. |

Live docs checked during planning: SESSION_0529, POST_LAUNCH_SOT (FI-027/028), ADR 0045, ADR 0046, memory
`admin-collection-one-surface-law`, `technique-authoring-ownership-adr-0046`, `profile-media-freemium-model-0525`.

### Grill outcome (Petey calls — non-operator-blocking; surfaced for veto)

4 forks resolved with sensible defaults inside the operator-ratified FI-027 shape (b):

1. **"Pending promotion" chip mechanism** → a `scope` nuqs enum param (default `pending-promotion`),
   server-mapped to a where clause, surfaced as a compact toolbar control via `AdminCollection`'s
   `children` render-prop + a `name` search facet. Rationale: the chip is a *computed multi-condition*
   view (authored ∧ published ∧ ¬featured), not a single-column facet, so a named-view enum is the honest
   representation and stays within the frame (claims=no facets, tools=DateRangePicker+viewOptions — a
   per-surface toolbar control is conformant).
2. **"premium-mix" column** → derive free/premium **clip counts** from `mediaAttachments: { select: { isPremium: true } }` (NEVER select `url`/`thumbnailUrl` — no-leak safe by construction); render a compact
   "N free · M premium" / "No media" cell. Rationale: "mix" = the media freemium composition staff need
   before promoting (would promoting put locked content into browse?).
3. **Nav item gate** → the `admin-sections.ts` "Techniques" item (line 142) is currently UNGATED and
   points at `/app/techniques` (no page existed → dead link). Add `permission: APP_AREA_PERMISSIONS.techniques`
   to match the new staff-gated index. Members author via `/app/profile` (not this link). Route-guard and
   nav-gate now agree (the file's own invariant).
4. **WL-P2-52 cut (5, all copy/affordance, zero authz/leak)** — bundled as a separable second commit:
   (a) feature-toggle copy strips "(staff-only; ADR 0046)" jargon; (b) authored slug auto-derive + hide
   the raw slug field in authored mode; (c) duplicate-slug toast says "name" not "slug"; (d) authoring
   Drawer double-heading removed; (e) profile-scoped watch page gets breadcrumbs/back-to-profile
   attribution. Deferred to a later WL-P2-52 pass: rail-copy collision, dual-create-affordance/empty-state
   tone, and the P3s.

## Petey plan

### Goal

Ship the FI-027 Techniques AdminCollection (conformed three-file shape) + a bundled WL-P2-52 copy/affordance
polish cut, behavior-safe and no-leak-preserving, and hold at the push gate for the operator's go.

### Tasks

#### SESSION_0530_TASK_01 — FI-027: Techniques AdminCollection index

- **Agent:** Cody build → Giddy + Doug + Desi verify wave.
- **What:** `/app/techniques/page.tsx` conformed `AdminCollection` index (three-file shape), staff-gated
  inline, default "Pending promotion" view, row → existing `[id]` editor.
- **Steps:**
  1. **Server query + schema** (`server/admin/techniques/queries.ts` + `schema.ts`): a
     `findTechniquesForAdmin` routed through `runAdminListTransaction` + `clampListPageParams` (NOT a
     hand-rolled `$transaction([findMany,count])` + pager — Giddy flags it). Select ONLY: `id, name, slug,
     isFeatured, isPublished, isPremium, author { displayName }, organization { name }, mediaAttachments { isPremium }`.
     Brand-scope `BBL`. A `scope` enum param → where: `pending-promotion` = `{ authorPassportId: { not: null }, isPublished: true, isFeatured: false }`; `featured` = `{ isFeatured: true }`; `authored` = `{ authorPassportId: { not: null } }`; `all` = `{}`. Name search (`contains`, insensitive). A `resolveTechniqueOrderBy` mapping (sortable: name, isFeatured, isPublished, createdAt) defaulting to `createdAt desc`.
  2. **Three UI files** mirroring the claims exemplar: `page.tsx` (server: `requirePermission(APP_AREA_PERMISSIONS.techniques)` INLINE + parse params + kick the promise + `<Suspense><TechniquesTable/>`), `_components/techniques-table.tsx` (`"use client"` → `AdminCollection` with the `scope` control in `children` + `name` facet), `_components/techniques-table-columns.tsx` (name→`DataTableLink href=/app/techniques/{id}`, author, school, featured/published `Badge`, premium-mix cell).
  3. **Nav gate:** add `permission: APP_AREA_PERMISSIONS.techniques` to the `admin-sections.ts` Techniques item; update `admin-sections.test.ts` if it asserts item shape.
- **Done means:** a `techniques.manage` holder sees `/app/techniques` listing authored-pending-promotion
  techniques by default, can switch scope + search + sort, clicks a row → the `[id]` editor with the 3C
  toggle; a non-staff user is redirected to `/app` (inline guard); the `[id]`/`new` author paths are
  UNCHANGED (no subtree layout added); gates green; NO premium `url`/YouTube-id byte in the list payload.
- **Depends on:** nothing (3A/3C foundation on `main`).

#### SESSION_0530_TASK_02 — WL-P2-52: authoring-UX polish cut (copy/affordance only)

- **Agent:** Cody build → Desi verify (in the wave).
- **What:** the 5-item grill-ratified cut (Grill fork #4) as a separable commit.
- **Steps:** (a) `technique-feature-toggle.tsx` copy; (b) `technique-form.tsx` authored-mode slug
  auto-derive + hide field; (c) `technique-errors.ts` `AUTHORED_SLUG_TAKEN` message "name"; (d) authoring
  Drawer double-heading; (e) `/directory/[slug]/techniques/[techniqueSlug]/page.tsx` breadcrumbs/attribution.
- **Done means:** each item visibly fixed, no behavior/authz change, gates green; no-leak invariant
  untouched (none of these touch the gate/payload).
- **Depends on:** SESSION_0530_TASK_01 (same surfaces; land FI-027 first so the core is push-safe if the
  polish is dropped).

### Parallelism

Single coherent lane — no fan-out. TASK_01 first (the P1); TASK_02 after, as a separable second commit.
Cody builds in `ronin-0530`; the verify wave (Giddy architecture + Doug release + Desi UX — Desi IN the
wave, this is a UI lane) reviews the combined diff; batched-fix single-resume; delta verify; push gate.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0530_TASK_01 | Cody → Giddy + Doug + Desi | Conformed AdminCollection build on a known pattern + a read query |
| SESSION_0530_TASK_02 | Cody → Desi | Small copy/affordance polish on the same surfaces |

### Open decisions

- Grill forks #1–#4 are Petey calls with sensible defaults (above) — surfaced for operator veto, not
  blocking. Everything else is inside the operator-ratified FI-027 shape (b).
- Hold at the push gate for operator "go".

### Risks

- **No-leak invariant:** the list query must NEVER select `MediaAttachment.url`/`thumbnailUrl` — only
  `isPremium` for the mix count. Encoded as a hard constraint in the Cody brief; Doug re-probes the list
  payload for zero premium-id bytes.
- **Author-path regression:** adding a `techniques.manage` subtree layout would clobber the existing
  non-staff author access to `[id]`/`new`. HARD RULE: gate the index page INLINE only; add NO
  `app/app/techniques/layout.tsx`.
- WL-P2-52 must stay a separable commit so it can be dropped if the review wave destabilizes it without
  risking the FI-027 P1.

### Scope guard

- FI-027 + the 5-item WL-P2-52 cut only — no FI-028 (needs its own grill), no shared-seams cleanup lane.
- NO schema migration (3A/3C own the columns); no `migrate-dev` on the shared local DB.
- Do NOT touch the stale Codex worktree (`552ad883`).
- FI-001 / Brian Truelson email PARKED — no `--send`, no `--grant`.
- One push at close, on the operator's explicit word.

## Cody pre-flight

### Pre-flight: FI-027 Techniques AdminCollection

#### 1. Existing component scan

- Reuse (Petey-confirmed): `components/admin/admin-collection.tsx` (`AdminCollection<TData>`);
  `server/admin/list-query.ts` (`runAdminListTransaction`, `clampListPageParams`,
  `getAdminListQueryParts`, `buildAdminListWhere`); `components/data-table/{data-table-link,
  data-table-column-header,data-table-skeleton}.tsx`; `components/common/{badge,note}.tsx`;
  `lib/parsers.ts` (`getSortingStateParser`); `lib/auth-guard.ts` (`requirePermission`). Row target
  (`/app/techniques/[id]/page.tsx`) exists (carries the 3C toggle) — no change.
- Exemplar to mirror byte-for-shape: `/app/claims` (page + `_components/claims-table*` + `server/admin/claims/{claim-queries,schema}.ts`).

#### 2. L1 template scan

- Admin list = ONE `AdminCollection` frame (ADR 0045). Do NOT hand-roll a table/grid/`$transaction`+pager.
  Faceted filter fields = nuqs array params → `{ [id]: { in } }` (tools pattern); a computed named-view
  goes through a dedicated `scope` enum param + server mapping.

#### 3. Composition decision

- Compose `AdminCollection` + `DataTableLink`/`Badge`/`Note` columns + the shared list-query helpers. Add
  only: the `scope` view control, the techniques columns, and the server query/schema pair.

#### 4. Lane docs loaded

- Prior SESSION next-session read: yes (0529). ADR: 0045 + 0046. Memory: `admin-collection-one-surface-law`,
  `technique-authoring-ownership-adr-0046`.

#### 5. Dev environment confirmed

- Dev server: worktree `cd apps/web && npx next dev --turbo` (preview_start can't serve a worktree —
  Browser pane reads :3000 via Bash-run dev). Working dir: `/Users/brianscott/dev/ronin-0530`. Brand/host: local BBL.

#### 6. FAILED_STEPS check

- Prior failures: workflow-over-dirty-tree (worktree-isolated — OK); migrate-dev-on-shared-DB (no migration
  this session); no-leak payload invariant (preserve — list never selects url); subtree-layout clobber
  (avoid — gate inline).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0530_TASK_01 | landed | FI-027 Techniques AdminCollection index (`d62c3dfb` + review-pass `2f833dbf` + batch `11e9d25d`). Conformed 3-file `AdminCollection` (page + table + columns) + `server/admin/techniques/{queries,schema,scope}.ts` routed through `runAdminListTransaction`; inline `requirePermission` (no subtree layout); no-leak-by-construction select; `scope` named-view (default Pending promotion). Giddy 9.2 · Doug GO 9.4 · Desi PASS-with-fix. **Two live-smoke-only defects fixed** (scope shallow-refetch + a stale redirect that made the index 100% unreachable). Gates green; live 15/15 + 6/6. |
| SESSION_0530_TASK_02 | landed | WL-P2-52 authoring-UX polish (`8e87a047`): feature-toggle jargon strip, authored slug auto-derive+hide, sheet double-heading, watch-page breadcrumbs (4 items) + the empty-slug silent-dead-end regression the slug-hide introduced, fixed in `11e9d25d` (visible Name-field refine). Rail-copy collision + dual-affordance + P3s deferred to a later WL-P2-52 pass. |

## What landed

**FI-027 — the Techniques AdminCollection — plus a WL-P2-52 authoring-UX polish cut, built by Cody,
verified by a Giddy + Doug + Desi wave, held then pushed on the operator's go. 4 commits on
`session-0530-fi027`.**

1. **FI-027 (`d62c3dfb`):** `/app/techniques` as a conformed `AdminCollection` (ADR 0045) — a SIBLING of
   `/app/tools`, not a mount underneath. Three-file shape (`page.tsx` + `_components/techniques-table.tsx`
   + `techniques-table-columns.tsx`) + `server/admin/techniques/{queries,schema}.ts` routed through
   `runAdminListTransaction`/`clampListPageParams`. Columns: name (row→`[id]`) · author (Passport) ·
   school (org) · featured · published · premium-mix (free/premium clip counts). A `scope` named-view
   control (default **Pending promotion** = authored ∧ published ∧ ¬featured) surfaced via the frame's
   `children` render-prop. Gated INLINE with `requirePermission(techniques.manage)` (no subtree layout —
   the author-accessible `[id]`/`new` stay open). Nav item gated to match. **No-leak by construction:** the
   list select reads `mediaAttachments.isPremium` only — never a URL — so the row type can't carry a
   premium locator. Completes the ADR-0046 promote loop (3C shipped the toggle; FI-027 is the discovery
   list).
2. **WL-P2-52 polish (`8e87a047`):** feature-toggle jargon strip ("Feature in the public library"),
   authored-mode slug auto-derive + hidden field, sheet double-heading removed, profile-scoped watch-page
   breadcrumbs/attribution.
3. **Review-pass (`2f833dbf`):** scope control made non-shallow (`{ shallow: false }`) so scope switches
   re-query; **un-shadowed the index** — a stale `config/app-redirects.ts` rule bounced `/app/techniques`
   → the profile tab BEFORE the guard, making the whole surface 100% unreachable. Both were invisible to
   green gates; the mandatory first live smoke caught them.
4. **Review-wave batch (`11e9d25d`):** empty-slug silent dead-end fixed (visible Name-field refine —
   a non-Latin name derived `slug=""`, failed the now-hidden field, and submitted silently); scope
   page-reset (`page:1` on scope change); `DataSelect` a11y (forward `aria-label`/`aria-labelledby` to the
   trigger — the shared primitive dropped it on the Base UI Root); not-featured glyph parity; legacy
   `/dashboard/techniques` bookmark repointed to the member tab; extracted a pure `scope.ts` + `scope.test.ts`.

## Decisions resolved

- **The AdminCollection LAW is a PATTERN, applied as a sibling route (ADR 0045, SESSION_0529 grill Q1).**
  FI-027 is the first sibling-collection-at-its-own-route in prod — `/app/techniques` is the same frame as
  `/app/tools`/`/app/claims` with different columns+query, not a mount underneath. No ADR amendment needed.
- **"Pending promotion" chip = a `scope` named-view**, not a column facet (a computed multi-condition queue
  can't decompose into facets). Petey call, wave-ratified.
- **premium-mix = clip counts from `isPremium` only** (no URL selected). Petey call, no-leak-preserving.
- **Empty-slug is surfaced, not silently swallowed; enabling non-Latin authored names (server fallback
  slug) is deferred** — a product call about auto-generated slugs, ledgered (WL-P2-53), not built here.
- **Push authorized by the operator ("Go", 2026-07-12).**

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/app/techniques/page.tsx` | NEW — server index; inline `requirePermission(techniques.manage)`; parse → promise → Suspense |
| `apps/web/app/app/techniques/_components/techniques-table.tsx` | NEW — `AdminCollection` + `scope` `DataSelect` (non-shallow, page-reset) + name facet |
| `apps/web/app/app/techniques/_components/techniques-table-columns.tsx` | NEW — 6 columns; not-featured = bare `Note` glyph |
| `apps/web/server/admin/techniques/queries.ts` | NEW — `findTechniquesForAdmin` (no-leak select, `GetPayload` row) via `runAdminListTransaction` |
| `apps/web/server/admin/techniques/schema.ts` | NEW — nuqs params + `scope` enum (default `pending-promotion`) |
| `apps/web/server/admin/techniques/scope.ts` + `scope.test.ts` | NEW — pure `techniqueScopeWhere` + `resolveTechniqueOrderBy` + 8 unit tests |
| `apps/web/config/admin-sections.ts` + `.test.ts` | Techniques nav item gated to `techniques.manage` |
| `apps/web/config/app-redirects.ts` + `.test.ts` | un-shadow the index (drop the tab-redirect) + repoint the legacy `/dashboard/techniques` bookmark |
| `apps/web/components/common/data-select.tsx` + `.test.tsx` | forward `aria-label`/`aria-labelledby` to the trigger (systemic a11y) |
| `apps/web/app/(web)/dashboard/technique-form.tsx` | WL-P2-52 — authored slug auto-derive+hide, sheet single-heading, empty-slug Name refine |
| `apps/web/app/app/techniques/[id]/technique-feature-toggle.tsx` | WL-P2-52 — strip internal jargon from the promote copy |
| `apps/web/app/(web)/directory/[slug]/techniques/[techniqueSlug]/page.tsx` | WL-P2-52 — breadcrumbs/back-to-profile attribution |
| `apps/web/e2e/admin/admin-collection-conformance.spec.ts` | add `/app/techniques` to the conformance smoke loop |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | PASS (Cody + Petey independent at HEAD) |
| `bun run lint:check` · `format:check` (repo-wide — files ADDED) | PASS |
| `bun run test` (`--parallel=1`) | **1375/1375** at HEAD (+9 tests, +1 file; 0 new failures; the ~14 pre-existing Resend/shared-DB hook-timeout flakes did not trigger this run) |
| `bun run build` | PASS ×5 (prod-deploy gate green) |
| Live smoke #1 (isolated Playwright, admin + non-staff, seeded fixtures) | **15/15** — index reachable, default Pending-promotion view, scope re-fetch, name search, header sort, row→editor, non-staff→/app redirect, premium-mix, author/school |
| Live smoke #2 (delta) | **6/6** — scope page-reset (deep page → page 1), empty-slug Name-field error (巴投 → visible message, no silent no-op) |
| No-leak re-probe (Doug, static + runtime) | `premiumLeak=false`; row type carries no `url`/`thumbnailUrl` (compile-enforced); anon route 307→login |
| Guard/route (Doug, runtime) | non-staff `/app/techniques` → /app; `[id]`/`new` byte-unchanged + still author-accessible; `/app/events` tab-redirect intact |
| Fixtures | all reverted; shared DB restored to bblTotal=93, 0 orphans |

## Open decisions / blockers

- **PUSHED** — branch `session-0530-fi027` (4 code commits + this close commit) on the operator's "Go".
  An apps/web push fires CI + the BBL prod deploy (local build green ×5).
- FI-001 (Brian Truelson) — STAYS PARKED (operator directive). Gate-runner flagged it as a cross-off
  candidate; DISMISSED (parked ≠ resolved). No send, no grant.
- **WL-P2-53** (new) — i18n server-side fallback slug so non-Latin authored technique names can actually be
  authored (this session only killed the silent-ness; a product call on auto-generated slugs remains).
- WL-P2-52 — partially landed (5 items); rail-copy collision + dual-create affordance + P3s still open.

## Next session

### Goal

**FI-028 — the community-posts freemium slice** (SESSION_0529 grill Q2+Q3, operator-ratified): read =
everyone with premium posts visible-but-locked (the technique-video no-leak pattern); **create = Premium ∨
Elite ∨ RBAC ∨ staff/admin** via `canCreateCommunityPostForUser` (mirror `canCreateTechniqueForUser`, no
5th authz) — free members LOSE post-creation (the deliberate participation ladder). Needs its OWN grill at
build (locked-post display: teaser vs full-hide; who sets per-post premium; grandfathering existing free
posts).

### First task

Read FI-028 in `POST_LAUNCH_SOT.md` + the technique freemium/no-leak pattern (`server/web/techniques/technique-media-gate.ts`, memory `profile-media-freemium-model-0525`) + `canCreateTechniqueForUser` (the gate
to mirror). Grill the three open forks FIRST (locked-post display, per-post premium setter, grandfathering),
then build `canCreateCommunityPostForUser` + the read-layer lock + the composer upgrade-CTA + the MAB
member "post" action. **Alternatives if the operator redirects:** the WL-P2-49 + D-043 shared-seams cleanup
lane, or WL-P2-53 (i18n fallback slug). Board top (`FI-001` parked/operator-gated, `G-002`, `FI-006`)
unchanged.

## Review log

### SESSION_0530_REVIEW_01 — Giddy architecture / ADR / Git-strategy (all 4 commits)

- **Reviewed tasks:** SESSION_0530_TASK_01, TASK_02.
- **Verdict:** **9.2/10, no cap** — "textbook ADR-0045 D1 application": same frame + different columns+query,
  through `runAdminListTransaction`, no bespoke pager/frame/toolbar. `GetPayload` row = correct break for the
  single-query TS2456 cycle; inline guard (not a layout) is the right call; `scope` named-view rides the
  frame's `children` prop; redirect unshadow architecturally correct. No 5th authz, no ADR conflict, clean
  3-commit split, WL-P2-52 droppable.
- **Fix-now:** scope page-reset (batched into `11e9d25d`). **Ledger P3s:** legacy `/dashboard/techniques`
  repoint (done), `createdAt`-in-select (KEPT — Petey verified it's load-bearing for the sort-parser row-key
  type; Giddy's "drop it" would break typecheck).
- **ADR:** no amendment; optional "shipped SESSION_0530" breadcrumb on the admin-collection memory (done).

### SESSION_0530_REVIEW_02 — Doug release-readiness / QA (all 4 commits)

- **Reviewed tasks:** SESSION_0530_TASK_01, TASK_02.
- **Verdict:** **GO, 9.4/10, no cap, no P1s.** No-leak airtight (row type carries no locator — a future
  careless reuse is a compile error); inline guard runtime-proven (307→login; `?page=-1`/`?scope=GARBAGE`
  no crash); author routes byte-unchanged; redirect surgery correct (`/app/events` intact). Gates
  independently green.
- **P2 (batched-fixed `11e9d25d`):** empty-slug silent dead-end on non-Latin names (empirically 巴投/армбар/गार्ड
  → `slug=""` → hidden-field validation swallowed). **P3s:** scope page-reset (fixed), legacy redirect (fixed).

### SESSION_0530_REVIEW_03 — Desi UX / design-consistency (in the wave; UI lane)

- **Reviewed tasks:** SESSION_0530_TASK_01, TASK_02.
- **Verdict:** **PASS-with-fix**, **design-system PASS** (all L1 primitives, zero hard-coded colors, token
  hygiene clean). Reads as a true sibling of claims/tools. All four WL-P2-52 fixes confirmed genuinely
  landed (not just touched).
- **P2 (batched-fixed):** empty-slug dead-end (same as Doug); `DataSelect` aria-label dropped on the Base UI
  Root → forwarded to the trigger. **P3 (fixed):** not-featured glyph parity. **Deferred (still tracked in
  WL-P2-52):** rail-copy collision, dual-create affordances, the P3 set.

## Hostile close review

- **Giddy (architecture):** PASS — 9.2, no cap. Textbook ADR-0045; seams clean; unshadow correct; git split
  coherent.
- **Doug (QA/release):** PASS — **GO 9.4**, no P1s. No-leak compile-enforced; guard + route runtime-proven;
  fixtures 0-orphan.
- **Desi (UX):** PASS-with-fix — design-system PASS; the two P2s (empty-slug, DataSelect a11y) fixed same
  session.
- **Kaizen aggregate: 9.3 — land + push on the operator's go.** The protocol (not any one model) held: three
  independent reviewers converged on the empty-slug regression, and the **mandatory first live smoke** caught
  two showstoppers (scope shallow-refetch + the unreachable-index redirect) that every gate reported green —
  the exact SESSION_0529 "gates pass, flow broken" class, this time caught *before* the wave.

### Findings (severity ≥ medium)

All medium+ findings were fixed in-session (`11e9d25d`); none remain open. Deferred items are P3/enhancement
and ledgered (WL-P2-52 remainder, WL-P2-53).

## ADR / ubiquitous-language check

- **ADR update: not required.** FI-027 implements ADR 0045 (AdminCollection law) + ADR 0046 (authored
  promote loop) as ratified. It is the first *sibling-collection-at-own-route* application — the wording was
  already amended into ADR 0045's D1 + the `admin-collection-one-surface-law` memory at SESSION_0529; a
  "shipped SESSION_0530" breadcrumb was added to the memory.
- **Ubiquitous language: not required.** No new domain terms — "scope / Pending promotion / premium-mix" are
  UI-surface labels over the existing authored/featured/published model.

## Reflections

- **The mandatory live smoke is the load-bearing gate, not the CI gates.** FI-027 passed typecheck, lint,
  format, 1366 tests, and a prod build while being **100% unreachable** — a stale `app-redirects` rule
  bounced the route before the guard ran. And the flagship scope control silently didn't re-query
  (shallow update). Both were the SESSION_0529 "gates green, flow 404s" class; both were invisible to every
  deterministic gate and only fell out of driving the real surface in a browser. Requiring the live smoke
  *before* the review wave meant the reviewers scored working code, not a dead feature.
- **Our own polish introduced the dead-end we'd just learned to fear.** WL-P2-52's "auto-derive + hide the
  slug field" was a clean UX win for Latin names — and it silently swallowed submit for any non-Latin name,
  because the FormMessage was bound to the now-hidden field. Same silent-dead-end *class* as the SESSION_0529
  P1, shipped by the very reviewer (Desi) whose finding it was. Lesson for the ledger: **hiding an
  auto-derived form field relocates its validation into the void — surface the error on a visible field.**
- **Verify the reviewer, not just the code.** Giddy flagged `createdAt: true` as "dead payload, drop it." It
  is load-bearing: the sort parser is generic over the row type and the default sort is `createdAt`, so
  dropping it from the select removes it from the row type and breaks typecheck. A 30-second trace beat
  acting on a confident, wrong suggestion — the same discipline the recalled-memory rule asks for.
- **The gate-runner still misreads a committed-code session as docs-only** (SESSION_0529's open runner bug):
  with all app code committed and only the SESSION file dirty, it printed "build skipped / hostile review
  n/a / docs-only." Every deterministic cell needed a judgment override. The fix is still the same one 0529
  reflected on — diff `origin/main..HEAD`, not the dirty tree.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | 5 docs touched (POST_LAUNCH_SOT, wiring-ledger, wiki/index, SESSION_0530, admin-collection memory) — `updated: 2026-07-12` + `last_agent: claude-session-0530` bumped where frontmatter carries them |
| Backlinks/index sweep | wiki/index: SESSION_0530 row added (newest-first); no new cross-doc `pairs_with` needed (ledger rows self-reference sessions) |
| Wiki lint | `bun run wiki:lint`: **0 errors / 52 warnings** — identical to the gate-runner baseline (all pre-existing, none introduced) |
| Kaizen reflection | yes — 4 reflections (live-smoke > CI gates, self-inflicted dead-end, verify-the-reviewer, gate-runner misread) |
| Hostile close review | REVIEW_01 (Giddy 9.2) + REVIEW_02 (Doug GO 9.4) + REVIEW_03 (Desi PASS-with-fix); Kaizen 9.3 |
| Code-quality gate (Class-A) | Covered by the wave: Giddy 9.2 architecture + Doug 9.4 release on the full diff (a conformed AdminCollection + a shared-primitive a11y fix; no separate `/code-quality` run — three scored reviews stand in) |
| Runtime verification (Doug) | 15/15 + 6/6 live smokes (admin + non-staff) + no-leak runtime probe + guard/route runtime proof; fixtures 0-orphan (bblTotal=93) |
| Review & Recommend | yes — Next session = FI-028 community-posts freemium (grill-ratified Q2+Q3); alternatives WL-P2-49/D-043 + WL-P2-53 noted; board-top unchanged |
| Memory sweep | `admin-collection-one-surface-law` (FI-027 shipped 0530) + `technique-authoring-ownership-adr-0046` (FI-027 promote-discovery + slug-hide gotcha + WL-P2-53) updated; MEMORY.md hooks refreshed |
| Next session unblock check | UNBLOCKED — FI-028 is operator-ratified but needs its OWN grill (3 forks) at build; no operator input needed to START the grill |
| Git hygiene | branch `session-0530-fi027`; worktree `../ronin-0530` (kept until merged); single close commit — hash reported at bow-out / see git log; pushed on the operator's "Go"; FI-001 cross-off candidate DISMISSED (parked) |
| Graphify update | nodes=13115 · edges=29322 · communities=1454 (gate-runner, pre-commit per FS-0025) |
| Fallow delta | introduced findings: 0 (gate-runner Gate 11) |
| Deferral guard | run at close — every deferral (WL-P2-52 remainder, WL-P2-53, FI-001 parked) backed by a real ledger id |
| Board cross-off | FI-027 → `board-mark-done.ts FI:FI-027` (moved to done); FI-001 NOT crossed (parked) |
