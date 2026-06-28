---
title: "SESSION 0461 — BBL loop-board Phase B (editable, DB-backed)"
slug: session-0461
type: session--open
status: in-progress
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0459
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
- DB: `ronindojo_prodsnap` (`apps/web/.env`).

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
| SESSION_0461_TASK_01 | pending | KanbanCard model + migration |
| SESSION_0461_TASK_02 | pending | BoardStore Prisma port (editable + persistent) |
| SESSION_0461_TASK_03 | pending | collapse AdminTaskBoard + headless verify |

## Next session

### Goal

TBD at bow-out (loop-board polish / automations, or the next P1 ledger item).

### First task

TBD at bow-out.
