---
title: "SESSION 0192 — Vercel Env Parity Guard"
slug: session-0192
type: session--open
status: pending
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0191
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0191.md
  - docs/protocols/failed-steps-log.md
  - docs/runbooks/deployment.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0192 — Vercel Env Parity Guard

## Date

Pending next bow-in.

## Operator

Pending next bow-in.

## Goal

Add a Vercel env parity guard for FS-0023 so required variables can be checked across Production and Preview before PR deploys fail.

## Petey plan

### Goal

Create the smallest useful guard that detects required Vercel environment-variable scope drift without printing secret values.

### Tasks

#### TASK_01 — Env parity discovery and design

- **Agent:** Petey + Cody.
- **What:** Read FS-0023, deployment docs, `apps/web/env.ts`, and local Vercel CLI/API availability; choose script, runbook, or both.
- **Steps:**
  1. Use Graphify first for `Vercel env parity env.ts deployment FS-0023`.
  2. Directly read `docs/protocols/failed-steps-log.md` FS-0023, `docs/runbooks/deployment.md`, and `apps/web/env.ts`.
  3. Check whether `vercel` CLI is available and authenticated without printing secret values.
  4. Decide whether the first deliverable is a live checker, a dry-run/mockable checker, or a runbook procedure.
- **Done means:** The chosen implementation path is documented in the SESSION file before code edits.
- **Depends on:** nothing.

#### TASK_02 — Guard implementation

- **Agent:** Cody.
- **What:** Implement the selected parity guard with no secret output.
- **Steps:**
  1. If credentials are available, query variable names/scopes and report missing Production/Preview presence.
  2. If credentials are unavailable, land a dry-run/mockable script plus runbook usage instructions.
  3. Add a focused test or documented manual verification path.
- **Done means:** Running the guard locally either reports parity safely or clearly reports the credential/setup requirement.
- **Depends on:** TASK_01.

#### TASK_03 — Doug review and close

- **Agent:** Doug + Petey.
- **What:** Verify the guard does not print secrets, records FS-0023 coverage, and closes with evidence.
- **Done means:** SESSION_0192 closes with test/manual proof, project-log entry, wiki index update, git hygiene, and post-commit Graphify update.
- **Depends on:** TASK_02.

### Parallelism

TASK_01 is blocking because implementation depends on local Vercel capability. Once the path is chosen, Cody can own script/runbook changes while Doug reviews the no-secret-output surface.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey + Cody | Needs planning plus exact local capability check. |
| TASK_02 | Cody | Concrete implementation once the path is chosen. |
| TASK_03 | Doug + Petey | Security/release-readiness review plus closeout. |

### Open decisions

- Whether local Vercel credentials are available for a live parity check.
- Whether the repo should prefer a script, a deployment runbook command, or both.

### Risks

- Secret leakage: the guard must report variable names/scopes only, never values.
- Vercel API/CLI instability: if unavailable locally, do not block the session; land a mockable/dry-run path and document setup.

### Scope guard

No env value changes, no Vercel dashboard mutations, no deployment changes, and no secrets committed. This session only adds a guard/procedure unless the user explicitly asks for live Vercel edits.

## Status

pending
