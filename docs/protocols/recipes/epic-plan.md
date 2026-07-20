---
title: "Recipe — Epic Plan (decompose a multi-slice epic into lanes)"
slug: recipe-epic-plan
type: protocol
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0584
pairs_with:
  - docs/protocols/fan-out-session-recipe.md
  - docs/protocols/petey-plan.md
  - docs/protocols/recipes/orchestrator.md
  - docs/protocols/recipes/lane.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - orchestration
  - recipe
  - planning
---

# Recipe — Epic Plan

The planning session that produces a fan-out (or decides not to). Run this **before** any lane
launches — a fan-out prompt is the *output* of a plan-first session, never improvised at a build
session's bow-in ([`fan-out-session-recipe.md`](../fan-out-session-recipe.md) §1 rule 3).

## Persona pack

- **Petey** — owns the plan; grills every open operator fork before a single lane prompt is
  written (a dispatched builder never re-opens a pinned fork).
- **Giddy** — the disjointness proof: lists each lane's owned file set and shows the pairwise
  intersection is empty by inspecting the real tree, not by assertion.
- **Operator** — resolves every fork the grill surfaces; without a ratified answer, the lane
  prompt cannot be written (an unresolved fork in a dispatch prompt is how child sessions
  re-incur decisions the parent was supposed to settle).

## Load-set

1. The epic's `G-0xx` goals-ledger row — the plan of record; a lane bigger than one session gets
   a **continuation plan in the ledger**, never a bigger session ([`fan-out-session-recipe.md`](../fan-out-session-recipe.md) §6).
2. `bun scripts/ledger-backlog.ts` + `board-backlog.ts` — what's actually queued, ranked.
3. Prior sessions on the same epic (lived precedent — SESSION_0529's §5b chain, SESSION_0578's
   G-022 fan-out, SESSION_0582's overnight staging).
4. Any ADRs/domain invariants the epic touches.

## Overlays — decide the shape before writing prompts

| Signal | Shape |
| --- | --- |
| Work is "mostly separate" but shares files | **Sequential** — one session, not a fan-out. |
| Genuinely disjoint file sets, each lane independently reviewable, a plan already ran | **Fan-out** — N parallel [lane](lane.md) dispatches via [orchestrator](orchestrator.md). |
| One session, multiple slices building on each other | **§5b in-session chain** (agent-systems-map) — gotcha-encoded brief → structured deliverable → review wave → batched fix → delta verify → push gate, all inside one session. |
| Needs to run unattended overnight | **[PM_Planning_Lane](PM_Planning_Lane.md)** stages it; **[AM_Coffee_Merge_Review](AM_Coffee_Merge_Review.md)** sweeps it. |

## Minimum-output contract

Before any lane launches, the plan delivers:

1. **Lane definitions** — per lane: scope, explicit non-goals, owned ledger rows.
2. **Disjointness proof** — the owned file set per lane, pairwise-empty intersections, proven by
   listing the real tree (not asserted).
3. **Merge order** — which lane lands first/last and why; name any lane that must rebase.
4. **Paste-ready prompts** — one per lane, self-contained (child sessions have no parent memory),
   built from [`fan-out-session-recipe.md`](../fan-out-session-recipe.md) §2's skeleton, each
   pointing at [recipe: lane](lane.md).
5. **Pinned forks** — every operator decision the grill surfaced is answered and quoted verbatim
   into the lane prompts that depend on it.

## Cross-references

- [Fan-out session recipe](../fan-out-session-recipe.md) — the full mechanics this card summarizes.
- [Petey Plan protocol](../petey-plan.md) — the general planning protocol this specializes.
- [Recipe — Orchestrator](orchestrator.md) — dispatches the lanes this plan produces.
- [Agent Systems Map §5b](../../knowledge/wiki/agent-systems-map.md) — the in-session alternative.
