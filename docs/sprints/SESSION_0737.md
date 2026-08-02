---
title: "SESSION 0737 — D-062 burndown: belt/lineage polish (dup memberTopRank, drawer test/dead-export, :117 cast + enum-mirror)"
slug: session-0737
type: session--open
status: closed
created: 2026-08-02
updated: 2026-08-02
last_agent: claude-session-0737
next_session: docs/sprints/SESSION_0738.md
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

## Goal verdict

**YES (+ EXTENDED):** all 4 staged D-062 behavior-preserving clusters landed (PR #406; /ggr 9.3, Doug
9.5 LAUNCH-SAFE); extended by the carried **WL-P2-83** prod `beltFamily`-coverage proof, which came back
**GATE CLEAR** (11/11 eligible BJJ black belts covered; the 2 non-BJJ nulls are discipline-excluded).

## Status

Frontmatter `status:` is the single source of truth (staged → in-progress at bow-in → closed at bow-out).

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

## Close evidence

**/ggr composite:** 9.3/10 (Build lane, code-quality-matrix; ≥9.0 clears, ADR 0052 D6) ·
**Caps applied:** none (behavior-preserving proven; no Dirstarter bypass; F2 `Equals` is a documented
standard type-idiom, not a new primitive).
**Systemic health:** CI = PR #406 in-flight, **no red** (RankAward-read-guard ✅, Oxc lint+format ✅,
Typecheck-scripts ✅; full tsc / unit / Playwright pending — green claim will paste the run URL on
confirm) · findings routed 4/4 (D-062 clusters → resolved; D-062 extras → stay open, carried to
SESSION_0738; WL-P2-83 → proof recorded, wiring still gated) · FS patterns: none recurring.
**Reviewer verdicts:** Doug ✅ LAUNCH-SAFE 9.5/10, 0 P1/P2 (behavior-preservation proven per cluster:
`?.`-drops inert via non-null schema relation, cast removal is stronger typing, F2 mirror sound, no
missed rename call-site, frozen write seam + ADR 0035/0058 untouched) · Desi n/a (no visual/render
change — drawer change is pure projector logic) · Giddy-lite (one new colocated test file; no moved
dirs / ADR-worthy decision).
**Objective metrics (fallow, changed scope):** 0 dead-code / 0 duplication introduced · maintainability
89.6 (good) · avg cyclomatic 2.9 · one flagged fn `deriveDrawerProfileView` (cyc 21) = the D-062
metric-artifact (inherent nullable-field breadth, not a hotspot) — prescribed fix was COVERAGE, added
here; the `?.`-drops lowered its branch count.
**Findings ≥ medium:** none new. D-062 register EXTRAS left open by scope (routed to SESSION_0738
fan-out): `schemas.ts:98` `z.string()`→enum (trust-field tightening risks behavior change), the
first-in-discipline accessor extraction (belt-gate/member-ranks/canvas-model), `buildDescendantCounts`
O(depth) perf, the non-UTC `formatDate` off-by-one, cosmetics.
**ADR / ubiquitous-language check:** not required — no architectural decision; followed ADR 0049
staged-stub, ADR 0052 QAR gate, ADR 0056 PR-flow, ADR 0035/0058 display law (untouched).

| Step | Proof |
| --- | --- |
| Canonical guard (FS-0024) | `pwd`+`git remote -v` = `black-belt-legacy`; canonical claim free; lane in `../ronin-0737`. |
| WL-P2-83 prod proof (read-only) | 22 member-held ranks · 11/11 eligible BJJ black belts have `beltFamily` → 0 uncovered; 2 non-BJJ nulls discipline-excluded. `filterPlansForBlackBeltEligibility` untouched/unwired. |
| In-sandbox gates | `bunx tsc --noEmit` 0 errors (post `next typegen`) · affected tests 8+21+6 pass single-file (FS-0027) · `bun run lint` clean · pre-commit rank-award-read-guard PASS + oxfmt clean. |
| /ggr QAR gate | composite 9.3 ≥ 9.0 → CLEARS; no caps; Doug 9.5 corroborates. |
| Wiki lint | `bun run wiki:lint`: 0 errors / 115 warnings — exact inherited baseline, 0 introduced. |
| Finding router | D-062 register updated: 4 clusters → ✅ resolved (SESSION_0737 / PR #406); extras + WL-P2-83 status recorded. |

### Reflections

- **Numbering trap avoided (FS-0050):** the staged `SESSION_0737.md` lived only in the
  `infallible-proskuriakova` claude worktree, not canonical — `ls docs/sprints` looked like 0735 was
  latest. `ledger-id-next` ("highest SESSION_0737 claimed") + scanning worktree sprints found it. Worth
  remembering: a staged stub can sit in a co-session's worktree before its PR merges.
- **Two definitions, one honest number (WL-P2-83):** "2 uncovered by name" vs "0 uncovered in the
  eligible set" — the discipline scope (`isBlackBeltRateEligible` → benchmarks `bjj` only) is the real
  filter; reporting the eligible-set number (with the non-BJJ caveat) is the truthful gate answer.
- **Read the SOP, don't just trust the hook:** followed the FS-0027 hook rules correctly, but hadn't
  opened `sop-test-writing.md` until asked — it confirmed the pure-logic `node:test` sibling pattern was
  right, but the discipline is: read-before-build (FS-0048) includes the SOP, not only the hook echo.

## Next session

- **Goal:** **Fan-out session (recipe-cards / epic-plan)** running two genuinely-disjoint lanes in
  parallel worktrees: **(A) the #398 FI-001 proof lane** (FI-001 critical path #398 → #380 → cutover —
  gated on #398 being unblocked: the Vercel/Neon dashboard steps only Brian can run) and **(B) the D-062
  register EXTRAS** (`schemas.ts:98` enum-tighten [verify no valid value excluded first], the
  first-in-discipline accessor extraction, `buildDescendantCounts` perf, cosmetics). Disjoint file sets
  (billing/migration-proof vs belt/lineage cleanup) → route via
  [`recipes/epic-plan.md`](../protocols/recipes/epic-plan.md) with a recipe card per lane.
- **First task:** confirm #398 unblock status; if blocked, run lane B solo and hold A. Read
  `drift-register.md` §D-062 extras + the #398 baton in `SESSION_0734.md` `## Next session` first.
- **Kickoff prompt:** n/a — staged stub; hydrate at bow-in (fan-out plan + per-lane recipe cards).
