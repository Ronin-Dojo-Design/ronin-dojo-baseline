"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { EmptyList } from "~/components/web/empty-list"
import { SchoolCard, SchoolCardSkeleton } from "~/components/web/schools/school-card"
import { Grid } from "~/components/web/ui/grid"

type SchoolCardData = {
  slug: string
  name: string
  description: string | null
  city: string | null
  region: string | null
  type: string | null
  phoneE164: string | null
  email: string | null
  websiteUrl: string | null
  disciplines?: { discipline: { name: string } }[]
}

type SchoolListProps = ComponentProps<typeof Grid> & {
  schools: SchoolCardData[]
}

const SchoolList = ({ children, schools, ...props }: SchoolListProps) => {
  const t = useTranslations("schools")

  return (
    <Grid {...props}>
      {schools.map((school, order) => (
        <SchoolCard key={school.slug} school={school} style={{ order }} />
      ))}

      {schools.length ? children : <EmptyList>{t("empty")}</EmptyList>}
    </Grid>
  )
}

const SchoolListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <Grid>
      {[...Array(count)].map((_, index) => (
        <SchoolCardSkeleton key={index} />
      ))}
    </Grid>
  )
}

export { SchoolList, type SchoolListProps, SchoolListSkeleton }
