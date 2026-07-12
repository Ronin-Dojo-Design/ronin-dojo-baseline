import { Brand } from "~/.generated/prisma/client"
import { isAdmin } from "~/lib/authz-predicates"
import type { SessionUser } from "~/server/orpc/context"
import { canCreateTechniqueForUser } from "~/server/web/techniques/permissions"

/**
 * THE MAB mount predicate (SESSION_0529 review fix, Doug P2-3) — one server-side source of truth
 * for "does this viewer get the radial MAB?", shared by `MobileShell` (which mounts it) and the
 * community feed (which must HIDE its own mobile create-post FAB whenever the MAB mounts — the
 * two dock at the same corner, and the MAB overlays it at z-50 > z-30).
 *
 * admin (all four B1 actions are admin-gated) ∨ `canCreateTechniqueForUser` (Slice 3B technique
 * action — Elite / staff / RBAC). `canCreateTechniqueForUser` is request-cached, so the shell and
 * a page resolving this in the same request pay one lookup.
 */
export async function shouldMountMab(user: SessionUser | null | undefined): Promise<boolean> {
  if (!user) return false
  if (isAdmin(user)) return true
  return canCreateTechniqueForUser(user, Brand.BBL)
}
