"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { H4 } from "~/components/common/heading"
import { Prose } from "~/components/common/prose"
import { cx } from "~/lib/utils"

/**
 * Sheet (side-panel) primitive.
 *
 * Slides in from the left or right edge as a full-height overlay panel at all
 * viewport widths. Complements drawer.tsx (bottom-sheet/dialog) — use a Sheet
 * for navigation and contextual filter panels, a Drawer for transient content.
 *
 * Built on Base UI Dialog — same a11y, focus-trap, scroll-lock, and portal
 * behavior as drawer.tsx.
 *
 * Created: SESSION_0366 (slide-in nav lane, BBL-SOT-Spec D8 cutover-arm).
 */

type SheetSide = "left" | "right"

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cx(
        "fixed inset-0 z-50 bg-foreground/10 backdrop-blur-sm",
        "data-open:animate-in data-closed:animate-out",
        "data-open:fade-in-0 data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  )
}

type SheetContentProps = DialogPrimitive.Popup.Props & {
  side?: SheetSide
}

function SheetContent({ className, children, side = "right", ...props }: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />

      <DialogPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        aria-describedby={undefined}
        className={cx(
          "fixed inset-y-0 z-50 flex w-80 max-w-[85vw] flex-col gap-4 overflow-y-auto overscroll-contain border bg-background p-4 shadow-md",
          // Safe-area insets for notched devices
          "pt-[max(--spacing(4),env(safe-area-inset-top))] pb-[max(--spacing(4),env(safe-area-inset-bottom))]",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          // Animations — slide from the anchored edge
          "data-open:animate-in data-closed:animate-out",
          side === "left"
            ? "data-open:slide-in-from-left-full data-closed:slide-out-to-left-full"
            : "data-open:slide-in-from-right-full data-closed:slide-out-to-right-full",
          // Motion-system: snappy entrance via --ease-snappy (300ms). Exit stays at the
          // tailwindcss-animate default (150ms linear) so dismissal feel is unchanged.
          "data-open:[animation-duration:300ms]",
          "data-open:[animation-timing-function:var(--ease-snappy)]",
          // Reduced-motion: motion-system runbook §3 (MANDATORY) — render at resting
          // state with no enter/exit keyframes.
          "motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        {children}

        <DialogPrimitive.Close
          data-slot="sheet-close"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-ring disabled:pointer-events-none"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cx("flex flex-col gap-2 text-start", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cx("mt-auto flex flex-col gap-2 border-t pt-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      render={<H4 />}
      className={className}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      render={<Prose />}
      className={cx("text-sm/normal", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
