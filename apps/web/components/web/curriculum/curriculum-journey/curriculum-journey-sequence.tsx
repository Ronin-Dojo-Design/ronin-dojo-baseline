"use client"

import { useReducedMotion } from "@mantine/hooks"
import { H2 } from "~/components/common/heading"
import type { BjjCurriculumLevelView } from "~/server/web/curriculum/queries"
import { CurriculumJourneyScene, CurriculumJourneyStaticScene } from "./curriculum-journey-scene"
import { deriveCurriculumJourneyScenes } from "./scene-model"

/**
 * The CurriculumJourney scroll sequence (E1, SESSION_0546 grill F1/F2/F3; G-022
 * Wave 3, SESSION_0649) — one scroll-driven scene per belt level, rendered ABOVE
 * `BjjCurriculumBrowser` on `/curriculum`. Purely additive: the browser below is
 * untouched and stays behaviorally identical.
 *
 * Enhance-not-replace, same contract as the Lineage Journey
 * (`lineage-story/lineage-story-sequence.tsx`): `useReducedMotion` resolves `false`
 * during SSR, so the pre-hydration document renders the motion scene tree
 * (`CurriculumJourneyScene`) — inert without JS (no scroll listener ever attaches),
 * so a no-JS visitor still gets fully visible, static stacked scene cards with zero
 * scroll binding. Only a hydrated client that reports the `prefers-reduced-motion`
 * preference swaps to `CurriculumJourneyStaticScene`, the zero-`motion/react` twin.
 *
 * `data-curriculum-journey` on the section root is the stable hook other surfaces
 * (and the runtime smoke) key off of — never rename it.
 */
export function CurriculumJourney({ levels }: { levels: BjjCurriculumLevelView[] }) {
  const reduceMotion = useReducedMotion()
  const scenes = deriveCurriculumJourneyScenes(levels)

  if (scenes.length === 0) return null

  const Scene = reduceMotion ? CurriculumJourneyStaticScene : CurriculumJourneyScene

  return (
    <section data-curriculum-journey className="flex flex-col gap-6">
      <H2 className="px-6 sm:px-10">The Belt Journey</H2>

      <div className="flex flex-col overflow-hidden ring-1 ring-border md:rounded-3xl">
        {scenes.map((scene, index) => (
          <Scene key={scene.id} scene={scene} sceneNumber={index + 1} />
        ))}
      </div>
    </section>
  )
}
