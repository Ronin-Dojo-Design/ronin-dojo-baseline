---
name: pp
description: Petey Plan (Parse → Plan). Produce a session/lane plan from the current request + latest SESSION file + the live ledgers, grilling the open forks first — plan only, no dispatch. Use when the operator says "/pp", "petey plan", "plan this", "parse and plan", or a bow-in/bow-out task is unclear or multi-part. For the plan PLUS the paste-ready baton, use /ppp.
---

# pp — Petey Plan (Parse → Plan)

`/pp` is the **Plan-lane** entrypoint (ADR 0052 D1/D4): parse the inputs, produce ONE plan block, and
**stop** — plan only, no build dispatch. It runs the
[`petey-plan`](../../../docs/protocols/petey-plan.md) protocol; that doc is the body — read it, don't
restate it here.

> `/pp` = plan only (preserved for bow-out staging / review-before-build).
> `/ppp` = `/pp` **+ emit the paste-ready baton** (the handoff prompt). See [`../ppp/SKILL.md`](../ppp/SKILL.md).

## Steps

1. **Parse the inputs** (petey-plan §Inputs, in order): the operator's request; the latest
   `docs/sprints/SESSION_NNNN.md` (`What landed` · `Open decisions / blockers` · `Next session`); the live
   backlog (`bun scripts/ledger-backlog.ts` + `( cd apps/web && bun scripts/board-backlog.ts )`); the
   program-plan sprint row; any ADR / `plan-vs-current.md` the task touches; the live Dirstarter docs for
   every L1 layer it touches. A missing or stale input is flagged under `## Risks`, not guessed at.
2. **Grill the open forks FIRST** (petey-plan rule). Every decision that changes the deliverable's shape is
   surfaced and resolved with the operator *before* the plan is final — a plan built on an unresolved fork
   is built on sand. Use `/grill-with-docs` when the fork is architectural.
3. **Emit the plan block** in the petey-plan §Output format: `### Goal` (one sentence) · numbered
   `#### SESSION_NNNN_TASK_NN` tasks (Agent · What · Steps · Done means · Depends on) · `### Parallelism` ·
   `### Agent assignments` · `### Open decisions` · `### Risks` · `### Scope guard` · the Dirstarter template
   when an L1 layer is touched.
4. **Run the parallel-lane assessment** (opening.md §1d): if 2+ tasks are genuinely disjoint (distinct file
   sets, each independently reviewable), say so and recommend fan-out
   ([`recipes/epic-plan.md`](../../../docs/protocols/recipes/epic-plan.md)); otherwise recommend one coherent
   lane. Reserve fan-out for genuinely-disjoint work — a one-file change is a single inline Cody (CLAUDE.md).
5. **Write the plan** into the SESSION file `## Petey plan` (bow-in) or the `Next session` block (bow-out
   staging), then **stop at the plan.** Dispatch (Cody build → `/ggr` verify) is a separate, explicit step —
   `/pp` never writes code and never dispatches.

## Rules (from petey-plan)

- **One session = 1–3 tasks.** More → split across sessions and note the continuation.
- **Every task has a "done means."** No task is done until its artifact exists.
- **Plans are disposable** — operator override wins ([operator-drives-nothing-canonical]).
- **Efficiency without regression** — any added process must name the effectiveness it protects; prefer the
  lighter process that gives the same proof.

## What this is NOT

- Not a dispatch — `/pp` stops at the plan. For the plan **plus** the baton handoff prompt, use `/ppp`.
- Not a build — it never edits production files; Petey plans, Cody builds, Giddy (`/ggr`) gates.
