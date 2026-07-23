import type { ComponentProps } from "react"
import { boxVariants } from "~/components/common/box"
import { cva, cx, type VariantProps } from "~/lib/utils"

const inputVariants = cva({
  base: "appearance-none min-h-0 w-full self-stretch bg-background text-foreground text-base/tight sm:text-[0.8125rem]/tight break-words transition duration-150 disabled:text-secondary-foreground/50",

  variants: {
    size: {
      sm: "px-2 py-1 font-normal rounded-md",
      md: "px-3 py-2 rounded-md",
      lg: "px-4 py-2.5 rounded-lg sm:text-sm",
    },
  },

  defaultVariants: {
    size: "md",
  },
})

type InputProps = Omit<ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> &
  VariantProps<typeof boxVariants>

const Input = ({
  className,
  size,
  hover = false,
  focus = true,
  focusWithin,
  ...props
}: InputProps) => {
  return (
    <input
      className={cx(boxVariants({ hover, focus, focusWithin }), inputVariants({ size, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
