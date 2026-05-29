---
title: "SESSION 0093 — Commerce, PWCC, and Brand Launch Petey Plan"
slug: session-0093
type: session
status: closed-quick
created: 2026-05-07
updated: 2026-05-07
last_agent: codex-session-0093
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0092.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0093 — Commerce, PWCC, and Brand Launch Petey Plan

## Date

2026-05-07

## Operator

Brian Scott + Codex acting as Petey

## Status

closed-quick

## Goal

Bow in from SESSION_0092, use Graphify to select the commerce and component-porting source files, then stage the next few sessions so payment structures are solid before PWCC and four-brand launch rollout work.

## Bow-in

### Previous session pickup

- `SESSION_0092` closed the E2E infrastructure sprint with 12/12 Playwright tests passing and a reusable tournament fixture/global setup pattern.
- `SESSION_0092` listed commit/push as the next task. Current git state shows this is already resolved:
  - Branch: `main`
  - Status: clean
  - `origin/main` at `bb0fb5f`
  - Recent commits include `e1cc02c feat(e2e): Playwright E2E infrastructure — 12/12 tests green` and `bb0fb5f chore: gitignore root-level Playwright test artifacts`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Monetization/payments, Prisma, Better Auth/action protection, component porting/UI primitives, launch theming/content |
| Extension or replacement | Extension. Keep Stripe Checkout/webhooks, Prisma feature folders, Better Auth protected actions, and Dirstarter primitives; add Ronin entitlement/payment templates on top. |
| Why justified | May 18 all-brand launch depends on paid course/certification/membership flows and then visible brand/content surfaces. |
| Risk if bypassed | Payment access can drift from money movement, subscriptions can remain active after cancellation/failure, PWCC can duplicate components, and launch pages can promise features not backed by working flows. |

### Protocol checks

- `WORKFLOW_5.0.md`: May 18, 2026 remains the governing all-brand launch goal with differentiated launch depth.
- `manual-boundary-registry.md`: MB-013 financial transaction readiness and MB-014 production multi-domain/env hardening remain open.
- `drift-register.md`: no open drift directly blocks this plan, but `monetization-entitlements-spec.md` is stale against the current schema because the entitlement layer now exists.
- `failed-steps-log.md`: relevant mitigations are FS-0001/FS-0008 (Dirstarter primitive/API spot-checks), FS-0006/FS-0007 (Petey + WORKFLOW compliance), FS-0010/FS-0011 (git discipline).

## Graphify check

- Graph status: **current**. `graphify-out/GRAPH_REPORT.md` was built from `bb0fb5ff`; `HEAD` is `bb0fb5f`.
- Report summary: 4,852 nodes, 8,640 edges, 391 communities.
- Query used:
  - `Stripe checkout entitlement payment webhook tournament registration subscription PricingPlan certificate membership`
  - `tournament registration checkout webhook stripeCheckoutSessionId paymentStatus refund createRegistration`
  - `PWCC Playwright component conversion pipeline component porting legacy React Next brand launch`
- Files selected from graph:
  - `docs/architecture/monetization-entitlements-spec.md`
  - `docs/architecture/decisions/0011-entitlement-first-commerce.md`
  - `docs/architecture/dirstarter-commerce-alignment.md`
  - `apps/web/prisma/schema.prisma`
  - `apps/web/server/web/tournaments/register.ts`
  - `apps/web/app/api/stripe/webhooks/route.ts`
  - `apps/web/app/api/stripe/webhooks/route.test.ts`
  - `apps/web/server/web/tournaments/register.concurrency.test.ts`
  - `apps/web/server/web/products/actions.ts`
  - `apps/web/server/web/entitlement/check-entitlement.ts`
  - `apps/web/server/web/entitlement/grant-entitlement.ts`
  - `docs/runbooks/react-to-next-component-porting-runbook.md`
  - `docs/knowledge/wiki/component-porting/graphify-component-port-map.md`
  - `docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/PWCC-ASCII-flow-component-port-pipeline.md`
  - `docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/PW-proof-gate.md`
- Verification note: Graph output was used only to select files. Source review confirmed the entitlement schema and webhook grant path exist; the older monetization spec is behind the code.

## Dirstarter and Stripe docs checked

- Dirstarter Payments: https://dirstarter.com/docs/integrations/payments
- Dirstarter Monetization: https://dirstarter.com/docs/monetization
- Dirstarter Prisma: https://dirstarter.com/docs/database/prisma
- Dirstarter Authentication: https://dirstarter.com/docs/authentication
- Stripe Checkout: https://docs.stripe.com/payments/checkout
- Stripe subscription integration design: https://docs.stripe.com/billing/subscriptions/design-an-integration
- Stripe Customer Portal: https://docs.stripe.com/customer-management/integrate-customer-portal
- Date checked: 2026-05-07

## Current commerce truth

### What exists

- `PricingPlan` already has `stripeProductId`, `stripePriceId`, and `entitlementGrants`.
- `Entitlement`, `EntitlementGrant`, and `UserEntitlement` exist in `schema.prisma`.
- `checkEntitlement()` gates tournament registration by brand + active entitlement.
- `grantEntitlementsFromCheckout()` maps Checkout line-item Stripe Price IDs to `PricingPlan` rows, then creates/reactivates `UserEntitlement`.
- Tournament paid registration is the strongest payment proof template:
  - authenticated action creates Checkout with server-side metadata,
  - webhook verifies Stripe signature,
  - fulfillment re-checks capacity inside a Serializable transaction,
  - rejected paid registrants get persisted `CANCELLED` / `REFUNDED` state,
  - tests synthesize `checkout.session.completed` events and assert DB state plus refund calls.

### Gaps before paid course/certification/membership launch

- `monetization-entitlements-spec.md` still says entitlements are not modeled; update it before using it as planning truth.
- `createStripeCheckout` is generic and accepts client-supplied metadata. It is fine as a Dirstarter listing/ads pattern, but not the protected Ronin paid-access template.
- No stored Stripe Customer ID was found, which blocks a clean Customer Portal integration and reliable subscription/customer correlation.
- Webhook handling currently covers `checkout.session.completed` and `customer.subscription.deleted`; subscription update/failure/refund/dispute handling is not launch-solid yet.
- Checkout entitlement grants do not yet consistently create Ronin `Invoice` + `Payment` ledger rows for non-tournament purchases.
- Certificate orders still have inline `priceCents`; paid certification/certificate flows need a decision on when they become `PricingPlan` rows.

## Recommended payment structure

### Shared rules

- Keep `PricingPlan` as the internal offer/price row for launch.
- Use Stripe Product/Price as external provider objects, stored on `PricingPlan`.
- Keep `Product` as a domain concept, not a Prisma table, until multiple sellable entity types require one unified catalog.
- Protected paid access must use a `userActionClient` checkout action that derives `userId`, brand, org, and metadata server-side.
- Payment success grants/revokes entitlements first; enrollments, registrations, certificate orders, and dashboard access are projections.
- All paid-access Checkout/webhook paths should have a fixture/test pattern modeled after the tournament webhook harness.

### Flow matrix

| Purchase type | Stripe mode | Ronin source of truth | Fulfillment projection | Required proof |
| --- | --- | --- | --- | --- |
| Tournament/event registration | `payment` | `Registration` + `RegistrationEntry` | Registration submitted or cancelled/refunded after capacity re-check | Existing tournament webhook + concurrency tests remain the template |
| Course/curriculum one-time access | `payment` | `PricingPlan` -> `EntitlementGrant` -> `UserEntitlement` | `ProgramEnrollment` / `CourseEnrollment` activation after entitlement grant | Synthesized Checkout event creates entitlement + enrollment + ledger row |
| Certification / certificate order | `payment` | `PricingPlan` or `CertificateOrder` during migration | `CertificateOrder` paid, optional `CertificateIssuance` after approval | Checkout event creates order/payment, no issuance without approval gate |
| Class membership | `subscription` | `PricingPlan` recurring Stripe Price + `UserEntitlement` | Membership/course/class access active while subscription entitlement is active | Subscription checkout grant + cancellation/revocation + Customer Portal path |
| Brand/directory tier | `subscription` or `payment` | `SubscriptionTier`/`UserBrandSubscription` plus Dirstarter Tool listing where applicable | Featured listing or premium brand/directory access | Keep listing monetization separate unless protected access requires entitlement |
| Manual/cash/check/barter/comp | none | `Invoice` + `Payment` | `grantEntitlement` / admin service grants or revokes access | Admin-only test proves no Stripe dependency and same entitlement result |

## Petey plan

### Goal

Solidify the commerce contract and schedule the next sessions so payments are launch-safe before component conversion and brand/content rollout work starts.

### Tasks

#### TASK_01 — Commerce truth reconciliation

- **Agent:** Petey + Giddy
- **What:** Update the planning truth around entitlements, PricingPlans, Stripe IDs, and payment templates.
- **Steps:**
  1. Mark `monetization-entitlements-spec.md` current where schema has already landed.
  2. Add a payment-structure matrix or launch-safe appendix.
  3. Document that tournament webhook tests are the payment proof template.
  4. Record remaining commerce gaps under MB-013.
- **Done means:** docs no longer claim entitlements are missing; next Cody task has one commerce contract to follow.
- **Depends on:** nothing.

#### TASK_02 — Payment proof template for subscriptions and one-time purchases

- **Agent:** Cody + Doug
- **What:** Reuse the tournament webhook test shape for subscription and one-time entitlement flows.
- **Steps:**
  1. Extract or duplicate the minimal event-builder pattern from `route.test.ts`.
  2. Add one one-time Checkout proof for course/certification entitlement grant.
  3. Add one subscription Checkout proof for membership entitlement grant.
  4. Add cancellation/revocation proof for subscription source IDs.
  5. Identify Customer Portal/customer ID schema or service gap.
- **Done means:** tests prove paid-access grants and revokes entitlements without hitting real Stripe.
- **Depends on:** TASK_01.

#### TASK_03 — WORKFLOW 5.0 calendar and PWCC staging

- **Agent:** Petey + Desi + Brandon
- **What:** Keep the May 18 launch board honest after commerce is sequenced.
- **Steps:**
  1. Reconcile `WORKFLOW_5.0.md` through SESSION_0092.
  2. Stage SESSION_0094-0098 around commerce, PWCC, and brand launch surfaces.
  3. Pick the first PWCC slice only after commerce hardening is scheduled.
  4. Create or update component port-map records before any porting work.
- **Done means:** forward calendar shows commerce first, PWCC second, content/brand rollout third.
- **Depends on:** TASK_01.

### Parallelism

Commerce docs and calendar reconciliation can happen in one planning session. Payment proof implementation should be sequential because it touches shared webhook and entitlement surfaces. PWCC work can run after the commerce implementation plan is stable.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey + Giddy | Requires source-of-truth cleanup and architecture guardrails. |
| TASK_02 | Cody + Doug | Clear implementation + test proof work. |
| TASK_03 | Petey + Desi + Brandon | Cross-lane calendar, component, and brand rollout sequencing. |

### Open decisions

- Customer ID storage: add a Stripe customer field to `User`, or a separate billing/customer mapping model?
- Subscription failure grace: add `PAST_DUE` to entitlement status, or represent grace with `endsAt` and active/revoked only?
- Certificate pricing: migrate paid certificates to `PricingPlan` immediately, or keep `CertificateTemplate.priceCents` as a launch bridge?
- Tournament payments: should tournament registrations also write `Invoice`/`Payment`, or remain registration-local until post-launch?

### Risks

- Generic Checkout action can become a security hole for paid access if reused without authenticated server-side metadata.
- Subscription cancellation alone is not enough lifecycle coverage for launch; update/failure/refund/dispute events need explicit handling or accepted deferral.
- PWCC before commerce hardening risks polishing screens around incomplete paid access.
- Brand rollout before launch definitions risks promising more than the May 18 differentiated-depth plan supports.

### Scope guard

This session is Petey planning and docs/calendar staging. No production payment code or component ports should land in SESSION_0093 unless Brian explicitly pivots the session to Cody execution.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Payments, Monetization, Prisma, Authentication; Stripe Checkout, subscription design, Customer Portal. Checked 2026-05-07.
- **Baseline pattern to extend:** `server/web/products/actions.ts`, `app/api/stripe/webhooks/route.ts`, `PricingPlan`, `EntitlementGrant`, `UserEntitlement`, tournament registration webhook tests.
- **Custom delta:** Ronin adds brand-scoped martial-arts entitlements, internal ledger rows, registration/enrollment/certificate projections, and paid-access proof tests.
- **No-bypass proof:** Stripe Checkout/webhooks stay the payment surface; Prisma remains data truth; Better Auth/safe actions protect purchase starts; Dirstarter listing monetization is reused only where it fits.

## Next sessions

| Session | Primary lane | Goal | First task |
| --- | --- | --- | --- |
| SESSION_0094 | Commerce | Reconcile commerce docs + payment structure matrix against current entitlement code | Patch `monetization-entitlements-spec.md` and MB-013 notes |
| SESSION_0095 | Commerce QA | Add reusable one-time + subscription Checkout/webhook proof tests using the tournament harness as template | Build synthetic Checkout Session fixtures for `PricingPlan.stripePriceId` grants |
| SESSION_0096 | Commerce implementation | Close launch-blocking subscription/customer gaps: customer ID, portal route, lifecycle webhook events or documented deferrals | Decide customer storage model, then implement smallest slice |
| SESSION_0097 | PWCC | Run first Playwright-first component discovery and create port-map records; no broad grep storm | Pick one low-risk display component and capture old/new proof requirements |
| SESSION_0098 | Brand launch | Convert PWCC output into first brand/content rollout slice for Baseline, BBL, WEKAF, and RDD launch surfaces | Build four-brand launch definition matrix and content checklist |

## First Cody handoff

Start with SESSION_0094, not component porting:

1. Update `monetization-entitlements-spec.md` so it reflects the landed entitlement schema.
2. Add the payment flow matrix above as the launch-safe contract.
3. Update MB-013 with concrete proof requirements for one-time and subscription flows.
4. Do not add production code until the doc truth and test targets agree.

## End-of-planning workspace cleanup

Brian added one cleanup requirement after the Petey plan: stop using the Local by Flywheel WordPress `public` root as a workspace/repo root. The active workspace should contain only:

- `/Users/brianscott/dev/ronin-dojo-app`
- `/Users/brianscott/Local Sites/DirStarter /dirstarter_template` as an untouched Dirstarter reference checkout

Actions taken:

- Created `/Users/brianscott/dev/ronin-dojo.code-workspace` with exactly those two workspace folders.
- Verified `dirstarter_template` is a clean Git checkout on `main...origin/main` with origin `https://github.com/dirstarter/dirstarter.git`.
- Removed the empty accidental `docs/` and `docs/sprints/` folders created under `/Users/brianscott/Local Sites/ronin-dojo/app/public/`.
- Moved leftover `/Users/brianscott/Local Sites/ronin-dojo/app/public/.playwright-mcp` to `/Users/brianscott/dev/ronin-dojo-app/.playwright-mcp`.
- Added `.playwright-mcp/` to root `.gitignore` so Playwright MCP artifacts stay local-only.

Boundary note: it is safe to remove the WordPress public root from the VS Code workspace. This does **not** mean deleting or archiving the WordPress install from disk. MB-012 remains open until Brian explicitly wants that filesystem cleanup or archive step.

## What landed

- Bowed in from `SESSION_0092` and confirmed the E2E work is already committed/pushed on `main`.
- Ran Graphify commerce/PWCC queries and verified selected files against source.
- Wrote the launch-safe payment structure plan and next-session sequence.
- Reconciled `WORKFLOW_5.0.md` through SESSION_0093 and staged SESSION_0094-0102.
- Created a two-folder VS Code workspace at `/Users/brianscott/dev/ronin-dojo.code-workspace`.
- Moved `.playwright-mcp` out of the WP public root and ignored it in Git.

## Files touched

| File | Note |
| --- | --- |
| `.gitignore` | Added `.playwright-mcp/` local artifact ignore |
| `docs/sprints/SESSION_0093.md` | New planning session + quick close |
| `docs/protocols/WORKFLOW_5.0.md` | Calendar reconciled through SESSION_0093 with commerce/PWCC/brand forward plan |
| `docs/protocols/project-log.md` | Added SESSION_0093 task rows |
| `/Users/brianscott/dev/ronin-dojo.code-workspace` | New local workspace file, outside Git repo |

## Decisions resolved

- Payment hardening comes before PWCC/component conversion.
- Tournament paid-registration webhook tests are the template for subscription and one-time payment proof.
- Active workspace should contain only `ronin-dojo-app` plus the clean `dirstarter_template` reference checkout.
- The WP public root should not remain in the active workspace, but the install is not deleted by this session.

## Open decisions / blockers

- Customer ID storage model for Stripe Customer Portal.
- Subscription failure/grace policy.
- Whether paid certificate orders move to `PricingPlan` immediately or keep `CertificateTemplate.priceCents` as a bridge.
- Whether tournament payments should write `Invoice`/`Payment` before launch.
- MB-012 remains open for any future delete/archive of the WordPress install itself.
- Changes remain uncommitted; no commit/push was requested during this quick close.

## Task log

- SESSION_0093_TASK_01 through SESSION_0093_TASK_04 in `docs/protocols/project-log.md`.

## Review log

- Quick close only; no separate hostile review entry created.

## Quick close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0093.md` has JETTY frontmatter and was updated to `closed-quick`; `WORKFLOW_5.0.md` frontmatter updated to 2026-05-07 / `codex-session-0093`; `.gitignore` needs no frontmatter. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 3 pre-existing orphan warnings (`topic-index.md`, `concepts/tournament-ops.md`, `dirstarter-uplift-backlog.md`). |
| Project-log gate | `grep -c 'SESSION_0093' docs/protocols/project-log.md` returned 4. |
| Git hygiene | Branch `main`; changes uncommitted because no commit/push was requested. `.playwright-mcp/` is ignored and does not appear in `git status`. |

## Hostile close review

- Giddy: Planning stayed within governance/docs/workspace cleanup. Dirstarter reference checkout was verified clean and left untouched.
- Doug: No production code changed. `.playwright-mcp` artifacts were moved out of the public WP root and ignored locally. No secrets or destructive WP deletion.
- Score cap: none for quick close.

## ADR / ubiquitous-language check

- No ADR needed. This session staged payment and workspace decisions; implementation decisions remain open for SESSION_0094+.
- No new domain language added.

## Next session

- **Goal:** Commerce truth reconciliation: update `monetization-entitlements-spec.md` and MB-013 so they match the landed entitlement schema and payment proof targets.
- **Inputs:** `SESSION_0093.md`, `docs/architecture/monetization-entitlements-spec.md`, `apps/web/app/api/stripe/webhooks/route.ts`, tournament webhook tests, Stripe/Dirstarter docs cited above.
- **First task:** Patch `monetization-entitlements-spec.md` to remove stale "entitlements missing" claims and add the payment flow matrix.
