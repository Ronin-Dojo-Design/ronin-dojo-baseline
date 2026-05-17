---
title: "ADR 0016 - Lineage Promotion Source of Truth"
slug: adr-0016
type: adr
status: accepted
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0178
pairs_with:
  - docs/architecture/lineage/lineage-prisma-schema-patch-proposal.md
  - docs/architecture/lineage/lineage-rank-promotion-sync-rules.md
  - docs/architecture/ubiquitous-language.md
  - docs/sprints/SESSION_0178.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0016 - Lineage Promotion Source of Truth

**Status:** Accepted
**Date:** 2026-05-17

## Context

Lineage Tree v1 needs to support public lineage browsing, editor-controlled visual placement, placeholder profile claims, and historical promotion rows. Before SESSION_0178, the app had `LineageNode` and `LineageRelationship(INSTRUCTOR_STUDENT)` for display, while `RankAward` stored rank history separately.

The SESSION_0177 lineage specs made the next schema direction explicit: promotion facts must not be inferred from drag/drop tree placement, and visual layout must not become the authority for martial arts rank history.

## Decision

`RankAward` is the canonical promotion fact.

`LineageRelationship(type=PROMOTED_BY)` is a graph mirror used for lineage traversal, drawer relationship display, and tree adapters. Its direction is:

- `fromNodeId` = promoter
- `toNodeId` = promoted person
- read as "`toNode` was promoted by `fromNode`"

`LineageTreeMember` stores tree-specific placement and selected display rank. It does not own promotion truth.

Multiple promotions between the same promoter and student are allowed. For that reason, SESSION_0178 uses `LineageRelationship.rankAwardId` as the unique promotion mirror key instead of preserving the old `fromNodeId + toNodeId + type` uniqueness for all relationship rows. A custom partial unique index preserves legacy pair/type uniqueness only for relationships without a `rankAwardId`.

`LineageNode.isVerified` and `LineageRelationship.isVerified` remain transitional compatibility fields. New code should read and write `verificationStatus`; migration backfills `VERIFIED` from existing `isVerified=true` and leaves all other rows `PENDING`.

## Dirstarter Docs Proof

| Layer | Source | Relevance |
| --- | --- | --- |
| Prisma/database | `https://dirstarter.com/docs/database/prisma` | Confirms Prisma schema and migration workflow as the baseline database path. |

## Consequences

**Positive**

- Rank history has one durable source of truth.
- Tree layout can change without rewriting promotion history.
- `PROMOTED_BY` traversal can represent repeated promotions by the same person.
- Claim and editor workflows can audit changes against concrete promotion facts.

**Negative**

- Server read models must reconcile `RankAward`, `PROMOTED_BY`, and `LineageTreeMember`.
- Prisma cannot express every integrity rule needed for lineage groups, so SESSION_0178 migration includes custom SQL indexes.
- Existing UI still reads `isVerified` until the next server/UI slice moves payloads to `verificationStatus`.

## Supersedes

- Any implicit assumption that `LineageRelationship(INSTRUCTOR_STUDENT)` alone is the promotion record.
- Any implicit assumption that visual drag/drop placement changes promotion truth.
