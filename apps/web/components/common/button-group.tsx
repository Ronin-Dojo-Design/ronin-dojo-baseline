import type { ComponentProps } from "react"
import { cx } from "~/lib/utils"

type ButtonGroupProps = ComponentProps<"div">

const ButtonGroup = ({ className, ...props }: ButtonGroupProps) => {
  return (
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- <fieldset role="group"> introduces form-submission semantics; this is a visual button cluster, not a form group.
    <div
      role="group"
      className={cx(
        "flex items-center *:rounded-none *:focus-within:z-10 *:first-of-type:rounded-l-md *:last-of-type:rounded-r-md *:not-first-of-type:-ml-px",
        className,
      )}
      {...props}
    />
  )
}

export { ButtonGroup }
