/**
 * Convert a user-entered YouTube/Vimeo *watch* URL into an *embed* URL suitable
 * for an `<iframe src>`. Returns `null` for empty / unsupported / unparseable
 * input so callers can skip rendering entirely.
 *
 * The directory profile stores a free-text `videoIntroUrl` ("YouTube or Vimeo
 * URL", per the passport editor field). This is the seam that turns that watch
 * URL into a playable embed for the public profile video section.
 *
 * FI-007 / WL-P2-15 (SESSION_0434).
 */

function parseVideoUrl(raw: string | null | undefined): URL | null {
  if (!raw) {
    return null
  }
  try {
    return new URL(raw.trim())
  } catch {
    return null
  }
}

/**
 * YouTube video ids are exactly 11 chars from the URL-safe base64 alphabet. Validating the charset
 * (SESSION_0495 C1-11) stops a malformed/garbage path segment from being interpolated straight into
 * an `youtube.com/embed/<id>` src — the id goes into an iframe `src`, so it must be a real id shape,
 * not whatever the member typed after the slash.
 */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

const asYouTubeId = (candidate: string | null | undefined): string | null =>
  candidate && YOUTUBE_ID.test(candidate) ? candidate : null

/** YouTube video id from youtu.be/<id>, youtube.com/watch?v=<id>, /embed/<id>, /shorts/<id>. */
function parseYouTubeVideoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "").toLowerCase()

  if (host === "youtu.be") {
    return asYouTubeId(url.pathname.split("/").filter(Boolean)[0])
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      return asYouTubeId(url.searchParams.get("v"))
    }
    const match = url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)
    return asYouTubeId(match?.[1])
  }
  return null
}

export function toVideoEmbedUrl(raw: string | null | undefined): string | null {
  const url = parseVideoUrl(raw)
  if (!url) {
    return null
  }

  const youTubeId = parseYouTubeVideoId(url)
  if (youTubeId) {
    return `https://www.youtube.com/embed/${youTubeId}`
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase()

  // Vimeo — vimeo.com/<id>, player.vimeo.com/video/<id>
  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0]
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null
  }
  if (host === "player.vimeo.com") {
    const match = url.pathname.match(/^\/video\/(\d+)/)
    return match ? `https://player.vimeo.com/video/${match[1]}` : null
  }

  return null
}

/**
 * Best-effort static *thumbnail* URL for a user-entered video URL — the community
 * feed's card media for video-first posts (SESSION_0493 Desi P1). YouTube exposes
 * predictable thumbnail URLs (`img.youtube.com` — allowed in next.config.ts
 * `images.remotePatterns`); Vimeo has no static equivalent (oEmbed API only), so
 * Vimeo returns `null` and callers keep their non-media fallback.
 */
export function toVideoThumbnailUrl(raw: string | null | undefined): string | null {
  const url = parseVideoUrl(raw)
  if (!url) {
    return null
  }

  const youTubeId = parseYouTubeVideoId(url)
  return youTubeId ? `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg` : null
}
