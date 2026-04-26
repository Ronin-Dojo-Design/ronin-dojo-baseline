"use client"

import { isExternalUrl, setQueryParams } from "@primoui/utils"
import type { ComponentProps } from "react"
import { siteConfig } from "~/config/site"
import { useTrackEvent } from "~/hooks/use-track-event"

type ExternalLinkProps = ComponentProps<"a"> & {
  doTrack?: boolean
  doFollow?: boolean
  eventName?: string
  eventProps?: Record<string, unknown>
}

export const ExternalLink = ({
  href,
  target = "_blank",
  doTrack = false,
  doFollow = false,
  eventName,
  eventProps,
  ...props
}: ExternalLinkProps) => {
  const trackEvent = useTrackEvent()
  const addTracking = doTrack && !href?.includes("utm_source")
  const finalHref = addTracking ? setQueryParams(href!, { utm_source: siteConfig.domain }) : href
  const isExternal = isExternalUrl(finalHref)

  return (
    <a
      href={finalHref!}
      target={target}
      rel={`noopener${doFollow ? "" : " nofollow"}`}
      onClick={() => isExternal && eventName && trackEvent(eventName, eventProps)}
      {...props}
    />
  )
}
