---
title: Opening Ritual
slug: opening
type: protocol
status: active
created: 2026-04-25
updated: 2026-04-26
last_agent: copilot-session-0007
health: 7
pairs_with:
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Opening ritual — bow in

Run this at the start of every session, before any code is touched.

> v5.0 refresh of the legacy `opening_v4.5.md`. Heavy machinery (JETTY metadata, multi-tier auto-load packs, session-numbered handoff packets) has been dropped. What remains is the operational core: load just enough context to act, then commit to one task.

## Trigger

Any of: "Bow in" / starting a fresh session / opening a new chat / picking up after a break.

## Steps

### 1. Read the latest SESSION file

Find the highest-numbered file in `docs/sprints/`. That's the previous session.

Read at minimum:
- The previous session's `Goal` (was it achieved?)
- `Open decisions / blockers` (any block today?)
- `Next session: Goal` and `First task` (likely your starting point)

### 2. Read the program plan (skim if seen, full if not)

[`docs/architecture/program-plan.md`](../architecture/program-plan.md). Find the current sprint row. Note the deliverable.

### 3. Skim relevant cross-references on demand

Only the ones that bear on today's task:
- [`docs/architecture/plan-vs-current.md`](../architecture/plan-vs-current.md) — if the task touches schema or data behavior.
- [`docs/architecture/decisions/`](../architecture/decisions/) — if the task touches an architectural choice.
- [`docs/runbooks/`](../runbooks/) — if the task involves the database, deploys, or environment.

Don't bulk-read. Reach for these as the work surfaces a need.

### 4. Identify ONE task for this session

State the task in chat (or in your notes) before you start. Be explicit:

- What is the task?
- Why this task now? (one sentence connecting to program plan or user request)
- What does "done" look like?

If the task is unclear, multi-part, or has unresolved decisions: invoke [Petey](../agents/petey.md) to plan first, using the [Petey Plan protocol](../protocols/petey-plan.md).

If the task is clear: invoke [Cody](../agents/cody.md) (or yourself) to execute.

### 5. Branch check

Verify the current git branch (`git branch --show-current`) and working tree status (`git status --short`).

- If on `main` and that's expected: proceed.
- If uncommitted changes from a previous session exist: raise them before starting new work.
- If on a stale feature branch: discuss with the user whether to merge/rebase/abandon before starting.

### 6. Create the new SESSION file

In `docs/sprints/`, create `SESSION_NNNN.md` (next number after the previous one). **Always include JETTY 3.0 frontmatter** at the top of the file:

```yaml
---
title: "SESSION NNNN — <short description>"
slug: session-NNNN
type: session
status: in-progress
created: <today>
updated: <today>
last_agent: copilot-session-NNNN
health: 5
sprint: <current sprint, e.g. S2>
pairs_with:
  - docs/sprints/SESSION_<previous>.md
backlinks:
  - docs/knowledge/wiki/index.md
---
```

Then fill in `Date`, `Operator`, `Goal`, `Status: in-progress`. The rest gets filled during/at end of session.

If you skip this step, you've also skipped the bow-out — the closing ritual depends on this file already existing.

### 7. Begin work

The opening ritual is done. From here forward, you are operating as Petey or Cody (or both, sequentially) for the duration of the session.

## Optional: brief alignment check

If anything in the previous SESSION file or the program plan looks stale or contradictory, raise it before starting work. Better to spend two minutes confirming than two hours building against the wrong understanding.

## What this ritual is NOT

- Not a context dump. You're not loading every file in the repo.
- Not a meta-philosophical exercise. Operator-side memory holds the philosophy; this ritual is just operational.
- Not a checklist for the user. The user can ask "are we ready to work" — that's a fine substitute for steps 1–3 if they trust the operator.

## Cross-references

- [Closing ritual](closing.md) — pairs with this; ends the session.
- [Chat handoff protocol](../protocols/chat-handoff.md) — describes the SESSION file format.
- [Next Session Loading Order](../protocols/next-session-loading-order.md) — explicit tier-1/2/3 file load order at bow-in.
- [Petey Plan protocol](../protocols/petey-plan.md) — structured planning when the task is unclear or multi-part.
- [Repo Truth Index](../knowledge/wiki/repo-truth-index.md) — authoritative source map; consult when you're unsure which file to trust.
- [Petey](../agents/petey.md), [Cody](../agents/cody.md) — the roles you'll play next.
