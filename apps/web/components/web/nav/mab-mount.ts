import { Brand } from "~/.generated/prisma/client"
import { isAdmin } from "~/lib/authz-predicates"
import type { SessionUser } from "~/server/orpc/context"
import { canCreateCommunityPostForUser } from "~/server/web/community/permissions"
import { canCreateTechniqueForUser } from "~/server/web/techniques/permissions"

/**
 * THE MAB mount predicate (SESSION_0529 review fix, Doug P2-3) — one server-side source of truth
 * for "does this viewer get the radial MAB?", shared by `MobileShell` (which mounts it) and the
 * community feed (which must HIDE its own mobile create-post FAB whenever the MAB mounts — the
 * two dock at the same corner, and the MAB overlays it at z-50 > z-30).
 *
 * admin (all four B1 actions are admin-gated) ∨ `canCreateTechniqueForUser` (Slice 3B technique
 * action — Elite / staff / RBAC) ∨ `canCreateCommunityPostForUser` (FI-028 post action — Premium /
 * Elite / Legend / staff / RBAC). The post leg is REQUIRED: a Premium-only member is post-capable
 * but not technique-capable, so without it they'd never get the MAB and their `permissions.post`
 * fan action would never render. Both capability checks are request-cached, so the shell + a page
 * resolving this in the same request pay one lookup each.
 */
export async function shouldMountMab(user: SessionUser | null | undefined): Promise<boolean> {
  if (!user) return false
  if (isAdmin(user)) return true
  if (await canCreateTechniqueForUser(user, Brand.BBL)) return true
  return canCreateCommunityPostForUser(user, Brand.BBL)
}
