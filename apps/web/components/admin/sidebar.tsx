"use client"

import { useMediaQuery } from "@mantine/hooks"
import { cx } from "cva"
import {
  ActivityIcon,
  BookOpenIcon,
  BoxIcon,
  CalendarIcon,
  ContactIcon,
  CreditCardIcon,
  DockIcon,
  ExternalLinkIcon,
  GalleryHorizontalEndIcon,
  GemIcon,
  HardDriveIcon,
  ImageIcon,
  LayersIcon,
  LogOutIcon,
  MailIcon,
  IdCardIcon,
  ScrollTextIcon,
  SwordsIcon,
  TagIcon,
  TriangleAlertIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { MouseEvent, ReactNode } from "react"
import { toast } from "sonner"
import { Nav } from "~/components/admin/nav"
import { Button } from "~/components/common/button"
import { Kbd } from "~/components/common/kbd"
import { Tooltip } from "~/components/common/tooltip"
import { LogoSymbol } from "~/components/web/ui/logo-symbol"
import { siteConfig } from "~/config/site"
import { useSearch } from "~/contexts/search-context"
import { signOut } from "~/lib/auth-client"

type SidebarProps = {
  userRole?: string
}

const TOURNAMENT_DIRECTOR_HREFS = new Set(["/admin", "/admin/tournaments"])

export const Sidebar = ({ userRole }: SidebarProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()
  const search = useSearch()
  const isTournamentDirector = userRole === "tournament_director"

  const handleOpenSite = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    window.open(siteConfig.url, "_self")
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

  const allLinks: (NavLinkInput | undefined)[] = [
    {
      title: "Dashboard",
      href: "/admin",
      prefix: <LogoSymbol />,
      suffix: (
        <Tooltip tooltip="Visit site">
          <Button
            variant="ghost"
            onClick={handleOpenSite}
            className="-my-0.5 -mx-[0.21425em] px-1 py-[0.2em] text-xs/tight rounded-sm hover:bg-background"
          >
            <ExternalLinkIcon className="size-3" />
          </Button>
        </Tooltip>
      ),
    },

    undefined, // Separator

    {
      title: "Tools",
      href: "/admin/tools",
      prefix: <GemIcon />,
    },
    {
      title: "Courses",
      href: "/admin/courses",
      prefix: <BookOpenIcon />,
    },
    {
      title: "Programs",
      href: "/admin/programs",
      prefix: <BoxIcon />,
    },
    {
      title: "Techniques",
      href: "/admin/techniques",
      prefix: <SwordsIcon />,
    },
    {
      title: "Certificates",
      href: "/admin/certificates",
      prefix: <ScrollTextIcon />,
    },
    {
      title: "Media",
      href: "/admin/media",
      prefix: <ImageIcon />,
    },
    {
      title: "Leads",
      href: "/admin/leads",
      prefix: <ContactIcon />,
    },
    {
      title: "Categories",
      href: "/admin/categories",
      prefix: <GalleryHorizontalEndIcon />,
    },
    {
      title: "Tags",
      href: "/admin/tags",
      prefix: <TagIcon />,
    },
    {
      title: "Users",
      href: "/admin/users",
      prefix: <UsersIcon />,
    },
    {
      title: "Invites",
      href: "/admin/invites",
      prefix: <MailIcon />,
    },
    {
      title: "Memberships",
      href: "/admin/memberships",
      prefix: <IdCardIcon />,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      prefix: <TriangleAlertIcon />,
    },

    undefined, // Separator

    {
      title: "Tiers",
      href: "/admin/subscription-tiers",
      prefix: <LayersIcon />,
    },
    {
      title: "Subscriptions",
      href: "/admin/subscriptions",
      prefix: <CreditCardIcon />,
    },
    {
      title: "Billing Monitor",
      href: "/admin/billing/monitoring",
      prefix: <ActivityIcon />,
    },
    {
      title: "Storage Monitor",
      href: "/admin/storage/monitoring",
      prefix: <HardDriveIcon />,
    },

    undefined, // Separator

    {
      title: "Schedule",
      href: "/admin/schedule",
      prefix: <CalendarIcon />,
    },
    {
      title: "Tournaments",
      href: "/admin/tournaments",
      prefix: <TrophyIcon />,
    },

    undefined, // Separator

    {
      title: "Quick Menu",
      href: "#",
      onClick: search.open,
      prefix: <DockIcon />,
      suffix: <Kbd meta>K</Kbd>,
    },
    {
      title: "Logout",
      href: "#",
      onClick: handleSignOut,
      prefix: <LogOutIcon />,
    },
  ]

  const links = isTournamentDirector
    ? collapseSeparators(
        allLinks.map(link => {
          if (link === undefined) return undefined
          const allowed =
            TOURNAMENT_DIRECTOR_HREFS.has(link.href) ||
            link.title === "Quick Menu" ||
            link.title === "Logout"
          return allowed ? link : null
        }),
      )
    : allLinks

  return (
    <Nav
      isCollapsed={!!isMobile}
      className={cx("sticky top-0 h-dvh z-40 border-r", isMobile ? "w-12" : "w-48")}
      links={links}
    />
  )
}

type NavLinkInput = {
  title: string
  href: string
  prefix?: ReactNode
  suffix?: ReactNode
  onClick?: (e: MouseEvent<HTMLElement>) => void
}

// Drop nulls (filtered links) and collapse adjacent/trailing separators (undefined).
function collapseSeparators(
  items: (NavLinkInput | undefined | null)[],
): (NavLinkInput | undefined)[] {
  const kept = items.filter((item): item is NavLinkInput | undefined => item !== null)
  const out: (NavLinkInput | undefined)[] = []
  let lastWasSeparator = false
  for (const item of kept) {
    if (item === undefined) {
      if (!lastWasSeparator && out.length > 0) {
        out.push(undefined)
        lastWasSeparator = true
      }
    } else {
      out.push(item)
      lastWasSeparator = false
    }
  }
  if (out.length > 0 && out[out.length - 1] === undefined) {
    out.pop()
  }
  return out
}
