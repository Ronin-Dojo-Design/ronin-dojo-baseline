"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import { type ComponentProps, useCallback, useRef, useState } from "react"
import { H4 } from "~/components/common/heading"
import { Prose } from "~/components/common/prose"
import { cx } from "~/lib/utils"

/**
 * Drawer (bottom-sheet) primitive.
 *
 * Mobile (< md): slides up from bottom, max-h-[85vh], rounded top corners.
 * Desktop (≥ md): centered Dialog (same as dialog.tsx).
 *
 * Built on Base UI Dialog — same a11y, focus-trap, and portal behavior.
 *
 * Created: SESSION_0176 TASK_01. Migrated to Base UI: SESSION_0217.
 */

function Drawer({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="drawer-overlay"
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

function DrawerContent({ className, children, ...props }: DialogPrimitive.Popup.Props) {
  const touchStartY = useRef<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only track swipe on the drag handle area (first 48px) or when scrolled to top
    const el = contentRef.current
    if (el && el.scrollTop > 0) return
    touchStartY.current = e.touches[0]!.clientY
    setSwipeOffset(0)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const deltaY = e.touches[0]!.clientY - touchStartY.current
    // Only track downward swipes
    if (deltaY > 0) {
      setSwipeOffset(deltaY)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (swipeOffset > 80) {
      // Programmatically trigger the close button
      const closeBtn = contentRef.current?.querySelector('[data-slot="drawer-close"]')
      if (closeBtn instanceof HTMLElement) closeBtn.click()
    }
    touchStartY.current = null
    setSwipeOffset(0)
  }, [swipeOffset])

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
        <DialogPrimitive.Popup
          ref={contentRef}
          data-slot="drawer-content"
          aria-describedby={undefined}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={cx(
            // Shared
            "relative w-full border bg-background shadow-md overflow-y-auto overscroll-contain",
            "grid gap-4",
            // Mobile: bottom-sheet style
            "max-h-[85vh] rounded-t-xl p-4",
            // Desktop: centered dialog style
            "md:max-w-lg md:max-h-full md:rounded-lg md:p-6",
            // Animations — mobile slides up/down, desktop fades
            "data-open:animate-in data-closed:animate-out",
            "data-open:slide-in-from-bottom-full data-closed:slide-out-to-bottom-full",
            "md:data-open:slide-in-from-bottom-4 md:data-closed:slide-out-to-bottom-4",
            "data-open:fade-in-0 data-closed:fade-out-0",
            className,
          )}
          style={{
            transform: swipeOffset > 0 ? `translateY(${swipeOffset}px)` : undefined,
            transition: swipeOffset > 0 ? "none" : undefined,
          }}
          {...props}
        >
          {/* Drag handle (mobile visual cue + swipe affordance) */}
          <div className="mx-auto h-1.5 w-12 shrink-0 cursor-grab rounded-full bg-muted active:bg-muted-foreground/30 md:hidden" />

          {children}

          <DialogPrimitive.Close
            data-slot="drawer-close"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-ring disabled:pointer-events-none"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Popup>
      </div>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cx("flex flex-col gap-2 text-start", className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cx(
        "flex flex-col-reverse gap-2 -m-4 mt-0 px-4 py-3 border-t md:flex-row md:justify-between md:-m-6 md:mt-0 md:px-6 md:py-4 md:sticky md:-bottom-6 md:bg-background",
        className,
      )}
      {...props}
    />
  )
}

function DrawerTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      render={<H4 />}
      className={className}
      {...props}
    />
  )
}

function DrawerDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      render={<Prose />}
      className={cx("text-sm/normal", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
}
