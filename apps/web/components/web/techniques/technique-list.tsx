"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { EmptyList } from "~/components/web/empty-list"
import { TechniqueCard, TechniqueCardSkeleton } from "~/components/web/techniques/technique-card"
import { Grid } from "~/components/web/ui/grid"
import type { TechniqueMany } from "~/server/web/techniques/payloads"

type TechniqueListProps = ComponentProps<typeof Grid> & {
  techniques: TechniqueMany[]
}

const TechniqueList = ({ children, techniques, ...props }: TechniqueListProps) => {
  const _t = useTranslations()

  return (
    <Grid {...props}>
      {techniques.map((technique, order) => (
        <TechniqueCard key={technique.slug} technique={technique} style={{ order }} />
      ))}

      {techniques.length ? children : <EmptyList>No techniques found</EmptyList>}
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
