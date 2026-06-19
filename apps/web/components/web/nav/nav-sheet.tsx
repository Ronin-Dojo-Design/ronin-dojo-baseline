"use client"

import { getInitials } from "@dirstack/utils"
import {
  ContactRoundIcon,
  GitBranchIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  NewspaperIcon,
  SchoolIcon,
  ShieldHalfIcon,
  UsersIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
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
import { LoginDialog } from "~/components/web/auth/login-dialog"
import { NavLink } from "~/components/web/ui/nav-link"
import { UserLogout } from "~/components/web/user-logout"
import { type BrandFeature, brandHasFeature, brandHasMinimalChrome } from "~/config/brand-features"
import { useBrand } from "~/contexts/brand-context"
import { useSession } from "~/lib/auth-client"
import { cx } from "~/lib/utils"

// Inlined here (not imported from lib/media, which pulls the Prisma client into the
// browser bundle — this is a client component). Single-brand BBL gi fallback avatar.
const BBL_GI_AVATAR = "/brand/bbl/default-black-belt.png"

type NavSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Server-resolved avatar (Passport.avatarUrl ?? user.image ?? gi). */
  userAvatarUrl?: string | null
}

// Curated BBL nav (SESSION_0416 operator). Posts + Blog both kept for now to
// compare. Organizations / Disciplines / Tournaments / Courses / Gear / Merch cut.
const PRIMARY_NAV_ITEMS = [
  { href: "/lineage/join", key: "lineage", icon: GitBranchIcon, feature: "lineage" },
  { href: "/directory", key: "directory", icon: ContactRoundIcon, feature: "directory" },
  { href: "/members", key: "members", icon: UsersIcon, feature: "members" },
  { href: "/schools", key: "schools", icon: SchoolIcon, feature: "schools" },
  { href: "/posts", key: "posts", icon: NewspaperIcon, feature: "posts" },
  // Curriculum / Techniques / Blog hidden for launch (SESSION_0417) — routes still
  // exist; re-add here to resurface in nav.
] satisfies Array<{
  href: string
  key: string
  icon: typeof GitBranchIcon
  feature: BrandFeature
}>

/**
 * Right slide-in navigation panel (account + primary nav), available at all
 * viewport widths. UX intent from the legacy BBL side drawer (SESSION_0361 §Q4
 * measured spec), rebuilt brand-neutral on the Sheet primitive.
 */
export const NavSheet = ({ open, onOpenChange, userAvatarUrl }: NavSheetProps) => {
  const { data: session } = useSession()
  const pathname = usePathname()
  const t = useTranslations()
  const { brand } = useBrand()
  // BBL (minimal chrome) drawer rides the shared `.chrome-surface` remap so the
  // NavLink / Button / Avatar primitives render on the brand-dark surface with no
  // per-component overrides; other brands keep the default light/dark Sheet.
  const minimal = brandHasMinimalChrome(brand)
  const navItems = PRIMARY_NAV_ITEMS.filter(item => brandHasFeature(brand, item.feature))
  const [loginOpen, setLoginOpen] = useState(false)

  // Close when the user navigates to a new page
  useEffect(() => onOpenChange(false), [pathname, onOpenChange])

  const user = session?.user

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className={cx("w-[280px]", minimal && "chrome-surface")}>
          <SheetTitle className="sr-only">{t("navigation.open_menu")}</SheetTitle>

          <SheetHeader>
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                {/* Server-resolved (Passport.avatarUrl ?? user.image); guests + avatar-less
                  users fall back to the BBL gi belt avatar. */}
                <AvatarImage src={userAvatarUrl ?? BBL_GI_AVATAR} />
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
                <Button variant="primary" size="md" render={<Link href="/lineage/join" />}>
                  {t("navigation.create_account")}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    onOpenChange(false)
                    setLoginOpen(true)
                  }}
                >
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
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink key={item.href} href={item.href} prefix={<Icon />}>
                  {t(`navigation.${item.key}`)}
                </NavLink>
              )
            })}
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

      <LoginDialog isOpen={loginOpen} setIsOpen={setLoginOpen} />
    </>
  )
}
