---
title: "ADR 0035 — Lineage rank display from awarded truth; selectedRankAward → pending claim"
slug: adr-0035-lineage-rank-display-from-awarded-truth
type: adr
status: accepted
created: 2026-06-22
updated: 2026-06-22
last_agent: claude-session-0430
pairs_with:
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/sprints/SESSION_0430.md
  - docs/knowledge/wiki/drift-register.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
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
