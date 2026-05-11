"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import type { DirectoryProfile, Passport } from "~/.generated/prisma/client"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Checkbox } from "~/components/common/checkbox"
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
import { TextArea } from "~/components/common/textarea"
import {
  updatePassport,
  updateDirectoryProfile,
} from "~/server/web/passport/actions"
import {
  updatePassportSchema,
  updateDirectoryProfileSchema,
} from "~/server/web/passport/schemas"
import { SocialLinksEditor } from "./_components/social-links-editor"

/** Coerce null/undefined to empty string for HTML inputs */
const str = (v: string | null | undefined) => v ?? ""

type Props = {
  passport: Passport
  directoryProfile: DirectoryProfile
  userId: string
  canUploadVideo: boolean
}

export function PassportEditor({ passport, directoryProfile, userId, canUploadVideo }: Props) {
  return (
    <div className="flex flex-col gap-10">
      <PassportForm passport={passport} userId={userId} />
      <DirectoryProfileForm directoryProfile={directoryProfile} userId={userId} canUploadVideo={canUploadVideo} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Passport form
// ---------------------------------------------------------------------------

function PassportForm({ passport, userId }: { passport: Passport; userId: string }) {
  const { form, handleSubmitWithAction } = useHookFormAction(
    updatePassport,
    zodResolver(updatePassportSchema),
    {
      formProps: {
        values: {
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
        },
      },
      actionProps: {
        onSuccess: () => toast.success("Passport updated."),
        onError: () => toast.error("Failed to update passport."),
      },
    },
  )

  return (
    <section>
      <H2>Identity</H2>

      <Form {...form}>
        <form onSubmit={handleSubmitWithAction} className="mt-4 grid gap-4 @md:grid-cols-2" noValidate>
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input placeholder="How you appear to others" {...field} value={str(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="legalFirstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input {...field} value={str(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="legalLastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input {...field} value={str(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of birth</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : str(field.value as string)}
                    onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select value={field.value ?? ""} onValueChange={v => field.onChange(v || undefined)}>
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

          <FormField
            control={form.control}
            name="phoneE164"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+1 555 123 4567" {...field} value={str(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency contact</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} value={str(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContactPhoneE164"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency phone</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} value={str(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormMedia form={form} field={field} path={`passports/${userId}/avatar`} className="@md:col-span-2">
                {field.value && (
                  <img
                    src={field.value}
                    alt="Avatar preview"
                    className="size-20 rounded-full object-cover"
                  />
                )}
              </FormMedia>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="@md:col-span-2">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <TextArea rows={4} placeholder="Tell us about your martial arts journey…" {...field} value={str(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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

function DirectoryProfileForm({ directoryProfile, userId, canUploadVideo }: { directoryProfile: DirectoryProfile; userId: string; canUploadVideo: boolean }) {
  const { form, handleSubmitWithAction } = useHookFormAction(
    updateDirectoryProfile,
    zodResolver(updateDirectoryProfileSchema),
    {
      formProps: {
        values: {
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
        },
      },
      actionProps: {
        onSuccess: () => toast.success("Directory profile updated."),
        onError: () => toast.error("Failed to update directory profile."),
      },
    },
  )

  return (
    <section>
      <H2>Directory Profile</H2>

      <Form {...form}>
        <form onSubmit={handleSubmitWithAction} className="mt-4 grid gap-4 @md:grid-cols-2" noValidate>
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile slug</FormLabel>
                <FormControl>
                  <Input placeholder="your-name" {...field} value={str(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
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

          <FormField
            control={form.control}
            name="locationCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} value={str(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationRegion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State / Region</FormLabel>
                <FormControl>
                  <Input {...field} value={str(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country (2-letter code)</FormLabel>
                <FormControl>
                  <Input maxLength={2} placeholder="US" {...field} value={str(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverPhotoUrl"
            render={({ field }) => (
              <FormMedia form={form} field={field} path={`profiles/${userId}/cover`} className="@md:col-span-2">
                {field.value && (
                  <img
                    src={field.value}
                    alt="Cover photo preview"
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
