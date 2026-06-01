import { Card, CardHeader } from "~/components/common/card"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"

export default function PromotionEventLoading() {
  return (
    <>
      <Intro>
        <IntroTitle>
          <Skeleton className="h-10 w-72 max-w-full" />
        </IntroTitle>
        <IntroDescription>
          <Skeleton className="h-6 w-96 max-w-full" />
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <Stack direction="column" size="md" className="w-full">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} hover={false}>
                <CardHeader>
                  <Skeleton className="h-5 w-48" />
                </CardHeader>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </Stack>
        </Section.Content>

        <Section.Sidebar>
          <Card hover={false}>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
          </Card>
        </Section.Sidebar>
      </Section>

      <Section>
        <Section.Content className="md:col-span-3">
          <Grid>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/3] w-full" />
            ))}
          </Grid>
        </Section.Content>
      </Section>
    </>
  )
}
