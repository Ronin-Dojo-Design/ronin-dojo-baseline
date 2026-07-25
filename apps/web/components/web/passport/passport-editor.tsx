"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { type UseFormReturn, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Checkbox } from "~/components/common/checkbox"
import { DateField, TextAreaField, TextField } from "~/components/common/fields"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { FormMedia } from "~/components/common/form-media"
import { H2, H3 } from "~/components/common/heading"
import { Hint } from "~/components/common/hint"
import { Input } from "~/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { CountryField } from "~/components/web/belt/country-field"
import { ProfileHero } from "~/components/web/profile/profile-hero"
import { AvatarUploader } from "~/components/web/uploader"
import { ImageFieldUploader } from "~/components/web/uploader/image-field-uploader"
import { initialsOf } from "~/lib/directory/facet-result"
import { updatePassportAndProfileAsAdmin } from "~/server/admin/people/actions"
import { updatePassportAndProfileAsAdminSchema } from "~/server/admin/people/schemas"
import { updatePassportAndProfile } from "~/server/web/passport/actions"
import type { DirectoryProfileOne, PassportOne } from "~/server/web/passport/payloads"
import { updatePassportAndProfileSchema } from "~/server/web/passport/schemas"
import { SocialLinksEditor } from "./social-links-editor"

/** Coerce null/undefined to empty string for HTML inputs */
const str = (v: string | null | undefined) => v ?? ""

/** Per-member privacy toggles (G-004 N2) — which DirectoryProfile facts appear publicly. */
const PRIVACY_TOGGLES = [
  { name: "showEmail", label: "Show email" },
  { name: "showPhone", label: "Show phone" },
  { name: "showOrgs", label: "Show schools & orgs" },
  { name: "showRanks", label: "Show belt ranks" },
] as const

/** Initial `react-hook-form` values for the Passport (identity) half. */
function passportFormValues(passport: PassportOne) {
  return {
    displayName: str(passport.displayName),
    legalFirstName: str(passport.legalFirstName),
    legalLastName: str(passport.legalLastName),
    dob: passport.dob ? new Date(passport.dob) : undefined,
    gender: passport.gender ?? undefined,
    phoneE164: str(passport.phoneE164),
    emergencyContactName: str(passport.emergencyContactName),
    emergencyContactPhoneE164: str(passport.emergencyContactPhoneE164),
    avatarUrl: str(passport.avatarUrl),
    bio: str(passport.bio),
    socialLinks: Array.isArray(passport.socialLinks)
      ? (passport.socialLinks as Array<{ platform: string; url: string }>)
      : [],
    allowSocialCelebration: passport.allowSocialCelebration,
  }
}

/** Initial `react-hook-form` values for the DirectoryProfile (presentation) half. */
function directoryFormValues(directoryProfile: DirectoryProfileOne) {
  return {
    slug: str(directoryProfile.slug),
    visibility: directoryProfile.visibility,
    locationCity: str(directoryProfile.locationCity),
    locationRegion: str(directoryProfile.locationRegion),
    locationCountry: str(directoryProfile.locationCountry),
    showEmail: directoryProfile.showEmail,
    showPhone: directoryProfile.showPhone,
    showOrgs: directoryProfile.showOrgs,
    showRanks: directoryProfile.showRanks,
    coverPhotoUrl: str(directoryProfile.coverPhotoUrl),
    videoIntroUrl: str(directoryProfile.videoIntroUrl),
  }
}

/** Merged initial values — the ONE form's value shape (flat, collision-free). */
function editorFormValues(passport: PassportOne, directoryProfile: DirectoryProfileOne) {
  return { ...passportFormValues(passport), ...directoryFormValues(directoryProfile) }
}

type Props = {
  passport: PassportOne
  directoryProfile: DirectoryProfileOne
  userId: string
  canUploadVideo: boolean
  /**
   * Admin mode (WL-P2-35, ADR 0045 D3): when a `passportId` is supplied, the editor
   * writes through the admin-gated `updatePassportAndProfileAsAdmin` action (keyed
   * `where: { id: passportId }`) instead of the self-serve owner action (keyed
   * `where: { userId: session.user.id }`). Omit it for the `/app/profile` owner-edit
   * path — that keeps writing through the self-serve twin unchanged.
   */
  adminPassportId?: string
}

/**
 * The ONE canonical Passport + DirectoryProfile editor (SESSION_0398, ADR 0025).
 *
 * Rendered by the owner-edit entry point — the `/app/profile` Profile tab
 * (DashboardProfileTab) — AND (WL-P2-35) the admin People detail `/app/users/[id]`,
 * where an admin edits another person's Passport. Passport is the identity SoT;
 * DirectoryProfile is its presentation/privacy view.
 *
 * WL-P2-45 (SESSION_0700): ONE form, ONE Save. The former two hoisted forms (Identity
 * → `updatePassport`, Directory Profile → `updateDirectoryProfile`, each with its own
 * Save button) collapsed into a single RHF form over the flat-merged
 * `updatePassportAndProfileSchema`; a single submit drives the combined
 * `updatePassportAndProfile` action, which persists both halves in one transaction
 * (partial failure rolls back — never a half-saved identity). The granular actions
 * remain as the granular API. The Identity / Directory Profile section headings are
 * presentation only now.
 *
 * The self-serve vs admin split is a prop, not a fork: `adminPassportId` swaps the
 * combined server action + schema (owner-keyed → admin-keyed) and injects the target
 * `passportId` into the submitted values. Everything else — the fields, the hero, the
 * media paths — is identical, so there is exactly ONE editor to maintain.
 *
 * Save-semantics note (WL-P2-45 rider c, Giddy P3): the owner-mode profile photo does
 * NOT wait for Save — `AvatarUploader` persists it instantly through
 * `uploadAndPromotePassportAvatar` ("Save photo"). The hint under the uploader makes
 * that third semantics explicit. Admin mode is unaffected (its `ImageFieldUploader`
 * URL rides the form submit).
 *
 * SESSION_0400 (D-023): the plain text/date/avatar fields render via the shared
 * `components/common/fields` primitives so this editor and the lineage-node profile
 * form share one field surface. The `Select`s (gender/visibility), the cover-photo
 * + video media, the privacy checkboxes, and `SocialLinksEditor` stay inline.
 */
export function PassportEditor({
  passport,
  directoryProfile,
  userId,
  canUploadVideo,
  adminPassportId,
}: Props) {
  const isAdmin = adminPassportId != null

  // Admin mode swaps BOTH the action (owner-keyed → admin-keyed) and the schema
  // (adds `passportId`), and injects the target id into the submitted values. The admin
  // schema is the base schema MINUS the consent field (`allowSocialCelebration` — omitted
  // per PR #339 Doug P2: only the member may consent) PLUS `passportId`, so neither shape
  // subsumes the other; the base-schema value shape stays the working type. RHF's `values`
  // prop and the resolver are both typed against the self schema, so cast at those two
  // seams — `passportId` still rides through to the admin action (its only consumer), and
  // the admin resolver still VALIDATES with the omitted schema at runtime (the consent key
  // is schema-stripped before submit).
  const values = (
    isAdmin
      ? { ...editorFormValues(passport, directoryProfile), passportId: adminPassportId }
      : editorFormValues(passport, directoryProfile)
  ) as ReturnType<typeof editorFormValues>

  const { form, handleSubmitWithAction } = useHookFormAction(
    // Same cast seam: the hook infers the form type from the action's input schema; keep the
    // SELF flavor as the static type (the admin action still parses its own omitted+passportId
    // schema server-side — the cast never changes what validates or writes).
    (isAdmin
      ? updatePassportAndProfileAsAdmin
      : updatePassportAndProfile) as typeof updatePassportAndProfile,
    zodResolver(
      (isAdmin
        ? updatePassportAndProfileAsAdminSchema
        : updatePassportAndProfileSchema) as typeof updatePassportAndProfileSchema,
    ),
    {
      formProps: { values },
      actionProps: {
        onSuccess: () => toast.success("Profile updated."),
        onError: () => toast.error("Failed to update profile."),
      },
    },
  )

  // Live preview — mirrors form state into the same hero the public profile and
  // claim teaser use, so the owner sees their profile forming as they type.
  const previewName = useWatch({ control: form.control, name: "displayName" })
  const previewAvatar = useWatch({ control: form.control, name: "avatarUrl" })
  const previewCity = useWatch({ control: form.control, name: "locationCity" })
  const previewRegion = useWatch({ control: form.control, name: "locationRegion" })
  const previewCover = useWatch({ control: form.control, name: "coverPhotoUrl" })

  return (
    <div className="flex flex-col gap-10">
      <ProfileHero
        name={previewName || null}
        avatarUrl={previewAvatar || null}
        coverPhotoUrl={previewCover || null}
        subtitle={[previewCity, previewRegion].filter(Boolean).join(", ") || null}
        initials={initialsOf(previewName)}
      />

      <Form {...form}>
        <form onSubmit={handleSubmitWithAction} className="flex flex-col gap-10" noValidate>
          <PassportFields form={form} isAdmin={isAdmin} adminPassportId={adminPassportId} />
          <DirectoryProfileFields form={form} userId={userId} canUploadVideo={canUploadVideo} />

          <div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Passport (identity) fields
// ---------------------------------------------------------------------------

function PassportFields({
  form,
  isAdmin,
  adminPassportId,
}: {
  form: UseFormReturn<any>
  isAdmin: boolean
  adminPassportId?: string
}) {
  return (
    <section>
      <H2>Identity</H2>

      <div className="mt-4 grid gap-4 @md:grid-cols-2">
        <TextField
          control={form.control}
          name="displayName"
          label="Display name"
          placeholder="How you appear to others"
        />

        <TextField control={form.control} name="legalFirstName" label="First name" />

        <TextField control={form.control} name="legalLastName" label="Last name" />

        <DateField control={form.control} name="dob" label="Date of birth" clearTo="undefined" />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={v => field.onChange(v || undefined)}
                items={{
                  MALE: "Male",
                  FEMALE: "Female",
                  NONBINARY: "Non-binary",
                  PREFER_NOT_TO_SAY: "Prefer not to say",
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="NONBINARY">Non-binary</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <TextField
          control={form.control}
          name="phoneE164"
          label="Phone"
          type="tel"
          placeholder="+1 555 123 4567"
        />

        <TextField
          control={form.control}
          name="emergencyContactName"
          label="Emergency contact"
          placeholder="Name"
        />

        <TextField
          control={form.control}
          name="emergencyContactPhoneE164"
          label="Emergency phone"
          type="tel"
        />

        {/* H2 (FI-024): the avatar is an uploader, never a URL text field. Owner mode uses the
            belt-ringed `AvatarUploader` (free-tier `uploadAndPromotePassportAvatar`, keyed to the
            session user). Admin mode CANNOT use that action (it promotes the ADMIN's own avatar),
            so it uses `ImageFieldUploader` through the admin-bypassing `uploadMedia` seam — the
            cropped URL then rides the admin passport form's submit to the target Passport. */}
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem className="@md:col-span-2">
              <FormLabel>Profile photo</FormLabel>
              {isAdmin ? (
                <ImageFieldUploader
                  value={field.value || null}
                  onChange={url => field.onChange(url ?? "")}
                  uploadPathPrefix={`passports/${adminPassportId}/avatar`}
                  presets={["circle", "square"]}
                  defaultPreset="circle"
                  cropTitle="Crop the profile photo"
                />
              ) : (
                <>
                  <AvatarUploader
                    initialAvatarUrl={field.value || null}
                    onAvatarUrl={url => field.onChange(url)}
                  />
                  {/* WL-P2-45 rider c (Giddy P3): the photo has a THIRD save-semantics — it
                      persists the moment "Save photo" completes, independent of the form's
                      Save button. Say so explicitly instead of letting owners wonder. */}
                  <Hint>
                    Your photo saves immediately when uploaded — all other fields save when you
                    press “Save profile”.
                  </Hint>
                </>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <TextAreaField
          control={form.control}
          name="bio"
          label="Bio"
          rows={4}
          placeholder="Tell us about your martial arts journey…"
          className="@md:col-span-2"
        />

        <div className="@md:col-span-2">
          <SocialLinksEditor form={form} />
        </div>

        {/* Fork F2 (SESSION_0705, PL-027): the affirmative publicity opt-in — the ONE place it
            can be edited (ADR 0025). Default OFF; the social-queue approve gate re-reads it
            live, so unchecking it revokes consent for any pending celebration.
            OWNER MODE ONLY (PR #339 Doug P2): consent must come from the member — an admin
            flipping it on another person's behalf would be manufactured consent. The admin
            schemas also `.omit()` the field, so even a crafted submit cannot write it. */}
        {!isAdmin && (
          <div className="@md:col-span-2 flex flex-col gap-3">
            <div>
              <H3 size="h5">Publicity</H3>
              <Hint>
                Off by default. When enabled, Black Belt Legacy may celebrate your verified belt
                promotions on our social channels; every post is still human-reviewed first, and
                unchecking this revokes permission for anything not yet posted.
              </Hint>
            </div>
            <FormField
              control={form.control}
              name="allowSocialCelebration"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Celebrate my promotions publicly"
                    />
                  </FormControl>
                  <FormLabel className="mt-0!">Celebrate my promotions publicly</FormLabel>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Directory profile (presentation) fields
// ---------------------------------------------------------------------------

function DirectoryProfileFields({
  form,
  userId,
  canUploadVideo,
}: {
  form: UseFormReturn<any>
  userId: string
  canUploadVideo: boolean
}) {
  return (
    <section>
      <H2>Directory Profile</H2>

      <div className="mt-4 grid gap-4 @md:grid-cols-2">
        <TextField
          control={form.control}
          name="slug"
          label="Profile slug"
          placeholder="your-name"
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile visibility</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={{
                  HIDDEN: "Hidden",
                  MEMBERS_ONLY: "Members only",
                  PUBLIC: "Public",
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HIDDEN">Hidden</SelectItem>
                  <SelectItem value="MEMBERS_ONLY">Members only</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                </SelectContent>
              </Select>
              <Hint>
                Public shows your profile in the directory to everyone; Members only limits it to
                signed-in members; Hidden keeps it off the directory entirely.
              </Hint>
              <FormMessage />
            </FormItem>
          )}
        />

        <TextField control={form.control} name="locationCity" label="City" />

        <TextField control={form.control} name="locationRegion" label="State / Region" />

        <CountryField control={form.control} name="locationCountry" label="Country" />

        {/* H2 (FI-024): the cover is an uploader (wide crop preset), never a URL text field. The
            same entitlement-gated `uploadMedia` seam the old `FormMedia` upload button used —
            only the confusing dual URL input is gone. */}
        <FormField
          control={form.control}
          name="coverPhotoUrl"
          render={({ field }) => (
            <FormItem className="@md:col-span-2">
              <FormLabel>Cover photo</FormLabel>
              <ImageFieldUploader
                value={field.value || null}
                onChange={url => field.onChange(url ?? "")}
                uploadPathPrefix={`profiles/${userId}/cover`}
                presets={["wide"]}
                defaultPreset="wide"
                cropTitle="Crop your cover photo"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoIntroUrl"
          render={({ field }) => (
            <FormItem className="@md:col-span-2">
              <FormLabel>Video intro</FormLabel>
              {canUploadVideo ? (
                <FormMedia form={form} field={field} path={`profiles/${userId}/video`}>
                  {field.value && (
                    <p className="text-muted-foreground text-sm truncate">{field.value}</p>
                  )}
                </FormMedia>
              ) : (
                <FormControl>
                  <Input
                    type="url"
                    placeholder="YouTube or Vimeo URL"
                    {...field}
                    value={str(field.value)}
                  />
                </FormControl>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="@md:col-span-2 flex flex-col gap-3">
          <div>
            <H3 size="h5">Privacy</H3>
            <Hint>Choose which details appear on your public profile.</Hint>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {PRIVACY_TOGGLES.map(({ name, label }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label={label}
                      />
                    </FormControl>
                    <FormLabel className="mt-0!">{label}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
