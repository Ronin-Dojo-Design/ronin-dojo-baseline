"use client"

import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { Input } from "~/components/common/input"

/**
 * Shared theme/brand color + asset fieldset (SESSION_0448 — the `<ThemeFieldset>`
 * named in SESSION_0447). Extracted from the three forms that render an identical
 * 7-field block: `brand-settings-form`, `org-theme-form`, `self-service-theme-form`.
 *
 * The FormField scaffolding + labels + three of the four field descriptions are
 * identical across all three; everything that DIFFERS per form is a prop:
 *   - `placeholders` — every input placeholder (each form has its own copy)
 *   - `accentColorDescription` — self-service says "HSL values for accent elements",
 *     the org/brand forms say "Secondary highlight color"
 *   - `imageGridCols` — self-service lays the logo/favicon/og fields in one column,
 *     the org/brand forms use three.
 *
 * The color-preview swatches, outer wrappers, heading, submit button, schema, and
 * server action stay in each consumer — they genuinely differ. `control` is typed
 * `Control<any>` because the three forms have different full schemas; the seven
 * field names below are the fixed subset all three share.
 */
export type ThemeFieldName =
  | "primaryColor"
  | "primaryFgColor"
  | "accentColor"
  | "accentFgColor"
  | "logoUrl"
  | "faviconUrl"
  | "ogImageUrl"

type ThemeFieldsetProps = {
  placeholders: Record<ThemeFieldName, string>
  accentColorDescription: string
  imageGridCols: "1" | "3"
}

export function ThemeFieldset({
  placeholders,
  accentColorDescription,
  imageGridCols,
}: ThemeFieldsetProps) {
  // `control` comes from the enclosing <Form {...form}> (FormProvider) context — the
  // three consumers have differently-typed full schemas, so reading control from
  // context avoids passing an invariantly-typed Control across the boundary.
  const { control } = useFormContext()

  // Static class literals (both must appear verbatim so Tailwind's JIT emits them).
  const imageGridClassName =
    imageGridCols === "1" ? "grid gap-4 sm:grid-cols-1" : "grid gap-4 sm:grid-cols-3"

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Color</FormLabel>
              <FormControl>
                <Input placeholder={placeholders.primaryColor} {...field} />
              </FormControl>
              <FormDescription>HSL values without hsl() wrapper</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="primaryFgColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Foreground</FormLabel>
              <FormControl>
                <Input placeholder={placeholders.primaryFgColor} {...field} />
              </FormControl>
              <FormDescription>Text color on primary background</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="accentColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Accent Color</FormLabel>
              <FormControl>
                <Input placeholder={placeholders.accentColor} {...field} />
              </FormControl>
              <FormDescription>{accentColorDescription}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="accentFgColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Accent Foreground</FormLabel>
              <FormControl>
                <Input placeholder={placeholders.accentFgColor} {...field} />
              </FormControl>
              <FormDescription>Text color on accent background</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className={imageGridClassName}>
        <FormField
          control={control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder={placeholders.logoUrl} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="faviconUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Favicon URL</FormLabel>
              <FormControl>
                <Input placeholder={placeholders.faviconUrl} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="ogImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OG Image URL</FormLabel>
              <FormControl>
                <Input placeholder={placeholders.ogImageUrl} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}
