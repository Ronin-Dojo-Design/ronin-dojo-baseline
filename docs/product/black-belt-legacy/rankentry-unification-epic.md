---
title: "BBL Epic — Retire RankAward, unify on RankEntry (KISS the rank model)"
slug: rankentry-unification-epic
type: epic-plan
status: proposed
created: 2026-07-10
last_agent: claude-session-0523
pairs_with:
  - docs/product/black-belt-legacy/rank-entry-unified-data-flow.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md
  - docs/learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0523.md
---

# BBL Epic — Retire `RankAward`, unify on `RankEntry`

> **Operator mandate (SESSION_0523):** "KISS the hell out of this — none of it should be this complicated
> and convoluted. RankEntry should be the ONE rank model." Root cause named by the operator: the
> course/curriculum-vs-lineage separation designed for **Baseline** is over-engineering for **BBL**, where
> it's just lineage + belt + verified-or-not. This epic collapses the rank model to a single table.
>
> **Sequencing verdict: the read-collapse lands now (SESSION_0523); the table-drop is a post-FI-001-send
> epic.** Dropping `RankAward` pre-send would rewire the verified-lineage graph (the moat) + belt-gate
> authority for zero launch-visible benefit — display already works via the projection + a join.

## Critical schema ground-truth (governs everything below)

- `RankAwardSource { STATED, EARNED }` (NOT "STATED/IMPORTED/AWARDED").
- `RankAwardVerificationStatus { UNVERIFIED, VERIFIED, DISPUTED, IMPORTED }` — **`IMPORTED` is a
  verification-status value**, load-bearing for belt-gate (imported = authority-owned / member-read-only).
- `RankEntryStatus { PENDING, UNVERIFIED, VERIFIED, DISPUTED }` — **no `IMPORTED`**; `rankEntryStatusForAward`
  (`queries.ts:81`) collapses IMPORTED→VERIFIED, which **discards the provenance belt-gate depends on**.
  ⇒ Retiring RankAward requires preserving IMPORTED provenance on RankEntry (a `provenance`/`source` column,
  **not** adding IMPORTED to the display enum — keeps 4 clean display states; avoids the LR 0008 second-axis trap).

## Display gap (= steps 6-7)

Exactly **one** surface reads RankEntry today: `/app/profile` belt tab (`server/web/belt/belt-tab-loader.ts:104`).
**Every** public / lineage / directory / admin display still reads `passport.rankAwardsEarned` (RankAward-direct)
via `lib/lineage/canvas-model.ts:66` `memberTopRankAward` and `server/web/lineage/payloads.ts`. Closing that
gap IS migration steps 6-7.

## Phasing

### This session (SESSION_0523) — read-collapse only. NO fold, NO belt-gate rewire, NO table drop.

- **Slice A — WL-P2-46:** retire `node.isVerified`/`node.verificationStatus` trust axis → derive from the
  verified `RankEntry.status` through ONE resolver, across canvas/directory/m-card/mobile-list/carousel/galaxy
  (drawer done SESSION_0522). Shown trust = highest non-PENDING RankEntry status (spec line 82). **Reads only**
  — writers + columns stay (LR 0008 coda: don't bundle the schema drop). *(In flight: Cody.)*
- **Slice B — step 6:** display reads re-root on the RankEntry projection (`canvas-model.ts:66`, `payloads.ts`,
  `ancestry.ts:177`, directory/public, top-ranked). **Facts still JOINED from RankAward** (additive; mirrors the
  shipped `belt-tab-loader.ts` pattern). Overlaps Slice A's payload wiring.
- **Slice C — step 7:** delete the dead owner-arm/split-path (`me-profile/*`, `owner-profile.tsx`,
  `loadProfileViewForOwner`) — **after Doug data + browser proofs** (spec line 123).

### Post-send epic — fold, rewire, drop.

- **D — expand (additive, safe anytime):** add fact/provenance cols to RankEntry (`awardedAt`, `source`,
  `provenance`, `awardedById`, `awardedByPassportId`, `notes`, `location`, `organizationId`, `promotionEventId`)
  + backfill from RankAward (1:1 via `rankAwardId`). Add nullable `rankEntryId` to the 4 FK-holders
  (`LineageRelationship`, `RankMilestone`, `MediaAttachment`, `GamificationEvent`) + backfill.
- **E — belt-gate rewire:** `ceilingSortOrder`/`isWithinCeiling`/`isTopAward` port cleanly (rank.sortOrder only);
  `isFactEditable`/`memberFactEditability` need `source` + `awardedById` + the IMPORTED distinction on RankEntry
  (§ critical schema). Without it, imported founder awards become member-editable = authority regression.
- **F — moat/edge FK repoint:** `LineageRelationship.rankAwardId → rankEntryId` (rename + FK swap; preserve the
  `@@unique` PROMOTED_BY mirror = repeated-promotion semantics, ADR 0016). ⚠ `rankAwardId` is `SetNull` today —
  dropping RankAward before this repoint silently orphans the whole PROMOTED_BY graph (the moat-rip).
- **G — writers RankEntry-native:** place-lead/claim-finalize/add-person/router/node-profile-actions/verify
  write RankEntry directly; delete `syncRankEntryFromAward` + `rankEntryStatusForAward` (10 call-sites). ⚠ the
  seed/import/enrich scripts create RankAward *without* the sync seam — audit for orphan awards first.
  ⚠ **Belt backfill-trust writers (SESSION_0540/0541, FINDING_06 → ADR 0047 D6):** `decideBackfillTrust` /
  `applyBackfillTrustDecision` / `writeBackfillStatus` (`server/belt/belt-gate.ts` + `router.ts`) write
  `RankAward.verificationStatus` and re-read the promoter FK off `RankAward` — net-new RankAward-keyed decision
  logic added mid-migration. Relocate the trust decision + status write onto `RankEntry.status` when this task
  lands; the `PROMOTER_CHANGED` review side already lives on `RankEntry`, so only the write + the anchor/promoter
  re-read move.
- **H — contract (destructive, LAST):** drop old `rankAwardId` cols + `RankEntry.rankAwardId`; `DROP TABLE RankAward`;
  drop the two RankAward enums if unused.

Migration discipline: hand-authored SQL (never `prisma migrate dev` — shared local DB); additive-first;
`ALTER TYPE ... ADD VALUE` can't be consumed in the same tx; `migrate deploy` auto-applies on prod via prebuild.

## Open decisions

1. **Edge-axis fork (blocks nothing this session — deferred out of Slice A):** does `LineageRelationship.isVerified`
   retire onto RankEntry or stay as edge provenance? **Recommendation: keep as edge provenance** — it's the
   `ancestry.ts` "prefer the confirmed parent" structural tiebreak that RankEntry can't express (RankEntry knows
   a member's rank, not which of N instructor edges is canonical) — but **strip its member-facing badges** (the
   drawer instructor-edge "Unverified", lineage-tab) which duplicate the RankEntry axis. Its one surface story =
   zero public badges + a steward-only provenance chip in the editor.
2. **Provenance representation for the fold (ADR decision, post-send):** a dedicated `provenance`/`source` column,
   NOT adding IMPORTED to `RankEntryStatus`. Keeps 4 clean display states; avoids the second-display-axis bug.
3. **Table-drop timing:** after the FI-001 Brian send. (Recommended — moat + belt-gate blast radius, zero launch benefit.)

## ADR skeleton (to write when the epic starts)

New ADR supersedes 0016 / 0035 / 0043 and revises `rank-entry-unified-data-flow.md` line 51 ("migration anchor
is the existing RankAward row" → "RankEntry is standalone; RankAward retired"). Decision: RankEntry is the one
durable rank record — member status + promotion fact + provenance. Invariants preserved: display = highest
non-PENDING entry by sortOrder (ADR 0035); provenance locks imported/authority facts read-only (belt-gate); the
PROMOTED_BY mirror keys off `rankEntryId` (ADR 0016 repeated-promotion semantics); `@@unique([passportId, rankId])`
= one standard entry per rank.
