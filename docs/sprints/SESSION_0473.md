---
title: "SESSION 0473 — S1: BBL tier reprice + consolidate (parallel track A)"
slug: session-0473
type: session--implement
status: in-progress
created: 2026-06-29
updated: 2026-06-29
last_agent: claude-session-0472
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0472.md
  - docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0473 — S1: BBL tier reprice + consolidate (parallel track A)

> **PRE-STAGED at SESSION_0472 close.** This is **build slice S1** of the ratified BBL membership epic
> (SESSION_0472 build-sequencing block). It is the **head of parallel track A** and can run **concurrently
> with SESSION_0474 (S2)** in its own worktree — the two touch disjoint files. **Live Stripe is fenced:**
> rehearse every product/price change off-prod (test-mode, BBL account) and re-confirm 0 live payers on the
> Stripe dashboard **before** any live edit. Never `cs_live` unrehearsed.

## Date

2026-06-29 (pre-staged; executes next)

## Operator

Brian + claude-session-0473

## Goal

Reprice/relabel the BBL lineage `PricingPlan`s to the ratified tier model — **Premium $35/yr, Elite $65/yr +
a new $45/yr black-belt-rate plan, annual-only** (drop monthly) — seed the missing `LINEAGE_LEGEND`
entitlement row, add the black-belt **eligibility** check on the $45 plan, and **deprecate the
`SubscriptionTier` ladder for gating** (entitlements are the single gate). Lowest-risk slice; unblocks the
customer tiers and the Hub shell (S6). No payer migration (prodsnap = 0 paid subscribers; re-confirm live).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0472.md` (the ratifying grill — read **D472-1,2,3,6,8** + the
  **Build sequencing** block; they are the spec for this slice).
- Carryover: SESSION_0472 ratified the tier model (4 tiers = 4 entitlement keys, annual-only,
  rank-as-price-discount) with **0 code committed**. This slice implements the reprice/consolidate.

### Branch and worktree

- Branch: `session-0473-tier-reprice` (own worktree — parallel-dispatch; run `/worktree-setup` first if fresh)
- Worktree: `../ronin-0473` (or main if run solo)
- Status at bow-in: TBD (verify clean at pickup)

## Petey plan

### Goal

Land the ratified tier reprice + cruft consolidation, rehearsed off-prod, with the single-entitlement gate intact.

### Tasks

#### SESSION_0473_TASK_01 — Seed the missing `LINEAGE_LEGEND` entitlement

- **Agent:** Cody
- **What:** Add the `LINEAGE_LEGEND` `Entitlement` row (BBL) — prodsnap has only `LINEAGE_PREMIUM` + `LINEAGE_ELITE`, so comping Legend (`grantUserComp(tier: LEGEND)`) currently fails. Confirm the 3-key set + the comp path.
- **Done means:** `LINEAGE_LEGEND` exists; `grantUserComp` with `tier: LEGEND` grants all 3 keys; test green.
- **Depends on:** nothing.

#### SESSION_0473_TASK_02 — Reprice/relabel PricingPlans, annual-only, archive old prices

- **Agent:** Cody
- **What:** Edit `scripts/seed-bbl-lineage-pricing.ts` — Premium **$35/yr** (`LINEAGE_PREMIUM`), Elite **$65/yr**
  (`LINEAGE_ELITE`), add a new **$45/yr "Elite — Black Belt rate"** plan (same `LINEAGE_ELITE` grant), **drop
  the monthly plans**. Customer labels: Premium Member / Elite Member (keep internal keys). Archive the old
  $59.99/$299 Stripe prices.
- **Steps:** rehearse in **Stripe test-mode (BBL account)** first → confirm grant+revoke → confirm 0 live payers
  on the Stripe dashboard → create the live prices → run the seed with the new `price_…` env vars.
- **Done means:** `/lineage/join` (BBL) lists **3 annual plans**; `findLineageMembershipPlans` returns them;
  test-mode rehearsal proves grant on checkout + revoke on cancel.
- **Depends on:** TASK_01.

#### SESSION_0473_TASK_03 — Black-belt eligibility check on the $45 plan

- **Agent:** Cody
- **What:** Gate the $45 "Black Belt rate" plan on a verified black belt — reuse `buildBeltProgressions`
  (`lib/lineage/rank-progression.ts`, current rank = highest awarded `RankAward.sortOrder`); a non-black-belt
  sees only the $65 Elite price. Promotion flips eligibility, never auto-bills (opt-in, D472-3).
- **Done means:** a verified BJJ black belt is offered $45; everyone else $65; unit test on the eligibility predicate.
- **Depends on:** TASK_02.

#### SESSION_0473_TASK_04 — Deprecate the `SubscriptionTier` ladder for gating

- **Agent:** Cody
- **What:** Confirm nothing gates on `SubscriptionTier`/`UserBrandSubscription` (audit: 0 gating reads, 0 rows)
  and mark/retire it for gating so it stops reading as a parallel tier source. Entitlement keys stay the SoT.
- **Done means:** no gating path reads `SubscriptionTier`; admin display (if kept) is clearly non-gating.
- **Depends on:** nothing (can run parallel to 01–03).

### Reuse targets (files)

- `apps/web/scripts/seed-bbl-lineage-pricing.ts` — the pricing seed (edit amounts/labels/annual-only/+BB plan)
- `apps/web/lib/entitlements/lineage-comp.ts` — the 3 keys + cumulative helper
- `apps/web/lib/lineage/rank-progression.ts` — `buildBeltProgressions` (the BB eligibility check)
- `apps/web/server/web/billing/lineage-membership.ts` — `findLineageMembershipPlans`
- `docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md` — the operator Stripe-product steps (update amounts)

### Scope guard

- **No live Stripe edit before an off-prod test-mode rehearsal** + a live 0-payer re-confirm. Never `cs_live` unrehearsed.
- Don't add new entitlement keys — reuse `LINEAGE_PREMIUM`/`ELITE`/`LEGEND` (D472-2).
- Don't touch the Instructor Hub (that's S6+); don't build the verification on-ramp (track B / S3–S5).

## Cody pre-flight

<!-- Run cody-preflight before code. Key prior art: the audit in SESSION_0472 D472-6 (what reads what). -->

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0473_TASK_01 | pending | Seed `LINEAGE_LEGEND` entitlement |
| SESSION_0473_TASK_02 | pending | Reprice/relabel plans, annual-only, +$45 BB plan, archive old prices (off-prod first) |
| SESSION_0473_TASK_03 | pending | Black-belt eligibility check on the $45 plan |
| SESSION_0473_TASK_04 | pending | Deprecate `SubscriptionTier` ladder for gating |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

- Needs the operator to create the live BBL-account Stripe prices ($35/$65/$45 annual) and supply the
  `price_…` env vars (per `BBL_STRIPE_PRODUCTS_SPEC.md`) — TASK_02 stages rows + rehearses off-prod until then.

## Next session

### Goal

TBD at bow-out (likely: S6 Hub shell once S1 lands, or continue track B).

### First task

TBD at bow-out.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence
