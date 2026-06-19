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
import { type ComponentProps, useState } from "react"
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
import { cx } from "~/lib/utils"

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
      className={cx("fixed top-(--header-top) inset-x-0 z-50 bg-background", className)}
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
              className="group/menu block -m-1 -ml-1.5"
            >
              <Hamburger className="size-7" />
            </button>

            <Logo className="min-w-0" />
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
                  {has("curriculum") && (
                    <DropdownMenuItem
                      render={<NavLink href="/curriculum" prefix={<BookOpenIcon />} />}
                    >
                      {t("navigation.curriculum")}
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

            {has("lineage") && (
              <Button size="sm" variant="primary" render={<Link href="/lineage/join" />}>
                Join Legacy
              </Button>
            )}

            <UserMenu />
          </Stack>
        </div>

        <NavSheet open={isNavOpen} onOpenChange={setNavOpen} />
      </Container>
    </header>
  )
}

export { Header }
