export type { ClassValue, VariantProps } from "tailwind-variants"
export { cn as cx, tv as cva } from "tailwind-variants"

export const popoverAnimationClasses = [
  "origin-(--transform-origin)",
  "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-98",
  "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-98",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:slide-out-to-top-2",
  "data-[side=left]:slide-in-from-right-2 data-[side=left]:slide-out-to-right-2",
  "data-[side=right]:slide-in-from-left-2 data-[side=right]:slide-out-to-left-2",
  "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:slide-out-to-bottom-2",
]
