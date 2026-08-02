---
title: "SESSION 0738 — fan-out: #398 FI-001 proof lane (A) + D-062 register extras (B) via recipe cards"
slug: session-0738
type: session--open
status: staged
created: 2026-08-02
updated: 2026-08-02
last_agent: claude-session-0737
sprint: S13
lane: bbl
recipe: "epic-plan"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0737.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0738 — fan-out: #398 FI-001 proof (A) + D-062 register extras (B)

**Date:** <YYYY-MM-DD> · **Operator:** Brian + <agent>-session-0738

## Goal

Run two genuinely-disjoint lanes in parallel worktrees as a **fan-out / recipe-cards** session
([`recipes/epic-plan.md`](../protocols/recipes/epic-plan.md), one recipe card per lane; the
[`fan-out-session-recipe.md`](../protocols/fan-out-session-recipe.md) §1 disjointness test is met —
billing/migration-proof vs belt/lineage cleanup are distinct file sets):

- **Lane A — #398 FI-001 proof lane.** FI-001 critical path is #398 → #380 → cutover. **#398 is/was
  BLOCKED ON USER** (Vercel/Neon dashboard steps only Brian can run). Confirm the unblock status FIRST;
  if still blocked, hold A and run B solo. Baton inputs are pre-filled in `SESSION_0734.md`
  `## Next session` (#398, #380, D-058, RISK-16, `apps/web/scripts/prebuild-migrate.ts`).
- **Lane B — D-062 register EXTRAS** (all behavior-preserving except where noted):
  `schemas.ts:98` `z.string()`→enum on `verificationStatus` (**verify no valid trust value is excluded
  first** — this one can change behavior if the enum is narrower than live data); the
  first-in-discipline-else-`[0]` accessor extraction triplicated across `belt-gate.ts:41,209` /
  `member-ranks.ts:119` / `canvas-model.ts:77`; `canvas-model.ts:336` `buildDescendantCounts` O(depth)
  `new Set(seen)` per node → documented O(n); the non-UTC `formatDate` off-by-one
  (`promoter-change-modal:55`); cosmetics (`queries.ts:82` orphan doc-comment, `schemas.ts:11` `cuid`
  misnomer, `promoter-proposal-core.ts:216` `while(true)` max-iter guard).

## Status

Frontmatter `status:` is the single source of truth (staged → in-progress at bow-in).

## Bow-in

- Previous session: `docs/sprints/SESSION_0737.md` — closed the 4 staged D-062 clusters (PR #406) +
  proved WL-P2-83 GATE CLEAR. This session takes the remaining register extras + the #398 proof lane.
- Read first: `docs/knowledge/wiki/drift-register.md` §D-062 (Still-OPEN list) + `recipes/epic-plan.md`
  + the #398 baton in `SESSION_0734.md` `## Next session`.
- **Fan-out guard:** each lane gets its OWN `../ronin-NNNN` worktree + branch (worktree-isolation law);
  do not co-edit canonical. Lane A is DB/deploy-shaped (foreground gates + operator-gated dashboard
  steps); lane B is pure-cleanup (behavior-preserving, verify vs the frozen RankAward/#380 seam).

## Next session

- **Goal:** TBD at bow-out.
- **First task:** TBD.
- **Kickoff prompt:** n/a — staged stub; hydrate at bow-in.
