import { CheckIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"
import type { ComponentProps } from "react"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle } from "~/components/web/ui/intro"
import { cx } from "~/lib/utils"

export const ValueProp = async ({ className, ...props }: ComponentProps<"section">) => {
  const t = await getTranslations("pages.home.value")

  return (
    <section className={cx("flex flex-col gap-y-6 w-full", className)} {...props}>
      <Intro alignment="center">
        <IntroTitle size="h2">{t("title")}</IntroTitle>
      </Intro>

      <Stack size="lg" direction="column" className="max-w-lg mx-auto">
        {(["point1", "point2", "point3"] as const).map(key => (
          <Stack key={key} size="sm" direction="row" className="items-start">
            <CheckIcon className="size-5 text-primary shrink-0 mt-0.5" />
            <span className="text-secondary-foreground">{t(key)}</span>
          </Stack>
        ))}
      </Stack>
    </section>
  )
}
