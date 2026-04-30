import { PlusIcon } from "lucide-react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getProgramsByBrand } from "~/server/web/program/queries"

export const metadata: Metadata = {
  title: "Programs",
  description: "Browse active programs for the current brand.",
}

export default async function ProgramsPage() {
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const programs = await getProgramsByBrand(brand)

  return (
    <>
      <Intro>
        <IntroTitle>Programs</IntroTitle>
        <IntroDescription>
          Browse active training programs and the schools that host them.
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <Stack className="justify-between w-full mb-4">
            <p className="text-sm text-muted-foreground">
              {programs.length} program{programs.length !== 1 ? "s" : ""}
            </p>
            <Button size="sm" prefix={<PlusIcon />} asChild>
              <Link href="/programs/new">Create Program</Link>
            </Button>
          </Stack>

          {programs.length === 0 ? (
            <p className="text-secondary-foreground text-sm">No active programs yet.</p>
          ) : (
            <Grid>
              {programs.map(program => (
                <Card key={program.id} isRevealed>
                  <CardHeader>
                    <H4 as="h3" className="truncate">
                      <Link href={`/programs/${program.id}`}>
                        <span className="absolute inset-0 z-10" />
                        {program.name}
                      </Link>
                    </H4>
                  </CardHeader>

                  <CardDescription>
                    {program.description ?? `${program.organization.name} program`}
                  </CardDescription>

                  <Stack size="sm" className="flex-wrap">
                    <Badge variant="outline">{program.organization.name}</Badge>
                    {program.discipline && <Badge>{program.discipline.name}</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {program._count.programEnrollments} enrolled
                    </span>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}
        </Section.Content>
      </Section>
    </>
  )
}
