"use client"

import {
  ContactRoundIcon,
  GitBranchIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  MenuIcon,
  MessagesSquareIcon,
  UserRoundIcon,
} from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Link } from "~/components/common/link"
import { NavSheet } from "~/components/web/nav/nav-sheet"
import { haptics } from "~/lib/haptics"
import { useSession } from "~/lib/auth-client"
import { cx } from "~/lib/utils"

/**
 * BottomNav — the B0 mobile bottom navigation (SESSION_0500).
 *
 * Mobile-only (`md:hidden`), always-on, session-aware. Mounted once in `(web)/layout`.
 * 5 tabs — Dashboard · Lineage · Directory · Posts · Profile — plus a "More" affordance that
 * opens the existing right-side hamburger drawer (`NavSheet`, DEMOTED from primary chrome to
 * overflow here — not duplicated). Creation is NOT a tab; it lives in the MAB (admin-only).
 *
 * Session-aware: signed-out visitors get the public subset (Lineage · Directory · Posts) so
 * the bar still orients them; the account-scoped Dashboard/Profile tabs collapse into "More"
 * (whose drawer already carries the sign-in / Join CTAs for guests).
 *
 * Route notes (SESSION_0500 pre-flight): the member home is `/app/profile` (there is no
 * `/dashboard` page — that route 404s; the legacy nav-sheet link to it is a pre-existing bug,
 * flagged separately). Dashboard tab → `/app/profile`; Profile tab → `/app/profile?tab=profile`,
 * so the two stay distinct and each highlights on its own surface.
 */

type TabItem = {
  key: string
  href: string
  icon: LucideIcon
  /** Highlight test. Defaults to `pathname.startsWith(href)`. */
  isActive: (ctx: { pathname: string; tab: string | null }) => boolean
  /** Show for signed-out visitors too. */
  public: boolean
}

const DASHBOARD_HREF = "/app/profile"
const PROFILE_HREF = "/app/profile?tab=profile"

const TABS: TabItem[] = [
  {
    key: "dashboard",
    href: DASHBOARD_HREF,
    icon: LayoutDashboardIcon,
    // Home = /app/profile with no (or a non-profile) tab param.
    isActive: ({ pathname, tab }) => pathname.startsWith("/app/profile") && tab !== "profile",
    public: false,
  },
  {
    key: "lineage",
    href: "/lineage",
    icon: GitBranchIcon,
    isActive: ({ pathname }) => pathname.startsWith("/lineage"),
    public: true,
  },
  {
    key: "directory",
    href: "/directory",
    icon: ContactRoundIcon,
    isActive: ({ pathname }) => pathname.startsWith("/directory"),
    public: true,
  },
  {
    key: "posts",
    href: "/posts",
    icon: MessagesSquareIcon,
    isActive: ({ pathname }) => pathname.startsWith("/posts"),
    public: true,
  },
  {
    key: "profile",
    href: PROFILE_HREF,
    icon: UserRoundIcon,
    isActive: ({ pathname, tab }) => pathname.startsWith("/app/profile") && tab === "profile",
    public: false,
  },
]

type BottomNavProps = {
  /** Server-resolved avatar, threaded through to the demoted `NavSheet`. */
  userAvatarUrl?: string | null
}

const TAB_BASE =
  "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline"

export const BottomNav = ({ userAvatarUrl }: BottomNavProps) => {
  const t = useTranslations()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")
  const { data: session } = useSession()
  const [isMoreOpen, setMoreOpen] = useState(false)

  const isSignedIn = Boolean(session?.user)
  const visibleTabs = TABS.filter(item => item.public || isSignedIn)

  return (
    <>
      <nav
        aria-label={t("navigation.browse")}
        className={cx(
          // Mobile-only fixed bar, above page content, below dialogs (z-50 header/MAB).
          "fixed inset-x-0 bottom-0 z-40 md:hidden",
          "chrome-surface border-t border-chrome-border",
          // Safe-area inset for notched devices.
          "pb-[env(safe-area-inset-bottom)]",
        )}
      >
        <div className="mx-auto flex max-w-2xl items-stretch px-1">
          {visibleTabs.map(item => {
            const Icon = item.icon
            const active = item.isActive({ pathname, tab })
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => haptics.tap()}
                className={cx(
                  TAB_BASE,
                  active
                    ? "text-primary"
                    : "text-chrome-foreground/70 hover:text-chrome-foreground",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                <span>{t(`navigation.${item.key}`)}</span>
              </Link>
            )
          })}

          {/* "More" — the demoted hamburger drawer (overflow), not a duplicate. */}
          <button
            type="button"
            onClick={() => {
              haptics.tap()
              setMoreOpen(true)
            }}
            aria-label={t("navigation.open_menu")}
            className={cx(TAB_BASE, "text-chrome-foreground/70 hover:text-chrome-foreground")}
          >
            <MenuIcon className="size-5" strokeWidth={2} />
            <span>{t("mobileShell.more")}</span>
          </button>
        </div>
      </nav>

      <NavSheet open={isMoreOpen} onOpenChange={setMoreOpen} userAvatarUrl={userAvatarUrl} />
    </>
  )
}
