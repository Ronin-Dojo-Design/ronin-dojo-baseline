---
title: "SESSION 0723 — Scale overnight orchestrator (~5 lanes) → BBL claim-loop lanes"
slug: session-0723
type: session--staged
status: staged
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0720
sprint: S13
lane: bbl
recipe: "overnight-orchestrator-waves"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0720.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0723 — Scale the overnight orchestrator to ~5 lanes, pointed at BBL claim-loop work

> **Staged by SESSION_0720** (operator elected option 1 → option 3: scale the now-proven
> orchestrator and use it to drive the north star). Adopt: flip `status:` → `in-progress`.
> This is a **PLAN-first** lane — the 2-lane pilot proved the machinery (dispatch half @ 0635,
> morning half @ 0720); scaling needs DISCOVERY before dispatch, so do NOT skip to lane prompts.

## Goal

Scale overnight orchestration from 2-lane / 1-wave to **~5 lanes / multi-wave**, dispatching **BBL
product / claim-loop** lanes — the verified-lineage claim loop is the asset/moat ("optimize the
claim loop above all", CLAUDE.md north star) — rather than more process tooling.

## First task — Petey discovery + slice (BEFORE any dispatch)

1. Open the BBL SoT set FIRST (opening.md §0): `docs/product/black-belt-legacy/` — `BBL-SOT-Spec.md`
   · `SOT-ADR.md` (D1–D7) · `PRD.md` · `STORIES.md` · `CUTOVER_CHECKLIST.md` · `GAP_MATRIX.md`
   (stale — re-verify live).
2. Query the ledgers/backlog for un-started claim-loop work: `bun scripts/ledger-backlog.ts`, board
   `apps/web/scripts/board-backlog.ts`; Graphify-first for cross-area discovery.
3. Slice ~5 genuinely-disjoint lanes — **prove pairwise-empty owned-file sets before dispatch.**
   Claim-loop code is NOT trivially disjoint (shared payloads / read-models / entitlement gates), so
   expect **fewer, better-bounded lanes** rather than forcing exactly 5.
4. Pin every operator fork at bow-in (grill first). Fork b still holds: anything touching
   money / entitlements / live email / prod-DB migrations is **AFK-NEVER** (SESSION_0719/0720).
5. Dispatch per [`overnight-orchestrator-waves`](../protocols/recipes/overnight-orchestrator-waves.md):
   worktree-per-lane, HARD-RULES preambles, REAL_EXIT foreground gates, ~5-lane concurrency cap +
   foreground gates (SESSION_0681), push + PR then STOP. **Merge owner = the operator** (or a
   designated attended AM session) — lanes and the orchestrator NEVER merge.

## Carry-over from SESSION_0720

- **Routed UPSTREAM (NOT a BBL-repo lane — ADR 0059):** ratify "synced skills carry no repo name" as
  an ADR in **rdd-monorepo** (D-056); reconcile the D-053 "hardlink" → "symlink" wording (D-057). Do
  these in an rdd-monorepo session, not here.
- Pre-existing open PR **#361** (bbl-settings-parity) is unrelated to this lane — triage separately
  (`/pr-fix-loop`) or leave for its own session.

## Next session

### Goal

### First task
