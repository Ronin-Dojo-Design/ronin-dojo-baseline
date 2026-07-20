---
title: "Recipe — Quality Suite (merged-trunk code-quality pass)"
slug: recipe-quality-suite
type: protocol
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0588
pairs_with:
  - docs/protocols/page-code-review.md
  - .claude/skills/fallow-fix-loop/SKILL.md
  - .claude/skills/code-quality/SKILL.md
  - docs/protocols/recipes/review-wave.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - quality
  - recipe
  - review
---

# Recipe — Quality Suite

The **merged-trunk sibling** of [`page-code-review.md`](../page-code-review.md). That protocol is the
SoT for a **single page** (bounded transitive closure from one route); this card is for a **merged
trunk** — a fan-out sweep of N disjoint lanes that already landed on `main` — where the bounding rule
is **the diff**, not a route. Proven shape: SESSION_0567 ("score each scoped file; hostile-review
`range..HEAD`; apply only behavior-preserving Class-A/hard-cap fixes"). First run as this card:
SESSION_0588 over the 0583–0586 trunk.

Default contract, inherited from page-code-review: **behavior-preserving.** Any behavior change is a
deliberate, operator-ratified, logged exception (see Step 4).

## Persona pack

- **`/code-quality` + `/fallow-fix-loop`** — always, the scoring + fix engines (this card only bookends them).
- **Desi** — on any lane that changed member-facing or shared-primitive UI. Runs **in** the review
  pass, not at close. Design sign-offs she surfaces are recommendations — a behavior change is a Step-4 exception.
- **Doug** — on any lane with its own gates/deploy (e.g. a `clients/*` product: root gates never cover it).
- **Giddy** — when structure moved. A merged trunk already close-reviewed does not *require* a re-run
  (this pass's delta value is the per-file `/code-quality` score + the *applied* fixes the close-wave
  skipped), **but the operator may elect a fresh structural pass** — a fix wave changes structure the
  close never saw, and cross-boundary questions (e.g. a shared-seed dupe) are Giddy's call. Default:
  elect it when the fix set will be non-trivial. Giddy may run a `/seq-research-recommend` on any
  cross-deploy-unit consolidation question rather than proposing an inline fix.

## Load-set

1. The four-lane (or N-lane) trunk **diff range** — `<pre-sweep-base>..<last-lane-merge>`, **excluding**
   the close-writer bookkeeping commits. Compute the base as the first-parent of the first lane merge.
2. Each lane's SESSION record (what it claims) + the close-wave's Giddy verdict (what's already covered).
3. Domain invariants live on the touched files (e.g. technique-media no-leak, `Rank.brand` nullability) —
   pull from the lane's gotcha floor, don't re-derive.

## Overlays

| Trunk shape | Scope bound | Notes |
| --- | --- | --- |
| **Homogeneous** (all one deploy unit) | the diff's code files | single `/code-quality` + one `/fallow-fix-loop`; inline |
| **Heterogeneous fan-out** (N deploy units) | diff, **partitioned by deploy unit** | review pass fans out per lane; docs lanes get a wiki-lint/pointer lens, not `/code-quality` |
| **Already close-reviewed** | as above | skip Giddy; the pass IS the per-file score + applied fixes the close skipped |

**Fix push is split by deploy unit** on a heterogeneous trunk: non-deploying lanes (docs, scripts) may
push independently; app-code lanes ride their product's deploy + any standing hold. Never bundle a
held app-code fix with a free docs fix into one push.

## Step sequence

0. **Bound the diff.** Compute `<base>..<head>`, list the code-bearing files, partition by deploy unit.
   Docs/`.claude` → wiki-lint/pointer lens only. Write the file list into the SESSION task.
1. **Fallow baseline** (before any edit): `npx fallow audit --changed-since <base> --gate all --format json`.
   Record complexity/CRAP hotspots, dupe clone groups, dead-code by scoped file. No delta is honest without this.
2. **Scored review** (read-only, fan out per lane): `/code-quality` (/10 + Class A/B/C + hard caps →
   "Apple/Facebook grade?") on each code file; Desi UX lens on UI lanes; wiki-lint on docs lanes. Output
   ONE prioritized fix list; cross-lane/structural items → tickets, not inline edits.
3. **Fixes** via `/fallow-fix-loop` — behavior-preserving Class-A / hard-cap only. Cross-product dupes
   (e.g. two `seed.ts`) are usually a **ticket**, not an inline merge (consolidation crosses a deploy boundary).
4. **Re-verify.** Bar = **delta-neutral**: no NEW failing test files vs the trunk's documented baseline
   (a known non-regression fail-class stays as-is — absolute green may be blocked on an out-of-scope
   fix). Affected e2e for UI-contract changes; repo-wide `format:check` if any file was added; typecheck
   + oxlint + `bun run test --parallel=1` on the touched set; `clients/*` gates run in-client.
5. **Prove the delta + log.** Re-run fallow on the same range; prove CRAP/dupes/dead-code down (or
   non-worse, justified). Log baseline→final + `/code-quality` scores in the SESSION file. Push gate:
   HOLD, split by deploy unit.

## Minimum-output contract

1. Fallow **baseline → final** table (per scoped file) proving the delta down or justified.
2. `/code-quality` score per code file, ≥ 8.5 or a documented reason.
3. Fix list applied (behavior-preserving) vs ticketed (cross-boundary/behavior-changing), each routed.
4. Re-verify evidence: delta-neutral test result + affected-e2e/format:check as applicable.
5. Review log entry per lane; unresolved findings → Proposed ledger edits, never silently dropped.
6. **Verdict** GO / GO-WITH-NOTE → the per-deploy-unit push gate (always waits for the operator's word).

## Done-means (per lane)

1. Fallow deltas ≤ baseline (any increase justified).
2. `/code-quality` recorded ≥ 8.5 or documented.
3. Zero NEW near-dupes of L1/inventory; dead props / needless client islands / kind-unions removed or ticketed.
4. Re-verify delta-neutral; gates green for the lane's deploy unit.
5. Behavior preserved — or a ratified, logged Step-4 exception.

## Cross-references

- [`page-code-review.md`](../page-code-review.md) — the per-page SoT this generalizes.
- [`fallow-fix-loop` SKILL](../../../.claude/skills/fallow-fix-loop/SKILL.md) · [`code-quality` SKILL](../../../.claude/skills/code-quality/SKILL.md) — the engines.
- [`recipes/review-wave.md`](review-wave.md) — the reviewer-fan-out sibling (Doug/Desi/Giddy on one commit).
- [`code-quality-matrix.md`](../code-quality-matrix.md) — the scoring rubric + hard caps.
