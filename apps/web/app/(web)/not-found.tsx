import { ArrowLeftIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"

export default async function NotFound() {
  const t = await getTranslations("pages.not_found")

  return (
    <Intro alignment="center">
      <IntroTitle>{t("title")}</IntroTitle>
      <IntroDescription className="max-w-lg">{t("description")}</IntroDescription>

      <Button className="mt-4" prefix={<ArrowLeftIcon />} asChild>
        <Link href="/">{t("home_button")}</Link>
      </Button>
    </Intro>
  )
}
