"use server"

import { getDomain } from "@dirstack/utils"
import { differenceInDays, endOfDay, startOfDay } from "date-fns"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import z from "zod"
import { AdType, Brand, type Prisma } from "~/.generated/prisma/client"
import { adsConfig } from "~/config/ads"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { calculateAdsPrice } from "~/lib/ads"
import { getFaviconFetchUrl } from "~/lib/media"
import { actionClient } from "~/lib/safe-actions"
import { fetchMedia } from "~/server/web/actions/media"
import type { AdOne } from "~/server/web/ads/payloads"
import { findActiveAds } from "~/server/web/ads/queries"
import { createAdDetailsSchema } from "~/server/web/shared/schema"
import { stripe } from "~/services/stripe"

/**
 * SEC-01 — canonical ad spot pricing (USD per day). The client used to send
 * `price_data.unit_amount` for ad purchases; amounts are now derived from this
 * server-side table only. Keep in sync with the spot list in
 * `components/web/ads/ads-picker.tsx` (display only).
 */
const AD_SPOT_PRICE_USD: Record<AdType, number> = {
  [AdType.Tools]: 25,
  [AdType.Banner]: 25,
  [AdType.ToolPage]: 15,
  [AdType.BlogPost]: 15,
  [AdType.Bottom]: 10,
  [AdType.All]: 75,
}

const AD_BASE_PRICE_USD = Math.min(...Object.values(AD_SPOT_PRICE_USD))

const adSelectionSchema = z.object({
  type: z.enum(AdType),
  startsAt: z.coerce.number().int().positive(),
  endsAt: z.coerce.number().int().positive(),
})

const createAdsCheckoutSchema = z.object({
  selections: z.array(adSelectionSchema).min(1).max(Object.keys(AD_SPOT_PRICE_USD).length),
})

/**
 * Chargeable days for a selection: days in the range minus days already booked
 * by existing ads of the same (or blocking "All") type. Mirrors the client
 * calendar's `calculateDuration` so the charged quantity matches what the
 * picker displays.
 */
const calculateChargeableDays = (
  selection: { type: AdType; startsAt: number; endsAt: number },
  booked: Array<{ startsAt: Date; endsAt: Date }>,
) => {
  const from = startOfDay(new Date(selection.startsAt))
  const to = endOfDay(new Date(selection.endsAt))
  const duration = differenceInDays(to, from) + 1

  const overlapDays = booked.reduce((acc, ad) => {
    const bookedFrom = startOfDay(ad.startsAt)
    const bookedTo = endOfDay(ad.endsAt)

    if (bookedTo < from || bookedFrom > to) return acc

    const overlapStart = from > bookedFrom ? from : bookedFrom
    const overlapEnd = to < bookedTo ? to : bookedTo

    return acc + differenceInDays(overlapEnd, overlapStart) + 1
  }, 0)

  return Math.max(duration - overlapDays, 0)
}

/**
 * Create a Stripe Checkout Session for ad spot purchases.
 *
 * SEC-01: replaces the client-priced `price_data` flow through the generic
 * checkout action. The client only sends which spots and dates it wants; the
 * unit amounts, volume discount, metadata, and redirect URLs are all derived
 * server-side. The server-computed total is pinned into `metadata.adsTotalCents`
 * so `createAdFromCheckout` can verify the paid amount before minting ads.
 */
export const createAdsCheckout = actionClient
  .inputSchema(createAdsCheckoutSchema)
  .action(async ({ parsedInput: { selections }, ctx: { db } }) => {
    if (!adsConfig.enabled) {
      throw new Error("Ads are not available for purchase.")
    }

    const seenTypes = new Set(selections.map(selection => selection.type))
    if (seenTypes.size !== selections.length) {
      throw new Error("Duplicate ad spot selections are not allowed.")
    }

    for (const selection of selections) {
      if (selection.endsAt < selection.startsAt) {
        throw new Error("Ad end date must be after the start date.")
      }
    }

    const priced = await Promise.all(
      selections.map(async selection => {
        const booked = await db.ad.findMany({
          where: {
            endsAt: { gte: startOfDay(new Date(selection.startsAt)) },
            startsAt: { lte: endOfDay(new Date(selection.endsAt)) },
            ...(selection.type !== AdType.All
              ? { type: { in: [selection.type, AdType.All] } }
              : {}),
          },
          select: { startsAt: true, endsAt: true },
        })

        const days = calculateChargeableDays(selection, booked)
        return { selection, days, pricePerDay: AD_SPOT_PRICE_USD[selection.type] }
      }),
    )

    if (priced.some(({ days }) => days <= 0)) {
      throw new Error("Selected ad dates are no longer available.")
    }

    const { discountPercentage } = calculateAdsPrice(
      priced.map(({ pricePerDay, days }) => ({ price: pricePerDay, duration: days })),
      AD_BASE_PRICE_USD,
    )

    const lineItems = priced.map(({ selection, days, pricePerDay }) => ({
      price_data: {
        currency: "usd",
        product_data: { name: `${selection.type} Ad` },
        unit_amount: Math.round(pricePerDay * (1 - discountPercentage / 100) * 100),
      },
      quantity: days,
    }))

    const totalCents = lineItems.reduce(
      (sum, item) => sum + item.price_data.unit_amount * item.quantity,
      0,
    )

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer_creation: "if_required",
      invoice_creation: { enabled: true },
      allow_promotion_codes: true,
      metadata: {
        ads: JSON.stringify(
          selections.map(({ type, startsAt, endsAt }) => ({ type, startsAt, endsAt })),
        ),
        adsTotalCents: String(totalCents),
      },
      success_url: `${siteConfig.url}/advertise/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteConfig.url}/advertise?cancelled=true`,
    })

    if (!checkout.url) {
      throw new Error("Unable to create a new Stripe Checkout Session.")
    }

    redirect(checkout.url)
  })

const findAdWithFallbackSchema = z.object({
  type: z.enum(AdType),
  explicitAd: z
    .object({
      type: z.enum(AdType),
      websiteUrl: z.url(),
      name: z.string(),
      description: z.string().nullish(),
      buttonLabel: z.string().nullish(),
      faviconUrl: z.url().nullish(),
      bannerUrl: z.url().nullish(),
    })
    .nullish(),
  fallback: z.array(z.enum(["all", "default"])).default(["all", "default"]),
})

/**
 * Finds an ad based on the provided parameters.
 * @param input - The ad data to find.
 * @returns The ad that was found or null if not found.
 */
export const findAdWithFallback = actionClient
  .inputSchema(findAdWithFallbackSchema)
  .action(async ({ parsedInput: { type, explicitAd, fallback } }) => {
    const t = await getTranslations("ads")
    const brandConfig = getBrandSiteConfig(Brand.BBL)
    let ads: AdOne[] = []

    const defaultAd = {
      type: AdType.All,
      websiteUrl: `${siteConfig.url}/advertise`,
      name: t("default_ad.name"),
      description: t("default_ad.description"),
      buttonLabel: t("default_ad.button_label", { siteName: brandConfig.name }),
      faviconUrl: "/favicon.png",
      bannerUrl: null,
    } satisfies AdOne

    if (!adsConfig.enabled) {
      return null
    }

    if (explicitAd !== undefined) {
      // If ad is explicitly provided, use it directly
      return explicitAd as AdOne | null
    }

    if (type) {
      // Try to find ad for specific type
      ads = await findActiveAds({ where: { type } })
    }

    if (!ads.length && fallback.includes("all")) {
      // Try fallback to "All" type if enabled and specific type not found
      ads = await findActiveAds({ where: { type: "All" } })
    }

    if (!ads.length && fallback.includes("default")) {
      // Try fallback to default ad if enabled and no ad found
      return defaultAd
    }

    if (!ads.length) {
      // Return null if no ads found
      return null
    }

    if (ads.length === 1) {
      return ads[0]
    }

    // Return a random ad from the matching ones
    return ads[Math.floor(Math.random() * ads.length)]
  })

export const createAdFromCheckout = actionClient
  .inputSchema(async () => {
    const t = await getTranslations("schema")
    return createAdDetailsSchema(t)
  })
  .action(async ({ parsedInput: { sessionId, ...adDetails }, ctx: { db, revalidate } }) => {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const email = session.customer_details?.email ?? ""
    const ads: Omit<Omit<Prisma.AdCreateInput, "email">, keyof typeof adDetails>[] = []

    if (session.status !== "complete") {
      throw new Error("Checkout session is not complete")
    }

    // SEC-01: verify the paid amount against the server-pinned total before
    // minting any ads. `metadata.adsTotalCents` is written by
    // `createAdsCheckout` (server-side only — the generic checkout metadata
    // allowlist cannot set it), so a session that lacks it or paid less than
    // it was never a legitimate ad purchase.
    const expectedTotalCents = Number.parseInt(session.metadata?.adsTotalCents ?? "", 10)
    const paidCents = session.amount_subtotal ?? session.amount_total

    if (!Number.isFinite(expectedTotalCents) || expectedTotalCents <= 0) {
      throw new Error("Invalid session for ad creation")
    }

    if (paidCents === null || paidCents < expectedTotalCents) {
      console.error("[ads] checkout amount mismatch — refusing ad creation", {
        sessionId,
        expectedTotalCents,
        paidCents,
      })
      throw new Error("Checkout session amount could not be verified")
    }

    const adDomain = getDomain(adDetails.websiteUrl)
    const faviconFetchUrl = getFaviconFetchUrl(adDetails.websiteUrl)
    const faviconPath = `ads/${adDomain}/favicon`

    // Upload favicon
    const { data: faviconUrl } = await fetchMedia({ url: faviconFetchUrl, path: faviconPath })

    // Check if ads already exist for specific sessionId
    const existingAds = await db.ad.findMany({
      where: { sessionId },
    })

    // If ads already exist, update them
    if (existingAds.length) {
      await db.ad.updateMany({
        where: { sessionId },
        data: { ...adDetails, faviconUrl },
      })

      // Revalidate the cache
      revalidate({ tags: ["ads"] })

      return { success: true }
    }

    switch (session.mode) {
      // Handle one-time payment ads
      case "payment": {
        if (!session.metadata?.ads) {
          throw new Error("Invalid session for ad creation")
        }

        const adsSchema = z.array(
          z.object({
            type: z.enum(AdType),
            startsAt: z.coerce.number().transform(date => new Date(date)),
            endsAt: z.coerce.number().transform(date => new Date(date)),
          }),
        )

        // Parse the ads from the session metadata
        const parsedAds = adsSchema.parse(JSON.parse(session.metadata.ads))

        // Add ads to create later
        ads.push(...parsedAds)

        break
      }

      default: {
        throw new Error("Invalid session for ad creation")
      }
    }

    // Create ads in a transaction
    await db.$transaction(
      ads.map(ad => db.ad.create({ data: { ...ad, ...adDetails, email, faviconUrl, sessionId } })),
    )

    // Revalidate the cache
    revalidate({ tags: ["ads"] })

    return { success: true }
  })
