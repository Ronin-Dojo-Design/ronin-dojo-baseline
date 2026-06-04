---
title: "Black Belt Legacy — Launch Cutover Checklist"
slug: bbl-cutover-checklist
type: report
status: active
created: 2026-06-04
updated: 2026-06-04
last_agent: claude-session-0345
pairs_with:
  - docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md
  - docs/runbooks/deploy/bbl-production-runbook.md
  - docs/product/black-belt-legacy/GAP_MATRIX.md
  - docs/knowledge/wiki/test-fail-fix-ledger.md
  - docs/architecture/decisions/0015-domain-hosting-infrastructure.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0343.md
  - docs/sprints/SESSION_0344.md
tags:
  - bbl
  - blackbeltlegacy
  - launch
  - cutover
  - checklist
---

# Black Belt Legacy — Launch Cutover Checklist

The cross-layer sequencer for a safe `blackbeltlegacy.com` cutover. Spans the three readiness layers
(deploy/DNS, features, tests). The deploy mechanics live in
[`bbl-production-runbook.md`](../../runbooks/deploy/bbl-production-runbook.md); feature status in
[`GAP_MATRIX.md`](GAP_MATRIX.md); test status in
[`test-fail-fix-ledger.md`](../../knowledge/wiki/test-fail-fix-ledger.md). This doc only **sequences** them.

> Target: ASAP, soft aim this weekend, **not rushed or sloppy** — safe + secure over fast.
> `baselinemartialarts.com` is the live staging-prod proxy (same Vercel deployment, brand-scoped DB,
> shared Stripe/Resend — ADR 0004/0006/0012). A journey proven on Baseline is proven on the code+infra BBL
> will use.

## Layer 1 — Deploy / DNS

| # | Item | State |
| --- | --- | --- |
| 0 | **DNS source of truth** — `blackbeltlegacy.com` NS = `ns1/ns2.bluehost.com`; registrar Bluehost; WP origin on Flywheel behind Fastly (apex A `151.101.66.159`). | ✅ **RESOLVED (SESSION_0343)** — Bluehost is DNS authority (matches ADR 0015). Cutover = repoint records **at Bluehost**, not a zone migration. |
| 1 | BBL brand renders on Vercel prod (`data-brand=BBL`, `/disciplines/bjj`, `/lineage/rigan-machado-bjj-lineage`). | pending verify |
| 2 | Inventory WP content to migrate (BBL-only — Baseline cannot proxy). | pending |
| 3 | 301 redirect map: old WP permalinks → Vercel routes (BBL-only). | pending |
| 4 | Attach `blackbeltlegacy.com` to bbl Vercel project. | pending |
| 5 | Apply DNS at Bluehost: apex A → Vercel; `www` CNAME → `cname.vercel-dns.com` (copy Baseline's shape). | pending |
| 6 | Verify DNS + SSL + 200. **Rollback** = revert apex A to `151.101.66.159`. | pending |
| 7 | Resend: add `blackbeltlegacy.com` + its own DKIM (BBL-only — Baseline cannot proxy). | pending |
| 8 | Smoke prod surfaces + a magic-link email. | pending |

## Layer 2 — Features (GAP_MATRIX)

6 built / 17 partial / 6 not-started / 3 infra-only (of 32). Launch-blocking partials to confirm before
go-live: authenticated claim (BBL-PROFILE-002), trust badges (BBL-PROFILE-004/LINEAGE-005), and role-scoped
editor enforcement (BBL-EDITOR-003/004, security-adjacent). Full list + ranking in `GAP_MATRIX.md`
"highest-value next tasks".

## Layer 3 — Tests / verification

Unit gate green + deterministic (`--parallel=1`, SESSION_0342). Launch-critical e2e gaps **ranked**:

| Rank | e2e gap | Why | Baseline proxy? |
| --- | --- | --- | --- |
| 1 | **Registration / sign-up** | Member front door; every journey depends on it. | ✅ yes — exercise on Baseline |
| 2 | **Stripe checkout (local test-mode harness)** → success/cancel | Money path. | ✅ local proof green in SESSION_0344; Baseline proxy rehearsal still required before cutover |
| 3 | Member join → tier → entitlement lifecycle | User-facing entitlement gating. | ✅ local proof green in SESSION_0344; same webhook (ADR 0012) |
| 4 | Authenticated claim flow | GAP_MATRIX #1; BBL-PROFILE-002. | partial — claim is BBL-data, journey provable on Baseline |
| 5 | Role-scoped editor access (BRANCH/NODE_EDITOR) | Security-adjacent; BBL-EDITOR-003/004. | ✅ yes — same RBAC |

**Baseline proxy boundary** — Baseline proves: registration, checkout/entitlement, RBAC (shared code+infra).
Baseline does **not** prove (BBL-only): per-domain Resend DKIM, the 301 redirect map, WP content migration.
Proxy-test accounts land in the shared prod DB (brand-scoped) — clean them up after each proxy run; mind the
shared-`brand` `StripeCustomer` lookup (SESSION_0342).

### Baseline staging-prod proxy procedure

Use `https://baselinemartialarts.com` for live behavior proof before BBL cutover because it is the same
Vercel deployment, auth stack, brand-scoped DB, Stripe webhook, and Resend integration BBL will use.

1. **Local gate first:** run the registration smoke from `apps/web`:
   `bunx playwright test e2e/auth/registration.spec.ts --project=chromium`. This proves the local
   `/auth/login` magic-link registration path creates a Better Auth session plus Passport and
   DirectoryProfile shells, then lands on `/me`.
2. **Local BBL paid-path gate:** run the lineage membership checkout proof from `apps/web`:
   `E2E_STRIPE_MOCK=1 bunx playwright test e2e/stripe/lineage-membership-checkout.spec.ts --project=chromium`.
   This seeds disposable Baseline-branded lineage membership `PricingPlan` rows, proves `/lineage/join`
   cancel and success shells, drives the real Stripe webhook route with mocked Stripe line items/subscription
   retrieval, grants/revokes `UserEntitlement`, and asserts no `Membership.status` or `ProgramEnrollment`
   mutation.
3. **Baseline live registration proxy:** open `https://baselinemartialarts.com/auth/login`, submit a unique
   proxy-test email such as `bbl-proxy-YYYYMMDD-<initials>@...`, complete the magic link from the controlled
   inbox, and confirm `/me` renders **My Passport**. Record the account email and timestamp in the cutover
   evidence packet.
4. **Real-network checkout proof (SESSION_0345 correction).** `baselinemartialarts.com` prod runs a **live**
   Stripe key, so a test card cannot run against it (live key rejects test cards; a real card = real money).
   Prove the real, signature-verified webhook -> entitlement path **off prod** instead, two equivalent ways:
   - **Stripe CLI local test-mode rehearsal (done, SESSION_0345):** `sk_test` + `stripe listen --forward-to
     localhost:3000/api/stripe/webhooks` -> real Stripe-hosted Checkout (test card `4242…`) -> real signed
     `checkout.session.completed`/`invoice.paid`/`customer.subscription.deleted` -> `UserEntitlement`
     grant/revoke. See `stripe-setup-runbook.md` "Stripe CLI live test-mode rehearsal".
   - **Or a Vercel Preview deploy wired to test-mode Stripe** for a deployed-URL variant.
   The **deployed prod domain** gets only a **money-free** verification: confirm the live webhook destination
   and `STRIPE_WEBHOOK_SECRET` are wired (Stripe Dashboard delivery log), then a deliberate **launch-day
   real-charge-and-refund** smoke decision — not a rehearsal.
5. **Cleanup expectation:** any local/preview rehearsal rows are removed by id (SESSION_0345 cleaned plan,
   user, entitlement, customer, invoice, webhook rows). If a launch-day real-charge smoke is run on prod,
   refund + archive the artifacts; do not reuse a shared `brand` `StripeCustomer` row for repeated runs.

## Slice 5 (PORTMAP-0006) ordering

**Sequenced behind the top launch gates** — the lineage viewer already works (BBL-LINEAGE-001/002 done), so
the adaptive-connector spike is polish, not a launch gate. The cheap de-risk (`canvas-model.test.ts` +
extracting `connector-geometry.ts` with a unit test) runs first, ahead of the spike.

## Cross-references

- [BBL Production Runbook](../../runbooks/deploy/bbl-production-runbook.md) — deploy/DNS mechanics.
- [GAP_MATRIX](GAP_MATRIX.md) — feature status.
- [Launch doc (BBL-first banner)](../../architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md).

**Honor the Lineage. Build the Future. OSSS.**
