"use client"

import { getInitials } from "@dirstack/utils"
import {
  BookOpenIcon,
  BuildingIcon,
  ContactRoundIcon,
  GitBranchIcon,
  GraduationCapIcon,
  InfoIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MedalIcon,
  SchoolIcon,
  ShieldHalfIcon,
  ShieldIcon,
  ShoppingBagIcon,
  StoreIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/common/sheet"
import { ThemeSwitcher } from "~/components/web/theme-switcher"
import { NavLink } from "~/components/web/ui/nav-link"
import { UserLogout } from "~/components/web/user-logout"
import { useSession } from "~/lib/auth-client"

type NavSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Right slide-in navigation panel (account + primary nav), available at all
 * viewport widths. UX intent from the legacy BBL side drawer (SESSION_0361 §Q4
 * measured spec), rebuilt brand-neutral on the Sheet primitive.
 */
export const NavSheet = ({ open, onOpenChange }: NavSheetProps) => {
  const { data: session } = useSession()
  const pathname = usePathname()
  const t = useTranslations()

  // Close when the user navigates to a new page
  useEffect(() => onOpenChange(false), [pathname, onOpenChange])

  const user = session?.user

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[280px]">
        <SheetTitle className="sr-only">{t("navigation.open_menu")}</SheetTitle>

        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={user?.image ?? undefined} />
              <AvatarFallback>{user ? getInitials(user.name) : "?"}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="truncate font-medium">{user?.name ?? t("navigation.guest")}</div>
              <div className="truncate text-sm text-muted-foreground">
                {user?.email ?? t("navigation.sign_in_tagline")}
              </div>
            </div>
          </div>

          {!user && (
            <div className="flex flex-col gap-2">
              <Button variant="primary" size="md" render={<Link href="/auth/login" />}>
                {t("navigation.create_account")}
              </Button>
              <Button variant="secondary" size="md" render={<Link href="/auth/login" />}>
                {t("navigation.sign_in")}
              </Button>
            </div>
          )}
        </SheetHeader>

        {user && (
          <nav className="flex flex-col gap-3 border-t pt-4">
            <NavLink href="/dashboard" prefix={<LayoutDashboardIcon />}>
              {t("navigation.dashboard")}
            </NavLink>

            {user.role === "admin" && (
              <NavLink href="/admin" prefix={<ShieldHalfIcon />}>
                {t("navigation.admin_panel")}
              </NavLink>
            )}
          </nav>
        )}

        <nav className="flex flex-col gap-3 border-t pt-4">
          <NavLink href="/lineage" prefix={<GitBranchIcon />}>
            {t("navigation.lineage")}
          </NavLink>
          <NavLink href="/directory" prefix={<ContactRoundIcon />}>
            {t("navigation.directory")}
          </NavLink>
          <NavLink href="/members" prefix={<UsersIcon />}>
            {t("navigation.members")}
          </NavLink>
          <NavLink href="/schools" prefix={<SchoolIcon />}>
            {t("navigation.schools")}
          </NavLink>
          <NavLink href="/organizations" prefix={<BuildingIcon />}>
            {t("navigation.organizations")}
          </NavLink>
          <NavLink href="/disciplines" prefix={<ShieldIcon />}>
            {t("navigation.disciplines")}
          </NavLink>
          <NavLink href="/techniques" prefix={<SwordsIcon />}>
            {t("navigation.techniques")}
          </NavLink>
          <NavLink href="/programs" prefix={<MedalIcon />}>
            {t("navigation.programs")}
          </NavLink>
          <NavLink href="/tournaments" prefix={<TrophyIcon />}>
            {t("navigation.tournaments")}
          </NavLink>
          <NavLink href="/courses" prefix={<GraduationCapIcon />}>
            {t("navigation.courses")}
          </NavLink>
          <NavLink href="/gear" prefix={<ShoppingBagIcon />}>
            {t("navigation.gear")}
          </NavLink>
          <NavLink href="/merch" prefix={<StoreIcon />}>
            {t("navigation.merch")}
          </NavLink>
          <NavLink href="/blog" prefix={<BookOpenIcon />}>
            {t("navigation.blog")}
          </NavLink>
          <NavLink href="/about" prefix={<InfoIcon />}>
            {t("navigation.about")}
          </NavLink>
        </nav>

        {user && (
          <nav className="flex flex-col gap-3 border-t pt-4">
            <NavLink
              className="text-destructive hover:text-destructive"
              prefix={<LogOutIcon />}
              render={<UserLogout />}
            >
              {t("navigation.sign_out")}
            </NavLink>
          </nav>
        )}

        <SheetFooter>
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="ghost"
              className="p-1 text-base"
              render={<ThemeSwitcher />}
            />
            <Button size="sm" variant="primary" render={<Link href="/lineage/join" />}>
              Join Legacy
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
