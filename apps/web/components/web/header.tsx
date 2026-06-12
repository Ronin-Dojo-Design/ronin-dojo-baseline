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

          <nav className="flex flex-wrap gap-x-4 gap-y-0.5 flex-1 max-lg:hidden">
            <NavLink href="/programs">{t("navigation.programs")}</NavLink>
            <NavLink href="/tournaments">{t("navigation.tournaments")}</NavLink>

            <DropdownMenu>
              <NavLink
                className="gap-1"
                suffix={<ChevronDownIcon className="group-data-open:-rotate-180" />}
                render={<DropdownMenuTrigger />}
              >
                {t("navigation.browse")}
              </NavLink>

              <DropdownMenuContent align="start">
                <DropdownMenuItem render={<NavLink href="/disciplines" prefix={<ShieldIcon />} />}>
                  {t("navigation.disciplines")}
                </DropdownMenuItem>
                <DropdownMenuItem render={<NavLink href="/schools" prefix={<SchoolIcon />} />}>
                  {t("navigation.schools")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<NavLink href="/organizations" prefix={<BuildingIcon />} />}
                >
                  {t("navigation.organizations")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<NavLink href="/courses" prefix={<GraduationCapIcon />} />}
                >
                  {t("navigation.courses")}
                </DropdownMenuItem>
                <DropdownMenuItem render={<NavLink href="/techniques" prefix={<SwordsIcon />} />}>
                  {t("navigation.techniques")}
                </DropdownMenuItem>
                <DropdownMenuItem render={<NavLink href="/lineage" prefix={<GitBranchIcon />} />}>
                  {t("navigation.lineage")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<NavLink href="/directory" prefix={<ContactRoundIcon />} />}
                >
                  {t("navigation.directory")}
                </DropdownMenuItem>
                <DropdownMenuItem render={<NavLink href="/members" prefix={<UsersIcon />} />}>
                  {t("navigation.members")}
                </DropdownMenuItem>
                <DropdownMenuItem render={<NavLink href="/gear" prefix={<ShoppingBagIcon />} />}>
                  {t("navigation.gear")}
                </DropdownMenuItem>
                <DropdownMenuItem render={<NavLink href="/merch" prefix={<StoreIcon />} />}>
                  {t("navigation.merch")}
                </DropdownMenuItem>
                <DropdownMenuItem render={<NavLink href="/blog" prefix={<BookOpenIcon />} />}>
                  {t("navigation.blog")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <NavLink href="/about">{t("navigation.about")}</NavLink>
          </nav>

          <Stack size="sm" wrap={false} className="justify-end max-lg:grow">
            <Button size="sm" variant="ghost" className="p-1 text-base" onClick={search.open}>
              <SearchIcon />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="p-1 -ml-1 text-base max-sm:hidden"
              render={<ThemeSwitcher />}
            />

            <Button size="sm" variant="secondary" render={<Link href="/programs" />}>
              {t("navigation.programs")}
            </Button>

            <Button size="sm" variant="primary" render={<Link href="/lineage/join" />}>
              Join Legacy
            </Button>

            <UserMenu />
          </Stack>
        </div>

        <NavSheet open={isNavOpen} onOpenChange={setNavOpen} />
      </Container>
    </header>
  )
}

export { Header }
