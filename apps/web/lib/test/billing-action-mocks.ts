/**
 * Shared billing-action test mocks.
 *
 * The three billing-action test files — `actions.test.ts`,
 * `actions.safe-action.test.ts`, and `checkout-actions.test.ts` — all exercise the
 * SAME cached `~/server/web/billing/actions` module, which binds `redirect`
 * (`next/navigation`) and `stripe` (`~/services/stripe`) at its FIRST import.
 *
 * `bun`'s `mock.module` is process-global, so when each file installed its OWN
 * `next/navigation` + `~/services/stripe` mock, the last file loaded won the global
 * registry and the action captured ITS `redirect`/`stripe`. The losing files' tests
 * then saw their `redirectState` stay empty (or a wrong-shaped stripe client) — an
 * order-dependent flake (observed as `createBillingPortalSession … redirects …`
 * intermittently failing). A per-test re-install cannot fix it: the action's bindings
 * are already captured at first import.
 *
 * Fix: install ONE `next/navigation` + `~/services/stripe` mock here, shared by all
 * three files. Each file imports this module BEFORE importing the action, asserts
 * against the shared `redirectState` / create mocks, and resets them per test via
 * `resetBillingActionMocks`. One mock, no clobber, deterministic.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { mock } from "bun:test"

/** Shared redirect capture — the action's `redirect(url)` writes here. */
export const redirectState = { url: "" }

/** Fixed URLs the mocked Stripe sessions resolve to (asserted by the tests). */
export const STRIPE_BILLING_PORTAL_URL = "https://billing.stripe.test/portal-session"
export const STRIPE_CHECKOUT_URL = "https://checkout.stripe.test/checkout-session"

export const portalSessionCreateMock = mock(
  async (_params: { customer: string; return_url: string }) => ({
    url: STRIPE_BILLING_PORTAL_URL,
  }),
)

export const checkoutSessionCreateMock = mock(async (_params: unknown) => ({
  url: STRIPE_CHECKOUT_URL,
}))

mock.module("next/navigation", () => ({
  redirect: (url: string) => {
    redirectState.url = url
  },
}))

mock.module("~/services/stripe", () => ({
  stripe: {
    billingPortal: {
      sessions: { create: portalSessionCreateMock },
    },
    checkout: {
      sessions: { create: checkoutSessionCreateMock },
    },
  },
}))

/** Clear call history + redirect capture between tests. */
export function resetBillingActionMocks() {
  portalSessionCreateMock.mockClear()
  checkoutSessionCreateMock.mockClear()
  redirectState.url = ""
}
