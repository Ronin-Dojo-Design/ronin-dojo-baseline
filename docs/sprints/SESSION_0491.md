---
title: "SESSION 0491 — Belt-PR REBASE: land held #178–181 on the verification spine + rework to B1 → V5/V6 → unhold"
slug: session-0491
type: session--implement
status: in-progress
created: 2026-07-01
updated: 2026-07-01
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
| SESSION_0491_TASK_06 | pending | V5 — /app/claims surfaces RANK_PROMOTION |
| SESSION_0491_TASK_07 | pending | V6 — Playwright proof gate + ADR 0035 Amendment 1 → accepted |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

Awaiting operator sign-off on the **git strategy** (Open decisions #1) before any branch push / PR action.

## Next session

### Goal

TBD at bow-out.

### First task

TBD at bow-out.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence
