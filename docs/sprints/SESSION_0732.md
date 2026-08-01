---
title: "SESSION 0732 — #377 CI rank-read guard"
slug: session-0732
type: session--staged
status: staged
created: 2026-08-01
updated: 2026-08-01
last_agent: codex-session-0731
sprint: S13
lane: bbl
recipe: "seq-lane-build"
pairs_with:
  - docs/sprints/SESSION_0731.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0732 — #377 CI rank-read guard

> **Staged by SESSION_0731.** Adopt: flip `status:` → `in-progress`. #376/#397 is merged and the
> polish wave is complete; #380 remains separately blocked on #398. PR-only main and explicit
> per-push authorization remain binding.

## Goal

Build #377: mechanically fail new direct `RankAward` display/read roots while preserving the
temporary RankAward write, compatibility-sync, and fact-anchor joins until #380. Adopt or explicitly
classify the contract-only `member-ranks.ts` seam; keep the ADR 0035/0058 display law intact.

## First task

1. Run the FS-0024 repo/remote guard and read issue #377, map #374, ADR 0058, FS-0049, the tracked
   githook framework, and current CI jobs.
2. Inventory every existing `RankAward` reference and classify allowed write/bridge/fact-anchor
   uses versus forbidden member-rank display reads.
3. Build the tracked hook + CI guard with a negative fixture that proves a new forbidden read fails;
   run hook doctor, unit/type/lint/build gates, then hold the push for operator authorization.

## Next session

### Goal

Run the #380 one-table fold grill only after #398 supplies the required preview-environment proof.

### First task

Re-check #398 blocker evidence and the four ratified #380 forks before authorizing schema work.
