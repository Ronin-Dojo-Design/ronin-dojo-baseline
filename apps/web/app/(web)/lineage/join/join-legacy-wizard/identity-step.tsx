import { ShieldCheckIcon } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
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
import { AvatarUploader } from "~/components/web/uploader"
import { uploadJoinLegacyAvatar } from "~/server/web/lead/public-actions"
import { bblPortalFontClass, discoveryLabels, roleLabels } from "./constants"
import type { JoinLegacyFormValues } from "./schema"
import { StepShell } from "./step-shell"

export function IdentityStep({
  active,
  form,
}: {
  active: boolean
  form: UseFormReturn<JoinLegacyFormValues>
}) {
  const discoverySource = form.watch("discoverySource")

  return (
    <StepShell
      active={active}
      icon={ShieldCheckIcon}
      eyebrow="Step 2"
      title="Identity and contact"
      description="Your public legacy starts with private contact details stewards can verify. We only publish profile details after review."
    >
      {/* Avatar upload (FI-010a): the wizard is guest-capable, so this uses the PUBLIC
          `uploadJoinLegacyAvatar` action (not the auth-gated Passport-promote one that
          silently failed for guests) and writes the staged R2 URL into the form's
          `avatarUrl`. It rides `createJoinLegacyInterest` onto the lead so the photo
          survives the magic-link round-trip instead of being discarded. */}
      <div className="flex flex-col items-center gap-1 pb-2">
        <AvatarUploader
          size="lg"
          uploadAction={uploadJoinLegacyAvatar}
          initialAvatarUrl={form.watch("avatarUrl") || undefined}
          onAvatarUrl={url =>
            form.setValue("avatarUrl", url, { shouldDirty: true, shouldValidate: true })
          }
        />
        <p className="text-xs text-muted-foreground">
          Optional — add a profile photo now or after joining.
        </p>
      </div>

      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>First name</FormLabel>
              <FormControl>
                <Input size="lg" autoComplete="given-name" placeholder="First name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input size="lg" autoComplete="family-name" placeholder="Last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred display name</FormLabel>
              <FormControl>
                <Input size="lg" placeholder="Coach Brian Scott, Mestre..., etc." {...field} />
              </FormControl>
              <Note className="text-xs">Optional — helps match your public Passport wording.</Note>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  size="lg"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...field}
                />
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
                <Input
                  type="tel"
                  size="lg"
                  autoComplete="tel"
                  placeholder="+1 555 123 4567"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} items={roleLabels}>
                <FormControl>
                  <SelectTrigger size="lg" className="min-h-12">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={bblPortalFontClass}>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="min-h-10">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input
                  size="lg"
                  autoComplete="address-level2"
                  placeholder="Los Angeles, CA"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discoverySource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How did you hear about BBL?</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} items={discoveryLabels}>
                <FormControl>
                  <SelectTrigger size="lg" className="min-h-12">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={bblPortalFontClass}>
                  {Object.entries(discoveryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="min-h-10">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {discoverySource === "OTHER" && (
          <FormField
            control={form.control}
            name="discoverySourceOther"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Tell us where you found us</FormLabel>
                <FormControl>
                  <Input size="lg" placeholder="Podcast, seminar, teammate, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </StepShell>
  )
}
