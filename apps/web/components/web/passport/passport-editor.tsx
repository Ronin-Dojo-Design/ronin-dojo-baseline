"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { type UseFormReturn, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Checkbox } from "~/components/common/checkbox"
import { AvatarField, DateField, TextAreaField, TextField } from "~/components/common/fields"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { FormMedia } from "~/components/common/form-media"
import { H2 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { ProfileHero } from "~/components/web/profile/profile-hero"
import { initialsOf } from "~/lib/directory/facet-result"
import { updateDirectoryProfile, updatePassport } from "~/server/web/passport/actions"
import type { DirectoryProfileOne, PassportOne } from "~/server/web/passport/payloads"
import { updateDirectoryProfileSchema, updatePassportSchema } from "~/server/web/passport/schemas"
import { SocialLinksEditor } from "./social-links-editor"

/** Coerce null/undefined to empty string for HTML inputs */
const str = (v: string | null | undefined) => v ?? ""

/** Initial `react-hook-form` values for the Passport (identity) form. */
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
  }
}

/** Initial `react-hook-form` values for the DirectoryProfile (presentation) form. */
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

type Props = {
  passport: PassportOne
  directoryProfile: DirectoryProfileOne
  userId: string
  canUploadVideo: boolean
}

/**
 * The ONE canonical Passport + DirectoryProfile editor (SESSION_0398, ADR 0025).
 *
 * Rendered by both owner-edit entry points — `/me` (MePage) and the `/app/profile`
 * Profile tab (DashboardProfileTab). Passport is the identity SoT; DirectoryProfile
 * is its presentation/privacy view. Both forms hoist to this parent so a single live
 * `ProfileHero` can mirror name/avatar/location across both as the owner types.
 *
 * SESSION_0400 (D-023): the plain text/date/avatar fields render via the shared
 * `components/common/fields` primitives so this editor and the lineage-node profile
 * form share one field surface. The `Select`s (gender/visibility), the cover-photo
 * + video media, the privacy checkboxes, and `SocialLinksEditor` stay inline.
 */
export function PassportEditor({ passport, directoryProfile, userId, canUploadVideo }: Props) {
  const passportForm = useHookFormAction(updatePassport, zodResolver(updatePassportSchema), {
    formProps: { values: passportFormValues(passport) },
    actionProps: {
      onSuccess: () => toast.success("Passport updated."),
      onError: () => toast.error("Failed to update passport."),
    },
  })

  const directoryForm = useHookFormAction(
    updateDirectoryProfile,
    zodResolver(updateDirectoryProfileSchema),
    {
      formProps: { values: directoryFormValues(directoryProfile) },
      actionProps: {
        onSuccess: () => toast.success("Directory profile updated."),
        onError: () => toast.error("Failed to update directory profile."),
      },
    },
  )

  // Live preview — mirrors form state into the same hero the public profile and
  // claim teaser use, so the owner sees their profile forming as they type.
  const previewName = useWatch({ control: passportForm.form.control, name: "displayName" })
  const previewAvatar = useWatch({ control: passportForm.form.control, name: "avatarUrl" })
  const previewCity = useWatch({ control: directoryForm.form.control, name: "locationCity" })
  const previewRegion = useWatch({ control: directoryForm.form.control, name: "locationRegion" })

  return (
    <div className="flex flex-col gap-10">
      <ProfileHero
        name={previewName || null}
        avatarUrl={previewAvatar || null}
        subtitle={[previewCity, previewRegion].filter(Boolean).join(", ") || null}
        initials={initialsOf(previewName)}
      />

      <PassportForm
        form={passportForm.form}
        onSubmit={passportForm.handleSubmitWithAction}
        userId={userId}
      />
      <DirectoryProfileForm
        form={directoryForm.form}
        onSubmit={directoryForm.handleSubmitWithAction}
        userId={userId}
        canUploadVideo={canUploadVideo}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Passport form
// ---------------------------------------------------------------------------

function PassportForm({
  form,
  onSubmit,
  userId,
}: {
  form: UseFormReturn<any>
  onSubmit: React.FormEventHandler<HTMLFormElement>
  userId: string
}) {
  return (
    <section>
      <H2>Identity</H2>

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 @md:grid-cols-2" noValidate>
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

          <AvatarField
            form={form}
            control={form.control}
            name="avatarUrl"
            path={`passports/${userId}/avatar`}
            className="@md:col-span-2"
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

          <div className="@md:col-span-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Save passport"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Directory profile form
// ---------------------------------------------------------------------------

function DirectoryProfileForm({
  form,
  onSubmit,
  userId,
  canUploadVideo,
}: {
  form: UseFormReturn<any>
  onSubmit: React.FormEventHandler<HTMLFormElement>
  userId: string
  canUploadVideo: boolean
}) {
  return (
    <section>
      <H2>Directory Profile</H2>

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 @md:grid-cols-2" noValidate>
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
                <FormLabel>Visibility</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <TextField control={form.control} name="locationCity" label="City" />

          <TextField control={form.control} name="locationRegion" label="State / Region" />

          <TextField
            control={form.control}
            name="locationCountry"
            label="Country (2-letter code)"
            placeholder="US"
            maxLength={2}
          />

          <FormField
            control={form.control}
            name="coverPhotoUrl"
            render={({ field }) => (
              <FormMedia
                form={form}
                field={field}
                path={`profiles/${userId}/cover`}
                className="@md:col-span-2"
              >
                {field.value && (
                  <img
                    src={field.value}
                    alt="Cover preview"
                    className="h-32 w-full rounded-md object-cover"
                  />
                )}
              </FormMedia>
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

          <div className="@md:col-span-2 flex flex-wrap gap-6">
            {(["showEmail", "showPhone", "showOrgs", "showRanks"] as const).map(name => (
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
                        aria-label={name.replace("show", "Show ")}
                      />
                    </FormControl>
                    <FormLabel className="mt-0! capitalize">
                      {name.replace("show", "Show ")}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className="@md:col-span-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Save directory profile"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}
