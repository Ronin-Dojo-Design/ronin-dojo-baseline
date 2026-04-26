import { getTranslations } from "next-intl/server"
import { type ComponentProps, Suspense } from "react"
import { CountBadge, CountBadgeSkeleton } from "~/app/(web)/(home)/count-badge"
import { CTAForm } from "~/components/web/cta-form"
import { CTAProof } from "~/components/web/cta-proof"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { cx } from "~/lib/utils"

export const Hero = async ({ className, ...props }: ComponentProps<"section">) => {
  const t = await getTranslations()

  return (
    <section className={cx("flex flex-col gap-y-6 w-full pb-6", className)} {...props}>
      <Intro alignment="center">
        <IntroTitle className="max-w-[16em] lg:text-5xl/[1.1]!">{t("brand.tagline")}</IntroTitle>
        <IntroDescription className="lg:mt-2">{t("brand.description")}</IntroDescription>

        <Suspense fallback={<CountBadgeSkeleton />}>
          <CountBadge />
        </Suspense>
      </Intro>

      <CTAForm
        size="lg"
        className="max-w-sm mx-auto items-center text-center"
        buttonProps={{ size: "md", variant: "fancy" }}
      >
        <CTAProof />
      </CTAForm>
    </section>
  )
}
