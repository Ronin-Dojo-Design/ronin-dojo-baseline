import { Card, CardHeader } from "~/components/common/card"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"

export default function PromotionEventsIndexLoading() {
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
          <Grid>
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} hover={false} className="p-0">
                <Skeleton className="aspect-[4/3] w-full rounded-t-lg" />
                <CardHeader className="px-5">
                  <Stack size="sm">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-16" />
                  </Stack>
                  <Skeleton className="h-6 w-56 max-w-full" />
                </CardHeader>
              </Card>
            ))}
          </Grid>
        </Section.Content>

        <Section.Sidebar>
          <Card hover={false}>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
          </Card>
        </Section.Sidebar>
      </Section>
    </>
  )
}
