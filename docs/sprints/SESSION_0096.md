---
title: "SESSION 0096 - Customer Billing and Subscription Launch Gaps"
slug: session-0096
type: session
status: closed-full
created: 2026-05-07
updated: 2026-05-07
last_agent: codex-session-0096
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0095.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0096 - Customer Billing and Subscription Launch Gaps

## Date

2026-05-07

## Operator

Brian Scott + Codex acting as Petey, then Cody/Doug for implementation and review

## Status

closed-full

## Goal

Close the highest-risk customer billing and subscription launch gaps left by SESSION_0095: Stripe Customer ID / Customer Portal path, event-id dedupe, non-tournament ledger projection, and explicit subscription failed-payment/refund/dispute policy.

## Bow-in

### Previous session pickup

- `SESSION_0095` closed full and proved one-time/subscription Checkout entitlement grant/replay plus subscription deletion revoke.
- Required first task from `SESSION_0095`: decide and implement the Stripe Customer ID / Customer Portal storage path, or explicitly defer it with MB-013 risk accepted; then address ledger projection and subscription failed-payment/refund/dispute policy.
- Current date: 2026-05-07. WORKFLOW lists SESSION_0096 as a May 8 target, but this session is executing early per user request.
- Current branch: `main`.
- Current status at bow-in: clean.
- Current HEAD at bow-in: `3b39c8a`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Monetization/payments, Prisma/database, Stripe webhook, dashboard action surface |
| Extension or replacement | Extension. Keep Dirstarter Stripe Checkout/webhook, `server/web/products`, Prisma, and action-client patterns; add Ronin customer, portal, ledger, and entitlement lifecycle handling on top. |
| Why justified | May 18 paid-access launch needs Customer Portal entry, durable customer correlation, ledger rows, duplicate-event handling, and subscription failure/refund/dispute policy before PWCC and brand rollout work resume. |
| Risk if bypassed | Users could lack billing self-service, webhook retries could reprocess state, access could drift from money movement, and failed/refunded/disputed subscriptions could remain active indefinitely. |

### Protocol checks

- `WORKFLOW_5.0.md`: current forward row says `SESSION_0096` is Commerce implementation to close customer/subscription launch gaps or document explicit deferrals.
- `program-plan.md`: layered architecture and Dirstarter-first L1 rule remain valid; WORKFLOW 5.0 supersedes the old date sequencing.
- `manual-boundary-registry.md`: MB-013 remains open and names Customer ID / Portal, ledger projection, subscription lifecycle, manual/admin parity, and drift audit as launch gates.
- `drift-register.md`: no open drift item blocks this lane.
- `failed-steps-log.md`: relevant mitigations acknowledged: FS-0006/FS-0007 Petey/WORKFLOW compliance, FS-0008 schema/source spot-checks, FS-0010/FS-0011 git discipline, FS-0015 project-log/full-close gate.

## Graphify check

- Graph status: stale but intentionally not refreshed per user instruction; report was built from `5f1d41c`, current HEAD is `3b39c8a`.
- Queries used:
  - `Stripe customer portal customer id ledger subscription policy invoice payment failed dispute entitlement webhook`
  - `checkout.session.completed customer.subscription.deleted PricingPlan stripePriceId sourceId Invoice Payment route.test`
- Files selected from graph/source verification:
  - `docs/architecture/monetization-entitlements-spec.md`
  - `docs/architecture/s2-schema-additions.md`
  - `docs/architecture/ubiquitous-language.md`
  - `apps/web/prisma/schema.prisma`
  - `apps/web/app/api/stripe/webhooks/route.ts`
  - `apps/web/app/api/stripe/webhooks/route.test.ts`
  - `apps/web/server/web/products/actions.ts`
  - `apps/web/server/web/tournaments/register.ts`
  - `apps/web/app/(web)/dashboard/membership.tsx`
- Verification note: Graphify was navigation only and weak on current code. Source reads determine the implementation.

## Agent assignments

| Task | Persona/agent | Responsibility |
| --- | --- | --- |
| SESSION_0096_TASK_01 | Petey + Giddy | Bow-in, stale Graphify query, Dirstarter alignment, task ledger, Cody pre-flight, and worktree decision |
| SESSION_0096_TASK_02 | Cody | Implement customer ID storage, Customer Portal action/UI path, and processed Stripe event dedupe |
| SESSION_0096_TASK_03 | Cody + Doug | Implement ledger projection plus subscription/refund/dispute policy, run verification, update MB-013/spec/project log, and full close |
| Billing Source Scout | Subagent explorer | Read-only source-flow brief for customer/portal/ledger/webhook risks |
| Test Harness Scout | Subagent explorer | Read-only brief for test additions and verification commands |

### Worktree decision

No new worktree for this slice. The write set is tightly coupled across Prisma schema, generated client/migration, checkout action, webhook route, webhook tests, dashboard billing entry, and close docs. Parallel worktrees would create merge overhead without isolating ownership.

## Petey plan

### Goal

Make paid-access billing launch-safe enough to leave commerce QA for PWCC: durable Stripe customer correlation, Customer Portal session creation, event-id dedupe, ledger projection, and explicit subscription failure/refund/dispute behavior.

### Tasks

#### TASK_01 - Bow-in and pre-flight

- **Agent:** Petey + Giddy
- **What:** Create SESSION_0096, task log entries, stale Graphify note, Dirstarter alignment, and backend/schema/UI pre-flight.
- **Steps:**
  1. Read SESSION_0095, WORKFLOW 5.0, program plan, failed steps, drift register, MB-013, monetization spec, security/payments plan, Dirstarter baseline index, and relevant live docs.
  2. Run stale Graphify query without refresh.
  3. Record task IDs in Project Log before implementation.
- **Done means:** This SESSION file and Project Log have active task entries before code edits.
- **Depends on:** nothing.

#### TASK_02 - Customer, portal, and event dedupe

- **Agent:** Cody
- **What:** Persist Stripe Customer IDs, pass stored customers into Checkout, expose authenticated Customer Portal session creation, and store processed webhook event IDs.
- **Steps:**
  1. Add Prisma fields/model and migration for current-brand `StripeCustomer` mapping and processed webhook event storage.
  2. Update generic and tournament Checkout creation to reuse stored Stripe Customers and request customer creation where needed.
  3. Persist `session.customer` from Checkout webhooks for authenticated Ronin paid access.
  4. Add a user-authenticated billing portal action and dashboard entry point.
  5. Claim/process webhook event IDs idempotently.
- **Done means:** Tests prove customer ID persistence and duplicate event IDs do not reprocess a webhook; billing portal action is present and authenticated.
- **Depends on:** TASK_01.

#### TASK_03 - Ledger and lifecycle policy

- **Agent:** Cody + Doug
- **What:** Create non-tournament `Invoice`/`Payment` rows for mapped paid access and handle subscription update, failed payment, recovery, refund, and dispute events with documented access policy.
- **Steps:**
  1. Project mapped non-tournament Checkout line items into `Invoice`, `InvoiceLineItem`, and `Payment` rows.
  2. Handle subscription updates by syncing active subscription entitlements to current Stripe Price items, and keep period-end cancellation active until deletion.
  3. Handle failed renewals with a written grace policy, restore on paid invoice, and revoke/refund/dispute relevant entitlements.
  4. Extend webhook tests with real Prisma fixtures for all changed behaviors.
  5. Update MB-013, monetization spec, security/payments plan, and Project Log review.
- **Done means:** Focused tests pass and docs clearly distinguish closed gates from remaining launch bridges.
- **Depends on:** TASK_02.

### Parallelism

Read-only subagents can scout source and test harness in parallel. Code work stays sequential on main because schema, webhook route, generated Prisma types, and tests share the same files.

### Open decisions

- Grace policy is chosen for this session as a launch default: failed renewal sets subscription entitlement `endsAt` to seven days out; `invoice.paid` restores active access; subscription deletion/refund/dispute revokes immediately.
- Certificate pricing, manual/admin payment parity, DB uniqueness for non-unique Stripe Price/source rows, and full drift audit remain outside this session unless the implementation makes them unavoidable.
- Stripe customer identity storage is chosen as a separate `StripeCustomer` mapping model keyed by user, brand, and account scope after source scout review; this avoids baking future Connect/multi-brand constraints into a single `User` field.

### Risks

- Prisma schema changes require local DB push/generate for tests.
- Generic `createStripeCheckout` is still caller-metadata-driven for inherited Dirstarter listing/ads paths; protected Ronin program pages already server-render user metadata, but a dedicated protected checkout action may still be a later hardening task.
- Stripe event ordering is not guaranteed, so lifecycle handlers must be idempotent and tolerate partial data.
- Typecheck may still hit unrelated pre-existing failures recorded in SESSION_0095.

### Scope guard

Do not expand into certificate pricing, manual/admin payments, product catalog redesign, Connect payouts, or full payment/entitlement drift audit. Record those as MB-013 remaining gates.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Payments, Monetization, Prisma docs checked 2026-05-07; Stripe Customer Portal, Checkout Session customer fields, subscription webhooks, and webhook duplicate-event guidance checked 2026-05-07.
- **Baseline pattern to extend:** `services/stripe.ts`, `server/web/products/{actions,schema}.ts`, `/api/stripe/webhooks`, Prisma schema/migration, `userActionClient`, and dashboard L1 components.
- **Custom delta:** Ronin stores Stripe customer identity on `User`, logs processed Stripe events, projects paid-access Checkout into `Invoice`/`Payment`, and maps subscription/refund/dispute events into `UserEntitlement` lifecycle.
- **No-bypass proof:** This does not replace Dirstarter payments; it adds the Ronin entitlement/ledger contract that Dirstarter listing monetization does not need.

## Pre-flight: Backend - billing launch gaps

### 1. Auth predicates planned

- [x] Session auth required: Customer Portal action uses `userActionClient`; protected program enrollment page already redirects unauthenticated users before Checkout metadata is built.
- [x] Org membership verified: not required for Customer Portal; program entitlement grant still flows through server-selected `PricingPlan`/`EntitlementGrant`; tournament checkout keeps existing entitlement/member/brand gates.
- [x] Brand column filtered: ledger projection derives brand and organization from `PricingPlan`; dashboard entitlements use `getRequestBrand()`.
- Authorization approach: keep Stripe webhook signature verification intact; only persist Customer IDs from webhook sessions tied to a server-authenticated user id; Customer Portal requires the logged-in user and their stored `stripeCustomerId`.

### 2. Existing action scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: yes. Payments baseline is `services/stripe.ts` + `/api/stripe/webhooks`; server modules use `actions.ts`/`queries.ts`/`schema.ts`; action client chain uses `actionClient -> userActionClient -> adminActionClient/publicActionClient`.
- Searched source for: `createStripeCheckout`, `customer_creation`, `invoice_creation`, `checkout.session.completed`, `customer.subscription.deleted`, `PricingPlan`, `Invoice`, `Payment`, `UserEntitlement`, `stripeCustomer`.
- Related existing actions/routes: `apps/web/server/web/products/actions.ts`, `apps/web/server/web/tournaments/register.ts`, `apps/web/app/api/stripe/webhooks/route.ts`, `apps/web/app/(web)/dashboard/membership.tsx`.
- L1 pattern match: extend Dirstarter Stripe Checkout/webhook and Ronin dashboard card/button primitives; add `server/web/billing/actions.ts` under established web entity action pattern.

### 3. Schema spot-check

- `User`: no Stripe customer mapping currently exists; relations include `invoices` and `entitlements`. SESSION_0096 adds a separate current-brand `StripeCustomer` relation instead of a single `User` column.
- `PricingPlan`: `brand`, `organizationId`, optional `programId`, `amountCents`, `currency`, nullable `stripeProductId`, nullable/non-unique `stripePriceId`, `invoiceLineItems`, `entitlementGrants`.
- `Invoice`: `brand`, `organizationId`, `userId`, status enum `DRAFT`, `SENT`, `PAID`, `PARTIAL`, `OVERDUE`, `VOID`, `REFUNDED`; has `lineItems` and `payments`.
- `Payment`: `amountCents`, `currency`, `method` enum `CARD`, `BANK_ACCOUNT`, `CASH`, `CHECK`, `BARTER`, `stripePaymentIntentId`, `invoiceId`.
- `UserEntitlement`: `sourceType` enum `PURCHASE`, `SUBSCRIPTION`, `MANUAL_GRANT`, `MEMBERSHIP`, `PROMO`; `status` enum `ACTIVE`, `EXPIRED`, `REVOKED`; `sourceId` nullable and indexed but not unique.

### 4. Data flow reference

- `docs/runbooks/sop-data-and-wiring-flows.md`: not loaded; this is a webhook/action hardening slice on an existing payment flow, not a new user lifecycle surface.
- `docs/runbooks/sop-e2e-user-lifecycle.md`: not loaded; proof surface is the existing Bun webhook harness. Browser/Playwright will be used only if dashboard UI behavior needs runtime proof.

### 5. FAILED_STEPS check

- Prior failures in this area: FS-0006, FS-0007, FS-0008, FS-0015.
- Manual Boundary Registry entries: MB-013.
- Mitigation acknowledged: Petey plan and task log entries exist before code; exact schema enums/relations were read from source; close cannot mark full without Project Log review and full-close evidence.

## Task log

- SESSION_0096_TASK_01
- SESSION_0096_TASK_02
- SESSION_0096_TASK_03

## What Landed

- Added current-brand Stripe Customer correlation through a dedicated `StripeCustomer` model keyed by user, brand, and account scope.
- Reused stored customers in authenticated Checkout creation and persisted new customer IDs from mapped Checkout sessions.
- Added an authenticated Customer Portal safe action plus a dashboard button for users with a stored current-brand customer, including users whose only dashboard membership data is billing state.
- Added `StripeWebhookEvent` processing records so duplicate processed Stripe event IDs skip state changes.
- Projected mapped non-tournament Checkout into internal `Invoice`, `InvoiceLineItem`, and `Payment` rows.
- Added subscription lifecycle handling for update, deletion, failed payment, paid renewal, full refund, and dispute creation.
- Widened the paid tournament webhook transaction retry guard to include Prisma adapter `40001` transaction conflicts.
- Updated MB-013, the monetization entitlement spec, the security/payments plan, WORKFLOW, and Project Log to distinguish closed gates from remaining launch gates.

## Files Touched

| Path | Note |
| --- | --- |
| `apps/web/prisma/schema.prisma` | Added `StripeCustomer`, `StripeWebhookEvent`, and Stripe ledger IDs on invoices/payments. |
| `apps/web/prisma/migrations/20260507140933_add_stripe_customer_ledger_event_tracking/migration.sql` | Migration for customer mapping, event tracking, and ledger Stripe ID columns. |
| `apps/web/server/web/billing/stripe-customers.ts` | Helper functions for finding and upserting current-brand Stripe Customer mappings. |
| `apps/web/server/web/billing/actions.ts` | Authenticated Customer Portal session action. |
| `apps/web/server/web/billing/actions.test.ts` | Portal success and no-customer rejection tests. |
| `apps/web/app/(web)/dashboard/billing-portal-button.tsx` | Client button that invokes the portal action. |
| `apps/web/app/(web)/dashboard/membership.tsx` | Shows billing portal entry for users with current-brand customer mapping. |
| `apps/web/server/web/dashboard/queries.ts` | Added current-brand Stripe Customer lookup. |
| `apps/web/server/web/products/actions.ts` | Reuses authenticated stored customer when safe and requests customer creation for protected paid access. |
| `apps/web/server/web/tournaments/register.ts` | Reuses stored customer for paid tournament Checkout and keeps checkout-created customers available. |
| `apps/web/app/api/stripe/webhooks/route.ts` | Event dedupe, customer persistence, ledger projection, and subscription/refund/dispute lifecycle handlers. |
| `apps/web/app/api/stripe/webhooks/route.test.ts` | Webhook proof expanded for SESSION_0096 launch gaps. |
| `docs/sprints/SESSION_0096.md` | Bow-in, plan, implementation record, verification, full close. |
| `docs/protocols/project-log.md` | Build log, task plan, and review entry. |
| `docs/protocols/WORKFLOW_5.0.md` | Actual SESSION_0096 row. |
| `docs/knowledge/wiki/manual-boundary-registry.md` | MB-013 closed/remaining gate update. |
| `docs/architecture/monetization-entitlements-spec.md` | Commerce contract updated to SESSION_0096 behavior. |
| `docs/architecture/security-privacy-payments-monitoring-plan.md` | Future commerce gates updated for closed customer/ledger/policy work. |

## Decisions Resolved

- Stripe customer identity lives in a separate `StripeCustomer` mapping model rather than a single `User.stripeCustomerId` column. This keeps brand/account-scope room for future Connect or multi-brand work.
- Customer Portal session creation is an authenticated user action using the logged-in user's current-brand `StripeCustomer`, not a webhook or public route.
- Failed subscription renewal policy is seven-day grace: the subscription entitlement remains active with finite `endsAt`; `invoice.paid` restores active access.
- Full refunds and disputes revoke matching Stripe-sourced entitlements and suspend program enrollment projections while preserving ledger history.
- Event-level dedupe is persisted with `StripeWebhookEvent`; duplicate processed event IDs return success without reprocessing.

## Open Decisions / Blockers

- Protected paid learning checkout still needs a dedicated user-authenticated server action that derives user, brand, org, plan, and metadata server-side. SESSION_0096 only hardens the inherited generic action by attaching stored customers when authenticated session metadata matches the current user.
- Stripe webhook monitoring/alerts are not wired. Processed/failed event rows exist, but there is no dashboard, alert threshold, or nightly drift job yet.
- `PricingPlan.stripePriceId` remains nullable/non-unique, and Stripe-sourced `UserEntitlement` uniqueness is still app-level rather than DB-enforced.
- Manual/admin payment parity remains open: cash/check/barter/comp paths do not yet grant/revoke the same entitlement and ledger state as Stripe.
- Certificate pricing remains unresolved: `CertificateTemplate.priceCents` versus `PricingPlan` for paid certificate launch.
- `bun run db:push` currently calls Prisma with an unsupported `--skip-generate` flag in this environment; direct `bunx prisma db push --accept-data-loss` succeeded.
- Full `bun run typecheck` still fails on pre-existing unrelated baseline errors in tags and tournament test type resolution.
- No commit or push was requested this session; changes remain uncommitted.

## Verification

| Command | Result |
| --- | --- |
| `cd apps/web && bun run db:generate` | Passed. |
| `cd apps/web && bunx prisma validate --schema prisma/schema.prisma` | Passed. |
| `cd apps/web && bunx prisma db push --accept-data-loss` | Passed after the package script failed on unsupported `--skip-generate`. |
| `cd apps/web && bun test app/api/stripe/webhooks/route.test.ts` | Passed: 10 tests, 91 expectations. |
| `cd apps/web && bun test server/web/billing/actions.test.ts` | Passed: 2 tests, 7 expectations. |
| `cd apps/web && bun test app/api/stripe/webhooks/route.test.ts server/web/billing/actions.test.ts server/web/tournaments/register.concurrency.test.ts` | Passed: 18 tests, 128 expectations. |
| `cd apps/web && bun biome check --write ...` | Passed after formatting/fixing touched files. |
| `cd apps/web && bun biome check ...` | Passed on the touched code/test files. |
| `cd apps/web && bun run typecheck` | Failed only on pre-existing unrelated errors: `server/web/tags/queries.ts(67,10)` excessive stack depth, and two test files unable to find `bun:test`. |

Playwright was not needed because this slice is backend/schema/webhook focused and the dashboard entry is covered at action level.

## Review Log

- `SESSION_0096_REVIEW_01` appended to `docs/protocols/project-log.md`.
- Dirstarter docs checked live on 2026-05-07 for payments, monetization, and Prisma/database alignment.
- Stripe docs checked live on 2026-05-07 for Customer Portal sessions, webhook idempotency/retries, and subscription lifecycle webhooks.

## Hostile Close Review

Doug/Giddy verdict: aligned and launch-risk reducing. The session extends Dirstarter's Stripe/Prisma/action baseline and keeps Ronin-specific policy in webhook helpers, billing actions, and entitlement/ledger tables. No Dirstarter replacement stack was introduced.

Findings that remain open are launch-hardening issues rather than regressions from this session: protected checkout action, webhook monitoring/drift audit, DB uniqueness policy, manual/admin payment parity, and certificate pricing. WORKFLOW score: 9.3/10. Score is capped below 9.5 because monitoring/drift audit and protected checkout hardening remain open after payment-policy implementation.

## ADR / Ubiquitous-Language Check

No new ADR was created. The Stripe customer mapping and lifecycle policy are implementation refinements of ADR 0011's entitlement-first commerce decision, not a new architecture direction.

No ubiquitous-language update was needed. Existing terms (`Entitlement`, `PricingPlan`, `Invoice`, `Payment`, `Subscription`) cover the implementation. `StripeCustomer` is an integration mapping model, not a new domain concept.

## Next Session

Goal: close the remaining protected paid-access launch hardening gates before PWCC work resumes.

Inputs to read:

- `docs/sprints/SESSION_0096.md`
- `docs/knowledge/wiki/manual-boundary-registry.md` MB-013
- `docs/architecture/monetization-entitlements-spec.md`
- `docs/architecture/security-privacy-payments-monitoring-plan.md`
- `apps/web/server/web/products/actions.ts`
- `apps/web/app/api/stripe/webhooks/route.ts`
- `apps/web/prisma/schema.prisma`

First task: create a protected Ronin paid-access checkout action that derives user, brand, org, plan, and metadata server-side, then prove it cannot be used with caller-supplied entitlement metadata.

## Reflections

- The separate `StripeCustomer` mapping model was the right choice. A single `User` column would have been simpler today but would have made brand/account-scope constraints harder to explain later.
- The webhook route is now carrying several policy concerns. It is still testable, but the next substantial lifecycle addition should consider extracting pure policy helpers instead of adding more switch-branch weight.
- The stale `db:push` package script is a process smell. Direct Prisma commands worked, but a future session should align scripts with the installed Prisma CLI before someone treats that failure as a migration failure.
- The real Prisma webhook harness continues to pay off. It caught type and schema assumptions that a mocked service test would have missed.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Checked and updated session/spec/governance docs touched this session: SESSION_0096, Project Log, WORKFLOW, MB-013 registry, monetization spec, and security/payments plan. Code files do not use JETTY frontmatter. |
| Backlinks/index sweep | Added SESSION_0096 backlinks/pairs where relevant; no new wiki page was created, so `docs/knowledge/wiki/index.md` did not need a new entry. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 3 pre-existing orphan warnings: `knowledge/wiki/topic-index.md`, `knowledge/wiki/concepts/tournament-ops.md`, `knowledge/wiki/dirstarter-uplift-backlog.md`. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0096_REVIEW_01` appended to Project Log with open follow-ups. |
| Review & Recommend | Next session goal and first task written above. |
| Memory sweep | No operator memory update needed; project-scoped facts are captured in MB-013, specs, Project Log, and this session file. |
| Next session unblock check | Unblocked for protected checkout hardening; no user input needed unless launch policy changes. |
| Git hygiene | Branch `main`; `git diff --check` passed; Project Log has 19 `SESSION_0096` references; `git status --short` shows only SESSION_0096 changes/untracked files. Worktrees `ronin-dojo-app-wt-0085-route` and `ronin-dojo-app-wt-0085-tests` are merged by commit ancestry but still have uncommitted modified files, so they were left untouched. No commit/push authorized. |
