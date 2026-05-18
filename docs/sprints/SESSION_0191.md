---
title: "SESSION 0191 — Billing Safe-Action Wrapper"
slug: session-0191
type: session--open
status: pending
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0190
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0190.md
  - docs/runbooks/sop-test-writing.md
  - docs/protocols/petey-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0191 — Billing Safe-Action Wrapper

## Date

Pending next bow-in.

## Operator

Pending next bow-in.

## Goal

Roll the wrapped safe-action test pattern to the billing lane, starting with `createBillingPortalSession` unless bow-in discovery shows `createProgramEnrollmentCheckout` is the better proof target.

## Petey plan

### Goal

Prove the billing safe-action client chain end-to-end by invoking a wrapped billing export through the existing `installSafeActionMocks` harness with unauthenticated, validation/error, and authorized happy-path coverage.

### Tasks

#### TASK_01 — Billing wrapped action discovery + test

- **Agent:** Cody backend test worker.
- **What:** Add `apps/web/server/web/billing/actions.safe-action.test.ts` using the existing harness and Stripe mock precedent from `billing/actions.test.ts`.
- **Steps:**
  1. Run Graphify query for billing wrapper terms, then directly read `apps/web/server/web/billing/actions.ts`, `apps/web/server/web/billing/actions.test.ts`, `apps/web/lib/test/safe-action-env.ts`, and `docs/runbooks/sop-test-writing.md` §5b.
  2. Prefer `createBillingPortalSession` as the initial wrapper target because its fixture surface is small: user + current-brand `StripeCustomer` + mocked Stripe billing portal + mocked `redirect`.
  3. Prove unauthenticated short-circuit with no Stripe call and no redirect.
  4. Prove a validation or error-normalization case. If using `createBillingPortalSession`, either submit an invalid `returnUrl` shape to trigger `validationErrors` or use the existing no-customer branch to prove serverError without Stripe call.
  5. Prove authorized happy path creates a Stripe Customer Portal session for the current-brand customer and redirects to the mocked URL.
- **Done means:** New billing wrapper test passes in isolation and does not change billing runtime code or the shared harness.
- **Depends on:** nothing.

#### TASK_02 — Verification and close

- **Agent:** Doug + Petey.
- **What:** Run focused billing wrapper test, combined wrapper regression, scoped typecheck, wiki lint, docs inventory update, project-log/wiki/session closeout, git hygiene, and post-commit Graphify update.
- **Done means:** SESSION_0191 closes with evidence and billing appears in the wrapped safe-action inventory.
- **Depends on:** TASK_01.

### Parallelism

TASK_01 is one new test file, so one Cody worker is enough. TASK_02 is sequential and should stay on the main thread because it touches shared docs.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Single-file implementation with strong local precedent. |
| TASK_02 | Doug + Petey | Verification and closeout. |

### Open decisions

- Decide at bow-in whether the wrapper proof should target `createBillingPortalSession` first or jump to `createProgramEnrollmentCheckout`. The portal action is the smaller, lower-risk first proof.

### Risks

- `redirect()` must be mocked before importing billing actions.
- Stripe service must be mocked before the action import.
- `createProgramEnrollmentCheckout` has a larger fixture surface and should not be selected unless the session has enough room for PricingPlan/EntitlementGrant setup.

### Scope guard

No billing runtime changes, no Stripe SDK changes, no harness changes, and no env/deploy changes. If billing runtime debt appears, record it for a follow-up instead of widening SESSION_0191.

### Dirstarter implementation template

- **Docs read first:** `docs/runbooks/sop-test-writing.md` §5b, `apps/web/server/web/billing/actions.test.ts`, `apps/web/server/web/attendance/actions.safe-action.test.ts`; live Dirstarter docs only if the session changes billing runtime, Stripe integration, or env behavior.
- **Baseline pattern to extend:** `userActionClient` wrapper + `installSafeActionMocks` + existing Stripe billing portal mock.
- **Custom delta:** Adds wrapper proof for billing action middleware and error shape.
- **No-bypass proof:** Test should invoke the exported billing action directly through the wrapper.

## Status

pending
