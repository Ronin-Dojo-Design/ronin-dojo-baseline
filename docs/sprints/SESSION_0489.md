---
title: "SESSION 0489 — Belt-verification Slice V3: finalizeRankPromotion (approve → mint VERIFIED award)"
slug: session-0489
type: session--implement
status: closed
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0489
sprint: S49
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/sprints/SESSION_0488.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0489 — Belt-verification Slice V3 (finalize the promotion → VERIFIED award)

## Date

2026-07-01

## Operator

Brian + claude-session-0489

## Goal

Execute **Slice V3** of `petey-plan-0477`: the approve side of a belt promotion. Branch the claim-approval on
`type` so a `RANK_PROMOTION` mints the asserted belt as a **VERIFIED `RankAward`** (the moment a self-declared
belt becomes awarded truth) and verifies the member if their node is still unverified — WITHOUT touching the
live identity-claim path. This is the launch-safety-critical half of the subsystem.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Parent: `docs/sprints/SESSION_0488.md` (Slice V2 — `submitRankPromotionClaim`, on `main`).
- Spec: `petey-plan-0477` Slice V3 + ADR 0035 Amendment 1 + [[belt-verification-subsystem-b1-model]].

### Branch and worktree

- Branch: `session-0489-belt-verify-v3` (off `main` @ `4b86d829`, which includes V1+V2)
- Worktree: `/Users/brianscott/dev/ronin-0477` (bootstrapped SESSION_0487)
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None new (server action + finalize over ADR 0036 claim machinery) |
| Extension or replacement | Extension — a `type` branch on the existing approve path; identity path untouched |
| Why justified | A promotion verifies a belt, not an identity — a separate, minimal finalize is safer than overloading `finalizePassportClaim` |
| Risk if bypassed | Regressing the live identity-claim path (mitigated: identity path wrapped in `else`, 21 regression tests green) |

## Cody pre-flight

### Pre-flight: Slice V3 finalize branch

- **Reuse-first:** `mintAssertedRankAward` (already VERIFIED + idempotent) is the whole award-minting step.
- **Safety design:** did NOT branch `finalizePassportClaim` internally — its `CLAIMANT_HAS_NODE` guard +
  identity-attach + Elite comp are all wrong for an owned-passport promotion. Routed at the CALLER
  (`applyPassportClaimReview`) with the identity path wrapped verbatim in an `else`.
- **FAILED_STEPS:** FS-0027 — `bun run test <file>` (`--parallel=1`); SOP §5d rolled-back-tx for the tx-shaped helper.

## Petey plan

### Goal

Add `finalizeRankPromotion`, branch the approve action, prove both the new path and zero identity regression.

### Tasks

#### SESSION_0489_TASK_01 — `finalizeRankPromotion` + branch `applyPassportClaimReview`

- **Agent:** Cody (inline)
- **What:** new `finalizeRankPromotion(tx, {claim, actorUserId})` (mint VERIFIED award + conditional node
  verify); branch the approve path on `claim.type`; SOP §5d tests + identity regression.
- **Done means:** promotion approval mints VERIFIED award + flips an unverified node; identity path green.
- **Depends on:** V1 (`type`, on main), V2 (submit, on main).

### Scope guard

- **In:** the finalize branch + node-verify + tests. **Out:** V4 (belt-CRUD rework), V5 (queue UI), V6 (proof).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0489_TASK_01 | landed | `finalizeRankPromotion` + `applyPassportClaimReview` type-branch + 4 §5d tests; 21 identity-regression tests green. All gates green. |

## What landed

- **`finalizeRankPromotion(tx, {claim, actorUserId})`** (`server/admin/lineage/claim-finalize.ts`) — mints the
  asserted belt as a **VERIFIED** `RankAward` (`mintAssertedRankAward`, idempotent) and, if the member's node is
  still unverified, flips `isVerified` (approving a first promotion verifies the person — the SESSION_0474
  on-ramp; a verified founder is a no-op). `LineageNode.isVerified` stays the ONE per-member trust flag.
- **Branched `applyPassportClaimReview`** on `claim.type`: `RANK_PROMOTION` → `finalizeRankPromotion` (no
  identity attach, no comp, no sibling-cancel); everything else → the existing `finalizePassportClaim`
  **verbatim** (wrapped in `else`). Added `type` to the claim select + the import.
- **4 §5d rolled-back-tx tests** (mint VERIFIED + verify node · already-verified node no-op · idempotent ·
  no-node still mints).

## Decisions resolved

- **Route at the caller, not inside `finalizePassportClaim`.** Its guards (`CLAIMANT_HAS_NODE`), identity attach
  (delete signup Passport + `attachAccount`), NODE_EDITOR grant, and Elite comp are all correct for an UNCLAIMED
  placeholder and all wrong for a promotion on an OWNED Passport. A separate minimal finalize + a caller branch
  keeps the live identity path byte-for-byte unchanged (zero regression risk — proven by 21 tests).
- **No comp on a promotion (deliberate deviation from the plan's "idempotent comp" line).** Granting BBL Elite
  comp for a routine belt promotion would be a business error — a member's entitlement comes from their tier, not
  their belt. The lineage-claim comp is a deliberate "claim your identity" incentive; a promotion is not.
- **Node-verify uses `isVerified` only** (the ONE trust flag per [[bbl-verification-claim-display-model]]) — not
  a per-belt axis (ADR 0035 §5 reaffirmed; the LR-0008 double-badge stays impossible).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/admin/lineage/claim-finalize.ts` | **+`finalizeRankPromotion`** (+ input/result types); `finalizePassportClaim` unchanged |
| `apps/web/server/admin/claims/passport-claim-review-actions.ts` | branch the approve path on `claim.type`; `+type` in select + import |
| `apps/web/server/admin/lineage/finalize-rank-promotion.test.ts` | **NEW** — 4 §5d tests |
| `docs/sprints/SESSION_0489.md` | **NEW** — this session |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run test finalize-rank-promotion.test.ts` | ✅ **4 pass / 0 fail** |
| `bun run test review-passport-claim + claim-finalize + claim-review-actions` (identity regression) | ✅ **21 pass / 0 fail** |
| `bun run typecheck` | ✅ 0 errors |
| `bun run lint:check` / `format:check` | ✅ 0 errors / clean (1718 files) |
| `bun run build` (`next build`) | ✅ green |
| `bun run wiki:lint` | ✅ 0 errors (16 pre-existing warnings) |

## Open decisions / blockers

- **Deferred to the belt-PR rebase (RankMilestone not on `main`):** materialize the claim's `PassportClaimEvidence`
  (certificate/instructor photos) into `RankMilestone` media on approval. `RankMilestone` is the held Slice-2
  model; the evidence stays on the claim record until it lands. A clear seam — wire it when the belt PRs rebase.
- **No promotion-approved email yet** — a promotion claim has no `nodeId`, so the node-keyed approval email
  doesn't fire; a promotion-specific notice is a follow-up (V5-adjacent), not V3.
- **No UI caller yet** — `finalizeRankPromotion` runs when a `RANK_PROMOTION` claim is approved via
  `reviewPassportClaim`; the `/app/claims` queue surfaces promotions in **Slice V5**.

## Next session

### Goal

Execute **Slice V4** — rework the held belt CRUD to B1 (gate `setPassportRank` / the belt-`RankAward`-ensure to
backfill ≤ verified ceiling minting VERIFIED-by-implication; above-ceiling → the V2 promotion claim; belt card
"Locked → request promotion"). Then **V5** surfaces `RANK_PROMOTION` in `/app/claims`.

### First task

Read the Slice V4 spec + the held belt-CRUD (epic Slice 3, on `auto/session-0480`) + `setPassportRank`
(onboarding/actions.ts:19), then gate the self-service award-ensure path to backfill-only and route above-ceiling
to `promotion.submit`.

## Review log

### SESSION_0489_REVIEW_01 — self-review

- **Reviewed:** SESSION_0489_TASK_01.
- **Verdict:** The safety-critical call — routing at the caller rather than branching the live orchestrator —
  keeps the identity path provably unchanged (21 green). The promotion finalize does exactly two things (mint +
  verify), refusing the identity/comp machinery that would misfire on an owned passport. Two deferrals
  (milestone, comp) are documented with rationale, not silent. Clean.
- **Follow-up:** wire evidence→milestone at the belt-PR rebase; V4 next.

## Hostile close review

- **Giddy (architecture):** pass — separate finalize + caller branch (SRP); live identity path untouched;
  reuses `mintAssertedRankAward`; no god-function.
- **Doug (verification honesty):** pass — new path (4) + identity regression (21) green; `next build` green;
  the comp/milestone deferrals are stated, not hidden; node-verify guarded (only false→true, only if a node exists).
- **Desi:** N/A (no UI).
- **Kaizen aggregate:** 8.5/10 — surgical, well-tested, honest about deferrals; −1.5 pending the evidence→milestone
  wiring (blocked on RankMilestone) + the end-to-end e2e at V6.

## ADR / ubiquitous-language check

- **ADR update: not required.** V3 implements ADR 0035 Amendment 1 decision 1 (approve → mint VERIFIED award).
  The **no-comp-on-promotion** call is a build-level refinement; noted here + in the plan, folded into Amendment 1
  at finalize (V6) if the operator wants it ADR-level.
- **Ubiquitous language:** no new terms beyond Amendment 1.

## Reflections

- **The safest way to extend a hot path is often to not touch it.** `finalizePassportClaim` is the live
  identity-claim path (Tony Hua's real approval). Branching *inside* it would have put the promotion logic one
  typo away from the identity path. Routing at the caller + a separate finalize made "did I regress identity?"
  answerable by re-running the existing 21 tests — which passed unchanged.
- **The plan said "idempotent comp"; the build said "no comp."** Following the letter would have handed every
  promoted member free Elite comp. The grill locked the *shape* (B1, extend the queue); the build still has to
  catch a business-logic mistake the plan's shorthand implied. Flagged, not silently obeyed or silently dropped.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0489 frontmatter current; code files (no JETTY). |
| Backlinks/index sweep | wiki index row added for SESSION_0489. |
| Wiki lint | `wiki:lint` → 0 errors, 16 pre-existing warnings. |
| Kaizen reflection | yes — `## Reflections` present. |
| Hostile close review | self-assessed; Giddy/Doug pass, Desi N/A. |
| Code-quality gate (Class-A) | finalize branch self-reviewed; formal `/code-quality` at the V-block close (V6). |
| Runtime verification (Doug) | 4 new + 21 regression integration tests green; UI surface = V5. |
| Review & Recommend | yes — Next session = Slice V4. |
| Memory sweep | [[belt-verification-subsystem-b1-model]] updated with V3 + the no-comp/defer-milestone notes. |
| Next session unblock check | unblocked — V4 cold-ready. |
| Git hygiene | branch `session-0489-belt-verify-v3`; single commit staged; **push held for explicit operator "go"**. |
| Graphify update | skipped — worktree (0 nodes); canonical checkout picks up on next `graphify update`. |