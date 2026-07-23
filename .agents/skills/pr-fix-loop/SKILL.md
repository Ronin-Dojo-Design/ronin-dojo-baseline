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

## Fan-out execution (one isolated subagent per PR — G-007)

When there is **more than one** PR to work in a pass, fan out instead of serially babysitting. Each PR is
genuinely disjoint (different branch, different files), so this is the one place sub-agent parallelism is
justified (per CLAUDE.md "parallelize only when the work is genuinely disjoint").

- **One background subagent per open PR**, launched in a single message so they run concurrently, each
  given the PR number + branch + intent (the SESSION `Goal` / PR body).
- **Each in its own `git worktree` on the PR branch** — never share the main checkout (a subagent's
  `git stash`/checkout would clobber another's edits; see `[[workflow-over-dirty-tree-clobbers-edits]]`).
  Set up: `git fetch origin <branch> && git worktree add ../ronin-pr-<N> <branch>`. The subagent runs all
  `git`/`bun`/review commands from that worktree dir.
- **Per-PR engine inside the worktree:** run the **pr-review-score-fix** loop (review → score → Giddy
  gate), then **`/fallow-fix-loop`** on the branch diff (CRAP/dupes/dead-code + multi-angle review + fix +
  re-verify), then the **hostile-close** review (`docs/protocols/hostile-close-review.md` — Giddy + Doug
  questions + Kaizen aggregate). Apply **mechanical** fixes only (typecheck/lint/format, red-CI repair,
  session-doc renumber, obvious correctness) — **commit them to the PR branch**, never to `main`.
- **No push without the operator's go.** Commit fixes locally in the worktree; **do not `git push`** the
  branch (which updates the PR) until the operator says go — honor `[[explicit-push-authorization]]`.
  Report what was committed locally per PR so the operator can authorize the push in one batch.
- **Concurrency-capped:** at most ~3 PR subagents in flight at once (worktrees + dev servers are heavy);
  queue the rest. Cap the per-PR loop at ≤3 review→fix passes (`pr-review-score-fix-loop.md` stop rule).
- **Pause-on-merge:** never merge. Each subagent returns a verdict only.
- **Cleanup:** once a branch is merged (operator-gated) or abandoned, `git worktree remove ../ronin-pr-<N>`.

Aggregate the per-PR verdicts into the one-line-per-PR report (below).

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
