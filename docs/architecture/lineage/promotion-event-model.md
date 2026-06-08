---
title: "Promotion Event Model — design + plan (PromotionEvent / belt ceremony)"
slug: promotion-event-model
type: plan
status: accepted
created: 2026-05-31
updated: 2026-05-31
last_agent: codex-session-0351
pairs_with:
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/architecture/lineage/lineage-rank-promotion-sync-rules.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/petey-plan-0305.md
  - docs/sprints/SESSION_0318.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Promotion Event Model — design + plan

> **Status: accepted / implementing (SESSION_0318).** Grilled and scoped in SESSION_0316; open questions
> resolved and ADR 0016 amended in SESSION_0318 (see "Resolved (SESSION_0318)" below). The additive schema
> spine + April 10 seed + read-only cohort/Rank-History wiring ship in SESSION_0318; the gallery page, media
> upload, event editor, and permission model are deferred to a later epic. Brian flagged this as **the most
> important domain logic across Ronin Dojo Design, BBL, WEKAF, Baseline, and the white-labeled sites sold on RDD.**

## Why this exists

`RankAward` is already the canonical promotion fact (ADR 0016): per-belt `awardedAt`, `awardedBy` (promoter),
`organizationId` (awarding school), `location`, `notes`, `mediaUrls`/`MediaAttachment[]`. What is missing is a
first-class object that groups **multiple people's awards into one ceremony/event** — a shared date, host,
promoter(s), title, and **shared media gallery**. Today five people promoted at one ceremony are five
disconnected `RankAward`s that merely share a date.

## Canonical triggering event (use as the seed / test case)

**April 10, 2026 — Coral Belt Ceremony, hosted at Erik Paulson's school.** Brian attended; has photos + videos
to publish to BBL + Baseline.

| Promotee | Rank awarded | Promoter (awardedBy) |
| --- | --- | --- |
| Rigan Machado | Red Belt (R9) | Rorion Gracie |
| Erik Paulson | 7th Degree Coral (CB7) | Rigan Machado |
| Casey Olsen | 7th Degree Coral (CB7) | Rigan Machado |
| Rick Minter | 7th Degree Coral (CB7) | Rigan Machado |
| Rick Williams | 7th Degree Coral (CB7) | Rigan Machado |

- **Two promoters in one event** (Rorion → Rigan; Rigan → the four). The event groups awards regardless of

  promoter; each `RankAward` keeps its own `awardedById`.

- **New people** to add: Erik Paulson, Casey Olsen, Rick Minter (recipients), Rorion Gracie (promoter).
- **Data correction:** Rick Williams' real CB7 date is **2026-04-10** (SESSION_0316 seeded an approximate 2018

  date, flagged for refinement — this is the refinement).

## Locked decisions (SESSION_0316 grill rounds 1–2)

1. **New `PromotionEvent` entity** (Brian ratified the recommendation). Global fact like `RankAward`,

   displayed per-brand.

1. **Discipline-agnostic.** An event groups `RankAward`s across any discipline (each award ties to its own

   rank/discipline). One ceremony can promote BJJ + FMA/WEKAF + Muay Thai together. No single discipline field
   on the event.

1. **Org roles:** `PromotionEvent.hostOrganizationId` (where it happened) **+** each `RankAward.organizationId`

   (awarding school of record) — venue is separate from credentialing school.

1. **Evidence:** shared `MediaAttachment[]` gallery on the `PromotionEvent` (shared by all its awards); presence

   of event media + an attestation drives the verification signal (event/awards → `VERIFIED`). No separate
   attendee model in v1.

1. **Display surfaces (all four):** (a) profile **Rank History** tab, (b) **lineage cohort group**

   (`LineageVisualGroup` derived from / linked to the event — like the SESSION_0316 "Dirty Dozen" group),
   (c) a **dedicated event / gallery page** per ceremony (shareable across BBL/Baseline), (d) **org/school
   profile promotions timeline**.

## Proposed schema (additive; consistent with ADR 0016)

> **SESSION_0318:** `attestedById` was **removed** (no attestor/attendee model in v1 — see Resolved below).
> The `LineageVisualGroup.promotionEventId` cohort link was **added**. Final shape:

```prisma
model PromotionEvent {
  id                 String    @id @default(cuid())
  title              String                              // "Coral Belt Ceremony — Erik Paulson's"
  eventDate          DateTime
  location           String?                             // free-text venue fallback
  description        String?
  // host venue (where held), distinct from each award's awarding school of record
  hostOrganization   Organization? @relation(fields: [hostOrganizationId], references: [id], onDelete: SetNull)
  hostOrganizationId String?
  rankAwards         RankAward[]
  mediaAttachments   MediaAttachment[]                   // shared event gallery
  visualGroups       LineageVisualGroup[]                // cohort boxes that represent this event
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  @@index([eventDate])
  @@index([hostOrganizationId])
}

// On RankAward (additive):
//   promotionEvent   PromotionEvent? @relation(fields: [promotionEventId], references: [id], onDelete: SetNull)
//   promotionEventId String?
// On MediaAttachment (additive, polymorphic per-owner column):
//   promotionEvent   PromotionEvent? @relation(fields: [promotionEventId], references: [id])
//   promotionEventId String?
// On LineageVisualGroup (additive — cohort link):
//   promotionEvent   PromotionEvent? @relation(fields: [promotionEventId], references: [id], onDelete: SetNull)
//   promotionEventId String?
```

- `RankAward` stays the canonical per-person promotion fact; `promotionEventId` (nullable) groups awards into a

  ceremony. Removing an event never drops promotion history (`SetNull`).

- `LineageVisualGroup.promotionEventId` (nullable) links each per-tree cohort box to the one global event —

  many boxes → one event — so the tree cohort and the event are one truth, not two.

- Optional future `enum PromotionEventType { PROMOTION_CEREMONY, SEMINAR, GRADING, COMPETITION }` (deferred).

## Resolved (SESSION_0318)

All five open questions were resolved in the SESSION_0318 Petey grill and ratified by Brian:

- **Attestor type → DROPPED.** No `attestedById` and no attendee/witness model in v1. Its only stated purpose

  was driving verification, which is now decoupled (below). The promoter is on `RankAward.awardedById` and the
  uploader on `Media.uploadedById`. A `PromotionEventAttendee` join table can be added additively later if a real
  consumer appears.

- **Verification semantics → NO EVENT SIGNAL.** The event neither auto-verifies nor proposes status. Verification

  stays role-gated on `RankAward` / `LineageRelationship.verificationStatus`, set by the promoting instructor /
  admin / school-owner / instructor / user with a granted lineage capability — exactly per ADR 0016 + the sync
  rules. Event media/attendance is not an authority over rank truth.

- **WEKAF specifics → DEFERRED (v2).** The manual-ceremony model is sufficient for v1; competition/tournament

  result linkage is out of scope.

- **Creation/edit permissions → DEFERRED (later epic).** Event editor + capability model are not in the

  SESSION_0318 spine; the schema is read-only-seeded for now.

- **Cohort group linkage → FK ON GROUP.** Added nullable `LineageVisualGroup.promotionEventId` (`SetNull`).

  Many per-tree cohort boxes point at one global event (many-to-one), not derived-at-sync date matching.

## Relationship to ADR 0016

ADR 0016 ("RankAward is the canonical promotion fact; the tree never owns truth") stands. This adds a grouping
fact (the event) above the award; the **ADR 0016 amendment was written in SESSION_0318** (similar to the
SESSION_0311 `RankAward.organizationId` addition) — see ADR 0016 → "SESSION_0318 — PromotionEvent grouping fact".

## Staged task outline (for the dedicated epic)

1. ADR amendment to 0016 + finalize the schema (resolve open questions).
1. Migration: `PromotionEvent` + `RankAward.promotionEventId` + `MediaAttachment` back-relation.
1. Seed the **April 10, 2026 ceremony** as the canonical test case (new people + Rick Williams date correction).
1. Display: profile Rank-History link, lineage cohort group from event, dedicated event/gallery page, org timeline.
1. Editor + permissions for event creation; media upload to the shared gallery.

## Cross-references

- [ADR 0016 — Lineage Promotion Source of Truth](../decisions/0016-lineage-promotion-source-of-truth.md)
- [Lineage Rank Promotion Sync Rules](lineage-rank-promotion-sync-rules.md)
- [Lineage Domain Hub](../../runbooks/domain-features/lineage-hub.md)
- [Petey Plan 0305 — Lineage Tree Enhancement Epic](../../petey-plan-0305.md)
