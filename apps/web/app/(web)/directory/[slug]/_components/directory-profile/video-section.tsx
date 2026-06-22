import { H4 } from "~/components/common/heading"
import { Section } from "~/components/web/ui/section"
import { toVideoEmbedUrl } from "~/lib/video-embed"

/**
 * Video intro embed (YouTube / Vimeo) for the public directory profile
 * (FI-007 / WL-P2-15).
 *
 * `DirectoryProfile.videoIntroUrl` is editable + stored + projected, but had no
 * render surface. This section normalizes the stored watch URL to an embed URL
 * (`toVideoEmbedUrl`) and renders a responsive 16:9 iframe. Renders nothing when
 * the URL is unset or not a recognized YouTube/Vimeo link.
 */
export function VideoIntroSection({ videoIntroUrl }: { videoIntroUrl?: string | null }) {
  const embedUrl = toVideoEmbedUrl(videoIntroUrl)

  if (!embedUrl) {
    return null
  }

  return (
    <Section>
      <H4>Video Intro</H4>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
        <iframe
          src={embedUrl}
          title="Video introduction"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </Section>
  )
}
