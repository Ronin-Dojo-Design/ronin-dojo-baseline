"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  CreatableCombobox,
  type CreatableOption,
  type CreatableValue,
  EMPTY_CREATABLE_VALUE,
} from "~/components/common/creatable-combobox"
import { DialogFooter, DialogHeader, DialogTitle } from "~/components/common/dialog"
import { Input } from "~/components/common/input"
import { Label } from "~/components/common/label"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { client } from "~/lib/orpc-client"
import type { BeltCardOutput, MilestoneMediaPurpose } from "~/server/belt/schemas"
import { BeltMediaGallery } from "./belt-media-gallery"
import {
  beltDateLabel,
  type BeltMediaItem,
  type BeltRankViewModel,
  isCardFactEditable,
  isWhiteBelt,
} from "./belt-view-model"
import { CountrySelect } from "./country-select"

/**
 * The belt-journey EDIT SURFACE (Slice 4 — Petey Plan 0477 §Slice 4), opened from
 * an unlocked `BeltEditCard`. Two field groups:
 *
 * - FACT fields (date, promoter, school, country) — editable ONLY for a self-added
 *   backfill (`card.isFactEditable`, B1); a promotion-minted / imported award is
 *   authority-owned → rendered read-only with a "verified" note. Promoter + school
 *   are the resolve-or-create `CreatableCombobox`
 *   (a registered pick stores its ref id; freetext stores text → the oRPC turns a
 *   freetext school into a school-lead). Wired to `client.belt.updateRankAwardFact`.
 * - MILESTONE fields (story + the 4 media galleries) — ALWAYS editable (member-owned).
 *   Story wires to `client.belt.upsertBeltMilestone`; media to the galleries.
 *
 * White-belt special-case: the date label asks "when did you start training?" and
 * the promoter/location fields are hidden (structurally detected via `minSortOrder`).
 *
 * Presentation-only view-model in; mutations via the oRPC client. `onSaved`
 * re-hands the fresh `BeltCardOutput` up so the grid can refresh.
 */

const MEDIA_SECTIONS: { purpose: MilestoneMediaPurpose; title: string }[] = [
  { purpose: "belt", title: "Belt photos" },
  { purpose: "instructor", title: "Instructor photos" },
  { purpose: "certificate", title: "Certificate photos" },
  { purpose: "competition", title: "Competition photos" },
]

/** ISO-date value for a native date input (`yyyy-mm-dd`), or "" when unset. */
function toDateInputValue(date: Date | null): string {
  if (!date) return ""
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

export function BeltEditForm({
  vm,
  minSortOrder,
  promoterOptions,
  schoolOptions,
  onUpload,
  onSaved,
  onClose,
}: {
  vm: BeltRankViewModel
  /** The ladder's minimum sortOrder — identifies the white belt structurally. */
  minSortOrder: number
  /** Registered promoter options (id = Passport id) for the creatable combobox. */
  promoterOptions: CreatableOption[]
  /** Registered school options (id = Organization id) for the creatable combobox. */
  schoolOptions: CreatableOption[]
  /** Per-file R2 upload against the `rankMilestone` target (mints a mediaId); omit → read-only galleries. */
  onUpload?: (file: File, rankMilestoneId: string) => Promise<{ mediaId: string } | null>
  /** Fired with the fresh card after any successful save. */
  onSaved?: (card: BeltCardOutput) => void
  onClose?: () => void
}) {
  const card = vm.card
  const white = isWhiteBelt(vm.rank.sortOrder, minSortOrder)
  const factEditable = isCardFactEditable(card)

  const [story, setStory] = useState(card?.milestone?.story ?? "")
  const [awardedAt, setAwardedAt] = useState(toDateInputValue(card?.awardedAt ?? null))
  const [promoter, setPromoter] = useState<CreatableValue>(
    card?.awardedByPassportId
      ? { id: card.awardedByPassportId, label: card.promoterName ?? "" }
      : card?.promoterName
        ? { id: null, label: card.promoterName }
        : EMPTY_CREATABLE_VALUE,
  )
  const [school, setSchool] = useState<CreatableValue>(
    card?.organizationId
      ? { id: card.organizationId, label: card.schoolName ?? "" }
      : card?.schoolName
        ? { id: null, label: card.schoolName }
        : EMPTY_CREATABLE_VALUE,
  )
  const [country, setCountry] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  const mediaByPurpose = useMemo(() => {
    const map: Record<string, BeltMediaItem[]> = {}
    for (const item of vm.media) {
      const key = item.purpose ?? "belt"
      ;(map[key] ??= []).push(item)
    }
    return map
  }, [vm.media])

  const milestoneId = card?.milestone?.id ?? null

  const saveStory = async () => {
    setIsSaving(true)
    try {
      const next = await client.belt.upsertBeltMilestone({
        rankId: vm.rank.id,
        story: story.trim() || null,
      })
      onSaved?.(next)
      toast.success("Story saved.")
    } catch {
      toast.error("Could not save your story.")
    } finally {
      setIsSaving(false)
    }
  }

  const saveFact = async () => {
    if (!card) {
      // No award yet — the story upsert creates it; save the story first.
      await saveStory()
      return
    }
    setIsSaving(true)
    try {
      const next = await client.belt.updateRankAwardFact({
        rankAwardId: card.rankAwardId,
        awardedAt: awardedAt ? new Date(awardedAt) : null,
        promoter: white
          ? undefined
          : promoter.id
            ? { awardedByPassportId: promoter.id }
            : { name: promoter.label || null },
        school: white
          ? undefined
          : school.id
            ? { organizationId: school.id }
            : { name: school.label || null, country: country || null },
      })
      onSaved?.(next)
      toast.success("Belt details saved.")
    } catch {
      toast.error("Could not save your belt details.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Stack direction="column" size="lg" className="w-full">
      <DialogHeader>
        <DialogTitle>{vm.rank.name}</DialogTitle>
      </DialogHeader>

      {/* FACT fields — editable only while UNVERIFIED */}
      <Stack direction="column" size="md" className="w-full">
        <div className="w-full">
          <Label htmlFor="belt-awarded-at">{beltDateLabel(white)}</Label>
          {factEditable ? (
            <Input
              id="belt-awarded-at"
              type="date"
              size="lg"
              value={awardedAt}
              onChange={event => setAwardedAt(event.target.value)}
            />
          ) : (
            <Note className="text-sm">{awardedAt || "Not recorded"}</Note>
          )}
        </div>

        {!white && (
          <>
            <div className="w-full">
              <Label>Who promoted you?</Label>
              {factEditable ? (
                <CreatableCombobox
                  options={promoterOptions}
                  value={promoter}
                  onValueChange={setPromoter}
                  placeholder="Select or type your promoter..."
                  searchPlaceholder="Search instructors, or type a name..."
                />
              ) : (
                <Note className="text-sm">{promoter.label || "Not recorded"}</Note>
              )}
            </div>

            <div className="w-full">
              <Label>School / academy</Label>
              {factEditable ? (
                <CreatableCombobox
                  options={schoolOptions}
                  value={school}
                  onValueChange={setSchool}
                  placeholder="Select or type your school..."
                  searchPlaceholder="Search schools, or type to add..."
                />
              ) : (
                <Note className="text-sm">{school.label || "Not recorded"}</Note>
              )}
            </div>

            {factEditable && (
              <div className="w-full">
                <Label>Country</Label>
                <CountrySelect value={country} onValueChange={setCountry} />
              </div>
            )}
          </>
        )}

        {!factEditable && card && (
          <Note className="text-xs">
            These belt facts are verified and can no longer be edited here.
          </Note>
        )}
      </Stack>

      {/* MILESTONE story — always editable */}
      <div className="w-full">
        <Label htmlFor="belt-story">Your story</Label>
        <TextArea
          id="belt-story"
          size="lg"
          className="min-h-28"
          placeholder="What did earning this belt mean to you? Training, setbacks, the promotion day..."
          value={story}
          onChange={event => setStory(event.target.value)}
        />
      </div>

      {/* MILESTONE media — always editable (once a milestone exists) */}
      {milestoneId ? (
        <Stack direction="column" size="md" className="w-full">
          {MEDIA_SECTIONS.map(section => (
            <BeltMediaGallery
              key={section.purpose}
              rankMilestoneId={milestoneId}
              purpose={section.purpose}
              title={section.title}
              items={mediaByPurpose[section.purpose] ?? []}
              onUpload={onUpload}
              onChanged={() => onSaved?.(card as BeltCardOutput)}
            />
          ))}
        </Stack>
      ) : (
        <Note className="text-xs">
          Save your story first to start adding belt, instructor, certificate, and competition
          photos.
        </Note>
      )}

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Stack size="sm">
          {!white && card && factEditable && (
            <Button type="button" variant="secondary" isPending={isSaving} onClick={saveFact}>
              Save belt details
            </Button>
          )}
          <Button type="button" isPending={isSaving} onClick={saveStory}>
            Save story
          </Button>
        </Stack>
      </DialogFooter>
    </Stack>
  )
}
