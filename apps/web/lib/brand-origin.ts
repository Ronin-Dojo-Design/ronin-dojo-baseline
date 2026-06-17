import { siteConfig } from "~/config/site"
import { getRequestOrigin } from "~/lib/brand-context"

/**
 * The absolute origin to use when building outbound links (Stripe
 * success/cancel URLs, email links) for the current request.
 *
 * Derived from the request host so each brand's links use its own domain on the
 * single shared deployment (ADR 0006) — `https://blackbeltlegacy.com` for BBL,
 * `https://baselinemartialarts.com` for Baseline, etc. — rather than the single
 * static `NEXT_PUBLIC_SITE_URL`, which can only hold one brand's origin. Falls
 * back to `siteConfig.url` when there is no request context (e.g. background
 * jobs / webhooks).
 *
 * Server-only and kept OUT of `brand-context.ts` on purpose: that module is
 * imported by the edge middleware (`proxy.ts`), and importing `config/site`
 * there would pull env validation into the edge bundle.
 */
export const getBrandOrigin = async (): Promise<string> => {
  return (await getRequestOrigin()) ?? siteConfig.url
}
