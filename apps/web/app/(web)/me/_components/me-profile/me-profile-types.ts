import type { Brand } from "~/.generated/prisma/client"
import type { MyProfile } from "~/server/web/directory/profile-projection"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"
import type { DashboardMediaAttachment } from "~/server/web/media/queries"

/** A public IMAGE attachment rendered in the profile gallery grid. */
export type MeGalleryImage = DashboardMediaAttachment

/**
 * Props for the `/me` orchestrator. The page resolves identity + reads on the wire
 * and hands the already-projected values down — the module owns presentation only.
 */
export type MeProfileProps = {
  /** Resolved request brand — drives the BBL typography scope (ADR 0022). */
  brand: Brand
  /** The owner's projected directory profile; `null` when not yet provisioned. */
  profile: MyProfile | null
  /** Lineage node profile backing the dated rank-history timeline; `null` when unplaced. */
  lineageProfile: LineageNodeProfile | null
  /** Public IMAGE attachments for the gallery grid (already filtered by the page). */
  galleryImages: MeGalleryImage[]
}
