import type { ComponentProps } from "react"
import { cva, cx, type VariantProps } from "~/lib/utils"

const backdropVariants = cva({
  base: "inset-x-0 z-40 pointer-events-none bg-background mask-b-from-0",

  variants: {
    isFixed: {
      true: "fixed top-(--header-inner-offset) h-8",
      false: "absolute top-full h-3",
    },
  },

  defaultVariants: {
    isFixed: false,
  },
})

type BackdropProps = ComponentProps<"div"> & VariantProps<typeof backdropVariants>

export const Backdrop = ({ className, isFixed, ...props }: BackdropProps) => {
  return <div className={cx(backdropVariants({ isFixed, className }))} {...props} />
}
