---
title: "Lineage Data Flows and Wiring Flows"
slug: lineage-data-wiring-flow
type: runbook
status: active
created: 2026-06-06
updated: 2026-07-09
last_agent: codex-session-0517
pairs_with:
  - docs/runbooks/sops/sop-data-and-wiring-flows.md
  - docs/runbooks/domain-features/lineage-listing-runbook.md
  - docs/product/black-belt-legacy/rank-entry-unified-data-flow.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0350.md
  - docs/sprints/SESSION_0517.md
tags:
  - lineage
  - directory
  - rank-entry
  - wiring
  - trust
  - sop
  - bbl
---

# Lineage Data Flows and Wiring Flows

## Purpose

The lineage peer of [`sop-data-and-wiring-flows.md`](../../runbooks/sops/sop-data-and-wiring-flows.md). Document the **lineage +
directory** flows in low-fi ASCII so:

- humans can reason about identity, rank history, trust, claims, and discovery without re-reading the schema;
- future agents have one current wiring map instead of reconstructing competing award/milestone/claim paths;
- genealogy truth, rank-entry trust, public presentation, and paid listing remain separate responsibilities.

> Strategy + monetization for lineage listings lives in [`lineage-listing-runbook.md`](../../runbooks/domain-features/lineage-listing-runbook.md).
> This SOP is the current runtime flow map. The detailed rank-entry decisions live in
> [`rank-entry-unified-data-flow.md`](rank-entry-unified-data-flow.md).

## 1. Identity and lineage substrate

```text
Passport (identity source of truth)
  |
  +--> DirectoryProfile (privacy + public profile fields)
  |
  +--> RankEntry[] (one canonical member rank record per standard rank)
  |       |
  |       +--> Rank or custom label + explicit ladder placement
  |       +--> RankEntryStatus: PENDING | UNVERIFIED | VERIFIED | DISPUTED
  |       +--> promotion date / promoter / school
  |       +--> story / media / uploaded certificate evidence
  |       +--> RankEntryReview[] (steward workflow, not another rank)
  |       +--> official CertificateIssuance[] references
  |       +--> append-only history and audit events
  |       |
  |       +--> Rank --> RankSystem --> Discipline
  |
  +--> LineageNode (tree membership identity / public lineage placement)
          |
          +--> LineageTreeMember (per-tree placement and public-rank flags)
          +--> LineageRelationship (PROMOTED_BY / INSTRUCTOR_STUDENT mirror)
          +--> LineageTreeAccess (TREE_ADMIN / TREE_EDITOR)

LineageRelationship may reference the RankEntry that explains the relationship,
but it does not own rank truth.
```

### RankEntry rules

- `RankEntry` is the cross-discipline backend concept. BJJ UI may call it a belt; other disciplines may use rank or
  level terminology.
- Existing `RankAward` storage is the migration anchor. `RankMilestone` is being absorbed into the same rank-entry
  aggregate and is not a separate member-facing concept.
- Members choose an initial rank during onboarding. It is immediately `UNVERIFIED` and editable.
- Entries at or below the member's current rank are freely addable and editable, even when unverified.
- A higher entry can be created as `PENDING`, but does not count as current, unlock another rank, or qualify for an
  official certificate until approved.
- Current rank is the highest non-pending entry in the discipline's ordering. `UNVERIFIED`, `VERIFIED`, and `DISPUTED`
  count; `PENDING` does not.
- One standard entry exists per member/rank. Multiple custom entries are allowed and carry a label plus placement
  relative to the default ladder.
- Promotion date edits are always immediate. Promoter or school changes create a pending review while preserving the
  existing active entry and current-rank ceiling.
- Story, photos, and uploaded certificate evidence are member-owned enrichment and do not change rank status.

## 2. Rank entry and steward review flow

```text
Member dashboard: /app/profile
  |
  +--> edit existing RankEntry at/below current rank
  |      |
  |      +--> date change ------------------------------> save immediately
  |      +--> story/media/certificate evidence ---------> save immediately
  |      +--> promoter/school change -------------------> RankEntryReview(PENDING)
  |                                                        |
  |                                                        +--> APPROVED: apply proposal
  |                                                        +--> DENIED: retain prior value
  |
  +--> request higher rank
  |      |
  |      +--> RankEntry(status=PENDING)
  |      +--> RankEntryReview(reason=NEW_RANK, PENDING)
  |      +--> APPROVED: entry becomes VERIFIED and raises ceiling
  |      +--> DENIED: entry returns to UNVERIFIED/non-current request
  |
  +--> flag another member's rank concern
         |
         +--> RankEntryReview(reason=DISPUTE, PENDING)
         +--> no automatic status change
         +--> steward may mark the entry DISPUTED
```

`RankEntryReviewStatus` is only `PENDING | APPROVED | DENIED`. Review reasons are `NEW_RANK`, `PROMOTER_CHANGED`,
`SCHOOL_CHANGED`, and `DISPUTE`. A reviewer note can request more information while a review remains pending.

`DISPUTED` is reserved for an active conflict. A denied review does not automatically make an entry disputed. A
disputed entry remains in current-rank calculation; the member may edit it, but cannot clear the disputed status.

## 3. Public visibility and trust presentation

```text
LineageTree                          LineageNode
  visibility: PUBLIC|UNLISTED|          visibility: PUBLIC|UNLISTED|RESTRICTED|PRIVATE
              RESTRICTED|PRIVATE
  isPublished: true ----------+
                              |
                              v
        searchPublishedLineageTrees / public tree viewer
                              |
        where: brand, isPublished=true, visibility in PUBLIC_VISIBILITY_SCOPE
                              |
                              v
        public profile projection consumes RankEntry read model
```

Trust is a presentation over rank-entry and review state, not a second rank record. The public projection may expose
`VERIFIED`, `UNVERIFIED`, `PENDING`, or `DISPUTED` according to the surface policy, but never exposes private evidence,
reviewer identity, or reporter identity.

```text
RankEntry.status = VERIFIED   -> Verified
RankEntry.status = UNVERIFIED -> Unverified
RankEntry.status = PENDING    -> Pending verification
RankEntry.status = DISPUTED   -> Disputed
```

Pending edits to an existing entry show the proposed promoter or school with `Pending verification` while the active
entry remains part of the current-rank calculation. The previous verified value is retained in history. A dispute is
visible as a status, but its report and private evidence are not public.

## 4. Authenticated and public profile surfaces

```text
/app/profile
  canonical authenticated member workspace
  RankEntry cards, editor, media/evidence, certificates, review state

/me
  retired product surface
  signed-in -> /app/profile
  signed-out -> login -> /app/profile

/directory/[slug]
  public read-only profile
  shared RankEntry read model; no rank editor
```

There is one write surface and one shared rank-entry read model. `/me` is not a second owner profile implementation.

## 5. Directory dispatch

`/directory` is the single public discovery surface. A result-type segmented control picks the facet; each facet keeps
its own privacy-aware query; a presentation-only adapter normalizes the card.

```text
GET /directory?type=people|organizations|trees&q=...
  |
  v
directoryFilterParamsCache.parse -> normalizeDirectoryFacetTab(type)
  |
  v
getDirectoryFacets({ brand, tab, params, viewer })
  |
  +-- people        -> getDirectoryProfiles -> mapPersonToFacet
  +-- organizations -> searchOrganizations -> mapOrganizationToFacet
  +-- trees         -> searchPublishedLineageTrees -> mapLineageTreeToFacet
  |
  v
DirectoryFacetResult -> FacetResultCard + Pagination
  |
  +-- person -> /directory/[slug]
  +-- org/school -> /schools/[slug] or /organizations/[slug]
  +-- tree -> /lineage/[treeSlug]
```

`DirectoryFacetResult` is a TypeScript union, not a new schema or status enum. It never widens private profile fields.

## 6. Claim, review, and entitlement flow

Identity claims remain separate from rank-entry reviews because they claim ownership of a Passport, not a rank. A rank
promotion request now feeds the unified `RankEntry`/`RankEntryReview` flow.

```text
Visitor claims a lineage node/tree        Member requests a higher rank
  |                                       |
  v                                       v
PassportClaimRequest(IDENTITY)            RankEntry(status=PENDING)
  |                                       RankEntryReview(NEW_RANK, PENDING)
  v                                       |
Admin/tree-admin review                   +--> APPROVED -> VERIFIED RankEntry
  |                                       +--> DENIED -> non-current/unverified
  +--> ownership / LineageTreeAccess

Approved identity + paid tier -> Stripe checkout -> webhook -> UserEntitlement
```

Identity claims never silently grant tree-wide editor rights: node claim grants node ownership; tree claim grants
`TREE_EDITOR`; `TREE_ADMIN` requires an explicit brand-admin grant.

## 7. Certificate flow

```text
Verified RankEntry
  -> authorized admin/steward selects Create certificate from /app/profile context
  -> existing CertificateTemplate preview
  -> CertificateIssuance created
  -> member or authorized admin downloads
  -> public QR/URL verifies authenticity without exposing the download
```

Member-uploaded certificate images/documents are evidence attached to the RankEntry. They are not official issuances.
Official generated certificates require a verified rank entry.

## 8. Tier and entitlement gating

```text
Active UserEntitlement keys (paid OR comped — same signal)
  |
  +--> LINEAGE_PREMIUM / LINEAGE_ELITE / LINEAGE_LEGEND
  |
  v
lineage tier policy -> free | premium | elite | legend render policy
  |
  +--> free owner/listing : /directory/[slug] preview only
  +--> premium+           : full profile fields allowed by DirectoryProfile privacy flags
  +--> owner/admin        : full owner preview without changing anonymous output
```

`Membership.status` is community/admin state and is not repurposed for commerce. Paid access is decided by active
`UserEntitlement` rows, never by reading Stripe state or membership lifecycle directly.

## 9. Privacy boundaries

```text
Public payloads MAY select:        Public payloads MUST NOT select:
  RankEntry.status                    RankEntryReview evidence
  public rank/date/media              reviewer notes / reviewer identity
  public pending/disputed label       reporter identity
  isPlaceholder / isClaimable         private DirectoryProfile fields
  discipline / public org names       private LineageNode member names
```

## 10. What not to do

- Do not create `BJJBeltEntry`, `TKDBeltEntry`, or discipline-specific rank tables.
- Do not restore separate member-facing `RankAward` and `RankMilestone` editors.
- Do not make `/me` a second authenticated profile workspace.
- Do not make a pending higher rank count toward current rank.
- Do not let a pending edit lower the member's active rank ceiling.
- Do not expose review evidence, reviewer notes, reporter identity, or private history publicly.
- Do not add a second verification badge field to `DirectoryProfile` or `LineageNode`.
- Do not invert `LineageRelationship` and `RankEntry`; the rank entry owns rank truth and the relationship mirrors it.

## Petey close

Passport owns identity, RankEntry owns rank history and member enrichment, RankEntryReview owns steward decisions, and
public profile surfaces consume projections. Keep those boundaries explicit and the lineage system stays honest.

**Planned Passion Produces Purpose.**
**OSSS.**
