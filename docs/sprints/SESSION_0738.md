---
title: "SESSION 0738 — fan-out: #398 FI-001 proof lane (A) + D-062 register extras (B) via recipe cards"
slug: session-0738
type: session--open
status: in-progress
created: 2026-08-02
updated: 2026-08-03
last_agent: claude-session-0738
sprint: S13
lane: bbl
recipe: "epic-plan"
status_note: "in-progress — Brian elected BOTH lanes (A unblocked); no SotD snapshot"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0737.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0738 — fan-out: #398 FI-001 proof (A) + D-062 register extras (B)

**Date:** 2026-08-03 · **Operator:** Brian + claude-session-0738

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

## Lane A — #398 discovery + Giddy /rr (DB separation)

- **Reframed, HELD (no prod change).** Confirmed the #398 defect LIVE (`DATABASE_URL`+`DIRECT_URL`
  scoped `Production, Preview` on the `ronin-dojo-baseline` project = BBL's, misnamed, git-connected
  to `black-belt-legacy`; only BBL is git-connected → Previews are BBL-only). Topology surprise: the
  project still owns stale MMB/Baseline/RDD prod domains (mid-cutover). Operator elected "separate BBL
  first" → ran **/rr** (seq-research-recommend) with Giddy.
- **Graphify prior-art:** `graphify query "per product database provisioning brand separation neon"`
  → ADR 0038, ADR 0057, `docs/runbooks/database/per-app-db-separation.md`, G-002, `new-brand-setup`.
- **Report:** `docs/reviews/2026-08-03-neon-brand-db-separation-rr.md`.
- **Recommendation (Giddy):** operator's instinct is **already ratified law** — claim the existing
  Neon project as BBL's (declare + env-scope, **no rename, no data move**), stand up a **new Neon
  project** per other brand as it cuts over, layer a **Neon Preview branch** to close #398. This is
  execution of G-002 Phase-2 cloud half, not a new ADR.
- **Key correction:** BBL's prod DB is **ONE multi-tenant DB** (Brand enum column, 136 models,
  ~40 brand-scoped), **not** per-brand databases — Baseline rows physically still inside (prodsnap
  `Rank`: 195 null/BBL, 20 Baseline, 1 BBL). "Claim as BBL" = declare now + purge foreign rows LATER
  (gated destructive lane).
- **Routing (pending operator ratify):** stage ONE next slice = **#398 Preview-isolation** (Neon
  Preview branch + Production-only env scoping + explicit preview-migration mechanism + throwaway
  additive-PR proof) — unblocks both the BBL claim and #380. Per-brand new projects / #380 drop /
  non-BBL purge stay BEHIND that proof gate. Note the single-multi-tenant-DB finding on G-002.

## Lane B — D-062 register extras (DONE)

- PR **#407** (branch `session-0738-d062-extras`, commit `b1ec7f60`). All 5 items done
  (verificationStatus→`z.nativeEnum(RankEntryStatus)` verified-safe; accessor extracted to
  `lib/belt/discipline-scope.ts`; `buildDescendantCounts` O(n) byte-identical; UTC `formatDate`;
  cosmetics). tsc/test/lint + `next build` green; `rank-award-read-guard` PASS. Pushed on operator's
  word; **merge held** for operator. Ledger findings to route at bow-out: verificationStatus field
  misnomer, 4× divergent formatDate helpers, `bootstrap.sh` missing custom-output `prisma generate`.

## Next session

- **Goal:** TBD at bow-out (leading candidate: the staged #398 Preview-isolation slice above).
- **First task:** TBD.
- **Kickoff prompt:** n/a — staged stub; hydrate at bow-in.
