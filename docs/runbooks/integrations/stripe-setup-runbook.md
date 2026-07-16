---
title: "Stripe Setup Runbook"
slug: stripe-setup-runbook
type: runbook
status: active
created: 2026-05-08
updated: 2026-07-16
last_agent: codex-session-0542
pairs_with:
  - docs/sprints/_archive/SESSION_0098.md
  - docs/sprints/SESSION_0344.md
  - docs/knowledge/wiki/manual-boundary-registry.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/runbooks/dev-environment/mcp-usage-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/runbooks/dev-environment/mcp-usage-runbook.md
  - docs/sprints/SESSION_0344.md
tags:
  - stripe
  - payments
  - webhooks
  - subscriptions
  - coupons
  - connect

---

# Stripe Setup Runbook

## Purpose

Set up Stripe keys, webhook event destinations, coupon/promotion-code planning, subscription events, and future Connect payout events for Ronin Dojo.

This runbook separates three pipelines:

1. Current payment/access pipeline.
2. Future coupon and promotion-code sync pipeline.
3. Future BBL Connect lineage payout pipeline.

Do not subscribe events before the app has a handler and test coverage for them.

## Source Docs

- Stripe API keys: <https://docs.stripe.com/keys>
- Stripe webhooks: <https://docs.stripe.com/webhooks>
- Stripe webhook signatures: <https://docs.stripe.com/webhooks/signature>
- Stripe CLI: <https://docs.stripe.com/stripe-cli/use-cli>
- Stripe subscriptions webhooks: <https://docs.stripe.com/billing/subscriptions/webhooks>
- Stripe Connect webhooks: <https://docs.stripe.com/connect/webhooks>
- Connected-account payouts: <https://docs.stripe.com/connect/payouts-connected-accounts>

## Environment Variables

Current app variables:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Future Connect variable, not active until Connect handlers exist:

```env
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
```

Rules:

- `STRIPE_SECRET_KEY` is server-only. Never prefix it with `NEXT_PUBLIC_`.
- `STRIPE_WEBHOOK_SECRET` is not an API key. It verifies the current payment/access webhook destination.
- Local CLI webhook secrets and Dashboard webhook secrets are different. Use the CLI secret locally and Dashboard secret in deployed environments.
- This app does not currently need a publishable key because Checkout is server-created and Stripe-hosted.
- Use test mode first. Do not use live keys for local verification.

## Key Type

For local and staging proof, use a normal test secret key:

```txt
sk_test_...
```

For production, prefer a restricted live key after testing permissions:

```txt
rk_live_...
```

The restricted key must support the APIs this app uses:

- create Checkout Sessions
- list Checkout line items
- create Customer Portal sessions
- read Products, Prices, Coupons, and Promotion Codes
- retrieve Subscriptions
- create Refunds
- read invoice/payment-related objects needed by webhook handling

Future Connect payout work will need additional permissions for connected accounts, transfers, and payout/account state. Do not assume the current restricted key covers Connect.

## Current Payment and Access Event Destination

Use one event destination for the current app payment/access pipeline.

Destination:

```txt
Events on your account
URL: https://<domain>/api/stripe/webhooks
Local URL: http://localhost:<port>/api/stripe/webhooks
Env var: STRIPE_WEBHOOK_SECRET
```

Select only these events:

```txt
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
charge.refunded
charge.dispute.created
```

Do not select all events.

### Why these events

| Event | Why Ronin listens |
| --- | --- |
| `checkout.session.completed` | Initial Checkout success for one-time purchases and subscription starts. Grants access, creates ledger rows, and enrolls users where applicable. |
| `customer.subscription.updated` | Subscription status changes, cancel-at-period-end, active/past-due changes, and subscription access sync. |
| `customer.subscription.deleted` | Subscription ended or canceled. Revokes or suspends subscription-sourced access. |
| `invoice.paid` | Subscription renewal paid. Restores/extends access and records renewal ledger rows. |
| `invoice.payment_failed` | Renewal failed. Applies the failed-payment grace policy. |
| `charge.refunded` | Full refund. Revokes Stripe-sourced purchased access and marks ledger state. |
| `charge.dispute.created` | Dispute opened. Revokes/flags Stripe-sourced purchased access without deleting ledger history. |

## Local Setup with Stripe CLI

From the app environment:

```bash
cd /Users/brianscott/dev/ronin-dojo-app/apps/web
```

Start the app in one terminal.

In another terminal:

```bash
stripe login
stripe listen \
  --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed,charge.refunded,charge.dispute.created \
  --forward-to http://localhost:3000/api/stripe/webhooks
```

Use the actual local port if it is not `3000`.

Stripe prints a signing secret:

```txt
Ready! Your webhook signing secret is whsec_...
```

Put that value in:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Restart the dev server after changing `.env`.

## Local Playwright Checkout Proof

SESSION_0344 added an explicit local-only Stripe service mock for browser e2e proof:

```bash
cd /Users/brianscott/dev/ronin-dojo-app/apps/web
E2E_STRIPE_MOCK=1 bun run dev:e2e  # terminal 1: the server must see the mock flag
E2E_STRIPE_MOCK=1 bun run test:e2e:local -- \
  e2e/stripe/lineage-membership-checkout.spec.ts --project=chromium  # terminal 2
```

This mock is only enabled when `E2E_STRIPE_MOCK=1` and the app is not production. It returns a Checkout
success URL for server-created Checkout Sessions so Playwright can prove the app-owned success shell, then
the Bun bridge synthesizes webhook events against the real `/api/stripe/webhooks` route with mocked Stripe
line items and subscription retrieval.

Use this proof before Stripe CLI or Baseline proxy rehearsals. It does **not** replace Stripe CLI signing
secret verification or Dashboard webhook delivery checks.

## Stripe CLI live test-mode rehearsal (SESSION_0345)

The mock above bypasses signature verification and real Stripe objects. This rehearsal proves the **real**
signed webhook -> entitlement path with `sk_test`, **off prod** (Baseline prod runs a `sk_live` key, so a test
card cannot run against it — see drift D-018). Steps proven in SESSION_0345 for lineage membership checkout:

1. Confirm `apps/web/.env` `STRIPE_SECRET_KEY` is `sk_test_…` and `STRIPE_WEBHOOK_SECRET` equals the CLI
   listener secret: `stripe listen --print-secret` (compare hashes; never echo the secret).
2. Create real **test-mode** Stripe objects: `stripe products create …`,
   `stripe prices create --product <id> --unit-amount 9900 --currency usd` (one-time) and
   `… -d "recurring[interval]=month"` (subscription). Record the `price_…` ids.
3. Seed exactly one disposable, brand-scoped lineage-membership `PricingPlan` (+ `EntitlementGrant`,
   `programId=null`, `metadata.surface=lineage_membership`) bound to those real price ids, plus a disposable
   test user. Deterministic ids; clean by id afterward. (No prod `DATABASE_URL`.)
4. Start the dev server (`DEV_LOGIN_USER_ID=<seeded user>` inline) + `stripe listen --forward-to
   localhost:3000/api/stripe/webhooks --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed,charge.refunded,charge.dispute.created`.
5. Drive `/lineage/join` -> real Stripe-hosted Checkout -> test card `4242 4242 4242 4242` (exp `12/34`, CVC
   `123`). The hosted page seals card inputs in nested iframes and may flag agent automation — completing the
   `cs_test_…` URL in a normal browser is the reliable path.
6. Assert: `stripe listen` forwarded a `[200]` signature-verified `checkout.session.completed` ->
   `UserEntitlement` grant; `stripe subscriptions cancel <sub>` -> `customer.subscription.deleted` -> revoke;
   `membershipCount`/`programEnrollmentCount` stay `0` (ADR 0019).
7. **Returning-customer gotcha (SESSION_0345_FINDING_01):** a second checkout reuses the existing Stripe
   customer; `automatic_tax` + `tax_id_collection` then require `customer_update: { name: "auto", address:
   "auto" }` or Stripe rejects the session. Fixed in `server/web/billing/actions.ts`.
8. Clean up by id (plan/user/entitlement/customer/invoice/webhook rows) and deactivate the test product.

### SESSION_0369 re-proof (stripe@22, BBL brand)

Re-run end-to-end on `stripe@^22.1.1` with a **BBL-branded** fixture driven from `bbl.local:3000/lineage/join`
(pre-flip gate, SOT-ADR D9). All assertions green: subscription grant ACTIVE → CLI cancel →
`customer.subscription.deleted` → REVOKED; one-time PURCHASE grant ACTIVE + success page render; 5/5 events
`[200]` signature-verified + `PROCESSED`; `membershipCount`/`programEnrollmentCount` stayed 0 (ADR 0019);
returning-customer session creation succeeded (the FINDING_01 fix holds). Operational notes:

- **Reusable fixture bridge:** `apps/web/scripts/stripe-rehearsal-seed.ts` (`seed` / `read-state` /
  `cleanup`, base64 payloads) — seeds user(+shells)/org/entitlements/plans bound to REAL test-mode price ids,
  asserts state, cleans by id. Pair with `DEV_LOGIN_USER_ID=<seeded user>` on the dev server.
- Hosted-checkout card fields remain sealed from automation (re-confirmed) — the operator completes the
  `cs_test_…` page manually; on a returning customer **Stripe Link one-click** may complete it instantly.
- `stripe subscriptions cancel` prompts interactively — pipe `echo yes |` in non-interactive shells.
- The CLI listener secret rotates per machine/login: re-sync `.env` `STRIPE_WEBHOOK_SECRET` from
  `stripe listen --print-secret` before each rehearsal (compare hashes).
- Test-account branding (page title) showed "Tuff Buffs" — verify the **prod** Stripe account's public
  business name/branding before the BBL flip (launch-day checklist item).

## Dashboard Setup for Staging or Production

1. Stripe Dashboard -> Developers or Workbench -> Event destinations / Webhooks.
2. Create event destination.
3. Choose `Events on your account`.
4. Choose Webhook endpoint / HTTPS endpoint.
5. Endpoint URL:

```txt
https://<domain>/api/stripe/webhooks
```

1. Select only the current seven payment/access events listed above.
2. Create the destination.
3. Open the destination and reveal/copy the signing secret.
4. Add the secret to the deployed environment:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

1. Trigger a test Checkout or use Stripe test events to verify delivery.

## Coupons and Promotion Codes

Using coupons in Checkout does not require coupon webhook events.

Current flow:

1. Ronin passes an allowed coupon id into Checkout.
2. Stripe applies the discount.
3. `checkout.session.completed` and `invoice.paid` carry the resulting money state.
4. Ronin ledger stores subtotal, discount, and total from the Checkout/invoice path.

Future coupon/promotion-code sync is separate. Add these events only after handlers and tests exist:

```txt
coupon.created
coupon.updated
coupon.deleted
promotion_code.created
promotion_code.updated
```

Future handler contract:

- maintain a Ronin coupon/promotion allowlist or cache
- mark deleted/inactive codes unavailable
- audit coupon availability changes
- reject stale or disallowed coupons before protected Checkout

Manual decision before implementing coupon sync:

- Are coupons managed only in Stripe Dashboard, or does Ronin need app-side coupon administration and audit?
- Which coupon ids are allowed for protected enrollment launch?

## Subscriptions

Current subscription support uses the payment/access destination.

Required subscription events are already in the current seven:

```txt
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
```

Do not add `customer.subscription.created` yet. Current app creates initial subscription access from `checkout.session.completed`. Add `customer.subscription.created` only if subscriptions can be created outside Ronin Checkout, such as manually in Stripe Dashboard or through another integration.

## Future BBL Connect Lineage Payouts

BBL lineage payouts are a separate Connect/revenue-share pipeline.

Do not add Connect payout events to the current payment/access destination.

Future destination:

```txt
Events on connected accounts
URL: https://<domain>/api/stripe/connect/webhooks
Env var: STRIPE_CONNECT_WEBHOOK_SECRET
```

Future connected-account candidate events:

```txt
account.updated
account.external_account.updated
payout.created
payout.updated
payout.paid
payout.failed
```

Future platform transfer candidate events after transfer handlers exist:

```txt
transfer.created
transfer.updated
transfer.reversed
```

Manual decisions before Connect implementation:

- Does BBL receive one organization payout and handle downstream lineage payments manually?
- Or does each payable lineage recipient need an individual connected account?
- What are the Premium and Elite split percentages?
- Is payout timing immediate, monthly, or after refund/dispute windows?
- What is the clawback policy for refunds and disputes?
- Who owns KYC/onboarding support for payout recipients?

## Event Destination Rule

Use separate destinations for separate pipelines:

| Pipeline | Destination | URL | Secret |
| --- | --- | --- | --- |
| Payment/access | Current | `/api/stripe/webhooks` | `STRIPE_WEBHOOK_SECRET` |
| Coupon/promo sync | Future, only if handlers exist | Usually `/api/stripe/webhooks` | `STRIPE_WEBHOOK_SECRET` or separate sync secret if split |
| Connect/payout | Future separate Connect destination | `/api/stripe/connect/webhooks` | `STRIPE_CONNECT_WEBHOOK_SECRET` |

Do not route Connect payout events into the payment/access webhook until the code explicitly supports them.

## Setup Checklist

### Local

- [ ] `STRIPE_SECRET_KEY=sk_test_...` is in `apps/web/.env`.
- [ ] Stripe CLI is logged in.
- [ ] `stripe listen` forwards only the current seven events.
- [ ] CLI `whsec_...` is in `STRIPE_WEBHOOK_SECRET`.
- [ ] Dev server restarted after `.env` changes.
- [ ] A test Checkout reaches `/api/stripe/webhooks`.

### Staging or Production

- [ ] Dashboard destination exists for `/api/stripe/webhooks`.
- [ ] Destination listens only to the current seven events.
- [ ] Destination signing secret is set as `STRIPE_WEBHOOK_SECRET`.
- [ ] Secret key is test mode for staging and live mode only for production.
- [ ] Restricted production key permissions have been tested before launch.
- [ ] No publishable key is exposed unless a future client-side Stripe surface needs it.

### Future Backlog

- [ ] Coupon/promotion-code sync handler exists before subscribing coupon events.
- [ ] Connect payout route exists before subscribing connected-account events.
- [ ] `STRIPE_CONNECT_WEBHOOK_SECRET` is added to env schema before Connect destination is enabled.
- [ ] BBL payout manual decisions are recorded before Connect code begins.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Webhook signature verification fails | Wrong `whsec_...` for the endpoint or environment | Use CLI secret locally, Dashboard secret for deployed endpoint. |
| Stripe Dashboard shows delivery failures | App route unavailable or env secret mismatch | Check deploy URL, route, logs, and `STRIPE_WEBHOOK_SECRET`. |
| Events arrive but no state changes | Event not handled by current code | Do not subscribe unhandled events; add handler/tests first. |
| Coupons apply but no coupon event appears | Expected behavior | Coupon use is reflected through Checkout/invoice events. Coupon admin sync needs future handlers. |
| Subscription renewal access does not update | Missing `invoice.paid` or `invoice.payment_failed` | Confirm both events are selected. |
| Connect payout events do not arrive | Connect destination not configured or wrong account event type | Configure separate Connect destination after Connect route exists. |

## Closeout Evidence

When setup changes, record in the current SESSION file:

- Stripe mode: test or live
- Destination URL
- Event list
- Secret env var name only, never the secret value
- Verification command or Dashboard delivery proof
- Any manual decisions still open
