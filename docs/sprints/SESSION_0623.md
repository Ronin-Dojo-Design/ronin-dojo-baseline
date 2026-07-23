---
title: "SESSION 0623 — autonomous WL-clearing chain"
slug: session-0623
type: session--implement
status: staged
created: 2026-07-23
updated: 2026-07-23
last_agent: codex-session-0622
sprint: S12
lane: repo
recipe: ""
goal_ids: ["G-023"]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0622.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0623 — autonomous WL-clearing chain

> Pre-staged stub (ADR 0049), staged by SESSION_0622. Adopt at bow-in: flip `staged` →
> `in-progress`, run the canonical-occupancy check, then execute the `## Next session` block below.

## Operator

Brian + codex-session-0623

## Goal

Clear 3–6 small, self-contained, low-risk wiring-ledger items, then perpetuate the chain if safe WL debt remains.

## Next session

**Task — batch-clear low-risk wiring-ledger items (one commit each), then self-perpetuate.**

1. Read `docs/knowledge/wiki/wiring-ledger.md`.
2. Candidate = OPEN rows that are small, self-contained, and unambiguous: a component not mounted in its
   aggregator, a missing nav link, a missing unit test over an existing invariant, a behavior-preserving
   extraction, or a route with no backlink. Prefer P3 refactor-class + simple wiring rows.
3. Hard skip: WL-P3-24, WL-P3-37, WL-P3-54, WL-P3-55, WL-P2-77, WL-P2-78; anything needing a decision,
   schema/migration, auth/authz, cross-cutting refactor, >60 LOC / >3 files, research/recommend work, or
   `apps/web/e2e/**`.
4. Per item: Cody pre-flight → change → scoped `oxfmt` on changed app files → gates (`bun run typecheck`,
   `(cd apps/web && bun run lint:check && bun run format:check)`, focused tests when added/touched). If a gate
   fails, revert that item and move on.
5. Cap batch at 3–6 rows. Stop at a coherent handful or when no more safe items remain.
6. Bow out full, record `/ggr`, stage another WL-clearing stub if safe WL debt remains, commit but do not push.

First task: run `bun scripts/ledger-backlog.ts --ledger=WL --top=50`, verify current source for the first safe
P3 candidates before editing, and avoid stale rows already resolved in current code.

## Task log

<!-- filled at bow-in -->

## Status

Single source of truth is the frontmatter `status:` field.
