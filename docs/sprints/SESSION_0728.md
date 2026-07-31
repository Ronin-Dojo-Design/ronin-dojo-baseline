---
title: "SESSION 0728 — Prototype the RankEntry provenance shape (map #374 ticket #375)"
slug: session-0728
type: session--closed
status: closed
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0728
sprint: S13
lane: bbl
recipe: "wayfinder-work-through"
goal_ids: ["G-011"]
tickets: ["#374", "#375", "#384", "#387", "#389", "#391", "#392", "#393", "#394", "#395"]
next_session: docs/sprints/SESSION_0729.md
pairs_with:
  - docs/sprints/SESSION_0727.md
  - docs/sprints/plans/petey-plan-0727-rankentry-wayfinder.md
  - docs/product/black-belt-legacy/pods-schema-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0728 — Prototype the RankEntry provenance shape (#375)

> **Staged by SESSION_0727** (the wayfinder charting session). The epic is charted as map
> [#374](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/374); this session works
> its first frontier `full` ticket:
> [#375 — Provenance field shape on RankEntry](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/375)
> (HITL `/prototype`). Adopt: flip `status:` → `in-progress`.

## Goal

Resolve #375: the ratified shape of the RankEntry provenance column (enum, mapping, migration,
belt-gate consumption, seam exposure), recorded as the ticket's resolution comment and the
map's Decisions-so-far line — unblocking the Wave-2 seam lane (#376).

## Resolved upstream (do not re-open)

- Provenance = **COLUMN** on RankEntry (operator, 0727) — this session picks the shape, not
  whether.
- One canonical rank-read seam · backfill status VERIFIED · canonical-tree backfill DONE
  (95/95 prod-verified 2026-07-30) · table-drop sequenced as #380. See
  [petey-plan-0727-rankentry-wayfinder](plans/petey-plan-0727-rankentry-wayfinder.md).

## Baton (paste-ready)

```
/bow-in — HITL wayfinder work-through session. Adopt SESSION_0728 (flip status → in-progress).
Repo: black-belt-legacy (ONE repo, ADR 0059). Docs+prototype lane — no prod writes, no migration
applies; deliverable = ticket #375 resolved + map #374 updated (+ optionally a /prototype spike
branch, never merged this session).

FIRST: open map #374 (Decisions so far + Notes), ticket #375, spec #372 Implementation/Testing
Decisions, then the code ground truth: prisma/schema.prisma (RankEntry + RankAwardVerificationStatus
+ RankEntryStatus), server/belt/queries.ts (rankEntryStatusForAward + isFactEditable/SELF_BACKFILL),
server/belt/belt-gate.ts (authority rule reads award.verificationStatus — the dependency to cut),
rank-entry-compatibility.ts (syncRankEntryFromAward). FS-0048: verify schema-validity by reading
files, not names.

CLAIM #375 (self-assign) before any work. Then /prototype the shape and GRILL the sub-forks with
the operator (one-word picks): enum reuse (RankAwardSource) vs new RankEntryProvenance
(IMPORTED | EARNED …) · how awardedById instructor-stamps map · additive-migration + backfill of
the 111 existing entries (hand-authored, shadow-replayed; migrate dev BANNED on shared DB) ·
belt-gate/isFactEditable consumption · what the #376 seam exposes. Prod facts (2026-07-30):
111 entries; awards 27 VERIFIED / 72 IMPORTED / 12 UNVERIFIED.

RESOLVE: post the answer as #375's resolution comment, close it, append the Decisions-so-far
line on #374, graduate any fog. ONE non-research ticket max this session (wayfinder discipline).
Optional AFK fan-out in parallel worktrees: #378 (test-gate fix), #379 (straggler dry-run),
#381 (env hygiene, attended — secrets). HITL invariant: never self-answer a full ticket; prod
--apply is AFK-NEVER. PR-only main; HOLD every push for the operator's word.
```

## Bow-in

- Adopted SESSION_0728 (staged by 0727); flipped `status` → in-progress. Election verified via the
  0727 close commit (`4a40a8f0` "stage confirmed 0728→#375") + stub `next_session` pointer (FS-0050 —
  not by highest number). Canonical claim **FREE** (gate hook) — docs lane, no worktree.
- Coordinate check: #375 unclaimed/OPEN; only open PR #361 (settings parity, unrelated); #376 seam
  OPEN + correctly blocked on #375. No lane collision. Self-assigned #375.
- **FS-0048 read-before-build sweep:** `prisma/schema.prisma` (RankEntry / RankAward /
  RankAwardVerificationStatus / RankEntryStatus / RankAwardSource), `server/belt/queries.ts`
  (`rankEntryStatusForAward` IMPORTED→VERIFIED collapse @ L88; `resolveAnchorAward`; `toBeltCard`),
  `server/belt/belt-gate.ts` (`isFactEditable` @ L79 reads `verificationStatus==="IMPORTED"`;
  `memberFactEditability` authority-lock), `rank-entry-compatibility.ts` (`syncRankEntryFromAward`).
  Confirmed provenance is entangled in `verificationStatus` + the `awardedById` stamp and is **lost
  at the RankEntry layer today** (the collapse) — the exact reason #375 needs a column.

## What landed

**Core deliverable — #375 provenance shape RATIFIED:**

- Operator picked **Option A**: new immutable enum `RankEntryProvenance { IMPORTED, EARNED }`.
  Backfill maps `verificationStatus==IMPORTED → IMPORTED`, else `EARNED` (72/39 of 111). Authority
  axis (`awardedById`) stays a separate axis. Belt-gate's IMPORTED reads move to `provenance==IMPORTED`
  at the #376 seam; `rankEntryStatusForAward`'s collapse stays (status = presentation trust).
- Posted as #375's resolution comment → **#375 closed** → map #374 Decisions-so-far line + ticket ticked.

**Bonus — full schema-depth audit (operator-directed, extended the lane):**

- Read the Pods field authority in **rdd-monorepo** under explicit ADR-0059 operator override:
  `bbl_member_pod.json` (95) + `bbl_school_pod.json` (20).
- Wrote **`docs/product/black-belt-legacy/pods-schema-inventory.md`** — 115 Pods fields → Prisma
  (have/partial/missing/dup) + full 136-model audit (PRD/STORIES + 3 parallel Explore readers) +
  goals/planning ledger sweep.
- Key findings: `latitude_longitude` **is** in the Pods school source (geo = a *migration gap*, not
  net-new); belt stripes are **not** in Pods (net-new); `PromotionEvent` already models "promoted_with";
  `FightRecord` is aggregate-only (no itemized history); **Galaxy** = lineage-graph (built), **Globe**
  = geo (unbuilt); no structured nationality/flag code; **no `Goal`/`TrainingGoal` model**; no training
  journal.

**Tickets created/updated — 11 across 3 maps:**

- **#384** (new map) Pods consolidation → #385–390; cheap wins folded into **#389** (`originCountry`
  flag) + **#387** (Org + member `DirectoryProfile` geo / Globe).
- **#374** RankEntry → **#391** belt stripes (decide before the G-011 table-drop).
- **#392** (new map) Profile depth & records → **#393** competition history · **#394** life-story bio ·
  **#395** training journal + Goal model (new lane under **G-022** technique graph).
- Flagged not-ticketed: creator payout / earnings / KYC = goal **G-009** (no schema exists yet).

## Goal verdict

**EXTENDED — YES + more.** The core goal (resolve #375 provenance shape) was fully hit: ratified,
closed, map updated. The operator then extended the lane into a full schema-depth audit → a durable
inventory doc + 2 new wayfinder maps + 11 tickets. No prod writes, no migration applied — HITL
invariant honored throughout.

## Reflections

- The HITL grill worked as designed: two rounds of one-word picks (enum shape → deliverable depth)
  kept the operator in the loop without over-asking. **Immutable-origin was the correct axis** —
  folding authority into provenance (Option B) would have made the column mutable and coupled two
  orthogonal facts.
- My "defer the inventory" recommendation was **overridden by the operator** (rightly — momentum + the
  ADR-0059 operator-override path made reading the sibling monorepo the unlock). Good reminder that the
  one-repo rule is a default, not a wall, when the operator authorizes.
- **Ledger discipline:** initially deferred the portfolio-shared goals/planning `.md` edits (drift
  risk — canonical in rdd-monorepo); operator then directed adding them here with an up-sync tomorrow,
  so the journal/Goal lane landed as **PL-033** + **G-035** (Extends G-022). The **absent `Goal` model**
  is a genuine finding — the goals-ledger is operator-governance (G-NNN), not member training goals.

## Full close evidence

| Gate | Result |
| --- | --- |
| Task log | n/a (HITL planning lane — no TaskCreate tracking) |
| Format-fix (code) | 0 code files touched |
| wiki:lint | 0 err / 118 warn (pre-existing) |
| Build | skipped (docs-only) |
| /ggr | Plan/Intake lane — see Review log |
| Graphify | nodes=15103 edges=33728 communities=1743 |
| Git state | branch=main · dirty (2 files: inventory doc + this file) → to a branch for PR |
| Secret scan | PASS (clean) |
| Touched | docs=2 · app=0 |

## Review log

**/ggr — Plan/Intake lane (plan-quality rubric; no code touched → matrix `/10` N/A per ggr Phase 0).**

| Dimension | Score | Evidence |
| --- | --- | --- |
| Decomposition | 9.5 | 11 tickets across 3 maps, each weighted `quick`/`full`; #375 resolution decomposed into enum·mapping·migration·consumption·seam·test |
| Done-means | 9.0 | build tickets carry field/enum specifics; decision tickets correctly labeled `wayfinder:grilling` (done = a ratified pick, not code) |
| Disjointness / sequencing | 9.5 | explicit blockers + wave order (Pods #384 after seam #376 / provenance; profile-depth #392 after #384; stripes before G-011 table-drop) |
| Forks surfaced | 9.5 | every fork brought to the operator for a one-word pick (enum shape, now-vs-after, cheap-vs-net-new, which net-new); no fork auto-resolved past; residual forks are their own grilling tickets, not buried |

**Composite: 9.3 / 10 → CLEARS (≥ 9.0, ADR 0052 D6).** No caps: no code → no behavior-regression / Dirstarter-bypass; the new `RankEntryProvenance` enum is documented (resolution + inventory doc); no undocumented primitive.

**Systemic health:** CI = n/a (docs-only close; no code lane, nothing to run) · findings routed 11/11 (#384–#395 + `pods-schema-inventory.md`; payout→G-009) · FS patterns: none fired.

## Next session

**[SESSION_0729](SESSION_0729.md) — Canonical rank-read seam (#376)** · Build lane
(`seq-lane-build`), worktree. Now unblocked by #375. Build the ONE `memberRanks`/`memberTopRank`
seam on `RankEntry` exposing `provenance`, add the `RankEntryProvenance` enum + column (additive
migration, no prod apply), repoint the ~29 `RankAward` readers. Full baton in the stub.
