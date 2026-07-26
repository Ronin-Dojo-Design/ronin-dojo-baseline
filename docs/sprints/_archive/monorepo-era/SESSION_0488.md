---
title: "SESSION 0488 — Belt-verification Slice V2: submitRankPromotionClaim oRPC (gated) + invariant tests"
slug: session-0488
type: session--implement
status: closed
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0488
sprint: S49
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/sprints/SESSION_0487.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0488 — Belt-verification Slice V2 (submit promotion-claim oRPC)

## Date

2026-07-01

## Operator

Brian + claude-session-0488

## Goal

Execute **Slice V2** of the Belt Verification Subsystem block in `docs/petey-plan-0477-belt-journey-crm-epic.md`:
a member-facing oRPC mutation `submitRankPromotionClaim` (own-Passport `authedProcedure`) that creates a
`PassportClaimRequest { type: RANK_PROMOTION, claimedRankId, evidence }`, gated so the claimed rank is **above**
the member's verified belt ceiling, one open promotion per passport, with an optional (soft-gate) photo evidence.
Hard invariant unit tests. No finalize yet (Slice V3 branches `finalizePassportClaim` on `type`).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Parent: `docs/sprints/SESSION_0487.md` — Slice V1 (the `PassportClaimType` discriminant + migration), on `main`.
- Binding spec: `petey-plan-0477` Slice V2 + ADR 0035 Amendment 1 + the [[belt-verification-subsystem-b1-model]]
  memory. Design LOCKED (B1 · A1 · C-implied · soft-gate).

### Branch and worktree

- Branch: `session-0488-belt-verify-v2` (off `main` @ `e9337883`, which includes V1)
- Worktree: `/Users/brianscott/dev/ronin-0477` (bootstrapped SESSION_0487)
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None new (oRPC mutation on an app model; ADR 0024 full-oRPC + ADR 0036 claim) |
| Extension or replacement | Extension — a new member mutation over the existing `PassportClaimRequest` claim queue |
| Why justified | Reuses the `submitPassportClaim` core + claim queue; adds only the promotion-specific guards |
| Risk if bypassed | N/A |

## Cody pre-flight

### Pre-flight: Slice V2 oRPC

- **Reuse-first:** `submitPassportClaim` core (create path) + `authedProcedure` (`server/orpc/procedure.ts`) +
  `pickTopAwardInDiscipline` (ceiling) + the current-user Passport lookup (setPassportRank pattern) +
  `PassportClaimEvidence`. Mapped by an Explore pass (see Task log). No new primitive invented.
- **Lane docs:** `petey-plan-0477` V2, ADR 0035 Amendment 1, ADR 0036, ADR 0024 (oRPC).
- **FAILED_STEPS:** FS-0027 — `bun run test <file>` (`--parallel=1`), never bare multi-file `bun test`.

## Petey plan

### Goal

Ship the gated promotion-claim submit + hard invariant tests. No finalize/UI (V3+).

### Tasks

#### SESSION_0488_TASK_01 — `submitRankPromotionClaim` oRPC

- **Agent:** Cody (inline)
- **What:** own-Passport `authedProcedure`; create `PassportClaimRequest{ type: RANK_PROMOTION, ... }`; guards:
  own · `claimedRank.sortOrder > verified ceiling` · one open RANK_PROMOTION per passport · photo soft-gate.
- **Done means:** procedure + Zod in/out + rateLimit meta + revalidate; passing invariant tests.
- **Depends on:** V1 (`type` column — on `main`).

### Scope guard

- **In:** the submit mutation + guards + tests. **Out:** V3 finalize branch, V4 CRUD rework, V5 queue UI, V6 proof.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0488_TASK_01 | landed | `submitRankPromotionClaim` core + `promotion.submit` oRPC (first authed oRPC mutation) + 6 invariant tests. All gates green. |

## What landed

- **Core** `server/web/claims/submit-rank-promotion-claim.ts` — `submitRankPromotionClaim(db, input)`: derives
  the caller's OWN Passport from `claimantUserId` (own-only by construction — no `passportId` input), computes
  the **discipline-scoped verified ceiling** (`pickTopAwardInDiscipline`), and guards **above-ceiling only**
  (at/below → `NOT_A_PROMOTION`, routed to backfill), **one open promotion** (`PENDING`/`NEEDS_INFO`), then
  creates a `PassportClaimRequest{ type: RANK_PROMOTION, claimedRankId, evidence }`. Soft-gate photo (optional).
- **oRPC** `server/promotion/router.ts` — `promotion.submit`, the repo's **first authed oRPC mutation**
  (`authedProcedure`, `rateLimit 10/hr`, Zod in/out, `revalidate(["/app/profile"])`); thin pass-through to the
  core with `context.user.id` + `context.brand`. Registered in `server/router.ts`.
- **6 invariant tests** (`submit-rank-promotion-claim.test.ts`, real DB + seeded BJJ ladder): above-ceiling +
  evidence ✓ · at-ceiling reject ✓ · below-ceiling reject ✓ · second-open reject ✓ · soft-gate no-photo (after
  DENIED) ✓ · no-Passport reject ✓.

## Decisions resolved

- **Sibling core, not a branch of `submitPassportClaim`.** The identity core's guard is `passport.userId != null
  → ALREADY_CLAIMED` — inverted for a promotion (always on an owned passport). A dedicated
  `submitRankPromotionClaim` mirrors the shape (evidence pattern, error object, resolve-guard-create) without
  muddying the identity path. Still A1 in spirit: same table/`type`, same queue, same finalize family (V3).
- **oRPC (not next-safe-action)** per plan Locked-decision 8 + ADR 0024 — this starts the claim-family oRPC
  migration; `promotion.submit` is the first authed mutation on the pipeline.
- **Ceiling default `NEGATIVE_INFINITY`** when the member has no award in the discipline → a first-belt claim is
  a valid promotion (a brand-new member's rank goes through verification, per B1).
- **Type-at-call-site** for `pickTopAwardInDiscipline` — the `db: any` convention makes the generic fall back to
  its constraint (drops `sortOrder`); annotating the awards array fixes it without changing the `Db` convention.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/claims/submit-rank-promotion-claim.ts` | **NEW** — the gated promotion-claim core |
| `apps/web/server/promotion/router.ts` | **NEW** — `promotion.submit` oRPC (first authed mutation) |
| `apps/web/server/router.ts` | register `promotion` in `appRouter` |
| `apps/web/server/web/claims/submit-rank-promotion-claim.test.ts` | **NEW** — 6 invariant tests |
| `docs/sprints/SESSION_0488.md` | **NEW** — this session |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run test submit-rank-promotion-claim.test.ts` | ✅ **6 pass / 0 fail** (13 asserts) |
| `bun run typecheck` | ✅ 0 errors |
| `bun run lint:check` (oxlint) | ✅ 0 errors (pre-existing warnings only, untouched files) |
| `bun run format:check` (oxfmt) | ✅ clean (1717 files) |
| `bun run build` (`next build`) | ✅ green (reached post-build sitemap) |
| `bun run wiki:lint` | ✅ 0 errors (16 pre-existing warnings) |
| V1 migration applied to local DB | ✅ `migrate deploy` (forward-only, no reset) — the `type` column exists locally |

## Open decisions / blockers

- **None blocking V3.** The oRPC `promotion.submit` is wired but has **no UI caller yet** (a member-facing
  "request promotion" button lands in Slice V4/V5); reachable via the RPC client. The finalize side
  (approve → mint VERIFIED award + evidence→milestone) is **Slice V3** — the submit is inert as a queue-filler
  until then, which is the correct slice order.

## Next session

### Goal

Execute **Slice V3** — branch `finalizePassportClaim` on `type`: for `RANK_PROMOTION`, assert the passport is
already owned (no account-attach), `mintAssertedRankAward(claimedRankId)` → VERIFIED, materialize
`PassportClaimEvidence` → `RankMilestone` media, conditional `node.isVerified` flip for a first-claim, idempotent
comp. Then Slice V5 surfaces both in `/app/claims`.

### First task

Read `server/admin/lineage/claim-finalize.ts` (`finalizePassportClaim` + `mintAssertedRankAward`) + the Slice V3
spec, then branch finalize on `claim.type` with tests for both branches (promotion mints only the award +
milestone media; an already-verified member's promotion does not re-attach/re-comp).

## Review log

### SESSION_0488_REVIEW_01 — self-review

- **Reviewed:** SESSION_0488_TASK_01.
- **Verdict:** Reuse-first (mirrors `submitPassportClaim` + `pickTopAwardInDiscipline`, no new primitive); the
  own-only-by-construction derivation + the above-ceiling guard make self-promotion structurally impossible
  server-side (not just UI), which is the security crux. Tests cover every guard. Clean oRPC wiring following the
  lineage-router pattern.
- **Score:** solid; runtime proof rides with V5's UI + V6's Playwright.
- **Follow-up:** V3 finalize branch is the next dependency.

## Hostile close review

- **Giddy (architecture):** pass — sibling core (SRP; identity invariants untouched), first authed oRPC mutation
  follows the established `server/<entity>/router.ts` + `appRouter` pattern; no god-function.
- **Doug (verification honesty):** pass — 6 real-DB tests green; `next build` green; guards enforced server-side
  (own-only derivation + ceiling), not UI-only. Migration applied forward-only (no reset).
- **Desi:** N/A (no UI this slice — the "request promotion" surface is V4/V5).
- **Kaizen aggregate:** 8.5/10 — clean, tested, correctly scoped; −1.5 pending the UI/e2e proof at V5/V6.

## ADR / ubiquitous-language check

- **ADR update: not required.** V2 implements ADR 0035 Amendment 1 decision 1 (the `RANK_PROMOTION` claim) — no
  new decision. Amendment 1 finalizes to `accepted` at V6.
- **Ubiquitous language:** "Rank promotion (belt-promotion claim)" already defined in Amendment 1; mirror into
  `ubiquitous-language.md` at finalize.

## Reflections

- **`db: any` costs a real type-safety hole at generic boundaries.** The `type Db = any` convention (copied from
  the claim-finalize family) silently made `pickTopAwardInDiscipline`'s generic fall back to its constraint,
  dropping `sortOrder` — caught only by `tsc`, not the tests. Typing the array at the call site is the local fix;
  the broader lesson is that `any`-typed `db` erases inference for typed helpers downstream.
- **The inverted guard is the whole design in miniature.** `submitPassportClaim` rejects an owned passport;
  a promotion *requires* one. That single inversion is why B1 needs a `type` discriminant + a sibling core +
  (V3) a branched finalize — the identity claim and the promotion claim are the same record with opposite
  ownership preconditions.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0488 frontmatter current; code files (no JETTY). |
| Backlinks/index sweep | wiki index row added for SESSION_0488. |
| Wiki lint | `wiki:lint` → 0 errors, 16 pre-existing warnings. |
| Kaizen reflection | yes — `## Reflections` present. |
| Hostile close review | self-assessed; Giddy/Doug pass, Desi N/A. |
| Code-quality gate (Class-A) | Custom oRPC + gated core — self-reviewed above; formal `/code-quality` deferred to the V-block close (V6). |
| Runtime verification (Doug) | 6 real-DB integration tests green; no UI surface yet (V5). |
| Review & Recommend | yes — Next session = Slice V3. |
| Memory sweep | no new project-scoped fact beyond [[belt-verification-subsystem-b1-model]] (updated with V2 progress at bow-out). |
| Next session unblock check | unblocked — V3 (finalize branch) is cold-ready. |
| Git hygiene | branch `session-0488-belt-verify-v2`; single commit staged; **push held for explicit operator "go"**. |
| Graphify update | skipped — worktree (0 nodes); canonical checkout picks up the new files on next `graphify update`. |
