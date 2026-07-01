---
title: "ADR 0043 - RankAward fact vs member-owned RankMilestone"
slug: adr-0043-rank-award-fact-vs-member-milestone
type: adr
status: accepted
created: 2026-07-01
updated: 2026-07-01
last_agent: codex-session-0479
deciders: Brian Scott
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/ubiquitous-language.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0479.md
tags:
  - architecture
  - lineage
  - rank-history
  - prisma
  - bbl
---

# ADR 0043 - RankAward fact vs member-owned RankMilestone

## Status

Accepted - 2026-07-01 (SESSION_0479).

## Context

BBL's Belt Journey feature needs editable member storytelling around each belt: a short narrative and media grouped
by purpose (`belt`, `instructor`, `certificate`, `competition`). That enrichment must not weaken the lineage
invariant ratified in [ADR 0016](0016-lineage-promotion-source-of-truth.md): `RankAward` is the canonical
promotion fact, and display rank derives from awarded truth per
[ADR 0035](0035-lineage-rank-display-from-awarded-truth.md).

Before this decision, `RankAward.mediaUrls Json?` existed as a legacy media escape hatch. The app also already has
the richer `Media` / `MediaAttachment` substrate with nullable owner FKs for rank awards, promotion events,
courses, organizations, content atoms, certificates, and other domain records.

## Decision

Add `RankMilestone` as a 1:1, member-owned enrichment record beside `RankAward`.

- `RankMilestone.rankAwardId` is unique and required.
- Deleting the owning `RankAward` cascades to its `RankMilestone`.
- The milestone stores optional `story` plus timestamps.
- The milestone has no `rankId`, no verification fields, no privacy fields, and no authority over the promotion
  fact.
- `MediaAttachment.rankMilestoneId` is a new nullable polymorphic FK that mirrors the existing media attachment
  pattern. Attachment `purpose` remains a string convention, not an enum.
- `RankAward.mediaUrls Json?` is deprecated in Prisma schema comments and retained for backward compatibility.

## Dirstarter Docs Proof

| Layer | Source | Relevance |
| --- | --- | --- |
| Prisma/database | <https://dirstarter.com/docs/getting-started> | Dirstarter initializes the database through Prisma client generation and committed migrations (`db:migrate deploy`), matching this slice's versioned migration path. |
| Prisma/database | <https://dirstarter.com/docs/introduction> | Dirstarter identifies Prisma as the schema and type-safe database access layer. |

## Consequences

### Positive

- `RankAward` stays narrow: it records who earned which rank, when, from whom, and with what verification state.
- Belt Journey can evolve independently as profile enrichment without becoming a second rank source of truth.
- Media uses the existing `MediaAttachment` table and owner-FK pattern instead of JSON blobs or a new gallery model.
- The migration is additive: one new table, one nullable FK, indexes, and foreign keys.

### Negative

- Slice 3+ code must join through `RankMilestone` when loading Belt Journey data; reading only `RankAward` will not
  include member stories.
- Existing `RankAward.mediaUrls` data, if any, remains as legacy data until a later migration/backfill decides
  whether to migrate or drop it.
- Attachment purpose values are string conventions, so consumers must centralize allowed-purpose validation in
  application code when write paths land.

## Enforcement

- Mutations may create, update, or delete a milestone only within the rank ceiling invariant from the epic plan.
- Milestone edits never change `RankAward.rankId` and never change `RankAward.verificationStatus`.
- Verified rank facts remain protected by the existing/future fact-update rules; the milestone remains editable
  because it is enrichment, not verification.

## Related

- [Petey Plan 0477 - Belt Journey + School-Leads Flywheel + BBL CRM](../../petey-plan-0477-belt-journey-crm-epic.md)
- [Lineage Domain Hub](../../runbooks/domain-features/lineage-hub.md)
- [Ubiquitous Language](../ubiquitous-language.md)
