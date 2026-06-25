import { AwardIcon } from "lucide-react"
import { useMemo } from "react"
import { type FieldPath, type UseFormReturn, useWatch } from "react-hook-form"
import { BeltSwatch } from "~/components/common/belt-swatch"
import {
  CreatableCombobox,
  type CreatableOption,
  type CreatableValue,
} from "~/components/common/creatable-combobox"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/common/form"
import { Input } from "~/components/common/input"
import { Note } from "~/components/common/note"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { TextArea } from "~/components/common/textarea"
import type { JoinWizardOptions } from "~/server/web/lineage/join-options"
import { bblPortalFontClass } from "./constants"
import { EvidencePhotoInput } from "./evidence-photo-input"
import type { JoinLegacyFormValues } from "./schema"
import { StepShell } from "./step-shell"
import type { ClaimableTree } from "./use-join-wizard"

/**
 * A creatable-combobox bound to TWO form fields: the human `textName` (the
 * label/custom fallback) and the `idName` ref (set only on a registered pick).
 * Storing both is the settled claim-wiring shape (SESSION_0441, ADR 0036) — the
 * steward reads the ref when present, else the text.
 */
function CreatableField({
  form,
  textName,
  idName,
  label,
  options,
  placeholder,
  searchPlaceholder,
  note,
  className,
}: {
  form: UseFormReturn<JoinLegacyFormValues>
  textName: FieldPath<JoinLegacyFormValues>
  idName: FieldPath<JoinLegacyFormValues>
  label: string
  options: CreatableOption[]
  placeholder: string
  searchPlaceholder: string
  note?: string
  className?: string
}) {
  const idValue = useWatch({ control: form.control, name: idName })

  return (
    <FormField
      control={form.control}
      name={textName}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <CreatableCombobox
              options={options}
              value={{
                id: typeof idValue === "string" && idValue.length > 0 ? idValue : null,
                label: typeof field.value === "string" ? field.value : "",
              }}
              onValueChange={(next: CreatableValue) => {
                // Write BOTH: the text label (always) and the ref id (registered pick
                // → the id; custom → cleared). `shouldValidate` keeps the existing
                // text-field validation/error chrome live.
                field.onChange(next.label)
                form.setValue(idName, next.id ?? "", { shouldDirty: true })
              }}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
            />
          </FormControl>
          {note ? <Note className="text-xs">{note}</Note> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function LineageStep({
  active,
  claimableTree,
  form,
  options,
}: {
  active: boolean
  claimableTree?: ClaimableTree
  form: UseFormReturn<JoinLegacyFormValues>
  options: JoinWizardOptions
}) {
  // Belt colors stay data-driven (Rank.colorHex) — the swatch renders ONLY in the
  // dropdown row; the collapsed trigger shows the plain rank name.
  const rankOptions = useMemo<CreatableOption[]>(
    () =>
      options.ranks.map(rank => ({
        id: rank.id,
        name: rank.name,
        content: (
          <span className="flex items-center gap-2">
            <BeltSwatch colorHex={rank.colorHex} />
            {rank.name}
          </span>
        ),
      })),
    [options.ranks],
  )

  return (
    <StepShell
      active={active}
      icon={AwardIcon}
      eyebrow="Step 3"
      title="Lineage details"
      description="Share enough rank, school, evidence, and story context for reviewers to place your Passport and lineage profile correctly."
    >
      <div className="grid gap-4">
        <CreatableField
          form={form}
          textName="currentRank"
          idName="currentRankId"
          label="Current rank"
          options={rankOptions}
          placeholder="Select your belt rank..."
          searchPlaceholder="Search ranks, or type your own..."
          note="Pick your current rank from the ladder, or type one that isn't listed. Add dates and promotion history below."
        />

        <CreatableField
          form={form}
          textName="schoolName"
          idName="schoolOrgId"
          label="Current school / academy"
          options={options.schools}
          placeholder="Select or type your school..."
          searchPlaceholder="Search schools, or type to add..."
          note="Choosing a registered school links it; otherwise we record the name you enter."
        />

        <CreatableField
          form={form}
          textName="trainedUnder"
          idName="trainedUnderNodeId"
          label="Who did you train under?"
          options={options.instructors}
          placeholder="Select or type your instructor..."
          searchPlaceholder="Search the lineage, or type a name..."
          note="Pick a registered instructor to link your line, or type someone not yet in the lineage."
        />

        <CreatableField
          form={form}
          textName="represent"
          idName="representTreeId"
          label="Who should your tree connect to?"
          options={options.trees}
          placeholder="Optional: select a lineage tree..."
          searchPlaceholder="Search lineage trees, or type..."
          note="Optional — the lineage tree your profile should connect to."
        />

        <FormField
          control={form.control}
          name="martialArtsExperience"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Martial arts experience</FormLabel>
              <FormControl>
                <TextArea
                  placeholder="Years training, disciplines, teaching history, competition highlights, major affiliations..."
                  className="min-h-28"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profileUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website or public profile</FormLabel>
              <FormControl>
                <Input type="url" inputMode="url" size="lg" placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instagramUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram or social proof</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  inputMode="url"
                  size="lg"
                  placeholder="https://instagram.com/..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="evidenceUrl"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Certificate or evidence photo</FormLabel>
              <FormControl>
                <EvidencePhotoInput
                  value={typeof field.value === "string" ? field.value : ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <Note className="text-xs">
                Upload a photo of a belt certificate or other proof for steward review.
              </Note>
              <FormMessage />
            </FormItem>
          )}
        />

        {claimableTree && claimableTree.members.length > 0 && (
          <FormField
            control={form.control}
            name="nodeId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Claim an existing lineage profile</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  items={Object.fromEntries(
                    claimableTree.members.map(member => [member.nodeId, member.displayName]),
                  )}
                >
                  <FormControl>
                    <SelectTrigger size="lg" className="min-h-12">
                      <SelectValue placeholder={`Optional: select from ${claimableTree.name}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={bblPortalFontClass}>
                    {claimableTree.members.map(member => (
                      <SelectItem key={member.nodeId} value={member.nodeId} className="min-h-10">
                        {member.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Note className="text-xs">
                  A claim is created immediately when you are signed in. Otherwise this records the
                  intent and you can finish the claim after signing in.
                </Note>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Bio, achievements, or legacy notes</FormLabel>
              <FormControl>
                <TextArea
                  placeholder="Short history, achievements, teaching focus, competition highlights, context for reviewers..."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shareConsent"
          render={({ field }) => (
            <FormItem className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 md:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={event => field.onChange(event.target.checked)}
                  className="mt-1 size-5 rounded border-border accent-red-600"
                />
                <span>
                  <span className="font-bold">I understand this is a private review intake.</span>{" "}
                  Black Belt Legacy may use these details to verify my Passport, lineage, and public
                  profile before anything is published.
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </StepShell>
  )
}
