---
title: "WORKFLOW 6.0 — Governing Operating System"
slug: workflow-6
type: protocol
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0584
pairs_with:
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/SOT_Cookbook.md
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/knowledge/wiki/agent-systems-map.md
  - docs/protocols/fan-out-session-recipe.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - orchestration
  - workflow
---

# WORKFLOW 6.0 — Governing Operating System

The governing operating system from SESSION_0584 forward (G-023, ratified via the SESSION_0574
extended grill + SESSION_0582's lived overnight fan-out). **Thin and pointer-first by design** —
this file states the durable rules; the *mechanics* live in the rituals/protocols/recipes it
points to. Reading this file plus [`SOT_Cookbook.md`](SOT_Cookbook.md) (the task→workflow router)
should be enough to know what to run next.

## Why 6.0 exists

[WORKFLOW 5.0](WORKFLOW_5.0.md) governed SESSION_0021–0583 but ossified around a launch that
passed (May 18, 2026) and a shape of work this repo outgrew: one primary lane per session (dead —
[`fan-out-session-recipe.md`](fan-out-session-recipe.md) runs 3–4 genuinely-disjoint lanes in
parallel as a matter of course), a fixed `wt-*` worktree map (dead — every lane gets its own
`../ronin-NNNN` worktree per [`seq-lane-build`](../../.claude/skills/seq-lane-build/SKILL.md)), and
a session calendar/launch board (dead — the [goals ledger](../knowledge/wiki/goals-ledger.md) +
`ledger-backlog.ts`/`board-backlog.ts` are the live backlog now). 5.0 stays in the repo,
**superseded** — its rituals-read is dead canon; don't bulk-read it. `docs/agents/*.md` and
`.claude/agents/*.md` are also affected by G-023 (persona consolidation — see cross-references).

## Hard rules

1. **Every session runs the rituals.** [`opening.md`](../rituals/opening.md) at bow-in,
   [`closing.md`](../rituals/closing.md) at bow-out — no exceptions, no shortcuts.
2. **One coherent lane per session, on one axis** ([loop-of-loops](loop-of-loops-ledger-driven-sessions.md)'
   3–5 bundle rule) — **unless** the session *is* a fan-out dispatch: multiple genuinely-disjoint
   lanes in flight at once is normal, proven at [`fan-out-session-recipe.md`](fan-out-session-recipe.md)
   §1's disjointness test, not a violation of rule 2.
3. **Every non-trivial deliverable gets reviewed and scored.** Not a fixed "three passes" —
   run the review wave ([`recipes/review-wave.md`](recipes/review-wave.md) /
   [`seq-review-wave`](../../.claude/skills/seq-review-wave/SKILL.md)): Doug always, Desi on
   member-facing UI, Giddy on structural change, on the SAME commit, then one batched-fix resume
   + delta verify. [`hostile-close-review.md`](hostile-close-review.md) owns the score gate and
   caps (see below) — this file doesn't restate a second rubric.
4. **Push/merge/deploy only on the operator's explicit per-action word**
   ([[explicit-push-authorization]]) — one push per session, at close, never mid-session. Docs-only
   pushes don't build/deploy (`vercel.json` `ignoreCommand`); app-code pushes run the full CI
   matrix — build locally first.
5. **Dirstarter-alignment is a build-time gate, not a session ceremony.** [`cody-preflight.md`](cody-preflight.md)'s
   L1/schema/backend checklists own it; a session doesn't need a separate alignment table unless a
   task actually touches an L1 area.
6. **Reuse before invention** — component reuse ([`dirstarter-component-inventory.md`](../knowledge/wiki/dirstarter-component-inventory.md)),
   protocol reuse (this file + [`SOT_Cookbook.md`](SOT_Cookbook.md) before writing a new one), ledger
   reuse (route findings via [closing.md §6.7](../rituals/closing.md#67-finding-router-where-each-finding-type-goes),
   never a new file family).

## Session lifecycle (pointer)

| Stage | Owner | Where |
| --- | --- | --- |
| Bow-in | any agent | [`opening.md`](../rituals/opening.md) |
| Route the task | Petey (or the operator) | [`SOT_Cookbook.md`](SOT_Cookbook.md) — the one-screen router |
| Plan (if unclear/multi-part) | Petey | [`petey-plan.md`](petey-plan.md) — grill open forks first |
| Build | Cody | [`cody-preflight.md`](cody-preflight.md) then execute |
| Verify | Doug (+Desi/Giddy as needed) | [`recipes/review-wave.md`](recipes/review-wave.md) |
| Multi-session / multi-lane epic | Petey (parent plan) | [`recipes/epic-plan.md`](recipes/epic-plan.md) → [`recipes/orchestrator.md`](recipes/orchestrator.md) → [`recipes/lane.md`](recipes/lane.md) per lane → [`recipes/merge-wave.md`](recipes/merge-wave.md) |
| Overnight / unattended | Petey (evening) → same session (morning) | [`recipes/PM_Planning_Lane.md`](recipes/PM_Planning_Lane.md) → [`recipes/AM_Coffee_Merge_Review.md`](recipes/AM_Coffee_Merge_Review.md) |
| Bow-out | any agent | [`closing.md`](../rituals/closing.md) |

## Score rubric — one home, not two

[`hostile-close-review.md`](hostile-close-review.md) is now the **single** scoring mechanism (it
absorbs what 5.0 called the "ten-point rubric" — the caps below are load-bearing there, not
restated as a separate WORKFLOW table):

- Dirstarter-compliance failure, data-integrity failure, or missing security proof on an exposed
  data path each cap the score at **8.9**.
- Missing credible verification caps at **9.4**.
- Kaizen aggregate confidence (the three-question triage) is tracked **alongside**, not folded
  into, the score — a 10/10 plan can still carry a Kaizen 7 if what's proven lags what's planned.

## Lane routing

Don't re-derive "what do I run for this" — [`SOT_Cookbook.md`](SOT_Cookbook.md) is the one-screen
router (the task→workflow table that used to live in
[`agent-systems-map.md`](../knowledge/wiki/agent-systems-map.md) §1 moved there at G-023). For a
multi-session lane bigger than one sitting, its continuation lives in a goals-ledger `G-0xx` row
(children = the task sequence), never in chat — [`fan-out-session-recipe.md`](fan-out-session-recipe.md)
§6.

## Persona roster

`.claude/agents/*.md` is the canonical roster (agent-agnostic prose despite the directory name —
Claude dispatches it via `subagent_type`; other runtimes read the same file directly).
`docs/agents/*.md` are thin pointer stubs for discovery from a non-`.claude`-aware context. Six
roles, in-context-contents, and the allowed/never skill lists per agent: see
[agent-systems-map §2 and §4](../knowledge/wiki/agent-systems-map.md).

## Merge and push

The mechanical gate ladder (G0→G4), branch posture, and merge-disposition discipline that used to
live in `giddy-merge-strategy.md` now live in [`recipes/merge-wave.md`](recipes/merge-wave.md) —
same gates, absorbed into the recipe-card format. `giddy-merge-strategy.md` carries a supersede
banner and stays as detailed reference. Push law itself is unchanged: explicit per-action
authorization, one push per session, [[explicit-push-authorization]].

## Cross-references

- [WORKFLOW 5.0](WORKFLOW_5.0.md) — superseded; kept for history, not for reading at bow-in.
- [SOT_Cookbook](SOT_Cookbook.md) — the task→workflow router.
- [Opening](../rituals/opening.md) / [Closing](../rituals/closing.md) rituals.
- [Fan-out session recipe](fan-out-session-recipe.md) — parallel disjoint-lane sessions.
- [Recipe cards](recipes/) — orchestrator · epic-plan · lane · review-wave · merge-wave ·
  PM_Planning_Lane · AM_Coffee_Merge_Review.
- [Agent Systems Map](../knowledge/wiki/agent-systems-map.md) — the 5 pillars this OS runs on.
- [Hostile Close Review](hostile-close-review.md) — the score gate.
- [Cody Pre-flight](cody-preflight.md) — the Dirstarter-alignment gate.
