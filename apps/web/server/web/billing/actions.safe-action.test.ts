/**
 * SESSION_0191 - end-to-end safe-action test for `createBillingPortalSession`.
 *
 * Invokes the next-safe-action-wrapped export through the full `userActionClient`
 * middleware chain using the reusable `installSafeActionMocks` harness.
 *
 * Run: cd apps/web && bun test --timeout 120000 \
 *        server/web/billing/actions.safe-action.test.ts
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Install mocks BEFORE any import that touches billing/server modules.
// Pin the request host so the per-brand origin in `return_url` is deterministic.
installSafeActionMocks({ brand: "BBL", host: "baseline.local" })

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"

const portalSessionCreateMock = mock(async (_params: { customer: string; return_url: string }) => ({
  url: "https://billing.stripe.test/session_0191",
}))
const redirectState = { url: "" }

mock.module("next/navigation", () => ({
  redirect: (url: string) => {
    redirectState.url = url
  },
}))

mock.module("~/services/stripe", () => ({
  stripe: {
    billingPortal: {
      sessions: {
        create: portalSessionCreateMock,
      },
    },
  },
}))

import { createBillingPortalSession } from "~/server/web/billing/actions"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const TS = Date.now()
const TAG_PREFIX = "session-0191-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`
const STRIPE_CUSTOMER_ID = `cus_session_0191_${TS}`

let userId = ""

beforeAll(async () => {
  const user = await db.user.create({
    data: { name: tag("user"), email: `${tag("user")}@test.local` },
  })
  userId = user.id
})

beforeEach(async () => {
  portalSessionCreateMock.mockClear()
  redirectState.url = ""
  setTestSession(null)

  if (userId) {
    await db.stripeCustomer.deleteMany({ where: { userId } })
  }
})

afterAll(async () => {
  if (userId) {
    await db.stripeCustomer.deleteMany({ where: { userId } })
    await db.user.deleteMany({ where: { id: userId } })
  }

  const zombieUsers = await db.user.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieUserIds = zombieUsers.map(user => user.id)

  if (zombieUserIds.length > 0) {
    await db.stripeCustomer.deleteMany({ where: { userId: { in: zombieUserIds } } })
    await db.user.deleteMany({ where: { id: { in: zombieUserIds } } })
  }
})

describe("createBillingPortalSession - safe-action wrapper", () => {
  it("returns serverError 'User not authenticated' when no session is present", async () => {
    const result = await createBillingPortalSession({ returnUrl: "/dashboard" })

    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
    expect(portalSessionCreateMock).not.toHaveBeenCalled()
    expect(redirectState.url).toBe("")
  })

  it("surfaces validationErrors when returnUrl is not a string", async () => {
    setTestSession({ id: userId })

    const unsafePayload = { returnUrl: 42 } as unknown as { returnUrl: string }
    const result = await createBillingPortalSession(unsafePayload)

    expect(result?.validationErrors?.returnUrl).toBeDefined()
    expect(result?.data).toBeUndefined()
    expect(portalSessionCreateMock).not.toHaveBeenCalled()
    expect(redirectState.url).toBe("")
  })

  it("returns serverError when the current-brand customer does not exist", async () => {
    setTestSession({ id: userId })

    const result = await createBillingPortalSession({ returnUrl: "/dashboard" })

    expect(result?.serverError).toBe("No billing customer found for this brand.")
    expect(result?.data).toBeUndefined()
    expect(portalSessionCreateMock).not.toHaveBeenCalled()
    expect(redirectState.url).toBe("")
  })

  it("redirects to a Stripe Customer Portal session for the current-brand customer", async () => {
    setTestSession({ id: userId })
    await db.stripeCustomer.create({
      data: {
        userId,
        brand: TEST_BRAND,
        stripeCustomerId: STRIPE_CUSTOMER_ID,
        accountScope: "platform",
      },
    })

    const result = await createBillingPortalSession({ returnUrl: "/dashboard" })

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data).toBeUndefined()
    expect(portalSessionCreateMock).toHaveBeenCalledTimes(1)
    // `return_url` is built from the per-brand request origin — `getBrandOrigin()`
    // derives it from the request host (`baseline.local`, pinned above) per ADR 0006,
    // NOT the static `siteConfig.url`. This guards the per-brand-origin behavior the
    // action adopted in commit a1af101 (which is what drifted this assertion red).
    expect(portalSessionCreateMock.mock.calls[0]?.[0]).toEqual({
      customer: STRIPE_CUSTOMER_ID,
      return_url: "http://baseline.local/dashboard",
    })
    expect(redirectState.url).toBe("https://billing.stripe.test/session_0191")
  })
})
