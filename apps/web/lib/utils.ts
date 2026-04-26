import { defineConfig } from "cva"
import { extendTailwindMerge } from "tailwind-merge"

const customTwMerge = extendTailwindMerge({})

export const { cva, cx, compose } = defineConfig({
  hooks: {
    onComplete: className => customTwMerge(className),
  },
})

export const popoverAnimationClasses = [
  "origin-(--radix-popper-transform-origin)",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
  "data-[state=open]:zoom-in-97 data-[state=closed]:zoom-out-97",
  "data-[side=bottom]:data-[state=open]:slide-in-from-top-2 data-[side=bottom]:data-[state=closed]:slide-out-to-top-2",
  "data-[side=left]:data-[state=open]:slide-in-from-right-2 data-[side=left]:data-[state=closed]:slide-out-to-right-2",
  "data-[side=right]:data-[state=open]:slide-in-from-left-2 data-[side=right]:data-[state=closed]:slide-out-to-left-2",
  "data-[side=top]:data-[state=open]:slide-in-from-bottom-2 data-[side=top]:data-[state=closed]:slide-out-to-bottom-2",
]

export type { VariantProps } from "cva"
