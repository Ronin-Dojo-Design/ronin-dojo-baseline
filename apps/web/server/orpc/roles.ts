import type { LineageTreeAccessRole } from "~/.generated/prisma/client"
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
 * Built-in flat roles — the upstream global role surface plus the Ronin
 * `tournament_director` (mirroring `lib/safe-actions.ts`).
 *
 * These are GLOBAL roles with no per-resource scope. BBL's per-resource
 * authority (TREE_ADMIN / BRANCH_EDITOR / NODE_EDITOR of a specific tree,
 * branch, or node) is layered on top via `LINEAGE_RESOURCE_GRANTS` +
 * `server/orpc/resource-permissions.ts`, per SOT-ADR D4. Unknown role
 * strings resolve to `guest` (deny-by-default).
 */
export type Role = "admin" | "user" | "guest" | "tournament_director"

// Permissions available to everyone, signed in or not. Phase 1a seeded the
// health smoke; Phase 1c (SESSION_0364) adds `lineage.read` — the public
// `/lineage/[treeSlug]` tree page is anonymous-reachable, so its migrated
// oRPC read is a public grant. Further entity grants land with their routers.
const PUBLIC_GRANTS = ["health.read", "lineage.read"] as const

// Permissions for any signed-in user, on top of the public ones. Roles are
// flat (no inheritance), so the public grants are spread in explicitly.
const USER_GRANTS = [...PUBLIC_GRANTS] as const

// Ronin `tournament_director` (from `lib/safe-actions.ts`'s
// `tournamentAdminActionClient`): a signed-in user plus tournament authority.
// Kept deliberately small — a single `tournaments.*` wildcard stands in until
// the tournament entity router migrates and declares its concrete permissions.
const TOURNAMENT_DIRECTOR_GRANTS = [...USER_GRANTS, "tournaments.*"] as const

export const ROLES: Record<Role, ReadonlyArray<Grant>> = {
  // `*` grants every permission, including admin-only ones.
  admin: ["*"],

  user: USER_GRANTS,

  guest: PUBLIC_GRANTS,

  tournament_director: TOURNAMENT_DIRECTOR_GRANTS,
}

/**
 * Per-resource grant matrix for the `LineageTreeAccess` roles (SOT-ADR D4).
 *
 * Unlike `ROLES`, these grants only apply WITHIN the scope of the access row
 * that carries them — a whole tree (`TREE_ADMIN`/`TREE_EDITOR`), a branch
 * rooted at a member (`BRANCH_EDITOR`), or a single node (`NODE_EDITOR`).
 * They use the same wildcard matching as flat grants (`matchesPattern`).
 *
 * Grounded in how `LineageTreeAccess` is already consumed by
 * `server/web/lineage/editor-actions.ts` (placement/promotion edits, visual
 * groups) and gated by SOT-ADR D6 for claim review:
 *
 * - `TREE_ADMIN`    — full lineage authority on the tree, including visual
 *   groups (`lineage.*`) and claim review.
 * - `TREE_EDITOR`   — edit members/relationships tree-wide, but NOT admin-only
 *   visual groups; may review claims.
 * - `BRANCH_EDITOR` — edit members within its branch only; may review claims
 *   for nodes in that branch. (Cannot edit visual groups.)
 * - `NODE_EDITOR`   — edit only its own node (no re-parenting — mirrors
 *   `NODE_EDITOR_CANNOT_REPARENT`); may review claims for that node.
 *
 * `claim.review` is expressible at every level (D4/D6); the resolver in
 * `resource-permissions.ts` enforces the scope match.
 */
export const LINEAGE_RESOURCE_GRANTS: Record<LineageTreeAccessRole, ReadonlyArray<Grant>> = {
  TREE_ADMIN: ["lineage.*", "claim.review"],
  TREE_EDITOR: ["lineage.member.*", "lineage.relationship.*", "claim.review"],
  BRANCH_EDITOR: ["lineage.member.edit", "lineage.relationship.edit", "claim.review"],
  NODE_EDITOR: ["lineage.node.edit", "claim.review"],
}

/**
 * Per-area permission strings for the unified `/app` workspace (SOT-ADR D5,
 * SESSION_0365 grill option b): every dashboard area's layout is gated by
 * `requirePermission(APP_AREA_PERMISSIONS.<area>)`, and the sidebar shows an
 * item iff `can(user, permission)` (lineage additionally admits active
 * `LineageTreeAccess` grantees — see `lib/auth-guard.ts requireLineageAccess`).
 *
 * Registered once here and REUSED by each entity's oRPC router as it migrates
 * (Phases 4–5) — the layout gate and the procedure gate share one string.
 * `admin: ["*"]` passes all of them today; `tournament_director` passes
 * `tournaments.manage` via its `tournaments.*` wildcard. This is the
 * operator-ratified day-one tightening: non-admin roles reach only their areas.
 */
export const APP_AREA_PERMISSIONS = {
  billing: "billing.manage",
  categories: "categories.manage",
  certificates: "certificates.manage",
  claims: "claims.manage",
  content: "content.manage",
  courses: "courses.manage",
  email: "email.manage",
  entitlements: "entitlements.manage",
  invites: "invites.manage",
  leads: "leads.manage",
  lineage: "lineage.manage",
  media: "media.manage",
  memberships: "memberships.manage",
  merch: "merch.manage",
  organizations: "organizations.manage",
  pricingPlans: "pricing-plans.manage",
  privacy: "privacy.manage",
  programs: "programs.manage",
  repoDocs: "repo-docs.manage",
  reports: "reports.manage",
  roles: "roles.manage",
  schedule: "schedule.manage",
  skillLevels: "skill-levels.manage",
  storage: "storage.manage",
  subscriptionTiers: "subscription-tiers.manage",
  subscriptions: "subscriptions.manage",
  tags: "tags.manage",
  techniques: "techniques.manage",
  tools: "tools.manage",
  tournaments: "tournaments.manage",
  users: "users.manage",
} as const satisfies Record<string, Permission>

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
