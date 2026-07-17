"use client"

import { PlusIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/common/drawer"
import { Stack } from "~/components/common/stack"
import { MediaAttachmentPanel } from "~/components/web/media/media-attachment-manager"
import { TechniqueForm } from "~/app/(web)/dashboard/technique-form"

type Option = { id: string; name: string }
type BeltOption = Option & { shortName: string | null }

type AuthoredTechniqueCreateProps = {
  disciplines: Option[]
  belts: BeltOption[]
}

/**
 * "Add technique" plus-card + the bottom magnetic sheet (SESSION_0529 Slice 3B, ADR 0046 D5) —
 * the member-facing authored create flow on the `/app/profile` Techniques tab. Rendered ONLY when
 * the server resolved `canCreateTechniqueForUser` (the tab gates the mount); the action re-checks
 * the capability server-side regardless.
 *
 * Sheet = the `Drawer` L1 primitive (drawer.tsx IS the repo's bottom sheet: slides up from the
 * bottom edge with the swipe-to-dismiss "magnetic" drag handle on mobile, centered dialog ≥ md;
 * sheet.tsx is the SIDE panel — its own docblock routes transient content here). Two phases:
 *
 *   1. details — `TechniqueForm` in AUTHORED mode (`authored: true`, no organizationId; the server
 *      sets `authorPassportId` from the session Passport + derives the school from Affiliation).
 *   2. media — `MediaAttachmentManager` on the created technique target: YouTube URL-paste attach
 *      (the member video path — NO R2 upload row), per-clip Premium/Free toggle, dnd sequencing.
 *
 * Deep link: `/app/profile?tab=techniques&create=technique` (the MAB "Add a technique" action)
 * auto-opens the sheet; closing strips the param so a refresh doesn't re-open it.
 */
export function AuthoredTechniqueCreate({ disciplines, belts }: AuthoredTechniqueCreateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState<{ id: string; name: string; slug: string } | null>(null)
  // Details-phase dirty flag (WL-P2-52 P3 dirty-guard) — a ref, not state: it only gates the
  // dismiss handler, so re-rendering on every keystroke would be waste.
  const isFormDirtyRef = useRef(false)

  const shouldAutoOpen = searchParams.get("create") === "technique"

  useEffect(() => {
    if (shouldAutoOpen) setOpen(true)
  }, [shouldAutoOpen])

  const handleOpenChange = (next: boolean) => {
    // Dirty-guard (WL-P2-52 P3): dismissing the details phase with typed input silently discarded
    // it. Confirm before closing; the media phase (`created`) has nothing unsaved — its attach
    // actions persist as they run.
    if (!next && !created && isFormDirtyRef.current) {
      if (!window.confirm("Discard this technique? Your unsaved details will be lost.")) {
        return
      }
    }
    setOpen(next)
    if (next) return
    const didCreate = created !== null
    isFormDirtyRef.current = false
    setCreated(null)
    if (shouldAutoOpen) {
      const params = new URLSearchParams(searchParams)
      params.delete("create")
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }
    // The create action already revalidated `/app/profile`; refresh picks the new row up on close.
    // Cancel-close without a create refreshes nothing (WL-P2-52 P3 — the needless refresh).
    if (didCreate) {
      router.refresh()
    }
  }

  return (
    <>
      {/* WL-P2-52: named destination so staff (who also see the school-library "Add school
          technique" button on the table header) can tell the two create paths apart. */}
      <Card
        hover
        render={
          <button
            type="button"
            aria-label="Add a technique to your profile curriculum"
            onClick={() => handleOpenChange(true)}
          />
        }
        className="items-center justify-center gap-1.5 border-dashed py-6 text-muted-foreground"
      >
        <PlusIcon className="size-5" />
        <span className="text-sm font-medium">Add technique</span>
        <span className="text-xs">Publishes to your profile curriculum</span>
      </Card>

      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="md:max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>
              {created ? `Add videos — ${created.name}` : "Add a technique"}
            </DrawerTitle>
            {/* Step microcopy (WL-P2-52 P3) — tells the member up front this is a 2-step flow. */}
            <DrawerDescription>
              {created
                ? "Step 2 of 2 — Paste YouTube links, drag clips into teaching order, and mark clips Premium to gate them."
                : "Step 1 of 2 — Add a technique to your profile curriculum. You can attach videos in the next step."}
            </DrawerDescription>
          </DrawerHeader>

          {created ? (
            <Stack direction="column" size="lg" className="w-full">
              {/* Bare panel, not the Card-wrapped manager (WL-P2-52 P3) — the Drawer IS the
                  chrome; a Card inside it doubled the border/background frame. */}
              <MediaAttachmentPanel
                target={{ kind: "technique", id: created.id }}
                initialAttachments={[]}
                title="Clips"
                description="Videos that demonstrate this technique, in teaching order."
                allowUpload={false}
                allowUrlAttach
                sortable
              />
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </Stack>
          ) : (
            <TechniqueForm
              authored
              disciplines={disciplines}
              belts={belts}
              onSuccess={technique => setCreated(technique)}
              onCancel={() => handleOpenChange(false)}
              onDirtyChange={dirty => {
                isFormDirtyRef.current = dirty
              }}
            />
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
