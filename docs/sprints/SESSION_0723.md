---
title: "SESSION 0723 — Scale overnight orchestrator (~5 lanes) → BBL claim-loop lanes"
slug: session-0723
type: session--implement
status: closed
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0723
sprint: S13
lane: bbl
recipe: "overnight-orchestrator-waves"
goal_ids: []
tickets: []
next_session: docs/sprints/SESSION_0727.md
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

## Goal verdict

**EXTENDED — YES + more.** The "~5-lane North Star" ask honestly resolved to **3 genuinely-disjoint
claim-loop lanes** (Petey slice proved pairwise-empty; the other candidate seeds were already-built,
already-wired, or migration-bound — exactly the "expect fewer" the plan predicted). All three shipped:
A #368 (rank-status trust badge), C #369 (read-only tree-ACL viewer), B #367 (related-profiles rail).
Beyond the dispatch: a full `/ggr` review→fix loop per lane, CI-green, MERGED to main A→C→B on the
operator's word; caught + fixed a retired-`RankAward` model read (ADR 0058) in B; lit B's rail 0→78/78
(disc-OR-tree, operator-approved, proven on real roster data); and staged the RankEntry-unification
Wayfinder epic (SESSION_0727).

## What landed

- **A #368** → `fc9eb226` — `RankEntry.status` verification badge on public profile rank rows (privacy
  cap held: status enum only, no reviewer/evidence leak); Tooltip disambiguation vs the aggregate hero
  badge; shared `trust-badge-status-rows`.
- **C #369** → `681466d4` — read-only ACL viewer on the admin lineage tree page; extracted the
  triplicated `treeAdminScopeWhere` security predicate (CRAP 42→30) + a 5-case scoping test.
- **B #367** → `8b86671e` — related-profiles rail; **RankEntry** (not the retired RankAward)
  top-discipline; **disc-OR-tree** heuristic (operator decision) → rail 0→78/78; MCard-roster parity;
  paywall e2e scoped around the new rail.

## Review log (`/ggr` per lane, code-quality-matrix)

| Lane | PR | Composite | Caps | Notes |
| --- | --- | --- | --- | --- |
| A | #368 | **9.4** | none | privacy cap PASS; DRY dup fixed; field tested |
| B | #367 | **~9.2** | Dirstarter-reuse (resolved) | MCard parity restored; RankEntry fix; rail lit; paywall-e2e reconciled |
| C | #369 | **9.4** | none | read-only + authz PASS; security predicate de-duped + tested |

**Systemic health:** CI = green (all 3 PRs; unit-tests passed on CI's fresh DB, confirming the lineage
test-gate breakage is local-only) · findings routed 7/7 (below) · FS patterns: FS-0049, FS-0050 (new).

## Findings routed

- **`top-ranked-queries.ts` stale `RankAward` read** (ADR-0058 read violation; live black-belt-rail) → **SESSION_0727 Q-④** (ADR-0058 read-sweep + guard).
- **Review-process miss** — the review wave validated B's query *shape* against the retired `RankAward` model without flagging the deprecation; the operator caught it → **FS-0049**.
- **Subagent push-auth guard inconsistency** — A+B self-opened PRs on a relayed authorization; C's guard correctly refused the relay → **FS-0050**.
- **Lineage test-gate breakage** (`slice(0,16)` Discipline collision + P2002/P2034 concurrency flakes) → chip `task_6beb8b80` + **SESSION_0727 Q-⑤**.
- **BBL roster has 0 rank rows in either model** (rail dark-until-data) → RankEntry-epic Wayfinder + backfill, **SESSION_0727**.
- **disc-OR-tree related-profiles heuristic** (operator-approved; discipline branch inert until RankEntry backfill) → recorded here + SESSION_0725; revisits when the backfill lands.
- Minor: A long-history badge spot-check + hex/aria drift; B `findRelatedProfiles` decomposition (CRAP 56) + `ListingDetail` `related`-slot → **SESSION_0727 polish fold-in**.

## Reflections

- "5 lanes" is a target, not a truth — the honest slice was 3, and saying so up front (vs manufacturing 5) was the right call (matches the 0723 plan's "expect fewer").
- The gate + CI watch earned their cost twice: the retired-model read and the rail↔paywall interaction were both invisible to source review alone; **operator domain knowledge + live CI were the catchers** (the FS-0049 lesson).
- The subagent push-auth guard treating a coordinator relay as non-consent is *correct* safety — but it fired inconsistently across identical lanes (FS-0050), so the orchestrator (holding the operator's real word) should own the push/PR for held lanes rather than relaying it.

## Next session

**SESSION_0727** — chart the RankEntry-unification Wayfinder (HITL) + size the roster backfill + stage the
two autonomous `quick` lanes. Staged with the `/ppp` baton — see [SESSION_0727](SESSION_0727.md).
