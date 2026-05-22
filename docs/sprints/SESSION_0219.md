---
title: "SESSION 0219 — Petey plan for @primoui/utils → @dirstack/utils migration"
slug: session-0219
type: session--open
status: in-progress
created: 2026-05-22
updated: 2026-05-22
last_agent: codex-session-0219
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0218.md
  - docs/sprints/petey-plan-0084.md
  - docs/protocols/project-log.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0219 — Petey plan for @primoui/utils → @dirstack/utils migration

## Date

2026-05-22

## Operator

Brian + codex-session-0219 (Petey planning)

## Goal

Stage a full migration plan for replacing `@primoui/utils` with `@dirstack/utils` across the current `apps/web` surface, with parallelizable task waves and clear persona handoffs.

## Bow-in notes

- **Previous session:** SESSION_0218 closed D-016 and explicitly deferred full `@primoui/utils` → `@dirstack/utils` migration (~90 files).
- **Branch/worktree:** `copilot/petey-plan-dirstack-utils`; working tree clean at bow-in.
- **WORKFLOW context:** lane fits Core platform governance + School operations/public UI execution support.
- **FAILED_STEPS check:** FS-0020 (Graphify-first) and FS-0024 (cwd discipline) acknowledged; graph query run before repo-wide search.
- **Drift register check:** D-007 remains unresolved (`package.json` identity rename) but does not block this lane.

## Graphify check

- **Graph status:** rebuilt/current (`6861 nodes / 13476 edges / 755 communities / 1297 files`).
- **Query used:** `npx -y @nodesify/graphify query "apps/web @dirstack/utils nav-link" --budget 1200`.
- **Verification note:** Used graph output to confirm this lane crosses admin, web, server, and shared lib surfaces before exact-file inspection/counting.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Shared utility imports in admin/web/server/lib surfaces (`@primoui/utils` legacy alias usage). |
| Extension or replacement | Replacement in place (`@primoui/utils` → `@dirstack/utils`) after prior starter uplift completion. |
| Why justified | Closes known deferred debt from SESSION_0218 and aligns runtime imports to current upstream utility package contract. |
| Risk if bypassed | Split utility API surface persists, raising maintenance and future uplift risk across ~100 import sites. |

## Petey plan

### Goal

Produce an execution-ready migration plan with bounded waves, parallelism map, and role assignments for safely replacing all `@primoui/utils` imports.

### Tasks

#### SESSION_0219_TASK_01 — Inventory and wave decomposition

- **Agent:** Petey + Giddy
- **What:** Create canonical import inventory and split files into low-risk wave groups (server, admin UI, public UI, shared libs/config/tests).
- **Done means:** Wave matrix exists with file counts, dependency hotspots, and recommended execution order.
- **Depends on:** nothing.

#### SESSION_0219_TASK_02 — Execution orchestration plan

- **Agent:** Petey
- **What:** Define the multi-session implementation plan (`petey-plan-0084.md`) with per-wave done criteria, verification gates, and merge/handoff protocol.
- **Done means:** Plan file committed with agent assignments and parallel/sequential boundaries.
- **Depends on:** SESSION_0219_TASK_01.

#### SESSION_0219_TASK_03 — Governance staging

- **Agent:** Petey
- **What:** Register this session’s task IDs in Project Log before implementation starts.
- **Done means:** `docs/protocols/project-log.md` includes SESSION_0219 task rows with statuses and review placeholders.
- **Depends on:** SESSION_0219_TASK_02.

### Parallelism

- Task 01 can fan out counting/triage by independent file groups.
- Tasks 02 and 03 are sequential governance outputs after Task 01 findings.
- Future implementation waves can run in parallel only on disjoint file sets with no shared exports.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0219_TASK_01 | Petey + Giddy | Planning decomposition and dependency/risk ordering. |
| SESSION_0219_TASK_02 | Petey | Single owner for lane orchestration and scope control. |
| SESSION_0219_TASK_03 | Petey | Governance ownership before execution handoff. |

### Open decisions

- Whether to execute full migration in one session or split by wave across multiple sessions.
- Whether to add temporary compatibility shim if `@dirstack/utils` export parity gaps appear.

### Risks

- Export mismatch between `@primoui/utils` and `@dirstack/utils` may require local call-site adaptations.
- High file count increases regression risk without strict staged verification.

### Scope guard

This session is planning and orchestration only. No production migration edits should start until the wave plan is approved.

### Dirstarter implementation template

- **Docs read first:** `docs/rituals/opening.md`, `docs/protocols/petey-plan.md`, `docs/runbooks/graphify-repo-memory.md`, `docs/protocols/failed-steps-log.md`, `docs/protocols/WORKFLOW_5.0.md` (checked 2026-05-22).
- **Baseline pattern to extend:** package-level utility import normalization already initiated in SESSION_0218 (`nav-link.tsx`).
- **Custom delta:** Repo-wide migration staging by lane/file group with explicit verification gates.
- **No-bypass proof:** This replaces a deferred legacy alias and aligns to the already-adopted `@dirstack/utils` package.

## Status

in-progress

## Open decisions / blockers

- User approval needed on execution shape: single-session full swap vs wave-by-wave implementation.

## Next session

- **Goal:** Execute Wave 1 and Wave 2 replacements with typecheck/lint/tests/build gates.
- **Inputs to read:** `SESSION_0219.md`, `petey-plan-0084.md`, `project-log.md` task plan rows.
- **First task:** Start Wave 1 server/lib import replacement and run gate checks.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0219_TASK_01 | planned | Inventory and wave decomposition for full import migration |
| SESSION_0219_TASK_02 | planned | Orchestration plan file with assignments and gating |
| SESSION_0219_TASK_03 | planned | Project Log task-plan registration |
