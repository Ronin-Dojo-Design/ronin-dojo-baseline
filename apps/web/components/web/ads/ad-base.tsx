"use client"

import { removeQueryParams, setQueryParams } from "@primoui/utils"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import type { AdType } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { ExternalLink } from "~/components/web/external-link"
import { siteConfig } from "~/config/site"
import { cx } from "~/lib/utils"
import type { AdOne } from "~/server/web/ads/payloads"

type AdLinkProps = ComponentProps<typeof ExternalLink> & {
  ad: AdOne
  type?: AdType
  source?: string
  params?: Record<string, string | number | boolean>
}

/**
 * Base link component for ads that handles all tracking and link logic
 */
const AdLink = ({ ad, type, source, params, ...props }: AdLinkProps) => {
  const url = removeQueryParams(ad.websiteUrl)
  const isInternal = url.startsWith(siteConfig.url)

  return (
    <ExternalLink
      href={setQueryParams(ad.websiteUrl, Object.assign(isInternal ? { type } : {}, params))}
      target={isInternal ? "_self" : "_blank"}
      eventName="click_ad"
      eventProps={{ url, type, source }}
      doFollow
      doTrack
      {...props}
    />
  )
}

/**
 * Consistent ad badge component
 */
const AdBadge = ({ className, ...props }: ComponentProps<typeof Badge>) => {
  const t = useTranslations("components.ads")

  return (
    <Badge variant="outline" className={cx("text-muted-foreground/75", className)} {...props}>
      {t("ad_label")}
    </Badge>
  )
}

export { AdLink, AdBadge }
