---
title: "SESSION 0192 — Vercel Env Parity Guard"
slug: session-0192
type: session--implement
status: closed-quick
created: 2026-05-17
updated: 2026-05-17
last_agent: copilot-session-0192
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

2026-05-17

## Operator

Brian + copilot-session-0192

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

closed-quick

## What landed

- `scripts/check-vercel-env-parity.ts` — Bun script that parses required vars from `apps/web/env.ts` and compares against `vercel env ls` scopes. Reports names/scopes only, never values. Supports `--dry-run`.
- Deployment runbook updated with "Env Parity Guard (FS-0023)" section and usage instructions.
- Live check confirmed all 5 required vars present in both Production and Preview.

## Files touched

- `scripts/check-vercel-env-parity.ts` (new)
- `docs/runbooks/deployment.md` (added Env Parity Guard section)
- `docs/protocols/project-log.md` (SESSION_0192 entries)
- `docs/sprints/SESSION_0192.md` (this file)

## Decisions resolved

- **Implementation path:** Live checker script using `vercel env ls` CLI (not API). Vercel CLI is installed and authenticated locally.
- **Scope:** Script + runbook section. No CI integration this session.

## Open decisions / blockers

- Whether to add this check to CI (needs Vercel token as GitHub secret).
- Whether to update FS-0023 status from `mitigated` to `closed` now that the guard exists.

## Next session

- **Goal:** TBD — check program-plan.md for next S6 priority.
- **Inputs to read:** `docs/architecture/program-plan.md`, latest SESSION file.
- **First task:** Bow-in, read plan, pick next task.

## Task Log

| Task ID | Status |
| --- | --- |
| SESSION_0192_TASK_01 | complete |
| SESSION_0192_TASK_02 | complete |
| SESSION_0192_TASK_03 | complete |

## Review Log

### SESSION_0192_REVIEW_01 — Doug security review

- **Reviewed tasks:** TASK_01, TASK_02, TASK_03.
- **Secret leakage check:** Script only reads `vercel env ls` output which shows "Encrypted" for all values. Variable names and scope labels are the only data surfaced.
- **Dry-run verification:** `--dry-run` mode exits before any Vercel API call.
- **Live verification:** All 5 required vars confirmed present in both Production and Preview scopes.
- **Verdict:** Pass — no secrets exposed, guard works as designed.

## Hostile close review

- **Did the session expand scope?** No — script + runbook only, as planned.
- **Are there uncommitted changes?** Pending git hygiene below.
- **Is the project-log gate satisfied?** Yes — 3 task entries added.

## ADR / ubiquitous-language check

No new ADRs needed. No new domain terms introduced.
