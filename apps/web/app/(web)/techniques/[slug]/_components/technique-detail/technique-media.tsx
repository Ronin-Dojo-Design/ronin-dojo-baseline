import { LockKeyholeIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import { UpgradePanel } from "~/components/web/ui/upgrade-panel"
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
 * SOME are gated. Carries NO playable url AND no poster/media-id-bearing path: the lock tile takes
 * zero media props by construction. Its compact secondary CTA reuses the established upgrade funnel
 * idiom; the single centered upgrade panel below still covers the fully-premium case.
 */
function TechniqueMediaLockTile() {
  return (
    <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30 transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5 focus-within:border-primary/40 focus-within:bg-primary/5 active:border-primary/50 active:bg-primary/10 motion-reduce:transition-none">
      <Stack direction="column" size="sm" className="relative items-center px-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm transition-[transform,color,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-4deg] group-hover:scale-105 group-hover:text-primary group-hover:shadow-md group-focus-within:-translate-y-0.5 group-focus-within:rotate-[-4deg] group-focus-within:scale-105 group-focus-within:text-primary group-focus-within:shadow-md group-active:translate-y-0 group-active:rotate-0 group-active:scale-95 group-active:text-primary group-active:shadow-sm motion-reduce:transform-none motion-reduce:transition-none">
          <LockKeyholeIcon className="size-6" />
        </span>
        <span className="text-sm font-medium text-foreground">Premium clip</span>
        <Button
          size="sm"
          variant="secondary"
          prefix={<LockKeyholeIcon />}
          render={<Link href="/lineage/join" />}
        >
          Unlock with Premium
        </Button>
      </Stack>
    </div>
  )
}

/**
 * The centered upgrade CTA — shown when EVERY clip is locked (behavior-preserving fully-premium
 * case). Renders the shared `UpgradePanel` primitive (WL-P2-63) — strings only; the locked tiles'
 * urls/posters were already stripped server-side by `gateTechniqueMedia` and never reach here.
 */
function TechniqueMediaUpgradePanel() {
  return (
    <Section>
      <H4>Media</H4>
      <UpgradePanel
        heading="Premium technique"
        description="This lesson is part of the Black Belt Legacy premium curriculum. Upgrade to unlock the full video."
        ctaLabel="Unlock with Premium"
        href="/lineage/join"
      />
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
            <TechniqueMediaLockTile key={tile.id} />
          ) : (
            <TechniqueMediaItem key={tile.id} media={tile.media} techniqueName={techniqueName} />
          ),
        )}
      </div>
    </Section>
  )
}
