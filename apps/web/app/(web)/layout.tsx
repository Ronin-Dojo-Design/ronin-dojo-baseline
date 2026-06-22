import { cookies } from "next/headers"
import PlausibleProvider from "next-plausible"
import { type PropsWithChildren } from "react"
import { Brand } from "~/.generated/prisma/client"
import { Wrapper } from "~/components/common/wrapper"
import { FeedbackWidget } from "~/components/web/feedback-widget"
import { Header } from "~/components/web/header"
import { Backdrop } from "~/components/web/ui/backdrop"
import { Container } from "~/components/web/ui/container"
import { siteConfig } from "~/config/site"
import { env } from "~/env"
import { BBL_PREVIEW_COOKIE, getBblPreviewToken } from "~/lib/bbl-preview"
import { getCurrentUserAvatar } from "~/server/web/account/current-user-avatar"
import { BblFooter } from "./_components/bbl-footer"
import { BblTeaserPage } from "./_components/bbl-teaser"

// Launched 2026-06-19 — the holding page is permanently retired. Hard-off in code
// so the public site never gates, independent of any env var. (Was gated on
// env.BBL_COUNTDOWN; flip this back to that expression to re-gate if ever needed.)
const isBblCountdownActive = () => false

// Previewers (admins / stakeholders) who opened `/preview?token=…` carry a cookie
// that lets them through the holding page to the real site.
const hasBblPreviewBypass = async () =>
  (await cookies()).get(BBL_PREVIEW_COOKIE)?.value === getBblPreviewToken()

export default async function ({ children }: PropsWithChildren) {
  // Pre-launch holding page: BBL only, env-gated. Previewers with a valid bypass
  // cookie skip it. Other brands are never affected. (Launched 2026-06-19 — the
  // BBL_COUNTDOWN var was removed from prod env, so this gate is now inert.)
  if (isBblCountdownActive() && !(await hasBblPreviewBypass())) {
    return <BblTeaserPage />
  }

  // Resolved server-side (Passport avatar ?? user.image ?? gi default) and passed to
  // the client header/nav-sheet as a prop — lib/media pulls Prisma, so it can't run
  // in the client chrome.
  const userAvatarUrl = await getCurrentUserAvatar(Brand.BBL)

  return (
    <PlausibleProvider
      domain={env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? siteConfig.domain}
      customDomain={env.NEXT_PUBLIC_PLAUSIBLE_URL}
    >
      <div className="flex flex-col min-h-dvh overflow-clip pt-(--header-inner-offset)">
        <Header userAvatarUrl={userAvatarUrl} />

        <Backdrop isFixed />

        <Container render={<Wrapper className="grow py-fluid-md" />}>{children}</Container>

        <BblFooter />
      </div>

      <FeedbackWidget />
    </PlausibleProvider>
  )
}
