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
installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"
// Shared next/navigation + stripe mock — imported BEFORE the action so the action
// binds the shared `redirect`/`stripe` (one mock across all billing test files; no
// cross-file clobber). See the helper for the full rationale.
import {
  portalSessionCreateMock,
  redirectState,
  resetBillingActionMocks,
  STRIPE_BILLING_PORTAL_URL,
} from "~/lib/test/billing-action-mocks"

import { siteConfig } from "~/config/site"
import { createBillingPortalSession } from "~/server/web/billing/actions"
import { db } from "~/services/db"

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
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
  resetBillingActionMocks()
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
    expect(portalSessionCreateMock.mock.calls[0]?.[0]).toEqual({
      customer: STRIPE_CUSTOMER_ID,
      return_url: `${siteConfig.url}/dashboard`,
    })
    expect(redirectState.url).toBe(STRIPE_BILLING_PORTAL_URL)
  })
})
