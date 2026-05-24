---
title: "SESSION 0098 - Payment Monitoring and Drift Audit"
slug: session-0098
type: session
status: closed-full
created: 2026-05-08
updated: 2026-05-08
last_agent: codex-session-0098
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

2026-05-08 execution session

## Operator

Brian Scott + Codex acting as Petey for staging

## Status

closed-full

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

## Full Close

### What landed

- Added an admin-only Stripe webhook operations monitor at `/admin/billing/monitoring`.
- Added `getStripeWebhookOperationsMonitor`, which reports 24-hour and seven-day status/type counts, failed events, stale processing events, repeated attempts, recent processed volume, and a launch-readiness label.
- Added `runPaymentEntitlementDriftAudit` plus `scripts/audit-payment-entitlements.ts`, producing human-readable and JSON audit output and exiting non-zero on blocking drift.
- Added real Prisma fixture tests for clean and hostile payment/access drift paths.
- Added a late owner-approved TuffBuffs affiliate gear proof at `/gear`, using local copied legacy merch assets plus Amazon affiliate gear metadata.
- Added Grid, List, and Carousel display modes for `/gear`; equalized image frames and fixed selected-toggle hover contrast.

### Files touched

- `apps/web/server/web/billing/monitoring-thresholds.ts`
- `apps/web/server/admin/billing/monitoring/queries.ts`
- `apps/web/server/admin/billing/monitoring/queries.test.ts`
- `apps/web/app/admin/billing/monitoring/page.tsx`
- `apps/web/components/admin/sidebar.tsx`
- `apps/web/server/web/billing/drift-audit.ts`
- `apps/web/server/web/billing/drift-audit.test.ts`
- `apps/web/scripts/audit-payment-entitlements.ts`
- `apps/web/app/(web)/gear/page.tsx`
- `apps/web/components/web/tuffbuffs/affiliate-gear-browser.tsx`
- `apps/web/components/web/tuffbuffs/affiliate-gear-card.tsx`
- `apps/web/components/web/tuffbuffs/affiliate-gear-grid.tsx`
- `apps/web/lib/tuffbuffs/affiliate-gear.ts`
- `apps/web/lib/tuffbuffs/merch-catalog.ts`
- `apps/web/components/web/header.tsx`
- `apps/web/components/web/footer.tsx`
- `apps/web/messages/en/navigation.json`
- `apps/web/public/images/merch/*`
- `docs/protocols/project-log.md`
- `docs/knowledge/wiki/manual-boundary-registry.md`
- `docs/architecture/monetization-entitlements-spec.md`
- `docs/architecture/security-privacy-payments-monitoring-plan.md`
- `docs/sprints/SESSION_0098.md`

### Decisions recorded

- Local proof uses Stripe test mode only with local `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- The payment/access destination remains limited to the current seven events listed in the runbook.
- MVP alerting is dashboard-only for SESSION_0098; outbound alerts need a follow-up owner decision.
- Daily drift audit scheduling defaults to 03:00 America/Denver as an ops setup follow-up.
- Manual/admin paid-curriculum access remains excluded from launch until parity exists.
- `CertificateTemplate.priceCents` drift is warning-only in SESSION_0098.
- The current payment/access Stripe destination remains limited to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`, and `charge.dispute.created`.
- Outbound customer/admin emails, shippable merch checkout, product fulfillment, certificate productization, membership products, tournament registration fee setup, and formal PWCC are follow-up work; SESSION_0098 did not wire those into Stripe.
- The `/gear` page is an affiliate-link display proof and not a Stripe product/checkout surface.

### Verification

- `cd apps/web && bun test server/admin/billing/monitoring/queries.test.ts` — 1/1 pass.
- `cd apps/web && bun test server/web/billing/drift-audit.test.ts` — 2/2 pass.
- `cd apps/web && bun test app/api/stripe/webhooks/route.test.ts` — 10/10 pass.
- `cd apps/web && bun scripts/audit-payment-entitlements.ts` — READY, 0 blocking issues, 0 warnings.
- `cd apps/web && bun biome check server/web/billing/monitoring-thresholds.ts server/admin/billing/monitoring/queries.ts server/admin/billing/monitoring/queries.test.ts server/web/billing/drift-audit.ts server/web/billing/drift-audit.test.ts scripts/audit-payment-entitlements.ts app/admin/billing/monitoring/page.tsx components/admin/sidebar.tsx` — pass.
- `cd apps/web && bunx prisma validate --schema prisma/schema.prisma` — pass.
- `git diff --check` — pass.
- `cd apps/web && bun run typecheck` — fails only on known unrelated baseline errors: `server/web/tags/queries.ts(67,10)` excessive stack depth and existing `bun:test` typing gaps in tournament tests.
- `/gear` image URL audit — 36 affiliate products, 0 missing images.
- `cd apps/web && bun biome check app/(web)/gear/page.tsx components/web/tuffbuffs/affiliate-gear-browser.tsx components/web/tuffbuffs/affiliate-gear-card.tsx components/web/tuffbuffs/affiliate-gear-grid.tsx` — pass.
- Browser proof on `http://localhost:3000/gear` — desktop and mobile rendered 200; Grid/List/Carousel toggles worked; Carousel advanced; no console errors.
- Browser hover proof — selected Grid/List/Carousel hover text stayed readable on the dark active background.

### Full close evidence

| Check | Result |
| --- | --- |
| Live Dirstarter docs check | Checked 2026-05-08: `https://dirstarter.com/docs/integrations/payments`, `https://dirstarter.com/docs/monetization`, `https://dirstarter.com/docs/environment-setup`, and `https://dirstarter.com/docs`. Alignment: extensions only; Stripe/affiliate work follows Dirstarter's Stripe and affiliate guidance. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 3 existing orphan warnings: `knowledge/wiki/topic-index.md`, `knowledge/wiki/concepts/tournament-ops.md`, `knowledge/wiki/dirstarter-uplift-backlog.md`. |
| Git branch | `main`. |
| Worktree list | Main worktree at `/Users/brianscott/dev/ronin-dojo-app` plus existing `codex/session-0085-route` and `codex/session-0085-tests` worktrees. |
| Git status | Modified/untracked SESSION_0098 implementation and docs files remain uncommitted; no commit was requested or authorized. |
| Whitespace | `git diff --check` passed. |
| Graphify | `/tmp/graphify-venv/bin/graphify update /Users/brianscott/dev/ronin-dojo-app` completed during final close: rebuilt 5096 nodes and 9009 edges; `graph.json` and `GRAPH_REPORT.md` updated. `graph.html` was skipped because the graph exceeded the default 5000-node viz limit. |

### Hostile close review

- **Giddy:** The MB-013 monitor/audit code does not close the full launch gate by itself. Production alert routing, production/staging audit scheduling, staging webhook proof, manual/admin payment parity, certificate pricing signoff, DB uniqueness policy, and customer notification policy remain open and must not be hidden behind the clean local audit.
- **Doug:** The affiliate `/gear` page is visually and interactively proven locally, but it is not a formal PWCC session, not a shippable merch checkout system, and not a Stripe product catalog. Treat it as a first pipeline probe and carry the remaining merch/payment/email decisions forward explicitly.
- **Verdict:** Full close is acceptable with SESSION_0098 marked `closed-full`, MB-013 still open, and the next session starting from this record.

### Review log

- `SESSION_0098_REVIEW_01` recorded in Project Log.
- `SESSION_0098_REVIEW_02` recorded in Project Log for full close and affiliate gear proof.
- `SESSION_0098_FINDING_01` remains open for production alert/schedule setup, staging proof, manual/admin payment parity, certificate pricing signoff, DB uniqueness policy, and customer notification policy.

### Review and recommend

- **Recommended next session goal:** Run a formal PWCC pass for TuffBuffs commerce/content surfaces, starting from `/gear`, then decide the Stripe/email split for certificates, memberships, tournament fees, and shippable merch.
- **Inputs to read first:** `docs/sprints/SESSION_0098.md`, `docs/protocols/project-log.md`, `docs/knowledge/wiki/manual-boundary-registry.md`, `apps/web/app/(web)/gear/page.tsx`, `apps/web/components/web/tuffbuffs/affiliate-gear-browser.tsx`, `apps/web/lib/tuffbuffs/affiliate-gear.ts`, `apps/web/lib/tuffbuffs/merch-catalog.ts`, `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/tuffbuffs/data/merchandise.js`, and `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/tuffbuffs/components/MerchStorePage.jsx`.
- **First task:** Use Graphify query first for local discovery; produce the TuffBuffs commerce/PWCC port map before wiring more products or emails.
- **Do not start with:** live Stripe product creation, production webhook subscriptions, or outbound customer emails until the product/email policy is written.
- **MB-013 carry-forward:** Configure the production/staging alert destination and scheduled audit run; decide manual/admin payment parity versus launch exclusion; decide whether certificate paid launch keeps the warning-only bridge or migrates into `PricingPlan`; decide DB uniqueness policy for Stripe Price mappings and Stripe-sourced `UserEntitlement` rows.

### ADR and language check

- No new ADR needed for SESSION_0098. The monitor/audit extends the existing entitlement-first commerce architecture, and `/gear` is a content/affiliate display proof.
- No glossary update needed. Existing commerce terms remain valid: `PricingPlan`, `EntitlementGrant`, `UserEntitlement`, `Invoice`, `Payment`, `StripeWebhookEvent`, and `ProgramEnrollment`.

### Reflection

- The clean local drift audit is useful, but it should not be mistaken for production readiness until schedule, alerting, staging, and owner policy decisions are in place.
- The `/gear` pass showed that the TuffBuffs legacy code can be mined quickly for catalog structure and UI behavior, but the next session should slow down enough to separate affiliate display, Stripe checkout, fulfillment, and outbound email responsibilities.
