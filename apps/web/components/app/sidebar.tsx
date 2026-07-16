"use client"

import { getInitials } from "@dirstack/utils"
import {
  CircleUserRoundIcon,
  CompassIcon,
  DockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GitBranchIcon,
  HomeIcon,
  LogOutIcon,
  PlusCircleIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Nav, type NavEntry, type NavLink } from "~/components/app/nav"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Button } from "~/components/common/button"
import { Kbd } from "~/components/common/kbd"
import { Link } from "~/components/common/link"
import { LogoSymbol } from "~/components/web/ui/logo-symbol"
import { ADMIN_SECTION_GROUPS, filterAdminSectionGroups } from "~/config/admin-sections"
import { useBrand } from "~/contexts/brand-context"
import { useSearch } from "~/contexts/search-context"
import { signOut } from "~/lib/auth-client"
import { cx } from "~/lib/utils"
import type { SessionUser } from "~/server/orpc/context"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS, type Permission } from "~/server/orpc/roles"

// A nav entry plus an optional permission gate (BblMemberRail subset). Items
// without a `permission` are shown to every signed-in user; admin (`*`) sees
// everything. `lineage: true` marks the item as ALSO visible to active
// LineageTreeAccess grantees (Ronin delta, SOT-ADR D4 — mirrors
// `requireLineageAccess`). The full management nav's 37 areas live in
// `config/admin-sections.ts` (SESSION_0501) — ONE grouped model shared with
// `/app/sections` and the beta Command Deck.
type NavItem = NavLink & {
  permission?: Permission
  lineage?: boolean
}

/**
 * Filter out items the user lacks permission for, strip the gate fields (so
 * they never reach the DOM), and collapse the separators that would otherwise
 * be left dangling — leading, trailing, or consecutive.
 */
const buildVisibleLinks = (
  items: Array<NavItem | undefined>,
  user: SessionUser | null,
  hasLineageGrant: boolean,
) => {
  const links = items
    .filter(item => {
      if (!item) return true
      if (!item.permission) return true
      if (can(user, item.permission)) return true
      return item.lineage === true && hasLineageGrant
    })
    .reduce<Array<NavLink | undefined>>((result, item) => {
      if (!item) {
        // Separator: keep only when it follows a real item (skips leading + double).
        if (result.length && result.at(-1) !== undefined) {
          result.push(undefined)
        }
        return result
      }

      const { permission, lineage, ...link } = item
      void permission
      void lineage
      result.push(link)
      return result
    }, [])

  // Drop a trailing separator left after the last group was filtered away.
  if (links.at(-1) === undefined) {
    links.pop()
  }

  return links
}

type SidebarProps = {
  user: SessionUser | null
  hasLineageGrant: boolean
}

export const Sidebar = ({ user, hasLineageGrant }: SidebarProps) => {
  const router = useRouter()
  const search = useSearch()

  const handleOpenSite = () => {
    window.open("/", "_self")
  }

  const handleSignOut = async () => {
    signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("You've been signed out successfully")
          router.push("/")
        },
      },
    })
  }

  // Ungrouped chrome concerns stay at the top; the 37 managed areas render as
  // grouped runs from the shared config (SESSION_0501 admin nav regroup).
  const topLinks: Array<NavEntry> = [
    {
      title: "Dashboard",
      href: "/app",
      prefix: <LogoSymbol />,
    },
    {
      title: "Profile",
      href: "/app/profile",
      prefix: <CircleUserRoundIcon />,
    },
    {
      title: "Onboarding",
      href: "/app?tour=1",
      prefix: <SparklesIcon />,
    },
    {
      title: "All sections",
      href: "/app/sections",
      prefix: <CompassIcon />,
    },
  ]

  // Grouped middle: same gate semantics as before (permission / lineage grant),
  // now filtered through the shared config. Empty groups drop their label.
  const groupedEntries: Array<NavEntry> = filterAdminSectionGroups(user, hasLineageGrant).flatMap(
    group => [
      { heading: group.label },
      ...group.items.map(({ title, href, icon: Icon }) => ({
        title,
        href,
        prefix: <Icon />,
      })),
    ],
  )

  const utilityLinks: Array<NavEntry> = [
    undefined,
    {
      title: "Quick Menu",
      href: "#",
      onClick: search.open,
      prefix: <DockIcon />,
      suffix: <Kbd meta>K</Kbd>,
    },
    {
      title: "Visit Site",
      href: "#",
      onClick: handleOpenSite,
      prefix: <ExternalLinkIcon />,
    },
    {
      title: "Logout",
      href: "#",
      onClick: handleSignOut,
      prefix: <LogOutIcon />,
    },
  ]

  // BBL (single brand): regular members get the simplified BBL member rail;
  // privileged users (anyone with a gated area permission, or an active lineage
  // grant) keep the full management nav so nothing is lost.
  const isPrivileged = ADMIN_SECTION_GROUPS.some(group =>
    group.items.some(
      item =>
        item.permission != null &&
        (can(user, item.permission) || (item.lineage === true && hasLineageGrant)),
    ),
  )

  if (user && !isPrivileged) {
    return (
      <BblMemberRail
        user={user}
        hasLineageGrant={hasLineageGrant}
        onVisitSite={handleOpenSite}
        onSignOut={handleSignOut}
      />
    )
  }

  return (
    <Nav
      // WL-P3-29 (SESSION_0501): the old `useMediaQuery` collapsed mode was dead
      // code — `max-md:hidden` already hides this rail below the md breakpoint
      // (the B0 bottom nav is the ONE mobile nav system), so the collapsed icon
      // variant could never paint. Desktop keeps the full sidebar.
      isCollapsed={false}
      className="sticky top-0 h-dvh z-40 border-r max-md:hidden w-48 overflow-y-auto"
      links={[...topLinks, ...groupedEntries, ...utilityLinks]}
    />
  )
}

// Shared row style for the rail's utility actions (Visit Site / Logout). Reads
// the remapped chrome tokens (via `.chrome-surface` on the <nav>), so it is
// legible on the BBL dark surface without hardcoded colors.
const RAIL_UTILITY_ITEM =
  "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline [&_svg]:size-5"

type BblMemberRailProps = {
  user: SessionUser
  hasLineageGrant: boolean
  onVisitSite: () => void
  onSignOut: () => void
}

/**
 * Simplified BBL member rail (parity with the legacy `DesktopNav`): brand mark +
 * wordmark block, a short icon+label nav with a primary active highlight, a
 * primary Create CTA, and a bottom user mini-card. Desktop-only — `max-md:hidden`
 * hides it on mobile where the B0 bottom nav is the ONE nav system (the old
 * `isMobile` collapsed-rail branch was dead code, pruned per WL-P3-29). Surfaced
 * via the shared `.chrome-surface` remap so the `--color-primary` accent stays
 * brand-driven (red on BBL) and other brands — which never reach this branch —
 * are unaffected.
 */
const BblMemberRail = ({ user, hasLineageGrant, onVisitSite, onSignOut }: BblMemberRailProps) => {
  const pathname = usePathname()
  const { name } = useBrand()

  // Member-facing subset, gated by the SAME permissions as the full nav so the
  // rail never renders a link the member would be 403'd from.
  const memberItems: Array<NavItem | undefined> = [
    { title: "Dashboard", href: "/app", prefix: <HomeIcon /> },
    { title: "Profile", href: "/app/profile", prefix: <UserIcon /> },
    {
      title: "Lineage",
      href: "/app/lineage",
      prefix: <GitBranchIcon />,
      permission: APP_AREA_PERMISSIONS.lineage,
      lineage: true,
    },
    {
      title: "Feed",
      href: "/app/blog",
      prefix: <FileTextIcon />,
      permission: APP_AREA_PERMISSIONS.posts,
    },
  ]
  const links = buildVisibleLinks(memberItems, user, hasLineageGrant)
  const canPost = can(user, APP_AREA_PERMISSIONS.posts)

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href)

  return (
    <nav className="chrome-surface sticky top-0 z-40 flex h-dvh w-64 flex-col border-r max-md:hidden">
      <div className="border-b p-6">
        <Link
          href="/app"
          aria-label={name}
          className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <LogoSymbol className="size-5" />
          </span>
          <span className="truncate font-semibold">{name}</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {links.map(link =>
            link ? (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cx(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline [&_svg]:size-5",
                  isActive(link.href)
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {link.prefix}
                <span>{link.title}</span>
              </Link>
            ) : null,
          )}
        </div>

        {canPost && (
          <Button
            variant="fancy"
            size="lg"
            className="mt-4 w-full"
            prefix={<PlusCircleIcon />}
            render={<Link href="/app/blog/new" />}
          >
            Create
          </Button>
        )}
      </div>

      <div className="border-t p-3">
        <div className="mb-1 space-y-1">
          <button type="button" onClick={onVisitSite} className={RAIL_UTILITY_ITEM}>
            <ExternalLinkIcon />
            <span>Visit Site</span>
          </button>
          <button type="button" onClick={onSignOut} className={RAIL_UTILITY_ITEM}>
            <LogOutIcon />
            <span>Logout</span>
          </button>
        </div>

        <Link
          href="/app/profile"
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline"
        >
          <Avatar className="size-9">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">View profile</div>
          </div>
        </Link>
      </div>
    </nav>
  )
}
