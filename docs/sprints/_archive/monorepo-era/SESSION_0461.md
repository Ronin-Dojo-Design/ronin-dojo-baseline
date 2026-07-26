---
title: "SESSION 0461 — BBL loop-board Phase B (editable, DB-backed)"
slug: session-0461
type: session--implement
status: closed
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0461
sprint: S46
pairs_with:

  - docs/sprints/SESSION_0459.md
  - docs/sprints/SESSION_0458.md
  - docs/knowledge/wiki/goals-ledger.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0461 — BBL loop-board Phase B

> **PRE-STAGED** by SESSION_0459 for a parallel dispatch (3 concurrent windows: 0460 / 0461 / 0462).
> This window owns **0461** — fill this file in during the session; do **not** create a new SESSION number.

## Date

2026-06-28

## Operator

Brian + claude-session-0461

## Goal

Make the loop-board **editable + DB-backed** (G-003) on **BBL's own DB** (formalized by ADR 0038 Phase 1
— no longer blocked on a throwaway shared-DB table): a `KanbanCard` model + a Prisma `BoardStore`, and
collapse the Todoist `AdminTaskBoard` into the same board.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Parallel session awareness

One of **3 concurrent windows** launched together:

- **SESSION_0460** — Mammoth Phase 2 — dir `clients/mammoth-build-crm` — DB `mammoth_dev`.
- **SESSION_0461 (THIS)** — BBL — dir `apps/web` — DB `ronindojo_prodsnap` — worktree `../ronin-0461` (branch `session-0461-bbl`).
- **SESSION_0462** — Platform per-product CI + scaffold — dirs `docs/`/`.github/`/`scripts/` — no DB.

You are the ONLY lane touching `apps/web` — own it, but do NOT touch `clients/**` or `mammoth_dev`.
Shared collision surface = index docs only — append-only; on push reject, `git pull --rebase origin main`
then retry (never force).

### Branch and worktree

- Branch: `session-0461-bbl` · Worktree: `../ronin-0461` (own index — `git add -A` is safe here).
- DB: `ronindojo_prodsnap` (`apps/web/.env`). HEAD at bow-in: `0079a1da`.
- **Worktree env gotcha:** the gitignored `apps/web/.env` + `.env.local` live only in the main
  checkout — copied into this worktree at bow-in so `migrate dev` / dev server / `psql` target
  `ronindojo_prodsnap` (shadow `ronindojo_shadow`). (Logged as a recurring worktree trap.)

### Grill outcome (forks resolved — operator-gated)

Core design: **the `KanbanCard` table is the single source of truth** for the board; the live-ledger
projection is a **one-way, insert-only importer** keyed by a stable `source + sourceRef`. The importer
only ever ADDS missing cards — never updates, never deletes — so operator edits (stage/title/order)
are sacred and there is exactly one SoT (the anti-drift rule, learning record 0004).

- **Fork 1 — ledger sync → AUTO-IMPORT ON LOAD (operator).** The page server-imports any ledger item
  with no card yet (`createMany skipDuplicates`, idempotent) on each load — new backlog items appear
  automatically (keeps Phase A's near-realtime value) while edits/positions persist. Rejected: an
  explicit "Sync" button (board drifts stale until clicked).
- **Fork 2 — AdminTaskBoard collapse → RETIRE + MIGRATE (operator).** Full retirement: loop-board
  becomes editable (manual cards via the kernel's built-in quick-add/intake), `/admin/task-board`
  redirects to `/app/loop-board`, the `lib/task-board` engine + Todoist renderer retire, AND a one-time
  client-side import lifts the operator's existing `bbl_admin_taskboard_v1` localStorage tasks into
  `KanbanCard` (source=`task`). One board, one engine (G-003).
- **Fork 3 — transport (Petey-decided).** Plain `"use server"` module (`loadBoard`/`saveBoard`/
  `syncLedgers`/`importTasks`) gated by `loop-board.manage` — matches the `BoardStore` port shape
  (`load(configId)`/`save(state)`) with zero envelope-unwrapping; the client adapter is `{ load, save }`.

### Bow-out cleanup (fold into the close)

At close, after the branch merges to `main`: `git worktree remove ../ronin-0461` then
`git branch -d session-0461-bbl`. (Generic rule: closing.md §4.2.)

## Petey plan

### Goal

Add a `KanbanCard` model + Prisma `BoardStore` so the loop-board (Phase A read projection) becomes
editable and persistent; collapse `AdminTaskBoard` into the same kernel board.

### Tasks

#### SESSION_0461_TASK_01 — `KanbanCard` schema + migration

- **Agent:** Cody
- **What:** add a `KanbanCard` model to `apps/web/prisma/schema.prisma` (column/status, order, source-ledger
  ref, timestamps). Additive → `migrate dev` per the schema-migration runbook (NOT a type change).
- **Done means:** migration created + applied to `ronindojo_prodsnap`.

#### SESSION_0461_TASK_02 — `BoardStore` over Prisma

- **Agent:** Cody
- **What:** implement the kernel's `BoardStore` port (load/save) against `KanbanCard`; keep the
  live-ledger projection as the **seed/import** source (grill: projection imports INTO cards once, then
  cards own state — avoid two-sources-of-truth).
- **Done means:** the board is editable + persists.

#### SESSION_0461_TASK_03 — collapse AdminTaskBoard + verify

- **Agent:** Cody → Doug
- **What:** fold the Todoist `AdminTaskBoard` into the same board (one board, one engine); admin-gate
  (`loop-board.manage`); headless-verify create/move/edit persists across reload.
- **Done means:** one board; edits persist.

### Gates

Operator authorizes the schema migration on `ronindojo_prodsnap`. **APP-CODE lane** → run
`cd apps/web && bun run build` (next build) BEFORE the push (this push FIRES CI + a BBL prod deploy). One
push at close, on the operator's "go".

### Scope guard

- Do NOT touch `clients/**` or `mammoth_dev`. Do NOT build a second board renderer (reuse the kernel). Do
  NOT run the N1 combobox lane here (also `apps/web` — separate session/worktree).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0461_TASK_01 | landed | `KanbanCard` model + enum; hand-authored additive migration `20260628000000_add_kanban_card` applied to `ronindojo_prodsnap` via `migrate deploy` (140→141 tables) |
| SESSION_0461_TASK_02 | landed | Prisma `BoardStore` (`loadBoard`/`saveBoard` upsert-only) + insert-only ledger importer + `{load,save}` client adapter; board now editable + persistent |
| SESSION_0461_TASK_03 | landed | AdminTaskBoard retired (`/admin/task-board`→redirect; `lib/task-board` + Todoist renderer deleted) + one-time localStorage→`KanbanCard` task migration |
| SESSION_0461_TASK_04 | landed | data-layer proof 11/11 (anti-drift + anti-race) + Playwright 2/2 (create+move+reload-persist, localStorage migration) + `next build` exit 0 |

## What landed

- **The loop-board is editable + DB-backed (G-003).** A `KanbanCard` model + `KanbanCardSource` enum on
  BBL's own DB (`ronindojo_prodsnap`, ADR 0038 Phase 1), applied additively via a hand-authored migration
  `20260628000000_add_kanban_card` (`migrate deploy`, 140→141 tables — no reset, BBL data untouched). The
  kernel persists through a Prisma `BoardStore` adapter (`{ load, save }` = two `"use server"` actions,
  gated `loop-board.manage`); drag/add/done now persist across reload.
- **One source of truth, no drift.** The `KanbanCard` table owns card state; the live-ledger projection is
  demoted to a one-way, **insert-only importer** (`syncLedgers` → `createMany skipDuplicates`) that
  auto-adds new backlog items on each load but never overwrites an edit. `saveBoard` is **upsert-only**.
- **AdminTaskBoard retired / consolidated (one board, one engine).** `/admin/task-board` redirects to
  `/app/loop-board`; the `lib/task-board` engine + Todoist renderer are deleted; the operator's per-browser
  `bbl_admin_taskboard_v1` tasks migrate once into `KanbanCard` (source=`task`) on first visit.
- **A real race found + fixed.** The first `saveBoard` did a delete-missing reconcile that **raced the
  importers** — a stale hydrate-save wiped just-imported cards (seen as a `task:` row resurrected as
  `manual`). Fix: upsert-only (the kernel has no delete UI; items leave by moving to *Done*). Captured as
  learning record 0004 + an ANTI-RACE assertion in the data-layer proof.

## Decisions resolved

- **Ledger sync = auto-import on load** (operator) — insert-only, idempotent; preserves Phase A's
  near-realtime value while edits persist.
- **AdminTaskBoard = retire + migrate** (operator) — full retirement + a one-time localStorage→DB lift.
- **Transport = plain `"use server"` actions** matching the `BoardStore` port shape (Petey) — zero
  envelope-unwrapping; the client adapter is `{ load: loadBoard, save: saveBoard }`.
- **`saveBoard` upsert-only, no delete-reconcile** (forced by the race) — see learning record 0004.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | + `KanbanCard` model + `KanbanCardSource` enum |
| `apps/web/prisma/migrations/20260628000000_add_kanban_card/migration.sql` | NEW — additive (CREATE TYPE + TABLE + 2 indexes); applied to prodsnap via `migrate deploy` |
| `apps/web/server/loop-board/board-store.ts` | NEW — `"use server"` `loadBoard` / `saveBoard` (upsert-only) / `importTasks`, gated `loop-board.manage` |
| `apps/web/server/loop-board/sync.ts` | NEW — `syncLedgersForConfig` (insert-only ledger importer) |
| `apps/web/server/loop-board/map-card.ts` | NEW — pure `KanbanCard`↔`BoardCard` mappers |
| `apps/web/server/loop-board/map-card.test.ts` | NEW — mapper unit tests |
| `apps/web/lib/loop-board/board-store-client.ts` | NEW — `createServerActionBoardStore()` adapter |
| `apps/web/lib/loop-board/parse-legacy-tasks.ts` (+ `.test.ts`) | NEW — pure legacy-task parser + tests |
| `apps/web/lib/loop-board/board-config.ts` | export `LOOP_BOARD_CONFIG_ID` |
| `apps/web/app/app/loop-board/page.tsx` | sync ledgers (import) → editable board + health (one fetch) |
| `apps/web/app/app/loop-board/_components/loop-board.tsx` | server-action store, drop `readOnly`, one-time task migration |
| `apps/web/app/admin/task-board/page.tsx` | RETIRED → redirect to `/app/loop-board` |
| `apps/web/app/admin/task-board/_components/*`, `apps/web/lib/task-board/*` | DELETED (engine + Todoist renderer) |
| `apps/web/e2e/loop-board.proof.spec.ts` | rewritten for Phase B (editable + migration) |
| `apps/web/scripts/loop-board-phase-b-proof.ts` | NEW — data-layer anti-drift + anti-race proof |
| `apps/web/playwright.config.ts` | `PW_BASE_URL` env override (run e2e against a worktree port) |
| docs | loop-board spec (Phase B), bbl-admin-task-board (RETIRED), custom-component-inventory, goals-ledger G-003, loop-of-loops P3, learning record 0004, wiki/index |

## Verification

| Command / proof | Result |
| --- | --- |
| `prisma migrate deploy` (prodsnap) | applied `20260628000000_add_kanban_card`; 140→141 tables, 17 cols, enum `ledger,task,manual` |
| `bun scripts/loop-board-phase-b-proof.ts` | **11/11** — insert-only + idempotent, ANTI-DRIFT (edit survives re-import), ANTI-RACE (stale save keeps importer card), round-trip |
| Playwright `loop-board.proof.spec.ts` (chromium, :3001) | **2/2** — quick-add + move persist across reload; localStorage tasks migrate |
| `bun run test lib/loop-board/ server/loop-board/` | 25 pass (+8 new) |
| `bunx tsc --noEmit` | 0 errors |
| `bun run format:check` / `lint:check` | clean / warnings-only (pre-existing, unrelated files) |
| `bun run build` (next build) | exit 0 — Vercel-safe |
| `bun run wiki:lint` | 0 errors, 16 warnings (15 pre-existing R8; the R4 fixed) |
| `fallow audit --changed-since HEAD~1 --gate new-only` | residual: 1 unused file + 1 complexity (the standalone proof SCRIPT) + 1 e2e auth-boilerplate clone — no app-logic findings |

## Review log

### SESSION_0461_REVIEW_01 — loop-board Phase B

- **Reviewed:** TASK_01–04.
- **Dirstarter docs check:** the kanban kernel + m-card are fully custom Ronin components (no Dirstarter
  L1 analogue); Phase B touches Prisma (additive `KanbanCard`) — extends Dirstarter's single-DB Prisma
  setup per ADR 0038, not replaced.
- **Verdict:** Reuse-first and honestly verified. The board is the 3rd kernel *consumer* (config + a port
  adapter), never a new renderer; the grilled anti-drift design (insert-only importer + the table as SoT)
  held, and a genuine race in the first save design was caught by the proof, root-caused, and fixed by
  *removing* the unneeded delete-reconcile rather than papering over it. Every claim is backed by a
  falsifiable proof (the ANTI-RACE check, the byte-level migration counts), not narration.
- **Score:** 9.2/10
- **Follow-up:** per-card mutations + a delete affordance (would re-introduce a *safe* removal path);
  the hydrate-save write-amplification (every load re-upserts + bumps `updatedAt`) is a future optimization.

## Hostile close review

- **Giddy (plan sanity / behavior preservation / reuse):** **pass** — single coherent slice; the board
  reuses the kernel via a `BoardStore` adapter (no fork); the projection→table transition follows the
  documented anti-drift discipline (learning 0004); AdminTaskBoard retirement is a true consolidation
  (one engine), not a parallel second board. No throwaway work.
- **Doug (verification honesty / security):** **pass** — admin-gated at the layout AND every server action
  (`loop-board.manage`); the migration is additive and was shown before applying (operator-gated); proofs
  are falsifiable (the data-layer ANTI-DRIFT/ANTI-RACE checks, byte-level table counts) and the race was
  reported, not hidden. Known limitation honestly noted: whole-doc last-write-wins (two concurrent admins
  can clobber) + hydrate-save write-amplification — neither in this session's done-means.
- **Kaizen aggregate:** 9.2/10 — grilled design, real bug caught + fixed, every claim proven.

## ADR / ubiquitous-language check

- **ADR:** none new — this executes ADR 0038 Phase 1 (BBL's own DB) + the ADR 0033 D2 `BoardStore` port.
- **Ubiquitous language:** no new product-domain terms. The architecture concepts (insert-only importer,
  upsert-only save, projection→stored-table) are homed in **learning record 0004**, not the domain glossary.

## Reflections

- **Promoting a projection to a stored table is where drift is born — and the danger isn't the obvious
  overwrite, it's the destructive *save*.** I designed the insert-only importer correctly up front, but the
  first `saveBoard` still carried a delete-missing reconcile out of habit. It raced the importer and ate
  cards. The lesson banked in learning 0004: every writer must be non-destructive by default the moment a
  second writer exists.
- **The proof script earned its keep before the browser did.** The deterministic data-layer proof isolated
  the anti-drift + anti-race invariants without the flakiness of DnD/hydration timing — and the ANTI-RACE
  assertion is the durable regression guard. The browser proof then confirmed the wiring.
- **A worktree is not a free checkout.** It shipped without `.env`, without `node_modules`, and a 3-day-old
  dev server already owned `:3000`. Each cost a debugging loop. Logged for the parallel-lane workflow.

## Full close evidence

| Step | Proof |
| --- | --- |
| Frontmatter/JETTY sweep | new docs carry full frontmatter (`updated` 2026-06-28, `last_agent` claude-session-0461); bumped loop-board / bbl-admin-task-board / custom-component-inventory / goals-ledger |
| Backlinks/index sweep | loop-board.md ⇄ learning 0004; wiki/index SESSION_0461 + loop-board file rows updated; custom-component-inventory + loop-of-loops P3 updated |
| Wiki lint | `bun run wiki:lint` → **0 errors**, 16 warnings (15 pre-existing R8 in untouched files; the 1 R4 fixed) |
| Kaizen reflection | Reflections present (3) |
| Hostile close review | SESSION_0461_REVIEW_01 + Giddy/Doug pass above |
| Component inventory | LoopBoard row updated (Phase B editable); AdminTaskBoard retired |
| Memory sweep | updated `[[loop-of-loops-ledger-backlog-script]]` (Phase B landed) — see bow-out |
| Git hygiene | branch `session-0461-bbl`; worktree `../ronin-0461`; one push at close on operator "go" (fires CI + BBL prod deploy) |
| Graphify update | run before the close commit (bow-out) |

## Next session

### Goal

loop-board Phase B polish, OR the next ledger goal. Candidates: (a) **per-card mutations + a delete
affordance** (retire the whole-doc save → fixes the hydrate-save write-amplification + the two-admin
clobber); (b) **N1 verified-combobox → onboarding wizard** (toward the gated FI-001 send); (c) the next
open `G-NNN` / P1 ledger item.

### First task

If Phase B polish: replace the kernel's debounce-save-whole-state with per-card server actions (move /
patch / add / remove) so `saveBoard` retires and `updatedAt` stops churning on every load — then a *safe*
per-card delete can return. Otherwise pull the top ledger item via `bun scripts/ledger-backlog.ts`.
