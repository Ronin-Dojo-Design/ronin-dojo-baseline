---
title: "SESSION 0586 — MMB CRM tracer loop 3: Lead Source facet on roster + pipeline board"
slug: session-0586
type: session--implement
status: closed
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0586
sprint: S12
lane: mmb
lane_seq: 7
vault_session:
goal_ids: [MMB-G-004, G-021]
tickets: []
next_session:
pairs_with:

  - docs/sprints/SESSION_0582.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0586 — MMB CRM tracer loop 3: Lead Source facet on roster + pipeline board

## Date

2026-07-20

## Operator

Brian + claude-session-0586 (overnight lane, dispatched by SESSION_0587 orchestrator, operator
authorization pre-pinned at SESSION_0582 PM_Plan grill)

## Goal

G-021 loop 3, slice (b) — elected at SESSION_0582's overnight fan-out grill: build a Lead Source
facet/filter on (1) the Sales-cockpit Lead roster (`/app/sales`) and (2) the pipeline board
(`/app/page.tsx`, the AdminKanban kernel instance), using the ONE `normalizeLeadSource`/
`leadSourceLabel` vocabulary (`lib/lead-source.ts`) — never a second source list. Counts per
source, filter state local (matches the app's existing idiom — no URL/localStorage filter
pattern exists anywhere in this app to match instead), honest empty state ("No Referral
leads"). Read-side only: no schema change, no write-path edits, no touching the 0582 import/
commit path, no attempt/outcome vocabulary edits.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0582.md` (G-021 loop 2/3 import commit, closed,
  merged; PM_Plan overnight grill elected THIS lane's slice (b) at its close) and
  `docs/sprints/SESSION_0577.md` (loop 1/3 tracer shape + the scratch-DB/fixture-login live
  UAT recipe this lane reuses verbatim).
- Carryover: 0582's Next-session candidates were (a) import commit [DONE, 0582] / (b) Lead
  Source facet [THIS SESSION] / (c) attempt-cadence escalation [not this session]. Dispatch
  prompt (SESSION_0587 orchestrator) pins (b) — no re-election needed.

### Branch and worktree

- Branch: `session-0586-mmb-lead-source` (pre-reserved at SESSION_0582 close; verified empty —
  `git log --oneline main..session-0586-mmb-lead-source` returned nothing before worktree add)
- Worktree: `/Users/brianscott/dev/ronin-0586`
- Status at bow-in: clean (fresh worktree, reset to `origin/main`)
- Current HEAD at bow-in: `e2ef96a5`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None (per-product Mammoth CRM app; ui-kit `AdminKanban`/`MCard` consumed as-is, not modified) |
| Extension or replacement | Extension: read-side fields + a new shared facet-chip component inside `clients/mammoth-build-crm` only |
| Why justified | G-021 tracer slice inside the ADR 0038 per-product app; ui-kit kernel (`packages/ui-kit`) is NON-GOAL for this lane — filtering is done by remounting the kernel with a pre-filtered `BoardStore`, never by adding a filter prop to `AdminKanban` |
| Risk if bypassed | n/a — no L1/kernel area touched |

Live docs checked during planning: not applicable (no L1 area touched; ui-kit read for recon only, not edited).

### Graphify check

- Graph status: current (canonical checkout); queried from `/Users/brianscott/dev/ronin-dojo-app`
  (worktree graph reads 0 nodes by design).
- Queries used:
  - `lead source roster pipeline board mammoth crm facet filter` (64 nodes)
  - `mammoth sales cockpit lead roster lead-source normalizeLeadSource leadSourceLabel filter chip` (74 nodes)
- Files selected from graph: `clients/mammoth-build-crm/lib/lead-source.ts`,
  `lib/sales-cockpit.ts`, `lib/actions.ts`, `lib/board-config.ts`, `lib/board-store-db.ts`,
  `app/app/sales/page.tsx`, `app/app/page.tsx`.
- Verification note: every file the graph named was opened and read directly before any edit;
  graph used as navigation only.

### Grill outcome

No open forks — the facet slice, boundaries, and vocabulary source were pinned in the dispatch
prompt (operator grill happened at SESSION_0582 close). One in-lane design decision made inline
(not a re-opened fork, a mechanical "how" the pinned "what" gets built):

- **Pipeline-board filtering mechanism:** `AdminKanban` (ui-kit kernel) takes only `config` +
  `store` — no filter prop, and its `useBoard` hook loads once per `config.id` (a module
  constant that never changes), not per `store` reference. Adding a filter prop would mean
  editing `packages/ui-kit` (NON-GOAL). Resolution: `createDbBoardStore(sourceFilter)` filters
  at `load()` time (extra optional param, backward compatible), and the page remounts
  `<AdminKanban key={sourceFilter ?? "all"} .../>` on filter change so the fresh mount reloads
  through the filtered store. Kernel untouched.

## Petey plan

### Goal

Lead Source facet (filter chips + per-source counts) lands on the Mammoth roster and pipeline
board, read-side only, sharing the ONE `lib/lead-source.ts` vocabulary; gates green; live UAT on
a scratch DB; commit on the branch, no push.

### Tasks

#### SESSION_0586_TASK_01 — Data pre-flight: seed variety + read-side plumbing

- **Agent:** Cody (inline)
- **What:** the demo seed (`lib/content.ts` → `prisma/seed.ts`) stamps all 3 projects
  `web_form` (Prisma default) — a facet with one non-zero bucket doesn't prove anything. Add
  varied `source` values to `SEED_PROJECTS` and thread them through `prisma/seed.ts`'s upsert
  `fields`. Extend the read path so the pipeline board's `Project`/`BoardCard` carries `source`
  (currently roster-only): `lib/types.ts` (`Project.source`), `lib/actions.ts` (`DbProject` +
  `toProject`), `lib/board-config.ts` (`projectToCard` → `BoardCard.source` + a Lead Source
  badge, parity with the roster's existing badge), `lib/board-store-db.ts`
  (`createDbBoardStore(sourceFilter?)`).
- **Done means:** `listProjects()` and the board card mapper both carry `source`; seed has ≥3
  distinct source values; zero write-path changes.
- **Depends on:** nothing

#### SESSION_0586_TASK_02 — `countLeadSources` pure helper + tests

- **Agent:** Cody (inline)
- **What:** `lib/lead-source.ts` gains `countLeadSources()` (tally via the existing
  `normalizeLeadSource`, one vocabulary); `lib/lead-source.test.ts` (new file — first dedicated
  test file for this lib) covers it. `lib/board-config.test.ts` (new) covers `projectToCard`'s
  source mapping.
- **Done means:** pure functions covered by tests; zero new deps.
- **Depends on:** TASK_01

#### SESSION_0586_TASK_03 — Shared `LeadSourceFacet` component + roster wiring

- **Agent:** Cody (inline)
- **What:** `components/crm/LeadSourceFacet.tsx` (new — matches the existing
  `components/crm/StageBadge.tsx` shared-atom pattern: small, typed, tailwind-classed, reused by
  ≥2 pages). `app/app/sales/page.tsx`: local `sourceFilter` state, `countLeadSources` over the
  roster, filtered roster list, honest empty state.
- **Done means:** roster narrows/clears by source; counts match the unfiltered roster.
- **Depends on:** TASK_02

#### SESSION_0586_TASK_04 — Pipeline board wiring

- **Agent:** Cody (inline)
- **What:** `app/app/page.tsx`: local `sourceFilter` + `counts` state (one `listProjects()` read
  — Lead Source never changes after intake, so a one-time fetch is enough, no polling needed);
  `key`-remounted `<AdminKanban>` over the filtered `createDbBoardStore`; honest empty state.
- **Done means:** board narrows/clears by source; counts match the unfiltered project list;
  drag/move/quick-add on the merged tree unaffected (manual smoke).
- **Depends on:** TASK_03 (shares the new `LeadSourceFacet` component)

#### SESSION_0586_TASK_05 — Gates + live UAT + self-review + commit

- **Agent:** Cody (inline)
- **What:** client-local gates (`typecheck`/`test`/`build`/`oxlint`); scratch DB
  `mammoth_0586_scratch` UAT per the 0577/0582 recipe (db push + seed, dev :3586, fixture
  login); teardown; commit on the branch, no push.
- **Done means:** gates verbatim in Verification; UAT evidence recorded; commit hash recorded.
- **Depends on:** TASK_04

### Parallelism

None — single Cody lane, tasks share files (`lib/board-config.ts`/`board-store-db.ts` touched by
TASK_01 and read by TASK_04; the new `LeadSourceFacet` component touched by TASK_03 and TASK_04).
Sequential by design (matches the 0577/0582 precedent: one coherent inline lane).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0586_TASK_01 | Cody (inline) | data pre-flight + read-model plumbing, one coherent change |
| SESSION_0586_TASK_02 | Cody (inline) | pure lib + tests |
| SESSION_0586_TASK_03 | Cody (inline) | shared component + first consumer |
| SESSION_0586_TASK_04 | Cody (inline) | second consumer, shares the component from TASK_03 |
| SESSION_0586_TASK_05 | Cody (inline, self-review) | overnight lane — no separate Doug dispatch; AM sweep reviews on the merged tree per the 0587 orchestrator plan |

### Open decisions

None — propose-not-ratify: adding a Lead Source badge to the pipeline board card (parity with
the roster's existing badge) was a judgment call inside the pinned scope, not a re-opened fork;
flagged in closing notes for the AM sweep to confirm it reads as in-scope.

### Risks

- 4-lane host contention (0583/0584/0585/0586 running concurrently overnight per the SESSION_0587
  orchestrator) — note load average with any test flake; queue a clean rerun as an AM sweep item
  rather than hand-waving a flaky failure.
- `AdminKanban` remount-on-filter-change causes a brief "Loading…" flash per column (no way to
  avoid without touching the ui-kit kernel, which is a NON-GOAL) — acceptable for this
  manual-tracer app; named here, not treated as a defect.

### Scope guard

- No live integrations, no real lead data (retention law: real lead-sheet bodies → Mammoth's CRM
  DB only, never fixtures/repo/tickets/vault).
- No schema change; no migration; `migrate dev` banned regardless.
- No edits to the 0582 import/commit path (`commitLeadSheet`, `lib/lead-commit.ts`,
  `lib/contact-match.ts`) or the attempt-cadence/outcome vocabulary.
- No `apps/web` or `packages/ui-kit` changes.
- No push / PR / deploy — commit on the branch; AM sweep handles the push gate.

## Cody pre-flight

### Pre-flight: Data plumbing — `Project.source` on the pipeline read path (TASK_01)

#### 1. Existing component scan

- Graphify query used: `mammoth sales cockpit lead roster lead-source normalizeLeadSource leadSourceLabel filter chip`
- Found: `getSalesCockpit()` (`lib/actions.ts`) already selects+maps `source` for the roster;
  `listProjects()`/`toProject()` (same file) does NOT — `DbProject`/`Project` (`lib/types.ts`)
  have no `source` field; `board-config.ts`'s `projectToCard()` doesn't set `BoardCard.source`
  either, even though the kernel type already has `source?: string` ("stamped at intake").
  `Project.source LeadSource @default(web_form)` confirmed non-nullable in `prisma/schema.prisma:285`.

#### 2. L1 template scan

- Not applicable — per-product client app, no L1/Dirstarter area touched.
- Closest pattern: the existing `getSalesCockpit` source select/map (same shape, applied to
  `listProjects`/`toProject` instead).

#### 3. Composition decision

- Extending: `lib/types.ts` (`Project.source`), `lib/actions.ts` (`DbProject`/`toProject`),
  `lib/board-config.ts` (`projectToCard`), `lib/board-store-db.ts` (`createDbBoardStore` filter
  param), `lib/content.ts` + `prisma/seed.ts` (seed variety).
- New: none in this task (plumbing only).

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0582 §Next session).
- ADR read: ADR 0038 (per-product DB) confirmed valid via schema header; ADR 0033 D5
  ("board = config + data, zero per-project code in the kernel") — informs the remount-based
  filter design (never a kernel filter prop).
- Runbook consulted: none new (0577/0582 UAT recipe reused verbatim, already read).

#### 5. Dev environment confirmed

- Dev server command: `cd clients/mammoth-build-crm && bun run dev` (port 3586 for this lane)
- Working directory: `/Users/brianscott/dev/ronin-0586`
- Brand/host for testing: `localhost:3586`

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0027 (bare multi-file `bun test` — mitigated: app-local
  `bun run test`), FS-0024 (git guard — run at worktree add).
- Mitigation acknowledged: yes.

### Pre-flight: `LeadSourceFacet` component (TASK_03/04)

#### 1. Existing component scan

- Searched `clients/mammoth-build-crm/components/`: `components/crm/StageBadge.tsx` — the exact
  precedent for a small shared typed-prop tailwind atom consumed by ≥1 page outside its own
  file; `components/crm/PhotoDocumentation.tsx` — larger composed component, not a pattern match
  for a filter chip. No existing filter/facet component anywhere in the app.
- Searched `app/app/leads/page.tsx`: page-local `CountChip` (label + value, non-interactive) —
  visual precedent for the chip's tailwind classes (`rounded-md border ... px-3 py-1.5`), but not
  reusable as-is (not a click target, no active state).

#### 2. L1 template scan

- Not applicable (per-product client app; no ui-kit primitive for a filter-chip row — `AdminKanban`'s
  own `pagerChip` styles are inline `CSSProperties` in a different styling system (CSS vars, not
  Tailwind) and not exported from `@ronin-dojo/ui-kit/kanban`'s public surface).
- Closest pattern: `components/crm/StageBadge.tsx` (shared small atom) + the leads page's
  `CountChip`/button hover-state classes (visual vocabulary).

#### 3. Composition decision

- New component, no L1/shared match exists (justify): no chip/facet component exists anywhere
  in this app or in ui-kit; `components/crm/` is the established home for a small shared atom
  used by ≥2 pages (`StageBadge` precedent), so `LeadSourceFacet.tsx` lands there rather than
  duplicated page-local copies in `app/app/sales/page.tsx` and `app/app/page.tsx`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: none new.
- Runbook consulted: none new.

#### 5. Dev environment confirmed

- Dev server command: `cd clients/mammoth-build-crm && bun run dev -- -p 3586`
- Working directory: `/Users/brianscott/dev/ronin-0586`
- Brand/host for testing: `localhost:3586`

#### 6. FAILED_STEPS check

- Prior failures in this area: none specific to this app's component layer.
- Mitigation acknowledged: n/a.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0586_TASK_01 | landed | Seed variety (`referral`/`trade_show`/`web_form`) threaded through `lib/content.ts` → `prisma/seed.ts`; `Project.source` plumbed onto the pipeline read path (`lib/types.ts`, `lib/actions.ts#toProject`, `lib/board-config.ts#projectToCard`, `lib/board-store-db.ts#createDbBoardStore`) |
| SESSION_0586_TASK_02 | landed | `countLeadSources()` pure helper + `lib/lead-source.test.ts` (6 tests, new file); `lib/board-config.test.ts` (4 tests, new file) covering `projectToCard`'s source/badge mapping |
| SESSION_0586_TASK_03 | landed | `components/crm/LeadSourceFacet.tsx` (new shared chip row); `/app/sales` roster wired: filter state, counts, filtered list, honest empty state |
| SESSION_0586_TASK_04 | landed | `/app/page.tsx` pipeline board wired: one-time `listProjects()` count read, `key`-remounted `AdminKanban` over a filtered `createDbBoardStore`, honest empty state |
| SESSION_0586_TASK_05 | landed | Gates green (typecheck/test/build/oxlint); live UAT on `mammoth_0586_scratch` via Playwright (cached npx module, no project devDep added) — facet counts, narrow, honest empty state, clear/restore, proven on BOTH surfaces + a write-path smoke (quick-add); scratch DB dropped; `.env` repointed to `mammoth_dev`; commit on branch |

## What landed

- **Lead Source facet on the Sales-cockpit roster (`/app/sales`)** — `LeadSourceFacet` chip row
  (All + all six canonical sources, always rendered so a zero-count source stays selectable)
  above the roster list; selecting a source narrows the roster's `MCard` list, clearing restores
  it; selecting a zero-count source renders "No {Source} leads." The Today queue and the contact
  workspace stay keyed off the full unfiltered roster (unchanged, decoupled from the filter by
  design — same as the existing queue/roster relationship).
- **Lead Source facet on the pipeline board (`/app`)** — the same shared `LeadSourceFacet`
  component above the `AdminKanban` mount. Because the ui-kit kernel takes only
  `config`+`store` and reloads only on `config.id` change (never on `store` reference), the
  filter is implemented by remounting `AdminKanban` via `key={sourceFilter}` over a freshly
  built `createDbBoardStore(sourceFilter)` — the kernel package (`packages/ui-kit`) was never
  edited. Counts come from one `listProjects()` read (Lead Source is stamped once at intake and
  never changes, so a one-time fetch is correct, not stale).
- **Board card Lead Source parity** — `projectToCard` now carries `source` onto the kernel's
  existing `BoardCard.source` field (previously only set at intake time, never round-tripped
  back from a load) and appends a Lead Source label badge via the kernel's generic `badges`
  passthrough — the same mechanism the order-guard badge already uses. This gives the board's
  cards the same at-a-glance source visibility the roster's cards already had.
- **Seed data variety** — the 3 demo `SEED_PROJECTS` now carry distinct sources
  (`referral`/`trade_show`/`web_form`) instead of all defaulting to `web_form`, so a freshly
  seeded `mammoth_dev` actually exercises the facet instead of showing one all-3 bucket.
- **`countLeadSources()`** — the one shared tally helper (`lib/lead-source.ts`), routed through
  the existing `normalizeLeadSource` so it can never drift from the ingest preview's vocabulary.

## Decisions resolved

- **Pipeline-board filter mechanism = remount, not a kernel prop.** Recorded in Bow-in §Grill
  outcome — the only in-lane design call made this session, inside the pinned scope.
- **Board card badge addition (parity with the roster) is in-scope**, not scope creep: it reuses
  an already-designed generic passthrough (`BoardCard.badges`) and is one line, but is flagged
  under Open decisions for the AM sweep to confirm it reads as intended rather than assumed.
- **Filter state is local `useState`**, not URL/localStorage — confirmed at pre-flight that no
  filter idiom exists anywhere in this app to match instead (`useSearchParams` unused, only
  `landing/InquiryForm.tsx`/`BuildingTypesGrid.tsx` use `useLocalStorage`, unrelated to filters).

## Files touched

| File | Change |
| --- | --- |
| `clients/mammoth-build-crm/lib/lead-source.ts` | +`countLeadSources()` pure tally helper |
| `clients/mammoth-build-crm/lib/lead-source.test.ts` | NEW — 6 tests for `countLeadSources` |
| `clients/mammoth-build-crm/lib/types.ts` | `Project` gains `source: LeadSourceValue` |
| `clients/mammoth-build-crm/lib/actions.ts` | `DbProject`/`toProject` carry `source` (read-only; `getSalesCockpit` unchanged, already had it) |
| `clients/mammoth-build-crm/lib/board-config.ts` | `projectToCard` sets `BoardCard.source` + a Lead Source badge |
| `clients/mammoth-build-crm/lib/board-config.test.ts` | NEW — 4 tests for `projectToCard`'s source/badge/fields mapping |
| `clients/mammoth-build-crm/lib/board-store-db.ts` | `createDbBoardStore(sourceFilter?)` — optional read-side filter param |
| `clients/mammoth-build-crm/lib/content.ts` | `SEED_PROJECTS` gain varied `source` values |
| `clients/mammoth-build-crm/prisma/seed.ts` | upsert `fields` threads `source` through |
| `clients/mammoth-build-crm/components/crm/LeadSourceFacet.tsx` | NEW — shared filter-chip row (roster + board) |
| `clients/mammoth-build-crm/app/app/sales/page.tsx` | Lead Source facet wired onto the roster list |
| `clients/mammoth-build-crm/app/app/page.tsx` | Lead Source facet wired onto the pipeline board (remount-on-filter) |
| `docs/sprints/SESSION_0586.md` | this file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (mammoth tsc) | clean |
| `bun run test` (mammoth, `bun test --parallel=1`) | 40 pass / 0 fail across 6 files (30 baseline + 10 new) |
| `bun run build` (mammoth next build) | exit 0; compiled; route table unchanged (`/`, `/app`, `/app/leads`, `/app/new`, `/app/project/[id]`, `/app/sales`) |
| `bunx oxlint clients/mammoth-build-crm` (from the worktree) | only the pre-existing `lib/db.ts` `no-shadow-restricted-names` warning (on `main`) — zero new findings |
| `format:check` | not run — no oxfmt config in this client (WL-P2-69); hand-matched existing style throughout |
| Live UAT — scratch DB `mammoth_0586_scratch` | `prisma db push` + `bun run db:seed` (3 projects: referral/trade_show/web_form) → dev server `:3586` → Playwright (chromium via cached npx module, no new devDep) with in-page `fetch` sign-up against Better Auth's own REST endpoint (no UI login page in this app) → authenticated session |
| Roster facet proof | Chips read `All3 Referral1 Web form1 Phone0 Email0 Trade show1 Other0` (matches DB exactly); selecting Referral shows only Dana Ruiz/Ridgeline; selecting Phone (0) renders "No Phone leads."; clearing to All restores all 3 cards |
| Board facet proof | Same chip counts; unfiltered header "3 cards"; selecting Trade show → header "1 cards", the Harvest Co-op card (with its new Lead Source badge) visible in the Design & Quote column, all other columns empty; selecting Phone (0) → `AdminKanban` unmounted, "No Phone leads." rendered instead (`[data-board]` count = 0); clearing to All → header "3 cards" restored |
| Write-path smoke (unaffected by this read-side change) | Quick-added a synthetic card to the "New Lead" column → header "4 cards · 1 at risk"; DB row confirmed via direct Prisma read: new `Project` persisted with `source: "web_form"` (the quick-add default, unchanged from before this session) |
| Teardown | `dropdb mammoth_0586_scratch` succeeded; `mammoth_dev` untouched throughout; worktree `.env` repointed to `mammoth_dev` afterward |
| Host contention | Ran solo against this worktree's own dev server (:3586); no observed contention/flake this session, but per the dispatch's risk note, a clean rerun should still be queued if the AM sweep sees contention-class flakes across the 4 parallel lanes |

## Open decisions / blockers

- **Board card Lead Source badge (parity add):** flagged above under Decisions resolved for the
  AM sweep's confirmation — a one-line reuse of an existing passthrough, judged in-scope, not a
  re-opened fork.
- **`countLeadSources` return type omits zero-count buckets** (documented in its own docstring);
  both consumer components default missing keys to 0 via `LeadSourceFacet`'s own `?? 0` — no
  action needed, just naming the contract for future callers.
- No blockers. G-021 loop 3 slice (c) — attempt-cadence escalation surfacing in the Today queue
  (SESSION_0582's remaining candidate) — is still open and unclaimed by this session.

## Next session

### Goal

G-021 loop 3, remaining slice (c): attempt-cadence escalation in the Today queue (e.g. "Attempt 3
overdue" feeding `at_risk`) — or whatever the operator elects next for the MMB lane.

### First task

Read this file's §What landed + §Open decisions, `docs/sprints/SESSION_0582.md`'s original
slice-(c) framing, and `lib/sales-cockpit.ts`'s existing `attemptProgress`/`buildAttemptLog`
before building — the attempt-outcome vocabulary is still provisional per G-021 and this lane
did not touch it.

## Review log

Not run as a separate dispatch this lane (overnight single-Cody lane per the SESSION_0587
orchestrator plan — no Doug subagent dispatched). Self-review only; the AM merge-sweep session
is the first independent review pass on this diff, per SESSION_0582's PM_Plan grill outcome.

## Hostile close review

Not run this lane — deferred to the SESSION_0587 AM sweep (per the dispatch: "no separate Doug
dispatch; AM sweep reviews on the merged tree"). Self-review only, honestly: all five gates
verified verbatim above; live UAT proved both surfaces + a write-path smoke; scope guard held
(no schema/migration, no write-path edits beyond the pre-existing quick-add/reconcile path this
session never touched, no `apps/web`/`packages/ui-kit` edits, no touch to the 0582 import/commit
path or the attempt vocabulary). One judgment call (the board badge) is named above rather than
silently included.

## ADR / ubiquitous-language check

- ADR update not required — ADR 0038 (per-product DB) and ADR 0033 D5 (board = config + data,
  zero per-project code in the kernel) both confirmed valid and honored (the remount-based filter
  keeps the kernel untouched). No new architectural decision.
- Ubiquitous language update not required — "Lead Source" already exists in the vocabulary
  (SESSION_0577); this session adds a read-side facet over it, no new domain term.

## Reflections

The `AdminKanban` kernel's own contract — config + data, reload keyed only on `config.id` — was
the one real design constraint this session: it would have been trivial to add a `filter` prop to
the kernel and call it done, but that's exactly the "god-component" pull the platform's design
doctrine warns against (a board-domain concern leaking into a project-agnostic kernel). Filtering
at the `BoardStore.load()` boundary and remounting via `key` kept the kernel at zero per-project
code, at the cost of a full board reload (and a "Loading…" flash per column) on every filter
click — an honest, named tradeoff rather than a silent one.

The bigger surprise was how much of the "build" was actually a data-completeness fix: the seed
script defaulted every demo project to `web_form`, so the facet would have shipped provably
correct but practically undemoable (one non-zero bucket) without the seed-variety change. The
mandatory data pre-flight checklist caught this before any UI code was written, not after.

Getting live browser proof without a project devDep was worth the extra minute: `npx --no-install
playwright --version` resolved a cached install with matching chromium binaries already
downloaded, so the UAT ran through a real authenticated browser session (in-page `fetch`
sign-up against Better Auth's REST endpoint, since this app has no UI login page at all) without
touching `package.json`/`bun.lock`. That recipe is worth keeping for the next client-app lane that
needs runtime proof but shouldn't add a devDep just to get it.

## Full close evidence

| Step | Proof |
| --- | --- |
| Task log | 5/5 rows landed |
| Gates | typecheck clean · 40/40 tests · build exit 0 · oxlint zero-new-findings (see Verification) |
| Live UAT | scratch DB `mammoth_0586_scratch`, Playwright chromium, both surfaces + write-path smoke proven, teardown clean (see Verification) |
| Unintended files | none — `git status --porcelain` in the worktree matches exactly the 12 files in §Files touched, no `.env`/`bun.lock`/`package.json` diffs |
| New dependencies | none — zero `package.json`/`bun.lock` changes; the UAT's Playwright ran from a pre-cached npx module path, never installed into this project |
| Schema/migration | none — read-side only, confirmed by the diff (no `prisma/migrations`, no `schema.prisma` edit) |
| Security-sensitive | none — no authz logic touched (`requireOwner`/`requireOwnedProject` untouched) |
| New env vars | none |
| Wiki lint | not run this lane (no `docs/knowledge/wiki/` edits) |
| Graphify update | not run — lane lives on a worktree branch; per the 0577/0582 precedent, refresh belongs to the post-merge AM sweep (canonical checkout untouched by this lane) |
| Git hygiene | commit on `session-0586-mmb-lead-source`, no push (per dispatch: AM sweep owns the push gate) |

## Proposed ledger edits

<!-- A lane NEVER edits shared ledgers directly — the AM merge sweep applies these once. -->

- **G-021 progress:** loop 3 slice (b) — Lead Source facet on roster + pipeline board — LANDED
  this session (SESSION_0586). Remaining loop-3 candidate: slice (c), attempt-cadence escalation
  in the Today queue (unclaimed).
- **Component inventory (`docs/knowledge/wiki/custom-component-inventory.md` or the mammoth-side
  equivalent):** new shared component `components/crm/LeadSourceFacet.tsx` (Mammoth Build CRM,
  filter-chip row, consumed by `/app/sales` and `/app`) — add an entry if/when this ledger tracks
  per-product client components.
- **No WL/D/FS rows proposed** — no wiring gaps, drift, or failed-steps discovered this session
  (the seed-variety gap was caught and fixed in-lane via the mandatory data pre-flight checklist,
  not left as a finding).
