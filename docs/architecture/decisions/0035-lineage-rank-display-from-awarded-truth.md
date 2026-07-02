---
title: "ADR 0035 — Lineage rank display from awarded truth; selectedRankAward → pending claim"
slug: adr-0035-lineage-rank-display-from-awarded-truth
type: adr
status: accepted
created: 2026-06-22
updated: 2026-07-01
last_agent: claude-session-0491
pairs_with:
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
  - docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md
  - docs/sprints/SESSION_0430.md
  - docs/sprints/SESSION_0486.md
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md
  - docs/knowledge/wiki/drift-register.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0479.md
---

# ADR 0035 — Lineage rank display from awarded truth; `selectedRankAward` → pending claim

## Status

Accepted (SESSION_0430). Extends [ADR 0025](0025-passport-identity-source-of-truth.md) (Passport is the
identity source of truth) into the rank-display axis.

## Context

The lineage profile drawer showed David Meyer as "Black Belt – 5th Degree / Unknown date /
lineage-unverified" with a "Verified" badge, while his bio (correctly) read "7th Degree Coral Belt,
promoted by Rigan Machado, Jan 17 2026." A wiring deep-dive (SESSION_0430) found **three independent
defects**, not one:

1. **Ordering bug.** "Current rank" was `rankAwardsEarned[0]` ordered by `awardedAt desc`. Postgres
   sorts `NULL` **first** in `DESC`, and `RankAward.awardedAt` is nullable, so a null-dated lower belt
   floated to `[0]`. This under-ranked **7 of 10** multi-award founders (Bob Bass, Meyer, Haueter,
   Renato Magno, Bill Hosken, Casey Olsen, Rick Williams).
2. **A second display axis.** `LineageTreeMember.selectedRankAward` (an editorial FK) **overrode**
   `[0]` for the canvas node, focus card, and drawer header (`canvas-model.ts`: `selectedRank ?? [0]`).
   12 tree members had it pointing below their highest belt — stale importer data, no claim behind it.
3. **Corrupt `Rank.sortOrder`.** The base "Black Belt" (no degree) rank was orphaned at `sortOrder`
   31 — above Red 10th Degree (30) — so even a sortOrder-based pick mis-ranked anyone holding it.

The bio (`LineageNode.bio`) is free-text WP-import narrative, structurally disconnected from the
structured `RankAward`. The "Verified" badge is `LineageNode.isVerified` (admin/RBAC) and is correct
as-is for all current members.

## Decision

1. **Structured `RankAward` is canonical for rank/date/promoter; `LineageNode.bio` is narrative
   only** (never a rank source; no prose parsing).
2. **Displayed "current rank" = the member's highest *awarded* belt by `Rank.sortOrder`** (with
   `awardedAt desc` as tiebreak), not the most-recent by date. Fixed at the read model:
   `rankAwardsEarned` now orders `[{ rank: { sortOrder: desc } }, { awardedAt: desc }]` (matching the
   pre-existing `top-ranked-queries.ts` precedent), and `canvas-model.ts` reads `[0]` directly.
3. **`LineageTreeMember.selectedRankAward` stops driving display.** It is repurposed as a **pending
   claim**: the rank a new/claiming user asserts at registration/claim, shown as pending, promoted to
   an awarded `RankAward` only when an admin verifies. The FK is deprecated-for-display and slated for
   removal once the claim flow lands.
4. **Pending claims live as a `rankId` on the claim/registration record (e.g. `LineagePendingClaim`),
   NOT as a `RankAward`** — so `RankAward` stays pure awarded-truth and a claim *cannot structurally
   leak* onto the tree as if awarded (the exact failure mode of defects 1+2). Admin-verify *creates*
   the `RankAward`.
5. **Verification badge is unchanged** — `LineageNode.isVerified`/`verificationStatus` is the
   admin/RBAC trust signal; all current members are correctly verified; new nodes default unverified.
   `RankAward.verificationStatus` stays vestigial (not gated on for display).
6. **`Rank.sortOrder` corrected** for base "Black Belt" to sit just below "Black Belt – 1st Degree"
   (band renumber; base "Black Belt" kept as a distinct BJJ rank).

## Known limitation

"Highest by `sortOrder`" compares across rank systems, which is meaningless for multi-system holders
(`sortOrder` is per-system). The current roster has **0** cross-system practitioners, so this is
inert today; Andre Lima (BJJ Black 3rd + TKD 8th Dan) is the one near-case and displays his BJJ rank.
A discipline/system-aware "current rank per system" is the future fix when multi-system display
matters — deliberately deferred (YAGNI).

## Consequences

- Display now reflects awarded truth everywhere (drawer, canvas, focus card, directory, public
  passport). The 7 under-ranked founders render correctly; Meyer shows Coral 7th · Rigan Machado · Jan 17 2026.
- [ADR 0043](0043-rank-award-fact-vs-member-milestone.md) preserves this display rule: Belt Journey stories and
  media live in `RankMilestone`, while rank display continues to derive from `RankAward`.
- The claim→award lifecycle (registration rank picker → pending claim → admin-verify → `RankAward`)
  is a forward build lane (POST_LAUNCH_SOT `FI-006`), not built in SESSION_0430.
- A one-time data-correction script (`apps/web/scripts/data/SESSION_0430-bbl-rank-corrections.sql`)
  fixed the sortOrder ladder + specific award errors on prodsnap; **pending re-run on prod Neon.**

## Alternatives rejected

- **Keep `selectedRankAward` as the display override + repoint the 12 stale rows.** Rejected: keeps
  display divorced from awarded truth and preserves the leak failure mode.
- **Pending claim as a `RankAward` with a "claimed" status, display-gated.** Rejected: re-creates the
  "remember to filter or it leaks" bug class; with 0 `VERIFIED` rows today it would also blank everyone.

## Ubiquitous language

- **Awarded rank** — a structured `RankAward` (a fact). The display source of truth.
- **Pending claim** — a rank a user asserts at registration/claim, not yet an award. Lives on the
  claim record; promoted to an awarded `RankAward` on admin-verify.

---

## Amendment 1 — Belt promotions extend the claim record; the display axis stays closed (ACCEPTED — SESSION_0492)

> **Status of this amendment:** *accepted* (SESSION_0492). Designed + grill-ratified at **SESSION_0486**
> (parent SESSION_0484); its finalize condition — the belt-verification block (petey-plan-0477 Slices
> V1–V6) landed and its **Slice V6 proof gate is green** (SESSION_0492 — Doug proved all five invariants,
> including the SESSION_0491 self-approval CRITICAL closed at two layers) — is now met. The accepted core
> (§§1–6 above) is **unchanged** — this amendment *extends* §4 and *reaffirms* §5; it reverses nothing.

### Context for the amendment

The belt-journey epic (petey-plan-0477) gives members a self-service belt surface. Its first cut
(PRs #178–#181, held at SESSION_0484) modelled a self-declared belt as an **`UNVERIFIED` `RankAward`
minted on self-declare**, and the belt UI read `node.isVerified` for its trust indicator — so a
self-asserted belt rendered as **VERIFIED**, with no approval path. The SESSION_0484 hold note proposed
reintroducing a **per-belt `verificationStatus` display axis** (call it **B2**) to distinguish those
unverified belts.

**B2 was rejected in the SESSION_0486 grill.** It re-opens exactly what §5 above and the SESSION_0474
grill closed: a per-award `verificationStatus` render axis already produced the founder double-badge bug
(a `node.isVerified=true` founder showing **Verified** *and* **Unverified** at once), documented in
[LR 0008](../../learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md).
Adding that axis a second time — one session after it was reverted — is the precise "re-introduce drift
by adding a second of a thing the canon already collapsed" failure that record warns against.

### Amendment decision (B1 — claim-record model)

1. **Extends §4.** The claim→award lifecycle of §4 now covers **existing-member promotions**, not only
   new-claimant identity claims. `PassportClaimRequest` gains a `type` discriminator
   **`{ IDENTITY, RANK_PROMOTION }`** (ADR 0036 is the record it extends). A self-declared belt awaiting
   verification lives on a **`RANK_PROMOTION`** claim (`claimedRankId` + `PassportClaimEvidence`), **never**
   as a `RankAward`. Approve → the existing `mintAssertedRankAward` creates a **`VERIFIED`** award — the
   same claim→award machinery §4 already mandated. `finalizePassportClaim` branches on `type`: a promotion
   on an already-owned passport runs **only** the rank-mint branch (no account-attach/comp).

2. **Reaffirms §5 — `RankAward.verificationStatus` is NOT a display axis.** Because a pending belt is a
   claim record and **no path produces an `UNVERIFIED` `RankAward`** for the belt-journey feature, every
   displayed award is trusted (`VERIFIED` | `IMPORTED`). There is nothing to leak and nothing to badge as
   "pending," so **no per-belt display axis is introduced** and the `node.isVerified` person-level badge
   stays the single trust signal, decoupled from any belt. A self-declared belt *cannot* render as verified
   because it does not exist as an award until approved. This makes the double-badge bug **structurally
   impossible**, not merely guarded — the KISS/DRY payoff LR 0008 argues for.

3. **The one self-service award path is hard-gated (C-implied).** Enriching a belt **at/below the member's
   verified ceiling** that has no award row yet self-service-mints a **`VERIFIED`-by-implication** award
   (`source: STATED`), **gated `rank.sortOrder ≤ ceiling`** (a belt below a verified higher belt is implied
   true; dates/promoters are self-reported enrichment). A belt **above** the ceiling cannot be minted this
   way — it routes to a `RANK_PROMOTION` claim. `setPassportRank`'s pre-existing **ungated** create path is
   removed/hard-gated to this backfill. **The ceiling rises only through an approved promotion claim**, so
   self-promotion stays structurally impossible — the same guarantee §4 gives for identity claims.

4. **Verification is one person+rank event.** Approving a **first** promotion for an unverified
   self-registrant flips `node.isVerified`, mints the award, and places them under their declared instructor
   (the SESSION_0474 on-ramp). An already-verified member's promotion mints only the new `VERIFIED` award.
   Approver = the existing resource-scoped **`claim.review`** grant (RBAC-instructor, node/tree-scoped) or
   global `claims.manage` — **no new permission**. Certificate/instructor photos are a **soft-gate** on the
   request (encouraged, not required); on approve they materialize as `RankMilestone` media.

### Amendment consequences

- The held belt PRs (#178–#181) are reworked to B1 before merge (petey-plan-0477 Slice V4): no code path
  produces an `UNVERIFIED` `RankAward`; the above-ceiling belt card becomes a "request promotion" CTA.
- ADR 0035's known limitation (cross-system `sortOrder`) is unaffected. The awarded-truth display (§§1–3)
  is unchanged — Slice V6 must prove zero regression to 0474/0475.
- `UNVERIFIED` and `DISPUTED` remain valid `RankAwardVerificationStatus` values (admin flagging / future
  import states) but are **not produced by, nor read for display by,** the belt-journey feature.

### Alternatives rejected (amendment)

- **B2 — per-belt `verificationStatus` display axis + `UNVERIFIED` awards on self-declare.** Rejected: it
  re-introduces the second display source §5 marked vestigial and LR 0008 caught as the double-badge bug;
  its safety would rest on the axis being airtight across every surface (the partial-migration nest LR 0008
  §3 warns about) rather than on the awarded-truth invariant being unbreakable.
- **A sibling `RankPromotionRequest` model.** Rejected in favor of extending `PassportClaimRequest` (A1) —
  the promotion reuses `claimedRank → mintAssertedRankAward` verbatim and one queue/finalize; a second table
  duplicates the claim machinery for no invariant gain (the identity-claim `userId==null` guard is simply
  branch-skipped for promotions).

### Ubiquitous language (amendment)

- **Rank promotion (belt-promotion claim)** — a `PassportClaimRequest` of `type: RANK_PROMOTION`: an
  already-owned member asserting a belt **above** their verified ceiling, with optional photo evidence.
  Approve mints a `VERIFIED` `RankAward`; the pending belt is never an award.
- **Backfill (implied) award** — a `VERIFIED`-by-implication `RankAward` a member self-adds for a belt
  **at/below** their verified ceiling, so it can carry a `RankMilestone`. Rank implied by a higher verified
  rank; dates/promoters self-reported.
