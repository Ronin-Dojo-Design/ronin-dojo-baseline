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

/** Mirrors `uploadToS3Storage`'s public-URL construction exactly. */
export const expectedMediaOrigin = ({
  bucket,
  region,
  publicUrl,
}: MediaOriginConfig): string | null => {
  const base =
    publicUrl ?? (bucket && region ? `https://${bucket}.s3.${region}.amazonaws.com` : null)
  if (!base) return null

  try {
    return new URL(base).origin
  } catch {
    return null
  }
}

/** True only when `url` parses and shares the configured media bucket's origin. */
export const isAllowedCommunityImageUrl = (url: string, config: MediaOriginConfig): boolean => {
  const expected = expectedMediaOrigin(config)
  if (!expected) return false

  try {
    return new URL(url).origin === expected
  } catch {
    return false
  }
}
