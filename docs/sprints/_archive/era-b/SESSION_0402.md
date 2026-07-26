---
title: "SESSION 0402 — BBL separate Stripe account seam + go-live cutover prep"
slug: session-0402
type: session--implement
status: closed
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0402
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0401.md
  - docs/architecture/decisions/0030-per-brand-stripe-account.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0402 — BBL separate Stripe account seam + go-live cutover prep

> **Unattended cloud run.** No live Stripe / browser. Static gates (typecheck / lint / format) are the
> in-sandbox proof; the **money path must be proven with a BBL-account test-mode rehearsal** (Stripe CLI →
> `/api/stripe/webhooks/bbl`) before merge + DNS flip. Operator-driven urgent go-live lane.

## Date

2026-06-17

## Operator

Brian + claude-session-0402 (unattended cloud run)

## Goal

Operator wants the `blackbeltlegacy.com` DNS flip "ASAP, but not without this fully working," and to wire BBL's
**own** Stripe account + live email. This session: (1) audit BBL cutover readiness across DNS, Stripe, email;
(2) build the per-brand Stripe seam so BBL transacts on a separate Stripe account (decision: ADR 0030); (3)
produce the operator action checklist + the Stripe product/price spec the operator must create. The pricing
**seed** + the live BBL-account rehearsal are the follow-on gates before the flip.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0401.md` (closed; cinematic explorer mobile overhaul, PR #75).
- Carryover: new operator-directed lane (BBL go-live), unrelated to #75. Developed on its own branch
  `claude/bbl-stripe-separate-account` off `main` so #75 stays clean.

### Branch and worktree

- Branch: `claude/bbl-stripe-separate-account` (off `main` at `5fcd4a9`)
- Status at bow-in: clean off main
- Current HEAD at bow-in: `5fcd4a9`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Payments/Stripe (L1).** Adds a per-brand client resolver in front of the single Stripe client + a second webhook route reusing the shared handler. No change to checkout-session creation, the verify→grant flow, or the customer/invoice ledger. |
| Extension or replacement | **Extension** — brand routing over the baseline Stripe integration; the platform path is byte-behaviour-identical. |
| Why justified | Operator requires BBL funds/payouts/tax in a separate Stripe account (ADR 0030). Single-account code can't route by account. |
| Risk if bypassed | BBL revenue commingled with the platform account; or a brittle in-handler account guess. |

Live docs checked: `CUTOVER_CHECKLIST.md`, `SESSION_0388` (DNS flip), `GAP_MATRIX`, `services/stripe.ts`,
`server/web/billing/{actions,lineage-membership}.ts`, `app/api/stripe/webhooks/route.ts`, `lib/email.ts`,
`scripts/stripe-rehearsal-seed.ts`. Stripe is L1 — ADR 0030 carries the Dirstarter-docs proof.

### Grill outcome

2 forks resolved (operator-answered):

- **Stripe account model → SEPARATE BBL account** (not shared). Triggers the per-brand seam + a dedicated BBL
  webhook endpoint. Contradicts the prior shared-account cutover plan; reconciled in ADR 0030 + CUTOVER note.
- **BBL products/prices → not created yet.** Operator will create them from the spec this session produces, then
  hand back price IDs for the production seed (follow-up task).

## Cutover readiness audit (three areas)

- **Email (Resend) — essentially done.** `blackbeltlegacy.com` DKIM/SPF/DMARC verified (2026-06-11); per-brand
  sender wired (`lib/email.ts`, BBL → `welcome@blackbeltlegacy.com`); magic-link + membership/welcome/join
  emails route brand-correct; prod guard *throws* if the sender env var is missing (no silent failure).
  **Remaining:** set `RESEND_API_KEY` + `RESEND_SENDER_EMAIL_BBL` on the BBL deployment; smoke a magic-link send.
- **DNS — one flip + env vars.** Domain already attached + verified on Vercel; SESSION_0388 flipped then *rolled
  back* over mobile UI issues — **fixed in PR #75** (this unblocks the re-flip). **Remaining:** set
  `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_EMAIL`, S3/R2 vars; re-flip at Bluehost; set BBL `BrandSettings`.
- **Stripe — the real blocker.** Was single-account; no production BBL lineage-membership `PricingPlan` rows
  exist. This session adds the separate-account seam (below). **Remaining (follow-up):** operator creates BBL
  products/prices + provides keys; production pricing seed; BBL-account test-mode rehearsal.

## Petey plan

### Goal

Land the per-brand Stripe account seam (BBL on its own account) behind ADR 0030, with the platform path
behaviour-unchanged, proven by static gates plus the existing webhook test contract; stage the operator
checklist, the product spec, and the pricing-seed follow-up.

### Tasks

#### SESSION_0402_TASK_01 — Per-brand Stripe client resolver (Cody)

- **What:** `services/stripe.ts` → `getStripeClient(brand)` + `getStripeWebhookSecret(brand)`; dedicated BBL
  client from `STRIPE_SECRET_KEY_BBL`; keep platform `stripe` export. Add env `STRIPE_SECRET_KEY_BBL` +
  `STRIPE_WEBHOOK_SECRET_BBL` (`env.ts`, `.env.example`).
- **Done means:** typecheck clean; non-BBL behaviour unchanged.

#### SESSION_0402_TASK_02 — Route checkout to the brand account (Cody)

- **What:** `server/web/billing/actions.ts` — all three `stripe.*` create calls use `getStripeClient(brand)`.
- **Done means:** BBL checkout/portal hit the BBL account when configured; others unchanged.

#### SESSION_0402_TASK_03 — Account-parameterised webhook + BBL endpoint (Cody)

- **What:** Extract the 1309-line handler into `server/web/billing/stripe-webhook.ts` as
  `processStripeWebhook(req, stripeClient, webhookSecret)` (the 3 account-specific calls — `listLineItems`,
  `refunds.create`, `subscriptions.retrieve` — and signature verify now take the passed client/secret). Thin
  `/api/stripe/webhooks/route.ts` (platform) + new `/api/stripe/webhooks/bbl/route.ts` (BBL). The existing
  `route.test.ts` still imports `POST` and mocks `~/services/stripe` → contract preserved.
- **Done means:** typecheck clean; webhook test contract intact; platform path behaviour-identical.

#### SESSION_0402_TASK_04 — Decision + cutover docs (Petey/Cody)

- **What:** ADR 0030 (per-brand Stripe account); correct the CUTOVER_CHECKLIST "shared Stripe" line; this
  SESSION record + operator checklist + product spec.
- **Done means:** docs reconcile the shared→separate decision; wiki-lint clean.

#### SESSION_0402_TASK_05 — Production BBL pricing seed (FOLLOW-UP — blocked on operator)

- **What:** Seed BBL lineage-membership `PricingPlan` rows (brand BBL, `metadata.surface=lineage_membership`,
  entitlement grants, the **BBL account's** `stripePriceId`s). Pattern: `scripts/stripe-rehearsal-seed.ts`.
- **Blocked on:** operator creating the products/prices (spec below) + sending price IDs + confirming amounts.
- **Done means:** `/lineage/join` on BBL lists sellable plans; BBL-account rehearsal grants+revokes entitlements.

### Open decisions

- **Pricing amounts + tiers** for the BBL membership products — operator to confirm (spec below proposes a shape).

### Risks

- **Money-path refactor with no live Stripe in-sandbox.** Mitigated: platform path is parameter-identical; the
  webhook test contract is preserved; **BBL-account test-mode rehearsal is a hard gate before merge/flip**.
- **`siteConfig.url` is a single shared env** (`config/site.ts`) feeding checkout success/cancel + admin links —
  confirm the BBL deployment's `NEXT_PUBLIC_SITE_URL` is BBL, else those redirect to the wrong domain (parked).

### Scope guard

- No change to entitlement logic, ledger, customer mapping, or email this session.
- No invented prices committed — the seed waits on operator-confirmed amounts + real price IDs.
- DNS flip is **not** performed here — it is the operator's final step after Stripe + email are proven.

## Operator action checklist (do these to go live)

> Order matters: prove Stripe + email on the BBL account/preview **before** the DNS flip.

### A. Stripe — create the BBL account products/prices (then send IDs back)

In the **new BBL Stripe account** (live mode), create one Product per membership tier, each with a recurring
Price (the lineage-membership flow supports MONTHLY/ANNUAL subscriptions or a one-time CUSTOM plan):

| Product (suggested) | Entitlement it grants | Billing | Amount (confirm) |
| --- | --- | --- | --- |
| Black Belt Legacy — Premium | `LINEAGE_PREMIUM` | recurring monthly (+ optional annual) | _operator sets_ |
| Black Belt Legacy — Elite | `LINEAGE_ELITE` | recurring monthly (+ optional annual) | _operator sets_ |
| Black Belt Legacy — Legend (optional) | `LINEAGE_LEGEND` | recurring annual | _operator sets_ |

Send back, per price: the **price ID** (`price_…`), product name, entitlement key, interval (monthly/annual),
and amount. (Each PricingPlan needs `metadata.surface = "lineage_membership"` + an entitlement grant — the seed
sets those; you only provide the Stripe IDs + amounts.)

### B. Stripe — register the BBL webhook + set keys in Vercel

1. In the BBL account, add a webhook endpoint: `https://blackbeltlegacy.com/api/stripe/webhooks/bbl`
   (events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.paid`, `invoice.payment_failed`, `charge.refunded`, `charge.dispute.created`).
2. Set on the BBL Vercel deployment: `STRIPE_SECRET_KEY_BBL` (BBL secret key) and `STRIPE_WEBHOOK_SECRET_BBL`
   (the new endpoint's signing secret).
3. Rehearse off-prod first: `sk_test` BBL key + `stripe listen --forward-to localhost:3000/api/stripe/webhooks/bbl`
   → real test-card checkout → confirm entitlement grant + revoke (pattern: `scripts/stripe-rehearsal-seed.ts`).

### C. Email — confirm Vercel env (domain already verified)

- Set `RESEND_API_KEY` and `RESEND_SENDER_EMAIL_BBL=welcome@blackbeltlegacy.com` on the BBL deployment.
- Smoke: `bun run scripts/send-resend-production-test.tsx <inbox> --brand BBL`, then a live magic-link send.

### D. DNS + site env (last)

- Set `NEXT_PUBLIC_SITE_URL` (BBL origin), `NEXT_PUBLIC_SITE_EMAIL`, and the S3/R2 media vars on the BBL
  deployment; confirm the domain is attached to the correct Vercel project.
- Lower Bluehost TTL → re-flip apex `A`/`CNAME www` per `vercel-domain-setup-runbook.md`. Rollback = apex A
  back to `151.101.66.159`.
- After flip: set BBL `BrandSettings` at `/app/brand-settings`; browse `/lineage`, `/lineage/join` (plans show),
  run the money-free webhook delivery check.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0402_TASK_01 | landed | `getStripeClient`/`getStripeWebhookSecret` + `STRIPE_*_BBL` env. |
| SESSION_0402_TASK_02 | landed | `billing/actions.ts` checkout/portal use `getStripeClient(brand)`. |
| SESSION_0402_TASK_03 | landed | Handler extracted to `stripe-webhook.ts`; thin platform route + new `/bbl` route. |
| SESSION_0402_TASK_04 | landed | ADR 0030 + CUTOVER note + this record + operator checklist/spec. |
| SESSION_0402_TASK_05 | blocked | Production BBL pricing seed — blocked on operator products/prices + amounts. |

## What landed

- **Per-brand Stripe account seam (ADR 0030).** `getStripeClient(brand)` / `getStripeWebhookSecret(brand)` in
  `services/stripe.ts`; BBL client from `STRIPE_SECRET_KEY_BBL`; platform path unchanged. Checkout + billing
  portal route to the brand account. Webhook handler extracted to `server/web/billing/stripe-webhook.ts`
  (`processStripeWebhook(req, client, secret)`); platform `/api/stripe/webhooks` stays thin + new BBL
  `/api/stripe/webhooks/bbl`.
- **Decision + docs.** ADR 0030; CUTOVER_CHECKLIST "shared Stripe" line corrected to the separate-account
  decision; operator go-live checklist + Stripe product/price spec captured here.
- **Cutover audit.** Email ready (just Vercel env + smoke); DNS = re-flip + env (unblocked by PR #75's mobile
  fix); Stripe seam now in place, pricing seed + BBL-account rehearsal are the remaining money-path gates.

## Decisions resolved

- BBL uses its **own Stripe account** (ADR 0030), email stays shared.
- BBL products/prices created by operator from the spec; pricing seed is a follow-up.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/services/stripe.ts` | `getStripeClient`/`getStripeWebhookSecret` resolvers + BBL client. |
| `apps/web/env.ts` | `STRIPE_SECRET_KEY_BBL`, `STRIPE_WEBHOOK_SECRET_BBL`. |
| `apps/web/.env.example` | Document the BBL Stripe vars. |
| `apps/web/server/web/billing/actions.ts` | Checkout/portal via `getStripeClient(brand)`. |
| `apps/web/server/web/billing/stripe-webhook.ts` | **New (moved+param)** — `processStripeWebhook(req, client, secret)`. |
| `apps/web/app/api/stripe/webhooks/route.ts` | Thin platform-account wrapper. |
| `apps/web/app/api/stripe/webhooks/bbl/route.ts` | **New** — BBL-account webhook endpoint. |
| `docs/architecture/decisions/0030-per-brand-stripe-account.md` | **New** ADR. |
| `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md` | Shared→separate Stripe decision note. |
| `docs/sprints/SESSION_0402.md` | This record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (apps/web, dummy DB env) | _filled at bow-out_ |
| `bun run lint:check` / `format:check` | _filled at bow-out_ |
| `bun run wiki:lint` (root) | _filled at bow-out_ |
| BBL-account Stripe test-mode rehearsal | **Deferred — operator gate before merge/flip** (no live Stripe in sandbox). |

## Open decisions / blockers

- **Pricing seed blocked on operator** (products/prices + amounts + price IDs).
- **Live BBL-account webhook rehearsal is a hard gate** before merge + DNS flip.

## Next session

### Goal

Once the operator creates the BBL products/prices and provides price IDs + amounts: write + run the production
BBL lineage-membership pricing seed, then drive a BBL-account test-mode rehearsal (`/api/stripe/webhooks/bbl`)
proving grant+revoke; confirm email + site env on the BBL deployment; then the operator performs the DNS flip.

### First task

Add `scripts/seed-bbl-lineage-pricing.ts` (config = operator's tiers/amounts/price IDs) creating BBL
`PricingPlan` rows (+ entitlement grants + `metadata.surface=lineage_membership`); rehearse against the BBL
test-mode account.

## Review log

_Filled at bow-out._

## Hostile close review

_Filled at bow-out._

## ADR / ubiquitous-language check

- ADR **0030** created (per-brand Stripe account). No new ubiquitous-language terms.

## Reflections

_Filled at bow-out._

## Full close evidence

_Filled at bow-out._
