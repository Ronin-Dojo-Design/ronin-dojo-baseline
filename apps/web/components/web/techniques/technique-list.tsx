"use client"

import { motion, useReducedMotion } from "motion/react"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { EmptyList } from "~/components/common/empty-list"
import { TechniqueCard, TechniqueCardSkeleton } from "~/components/web/techniques/technique-card"
import { Grid } from "~/components/web/ui/grid"
import type { TechniqueMany } from "~/server/web/techniques/payloads"

type TechniqueListProps = ComponentProps<typeof Grid> & {
  techniques: TechniqueMany[]
}

// C3: on-load grid stagger (motion-system.md "List/grid item stagger on load" — `deliberate`
// 250ms, entrance `ease-out`, `stagger-tight`/`stagger-base`-range 50ms/item). Capped per the
// doc's own "cap item count, avoid layout thrash" rule — the default 24-item page never pushes
// the last card's start past half a second (same envelope-cap idiom as the lineage tree's
// `ENTRANCE_DELAY_CAP`, kept local here rather than a cross-feature import from `components/web/
// lineage/*`).
const GRID_ENTRANCE_DURATION = 0.25
const GRID_ENTRANCE_EASE = [0.16, 1, 0.3, 1] as const
const GRID_STAGGER_STEP = 0.05
const GRID_STAGGER_CAP = 0.5

const TechniqueList = ({ children, techniques, ...props }: TechniqueListProps) => {
  const t = useTranslations("techniques")
  // Always-reduced fallback: `?? true` treats the pre-hydration/undetectable `null` the same as an
  // explicit reduced-motion preference, so the grid never flashes a stagger before settling.
  const reduceMotion = useReducedMotion() ?? true

  return (
    <Grid {...props}>
      {techniques.map((technique, order) => (
        <motion.div
          key={technique.slug}
          style={{ order }}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: GRID_ENTRANCE_DURATION,
                  delay: Math.min(order * GRID_STAGGER_STEP, GRID_STAGGER_CAP),
                  ease: GRID_ENTRANCE_EASE,
                }
          }
        >
          <TechniqueCard technique={technique} />
        </motion.div>
      ))}

      {techniques.length ? children : <EmptyList>{t("empty")}</EmptyList>}
    </Grid>
  )
}

const TechniqueListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <Grid>
      {[...Array(count)].map((_, index) => (
        <TechniqueCardSkeleton key={index} />
      ))}
    </Grid>
  )
}

export { TechniqueList, type TechniqueListProps, TechniqueListSkeleton }
