---
title: "Recipe — State Sweep (assess repo-state + ledger status/clean + autonomous-lane prep)"
slug: recipe-state-sweep
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: petey-state-sweep
recipe: state-sweep
pairs_with:
  - docs/protocols/recipes/PM_Planning_Lane.md
  - docs/protocols/recipes/lane.md
  - docs/knowledge/wiki/wiring-ledger.md
  - .claude/skills/wayfinder/SKILL.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - orchestration
  - recipe
  - assessment
---

# Recipe — State Sweep

A **read-first governance session**, not a plan and not a build. It answers three questions in one
pass and leaves the repo's status ledgers honest:

1. **What's the real state?** — survey every backlog ledger + the wayfinder maps and render a
   status snapshot (the State-of-the-Dojo / Wayfinder view).
2. **What's stale?** — find rows the code already contradicts (fixed-but-still-open, done-but-not-
   flipped) and **flip them in place** with evidence.
3. **What can run unattended?** — surface the fully-specified, disjoint, gate-able work and stage it
   as **launchable lane stubs** for an overnight autonomous fan-out.

It is the assessment sibling of the planning lane: [`PM_Planning_Lane`](PM_Planning_Lane.md) grills
open forks and stages *decided* work; State Sweep takes inventory, corrects the ledgers, and hands
off *already-decided* work — **it never grills and never builds product code.**

## Persona pack

- **Petey (assessor)** — reads the ledgers, renders status, ranks the autonomous shortlist. Does
  not build; does not grill; does not open forks.
- **operator** — receives the shortlist + status render; decides what to launch and when to land the
  ledger flips (they are the only one who commits under a shared canonical).

## Load-set

1. The backlog ledgers — `planning-ledger` · `wiring-ledger` (WL-P2/P3) · `goals-ledger` (G) ·
   `POST_LAUNCH_SOT` (FI) · `drift-register` (D) · `test-fail-fix-ledger` (TFF) ·
   `daily-bug-scan-ledger` (DBS) · the risk registers · `failed-steps-log` (FS).
2. The aggregators — `bun scripts/ledger-backlog.ts` (file ledgers) + `cd apps/web && bun
   scripts/board-backlog.ts` (the `KanbanCard` board, operator-ordered).
3. The wayfinder maps — `gh issue list --state all --label wayfinder:map` + per-map child tickets
   (`Part of #<map>`, `Blocked by:`, `Weight:`, `Agent:`); see [`wayfinder`](../../../.claude/skills/wayfinder/SKILL.md)
   preamble for the operations mapping. `gh` has `--jq` built in (no standalone jq on macOS).
4. Live-lane owned-file sets (from the in-flight sessions) — required to prove disjointness of any
   candidate before it is called autonomous.

## Steps

1. **`git fetch`; read from canonical.** Discovery is graphify-first; never assert a negative from an
   errored grep.
2. **Occupancy check FIRST.** `git status --porcelain` + `bash scripts/canonical-claim.sh check`.
   If the tree is dirty with another session's work, **canonical is held** — do NOT `git add -A`, do
   NOT commit under it; prepare all writes in the scratchpad and either isolate flips into a worktree
   or hold them for the operator (FS-0034/0035, [[canonical-occupancy-guard]]).
3. **Survey + render status.** Run the aggregators + wayfinder queries; render the status view
   (publish as an Artifact — inline widgets don't render for the operator, [[preview-via-published-artifacts]]).
4. **Autonomy triage.** Rank candidates against the bar: fully-specified (no open fork / no grill) ·
   gate-able without a human · disjoint from every live lane (prove the owned-file set) · not
   operator/secret/prod-gated. Behavior-preserving refactors, dead-code prunes, test-coverage lifts,
   mechanical conformance, and documented flake fixes are the sweet spot. **Staleness-verify every
   candidate against source before listing it** — a "fix" already on main is a flip, not a lane.
5. **Flip stale rows in place.** For each proven-stale row, edit its ledger: status → resolved, with
   the evidence (file:line) + the verifying session/pointer. Path-scoped writes only; preserve any
   fixed-width table alignment (the wiring-ledger rows are padded to a constant width).
6. **Stage the autonomous fan-out.** Write the surviving candidates as self-contained, copy-paste
   lane dispatch prompts ([`lane`](lane.md) load-set), pairwise-disjoint, with a suggested merge
   order — ready to launch in Codex/Claude overnight.
7. **Report + hold.** Deliver the status render + shortlist + flips + stubs. Push nothing; land the
   ledger flips only on the operator's word (and only when canonical is free).

## Minimum-output contract

1. **Status render** — the published Artifact link (wayfinder/State-of-Dojo snapshot, live counts).
2. **Autonomous shortlist** — ranked, each with: ledger id · owned-file set (disjointness evidence) ·
   model · recipe · exact gate · size.
3. **Stale flips** — the precise ledger edits (row → resolved + evidence), applied or staged-for-apply
   with the occupancy reason if held.
4. **Lane stubs** — N copy-paste dispatch prompts + the disjoint batch + merge order.
5. **Excluded-with-reason list** — candidates that carry a hidden fork / collision / are not specified,
   surfaced (not silently dropped) so the operator can veto.

## Cross-references

- [Recipe — PM Planning Lane](PM_Planning_Lane.md) — the grill-and-stage sibling (this one assesses
  and corrects; that one decides).
- [Recipe — Lane](lane.md) — the load-set each staged stub hydrates from.
- [Recipe — AM Coffee Merge Review](AM_Coffee_Merge_Review.md) — the morning side of an overnight
  fan-out this recipe stages.
- [wayfinder SKILL.md](../../../.claude/skills/wayfinder/SKILL.md) — the epic-map source for the
  status render.
- Memories: [[operator-drives-nothing-canonical]] · [[canonical-occupancy-guard]] · [[readpath-push-vs-pull-audit]]
