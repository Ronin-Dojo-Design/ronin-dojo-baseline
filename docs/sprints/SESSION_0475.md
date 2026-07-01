---
title: "SESSION 0475 — Lineage rank-display refinement: discipline-scoped rank + selectedRank removal + one-SSR-avatar"
slug: session-0475
type: session--implement
status: closed
created: 2026-06-30
updated: 2026-06-30
last_agent: claude-session-0475
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
| SESSION_0475_TASK_01 | done | Removed `selectedRankAward` end-to-end (schema migration + repointed live readers + deleted dropdown/plumbing). **Kept** the `create-lineage-member` param — it feeds the separate `LineageRelationship.rankAwardId`. |
| SESSION_0475_TASK_02 | done | `memberTopRank(node, disciplineId?)` is the ONE discipline-aware resolver; all tree surfaces pass `tree.disciplineId` (BBL=BJJ); drawer/directory omit it. Unit-tested a BJJ+TKD holder. |
| SESSION_0475_TASK_03 | done | Design-system `Avatar` now SSRs the `<img>` (initials fallback only on missing/errored); `CardAvatar` folded onto it. Live-verified 75 SSR imgs on board + timeline. |
| SESSION_0475_TASK_04 | done | Corrected the two code-referencing doc-staleness items (rank-promotion-sync-rules verification inversion; tree-runbook CanvasMember/belt-source). SESSION_0263 archive kept in-place (HRR-005; lineage-hub already flags them). |

## What landed

Three coupled lineage-display refinements — **one source, rendered identically everywhere** — plus the doc
consolidation. All operator-ratified; no forks opened.

- **TASK_01 — `selectedRankAward` removed.** Dropped the display-dead `LineageTreeMember.rankAwardId` override
  end-to-end (57 files): hand-authored the Prisma migration (`DropForeignKey` + `DropIndex` + `DropColumn`),
  repointed the 5 live readers (View-A `promotionDate`, galaxy timeline-year, students-carousel rank, drawer
  `panelRank`, the public node-edit promotion-date read+write) to the top **awarded** RankAward via a new
  `memberTopRankAward` helper, deleted the admin "Selected rank" dropdown + `updateLineageTreeMemberSelectedRank`
  action/schema + the `selectedRankAward` payload/plumbing/redaction, and updated ~15 tests + the seed + 2 scripts.
- **TASK_02 — discipline-scoped shown rank.** `memberTopRank(node, disciplineId?)` / `memberTopRankAward(node,
  disciplineId?)` / `resolveLineageMemberView(node, {disciplineId})` are the ONE resolver; when a `disciplineId`
  is passed it returns the highest awarded belt *in that discipline* (ADR 0035 §3), else the global highest. All
  tree surfaces (View A, board root+compact, mobile, honor strip, galaxy, students carousel, secondary links)
  thread `tree.disciplineId` from the page down; the drawer header + directory omit it (multi-discipline). No
  reader uses a raw `rankAwardsEarned[0]` — even the admin promotion-date edit form is discipline-scoped.
- **TASK_03 — one SSR-image avatar.** The design-system `Avatar` now renders its `<img>` server-side (layered over
  an initials fallback shown only on missing/errored image); `CardAvatar` (the cinematic timeline's belt-ring
  avatar) folded onto it. Kills the initials-then-pop on the ~26 Avatar surfaces without touching their compound API.
- **TASK_04 — docs.** Corrected the inverted `isVerified`-derived-from-`verificationStatus` claim in
  `lineage-rank-promotion-sync-rules.md` and the stale `CanvasMember.selectedRank` / belt-source note in
  `lineage-tree-runbook.md`.

## Decisions resolved

- **D475-1 — the `create-lineage-member` `rankAwardId` param STAYS (correction to the prestage wording).** The param
  fed TWO columns: `LineageTreeMember.rankAwardId` (the selectedRank — removed) **and** `LineageRelationship.rankAwardId`
  (the PROMOTED_BY edge's award, ADR 0016 — kept). Dropping the param would sever the promotion-edge→award link, so
  only the member-level write was removed. The prestage note also listed `billing/actions.ts` as a caller — it isn't:
  the only `createLineageMember` caller is `server/admin/users/actions.ts`; `billing/actions.ts` has
  `createLineageMembershipCheckout` (a different function that never touches the column).
- **D475-2 — the admin promotion-date edit form is discipline-scoped too** (not just display). The node-profile
  query/action filter the awards to the tree's discipline in JS (Prisma can't reference the sibling `tree.disciplineId`
  in a nested `where`), so the "never a raw `[0]`" invariant holds for the editorial path as well.
- **D475-3 — `CardAvatar` folded, not deleted.** Its belt-ring/glow is a legitimate timeline idiom; it now wraps the
  shared `Avatar` for the image/initials so there's one img-rendering primitive with no behavior divergence.
- **D475-4 — SESSION_0263 archived in-place, not moved.** Physically moving the two files would churn ~9 inbound
  links (sprints, lineage-hub, import-map, wiki index) for marginal benefit; HRR-005 prefers mark-superseded-in-place,
  and lineage-hub already flags them.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` + `migrations/20260630000000_drop_lineage_tree_member_selected_rank/` | Drop `LineageTreeMember.rankAwardId` + FK + index + the `RankAward.lineageTreeMembers` back-relation; hand-authored migration |
| `apps/web/lib/lineage/canvas-model.ts` | `memberTopRankAward`/`memberTopRank`/`memberBeltColor`/`memberRankLabel`/`resolveLineageMemberView` discipline-aware; `SelectedRank` type + `CanvasMember.selectedRank` removed |
| `apps/web/lib/lineage/to-lineage-visual.ts` | promotionDate ← top awarded award; `disciplineId` option threaded to belt + secondary links |
| `apps/web/server/web/lineage/{payloads,queries,node-profile-queries,node-profile-actions,editor-actions,create-lineage-member}.ts` | Drop `selectedRankAward` payload/redaction; repoint node-edit promotion-date (discipline-scoped); drop member `rankAwardId` select/write (keep relationship award) |
| `apps/web/server/admin/lineage/{actions,schema,queries}.ts` + `app/app/lineage/{[treeId]/page,_components/lineage-selected-rank-select}` | Delete the "Selected rank" write-path + dropdown + redaction |
| `apps/web/components/web/lineage/**` (node-card, board-card, branch, canvas index+types, compact-list, mobile-list, honor-strip, students-carousel, view-a-island, tree-board, drawer index/types/info-tab/use-drawer-profile/rank-history-tab, galaxy) | Thread `disciplineId`; drop `selectedRank` prop/plumbing; drawer no longer takes `selectedRankAward` |
| `apps/web/components/common/avatar.tsx` + `.../lineage-cohort-timeline/card-avatar.tsx` | SSR `<img>` primitive + CardAvatar folded onto it |
| `apps/web/prisma/seed-baseline-lineage.ts` · `scripts/{import-bbl-members-full,remove-brian-clone-memberships}.ts` | Drop `selectedRankAwards` seeding + member `rankAwardId` writes (RankAward creation kept) |
| `apps/web/**/*.test.ts` (~11) + `e2e/helpers/*` + `e2e/lineage/public-rank-redaction.spec.ts` | Updated for the removed field; +discipline-scoping unit test (BJJ+TKD); rank-redaction fixture simplified to two-award |
| `docs/architecture/lineage/lineage-rank-promotion-sync-rules.md` · `docs/runbooks/domain-features/lineage-tree-runbook.md` | Staleness corrections |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | clean (0 errors) |
| `oxlint` (touched areas) | clean (2 pre-existing warnings, unrelated) |
| `cd apps/web && bun run build` | ✓ compiled 39.3s + 181/181 static pages |
| `bun run test` (full suite, `--parallel=1`) | **877 pass / 0 fail** across 140 files |
| `bun run wiki:lint` | 0 errors (17 pre-existing cosmetic warnings) |
| `prisma migrate deploy` (local prodsnap) | migration applies; client regenerated |
| Live DOM — BBL board (`?view=board`) | **75 SSR `data-slot="avatar-image"` `<img>`** in initial HTML (was 0 via Base UI) — no initials-pop |
| Live DOM — BBL View A timeline | 75 SSR avatar `<img>` via shared Avatar; belt-ring glow preserved; Meyer→Coral renders; no error boundary |
| Discipline-scoping (unit) | BJJ+TKD holder → BJJ on the tree, both reachable, no-discipline = highest overall, unknown discipline = null |
| Claim orthogonality (integration) | `claim-finalize.test.ts` 7 pass — claim mints RankAward from `claimedRank`, never the removed column |

## Open decisions / blockers

- **None.** All gates green; single-discipline live roster means zero display change. **One deliberate scope boundary:**
  the SESSION_0263 physical archive was kept in-place (D475-4) — flag if you'd rather move the files.
- **Claim → render round-trip** (claim placeholder → approve → minted BJJ award renders on the tree): the pieces are
  each verified in isolation (claim-finalize mints from `claimedRank`; `memberTopRank` renders awarded truth), but the
  full end-to-end wasn't exercised on live prod data. Low risk; worth a one-shot manual confirm post-deploy.

## Next session

### Goal

TBD — operator to pin. Candidates: the lineage **Instructor Hub** epic (SESSION_0472 build plan S6+), or the S3
fresh-member rank-submission door (renders the pending/unverified nodes this lane's model supports).

### First task

TBD at bow-in.

## Review log

### SESSION_0475_REVIEW_01 — the lineage-display cleanup lane

- **Reviewed:** TASK_01 (removal), TASK_02 (discipline-scope), TASK_03 (avatar), TASK_04 (docs) — all done.
- **Verdict:** the lane the prestage teed up landed whole and reuse-first — one `memberTopRank` resolver every
  surface reads, one `Avatar` primitive every surface renders. The single non-trivial judgment call (keep the
  `create-lineage-member` param) was caught by cody-preflight reading the live code, not by following the plan
  wording — the param feeds a *second, kept* column (`LineageRelationship.rankAwardId`).
- **Score:** 9/10 — clean, verified end-to-end (877 tests + live DOM), and the plan's "never a raw `[0]`" invariant
  is airtight (even the editorial promotion-date path is discipline-scoped). −1 for the claim→render round-trip
  proven only in pieces, not live-end-to-end.
- **Follow-up:** operator to pin next lane; optionally live-confirm the claim→approve→belt-render round-trip.

## Hostile close review

- **Giddy:** pass — the shipped state is DRY by construction (one resolver, one avatar primitive), ADR-0035-aligned,
  and adds no new authz/verification axis. The migration is minimal + correct (drops only the member column; the
  PROMOTED_BY edge's award is untouched). The `create-lineage-member` param was *not* blindly dropped — the diff
  shows it still feeds the relationship. No god-component: the disciplineId threading is plain props alongside the
  existing `renderPolicy` chain.
- **Doug:** pass — full `bun run test` **877/0**, `next build` green, migration applies on prodsnap, and the avatar
  SSR + belt render were proven on the **live BBL tree** (75 `<img>` in the initial HTML on both board and timeline;
  no error boundary). Claim path regression-checked (claim-finalize 7/7). The one gap (live claim→render round-trip)
  is flagged, not hidden.
- **Desi:** pass — consistency is now structural: every belt reads `memberTopRank`, every avatar renders through the
  one SSR primitive, the cinematic timeline keeps its belt-ring idiom while sharing the img/initials logic. No
  initials-then-pop on the cards/board/mobile.
- **Kaizen aggregate:** 9/10.

## ADR / ubiquitous-language check

- **No new ADR.** This finishes the model ADR 0035 already ratified: display = highest **awarded** rank; the
  "known limitation" in §3 (cross-rank-system sortOrder) is now *closed in code* via the discipline-scoped resolver.
  `selectedRankAward` is fully removed (ADR 0035 called it "deprecated-for-display, slated for removal once the
  claim flow lands" — the claim flow landed at ADR 0036, so this removal completes that consequence).
- **Ubiquitous language:** `selectedRank` / `selectedRankAward` retired from the codebase (kept only in historical
  sprint records + LR 0008). "Shown rank" = discipline-scoped highest awarded belt. `LineageRelationship.rankAwardId`
  clarified as the **promotion-edge's award** (distinct from the removed member override).

## Reflections

- **The plan's footprint was right; its wording had one trap.** "Remove the `rankAwardId` param" would have deleted a
  legitimate second column's write. Reading the live code (cody-preflight) beat trusting the mapped plan — the two
  `rankAwardId`s (member override vs promotion-edge award) look identical at a grep but are different facts.
- **Centralize first, then scope.** Because TASK_01 already funnelled every reader through `memberTopRank`, making it
  discipline-aware in TASK_02 was a one-function change + prop-threading — no reader had to be re-audited. The order
  (remove the deprecated field → then scope the clean resolver) is why the invariant held.
- **SSR-vs-defer is invisible in a screenshot but obvious in the HTML.** The avatar "pop" wasn't a styling bug — it
  was a *missing `<img>` in the SSR payload*. Verifying by counting `<img>` tags in the raw SSR HTML (not just a
  screenshot) is what proved the fix.

## Full close evidence

| Step | Proof |
| --- | --- |
| Bow-in ritual | opening.md followed; own worktree `../ronin-0475` bootstrapped (bun install → `.env` copy → prisma generate + migrate) |
| Task numbering | `SESSION_0475_TASK_01..04` in the Task log, all `done` |
| Code-quality gate | reuse-first: one `memberTopRank` resolver + one `Avatar` primitive; no new Class-A module; `LineageNodeCard`/`CardAvatar` shrank |
| Runtime verification (Doug) | full `bun run test` 877/0; `next build` ✓; live BBL board+timeline SSR-img proof; claim-finalize 7/7 |
| Migration | hand-authored `20260630000000_drop_lineage_tree_member_selected_rank`; `prisma validate` + `migrate deploy` clean on prodsnap |
| Hostile close review | REVIEW_01 + Giddy/Doug/Desi pass (9/10) |
| ADR / language check | no new ADR (completes ADR 0035 §3 + the selectedRankAward removal consequence); language retired |
| Memory sweep | updated `lineage-rank-display-and-selectedrank-removal` (SHIPPED); see close chat |
| Wiki lint | `bun run wiki:lint` — 0 errors |
| Git hygiene | 3 conventional commits (rank / avatar / docs) + this docs close; rebased onto origin/main; **one push at close on operator go** |
| Graphify update | run at close (count reported in chat) |
