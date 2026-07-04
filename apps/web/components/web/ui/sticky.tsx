import { useRender } from "@base-ui/react/use-render"
import { type ComponentProps, isValidElement } from "react"
import { cva, cx, type VariantProps } from "~/lib/utils"

/**
 * Sticky — sticky-positioning wrapper. Default stickiness engages at `md` and up (`md:sticky`), the
 * desktop-first behaviour every existing consumer relies on. Opt into mobile stickiness with `mobile`
 * (SESSION_0495 C2-4): the feed filter bar needs to stay pinned on the mobile-heavy `/posts` surface,
 * where `md:sticky` silently dropped it. `mobile` is additive — the six default (desktop-only) consumers
 * are byte-identical without it.
 */
const stickyVariants = cva({
  base: "md:sticky md:z-49",

  variants: {
    isOverlay: {
      true: "md:top-(--header-inner-offset) md:p-(--header-bottom) md:-m-(--header-bottom) md:bg-background",
      false: "md:top-(--header-outer-offset)",
    },
    /** Opt-in: also stick below the `md` breakpoint (feed filter bars). */
    mobile: {
      true: "max-md:sticky max-md:top-(--header-inner-offset) max-md:z-49 max-md:bg-background",
    },
  },

  defaultVariants: {
    isOverlay: false,
  },
})

type StickyProps = ComponentProps<"div"> & VariantProps<typeof stickyVariants>

export const Sticky = ({ className, isOverlay, mobile, children, ...props }: StickyProps) => {
  return useRender({
    render: isValidElement(children) ? (children as React.ReactElement) : undefined,
    defaultTagName: "div",
    props: isValidElement(children)
      ? { className: cx(stickyVariants({ isOverlay, mobile }), className), ...props }
      : { className: cx(stickyVariants({ isOverlay, mobile }), className), ...props, children },
  })
}
