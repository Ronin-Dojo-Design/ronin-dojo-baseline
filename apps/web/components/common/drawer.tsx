"use client"

import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { H4 } from "~/components/common/heading"
import { Prose } from "~/components/common/prose"
import { cx } from "~/lib/utils"

/**
 * Drawer (bottom-sheet) primitive.
 *
 * Mobile (< md): slides up from bottom, max-h-[85vh], rounded top corners.
 * Desktop (≥ md): centered Dialog (same as dialog.tsx).
 *
 * Built on Radix Dialog — same a11y, focus-trap, and portal behavior.
 *
 * Created: SESSION_0176 TASK_01.
 */

const Drawer = DialogPrimitive.Root
const DrawerTrigger = DialogPrimitive.Trigger
const DrawerPortal = DialogPrimitive.Portal
const DrawerClose = DialogPrimitive.Close

const DrawerOverlay = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay
    className={cx(
      "fixed inset-0 z-50 bg-foreground/10 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      className,
    )}
    {...props}
  />
)

const DrawerContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) => {
  return (
    <DrawerPortal>
      <DrawerOverlay />

      {/* Mobile: bottom-sheet. Desktop: centered dialog. */}
      <div
        className={cx(
          "fixed inset-0 z-50 flex",
          // Mobile: anchor to bottom
          "items-end justify-center",
          // Desktop: center vertically
          "md:items-start md:justify-center md:px-4 md:py-6 md:pt-[12.5vh] md:[@media(min-height:1000px)]:pt-[25vh]",
        )}
      >
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cx(
            // Shared
            "relative w-full border bg-background shadow-md overflow-y-auto overscroll-contain",
            "grid gap-4",
            // Mobile: bottom-sheet style
            "max-h-[85vh] rounded-t-xl p-4",
            // Desktop: centered dialog style
            "md:max-w-lg md:max-h-full md:rounded-lg md:p-6",
            // Animations — mobile slides up/down, desktop fades
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full",
            "md:data-[state=open]:slide-in-from-bottom-4 md:data-[state=closed]:slide-out-to-bottom-4",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            className,
          )}
          {...props}
        >
          {/* Drag handle (mobile visual cue) */}
          <div className="mx-auto h-1.5 w-12 shrink-0 rounded-full bg-muted md:hidden" />

          {children}

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-ring disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </div>
    </DrawerPortal>
  )
}

const DrawerHeader = ({ className, ...props }: ComponentProps<"div">) => {
  return <div className={cx("flex flex-col gap-2 text-start", className)} {...props} />
}

const DrawerFooter = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cx(
        "flex flex-col-reverse gap-2 -m-4 mt-0 px-4 py-3 border-t md:flex-row md:justify-between md:-m-6 md:mt-0 md:px-6 md:py-4 md:sticky md:-bottom-6 md:bg-background",
        className,
      )}
      {...props}
    />
  )
}

const DrawerTitle = ({ children, ...props }: ComponentProps<typeof DialogPrimitive.Title>) => {
  return (
    <DialogPrimitive.Title asChild {...props}>
      <H4>{children}</H4>
    </DialogPrimitive.Title>
  )
}

const DrawerDescription = ({
  children,
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) => {
  return (
    <DialogPrimitive.Description asChild className={cx("text-sm/normal", className)} {...props}>
      <Prose>{children}</Prose>
    </DialogPrimitive.Description>
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
