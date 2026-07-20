---
title: "Recipe — AM Coffee Merge Review (morning sweep of an overnight fan-out)"
slug: recipe-am-coffee-merge-review
type: protocol
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0584
pairs_with:
  - docs/protocols/recipes/PM_Planning_Lane.md
  - docs/protocols/recipes/merge-wave.md
  - docs/protocols/recipes/review-wave.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - orchestration
  - recipe
  - overnight
---

# Recipe — AM Coffee Merge Review

The morning half of the overnight pair — the SAME session that staged the fan-out
([PM_Planning_Lane](PM_Planning_Lane.md)) wakes on lane completion and runs this sweep
autonomously, holding at the push gate for the operator's coffee word. Proven at SESSION_0582.

## Persona pack

- **Petey/operator-session** — the orchestrator that wakes on the final lane's notification.
- **Giddy** — the merge sweep: per-lane verify, merge order, disjointness re-check.
- **Doug** — clean uncontended gate rerun on the merged tree (contention-class flakes from a
  4-lane host are expected in-lane; the merged-tree rerun is the authoritative one).
- **Operator** — the only party who can open the push gate, at coffee.

## Load-set

1. Each lane's `SESSION_NNNN.md` — Task log, Verification table, Proposed ledger edits section.
2. [`recipe: merge-wave`](merge-wave.md) — the G0→G4 gate ladder this sweep drives to G3
   (review-ready), never past it without the operator.
3. `git worktree list` + each lane's branch — the actual merge substrate.

## Trigger — completion-triggered, NOT cron

The orchestrating session wakes on **each lane's completion notification**; on the **final** lane
landing it runs this sweep autonomously. Cron is rejected structurally, not by preference: a cloud
scheduler can't reach local worktrees/DB, a separate process can't `SendMessage`-resume a crashed
lane, and a clock races completion (it either fires too early against a still-running lane or
burns idle cycles polling). The trigger has to be the thing that knows the lanes actually finished.

## No-overnight-push law (unconditional)

Every lane commits locally only ([PM_Planning_Lane](PM_Planning_Lane.md)). This sweep may merge
lanes to **local** `main` and apply Proposed-ledger-edits, but the push gate stays **shut** through
the entire sweep. The sweep's terminal state is always "verdicts ready, holding for your word" —
never a pushed commit, however clean the run.

## Escalation valve

Merge conflict, a NO-GO verdict from any reviewer, a gate failure, or genuine ambiguity anywhere in
the sweep → **STOP**, hold all state, push gate stays shut, note "rerun under a stronger
model/persona" for the operator. Never force through.

## Minimum-output contract

1. **Merge order executed** — per the parent epic-plan's named order (usually lowest-risk/docs-first
   or foundation-first, consumers-last); each merge's disposition (source, reason, risk/check
   status) recorded.
2. **Proposed-ledger-edits applied ONCE** — reverse-checked (no unsupported edits slipped through,
   no lane's proposal silently dropped).
3. **Clean uncontended test rerun** — on the merged tree, not the per-lane contended runs.
4. **Artifact re-render** — if any lane touched UI, the visual proof re-rendered on the merged tree.
5. **Verdicts recorded** — per lane + the sweep itself, in the orchestrating SESSION file.
6. **Push-gate state** — explicit "HELD — awaiting the operator's word," plus an ntfy.sh
   notification ("verdicts ready") so the operator doesn't have to poll.

## Cross-references

- [Recipe — PM Planning Lane](PM_Planning_Lane.md) — the evening half that stages what this sweeps.
- [Recipe — Merge Wave](merge-wave.md) — the gate ladder this sweep drives.
- [Recipe — Review Wave](review-wave.md) — the per-lane review pattern this sweep's Doug pass reuses.
- [Explicit push authorization] — the standing law this recipe never overrides.
