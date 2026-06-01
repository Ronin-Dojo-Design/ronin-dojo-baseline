---
title: "Promotion Event Model — design + plan (PromotionEvent / belt ceremony)"
slug: promotion-event-model
type: plan
status: draft
created: 2026-05-31
updated: 2026-05-31
last_agent: claude-session-0316
pairs_with:
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/architecture/lineage/lineage-rank-promotion-sync-rules.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/petey-plan-0305.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Promotion Event Model — design + plan

> **Status: draft / staged.** Grilled and scoped in SESSION_0316; **not yet implemented.** Build via a
> dedicated ADR (amends ADR 0016) + petey-plan epic + its own session(s). Brian flagged this as **the most
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
2. **Discipline-agnostic.** An event groups `RankAward`s across any discipline (each award ties to its own
   rank/discipline). One ceremony can promote BJJ + FMA/WEKAF + Muay Thai together. No single discipline field
   on the event.
3. **Org roles:** `PromotionEvent.hostOrganizationId` (where it happened) **+** each `RankAward.organizationId`
   (awarding school of record) — venue is separate from credentialing school.
4. **Evidence:** shared `MediaAttachment[]` gallery on the `PromotionEvent` (shared by all its awards); presence
   of event media + an attestation drives the verification signal (event/awards → `VERIFIED`). No separate
   attendee model in v1.
5. **Display surfaces (all four):** (a) profile **Rank History** tab, (b) **lineage cohort group**
   (`LineageVisualGroup` derived from / linked to the event — like the SESSION_0316 "Dirty Dozen" group),
   (c) a **dedicated event / gallery page** per ceremony (shareable across BBL/Baseline), (d) **org/school
   profile promotions timeline**.

## Proposed schema (additive; consistent with ADR 0016)

```prisma
model PromotionEvent {
  id                 String    @id @default(cuid())
  title              String                              // "Coral Belt Ceremony — Erik Paulson's"
  eventDate          DateTime
  location           String?                             // free-text venue fallback
  description        String?
  attestedById       String?                             // witness/attestor (e.g. Brian) — drives verification
  // host venue (where held), distinct from each award's awarding school of record
  hostOrganization   Organization? @relation(fields: [hostOrganizationId], references: [id], onDelete: SetNull)
  hostOrganizationId String?
  rankAwards         RankAward[]
  mediaAttachments   MediaAttachment[]                   // shared event gallery
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  @@index([eventDate])
  @@index([hostOrganizationId])
}

// On RankAward (additive):
//   promotionEvent   PromotionEvent? @relation(fields: [promotionEventId], references: [id], onDelete: SetNull)
//   promotionEventId String?
```

- `RankAward` stays the canonical per-person promotion fact; `promotionEventId` (nullable) groups awards into a
  ceremony. Removing an event never drops promotion history (`SetNull`).
- `LineageVisualGroup` (cohort display) should be derivable from / linkable to the event so the tree cohort and
  the event are one truth, not two.
- Optional future `enum PromotionEventType { PROMOTION_CEREMONY, SEMINAR, GRADING, COMPETITION }` (deferred).

## Open questions (resolve in the dedicated session / further grill rounds)

- **Attestor type:** `attestedById` as a single `User` FK (e.g. Brian) vs. a richer attendees/witnesses relation.
  Brian leaned to "media + attestation drives verification, no separate attendee model in v1" — confirm the
  single-attestor FK is enough.
- **Verification semantics:** does event media + attestor auto-set `VERIFIED`, or does an admin still confirm /
  can DISPUTE? How does this interact with `LineageRelationship.verificationStatus`?
- **WEKAF specifics:** WEKAF (Eskrima/Arnis) promotions may be competition/tournament-driven — does an event need
  to link competition results, or is the manual-ceremony model sufficient for v1?
- **Creation/edit permissions:** who can create/edit a `PromotionEvent` across brands + white-label (platform
  admin, org owner/admin, the promoter)? Maps to the lineage editor capability model.
- **Cohort group linkage:** does `LineageVisualGroup` gain a `promotionEventId`, or does the seed derive groups
  from events at sync time?

## Relationship to ADR 0016

ADR 0016 ("RankAward is the canonical promotion fact; the tree never owns truth") stands. This adds a grouping
fact (the event) above the award; **needs an ADR 0016 amendment note** (similar to the SESSION_0311
`RankAward.organizationId` addition).

## Staged task outline (for the dedicated epic)

1. ADR amendment to 0016 + finalize the schema (resolve open questions).
2. Migration: `PromotionEvent` + `RankAward.promotionEventId` + `MediaAttachment` back-relation.
3. Seed the **April 10, 2026 ceremony** as the canonical test case (new people + Rick Williams date correction).
4. Display: profile Rank-History link, lineage cohort group from event, dedicated event/gallery page, org timeline.
5. Editor + permissions for event creation; media upload to the shared gallery.

## Cross-references

- [ADR 0016 — Lineage Promotion Source of Truth](../decisions/0016-lineage-promotion-source-of-truth.md)
- [Lineage Rank Promotion Sync Rules](lineage-rank-promotion-sync-rules.md)
- [Lineage Domain Hub](../../runbooks/domain-features/lineage-hub.md)
- [Petey Plan 0305 — Lineage Tree Enhancement Epic](../../petey-plan-0305.md)
