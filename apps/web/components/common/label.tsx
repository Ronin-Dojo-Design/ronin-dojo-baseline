import type { ComponentProps } from "react"
import { cva, cx, type VariantProps } from "~/lib/utils"

const labelVariants = cva({
  base: "self-start text-sm/snug font-medium text-foreground select-none [[for]]:cursor-pointer group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",

  variants: {
    isRequired: {
      true: "after:ml-0.5 after:text-red-600 after:content-['*']",
    },
  },
})

type LabelProps = ComponentProps<"label"> & VariantProps<typeof labelVariants>

function Label({ className, isRequired, htmlFor, ...props }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Label is always associated via htmlFor or wrapping at call site
    <label
      data-slot="label"
      htmlFor={htmlFor}
      className={cx(labelVariants({ isRequired, className }))}
      {...props}
    />
  )
}

export { Label }
