---
title: "SESSION 0729 — Build the canonical rank-read seam (map #374 ticket #376)"
slug: session-0729
type: session--closed
status: closed
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0728
sprint: S13
lane: bbl
recipe: "seq-lane-build"
goal_ids: ["G-011"]
tickets: ["#374", "#376"]
next_session: docs/sprints/SESSION_0730.md
pairs_with:
  - docs/sprints/SESSION_0728.md
  - docs/product/black-belt-legacy/pods-schema-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0729 — Canonical rank-read seam (#376)

> **Staged by SESSION_0728.** #375 (provenance shape) is **RATIFIED + closed**, which unblocks this
> Wave-2 lane. Adopt: flip `status:` → `in-progress`.

## Goal

Build the ONE canonical rank-read seam on `RankEntry` (a `memberRanks` / `memberTopRank` module),
exposing `provenance` alongside `status`, and repoint the ~29 `RankAward` readers to it. Ticket
[#376](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/376).

## Resolved upstream (do not re-open)

- **Provenance shape RATIFIED** — `RankEntryProvenance { IMPORTED, EARNED }` (SESSION_0728, #375).
  Immutable origin; belt-gate's `verificationStatus==="IMPORTED"` reads become `provenance==="IMPORTED"`
  at THIS seam. `rankEntryStatusForAward`'s IMPORTED→VERIFIED collapse STAYS (status = presentation trust).
- One canonical rank-read seam (operator, 0723). `RankAward` stays the **write anchor** until the
  table-drop (#380 / G-011); the CI guard (#377) targets READS only and lands **after** this.
- Canonical-tree backfill DONE (95/95). The provenance migration is #375-derived (additive,
  hand-authored, shadow-replayed) — **not applied yet**; sequence it into this lane, commit the file
  only, no prod apply.

## Baton (paste-ready)

```
/bow-in — Build lane (seq-lane-build), worktree. Adopt SESSION_0729 (flip status → in-progress).
Repo: black-belt-legacy (ONE repo, ADR 0059). Ticket #376: build the canonical rank-read seam.

FIRST: open map #374, ticket #376, spec #372 Implementation Decisions, and #375's resolution comment
(the ratified RankEntryProvenance shape). Code ground truth: server/belt/queries.ts,
server/belt/belt-gate.ts, rank-entry-compatibility.ts, prisma/schema.prisma (RankEntry). Then /gq for
the ~29 RankAward readers to repoint. FS-0048 read-before-build; verify by reading, not names.

BUILD: (1) add the RankEntryProvenance enum + RankEntry.provenance column (hand-authored ADDITIVE
migration, shadow-replayed; migrate dev BANNED on shared DB; NO prod apply — commit the file only)
and set provenance in syncRankEntryFromAward (IMPORTED if verificationStatus==IMPORTED else EARNED).
(2) Build the ONE memberRanks/memberTopRank seam on RankEntry exposing {rankId, status, provenance,…}.
(3) Repoint the ~29 readers to the seam; belt-gate IMPORTED reads → provenance==IMPORTED. (4) Full
local gates green (typecheck / oxlint / oxfmt / tests / next build) + affected e2e for belt/rank.

HOLD: prod migration apply is AFK-NEVER; PR-only main; HOLD every push for the operator's word. One
PR, worktree, full gates. The CI guard (#377) is a SEPARATE follow-on — not this session.
```

## Bow-in

Adopted the staged SESSION_0729 baton (seq-lane-build, ticket #376). Elected 0729 via the
`next_session` pointer on the closed SESSION_0728 (not by highest-number — FS-0050). Canonical claim
was free; worked in worktree `wt-0729-rank-seam` (`auto/session-0729-rank-read-seam`) anyway per the
baton + worktree-isolation law. No lane collision (only open PR is #361, unrelated).

**Prior goal (0728):** ✅ accomplished — provenance shape ratified (`RankEntryProvenance {IMPORTED,
EARNED}`), merged as #396; that unblocked this Wave-2 lane.

**FS-0048 read-before-build sweep** (read the ground truth, not names):
- `server/belt/queries.ts` (getMemberAwards/toBeltCard/`rankEntryStatusForAward` IMPORTED→VERIFIED
  collapse) · `belt-gate.ts` (the two `verificationStatus==="IMPORTED"` reads) ·
  `rank-entry-compatibility.ts` (`syncRankEntryFromAward`) · `prisma/schema.prisma` (RankEntry model
  + the four rank enums).
- Ratified shape from #375's resolution + map #374 Decisions-so-far; ticket #376 done-condition; spec
  #372 Implementation/Testing decisions (one seam, test-at-seam-once, CI guard = separate #377).
- Reader footprint: `rankAwardsEarned` is read across ~20 files (directory/lineage/passport/claims/
  onboarding/admin/app); `related-profiles.ts` already reads `rankEntries` (SESSION_0725 precedent).

**Coverage gate (found + cleared):** switching rank reads `RankAward → RankEntry` would DROP any
award lacking a synced entry. Local prodsnap showed 1 orphan of 15 — but that is stale-snapshot
staleness (#381). Map #374 records the authoritative prod verification (2026-07-30): 111 entries,
95/95 canonical passports, **0 award-only orphans**. Operator picked Option 2 (verify → repoint). The
fresh read-only prod count was **blocked by a stale `apps/web/.env.prod` Neon credential**
(`P1000 / 28P01 password authentication failed for user 'neondb_owner'`; host correct) — rotated in
RDD, not yet in BBL. Gate cleared by the recorded finding; credential tracked as a spawned chip.

## Goal verdict

**EXTENDED.** The build goal — the canonical `RankEntry` rank-read seam (#376) — is **BUILT + verified
LAUNCH-SAFE** (Doug 9.2/10, no P1). It is **NOT merged**: heavy reviews + the live-prod orphan
re-check + the operator push are deferred to the continuation session (0730). The lane spans; the
session closes.

## What landed (worktree `wt-0729-rank-seam` · branch `auto/session-0729-rank-read-seam` · NOT pushed)

- **Provenance** (#375 ratified): `RankEntryProvenance {IMPORTED, EARNED}` enum + `RankEntry.provenance`
  column + hand-authored **additive** migration `20260730000000_add_rank_entry_provenance`
  (backfill maps `verificationStatus='IMPORTED' → IMPORTED` else `EARNED`). Applied to the **local**
  prodsnap only (`migrate deploy`) — **NO prod apply**; the file must be committed for prebuild to
  apply it on merge.
- **The seam** `server/belt/member-ranks.ts` — `memberRanks` / `memberTopRank` / `projectRankEntry` /
  `rankEntryViewSelect`, exposing `{status, provenance}`; tiebreak on `rankAward.awardedAt` (parity).
- **Write-path** `syncRankEntryFromAward` sets provenance.
- **Repoint** of every rank-STATE reader to `RankEntry` (keystone public projection + rail +
  directory/lineage/admin/tournaments/claims/onboarding/`rank-group-queries` + the shared
  `trust-status`/`canvas-model` derivations). **belt-gate provenance wiring**: `isFactEditable` reads
  `provenance === "IMPORTED"`. Ceremony/authority/write reads correctly LEFT on `RankAward` (anchor).
- **Gates GREEN** (reproduced by Doug): tsc 0 · oxlint 0 · oxfmt clean · `next build` PASS ·
  `bun run test` **1953 pass / 0 fail**.

## Verification (Doug — independent, adversarial)

**LAUNCH-SAFE, 9.2/10, no P1.** Trust-resolver no-flip, belt-gate identical, ordering parity, no
crash, kept read justified, migration safe. Findings:
- **P2 (follow-up, not a #376 blocker):** the **0-orphan invariant is load-bearing + unguarded** —
  reading `rankEntries` silently drops any award without a synced entry, and `@@unique([passportId,
  rankId])` means a 2nd award at an already-entried rank can never sync (permanent orphan, no alert).
  Needs a runtime guard → route to the #380 cutover lane.
- **MERGE GATE:** re-run the orphan count against **live prod** immediately before the #376 merge —
  the single check gating the LAUNCH-SAFE verdict. Blocked now by the dead `.env.prod` credential.
- **P3 (logged, no action):** admin-list secondary tiebreak now `RankEntry.createdAt` (cosmetic, exact
  date-tie only) · acceptance-grep wording nit (the 2 `rankAwardsEarned` hits are the justified
  rank-reviews keep).

## Review log

`/ggr` + fallow + hostile + code-quality **DEFERRED to SESSION_0730** per operator (the reviews run on
the finalized diff there, orchestrated by Fable → Codex). Doug's 9.2 is the standing verification score.

## Findings router

- **Drift** — #380 + map #374 say "post-FI-001-send" for the RankAward correctness arc; operator
  (this session) ratified the reverse: correctness is **BEFORE** the FI-001 send. Flip both. Memory:
  [[fi001-send-gated-on-correct-site]].
- **Environment** — `.env.prod` Neon credential dead (`28P01`); blocks prod reads + prodsnap refresh
  (#381). Spawned chip. Rotated in RDD, not yet BBL.
- **Test fragility** — the `tag(x).slice(0,16)` truncation trap (spec #372's documented
  `Discipline.code` collision) bit `node-profile-actions.test.ts` via leftover cruft; nulled the stale
  row. Pre-existing; local-prodsnap hygiene (a refresh clears it).

## Next session

→ [SESSION_0730](SESSION_0730.md) — Fable-orchestrated review + simplify of the #376 seam (hand off
fully to Codex), the greenfield-`RankEntry` question, and staging the Baseline-cut de-scope lane.
