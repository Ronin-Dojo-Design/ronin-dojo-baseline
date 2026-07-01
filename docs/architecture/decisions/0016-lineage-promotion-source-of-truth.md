---
title: "ADR 0016 - Lineage Promotion Source of Truth"
slug: adr-0016
type: adr
status: accepted
created: 2026-05-17
updated: 2026-07-01
last_agent: codex-session-0479
pairs_with:
  - docs/architecture/lineage/lineage-prisma-schema-patch-proposal.md
  - docs/architecture/lineage/lineage-rank-promotion-sync-rules.md
  - docs/architecture/ubiquitous-language.md
  - docs/architecture/decisions/0042-rank-award-fact-vs-member-milestone.md
  - docs/sprints/SESSION_0178.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0479.md
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
| Prisma/database | `<https://dirstarter.com/docs/database/prisma`> | Confirms Prisma schema and migration workflow as the baseline database path. |

## Consequences

### Positive

- Rank history has one durable source of truth.
- Tree layout can change without rewriting promotion history.
- `PROMOTED_BY` traversal can represent repeated promotions by the same person.
- Claim and editor workflows can audit changes against concrete promotion facts.

### Negative

- Server read models must reconcile `RankAward`, `PROMOTED_BY`, and `LineageTreeMember`.
- Prisma cannot express every integrity rule needed for lineage groups, so SESSION_0178 migration includes custom SQL indexes.
- Existing UI still reads `isVerified` until the next server/UI slice moves payloads to `verificationStatus`.

## Supersedes

- Any implicit assumption that `LineageRelationship(INSTRUCTOR_STUDENT)` alone is the promotion record.
- Any implicit assumption that visual drag/drop placement changes promotion truth.

## Amendments

### SESSION_0311 (2026-05-30) — awarding-school link (lineage Phase 3-0)

Added a nullable `RankAward.organizationId` FK → `Organization` (`ON DELETE SET NULL`, indexed).
It records **the school that awarded a belt** — a third axis, distinct from `awardedBy` (the
promoter) and from the member's current `Membership`/affiliation. The core decision above is
unchanged: `RankAward` remains the canonical promotion fact; this only enriches it. Free-text
`location` is retained as a fallback for unstructured/historical entries. Migration
`20260531033236_add_rankaward_organization` is purely additive (no data loss). Consumed by lineage
Phase 3d (promotion-history school links in the persistent profile panel) per `docs/petey-plan-0305.md`.

### SESSION_0318 (2026-05-31) — PromotionEvent grouping fact (belt ceremony)

Added a first-class `PromotionEvent` model that **groups** multiple `RankAward`s into one ceremony
with a shared date, host venue, description, and shared media gallery. The core decision above is
unchanged: `RankAward` remains the canonical per-person promotion fact. `PromotionEvent` sits
*above* the award as an **optional grouping**; removing an event never drops promotion history.

Additive schema delta (SESSION_0318 migration; purely additive — `CREATE TABLE` + nullable
`ADD COLUMN` + indexes/FKs, no drops, no NOT NULL backfill):

- New `PromotionEvent { id, title, eventDate, location?, description?, hostOrganizationId?, createdAt, updatedAt }`

  with `hostOrganizationId` pointing to `Organization` (`SET NULL`), indexed on `eventDate` and
  `hostOrganizationId`.

- `RankAward.promotionEventId String?` → `PromotionEvent` (`SET NULL`, indexed). Nullable; an award

  belongs to at most one event.

- `MediaAttachment.promotionEventId String?` → `PromotionEvent` (indexed), following the existing

  polymorphic per-owner FK pattern (`rankAwardId`, `eventId`, …), giving the event a shared gallery.

- `LineageVisualGroup.promotionEventId String?` → `PromotionEvent` (`SET NULL`, indexed). A per-tree

  cohort group (e.g. the SESSION_0316 "Dirty Dozen" box) may point at the global event it
  represents — **many cohort boxes → one event** (multiple brand trees; multiple parents within a
  tree). The group and the event become one truth instead of a fragile date-match.

Decisions locked in the SESSION_0318 grill that constrain this model:

- **No verification signal on the event.** `PromotionEvent` does not auto-verify and does not propose

  verification status. Verification stays exactly where this ADR puts it — role-gated on
  `RankAward` / `LineageRelationship.verificationStatus`, set by the promoting instructor / admin /
  school-owner / instructor / user with a granted lineage capability. Event media and attendance are
  **not** an authority over rank truth.

- **No attestor / attendee model in v1.** The earlier `promotion-event-model.md` draft proposed

  `attestedById` to "drive verification"; with verification decoupled (above), that field has no
  consumer. The promoter is already on `RankAward.awardedById` and the photo uploader on
  `Media.uploadedById`. A `PromotionEventAttendee` join table may be added additively later only when
  a real feature needs it.

- **Discipline-agnostic + dual org axis retained.** An event groups awards across any discipline;

  each award keeps its own rank/discipline. `PromotionEvent.hostOrganizationId` (venue) is distinct
  from each `RankAward.organizationId` (awarding school of record, per the SESSION_0311 amendment).

Consumed by the April 10, 2026 Coral Belt Ceremony seed and a read-only Rank-History event link in
SESSION_0318. The dedicated event/gallery page, media upload, event editor, and permission model are
deferred to a later epic per `docs/architecture/lineage/promotion-event-model.md`.

### SESSION_0479 (2026-07-01) — RankMilestone enrichment beside the award fact

Added `RankMilestone` as a 1:1, member-owned enrichment record for a `RankAward`, plus
`MediaAttachment.rankMilestoneId` for Belt Journey media. The core decision above is unchanged:
`RankAward` remains the canonical promotion fact. A milestone has no rank authority, verification status, or
privacy state; it stores editable story/media enrichment only and cascades when its owning award is deleted.
See [ADR 0042](0042-rank-award-fact-vs-member-milestone.md).
