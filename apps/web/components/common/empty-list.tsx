import { useRender } from "@base-ui/react/use-render"
import { cx } from "~/lib/utils"

/**
 * EmptyList — the muted "nothing here" line above/inside a listing grid. Defaults to a `<p>` (its
 * historical shape, byte-identical for existing consumers). Pass `render` to swap the root element
 * (SESSION_0495 C2-12): the community empty state nests a flex `Button` CTA, which a `<p>` cannot
 * legally contain — `render={<div className="flex flex-col" />}` gives it a valid block root.
 */
type EmptyListProps = useRender.ComponentProps<"p">

export const EmptyList = ({ className, render, ...props }: EmptyListProps) => {
  return useRender({
    render,
    defaultTagName: "p",
    props: { className: cx("col-span-full text-muted-foreground", className), ...props },
  })
}
