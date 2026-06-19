"use client"

import Image from "next/image"
import type { ComponentProps } from "react"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { LogoSymbol } from "~/components/web/ui/logo-symbol"
import { useBrand } from "~/contexts/brand-context"
import { cx } from "~/lib/utils"

type LogoProps = ComponentProps<typeof Stack> & {
  /** Render the mark only (no wordmark) — used by minimal-chrome headers. */
  hideName?: boolean
  /** Tailwind height utility for the image mark (default `h-5`). */
  imageClassName?: string
}

export const Logo = ({ className, hideName, imageClassName, ...props }: LogoProps) => {
  const { name, logoSrc, logoUrl } = useBrand()
  // Prefer an operator-uploaded mark (BrandSettings.logoUrl) over the static
  // config asset; fall back to the wordmark glyph when neither is a real upload.
  const customSrc = logoUrl ?? (logoSrc && !logoSrc.endsWith("/logo.png") ? logoSrc : null)

  return (
    <Stack
      size="sm"
      className={cx("group/logo", className)}
      wrap={false}
      render={<Link href="/" aria-label={name} />}
      {...props}
    >
      {customSrc ? (
        <Image
          src={customSrc}
          alt={`${name} logo`}
          width={20}
          height={20}
          className={cx("h-5 w-auto shrink-0", imageClassName)}
          unoptimized
        />
      ) : (
        <LogoSymbol className={imageClassName} />
      )}
      {!hideName && <span className="font-medium text-sm truncate">{name}</span>}
    </Stack>
  )
}
