"use client"

import type { ReactNode } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/common/drawer"

/**
 * Shared chrome for the Join-the-Legacy form modal (SESSION_0445 #7). Both the
 * page's own landing drawer and the global nav-triggered modal render through this
 * so the width, title, and description live in ONE place and can't drift apart. The
 * form itself is passed as `children` by each host (the landing imports it directly;
 * the global modal lazy-loads it), so the lazy-loading split is preserved.
 */
export function JoinLegacyDrawer({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] w-full max-w-full overflow-x-hidden overflow-y-auto sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>Join the Legacy</DrawerTitle>
          <DrawerDescription>
            Share your martial arts history and, when signed in, claim your lineage profile.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 sm:px-6">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
