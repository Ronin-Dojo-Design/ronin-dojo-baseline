"use client"

import { removeQueryParams } from "@primoui/utils"
import { ArrowUpRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { Button } from "~/components/common/button"
import { ExternalLink } from "~/components/web/external-link"
import { hasToolTierCap } from "~/lib/tools"
import type { ToolMany, ToolOne } from "~/server/web/tools/payloads"

type ToolButtonProps = ComponentProps<typeof Button> & {
  tool: ToolOne | ToolMany
}

export const ToolButton = ({ children, tool, ...props }: ToolButtonProps) => {
  const t = useTranslations()
  const isFeaturedListing = hasToolTierCap(tool, "featuredPlacement")
  const doFollow = hasToolTierCap(tool, "doFollow")

  return (
    <Button
      variant={isFeaturedListing ? "fancy" : "primary"}
      suffix={<ArrowUpRightIcon />}
      {...props}
      asChild
    >
      <ExternalLink
        href={tool.affiliateUrl || tool.websiteUrl}
        doFollow={doFollow}
        doTrack
        eventName="click_website"
        eventProps={{
          url: removeQueryParams(tool.websiteUrl),
          isFeatured: isFeaturedListing,
          tier: tool.tier,
          source: "button",
        }}
      >
        {children || t("common.visit", { name: tool.name })}
      </ExternalLink>
    </Button>
  )
}
