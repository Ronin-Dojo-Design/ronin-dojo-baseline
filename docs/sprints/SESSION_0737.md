---
title: "SESSION 0737 — D-062 burndown: belt/lineage polish (dup memberTopRank, drawer test/dead-export, :117 cast + enum-mirror)"
slug: session-0737
type: session--open
status: in-progress
created: 2026-08-02
updated: 2026-08-02
last_agent: claude-session-0737
sprint: S13
lane: bbl
recipe: "fallow-fix-loop"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0736.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0737 — D-062 burndown: belt/lineage polish

**Date:** 2026-08-02 · **Operator:** Brian + claude-session-0737

## Goal

Burn down the remaining (behavior-preserving) D-062 findings now that the billing-fragile item is
fixed (SESSION_0736 / PR #405): the two-export `memberTopRank` name collision, the `use-drawer-profile`
metric-artifact (colocated test + drop redundant `?.` on the non-null `passport` + un-export the dead
`rankProgressPercent`), the stale `drawer-types.ts:9-10` nullability comment, and the `:117`
`WidenedSystemRank` hand-rolled cast + its **F2 money-stakes enum-mirror** (derive the widened type
from the payload + add a compile-time `Equals<local, Prisma.BeltFamily>` assertion). WL-P2-83 (prod
`beltFamily` coverage proof) stays a separate pre-FI-001-send launch gate, NOT this lane.

## Status

Frontmatter `status:` is the single source of truth (staged → in-progress at bow-in).

## Bow-in

- FS-0024 canonical guard: PASS — `black-belt-legacy` (`Ronin-Dojo-Design/black-belt-legacy`), not
  dirstarter_template. Canonical claim: free. Worktree lane: `../ronin-0737` /
  `session-0737-d062-belt-polish` off `origin/main` (`474151d1`, includes #405's beltFamily re-key).
- Adopted staged stub (ADR 0049): `status: staged → in-progress`.
- Previous session: `docs/sprints/SESSION_0736.md` — **YES (+EXTENDED)**: fixed the D-062 billing-regex
  (`isBlackBeltRateEligible` re-keyed off `Rank.beltFamily`), shipped as **PR #405 (MERGED)**. This lane
  clears the rest.
- Discovery: `/gq` "beltFamily coverage backfill … eligibility" → surfaced `BBL_STRIPE_PRICING_RUNBOOK.md`
  + `rank-award-read-guard.ts`; opened `drift-register.md` §D-062, `lineage-membership.ts`,
  `rank-progression.ts`, the `20260714010000_rank_belt_family` migration, `payloads.ts` ladder select.
- FS-0048 read-before-build: read `sop-test-writing.md` (§15 pure-logic "keep" bucket applies to the new
  colocated test), FS-0027 (single-file runs), the D-062 register + frozen-seam note.

### WL-P2-83 — prod `beltFamily`-coverage proof (read-only; carried launch gate)

- **Result: GATE CLEAR (prod Neon `neondb`, read-only query).** Of 22 member-held ranks, 13 are
  black-belt-or-above by name; the **11 in the BJJ eligible discipline all have `beltFamily` populated →
  0 uncovered in the eligible set.**
- The only 2 null-`beltFamily` black belts are **non-BJJ** — "Black Belt - 1st Degree" (Kajukenbo, 1
  member) + "8th Dan - Black Belt" (USA Taekwondo, 1 member). `isBlackBeltRateEligible` excludes them by
  `discipline=bjj` scope **before** `beltFamily` is read → they cannot misprice (correctly $65 today).
- **Caveat for the future wiring step (not this lane):** the gate holds only while eligibility keeps its
  `discipline=bjj` scope. If that scope is ever dropped, backfill `beltFamily` for all black-belt-named
  ranks first. Proof is read-only evidence; `filterPlansForBlackBeltEligibility` stays UNWIRED, untouched.

## Petey plan

### Tasks

#### SESSION_0737_TASK_01 — D-062 remaining behavior-preserving cleanups

- **Agent:** Cody · **Depends on:** nothing (all behavior-preserving; verify against the frozen seam)
- **What / steps:** rename one `memberTopRank` (→ `memberTopRankView` per D-062); add the
  `use-drawer-profile` colocated test + drop the redundant `?.` on the required `passport` + un-export
  `rankProgressPercent`; fix the `drawer-types.ts` stale comment; derive `WidenedSystemRank` from the
  payload and add the `BeltFamily` mirror-drift assertion (F2).
- **Done means:** each D-062 open item flipped to ✅ in the drift register; gates green; no rank-read/
  display or frozen RankAward/#380 write-seam change.
- **Status: DONE** (behavior-preserving; 6 files). Clusters landed:
  1. `member-ranks.ts` async `memberTopRank` → `memberTopRankView` (+ its only importer, the test).
     Distinct from the UNCHANGED sync `canvas-model.ts` `memberTopRank`. No prod runtime caller yet
     (`member-ranks.ts:4` @wired), no barrel re-export → no missed call-site.
  2. `use-drawer-profile.ts`: un-exported `rankProgressPercent` (module-private; 0 external importers);
     dropped 4 redundant `?.` on the non-null `profile.passport` (kept `?.` on nullable `.user`); added
     colocated `use-drawer-profile.test.ts` (6 cases) covering `deriveDrawerProfileView` + `formatDate`.
  3. `drawer-types.ts`: corrected the stale `passport`-nullable comment (comment-only).
  4. `rank-progression.ts`: replaced hand-rolled `WidenedSystemRank` + `as` cast with payload-derived
     `SystemLadderRank`; dropped now-dead `?? ""`/`?? null`; added F2 compile-time
     `Equals<BeltFamily, PrismaBeltFamily>` money-mirror (belt-swatch stays Prisma-free; `import type`).
- **Gates (in-sandbox, worktree):** `bunx tsc --noEmit` = 0 errors (after `bunx next typegen`; the 131
  pre-typegen errors were all Next generated-route-type noise, none in touched files) · affected tests
  green single-file (member-ranks 8, rank-progression 21, use-drawer-profile 6) · `bun run lint` clean
  (no new warnings, none in touched files).
- **Verify:** Doug review of the diff → **LAUNCH-SAFE, 9.5/10, no hard cap, 0 P1/P2**; frozen
  RankAward/#380 write seam + ADR 0035/0058 display law untouched; no rank-READ semantics change.
- **Scope note:** D-062 register extras left OPEN by design (out of the staged 4-cluster scope):
  `schemas.ts:98` `z.string()`→enum (trust-field tightening risks behavior change), the
  first-in-discipline accessor extraction, `buildDescendantCounts` perf, the non-UTC `formatDate`, and
  cosmetics. The billing-regex item is already fixed (#405).

### Scope guard

Behavior-preserving only. NO frozen RankAward/#380 write-seam change; WL-P2-83 (prod data coverage) is
a separate launch gate, not this lane.

## Next session

- **Goal:** TBD at bow-out.
- **First task:** TBD.
- **Kickoff prompt:** n/a — staged stub; hydrate at bow-in.
