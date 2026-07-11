import type { Brand } from "~/.generated/prisma/client"
import type { TechniqueOne } from "~/server/web/techniques/payloads"

/** Humanize an enum value for display (`SIDE_CONTROL` → `SIDE CONTROL`). */
export function formatEnumLabel(value: string): string {
  return value.replace(/_/g, " ")
}

/**
 * The resolved view model the detail orchestrator renders. The route fetches the
 * technique on the wire and threads it down with the request brand; the orchestrator
 * owns only composition + lazy boundaries (component-launch-sweep step 1).
 */
export type TechniqueDetailView = {
  /** The technique, already fetched on the wire (non-null guaranteed by the route). */
  technique: TechniqueOne
  /** Resolved request brand — drives which font tokens the typography scope exposes. */
  brand: Brand
  /**
   * Freemium (SESSION_0525): whether the viewer may watch this technique's video — true for a
   * free technique or an entitled viewer (premium tier / admin / author). The route resolves it
   * off the session; when false on a premium technique the media section renders the locked
   * upgrade state instead of the player.
   */
  viewerEntitled: boolean
}
