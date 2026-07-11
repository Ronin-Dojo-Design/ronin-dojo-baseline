import { LockKeyholeIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Section } from "~/components/web/ui/section"
import { toVideoEmbedUrl } from "~/lib/video-embed"
import type { TechniqueOne } from "~/server/web/techniques/payloads"

type TechniqueMediaProps = {
  mediaAttachments: TechniqueOne["mediaAttachments"]
  techniqueName: string
  /**
   * Freemium (SESSION_0525): true → the viewer is NOT entitled to this premium technique, so the
   * player is replaced by a locked upgrade CTA (the same `LockKeyholeIcon` → `/lineage/join`
   * affordance the profile `UpgradeSection` rides). False → the media plays normally.
   */
  locked?: boolean
}

/**
 * Media gallery (images + user-uploaded technique videos). The heaviest, last-painted
 * section, so the orchestrator `next/dynamic`-loads it (SSR kept). Renders nothing when
 * the technique has no attachments; renders the locked upgrade panel when a premium
 * technique is gated for the viewer.
 */
export function TechniqueMedia({ mediaAttachments, techniqueName, locked }: TechniqueMediaProps) {
  if (mediaAttachments.length === 0) {
    return null
  }

  if (locked) {
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

  return (
    <Section>
      <H4>Media</H4>
      <div className="grid gap-4 sm:grid-cols-2">
        {mediaAttachments.map(({ id, media }) => {
          const youTubeEmbed = media.type === "YOUTUBE" ? toVideoEmbedUrl(media.url) : null

          return (
            <div key={id} className="overflow-hidden rounded-lg">
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
        })}
      </div>
    </Section>
  )
}
