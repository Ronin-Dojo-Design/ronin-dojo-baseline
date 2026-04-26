import type { ComponentProps } from "react"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"

type DataTableLinkProps = ComponentProps<typeof Link> & {
  image?: string | null
  title: string
  isOverlay?: boolean
}

export const DataTableLink = ({
  children,
  className,
  image,
  title,
  isOverlay = true,
  ...props
}: DataTableLinkProps) => {
  return (
    <Stack size="sm" wrap={false}>
      <Link
        className={cx(
          "block truncate font-medium underline decoration-foreground/10 hover:decoration-foreground/35",
          !isOverlay && "relative z-10",
          className,
        )}
        {...props}
      >
        {isOverlay && <span className="absolute inset-0" />}

        {image && (
          <img
            src={image}
            alt=""
            width={32}
            height={32}
            loading="lazy"
            className="inline-block align-text-bottom mr-2 size-4 rounded"
          />
        )}

        {title}
      </Link>

      {children}
    </Stack>
  )
}
