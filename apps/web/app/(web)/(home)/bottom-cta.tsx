import { getTranslations } from "next-intl/server"
import type { ComponentProps } from "react"
import { CTAForm } from "~/components/web/cta-form"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { cx } from "~/lib/utils"

export const BottomCTA = async ({ className, ...props }: ComponentProps<"section">) => {
  const t = await getTranslations("pages.home.cta")

  return (
    <section className={cx("flex flex-col gap-y-6 w-full py-12", className)} {...props}>
      <Intro alignment="center">
        <IntroTitle size="h2">{t("title")}</IntroTitle>
        <IntroDescription>{t("description")}</IntroDescription>
      </Intro>

      <CTAForm
        size="lg"
        className="max-w-sm mx-auto items-center text-center"
        buttonProps={{ size: "md", variant: "fancy" }}
      />
    </section>
  )
}
