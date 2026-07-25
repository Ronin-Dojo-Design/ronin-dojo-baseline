import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { VISIBLE_BRAND_SKINS } from "~/components/app/state-of-dojo/_kernel/phase"
import { Wrapper } from "~/components/common/wrapper"
import { BrandStatePanel, brandMastheadTitle } from "./brand-state-panel"

// Same posture as `/app/state`: the panel self-fetches from `main` (`revalidate`-cached ~5min),
// so render fresh per request without hammering GitHub.
export const dynamic = "force-dynamic"

type Props = { params: Promise<{ brand: string }> }

/**
 * /app/state/[brand] — the brand-scoped State-of-Dojo projection surface (SESSION_0674).
 *
 * ONE lane, deterministically pinned by the URL (`/app/state/bbl` renders ONLY BBL — the view a
 * brand stakeholder gets a link to), unlike `/app/state`, whose brand scope is an env property
 * (`NEXT_PUBLIC_SOTD_ALL_BRANDS`) and whose masthead totals + Risk-watch/Needs-you feeds are
 * cross-brand by protocol.
 *
 * The segment validates against `VISIBLE_BRAND_SKINS` — the ONE place deploy-scope is decided
 * (`_kernel/phase.ts`) — so a single-brand deploy 404s every other brand's route and cross-brand
 * dev work never leaks onto a customer deploy; the all-brands env resolves all skins.
 *
 * The route owns placement (the `Wrapper`); `BrandStatePanel` stays placement-agnostic.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  const skin = VISIBLE_BRAND_SKINS.find(s => s.key === brand)
  return { title: skin ? brandMastheadTitle(skin) : "State" }
}

export default async function Page({ params }: Props) {
  const { brand } = await params
  const skin = VISIBLE_BRAND_SKINS.find(s => s.key === brand)
  if (!skin) notFound()

  return (
    <Wrapper size="lg" gap="sm">
      <BrandStatePanel skin={skin} />
    </Wrapper>
  )
}
