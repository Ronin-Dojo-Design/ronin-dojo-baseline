import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { EmptyList } from "~/components/common/empty-list"
import { MCard } from "~/components/web/m-card/m-card"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Brand } from "~/.generated/prisma/client"
import { mapRankGroupToCard } from "~/lib/m-card/map-rank"
import { getPageMetadata } from "~/lib/pages"
import { generateCollectionPage } from "~/lib/structured-data"
import { findDisciplineBySlug, findDisciplineSlugs } from "~/server/web/disciplines/queries"
import { getRankGroupsForDiscipline } from "~/server/web/disciplines/rank-group-queries"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const disciplines = await findDisciplineSlugs()
  return disciplines.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const discipline = await findDisciplineBySlug(Brand.BBL, slug)

  if (!discipline) return { title: "Discipline Not Found" }

  return await getPageMetadata({
    url: `/disciplines/${discipline.slug}/ranks`,
    metadata: {
      title: `${discipline.name} — Belts & Ranks`,
      description: `Belt-by-belt ranks and curriculum for ${discipline.name}.`,
    },
  })
}

/**
 * Belt-by-belt rank / curriculum page (PWCC-002 slice 2).
 *
 * Renders the discipline's belt ladder through the unified `m-card` (kind=rank) on the shared
 * `Grid` wrapper — belt swatch / `--rank-color` tint → rank name → member count → optional
 * curriculum checklist. Reuses the existing `findDisciplineBySlug` query plus the new
 * `getRankGroupsForDiscipline` projection (brand-scoped RankAward counts + published curriculum
 * techniques). Presentation-only: the card receives an already-public, already-aggregated DTO.
 */
export default async function DisciplineRanksPage({ params }: Props) {
  const { slug } = await params
  const discipline = await findDisciplineBySlug(Brand.BBL, slug)

  if (!discipline) notFound()

  const groups = await getRankGroupsForDiscipline({
    disciplineId: discipline.id,
    disciplineCode: discipline.code,
    brand: Brand.BBL,
  })

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/disciplines", title: "Disciplines" },
          { url: `/disciplines/${discipline.slug}`, title: discipline.name },
          { url: `/disciplines/${discipline.slug}/ranks`, title: "Belts & Ranks" },
        ]}
      />

      <Intro>
        <IntroTitle>{discipline.name} — Belts & Ranks</IntroTitle>
        <IntroDescription className="max-w-3xl">
          The belt ladder for {discipline.name}, with member counts and the curriculum introduced at
          each rank.
        </IntroDescription>
      </Intro>

      <Grid>
        {groups.length > 0 ? (
          groups.map(group => <MCard key={group.id} kind="rank" data={mapRankGroupToCard(group)} />)
        ) : (
          <EmptyList>No ranks defined for this discipline yet.</EmptyList>
        )}
      </Grid>

      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            generateCollectionPage(
              `/disciplines/${discipline.slug}/ranks`,
              `${discipline.name} — Belts & Ranks`,
              `Belt-by-belt ranks and curriculum for ${discipline.name}.`,
            ),
          ],
        }}
      />
    </>
  )
}
