---
title: "ADR 0058 — RankEntry is the ONE rank model"
slug: adr-0058-rankentry-is-rank-truth
type: decision
status: accepted
created: 2026-07-26
updated: 2026-07-26
last_agent: claude-session-0711
---

# 0058 — RankEntry is the ONE rank model

## Status

Accepted — NEW lean record ratifying the landed reality. **Supersedes**
[legacy ADR 0016](../architecture/decisions/0016-lineage-promotion-source-of-truth.md) (which
holds RankAward canonical with no supersession note) and re-states
[legacy ADR 0035](../architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md)'s
awarded-truth display rule on the RankEntry model.

## Context

The repo carried two rank models: `RankAward` (the original promotion fact table, legacy 0016) and
`RankEntry` (the unified rank data flow). Running both meant two write paths, drifting reads, and
belt-subsystem queries that disagreed about a member's current rank.

## Decision

- **`RankEntry` is the single rank model.** All rank reads and writes go through RankEntry; no
  new code touches `RankAward`.
- The **read-collapse is done**: RankAward reads have been collapsed onto RankEntry. The physical
  **`RankAward` table-drop is a queued post-send epic (G-011)** — the sweep must not pre-empt it;
  until it lands the table exists but is dead.
- **Display law (from legacy 0035, unchanged):** a member's current rank = the highest AWARDED
  entry by `sortOrder` (`memberTopRank`); `selectedRankAward` is removed; verification is the ONE
  `node.isVerified` flag.
- **Belt-subsystem invariants:** a pending belt is a `RANK_PROMOTION` claim that becomes a
  VERIFIED award; picker id-space must match the FK; on `@@unique [userId, rankId]` conflicts,
  repoint `rankId` — never edit the seed. Never scope rank queries by `rank.brand` (BBL BJJ ranks
  have `brand = null`); scope by reason/discipline.

## Consequences

- One write path, one read model — rank drift between lineage, profiles, and belts is
  structurally closed.
- Legacy 0016 carries a supersession banner pointing here; G-011 owns the table-drop and its
  migration.
