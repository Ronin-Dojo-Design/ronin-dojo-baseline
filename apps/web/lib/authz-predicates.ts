/**
 * Pure authorization predicates — NO `db`/Prisma import, so this module is safe to import into
 * CLIENT components (importing `lib/authz`, which pulls `services/db`, poisons the browser bundle
 * with the Prisma client → Turbopack `node:module` 500; see the "Prisma-in-browser" gotcha).
 *
 * `lib/authz` re-exports `isAdmin` from here so there is still exactly ONE admin predicate — server
 * code keeps importing it from `lib/authz`, client code imports it from here. (SESSION_0495 C2-8.)
 */

/**
 * Minimal shape the admin check reads — just `role`. A variable holding a fuller user object is
 * accepted by structural typing (extra fields are fine); the predicate only ever looks at `role`. No
 * index signature: it bought nothing over structural typing and silently swallowed typo'd shapes.
 */
export type AuthzUserRole = { role?: string | null }

/** True when the user's role is exactly `admin`. The single source of the admin check. */
export const isAdmin = (user: AuthzUserRole | null | undefined): boolean => {
  return user?.role === "admin"
}
