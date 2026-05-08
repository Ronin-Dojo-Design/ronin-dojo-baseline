---
title: "SESSION 0098 - Payment Monitoring and Drift Audit"
slug: session-0098
type: session
status: planned
created: 2026-05-08
updated: 2026-05-08
last_agent: codex-session-0098-plan
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0097.md
  - docs/knowledge/wiki/manual-boundary-registry.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/runbooks/stripe-setup-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0098 - Payment Monitoring and Drift Audit

## Date

2026-05-08 prep for next execution session

## Operator

Brian Scott + Codex acting as Petey for staging

## Status

planned

## Goal

Advance MB-013 by making payment failures and payment/access drift observable before protected paid curriculum launch.

## Why This Is Next

SESSION_0097 closed protected program enrollment Checkout hardening. The next highest launch risk is no longer forged checkout metadata; it is silent payment/access drift or webhook failure. `StripeWebhookEvent`, `Invoice`, `Payment`, `PricingPlan`, `EntitlementGrant`, `UserEntitlement`, and `ProgramEnrollment` now contain enough state to build a launch-grade monitor and drift audit without changing the payment provider flow.

PWCC remains deferred until Brian explicitly accepts the residual MB-013 launch risk or SESSION_0098 closes the monitoring/drift-audit slice.

## Source Facts

- Graphify query used during planning:
  - `/tmp/graphify-venv/bin/graphify query "SESSION_0098 MB-013 StripeWebhookEvent payment entitlement drift audit monitoring PricingPlan UserEntitlement Invoice Payment admin billing" --budget 3000`
  - Useful hits: Monetization and Entitlements Spec, Ubiquitous Language commerce terms, S2 payment/billing schema notes, `Payment`, `PricingPlan`, `UserEntitlement`, `Invoice`, `InvoiceLineItem`.
- Discovery rule for execution: use `graphify query` first for code/document discovery. Use direct source reads for authoritative details. Avoid text search unless Graphify does not surface enough context.
- Stripe setup reference: `docs/runbooks/stripe-setup-runbook.md`.
- `StripeWebhookEvent` records event id, type, object id, status, attempts, last error, and processed timestamp, but no alerting or dashboard reads it yet.
- `Invoice` records `stripeInvoiceId`, `stripeCheckoutSessionId`, `stripeSubscriptionId`, line items, payments, and status.
- `Payment` records payment method, Stripe payment intent id, and Stripe Checkout session id.
- `PricingPlan.stripePriceId` is nullable and non-unique; SESSION_0097 action fails closed on duplicate active program/price mappings.
- `UserEntitlement` remains source-id based and lacks a DB uniqueness constraint.
- `CertificateTemplate.priceCents` and `CertificateOrder.stripePaymentIntentId` still exist outside `PricingPlan`; this is a known launch bridge decision, not a SESSION_0098 implementation target unless Brian changes scope.

## Dirstarter Alignment

| Field | Answer |
| --- | --- |
| Baseline touched | Prisma/database, Stripe payments, admin operations surface |
| Extension or replacement | Extension |
| Why justified | Dirstarter provides Stripe Checkout/webhook primitives; Ronin needs protected-learning entitlement monitoring and reconciliation on top of them. |
| Risk if bypassed | Webhook failures, duplicate price mappings, missing entitlements, or stale paid enrollments could remain invisible until customers report access problems. |

## Petey Plan

### TASK_01 - MB-013 checkpoint and monitoring contract

- **Agent:** Petey + Giddy
- **What:** Convert remaining MB-013 bullets into explicit launch-blocking rules for SESSION_0098.
- **Steps:**
  1. Read SESSION_0097 closeout, MB-013, Project Log `SESSION_0097_REVIEW_01`, monetization spec, security/payments plan, and the webhook route/tests.
  2. Confirm SESSION_0098 is commerce hardening before PWCC.
  3. Lock monitoring thresholds:
     - any `FAILED` webhook event in launch window is blocking until reviewed;
     - any `PROCESSING` webhook older than 15 minutes is blocking until resolved;
     - any duplicate active current-brand/program Stripe Price mapping is blocking;
     - any paid invoice missing expected Stripe-sourced entitlement is blocking;
     - any active paid program enrollment without active mapped entitlement is blocking unless explicitly marked manual/admin;
     - certificate pricing drift is warning-only unless certificate paid launch is in scope.
  4. Confirm Brian manual decisions listed below.
  5. Append/update Project Log task rows before code edits if rows drift.
- **Done means:** SESSION_0098 rules are explicit and no code starts with an ambiguous launch threshold.
- **Depends on:** nothing.

### TASK_02 - Stripe webhook operations monitor

- **Agent:** Cody
- **What:** Add an admin-only monitor for webhook processing state.
- **Preferred shape:**
  - Query module: `apps/web/server/admin/billing/monitoring/queries.ts` or the closest existing admin/billing location.
  - Admin route: `/admin/billing/monitoring` or `/admin/billing`, depending on existing admin navigation fit.
  - Tests: focused query/action tests with real Prisma fixtures.
- **Rules:**
  1. Do not expose raw Stripe payloads, secrets, card data, addresses, or emails.
  2. Treat `StripeWebhookEvent` as global/admin-only unless a brand field is added deliberately.
  3. Show counts for last 24 hours and last 7 days by status/type.
  4. Show failed events, stale processing events, repeated-attempt events, and recent processed volume.
  5. Include a clear launch-readiness boolean or status label derived from TASK_01 thresholds.
- **Done means:** An admin can see whether webhook processing is healthy without opening the database or Stripe Dashboard.
- **Depends on:** TASK_01.

### TASK_03 - Payment and entitlement drift audit

- **Agent:** Cody + Doug
- **What:** Add a repeatable audit that reports payment/access mismatches with deterministic test proof.
- **Preferred shape:**
  - Service: `apps/web/server/web/billing/drift-audit.ts` or admin billing equivalent.
  - Script: `apps/web/scripts/audit-payment-entitlements.ts`.
  - Tests: `apps/web/server/web/billing/drift-audit.test.ts`.
- **Required checks:**
  1. Active `PricingPlan` rows with duplicate non-null `stripePriceId` for the same brand/program.
  2. Active paid `PricingPlan` rows with `stripePriceId` but zero `EntitlementGrant` rows.
  3. Paid `Invoice` rows with Stripe Checkout/subscription sources whose line-item plans grant entitlements, but no matching active `UserEntitlement`.
  4. Stripe-sourced active `UserEntitlement` rows whose source id has no matching paid invoice/checkout/subscription record.
  5. Active `ProgramEnrollment` rows for paid programs without an active mapped entitlement source, reported as blocking unless a manual/admin source policy is implemented.
  6. `StripeWebhookEvent` failed/stale states from TASK_02.
  7. `CertificateTemplate.priceCents > 0` records that are not represented by `PricingPlan`, reported as warning-only unless certificate paid launch is in scope.
- **Done means:** Running one command produces a machine-readable and human-readable drift report, exits non-zero on blocking drift, and passes clean against controlled fixtures.
- **Depends on:** TASK_01 and can run in parallel with TASK_02 after the threshold contract is locked.

## Brian Manual Boundary Checklist

These are owner-side decisions or artifacts needed to close MB-013 cleanly. Do not paste secrets into chat; record decisions and proof, not private keys.

| Item | Brian decision / artifact needed | Recommended default | Blocks |
| --- | --- | --- | --- |
| Stripe mode | Confirm SESSION_0098 uses Stripe test mode first, not live mode. | Test mode only. | TASK_02/TASK_03 verification |
| Stripe env availability | Confirm local/staging have `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` available where tests/smokes run. | Local test keys now; staging later. | Webhook smoke proof |
| Alert destination | Choose where webhook/drift alerts should go after the monitor exists. | Admin monitor in SESSION_0098; email alert in follow-up unless Resend sender is already verified. | Monitoring launch signoff |
| Alert recipients | Provide owner/admin recipient emails or decide "dashboard only" for MVP. | Brian + one admin distribution address. | Customer/payment ops |
| Audit schedule | Decide when the drift audit should run in production. | Daily at 03:00 America/Denver. | Cron/staging setup |
| Launch thresholds | Accept the TASK_01 blocking thresholds or change them before implementation. | Any blocking drift count > 0 blocks paid launch. | MB-013 signoff |
| Stripe Price inventory | Provide or approve a table of launch program plan mappings: brand, org, program, plan, Stripe product id, Stripe price id, one-time/subscription, allowed coupon ids. | One row per active paid launch plan. | Drift audit clean run |
| Coupon inventory | List coupon ids allowed for protected enrollment, or say no launch coupons beyond existing Stripe promotion-code entry. | Keep SESSION_0097 coupon support; use explicit coupon ids only for launch promos. | Checkout ops |
| Manual/admin payments | Decide whether cash/check/comp/manual paid curriculum access is excluded from launch or must be implemented next. | Exclude from launch unless SESSION_0099 builds parity. | MB-013 manual parity gate |
| Manual grant authority | If manual payments are in launch scope, name the roles allowed to grant/revoke access. | Admin only, audited. | Manual payment implementation |
| Certificate pricing | Decide whether paid certificates stay on `CertificateTemplate.priceCents` as a bridge or migrate to `PricingPlan`. | Keep bridge for physical certificate orders; warning-only in SESSION_0098 audit. | Certificate paid launch |
| Customer notifications | Decide whether failed-renewal grace/refund/dispute customer emails are required before paid curriculum launch. | Not in SESSION_0098; stage as follow-up if launch includes subscriptions. | MB-013 notification gate |
| Staging proof | Decide whether SESSION_0098 must include staging proof or only local DB/test proof. | Local proof in SESSION_0098, staging proof before MB-013 verified. | Launch-readiness signoff |

## Future Stripe Event Handler Backlog

Do not subscribe these events in Stripe until handlers and tests exist. Record them now so the event-destination plan is explicit.

### Coupon and promotion-code sync

- **Destination:** existing payment/access destination only after handler exists, or a separate admin-sync destination if operationally cleaner.
- **Likely URL:** `/api/stripe/webhooks` if folded into the current route.
- **Candidate events:**
  - `coupon.created`
  - `coupon.updated`
  - `coupon.deleted`
  - `promotion_code.created`
  - `promotion_code.updated`
- **Handler contract:** maintain a Ronin coupon/promotion allowlist or cache, mark deleted/inactive codes unavailable, and audit coupon availability changes.
- **Not needed for:** applying an already-known coupon in Checkout. SESSION_0097 already passes coupon ids into Checkout and the paid Checkout/invoice events carry resulting totals.

### BBL Connect lineage payout pipeline

- **Destination:** separate Connect/payout event destination, not the current payment/access destination.
- **Likely URL:** `/api/stripe/connect/webhooks`.
- **Likely env var:** `STRIPE_CONNECT_WEBHOOK_SECRET`.
- **Candidate connected-account events:**
  - `account.updated`
  - `account.external_account.updated`
  - `payout.created`
  - `payout.updated`
  - `payout.paid`
  - `payout.failed`
- **Candidate platform transfer events after transfer handlers exist:**
  - `transfer.created`
  - `transfer.updated`
  - `transfer.reversed`
- **Handler contract:** connected-account onboarding state, payout state, transfer creation/reversal tracking, refund/dispute clawback policy, and lineage-recipient split audit.
- **Manual decisions needed first:** whether BBL receives one org payout and handles downstream splits manually, or individual lineage recipients get connected accounts; exact Premium/Elite split percentages; payout timing; clawback rules for refunds/disputes; recipient KYC/onboarding responsibility.

## Manual Mapping Template

Brian can fill this before or during SESSION_0098. Keep it in the session file or a private ops note; do not include secret keys.

| Brand | Org | Program | Plan | Stripe product id | Stripe price id | Mode | Coupon ids allowed | Launch? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline Martial Arts |  |  |  |  |  | one-time/subscription |  | yes/no |
| Ronin Dojo Design |  |  |  |  |  | one-time/subscription |  | yes/no |
| BBL |  |  |  |  |  | one-time/subscription |  | yes/no |
| WEKAF |  |  |  |  |  | one-time/subscription |  | yes/no |

## Scope Guard

- Do not start PWCC.
- Do not implement manual/admin payment parity unless Brian explicitly selects it as the SESSION_0098 scope instead of monitoring/drift audit.
- Do not add DB uniqueness migrations unless the audit exposes a concrete need and the session has migration runway.
- Do not migrate certificate pricing unless Brian explicitly changes the certificate launch decision.
- Do not wire production alerts before alert recipients and sender/channel are confirmed.

## Recommended Verification

- `cd apps/web && bun test server/web/billing/drift-audit.test.ts`
- `cd apps/web && bun test server/admin/billing/monitoring/queries.test.ts` or final monitor test file
- `cd apps/web && bun scripts/audit-payment-entitlements.ts`
- `cd apps/web && bun test app/api/stripe/webhooks/route.test.ts`
- `cd apps/web && bun biome check <touched files>`
- `cd apps/web && bunx prisma validate --schema prisma/schema.prisma`
- `cd apps/web && bun run typecheck` and record known unrelated baseline failures if still present

Playwright is optional. Use it only if an admin monitor page is added and needs visual/route proof.

## Handoff Prompt

Act as Petey and execute `docs/sprints/SESSION_0098.md`. Keep SESSION_0098 in MB-013 commerce hardening: webhook operations monitor plus payment/entitlement drift audit. Confirm Brian's manual checklist decisions first, especially alert destination, audit schedule, Stripe Price inventory, manual payment exclusion/parity, and certificate pricing bridge. Do not start PWCC unless Brian explicitly accepts the remaining MB-013 risk.
