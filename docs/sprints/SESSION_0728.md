---
title: "SESSION 0728 — Prototype the RankEntry provenance shape (map #374 ticket #375)"
slug: session-0728
type: session--staged
status: staged
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0727
sprint: S13
lane: bbl
recipe: "wayfinder-work-through"
goal_ids: ["G-011"]
tickets: ["#374", "#375"]
next_session:
pairs_with:
  - docs/sprints/SESSION_0727.md
  - docs/sprints/plans/petey-plan-0727-rankentry-wayfinder.md
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

## Next session

<!-- staged by 0728 at its own bow-out -->
