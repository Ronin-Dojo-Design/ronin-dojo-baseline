/**
 * SESSION_0096 — Customer Portal action proof.
 *
 * Run: cd apps/web && bun test server/web/billing/actions.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"

const sessionUserState = { id: "" }
const requestBrand = "BASELINE_MARTIAL_ARTS"
const portalSessionCreateMock = mock(async () => ({
  url: "https://billing.stripe.test/session_0096",
}))
const redirectState = { url: "" }

// These are process-global bun mocks; sibling billing test files install competing
// mocks for the SAME modules (next/navigation, ~/services/stripe, ~/lib/auth), so the
// last file loaded wins the global registry. Wrap them in a reinstaller and re-run it
// in beforeEach so each test always runs against THIS file's mocks (fixes the cross-file
// flake where `redirect` was captured by a sibling's state instead of `redirectState`).
function installModuleMocks() {
  mock.module("next/headers", () => ({
    headers: async () => ({
      get: (key: string) => {
        const k = key.toLowerCase()
        if (k === "x-brand") return requestBrand
        if (k === "host") return "baseline.local"
        return null
      },
    }),
  }))

  mock.module("next/cache", () => ({
    revalidatePath: () => {},
    updateTag: () => {},
    revalidateTag: () => {},
  }))

  mock.module("next/navigation", () => ({
    redirect: (url: string) => {
      redirectState.url = url
    },
  }))

  mock.module("~/lib/auth", () => ({
    getServerSession: async () => ({
      user: {
        id: sessionUserState.id,
        role: "user",
        lastActiveBrandId: null,
      },
      session: { id: "session-0096-billing-actions-test-session" },
    }),
    auth: {},
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
}

installModuleMocks()

import { createBillingPortalSession } from "~/server/web/billing/actions"
import { db } from "~/services/db"

const TS = Date.now()
const TAG_PREFIX = "session-0096-billing-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

let userId = ""

beforeAll(async () => {
  const user = await db.user.create({
    data: { name: tag("user"), email: `${tag("user")}@test.local` },
  })
  userId = user.id
  sessionUserState.id = user.id
})

beforeEach(async () => {
  // Re-assert this file's module mocks — the global registry may have been
  // clobbered by a sibling billing test file's mocks at load time.
  installModuleMocks()

  portalSessionCreateMock.mockClear()
  redirectState.url = ""
  await db.stripeCustomer.deleteMany({ where: { userId } })
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

  await db.$disconnect()
})

describe("createBillingPortalSession", () => {
  it("creates a Stripe Customer Portal session for the current-brand customer", async () => {
    await db.stripeCustomer.create({
      data: {
        userId,
        brand: requestBrand,
        stripeCustomerId: "cus_test_portal_0096",
      },
    })

    const result = await createBillingPortalSession({ returnUrl: "/dashboard" })

    expect(result?.serverError).toBeUndefined()
    expect(portalSessionCreateMock).toHaveBeenCalledTimes(1)
    expect(portalSessionCreateMock.mock.calls[0]?.[0]?.customer).toBe("cus_test_portal_0096")
    expect(portalSessionCreateMock.mock.calls[0]?.[0]?.return_url?.endsWith("/dashboard")).toBe(
      true,
    )
    expect(redirectState.url).toBe("https://billing.stripe.test/session_0096")
  })

  it("rejects portal creation when the user has no customer for the current brand", async () => {
    const result = await createBillingPortalSession({ returnUrl: "/dashboard" })

    expect(result?.serverError).toBe("No billing customer found for this brand.")
    expect(portalSessionCreateMock).not.toHaveBeenCalled()
  })
})
