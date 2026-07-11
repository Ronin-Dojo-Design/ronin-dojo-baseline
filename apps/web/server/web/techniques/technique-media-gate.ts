import type { MediaType } from "~/.generated/prisma/client"

/**
 * SESSION_0527 Slice 0 — per-video freemium gate (payload-layer strip).
 *
 * The freemium gate unit moved from the whole technique (`Technique.isPremium`, SESSION_0525) to the
 * individual attachment (`MediaAttachment.isPremium`), so one technique can mix free + premium clips.
 * This pure helper is the WATCH-PAGE analogue of the SESSION_0526 A1 rail strip: it gates EACH
 * attachment and, for a locked premium tile, DROPS the playable `url` (+ `mimeType`/`altText`)
 * server-side so it never reaches the rendered payload of an unentitled viewer.
 *
 * The no-leak invariant is encoded in the RETURN TYPE: a `locked: true` tile's `media` has no `url`
 * field at all, so no render branch can emit a src for it — the type system, not just discipline,
 * prevents the leak. `viewerEntitled` is the viewer's own entitlement (admin / owner / premium tier),
 * resolved once by `isTechniqueViewerEntitled`; it is technique-independent, so it is passed in.
 */

/** The raw attachment shape the gate needs — structurally satisfied by `TechniqueOne["mediaAttachments"][number]`. */
export type GateInputAttachment = {
  id: string
  isPremium: boolean
  media: {
    type: MediaType
    url: string
    thumbnailUrl: string | null
    title: string | null
    mimeType: string | null
    altText: string | null
  }
}

/** An unlocked tile carries the playable url; the watch player renders from this. */
export type PlayableTileMedia = {
  type: MediaType
  title: string | null
  thumbnailUrl: string | null
  url: string
  mimeType: string | null
  altText: string | null
}

/** A locked tile carries POSTER-ONLY fields — no `url`, so it is impossible to emit a player src. */
export type LockedTileMedia = {
  type: MediaType
  title: string | null
  thumbnailUrl: string | null
}

export type GatedTechniqueTile =
  | { id: string; locked: false; media: PlayableTileMedia }
  | { id: string; locked: true; media: LockedTileMedia }

export type GatedTechniqueMedia = {
  tiles: GatedTechniqueTile[]
  /**
   * True when EVERY tile is locked → the watch page shows the single centered upgrade panel
   * (behavior-preserving: every existing premium technique is fully-premium post-backfill). A mixed
   * technique (some free, some premium) has `allLocked = false` and renders per-tile locks.
   */
  allLocked: boolean
}

/** Whether any attachment is premium — the route uses this to skip the session read for all-free techniques. */
export function hasPremiumTechniqueMedia(attachments: readonly { isPremium: boolean }[]): boolean {
  return attachments.some(attachment => attachment.isPremium)
}

/**
 * Gate a technique's attachments for a viewer. A premium attachment the viewer isn't entitled to
 * becomes a locked tile with its playable url STRIPPED; everything else stays playable.
 */
export function gateTechniqueMedia(
  attachments: readonly GateInputAttachment[],
  viewerEntitled: boolean,
): GatedTechniqueMedia {
  const tiles = attachments.map((attachment): GatedTechniqueTile => {
    const locked = attachment.isPremium && !viewerEntitled
    if (locked) {
      // Strip the playable url server-side — a locked premium tile ships type + poster only.
      return {
        id: attachment.id,
        locked: true,
        media: {
          type: attachment.media.type,
          title: attachment.media.title,
          thumbnailUrl: attachment.media.thumbnailUrl,
        },
      }
    }
    return {
      id: attachment.id,
      locked: false,
      media: {
        type: attachment.media.type,
        title: attachment.media.title,
        thumbnailUrl: attachment.media.thumbnailUrl,
        url: attachment.media.url,
        mimeType: attachment.media.mimeType,
        altText: attachment.media.altText,
      },
    }
  })
  return { tiles, allLocked: tiles.length > 0 && tiles.every(tile => tile.locked) }
}
