"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import type { DirectoryProfile, Passport } from "~/.generated/prisma/client"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { Input } from "~/components/common/input"
import { TextArea } from "~/components/common/textarea"
import {
  updatePassport,
  updateDirectoryProfile,
} from "~/server/web/passport/actions"
import {
  updatePassportSchema,
  updateDirectoryProfileSchema,
} from "~/server/web/passport/schemas"

/** Coerce null/undefined to empty string for HTML inputs */
const str = (v: string | null | undefined) => v ?? ""

type Props = {
  passport: Passport
  directoryProfile: DirectoryProfile
}

export function PassportEditor({ passport, directoryProfile }: Props) {
  return (
    <div className="flex flex-col gap-10">
      <PassportForm passport={passport} />
      <DirectoryProfileForm directoryProfile={directoryProfile} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Passport form
// ---------------------------------------------------------------------------

function PassportForm({ passport }: { passport: Passport }) {
  const { form, handleSubmitWithAction } = useHookFormAction(
    updatePassport,
    zodResolver(updatePassportSchema),
    {
      formProps: {
        values: {
          displayName: str(passport.displayName),
          legalFirstName: str(passport.legalFirstName),
          legalLastName: str(passport.legalLastName),
          phoneE164: str(passport.phoneE164),
          emergencyContactName: str(passport.emergencyContactName),
          emergencyContactPhoneE164: str(passport.emergencyContactPhoneE164),
          bio: str(passport.bio),
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
      <h2 className="text-xl font-semibold mb-4">Identity</h2>

      <Form {...form}>
        <form onSubmit={handleSubmitWithAction} className="grid gap-4 @md:grid-cols-2" noValidate>
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

function DirectoryProfileForm({ directoryProfile }: { directoryProfile: DirectoryProfile }) {
  const { form, handleSubmitWithAction } = useHookFormAction(
    updateDirectoryProfile,
    zodResolver(updateDirectoryProfileSchema),
    {
      formProps: {
        values: {
          visibility: directoryProfile.visibility,
          locationCity: str(directoryProfile.locationCity),
          locationRegion: str(directoryProfile.locationRegion),
          locationCountry: str(directoryProfile.locationCountry),
          showEmail: directoryProfile.showEmail,
          showPhone: directoryProfile.showPhone,
          showOrgs: directoryProfile.showOrgs,
          showRanks: directoryProfile.showRanks,
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
      <h2 className="text-xl font-semibold mb-4">Directory profile</h2>

      <Form {...form}>
        <form onSubmit={handleSubmitWithAction} className="grid gap-4 @md:grid-cols-2" noValidate>
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    {...field}
                  >
                    <option value="HIDDEN">Hidden</option>
                    <option value="MEMBERS_ONLY">Members only</option>
                    <option value="PUBLIC">Public</option>
                  </select>
                </FormControl>
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

          <div className="@md:col-span-2 flex flex-wrap gap-6">
            {(["showEmail", "showPhone", "showOrgs", "showRanks"] as const).map(name => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        aria-label={name.replace("show", "Show ")}
                        className="size-4 rounded border"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 capitalize">
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
