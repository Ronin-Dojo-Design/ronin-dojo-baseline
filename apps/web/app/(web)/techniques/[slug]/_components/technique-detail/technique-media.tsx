import { H4 } from "~/components/common/heading"
import { Section } from "~/components/web/ui/section"
import { toVideoEmbedUrl } from "~/lib/video-embed"
import type { TechniqueOne } from "~/server/web/techniques/payloads"

type TechniqueMediaProps = {
  mediaAttachments: TechniqueOne["mediaAttachments"]
  techniqueName: string
}

/**
 * Media gallery (images + user-uploaded technique videos). The heaviest, last-painted
 * section, so the orchestrator `next/dynamic`-loads it (SSR kept). Renders nothing when
 * the technique has no attachments.
 */
export function TechniqueMedia({ mediaAttachments, techniqueName }: TechniqueMediaProps) {
  if (mediaAttachments.length === 0) {
    return null
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
