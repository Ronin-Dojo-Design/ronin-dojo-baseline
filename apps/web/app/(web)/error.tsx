"use client"

import { RotateCwIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { siteConfig } from "~/config/site"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ({ error }: ErrorProps) {
  const t = useTranslations("pages.error")
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <Intro alignment="center">
      <IntroTitle>{t("title")}</IntroTitle>

      <IntroDescription className="max-w-xl">
        {t.rich("description", {
          link: chunks => <Link href={`mailto:${siteConfig.email}`}>{chunks}</Link>,
        })}
      </IntroDescription>

      <Stack className="mt-4">
        <Button variant="fancy" onClick={() => router.refresh()} prefix={<RotateCwIcon />}>
          {t("reload_button")}
        </Button>

        <Button variant="soft" asChild>
          <Link href="/">{t("home_button")}</Link>
        </Button>
      </Stack>
    </Intro>
  )
}
