---
title: "SESSION 0458 — Loop-of-Loops P3: shared ledger-backed AdminKanban (Phase A read projection)"
slug: session-0458
type: session--open
status: in-progress
created: 2026-06-27
updated: 2026-06-27
last_agent: claude-session-0458
sprint: S46
pairs_with:

  - docs/sprints/SESSION_0457.md
  - docs/protocols/loop-of-loops-ledger-driven-sessions.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0458 — Loop-of-Loops P3: shared ledger-backed AdminKanban

## Date

2026-06-27

## Operator

Brian + claude-session-0458

## Goal

Execute the SESSION_0457 next-session **LEAD (N0)**: give Brian + **Tony Hua** near-realtime *shared*
visibility into ledger/session status — the Loop-of-Loops **P3** target. Today's board
(`apps/web/app/admin/task-board/`) is localStorage-only / per-browser. Build, **phased**, a shared
ledger-backed board surfaced under `/app`, reusing the existing `packages/ui-kit/src/kanban/*`
kernel (NOT a new renderer). **Phase A (this session):** a realtime read projection that fetches the
9 governance ledgers from the **public `main`** branch (`raw.githubusercontent.com`) per request,
projects open items to read-only kernel cards on `AdminKanban` (new generic `readOnly` prop), grouped
on a workflow axis (Backlog · In Progress · Blocked · Done) with a backlog-health strip, admin-gated
at `/app/loop-board`. **Phase B (gated follow-on):** a generic `prismaBoardStore` + `KanbanCard`
model makes it editable AND collapses the Todoist `AdminTaskBoard` into the same board as one card
*source* (consolidation). N1/N2 (BBLApp ports) and the gated FI-001 real send follow.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0457.md`
- Carryover: 0457 landed Phase A of the operator-gated lineage lane (surgical removal of Brian
  Truelson's redundant clone memberships on PROD; FI-001 test-send re-confirmed and passed operator
  review). The real send to `btruelson@gmail.com` stays gated until N1/N2 land. This session executes
  the next-session LEAD (N0 shared AdminKanban).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `3e4d458f`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None — the kanban kernel (`@ronin-dojo/ui-kit/kanban`, PWCC-007) + m-card are fully custom Ronin components; no Dirstarter L1 analogue. Phase B will touch Prisma (KanbanCard). |
| Extension or replacement | N/A (Phase A); Phase B extends the existing custom kernel with a DB persistence adapter (the kernel spec's already-planned "Postgres P2"). |
| Why justified | The Loop-of-Loops board is operator-internal governance tooling; the kernel was purpose-built (config + data) for exactly this reuse. |
| Risk if bypassed | N/A |

Live docs checked during planning: not applicable.

### Graphify check

- Graph status: current; stats at bow-in: 15274 nodes, 30044 edges, 2060 communities, 2425 files tracked.
- Queries used:
  - `kanban board task-board AdminTaskBoard AdminTaskForge m-card pipeline` (surface inventory)
- Files selected from graph (confirmed by direct read):
  - `packages/ui-kit/src/kanban/{admin-kanban,use-board,types,board-store}.ts(x)`
  - `apps/web/lib/task-board/{use-task-board,migrate-forge,board-store}.ts`
  - `scripts/ledger-backlog.ts`; `docs/knowledge/wiki/files/{admin-kanban-board,bbl-admin-task-board}.md`
  - `clients/mammoth-build-crm/{app/app/page.tsx,lib/board-config.ts,lib/types.ts,lib/stages.ts}`
- Verification note: opened each directly + surveyed monorepo prior art (Explore) — Graphify used as navigation, not proof.

### Grill outcome

5 forks resolved (Petey grill, operator-gated):

- **a-vs-b → phased hybrid (operator).** Build the realtime read projection NOW, then layer a
  DB-backed editable overlay this same session. Repo is verifiably **PUBLIC** → realtime-from-`main`
  (raw.githubusercontent, 200 unauthenticated) is free + never stale, beating the deploy-time-fs
  approach (which `vercel.json`'s `ignoreCommand` would leave stale on docs-only ledger commits).
- **Fork 2 reuse → `readOnly` prop on the kernel `AdminKanban`** (generic, faithful to "reuse
  admin-kanban.tsx", benefits all consumers) + a generic `badges` passthrough on `BoardCard`.
- **Fork 3 column axis → workflow stages** (Backlog · In Progress · Blocked · Done), not ledger
  columns — an *editable* board needs a meaningful drag axis; ledger + priority ride as card badges;
  per-ledger counts go in a health strip.
- **Fork 4 surface/gate → `/app/loop-board`**, gated `loop-board.manage` (new `APP_AREA_PERMISSIONS`
  entry); `admin: ["*"]` covers Brian + Tony.
- **DB scope (Fork 5) → generic kernel store (option 1) that DELIVERS consolidation (option 3).** A
  generic `prismaBoardStore` + `KanbanCard(configId)` is the single persistence tier; in Phase B the
  Todoist `AdminTaskBoard` collapses in as a card *source* (not a column). `AdminTaskForge` is already
  absorbed — nothing left to port from the monorepo except a non-gimmicky "health strip" idea
  (TuffBuffs `SprintProgress`).

### Drift logged

- None new. (Holdover D-034 founders-on-canonical remains open from 0457.)

## Petey plan

### Goal

Ship Brian + Tony a shared, always-fresh ledger-status board at `/app/loop-board` this session
(Phase A read projection), with Phase B (editable DB overlay + AdminTaskBoard consolidation) staged
as the immediate gated follow-on.

### Tasks

#### SESSION_0458_TASK_01 — Extract a reusable ledger aggregator (parse from content, not fs)

- **Agent:** Cody
- **What:** Lift the per-ledger parsers out of `scripts/ledger-backlog.ts` into a self-contained
  `apps/web/lib/loop-board/ledger-parse.ts` (`Item`, `LEDGER_FILES`, `aggregateFromContents`); refactor
  the CLI to import it (one parser, DRY). Pure — no fs/network/aliases.
- **Steps:** extract → refactor CLI → `bun scripts/ledger-backlog.ts` still prints identical output.
- **Done means:** CLI output unchanged; the parser is importable by a Next server component.
- **Depends on:** nothing

#### SESSION_0458_TASK_02 — Kernel: generic `readOnly` prop + `badges` passthrough on AdminKanban

- **Agent:** Cody
- **What:** Add `readOnly?: boolean` to `AdminKanban` (suppress intake/quick-add/drag/move-menu) and a
  `badges?: MCardBadge[]` passthrough on `BoardCard` (merged in `cardToMData`). Both generic, default-off.
- **Done means:** Mammoth unaffected (defaults); `readOnly` board renders cards with no edit affordances.
- **Depends on:** nothing

#### SESSION_0458_TASK_03 — Realtime fetch-from-main + loop-board config/mapper + health

- **Agent:** Cody
- **What:** `lib/loop-board/fetch-ledgers.ts` (server: fetch 9 ledgers from public `main`, `revalidate`,
  graceful per-file failure) → aggregate; `lib/loop-board/board-config.ts` (`LOOP_BOARD` stages +
  `itemToBoardCard` mapper) ; `lib/loop-board/health.ts` (counts per ledger/priority).
- **Done means:** server fn returns projected `BoardCard[]` + health stats from live `main`.
- **Depends on:** SESSION_0458_TASK_01

#### SESSION_0458_TASK_04 — `/app/loop-board` surface (page + gate + nav)

- **Agent:** Cody → Doug
- **What:** `app/app/loop-board/{page.tsx,layout.tsx,_components/loop-board.tsx}`; add `loopBoard:
  "loop-board.manage"` to `APP_AREA_PERMISSIONS`; sidebar nav entry. Headless render-proof (admin sees board).
- **Done means:** an admin loads `/app/loop-board` and sees the shared, ledger-projected board.
- **Depends on:** SESSION_0458_TASK_02, SESSION_0458_TASK_03

#### SESSION_0458_TASK_05 — Phase B (GATED): generic prismaBoardStore + KanbanCard + consolidation

- **Agent:** Cody (operator gates the migration/push) → Doug
- **What:** generic `KanbanCard(configId)` model + migration + `prismaBoardStore` adapter + server-action
  persistence → editable board; add personal-task + manual card sources; collapse `AdminTaskBoard` in
  (one-time localStorage→DB import; `/admin/task-board` redirect; retire `lib/task-board` engine).
- **Done means:** two admins both move/add a card and see the same state; AdminTaskBoard consolidated.
- **Depends on:** SESSION_0458_TASK_04 — **operator checkpoint before starting.**

### Parallelism

TASK_01 + TASK_02 are disjoint (lib vs kernel) → parallelizable, but done inline sequentially (small).
TASK_03 depends on 01; TASK_04 on 02+03. TASK_05 (Phase B) is a gated checkpoint AFTER Phase A lands.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0458_TASK_01 | Cody | mechanical extraction + DRY refactor |
| SESSION_0458_TASK_02 | Cody | small generic kernel change |
| SESSION_0458_TASK_03 | Cody | server data layer (fetch + project) |
| SESSION_0458_TASK_04 | Cody→Doug | surface + gate + headless proof |
| SESSION_0458_TASK_05 | Cody→Doug | gated DB build + consolidation |

### Open decisions

- Phase B start is **operator-gated** (checkpoint after Phase A render-proof).
- Karma/gamification dropped (replaced by health strip) — confirm at Phase B.

### Risks

- Realtime fetch depends on GitHub raw availability + network on render — mitigated: `revalidate`
  cache + graceful per-file failure (a failed ledger contributes 0 items, board still renders).
- Phase B introduces a Prisma migration (prod schema change on deploy) — mitigated: gated checkpoint,
  build+verify local (prodsnap) first, operator gates push.

### Scope guard

- Do NOT edit `lib/task-board/seed.ts` (demo fixture).
- Phase A is purely additive — does NOT touch `AdminTaskBoard` (consolidation is Phase B).
- No FI-001 real send this session (still gated, post-N1/N2).
- N1 (combobox into wizard) / N2 (member dashboard ports) are subsequent lanes, not this session.

### Bow-out additions (operator-requested, SESSION_0458)

Run these at bow-out, after the build lands:

1. **`/fallow-fix-loop`** on the session diff (CRAP / dupes / dead-code / complexity).
2. **`hostile-close-review.md`** (Giddy / Doug / Desi).
3. **m-card reusability/consistency sweep** — where else across the repo should the kernel m-card
   be "the one card" (directory/roster/deals/etc.)? Project-wide consistency + reuse audit.
4. **Glossary + runbook terms** — add this session's concepts/terms to
   `repo-code-glossary.md` + `human-code-runbook.md` (kernel, projection / read-model, port &
   adapter, scroll-snap carousel, realtime-from-main, config-driven board, etc.).
5. **"Kernel explained" (Giddy → junior-dev voice) + learning lessons** — a teaching writeup of
   what a "kernel" is, added to the learning-lessons file (locate via graphify).

### Queued next-lane ideas (operator, SESSION_0458)

- **Goals ledger (`/goals`)** — RECOMMEND: new `docs/knowledge/wiki/goals-ledger.md` with `### G-NNN —
  title` + `- **Status:** open|done` entries mirroring `drift-register`, so the existing
  `parseSectioned` parser ingests it via a one-line add to `LEDGER_FILES`/`LEDGER_ORDER` (code `GL`).
  The loop-board then projects goals as cards + the bow-in CLI lists them. Makes the operator `/goal`
  durable + a north-star objectives home. (Smallest; do first.)
- **PRD/story checkmarking per brand** — each brand already has `PRD.md` + `STORIES.md` (BBL /
  baseline-martial-arts / mammoth-build) but STORIES has **0 checkbox rows**. Convert to `- [ ]`/`- [x]`
  checklists (+ PRD acceptance criteria) → a small parser computes per-brand completion %. Fits the
  brand-separation direction; could surface as a loop-board health row. (Bigger; follow-on.)

### Decisions resolved mid-session (carry to Decisions/ADR at bow-out)

- **Carousel = generic + lean in the kernel** (operator) — mobile swipe carousel added to
  `AdminKanban`; components stay the shared layer (ADR 0033), data/DB/deploys/repos are what separate.
- **Phase B (editable DB board) DEFERRED to the DB-separation lane** (operator) — don't build a
  `KanbanCard` table in the about-to-be-split shared DB; it lands on BBL's own DB. Phase A (no schema)
  ships now. The earlier "generic shared prismaBoardStore" (Fork-5 option 1) is SUPERSEDED — the
  board's persistence becomes a BBL-app-local model, not a cross-product shared tier.
- **Strategic direction (operator, "what do you think?" → my rec):** separate DBs per product +
  separate brands/deploys + stay monorepo = YES (completes ADR 0034's multi-product model); **BBL in
  its own prod repo = DEFER** (cross-repo promotion tax; reserve a true split for handoff/sale per
  ADR 0033 D1). → wants its own ADR + a dedicated multi-session lane (revisits ADR 0034).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0458_TASK_01 | landed | Parser extracted → `lib/loop-board/ledger-parse.ts`; CLI refactored to import it (output verified identical, 47 items) |
| SESSION_0458_TASK_02 | landed | Kernel `AdminKanban`: generic `readOnly` prop + `badges` passthrough + mobile swipe-carousel (pager/arrows/peek/fades); 20 kernel tests green |
| SESSION_0458_TASK_03 | landed | `fetch-ledgers.ts` (realtime from public main) + `board-config.ts` (workflow stages + mapper) + `health.ts`; proved end-to-end (47 items live) |
| SESSION_0458_TASK_04 | landed | `/app/loop-board` page + `loop-board.manage` gate + sidebar nav; render-proof passed (admin sees board, 0 console/page errors); files spec + inventory updated |
| SESSION_0458_TASK_05 | deferred | Phase B (editable DB board + AdminTaskBoard consolidation) → DB-separation lane (operator) |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

## Next session

### Goal

### First task

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence

| Step | Proof |
| --- | --- |
