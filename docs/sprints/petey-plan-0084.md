---
title: "Petey plan 0084 — @primoui/utils → @dirstack/utils full migration"
slug: petey-plan-0084
type: petey-plan
status: active
created: 2026-05-22
updated: 2026-05-22
last_agent: codex-session-0219
pairs_with:
  - docs/sprints/SESSION_0219.md
  - docs/sprints/SESSION_0218.md
  - docs/protocols/project-log.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey plan 0084 — @primoui/utils → @dirstack/utils full migration

## Context

SESSION_0218 closed the Base UI migration and deferred full replacement of legacy `@primoui/utils` imports. Exact-file count now shows widespread usage across `apps/web` with only initial adoption in `components/web/ui/nav-link.tsx`.

## Goal

Complete a safe, repo-wide replacement of `@primoui/utils` imports with `@dirstack/utils` (and required call-site updates) without regressing runtime behavior.

## Wave plan

### Wave 0 — Preflight and contract check

- Confirm export parity between `@primoui/utils` and `@dirstack/utils`.
- Capture any non-parity APIs and map required call-site rewrites.
- Freeze migration rules (no opportunistic refactors).

### Wave 1 — Server/lib/core surfaces

- Scope: `apps/web/lib/**`, `apps/web/server/**`, config/runtime helpers.
- Why first: catches contract/type mismatches early with low UI noise.
- Exit gate: typecheck + targeted server tests pass.

### Wave 2 — Admin UI surfaces

- Scope: `apps/web/app/admin/**`, `apps/web/components/admin/**`.
- Strategy: batch by feature folders to keep diffs reviewable.
- Exit gate: typecheck + lint + admin smoke path checks pass.

### Wave 3 — Public UI + shared component surfaces

- Scope: `apps/web/app/(web)/**`, `apps/web/components/web/**`, `apps/web/components/common/**`, `apps/web/emails/**`.
- Strategy: split by folders with no shared component overlap.
- Exit gate: typecheck + lint + tests + build pass.

### Wave 4 — Cleanup and closure

- Remove remaining `@primoui/utils` dependency references from manifests/lockfiles where applicable.
- Residual sweep for zero `@primoui/utils` imports.
- Update SESSION + project-log + drift/ADR notes only if required by findings.

## Task assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| Wave 0 contract check | Petey + Giddy | Architecture/risk framing before edits |
| Wave 1 implementation | Cody | Low-risk mechanical import migration |
| Wave 2 implementation | Cody + Desi (review) | Admin UX-sensitive surfaces need consistency check |
| Wave 3 implementation | Cody + Desi (review) | Public UI parity and composition verification |
| Wave 4 closure | Doug + Petey | Hostile validation + governance close |

## Parallelism rules

- Allowed in parallel: disjoint folders with no shared exports/import chains.
- Must be sequential: shared component primitives, shared lib helpers, package manifest edits, and final lockfile reconciliation.

## Done criteria

- Zero `@primoui/utils` imports in `apps/web/**`.
- All migration gates pass: typecheck, lint, tests, build.
- Project log task entries and SESSION evidence updated for each execution session.

## Risks

- `@dirstack/utils` API mismatch could require non-mechanical rewrites.
- Batch size drift can make diffs unreviewable; wave caps must be enforced.
- Lockfile/dependency churn can cause noisy conflicts if mixed with unrelated work.

## Scope guard

This plan covers utility import migration only. No unrelated feature or UX refactors during replacement waves.
