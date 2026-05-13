---
title: Opening Ritual
slug: opening
type: protocol
status: active
created: 2026-04-25
updated: 2026-05-12
last_agent: copilot-session-0139
pairs_with:
  - docs/rituals/closing.md
  - docs/protocols/project-log.md
  - docs/runbooks/graphify-repo-memory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Opening ritual — bow in

Run this at the start of every session, before any code is touched.

> v5.0 refresh of the legacy `opening_v4.5.md`. Heavy machinery (JETTY metadata, multi-tier auto-load packs, session-numbered handoff packets) has been dropped. What remains is the operational core: load just enough context to act, then commit to one task.

## Agent-agnostic

This ritual is the source of truth for any agent that opens a session: Claude, Copilot, Codex, or otherwise. The ritual itself never depends on a specific LLM, IDE, or CLI. The trigger may differ per environment (Claude Code: `/bow-in` skill; Copilot/Codex chat: the words "bow in"; CLI script: a make target), but the steps below are identical and binding.

Convention for the `last_agent` SESSION-file field is `<agent>-session-NNNN` where `<agent>` names the LLM/runtime that ran the session (e.g., `claude-session-0031`, `copilot-session-0028`, `codex-session-0030`). Past sessions in this repo use whichever agent actually executed; do not rewrite history, only record yours accurately on the new SESSION file.

## Trigger

Any of: "Bow in" / starting a fresh session / opening a new chat / picking up after a break.

## Steps

### 1. Read the latest SESSION file

Find the highest-numbered file in `docs/sprints/`. That's the previous session.

Read at minimum:
- The previous session's `Goal` (was it achieved?)
- `Open decisions / blockers` (any block today?)
- `Next session: Goal` and `First task` (likely your starting point)

### 2. Read WORKFLOW 5.0 + program plan

[`docs/protocols/WORKFLOW_5.0.md`](../protocols/WORKFLOW_5.0.md) is the governing operating system for SESSION_0021 forward. Read:
- The **session calendar** — find today's session row, confirm the primary lane and main outcome.
- The **worktree map** — confirm which worktree this session operates in.
- The **Dirstarter alignment table** — you must fill this during bow-in.

Then skim [`docs/architecture/program-plan.md`](../architecture/program-plan.md) for broader context (partially superseded by WORKFLOW 5.0 but layered architecture and brand sequencing sections remain valid).

### 3. Skim relevant cross-references on demand

Only the ones that bear on today's task:
- [`docs/architecture/plan-vs-current.md`](../architecture/plan-vs-current.md) — if the task touches schema or data behavior.
- [`docs/architecture/decisions/`](../architecture/decisions/) — if the task touches an architectural choice.
- [`docs/runbooks/`](../runbooks/) — if the task involves the database, deploys, or environment.
- [`docs/knowledge/wiki/dirstarter-docs-inventory.md`](../knowledge/wiki/dirstarter-docs-inventory.md) — **Alignment URLs section.** If the task touches any of the 10 L1 areas (storage, payments, media, content, monetization, blog, auth, theming, Prisma, hosting), check alignment before proceeding.

Don't bulk-read. Reach for these as the work surfaces a need.

### 3b. Check FAILED_STEPS log + Drift Register

Read [`docs/protocols/failed-steps-log.md`](../protocols/failed-steps-log.md). Check for any `open` or `mitigated` entries in the area you're about to work in. If found, acknowledge the prior failure and confirm the mitigation is in place before proceeding.

Also skim [`docs/knowledge/wiki/drift-register.md`](../knowledge/wiki/drift-register.md) for open drift entries relevant to today's lane. If a drift item directly affects the task, note it in the SESSION file.

### 3c. Optional Graphify check for search-heavy lanes

Use [`docs/runbooks/graphify-repo-memory.md`](../runbooks/graphify-repo-memory.md) only when today's task is likely to cross multiple repo areas: component porting, Dirstarter updates, auth/payment/security review, hostile repo review, or old-monorepo mapping.

If `graphify-out/GRAPH_REPORT.md` exists and is current, read its high-signal sections and run one targeted query before raw grep. Record the query and selected files in the SESSION file if Graphify changes what you open.

Skip this for small, obvious, single-file tasks. Graphify is a navigation aid, not proof.

### 4. Identify ONE task for this session

State the task in chat (or in your notes) before you start. Be explicit:

- What is the task?
- Why this task now? (one sentence connecting to program plan or user request)
- What does "done" look like?

If the task is unclear, multi-part, or has unresolved decisions: invoke [Petey](../agents/petey.md) to plan first, using the [Petey Plan protocol](../protocols/petey-plan.md).

If the task is clear: invoke [Cody](../agents/cody.md) (or yourself) to execute. **Cody must complete the [pre-flight protocol](../protocols/cody-preflight.md) before writing any code.**

### 4b. Number tasks in TASK_PLAN_LOG

For every task in the session plan, add or update an entry in the [Project Log](../protocols/project-log.md) task plan section before implementation starts.

Use stable IDs:

```text
SESSION_NNNN_TASK_01
SESSION_NNNN_TASK_02
SESSION_NNNN_TASK_03
```

The SESSION file remains the detailed handoff. `TASK_PLAN_LOG` is the audit ledger that lets Giddy/Doug verify ownership, done criteria, status, and review coverage across sessions.

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
type: session--open
status: in-progress
created: <today>
updated: <today>
last_agent: <agent>-session-NNNN
sprint: <current sprint, e.g. S2>
pairs_with:
  - docs/sprints/SESSION_<previous>.md
backlinks:
  - docs/knowledge/wiki/index.md
---
```

**Session type values (SESSION_0139+):**

| Type | When to use |
| --- | --- |
| `session--open` | **Default at bow-in.** Use when the session scope isn't clear yet, or when it ends up being a mix of planning, implementation, and review. Stays as-is at bow-out if the session was mixed. |
| `session--plan` | Petey-led planning, gap analysis, task staging — no code written. Set at bow-out if the session was purely planning. |
| `session--implement` | Cody-led code execution against an existing plan. Set at bow-out. |
| `session--review` | Doug/Giddy-led QA, hostile review, test-only sessions. Set at bow-out. |
| `session` | Legacy (pre-0139). Do not use for new sessions. |

Refine `type` at bow-out: if the session was clearly one mode, narrow it. If it was mixed, leave it `session--open`. No backfill needed — old sessions stay `type: session`.

Then fill in `Date`, `Operator`, `Goal`. Set frontmatter `status: in-progress`. The rest gets filled during/at end of session.

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
- [WORKFLOW 5.0](../protocols/WORKFLOW_5.0.md) — governing operating system for SESSION_0021+; session calendar, lane model, worktree map.
- [Chat handoff protocol](../protocols/chat-handoff.md) — describes the SESSION file format.
- [Next Session Loading Order](../protocols/next-session-loading-order.md) — explicit tier-1/2/3 file load order at bow-in.
- [Cody Pre-flight Protocol](../protocols/cody-preflight.md) — enforceable checklist before writing any new component.
- [FAILED_STEPS Log](../protocols/failed-steps-log.md) — append-only record of SOP violations and corrective actions.
- [Graphify Repo Memory Runbook](../runbooks/graphify-repo-memory.md) — optional graph check for search-heavy lanes.
- [Project Log](../protocols/project-log.md) — unified build, task plan, and review ledger.
- [Petey Plan protocol](../protocols/petey-plan.md) — structured planning when the task is unclear or multi-part.
- [Repo Truth Index](../knowledge/wiki/repo-truth-index.md) — authoritative source map; consult when you're unsure which file to trust.
- [Petey](../agents/petey.md), [Cody](../agents/cody.md) — the roles you'll play next.