"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { H4 } from "~/components/common/heading"
import { Hint } from "~/components/common/hint"
import { Input } from "~/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"
import { TextArea } from "~/components/common/textarea"
import { updateDirectoryProfile, updatePassport } from "~/server/web/passport/actions"

const passportFormSchema = z.object({
  displayName: z.string().max(100).optional().default(""),
  bio: z.string().max(2000).optional().default(""),
  phoneE164: z.string().max(20).optional().default(""),
  avatarUrl: z.string().max(2048).optional().default(""),
})

const directoryProfileFormSchema = z.object({
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9-]*$/, "Lowercase alphanumeric and dashes only")
    .optional()
    .default(""),
  visibility: z.enum(["PUBLIC", "MEMBERS_ONLY", "HIDDEN"]).default("PUBLIC"),
  locationCity: z.string().max(100).optional().default(""),
  locationRegion: z.string().max(100).optional().default(""),
  locationCountry: z.string().max(2).optional().default(""),
  showEmail: z.boolean().default(false),
  showPhone: z.boolean().default(false),
  showOrgs: z.boolean().default(true),
  showRanks: z.boolean().default(true),
})

type PassportData = {
  displayName?: string | null
  bio?: string | null
  phoneE164?: string | null
  avatarUrl?: string | null
}

type DirectoryProfileData = {
  slug?: string | null
  visibility?: string | null
  locationCity?: string | null
  locationRegion?: string | null
  locationCountry?: string | null
  showEmail?: boolean | null
  showPhone?: boolean | null
  showOrgs?: boolean | null
  showRanks?: boolean | null
}

type ProfileFormProps = {
  passport: PassportData | null
  directoryProfile: DirectoryProfileData | null
}

export function ProfileForm({ passport, directoryProfile }: ProfileFormProps) {
  // Passport form
  const passportForm = useForm({
    resolver: zodResolver(passportFormSchema),
    defaultValues: {
      displayName: passport?.displayName ?? "",
      bio: passport?.bio ?? "",
      phoneE164: passport?.phoneE164 ?? "",
      avatarUrl: passport?.avatarUrl ?? "",
    },
  })

  // Directory profile form
  const profileForm = useForm({
    resolver: zodResolver(directoryProfileFormSchema),
    defaultValues: {
      slug: directoryProfile?.slug ?? "",
      visibility:
        (directoryProfile?.visibility as "PUBLIC" | "MEMBERS_ONLY" | "HIDDEN") ?? "PUBLIC",
      locationCity: directoryProfile?.locationCity ?? "",
      locationRegion: directoryProfile?.locationRegion ?? "",
      locationCountry: directoryProfile?.locationCountry ?? "",
      showEmail: directoryProfile?.showEmail ?? false,
      showPhone: directoryProfile?.showPhone ?? false,
      showOrgs: directoryProfile?.showOrgs ?? true,
      showRanks: directoryProfile?.showRanks ?? true,
    },
  })

  const { execute: execPassport, isPending: savingPassport } = useAction(updatePassport, {
    onSuccess: () => toast.success("Profile saved"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to save"),
  })

  const { execute: execProfile, isPending: savingProfile } = useAction(updateDirectoryProfile, {
    onSuccess: () => toast.success("Directory settings saved"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to save"),
  })

  return (
    <Stack size="lg" direction="column">
      {/* Passport Section */}
      <section>
        <H4>Personal Info</H4>
        <Form {...passportForm}>
          <form
            onSubmit={passportForm.handleSubmit(data => execPassport(data))}
            className="mt-4 space-y-4"
          >
            <FormField
              control={passportForm.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your display name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passportForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <TextArea {...field} placeholder="A short bio about yourself" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passportForm.control}
              name="phoneE164"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+1234567890" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passportForm.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" isPending={savingPassport}>
              Save Profile
            </Button>
          </form>
        </Form>
      </section>

      {/* Directory Profile Section */}
      <section>
        <H4>Directory Settings</H4>
        <Hint>Control how your profile appears in the public directory.</Hint>
        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(data => execProfile(data))}
            className="mt-4 space-y-4"
          >
            <FormField
              control={profileForm.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile URL Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="john-doe" />
                  </FormControl>
                  <Hint>
                    Your public profile will be at /directory/{field.value || "your-slug"}
                  </Hint>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="MEMBERS_ONLY">Members Only</SelectItem>
                      <SelectItem value="HIDDEN">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Stack size="sm" direction="row" wrap>
              <FormField
                control={profileForm.control}
                name="locationCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="locationRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Region</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="State" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="locationCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="US" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </Stack>

            <Stack size="md" direction="column">
              <FormField
                control={profileForm.control}
                name="showEmail"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Show email</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="showPhone"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Show phone</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="showOrgs"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Show organizations</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="showRanks"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Show ranks</FormLabel>
                  </FormItem>
                )}
              />
            </Stack>

            <Button type="submit" isPending={savingProfile}>
              Save Directory Settings
            </Button>
          </form>
        </Form>
      </section>
    </Stack>
  )
}
