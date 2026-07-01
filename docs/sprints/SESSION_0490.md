---
title: "SESSION 0490 — Belt-verification Slice V4 (partial): setPassportRank → pending promotion claim"
slug: session-0490
type: session--implement
status: closed
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0490
sprint: S49
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/sprints/SESSION_0489.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0490 — Slice V4 (partial): close the setPassportRank hole

## Date

2026-07-01

## Operator

Brian + claude-session-0490

## Goal

Close the **pre-existing launch-safety hole** SESSION_0484 named: the onboarding wizard's `setPassportRank`
minted an **`UNVERIFIED` `RankAward`** that still surfaced as the member's rank (the trust badge reads
`node.isVerified`, not the award). Rework it to file a **pending `RANK_PROMOTION` claim** (feeding V2→V3)
instead — a self-declared belt is never a displaying award until an instructor approves it. This is the ONE
on-`main` piece of Slice V4; the rest (belt-CRUD rework, belt cards) is held Slice 3/4 and lands at the belt-PR rebase.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Parent: `docs/sprints/SESSION_0489.md` (Slice V3 — `finalizeRankPromotion`, on `main`).
- Scope finding (operator-ratified): V4's belt-CRUD subject is the **held Slice 3** (not on `main`); only
  `setPassportRank` + its onboarding wizard are on `main`. Operator chose "fix the setPassportRank hole now."

### Branch and worktree

- Branch: `session-0490-belt-verify-v4` (off `main` @ `63acebeb`; rebased onto `bc61b727` — a concurrent
  session's push — during the session, clean).
- Worktree: `/Users/brianscott/dev/ronin-0477`.
- Status at bow-in: clean.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None new (reworks an existing member action + its wizard) |
| Extension or replacement | Replacement — the wizard's award-minting seam becomes a pending-claim seam (B1) |
| Why justified | Closes the display-leak hole: a self-declared belt must be verified before it shows as awarded rank |
| Risk if bypassed | The pre-existing hole stays open (self-declared belt renders as the member's rank) |

## Cody pre-flight

- **Reuse-first:** the V2 core `submitRankPromotionClaim` (own-only, above-ceiling, one-open) IS the new seam;
  `setPassportRank` becomes a thin adapter. `Brand.BBL` (single-brand; `userActionClient` carries no brand).
- **FAILED_STEPS:** FS-0027 — `bun run test <file>`; the existing safe-action harness (`installSafeActionMocks`).

## Petey plan

### Tasks

#### SESSION_0490_TASK_01 — setPassportRank → pending RANK_PROMOTION claim + wizard UX + test

- **Agent:** Cody (inline)
- **What:** `setPassportRank` files a pending claim via `submitRankPromotionClaim` (no `UNVERIFIED` award);
  wizard shows "pending verification"; rewrite the safe-action test for the new behavior.
- **Done means:** onboarding declares a belt as a pending claim; no award minted; test green; gates green.
- **Depends on:** V2 (submit core), V3 (finalize) — both on `main`.

### Scope guard

- **In:** the `setPassportRank` rework + wizard UX + test. **Out:** the held belt-CRUD/cards (belt-PR rebase),
  V5 (queue UI), V6 (proof).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0490_TASK_01 | landed | `setPassportRank` → pending `RANK_PROMOTION` claim; wizard pending-UX; test rewritten (3 pass). All gates green. |

## What landed

- **`setPassportRank`** (`server/web/onboarding/actions.ts`) — now a thin adapter over the V2 core
  `submitRankPromotionClaim`: files a **pending `RANK_PROMOTION` claim** (promoter/school/date → the reviewer's
  `claimantNote`), **no `RankAward` minted**. Returns `{ claimId, status: "pending" }`.
- **`profile-enhancement-wizard.tsx`** — success toast now "Belt submitted — pending verification by your
  instructor"; surfaces the core's friendly errors (already-pending / not-a-promotion).
- **Rewrote the safe-action test** — asserts a PENDING claim + **no award** + the one-open rejection (3 pass).

## Decisions resolved

- **The wizard doesn't consume the old award object** (only checks `serverError`), so the return-shape change
  (`award` → `{ claimId, status }`) is safe — only the success copy changed.
- **This is the launch-safety hole SESSION_0484 flagged** ("setPassportRank pre-existing + ungated"), now closed
  on `main`: no code path mints a self-declared `UNVERIFIED` award; declarations route to the verification queue.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/onboarding/actions.ts` | `setPassportRank` → pending `RANK_PROMOTION` claim (was: `UNVERIFIED` award upsert) |
| `apps/web/components/web/onboarding/profile-enhancement-wizard.tsx` | pending-aware success toast + surface server errors |
| `apps/web/server/web/onboarding/actions.safe-action.test.ts` | rewritten for the pending-claim behavior |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run test actions.safe-action.test.ts` | ✅ **3 pass / 0 fail** |
| `bun run typecheck` | ✅ 0 errors (after `bun install` synced `remark-gfm` from the rebased main) |
| `bun run lint:check` / `format:check` | ✅ 0 errors / clean |
| `bun run build` (`next build`) | ✅ green (client wizard compiles) |
| `bun run wiki:lint` | ✅ 0 errors |

## Open decisions / blockers

- **Rebase env gotcha (recorded):** rebasing onto a concurrent session's main pulled in `components/web/markdown.tsx`
  (imports `remark-gfm`, added to `package.json` by that session) — my worktree's `node_modules` predated it, so
  `tsc` failed until `bun install`. **After any rebase that touches `package.json`/`bun.lock`, re-run `bun install`.**
- **Belt-journey member UI still held** — a member can now declare a belt (→ pending claim) via the onboarding
  wizard, but the full belt-journey cards + the "request promotion" surface are the held Slice 3/4 (belt-PR rebase).

## Next session

### Goal

**Belt-PR REBASE — land held #178–181 on the verification spine, then V5 + V6 → unhold.** The verification spine
(V1 schema → V2 submit → V3 finalize → V4 onboarding) is on `main` but UI-less. The member-facing belt journey
(`RankMilestone` + belt CRUD + `BeltEditCard` + the "Belts" tab) is the held epic Slices 2–5 (PRs #178–181, on
`auto/session-0479/0480/0481`). Bring them onto the new `main` and **rework them to B1** so they consume the spine
instead of minting `UNVERIFIED` awards. This is the workstream that makes the subsystem usable + unholds the PRs.

### First task (dispatch-ready prompt block)

```
DISPATCH SETUP: from /Users/brianscott/dev/ronin-dojo-app run
`git fetch origin && git worktree add -b session-NNNN-belt-rebase ../ronin-NNNN origin/main`,
then cd ../ronin-NNNN and /worktree-setup (bun install → copy .env → prisma generate).
⚠ After ANY rebase that touches package.json/bun.lock, re-run `bun install` (a concurrent
session added remark-gfm; stale node_modules false-fails tsc). Shared index docs append-only;
on push reject → pull --rebase → retry. Local prodsnap DB is SHARED across worktrees — hand-author
migrations + verify via `migrate diff` shadow-replay; NEVER `migrate dev` (it wants a reset).

/bow-in. READ FIRST: docs/petey-plan-0477-belt-journey-crm-epic.md (the "Belt Verification Subsystem"
block + "Reworks to the held slices"), ADR 0035 Amendment 1, [[belt-verification-subsystem-b1-model]],
and SESSION_0487–0490 (the spine, on main). The design is LOCKED (B1 · A1 · C-implied · soft-gate).

REBASE + REWORK, in order (each a reviewed PR; per-slice gate before commit):
1. Rebase `auto/session-0479` (RankMilestone model + `MediaAttachment.rankMilestoneId` + migration)
   onto `main`. The `add_rank_milestone` migration is additive + independent of V1's
   `add_passport_claim_type` — no conflict; keep both. `prisma validate` + shadow-replay diff.
2. Rebase Slice 3 belt CRUD (`upsertBeltMilestone`/`updateRankAwardFact`/the belt award-ensure) and
   REWORK to B1: the enrichment award-ensure mints a **VERIFIED-by-implication** award ONLY when
   `rank.sortOrder ≤ verified ceiling`; **above-ceiling throws → the UI routes to `promotion.submit`**
   (the V2 oRPC on main). DELETE any UNVERIFIED-award creation. Fact-edit rule: date/promoter/school
   editable on self-added backfill awards; read-only on IMPORTED / promotion-minted awards.
3. Rebase Slice 4 (`BeltEditCard`/`BeltJourneyGrid`): the above-ceiling card becomes a
   **"Locked — request promotion"** CTA that calls `promotion.submit` (with the cert/instructor photo
   soft-gate), NOT an editable card that mints an award.
4. Wire `PassportClaimEvidence → RankMilestone` media in `finalizeRankPromotion`
   (`server/admin/lineage/claim-finalize.ts`) — now that `RankMilestone` is on main (deferred at V3,
   SESSION_0489). On approve, materialize the claim's certificate/instructor photos onto the minted
   award's milestone.
5. Rebase Slice 5 (mount the "Belts" tab on `/app/profile`).

THEN:
6. **Slice V5** — surface `RANK_PROMOTION` claims in `/app/claims` (extend the queue query + review UI:
   show the asserted belt swatch + evidence; wire Approve/Deny/Needs-info to `applyPassportClaimReview`,
   which already branches to `finalizeRankPromotion`). Reuse the `claim.review` resource grant (instructor)
   + `claims.manage` (admin). Notify the member on decision.
7. **Slice V6 (Doug proof gate — the bar that unholds #178–181):** Playwright — a self-declared belt
   NEVER renders as verified; promotion end-to-end (submit → queue → RBAC-instructor approve → VERIFIED
   award + milestone media + ceiling rises); ZERO regression to the awarded-truth rank display (0474/0475),
   NO per-belt pill (ADR 0035 §5 reaffirmed, no double-badge); RBAC scope enforced. On green, finalize
   ADR 0035 Amendment 1 to `accepted` + mirror its terms into `ubiquitous-language.md`.

Also carry from SESSION_0484 during the rebase: country round-trip data-loss fix, `Hint`→`Note`,
first-run empty state; flywheel/CRM hardening (partial-unique index on normalized school name, atomic
`demandCount`, scope fuzzy match to placeholder orgs); `/app/leads-pipeline` nav link.

BOUNDARIES: explicit per-push authorization; ../ronin-dojo-monorepo READ-ONLY; schema PRs human-reviewed.
```

**Spine reference (already on `main`, consume — do not rebuild):** `submitRankPromotionClaim` +
`promotion.submit` oRPC (V2) · `finalizeRankPromotion` + the `applyPassportClaimReview` type-branch (V3) ·
`setPassportRank` → pending claim (V4) · `PassportClaimType {IDENTITY, RANK_PROMOTION}` (V1).

## Review log

### SESSION_0490_REVIEW_01 — self-review

- **Reviewed:** SESSION_0490_TASK_01.
- **Verdict:** The smallest change that closes the actual pre-existing hole — `setPassportRank` becomes a thin
  adapter over the already-tested V2 core, so no new logic, just routing + a UX-copy change. No other caller, so
  the blast radius is one action + one wizard. Clean.
- **Follow-up:** the belt-PR rebase is the next (larger) workstream.

## Hostile close review

- **Giddy (architecture):** pass — reuses the V2 core (no duplication); the onboarding seam now routes through
  the one verification path; return-shape change is safe (sole caller checks only `serverError`).
- **Doug (verification honesty):** pass — 3 tests prove no award is minted + the pending claim + one-open; the
  `remark-gfm` typecheck blip was a rebase-deps artifact (fixed by `bun install`), recorded honestly; `next build` green.
- **Desi:** pass — the wizard now honestly tells the member their belt is pending (was: silent immediate "set").
- **Kaizen aggregate:** 8.5/10 — surgical hole-fix; −1.5 pending the full member belt UI (held) + e2e (V6).

## ADR / ubiquitous-language check

- **ADR update: not required** — implements ADR 0035 Amendment 1 (self-declared belt = pending claim, never a
  displaying award). No new decision.
- **Ubiquitous language:** none new.

## Reflections

- **The "hole" was one upsert.** SESSION_0484 named `setPassportRank` as a launch blocker; the fix is a
  ~20-line adapter swap (award-upsert → V2 core call) because V2/V3 already exist. The spine-first order paid off:
  by the time I reached the hole, the machinery to close it correctly was already built + tested.
- **Rebase-then-typecheck needs a `bun install` in between.** A concurrent session's new dependency (`remark-gfm`)
  made `tsc` fail on a file I never touched — a pure stale-`node_modules` artifact of rebasing onto a moved main.
  Recorded as an env note; worth folding into the worktree/rebase runbook.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0490 frontmatter current; code files (no JETTY). |
| Backlinks/index sweep | wiki index row added for SESSION_0490. |
| Wiki lint | `wiki:lint` → 0 errors, 16 pre-existing warnings. |
| Kaizen reflection | yes — `## Reflections` present. |
| Hostile close review | self-assessed; Giddy/Doug/Desi pass. |
| Code-quality gate (Class-A) | thin adapter over the V2 core — no Class-A new module. |
| Runtime verification (Doug) | 3 safe-action tests green; wizard compiles (`next build`). |
| Review & Recommend | yes — Next session = belt-PR rebase. |
| Memory sweep | [[belt-verification-subsystem-b1-model]] updated (V4-partial done); rebase-deps note in [[parallel-session-shared-db-migrate-dev-reset-trap]] lane. |
| Next session unblock check | unblocked — belt-PR rebase is the next workstream (larger; own session). |
| Git hygiene | branch `session-0490-belt-verify-v4`; single commit staged; **push held for explicit operator "go"**. |
| Graphify update | skipped — worktree (0 nodes). |