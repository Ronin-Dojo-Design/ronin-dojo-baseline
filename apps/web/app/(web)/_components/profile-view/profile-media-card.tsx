import { MicIcon, PlayIcon } from "lucide-react"
import { Link } from "~/components/common/link"
import type { ProfileMediaItem } from "~/server/web/directory/profile-media"

/**
 * One profile-highlight card (SESSION_0525 C1) — parity with the legacy `MediaCarousel` /
 * `TuffBuffsMediaCarousel` cards. A podcast card links OUT to an external provider in a new tab
 * (`external`), a technique reel navigates INTERNALLY to the technique page — the TuffBuffs
 * `url` vs `route` split, driven by the DTO's `href` + `external`. Server component: the thumbnail
 * is a CSS background (the `ProfileCoverBanner` idiom — avoids next/image `remotePatterns` config
 * for arbitrary member / YouTube posters), so it ships zero card-specific client JS. Reads only the
 * already-gated `ProfileMediaItem` DTO — no private-field access.
 */
export function ProfileMediaCard({
  item,
  kind,
}: {
  item: ProfileMediaItem
  kind: "video" | "podcast"
}) {
  const Icon = kind === "video" ? PlayIcon : MicIcon
  // External → new tab + noopener; internal → in-app navigation (no target).
  const externalProps = item.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {}

  return (
    <Link
      href={item.href}
      {...externalProps}
      className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card transition hover:border-foreground/20 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <div
        role="img"
        aria-label={item.title}
        className="relative flex aspect-video w-full items-center justify-center bg-muted bg-center bg-cover"
        style={item.thumbnailUrl ? { backgroundImage: `url("${item.thumbnailUrl}")` } : undefined}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition group-hover:bg-background/90">
          <Icon className="size-5" />
        </span>
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <p className="line-clamp-2 text-sm font-medium text-foreground">{item.title}</p>
        {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
      </div>
    </Link>
  )
}
