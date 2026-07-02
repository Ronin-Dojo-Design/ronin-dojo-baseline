---
title: "SESSION 0491 — Belt-PR REBASE: land held #178–181 on the verification spine + rework to B1 → V5/V6 → unhold"
slug: session-0491
type: session--implement
status: closed
created: 2026-07-01
updated: 2026-07-02
last_agent: claude-session-0491
sprint: S49
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/sprints/SESSION_0490.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0491 — Belt-PR REBASE: land held #178–181 on the verification spine + rework to B1

## Date

2026-07-01

## Operator

Brian + claude-session-0491

## Goal

Land the held member-facing belt-journey epic (PRs #178–181 — Slices 2–5: `RankMilestone` + belt CRUD +
`BeltEditCard` + the "Belts" tab) onto the new `main`, which now carries the UI-less verification **spine**
(V1 schema → V2 `submitRankPromotionClaim` → V3 `finalizeRankPromotion` → V4 onboarding hole closed). Rework
the two slices that mint awards (3, 4) to **B1**: consume the spine instead of minting `UNVERIFIED` awards —
backfill mints a `VERIFIED`-by-implication award only `sortOrder ≤ verified ceiling`; above-ceiling routes to
a `RANK_PROMOTION` claim. Then wire `PassportClaimEvidence → RankMilestone` media in `finalizeRankPromotion`,
build **V5** (`/app/claims` surfaces promotions), and prove **V6** (Playwright) — the gate that unholds the PRs.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0490.md` (Slice V4-partial — `setPassportRank` → pending claim,
  on `main`). Dispatch-ready "belt-PR-rebase" prompt in its `Next session` block executed verbatim here.
- Carryover: the verification spine (V1–V4) is on `main` (0487–0490) but **UI-less**; the member belt UI is
  the held epic Slices 2–5 (#178–181). This session brings them together and reworks the award-minting to B1.
- Design canon read: `docs/petey-plan-0477-belt-journey-crm-epic.md` (Belt Verification Subsystem block +
  "Reworks to the held slices"), **ADR 0035 Amendment 1** (B1, DRAFT → `accepted` when V6 green),
  `[[belt-verification-subsystem-b1-model]]`, SESSION_0487–0490. Design is **LOCKED** (B1 · A1 · C-implied · soft-gate).

### Branch and worktree

- Branch: `session-0491-belt-rebase` (off `origin/main` @ `a6a23410` = session-0490 bow-out).
- Worktree: `/Users/brianscott/dev/ronin-0491` (fresh — bootstrapped: `bun install` + `.env` copy + `prisma generate`).
- Status at bow-in: clean. Local `main` in the canonical checkout is 5 sessions behind (`da491514`) — irrelevant; this worktree tracks `origin/main`.
- Current HEAD at bow-in: `a6a23410`.
- **Other live worktrees (DO NOT TOUCH):** `ronin-0477` (session-0490 branch), `ronin-0485-blog`. The local
  prodsnap DB (`localhost:5432`) is **shared across all worktrees** — see FAILED_STEPS check.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (RankMilestone table + FK), Media (MediaAttachment polymorphic FK), Auth/RBAC (`claim.review`) |
| Extension or replacement | Extension — reuses `PassportClaimRequest`/`mintAssertedRankAward`/`claim.review`/`MediaAttachment` verbatim; no new god-table, no new permission |
| Why justified | The verification machinery already exists on `main`; the epic's award-minting is reworked to consume it (B1) rather than duplicate a display axis |
| Risk if bypassed | Re-introduces the `UNVERIFIED`-award display axis (the LR 0008 founder double-badge bug) — the exact drift ADR 0035 §5 + Amendment 1 forbid |

Live docs checked during planning: Prisma (schema/migration flow), Media (polymorphic `MediaAttachment` FK pattern), Auth (resource-scoped `claim.review`).

### Graphify check

- Graph status: **not built in this worktree** (fresh worktree — `graphify` returns 0 nodes; the graph lives
  in the canonical checkout). Discovery for this session is **grep-based** (per the 0490 close note). The
  canonical checkout's graph is refreshed at bow-out git hygiene (`graphify update .`).
- Files selected by direct inspection (not graph): the V1–V4 spine (`apps/web/server/promotion/router.ts`,
  `apps/web/server/admin/lineage/claim-finalize.ts`, `apps/web/server/web/onboarding/actions.ts`,
  `apps/web/prisma/schema.prisma`) + the 4 held branches' diffstats.

### Grill outcome

Design forks are pre-locked (SESSION_0486 grill: B1 · A1 · C-implied · soft-gate). The remaining fork is
**execution/git-strategy**, surfaced under Open decisions for operator sign-off (touches the never-force-push
boundary + the #178–181 PR lifecycle).

### Drift logged

- **ADR-number collision (RESOLVED this session):** held branch `auto/session-0479` (#178) introduced an ADR
  numbered `0042` (`…/0042-rank-award-fact-vs-member-milestone.md`), but `0042` is already taken on `main` by
  `0042-canonical-blog-surface-post-over-contentatom.md` (session 0485). Renumbered the belt ADR to **`0043`**
  during the Slice-2 rebase and fixed all cross-references. (Logged for the bow-out drift-register sweep.)

## Petey plan

### Goal

Bring held #178–181 onto the spine-carrying `main`, rework Slices 3–4 to B1, wire evidence→milestone, add the
`/app/claims` promotion surface (V5), and prove launch-safety end-to-end (V6) — then hold at the push/unhold gate.

### Tasks

#### SESSION_0491_TASK_01 — Rebase Slice 2 (`RankMilestone` model + migration + ADR) onto the new main

- **Agent:** Cody
- **What:** Replay `auto/session-0479` (#178) onto `origin/main`. Keep the `RankMilestone` table +
  `MediaAttachment.rankMilestoneId` FK + the `add_rank_milestone` migration (additive, independent of V1's
  `add_passport_claim_type` — keep both; bump the migration timestamp only if it collides).
- **Steps:** resolve the `schema.prisma` conflict (keep BOTH the V1 enum/`type` column and the new
  `RankMilestone`/FK blocks); resolve the `0035-…md` conflict (keep Amendment 1 **and** the branch's edit);
  **renumber the new ADR `0042→0043`** + fix its refs (drift above); merge the append-only shared-doc conflicts
  (`index.md`, `ubiquitous-language.md`, `schema-prisma.md`, `lineage-hub.md`). Verify with `prisma validate`
  + a `migrate diff --from-migrations → --to-schema` **shadow-replay** (NEVER `migrate dev` — shared DB).
- **Done means:** `prisma validate` clean; shadow-replay shows empty diff (migrations == schema); ADR 0043 landed; no `0042` collision.
- **Depends on:** nothing.

#### SESSION_0491_TASK_02 — Rebase + REWORK Slice 3 (belt oRPC) to B1

- **Agent:** Cody
- **What:** Replay `auto/session-0480` (#179 — `server/belt/*`, the gated belt CRUD) onto TASK_01, then rework
  the award-ensure to B1: mint a **`VERIFIED`-by-implication** award (`source: STATED`) **only** when
  `rank.sortOrder ≤ verified ceiling`; **above-ceiling throws** (UI routes to `promotion.submit`, the V2 oRPC on
  main). **Delete every `UNVERIFIED`-award creation path.** Fact-edit rule: date/promoter/school editable on
  self-added backfill awards only; read-only on `IMPORTED` / promotion-minted awards.
- **Steps:** resolve `server/orpc/roles.ts` + `server/router.ts` conflicts (main's V2 registered the
  `promotion` router — keep both registrations); rewrite the award-ensure per B1; drop the UNVERIFIED branch;
  add/repair hard-invariant tests (cannot mint above ceiling · cannot edit an imported/approved fact · cannot
  delete the top award · own-passport only · **no path creates an `UNVERIFIED` award**).
- **Done means:** invariant tests green; grep proves zero `UNVERIFIED`-award creation in `server/belt/*`.
- **Depends on:** SESSION_0491_TASK_01.

#### SESSION_0491_TASK_03 — Rebase + REWORK Slice 4 (`BeltEditCard` / `BeltJourneyGrid`) to B1

- **Agent:** Cody
- **What:** Replay `auto/session-0481` (#180 — belt cards, edit form, `CountrySelect`) onto TASK_02. Rework the
  **above-ceiling** card from an editable award-minting card to a **"Locked — request promotion"** CTA that
  opens the `promotion.submit` flow (with the certificate/instructor-photo soft-gate). At/below-ceiling cards
  stay enrichable (backfill). Fold in the 0484 carry-overs that live here: country round-trip data-loss fix,
  `Hint`→`Note`, first-run empty state.
- **Done means:** above-ceiling card renders the promotion CTA (no edit form / no award mint); below-ceiling enrichable; country round-trips without loss.
- **Depends on:** SESSION_0491_TASK_02.

#### SESSION_0491_TASK_04 — Wire `PassportClaimEvidence → RankMilestone` media in `finalizeRankPromotion`

- **Agent:** Cody
- **What:** In `server/admin/lineage/claim-finalize.ts` (`finalizeRankPromotion`, deferred at V3 because
  `RankMilestone` wasn't on main): on approve, materialize the claim's certificate/instructor photos as
  `RankMilestone` media (`purpose ∈ {certificate, instructor}`) on the newly-minted award's milestone (create
  the milestone if absent).
- **Done means:** approving a `RANK_PROMOTION` with evidence produces the `VERIFIED` award **and** its milestone media; test covers it.
- **Depends on:** SESSION_0491_TASK_01 (needs `RankMilestone` on the branch).

#### SESSION_0491_TASK_05 — Rebase Slice 5 (mount the "Belts" tab + media seams)

- **Agent:** Cody
- **What:** Replay `auto/session-0482` (#181 — the "Belts" tab on `/app/profile` via `DashboardTabs`, the
  belt-tab loader, media-authorization seams, `emit-school-lead` edits). Server-load awarded ranks +
  BJJ-scoped `memberTopRank` + discipline rank list + milestones in one pass (no N+1). Resolve any media /
  `emit-school-lead` conflicts with main.
- **Done means:** "Belts" tab live + gated + BJJ-scoped; renders every rank with correct Add/Locked/Completed state from real data.
- **Depends on:** SESSION_0491_TASK_03, SESSION_0491_TASK_04.

#### SESSION_0491_TASK_06 — Slice V5: `/app/claims` surfaces `RANK_PROMOTION` claims

- **Agent:** Cody
- **What:** Extend the claims queue query + review UI to list `RANK_PROMOTION` claims (asserted belt swatch +
  evidence photos + claimant); wire Approve / Needs-info / Deny to `applyPassportClaimReview` (already branches
  to `finalizeRankPromotion`). Reuse the resource-scoped `claim.review` grant (RBAC-instructor, node/tree-scoped)
  + `claims.manage` (admin). Notify the member on decision (existing claim-decision notice only — no new email).
- **Done means:** an instructor with `claim.review` on the student's tree approves a promotion → award + milestone appear; a non-scoped user cannot.
- **Depends on:** SESSION_0491_TASK_04.

#### SESSION_0491_TASK_07 — Slice V6: Doug proof gate (the bar that unholds #178–181)

- **Agent:** Doug
- **What:** Playwright + source proof: (1) a self-declared belt **never** renders as verified anywhere;
  (2) promotion end-to-end — submit (±photo) → queue → RBAC-instructor approve → `VERIFIED` award + milestone
  media + ceiling rises; (3) **zero regression** to the awarded-truth rank display (0474/0475) — no per-belt pill
  (ADR 0035 §5 reaffirmed, no double-badge); (4) `setPassportRank`/backfill above-ceiling rejected; (5) RBAC
  scope enforced. On green: finalize **ADR 0035 Amendment 1 → `accepted`** + mirror its terms into `ubiquitous-language.md`.
- **Done means:** all five proofs green + full gate + ADR finalized. This is the gate that unholds the PRs.
- **Depends on:** SESSION_0491_TASK_05, SESSION_0491_TASK_06.

### Parallelism

One coherent lane — **sequential, no fan-out** (petey-plan-0477 §"Verification-block parallelism": "do inline;
no fan-out"). The rebase must proceed bottom-up (each slice replays onto the prior). TASK_04 (evidence wire) is
independent of TASK_02/03 once TASK_01 lands and could pair with TASK_02, but the shared `claim-finalize.ts` /
belt surfaces make serial safer. Cody builds each slice; Doug owns TASK_07.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0491_TASK_01 | Cody | Schema/migration rebase + conflict resolution + ADR renumber |
| SESSION_0491_TASK_02 | Cody | oRPC B1 rework + hard-invariant tests |
| SESSION_0491_TASK_03 | Cody | Component rework (Locked→promotion CTA) + 0484 carry-overs |
| SESSION_0491_TASK_04 | Cody | Finalize-path evidence→milestone wiring |
| SESSION_0491_TASK_05 | Cody | Tab mount + read-model + media seams |
| SESSION_0491_TASK_06 | Cody | `/app/claims` promotion surface (V5) |
| SESSION_0491_TASK_07 | Doug | Playwright proof gate + ADR finalize (V6) |

### Open decisions

1. **Git strategy for landing the rebase (needs operator "go" — touches the never-force-push boundary + the
   #178–181 PR lifecycle):**
   - **(A) Fresh per-slice PR stack on the new `main`, close #178–181 as "superseded by rebase" [RECOMMENDED].**
     No force-push; each rebased+reworked slice is a clean PR reviewable against the real target (the spine). The
     "unhold" happens as the fresh PRs merge bottom-up; #178–181 close with a superseded-by link.
   - **(B) Force-push the rebased branches onto #178–181.** Keeps the PR numbers/threads, but rewrites the
     codex branch history — conflicts with the standing **never-force-push** rule.
   - **(C) One squashed PR** `session-0491-belt-rebase → main`. Simplest single review; loses per-slice granularity.
2. **Scope of THIS session.** Steps 1–7 (4-slice rebase + 2 B1 reworks + evidence wire + a new `/app/claims`
   surface + a Playwright gate) is large — realistically a checkpoint at the rebase spine (TASK_01–05) then
   V5/V6, possibly spanning a follow-up session. Recommend: land + verify the rebase (01–05) as the first
   reviewable unit, then V5/V6. (Not a blocker — flagged for expectation-setting.)

### Risks

- **Shared local DB (`localhost:5432`) across worktrees** — a concurrent session's migration can force a
  `migrate dev` reset. Mitigation: hand-author + `migrate diff` shadow-replay only; never `migrate dev`, never
  apply to the shared DB (`[[parallel-session-shared-db-migrate-dev-reset-trap]]`; FS check below).
- **Rebase-then-typecheck needs `bun install` in between** — a concurrent session's new dep made `tsc` false-fail
  in 0490. After any rebase touching `package.json`/`bun.lock`, re-run `bun install` before gating.
- **schema.prisma / ADR 0035 / roles.ts / router.ts textual conflicts** — enumerated above; all "keep both."
- **B1 rework blast radius** — deleting the UNVERIFIED-award path must leave no orphan caller; grep-verify.

### Scope guard

- ❌ No push / merge / deploy / PR-unhold without the operator's explicit "go" (build + verify + show first).
- ❌ No `migrate dev`; no mutation of the shared local DB or any prod/Neon/Vercel/Stripe/DNS.
- ❌ No touching `ronin-0477` / `ronin-0485-blog` worktrees; `../ronin-dojo-monorepo` is READ-ONLY.
- ❌ No re-opening the display-axis decision (B2 is rejected — ADR 0035 §5 + Amendment 1); no per-belt pill.
- ❌ No Slice 6 (BBL CRM — shipped) / Slice 7 (agent lead automation — held) work.
- ❌ No autonomous invite/outreach email sends.

### Dirstarter implementation template

- **Docs read first:** `schema-migration.md`, `prisma-workflow.md`, `[[prisma-prod-migration-flow]]`, the
  polymorphic `MediaAttachment` FK pattern, resource-scoped `claim.review` (roles.ts:89–94).
- **Baseline pattern to extend:** `PassportClaimRequest` + `mintAssertedRankAward` + `applyPassportClaimReview`
  (the identity-claim machinery), `MediaAttachment` 9-FK polymorphic pattern, L1 `Card` + `BeltSwatch`.
- **Custom delta:** the `RANK_PROMOTION` claim type + belt-journey member surface consuming the spine (B1).
- **No-bypass proof:** reuses the one claim queue / one finalize / one `claim.review` grant — no parallel system.

## Cody pre-flight

### Pre-flight: SESSION_0491_TASK_01–05 (belt-PR rebase + B1 rework)

#### 6. FAILED_STEPS check

- Prior failures in this area: **FS-0011** (git editor hangs on `rebase --continue` → use `GIT_EDITOR=true git
  rebase --continue`), **FS-0012** (don't rebase a branch whose code is already merged — verify merge-base
  first; here the stack base `auto/session-0478` IS on main, the slices above are NOT). Shared-DB migrate trap
  (`[[parallel-session-shared-db-migrate-dev-reset-trap]]`).
- Mitigation acknowledged: `GIT_EDITOR=true` on rebase continues; `migrate diff` shadow-replay only; `bun
  install` after any lockfile-touching rebase before gating.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0491_TASK_01 | landed | Rebased Slices 2–5 onto spine; conflicts resolved; ADR 0042→0043; shadow-replay clean; typecheck green |
| SESSION_0491_TASK_02 | landed | Slice 3 B1 rework — VERIFIED-by-implication backfill, no UNVERIFIED awards, authorship-based fact-edit gate; 14+13+14 tests green (commit f1c0cef2) |
| SESSION_0491_TASK_03 | landed | Above-ceiling card → "Request promotion" CTA + soft-gate photo modal (`belt-promotion-request.tsx`); Hint→Note + first-run empty state applied; country round-trip re-scoped (no award column — needs schema, deferred) (commit c26dd955) |
| SESSION_0491_TASK_04 | landed | evidence→RankMilestone in finalizeRankPromotion + additive `mediaId` on promotion.submit; 7 finalize + 6 submit tests green (commit 40366de7) |
| SESSION_0491_TASK_05 | landed | Belts tab loader confirmed post-rework (folded into c26dd955) |
| SESSION_0491_TASK_06 | landed | V5 — queue/detail render promotions (belt swatch + photo evidence, comp hidden); review door reworked to userActionClient + in-action authz (admin byte-identical, IDENTITY admin-only, RANK_PROMOTION admits `claims.manage` / resource-scoped `claim.review` via `resolvePromotionClaimResources`); promotion decisions notify the member (derived nodeId); 6+4+4 tests green (commit 11371433) |
| SESSION_0491_TASK_07 | blocked | V6 — deferred to SESSION_0492: the quality loop found a CRITICAL authz hole + pre-B1 e2e fixtures; proving launch-safety before fixing them would be theater |
| SESSION_0491_TASK_08 | partial | Operator-ordered quality loop (fallow baseline + 4-finder hostile review) — DIAGNOSIS COMPLETE (1 CRITICAL / 2 HIGH / 4 MED found pre-push); fixes deferred to SESSION_0492 (operator: fresh session) |

## What landed

- **TASK_01 — the rebase:** held #178–181 (Slices 2–5, ~3.3K lines) cherry-picked onto the spine-carrying
  `origin/main`. ADR-number collision resolved (**belt ADR 0042 → 0043**, all refs swept); `wiki/index.md` /
  ADR-0035 / lineage-hub conflicts merged keep-both; `add_rank_milestone` migration verified via
  `migrate diff` **shadow-replay = "No difference detected"** (never `migrate dev`; shared DB untouched).
- **TASK_02 — Slice 3 → B1 (the launch-safety core):** `upsertBeltMilestone` mints **VERIFIED-by-implication**
  (gated `≤ ceiling`) — **no code path creates an UNVERIFIED award**; above-ceiling throws → UI routes to
  `promotion.submit`. Fact-editability re-keyed off **authorship** (`awardedById === null` = self-backfill
  editable; stamped = promotion-minted read-only; IMPORTED/DISPUTED locked), exposed as
  `BeltCardOutput.isFactEditable` (server-computed, client reflects).
- **TASK_03/05 — belt UI consumes the spine:** above-ceiling `BeltEditCard` → **"Request promotion"** CTA +
  `BeltPromotionRequest` modal (note + optional cert/instructor photo soft-gate → own-passport upload →
  `mediaId` evidence). `Hint`→`Note`; B1 first-run empty state (full ladder of request-CTAs, not a dead end).
  Belts tab loader confirmed post-rework.
- **TASK_04 — evidence → milestone:** `finalizeRankPromotion` materializes the claim's photo evidence onto the
  minted award's `RankMilestone` (idempotent, purpose from label); `promotion.submit` evidence gained an
  additive optional `mediaId` persisted to `PassportClaimEvidence`.
- **TASK_06 — V5 claims queue:** `/app/lineage/claims` list + detail render promotions (belt swatch, photo
  evidence, comp block hidden); `reviewPassportClaim` moved to `userActionClient` with in-action authz —
  IDENTITY stays admin-only byte-identical; RANK_PROMOTION admits `claims.manage` or **resource-scoped
  `claim.review`** via new `resolvePromotionClaimResources` (Passport→node→tree membership→branch chain);
  promotion decisions now notify the member (nodeId derived in-tx).
- **TASK_08 — quality-loop diagnosis (fixes deferred):** fallow baseline on the diff (22 complexity / 23
  dead-code / 31 dupes; repo health 77 B) + 4 parallel review finders. **Found before push:** 1 CRITICAL,
  2 HIGH, 4 MED (see Hostile close review). Operator prod-QA added FI-010–013 to `POST_LAUNCH_SOT`.
- **Goal partially reached, deliberately:** the rebase + B1 rework + V5 are built and verified (100+ tests,
  `next build` green ×3), but **V6 and the PR unhold did NOT happen** — the quality loop caught a CRITICAL
  self-approval hole first. Branch held unpushed; fixes are SESSION_0492.

## Decisions resolved

- **One integrated session branch** (per-slice commits + gates) over 4 force-pushed `auto/*` branches —
  force-push forbidden; B1 rework crosses slice boundaries. PR shape decided at the push gate.
- **B1 fact-edit marker = `awardedById`** (no claim FK on RankAward; both backfill and promotion-minted are
  STATED/VERIFIED — authorship is the only clean discriminator).
- **Evidence `mediaId` = additive extension of `promotion.submit`** (the existing `PassportClaimEvidence.mediaId`
  FK; no schema change).
- **IDENTITY-claim review stays admin-only** in the V5 authz rework (bigger blast radius; out of V5 scope).
- **Country round-trip re-scoped, not a bug:** `RankAward` has no country column (country belongs to the
  SCHOOL, Locked #7) — the card can't re-seed the picker without a schema change this lane forbids.
- **Operator: fixes run in a FRESH session (0492)** — this session closes with the diagnosis routed, not with
  half-started fixes.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` + `migrations/20260701000000_add_rank_milestone/` | Slice-2 rebase — `RankMilestone` + `MediaAttachment.rankMilestoneId` (shadow-replay clean) |
| `apps/web/server/belt/{router,belt-gate,queries,schemas}.ts` (+tests) | Slice-3 rebase + B1 rework (VERIFIED-by-implication mint; authorship fact-gate; `isFactEditable` on the card) |
| `apps/web/server/router.ts` | register `belt` beside `promotion` |
| `apps/web/components/web/belt/*` (8 files +tests) | Slice-4 rebase + CTA rework; new `belt-promotion-request.tsx`; `isCardFactEditable`; Hint→Note; empty state |
| `apps/web/app/(web)/dashboard/belts-tab.tsx` + `app/app/profile/page.tsx` + `server/web/belt/belt-tab-loader.ts` | Slice-5 rebase — Belts tab + one-pass loader (+`passportId` for the promotion upload target) |
| `apps/web/server/admin/lineage/claim-finalize.ts` (+`finalize-rank-promotion.test.ts`) | evidence→`RankMilestone` materialization on approve |
| `apps/web/server/promotion/router.ts` + `server/web/claims/submit-rank-promotion-claim.ts` (+test) | additive evidence `mediaId` |
| `apps/web/server/admin/claims/{passport-claim-review-actions,promotion-claim-resource}.ts` (+3 test files) | V5 authz — scoped `claim.review` door + notification nodeId |
| `apps/web/server/admin/lineage/claim-queries.ts` + `app/app/lineage/claims/**` | V5 queue/detail promotion rendering |
| `apps/web/e2e/{belt-journey.spec.ts,helpers/seed-belt-journey*.ts}` | rebased UNCHANGED — **still encode pre-B1 behavior (finding, fix in 0492)** |
| `docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md` (renamed from 0042) + ADR 0016/0035, `ubiquitous-language.md`, `lineage-hub.md`, `schema-prisma.md`, `wiki/index.md` | Slice-2 docs + renumber sweep + session rows |
| `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` | +FI-010–013 (operator prod-QA findings) |
| `docs/sprints/SESSION_0479–0482.md` (rebased) + `SESSION_0491.md` | session records |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | ✅ 0 errors (re-run after every task) |
| `bun run test` (belt/promotion/claims scope, `--parallel=1` per file) | ✅ **100+ pass / 0 fail** — belt-gate 14 · belt integration 14 · view-model 16 · finalize-promotion 7 · submit-claim 6 · claim-finalize 7 · claim-review 11+3+3 · promotion-resource 4 · claim-queries 4 · review-rank-promotion 6 (+ 21 identity-regression) |
| `bun run lint:check` / `format:check` | ✅ 0 errors / clean |
| `bun run build` (`next build`) | ✅ green ×3 (last: 182 pages, compiled successfully) |
| `bun run wiki:lint` | ✅ 0 errors / 16 pre-existing warnings |
| `npx fallow audit --base origin/main` | baseline captured: 22 complexity · 23 dead-code · 31 dupes (fix loop → 0492) |
| Browser smoke (queue/detail/CTA render) | ❌ NOT done — flagged honestly; part of 0492 verify + V6 |
| V6 Playwright proof gate | ❌ NOT run — deferred (CRITICAL fix first; e2e fixtures pre-B1) |

## Open decisions / blockers

1. **PUSH GATE (operator "go" required):** branch `session-0491-belt-rebase` is 13+ commits ahead, unpushed.
   **Recommendation: do NOT push until the SESSION_0492 security fixes land** — pushing now would put a known
   CRITICAL self-approval hole in a PR (even unmerged, it's the reviewable artifact). Push after 0492 TASK_01.
2. **Git strategy at the gate:** one PR superseding #178–181 (recommended) vs re-split per-slice. Operator call.
3. **BRANCH/NODE_EDITOR review-UI access (0492 fork):** the V5 action admits scoped instructors, but
   `requireLineageManagementAccess` (TREE_ADMIN/TREE_EDITOR) locks them out of the queue/detail pages —
   half-wired. Options: widen the page gate to any `claim.review` holder (scoped list) vs deep-link-only.
4. **NODE_EDITOR carrying `claim.review` at all** — the CRITICAL's root enabler. The claimant≠reviewer guard
   fixes self-approval regardless; whether an own-node NODE_EDITOR should review ANY claim is a policy question
   for the 0492 grill (recommend: keep the grant, add the guard — instructors hold TREE/BRANCH grants).
5. Cross-file tracer + cleanup finder full transcripts live in the session task outputs; their findings are
   inventoried below — nothing else blocks.

## Next session

### Goal

**SESSION_0492 — Fix session: close every quality-loop finding on `session-0491-belt-rebase`, prove the delta,
run V6, then push on the operator's go.** Security first, then e2e fixtures, then the fallow cleanup batch,
then V6 + ADR 0035 Amendment 1 → `accepted`. The prod QA lane (FI-010–013) follows as its own lane.

### First task (dispatch-ready prompt block)

```
DISPATCH SETUP: work in the EXISTING worktree /Users/brianscott/dev/ronin-0491 (branch
session-0491-belt-rebase — 13+ commits, clean, bootstrapped, fallow verified). /bow-in; create
docs/sprints/SESSION_0492.md. READ FIRST: SESSION_0491.md "Hostile close review" (the full findings
inventory) + [[belt-verification-subsystem-b1-model]]. Do NOT push until fixes land + operator go.

FIX ORDER (each its own commit + gate: typecheck · lint:check · format:check · scoped bun run test ·
next build):
1. CRITICAL — self-approval: in assertCanReviewPassportClaim (passport-claim-review-actions.ts),
   reject RANK_PROMOTION review when claim.claimantUserId === user.id (before the resource check);
   mirror the guard inside applyPassportClaimReview (defense-in-depth for other callers). Test:
   claimant with own-node NODE_EDITOR grant CANNOT approve own claim (the exact exploit chain).
2. HIGH ×2 — mediaId ownership (one fix shape, two seams): before persisting a caller-supplied
   mediaId, require the Media row exists AND media.uploadedById === caller (else friendly reject,
   never a P2003 500). Apply in submitRankPromotionClaim evidence AND belt.attachMilestoneMedia.
   Tests: foreign mediaId rejected on both; nonexistent mediaId rejected cleanly.
3. MED — deleteRankAward: forbid deleting authority-owned awards (reuse isFactEditable — delete may
   not exceed edit). Test: promotion-minted/IMPORTED award cannot be deleted.
4. MED — mintAssertedRankAward existing-award path: on approve, UPDATE the existing award →
   verificationStatus VERIFIED + stamp awardedById (approval is authoritative). Test covers it.
5. LOW hardening — move/re-verify the authz claim-read inside the review tx (TOCTOU); wrap
   submit's one-open check + create in a transaction; delete the dead claims.manage early-return
   OR make a non-admin claims.manage grant real; fix the stale UNVERIFIED comment
   (belt-edit-form.tsx:174).
6. e2e B1 fixtures (V6 precondition): belt-journey.spec.ts:80 "Locked disabled" → enabled "Request
   promotion" assertions; seed-belt-journey-db.ts — stamp awardedById on the read-only fixture belt,
   drop the UNVERIFIED mint (impossible state under B1).
7. FALLOW CLEANUP BATCH (then re-run npx fallow audit --base origin/main and RECORD the delta):
   a. claims/page.tsx row arrow (CRAP 132) → extract a pure claimRowViewModel + row component.
   b. enrichedCard: single-row findFirst(id+passportId, gateAwardSelect) — not getMemberAwards.
   c. promotion-claim-resource: grants-first inversion (fetch reviewer's LineageTreeAccess rows;
      walk ancestors ONLY when a BRANCH_EDITOR grant exists) — kills the whole-tree load.
   d. Card media carries url/type (join in gateAwardSelect, emit in toBeltCard) → DELETE
      beltTabAwardSelect + resolveMedia + BeltRankViewModel.media + the grid's URL reconciliation
      (subsumes the 28-line select dupe).
   e. claim-review-detail: merge the duplicated Claimed-Rank/Asserted-Belt cards; use BeltSwatch
      (kill the hand-rolled dot).
   f. Dead exports: un-export self-only symbols (gateAwardSelect, beltCardOutput const,
      MILESTONE_MEDIA_PURPOSES if unconsumed, mediaAttachTargetSchema); trim the belt barrel to
      what belts-tab.tsx imports (or repoint + delete).
   DEFERRED-with-reason (named follow-ups, don't do now): MediaTileGrid extraction; CountrySelect →
   components/common + Intl.DisplayNames; test-fixture dedup ×3; e2e seed-helper dedup.
8. UI wiring fork (grill the operator first): BRANCH/NODE_EDITOR page access (Open decisions #3/#4).
9. VERIFY: full scoped test suite + next build + HEADLESS BROWSER pass (queue → detail → approve;
   belts tab → CTA → submit) — render it, don't assert from source. Then V6 (RUN_BELT_E2E=1 five
   proofs) + finalize ADR 0035 Amendment 1 → accepted + mirror ubiquitous-language. Then hold at
   the push gate for the operator's go (one PR superseding #178–181, recommended).

SEPARATE LANE (after or parallel in ANOTHER worktree — prod code, different files): FI-010–013 from
POST_LAUNCH_SOT (claim-funnel photo-loss + missing password step · email wrapper logo/CTA contrast ·
FI-002 jargon copy · mobile lineage filter overlap). P0 first: FI-010 repro on mobile.

BOUNDARIES: explicit per-push authorization; no migrate dev (shared DB); ../ronin-dojo-monorepo
READ-ONLY; no email sends; other worktrees untouched.
```

## Review log

### SESSION_0491_REVIEW_01 — quality loop over the whole session diff (TASK_08)

- **Reviewed tasks:** SESSION_0491_TASK_01–06 (the entire branch diff vs origin/main).
- **Method:** fallow baseline (audit + health) + 4 parallel finder agents (correctness/security,
  removed-behavior, cross-file tracer, cleanup/WWAD) + independent gate re-runs by the lead.
- **Verdict:** the build is well-shaped (reuse-first honored: one claim queue, one finalize, one grant, L1
  primitives; no god-components; the B1 model is DDD-clean — belt/promotion/claims are vertical slices over
  one spine). But the diff is NOT push-ready: 1 CRITICAL / 2 HIGH security findings + stale e2e fixtures.
  **Two independent finders converged on the CRITICAL** — high confidence. The loop did exactly its job:
  caught it before the PR.
- **Score:** build quality 8/10 · ship-readiness 4/10 until 0492 lands.
- **Follow-up:** SESSION_0492 fix session (staged above).

## Hostile close review

- **Giddy (architecture):** **pass with findings** — rebase clean, B1 rework reuses the spine verbatim, the
  `awardedById` marker is the right discriminator (no new column, no display axis). Flags: the authz walk
  loads a whole tree per review (scale), the ids-only card media forces a 3-file client reconciliation, and a
  half-wired capability (action admits scoped reviewers the UI locks out) — all staged for 0492.
- **Doug (verification honesty / security):** **FAIL until 0492** — a member can self-approve their own belt
  promotion (CRITICAL, twice-confirmed); caller-supplied mediaIds are never ownership-checked (HIGH ×2);
  deleteRankAward erases authority-owned history (MED); V6 never ran and the e2e fixtures still assert the
  pre-B1 world. Unit coverage (100+) is real but browser smoke was not done. The branch must not push as-is.
- **Desi (UX / brand):** **FAIL on the live product** — operator evidence: claim-funnel photo loss + a
  promised password step that doesn't exist (the flagship funnel breaking its own instructions), the email
  wrapper rendering the logo white-on-white with disabled-looking CTAs, internal tier jargon in member copy,
  and mobile lineage filters overlapping the root card. "Amateur hour" is the accurate review. Routed
  FI-010–013; the new belt/claims UI itself is consistent (L1 Card/Dialog/BeltSwatch) but unverified in a
  browser.
- **Kaizen aggregate:** **6/10** — high build velocity and the process worked (the loop caught a CRITICAL
  pre-push, which is the system succeeding, not failing) — but the session cannot claim launch-safety, and
  the live product embarrassed us in the operator's own dojo this same day.

### Findings (severity ≥ medium)

#### SESSION_0491_FINDING_01 — Member can self-approve their own RANK_PROMOTION (CRITICAL)

- **Severity:** high (CRITICAL) · **Task:** SESSION_0491_TASK_06
- **Evidence:** `apps/web/server/admin/claims/passport-claim-review-actions.ts:267-309` + `promotion-claim-resource.ts:50` + `roles.ts:99` (NODE_EDITOR carries `claim.review`) + `claim-finalize.ts:601-609` (every approved identity claim grants own-node NODE_EDITOR)
- **Impact:** any claimed member files a promotion then invokes `reviewPassportClaim` on it directly → VERIFIED above-ceiling award + `isVerified` flip. Defeats the entire B1 invariant. Confirmed independently by two finders.
- **Required follow-up:** 0492 fix #1 (claimant≠reviewer guard, both layers) + exploit-chain test.
- **Status:** open (branch unpushed — never reached a PR or prod)

#### SESSION_0491_FINDING_02 — Caller-supplied `mediaId` never ownership-validated (HIGH ×2 seams)

- **Severity:** high · **Task:** TASK_04/TASK_06 (evidence) + TASK_02-adjacent (attachMilestoneMedia, rebased Slice 3)
- **Evidence:** `submit-rank-promotion-claim.ts:129-140`; `server/belt/router.ts:212-246`; renders via `claim-queries.ts` media join + `belt-tab-loader.ts:56`
- **Impact:** foreign (private, `isPublic=false`) media disclosed to reviewers / attached to the attacker's milestone; nonexistent id → raw P2003 500.
- **Required follow-up:** 0492 fix #2 (exists + `uploadedById === caller`, both seams). **Status:** open

#### SESSION_0491_FINDING_03 — `deleteRankAward` erases authority-owned awards (MED)

- **Evidence:** `server/belt/router.ts:278-298` (top-award guard only; no `isFactEditable`-class guard)
- **Impact:** member deletes an instructor-minted/IMPORTED/DISPUTED belt they cannot even edit (cascades milestone+media). **Follow-up:** 0492 fix #3. **Status:** open

#### SESSION_0491_FINDING_04 — Scoped reviewers half-wired: action admits, UI blocks (MED)

- **Evidence:** `passport-claim-review-actions.ts:302-306` vs `lib/auth-guard.ts:67` (`LINEAGE_MANAGEMENT_AREA_ROLES`)
- **Impact:** the documented BRANCH/NODE-scoped instructor reviewer can't reach the queue/detail pages. **Follow-up:** 0492 #8 (operator fork). **Status:** open

#### SESSION_0491_FINDING_05 — e2e spec + seed encode the pre-B1 world (MED — V6 blocker)

- **Evidence:** `e2e/belt-journey.spec.ts:80` (deleted disabled-"Locked" button), `:83-97` + `e2e/helpers/seed-belt-journey-db.ts:90-105` (UNVERIFIED mint; unstamped VERIFIED belt now fact-editable)
- **Impact:** V6's own proof suite fails/asserts the wrong model. **Follow-up:** 0492 fix #6. **Status:** open

#### SESSION_0491_FINDING_06 — Approve leaves a pre-existing award untouched (MED, pre-existing sharpened by B1)

- **Evidence:** `claim-finalize.ts` `mintAssertedRankAward` (`if (existing) return existing.id`)
- **Impact:** an award minted between submit and approve (e.g. admin add-person, still UNVERIFIED) is neither verified nor stamped — an "approved" belt that stays member-editable. **Follow-up:** 0492 fix #4. **Status:** open

*(Prod findings FI-010–013 live in `POST_LAUNCH_SOT.md` — canonical rows; not duplicated here per §6.7.)*

## ADR / ubiquitous-language check

- **ADR 0035 Amendment 1 stays DRAFT** — correct per its own terms (finalizes to `accepted` only when V6 is
  green; V6 deferred to 0492). No premature flip.
- **ADR renumber:** belt fact/milestone ADR landed as **0043** (0042 collision with the blog ADR resolved;
  all cross-refs swept). No new decision requiring a new ADR — B1 implements the ratified amendment.
- **Ubiquitous language:** no new terms this session ("VERIFIED-by-implication", "authority-owned" are
  amendment terms — mirrored into `ubiquitous-language.md` at 0492 when the amendment flips to accepted).

## Reflections

- **The loop caught what the tests couldn't, before it mattered.** 100+ green tests and three green builds —
  and still a CRITICAL: the tests seeded the fixture WITHOUT the own-node NODE_EDITOR grant production always
  creates, so the exploit chain lived exactly in the gap between "tested" and "deployed-shaped". Two
  independent adversarial finders converged on it from different directions. Adversarial review before push
  is not ceremony; it is the only thing that saw across the seam.
- **Authorization widening is where CRITICALs breed.** Moving `reviewPassportClaim` from role-gate to
  resource-scope was the session's one genuinely new authz surface — and both the CRITICAL (self-scope) and
  the MED (UI/action mismatch) live precisely there. Widening rule for next time: enumerate WHO GAINS access
  (not just who keeps it) and write the adversarial test for the gainer FIRST.
- **The operator's dojo is the fifth finder.** Mikayla's claim attempt surfaced funnel breaks (photo loss,
  phantom password step) no agent was even looking at — prod QA evidence arrived mid-loop and slotted straight
  into the ledger. The claim loop is the moat; it deserves a standing mobile e2e, not incidental discovery.
- **Sequencing worked:** rebase → rework → verify per task kept each blast radius small; the ADR-number
  collision and Prisma-7 flag rename were absorbed without derailing. And closing on a diagnosis instead of
  rushing fixes into a 300K-token session was the right call — the fix list is precise, staged, and cheap to
  execute fresh.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | POST_LAUNCH_SOT + wiki/index frontmatter bumped (`updated: 2026-07-01`, `last_agent: claude-session-0491`); rebased docs carry their slice authors correctly; ADR 0043 rename swept |
| Backlinks/index sweep | wiki index: SESSION_0491 row added; 0479–0482 rows landed with the rebase; 0479 row annotated "rebased at 0491"; ADR 0043 row present |
| Wiki lint | `bun run wiki:lint` → **0 errors / 16 warnings (all pre-existing)** — gate-runner verified |
| Kaizen reflection | yes — `## Reflections` (4 entries) |
| Hostile close review | SESSION_0491_REVIEW_01 + Giddy/Doug/Desi verdicts + FINDING_01–06; Doug = FAIL-until-0492 (honest) |
| Code-quality gate (Class-A) | Class-A modules this session (belt router B1, promotion-claim-resource, belt-promotion-request): quality-loop diagnosis stands in — full `/code-quality` scoring deferred to 0492 post-fix (scoring known-CRITICAL code is noise) |
| Runtime verification (Doug) | Unit/integration 100+ green ×3 gates; **browser smoke NOT done** (flagged, 0492 #9); V6 NOT run (deferred with reason) |
| Review & Recommend | yes — Next session = SESSION_0492 fix dispatch (above), staged dispatch-ready |
| Memory sweep | `belt-verification-subsystem-b1-model` memory updated (V5 + CRITICAL + pipeline state); MEMORY.md index refreshed |
| Next session unblock check | **UNBLOCKED** — 0492 first task executable immediately in this worktree; only the push itself is operator-gated |
| Git hygiene | branch `session-0491-belt-rebase` · worktree `../ronin-0491` (kept — branch unmerged, next session continues here) · tree clean pre-close · single close commit — hash reported at bow-out · **push HELD (explicit-push-authorization + open CRITICAL)** |
| Graphify update | gate runner ran `graphify update .` in this worktree: **12,219 nodes · 26,592 edges · 1,403 communities** |
| Pre-push build gate | `next build` green (182 pages) — but push deliberately withheld (FINDING_01) |
| Ledger routing | FI-010–013 → POST_LAUNCH_SOT (prod findings); FINDING_01–06 session-scoped (branch unpushed — never reached main; 0492 fixes pre-push); FS-0011/FS-0012 cross-off candidates NOT flipped (pre-existing mitigated entries this session merely applied) |
