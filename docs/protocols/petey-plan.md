---
title: Petey Plan Protocol
slug: petey-plan
type: protocol
status: active
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0012
health: 7
pairs_with:
  - docs/agents/petey.md
  - docs/protocols/review-recommend.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/rituals/opening.md
tags:
  - planning
  - orchestration
  - workflow
---

# Petey Plan Protocol

A structured protocol for Petey to produce a session plan. Can be invoked at bow-in (forward planning) or bow-out (next-session staging). The output is a plan block that lives in the SESSION file or, for multi-session epics, as its own doc.

## When to invoke

- **Bow-in:** User says "bow in" and the next task is unclear, multi-part, or has open decisions.
- **Bow-out:** User says "bow out" and wants the next session pre-staged so it hits the ground running.
- **Mid-session pivot:** Scope changed or a blocker surfaced — re-plan before continuing.
- **On demand:** User says "Petey plan" or "plan this."

## Inputs (read in order)

1. User's message / request
2. Latest `docs/sprints/SESSION_NNNN.md` — `What landed`, `Open decisions / blockers`, `Next session`
3. `docs/architecture/program-plan.md` — current sprint row + deliverable
4. `docs/knowledge/wiki/manual-boundary-registry.md` — open boundaries that could be the next proof target
5. Relevant ADRs / `plan-vs-current.md` — only if the task touches schema or architecture

If any input is missing or stale, flag it in the plan under `## Risks`.

## Output format

Write this block into the SESSION file under `## Petey plan`:

```markdown
## Petey plan

### Goal
One sentence: what this session accomplishes.

### Tasks

#### TASK_01 — <title>
- **Agent:** Petey | Cody | Doug
- **What:** one-line description
- **Steps:** numbered list
- **Done means:** artifact or state change
- **Depends on:** nothing | TASK_NN

#### TASK_02 — <title>
...

### Parallelism
Which tasks can run concurrently? Which must be sequential?
Sub-agents on disjoint file sets → parallel on main.
Overlapping code files → sequential, or git worktrees if justified.

### Agent assignments
| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Clear execution, no decisions |
| TASK_02 | Petey | Needs decomposition first |

### Open decisions
Bullet list of anything requiring user sign-off before execution.

### Risks
Anything that could block or derail.

### Scope guard
If additional work surfaces during execution, note it in SESSION file under
`Open decisions / blockers` — do NOT expand scope mid-task.
```

## Rules

1. **One session = 1–3 tasks.** If the plan needs more, split across sessions and note the continuation.
2. **Every task has a "done means."** No task is done until its artifact exists.
3. **Petey does not execute.** Hand off to Cody (or Doug for QA) once the plan is approved.
4. **Plans are disposable.** If the user overrides, adapt. Don't defend the plan.
5. **Scope guard is mandatory.** Adjacent tech debt or ideas go into `Open decisions / blockers`, not inline fixes.

## Closing integration

At bow-out, if the session completed its plan, Petey runs [Review & Recommend](review-recommend.md) to stage the next session. The output goes into the SESSION file's `Next session` section.

## Cross-references

- [Petey agent](../agents/petey.md) — role definition
- [Review & Recommend protocol](review-recommend.md) — pairs with this at bow-out
- [Opening ritual](../rituals/opening.md) — invokes this when task is unclear
- [Closing ritual](../rituals/closing.md) — invokes this to stage next session
- [Manual Boundary Registry](../knowledge/wiki/manual-boundary-registry.md) — input for next-target selection
