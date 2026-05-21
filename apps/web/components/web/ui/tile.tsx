import { useRender } from "@base-ui/react/use-render"
import type { ComponentProps, ReactNode } from "react"
import { H5, type Heading } from "~/components/common/heading"
import { slot } from "~/lib/slot"
import { cva, cx, type VariantProps } from "~/lib/utils"

const tileVariants = cva({
  base: "group/tile flex justify-between items-center gap-4 min-w-0 -my-2 py-2",
})

type TileProps = useRender.ComponentProps<"div"> & VariantProps<typeof tileVariants>

const Tile = ({ className, render, ...props }: TileProps) => {
  return useRender({
    render,
    defaultTagName: "div",
    props: { className: cx(tileVariants(), className), ...props },
  })
}

type TileTitleProps = Omit<ComponentProps<typeof Heading>, "prefix"> & {
  prefix?: ReactNode
}

const TileTitle = ({ prefix, className, children, ...props }: TileTitleProps) => {
  return (
    <H5 className={cx("flex min-w-0 items-center gap-2", className)} {...props}>
      {prefix &&
        slot(prefix, {
          className:
            "shrink-0 size-3.5 text-muted-foreground motion-safe:transition-colors group-hover/tile:text-foreground",
        })}
      <span className="truncate">{children}</span>
    </H5>
  )
}

const TileDivider = ({ className, ...props }: ComponentProps<"hr">) => {
  return <hr className={cx("min-w-2 flex-1 group-hover/tile:border-ring", className)} {...props} />
}

const TileCaption = ({ className, ...props }: ComponentProps<"span">) => {
  return <span className={cx("shrink-0 text-xs text-secondary-foreground", className)} {...props} />
}

export { Tile, TileCaption, TileDivider, TileTitle }
