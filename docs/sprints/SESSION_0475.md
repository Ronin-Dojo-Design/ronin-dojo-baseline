---
title: "SESSION 0475 — Lineage rank-display refinement: discipline-scoped rank + selectedRank removal + one-SSR-avatar"
slug: session-0475
type: session--implement
status: in-progress
created: 2026-06-30
updated: 2026-06-30
last_agent: claude-session-0474
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0474.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0475 — Lineage rank-display refinement: discipline-scoped rank + selectedRank removal + one-SSR-avatar

> **PRE-STAGED at SESSION_0474 close** (claude-session-0474, with fresh context). This is the **follow-on to
> SESSION_0474's `Next session` block** — three coupled lineage-display polish items the operator ratified during
> 0474, all the same theme: **one source, rendered identically everywhere.** Self-contained and dispatchable now;
> no open forks (every decision below is operator-ratified). The full footprint is already mapped — go straight to
> execution.

## Date

2026-06-30 (pre-staged; executes next)

## Operator

Brian + claude-session-0475

## Goal

Finish the lineage rank-display model 0474 reverted onto ADR 0035: **(1)** remove the YAGNI/display-dead
`selectedRank`/`LineageTreeMember.rankAwardId` (schema migration + repoint the few live non-display readers to
awarded-truth + delete the admin dropdown & dead plumbing); **(2)** make the shown rank **discipline-scoped** —
BBL tree/board/cards show the **BJJ** rank (the tree's own discipline), not "highest awarded by `sortOrder`"
(meaningless across rank systems — ADR 0035 known limitation), while the drawer + directory keep multi-discipline;
**(3)** consolidate the avatar to **one SSR-image primitive** (kill the `CardAvatar` vs Radix-`Avatar` divergence —
WWAD). Optionally **(4)** apply the remaining lineage doc-staleness corrections from the 0474 survey.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0474.md` — read its `Next session` block + the **shipped model**
  banner (one `resolveLineageMemberView` resolver; belt = highest **awarded** rank by `Rank.sortOrder` via
  `memberTopRank`; verification = single `node.isVerified`; `RankAward.verificationStatus` vestigial).
- **Read FIRST (the staged plan):** the [[lineage-rank-display-and-selectedrank-removal]] memory (the full
  ~38-file footprint + the discipline-scoped rule + the avatar item, all mapped) · [ADR 0035](../architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md)
  (the canon; note its §3 "known limitation" = the cross-system sortOrder problem this session fixes) ·
  [`human-code-runbook` §8](../runbooks/porting/human-code-runbook.md) (the one-resolver read-model walkthrough) ·
  [`learning-record-0008`](../learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md).
- Carryover: 0474 shipped the display unification to prod (green) and reverted a wrong per-award verification axis.
  This session finishes the lane it teed up. 0473 (parallel S1 tier groundwork) also landed — independent.

### Branch and worktree

- Branch: `main` (clean) — or a `session-0475-rank-cleanup` worktree if parallelizing (run `/worktree-setup` first
  if fresh: it has no node_modules/.env/prisma-client; see [[fresh-worktree-bootstrap-not-in-readpath]]).
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean ✅ (verify at pickup)
- Current HEAD at bow-in: `c236316a`

## Petey plan

### Goal

Remove `selectedRank`, make the shown rank discipline-scoped (BBL = BJJ), and unify the avatar onto one SSR-image
primitive — proven on the live DOM + a Prisma migration, gates green, no behavior regression on the verified roster.

> **⚠️ KEY INVARIANT (read before TASK_01/02).** The FINAL shown-rank rule is **discipline-scoped** (BBL tree/board/
> cards = the **BJJ** rank), NOT global "highest awarded by `sortOrder`". `memberTopRank` is the **one resolver** that
> answers "what belt" — TASK_02 makes it **discipline-aware**. So **every reader must route through `memberTopRank`
> (the resolver), NEVER a raw `rankAwardsEarned[0]`** — a raw `[0]` bypasses the discipline-scoping and silently
> re-creates the "highest-awarded-across-systems" bug ADR 0035 §3 flagged. One source, read everywhere (LR 0008).

### Tasks

#### SESSION_0475_TASK_01 — Remove `selectedRank` / `selectedRankAward` (YAGNI; display-dead)

- **Agent:** Cody (cody-preflight first)
- **What:** Drop the deprecated `LineageTreeMember.rankAwardId` override end-to-end (~38 files + a migration). It is
  already display-dead (ADR 0035 + 0474 removed its last display readers); only the admin "Selected rank" dropdown
  still writes it, with zero readers.
- **Steps (order matters — repoint live readers BEFORE deleting the field, or typecheck cascades):**
  1. **Repoint the live non-display readers off `selectedRankAward` — THROUGH the resolver, not a raw `[0]`** (see
     the KEY INVARIANT above): `to-lineage-visual.ts` timeline `promotionDate`; `bbl-galaxy-from-lineage.ts` date;
     `students-carousel.tsx` rank; `use-drawer-profile.ts` `deriveDrawerProfileView` panel-rank; the public
     `lineage-node-profile-form.tsx` promotion-date read/gate. **Rank readers** call `memberTopRank(node, …)` (the
     resolver TASK_02 makes discipline-aware, so they inherit the BJJ-scoping). **Date readers** take the `awardedAt`
     of the award `memberTopRank` selects — NOT a hardcoded `rankAwardsEarned[0]` (the profile payload still joins all
     awards; this matters once a member is multi-discipline). If a clean shared accessor doesn't exist, add a tiny
     `memberTopRankAward(node, disciplineId?)` helper next to `memberTopRank` so both the rank + the date come from
     one discipline-scoped source.
  2. **Delete the write-path:** `app/app/lineage/_components/lineage-selected-rank-select.tsx`,
     `updateLineageTreeMemberSelectedRank` action + its schema (`server/admin/lineage/{actions,schema}.ts`), the
     `[treeId]/page.tsx` render; remove the `rankAwardId` param from `create-lineage-member.ts` + its callers.
  3. **Delete the dead plumbing:** `selectedRankAward` from `lineageTreeMemberPayload` (payloads.ts) +
     `node-profile-queries.ts` + the `queries.ts` redaction branch; the `SelectedRank` type +
     `CanvasMember.selectedRank` (canvas-model) + the deprecated `_selectedRank` params on
     `memberBeltColor`/`memberRankLabel` + the `LineageNodeCard` prop + board-card/branch/tree-board passes +
     `drawer-types.ts` `SelectedRankAward`.
  4. **Schema migration:** drop `LineageTreeMember.rankAwardId` + the `selectedRankAward` relation + `@@index([rankAwardId])`
     **and** the `RankAward` back-relation. Hand-author the migration; `prisma validate` + `migrate diff` empty.
  5. **Tests:** update the ~15 referencing tests; the `public-rank-redaction` e2e fixture's awarded-vs-selectedRank
     guard simplifies to "highest awarded shows" (the member just holds two awards — no override needed).
- **Done means:** `selectedRank`/`selectedRankAward`/`rankAwardId` gone from the lineage code + schema; migration
  applies; full `bun run test` green; `next build` green; live tree unchanged (verified roster is single-award).
- **Depends on:** nothing.

#### SESSION_0475_TASK_02 — Discipline-scoped shown rank (BBL = BJJ)

- **Agent:** Cody
- **What:** Make `memberTopRank` **discipline-aware** so a discipline-scoped surface (the lineage tree/board/cards,
  which carry the tree's `disciplineId`/`scopeType=DISCIPLINE`) shows **that discipline's** highest rank — not the
  global highest-by-`sortOrder` (meaningless across rank systems; ADR 0035 §3 known limitation). The drawer +
  directory profile keep showing the member's **other** discipline ranks (the real "show other ranks" feature).
- **Steps:** add an optional `disciplineId` (or rank-system) filter to `memberTopRank`/`resolveLineageMemberView`;
  the tree surfaces pass the tree's discipline; default (no discipline) stays "highest awarded" for the drawer/directory.
  Unit-test the multi-discipline case (a BJJ + TKD holder shows BJJ on the tree, both in the drawer).
- **Done means:** a multi-discipline member shows the **BJJ** rank on the tree/cards and all disciplines in the
  drawer/directory; the single-discipline live roster is unchanged (today it already resolves to BJJ).
- **Depends on:** SESSION_0475_TASK_01 (same resolver/files — sequential).

#### SESSION_0475_TASK_03 — One SSR-image avatar primitive (WWAD)

- **Agent:** Cody / Desi (review)
- **What:** Collapse the two avatar components onto one. Today the timeline's `CardAvatar` server-renders the
  `<img>` while the design-system `Avatar` (Radix, used by cards/board/mobile) defers it to client-load (no image
  in the initial HTML → an initials-then-pop). Apple/FB/YouTube SSR the avatar image with a skeleton/initials
  fallback shown **only** on missing/errored image.
- **Steps:** make `components/common/avatar.tsx` render the `<img src>` server-side (graceful fallback on error/no-src);
  repoint every surface to it; remove the `CardAvatar` divergence (or fold it in). Verify on the live DOM that the
  avatar image is in the **initial** HTML on the board/cards (no initials-flash) and the timeline is unchanged.
- **Done means:** one avatar primitive; the image is in the SSR HTML on every surface; no pop/flash; e2e + visual proof.
- **Depends on:** nothing (disjoint from the rank lane — parallelizable).

#### SESSION_0475_TASK_04 — Lineage doc consolidation (apply the 0474 survey remainder)

- **Agent:** Cody (docs)
- **What:** Apply the remaining doc-staleness corrections the 0474 survey ranked (the high-value 4 were done at 0474
  close): `lineage-listing-runbook.md` §trust-badges (binary collapse + ADR 0036 `PassportClaimRequest`);
  `lineage-rank-promotion-sync-rules.md` (lines ~83/97-104 — `selectedRankAward` controls display + `isVerified`
  derived-from-verificationStatus, both inverted now); `directory-page.md` trust badges; `lineage-tree-runbook.md`
  §1 belt-source note; **archive** `architecture/lineage/SESSION_0263_audit_report.md` + `SESSION_0263_bbl_recon.md`
  (lineage-hub already flags them — ref-sweep MUST include `_archive/`).
- **Done means:** the listed docs reflect the shipped model; `bun run wiki:lint` 0 errors.
- **Depends on:** nothing (disjoint — parallelizable; docs-only, free push).

### Parallelism

- **TASK_01 → TASK_02 are SEQUENTIAL** (both rewrite `memberTopRank`/`canvas-model`/the surfaces — same files).
  Do 01 first (clears the deprecated field), then 02 (discipline-scope the clean resolver).
- **TASK_03 (avatar) + TASK_04 (docs) are DISJOINT** from the rank lane → run in parallel (sub-agents on disjoint
  files, or just interleave). TASK_04 is docs-only (free push, no deploy).

### Open decisions

- **None — all ratified at 0474.** The discipline-scoped rule (BBL=BJJ; drawer/directory multi-discipline), the
  `selectedRank` removal, and the one-SSR-avatar consolidation are operator-decided. One impl detail for the session
  to choose (not a fork): how a surface names its discipline to `memberTopRank` — the tree's `disciplineId` is the
  natural source.

### Risks

- **The migration must lead with the repoint.** Delete the field's readers (step 1) before dropping the column, or
  typecheck cascades across the whole lineage tree. Hand-author the migration (String→drop column + relation + index).
- **App-code push = CI matrix + BBL prod deploy.** Run `cd apps/web && bun run build` + the **full** `bun run test`
  (not just touched files — 0474's CI red was a full-suite-only failure) before proposing the push.
- **Avatar is shared-design-system blast radius** — `Avatar` is used everywhere, not just lineage. Verify a sample of
  non-lineage avatar surfaces (directory, nav, profile) after the change. **Preserve the placeholder fallback chain:**
  the SSR `<img>` src stays `passport.avatarUrl ?? passport.user?.image ?? <initials>` (accountless placeholders have
  `user == null`) — the resolver already does this; don't regress it when moving the `<img>` server-side.
- **Claim/attach is orthogonal to `selectedRank` — don't conflate them.** The claim flow (`claim-finalize.ts` →
  `attachAccount` sets `Passport.userId`; `mintAssertedRankAward` mints from `PassportClaimRequest.claimedRank`) does
  NOT touch `LineageTreeMember.rankAwardId`, so removing `selectedRank` can't break claiming. The
  `create-lineage-member` `rankAwardId` param is consumed by `billing/actions.ts` + `admin/users/actions.ts` (NOT the
  claim path) — smoke **those two callers** + a claim/attach round-trip after the removal, and confirm the
  claim-minted `RankAward` still flows into the discipline-scoped `memberTopRank` (a freshly-claimed member's belt
  renders on the tree).

### Scope guard

- Don't touch tiers/Stripe (that's SESSION_0473's lane — code landed, live Stripe is the operator's open action).
- Don't reintroduce a per-award verification display axis (ADR 0035 §5; LR 0008 — that was 0474's reverted mistake).
- Don't bundle the avatar refactor's blast radius into the migration commit — keep them reviewable.

## Cody pre-flight

<!-- Run before TASK_01. Footprint already mapped at 0474 (the memory). Prior art: SESSION_0430 (ADR 0035 rank
read-model) + SESSION_0474 (the resolver + the surfaces). cody-preflight.md before writing code. -->

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0475_TASK_01 | pending | Remove `selectedRank`/`selectedRankAward` (schema migration + repoint live readers + delete dropdown/plumbing) |
| SESSION_0475_TASK_02 | pending | Discipline-scoped `memberTopRank` (BBL tree/cards = BJJ; drawer/directory multi-discipline) |
| SESSION_0475_TASK_03 | pending | One SSR-image avatar primitive (kill the `CardAvatar` divergence) |
| SESSION_0475_TASK_04 | pending | Apply the remaining 0474 lineage doc-staleness corrections + archive SESSION_0263_* |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

- None at plan-lock. Self-contained; no operator input required to start (the model is ratified; browser-proof on `bbl.local`).

## Next session

### Goal

TBD at bow-out (likely: the lineage Instructor Hub epic — SESSION_0472 build plan S6+ — or whatever the operator pins).

### First task

TBD at bow-out.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence
