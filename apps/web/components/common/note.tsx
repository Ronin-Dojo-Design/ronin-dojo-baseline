import type { ComponentProps, ComponentType, ElementType } from "react"
import { cx } from "~/lib/utils"

type NoteProps = ComponentProps<"p"> & {
  as?: ElementType
}

export const Note = ({ className, as, ...props }: NoteProps) => {
  // Render through a p-props component type. @react-three/fiber (galaxy feature) globally
  // augments JSX.IntrinsicElements with three.js elements that have no `className`, which
  // collapses a bare `ElementType`'s className to `never`. Note only ever renders text
  // elements, so asserting p-like props keeps this call type-safe.
  const Comp = (as || "p") as ComponentType<ComponentProps<"p">>

  return <Comp className={cx("text-sm text-muted-foreground", className)} {...props} />
}
