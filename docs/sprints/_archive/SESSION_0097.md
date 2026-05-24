---
title: "SESSION 0097 - Protected Paid Access Checkout Hardening"
slug: session-0097
type: session
status: closed-quick
created: 2026-05-07
updated: 2026-05-08
last_agent: codex-session-0097
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0096.md
  - docs/protocols/petey-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0097 - Protected Paid Access Checkout Hardening

## Date

2026-05-07 prep for next fresh chat

## Operator

Brian Scott + Codex acting as Petey for staging only

## Status

closed-quick

## Goal

Close `SESSION_0096_FINDING_01` by replacing the protected paid-learning checkout path with a user-authenticated action that derives user, brand, organization, pricing plan, Stripe line item, and metadata server-side.

## Why This Is Next

`SESSION_0096` closed the Customer Portal, Customer ID, processed-event, ledger, subscription failure/recovery, refund, and dispute gates. MB-013 remains open, and the first remaining launch gate is protected checkout hardening: the inherited Dirstarter `createStripeCheckout` action still accepts caller-supplied line items and metadata. That is acceptable for Dirstarter listing monetization, but not for Ronin paid learning/certification access.

WORKFLOW previously had SESSION_0097 as PWCC. SESSION_0096 close evidence and MB-013 supersede that order: protected checkout hardening should run before PWCC resumes unless Brian explicitly overrides the launch risk.

## Graphify Update

- Command run: `/tmp/graphify-venv/bin/graphify update .`
- Result after final refresh: AST extraction `895/895` files, `4958` nodes, `8805` edges, `385` communities.
- Freshness report: `graphify-out/GRAPH_REPORT.md` built from commit `3b39c8a1`.
- Note: Graphify was run against the current filesystem after SESSION_0096 changes. The local command reports "no LLM needed" and is strongest on code symbols; direct source reads below remain authoritative for docs and policy.

## Graphify Queries Used

| Query | Useful hits |
| --- | --- |
| `SESSION_0097 protected paid access checkout action server-derived metadata PricingPlan entitlement Stripe Customer checkout action tests` | Monetization spec, Ubiquitous Language, entitlement model, access-control flow, Stripe mapping, remaining paid-launch gaps. |
| `protected Ronin paid-access checkout generic createStripeCheckout caller metadata user brand organization plan webhook entitlement ledger` | Domain terms only; not enough by itself, so source reads were required. |
| `SESSION_0096 remaining gaps MB-013 protected checkout monitoring drift audit manual payment parity certificate pricing` | Project Log SESSION_0096 review findings, MB-013 residual gates, S2 payment/billing schema docs. |
| `createStripeCheckout checkoutSchema findStripeCustomerForCheckout getRequestBrand getServerSession stripe.checkout.sessions.create` | `server/web/products/actions.ts`, `lib/brand-context.ts`, `safe-actions.ts`, `server/web/billing/actions.ts`, `server/web/billing/stripe-customers.ts`, `server/web/tournaments/register.ts`. |
| `PricingPlan stripePriceId EntitlementGrant ProgramEnrollment createLedgerFromCheckout grantEntitlementsFromCheckout checkout.session.completed` | Webhook route/test symbols: `resolvePricingPlanLineItems`, `persistStripeCustomerFromCheckout`, `grantEntitlementsFromCheckout`, `createLedgerFromCheckout`, `syncSubscriptionEntitlements`, `applySubscriptionPaymentGrace`, `revokeAccessForPaymentIntent`. |

## Files and Docs to Read First

### Required docs

- `docs/sprints/SESSION_0096.md`
- `docs/protocols/project-log.md` around `SESSION_0096_REVIEW_01`
- `docs/knowledge/wiki/manual-boundary-registry.md` MB-013
- `docs/architecture/monetization-entitlements-spec.md`
- `docs/architecture/security-privacy-payments-monitoring-plan.md`
- `docs/protocols/WORKFLOW_5.0.md`
- `docs/architecture/dirstarter-baseline-index.md`
- `docs/protocols/petey-plan.md`

### Required source

- `apps/web/server/web/products/actions.ts`
- `apps/web/server/web/products/schema.ts`
- `apps/web/components/web/products/product.tsx`
- `apps/web/components/web/products/product-list.tsx`
- `apps/web/components/web/products/product-query.tsx`
- `apps/web/app/(web)/programs/[id]/enroll/page.tsx`
- `apps/web/server/web/program/queries.ts`
- `apps/web/server/web/program/payloads.ts`
- `apps/web/server/web/billing/actions.ts`
- `apps/web/server/web/billing/stripe-customers.ts`
- `apps/web/app/api/stripe/webhooks/route.ts`
- `apps/web/app/api/stripe/webhooks/route.test.ts`
- `apps/web/server/web/billing/actions.test.ts`
- `apps/web/prisma/schema.prisma`
- `apps/web/lib/safe-actions.ts`
- `apps/web/lib/brand-context.ts`
- `apps/web/services/stripe.ts`

### Live docs checked during prep

- Dirstarter Payments: https://dirstarter.com/docs/integrations/payments
- Dirstarter Monetization: https://dirstarter.com/docs/monetization
- Dirstarter Prisma: https://dirstarter.com/docs/database/prisma
- Stripe Checkout Sessions API: https://docs.stripe.com/api/checkout/sessions/create
- Stripe custom success page/session ID guidance: https://docs.stripe.com/payments/checkout/custom-success-page
- Stripe webhooks: https://docs.stripe.com/webhooks

## Source Findings

- `apps/web/server/web/products/actions.ts` is intentionally generic Dirstarter checkout. It accepts `lineItems`, `mode`, `metadata`, `successUrl`, `cancelUrl`, and optional `coupon`. It now attaches stored Stripe Customers only when the authenticated user matches `metadata.userId`, but it still trusts caller-provided metadata for protected program enrollment.
- `apps/web/app/(web)/programs/[id]/enroll/page.tsx` redirects anonymous users, then uses `ProductQuery` and passes `metadata: { type: "program_enrollment", programId, userId }` into the generic Product card checkout.
- `apps/web/components/web/products/product.tsx` hardcodes `createStripeCheckout`; the protected path will need either an optional checkout-action prop or a small protected product/card variant that reuses the same Dirstarter primitives.
- `programDetailPayload` already includes program `pricingPlans`, but not `stripePriceId` or entitlement grant counts. SESSION_0097 can either expose validated internal plans to the page or keep using Stripe Product prices and validate `stripePriceId` server-side.
- The webhook now maps Checkout line-item price IDs to `PricingPlan` and `EntitlementGrant`; SESSION_0097 should preserve that contract rather than moving entitlement decisions into the client.

## Petey Plan

### Goal

Make paid program enrollment Checkout server-derived and launch-safe without replacing Dirstarter's generic listing monetization checkout.

### Tasks

#### TASK_01 - Bow-in, reconcile forward plan, and define protected checkout contract

- **Agent:** Petey + Giddy
- **What:** Confirm SESSION_0097 is commerce hardening before PWCC, read the required docs/source, and record task rows before implementation.
- **Steps:**
  1. Read this file, SESSION_0096, MB-013, monetization spec, security/payments plan, Project Log SESSION_0096 review, and the source files listed above.
  2. Confirm Dirstarter alignment from live payments/monetization/Prisma docs.
  3. Decide the protected action input shape before code. Recommended default: accept only `programId`, `stripePriceId` or `pricingPlanId`, and optional `coupon`; derive success/cancel URLs, user, brand, organization, metadata, line item, and mode server-side.
  4. Append/update Project Log task rows if this prep entry has drifted.
- **Done means:** SESSION_0097 has active task rows and the action contract is explicit before code edits.
- **Depends on:** nothing.

#### TASK_02 - Implement protected program enrollment Checkout

- **Agent:** Cody
- **What:** Add a user-authenticated Checkout action for program enrollment that validates the selected plan and derives all sensitive Checkout fields server-side.
- **Steps:**
  1. Add a protected action, preferably under `server/web/billing/actions.ts` or a sibling billing checkout module, using `userActionClient`.
  2. Load `brand` from `getRequestBrand()` and `user` from action context.
  3. Load the selected `PricingPlan` by current brand plus either `pricingPlanId` or `stripePriceId`; require `isActive`, `programId`, `organizationId`, `stripePriceId`, and at least one `EntitlementGrant`.
  4. Verify the referenced `Program` is ACTIVE, current-brand, and belongs to the plan's organization.
  5. Retrieve or reuse current-brand `StripeCustomer`; set `customer` or `customer_creation` exactly as SESSION_0096 established.
  6. Create the Stripe Checkout Session with server-built `line_items`, mode derived from the Stripe Price recurring flag or trusted plan recurrence fields, and server-built metadata: `type=program_enrollment`, `userId`, `programId`, `pricingPlanId`, `organizationId`, and `brand`.
  7. Keep the inherited generic `createStripeCheckout` for Dirstarter listing/ads flows; do not break directory monetization.
- **Done means:** A protected action exists and the program enrollment page no longer relies on caller-supplied metadata for paid learning access.
- **Depends on:** TASK_01.

#### TASK_03 - Wire UI and prove metadata cannot be forged

- **Agent:** Cody + Doug
- **What:** Update the program enrollment pricing UI to call the protected action and add focused action tests.
- **Steps:**
  1. Reuse existing Product card primitives where practical. Preferred approach: extend `Product`/`ProductList` with an optional checkout executor or add a narrow protected variant without duplicating visual markup.
  2. Update `/programs/[id]/enroll` so the client only sends the selected plan/price selector, not `userId`, `programId` metadata, arbitrary line items, or arbitrary success/cancel URLs.
  3. Add tests proving:
     - valid current-brand program plan creates Checkout with DB-derived line item and metadata;
     - caller-supplied forged metadata is ignored or rejected;
     - cross-brand, wrong-program, inactive, unmapped, or no-entitlement plans are rejected;
     - existing current-brand Stripe Customer is reused and new customers are requested when absent.
  4. Run focused verification and update docs if implementation changes the launch contract.
- **Done means:** Tests demonstrate protected paid-learning Checkout cannot be driven by caller-supplied entitlement metadata.
- **Depends on:** TASK_02.

### Parallelism

Keep code work sequential in the main checkout. The likely write set overlaps across billing actions, Product components, the program enroll page, and tests. A read-only scout can run in parallel at bow-in if desired, but do not split this into worktrees unless the UI and action tests are clearly assigned disjoint write sets.

### Agent Assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey + Giddy | Planning, WORKFLOW/MB-013 reconciliation, and Dirstarter alignment. |
| TASK_02 | Cody | Bounded backend implementation with existing safe-action and Stripe patterns. |
| TASK_03 | Cody + Doug | UI wiring plus hostile test proof for forged metadata and brand/plan mismatches. |

### Open Decisions

- Input selector: `pricingPlanId` is stricter and internal; `stripePriceId` is easier to wire into current Product cards. Either is acceptable only if the server validates current brand, active plan, program, organization, and entitlement grants before creating Checkout.
- UI strategy: extend existing `Product` component with an optional protected checkout executor, or create a protected program-plan card using the same Dirstarter primitives. Avoid a large product UI rewrite.
- Coupon handling: decide whether protected program enrollment accepts coupon IDs from the current query flow or defers discounts until after protected Checkout is proven.
- Scope of SESSION_0097: do not attempt webhook monitoring, drift audit, manual/admin payment parity, certificate pricing, or DB uniqueness unless required by the protected checkout implementation.

### Risks

- The current Dirstarter Product card is wired directly to the generic checkout action, so the UI change can become wider than the backend change if not kept narrow.
- Stripe Product/Price data and internal `PricingPlan` rows can drift. The protected action must fail closed if the selected price is not mapped to one active current-brand program plan with entitlement grants.
- Full `bun run typecheck` is still expected to fail on known unrelated baseline errors until that debt is cleared.
- `bun run db:push` has a known Prisma CLI flag mismatch in this environment; use direct Prisma commands if schema changes become necessary.

### Scope Guard

Do not expand into PWCC, launch content, manual payments, certificate pricing, webhook monitoring, drift audit, Connect payouts, or new payment providers. Record those as remaining MB-013 gates or next-session candidates.

### Dirstarter Implementation Template

- **Docs read first:** Dirstarter Payments, Monetization, and Prisma docs checked 2026-05-07; Stripe Checkout Sessions and webhook docs checked 2026-05-07.
- **Baseline pattern to extend:** Dirstarter `services/stripe.ts`, `server/web/products/{actions,schema}.ts`, Product card checkout UI, Prisma `PricingPlan`, and `userActionClient`.
- **Custom delta:** Ronin adds a protected paid-learning Checkout action that derives access metadata from `PricingPlan`, `Program`, current brand, and authenticated user rather than trusting client metadata.
- **No-bypass proof:** The generic Dirstarter checkout remains for listings/ads. SESSION_0097 hardens only protected Ronin paid-access surfaces where entitlements and program enrollment depend on Checkout metadata.

## Recommended Verification

- `cd apps/web && bun test server/web/billing/actions.test.ts`
- `cd apps/web && bun test server/web/billing/checkout-actions.test.ts` or the final test file created for the protected action
- `cd apps/web && bun test app/api/stripe/webhooks/route.test.ts`
- `cd apps/web && bun biome check <touched files>`
- `cd apps/web && bunx prisma validate --schema prisma/schema.prisma`
- `cd apps/web && bun run typecheck` and record the known unrelated baseline failures if still present

Playwright is optional for SESSION_0097. Use it only if the Product card/enrollment UI behavior changes enough that action tests no longer prove the user-facing path.

## Handoff Prompt for Fresh Chat

Bow in with `docs/rituals/opening.md`, act as Petey, and execute `docs/sprints/SESSION_0097.md`. Start with the protected paid-access checkout action; do not start PWCC until `SESSION_0096_FINDING_01` is closed or Brian explicitly accepts the risk. Use the refreshed Graphify index if needed, then follow the Petey plan above.

## Quick Close

### What landed

- Added `createProgramEnrollmentCheckout`, an authenticated program enrollment Checkout action that accepts only `programId`, selected `stripePriceId`, and optional `coupon`.
- The action derives request brand, user, PricingPlan, Program, organization, line item, Checkout mode, Stripe Customer handling, metadata, and success/cancel URLs server-side.
- Kept generic Dirstarter `createStripeCheckout` unchanged for listing/product monetization flows.
- Wired `/programs/[id]/enroll` to the protected action so the client no longer sends paid-learning metadata, arbitrary line items, or redirect URLs.
- Added hostile action tests proving forged metadata/line items/URLs are ignored and invalid plan mappings fail closed.

### Files touched

- `apps/web/server/web/billing/actions.ts` — protected program enrollment Checkout action.
- `apps/web/server/web/billing/checkout-actions.test.ts` — focused valid/hostile/rejection tests.
- `apps/web/components/web/products/product.tsx` — optional protected checkout executor for Product cards.
- `apps/web/components/web/products/product-list.tsx` — forwards protected checkout data.
- `apps/web/components/web/products/product-query.tsx` — exposes optional protected checkout data.
- `apps/web/app/(web)/programs/[id]/enroll/page.tsx` — sends only `programId` to protected checkout.
- `docs/protocols/project-log.md` — SESSION_0097 build/task/review entries.
- `docs/knowledge/wiki/manual-boundary-registry.md` — MB-013 protected checkout gate disposition.
- `docs/architecture/monetization-entitlements-spec.md` — commerce contract update.
- `docs/architecture/security-privacy-payments-monitoring-plan.md` — paid-access gate update.
- `docs/sprints/SESSION_0097.md` — quick-close record.

### Decisions resolved

- Input selector uses `stripePriceId` because the current Product card flow already operates on Stripe Prices.
- Optional coupon support stays enabled and is passed through as a Stripe coupon id from the existing discount-code query flow.
- Checkout mode is derived from trusted internal plan recurrence fields (`intervalMonths`, `MONTHLY`, `ANNUAL`).
- Duplicate active current-brand plan mappings for the same program/price fail closed until the DB uniqueness policy is decided.

### Open decisions / blockers

- MB-013 remains open for webhook monitoring/alerting, payment-entitlement drift audit, manual/admin payment parity, certificate pricing, DB uniqueness policy, and customer notification paths.
- Full `bun run typecheck` still fails on known unrelated baseline errors: `server/web/tags/queries.ts(67,10)` excessive stack depth and existing tournament test `bun:test` typings.
- Changes are uncommitted because no commit/push authorization was given in this turn.

### Verification

- `cd apps/web && bun test server/web/billing/checkout-actions.test.ts` — 4/4 pass.
- `cd apps/web && bun test server/web/billing/actions.test.ts` — 2/2 pass.
- `cd apps/web && bun test app/api/stripe/webhooks/route.test.ts` — 10/10 pass.
- `cd apps/web && bun biome check server/web/billing/actions.ts server/web/billing/checkout-actions.test.ts components/web/products/product.tsx components/web/products/product-list.tsx components/web/products/product-query.tsx 'app/(web)/programs/[id]/enroll/page.tsx'` — pass.
- `cd apps/web && bunx prisma validate --schema prisma/schema.prisma` — pass.
- `git diff --check` — pass.
- `bun run wiki:lint` — pass with 0 errors and 3 existing orphan-page warnings (`knowledge/wiki/topic-index.md`, `knowledge/wiki/concepts/tournament-ops.md`, `knowledge/wiki/dirstarter-uplift-backlog.md`).
- `cd apps/web && bun run typecheck` — fails only on known unrelated baseline errors listed above.
- Project-log gate — `SESSION_0097` appears in `docs/protocols/project-log.md`.
- Git hygiene — branch `main`; existing extra worktrees `ronin-dojo-app-wt-0085-route` and `ronin-dojo-app-wt-0085-tests` left in place; changes uncommitted because no commit/push authorization was given.

### Task log

- `SESSION_0097_TASK_01` — landed.
- `SESSION_0097_TASK_02` — landed.
- `SESSION_0097_TASK_03` — landed.

### Review log

- `SESSION_0097_REVIEW_01` — quick close review recorded in Project Log.
- `SESSION_0097_FINDING_01` — remaining MB-013 gates are outside protected Checkout.

### Hostile close review

- Giddy/Doug local verdict: pass for SESSION_0097 scope.
- No fresh Dirstarter browsing was performed per locked operator instruction; this session relied on the SESSION_0097 prep record that live Dirstarter Payments, Monetization, Prisma, and Stripe Checkout/webhook docs were checked on 2026-05-07.
- Score cap: 9.2/10 because MB-013 monitoring, drift audit, manual payment parity, certificate pricing, and uniqueness policy remain open.

### ADR / ubiquitous-language check

- No ADR needed; this implements ADR 0011's entitlement-first checkout hardening rather than creating a new architecture decision.
- No Ubiquitous Language update needed; no new domain term was introduced.

### Next session

- **Goal:** Execute `docs/sprints/SESSION_0098.md` for webhook monitoring and payment/entitlement drift audit.
- **Inputs to read:** `docs/sprints/SESSION_0098.md`, `docs/knowledge/wiki/manual-boundary-registry.md` MB-013, `docs/protocols/project-log.md` `SESSION_0097_REVIEW_01`, `docs/architecture/security-privacy-payments-monitoring-plan.md`, and the Stripe webhook route/tests.
- **First task:** Confirm Brian's manual checklist decisions in SESSION_0098, especially alert destination, audit schedule, Stripe Price inventory, manual payment exclusion/parity, and certificate pricing bridge.
