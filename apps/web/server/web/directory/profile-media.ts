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
  /**
   * Freemium (SESSION_0525): true → this is a PREMIUM technique reel the viewer isn't entitled to,
   * so the card renders a lock overlay + upgrade affordance instead of a plain play button. Always
   * false for podcasts and featured matches (public promo content) and for free technique reels.
   */
  locked: boolean
}

export type ProfileMedia = {
  featuredMatches: ProfileMediaItem[]
  techniqueVideos: ProfileMediaItem[]
  podcasts: ProfileMediaItem[]
}

// YouTube watch/short/embed/youtu.be → `hqdefault` thumbnail (mirrors the legacy
// `buildYoutubeThumbnail`), so a YOUTUBE attachment with no stored poster still shows one.
// Internal-only (SESSION_0526 D3) — the single consumer is `toMediaItem` below.
const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/

function buildYoutubeThumbnail(url: string | null | undefined): string | null {
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
 * Collapse the three near-identical rail pushes (SESSION_0526 C1) into ONE mapper. Every
 * `ProfileMediaItem` shares the id + title-fallback + derived thumbnail; only the destination
 * (`href` / `external`), the `subtitle`, and the freemium `locked` flag differ per rail. Output is
 * byte-identical to the three former inline objects.
 */
function toMediaItem(
  item: PublicPassportMedia,
  fields: {
    defaultTitle: string
    href: string
    external: boolean
    subtitle: string | null
    locked: boolean
  },
): ProfileMediaItem {
  return {
    id: item.id,
    title: item.title ?? fields.defaultTitle,
    // A YOUTUBE attachment with no stored poster derives one from the watch url (parity: legacy
    // `buildYoutubeThumbnail`); everything else uses its own thumbnail or the card kind placeholder.
    thumbnailUrl: item.thumbnailUrl ?? buildYoutubeThumbnail(item.url),
    href: fields.href,
    external: fields.external,
    subtitle: fields.subtitle,
    locked: fields.locked,
  }
}

/**
 * Split the public passport media into the three highlight rails. All rails are PUBLIC now
 * (SESSION_0525 freemium): every viewer sees featured matches, podcasts, AND technique reels.
 * `viewerEntitled` is the VIEWER's OWN entitlement (admin / viewer-owns-the-content / viewer's own
 * premium tier — resolved by `isTechniqueViewerEntitled`, NOT the profile owner's tier); it only
 * decides whether a PREMIUM technique reel renders LOCKED (`locked: true` → lock overlay + upgrade
 * CTA) so the viewer sees what they're missing. Free technique reels, podcasts, and matches never
 * lock.
 */
export function buildProfileMedia({
  viewerEntitled,
  media,
}: {
  viewerEntitled: boolean
  media: PublicPassportMedia[]
}): ProfileMedia {
  const featuredMatches: ProfileMediaItem[] = []
  const techniqueVideos: ProfileMediaItem[] = []
  const podcasts: ProfileMediaItem[] = []

  for (const item of media) {
    const purpose = (item.purpose ?? "").toLowerCase()
    // Purpose is the curation axis (operator, SESSION_0525): `podcast` vs `match` vs `technique-highlight`.
    // Podcast wins first (a podcast may be a YOUTUBE-typed link), then `match` (checked BEFORE the
    // technique fallback, since a match clip is also a YOUTUBE type); the technique rail then absorbs
    // any other public video attachment so a plain uploaded technique clip still surfaces.
    const isPodcast = purpose.includes("podcast")
    const isMatch = purpose.includes("match")
    const isTechnique = purpose.includes("technique") || isVideoType(item.type)

    if (isMatch) {
      // Featured match → PUBLIC marquee legend content (mission/funnel), shown to EVERY viewer;
      // external YouTube link-out, surfaced first. Never locked.
      featuredMatches.push(
        toMediaItem(item, {
          defaultTitle: "Featured Match",
          href: item.url,
          external: true,
          subtitle: "Match",
          locked: false,
        }),
      )
      continue
    }
    if (isPodcast) {
      // Podcasts are PUBLIC (operator, SESSION_0525) — promotional legend content, every viewer;
      // external provider link-out (Spotify-feel lane), opens in a new tab. Never locked.
      podcasts.push(
        toMediaItem(item, {
          defaultTitle: "Podcast Highlight",
          href: item.url,
          external: true,
          subtitle: podcastProviderLabel(item.url, item.durationSec),
          locked: false,
        }),
      )
      continue
    }
    if (isTechnique) {
      // Technique reel → PUBLIC/VISIBLE to every viewer (SESSION_0525 freemium). A PREMIUM reel the
      // viewer isn't entitled to renders LOCKED (lock overlay + upgrade CTA); free reels play. The
      // card links internally to `/techniques/[slug]` when the attachment references a technique
      // (TuffBuffs `route`), else falls back to the raw video URL (external new tab).
      const internal = item.techniqueSlug != null
      const locked = item.techniqueIsPremium === true && !viewerEntitled
      // A2 invariant (SESSION_0526): a LOCKED premium reel is only ever publishable through its
      // internal `/techniques/[slug]` gate. If it is locked but has no linked technique slug (a
      // mis-linked premium attachment), DROP it — never fall through to `href = item.url` and leak
      // the raw playable url as an external link to a viewer who isn't entitled to it.
      if (locked && !internal) {
        continue
      }
      techniqueVideos.push(
        toMediaItem(item, {
          defaultTitle: "Technique Video",
          href: internal ? `/techniques/${item.techniqueSlug}` : item.url,
          external: !internal,
          subtitle: "Technique",
          locked,
        }),
      )
    }
  }

  return { featuredMatches, techniqueVideos, podcasts }
}
