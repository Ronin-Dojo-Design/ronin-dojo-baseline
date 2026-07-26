---
title: "SESSION 0473 — S1: BBL tier reprice + consolidate (parallel track A)"
slug: session-0473
type: session--implement
status: closed
created: 2026-06-29
updated: 2026-06-30
last_agent: claude-session-0474
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
- Worktree: `../ronin-0473` (created off `main` @ `e2704658`; bootstrapped — `.env` copied + `bun install` + `prisma generate`, exit 0)
- Status at bow-in: clean ✅ (on `origin/main` HEAD `e2704658`; no rebase needed)
- Read-path executed: SESSION_0472 (D472-1..15 + Build sequencing), `BBL_STRIPE_PRODUCTS_SPEC.md` (**stale** — still old monthly+annual prices), + the 4 reuse files (`seed-bbl-lineage-pricing.ts`, `lineage-comp.ts`, `rank-progression.ts`, `lineage-membership.ts`) + the entitlement seed home (`prisma/seed-baseline-platform.ts`).

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
| SESSION_0473_TASK_01 | done | Seeded `LINEAGE_LEGEND` (base catalog + BBL pricing seed self-heals prod); comp-path test green (5 pass) |
| SESSION_0473_TASK_02 | in-progress | Seed reprice **code** next (3 annual plans + archival sweep + BB-rate marker); **live price creation gated on the Stripe account fix** |
| SESSION_0473_TASK_03 | predicate done | `isBlackBeltRateEligible` + 8 unit tests green; join-page filter wiring bundled into TASK_02 (needs the $45 plan) |
| SESSION_0473_TASK_04 | done | Audit: 0 gating reads of `SubscriptionTier`/`UserBrandSubscription`; schema `///` markers added; drift → bow-out ledger |

## What landed

- **TASK_01** — `LINEAGE_LEGEND` entitlement now seeded in the base catalog (`prisma/seed-baseline-platform.ts`,
  all 4 brands) **and** ensured up-front by the BBL pricing seed (so running it against prod self-heals the
  missing row). New regression test proves `grantUserComp(tier: LEGEND)` grants all 3 cumulative keys (was
  throwing "Entitlement LINEAGE_LEGEND not found").
- **TASK_03 (predicate)** — `isBlackBeltRateEligible(progressions)` in `lib/lineage/rank-progression.ts`:
  reuses `buildBeltProgressions` (awarded = verified), scoped to BJJ, Black/Coral/Red belt = eligible. 8 unit
  tests. The price-side filter wiring lands with TASK_02 (needs the $45 plan row).
- **TASK_04** — audit confirmed `SubscriptionTier`/`UserBrandSubscription` have **0 gating reads** (every gate
  reads `UserEntitlement`); added `///` DEPRECATED-FOR-GATING markers to both schema models. Admin CRUD kept
  as display-only. Drift entry routed at bow-out.

## Decisions resolved

- **Stripe product structure (recommended; confirm at the live "show me" gate):** 2 products (Premium, Elite),
  3 annual prices — the $45 "Black Belt rate" is a **second price on the Elite product** (same `LINEAGE_ELITE`
  grant, BB-eligibility-gated), not a third product.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/seed-baseline-platform.ts` | +`LINEAGE_LEGEND` in the entitlement catalog (TASK_01); header 12→16 |
| `apps/web/scripts/seed-bbl-lineage-pricing.ts` | +`LINEAGE_LEGEND` name + up-front ensure of all 3 BBL entitlements (TASK_01) |
| `apps/web/server/entitlements/comp-grants.test.ts` | +LEGEND comp-path regression test (TASK_01) |
| `apps/web/lib/lineage/rank-progression.ts` | +`isBlackBeltRateEligible` predicate (TASK_03) |
| `apps/web/lib/lineage/rank-progression.test.ts` | +8 eligibility-predicate tests (TASK_03) |
| `apps/web/prisma/schema.prisma` | `///` DEPRECATED-FOR-GATING markers on `SubscriptionTier` + `UserBrandSubscription` (TASK_04) |
| `apps/web/scripts/seed-bbl-lineage-pricing.ts` | reprice → 3 annual plans ($35/$65/$45) + archival sweep + BB-rate `eligibility` marker + header rewrite (TASK_02) |
| `apps/web/server/web/billing/lineage-membership.ts` | +`requiresBlackBelt` read-model field + `filterPlansForBlackBeltEligibility` helper (TASK_03 wiring contract) |
| `apps/web/server/web/billing/lineage-membership.test.ts` | +5 unit tests (marker parse + filter) (TASK_03) |
| `docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md` | full rewrite to the ratified model + CLI-creation steps + account-check warning (TASK_02) |
| `docs/sprints/SESSION_0473.md` | this session log |

## Verification

| Command / smoke | Result |
| --- | --- |
| `stripe config --list` (account check, step 1) | **⛔ WRONG ACCOUNT** — CLI authed to `acct_1T065aPm73j3q757` "Tuff Buffs"; no BBL profile. STOPPED before any creation. |
| `grep` SubscriptionTier/UserBrandSubscription (TASK_04 audit) | 119 refs — mostly admin CRUD (`app/app/subscription-tiers/*`, `app/app/subscriptions/*`); gating-vs-display separation pending. |
| `prisma/seed-baseline-platform.ts` entitlement catalog (TASK_01) | Defines PREMIUM + ELITE for 4 brands; **LINEAGE_LEGEND absent** — confirmed gap (now fixed). |
| `bun run test server/entitlements/comp-grants.test.ts` (TASK_01) | **5 pass / 0 fail** — incl. new LEGEND comp-path regression. |
| `bun run test lib/lineage/rank-progression.test.ts` (TASK_03) | **16 pass / 0 fail** — incl. 8 new eligibility-predicate tests. |
| `comp-grants.ts:107-114` (root cause, TASK_01) | `grantComp` does `entitlement.findUnique(brand_key)` → throws if the row is absent → confirmed LEGEND failure mode. |
| `bun run test server/web/billing/lineage-membership.test.ts` (TASK_03) | **5 pass / 0 fail** — marker parse + eligibility filter. |
| `bun run typecheck` (all edits) | exit 0 (clean). |
| `oxfmt .` / `oxlint --fix .` | formatted; **0 lint errors** (16 warnings all pre-existing in untouched files; reverted 1 stray `--fix` to `claim-callback-url.test.ts`). |
| `bunx prisma validate` | schema valid 🚀 (the `///` markers parse). |
| `bun run wiki:lint` | **0 errors, 16 warnings** (all pre-existing in `SESSION_VIDEO_R001.md` / `petey-plan-0436`; this session introduced none). |
| `seed-bbl-lineage-pricing.ts --dry-run` (TASK_02) | previews **3 annual plans** — Premium $35/[PREMIUM], Elite $65/[PREMIUM,ELITE], Black Belt rate $45/[PREMIUM,ELITE]. |
| `stripe config --list` re-check | still **Tuff Buffs** `acct_1T065aPm73j3q757` — live creation remains blocked. |
| `bun run build` (push-readiness) | **exit 0** — compiled + sitemap gen; catches `"use server"` issues tsc/tests miss (new `lineage-membership.ts` export OK). |

## Open decisions / blockers

- **⛔ STRIPE ACCOUNT GATE (operator action required).** The Stripe CLI's only profile (`[default]`) is authed
  to **"Tuff Buffs"** (`acct_1T065aPm73j3q757`), **NOT BBL and NOT Baseline** — a third portfolio account.
  No other CLI profile is configured; BBL is not set up in the CLI. The BBL live keys are not in any local file
  (`.env`/`.env.prod`) — they live in Vercel prod env, so the BBL account id is operator-held. **STOPPED per the
  operator procedure: no product/price creation (test or live) until the CLI is pointed at the BBL account.**
  Recommended fix: `stripe login --project-name bbl` (named profile, leaves the Tuff Buffs default intact;
  every command then carries `--project-name bbl`).
- **Product structure (recommendation, to confirm at the "show me" gate):** 2 Stripe products (Premium, Elite);
  3 annual prices — Premium **$35/yr**, Elite **$65/yr**, + a second Elite price **$45/yr "Black Belt rate"**
  (same `LINEAGE_ELITE` grant, BB-eligibility-gated). Matches the entitlement model (product≈tier, price=amount).
- Needs the operator to create the live BBL-account Stripe prices ($35/$65/$45 annual) and supply the
  `price_…` env vars (per `BBL_STRIPE_PRODUCTS_SPEC.md`) — TASK_02 stages rows + rehearses off-prod until then.
- **DEFERRED (post-Stripe, this session):** `/lineage/join` page wiring — fetch the viewer's belt progressions,
  call `isBlackBeltRateEligible`, apply `filterPlansForBlackBeltEligibility`. Contract (predicate + read-model
  marker + filter helper) is built + tested; the page edit lands with the seed run so it's browser-verifiable
  against a real $45 row. A guest (no rank) correctly sees Premium + Elite ($65) only.
- **Customer copy is DRAFT** (plan names "Premium Member"/"Elite Member"/"Elite — Black Belt rate" + feature
  bullets in the seed + spec) — operator to confirm/own the marketing voice.

## Next session

### Goal

**No dedicated next session for this track — see SESSION_0474's `Next session` block.** The parallel track B
(**SESSION_0474**) has already run and **shipped to prod** (lineage display-model unification). The next session,
**SESSION_0475**, follows from **SESSION_0474's next-session block**: discipline-scoped rank (BBL = BJJ) +
`selectedRank` removal + the one-SSR-avatar primitive. This S1 lane's only remaining work is the **operator-gated
live Stripe step** (below) — a manual action, not an agent session.

### First task

Operator action (not an agent session): fix the Stripe CLI account (`stripe login --project-name bbl`), create the
live BBL prices ($35/$65/$45 annual; $45 = a second price on the Elite product), supply the `price_…` env vars,
then run the reprice **off-prod first + re-confirm 0 payers** before any live edit (`BBL_STRIPE_PRODUCTS_SPEC.md`).
Then the $45-plan join-page filter wiring (the read-model `filterPlansForBlackBeltEligibility` is staged for it).

## Review log

### SESSION_0473_REVIEW_01 — S1 tier groundwork (parallel track A)

- **Reviewed tasks:** TASK_01 (LINEAGE_LEGEND seed — done), TASK_02 (reprice — code done, live Stripe blocked),
  TASK_03 (BB-rate eligibility — done), TASK_04 (SubscriptionTier deprecation — done).
- **Verdict:** clean, well-fenced groundwork. Code-complete + self-verified (typecheck, comp-grants 5✓,
  rank-progression 16✓, lineage-membership 5✓, build green); rebased clean onto SESSION_0474 (disjoint files),
  re-verified on the merged state (877 unit tests + build green), pushed (`737868ed`). The session correctly
  STOPPED at the live-Stripe gate (CLI authed to the wrong account) rather than guessing — exactly the fence the
  prestage set. No migration (the schema change is comment-only).
- **Score:** 8/10 — solid, safe, fenced. −2 because the lane is incomplete *by design* (TASK_02 live Stripe blocked
  on operator action) — the right call, but the customer-facing reprice isn't actually live yet.

## Hostile close review

- **Giddy:** pass — the single entitlement gate (`UserEntitlement`) is preserved; `SubscriptionTier` correctly
  demoted to display-only with schema markers (SOT-ADR D472-6); reprice via seed/config, not a new ladder. Disjoint
  from 0474; clean rebase.
- **Doug:** pass — gates green on the merged state (typecheck, **877 unit**, build); **no live Stripe touched** (the
  account-gate fence held — STOPPED before any product/price creation); no migration (comment-only schema). Seeds
  don't auto-run on deploy, so the push is data-safe.
- **Kaizen aggregate:** 8/10 — the fence discipline (stop at the wrong-account gate) is the standout.

## ADR / ubiquitous-language check

- **No new ADR** — `SubscriptionTier`/`UserBrandSubscription` deprecation-for-gating is **SOT-ADR D472-6** (already
  ratified); this session implemented it (schema `///` markers + a 0-gating-reads audit). The Stripe product
  structure (2 products / 3 prices; $45 = a second Elite price) is a recommendation in `BBL_STRIPE_PRODUCTS_SPEC.md`,
  to confirm at the live "show me" gate. No new domain terms.

## Reflections

- **Stop at the account gate, don't guess.** The Stripe CLI being authed to the wrong portfolio account (Tuff Buffs,
  not BBL) could have created products in the wrong account. Stopping — staging the code + a dry-run instead — was
  the right fence; live-money operations get a human gate, every time.
- **Disjoint parallel tracks rebase clean.** S1/S2 were prestaged on disjoint files and it held — 0473 rebased onto
  0474 with zero conflicts. Scoping parallel lanes by file is what makes the merge free.

## Full close evidence

| Step | Proof |
| --- | --- |
| SESSION-file gate | `## Task log` has 4 `SESSION_0473_TASK` rows |
| Gates (session, base) | typecheck 0; comp-grants 5✓; rank-progression 16✓; lineage-membership 5✓; oxfmt/oxlint clean; `prisma validate`; build exit 0 |
| Gates (re-run, merged onto 0474) | typecheck clean; **full unit suite 877/0**; `next build` green |
| Live Stripe fence | STOPPED — CLI authed to Tuff Buffs (`acct_1T065aPm73j3q757`), not BBL; no product/price created |
| Migration | none — schema change is comment-only (`///` deprecation markers); `prisma validate` 🚀 |
| Hostile close review | SESSION_0473_REVIEW_01 + Giddy/Doug pass (8/10) |
| Review & Recommend | next = SESSION_0475 (follows 0474's block); 0473's remaining = operator live-Stripe step |
| Git hygiene | committed + rebased clean onto main; **pushed `737868ed`**; merged worktree `../ronin-0473` + branch removed |
| Memory sweep | none new (tier model in `[[bbl-membership-tier-model-0472]]`; D472-6 in SOT-ADR) |
| Next session unblock | the *agent* lane is done; the remaining live-Stripe step is an operator manual action (noted) |

> **Closed by claude-session-0474** (the parallel track-B session) at the operator's request, after landing +
> verifying 0473's code on `main`. TASK_02's live-Stripe step remains an open operator action.
