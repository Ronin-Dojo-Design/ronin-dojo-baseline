---
title: "ADR 0030 — Per-brand Stripe account (Black Belt Legacy on its own account)"
slug: adr-0030-per-brand-stripe-account
type: decision
status: accepted
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0402
deciders: Brian Scott
pairs_with:
  - docs/architecture/decisions/0006-single-deployment-multi-brand.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
  - docs/sprints/SESSION_0402.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0030 — Per-brand Stripe account (Black Belt Legacy on its own account)

## Status

**Accepted** — 2026-06-17. Narrowly **supersedes the "shared Stripe account" assumption** of the multi-brand
infra decisions (ADR 0004/0006/0012) **for Black Belt Legacy only**. Email (Resend) stays shared.

## Context

The app serves four brands from one Vercel deployment (ADR 0006), brand resolved from hostname. Payments were
single-account: one `STRIPE_SECRET_KEY` + one `STRIPE_WEBHOOK_SECRET` (`services/stripe.ts`), with brand tracked
only on the *data* (`StripeCustomer (userId, brand, accountScope)`, `PricingPlan.brand`). The documented BBL
cutover plan (`CUTOVER_CHECKLIST.md`) assumed BBL would share the platform Stripe account, tagged by brand.

At the BBL go-live the operator decided BBL must use its **own Stripe account** (separate funds, payouts,
reporting, and tax identity) rather than share the platform account. This requires routing checkout to the
correct account and verifying webhooks with the correct account's signing secret.

## Decision

1. **Per-brand Stripe client resolver.** `services/stripe.ts` exports `getStripeClient(brand)` and
   `getStripeWebhookSecret(brand)`. BBL resolves to a dedicated client built from `STRIPE_SECRET_KEY_BBL` when
   set; every other brand (and BBL when the key is absent, e.g. preview) uses the shared platform client. The
   historical `stripe` named export is retained for the platform account.
2. **The account is fixed by the receiving endpoint, not the payload.** Checkout line items are listed *before*
   the brand is known, so the webhook cannot pick an account from the data. Each Stripe account therefore gets
   its own endpoint:
   - `POST /api/stripe/webhooks` — platform account (Baseline / Ronin Dojo Design / WEKAF), unchanged.
   - `POST /api/stripe/webhooks/bbl` — BBL account, verifies with `STRIPE_WEBHOOK_SECRET_BBL`.
   Both delegate to one shared handler `processStripeWebhook(req, stripeClient, webhookSecret)`
   (`server/web/billing/stripe-webhook.ts`); the handler logic is brand-agnostic and account-parameterised.
3. **Checkout/billing-portal creation passes the request brand** to `getStripeClient(brand)` so funds land in
   the correct account (`server/web/billing/actions.ts`).
4. **Email stays shared.** Resend remains one API key with per-brand verified senders (`lib/email.ts`). This ADR
   does not change email.

## Consequences

- BBL revenue, payouts, refunds, and tax live in a separate Stripe dashboard — the operator's goal.
- New env on the BBL deployment: `STRIPE_SECRET_KEY_BBL`, `STRIPE_WEBHOOK_SECRET_BBL` (+ BBL publishable key if
  a client-side flow is added later). Absent ⇒ BBL safely falls back to the platform client and the BBL webhook
  returns 400 (no secret).
- BBL membership `PricingPlan` rows must carry the **BBL account's** `stripePriceId`s — a separate production
  seed (follow-up; no production BBL lineage-membership plans exist yet).
- The BBL account must be proven with its **own** test-mode rehearsal (Stripe CLI → `/api/stripe/webhooks/bbl`)
  before the DNS flip; the Baseline proxy only proves the shared *code path*, not the BBL account wiring.

## Dirstarter docs proof

Stripe/payments is a Dirstarter-owned L1 layer. The Dirstarter baseline ships a single-account Stripe client +
one webhook route; this ADR is a **brand-routing extension** over that baseline (a resolver in front of the
client + a second route reusing the same handler), not a replacement of the Stripe integration. No Dirstarter
capability is bypassed — checkout session creation, the webhook signature-verify → entitlement-grant flow, and
the customer/invoice ledger are unchanged; only the (client, secret) pair is selected per brand.

## Alternatives considered

- **Shared account tagged by brand (the prior plan).** Less code, already rehearsed (SESSION_0369), but commingles
  BBL funds/tax with the platform — rejected by the operator for BBL.
- **Stripe Connect.** The `StripeAccount` model is Connect (org-level fee splits/payouts), which solves
  marketplace payouts, not a separate platform account per brand — wrong tool here.
