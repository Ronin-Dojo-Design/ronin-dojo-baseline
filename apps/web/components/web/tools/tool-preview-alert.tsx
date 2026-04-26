import { CalendarPlusIcon } from "lucide-react"
import { getFormatter, getTranslations } from "next-intl/server"
import type { ComponentProps } from "react"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { isToolPublished } from "~/lib/tools"
import type { ToolOne } from "~/server/web/tools/payloads"

type ToolPreviewAlertProps = ComponentProps<typeof Card> & {
  tool: ToolOne
}

export const ToolPreviewAlert = async ({ tool, ...props }: ToolPreviewAlertProps) => {
  const t = await getTranslations("tools.preview_alert")
  const format = await getFormatter()

  if (isToolPublished(tool)) {
    return null
  }

  return (
    <Card hover={false} focus={false} isHighlighted {...props}>
      <H5>
        {t("title")}{" "}
        {tool.publishedAt &&
          t("scheduled", {
            toolName: tool.name,
            date: format.dateTime(tool.publishedAt, { dateStyle: "long" }),
          })}
      </H5>

      <Note className="-mt-2">{t("description", { toolName: tool.name })}</Note>

      <Button variant="fancy" prefix={<CalendarPlusIcon />} asChild>
        <Link href={`/submit/${tool.slug}`}>{t("publish_button")}</Link>
      </Button>
    </Card>
  )
}
