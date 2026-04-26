import type { ComponentProps } from "react"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { LogoSymbol } from "~/components/web/ui/logo-symbol"
import { siteConfig } from "~/config/site"
import { cx } from "~/lib/utils"

export const Logo = ({ className, ...props }: ComponentProps<typeof Stack>) => {
  return (
    <Stack size="sm" className={cx("group/logo", className)} wrap={false} asChild {...props}>
      <Link href="/">
        <LogoSymbol />
        <span className="font-medium text-sm truncate">{siteConfig.name}</span>
      </Link>
    </Stack>
  )
}
