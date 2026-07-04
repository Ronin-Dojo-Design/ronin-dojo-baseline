/**
 * Community post image-URL guard (SESSION_0493). `imageUrl` on a member post must point at OUR
 * media bucket: the card/detail render through `next/image`, whose `remotePatterns` allowlist
 * would 500 on a foreign host — and accepting arbitrary member URLs is a hotlink/abuse surface.
 *
 * Pure module (no "use server") so the origin comparison is directly unit-testable and is NOT
 * exposed as an invocable action endpoint — the `*-errors.ts` sibling rule for non-action exports.
 */

type MediaOriginConfig = {
  bucket: string | undefined
  region: string | undefined
  publicUrl: string | undefined
}

/** The isolated key prefix `uploadCommunityPostImage` writes under (`community-posts/<uuid>`). */
const COMMUNITY_IMAGE_KEY_PREFIX = "community-posts/"

/** Mirrors `uploadToS3Storage`'s base URL: the configured public URL, else the AWS bucket URL. */
const resolveMediaBase = ({ bucket, region, publicUrl }: MediaOriginConfig): URL | null => {
  const base =
    publicUrl ?? (bucket && region ? `https://${bucket}.s3.${region}.amazonaws.com` : null)
  if (!base) return null

  try {
    return new URL(base)
  } catch {
    return null
  }
}

/** Mirrors `uploadToS3Storage`'s public-URL construction exactly. */
export const expectedMediaOrigin = (config: MediaOriginConfig): string | null => {
  return resolveMediaBase(config)?.origin ?? null
}

/**
 * The full pathname prefix a valid community-post image sits under, derived from the SAME base URL
 * the uploader writes to (`${base}/community-posts/<uuid>`). Deriving it from the base — not
 * hard-coding a root-anchored `/community-posts/` — is what makes the guard correct for BOTH an
 * origin-only base (R2: `https://pub-abc.r2.dev` → `/community-posts/`) AND a path-style base
 * (MinIO local dev: `http://localhost:9000/ronindojo-dev` → `/ronindojo-dev/community-posts/`). The
 * old root-anchored constant silently rejected every valid image on local dev. (SESSION_0495 fix.)
 */
const prefixFromBase = (base: URL): string => {
  // Trim a trailing slash off the base pathname so we never emit `//community-posts/`.
  return `${base.pathname.replace(/\/$/, "")}/${COMMUNITY_IMAGE_KEY_PREFIX}`
}

export const expectedMediaPrefix = (config: MediaOriginConfig): string | null => {
  const base = resolveMediaBase(config)
  return base ? prefixFromBase(base) : null
}

/**
 * True only when `url` parses, shares the configured media bucket's origin, AND sits under the
 * base-relative `community-posts/` prefix — an image posted through the member form, not an arbitrary
 * bucket object. Scoping to the prefix (not just the origin) means a member-supplied `imageUrl`
 * cannot point at some OTHER object in our bucket (an admin media asset, another member's upload);
 * it must be a community-post object. (SESSION_0495 C1-11.)
 */
export const isAllowedCommunityImageUrl = (url: string, config: MediaOriginConfig): boolean => {
  const base = resolveMediaBase(config)
  if (!base) return false

  try {
    const parsed = new URL(url)
    return parsed.origin === base.origin && parsed.pathname.startsWith(prefixFromBase(base))
  } catch {
    return false
  }
}
