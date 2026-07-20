---
title: "SESSION 0591 — L2: ledger wiring (PL + RLL/YLL/GPTLL → aggregator + router + deferral-guard)"
slug: session-0591
type: session--implement
status: staged
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
sprint: S12
lane: repo
recipe: lane
goal_ids: [G-024]
tickets: []
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/sprints/SESSION_0589.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0591 — L2 ledger wiring + link-intake ledgers

> **Pre-staged stub (ADR 0049), planned SESSION_0589.** Reservation branch
> `session-0591-ledger-wiring`. Adopt: FS-0030, ff to main, flip status. **Scripts + docs — free
> push** (no `apps/web` change; but `scripts/` + a parser test → run `bun run test` on the touched
> lib). Disjoint from L1 (owns `scripts/*` + ledger files; L1 owns North Star docs).

## Date

<fill at adopt>

## Operator

Brian + <agent>-session-0591

## Goal

Wire the four already-created intake ledgers into the governance plumbing so the aggregator, the
finding router, and the deferral-guard know about them. **The ledger FILES already exist** (created
SESSION_0589: `planning-ledger.md` + `reddit-/youtube-/chatgpt-links-ledger.md`) — this lane wires
their **codes**.

**Pinned decisions (SESSION_0589 — do NOT re-open):** three SEPARATE link-ledger files (not one
combined); repo-side is SoT (ADR 0048); codes = `PL` `RLL` `YLL` `GPTLL` **+ `DBS`** (daily-bug-scan
findings ledger, also created SESSION_0589 — wire its code the same way).

**Owned files (disjoint set):**
- `scripts/lib/*` — the `LEDGER_FILES` map + `FILE_LEDGER_ORDER` + the `LEDGER_FILTER` union type
  (find where `ledger-backlog.ts` imports them). Add the 4 codes → their files.
- `scripts/ledger-backlog.ts` — header comment "Ledgers scanned:" list + the `--ledger=` union.
- `scripts/deferral-guard.ts:49` — extend the tracked-prefix regex with `PL-\d+`, `RLL-\d+`,
  `YLL-\d+`, `GPTLL-\d+`, `DBS-\d+`.
- `docs/rituals/closing.md` §6.7 — add a finding-router row: planning/idea intake → `planning-ledger`
  (`PL-NNN`); captured link → the matching link-ledger.
- A parser unit test for the new codes if the lib has a test (mirror `state-of-project-parse.test.ts`).

**Also (bundled from PL-002):** define how `RLL/YLL/GPTLL` rows **hydrate into goals-ledger** (the
promotion path — a captured row, once triaged, points to a `PL`/`G` row). Document in the ledger
headers (already stubbed) + closing §6.7.

**Non-goals:** no feature-widget UI (L3); no vault-side capture mechanics (PL-008).

## First task

Adopt per ADR 0049; read `scripts/ledger-backlog.ts` + the lib it imports + `deferral-guard.ts`
before editing. Verify the aggregator lists PL/RLL/YLL/GPTLL after wiring (`bun scripts/ledger-backlog.ts`).

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0591_TASK_01 | pending | Add PL/RLL/YLL/GPTLL codes to ledger-backlog lib + aggregator |
| SESSION_0591_TASK_02 | pending | Extend deferral-guard regex + closing §6.7 router row |
| SESSION_0591_TASK_03 | pending | Document RLL/YLL/GPTLL → PL/G hydration path + parser test |

## Next session

### Goal

### First task
