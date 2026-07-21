---
title: "SESSION 0591 — L2: ledger wiring (PL + RLL/YLL/GPTLL → aggregator + router + deferral-guard)"
slug: session-0591
type: session--implement
status: in-progress
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0591
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

2026-07-20

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
| SESSION_0591_TASK_01 | done | Added PL/RLL/YLL/GPTLL/DBS to `LedgerCode`/`LEDGER_ORDER`/`LEDGER_FILES` in `ledger-parse.ts`; new `parseInlineStatusSectioned` handles the 5 ledgers' "ID — title — status" inline-heading convention (they carry no `- **Status:**` body line, unlike GL/D/FS/TD) |
| SESSION_0591_TASK_02 | done | Extended `deferral-guard.ts`'s `LEDGER_ID_RE` with `PL-\d{2,4}`/`RLL-\d{2,4}`/`YLL-\d{2,4}`/`GPTLL-\d{2,4}`/`DBS-\d{2,4}`; added 5 finding-router rows to `closing.md` §6.7 |
| SESSION_0591_TASK_03 | done | Documented the RLL/YLL/GPTLL → PL/G promotion path in closing.md §6.7 (link-ledger row status flips to `routed` + a pointer; `PL`/`G` stays SoT). Extended `apps/web/lib/loop-board/ledger-parse.test.ts` (already existed — mirrored its fixture-driven `describe("parseLedger", …)` pattern rather than creating a new file) with 5 new cases covering all 5 codes |

## What landed

Wired the 5 intake ledgers (created SESSION_0589) into the governance read-path: the
`ledger-backlog.ts` aggregator, the `deferral-guard.ts` tracked-id regex, and the closing.md §6.7
finding router now all recognize `PL`/`RLL`/`YLL`/`GPTLL`/`DBS`.

- **Row format discovery:** the 5 new ledgers do NOT follow the GL/D/FS/TD convention (level-3
  heading + a separate `- **Status:** …` body line). They embed the status inline in the heading
  itself — `### PL-001 — title — status` — so a new parser branch (`parseInlineStatusSectioned` +
  `splitHeadingWithInlineStatus`) was added rather than forcing them through the existing
  `parseSectioned`/`statusOf` path. The split happens on the LAST ` — `/` – ` (space-padded em/en
  dash) so hyphenated status words (`content-pending`, `fix-made`, `pending-merge`) never get
  mis-split — verified against real rows (`GPTLL-001`, `DBS-001`).
- **ID digit width:** all 5 codes use 3-digit ids (`PL-001`, `RLL-001`, `GPTLL-002`, `DBS-003`, …)
  per each ledger's "Row law" section — confirmed by reading the actual rows (`PL-001`..`PL-009`,
  `GPTLL-001`/`002`, `DBS-001`..`003`), not assumed from the docs' `0NN` shorthand.
  `deferral-guard.ts` uses `\d{2,4}` (matching the existing FS/D/FI/MB/TFF/TD pattern) rather than a
  hard 3-digit width, for the same headroom those codes already get.
- **Open/closed rule:** a row is closed (dropped from the backlog) when its inline status starts
  with `✅`, `done`, `resolved`, `fixed`, `rejected`, or `merged` — mirrors the existing `WL`
  ✅-exclusion convention. Verified live: `PL-004`/`PL-005` (both `✅ RATIFIED`) drop out of the `PL`
  backlog; `PL-001/002/003/006/007/008/009` (queued/planning/planned) stay in.
- **`LEDGER_ORDER` placement:** appended all 5 codes after `TD` (the existing last governance code)
  rather than interspersing — the brief's "e.g. after the existing governance codes" reading, kept
  simple and behavior-preserving for the 11 pre-existing codes' order/ranking.
- **Promotion path documented:** closing.md §6.7 now states the `RLL`/`YLL`/`GPTLL` → `PL`/`G`
  hydration — a captured row flips to `routed` + a pointer once triaged; the link-ledger row is
  provenance, not a duplicate tracker.

## Files touched

- `apps/web/lib/loop-board/ledger-parse.ts` — 5 new `LedgerCode`s, `LEDGER_ORDER`, `LEDGER_FILES`;
  `splitHeadingWithInlineStatus` + `isClosedInline` + `parseInlineStatusSectioned` helpers; 5 new
  `parseLedger` switch cases.
- `apps/web/lib/loop-board/ledger-parse.test.ts` — 5 new fixtures (`PLANNING`/`REDDIT`/`GPTLL`/`DBS`)
  + 5 new `it()` cases (16 total, all passing).
- `scripts/ledger-backlog.ts` — header comment "Ledgers scanned:" list + usage-line `--ledger=` code
  list. (`LEDGER_FILTER`'s type cast already referenced `LedgerCode` directly, so no separate literal
  union needed updating there.)
- `scripts/deferral-guard.ts` — `LEDGER_ID_RE` extended with the 5 new prefixes; comment updated.
- `docs/rituals/closing.md` — §6.7 finding-router table: 5 new rows + a promotion-path paragraph;
  §6.8 deferral-guard prose's recognized-prefix list updated.
- `docs/sprints/SESSION_0591.md` — this file (Date, Task log, What landed, Files touched).

## Next session

### Goal

### First task
