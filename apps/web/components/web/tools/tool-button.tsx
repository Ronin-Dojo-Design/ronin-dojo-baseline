"use client"

import { removeQueryParams } from "@primoui/utils"
import { ArrowUpRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { Button } from "~/components/common/button"
import { ExternalLink } from "~/components/web/external-link"
import type { ToolMany, ToolOne } from "~/server/web/tools/payloads"

type ToolButtonProps = ComponentProps<typeof Button> & {
  tool: ToolOne | ToolMany
}

export const ToolButton = ({ children, tool, ...props }: ToolButtonProps) => {
  const t = useTranslations()

  return (
    <Button
      variant={tool.isFeatured ? "fancy" : "primary"}
      suffix={<ArrowUpRightIcon />}
      {...props}
      asChild
    >
      <ExternalLink
        href={tool.affiliateUrl || tool.websiteUrl}
        doFollow={tool.isFeatured}
        doTrack
        eventName="click_website"
        eventProps={{
          url: removeQueryParams(tool.websiteUrl),
          isFeatured: tool.isFeatured,
          source: "button",
        }}
      >
        {children || t("common.visit", { name: tool.name })}
      </ExternalLink>
    </Button>
  )
}
