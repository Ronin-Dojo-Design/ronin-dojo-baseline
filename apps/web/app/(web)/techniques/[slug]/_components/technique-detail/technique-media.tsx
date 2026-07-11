import { LockKeyholeIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Section } from "~/components/web/ui/section"
import { toVideoEmbedUrl } from "~/lib/video-embed"
import type {
  GatedTechniqueTile,
  PlayableTileMedia,
} from "~/server/web/techniques/technique-media-gate"

type TechniqueMediaProps = {
  /**
   * The technique's attachments already gated for THIS viewer (SESSION_0527 Slice 0, per-video). A
   * playable tile carries its url; a locked premium tile had its url STRIPPED server-side, so the
   * lock render can never emit a src (the payload-layer no-leak invariant is encoded in the type).
   */
  tiles: GatedTechniqueTile[]
  techniqueName: string
  /** Every tile locked → the single centered upgrade panel (behavior-preserving fully-premium case). */
  allLocked: boolean
}

/**
 * One PLAYABLE media tile (SESSION_0526 C3). A YOUTUBE attachment embeds via iframe; an uploaded
 * `video/*` file plays inline; anything else renders as an image. Only ever rendered for an UNLOCKED
 * tile — a locked premium tile has no url and renders `TechniqueMediaLockTile` instead.
 */
function TechniqueMediaItem({
  media,
  techniqueName,
}: {
  media: PlayableTileMedia
  techniqueName: string
}) {
  const youTubeEmbed = media.type === "YOUTUBE" ? toVideoEmbedUrl(media.url) : null

  return (
    <div className="overflow-hidden rounded-lg">
      {youTubeEmbed ? (
        <iframe
          src={youTubeEmbed}
          title={media.title ?? techniqueName}
          className="w-full aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : media.mimeType?.startsWith("video/") ? (
        // oxlint-disable-next-line jsx-a11y/media-has-caption -- user-uploaded technique video; no caption track available
        <video
          src={media.url}
          controls
          className="w-full aspect-video object-cover"
          poster={media.thumbnailUrl ?? undefined}
        />
      ) : (
        <img
          src={media.url}
          alt={media.altText ?? techniqueName}
          className="w-full aspect-video object-cover"
        />
      )}
    </div>
  )
}

/**
 * A per-tile lock (SESSION_0527 Slice 0) — the mixed free/premium case, where SOME clips play and
 * SOME are gated. Shows the poster (if any) under a lock scrim; carries NO playable url. The single
 * centered upgrade panel below still covers the fully-premium case.
 */
function TechniqueMediaLockTile({ media }: { media: GatedTechniqueTile["media"] }) {
  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30">
      {media.thumbnailUrl && (
        <img
          src={media.thumbnailUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-40"
        />
      )}
      <span className="relative flex flex-col items-center gap-2 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground">
          <LockKeyholeIcon className="size-6" />
        </span>
        <span className="text-sm font-medium text-foreground">Premium clip</span>
      </span>
    </div>
  )
}

/** The centered upgrade CTA — shown when EVERY clip is locked (behavior-preserving fully-premium case). */
function TechniqueMediaUpgradePanel() {
  return (
    <Section>
      <H4>Media</H4>
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-background text-muted-foreground">
          <LockKeyholeIcon className="size-7" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">Premium technique</p>
          <p className="max-w-md text-sm text-muted-foreground">
            This lesson is part of the Black Belt Legacy premium curriculum. Upgrade to unlock the
            full video.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          prefix={<LockKeyholeIcon />}
          render={<Link href="/lineage/join" />}
        >
          Unlock with Premium
        </Button>
      </div>
    </Section>
  )
}

/**
 * Media gallery (images + user-uploaded technique videos). The heaviest, last-painted section, so the
 * orchestrator `next/dynamic`-loads it (SSR kept). Renders nothing when the technique has no
 * attachments; the single upgrade panel when EVERY clip is locked; otherwise a grid where free clips
 * play and any premium clip renders a per-tile lock (its url already stripped server-side).
 */
export function TechniqueMedia({ tiles, techniqueName, allLocked }: TechniqueMediaProps) {
  if (tiles.length === 0) {
    return null
  }

  if (allLocked) {
    return <TechniqueMediaUpgradePanel />
  }

  return (
    <Section>
      <H4>Media</H4>
      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map(tile =>
          tile.locked ? (
            <TechniqueMediaLockTile key={tile.id} media={tile.media} />
          ) : (
            <TechniqueMediaItem key={tile.id} media={tile.media} techniqueName={techniqueName} />
          ),
        )}
      </div>
    </Section>
  )
}
