---
title: Petey Plan Protocol
slug: petey-plan
type: protocol
status: active
created: 2026-04-27
updated: 2026-07-20
last_agent: claude-session-0584
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
6. Live `https://dirstarter.com/docs` pages for every Dirstarter-owned layer
   the task touches: project structure, Prisma/database, Better Auth,
   payments/Stripe, storage/media, deployment/cron, content/blog/SEO,
   rate limiting, analytics, or UI primitives.
   **Canonical URL list:** see `docs/knowledge/wiki/dirstarter-docs-inventory.md` → "Alignment URLs (SESSION_0134)" section for the 10 mandatory alignment targets.

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

### Dirstarter implementation template
- **Docs read first:** <URLs + timestamp/date checked, or "not applicable">
- **Baseline pattern to extend:** <feature folders, Prisma/service shape,
  auth/action chain, integration helper, component primitive, etc.>
- **Custom delta:** <what Ronin adds on top of the purchased boilerplate>
- **No-bypass proof:** <why this is not replacing a Dirstarter capability
  without reason>
```

## Rules

1. **One session = 1–3 tasks.** If the plan needs more, split across sessions and note the continuation.
2. **Every task has a "done means."** No task is done until its artifact exists.
3. **Petey does not write code — Petey dispatches.** Once the plan is approved, Petey *executes it by orchestration*: spawn Cody (build) and Doug (verify) as real `subagent_type` dispatches (see **## Dispatch** below). Petey never edits production files directly.
4. **Plans are disposable.** If the user overrides, adapt. Don't defend the plan.
5. **Scope guard is mandatory.** Adjacent tech debt or ideas go into `Open decisions / blockers`, not inline fixes.
6. **Dirstarter before custom.** When a task touches a Dirstarter-owned layer,
   the plan must use the relevant live Dirstarter docs as the guiding template
   before implementation starts. The hostile close review still re-checks those
   same docs afterward.
7. **Efficiency without regression.** If a plan adds protocol work, test work,
   or extra review steps, it must name the effectiveness it protects. If a
   lighter process gives the same proof, prefer the lighter process.

## Dispatch — the plan ends by spawning the executors (not describing them)

A plan that stops at the **Agent assignments** table is inert — the table has to become **real dispatches**.
Once the operator approves the plan, Petey executes it by orchestration, not by writing code:

1. For each build task, issue `Agent(subagent_type: "cody", …)` carrying the task's `What` / `Steps` /
   `Done means` and its touched-file scope. Run them **in parallel** when the `### Parallelism` section marks
   the file sets disjoint; **sequentially** (or in separate git worktrees) when they share files.
2. When the build tasks return, issue `Agent(subagent_type: "doug", …)` on the resulting diff to verify
   (gates + failure-mode + live-app/SoT). Design-surface work also routes to `Agent(subagent_type: "desi", …)`;
   architecture/git-strategy questions to `Agent(subagent_type: "giddy", …)`.
3. Petey collates the results, updates the SESSION `Task log`, and **holds at the push gate** — dispatch
   builds and verifies; it does **not** push/merge/deploy. Every push waits for the operator's explicit word
   ([explicit-push-authorization](recipes/merge-wave.md)).

The roster agentTypes (`petey` / `cody` / `doug` / `giddy` / `desi` / `brandon`) live in
`.claude/agents/*.md`; Brandon also has the cross-runtime `.agents/skills/brandon/` adapter. Reserve
fan-out for genuinely-disjoint work — a one-file change is a single inline Cody, not a fleet (CLAUDE.md rule).
This is what makes "default to Petey orchestration" a **mechanism**, not an aspiration.

## Closing integration

At bow-out, if the session completed its plan, Petey runs [Review & Recommend](review-recommend.md) to stage the next session. The output goes into the SESSION file's `Next session` section.

## Cross-references

- [Petey agent](../agents/petey.md) — role definition
- [Review & Recommend protocol](review-recommend.md) — pairs with this at bow-out
- [Opening ritual](../rituals/opening.md) — invokes this when task is unclear
- [Closing ritual](../rituals/closing.md) — invokes this to stage next session
- [Manual Boundary Registry](../knowledge/wiki/manual-boundary-registry.md) — input for next-target selection
