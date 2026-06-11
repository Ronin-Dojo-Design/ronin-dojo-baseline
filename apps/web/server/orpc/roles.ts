import type { SessionUser } from "~/server/orpc/context"

/**
 * A permission identifies an action on an entity, e.g. `"health.read"`.
 *
 * Permission strings are *requested* by procedures via `meta.permission`
 * and by `can(user, permission)`. They are not stored.
 */
export type Permission = string

/**
 * A grant is what a role *has*. Supported forms:
 *
 * - `"*"`                       — every permission
 * - `"<entity>.*"`              — every action on an entity
 * - `"<entity>.<action>"`       — atomic grant
 *
 * Grants are role-scoped strings with no per-resource ownership check.
 * BBL extends this with resource-scoped grants (`LineageTreeAccess`) in
 * Phase 1b per SOT-ADR D4 — the flat roles here are NOT sufficient for
 * BBL tree/branch/node authority.
 */
export type Grant = string

/**
 * Built-in roles.
 *
 * Phase 1a ships the upstream flat set. Phase 1b maps the Ronin role
 * surface (`tournament_director` from `lib/safe-actions.ts`, PRD RBAC
 * TREE_ADMIN/BRANCH_EDITOR/NODE_EDITOR via D4 resource grants) — until
 * then unknown role strings resolve to `guest`, which is safe because
 * only the health smoke procedures run through oRPC.
 */
export type Role = "admin" | "user" | "guest"

// Permissions available to everyone, signed in or not. Phase 1a: only the
// health smoke. Entity grants land with their routers (1b/1c migration).
const PUBLIC_GRANTS = ["health.read"] as const

// Permissions for any signed-in user, on top of the public ones. Roles are
// flat (no inheritance), so the public grants are spread in explicitly.
const USER_GRANTS = [...PUBLIC_GRANTS] as const

export const ROLES: Record<Role, ReadonlyArray<Grant>> = {
  // `*` grants every permission, including admin-only ones.
  admin: ["*"],

  user: USER_GRANTS,

  guest: PUBLIC_GRANTS,
}

/**
 * Resolve the effective role for a session user. Returns `"guest"` for
 * anonymous callers or users with an unknown role string.
 */
export const roleOf = (user: SessionUser | null | undefined): Role => {
  const candidate = user?.role
  if (candidate && candidate in ROLES) {
    return candidate as Role
  }
  return "guest"
}
