import {
  AwardIcon,
  BarChart3Icon,
  BookOpenIcon,
  BuildingIcon,
  CalendarClockIcon,
  CalendarIcon,
  CreditCardIcon,
  DatabaseIcon,
  FileTextIcon,
  FolderTreeIcon,
  GitBranchIcon,
  GraduationCapIcon,
  IdCardIcon,
  ImageIcon,
  KeyIcon,
  Layers2Icon,
  LayoutGridIcon,
  LibraryIcon,
  LockIcon,
  type LucideIcon,
  MailIcon,
  MailPlusIcon,
  PaletteIcon,
  ReceiptIcon,
  RepeatIcon,
  SettingsIcon,
  ShieldIcon,
  ShoppingBagIcon,
  SignalHighIcon,
  SquareKanbanIcon,
  SwordsIcon,
  TagIcon,
  TrendingUpIcon,
  TrophyIcon,
  UserCheckIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  UsersRoundIcon,
  WrenchIcon,
} from "lucide-react"
import type { SessionUser } from "~/server/orpc/context"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS, type Permission } from "~/server/orpc/roles"

/**
 * The ONE grouped model of the `/app` admin nav (SESSION_0501, FI-021).
 *
 * Single source of truth consumed by:
 * - the desktop sidebar (`components/app/sidebar.tsx`) — grouped link runs,
 * - the `/app/sections` grouped index (the FI-021 mobile entry),
 * - the beta Command Deck (`/app/beta/command-deck`).
 *
 * Gate semantics are EXACTLY the sidebar's historical rules: items without a
 * `permission` are visible to every signed-in user; `lineage: true` marks an
 * item ALSO visible to active `LineageTreeAccess` grantees (Ronin delta,
 * SOT-ADR D4 — mirrors `requireLineageAccess`). Do not add or remove gates
 * here without touching the matching route guard.
 *
 * Icons: every item carries a DISTINCT lucide icon (asserted by
 * `admin-sections.test.ts`); a group's icon intentionally matches its anchor
 * item (Lineage, Posts, Events, Billing) since they never render side by side.
 */
export type AdminSectionItem = {
  title: string
  href: string
  icon: LucideIcon
  permission?: Permission
  lineage?: boolean
}

export type AdminSectionGroup = {
  key: string
  label: string
  icon: LucideIcon
  items: AdminSectionItem[]
}

export const ADMIN_SECTION_GROUPS: AdminSectionGroup[] = [
  {
    key: "people",
    label: "People & access",
    icon: UsersIcon,
    items: [
      {
        title: "People",
        href: "/app/users",
        icon: UserIcon,
        permission: APP_AREA_PERMISSIONS.users,
      },
      {
        title: "Roles",
        href: "/app/roles",
        icon: ShieldIcon,
        permission: APP_AREA_PERMISSIONS.roles,
      },
      {
        title: "Claims",
        href: "/app/claims",
        icon: UserCheckIcon,
        permission: APP_AREA_PERMISSIONS.claims,
      },
      {
        title: "Invites",
        href: "/app/invites",
        icon: MailPlusIcon,
        permission: APP_AREA_PERMISSIONS.invites,
      },
      {
        title: "Memberships",
        href: "/app/memberships",
        icon: IdCardIcon,
        permission: APP_AREA_PERMISSIONS.memberships,
      },
      {
        title: "Organizations",
        href: "/app/organizations",
        icon: BuildingIcon,
        permission: APP_AREA_PERMISSIONS.organizations,
      },
    ],
  },
  {
    key: "lineage",
    label: "Lineage & belts",
    icon: GitBranchIcon,
    items: [
      {
        title: "Lineage",
        href: "/app/lineage",
        icon: GitBranchIcon,
        permission: APP_AREA_PERMISSIONS.lineage,
        lineage: true,
      },
      {
        title: "Certificates",
        href: "/app/certificates",
        icon: AwardIcon,
        permission: APP_AREA_PERMISSIONS.certificates,
      },
      { title: "Techniques", href: "/app/techniques", icon: SwordsIcon },
      {
        title: "Skill Levels",
        href: "/app/skill-levels",
        icon: SignalHighIcon,
        permission: APP_AREA_PERMISSIONS.skillLevels,
      },
      {
        title: "Age Groups",
        href: "/app/age-groups",
        icon: UsersRoundIcon,
        permission: APP_AREA_PERMISSIONS.ageGroups,
      },
    ],
  },
  {
    key: "content",
    label: "Content & media",
    icon: FileTextIcon,
    items: [
      {
        title: "Posts",
        href: "/app/blog",
        icon: FileTextIcon,
        permission: APP_AREA_PERMISSIONS.posts,
      },
      {
        title: "Content",
        href: "/app/content",
        icon: LayoutGridIcon,
        permission: APP_AREA_PERMISSIONS.content,
      },
      {
        title: "Media",
        href: "/app/media",
        icon: ImageIcon,
        permission: APP_AREA_PERMISSIONS.media,
      },
      {
        title: "Categories",
        href: "/app/categories",
        icon: FolderTreeIcon,
        permission: APP_AREA_PERMISSIONS.categories,
      },
      { title: "Tags", href: "/app/tags", icon: TagIcon, permission: APP_AREA_PERMISSIONS.tags },
      {
        title: "Courses",
        href: "/app/courses",
        icon: BookOpenIcon,
        permission: APP_AREA_PERMISSIONS.courses,
      },
      {
        title: "Programs",
        href: "/app/programs",
        icon: GraduationCapIcon,
        permission: APP_AREA_PERMISSIONS.programs,
      },
    ],
  },
  {
    key: "community",
    label: "Community & events",
    icon: CalendarIcon,
    items: [
      { title: "Events", href: "/app/events", icon: CalendarIcon },
      {
        title: "Schedule",
        href: "/app/schedule",
        icon: CalendarClockIcon,
        permission: APP_AREA_PERMISSIONS.schedule,
      },
      {
        title: "Tournaments",
        href: "/app/tournaments",
        icon: TrophyIcon,
        permission: APP_AREA_PERMISSIONS.tournaments,
      },
    ],
  },
  {
    key: "growth",
    label: "Growth",
    icon: TrendingUpIcon,
    items: [
      {
        title: "Leads",
        href: "/app/leads",
        icon: UserPlusIcon,
        permission: APP_AREA_PERMISSIONS.leads,
      },
      {
        title: "Email",
        href: "/app/email",
        icon: MailIcon,
        permission: APP_AREA_PERMISSIONS.email,
      },
      {
        title: "Reports",
        href: "/app/reports",
        icon: BarChart3Icon,
        permission: APP_AREA_PERMISSIONS.reports,
      },
      {
        title: "Loop Board",
        href: "/app/loop-board",
        icon: SquareKanbanIcon,
        permission: APP_AREA_PERMISSIONS.loopBoard,
      },
    ],
  },
  {
    key: "commerce",
    label: "Commerce",
    icon: CreditCardIcon,
    items: [
      {
        title: "Billing",
        href: "/app/billing",
        icon: CreditCardIcon,
        permission: APP_AREA_PERMISSIONS.billing,
      },
      {
        title: "Subscriptions",
        href: "/app/subscriptions",
        icon: RepeatIcon,
        permission: APP_AREA_PERMISSIONS.subscriptions,
      },
      {
        title: "Subscription Tiers",
        href: "/app/subscription-tiers",
        icon: Layers2Icon,
        permission: APP_AREA_PERMISSIONS.subscriptionTiers,
      },
      {
        title: "Pricing Plans",
        href: "/app/pricing-plans",
        icon: ReceiptIcon,
        permission: APP_AREA_PERMISSIONS.pricingPlans,
      },
      {
        title: "Entitlements",
        href: "/app/entitlements",
        icon: KeyIcon,
        permission: APP_AREA_PERMISSIONS.entitlements,
      },
      {
        title: "Merch",
        href: "/app/merch",
        icon: ShoppingBagIcon,
        permission: APP_AREA_PERMISSIONS.merch,
      },
    ],
  },
  {
    key: "system",
    label: "System",
    icon: SettingsIcon,
    items: [
      {
        title: "Appearance",
        href: "/app/brand-settings",
        icon: PaletteIcon,
        permission: APP_AREA_PERMISSIONS.brandSettings,
      },
      {
        title: "Privacy",
        href: "/app/privacy/requests",
        icon: LockIcon,
        permission: APP_AREA_PERMISSIONS.privacy,
      },
      {
        title: "Storage",
        href: "/app/storage",
        icon: DatabaseIcon,
        permission: APP_AREA_PERMISSIONS.storage,
      },
      {
        title: "Tools",
        href: "/app/tools",
        icon: WrenchIcon,
        permission: APP_AREA_PERMISSIONS.tools,
      },
      {
        title: "Repo Docs",
        href: "/app/repo-docs",
        icon: LibraryIcon,
        permission: APP_AREA_PERMISSIONS.repoDocs,
      },
    ],
  },
]

/**
 * Sidebar-equivalent visibility for one item: ungated → every signed-in user;
 * gated → `can()`; lineage-flagged → ALSO active grantees.
 */
export const isAdminSectionItemVisible = (
  item: AdminSectionItem,
  user: SessionUser | null,
  hasLineageGrant: boolean,
): boolean => {
  if (!item.permission) return true
  if (can(user, item.permission)) return true
  return item.lineage === true && hasLineageGrant
}

/**
 * Filter the grouped model down to what `user` may see, dropping groups whose
 * items are all filtered away (no dangling group labels — mirrors the old
 * sidebar `buildVisibleLinks` separator collapsing).
 */
export const filterAdminSectionGroups = (
  user: SessionUser | null,
  hasLineageGrant: boolean,
): AdminSectionGroup[] =>
  ADMIN_SECTION_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => isAdminSectionItemVisible(item, user, hasLineageGrant)),
  })).filter(group => group.items.length > 0)
