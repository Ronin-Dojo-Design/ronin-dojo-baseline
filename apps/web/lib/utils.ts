export type { VariantProps } from "tailwind-variants"
export { cn as cx, tv as cva } from "tailwind-variants"

export const popoverAnimationClasses = [
  "origin-(--transform-origin)",
  "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-98",
  "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-98",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:slide-out-to-top-2",
  "data-[side=left]:slide-in-from-right-2 data-[side=left]:slide-out-to-right-2",
  "data-[side=right]:slide-in-from-left-2 data-[side=right]:slide-out-to-left-2",
  "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:slide-out-to-bottom-2",
  // WL-P2-66: `motion-reduce:animate-none` was present but runtime-ineffective — Tailwind's
  // `data-open:animate-in` compiles to an attribute-selector rule (`[data-open]` + the class),
  // which has HIGHER specificity than the plain-class `motion-reduce:animate-none` rule, so under
  // `prefers-reduced-motion: reduce` the open state still won the cascade (computed
  // `animation-name` stayed "enter" — verified live on two independent Tooltip trigger
  // compositions before/after this fix, SESSION_0583). The trailing `!` is this repo's own
  // important-modifier idiom (already used in technique-graph.tsx's `border-transparent!`) —
  // it forces the reduced rule to win outright instead of relying on a specificity/order tie.
  "motion-reduce:animate-none!",
]
