"use client"

import { SearchIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { type ComponentProps, useEffect, useState } from "react"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { JoinCtaButton } from "~/app/(web)/_components/join-modal/join-cta-button"
import { NavSheet } from "~/components/web/nav/nav-sheet"
import { Container } from "~/components/web/ui/container"
import { Hamburger } from "~/components/web/ui/hamburger"
import { Logo } from "~/components/web/ui/logo"
import { UserMenu } from "~/components/web/user-menu"
import { useSearch } from "~/contexts/search-context"
import { useSession } from "~/lib/auth-client"
import { cx } from "~/lib/utils"

// Rounded outline "Sign In" pill for the BBL (minimal-chrome) dark header. Hand-
// rolled rather than a Button variant because the design-system variants assume a
// light scheme — this reads its colors from the chrome tokens so it stays legible
// on the dark surface and brand-driven (no hardcoded neutrals).
const OUTLINE_PILL =
  "inline-flex items-center justify-center rounded-full border border-chrome-border px-4 py-1.5 text-sm font-medium text-chrome-foreground transition-colors hover:border-chrome-foreground/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline"

/**
 * Account cluster for the minimal (BBL) header: avatar menu when signed in,
 * Sign In (outline) + Join (primary/`fancy` = `bg-primary`) pills when signed
 * out. Mirrors `UserMenu`'s mounted+session guard so SSR and the first client
 * paint render an identical stable node (no hydration mismatch).
 */
const MinimalAuthControls = () => {
  const { data: session, isPending } = useSession()
  const t = useTranslations()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || isPending) {
    return <div className="size-7" aria-hidden />
  }

  if (session?.user) {
    return <UserMenu />
  }

  return (
    <>
      <Link href="/auth/login" className={OUTLINE_PILL}>
        {t("navigation.sign_in")}
      </Link>
      <JoinCtaButton size="sm" variant="fancy" className="rounded-full px-4">
        {t("navigation.join")}
      </JoinCtaButton>
    </>
  )
}

/**
 * Public header — minimal (BBL) chrome (SESSION_0361 legacy spec): logo +
 * hamburger left, search + account/Join right; primary nav lives in the slide-in
 * (`NavSheet`). Single-brand collapse (SESSION_0447): the former full-chrome
 * inline-nav branch (gated on the now-removed per-brand chrome flag) was dead for
 * the only brand and has been removed.
 */
const Header = ({
  className,
  userAvatarUrl,
  ...props
}: ComponentProps<"div"> & { userAvatarUrl?: string | null }) => {
  const search = useSearch()
  const t = useTranslations()
  // Escape + route-change closing live in NavSheet (Base UI Dialog handles Escape).
  const [isNavOpen, setNavOpen] = useState(false)

  return (
    <header
      className={cx(
        "fixed top-(--header-top) inset-x-0 z-50",
        // Brand-dark chrome via the shared `.chrome-surface` remap.
        "chrome-surface border-b border-chrome-border",
        className,
      )}
      data-state={isNavOpen ? "open" : "close"}
      {...props}
    >
      <Container>
        <div className="flex items-center py-3.5 gap-4 text-sm h-(--header-height) md:gap-6 lg:gap-8">
          <Stack size="sm" wrap={false} className="min-w-0">
            <button
              type="button"
              onClick={() => setNavOpen(!isNavOpen)}
              aria-label={t("navigation.open_menu")}
              data-state={isNavOpen ? "open" : "close"}
              className="group/menu block -m-1 -ml-1.5 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline"
            >
              <Hamburger className="size-7" />
            </button>

            {/* BBL ships the white uploaded mark only (no wordmark) on the dark chrome. */}
            <Logo className="min-w-0" hideName imageClassName="h-8" />
          </Stack>

          <div className="flex-1 max-lg:hidden" />

          <Stack size="sm" wrap={false} className="justify-end max-lg:grow">
            <Button size="sm" variant="ghost" className="p-1 text-base" onClick={search.open}>
              <SearchIcon />
            </Button>

            <MinimalAuthControls />
          </Stack>
        </div>

        <NavSheet open={isNavOpen} onOpenChange={setNavOpen} userAvatarUrl={userAvatarUrl} />
      </Container>
    </header>
  )
}

export { Header }
