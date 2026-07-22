import type { Metadata } from "next"
import { hasAnyLineageGrant, requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { CommandDeck } from "./command-deck"
import { resolveCommandDeckData } from "./data"

export const metadata: Metadata = {
  title: "Command Deck",
}

/**
 * Beta Command Deck (SESSION_0501) — the expressive opposite of the flat
 * `/app/sections` index: swipeable group pills + a live-count bento tile grid,
 * driven by the SAME `ADMIN_SECTION_GROUPS` config (no fork). The `/app` landing
 * (SESSION_0600) promotes this SAME component; both share `resolveCommandDeckData`.
 */
export default async function () {
  // The `/app/beta` segment layout already gates on `beta.view`; re-assert here
  // so the page stays safe if it ever moves out of the beta segment.
  const user = await requirePermission(APP_AREA_PERMISSIONS.beta)
  const hasLineageGrant = await hasAnyLineageGrant(user.id)
  const { allowedHrefs, counts } = await resolveCommandDeckData(user, hasLineageGrant)

  return <CommandDeck allowedHrefs={allowedHrefs} counts={counts} />
}
