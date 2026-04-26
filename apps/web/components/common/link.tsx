"use client"

import NextLink from "next/link"
import { type ComponentProps, useState } from "react"

/**
 * This component is used to create a link that prefetches the page when the user hovers over it.
 * If you're ok with the default behavior of NextLink, just use "next/link" instead.
 */
export const Link = ({ prefetch: nextPrefetch, ...props }: ComponentProps<typeof NextLink>) => {
  const [prefetch, setPrefetch] = useState(nextPrefetch ?? false)

  return <NextLink prefetch={prefetch} onMouseEnter={() => setPrefetch(true)} {...props} />
}
