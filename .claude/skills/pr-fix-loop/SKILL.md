---
name: pr-fix-loop
description: On-call PR review→score→fix loop. Run via /loop to keep open PRs merge-ready — a goal-driven loop that triages open PRs, runs the pr-review-score-fix loop on each as tracked tasks, fixes mechanical blockers on the branch, and reports verdicts. Pause-on-merge. Use when the user says "go on call", "babysit the PRs", "/pr-fix-loop", or runs it under /loop.
---

**Invoking this enters a goal-driven loop** — one standing GOAL, worked through concrete TASKS each
pass, recurring until the queue is merge-ready. A loop is a goal, not a task. Per-PR engine:
`docs/protocols/pr-review-score-fix-loop.md`.

## GOAL (standing — never changes)

Keep the open-PR queue merge-ready: **every open PR is either `READY (pending operator go)` or
`KEEP_AS_IS` with its blocker surfaced.** Never auto-merge to reach it.

## TASKS (each pass — track with TaskCreate/TaskUpdate so progress is visible)

1. **Enumerate** — `gh pr list --state open`. For each PR that is new or whose head moved since the
   last pass, `TaskCreate` "review PR #N" (skip PRs already `READY (pending go)` whose head is
   unchanged).
2. **Work each task** (`TaskUpdate` → in_progress):
   - Run the loop on that PR — review (Cody/Doug/Giddy lenses) → score (binary accelerator + gate) →
     Giddy gate → top-3 fixes, per `pr-review-score-fix-loop.md`.
   - **Read every red check before scoring it** — code-defect vs env/infra vs inherited-from-`main`.
   - **Fix mechanical blockers on the branch, then re-run** — merge conflict, session-doc collision
     (renumber the branch's doc, identity fields only — don't rewrite the narrative), env/CI. Push to
     the **PR branch only** (`--force-with-lease` after a rebase); never `main`.
   - `TaskUpdate` → completed with the verdict.
3. **Report** — one line per PR: `READY (pending go)` · `KEEP_AS_IS — <blocker>` · `INTENT — your call`.

## LOOP (how it recurs — invoke the loop, don't just run once)

- **`/loop /pr-fix-loop` (self-paced):** after a pass, if any PR can still change or new ones may
  open, `ScheduleWakeup` for the next pass (pass the same `/loop` input). Once the GOAL holds and
  nothing's pending, idle on a long fallback (~1200s+) or report-and-wait.
- **`/loop 15m /pr-fix-loop` (interval):** the interval drives recurrence — run one pass per tick.
- **`/pr-fix-loop` (standalone):** one pass, then report. No self-scheduling.

## Standing rules (already in CLAUDE.md + memory — restated for on-call clarity)

- **Pause-on-merge**: never merge or push to `main` without the operator's explicit go.
- **Ping on any decision** the loop surfaces — intent mismatch, ambiguous fix, prod-affecting env.
- **Graphify-first** discovery; open exact files after.
- Watch for **session-number collisions** (parallel local/cloud sessions writing the same
  `SESSION_NNNN.md`) — the most common merge-blocker here.

## Cross-references

- `docs/protocols/pr-review-score-fix-loop.md` — per-PR mechanics (the engine).
- `docs/protocols/reusable-prompts.md` — the phone paste-prompts (PR-review section).
- `docs/protocols/giddy-merge-strategy.md` · `docs/protocols/merge-to-main.md` — merge mechanics for
  when you get the go.
