---
title: "SESSION 0344 — BBL lineage membership checkout + entitlement e2e"
slug: session-0344
type: session--open
status: closed
created: 2026-06-04
updated: 2026-06-04
last_agent: codex-session-0344
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0343.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
  - docs/runbooks/deploy/bbl-production-runbook.md
  - docs/product/black-belt-legacy/GAP_MATRIX.md
  - docs/runbooks/integrations/stripe-setup-runbook.md
  - docs/architecture/decisions/0012-tier-auto-grant.md
  - docs/architecture/decisions/0019-membership-lifecycle-ownership.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0344 — BBL lineage membership checkout + entitlement e2e

## Date

2026-06-04

## Operator

Brian + codex-session-0344 (Petey orchestration -> Cody build -> Desi/Doug review -> Petey close)

## Goal

Build the next highest BBL launch gate: Stripe checkout success/cancel plus lineage membership
tier/entitlement lifecycle e2e proof, using the local/test-mode harness first and Baseline as the
staging-prod proxy boundary only after local proof.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out,
per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0343.md`.
- Carryover: SESSION_0343 landed the registration e2e launch gate, resolved the BBL DNS source-of-truth
  blocker, ranked the remaining launch-critical e2e gaps, and named Stripe checkout + entitlement
  lifecycle as the next shared-infra proof.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0344.md`.
- Current HEAD at bow-in: `8e33d6b`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git` (FS-0024
  pwd + remote guard run before this file was written).

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Payments/Stripe, monetization/listings, auth, Prisma, and e2e harness. |
| Extension or replacement | Extension: reuse Stripe Checkout Sessions, `PricingPlan`, `EntitlementGrant`, `UserEntitlement`, webhook, Better Auth session, and existing Playwright+Bun DB bridge patterns. |
| Why justified | BBL needs a paid lineage membership/tier proof; using ProgramEnrollment vocabulary would prove the wrong product surface. |
| Risk if bypassed | High: a program-labeled checkout could pass technically while launching a confusing BBL money path; a generic client-supplied line-item checkout would weaken DB-derived pricing integrity. |

Live docs checked during planning: local Dirstarter docs inventory payments/auth/prisma URLs, Stripe
best-practices skill references for Checkout Sessions and Billing+Checkout. This session does not add a
new Stripe API pattern; it narrows the app surface onto existing Checkout/webhook primitives.

### Graphify check

- Graph status: current enough for planning; stats at bow-in: 9232 nodes, 14050 edges, 1395 communities,
  1570 files tracked.
- Queries used:
  - `Stripe checkout entitlement payment webhook member tier lifecycle Baseline BBL e2e`
  - `create checkout session Stripe checkout action success_url cancel_url priceId customerId entitlement`
  - `fulfillTournamentRegistration fulfill stripe webhook checkout.session.completed line_items metadata membership entitlement`
  - `Stripe webhook checkout tests describe checkout session completed vitest`
  - `autonomous auto codex session setup orchestration Petey Cody Desi Doug closing graphify`
  - `domain features Stripe member tier entitlement checkout Black Belt Legacy runbook`
  - `lineage membership subscription checkout entitlement pricing plan page UserEntitlement`
  - `lineage join claim membership CTA page Black Belt Legacy`
- Files selected from graph:
  - `apps/web/server/web/billing/actions.ts`
  - `apps/web/server/web/billing/checkout-actions.test.ts`
  - `apps/web/app/api/stripe/webhooks/route.ts`
  - `apps/web/app/api/stripe/webhooks/route.test.ts`
  - `apps/web/server/web/entitlements/queries.ts`
  - `apps/web/server/web/entitlements/queries.integration.test.ts`
  - `apps/web/e2e/auth/registration.spec.ts`
  - `apps/web/e2e/helpers/auth.ts`
  - `apps/web/e2e/helpers/auth-db.ts`
  - `apps/web/app/(web)/lineage/join/page.tsx`
  - `docs/runbooks/domain-features/lineage-listing-runbook.md`
  - `docs/runbooks/domain-features/baseline-listings-runbook.md`
  - `docs/runbooks/domain-features/course-curriculum-runbook.md`
  - `docs/runbooks/integrations/stripe-setup-runbook.md`
  - `docs/runbooks/sops/sop-e2e-user-lifecycle.md`
  - `docs/runbooks/sops/sop-data-and-wiring-flows.md`
  - `docs/runbooks/sops/sop-email-runbook.md`
  - `docs/architecture/decisions/0012-tier-auto-grant.md`
  - `docs/architecture/decisions/0012-admin-crud-routing-pattern.md`
  - `docs/architecture/decisions/0019-membership-lifecycle-ownership.md`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

1. **Surface label:** Use the same Stripe/webhook primitives, but do not force this proof through
   `/programs/[id]/enroll`. BBL launch language should be lineage membership/tier, not program enrollment.
2. **Product boundary:** Add a narrow lineage membership checkout surface and DB-derived checkout action
   for entitlement-backed `PricingPlan` rows. Avoid the generic client-supplied `createStripeCheckout`
   for this paid proof.
3. **Lifecycle boundary:** Per ADR 0019, Stripe subscription lifecycle proves `UserEntitlement` grant/revoke
   and optional `ProgramEnrollment` suspension where applicable; it does **not** mutate `Membership.status`.
4. **Docker:** Not needed for this session. Docker would help isolate Postgres/MinIO later, but the current
   e2e bridge can self-clean against the local dev DB. Stripe CLI, not Docker, is the relevant tool for a
   later real webhook-forwarding rehearsal.
5. **Autonomous sessions:** Do not bundle this first paid-path browser proof into a 3-session autonomous run.
   Keep it inline with Petey -> Cody -> Desi/Doug because the harness may expose env/Stripe decisions. Revisit
   autonomous follow-ups once this harness is green.
6. **Route surface:** Keep `/lineage/join` as the BBL entry page and add the lineage membership checkout
   section there, instead of creating a separate `/lineage/membership` route. The intake/claim form and paid
   tier checkout stay visually distinct on the same page.

### Drift logged

- `docs/runbooks/domain-features/course-curriculum-runbook.md` is stale: it says Stripe checkout creates
  `Membership`, but ADR 0019 and current webhook code say Stripe owns `UserEntitlement` and may create/suspend
  `ProgramEnrollment`; `Membership.status` remains community/admin state.
- The previous handoff's "ADR 0012" input is ambiguous. `0012-tier-auto-grant.md` is the payment ADR;
  `0012-admin-crud-routing-pattern.md` is route-pattern alignment and is not the payment authority.

## Petey plan

### Goal

Land a local BBL lineage membership checkout e2e that proves cancel, success, and webhook-driven
entitlement lifecycle without touching shared prod state.

### Tasks

#### SESSION_0344_TASK_01 — Plan lock + stale-doc alignment

- **Agent:** Petey
- **What:** Lock the BBL paid-path scope and correct stale docs that would otherwise steer Cody into the
  wrong model.
- **Steps:**
  1. Record Graphify-selected files and grill outcomes in this SESSION file.
  2. Update stale docs/runbooks so lineage membership checkout uses `PricingPlan -> EntitlementGrant ->
     UserEntitlement`, not `ProgramEnrollment` or `Membership.status`.
  3. Update BBL cutover/Stripe runbook notes with the local e2e command and Baseline proxy boundary if the
     implementation changes the proof procedure.
- **Done means:** This SESSION plan is complete and stale docs no longer contradict ADR 0019/current code.
- **Depends on:** nothing.

#### SESSION_0344_TASK_02 — Lineage membership checkout surface + local Stripe mock harness

- **Agent:** Cody -> Desi
- **What:** Add the smallest honest BBL-facing checkout path for entitlement-backed lineage membership tiers.
- **Steps:**
  1. Add a DB-derived server action for an active entitlement-backed `PricingPlan` (`programId` optional)
     that creates a Stripe Checkout Session with trusted line item, metadata, success URL, and cancel URL.
  2. Extend `/lineage/join` with a visually distinct lineage membership tier section and success shell using
     existing primitives and BBL-appropriate labels.
  3. Add an explicit `E2E_STRIPE_MOCK=1` local Stripe service mock for product/price listing and checkout
     redirect only; production and normal dev without the flag must keep the real Stripe SDK path.
  4. Add/adjust unit coverage for the new checkout action, including untrusted input rejection, brand scoping,
     success/cancel URLs, and subscription mode.
- **Done means:** A local user can see a lineage membership plan, start checkout, and return to success/cancel
  shells using the e2e mock without real Stripe or prod data.
- **Depends on:** SESSION_0344_TASK_01.

#### SESSION_0344_TASK_03 — Playwright entitlement lifecycle proof + full close

- **Agent:** Cody -> Doug -> Petey
- **What:** Prove the local checkout lifecycle end-to-end and close the session fully.
- **Steps:**
  1. Add Playwright+Bun bridge helpers that seed a lineage membership plan, synthesize real webhook-route
     events with mocked Stripe line items/subscription retrieval, read entitlement state, and self-clean.
  2. Add `apps/web/e2e/stripe/lineage-membership-checkout.spec.ts` covering cancel/no-grant, success shell,
     purchase entitlement grant, subscription entitlement grant, subscription deletion revoke, and no
     `Membership.status` mutation.
  3. Run focused unit/e2e gates, then typecheck/lint/full relevant tests as time allows.
  4. Run full bow-out: hostile close, ADR check, wiki/index updates if needed, `bun run wiki:lint`,
     `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`, commit, push to `main`.
- **Done means:** Focused e2e is green locally with `E2E_STRIPE_MOCK=1`, docs/session evidence is complete,
  Graphify is refreshed, and one conventional commit is pushed.
- **Depends on:** SESSION_0344_TASK_02.

### Parallelism

Inline baton. The route/action/page/e2e helper work crosses shared billing and docs surfaces, so subagents or
worktrees would add merge overhead. Desi reviews the thin page labels after Cody lands it; Doug verifies the
payment/access lifecycle.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0344_TASK_01 | Petey | Scope and docs alignment before code. |
| SESSION_0344_TASK_02 | Cody -> Desi | Checkout action + page implementation, then label/flow sanity. |
| SESSION_0344_TASK_03 | Cody -> Doug -> Petey | E2E proof, verification, and full close. |

### Open decisions

- None blocking. Route chosen for this session: keep `/lineage/join` as the BBL entry point and add the paid
  lineage membership section there. If BBL later wants `/membership` or `/legacy-membership`, add redirects
  in a separate product routing pass.

### Risks

- **Mock seam risk:** `E2E_STRIPE_MOCK=1` must be explicit and non-production. No implicit fallback to fake
  payments when Stripe keys are missing.
- **Vocabulary risk:** Do not call this a program enrollment. BBL paid membership grants access/entitlement;
  ProgramEnrollment remains school-ops.
- **Webhook async risk:** Browser success and webhook state are separate in real Stripe. The e2e should make
  that explicit by returning to success, then synthesizing the webhook and asserting state.

### Scope guard

- No live Stripe Checkout or Baseline production data mutation.
- No Stripe Connect/payout implementation.
- No schema migration unless the current `PricingPlan`/`EntitlementGrant` shape proves insufficient.
- No membership-status coupling in the webhook.

### Dirstarter implementation template

- **Docs read first:** `dirstarter-docs-inventory.md` payments/auth/prisma URLs, Stripe best-practices
  Checkout/Billing references, `stripe-setup-runbook.md`, SOP §13 payment flow, ADR 0012 tier auto-grant,
  ADR 0019 membership/access boundary.
- **Baseline pattern to extend:** `createProgramEnrollmentCheckout` DB-derived validation pattern,
  existing Stripe webhook entitlement fulfillment, existing `Product`/common primitive card style, existing
  Playwright auth and Bun DB-bridge helpers.
- **Custom delta:** BBL lineage membership labels + a dedicated entitlement-plan checkout action/section +
  explicit e2e Stripe mock.
- **No-bypass proof:** Uses Stripe Checkout Sessions and the existing webhook entitlement spine; it does not
  introduce a second payment processor, raw PaymentIntent loop, or client-trusted pricing path.

## Cody pre-flight

### Pre-flight: Lineage membership checkout

#### 1. Existing component/action scan

- Graphify query used: `lineage membership subscription checkout entitlement pricing plan page UserEntitlement`
  and `server web billing action PricingPlan EntitlementGrant checkout action`.
- Found: `server/web/billing/actions.ts::createProgramEnrollmentCheckout` has the trusted DB-derived plan
  validation shape; `server/web/products/actions.ts::createStripeCheckout` is generic and accepts caller
  line items; `Product`/`ProductList` render Stripe product cards; `/lineage/join` is intake/claim, not
  checkout.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Consulted live alignment URLs: local inventory + Stripe skill references; no new Dirstarter API is being
  invented.
- Closest L1 pattern: Stripe-hosted Checkout Sessions + Dirstarter listing monetization, extended with
  Ronin `PricingPlan`/`EntitlementGrant`.
- Primitive API spot-check: page should use existing `Wrapper`, `Intro`, `Card`, `Stack`, `Button`, `Badge`,
  `Link` primitives; no raw form/button styling.

#### 3. Composition decision

- Extending existing action pattern: `createProgramEnrollmentCheckout` trusted pricing validation.
- Composing existing components: common `Card`, `Button`, `Stack`, web `Intro`/`Wrapper`.
- New files justified: a page-local lineage membership checkout section, success shell, and e2e helper/spec do
  not exist; reusing `/programs` would mislabel the BBL product.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0343`).
- ADR read: `0012-tier-auto-grant.md`, `0012-admin-crud-routing-pattern.md`, `0019-membership-lifecycle-ownership.md`.
- Runbooks consulted: Stripe setup, BBL runbook, cutover checklist, GAP_MATRIX, SOP e2e lifecycle,
  SOP data/wiring, SOP email, domain-feature lineage/baseline/course runbooks.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (package `bun run dev` resolves to the same
  `next dev --turbo` command).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app/apps/web`.
- Brand/host for testing: local Baseline host via Playwright `localhost:3000`, with BBL proxy documented
  for later production proof.
- Verification commands confirmed: `bun test ...`, `E2E_STRIPE_MOCK=1 bunx playwright test ...`,
  `bun run typecheck`, `bun run lint`.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0002 (dev server command), FS-0006/FS-0007 (Petey/pre-flight), FS-0008
  (schema/API spot-check), FS-0024/FS-0025 from standing repo rules.
- Mitigation acknowledged: session plan + task IDs exist before code; schema enum spot-check read directly
  from `schema.prisma`; no mutating git before FS-0024 guard; one push at close.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0344_TASK_01 | completed | Plan locked; stale Stripe/Membership docs aligned to ADR 0019 and current webhook behavior. |
| SESSION_0344_TASK_02 | completed | `/lineage/join` now has a paid lineage membership section, trusted checkout action, success/cancel shells, and explicit `E2E_STRIPE_MOCK=1` checkout redirect mock. |
| SESSION_0344_TASK_03 | completed | Playwright entitlement lifecycle proof is green; bow-out evidence, graphify update, commit, and push completed during close. |

## What landed

- Added `createLineageMembershipCheckout`, a DB-derived Checkout Session action for active Baseline/brand
  `PricingPlan` rows that are entitlement-backed, `programId: null`, Stripe-priced, and marked with
  `metadata.surface = "lineage_membership"`.
- Extended `/lineage/join` instead of creating `/lineage/membership`: intake/claim remains the left-side
  form, paid lineage membership tiers render as a distinct right-side section, and
  `/lineage/join?cancelled=true` shows a no-payment-completed shell.
- Added `/lineage/join/success` for the post-Checkout return shell.
- Added an explicit non-production `E2E_STRIPE_MOCK=1` Stripe service path that returns a local success URL
  for Checkout Sessions and leaves normal dev/prod Stripe SDK behavior unchanged.
- Added Playwright+Bun bridge helpers that seed disposable lineage membership plans, synthesize webhook route
  events, assert entitlement state, and clean plans/grants/invoices/customers/webhook rows.
- Aligned BBL cutover, GAP_MATRIX, Stripe setup, lineage listing, course curriculum, e2e lifecycle, and
  data/wiring docs to the ADR 0019 boundary: Stripe grants/revokes `UserEntitlement`; it does not transition
  `Membership.status`.

## Decisions resolved

- `/lineage/join` is the first paid-path entry point. The session does not create `/lineage/membership`.
- Lineage membership paid access uses `PricingPlan -> EntitlementGrant -> UserEntitlement`; it does not use
  `ProgramEnrollment` vocabulary.
- Docker is not needed for this proof. The useful local isolation is the Bun DB bridge plus explicit Stripe
  mock; Stripe CLI remains the next live-webhook tool.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/billing/actions.ts` | Added lineage membership Checkout action and generalized checkout mode resolver. |
| `apps/web/server/web/billing/lineage-membership.ts` | Added lineage membership metadata parser and plan query helper. |
| `apps/web/server/web/billing/checkout-actions.test.ts` | Added one-time/subscription lineage checkout action coverage and rejection cases. |
| `apps/web/services/stripe.ts` | Added explicit local-only e2e Stripe mock path. |
| `apps/web/app/(web)/lineage/join/page.tsx` | Added paid membership plans and cancel shell to existing join page. |
| `apps/web/app/(web)/lineage/join/lineage-membership-checkout.tsx` | Added page-local client checkout section. |
| `apps/web/app/(web)/lineage/join/success/page.tsx` | Added checkout success shell. |
| `apps/web/e2e/helpers/auth.ts` | Exposed `createTestUser` for serial e2e fixtures. |
| `apps/web/e2e/helpers/stripe-checkout.ts` | Added Node-facing Playwright checkout helper. |
| `apps/web/e2e/helpers/stripe-checkout-db.ts` | Added Bun DB/webhook bridge for lineage membership proof. |
| `apps/web/e2e/stripe/lineage-membership-checkout.spec.ts` | Added cancel, purchase grant, subscription grant/revoke proof. |
| `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md` | Added local paid-path gate and Baseline proxy boundary. |
| `docs/product/black-belt-legacy/GAP_MATRIX.md` | Re-ranked next tasks after local Stripe/entitlement proof. |
| `docs/runbooks/integrations/stripe-setup-runbook.md` | Added local Playwright checkout proof and mock boundary. |
| `docs/runbooks/domain-features/lineage-listing-runbook.md` | Recorded SESSION_0344 paid slice and entitlement boundary. |
| `docs/runbooks/domain-features/course-curriculum-runbook.md` | Corrected stale “Stripe creates Membership” language. |
| `docs/runbooks/sops/sop-e2e-user-lifecycle.md` | Aligned payment lifecycle with entitlement grants and ADR 0019. |
| `docs/runbooks/sops/sop-data-and-wiring-flows.md` | Aligned payment/data wiring with entitlement grants and ADR 0019. |
| `docs/knowledge/wiki/manual-boundary-registry.md` | Recorded SESSION_0344 as local MB-013 payment/access proof while keeping Baseline proxy open. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0344 and updated BBL cutover status. |
| `docs/sprints/SESSION_0344.md` | Session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun test server/web/billing/checkout-actions.test.ts` | ✅ 7 passed |
| `cd apps/web && bun test app/api/stripe/webhooks/route.test.ts` | ✅ 10 passed |
| `cd apps/web && E2E_STRIPE_MOCK=1 bunx playwright test e2e/stripe/lineage-membership-checkout.spec.ts --project=chromium` | ✅ 3 passed |
| `cd apps/web && bun run typecheck` | ✅ `next typegen` + `tsc --noEmit` passed |
| `cd apps/web && bun run lint` | ✅ Biome checked 1180 files, no fixes needed after final patch |
| `bun run wiki:lint` | ✅ No lint violations |
| `cd apps/web && bun test --parallel=1 --path-ignore-patterns='e2e/**'` | ✅ 432 passed |

## Open decisions / blockers

- No code blocker. Release blocker remains: run the same lineage membership tier shape on Baseline with
  test-mode Stripe/webhook delivery and clean shared production fixture rows afterward.

## Next session

- **Goal:** Prove the SESSION_0344 lineage membership checkout gate on Baseline as the staging-prod proxy,
  including live Stripe test-mode success/cancel, webhook delivery, entitlement grant/revoke evidence, and
  production cleanup notes.
- **Inputs to read:**
  - `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md`
  - `docs/runbooks/integrations/stripe-setup-runbook.md`
  - `docs/knowledge/wiki/manual-boundary-registry.md`
  - `apps/web/e2e/stripe/lineage-membership-checkout.spec.ts`
  - `apps/web/server/web/billing/actions.ts` and `apps/web/app/api/stripe/webhooks/route.ts`
- **First task:** Graphify query the Baseline proxy checkout/customer cleanup surfaces, then Petey-plan the
  live test-mode rehearsal so it proves the same `PricingPlan -> EntitlementGrant -> UserEntitlement`
  lifecycle without leaving shared production rows behind.
- **Candidates:**
  1. Baseline live checkout proxy — highest launch value because it turns the local proof into staging-prod
     evidence.
  2. Authenticated BBL claim-flow smoke — next BBL-specific product proof after money/access is live-proxied.

## Review log

### SESSION_0344 - BBL lineage membership checkout + entitlement e2e

#### Review

**SESSION_0344_REVIEW_01 - Local paid-path proof is real, live proxy remains**

- **Reviewed tasks:** SESSION_0344_TASK_01, SESSION_0344_TASK_02, SESSION_0344_TASK_03
- **Dirstarter docs check:** live docs checked
- **Sources:** `https://dirstarter.com/docs/integrations/payments`,
  `https://dirstarter.com/docs/environment-setup`, local Stripe skill references, and local
  `docs/knowledge/wiki/dirstarter-docs-inventory.md`
- **Verdict:** The implementation extends the Dirstarter/Stripe spine instead of replacing it: server-created
  Checkout Sessions, server-only Stripe secret handling, webhook fulfillment, and entitlement/subscription
  lifecycle stay in the existing app-owned payment path. The local proof is strong for code behavior and DB
  cleanup, but it intentionally does not prove live Stripe webhook delivery on Baseline; that remains the
  next launch gate.

#### Findings

**SESSION_0344_FINDING_01 - Baseline live Stripe delivery still pending**

- **Severity:** medium
- **Task:** SESSION_0344_TASK_03
- **Evidence:** `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md` now lists Baseline live checkout proxy
  after the local gate.
- **Impact:** BBL cutover cannot claim production-equivalent Stripe delivery until Baseline receives live
  test-mode Checkout/webhook events and cleanup is documented.
- **Required follow-up:** Run the next-session Baseline proxy rehearsal with a disposable user/customer/plan
  evidence packet.
- **Status:** open

## Hostile close review

### SESSION_0344 - BBL lineage membership checkout + entitlement e2e

- **Plan sanity:** Good after the `/lineage/join` correction. The original temptation to create
  `/lineage/membership` would have split the product entry point; the final slice keeps intake and paid
  access distinct on the same page.
- **Dirstarter compliance:** Aligned. Live Dirstarter payments/env docs confirm Stripe server keys, Checkout,
  and webhooks as the expected baseline; this session narrows the product semantics without bypassing that
  spine.
- **Security:** The new checkout action rejects caller line items, forged redirects, cross-brand plans,
  program-scoped plans, inactive plans, unentitled plans, and unmarked plans. E2E fixture cleanup removes
  user entitlements, invoices, payments, Stripe customers, webhook rows, plans, grants, and org rows.
- **Data integrity:** The business rule is enforced in the server action and proven in tests. Webhook logic
  remains product-agnostic for entitlements and only creates `ProgramEnrollment` on explicit
  `program_enrollment` metadata.
- **Lifecycle proof:** Strong local proof: cancel/no-grant, success shell, one-time purchase grant,
  subscription grant, subscription deletion revoke, no membership/program mutation.
- **Verification honesty:** Green focused and broad checks are recorded. The only unproven claim is live
  Baseline Stripe delivery, explicitly left open.
- **Workflow honesty:** Bow-in, Graphify-first discovery, Petey plan, task IDs, docs alignment, review, and
  close are recorded. No unrelated worktree cleanup was attempted.
- **Merge readiness:** Ready to merge to `main`; next gate is an operational Baseline rehearsal, not a code
  blocker.

#### Kaizen

- **Safe and secure?** Locally, yes for the protected checkout path and entitlement lifecycle. The tests that
  would prove the remaining release boundary are Baseline live test-mode Checkout success/cancel, real
  Stripe Dashboard/CLI webhook delivery evidence, and post-run production cleanup verification.
- **Preventable failed steps:** One process slip: the first doc patch was too broad and failed exact matching.
  Smaller patches fixed it. Next time, patch touched docs in batches by file when the source text may have
  drifted.
- **Scale confidence:** 100 users: 9/10. 1,000 users: 8/10 until Baseline live webhook delivery and cleanup
  are rehearsed. 10,000 users: 7/10 until monitoring/audit cadence and customer cleanup policy are exercised
  against production-like traffic. Aggregate: 7/10, so the next session is a proof/remediation session, not
  more feature expansion.

## ADR / ubiquitous-language check

- **ADR:** No new ADR needed. The decision follows ADR 0011/0012-era entitlement-first commerce and ADR 0019
  membership lifecycle ownership. The session clarified implementation scope in runbooks instead of changing
  architecture.
- **Ubiquitous language:** No glossary update needed. `Membership`, `ProgramEnrollment`, and
  `UserEntitlement` keep their existing meanings. "Lineage membership" is a product label on a paid access
  tier, not a new aggregate or replacement for `Membership`.
- **Component inventory:** No inventory update needed. `LineageMembershipCheckout` is page-local to
  `/lineage/join`; it is not a reusable design-system or domain component yet.

## Reflections

- The key correction was product language, not Stripe mechanics. Reusing `ProgramEnrollment` would have made
  the test green while proving the wrong launch surface.
- The existing webhook entitlement spine was stronger than expected; the right change was to add a trusted
  checkout entry and e2e fixture, not to fork webhook behavior.
- The local mock is intentionally boring: it only returns the app's success URL. Webhook truth stays in the
  real route handler, driven by the Bun bridge.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched docs updated to `updated: 2026-06-04` / `last_agent: codex-session-0344` where changed; code files have no frontmatter. |
| Backlinks/index sweep | Added SESSION_0344 backlinks to touched product/runbook/registry docs; added SESSION_0344 row and updated BBL cutover status in `docs/knowledge/wiki/index.md`. |
| Wiki lint | `bun run wiki:lint` passed with no lint violations after frontmatter/backlink patches. |
| Kaizen reflection | Present in `## Hostile close review` and `## Reflections`. |
| Hostile close review | `SESSION_0344_REVIEW_01` and `SESSION_0344_FINDING_01` recorded; Baseline live proxy is open. |
| Review & Recommend | Next session goal, inputs, first task, and candidates are written. |
| Memory sweep | No operator memory change needed; durable facts are in ADR-linked runbooks, MB-013, and this SESSION file. |
| Next session unblock check | Unblocked if Baseline Stripe test-mode credentials/cleanup authority are available; otherwise first task should stop at rehearsal plan + required owner steps. |
| Git hygiene | Branch `main`; `git worktree list` shows only `/Users/brianscott/dev/ronin-dojo-app`; `git status --short` reviewed for intended code/docs/e2e/session changes; single push planned, hash reported at bow-out. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` completed; `graphify stats` = 9262 nodes / 14185 edges / 1411 communities / 1576 files tracked. |
