import type { Metadata } from "next"
import { LaunchCountdown } from "~/components/web/bbl/launch-countdown"

/**
 * Coming-soon / launch-countdown page.
 *
 * The middleware (`proxy.ts`) rewrites BBL public routes here while the launch
 * gate is active (`NEXT_PUBLIC_BBL_LAUNCH_AT` in the future). It sits outside the
 * `(web)` group so it renders without the site header/footer — a clean takeover.
 * Operator surfaces (`/app`, `/admin`, `/api`, …) and `?preview` sessions are not
 * gated. See docs/product/black-belt-legacy/BBL_LAUNCH_GATE.md.
 */

export const metadata: Metadata = {
  title: "Coming soon",
  robots: { index: false, follow: false },
}

export default function ComingSoonPage() {
  return <LaunchCountdown />
}
