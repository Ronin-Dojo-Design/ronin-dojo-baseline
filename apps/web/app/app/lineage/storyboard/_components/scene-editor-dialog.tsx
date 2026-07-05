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
import { Hint } from "~/components/common/hint"
import { Input } from "~/components/common/input"
import { Label } from "~/components/common/label"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"
import { TextArea } from "~/components/common/textarea"
import { ImageFieldUploader } from "~/components/web/uploader/image-field-uploader"
import { client } from "~/lib/orpc-client"
import type {
  ScenePersonOption,
  StorySceneBoardCard,
} from "~/server/admin/lineage/storyboard-queries"

export type SceneEditorState = { mode: "create" } | { mode: "edit"; scene: StorySceneBoardCard }

/** "" ↔ null bridges between input state and the nullable oRPC fields. */
const toNull = (value: string) => value.trim() || null

/**
 * Create/edit dialog for one scene (the belt-edit-form oRPC-form idiom: local
 * state + common form primitives + `client.*` + real-error toast).
 *
 * Create mode carries the person picker — **passport-keyed** options
 * (`getScenePersonOptions`; WL-P1-8: the FK is `LineageStoryScene.passportId`,
 * so a node-keyed source must never feed this picker).
 */
export function SceneEditorDialog({
  state,
  personOptions,
  onClose,
  onSaved,
}: {
  state: SceneEditorState
  personOptions: ScenePersonOption[]
  onClose: () => void
  onSaved: () => void
}) {
  const scene = state.mode === "edit" ? state.scene : null

  const [passportId, setPassportId] = useState<string | null>(scene?.passportId ?? null)
  const [quote, setQuote] = useState(scene?.quote ?? "")
  const [quoteAttribution, setQuoteAttribution] = useState(scene?.quoteAttribution ?? "")
  const [storyBio, setStoryBio] = useState(scene?.storyBio ?? "")
  const [heroImageUrl, setHeroImageUrl] = useState(scene?.heroImageUrl ?? "")
  const [heroVideoUrl, setHeroVideoUrl] = useState(scene?.heroVideoUrl ?? "")
  const [posterUrl, setPosterUrl] = useState(scene?.posterUrl ?? "")
  const [sceneOrder, setSceneOrder] = useState(
    scene?.sceneOrder === null || scene === null ? "" : String(scene.sceneOrder),
  )
  const [enabled, setEnabled] = useState(scene?.enabled ?? true)
  const [isSaving, setIsSaving] = useState(false)

  const save = async () => {
    const orderText = sceneOrder.trim()
    const parsedOrder = orderText === "" ? null : Number(orderText)
    if (parsedOrder !== null && (!Number.isInteger(parsedOrder) || parsedOrder < 0)) {
      toast.error("Scene order must be a whole number.")
      return
    }

    const fields = {
      quote: toNull(quote),
      quoteAttribution: toNull(quoteAttribution),
      storyBio: toNull(storyBio),
      heroImageUrl: toNull(heroImageUrl),
      heroVideoUrl: toNull(heroVideoUrl),
      posterUrl: toNull(posterUrl),
      sceneOrder: parsedOrder,
      enabled,
    }

    setIsSaving(true)
    try {
      if (scene) {
        await client.lineage.storyboard.update({ sceneId: scene.sceneId, ...fields })
      } else {
        if (!passportId) {
          toast.error("Pick a person for the scene first.")
          return
        }
        await client.lineage.storyboard.create({ passportId, ...fields })
      }
      toast.success("Scene saved.")
      onSaved()
    } catch (error) {
      // Surface the real oRPC message (BAD_REQUEST / CONFLICT / FORBIDDEN carry
      // user-safe copy) — a bare catch masked a live P2003 in SESSION_0497.
      toast.error(
        error instanceof Error && error.message ? error.message : "Could not save the scene.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{scene ? `Edit scene — ${scene.displayName}` : "Add scene"}</DialogTitle>
        </DialogHeader>

        <Stack direction="column" size="md" className="w-full">
          {!scene && (
            <div className="w-full">
              <Label htmlFor="scene-person" isRequired>
                Person
              </Label>
              <ComboboxSelector
                id="scene-person"
                options={personOptions}
                value={passportId}
                onValueChange={value => setPassportId(value || null)}
                placeholder="Pick a person on the lineage tree..."
                searchPlaceholder="Search people..."
                emptyMessage="No one found — people who already have a scene are hidden."
              />
            </div>
          )}

          <div className="w-full">
            <Label htmlFor="scene-quote">Quote</Label>
            <TextArea
              id="scene-quote"
              className="min-h-20"
              placeholder="The line shown large in this person's scene..."
              value={quote}
              onChange={event => setQuote(event.target.value)}
            />
          </div>

          <div className="w-full">
            <Label htmlFor="scene-attribution">Attribution / source note</Label>
            <Input
              id="scene-attribution"
              value={quoteAttribution}
              onChange={event => setQuoteAttribution(event.target.value)}
              placeholder="Where the quote comes from..."
            />
            <Hint>
              Provenance for curators — the public scene credits the quote to the person's name.
            </Hint>
          </div>

          <div className="w-full">
            <Label htmlFor="scene-bio">Story bio</Label>
            <TextArea
              id="scene-bio"
              className="min-h-24"
              placeholder="The short narrative paragraph for the scene..."
              value={storyBio}
              onChange={event => setStoryBio(event.target.value)}
            />
          </div>

          <div className="w-full">
            {/* No htmlFor: labeling the trigger BUTTON would shadow its visible
                "Upload image"/"Replace" text as the accessible name (WCAG 2.5.3). */}
            <Label>Hero image</Label>
            <ImageFieldUploader
              value={heroImageUrl || null}
              onChange={url => setHeroImageUrl(url ?? "")}
              uploadPathPrefix="lineage/story-scenes"
              presets={["vertical", "horizontal", "square"]}
              defaultPreset="vertical"
              cropTitle="Crop the scene hero"
              disabled={isSaving}
            />
            <Hint>
              Tall (4:5) matches the mobile hero frame; the desktop 16:10 frame crops from the same
              image.
            </Hint>
          </div>

          <Note className="w-full">
            Advanced — video lands with A5 (the uploader arrives then; URLs are accepted meanwhile).
          </Note>

          <div className="w-full">
            <Label htmlFor="scene-hero-video">Hero video URL</Label>
            <Input
              id="scene-hero-video"
              type="url"
              value={heroVideoUrl}
              onChange={event => setHeroVideoUrl(event.target.value)}
              placeholder="https://... (plays in the scene once A5 lands)"
            />
          </div>

          <div className="w-full">
            <Label htmlFor="scene-poster">Poster URL</Label>
            <Input
              id="scene-poster"
              type="url"
              value={posterUrl}
              onChange={event => setPosterUrl(event.target.value)}
              placeholder="https://... (video poster / still frame)"
            />
          </div>

          <Stack size="md" className="w-full items-end" wrap>
            <div>
              <Label htmlFor="scene-order">Scene order</Label>
              <Input
                id="scene-order"
                type="number"
                min={0}
                className="w-28"
                value={sceneOrder}
                onChange={event => setSceneOrder(event.target.value)}
                placeholder="—"
              />
            </div>
            <Stack size="sm" className="items-center pb-2">
              <Switch
                id="scene-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
                aria-label="Scene enabled"
              />
              <Label htmlFor="scene-enabled" className="mb-0">
                {enabled ? "Enabled" : "Disabled"}
              </Label>
            </Stack>
          </Stack>
        </Stack>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" isPending={isSaving} onClick={save}>
            {scene ? "Save scene" : "Add scene"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
