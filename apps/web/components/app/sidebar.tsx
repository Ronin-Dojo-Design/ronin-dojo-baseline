"use client"

import { useMediaQuery } from "@mantine/hooks"
import {
  BuildingIcon,
  DockIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  IdCardIcon,
  LogOutIcon,
  ShieldCheckIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Nav, type NavLink } from "~/components/app/nav"
import { Kbd } from "~/components/common/kbd"
import { LogoSymbol } from "~/components/web/ui/logo-symbol"
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
      if (!item || !item.permission) return true
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
  const isMobile = useMediaQuery("(max-width: 768px)")
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

    undefined,
    {
      title: "Lineage",
      href: "/app/lineage",
      prefix: <GitBranchIcon />,
      permission: APP_AREA_PERMISSIONS.lineage,
      lineage: true,
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

  return (
    <Nav
      isCollapsed={!!isMobile}
      className={cx("sticky top-0 h-dvh z-40 border-r", isMobile ? "w-12" : "w-48")}
      links={buildVisibleLinks(items, user, hasLineageGrant)}
    />
  )
}
