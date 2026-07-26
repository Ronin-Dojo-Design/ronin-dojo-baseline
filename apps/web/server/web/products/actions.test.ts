/**
 * SESSION_0711 / LANE SEC-01 — checkout schema + action hardening.
 *
 * Proves the generic Stripe checkout no longer accepts client-priced
 * `price_data` line items, free-form metadata, or off-site redirect URLs, and
 * that every line item is verified against a server-known Stripe price.
 *
 * Run: cd apps/web && bun test server/web/products/actions.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"

const sessionUserState = { id: "" as string | null }
const checkoutSessionCreateMock = mock(async () => ({
  url: "https://checkout.stripe.test/sec01",
}))
const knownPrices = new Map<string, { active: boolean; recurring: object | null }>()
const priceRetrieveMock = mock(async (priceId: string) => {
  const price = knownPrices.get(priceId)
  if (!price) throw new Error(`No such price: ${priceId}`)
  return { id: priceId, object: "price", ...price }
})
const redirectState = { url: "" }

mock.module("next/headers", () => ({
  headers: async () => ({
    get: (key: string) => {
      const k = key.toLowerCase()
      if (k === "x-brand") return "BBL"
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
  getServerSession: async () =>
    sessionUserState.id
      ? {
          user: { id: sessionUserState.id, role: "user", lastActiveBrandId: null },
          session: { id: "sec01-products-test-session" },
        }
      : null,
  auth: {},
}))

mock.module("~/services/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: checkoutSessionCreateMock,
      },
    },
    prices: {
      retrieve: priceRetrieveMock,
    },
  },
}))

import { siteConfig } from "~/config/site"
import { createStripeCheckout } from "~/server/web/products/actions"
import { db } from "~/services/db"

const TS = Date.now()
const tag = (name: string) => `sec01-products-test-${TS}-${name}`

const VALID_PRICE_ID = `price_sec01_products_${TS}`
const INACTIVE_PRICE_ID = `price_sec01_products_inactive_${TS}`
const RECURRING_PRICE_ID = `price_sec01_products_recurring_${TS}`

let toolSlug: string
let toolId: string
let userId: string

beforeAll(async () => {
  const user = await db.user.create({
    data: { name: tag("user"), email: `${tag("user")}@test.local` },
  })
  userId = user.id

  const tool = await db.tool.create({
    data: {
      name: tag("tool"),
      slug: tag("tool"),
      websiteUrl: "https://example.test",
    },
  })
  toolId = tool.id
  toolSlug = tool.slug
})

beforeEach(() => {
  checkoutSessionCreateMock.mockClear()
  priceRetrieveMock.mockClear()
  redirectState.url = ""
  sessionUserState.id = userId
  knownPrices.clear()
  knownPrices.set(VALID_PRICE_ID, { active: true, recurring: null })
  knownPrices.set(INACTIVE_PRICE_ID, { active: false, recurring: null })
  knownPrices.set(RECURRING_PRICE_ID, { active: true, recurring: { interval: "month" } })
})

afterAll(async () => {
  await db.tool.deleteMany({ where: { id: toolId } })
  await db.user.deleteMany({ where: { id: userId } })
  await db.$disconnect()
})

describe("createStripeCheckout — SEC-01 input hardening", () => {
  it("rejects client-priced price_data line items at the schema", async () => {
    const result = await createStripeCheckout({
      lineItems: [
        {
          price_data: {
            product_data: { name: "Forged Product" },
            unit_amount: 1, // attacker names their own price
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      successUrl: "/success",
    } as any)

    expect(result?.validationErrors).toBeDefined()
    expect(checkoutSessionCreateMock).not.toHaveBeenCalled()
  })

  it("rejects metadata keys outside the typed allowlist", async () => {
    const forgedMetadataCases = [
      { ads: JSON.stringify([{ type: "All", startsAt: 0, endsAt: 0 }]) },
      { userId: "attacker-user" },
      { type: "program_enrollment", programId: "forged" },
      { pricingPlanId: "forged" },
    ]

    for (const metadata of forgedMetadataCases) {
      const result = await createStripeCheckout({
        lineItems: [{ price: VALID_PRICE_ID }],
        mode: "payment",
        metadata,
        successUrl: "/success",
      } as any)

      expect(result?.validationErrors).toBeDefined()
    }

    expect(checkoutSessionCreateMock).not.toHaveBeenCalled()
  })

  it("rejects absolute, protocol-relative, and userinfo-style redirect URLs (SEC-02)", async () => {
    const badUrls = ["https://evil.test/success", "//evil.test/success", "/success@evil.test"]

    for (const successUrl of badUrls) {
      const result = await createStripeCheckout({
        lineItems: [{ price: VALID_PRICE_ID }],
        mode: "payment",
        successUrl,
      })

      expect(result?.validationErrors).toBeDefined()
    }

    const cancelResult = await createStripeCheckout({
      lineItems: [{ price: VALID_PRICE_ID }],
      mode: "payment",
      successUrl: "/success",
      cancelUrl: "//evil.test/cancel",
    })
    expect(cancelResult?.validationErrors).toBeDefined()

    expect(checkoutSessionCreateMock).not.toHaveBeenCalled()
  })

  it("rejects unknown, inactive, and mode-mismatched prices", async () => {
    const cases = [
      { lineItems: [{ price: `price_sec01_unknown_${TS}` }], mode: "payment" as const },
      { lineItems: [{ price: INACTIVE_PRICE_ID }], mode: "payment" as const },
      { lineItems: [{ price: RECURRING_PRICE_ID }], mode: "payment" as const },
      { lineItems: [{ price: VALID_PRICE_ID }], mode: "subscription" as const },
    ]

    for (const input of cases) {
      const result = await createStripeCheckout({ ...input, successUrl: "/success" })
      expect(result?.serverError).toBeDefined()
    }

    expect(checkoutSessionCreateMock).not.toHaveBeenCalled()
  })

  it("rejects a metadata tool slug that does not reference a real tool", async () => {
    const result = await createStripeCheckout({
      lineItems: [{ price: VALID_PRICE_ID }],
      mode: "payment",
      metadata: { tool: `not-a-real-tool-${TS}` },
      successUrl: "/success",
    })

    expect(result?.serverError).toBe("Selected tool is not available.")
    expect(checkoutSessionCreateMock).not.toHaveBeenCalled()
  })

  it("creates checkout from a verified price with server-derived metadata and same-site URLs", async () => {
    const result = await createStripeCheckout({
      lineItems: [{ price: VALID_PRICE_ID, quantity: 1 }],
      mode: "payment",
      metadata: { tool: toolSlug },
      successUrl: "/submit/success",
      cancelUrl: "/submit",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(priceRetrieveMock).toHaveBeenCalledTimes(1)
    expect(checkoutSessionCreateMock).toHaveBeenCalledTimes(1)

    const checkoutArgs = checkoutSessionCreateMock.mock.calls[0]?.[0] as any
    expect(checkoutArgs.line_items).toEqual([{ price: VALID_PRICE_ID, quantity: 1 }])
    // userId comes from the session, tool from the allowlist — nothing else.
    expect(checkoutArgs.metadata).toEqual({ tool: toolSlug, userId })
    expect(checkoutArgs.success_url).toBe(
      `${siteConfig.url}/submit/success?sessionId={CHECKOUT_SESSION_ID}`,
    )
    expect(checkoutArgs.cancel_url).toBe(`${siteConfig.url}/submit?cancelled=true`)
    expect(redirectState.url).toBe("https://checkout.stripe.test/sec01")
  })

  it("creates an anonymous checkout without metadata when signed out", async () => {
    sessionUserState.id = null

    const result = await createStripeCheckout({
      lineItems: [{ price: VALID_PRICE_ID }],
      mode: "payment",
      successUrl: "/success",
    })

    expect(result?.serverError).toBeUndefined()
    expect(checkoutSessionCreateMock).toHaveBeenCalledTimes(1)

    const checkoutArgs = checkoutSessionCreateMock.mock.calls[0]?.[0] as any
    expect(checkoutArgs.metadata).toBeUndefined()
    expect(checkoutArgs.customer_creation).toBe("if_required")
  })
})
