"use client"

import {
  BookOpenIcon,
  BuildingIcon,
  ChevronDownIcon,
  ContactRoundIcon,
  GitBranchIcon,
  GraduationCapIcon,
  SchoolIcon,
  SearchIcon,
  ShieldIcon,
  ShoppingBagIcon,
  StoreIcon,
  SwordsIcon,
  UsersIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { type ComponentProps, useEffect, useState } from "react"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { NavSheet } from "~/components/web/nav/nav-sheet"
import { ThemeSwitcher } from "~/components/web/theme-switcher"
import { type BrandFeature, brandHasFeature, brandHasMinimalChrome } from "~/config/brand-features"
import { useBrand } from "~/contexts/brand-context"
import { Container } from "~/components/web/ui/container"
import { Hamburger } from "~/components/web/ui/hamburger"
import { Logo } from "~/components/web/ui/logo"
import { NavLink } from "~/components/web/ui/nav-link"
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
      <Button
        size="sm"
        variant="fancy"
        className="rounded-full px-4"
        render={<Link href="/lineage/join" />}
      >
        {t("navigation.join")}
      </Button>
    </>
  )
}

const Header = ({ className, ...props }: ComponentProps<"div">) => {
  const search = useSearch()
  const t = useTranslations()
  const { brand } = useBrand()
  const has = (feature: BrandFeature) => brandHasFeature(brand, feature)
  // Minimal chrome (SESSION_0361 legacy spec): logo + hamburger + Join CTA + account;
  // primary nav lives in the slide-in only.
  const minimal = brandHasMinimalChrome(brand)
  // Escape + route-change closing live in NavSheet (Base UI Dialog handles Escape).
  const [isNavOpen, setNavOpen] = useState(false)

  return (
    <header
      className={cx(
        "fixed top-(--header-top) inset-x-0 z-50",
        // Brand-dark chrome for minimal brands (BBL) via the shared
        // `.chrome-surface` remap; every other brand keeps the plain background.
        minimal ? "chrome-surface border-b border-chrome-border" : "bg-background",
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

            {/* BBL ships the white uploaded mark only (no wordmark) on the dark
                chrome; other brands keep the mark + wordmark lockup. */}
            <Logo
              className="min-w-0"
              hideName={minimal}
              imageClassName={minimal ? "h-8" : undefined}
            />
          </Stack>

          {minimal ? (
            <div className="flex-1 max-lg:hidden" />
          ) : (
            <nav className="flex flex-wrap gap-x-4 gap-y-0.5 flex-1 max-lg:hidden">
              {has("programs") && <NavLink href="/programs">{t("navigation.programs")}</NavLink>}
              {has("tournaments") && (
                <NavLink href="/tournaments">{t("navigation.tournaments")}</NavLink>
              )}

              <DropdownMenu>
                <NavLink
                  className="gap-1"
                  suffix={<ChevronDownIcon className="group-data-open:-rotate-180" />}
                  render={<DropdownMenuTrigger />}
                >
                  {t("navigation.browse")}
                </NavLink>

                <DropdownMenuContent align="start">
                  {has("disciplines") && (
                    <DropdownMenuItem
                      render={<NavLink href="/disciplines" prefix={<ShieldIcon />} />}
                    >
                      {t("navigation.disciplines")}
                    </DropdownMenuItem>
                  )}
                  {has("schools") && (
                    <DropdownMenuItem render={<NavLink href="/schools" prefix={<SchoolIcon />} />}>
                      {t("navigation.schools")}
                    </DropdownMenuItem>
                  )}
                  {has("organizations") && (
                    <DropdownMenuItem
                      render={<NavLink href="/organizations" prefix={<BuildingIcon />} />}
                    >
                      {t("navigation.organizations")}
                    </DropdownMenuItem>
                  )}
                  {has("courses") && (
                    <DropdownMenuItem
                      render={<NavLink href="/courses" prefix={<GraduationCapIcon />} />}
                    >
                      {t("navigation.courses")}
                    </DropdownMenuItem>
                  )}
                  {has("techniques") && (
                    <DropdownMenuItem
                      render={<NavLink href="/techniques" prefix={<SwordsIcon />} />}
                    >
                      {t("navigation.techniques")}
                    </DropdownMenuItem>
                  )}
                  {has("lineage") && (
                    <DropdownMenuItem
                      render={<NavLink href="/lineage" prefix={<GitBranchIcon />} />}
                    >
                      {t("navigation.lineage")}
                    </DropdownMenuItem>
                  )}
                  {has("directory") && (
                    <DropdownMenuItem
                      render={<NavLink href="/directory" prefix={<ContactRoundIcon />} />}
                    >
                      {t("navigation.directory")}
                    </DropdownMenuItem>
                  )}
                  {has("members") && (
                    <DropdownMenuItem render={<NavLink href="/members" prefix={<UsersIcon />} />}>
                      {t("navigation.members")}
                    </DropdownMenuItem>
                  )}
                  {has("gear") && (
                    <DropdownMenuItem
                      render={<NavLink href="/gear" prefix={<ShoppingBagIcon />} />}
                    >
                      {t("navigation.gear")}
                    </DropdownMenuItem>
                  )}
                  {has("merch") && (
                    <DropdownMenuItem render={<NavLink href="/merch" prefix={<StoreIcon />} />}>
                      {t("navigation.merch")}
                    </DropdownMenuItem>
                  )}
                  {has("blog") && (
                    <DropdownMenuItem render={<NavLink href="/blog" prefix={<BookOpenIcon />} />}>
                      {t("navigation.blog")}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <NavLink href="/about">{t("navigation.about")}</NavLink>
            </nav>
          )}

          <Stack size="sm" wrap={false} className="justify-end max-lg:grow">
            {has("listings") && (
              <Button size="sm" variant="ghost" className="p-1 text-base" onClick={search.open}>
                <SearchIcon />
              </Button>
            )}

            {!minimal && (
              <Button
                size="sm"
                variant="ghost"
                className="p-1 -ml-1 text-base max-sm:hidden"
                render={<ThemeSwitcher />}
              />
            )}

            {has("programs") && (
              <Button size="sm" variant="secondary" render={<Link href="/programs" />}>
                {t("navigation.programs")}
              </Button>
            )}

            {minimal ? (
              <MinimalAuthControls />
            ) : (
              <>
                {has("lineage") && (
                  <Button size="sm" variant="primary" render={<Link href="/lineage/join" />}>
                    Join Legacy
                  </Button>
                )}

                <UserMenu />
              </>
            )}
          </Stack>
        </div>

        <NavSheet open={isNavOpen} onOpenChange={setNavOpen} />
      </Container>
    </header>
  )
}

export { Header }
