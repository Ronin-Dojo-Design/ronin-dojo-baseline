---
title: "SESSION 0462 — Platform: per-product CI + new-client scaffold script"
slug: session-0462
type: session--open
status: in-progress
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0459
sprint: S46
pairs_with:

  - docs/sprints/SESSION_0459.md
  - docs/runbooks/onboarding/new-client-runbook.md
  - docs/architecture/research-review-new-client-onboarding.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0462 — Platform: per-product CI + new-client scaffold

> **PRE-STAGED** by SESSION_0459 for a parallel dispatch (3 concurrent windows: 0460 / 0461 / 0462).
> This window owns **0462** — fill this file in during the session; do **not** create a new SESSION number.

## Date

2026-06-28

## Operator

Brian + claude-session-0462

## Goal

Platform hardening for the multi-product monorepo: (1) **per-product CI** so a `clients/*` change stops
firing BBL's `apps/web` Playwright ×3 matrix, and (2) a thin **`scripts/new-client-scaffold.ts`** for the
mechanical half of `/new-client-recipe`. Closes the two follow-ups SESSION_0459 surfaced.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Parallel session awareness

One of **3 concurrent windows** launched together:

- **SESSION_0460** — Mammoth Phase 2 — dir `clients/mammoth-build-crm` — DB `mammoth_dev`.
- **SESSION_0461** — BBL loop-board Phase B — dir `apps/web` — DB `ronindojo_prodsnap`.
- **SESSION_0462 (THIS)** — Platform — dirs `docs/`/`.github/`/`scripts/` — no DB — worktree `../ronin-0462` (branch `session-0462-platform`).

Touch ONLY `.github/workflows/**`, `scripts/**`, `docs/**` + this SESSION file. Do NOT edit `apps/web` or
`clients/*` **application** code (CI config + scripts + docs only). Shared collision surface = index docs —
append-only; on push reject, `git pull --rebase origin main` then retry (never force).

### Branch and worktree

- Branch: `session-0462-platform` · Worktree: `../ronin-0462` (own index — `git add -A` is safe here).
- DB: none.

### Bow-out cleanup (fold into the close)

At close, after the branch merges to `main`: `git worktree remove ../ronin-0462` then
`git branch -d session-0462-platform`. (Generic rule: closing.md §4.2.)

## Petey plan

### Goal

Give `clients/*` their own CI lane (no BBL e2e) + a dry-run-default scaffold script wired into the
new-client recipe.

### Tasks

#### SESSION_0462_TASK_01 — Per-product CI

- **Agent:** Cody
- **What:** a `clients-ci.yml` (or path-scope `ci.yml`/`playwright.yml`) so `clients/*` get their own
  typecheck/lint WITHOUT running BBL's e2e; ensure the `apps/web` matrix fires only on `apps/web/**` +
  shared roots. Document the matrix in the new-client-runbook.
- **Done means:** a `clients/*`-only change no longer triggers BBL's Playwright ×3.

#### SESSION_0462_TASK_02 — `scripts/new-client-scaffold.ts`

- **Agent:** Cody
- **What:** TS scaffolder (NOT Python) — copy the Mammoth structure, stamp the name, write `.env.example`,
  optional `createdb <name>_dev`. **Dry-run by default**; ⚠ SHOW before any real run (operator-script-caution).
- **Done means:** `--dry-run` prints the plan; a real run scaffolds a new `clients/<name>/`.

#### SESSION_0462_TASK_03 — Wire into the recipe

- **Agent:** Cody
- **What:** reference the script from the `/new-client-recipe` skill + `new-client-runbook` as the
  mechanical entrypoint; update the research-review (scaffold now exists).
- **Done means:** the recipe points at the script.

### Gates

Docs + CI config + scripts only → **FREE push** (no deploy, paths-ignored). Show the scaffold script
before any real run. One push at close, on the operator's "go".

### Scope guard

- Do NOT edit `apps/web` or `clients/*` application code. Do NOT create a real DB beyond a dry-run demo.
  Do NOT change BBL's deploy `ignoreCommand` without flagging it.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0462_TASK_01 | pending | per-product CI (clients/* off BBL's matrix) |
| SESSION_0462_TASK_02 | pending | scripts/new-client-scaffold.ts (dry-run default) |
| SESSION_0462_TASK_03 | pending | wire scaffold into /new-client-recipe + runbook |

## Next session

### Goal

TBD at bow-out (further platform/governance items, or onboard the next real client via the recipe).

### First task

TBD at bow-out.
