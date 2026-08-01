---
title: "ADR 0058 — RankEntry is the ONE rank model"
slug: adr-0058-rankentry-is-rank-truth
type: decision
status: accepted
created: 2026-07-26
updated: 2026-07-31
last_agent: codex-session-0731
---

# 0058 — RankEntry is the ONE rank model

## Status

Accepted — NEW lean record ratifying the landed reality. **Supersedes**
[legacy ADR 0016](../architecture/decisions/0016-lineage-promotion-source-of-truth.md) (which
holds RankAward canonical with no supersession note) and re-states
[legacy ADR 0035](../architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md)'s
awarded-truth display rule on the RankEntry model.

## Context

The repo still carries two physical rank tables during an expand/contract migration: `RankAward`
owns promotion facts and current writes, while `RankEntry` is the canonical read model. Letting
callers choose between them caused drifting reads and rank surfaces that disagreed.

## Decision

- **`RankEntry` is the destination single rank model and the current canonical read model.** All
  rank reads go through the shared RankEntry seam. Until #380, writes and promotion-fact reads
  remain anchored on `RankAward`; new code must not create another RankAward display/read path.
- The **read-collapse landed in #397**. The live `RankAward` compatibility anchor is removed by
  #380 **before the FI-001 send**, after #377 and the #398 environment blocker. #380 folds facts
  and satellite FKs into RankEntry before dropping the old table; it is not dead storage today.
- **Display law (from legacy 0035, unchanged):** a member's current rank = the highest AWARDED
  entry by `sortOrder` (`memberTopRank`), with `awardedAt DESC NULLS LAST` as the same-rank
  tiebreak; never scope by `rank.brand`. Rank trust is `RankEntry.status`, not a lineage-node flag.
- **Trust has two axes:** `status` is mutable presentation trust; `provenance` is immutable origin.
  IMPORTED means the member's one-time WP self-report, not archive authority. Provenance is private
  historical metadata, never gates member edits, and is never a public display state.
- **Belt-subsystem invariants:** a pending belt is a `RANK_PROMOTION` claim that becomes a
  VERIFIED award; picker id-space must match the FK; on `@@unique [userId, rankId]` conflicts,
  repoint `rankId` — never edit the seed. Never scope rank queries by `rank.brand` (BBL BJJ ranks
  have `brand = null`); scope by reason/discipline.

## Consequences

- One read model closes display drift now; #380 closes the temporary two-table write/fact bridge.
- #380 preserves one row per `(passportId, rankId)`, folds mutable status + immutable provenance,
  re-anchors promotion facts and satellites, cuts writers over, then drops RankAward.
- Legacy 0016 carries a supersession banner pointing here; #380 owns the destructive migration.
