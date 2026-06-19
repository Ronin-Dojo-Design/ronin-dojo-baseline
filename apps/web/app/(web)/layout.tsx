import { cookies } from "next/headers"
import PlausibleProvider from "next-plausible"
import { type PropsWithChildren, Suspense } from "react"
import { Brand } from "~/.generated/prisma/client"
import { Wrapper } from "~/components/common/wrapper"
import { AdBanner } from "~/components/web/ads/ad-banner"
import { Bottom } from "~/components/web/bottom"
import { FeedbackWidget } from "~/components/web/feedback-widget"
import { Footer } from "~/components/web/footer"
import { Header } from "~/components/web/header"
import { Backdrop } from "~/components/web/ui/backdrop"
import { Container } from "~/components/web/ui/container"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { env } from "~/env"
import { BBL_PREVIEW_COOKIE, getBblPreviewToken } from "~/lib/bbl-preview"
import { getRequestBrand } from "~/lib/brand-context"
import { findBrandSettings } from "~/server/admin/brand-settings/queries"
import { BblLanding } from "./(home)/bbl/bbl-landing"
import { BblFooter } from "./_components/bbl-footer"
import { BblTeaserPage } from "./_components/bbl-teaser"

const isBblCountdownActive = () =>
  env.BBL_COUNTDOWN === "1" || env.BBL_COUNTDOWN?.toLowerCase() === "true"

// Previewers (admins / stakeholders) who opened `/preview?token=…` carry a cookie
// that lets them through the holding page to the real site.
const hasBblPreviewBypass = async () =>
  (await cookies()).get(BBL_PREVIEW_COOKIE)?.value === getBblPreviewToken()

export default async function ({ children }: PropsWithChildren) {
  const requestBrand = await getRequestBrand()

  // Pre-launch holding page: BBL only, env-gated. Previewers with a valid bypass
  // cookie skip it. Other brands are never affected.
  if (isBblCountdownActive() && requestBrand === Brand.BBL && !(await hasBblPreviewBypass())) {
    const brandSettings = await findBrandSettings(Brand.BBL)
    // Holding page = the brandable teaser hero + email capture, then the full landing
    // (its own hero suppressed; every gated route hidden) below, then the footer — so
    // gated visitors still get the full BBL story while the launch is held back.
    return (
      <>
        <BblTeaserPage
          logoUrl={brandSettings?.logoUrl ?? null}
          brandName={getBrandSiteConfig(Brand.BBL).name}
        />
        <BblLanding showHero={false} holdingPage />
        <BblFooter />
      </>
    )
  }

  return (
    <PlausibleProvider
      domain={env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? siteConfig.domain}
      customDomain={env.NEXT_PUBLIC_PLAUSIBLE_URL}
    >
      <div className="flex flex-col min-h-dvh overflow-clip pt-(--header-inner-offset)">
        <Header />

        <Backdrop isFixed />

        <Suspense>
          <AdBanner />
        </Suspense>

        <Container render={<Wrapper className="grow py-fluid-md" />}>
          {children}

          <Footer />
        </Container>
      </div>

      <Bottom />

      <FeedbackWidget />
    </PlausibleProvider>
  )
}
