import type { ComponentProps } from "react"
import { boxVariants } from "~/components/common/box"
import { inputVariants } from "~/components/common/input"
import { cx, type VariantProps } from "~/lib/utils"

export type TextAreaProps = Omit<ComponentProps<"textarea">, "size"> &
  VariantProps<typeof inputVariants>

export const TextArea = ({ className, size, ...props }: TextAreaProps) => {
  return (
    <textarea
      className={cx(
        boxVariants({ focus: true }),
        inputVariants({ size, className }),
        "leading-normal! resize-none field-sizing-content",
      )}
      {...props}
    />
  )
}
