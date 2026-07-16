---
title: "BBL RankEntry Unified Domain and Data Flow"
slug: bbl-rank-entry-unified-data-flow
type: architecture-spec
status: proposed
created: 2026-07-09
updated: 2026-07-16
last_agent: codex-session-0542
pairs_with:
  - docs/product/black-belt-legacy/lineage-data-wiring-flow.md
  - docs/product/black-belt-legacy/rankentry-unification-epic.md
  - docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0047-promoter-as-placeholder-recruited-coach-identity.md
  - docs/petey-plan-0477-belt-journey-crm-epic.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0517.md
  - docs/sprints/SESSION_0542.md
tags:
  - bbl
  - rank-entry
  - belt-journey
  - verification
  - profile
---

# BBL RankEntry Unified Domain and Data Flow

## Purpose

This is the BBL target architecture for the member's rank history. A member sees one rank entry containing promotion
details, story, media, uploaded certificate evidence, official certificate references, verification state, and review
history. The backend must not make one member concept span separate award, milestone, promotion-request, and editor
surfaces.

## Canonical model

`RankEntry` is the generic backend concept. BJJ-facing UI may call it a belt; Muay Thai or wrestling may use rank,
level, or another presentation term. The discipline comes through `Rank -> RankSystem -> Discipline`.

```text
Passport
  └── RankEntry
        ├── Rank or custom label + explicit ladder placement
        ├── status: PENDING | UNVERIFIED | VERIFIED | DISPUTED
        ├── promotion date / promoter / school
        ├── story / media / uploaded certificate evidence
        ├── RankEntryReview[]
        ├── CertificateIssuance[] references
        └── append-only history/audit events
```

The migration anchor is the existing `RankAward` row. The member-owned fields from `RankMilestone` are absorbed into
the same rank-entry aggregate, and `RankMilestone` is retired as a separate member-facing concept. Existing certificate
template/issuance records remain related artifacts, not competing rank records.

## Status and review

`RankEntryStatus` is the only member-facing rank status:

```text
PENDING     New higher rank awaiting steward review.
UNVERIFIED  Member-entered active rank without steward approval.
VERIFIED    Rank details approved by the steward.
DISPUTED    Active conflict marked by a steward.
```

`RankEntryReviewStatus` is internal and intentionally small:
`PENDING | PROPOSAL_PENDING | APPROVED | DENIED`. `PROPOSAL_PENDING` identifies an immutable captured
promoter-change proposal; legacy and other review writers retain `PENDING` during the expand/contract rollout.

Review reasons are `NEW_RANK`, `PROMOTER_CHANGED`, `SCHOOL_CHANGED`, and `DISPUTE`. A reviewer note can request more
information while a review remains pending; no additional lifecycle enum is needed.

```text
Established promoter A -> B   -> active RankEntry keeps A + immutable PROMOTER_CHANGED proposal
Same B while PENDING          -> idempotent; return the existing proposal
Different target while open  -> conflict; never mutate or supersede the proposal
Free-typed recruited coach    -> active UNVERIFIED no-review path (ADR 0047 D1/D5)
Higher-rank request           -> pending RankEntry + NEW_RANK review
Member dispute flag           -> DISPUTE review; no automatic status change
Steward approval              -> atomically apply exact B + verify, or activate higher entry
Steward denial                -> retain prior accepted value/status; preserve history
```

Promotion dates, stories, photos, and uploaded certificate evidence remain freely editable. An established-promoter
replacement enters review automatically; ADR 0047's free-typed recruited-coach path remains unreviewed. The proposal
stores immutable expected-prior and proposed-promoter identities separately from active provenance. A pending edit
must not lower the member's active-rank ceiling. `SCHOOL_CHANGED` remains part of the target model, but ADR 0047 D7
does not silently expand this implementation slice to school edits.

Only one `PROPOSAL_PENDING` promoter proposal may exist per entry. Approval conditionally claims that exact
`PROMOTER_CHANGED` review, verifies the expected prior promoter is still active, applies the proposed promoter,
verifies the entry, audits, and marks APPROVED in one transaction. Denial marks DENIED and audits without changing
the accepted promoter or prior entry status. An ordinary admin edit is blocked while the proposal is pending; an
explicit override atomically denies it, applies the override under admin authority, and audits the override.
Legacy `PENDING/PROMOTER_CHANGED` rows remain visible for operator inventory but fail closed because they have no
captured proposal; the preceding release's PENDING-only reviewer cannot action a new `PROPOSAL_PENDING` row.

The current rank is the highest non-pending entry in the discipline's ordering. `UNVERIFIED`, `VERIFIED`, and
`DISPUTED` count; `PENDING` does not. One standard entry exists per member/rank. Multiple custom entries are allowed,
with a label and placement relative to the default IBJJF ladder.

## Surfaces

```text
/app/profile
  canonical authenticated member workspace: rank cards, editor, evidence, certificates, review state

/me
  retired product surface: signed-in -> /app/profile; signed-out -> login -> /app/profile

/directory/[slug]
  public read-only profile using the shared RankEntry projection
```

There is one rank-entry write surface and one shared read model. Member/reviewer views may show an established-coach
proposal as **Pending review**. Public views continue to show the accepted promoter and may show only the permitted
trust label; they never expose the proposed promoter, reviewer identity, reporter identity, or private evidence.

## Certificate flow

```text
Verified RankEntry
  -> authorized admin/steward creates from /app/profile context
  -> existing CertificateTemplate preview
  -> CertificateIssuance created
  -> member or authorized admin downloads
  -> public QR/URL verifies authenticity without download access
```

Member-uploaded certificates are evidence on the RankEntry. Official generated certificates require `VERIFIED` status.

## Migration order

1. Add target fields/relations and a compatibility read model.
2. Backfill `RankAward` + `RankMilestone` data into the unified projection; preserve IDs and media.
3. Switch `/app/profile` reads and writes to RankEntry behavior.
4. Move reviews, media/evidence, and certificate creation/download into the rank-entry workspace.
5. Retire `/me` via redirect and migrate links/tests.
6. Switch public profile reads to the shared RankEntry projection.
7. Remove legacy milestone and split-path code only after data and browser proofs.

No destructive deletion belongs in the first read/write cutover.

## Non-goals

- No separate `BJJBeltEntry`, `TKDBeltEntry`, or discipline-specific rank tables.
- No mandatory stripe entries.
- No automatic dispute status from member reports.
- No Brian Truelson email until ledgers and the complete member workflow are cleared.
