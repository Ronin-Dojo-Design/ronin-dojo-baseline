"use client"

import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { client } from "~/lib/orpc-client"
import type {
  ScenePersonOption,
  StorySceneBoardCard,
} from "~/server/admin/lineage/storyboard-queries"
import { SceneCard } from "./scene-card"
import { SceneDuplicateDialog } from "./scene-duplicate-dialog"
import { SceneEditorDialog, type SceneEditorState } from "./scene-editor-dialog"

/**
 * The storyboard board (Epic A1 — SESSION_0498 TASK_03): compact scene-card list
 * + plus-button add + per-card edit/duplicate/delete dialogs. Mutations go
 * through `client.lineage.storyboard.*` (can("lineage.manage")-gated); after any
 * successful save the board `router.refresh()`es so the server-fetched list
 * re-renders — the ancestry cache tags are revalidated server-side by the router.
 */
export function SceneStoryboard({
  scenes,
  personOptions,
}: {
  scenes: StorySceneBoardCard[]
  personOptions: ScenePersonOption[]
}) {
  const router = useRouter()
  const [editor, setEditor] = useState<SceneEditorState | null>(null)
  const [duplicating, setDuplicating] = useState<StorySceneBoardCard | null>(null)
  const [deleting, setDeleting] = useState<StorySceneBoardCard | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // `passportId` is 1:1 — people who already have a scene leave the add/duplicate
  // picker (the server still enforces the unique conflict as a clean CONFLICT).
  const availablePersonOptions = useMemo(() => {
    const used = new Set(scenes.map(scene => scene.passportId))
    return personOptions.filter(option => !used.has(option.id))
  }, [scenes, personOptions])

  const onSaved = () => {
    setEditor(null)
    setDuplicating(null)
    router.refresh()
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setIsDeleting(true)
    try {
      await client.lineage.storyboard.remove({ sceneId: deleting.sceneId })
      toast.success("Scene deleted.")
      setDeleting(null)
      router.refresh()
    } catch (error) {
      // Surface the real oRPC message — never a blanket toast over a real failure
      // (the SESSION_0497 bare-catch lesson).
      toast.error(
        error instanceof Error && error.message ? error.message : "Could not delete the scene.",
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Stack direction="column" className="gap-5">
      <Stack className="items-center justify-between gap-3" wrap>
        <Note>
          {scenes.length} scene{scenes.length === 1 ? "" : "s"}
        </Note>
        <Button size="sm" prefix={<PlusIcon />} onClick={() => setEditor({ mode: "create" })}>
          Add scene
        </Button>
      </Stack>

      {scenes.length === 0 ? (
        <Note>No scenes yet — add one for a person on the lineage tree.</Note>
      ) : (
        <div className="divide-y overflow-hidden rounded-lg border">
          {scenes.map(scene => (
            <SceneCard
              key={scene.sceneId}
              scene={scene}
              onEdit={() => setEditor({ mode: "edit", scene })}
              onDuplicate={() => setDuplicating(scene)}
              onDelete={() => setDeleting(scene)}
              onChanged={() => router.refresh()}
            />
          ))}
        </div>
      )}

      {editor && (
        <SceneEditorDialog
          state={editor}
          personOptions={availablePersonOptions}
          onClose={() => setEditor(null)}
          onSaved={onSaved}
        />
      )}

      {duplicating && (
        <SceneDuplicateDialog
          source={duplicating}
          personOptions={availablePersonOptions}
          onClose={() => setDuplicating(null)}
          onSaved={onSaved}
        />
      )}

      <Dialog open={deleting !== null} onOpenChange={open => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete scene</DialogTitle>
          </DialogHeader>
          <Note>
            Delete the story scene for {deleting?.displayName}? The person stays on the lineage tree
            — only their scene copy and media links are removed.
          </Note>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              isPending={isDeleting}
              onClick={confirmDelete}
            >
              Delete scene
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  )
}
