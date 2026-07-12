"use client"

import { PlusIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
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
import { MediaAttachmentManager } from "~/components/web/media/media-attachment-manager"
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

  const shouldAutoOpen = searchParams.get("create") === "technique"

  useEffect(() => {
    if (shouldAutoOpen) setOpen(true)
  }, [shouldAutoOpen])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) return
    setCreated(null)
    if (shouldAutoOpen) {
      const params = new URLSearchParams(searchParams)
      params.delete("create")
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }
    // The create action already revalidated `/app/profile`; refresh picks the new row up on close.
    router.refresh()
  }

  return (
    <>
      <Card
        hover
        render={
          <button type="button" aria-label="Add technique" onClick={() => handleOpenChange(true)} />
        }
        className="items-center justify-center gap-2 border-dashed py-6 text-muted-foreground"
      >
        <PlusIcon className="size-5" />
        <span className="text-sm font-medium">Add technique</span>
      </Card>

      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="md:max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>
              {created ? `Add videos — ${created.name}` : "Add a technique"}
            </DrawerTitle>
            <DrawerDescription>
              {created
                ? "Paste YouTube links, drag clips into teaching order, and mark clips Premium to gate them."
                : "Add a technique to your profile curriculum. You can attach videos in the next step."}
            </DrawerDescription>
          </DrawerHeader>

          {created ? (
            <Stack direction="column" size="lg" className="w-full">
              <MediaAttachmentManager
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
            />
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
