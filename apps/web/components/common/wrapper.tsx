import type { ComponentProps } from "react"
import { cva, cx, type VariantProps } from "~/lib/utils"

const wrapperVariants = cva({
  base: "@container flex flex-col w-full",
  variants: {
    alignment: {
      start: "mr-auto",
      center: "mx-auto",
      end: "ml-auto",
    },
    size: {
      sm: "max-w-(--breakpoint-sm)",
      md: "max-w-(--breakpoint-md)",
      lg: "max-w-(--breakpoint-lg)",
    },
    gap: {
      xs: "gap-y-fluid-xs",
      sm: "gap-y-fluid-sm",
      md: "gap-y-fluid-md",
      lg: "gap-y-fluid-lg",
      xl: "gap-y-fluid-xl",
    },
  },
  defaultVariants: {
    alignment: "start",
    gap: "md",
  },
})

type WrapperProps = ComponentProps<"div"> & VariantProps<typeof wrapperVariants>

export const Wrapper = ({ className, alignment, size, gap, ...props }: WrapperProps) => {
  return <div className={cx(wrapperVariants({ alignment, size, gap, className }))} {...props} />
}
