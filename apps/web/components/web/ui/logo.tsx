"use client"

import Image from "next/image"
import type { ComponentProps } from "react"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { LogoSymbol } from "~/components/web/ui/logo-symbol"
import { useBrand } from "~/contexts/brand-context"
import { cx } from "~/lib/utils"

export const Logo = ({ className, ...props }: ComponentProps<typeof Stack>) => {
  const { name, logoSrc } = useBrand()
  const hasCustomLogo = logoSrc && !logoSrc.endsWith("/logo.png")

  return (
    <Stack
      size="sm"
      className={cx("group/logo", className)}
      wrap={false}
      render={<Link href="/" />}
      {...props}
    >
      {hasCustomLogo ? (
        <Image
          src={logoSrc}
          alt={`${name} logo`}
          width={20}
          height={20}
          className="h-5 w-auto shrink-0"
          unoptimized
        />
      ) : (
        <LogoSymbol />
      )}
      <span className="font-medium text-sm truncate">{name}</span>
    </Stack>
  )
}
