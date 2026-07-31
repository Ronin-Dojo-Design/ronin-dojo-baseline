---
title: "SESSION 0729 — Build the canonical rank-read seam (map #374 ticket #376)"
slug: session-0729
type: session--staged
status: staged
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0728
sprint: S13
lane: bbl
recipe: "seq-lane-build"
goal_ids: ["G-011"]
tickets: ["#374", "#376"]
next_session:
pairs_with:
  - docs/sprints/SESSION_0728.md
  - docs/product/black-belt-legacy/pods-schema-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0729 — Canonical rank-read seam (#376)

> **Staged by SESSION_0728.** #375 (provenance shape) is **RATIFIED + closed**, which unblocks this
> Wave-2 lane. Adopt: flip `status:` → `in-progress`.

## Goal

Build the ONE canonical rank-read seam on `RankEntry` (a `memberRanks` / `memberTopRank` module),
exposing `provenance` alongside `status`, and repoint the ~29 `RankAward` readers to it. Ticket
[#376](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/376).

## Resolved upstream (do not re-open)

- **Provenance shape RATIFIED** — `RankEntryProvenance { IMPORTED, EARNED }` (SESSION_0728, #375).
  Immutable origin; belt-gate's `verificationStatus==="IMPORTED"` reads become `provenance==="IMPORTED"`
  at THIS seam. `rankEntryStatusForAward`'s IMPORTED→VERIFIED collapse STAYS (status = presentation trust).
- One canonical rank-read seam (operator, 0723). `RankAward` stays the **write anchor** until the
  table-drop (#380 / G-011); the CI guard (#377) targets READS only and lands **after** this.
- Canonical-tree backfill DONE (95/95). The provenance migration is #375-derived (additive,
  hand-authored, shadow-replayed) — **not applied yet**; sequence it into this lane, commit the file
  only, no prod apply.

## Baton (paste-ready)

```
/bow-in — Build lane (seq-lane-build), worktree. Adopt SESSION_0729 (flip status → in-progress).
Repo: black-belt-legacy (ONE repo, ADR 0059). Ticket #376: build the canonical rank-read seam.

FIRST: open map #374, ticket #376, spec #372 Implementation Decisions, and #375's resolution comment
(the ratified RankEntryProvenance shape). Code ground truth: server/belt/queries.ts,
server/belt/belt-gate.ts, rank-entry-compatibility.ts, prisma/schema.prisma (RankEntry). Then /gq for
the ~29 RankAward readers to repoint. FS-0048 read-before-build; verify by reading, not names.

BUILD: (1) add the RankEntryProvenance enum + RankEntry.provenance column (hand-authored ADDITIVE
migration, shadow-replayed; migrate dev BANNED on shared DB; NO prod apply — commit the file only)
and set provenance in syncRankEntryFromAward (IMPORTED if verificationStatus==IMPORTED else EARNED).
(2) Build the ONE memberRanks/memberTopRank seam on RankEntry exposing {rankId, status, provenance,…}.
(3) Repoint the ~29 readers to the seam; belt-gate IMPORTED reads → provenance==IMPORTED. (4) Full
local gates green (typecheck / oxlint / oxfmt / tests / next build) + affected e2e for belt/rank.

HOLD: prod migration apply is AFK-NEVER; PR-only main; HOLD every push for the operator's word. One
PR, worktree, full gates. The CI guard (#377) is a SEPARATE follow-on — not this session.
```

## Next session

<!-- staged by 0729 at its own bow-out -->
