---
title: "BBL Epic — Retire RankAward, unify on RankEntry (KISS the rank model)"
slug: rankentry-unification-epic
type: epic-plan
status: proposed
created: 2026-07-10
updated: 2026-08-01
last_agent: codex-session-0731
pairs_with:
  - docs/product/black-belt-legacy/rank-entry-unified-data-flow.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md
  - docs/architecture/decisions/0047-promoter-as-placeholder-recruited-coach-identity.md
  - docs/learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0523.md
  - docs/sprints/SESSION_0542.md
---

# BBL Epic — Retire `RankAward`, unify on `RankEntry`

> **Operator mandate (SESSION_0523):** "KISS the hell out of this — none of it should be this complicated
> and convoluted. RankEntry should be the ONE rank model." Root cause named by the operator: the
> course/curriculum-vs-lineage separation designed for **Baseline** is over-engineering for **BBL**, where
> it's just lineage + belt + verified-or-not. This epic collapses the rank model to a single table.
>
> **Current sequencing (SESSION_0730 ratification):** #397 completed the read-collapse. #380 folds
> the model and drops `RankAward` **before the FI-001 send**, after #377 and the #398 environment
> blocker. Until then, RankEntry owns reads while RankAward remains the write/fact compatibility
> anchor. Imported WP rows are member self-reports; their IMPORTED lock is lifted.

## Critical schema ground-truth (governs everything below)

- `RankAwardSource { STATED, EARNED }` (NOT "STATED/IMPORTED/AWARDED").
- `RankAwardVerificationStatus { UNVERIFIED, VERIFIED, DISPUTED, IMPORTED }` — `IMPORTED` is the
  historical marker on the temporary award anchor. Promoter transitions preserve it, but it does
  not lock the member's self-reported facts.
- `RankEntryStatus { PENDING, UNVERIFIED, VERIFIED, DISPUTED }` — **no `IMPORTED`**; `rankEntryStatusForAward`
  collapses IMPORTED→VERIFIED for presentation while immutable `RankEntry.provenance` preserves the
  origin axis. Provenance is private historical metadata; the belt-gate does not read it.

## Display gap (= steps 6-7)

**Closed by #397 (SESSION_0730).** The shared `memberRanks` / `memberTopRank` seam and
`rankEntryDisplayOrder` now root rank display in RankEntry across public, lineage, directory,
passport, admin, tournament, claim, onboarding, and belt readers. Rich fact payloads still join the
temporary RankAward anchor until #380.

## Phasing

### Landed read-collapse — #397. No schema fold or table drop.

- **Slice A — WL-P2-46:** retire `node.isVerified`/`node.verificationStatus` trust axis → derive from the
  verified `RankEntry.status` through ONE resolver, across canvas/directory/m-card/mobile-list/carousel/galaxy
  (drawer done SESSION_0522). Shown trust = highest non-PENDING RankEntry status (spec line 82). **Reads only**
  — writers + columns stay (LR 0008 coda: don't bundle the schema drop). *(In flight: Cody.)*
- **Slice B — step 6:** display reads re-root on the RankEntry projection (`canvas-model.ts:66`, `payloads.ts`,
  `ancestry.ts:177`, directory/public, top-ranked). **Facts still JOINED from RankAward** (additive; mirrors the
  shipped `belt-tab-loader.ts` pattern). Overlaps Slice A's payload wiring.
- **Slice C — step 7:** delete the dead owner-arm/split-path (`me-profile/*`, `owner-profile.tsx`,
  `loadProfileViewForOwner`) — **after Doug data + browser proofs** (spec line 123).

### Pre-send endgame — #377 guard, then #380 fold, rewire, drop.

- **D — expand (additive, safe anytime):** add fact/provenance cols to RankEntry (`awardedAt`, `source`,
  `provenance`, `awardedById`, `awardedByPassportId`, `notes`, `location`, `organizationId`, `promotionEventId`)
  + backfill from RankAward (1:1 via `rankAwardId`). Add nullable `rankEntryId` to the 4 FK-holders
  (`LineageRelationship`, `RankMilestone`, `MediaAttachment`, `GamificationEvent`) + backfill.
  Preserve the immutable expected-prior/proposed-promoter snapshot and decision history on `RankEntryReview`
  (ADR 0047 D7); proposal data is not an active RankEntry fact.
- **E — belt-gate rewire:** `ceilingSortOrder`/`isWithinCeiling`/`isTopAward` port cleanly
  (`rank.sortOrder` only). Fact editability keeps `source`, `awardedById`, and DISPUTED rules;
  provenance locks nothing. Imported self-reports remain member-editable, and promoter transitions
  preserve their IMPORTED compatibility status.
- **F — moat/edge FK repoint:** `LineageRelationship.rankAwardId → rankEntryId` (rename + FK swap; preserve the
  `@@unique` PROMOTED_BY mirror = repeated-promotion semantics, ADR 0016). ⚠ `rankAwardId` is `SetNull` today —
  dropping RankAward before this repoint silently orphans the whole PROMOTED_BY graph (the moat-rip).
- **G — writers RankEntry-native:** place-lead/claim-finalize/add-person/router/node-profile-actions/verify
  write RankEntry directly; delete `syncRankEntryFromAward` + `rankEntryStatusForAward` (10 call-sites). ⚠ the
  seed/import/enrich scripts create RankAward *without* the sync seam — audit for orphan awards first.
  ⚠ **Belt trust/proposal compatibility writers (SESSION_0540–0542, FINDING_06 → ADR 0047 D6):**
  `decideBackfillPromoterTransition` / `applyMemberPromoterTransition`
  (`server/belt/{belt-gate,promoter-proposal-core}.ts`) write `RankAward.verificationStatus` and re-read promoter
  provenance from `RankAward`. The shared `verifyRankEntryInTransaction`
  (`server/belt/verify-rank-entry-core.ts`) also promotes non-imported `RankAward.verificationStatus` before syncing
  the entry; promoter-proposal approval calls that core. This is net-new RankAward-keyed decision logic added
  mid-migration. Relocate the trust decision, verify status write, proposal apply/override, expected-prior stale
  guard, and anchor/promoter re-read together onto RankEntry-native facts/status so the immutable proposal remains
  separate from active provenance after `RankAward` retires. Preserve one-pending semantics (same target
  idempotent; different target conflict) and the explicit admin override's deny+apply+audit transaction.
- **H — recruited-coach claim/confirm + MERGE loop (phase 2):** give an invited coach an explicit claim door to
  the doorless recruited-coach placeholder; bind the registered identity only after adjudication; let the coach
  confirm or dispute the exact promotion edges attributed to them; and make the admin MERGE tool repoint duplicate
  placeholder edges plus the linked Lead metadata with a durable audit trail. Registration or identity binding must
  never auto-verify a promotion. Preserve the no-public-leak rule and implement the fact/status transitions on the
  RankEntry-native spine after G, before the destructive contract.
- **I — contract (destructive, LAST):** drop old `rankAwardId` cols + `RankEntry.rankAwardId`; `DROP TABLE RankAward`;
  drop the two RankAward enums if unused.

Migration discipline: use hand-authored SQL for data-sensitive changes; never run `prisma migrate dev` against
`ronindojo_prodsnap` (an explicitly named disposable scratch database is the only local generation target); additive-first;
`ALTER TYPE ... ADD VALUE` can't be consumed in the same tx; `migrate deploy` auto-applies on prod via prebuild.

## Open decisions

1. **Edge-axis fork (blocks nothing this session — deferred out of Slice A):** does `LineageRelationship.isVerified`
   retire onto RankEntry or stay as edge provenance? **Recommendation: keep as edge provenance** — it's the
   `ancestry.ts` "prefer the confirmed parent" structural tiebreak that RankEntry can't express (RankEntry knows
   a member's rank, not which of N instructor edges is canonical) — but **strip its member-facing badges** (the
   drawer instructor-edge "Unverified", lineage-tab) which duplicate the RankEntry axis. Its one surface story =
   zero public badges + a steward-only provenance chip in the editor.
2. **Provenance representation for the fold (ratified):** the dedicated immutable `provenance`
   column remains separate from mutable `RankEntryStatus`; exact DB enforcement rides #380.
3. **Table-drop timing (ratified):** before the FI-001 Brian send; #380 remains blocked on #398
   and follows #377.

## ADR skeleton (to write when the epic starts)

The #380 ADR supersedes 0016 / 0035 / 0043 and revises `rank-entry-unified-data-flow.md` from
"migration anchor is the existing RankAward row" to "RankEntry is standalone; RankAward retired."
Decision: RankEntry is the one
durable rank record — member status + promotion fact + provenance. Invariants preserved: display = highest
awarded entry by sortOrder with the shared nulls-last tiebreak (ADR 0035); status is mutable,
provenance is immutable/private and locks nothing; the
PROMOTED_BY mirror keys off `rankEntryId` (ADR 0016 repeated-promotion semantics); `@@unique([passportId, rankId])`
= one standard entry per rank; an established-coach proposal never mutates active provenance before approval, and
its immutable expected-prior/proposed-target snapshot survives the fold (ADR 0047 D7).
