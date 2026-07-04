"use client"

import { useReducedMotion } from "@mantine/hooks"
import { Fragment } from "react"
import { Badge } from "~/components/common/badge"
import { LineageAncestryTimeline } from "~/components/web/lineage/lineage-ancestry-timeline"
import type { LineageAncestryEntry } from "~/server/web/lineage/ancestry"
import { LineageStoryNodeScene, LineageStoryScene } from "./lineage-story-scene"
import { scenePaletteAt } from "./scene-model"

/**
 * The Lineage Journey scroll sequence (Epic A2-v1, SESSION_0498) — maps the
 * ancestry walk `[founder … member]` onto scene sections with the three-variant
 * palette cycle (black → red → white → repeat, indexed by chain position).
 *
 * Enhance-not-replace: this only mounts when the chain carries ≥ 1 enabled story
 * scene (`chainHasStoryScenes`, decided server-side in `AncestrySection`), and
 * **reduced-motion viewers get today's stagger timeline unchanged** — the entire
 * scroll mode is the enhancement, `LineageAncestryTimeline` is the baseline.
 * SSR/no-JS renders the scene content fully visible (see `lineage-story-scene.tsx`);
 * `useReducedMotion` resolves false during SSR, so the pre-hydration document is
 * the scene sequence, swapped for the timeline only on a client with the
 * `prefers-reduced-motion` preference.
 *
 * Ordering: the walk order is THE ordering authority (founder first, owner last);
 * `story.sceneOrder` is storyboard metadata and intentionally not consumed here
 * (Giddy A0 review P3-2).
 *
 * `showDisabledMarkers` (SESSION_0498 TASK_04): the `/app/beta/lineage-journey`
 * preview renders chains INCLUDING `enabled: false` scenes and needs curators to
 * see which are live — a marker chip overlays every disabled scene. Public
 * callers never pass it (their entries carry no disabled scenes anyway, by the
 * `ancestryStorySceneWhere` default).
 */
export function LineageStorySequence({
  entries,
  showDisabledMarkers = false,
}: {
  entries: LineageAncestryEntry[]
  showDisabledMarkers?: boolean
}) {
  const reduceMotion = useReducedMotion()

  if (entries.length < 2) return null

  if (reduceMotion) {
    return <LineageAncestryTimeline entries={entries} />
  }

  return (
    <div
      data-testid="lineage-story-sequence"
      // Full-bleed to the viewport edges below md (-mx-6 cancels the Container's
      // px-6); inside the md+ content grid the strip keeps the column width with
      // rounded cinema edges. overflow-hidden pairs with the per-scene clipping.
      // md ring: a hairline boundary so the black opener separates from dark
      // desktop chrome (Desi A2 P2).
      className="-mx-6 flex flex-col overflow-hidden md:mx-0 md:rounded-3xl md:ring-1 md:ring-white/10"
    >
      {entries.map((entry, index) => {
        const palette = scenePaletteAt(index)
        const isOwner = index === entries.length - 1

        const scene = entry.story ? (
          <LineageStoryScene
            entry={entry}
            palette={palette}
            sceneNumber={index + 1}
            isOwner={isOwner}
          />
        ) : (
          <LineageStoryNodeScene entry={entry} palette={palette} isOwner={isOwner} />
        )

        // Keyed Fragment keeps the public DOM byte-identical to pre-TASK_04
        // (sections stay direct flex children — no wrapper div off the preview).
        if (!showDisabledMarkers || !entry.story || entry.story.enabled) {
          return <Fragment key={entry.nodeId}>{scene}</Fragment>
        }

        // Beta-preview marker: this scene is DISABLED in GA — solid caution chip
        // so it reads over all three palettes (admin-only chrome, never public).
        return (
          <div key={entry.nodeId} className="relative" data-testid="lineage-story-disabled-marker">
            {scene}
            {/* Deliberately NOT variant="caution": its dark: overrides wash the
                chip out on the dark /app chrome. Solid amber + near-black reads
                over all three scene palettes in either theme. */}
            <Badge size="sm" className="absolute top-4 left-4 z-10 bg-yellow-400 text-neutral-950">
              Disabled — beta preview only
            </Badge>
          </div>
        )
      })}
    </div>
  )
}
