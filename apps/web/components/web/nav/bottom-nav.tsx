"use client"

import {
  ContactRoundIcon,
  GitBranchIcon,
  type LucideIcon,
  MenuIcon,
  MessagesSquareIcon,
  UserRoundIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"
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
 * Mobile-only (`md:hidden`), LOGGED-IN member chrome. Mounted once per layout tree by
 * `MobileShell` — in both the `(web)` layout and the `/app` console layout — so a signed-in
 * member keeps the bar everywhere (v2 fix). 4 tabs — Lineage · Directory · Posts · Profile —
 * plus a "More" affordance that opens the existing right-side hamburger drawer (`NavSheet`,
 * DEMOTED from primary chrome to overflow here — not duplicated). Creation is NOT a tab; it
 * lives in the MAB (admin-only).
 *
 * Logged-out visitors get NO bottom nav — it's member chrome; they keep the normal public
 * header (whose menu carries the sign-in / Join CTAs). The bar renders once `useSession`
 * confirms a signed-in user.
 *
 * Tab collapse (v2, SESSION_0500 operator): the former separate Dashboard + Profile tabs both
 * pointed at `/app/profile` (one surface — overview + belts + billing + profile sub-tabs), so
 * they collapsed into a single Profile tab (the member home/account). This removed the tab
 * route-collision AND the `?tab` soft-nav no-op that the two-tab split relied on.
 *
 * Route note (SESSION_0500): `/dashboard` is a 308 redirect → `/app/profile`
 * (`config/app-redirects.ts`), not a 404; the member home is `/app/profile`.
 */

type TabItem = {
  key: string
  href: string
  icon: LucideIcon
  /** Highlight test. Defaults to `pathname.startsWith(href)`. */
  isActive: (ctx: { pathname: string }) => boolean
}

const TABS: TabItem[] = [
  {
    key: "lineage",
    href: "/lineage",
    icon: GitBranchIcon,
    isActive: ({ pathname }) => pathname.startsWith("/lineage"),
  },
  {
    key: "directory",
    href: "/directory",
    icon: ContactRoundIcon,
    isActive: ({ pathname }) => pathname.startsWith("/directory"),
  },
  {
    key: "posts",
    href: "/posts",
    icon: MessagesSquareIcon,
    isActive: ({ pathname }) => pathname.startsWith("/posts"),
  },
  {
    key: "profile",
    href: "/app/profile",
    icon: UserRoundIcon,
    isActive: ({ pathname }) => pathname.startsWith("/app/profile"),
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
  const { data: session } = useSession()
  const [isMoreOpen, setMoreOpen] = useState(false)

  // Member chrome: the bottom nav is logged-in-only. Logged-out visitors get the normal
  // public header, no bar (v2, SESSION_0500 operator).
  if (!session?.user) return null

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
          {TABS.map(item => {
            const Icon = item.icon
            const active = item.isActive({ pathname })
            // The "posts" tab reads "Posts" (locked decision) via a bottom-nav-scoped key,
            // while the drawer's own `navigation.posts` entry keeps its "Community" label.
            const label =
              item.key === "posts" ? t("mobileShell.posts") : t(`navigation.${item.key}`)
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
                <span>{label}</span>
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
