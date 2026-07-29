---
title: "SESSION 0719 — FS-0046 scripts/ typecheck gate + strip cold-compile e2e paper-overs"
slug: session-0719
type: session--staged
status: staged
created: 2026-07-29
updated: 2026-07-29
last_agent: claude-session-0718
sprint: S13
lane: bbl
recipe: "seq-lane-build"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0718.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0719 — scripts/ typecheck gate + cold-compile paper-over strip

> **Staged by SESSION_0718** (operator elected both lanes at bow-out). Adopt: flip `status:` →
> `in-progress`. Two lanes; both unblocked now that the required-check gate + prod-build e2e are on `main`.

## Goal

Close the two remaining CI/e2e-quality follow-ups the SESSION_0717/0718 work surfaced.

## Lanes

### Lane 1 — FS-0046: root `scripts/` tree isn't typechecked in CI

The `typecheck` gate is workspace-scoped (`apps/*` + `packages/*`); root `scripts/` is not a workspace
and no gate runs `tsc -p scripts/tsconfig.json --noEmit` — so a type error in any root script (incl.
`state-of-project.ts`, which the bow-out gate runner + `/app/state` depend on) merges green. Add a
`scripts/` typecheck step to `ci.yml` (extend the existing `typecheck` job, or a small dedicated job)
so it's covered by the now-**required** `CI complete` gate. See [FS-0046](../protocols/failed-steps-log.md#fs-0046).

### Lane 2 — strip the cold-compile e2e paper-overs (prove-before-deleting)

Prod-build e2e (SESSION_0717 P1) + the required gate (0718) are on `main`, so the JIT cold-compile
flake the paper-overs masked should be gone. Strip the 8 paper-overs — the TFF-008 warm pre-hit, the
20s→40s redirect bump, and the `test.slow()`/oversized timeouts in `authenticated-lifecycle` /
`users-account-actions` / `admin-collection-conformance` / `bracket` / `scoring` / `public-rank-redaction`
— using **N green prod-build runs on `main` as evidence** before removing each (re-measure
`registration.spec.ts`'s 45s first — partly cold-mutation, not pure JIT). **Also fix** the
lineage-lifecycle fixture stale-cleanup order (SESSION_0718 finding 4): `cleanupTaggedLineageFixtures`
deletes `Rank` before its `RankAward` (RESTRICT FK) → errors on leftover data from an interrupted run.

## Still open (carry, do not auto-pick)

- **RDD upstream fail-closed fix** — the rdd-monorepo umbrella gate has the same fail-open edge BBL
  hardened in 0718; baton delivered. Cross-repo (ADR 0059 — its own session), not a BBL lane.

## Next session

### Goal

### First task
