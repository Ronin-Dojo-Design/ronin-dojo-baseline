---
title: "Recipe — Orchestrator (dispatch + babysit N parallel lanes)"
slug: recipe-orchestrator
type: protocol
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0584
pairs_with:
  - docs/protocols/recipes/epic-plan.md
  - docs/protocols/recipes/lane.md
  - docs/protocols/recipes/PM_Planning_Lane.md
  - docs/protocols/recipes/AM_Coffee_Merge_Review.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - orchestration
  - recipe
---

# Recipe — Orchestrator

Runs an already-planned [epic-plan](epic-plan.md) fan-out: dispatches every lane, babysits for
crashes, and hands the landed set to the [merge sweep](AM_Coffee_Merge_Review.md). Proven at
SESSION_0582 (three Sonnet lanes, one mid-flight session-limit crash, `SendMessage` resume,
zero-conflict merge) and the SESSION_0587 overnight variant (four lanes, one staged stub).

## Persona pack

- **Petey/operator** — the dispatcher. Issues each lane as `Agent(subagent_type: "cody", …)`
  carrying its pinned prompt verbatim.
- **Cody** ×N — one per lane, each in its own worktree, each a full [lane](lane.md) citizen.
- **Doug/Desi/Giddy** — the [review wave](review-wave.md) that runs once lanes land.

## Load-set

1. The parent [epic-plan](epic-plan.md)'s pinned prompts — dispatch verbatim, never re-derive or
   re-open a fork mid-flight (fork-pinning is the mechanism that makes unattended dispatch safe:
   every judgment call was made **before** dispatch, so nothing depends on the lane's discretion).
2. `.claude/skills/seq-lane-build/SKILL.md` — the sequence every dispatched lane reads.
3. The reservation branches / staged stubs the planning session created.

## Overlays

| Mode | Trigger | Notes |
| --- | --- | --- |
| **Live-attended** | operator present, dispatches in-chat | Agent tool, `subagent_type: "cody"`, parallel tool calls in one turn for genuinely-disjoint lanes. |
| **Overnight/unattended** | staged via [PM_Planning_Lane](PM_Planning_Lane.md) | one staged `SESSION_NNNN` stub (`recipe: orchestrator`) carries all N dispatch prompts; the next `/bow-in` IS the dispatch — no pasting. |
| **Crash mid-flight** | a lane hits a session-limit kill | `SendMessage` resume with disk-truth-first instructions (re-read the worktree's actual state before continuing) — proven safe when the lane's file set is genuinely disjoint from siblings. |

## Escalation valve (always active)

On merge conflict, a NO-GO review verdict, a gate failure, or genuine ambiguity in the sweep:
**STOP**, hold all state, keep the push gate shut, and note it for the operator (e.g. "rerun the
sweep under a stronger model/persona"). Never force through on the cheaper model or under
uncertainty — this is what makes cheap-model dispatch (SESSION_0587's Sonnet-orchestrator
experiment) safe rather than reckless.

## Minimum-output contract

1. **Dispatch record** — which lanes launched, on which branches/worktrees, with which prompt.
2. **Landing record** — per lane: done / blocked / crashed-then-resumed, with evidence.
3. **Trigger to the merge sweep** — on the FINAL lane landing, hand off to
   [AM_Coffee_Merge_Review](AM_Coffee_Merge_Review.md) (completion-triggered, not cron — see that
   card for why).
4. **Zero silent state loss** — a crashed lane is resumed or explicitly reported lost with its
   last-known state; never quietly dropped.

## Cross-references

- [Recipe — Epic Plan](epic-plan.md) — produces what this card dispatches.
- [Recipe — Lane](lane.md) — what each dispatched worktree runs.
- [Recipe — PM Planning Lane](PM_Planning_Lane.md) — the evening staging half.
- [Recipe — AM Coffee Merge Review](AM_Coffee_Merge_Review.md) — the morning sweep half.
- [Fan-out session recipe](../fan-out-session-recipe.md) — the underlying cross-session mechanics.
