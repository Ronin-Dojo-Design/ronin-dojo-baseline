"use client"

import { getInitials } from "@dirstack/utils"
import { useMediaQuery } from "@mantine/hooks"
import {
  AwardIcon,
  CalendarIcon,
  BuildingIcon,
  BookOpenIcon,
  ClipboardListIcon,
  DockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GitBranchIcon,
  HomeIcon,
  IdCardIcon,
  ImageIcon,
  LayersIcon,
  LogOutIcon,
  MailIcon,
  MailPlusIcon,
  PaletteIcon,
  PlusCircleIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  SwordsIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Nav, type NavLink } from "~/components/app/nav"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Button } from "~/components/common/button"
import { Kbd } from "~/components/common/kbd"
import { Link } from "~/components/common/link"
import { LogoSymbol } from "~/components/web/ui/logo-symbol"
import { type BrandFeature, brandHasFeature, brandHasMinimalChrome } from "~/config/brand-features"
import { useBrand } from "~/contexts/brand-context"
import { useSearch } from "~/contexts/search-context"
import { signOut } from "~/lib/auth-client"
import { cx } from "~/lib/utils"
import type { SessionUser } from "~/server/orpc/context"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS, type Permission } from "~/server/orpc/roles"

// A nav entry plus an optional permission gate. Items without a `permission`
// are shown to every signed-in user; admin (`*`) sees everything. `lineage:
// true` marks the item as ALSO visible to active LineageTreeAccess grantees
// (Ronin delta, SOT-ADR D4 — mirrors `requireLineageAccess`).
type NavItem = NavLink & {
  permission?: Permission
  lineage?: boolean
  feature?: BrandFeature
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
  brand: Parameters<typeof brandHasFeature>[0],
) => {
  const links = items
    .filter(item => {
      if (!item) return true
      if (item.feature && !brandHasFeature(brand, item.feature)) return false
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

      const { permission, lineage, feature, ...link } = item
      void permission
      void lineage
      void feature
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
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()
  const search = useSearch()
  const { brand } = useBrand()

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

  // Single ordered nav config. `undefined` entries are group separators; items
  // carry an optional `permission` and are hidden when the user lacks it.
  // Phase 2b waves (BBL-SOT-Spec Phase 2): entries grow per wave as `/admin`
  // areas move under `/app` — wave 1 (SESSION_0365): lineage/users/claims;
  // wave 2 (SESSION_0366): tournaments/memberships/organizations.
  const items: Array<NavItem | undefined> = [
    {
      title: "Dashboard",
      href: "/app",
      prefix: <LogoSymbol />,
    },
    {
      title: "Profile",
      href: "/app/profile",
      prefix: <UserIcon />,
    },

    undefined,
    {
      title: "Lineage",
      href: "/app/lineage",
      prefix: <GitBranchIcon />,
      permission: APP_AREA_PERMISSIONS.lineage,
      lineage: true,
    },
    {
      title: "Events",
      href: "/app/events",
      prefix: <CalendarIcon />,
      feature: "events",
    },
    {
      title: "Techniques",
      href: "/app/techniques",
      prefix: <SwordsIcon />,
      feature: "techniques",
    },
    {
      title: "Users",
      href: "/app/users",
      prefix: <UsersIcon />,
      permission: APP_AREA_PERMISSIONS.users,
    },
    {
      title: "Claims",
      href: "/app/claims",
      prefix: <ShieldCheckIcon />,
      permission: APP_AREA_PERMISSIONS.claims,
    },
    {
      title: "Tournaments",
      href: "/app/tournaments",
      prefix: <TrophyIcon />,
      permission: APP_AREA_PERMISSIONS.tournaments,
    },
    {
      title: "Memberships",
      href: "/app/memberships",
      prefix: <IdCardIcon />,
      permission: APP_AREA_PERMISSIONS.memberships,
    },
    {
      title: "Organizations",
      href: "/app/organizations",
      prefix: <BuildingIcon />,
      permission: APP_AREA_PERMISSIONS.organizations,
    },
    {
      title: "Certificates",
      href: "/app/certificates",
      prefix: <AwardIcon />,
      permission: APP_AREA_PERMISSIONS.certificates,
    },
    {
      title: "Posts",
      href: "/app/posts",
      prefix: <FileTextIcon />,
      permission: APP_AREA_PERMISSIONS.posts,
    },
    {
      title: "Content",
      href: "/app/content",
      prefix: <LayersIcon />,
      permission: APP_AREA_PERMISSIONS.content,
    },
    {
      title: "Media",
      href: "/app/media",
      prefix: <ImageIcon />,
      permission: APP_AREA_PERMISSIONS.media,
    },
    {
      title: "Roles",
      href: "/app/roles",
      prefix: <ShieldCheckIcon />,
      permission: APP_AREA_PERMISSIONS.roles,
    },
    {
      title: "Entitlements",
      href: "/app/entitlements",
      prefix: <IdCardIcon />,
      permission: APP_AREA_PERMISSIONS.entitlements,
    },
    {
      title: "Invites",
      href: "/app/invites",
      prefix: <MailPlusIcon />,
      permission: APP_AREA_PERMISSIONS.invites,
    },
    {
      title: "Leads",
      href: "/app/leads",
      prefix: <ClipboardListIcon />,
      permission: APP_AREA_PERMISSIONS.leads,
    },
    {
      title: "Email",
      href: "/app/email",
      prefix: <MailIcon />,
      permission: APP_AREA_PERMISSIONS.email,
    },
    {
      title: "Brand Settings",
      href: "/app/brand-settings",
      prefix: <PaletteIcon />,
      permission: APP_AREA_PERMISSIONS.brandSettings,
    },
    {
      title: "Privacy",
      href: "/app/privacy/requests",
      prefix: <ShieldCheckIcon />,
      permission: APP_AREA_PERMISSIONS.privacy,
    },
    {
      title: "Reports",
      href: "/app/reports",
      prefix: <BarChart3Icon />,
      permission: APP_AREA_PERMISSIONS.reports,
    },
    {
      title: "Programs",
      href: "/app/programs",
      prefix: <ClipboardListIcon />,
      permission: APP_AREA_PERMISSIONS.programs,
    },
    {
      title: "Courses",
      href: "/app/courses",
      prefix: <BookOpenIcon />,
      permission: APP_AREA_PERMISSIONS.courses,
    },
    {
      title: "Age Groups",
      href: "/app/age-groups",
      prefix: <UsersIcon />,
      permission: APP_AREA_PERMISSIONS.ageGroups,
    },
    {
      title: "Skill Levels",
      href: "/app/skill-levels",
      prefix: <LayersIcon />,
      permission: APP_AREA_PERMISSIONS.skillLevels,
    },
    {
      title: "Schedule",
      href: "/app/schedule",
      prefix: <CalendarIcon />,
      permission: APP_AREA_PERMISSIONS.schedule,
    },
    {
      title: "Billing",
      href: "/app/billing",
      prefix: <IdCardIcon />,
      permission: APP_AREA_PERMISSIONS.billing,
    },
    {
      title: "Categories",
      href: "/app/categories",
      prefix: <LayersIcon />,
      permission: APP_AREA_PERMISSIONS.categories,
    },
    {
      title: "Tags",
      href: "/app/tags",
      prefix: <LayersIcon />,
      permission: APP_AREA_PERMISSIONS.tags,
    },
    {
      title: "Pricing Plans",
      href: "/app/pricing-plans",
      prefix: <IdCardIcon />,
      permission: APP_AREA_PERMISSIONS.pricingPlans,
    },
    {
      title: "Subscription Tiers",
      href: "/app/subscription-tiers",
      prefix: <IdCardIcon />,
      permission: APP_AREA_PERMISSIONS.subscriptionTiers,
    },
    {
      title: "Subscriptions",
      href: "/app/subscriptions",
      prefix: <IdCardIcon />,
      permission: APP_AREA_PERMISSIONS.subscriptions,
    },
    {
      title: "Merch",
      href: "/app/merch",
      prefix: <ClipboardListIcon />,
      permission: APP_AREA_PERMISSIONS.merch,
    },
    {
      title: "Tools",
      href: "/app/tools",
      prefix: <ClipboardListIcon />,
      permission: APP_AREA_PERMISSIONS.tools,
    },
    {
      title: "Storage",
      href: "/app/storage",
      prefix: <DockIcon />,
      permission: APP_AREA_PERMISSIONS.storage,
    },
    {
      title: "Repo Docs",
      href: "/app/repo-docs",
      prefix: <BookOpenIcon />,
      permission: APP_AREA_PERMISSIONS.repoDocs,
    },

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

  // Minimal-chrome brands (BBL): regular members get the simplified BBL member
  // rail; privileged users (anyone with a gated area permission, or an active
  // lineage grant) keep the full management nav so nothing is lost. Every other
  // brand always renders the full nav.
  const minimal = brandHasMinimalChrome(brand)
  const isPrivileged = items.some(
    item =>
      item?.permission != null &&
      (can(user, item.permission) || (item.lineage === true && hasLineageGrant)),
  )

  if (minimal && user && !isPrivileged) {
    return (
      <BblMemberRail
        user={user}
        hasLineageGrant={hasLineageGrant}
        brand={brand}
        isMobile={!!isMobile}
        onVisitSite={handleOpenSite}
        onSignOut={handleSignOut}
      />
    )
  }

  return (
    <Nav
      isCollapsed={!!isMobile}
      className={cx("sticky top-0 h-dvh z-40 border-r", isMobile ? "w-12" : "w-48")}
      links={buildVisibleLinks(items, user, hasLineageGrant, brand)}
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
  brand: Parameters<typeof brandHasFeature>[0]
  isMobile: boolean
  onVisitSite: () => void
  onSignOut: () => void
}

/**
 * Simplified BBL member rail (parity with the legacy `DesktopNav`): brand mark +
 * wordmark block, a short icon+label nav with a primary active highlight, a
 * primary Create CTA, and a bottom user mini-card. Desktop-labeled; on mobile it
 * falls back to the collapsed icon Nav because the `/app` area has no separate
 * mobile header/drawer. Surfaced via the shared `.chrome-surface` remap so the
 * `--color-primary` accent stays brand-driven (red on BBL) and other brands —
 * which never reach this branch — are unaffected.
 */
const BblMemberRail = ({
  user,
  hasLineageGrant,
  brand,
  isMobile,
  onVisitSite,
  onSignOut,
}: BblMemberRailProps) => {
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
      href: "/app/posts",
      prefix: <FileTextIcon />,
      permission: APP_AREA_PERMISSIONS.posts,
    },
  ]
  const links = buildVisibleLinks(memberItems, user, hasLineageGrant, brand)
  const canPost = can(user, APP_AREA_PERMISSIONS.posts)

  if (isMobile) {
    const mobileLinks: Array<NavLink | undefined> = [
      ...links,
      ...(canPost
        ? [{ title: "Create", href: "/app/posts/new", prefix: <PlusCircleIcon /> } as NavLink]
        : []),
      undefined,
      { title: "Visit Site", href: "#", onClick: onVisitSite, prefix: <ExternalLinkIcon /> },
      { title: "Logout", href: "#", onClick: onSignOut, prefix: <LogOutIcon /> },
    ]
    return (
      <Nav
        isCollapsed
        className="chrome-surface sticky top-0 z-40 h-dvh w-12 border-r"
        links={mobileLinks}
      />
    )
  }

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href)

  return (
    <nav className="chrome-surface sticky top-0 z-40 flex h-dvh w-64 flex-col border-r">
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
            render={<Link href="/app/posts/new" />}
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
