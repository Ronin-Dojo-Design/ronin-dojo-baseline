---
title: "Recipe — Review Wave (parallel Doug + Desi + Giddy on one commit)"
slug: recipe-review-wave
type: protocol
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0584
pairs_with:
  - docs/knowledge/wiki/agent-systems-map.md
  - docs/protocols/hostile-close-review.md
  - docs/protocols/recipes/lane.md
  - docs/protocols/recipes/merge-wave.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - orchestration
  - recipe
  - review
---

# Recipe — Review Wave

The source doc [`seq-review-wave`](../../../.claude/skills/seq-review-wave/SKILL.md) points at.
Generalizes the proven [agent-systems-map §5b epic lane recipe](../../knowledge/wiki/agent-systems-map.md#5b-epic-lane-recipe--the-multi-slice-buildverify-chain-session_0529-model-agnostic)
(SESSION_0529: 6 commits, 3 reviewers, 5 real defects caught pre-push, zero found after) into a
reusable card for reviewing ANY landed commit, single-lane or fan-out.

## Persona pack

- **Doug** — always. Gates re-run independently + failure-mode source review + live runtime UAT
  on a hermetic scratch DB when a runtime surface changed (never proof data in a shared dev DB).
- **Desi** — when member-facing or shared-primitive UI changed. Dispatch her **in** the wave, not
  at close — a P1 found at push time is a scramble, not a review (the SESSION_0529 lesson).
- **Giddy** — when structure moved: new files/dirs, protocol/ritual edits, ADR-worthy decisions,
  merge-strategy questions.
- All reviewers review the **same commit**; reviewers verify, they do not fix.

## Load-set

1. The commit/diff under review + the SESSION file's Task log (what it claims to have done).
2. The gotcha-encoded brief — the prior reviewer findings as **hard constraints** (named files +
   line-level mechanics), sourced from the previous SESSION's `Next session` block or lane memory.
3. Domain invariants relevant to the diff (e.g. technique-media no-leak, Rank.brand nullability) —
   pull from the lane's own gotcha floor, don't re-derive.

## Overlays

| Wave shape | When | Notes |
| --- | --- | --- |
| **Single-commit, same session** | Cody's build just landed inline | Doug alone is often enough; add Desi/Giddy only if their trigger condition fires |
| **Fan-out merge sweep** | N lanes landed in parallel | Giddy's disjointness re-check + a clean uncontended test rerun stand in for a per-lane Doug pass (contention-class flakes solo-proven green by each lane) |
| **Epic multi-slice** | a slice inside a longer epic | full 3-reviewer wave on the SAME commit per §5b — this is where the pattern was proven |

## Minimum-output contract

1. **Findings**, ranked P1 (blocks) / P2 (must-fix soon) / P3 (note), each with file:line and
   concrete evidence. A reviewer claim that fails re-verification is recorded as corrected, not
   silently dropped.
2. **Batched-fix resume** — the P1+P2 list (plus elected P3s) handed to the ORIGINAL builder in
   one batch, `SendMessage` resume when possible rather than a fresh agent.
3. **Delta re-verify** — re-run the gates the fixes could break + the specific reviewer probe for
   each fixed finding; refactors must prove behavior-preservation.
4. **Review log entry** per reviewer in the SESSION file: reviewed tasks, verdict, score,
   follow-ups routed (ledger row or fix) — unresolved findings become Proposed ledger edits, never
   silently dropped.
5. **Verdict** — GO / GO-WITH-NOTE proceeds to [merge-wave](merge-wave.md)'s push gate; NO-GO loops
   back to the batched-fix step. The push gate always waits for the operator's explicit word
   regardless of verdict.

## Cross-references

- [`seq-review-wave` SKILL.md](../../../.claude/skills/seq-review-wave/SKILL.md)
- [Agent Systems Map §5b](../../knowledge/wiki/agent-systems-map.md) — the proven root pattern.
- [Hostile Close Review](../hostile-close-review.md) — the score gate this wave feeds.
- [Recipe — Merge Wave](merge-wave.md) — what runs after a GO/GO-WITH-NOTE verdict.
