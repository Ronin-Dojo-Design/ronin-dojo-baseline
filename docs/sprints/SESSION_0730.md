---
title: "SESSION 0730 — Review + simplify the #376 rank-read seam (Fable → Codex); greenfield RankEntry"
slug: session-0730
type: session--staged
status: staged
created: 2026-07-31
updated: 2026-07-31
last_agent: claude-session-0729
sprint: S13
lane: bbl
recipe: "seq-review-wave"
goal_ids: ["G-011"]
tickets: ["#376", "#380"]
next_session:
pairs_with:
  - docs/sprints/SESSION_0729.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0730 — Review + simplify the #376 seam; greenfield RankEntry

> **Continuation of SESSION_0729** (not a fresh lane). #376 is **BUILT + verified LAUNCH-SAFE**
> (Doug 9.2/10, no P1) but **unmerged**, sitting in worktree `wt-0729-rank-seam` on branch
> `auto/session-0729-rank-read-seam` (63 files, WIP-committed locally, **NOT pushed**). This session
> reviews/simplifies it before the operator's merge. Adopt: continue in that worktree; flip
> `status:` → `in-progress`.

## Orchestration (operator-specified)

- **Fable = orchestrator.** **Hand off FULLY to Codex** to (a) attempt the simplification/refactor
  and offer review/refactor solutions, and (b) run **`/ggr` + code-quality + fallow-fix-loop** on
  the #376 diff. (Codex exec sandbox — mind the Keychain build wall; gates on Claude/foreground if
  codex can't build. See [[orchestration-and-lanes]].) Include a **hostile review** pass.

## Agenda

1. **Open with the greenfield question (the lens):** *If we wrote `RankEntry` from scratch today —
   no `RankAward` backlog, no migration bridge, no compat anchor — knowing everything it needs to be
   now, what is the SIMPLEST shape that still does the job?* Ask what the model, the two axes
   (`status` mutable / `provenance` immutable), and the fact-set (awardedAt/promoter/event) *should*
   have been in the first place, and how to simplify toward that while still shipping. Use the answer
   to grade the current seam, not to rewrite it blindly.
2. **Codex simplify + review:** refactor/simplification proposals on the #376 diff; then `/ggr` (QAR
   gate — ≥9.0 clears; Doug's 9.2 is the standing score to beat/confirm), code-quality-matrix, and
   fallow-fix-loop (CRAP/dupes/dead-code/complexity delta). Hostile-review the seam.
3. **MERGE GATE (do NOT merge without this):** re-run the orphan count against **live prod**
   (`RankAward` with no `RankEntry` — expect 0 per map #374 2026-07-30). **Blocked** until the
   `.env.prod` Neon credential is rotated (see the spawned chip; rotated in RDD, not yet BBL).
4. **Fold Doug's P2:** the unguarded 0-orphan invariant → design a runtime guard, routed to the
   **#380 cutover** lane (a 2nd award at an already-entried rank can never sync → permanent orphan).
5. **Housekeeping:** the migration folder + seam files were untracked (now WIP-committed) — confirm
   they ride the eventual PR; oxfmt/gates re-green after any Codex edits.

## Resolved upstream (do not re-open)

- #376 is behavior-parity-verified (Doug): trust-resolver no-flip, belt-gate provenance identical,
  ordering parity, no crash. The reviews here are for SIMPLIFICATION + confidence, not correctness
  re-litigation.
- Sequencing law (operator 0729): the RankAward correctness arc (#376 → cutover → #380 drop) is
  **BEFORE** the FI-001 send, never post-send ([[fi001-send-gated-on-correct-site]]).

## Also staged (candidate lanes — grill/plan, do NOT auto-execute)

- **Baseline-cut de-scope (BIG):** cut **Baseline Martial Arts + all non-lineage code/DBs** from this
  repo — courses/curriculum, programs, and anything not lineage. Operator (0729): barely-started, dead
  weight, dragging down what should be lineage-simple. Needs a grill/plan first (what exactly, DB
  disposition, dependency untangle, risk, the `apps/baseline` + Baseline seams). Likely its own lane.
- **CAND deepening candidates:** the 9 candidates from the SESSION_0711 `/improve-codebase-architecture`
  artifact (`claude.ai/code/artifact/dcd046d6-c770-42ac-81c3-80a3c44adfe2`) — re-verify post-fork
  applicability, wayfinder-chart, sequence. (DRY: reference the artifact, don't re-doc.)

## Baton (paste-ready)

```
/bow-in — CONTINUATION of #376 (SESSION_0729). Fable orchestrates; hand off FULLY to Codex.
Repo: black-belt-legacy (ONE repo, ADR 0059). Worktree ALREADY EXISTS: /Users/brianscott/dev/
wt-0729-rank-seam, branch auto/session-0729-rank-read-seam — do NOT create a new one. #376 is
BUILT + Doug-verified LAUNCH-SAFE (9.2), green (1953 tests), unmerged, HELD.

FIRST: the greenfield question — if RankEntry were written from scratch today (no RankAward
backlog/migration bridge), what's the simplest shape that still does the job? Grade the seam by it.
THEN Codex: simplification/refactor proposals + /ggr + code-quality + fallow-fix-loop + hostile
review on the #376 diff. Re-green all gates after edits.

MERGE GATE (AFK-NEVER without it): re-run the live-prod orphan count (0 expected) — blocked on the
.env.prod credential rotation. Fold Doug's P2 (unguarded 0-orphan invariant → #380 guard).

HOLD every push/merge for the operator's word. Also on deck (grill/plan only): the Baseline-cut
de-scope + the SESSION_0711 CAND deepening candidates.
```

## Next session

<!-- staged by 0730 at its own bow-out -->
