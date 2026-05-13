---
description: "Opening ritual — start a new session (v5.0)"
mode: "agent"
---

# Bow In — Opening Ritual

**Source of truth:** [`docs/rituals/opening.md`](../../docs/rituals/opening.md). Read and execute it as written. This file is a thin pointer plus the minimum binding steps so the ritual can't be skipped.

This ritual is agent-agnostic. When you stamp `last_agent` or describe the operator, name the agent that actually executed (e.g., `claude-session-NNNN`, `copilot-session-NNNN`, `codex-session-NNNN`).

## Minimum binding steps

Run in order. Skipping any of these is a FAILED_STEPS-grade miss.

1. **Read the latest SESSION file.** Highest-numbered `docs/sprints/SESSION_NNNN.md`. Read its `Goal`, `Open decisions / blockers`, and `Next session` section.
2. **Read WORKFLOW 5.0 + program plan.** [`docs/protocols/WORKFLOW_5.0.md`](../../docs/protocols/WORKFLOW_5.0.md) — find today's session calendar row, confirm primary lane and worktree, fill the Dirstarter alignment table. Skim [`docs/architecture/program-plan.md`](../../docs/architecture/program-plan.md) for context.
3. **Skim cross-references on demand only.** plan-vs-current, ADRs, runbooks, or the dirstarter-docs-inventory Alignment URLs — touch only the ones that bear on today's task.
4. **Check FAILED_STEPS + Drift Register.** [`docs/protocols/failed-steps-log.md`](../../docs/protocols/failed-steps-log.md) and [`docs/knowledge/wiki/drift-register.md`](../../docs/knowledge/wiki/drift-register.md). Acknowledge any `open` or `mitigated` entries in today's lane before proceeding.
5. **Graphify-first discovery for cross-area lanes.** Before any repo-wide text search, run `graphify stats` then `graphify query "<lane nouns>" --budget 2000` per [`docs/runbooks/graphify-repo-memory.md`](../../docs/runbooks/graphify-repo-memory.md). Open exact files Graphify identifies. Do **not** use `grep` / `rg` / `find` for task planning. If a path is already known, open it directly. Skip this step only for small, obvious, single-file tasks.
6. **Identify ONE task.** State the task, why it matters now (one sentence linking to program plan or user request), and what "done" looks like. If unclear or multi-part, invoke Petey ([`docs/protocols/petey-plan.md`](../../docs/protocols/petey-plan.md)) to plan first.
7. **Number tasks in TASK_PLAN_LOG.** For every task in the session plan, add or update an entry in [`docs/protocols/project-log.md`](../../docs/protocols/project-log.md) using stable IDs (`SESSION_NNNN_TASK_01`, `_TASK_02`, …) before implementation starts.
8. **Branch check.** `git branch --show-current` and `git status --short`. If on `main` and that's expected, proceed. If uncommitted changes from a previous session exist, raise them before starting new work. If on a stale feature branch, discuss with the user.
9. **Create the new SESSION file** at `docs/sprints/SESSION_NNNN.md` (next number after the previous one). **Always include JETTY 3.0 frontmatter:**

   ```yaml
   ---
   title: "SESSION NNNN — <short description>"
   slug: session-NNNN
   type: session--open
   status: in-progress
   created: <today>
   updated: <today>
   last_agent: <agent>-session-NNNN
   sprint: <current sprint, e.g. S6>
   pairs_with:
     - docs/sprints/SESSION_<previous>.md
   backlinks:
     - docs/knowledge/wiki/index.md
   ---
   ```

   Fill `Date`, `Operator` (`Brian + <agent>`), and `Goal`. Status stays `in-progress` until bow-out. Session type values at bow-in default to `session--open`; refine at bow-out to `session--plan`, `session--implement`, or `session--review` if the session was clearly one mode.

10. **State the goal and first task** before starting any work. Then proceed as Petey or Cody (Cody must complete [`docs/protocols/cody-preflight.md`](../../docs/protocols/cody-preflight.md) before writing any code).

## What this ritual is NOT

- Not a context dump — you're not loading every file in the repo.
- Not a checklist for the user — they can ask "are we ready to work" and trust the operator's bow-in.

## Cross-references

- [Opening ritual (source of truth)](../../docs/rituals/opening.md)
- [Closing ritual](../../docs/rituals/closing.md)
- [WORKFLOW 5.0](../../docs/protocols/WORKFLOW_5.0.md)
- [Graphify Repo Memory Runbook](../../docs/runbooks/graphify-repo-memory.md)
- [Project Log](../../docs/protocols/project-log.md)
- [Petey Plan protocol](../../docs/protocols/petey-plan.md)
- [Cody Pre-flight Protocol](../../docs/protocols/cody-preflight.md)
