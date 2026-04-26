import type { ComponentProps } from "react"
import { Box } from "~/components/common/box"
import { ExternalLink } from "~/components/web/external-link"
import { cx } from "~/lib/utils"

type OverlayImageProps = ComponentProps<typeof ExternalLink> & {
  src: string
  alt?: string
  loading?: ComponentProps<"img">["loading"]
}

export const OverlayImage = ({ className, src, alt, loading, ...props }: OverlayImageProps) => {
  return (
    <Box hover>
      <ExternalLink
        className={cx("not-prose group relative rounded-lg overflow-clip", className)}
        doTrack
        {...props}
      >
        <img
          src={src}
          alt={alt ?? ""}
          width={1280}
          height={1024}
          loading={loading}
          className="aspect-video h-auto w-full object-cover object-top will-change-transform group-hover:scale-[101%]"
        />
      </ExternalLink>
    </Box>
  )
}
