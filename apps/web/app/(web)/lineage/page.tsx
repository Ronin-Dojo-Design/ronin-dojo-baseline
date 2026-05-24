import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import {
  createGraph,
  generateCollectionPageWithItems,
} from "~/lib/structured-data"
import { findPublishedLineageTrees } from "~/server/web/lineage/queries"

const PAGE_URL = "/lineage"
const PAGE_TITLE = "Lineage Trees"
const PAGE_DESCRIPTION =
  "Explore martial arts lineage trees — who promoted whom, rank history, and the living legacy of instructors and students."

const CROSS_LINKS: Array<{ href: string; label: string; description: string }> = [
  {
    href: "/disciplines",
    label: "Disciplines",
    description: "Martial arts styles and rank systems",
  },
  {
    href: "/schools",
    label: "Schools",
    description: "Dojos and academies in the network",
  },
  {
    href: "/courses",
    label: "Courses",
    description: "Curriculum and certification programs",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    url: PAGE_URL,
    metadata: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
    },
  })
}

export default async function LineageIndexPage() {
  const brand = await getRequestBrand()
  const trees = await findPublishedLineageTrees({ brand })

  const itemListItems = trees.map(tree => ({
    name: tree.name,
    url: `/lineage/${tree.slug}`,
    description: tree.description,
  }))

  return (
    <>
      <StructuredData
        data={createGraph([
          generateCollectionPageWithItems(
            PAGE_URL,
            PAGE_TITLE,
            PAGE_DESCRIPTION,
            itemListItems,
          ),
        ])}
      />

      <Breadcrumbs items={[{ url: PAGE_URL, title: PAGE_TITLE }]} />

      <Intro>
        <IntroTitle>{PAGE_TITLE}</IntroTitle>
        <IntroDescription>{PAGE_DESCRIPTION}</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          {trees.length === 0 ? (
            <Note>No published lineage trees yet.</Note>
          ) : (
            <Grid>
              {trees.map(tree => (
                <Link key={tree.id} href={`/lineage/${tree.slug}`}>
                  <Card>
                    <CardHeader>
                      <Stack size="xs" direction="column">
                        <H5>{tree.name}</H5>
                        {tree.description && (
                          <CardDescription className="line-clamp-2">
                            {tree.description}
                          </CardDescription>
                        )}
                        <Stack size="xs">
                          {tree.discipline && (
                            <Badge variant="outline">{tree.discipline.name}</Badge>
                          )}
                          {tree.organization && (
                            <Badge variant="soft">{tree.organization.name}</Badge>
                          )}
                          <Badge variant="soft">
                            {tree.memberCount} {tree.memberCount === 1 ? "member" : "members"}
                          </Badge>
                        </Stack>
                      </Stack>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </Grid>
          )}
        </Section.Content>
      </Section>

      {/* Cross-links */}
      <Section>
        <Section.Content>
          <Grid>
            {CROSS_LINKS.map(link => (
              <Link key={link.href} href={link.href}>
                <Card>
                  <CardHeader>
                    <H5>{link.label}</H5>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </Grid>
        </Section.Content>
      </Section>
    </>
  )
}
