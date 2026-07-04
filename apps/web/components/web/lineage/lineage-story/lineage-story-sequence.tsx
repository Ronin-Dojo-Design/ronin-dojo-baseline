"use client"

import { useReducedMotion } from "@mantine/hooks"
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
 */
export function LineageStorySequence({ entries }: { entries: LineageAncestryEntry[] }) {
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

        return entry.story ? (
          <LineageStoryScene
            key={entry.nodeId}
            entry={entry}
            palette={palette}
            sceneNumber={index + 1}
            isOwner={isOwner}
          />
        ) : (
          <LineageStoryNodeScene
            key={entry.nodeId}
            entry={entry}
            palette={palette}
            isOwner={isOwner}
          />
        )
      })}
    </div>
  )
}
