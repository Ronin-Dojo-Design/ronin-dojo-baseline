"use client"

import { getInitials } from "@dirstack/utils"
import {
  ContactRoundIcon,
  GitBranchIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessagesSquareIcon,
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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/common/sheet"
import { JoinCtaButton } from "~/app/(web)/_components/join-modal/join-cta-button"
import { ThemeSwitcher } from "~/components/web/theme-switcher"
import { LoginDialog } from "~/components/web/auth/login-dialog"
import { NavLink } from "~/components/web/ui/nav-link"
import { UserLogout } from "~/components/web/user-logout"
import { useSession } from "~/lib/auth-client"
import { isAdmin } from "~/lib/authz-predicates"

// Inlined here (not imported from lib/media, which pulls the Prisma client into the
// browser bundle — this is a client component). Single-brand BBL gi fallback avatar.
const BBL_GI_AVATAR = "/brand/bbl/default-black-belt.png"

type NavSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Server-resolved avatar (Passport.avatarUrl ?? user.image ?? gi). */
  userAvatarUrl?: string | null
}

// Curated BBL nav (SESSION_0416 operator). SESSION_0493 (ADR 0042 Amendment 1): the
// 0485 `/posts` → `/blog` 301 is deleted — `/posts` is the member community feed
// (`CommunityPost`, labeled "Community"), a permanent sibling of the editorial `/blog`.
// Organizations / Disciplines / Tournaments / Courses / Gear / Merch cut.
const PRIMARY_NAV_ITEMS = [
  { href: "/lineage/join", key: "lineage", icon: GitBranchIcon },
  { href: "/directory", key: "directory", icon: ContactRoundIcon },
  { href: "/members", key: "members", icon: UsersIcon },
  { href: "/schools", key: "schools", icon: SchoolIcon },
  { href: "/posts", key: "posts", icon: MessagesSquareIcon },
  { href: "/blog", key: "blog", icon: NewspaperIcon },
  // Curriculum / Techniques hidden for launch (SESSION_0417) — routes still
  // exist; re-add here to resurface in nav.
] satisfies Array<{
  href: string
  key: string
  icon: typeof GitBranchIcon
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
  // BBL (minimal chrome) drawer rides the shared `.chrome-surface` remap so the
  // NavLink / Button / Avatar primitives render on the brand-dark surface with no
  // per-component overrides.
  const navItems = PRIMARY_NAV_ITEMS
  const [loginOpen, setLoginOpen] = useState(false)

  // Close when the user navigates to a new page
  useEffect(() => onOpenChange(false), [pathname, onOpenChange])

  const user = session?.user

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[280px] chrome-surface">
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
                <JoinCtaButton variant="primary" size="md" onActivate={() => onOpenChange(false)}>
                  {t("navigation.create_account")}
                </JoinCtaButton>
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

              {/* C2-8: shared `isAdmin` predicate (not a forked `role === "admin"`); link the
                  canonical `/app` target directly instead of `/admin` (a 308 redirect → /app). */}
              {isAdmin(user) && (
                <NavLink href="/app" prefix={<ShieldHalfIcon />}>
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
              <JoinCtaButton size="sm" variant="primary" onActivate={() => onOpenChange(false)}>
                {t("navigation.join_legacy")}
              </JoinCtaButton>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <LoginDialog isOpen={loginOpen} setIsOpen={setLoginOpen} />
    </>
  )
}
