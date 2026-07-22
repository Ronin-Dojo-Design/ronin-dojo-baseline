"use client"

import { Suspense, useEffect, useState } from "react"
import { LeadForm } from "~/app/app/leads/_components/lead-form"
import { PersonForm } from "~/app/app/users/_components/person-form"
import { Drawer, DrawerContent, DrawerTitle } from "~/components/common/drawer"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import type { QuickActionTriggerId } from "./app-quick-actions"
import { loadAddLeadOptions, loadAddPersonOptions } from "./quick-action-forms"

type QuickActionDrawersProps = {
  open: QuickActionTriggerId | null
  onOpenChange: (next: boolean) => void
}

function FormSkeleton() {
  return (
    <Stack direction="column" size="sm" className="w-full">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-2/3" />
    </Stack>
  )
}

/**
 * The app-local drawer host for the `trigger` quick actions (add-member,
 * add-lead). The kernel never imports a Drawer — this composition lives in the
 * app, mounting the EXISTING `PersonForm` / `LeadForm` (no duplicate form) inside
 * the `Drawer` bottom-sheet primitive. Option data is loaded lazily on first open
 * (see `quick-action-forms.ts`) so the heavy add-person transaction never runs on
 * the landing's critical path. Both forms `router.push` away on success, so the
 * drawer unmounts with the navigation.
 *
 * The visible heading is the form's own `<H3>`; `DrawerTitle` is `sr-only` (Base UI
 * Dialog labelling) to avoid a duplicate heading.
 */
export function QuickActionDrawers({ open, onOpenChange }: QuickActionDrawersProps) {
  // Cache each option promise after first open — reopening never re-fetches.
  const [personOptions, setPersonOptions] = useState<ReturnType<
    typeof loadAddPersonOptions
  > | null>(null)
  const [leadOptions, setLeadOptions] = useState<ReturnType<typeof loadAddLeadOptions> | null>(null)

  useEffect(() => {
    // `??` short-circuits: the loader fires only when the cache is still empty.
    if (open === "add-user") setPersonOptions(prev => prev ?? loadAddPersonOptions())
    if (open === "add-lead") setLeadOptions(prev => prev ?? loadAddLeadOptions())
  }, [open])

  return (
    <>
      <Drawer open={open === "add-user"} onOpenChange={onOpenChange}>
        <DrawerContent className="md:max-w-2xl">
          <DrawerTitle className="sr-only">Add member</DrawerTitle>
          {personOptions ? (
            <Suspense fallback={<FormSkeleton />}>
              <PersonForm title="Add member" optionsPromise={personOptions} />
            </Suspense>
          ) : (
            <FormSkeleton />
          )}
        </DrawerContent>
      </Drawer>

      <Drawer open={open === "add-lead"} onOpenChange={onOpenChange}>
        <DrawerContent className="md:max-w-2xl">
          <DrawerTitle className="sr-only">Add lead</DrawerTitle>
          {leadOptions ? (
            <Suspense fallback={<FormSkeleton />}>
              <LeadForm title="Create lead" organizationsPromise={leadOptions} />
            </Suspense>
          ) : (
            <FormSkeleton />
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
