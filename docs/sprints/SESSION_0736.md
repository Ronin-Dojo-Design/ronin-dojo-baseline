---
title: "SESSION 0736 — D-062 fix: re-key Black-Belt-rate eligibility off Rank.beltFamily"
slug: session-0736
type: session--implement
status: closed
created: 2026-08-02
updated: 2026-08-02
last_agent: claude-session-0736
sprint: S13
lane: bbl
recipe: "fallow-fix-loop"
goal_ids: []
tickets: []
next_session: docs/sprints/SESSION_0737.md
pairs_with:
  - docs/sprints/SESSION_0735.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0736 — D-062 fix: re-key Black-Belt-rate eligibility off Rank.beltFamily

**Date:** 2026-08-02 · **Operator:** Brian + claude-session-0736

## Goal

Fix the highest-value D-062 finding: `isBlackBeltRateEligible` gated the BBL $45-vs-$65 Elite
**price** off a display-name regex `/\b(black|coral|red)\s+belt\b/i`, so a renamed/localized rank
would silently misprice. Re-key the one eligibility gate off structured rank fields; add a regression
test proving a renamed black belt still prices correctly. Hold at the push gate.

## Goal verdict

**YES (+ EXTENDED):** the gate is re-keyed off `Rank.beltFamily` and shipped as PR #405 (holding for
CI-green merge); extended by the F1 canonical-occupancy recovery + full D-062/WL/FS routing at close.

## Status

Frontmatter `status:` is the single source of truth.

## Bow-in

- Previous session: `docs/sprints/SESSION_0735.md` — the review-only quality sweep that surfaced D-062;
  this lane burns down its highest-value (billing-fragile) item.
- Branch/worktree: `claude/infallible-proskuriakova-161b46` @ the lane worktree · HEAD `01de3eed`.
- On-demand blocks pulled: Graphify check (RankAward→RankEntry epic state, `/gq`); Drift logged (D-062).

## Petey plan

### Tasks

#### SESSION_0736_TASK_01 — Re-key isBlackBeltRateEligible off Rank.beltFamily + regression test

- **Agent:** claude (direct) · **Depends on:** nothing
- **What / steps:** verify current behavior (green baseline) → confirm `beltFamily` on the payload →
  re-key `isBlackBeltOrAbove` off the `{BLACK,CORAL,RED}` enum → thread through the progression +
  widen the `rankSystem.ranks` payload select → add 3 regression tests (renamed→eligible,
  COLORED-named-"Black Belt"→not, null→not).
- **Done means:** billing-regex gone; regression tests proven fail-before/pass-after; gates green.

### Scope guard

One eligibility gate + a regression test. NO rank-read/display semantics change; NO frozen
RankAward/#380 write-seam touch; the `makeAward` rename and `WidenedSystemRank` cast-derivation were
explicitly de-scoped by the operator ("keep D-062 scope tight") → routed to D-062.

## Cody pre-flight

n/a — direct implementation; single-gate re-key adjacent to the frozen seam, verified read-only first.

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0736_TASK_01 | landed | Re-keyed `isBlackBeltOrAbove` off `Rank.beltFamily` (`{BLACK,CORAL,RED}`) in `rank-progression.ts`; threaded `beltFamily` through `ProgressionLevel["rank"]` + `WidenedSystemRank` + both accumulator paths; widened the `lineageNodeProfilePayload` `rankSystem.ranks` select (`payloads.ts`); +3 D-062 regression tests. PR [#405](https://github.com/Ronin-Dojo-Design/black-belt-legacy/pull/405). |

**Decisions resolved:** `beltFamily` chosen over `degree` (ambiguous — COLORED belts share the 0–4
range) and `sortOrder` (system-relative); nullable → fail-closed to the higher $65 price (ADR D472-2:
$45 is a verified-only subsidy). `makeAward` rename + `:117` cast-derivation de-scoped (operator).

## Verification

| Command / smoke | Result |
| --- | --- |
| `tsc --noEmit` (after `next typegen`) | 0 errors (canonical + worktree) |
| `oxlint` / `oxfmt --check` (3 files) | clean / clean |
| `bun test rank-progression.test.ts` | 21 pass (was 18 → +3 D-062) |
| `bun test rank-progression.privacy.test.ts` | 3 pass |
| D-062 teeth (old regex restored) | 3 fail → restored → 3 pass (fail-before/pass-after) |
| pre-commit `rank-award-read-guard` | PASS — no new direct RankAward read roots |

## Artifacts

None.

## Open decisions / blockers

- **WL-P2-83 (pre-FI-001-send launch gate):** do NOT wire `filterPlansForBlackBeltEligibility` at
  `/lineage/join` until a prod query proves every member-held black-belt-or-above Rank has
  `beltFamily ∈ {BLACK,CORAL,RED}` (Doug Finding 1; the backfill covered only IBJJF `shortName` patterns).

## Next session

- **Goal:** burn down the remaining behavior-preserving D-062 items (belt/lineage polish) — staged as
  `docs/sprints/SESSION_0737.md`.
- **First task:** merge PR #405 on CI-green; then read `drift-register.md` §D-062 open items + the
  frozen-seam note and start the cleanups.
- **Kickoff prompt:**

```
/bow-in — SESSION_0737 · D-062 burndown: belt/lineage polish (lane: bbl, recipe: fallow-fix-loop)

Why this session: SESSION_0736 (PR #405) fixed the D-062 billing-fragile item (Black-Belt-rate
eligibility re-keyed off Rank.beltFamily). This lane clears the REMAINING D-062 findings, all
behavior-preserving, none touching the frozen RankAward/#380 write seam.

First task: read docs/knowledge/wiki/drift-register.md §D-062 (open items) + the frozen-seam note, then:
  1. rename one memberTopRank (canvas-model.ts:86 vs member-ranks.ts:113 → memberTopRankView)
  2. use-drawer-profile.ts: add colocated test + drop redundant ?. on the non-null passport + un-export dead rankProgressPercent
  3. drawer-types.ts:9-10 stale nullability comment
  4. derive WidenedSystemRank from the payload + add compile-time Equals<local, Prisma.BeltFamily> assertion (F2 money-mirror)
Done means: each D-062 open item flipped ✅ in the drift register; gates green; no rank-read/display change.
Scope guard: behavior-preserving only; WL-P2-83 (prod beltFamily coverage proof) is a SEPARATE pre-FI-001-send launch gate, not this lane.
/ggr target: 9.0+
First line back: confirm the frozen-seam boundary + the D-062 open-item list you'll clear.
```

## Close evidence

**/ggr composite:** ≈9.3/10 code (Giddy CLEARS, Doug isolated-diff ~9.3) · **Caps applied:** Doug
systemic 8.7 (prod `beltFamily` coverage DB-blind) — a launch-time data gate, routed to WL-P2-83, not
a code loop; auto-loop skipped as vacuous (zero code findings).
**Systemic health:** CI = pending (PR #405 running) · findings routed 4/4 (F1 fixed·relocated →
FS-0057 · F2 → D-062:117 · Finding-1 → WL-P2-83 · Doug billing-verification pattern → FS-0056) ·
FS patterns: FS-0034/0035 class recurred (F1) → FS-0057.
**Reviewer verdicts:** Giddy pass — CLEARS (right key, regex dead, allowlist-consistent, fail-closed
ADR-coherent) · Doug pass — ship the diff, zero live blast radius, LOOP the launch on WL-P2-83 · Desi
n/a — no UI touched.
**Findings ≥ medium:** F1 (canonical-occupancy breach) — fixed, relocated to lane branch → FS-0057 ·
Finding-1 (prod beltFamily coverage) — routed WL-P2-83 · F2 (enum-mirror on money field) → D-062:117.
**ADR / ubiquitous-language check:** SOT-ADR D472-1/D472-2 confirmed valid (fail-closed = verified-only
subsidy); no new ADR. Rank (definition, carries beltFamily) vs RankEntry (awarded instance) distinction
reaffirmed — fix reads Rank.beltFamily via RankEntry.rank (post-#397 read-collapse path).

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | this file + drift-register/wiring-ledger/FS-log updated |
| Wiki lint | run in bow-out gates (below) |
| Reflections routing receipt | 3 lessons → 3 routes (see Reflections) |
| Code-quality gate (Class-A) | ≈9.3/10, no cap on the code (Giddy) |
| Runtime verification (Doug) | no live runtime surface (gate unwired) — unit tests are the bound |
| Memory sweep · next-session unblock | D-062 resolution recorded; WL-P2-83 launch gate staged |
| Git hygiene · Graphify update | lane branch `01de3eed` + bow-out docs commit; canonical restored clean |

## Reflections

- Absolute canonical paths in a prompt silently override a worktree cwd — resolve edits against the
  worktree root even when the prompt quotes canonical paths. → route: FS-0057
- Re-keying a billing gate onto a nullable backfilled column proves logic, not prod data coverage —
  attach a coverage proof before wiring. → route: FS-0056 / WL-P2-83
- `beltFamily` lives on `Rank` (the rung), stable across the RankAward→RankEntry fold, so the fix is
  orthogonal to #380 and adds no RankAward read. → route: no-action (confirmed migration-safe)
