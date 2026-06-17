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
import { siteConfig } from "~/config/site"
import { env } from "~/env"
import { getRequestBrand } from "~/lib/brand-context"
import { BblCountdown } from "./_components/bbl-countdown"

const isBblCountdownActive = () =>
  env.BBL_COUNTDOWN === "1" || env.BBL_COUNTDOWN?.toLowerCase() === "true"

export default async function ({ children }: PropsWithChildren) {
  // Pre-launch holding page: BBL only, env-gated. Other brands are never affected.
  if (isBblCountdownActive() && (await getRequestBrand()) === Brand.BBL) {
    return <BblCountdown />
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
