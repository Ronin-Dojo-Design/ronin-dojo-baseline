import { headers } from "next/headers"
import type { Metadata } from "next"
import { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { Button } from "~/components/common/button"
import { getOrganizationsByBrand } from "~/server/web/organization/queries"

export const metadata: Metadata = {
  title: "Organizations",
  description: "Browse dojos, schools, clubs, and leagues.",
}

export default async function OrganizationsPage() {
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const orgs = await getOrganizationsByBrand(brand)

  return (
    <>
      <Intro>
        <IntroTitle>Organizations</IntroTitle>
        <IntroDescription>
          Browse dojos, schools, clubs, and leagues.
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <Stack className="justify-between w-full mb-4">
            <p className="text-sm text-muted-foreground">
              {orgs.length} organization{orgs.length !== 1 ? "s" : ""}
            </p>
            <Button size="sm" asChild>
              <Link href="/organizations/new">Create Organization</Link>
            </Button>
          </Stack>

          {orgs.length === 0 ? (
            <p className="text-secondary-foreground text-sm">
              No organizations yet. Be the first to create one!
            </p>
          ) : (
            <Grid>
              {orgs.map((org) => (
                <Card key={org.id} isRevealed>
                  <CardHeader>
                    <H4 as="h3" className="truncate">
                      <Link href={`/organizations/${org.slug}`}>
                        <span className="absolute inset-0 z-10" />
                        {org.name}
                      </Link>
                    </H4>
                  </CardHeader>

                  <CardDescription>
                    <Stack size="sm" className="flex-wrap">
                      <Badge variant="outline">{org.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {org._count.memberships} member{org._count.memberships !== 1 ? "s" : ""}
                      </span>
                    </Stack>
                  </CardDescription>

                  {org.disciplines.length > 0 && (
                    <Stack size="sm" className="flex-wrap">
                      {org.disciplines.map((od) => (
                        <Badge key={od.discipline.id} size="sm">
                          {od.discipline.name}
                        </Badge>
                      ))}
                    </Stack>
                  )}
                </Card>
              ))}
            </Grid>
          )}
        </Section.Content>
      </Section>
    </>
  )
}
