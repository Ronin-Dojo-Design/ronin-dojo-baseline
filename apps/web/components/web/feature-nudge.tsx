import { useTranslations } from "next-intl"
import { toast } from "sonner"
import type { Tool } from "~/.generated/prisma/client"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { siteConfig } from "~/config/site"

type FeatureNudgeProps = {
  tool: Tool
  t: string | number
}

export const FeatureNudge = ({ tool, t: toastId }: FeatureNudgeProps) => {
  const t = useTranslations("components.feature_nudge")

  return (
    <>
      <p className="text-sm text-secondary-foreground">
        {t("message", { name: tool.name, siteName: siteConfig.name })}
      </p>

      <Stack size="sm" className="w-full mt-4">
        <Button size="md" className="flex-1" onClick={() => toast.dismiss(toastId)} asChild>
          <Link href={`/submit/${tool.slug}`}>{t("feature_button", { toolName: tool.name })}</Link>
        </Button>

        <Button size="md" variant="secondary" onClick={() => toast.dismiss(toastId)}>
          {t("dismiss_button")}
        </Button>
      </Stack>
    </>
  )
}
