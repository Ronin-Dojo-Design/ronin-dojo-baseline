"use server"

import { requirePermission } from "~/lib/auth-guard"
import { findOrganizationList } from "~/server/admin/leads/queries"
import { findAddPersonOptions } from "~/server/admin/users/queries"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

/**
 * Deferred option loaders for the landing's quick-action drawers (SESSION_0600).
 *
 * `findAddPersonOptions` is a 5-query transaction (disciplines, ranks, orgs, trees,
 * tree members) — far too heavy to fire on every landing render for a drawer that
 * may never open. These server actions defer that cost to the moment the operator
 * opens the drawer. Each re-asserts the SAME area permission the quick-action
 * config gated on (defense in depth — a server action is independently callable).
 */

export async function loadAddPersonOptions() {
  await requirePermission(APP_AREA_PERMISSIONS.users)
  return findAddPersonOptions()
}

export async function loadAddLeadOptions() {
  await requirePermission(APP_AREA_PERMISSIONS.leads)
  return findOrganizationList()
}
