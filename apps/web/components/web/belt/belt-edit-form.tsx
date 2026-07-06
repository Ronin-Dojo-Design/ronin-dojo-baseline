"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { BeltSwatch } from "~/components/common/belt-swatch"
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
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { siteConfig } from "~/config/site"
import { client } from "~/lib/orpc-client"
import type { BeltCardOutput, MilestoneMediaPurpose } from "~/server/belt/schemas"
import { BeltMediaGallery } from "./belt-media-gallery"
import {
  beltDateLabel,
  type BeltCardMedia,
  type BeltRankViewModel,
  cardFactEditability,
  isWhiteBelt,
} from "./belt-view-model"
import { CountrySelect } from "./country-select"

/**
 * The belt-journey EDIT SURFACE (Slice 4 — Petey Plan 0477 §Slice 4), opened from
 * an unlocked `BeltEditCard`. Two field groups:
 *
 * - FACT fields (date, promoter, school, country) — PER-FACT editability
 *   (`card.factEditability`, SESSION_0501 fill-blanks policy): a self-added backfill
 *   is fully editable; on an authority-owned (promotion-minted / imported) award an
 *   EMPTY fact renders an input the owner may fill once, while a FILLED authority
 *   fact renders a read-only note. Promoter + school are the resolve-or-create
 *   `CreatableCombobox` (a registered pick stores its ref id; freetext stores text →
 *   the oRPC turns a freetext school into a school-lead). Wired to
 *   `client.belt.updateRankAwardFact`, which only receives the editable facts.
 * - MILESTONE fields (story + the 4 media galleries) — ALWAYS editable (member-owned).
 *   Story wires to `client.belt.upsertBeltMilestone`; media to the galleries.
 *
 * ONE Save button (Desi P1-9 — one mental model, one action): it always upserts the
 * story (which also mints the award/milestone when absent), then — when any fact is
 * editable AND dirty — pushes the fact edit against the FRESH card the upsert
 * returned. The per-group mutations stay separate server-side; the merge is pure
 * client orchestration. This also gives the white belt a save path for its date
 * (the old "Save belt details" button was `!white && …`, so the white-belt date
 * input had no way to persist).
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

/**
 * A LOCKED fact rendered as a plain label/value line (Desi P2-15): muted "Not
 * recorded" when absent, `text-foreground` value when present — matching the
 * form's field rhythm. `Note` is reserved for the single lock-explanation note.
 */
function LockedFactValue({ value }: { value: string }) {
  return value ? (
    <p className="text-sm text-foreground">{value}</p>
  ) : (
    <p className="text-sm text-muted-foreground">Not recorded</p>
  )
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
  // Per-fact editability (SESSION_0501): the server computes the matrix; the form
  // renders an input per editable fact and a plain value line per locked one.
  const facts = cardFactEditability(card)
  // A locked fact exists on this card (locked ⇔ authority-filled on non-disputed
  // awards) — drives the "Request a correction" affordance (Desi P1-7).
  const hasLockedFact = card != null && !(facts.awardedAt && facts.promoter && facts.school)

  // Initial values recompute from the card prop each render, so after a save the
  // dirty flags settle back to false (the grid re-hands the fresh card down).
  const initialAwardedAt = toDateInputValue(card?.awardedAt ?? null)
  const initialPromoter: CreatableValue = card?.awardedByPassportId
    ? { id: card.awardedByPassportId, label: card.promoterName ?? "" }
    : card?.promoterName
      ? { id: null, label: card.promoterName }
      : EMPTY_CREATABLE_VALUE
  const initialSchool: CreatableValue = card?.organizationId
    ? { id: card.organizationId, label: card.schoolName ?? "" }
    : card?.schoolName
      ? { id: null, label: card.schoolName }
      : EMPTY_CREATABLE_VALUE

  const [story, setStory] = useState(card?.milestone?.story ?? "")
  const [awardedAt, setAwardedAt] = useState(initialAwardedAt)
  const [promoter, setPromoter] = useState<CreatableValue>(initialPromoter)
  const [school, setSchool] = useState<CreatableValue>(initialSchool)
  const [country, setCountry] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  // Per-fact dirty flags — the single Save only sends a fact when it is editable
  // AND actually changed (a locked fact in the payload would FORBIDDEN the save).
  const dateDirty = awardedAt !== initialAwardedAt
  const promoterDirty =
    promoter.id !== initialPromoter.id || promoter.label !== initialPromoter.label
  const schoolDirty =
    school.id !== initialSchool.id ||
    school.label !== initialSchool.label ||
    // Country rides the FREETEXT school entry, so picking one dirties the school.
    (country !== "" && !school.id)

  const mediaByPurpose = useMemo(() => {
    const map: Record<string, BeltCardMedia[]> = {}
    for (const item of card?.milestone?.media ?? []) {
      const key = item.purpose ?? "belt"
      ;(map[key] ??= []).push(item)
    }
    return map
  }, [card?.milestone?.media])

  const milestoneId = card?.milestone?.id ?? null

  /**
   * The ONE Save (Desi P1-9). Story first — the upsert also mints the award +
   * milestone when this belt has no card yet — then the fact edit against the
   * FRESH card the upsert returned (a just-minted backfill is fully editable, so
   * the fresh card's matrix is the one that matters, not the possibly-null prop's).
   * Facts are sent per-fact, only when editable AND dirty (undefined leaves a
   * column untouched; a locked authority fact in the payload would FORBIDDEN the
   * whole save).
   */
  const save = async () => {
    setIsSaving(true)
    try {
      let next = await client.belt.upsertBeltMilestone({
        rankId: vm.rank.id,
        story: story.trim() || null,
      })

      const freshFacts = cardFactEditability(next)
      const sendDate = freshFacts.awardedAt && dateDirty
      const sendPromoter = !white && freshFacts.promoter && promoterDirty
      const sendSchool = !white && freshFacts.school && schoolDirty
      if (sendDate || sendPromoter || sendSchool) {
        next = await client.belt.updateRankAwardFact({
          rankAwardId: next.rankAwardId,
          awardedAt: sendDate ? (awardedAt ? new Date(awardedAt) : null) : undefined,
          promoter: sendPromoter
            ? promoter.id
              ? { awardedByPassportId: promoter.id }
              : { name: promoter.label || null }
            : undefined,
          school: sendSchool
            ? school.id
              ? { organizationId: school.id }
              : { name: school.label || null, country: country || null }
            : undefined,
        })
      }

      onSaved?.(next)
      toast.success("Belt saved.")
    } catch (error) {
      // Surface the real oRPC message (BAD_REQUEST / FORBIDDEN carry user-safe copy);
      // fall back only for opaque failures. A bare `catch {}` masked a live P2003 as
      // this generic toast for every failure class (SESSION_0497).
      toast.error(
        error instanceof Error && error.message ? error.message : "Could not save this belt.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Stack direction="column" size="lg" className="w-full">
      <DialogHeader>
        {/* Belt-swatch continuity with the launching card (Desi P2-14) — same
            data-driven `Rank.colorHex`, same `bar` variant/size as `BeltEditCard`.
            The swatch is aria-hidden, so the accessible title stays the rank name. */}
        <DialogTitle className="flex items-center gap-2.5">
          <BeltSwatch colorHex={vm.rank.colorHex} variant="bar" className="h-4 w-12" />
          {vm.rank.name}
        </DialogTitle>
      </DialogHeader>

      {/* FACT fields — PER-FACT editability (SESSION_0501 fill-blanks policy): a
          self-added backfill is fully editable; on an authority-owned award an EMPTY
          fact renders an input the owner may fill, a FILLED one a plain value line.
          The lock explanation leads the group (Desi P1-7) so the state is announced
          before the reader hits dead fields; locked-filled facts get a lightweight
          "Request a correction" mailto (no member-facing correction subsystem exists
          — see PromoterChangeModal, an editor-authority tool that can't mount here). */}
      <Stack direction="column" size="md" className="w-full">
        {(card?.editabilityReason === "AUTHORITY_LOCKED" ||
          card?.editabilityReason === "AUTHORITY_PARTIAL") && (
          <Note className="text-xs">
            {card.editabilityReason === "AUTHORITY_LOCKED"
              ? "These belt facts were recorded by an instructor or admin and are locked."
              : "Facts recorded by an instructor or admin are locked — you can add the ones still missing."}{" "}
            {hasLockedFact && (
              <Link
                href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(
                  `Belt record correction request — ${vm.rank.name}`,
                )}`}
              >
                Request a correction
              </Link>
            )}
          </Note>
        )}

        <div className="w-full">
          <Label htmlFor="belt-awarded-at">{beltDateLabel(white)}</Label>
          {facts.awardedAt ? (
            <Input
              id="belt-awarded-at"
              type="date"
              size="lg"
              value={awardedAt}
              onChange={event => setAwardedAt(event.target.value)}
            />
          ) : (
            <LockedFactValue value={awardedAt} />
          )}
        </div>

        {!white && (
          <>
            <div className="w-full">
              <Label>Who promoted you?</Label>
              {facts.promoter ? (
                <CreatableCombobox
                  options={promoterOptions}
                  value={promoter}
                  onValueChange={setPromoter}
                  placeholder="Select or type your promoter..."
                  searchPlaceholder="Search instructors, or type a name..."
                />
              ) : (
                <LockedFactValue value={promoter.label} />
              )}
            </div>

            <div className="w-full">
              <Label>School / academy</Label>
              {facts.school ? (
                <CreatableCombobox
                  options={schoolOptions}
                  value={school}
                  onValueChange={setSchool}
                  placeholder="Select or type your school..."
                  searchPlaceholder="Search schools, or type to add..."
                />
              ) : (
                <LockedFactValue value={school.label} />
              )}
            </div>

            {facts.school && (
              <div className="w-full">
                <Label>Country</Label>
                <CountrySelect value={country} onValueChange={setCountry} />
              </div>
            )}
          </>
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
          Save this belt once to start adding belt, instructor, certificate, and competition photos.
        </Note>
      )}

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button type="button" isPending={isSaving} onClick={save}>
          Save
        </Button>
      </DialogFooter>
    </Stack>
  )
}
