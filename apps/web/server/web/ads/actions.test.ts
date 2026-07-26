/**
 * SESSION_0711 / LANE SEC-01 — ads checkout server pricing + fulfillment
 * amount verification.
 *
 * Proves ad spot purchases are priced server-side (`createAdsCheckout`) and
 * that `createAdFromCheckout` refuses to mint ads for sessions whose paid
 * amount does not cover the server-pinned `metadata.adsTotalCents`.
 *
 * Run: cd apps/web && bun test server/web/ads/actions.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test"

const checkoutSessionCreateMock = mock(async () => ({
  id: "cs_sec01ads_create",
  url: "https://checkout.stripe.test/sec01-ads",
}))
const retrievedSessionState: { session: Record<string, unknown> | null } = { session: null }
const checkoutSessionRetrieveMock = mock(async () => retrievedSessionState.session)
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

mock.module("next-intl/server", () => ({
  getTranslations: async () => {
    return (key: string) => key
  },
}))

mock.module("~/server/web/actions/media", () => ({
  fetchMedia: async () => ({ data: "https://cdn.test/favicon.png" }),
}))

mock.module("~/services/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: checkoutSessionCreateMock,
        retrieve: checkoutSessionRetrieveMock,
      },
    },
  },
}))

import { createAdFromCheckout, createAdsCheckout } from "~/server/web/ads/actions"
import { db } from "~/services/db"

const TS = Date.now()

// Far-future window — 3 days (Bottom spot @ $10/day, 2% volume discount →
// unit 980¢ × 3 = 2940¢). Chosen far in the future so no real ads overlap.
const STARTS_AT = Date.UTC(2032, 2, 1)
const ENDS_AT = Date.UTC(2032, 2, 3)
const EXPECTED_UNIT_CENTS = 980
const EXPECTED_TOTAL_CENTS = 2940

const adsMetadata = JSON.stringify([{ type: "Bottom", startsAt: STARTS_AT, endsAt: ENDS_AT }])

const adDetails = (sessionId: string) => ({
  sessionId,
  name: `sec01-ads-test-${TS}`,
  description: "SEC-01 test ad",
  websiteUrl: "https://example.test/sec01",
})

beforeEach(() => {
  checkoutSessionCreateMock.mockClear()
  checkoutSessionRetrieveMock.mockClear()
  redirectState.url = ""
  retrievedSessionState.session = null
})

afterAll(async () => {
  await db.ad.deleteMany({ where: { sessionId: { startsWith: "cs_sec01ads_" } } })
  await db.$disconnect()
})

describe("createAdsCheckout — server-side pricing (SEC-01)", () => {
  it("prices line items from the canonical spot table and pins the total in metadata", async () => {
    const result = await createAdsCheckout({
      selections: [{ type: "Bottom", startsAt: STARTS_AT, endsAt: ENDS_AT }],
    })

    expect(result?.serverError).toBeUndefined()
    expect(checkoutSessionCreateMock).toHaveBeenCalledTimes(1)

    const checkoutArgs = checkoutSessionCreateMock.mock.calls[0]?.[0] as any
    expect(checkoutArgs.mode).toBe("payment")
    expect(checkoutArgs.line_items).toEqual([
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Bottom Ad" },
          unit_amount: EXPECTED_UNIT_CENTS,
        },
        quantity: 3,
      },
    ])
    expect(checkoutArgs.metadata.adsTotalCents).toBe(String(EXPECTED_TOTAL_CENTS))
    expect(JSON.parse(checkoutArgs.metadata.ads)).toEqual([
      { type: "Bottom", startsAt: STARTS_AT, endsAt: ENDS_AT },
    ])
    expect(checkoutArgs.success_url).toContain("/advertise/success")
    expect(redirectState.url).toBe("https://checkout.stripe.test/sec01-ads")
  })

  it("ignores any client-supplied amount fields (schema strips them)", async () => {
    const result = await createAdsCheckout({
      selections: [
        { type: "Bottom", startsAt: STARTS_AT, endsAt: ENDS_AT, unitAmount: 1, price: 0.01 },
      ],
    } as any)

    expect(result?.serverError).toBeUndefined()
    const checkoutArgs = checkoutSessionCreateMock.mock.calls[0]?.[0] as any
    expect(checkoutArgs.line_items[0].price_data.unit_amount).toBe(EXPECTED_UNIT_CENTS)
  })

  it("rejects inverted date ranges and duplicate spot selections", async () => {
    const inverted = await createAdsCheckout({
      selections: [{ type: "Bottom", startsAt: ENDS_AT, endsAt: STARTS_AT }],
    })
    expect(inverted?.serverError).toBeDefined()

    const duplicated = await createAdsCheckout({
      selections: [
        { type: "Bottom", startsAt: STARTS_AT, endsAt: ENDS_AT },
        { type: "Bottom", startsAt: STARTS_AT, endsAt: ENDS_AT },
      ],
    })
    expect(duplicated?.serverError).toBeDefined()

    expect(checkoutSessionCreateMock).not.toHaveBeenCalled()
  })
})

describe("createAdFromCheckout — amount verification (SEC-01)", () => {
  it("refuses sessions without the server-pinned adsTotalCents", async () => {
    const sessionId = `cs_sec01ads_${TS}_no_pin`
    retrievedSessionState.session = {
      id: sessionId,
      status: "complete",
      mode: "payment",
      amount_subtotal: EXPECTED_TOTAL_CENTS,
      amount_total: EXPECTED_TOTAL_CENTS,
      customer_details: { email: "sec01-ads@test.local" },
      metadata: { ads: adsMetadata }, // forged via the old free-form metadata path
    }

    const result = await createAdFromCheckout(adDetails(sessionId))

    expect(result?.serverError).toBe("Invalid session for ad creation")
    const ads = await db.ad.findMany({ where: { sessionId } })
    expect(ads).toHaveLength(0)
  })

  it("refuses sessions that paid less than the pinned total", async () => {
    const sessionId = `cs_sec01ads_${TS}_underpaid`
    retrievedSessionState.session = {
      id: sessionId,
      status: "complete",
      mode: "payment",
      amount_subtotal: 100, // paid $1 for a $29.40 booking
      amount_total: 100,
      customer_details: { email: "sec01-ads@test.local" },
      metadata: { ads: adsMetadata, adsTotalCents: String(EXPECTED_TOTAL_CENTS) },
    }

    const result = await createAdFromCheckout(adDetails(sessionId))

    expect(result?.serverError).toBe("Checkout session amount could not be verified")
    const ads = await db.ad.findMany({ where: { sessionId } })
    expect(ads).toHaveLength(0)
  })

  it("mints the ad when the paid amount covers the pinned total", async () => {
    const sessionId = `cs_sec01ads_${TS}_paid`
    retrievedSessionState.session = {
      id: sessionId,
      status: "complete",
      mode: "payment",
      amount_subtotal: EXPECTED_TOTAL_CENTS,
      amount_total: EXPECTED_TOTAL_CENTS,
      customer_details: { email: "sec01-ads@test.local" },
      metadata: { ads: adsMetadata, adsTotalCents: String(EXPECTED_TOTAL_CENTS) },
    }

    const result = await createAdFromCheckout(adDetails(sessionId))

    expect(result?.serverError).toBeUndefined()
    expect(result?.data).toEqual({ success: true })

    const ads = await db.ad.findMany({ where: { sessionId } })
    expect(ads).toHaveLength(1)
    expect(ads[0]?.type).toBe("Bottom")
    expect(ads[0]?.email).toBe("sec01-ads@test.local")
  })
})
