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

/** The dialog's field state — string-typed like the inputs; nullability applies at submit. */
type SceneDraft = {
  passportId: string | null
  quote: string
  quoteAttribution: string
  storyBio: string
  heroImageUrl: string
  heroVideoUrl: string
  posterUrl: string
  sceneOrder: string
  enabled: boolean
}

type PatchDraft = (partial: Partial<SceneDraft>) => void

/**
 * "" ↔ null bridges between input state and the nullable oRPC fields.
 * Kept LOCAL (SESSION_0499 fallow pass): the repo-wide idiom is the inline
 * `?.trim() || null` expression (belt/router, leads-pipeline/actions, …) — no
 * second NAMED consumer exists today, so a `lib/` promotion would be premature.
 */
const toNull = (value: string) => value.trim() || null

/** null ↔ "" — the read-side inverse of `toNull`. */
const orEmpty = (value: string | null) => value ?? ""

const emptyDraft: SceneDraft = {
  passportId: null,
  quote: "",
  quoteAttribution: "",
  storyBio: "",
  heroImageUrl: "",
  heroVideoUrl: "",
  posterUrl: "",
  sceneOrder: "",
  enabled: true,
}

const sceneOrderText = (order: number | null) => (order === null ? "" : String(order))

const sceneToDraft = (scene: StorySceneBoardCard | null): SceneDraft => {
  if (!scene) return emptyDraft
  return {
    passportId: scene.passportId,
    quote: orEmpty(scene.quote),
    quoteAttribution: orEmpty(scene.quoteAttribution),
    storyBio: orEmpty(scene.storyBio),
    heroImageUrl: orEmpty(scene.heroImageUrl),
    heroVideoUrl: orEmpty(scene.heroVideoUrl),
    posterUrl: orEmpty(scene.posterUrl),
    sceneOrder: sceneOrderText(scene.sceneOrder),
    enabled: scene.enabled,
  }
}

/** "" → null; a non-negative integer otherwise; undefined = invalid input. */
const parseSceneOrder = (text: string): number | null | undefined => {
  const trimmed = text.trim()
  if (trimmed === "") return null
  const value = Number(trimmed)
  return Number.isInteger(value) && value >= 0 ? value : undefined
}

/** Pre-submit validation — user-facing copy, or null when the draft is submittable. */
const validateDraft = (scene: StorySceneBoardCard | null, draft: SceneDraft): string | null => {
  if (parseSceneOrder(draft.sceneOrder) === undefined) return "Scene order must be a whole number."
  if (!scene && !draft.passportId) return "Pick a person for the scene first."
  return null
}

/** Draft → the shared create/update oRPC field payload (validate first — `validateDraft`). */
const draftToFields = (draft: SceneDraft) => ({
  quote: toNull(draft.quote),
  quoteAttribution: toNull(draft.quoteAttribution),
  storyBio: toNull(draft.storyBio),
  heroImageUrl: toNull(draft.heroImageUrl),
  heroVideoUrl: toNull(draft.heroVideoUrl),
  posterUrl: toNull(draft.posterUrl),
  sceneOrder: parseSceneOrder(draft.sceneOrder) ?? null,
  enabled: draft.enabled,
})

/**
 * Create-vs-update dispatch. The passportId throw is unreachable after
 * `validateDraft` — it narrows the type and would surface through the save
 * toast if it ever fired.
 */
const submitScene = (scene: StorySceneBoardCard | null, draft: SceneDraft) => {
  const fields = draftToFields(draft)
  if (scene) return client.lineage.storyboard.update({ sceneId: scene.sceneId, ...fields })
  if (!draft.passportId) throw new Error("Pick a person for the scene first.")
  return client.lineage.storyboard.create({ passportId: draft.passportId, ...fields })
}

/**
 * Surface the real oRPC message (BAD_REQUEST / CONFLICT / FORBIDDEN carry
 * user-safe copy) — a bare catch masked a live P2003 in SESSION_0497.
 */
const saveErrorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : "Could not save the scene."

/** Mode copy — the title and the submit label follow create-vs-edit together. */
const modeCopy = (scene: StorySceneBoardCard | null) =>
  scene
    ? { title: `Edit scene — ${scene.displayName}`, submit: "Save scene" }
    : { title: "Add scene", submit: "Add scene" }

/** Owns the save round-trip: validate → create-vs-update → toast + `onSaved`. */
function useSaveScene(scene: StorySceneBoardCard | null, draft: SceneDraft, onSaved: () => void) {
  const [isSaving, setIsSaving] = useState(false)

  const save = async () => {
    const problem = validateDraft(scene, draft)
    if (problem) {
      toast.error(problem)
      return
    }
    setIsSaving(true)
    try {
      await submitScene(scene, draft)
      toast.success("Scene saved.")
      onSaved()
    } catch (error) {
      toast.error(saveErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return { save, isSaving }
}

/**
 * Create/edit dialog for one scene (the belt-edit-form oRPC-form idiom: local
 * state + common form primitives + `client.*` + real-error toast). Decomposed
 * (SESSION_0499 fallow pass): draft state + module-level save helpers + field
 * sections — behavior and DOM unchanged.
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
  const [draft, setDraft] = useState<SceneDraft>(() => sceneToDraft(scene))
  const patch: PatchDraft = partial => setDraft(prev => ({ ...prev, ...partial }))
  const { save, isSaving } = useSaveScene(scene, draft, onSaved)
  const copy = modeCopy(scene)

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
        </DialogHeader>

        <Stack direction="column" size="md" className="w-full">
          {!scene && (
            <ScenePersonField
              personOptions={personOptions}
              value={draft.passportId}
              onChange={passportId => patch({ passportId })}
            />
          )}

          <SceneStoryFields draft={draft} patch={patch} disabled={isSaving} />
          <ScenePublishFields draft={draft} patch={patch} />
        </Stack>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" isPending={isSaving} onClick={save}>
            {copy.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Create-mode person picker — passport-keyed options (WL-P1-8). */
function ScenePersonField({
  personOptions,
  value,
  onChange,
}: {
  personOptions: ScenePersonOption[]
  value: string | null
  onChange: (passportId: string | null) => void
}) {
  return (
    <div className="w-full">
      <Label htmlFor="scene-person" isRequired>
        Person
      </Label>
      <ComboboxSelector
        id="scene-person"
        options={personOptions}
        value={value}
        onValueChange={selected => onChange(selected || null)}
        placeholder="Pick a person on the lineage tree..."
        searchPlaceholder="Search people..."
        emptyMessage="No one found — people who already have a scene are hidden."
      />
    </div>
  )
}

/** Quote / attribution / bio / hero image — the scene's story content. */
function SceneStoryFields({
  draft,
  patch,
  disabled,
}: {
  draft: SceneDraft
  patch: PatchDraft
  disabled: boolean
}) {
  return (
    <>
      <div className="w-full">
        <Label htmlFor="scene-quote">Quote</Label>
        <TextArea
          id="scene-quote"
          className="min-h-20"
          placeholder="The line shown large in this person's scene..."
          value={draft.quote}
          onChange={event => patch({ quote: event.target.value })}
        />
      </div>

      <div className="w-full">
        <Label htmlFor="scene-attribution">Attribution / source note</Label>
        <Input
          id="scene-attribution"
          value={draft.quoteAttribution}
          onChange={event => patch({ quoteAttribution: event.target.value })}
          placeholder="Where the quote comes from..."
        />
        <Note>
          Provenance for curators — the public scene credits the quote to the person's name.
        </Note>
      </div>

      <div className="w-full">
        <Label htmlFor="scene-bio">Story bio</Label>
        <TextArea
          id="scene-bio"
          className="min-h-24"
          placeholder="The short narrative paragraph for the scene..."
          value={draft.storyBio}
          onChange={event => patch({ storyBio: event.target.value })}
        />
      </div>

      <div className="w-full">
        {/* No htmlFor: labeling the trigger BUTTON would shadow its visible
            "Upload image"/"Replace" text as the accessible name (WCAG 2.5.3). */}
        <Label>Hero image</Label>
        <ImageFieldUploader
          value={draft.heroImageUrl || null}
          onChange={url => patch({ heroImageUrl: url ?? "" })}
          uploadPathPrefix="lineage/story-scenes"
          presets={["tall", "wide", "square"]}
          defaultPreset="tall"
          cropTitle="Crop the scene hero"
          disabled={disabled}
        />
        <Note>
          Tall (4:5) matches the mobile hero frame; the desktop 16:10 frame crops from the same
          image.
        </Note>
      </div>
    </>
  )
}

/** Order / enabled switch / advanced video URLs — the scene's publish controls. */
function ScenePublishFields({ draft, patch }: { draft: SceneDraft; patch: PatchDraft }) {
  return (
    <>
      <Stack size="md" className="w-full items-end" wrap>
        <div>
          <Label htmlFor="scene-order">Scene order</Label>
          <Input
            id="scene-order"
            type="number"
            min={0}
            className="w-28"
            value={draft.sceneOrder}
            onChange={event => patch({ sceneOrder: event.target.value })}
            placeholder="—"
          />
        </div>
        <Stack size="sm" className="items-center pb-2">
          <Switch
            id="scene-enabled"
            checked={draft.enabled}
            onCheckedChange={enabled => patch({ enabled })}
            aria-label="Scene enabled"
          />
          <Label htmlFor="scene-enabled" className="mb-0">
            {draft.enabled ? "Enabled" : "Disabled"}
          </Label>
        </Stack>
      </Stack>

      <Note className="w-full">Advanced — video upload is coming; paste URLs for now.</Note>

      <div className="w-full">
        <Label htmlFor="scene-hero-video">Hero video URL</Label>
        <Input
          id="scene-hero-video"
          type="url"
          value={draft.heroVideoUrl}
          onChange={event => patch({ heroVideoUrl: event.target.value })}
          placeholder="https://... (plays in the scene once A5 lands)"
        />
      </div>

      <div className="w-full">
        <Label htmlFor="scene-poster">Poster URL</Label>
        <Input
          id="scene-poster"
          type="url"
          value={draft.posterUrl}
          onChange={event => patch({ posterUrl: event.target.value })}
          placeholder="https://... (video poster / still frame)"
        />
      </div>
    </>
  )
}
