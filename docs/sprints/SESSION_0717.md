---
title: "SESSION 0717 — FS-0046: wire scripts/ typecheck into CI / pre-push gate"
slug: session-0717
type: session--staged
status: staged
created: 2026-07-28
updated: 2026-07-28
last_agent: claude-session-0716
sprint: S13
lane: repo
recipe: "seq-lane-build"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0716.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0717 — FS-0046: gate the root `scripts/` tree

> **Staged by SESSION_0716** (operator-elected next lane). Adopt: flip `status:` → `in-progress`.

## Goal

Close **FS-0046**: CI's `bun run --filter '*' typecheck` only covers the `apps/*` + `packages/*`
workspaces, so the root `scripts/` tree — which the bow-out gate runner (`state-of-project.ts`) and the
`/app/state` build both depend on — is **never typechecked by any gate**. A type error in a root script
merges green (SESSION_0716 was clean only because Doug hand-ran `tsc -p scripts/tsconfig.json`). Wire a
`scripts/` typecheck into CI and/or the pre-push gate, and prove it catches a seeded type error.

> **Operator note (SESSION_0716): do NOT author this CI gate from scratch.** The CI gates are
> **worked out in rdd-monorepo** (upstream-of-record for the process OS — ADR 0055/0059; portfolio-wide
> law lands there first and syncs down by cherry-pick). Check what RDD already has for the `scripts/`
> typecheck and **sync/cherry-pick it down**, don't reinvent it in BBL.

## First task

1. **Check RDD first:** look at how rdd-monorepo already gates the root `scripts/` tree (its CI
   workflow + any `scripts/` typecheck step). That is the source of truth — adopt it, don't re-derive.
2. Read `docs/protocols/failed-steps-log.md` FS-0046 · root `package.json` (`workspaces`) ·
   `scripts/tsconfig.json` · BBL's CI workflow (`.github/workflows/*`) · the pre-push hook — to see
   where the RDD gate slots in.
3. **Cherry-pick / port the RDD gate down** (fork-don't-rewrite; shared history since `ecefd008`),
   adapting only what's BBL-specific. Then **seed a deliberate type error in a scratch script and prove
   the gate fails on it**, remove the seed, and flip FS-0046 `open` → `mitigated` with the evidence.

## Next session

### Goal

### First task
