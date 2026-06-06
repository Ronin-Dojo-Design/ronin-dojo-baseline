"use client"

import { useHotkeys } from "@mantine/hooks"
import {
  BarChart3Icon,
  BookOpenIcon,
  CalendarIcon,
  CreditCardIcon,
  FileSearchIcon,
  FileTextIcon,
  FolderIcon,
  GitBranchIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  MailIcon,
  MedalIcon,
  PackageIcon,
  SettingsIcon,
  ShieldIcon,
  SwordsIcon,
  TagIcon,
  TicketIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "~/components/common/command"
import { Kbd } from "~/components/common/kbd"

const adminRoutes = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboardIcon },
  { label: "Tools", href: "/admin/tools", icon: WrenchIcon },
  { label: "Posts", href: "/admin/posts", icon: FileTextIcon },
  { label: "Categories", href: "/admin/categories", icon: FolderIcon },
  { label: "Tags", href: "/admin/tags", icon: TagIcon },
  { label: "Leads", href: "/admin/leads", icon: MailIcon },
  { label: "Email Ops", href: "/admin/email", icon: MailIcon },
  { label: "Users", href: "/admin/users", icon: UsersIcon },
  { label: "Tournaments", href: "/admin/tournaments", icon: SwordsIcon },
  { label: "Programs", href: "/admin/programs", icon: GraduationCapIcon },
  { label: "Courses", href: "/admin/courses", icon: BookOpenIcon },
  { label: "Certificates", href: "/admin/certificates", icon: MedalIcon },
  { label: "Lineage", href: "/admin/lineage", icon: GitBranchIcon },
  { label: "Memberships", href: "/admin/memberships", icon: CreditCardIcon },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: TicketIcon },
  { label: "Subscription Tiers", href: "/admin/subscription-tiers", icon: BarChart3Icon },
  { label: "Pricing Plans", href: "/admin/pricing-plans", icon: CreditCardIcon },
  { label: "Entitlements", href: "/admin/entitlements", icon: ShieldIcon },
  { label: "Invites", href: "/admin/invites", icon: MailIcon },
  { label: "Reports", href: "/admin/reports", icon: FileTextIcon },
  { label: "Schedule", href: "/admin/schedule", icon: CalendarIcon },
  { label: "Media", href: "/admin/media", icon: PackageIcon },
  { label: "Repo Docs", href: "/admin/repo-docs", icon: FileSearchIcon },
  { label: "Roles", href: "/admin/roles", icon: ShieldIcon },
  { label: "Merch", href: "/admin/merch", icon: PackageIcon },
  { label: "Settings", href: "/admin/billing", icon: SettingsIcon },
] as const

type CommandPaletteProps = {
  userRole?: string
}

const LINEAGE_TREE_ADMIN_HREFS = new Set(["/admin/lineage"])

export const CommandPalette = ({ userRole }: CommandPaletteProps) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const routes =
    userRole === "lineage_tree_admin"
      ? adminRoutes.filter(route => LINEAGE_TREE_ADMIN_HREFS.has(route.href))
      : adminRoutes

  useHotkeys([["mod+k", () => setOpen(o => !o)]])

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Go to page…" />

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {routes.map(route => (
            <CommandItem
              key={route.href}
              value={route.label}
              onSelect={() => handleSelect(route.href)}
            >
              <route.icon className="size-4 shrink-0 opacity-50" />
              {route.label}
              {route.href === "/admin" && (
                <CommandShortcut>
                  <Kbd>⌘K</Kbd>
                </CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
