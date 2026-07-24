"use client"

import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { H3 } from "~/components/common/heading"
import { Prose } from "~/components/common/prose"
import { Stack } from "~/components/common/stack"
import { Grid } from "~/components/web/ui/grid"
import { CurriculumJourneyItemCard } from "./curriculum-journey-item-card"
import type { CurriculumJourneyScene as CurriculumJourneySceneModel } from "./scene-model"

/**
 * One CurriculumJourney scene = one belt level (E1, SESSION_0546 grill F1/F2/F3;
 * G-022 Wave 3, SESSION_0649) — same primitive shape as the Lineage Journey
 * (`lineage-story/lineage-story-scene.tsx`): a full-width section per entry, motion
 * driven purely by `useScroll` + `useTransform` against the section's own scroll
 * position (no scroll-jacking, no springs on the scroll map, every animated
 * property transform/opacity only).
 *
 * Motion is decorative-only and never hides real content: the belt swatch settles in
 * from a still-visible 0.8 scale floor (`swatchScale`) and the chain-position marker
 * eases in from a still-visible 0.3 opacity floor (`markerOpacity`) as the scene
 * enters — neither ever clamps to 0. The heading, description, and representative
 * items always render at full opacity outside any scroll-driven style, so SSR/no-JS
 * ships them fully visible with zero layout shift (transform-only animation never
 * reflows). `CurriculumJourneyStaticScene` below is the reduced-motion twin — same
 * content, zero `motion/react` usage.
 */
export function CurriculumJourneyScene({
  scene,
  sceneNumber,
}: {
  scene: CurriculumJourneySceneModel
  sceneNumber: number
}) {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.35"],
  })

  const swatchScale = useTransform(scrollYProgress, [0, 0.35], [0.8, 1])
  const markerOpacity = useTransform(scrollYProgress, [0, 0.3], [0.3, 1])

  return (
    <section
      ref={sectionRef}
      data-testid="curriculum-journey-scene"
      className="relative flex w-full flex-col gap-5 border-b border-border px-6 py-12 last:border-b-0 sm:px-10 sm:py-16"
    >
      <motion.span
        aria-hidden
        style={{ opacity: markerOpacity }}
        className="text-xs font-semibold tracking-[0.4em] text-muted-foreground"
      >
        {String(sceneNumber).padStart(2, "0")}
      </motion.span>

      <Stack direction="row" size="md" className="items-center">
        <motion.div style={{ scale: swatchScale }}>
          <BeltSwatch colorHex={scene.beltColorHex} className="size-4" />
        </motion.div>
        <H3 className="text-2xl sm:text-3xl">{scene.beltName}</H3>
      </Stack>

      {scene.description && (
        <Prose className="prose-sm max-w-2xl">
          <p>{scene.description}</p>
        </Prose>
      )}

      {scene.items.length > 0 && (
        <Grid className="sm:grid-cols-2 lg:grid-cols-3">
          {scene.items.map(item => (
            <CurriculumJourneyItemCard key={item.id} item={item} />
          ))}
        </Grid>
      )}
    </section>
  )
}

/**
 * The reduced-motion / static twin — same content as `CurriculumJourneyScene`, zero
 * `motion/react` usage, zero scroll binding. `CurriculumJourney` (the sequence
 * component) swaps to this for `prefers-reduced-motion` viewers.
 */
export function CurriculumJourneyStaticScene({
  scene,
  sceneNumber,
}: {
  scene: CurriculumJourneySceneModel
  sceneNumber: number
}) {
  return (
    <section
      data-testid="curriculum-journey-static-scene"
      className="relative flex w-full flex-col gap-5 border-b border-border px-6 py-12 last:border-b-0 sm:px-10 sm:py-16"
    >
      <span aria-hidden className="text-xs font-semibold tracking-[0.4em] text-muted-foreground">
        {String(sceneNumber).padStart(2, "0")}
      </span>

      <Stack direction="row" size="md" className="items-center">
        <BeltSwatch colorHex={scene.beltColorHex} className="size-4" />
        <H3 className="text-2xl sm:text-3xl">{scene.beltName}</H3>
      </Stack>

      {scene.description && (
        <Prose className="prose-sm max-w-2xl">
          <p>{scene.description}</p>
        </Prose>
      )}

      {scene.items.length > 0 && (
        <Grid className="sm:grid-cols-2 lg:grid-cols-3">
          {scene.items.map(item => (
            <CurriculumJourneyItemCard key={item.id} item={item} />
          ))}
        </Grid>
      )}
    </section>
  )
}
