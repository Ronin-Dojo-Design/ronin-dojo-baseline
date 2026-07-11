import type { PublicPassportMedia } from "~/server/web/media/queries"

/**
 * Profile media-highlight DTO (SESSION_0525 C1) — parity with the legacy "Profile Highlights"
 * carousels: BBLApp (`blackbeltlegacy/utils/profileMedia.js` + `posts/MediaCarousel.jsx`) and the
 * richer TuffBuffs "Spotify carousel" (`tuffbuffs/components/PublicProfileCarousels.jsx` +
 * `shared/TuffBuffsMediaCarousel.jsx`). Two rails on the public profile: a Podcast lane whose cards
 * link OUT to an external provider (Spotify / Apple Podcasts / YouTube) in a new tab, and a
 * Technique lane whose cards navigate INTERNALLY to the technique page when linked.
 *
 * Pure shaping — no DB, no React. The loader (`loadProfileViewBySlug`) assembles this from the
 * public passport media read AFTER the rich-media gate has been resolved, so the presentation
 * section stays fetch-free and can never leak a private field: `buildProfileMedia` returns EMPTY
 * rails whenever the viewer isn't rich-media-eligible (free tier), exactly like the legacy
 * `isProfileMediaEligible` gate.
 *
 * Source axis = the `MediaAttachment.purpose` curation slot on the Passport (`"…podcast…"` →
 * podcasts, `"…technique…"` / any public video media → technique videos), the schema-faithful
 * analogue of the legacy `profileTechniques` / `profilePodcasts` curated arrays — no schema added
 * (SESSION_0525 C1 guard). EXTERNAL link-out works with zero schema change: `Media` already stores
 * an arbitrary `url` + `type: "YOUTUBE"` (verified via the `createMedia` admin action — external
 * YouTube / Apple Podcasts links, not R2-only), so a filmed Bob Bass podcast, a Bob-Bass YouTube
 * clip, and the Dave-Meyer episode all seed as `type=YOUTUBE` Media attached with the right purpose.
 */

export type ProfileMediaItem = {
  id: string
  title: string
  /** Poster/thumbnail; null → the card renders its kind placeholder. */
  thumbnailUrl: string | null
  /** Destination — external provider URL (podcast) or an internal `/techniques/[slug]` route. */
  href: string
  /** True → open in a new tab (`rel="noopener"`); false → in-app navigation (TuffBuffs `url` vs `route`). */
  external: boolean
  /** Small caption under the title (provider label for podcasts, "Technique" for reels). */
  subtitle: string | null
}

export type ProfileMedia = {
  techniqueVideos: ProfileMediaItem[]
  podcasts: ProfileMediaItem[]
}

export const EMPTY_PROFILE_MEDIA: ProfileMedia = { techniqueVideos: [], podcasts: [] }

// YouTube watch/short/embed/youtu.be → `hqdefault` thumbnail (mirrors the legacy
// `buildYoutubeThumbnail`), so a YOUTUBE attachment with no stored poster still shows one.
const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/

export function buildYoutubeThumbnail(url: string | null | undefined): string | null {
  const id = url?.match(YOUTUBE_ID)?.[1]
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

/** `durationSec` → a compact "12 min" / "1h 05m" label, or null when unknown. */
function formatDurationLabel(durationSec: number | null): string | null {
  if (!durationSec || durationSec <= 0) {
    return null
  }
  const totalMinutes = Math.round(durationSec / 60)
  if (totalMinutes < 60) {
    return `${totalMinutes} min`
  }
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${String(minutes).padStart(2, "0")}m`
}

const isVideoType = (type: PublicPassportMedia["type"]) => type === "VIDEO" || type === "YOUTUBE"

/** Provider caption for an external podcast link (mirrors the legacy `providerLabel`). */
function podcastProviderLabel(url: string, durationSec: number | null): string {
  const u = url.toLowerCase()
  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    return "YouTube"
  }
  if (u.includes("apple.com") || u.includes("podcasts.apple")) {
    return "Apple Podcasts"
  }
  if (u.includes("spotify.com")) {
    return "Spotify"
  }
  return formatDurationLabel(durationSec) ?? "Podcast"
}

/**
 * Split the public passport media into the two highlight rails, gated by the resolved rich-media
 * decision (`profile.canRenderFullProfile` — tier OR admin OR owner, the SAME alias the projector
 * uses for cover/video/social). Returns EMPTY when not eligible so the section self-hides on free.
 */
export function buildProfileMedia({
  canRenderRichMedia,
  media,
}: {
  canRenderRichMedia: boolean
  media: PublicPassportMedia[]
}): ProfileMedia {
  if (!canRenderRichMedia) {
    return EMPTY_PROFILE_MEDIA
  }

  const techniqueVideos: ProfileMediaItem[] = []
  const podcasts: ProfileMediaItem[] = []

  for (const item of media) {
    const thumbnailUrl = item.thumbnailUrl ?? buildYoutubeThumbnail(item.url)
    const purpose = (item.purpose ?? "").toLowerCase()
    // Purpose is the curation axis (operator, SESSION_0525): `podcast` vs `technique-highlight`.
    // Podcast wins first (a podcast may be a YOUTUBE-typed link); the technique rail also absorbs
    // any other public video attachment so a plain uploaded technique clip still surfaces.
    const isPodcast = purpose.includes("podcast")
    const isTechnique = purpose.includes("technique") || isVideoType(item.type)

    if (isPodcast) {
      // Podcast → external provider link-out (Spotify-feel lane), opens in a new tab.
      podcasts.push({
        id: item.id,
        title: item.title ?? "Podcast Highlight",
        thumbnailUrl,
        href: item.url,
        external: true,
        subtitle: podcastProviderLabel(item.url, item.durationSec),
      })
    } else if (isTechnique) {
      // Technique reel → internal `/techniques/[slug]` route when the attachment links a technique
      // (TuffBuffs `route`), else fall back to the raw video URL (external new tab).
      const internal = item.techniqueSlug != null
      techniqueVideos.push({
        id: item.id,
        title: item.title ?? "Technique Video",
        thumbnailUrl,
        href: internal ? `/techniques/${item.techniqueSlug}` : item.url,
        external: !internal,
        subtitle: "Technique",
      })
    }
  }

  return { techniqueVideos, podcasts }
}
