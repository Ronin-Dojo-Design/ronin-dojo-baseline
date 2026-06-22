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
export function toVideoEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) {
    return null
  }

  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase()

  // YouTube — youtu.be/<id>, youtube.com/watch?v=<id>, /embed/<id>, /shorts/<id>
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0]
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    const match = url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

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
