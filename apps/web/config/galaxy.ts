/**
 * Black Belt Legacy Galaxy — feature flag (galaxy epic, slice 1).
 *
 * The cinematic lineage viewer (`/lineage/galaxy`) is built incrementally behind this
 * gate. The route 404s unless explicitly enabled, so the half-built prototype never
 * ships to prod by accident. Flip `NEXT_PUBLIC_GALAXY_ENABLED=1` in `.env` (or the
 * Vercel preview env) to explore it. See docs/product/black-belt-legacy/BBL-Galaxy-spec.md.
 */
export const galaxyConfig = {
  enabled: process.env.NEXT_PUBLIC_GALAXY_ENABLED === "1",
}
