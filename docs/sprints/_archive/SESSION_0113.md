---
title: "SESSION 0113 — Phase 3 Merch Smoke Test + Printful POD Planning"
slug: session-0113
type: session
status: closed-full
created: 2026-05-09
updated: 2026-05-09
last_agent: copilot-session-0113
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0112.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0113 — Phase 3 Merch Smoke Test + Printful POD Planning

## Date

2026-05-09

## Operator

Brian Scott + Copilot

## Status

closed-full

## Goal

Phase 3 smoke test: end-to-end merch checkout flow verification (browse → detail → Stripe Checkout → webhook → success page). Then Printful POD integration planning.

## What Landed

- ✅ **Smoke test complete:** End-to-end merch checkout verified — browse → detail → Stripe Checkout → webhook → success page, all 5 steps passing.
- ✅ **FS-0018 bug fix:** Removed invalid `shipping_details` from Stripe `expand` array — was causing success page to show "Order Not Found" despite successful payment.
- ✅ **FS-0018 logged** in `docs/protocols/failed-steps-log.md`.
- ✅ **Stripe product display names fixed:** Created + ran `fix-merch-stripe-display-names.ts` — all 24 Stripe Products renamed from ADR 0014 internal names (`BMA_merch_tb-*`) to friendly names (`TuffBuffs Classic Tee`, etc.). Original names stored as `metadata.adr0014_name`.
- ✅ **Setup script updated:** `setup-merch-stripe-products.ts` now uses `plan.name` as Stripe product name with `adr0014_name` in metadata for future products.
- ✅ **Success page cosmetic fix:** Fixed text/price collision (added `gap-4`, `shrink-0`). Now resolves friendly name via expanded Stripe product + DB fallback.
- ✅ **Merch order confirmation email:** Created `emails/merch-order-confirmation.tsx` React Email template, added `notifyCustomerOfMerchOrder()` to `lib/notifications.ts`, wired into webhook handler via `after()`. Blocked on Resend account setup.
- ✅ **Webhook confirmed working:** `stripe listen` forwarding verified — `🛍️ Merch purchase: size=L color=Gold` logged in dev server.

## Files Touched

- `apps/web/app/(web)/merch/order/success/page.tsx` — MODIFIED. Fixed invalid Stripe expand, cosmetic spacing, friendly product name resolution.
- `apps/web/scripts/fix-merch-stripe-display-names.ts` — NEW. One-time script to rename 24 Stripe Products to friendly names.
- `apps/web/scripts/setup-merch-stripe-products.ts` — MODIFIED. Use `plan.name` for Stripe product name, store ADR name in metadata.
- `apps/web/emails/merch-order-confirmation.tsx` — NEW. React Email template for merch order confirmation.
- `apps/web/lib/notifications.ts` — MODIFIED. Added `notifyCustomerOfMerchOrder()`.
- `apps/web/app/api/stripe/webhooks/route.ts` — MODIFIED. Wired merch order email into `merch_purchase` handler.
- `docs/protocols/failed-steps-log.md` — MODIFIED. Added FS-0018.
- `docs/sprints/SESSION_0113.md` — This file.

## Decisions Resolved

- Stripe product names should be human-friendly (DB `plan.name`), with ADR 0014 internal name stored as `metadata.adr0014_name`.
- Success page resolves display name: DB product name → Stripe product name → line item description (layered fallback).
- Merch order confirmation email wired via `after()` in webhook — non-blocking, follows existing notification pattern.

## Task Log

- SESSION_0113_TASK_01 — End-to-end merch smoke test ✅
- SESSION_0113_TASK_02 — Fix FS-0018 success page crash ✅
- SESSION_0113_TASK_03 — Fix Stripe product display names ✅
- SESSION_0113_TASK_04 — Success page cosmetic fixes ✅
- SESSION_0113_TASK_05 — Merch order confirmation email ✅

## Open Decisions / Blockers

- **Resend not configured:** Merch order confirmation email template + webhook integration is built and wired, but Resend account isn't set up yet. Emails will work once `RESEND_API_KEY` and `RESEND_SENDER_EMAIL` are configured with a verified domain. Follow-on task.
- **Printful POD integration:** Deferred to next session per SESSION_0112 plan.

## Next Session

### Goal

Printful POD integration planning + Resend email setup.

### Petey Plan (pre-staged for SESSION_0114)

#### TASK_01 — Resend account + domain verification setup
- **Agent:** Cody
- **What:** Set up Resend account, verify sending domain, update `.env` with live API key + sender email. Test merch order email delivery end-to-end.
- **Steps:**
  1. Create Resend account at resend.com
  2. Add and verify sending domain (baselinemartialarts.com or ronindojo.com)
  3. Update `.env` with `RESEND_API_KEY` and `RESEND_SENDER_EMAIL`
  4. Test: place a merch order → confirm email arrives
- **Done means:** Order confirmation email delivered to real inbox after Stripe checkout
- **Depends on:** Nothing (user may need to do DNS verification step)

#### TASK_02 — Printful POD integration research + spec
- **Agent:** Petey
- **What:** Research Printful API, document integration spec for TuffBuffs merch POD workflow. Brian already uses Printful for WEKAF Team USA uniforms and TuffBuffs/Baseline/BBL/WEKAF apparel.
- **Steps:**
  1. Read Printful API docs (OAuth, orders, products, webhooks)
  2. Map current merch product catalog to Printful catalog IDs
  3. Define the order flow: Stripe checkout → webhook → Printful order creation → fulfillment tracking
  4. Decide: sync products from Printful → DB, or push orders from DB → Printful?
  5. Write spec doc: `docs/architecture/printful-pod-spec.md`
- **Done means:** Spec doc exists with API integration design, product mapping table, order flow diagram, and open decisions list
- **Depends on:** Nothing

#### TASK_03 — Printful API client scaffold (if runway permits)
- **Agent:** Cody
- **What:** Create `services/printful.ts` client wrapper + types. Create `server/web/merch/printful-actions.ts` with `createPrintfulOrder` server action stub.
- **Steps:**
  1. Install Printful SDK or create typed fetch wrapper
  2. Add `PRINTFUL_API_KEY` to env schema
  3. Create order creation function following spec from TASK_02
  4. Wire into webhook handler (extend `merch_purchase` block)
- **Done means:** Printful order creation callable from webhook, tested with Printful sandbox
- **Depends on:** TASK_02

### Parallelism
TASK_01 and TASK_02 can run in parallel (disjoint concerns). TASK_03 depends on TASK_02.

### Agent assignments
| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Clear execution — account setup + env config |
| TASK_02 | Petey | Research + spec, open decisions expected |
| TASK_03 | Cody | Implementation from spec, if runway permits |

### Open decisions (for SESSION_0114)
- **Printful auth model:** OAuth app vs API key? (likely API key for server-to-server)
- **Product sync direction:** Printful → DB (catalog sync) or DB → Printful (order push only)?
- **Fulfillment webhook:** Does Printful webhook back to us with tracking info, or do we poll?
- **Multi-brand POD:** Same Printful account for all brands, or per-brand accounts?

### Risks
- Printful sandbox availability — need to verify test mode exists
- Resend domain verification may take time (DNS propagation)

### Scope guard
If additional work surfaces during execution, note it in SESSION file under `Open decisions / blockers` — do NOT expand scope mid-task.

### Dirstarter implementation template
- **Docs read first:** Printful API docs, Dirstarter Payments/Stripe integration docs
- **Baseline pattern to extend:** `stripe/webhooks/route.ts` merch handler, `services/stripe.ts` client pattern
- **Custom delta:** Printful order creation from Stripe webhook, product catalog mapping, fulfillment tracking
- **No-bypass proof:** Printful is a new external integration — no Dirstarter equivalent exists

### Inputs to read
- This SESSION file (all tasks complete, Petey plan pre-staged)
- `apps/web/app/api/stripe/webhooks/route.ts` — merch handler to extend
- `apps/web/server/web/merch/actions.ts` — checkout flow for context
- Printful API docs: https://developers.printful.com/docs/
- `docs/architecture/decisions/0014-stripe-product-policy.md`

### First task
TASK_01 (Resend setup) — or TASK_02 (Printful spec) if Brian hasn't done DNS verification yet.

## Reflections

### What went well
- Smoke test caught a real bug (FS-0018) — the success page was silently broken. Testing in a real browser with real Stripe checkout was the right call.
- Stripe webhook listener confirmed working end-to-end with `stripe listen`.
- Friendly product names fix was clean: one-time script + setup script update + success page fallback chain.
- Email template wired quickly by following existing notification patterns exactly.

### What could improve
- FS-0018 was a preventable bug — `shipping_details` should have been validated against Stripe API docs during SESSION_0112 TASK_04. Pre-flight should include Stripe API doc verification for any new Stripe SDK call.
- Multiple dev server port conflicts wasted time. Consider documenting the canonical startup command in the runbook.
- Project-log at 600 lines — manageable now but plan an archive split at S4 boundary (~1000 lines).

### Full Close Evidence

| Check | Done |
|---|---|
| SESSION status → `closed-full` | ✅ |
| What Landed filled | ✅ |
| Files Touched filled | ✅ |
| Decisions Resolved filled | ✅ |
| Open Decisions / Blockers filled | ✅ |
| Task Log filled (5 tasks) | ✅ |
| Next Session pre-staged (Petey plan) | ✅ |
| Project-log entries added (5 tasks + 1 review) | ✅ |
| FS-0018 logged in failed-steps-log | ✅ |
| MB-015 added to manual-boundary-registry | ✅ |
| Graphify updated (5365 nodes, 9433 edges) | ✅ |
