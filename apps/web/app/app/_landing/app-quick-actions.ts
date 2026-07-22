import {
  ContactRoundIcon,
  type LucideIcon,
  SquareKanbanIcon,
  UserPlusIcon,
  UserRoundPlusIcon,
} from "lucide-react"
import type { SessionUser } from "~/server/orpc/context"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS, type Permission } from "~/server/orpc/roles"

/**
 * `/app` landing quick-action surface (SESSION_0600, G-026 WS-1).
 *
 * The app-local config that feeds BOTH the quick-action grid (Command Deck bento)
 * and the short `QuickActionCarousel`. Mirrors two ratified shapes:
 *
 * - `NavEntry`'s discriminated union: a quick action is either a `link` (wraps
 *   `<Link>`) or a `trigger` (fires `onSelect`, opening an app-local drawer — the
 *   kernel never imports a Drawer).
 * - The `command-deck` server/client split: the config is imported on BOTH sides;
 *   the server passes only the serializable gate result (allowed ids), the client
 *   re-derives icons/labels from `APP_QUICK_ACTIONS` (component refs never cross
 *   the RSC boundary).
 *
 * RDD-only actions (add-client / client-roster) do NOT ship in `apps/web`;
 * "edit-user" is intentionally dropped (needs a which-user pick — not a zero-arg
 * quick action).
 */

/** The app-local drawers a `trigger` quick action can open. */
export type QuickActionTriggerId = "add-user" | "add-lead"

type QuickActionBase = {
  id: string
  label: string
  description: string
  icon: LucideIcon
}

/**
 * Runtime quick action consumed by the grid + carousel — the `NavEntry`-shaped
 * discriminated union. `link` navigates; `trigger` fires `onSelect`.
 */
export type QuickAction = QuickActionBase &
  ({ kind: "link"; href: string } | { kind: "trigger"; onSelect: () => void })

/**
 * Build-time config def (mirrors `BoardConfig`) — permission-gated server-side at
 * config-build time so the surface never imports the authz system. A `trigger`
 * carries a serializable `triggerId`; the client binds the concrete `onSelect`.
 */
export type QuickActionDef = QuickActionBase & { permission: Permission } & (
    | { kind: "link"; href: string }
    | { kind: "trigger"; triggerId: QuickActionTriggerId }
  )

export const APP_QUICK_ACTIONS: QuickActionDef[] = [
  {
    id: "add-user",
    label: "Add member",
    description: "Register a person or placeholder",
    icon: UserPlusIcon,
    permission: APP_AREA_PERMISSIONS.users,
    kind: "trigger",
    triggerId: "add-user",
  },
  {
    id: "add-lead",
    label: "Add lead",
    description: "Capture a new prospect",
    icon: UserRoundPlusIcon,
    permission: APP_AREA_PERMISSIONS.leads,
    kind: "trigger",
    triggerId: "add-lead",
  },
  {
    id: "leads-roster",
    label: "Leads roster",
    description: "Work the pipeline",
    icon: ContactRoundIcon,
    permission: APP_AREA_PERMISSIONS.leads,
    kind: "link",
    href: "/app/leads",
  },
  {
    id: "loop-board",
    label: "Loop board",
    description: "Jump to the backlog",
    icon: SquareKanbanIcon,
    permission: APP_AREA_PERMISSIONS.loopBoard,
    kind: "link",
    href: "/app/loop-board",
  },
]

/**
 * Config-build-time permission gate (server-only usage) — mirrors
 * `filterAdminSectionGroups`. The page maps the result to `id`s (the only
 * serializable slice) for the client island.
 */
export const filterAppQuickActions = (user: SessionUser | null): QuickActionDef[] =>
  APP_QUICK_ACTIONS.filter(action => can(user, action.permission))

/**
 * Bind runtime handlers (client-side, pure): `trigger` defs get their `onSelect`
 * from `onTrigger`; `link` defs pass through. Given the server-allowed `id`s, the
 * client re-derives the visible defs from `APP_QUICK_ACTIONS` (icons stay client).
 */
export const resolveQuickActions = (
  allowedIds: string[],
  onTrigger: (triggerId: QuickActionTriggerId) => void,
): QuickAction[] => {
  const allowed = new Set(allowedIds)

  return APP_QUICK_ACTIONS.filter(def => allowed.has(def.id)).map(def => {
    const base: QuickActionBase = {
      id: def.id,
      label: def.label,
      description: def.description,
      icon: def.icon,
    }

    if (def.kind === "link") {
      return { ...base, kind: "link", href: def.href }
    }

    return { ...base, kind: "trigger", onSelect: () => onTrigger(def.triggerId) }
  })
}
