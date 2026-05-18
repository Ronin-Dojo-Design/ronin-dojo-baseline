import { AwardIcon, SwordsIcon, UsersIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"
import type { ComponentProps } from "react"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { Heading } from "~/components/common/heading"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroTitle } from "~/components/web/ui/intro"
import { cx } from "~/lib/utils"

const features = [
  { key: "programs" as const, icon: AwardIcon },
  { key: "tournaments" as const, icon: SwordsIcon },
  { key: "community" as const, icon: UsersIcon },
]

export const FeatureCards = async ({ className, ...props }: ComponentProps<"section">) => {
  const t = await getTranslations("pages.home.features")

  return (
    <section className={cx("flex flex-col gap-y-6 w-full", className)} {...props}>
      <Intro alignment="center">
        <IntroTitle size="h2">{t("title")}</IntroTitle>
      </Intro>

      <Grid>
        {features.map(({ key, icon: Icon }) => (
          <Card key={key} className="items-center text-center">
            <CardHeader>
              <Icon className="size-8 text-primary mx-auto" />
              <Heading size="h4" as="h3">
                {t(`${key}.title`)}
              </Heading>
              <CardDescription>{t(`${key}.description`)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </Grid>
    </section>
  )
}
