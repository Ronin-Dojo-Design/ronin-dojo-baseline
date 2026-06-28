---
title: "Learning Record 0004 — From a read projection to a stored table without drift"
slug: learning-record-0004
type: learning-record
status: active
created: 2026-06-28
updated: 2026-06-28
author: Giddy + claude-session-0461
last_agent: claude-session-0461
pairs_with:
  - docs/learning/ddd/learning-records/0002-shared-kernel-in-practice.md
  - docs/knowledge/wiki/files/loop-board.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0004 — From a read projection to a stored table without drift

> Giddy, to a junior dev. The loop-board started life (Phase A) as a **read-only projection**: every
> request re-derived the board from the 9 governance ledgers on `main`. Phase B made it **editable**, which
> means it needs a **stored table** (`KanbanCard`) it can write to. The trap in that transition is **two
> sources of truth** — the live projection *and* the table — drifting apart. Here is the discipline that
> keeps them from drifting, and the bug that proved why each rule matters.

## The trap

A projection is safe precisely because it owns nothing — it is recomputed from source every time, so it can
never be wrong, only stale. The moment you let a user *edit* it, you must persist the edit somewhere, and now
two things claim to describe the board: the ledgers (the projection) and the table (the edits). If you let
**both** write to what the user sees, you get drift: the user drags a card to *In Progress*, the next
re-projection slams it back to *Backlog*, and trust in the board evaporates.

## The four rules

1. **The table is the single source of truth — full stop.** Once a card row exists, the row owns its state
   (stage, title, order). Nothing else may overwrite it.
2. **Demote the projection to a one-way, insert-only IMPORTER.** It may only ever ADD cards that don't exist
   yet (keyed on a stable `source + sourceRef`, idempotent via `createMany({ skipDuplicates })`). It never
   updates and never deletes. New ledger items still flow onto the board automatically; existing cards are
   untouchable. This is what makes "auto-import on load" safe instead of drift-inducing.
3. **The importer's identity must be stable and namespaced.** `GL:G-003`, `task:<id>`, a kernel `c_<rand>` —
   so a re-import is a guaranteed no-op on what's already there, and origins never collide.
4. **The save path must be UPSERT-ONLY when out-of-band importers exist.** This is the one we learned the
   hard way.

## The bug that proved rule 4

The board's kernel debounce-saves the **whole** document. Our first `saveBoard` did a tidy
"reconcile" — upsert the incoming cards, then *delete any row not in the incoming set*. That is correct for a
self-contained board. It is **catastrophic** next to an out-of-band importer:

- The task-migration importer creates `task:<id>` rows **after** the kernel has already loaded its card set.
- The kernel's load then fires a hydrate-save with that **stale** set (which doesn't include the just-imported
  task).
- The delete-reconcile dutifully deletes the task the importer just created — a **race that silently eats
  imported cards**, and in the churn we even saw a `task:` row resurrected as a `manual` one.

The fix wasn't to coordinate the race — it was to notice the delete-reconcile had **no payoff**: the kernel
exposes no delete affordance, and loop-board items leave the backlog by moving to the *Done* stage (a
persisted edit), never by deletion. So `saveBoard` became **upsert-only**. Removals, if a delete UI ever
lands, get an explicit per-card action — never a whole-document "delete what's missing" pass that races
whatever else writes to the table.

## The general lesson

> When you promote a projection to a stored table, make the projection an **insert-only importer** and make
> every writer **non-destructive by default**. Destructive reconciliation assumes the writer sees the whole
> truth; the instant a second writer (an importer, another tab, a cron) exists, that assumption is false, and
> "delete what I don't see" becomes "delete what I didn't know about." Prove it with a test that saves a
> **stale set** and asserts the unreferenced importer row survives (`loop-board-phase-b-proof.ts`, the
> ANTI-RACE check) — a separation you can't falsify is one you're only hoping for ([[learning-record-0003]]).

Related: [[learning-record-0002]] (the shared kernel this board consumes — the board is config + a port
adapter, never a fork).
