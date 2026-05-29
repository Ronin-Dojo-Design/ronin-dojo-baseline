"use client"

import type { ComponentProps } from "react"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { LogoSymbol } from "~/components/web/ui/logo-symbol"
import { useBrand } from "~/contexts/brand-context"
import { cx } from "~/lib/utils"

export const Logo = ({ className, ...props }: ComponentProps<typeof Stack>) => {
  const { name } = useBrand()

  return (
    <Stack
      size="sm"
      className={cx("group/logo", className)}
      wrap={false}
      render={<Link href="/" />}
      {...props}
    >
      <LogoSymbol />
      <span className="font-medium text-sm truncate">{name}</span>
    </Stack>
  )
}
