import { Slot } from "radix-ui"
import type { ComponentProps } from "react"
import { cva, cx, type VariantProps } from "~/lib/utils"

const stickyVariants = cva({
  base: "md:sticky md:z-49",

  variants: {
    isOverlay: {
      true: "md:top-(--header-inner-offset) md:p-(--header-bottom) md:-m-(--header-bottom) md:bg-background",
      false: "md:top-(--header-outer-offset)",
    },
  },

  defaultVariants: {
    isOverlay: false,
  },
})

type StickyProps = ComponentProps<"div"> & VariantProps<typeof stickyVariants>

export const Sticky = ({ className, isOverlay, ...props }: StickyProps) => {
  return <Slot.Root className={cx(stickyVariants({ isOverlay, className }))} {...props} />
}
