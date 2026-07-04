"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { ComboboxSelector } from "~/components/common/combobox-selector"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { Label } from "~/components/common/label"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { client } from "~/lib/orpc-client"
import type {
  ScenePersonOption,
  StorySceneBoardCard,
} from "~/server/admin/lineage/storyboard-queries"

/**
 * Duplicate-card dialog: copy one scene's copy/media fields onto ANOTHER person.
 * The picker is the same **passport-keyed** option source as the add flow
 * (WL-P1-8 — the target FK is `LineageStoryScene.passportId`). The copy lands
 * disabled so the source person's words are rewritten before publishing.
 */
export function SceneDuplicateDialog({
  source,
  personOptions,
  onClose,
  onSaved,
}: {
  source: StorySceneBoardCard
  personOptions: ScenePersonOption[]
  onClose: () => void
  onSaved: () => void
}) {
  const [targetPassportId, setTargetPassportId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const duplicate = async () => {
    if (!targetPassportId) {
      toast.error("Pick who the scene should be copied to.")
      return
    }
    setIsSaving(true)
    try {
      await client.lineage.storyboard.duplicate({
        sceneId: source.sceneId,
        targetPassportId,
      })
      toast.success("Scene duplicated — it starts disabled until you rewrite it.")
      onSaved()
    } catch (error) {
      // Surface the real oRPC message (CONFLICT/BAD_REQUEST carry user-safe copy) —
      // never a blanket toast over a real failure (SESSION_0497).
      toast.error(
        error instanceof Error && error.message ? error.message : "Could not duplicate the scene.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate scene — {source.displayName}</DialogTitle>
        </DialogHeader>

        <Stack direction="column" size="md" className="w-full">
          <div className="w-full">
            <Label htmlFor="duplicate-target" isRequired>
              Copy to
            </Label>
            <ComboboxSelector
              id="duplicate-target"
              options={personOptions}
              value={targetPassportId}
              onValueChange={value => setTargetPassportId(value || null)}
              placeholder="Pick a person on the lineage tree..."
              searchPlaceholder="Search people..."
              emptyMessage="No one found — people who already have a scene are hidden."
            />
          </div>

          <Note className="text-xs">
            The quote, attribution note, bio, and media URLs are copied. The new scene lands
            disabled and unordered — edit it before enabling so the copy fits the new person.
          </Note>
        </Stack>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" isPending={isSaving} onClick={duplicate}>
            Duplicate scene
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
