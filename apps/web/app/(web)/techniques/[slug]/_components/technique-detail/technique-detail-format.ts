import type { Brand, TechniqueProgressStatus } from "~/.generated/prisma/client"
import type { GatedTechniqueMedia } from "~/server/web/techniques/technique-media-gate"
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
   * Freemium (SESSION_0527 Slice 0, per-video): the technique's attachments already gated for THIS
   * viewer. Each tile is either playable (url present) or locked (url stripped server-side); the
   * route resolves entitlement off the session and gates before render, so no premium url reaches
   * the payload of an unentitled viewer (payload-layer no-leak invariant). `allLocked` drives the
   * single centered upgrade panel (behavior-preserving for a fully-premium technique).
   */
  gatedMedia: GatedTechniqueMedia
  /**
   * G-022 Lane B (SESSION_0580) — the viewer's OWN technique-progress, resolved server-side.
   * `null` for an anonymous visitor (no "own progress" to show); a signed-in viewer always gets an
   * object, `isTracked: false` when they have never set a status (the control still renders so they
   * can start tracking).
   */
  progress: { status: TechniqueProgressStatus; isTracked: boolean } | null
}
