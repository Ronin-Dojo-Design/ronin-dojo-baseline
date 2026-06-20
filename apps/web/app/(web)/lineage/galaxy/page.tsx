import { notFound } from "next/navigation"
import { galaxyConfig } from "~/config/galaxy"
import { GalaxyRoute } from "~/components/web/lineage/galaxy/galaxy-route"

/**
 * Black Belt Legacy Galaxy — the cinematic public lineage viewer (galaxy epic, slice 1).
 *
 * Flag-gated prototype: 404s unless `NEXT_PUBLIC_GALAXY_ENABLED=1`. The viewer is mock-data
 * only for now (no private data); real public-safe DTO projection lands in a later slice.
 * See docs/product/black-belt-legacy/BBL-Galaxy-spec.md.
 */
export default function BblLineageGalaxyPage() {
  if (!galaxyConfig.enabled) {
    notFound()
  }

  return <GalaxyRoute />
}
