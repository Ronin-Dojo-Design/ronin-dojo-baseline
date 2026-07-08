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
import { ColorField } from "~/components/web/forms/color-field"

/**
 * Shared theme/brand color + asset fieldset (SESSION_0448). Rendered identically by the
 * three theme forms (`brand-settings-form`, `org-theme-form`, `self-service-theme-form`):
 * four HSL color fields (each a `ColorField` picker) + three asset-URL fields.
 * Everything that DIFFERS per form is a prop:
 *   - `placeholders` — every input placeholder (each form has its own copy)
 *   - `accentColorDescription` — self-service says "HSL values for accent elements",
 *     the org/brand forms say "Secondary highlight color"
 *   - `imageGridCols` — self-service lays logo/favicon/og in one column, the org/brand
 *     forms use three.
 *
 * The fields are config-driven (one row per entry) so adding a theme field is a data
 * change, not another copy-pasted `FormField` block. The color-preview swatches, outer
 * wrappers, heading, submit button, schema, and server action stay in each consumer —
 * they genuinely differ. `control` is read from context (`Control<any>`) because the
 * three forms have different full schemas; the seven field names below are the fixed
 * subset all three share.
 */
type ThemeFieldName =
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

/** Asset-URL fields — static (no per-field description, no per-form variation). */
const IMAGE_FIELDS: ReadonlyArray<{ name: ThemeFieldName; label: string }> = [
  { name: "logoUrl", label: "Logo URL" },
  { name: "faviconUrl", label: "Favicon URL" },
  { name: "ogImageUrl", label: "OG Image URL" },
]

export function ThemeFieldset({
  placeholders,
  accentColorDescription,
  imageGridCols,
}: ThemeFieldsetProps) {
  // `control` comes from the enclosing <Form {...form}> (FormProvider) context — the
  // three consumers have differently-typed full schemas, so reading control from
  // context avoids passing an invariantly-typed Control across the boundary.
  const { control } = useFormContext()

  // Built here (not module-level) because only the accent description varies per form.
  const colorFields: ReadonlyArray<{ name: ThemeFieldName; label: string; description: string }> = [
    {
      name: "primaryColor",
      label: "Primary Color",
      description: "HSL values without hsl() wrapper",
    },
    {
      name: "primaryFgColor",
      label: "Primary Foreground",
      description: "Text color on primary background",
    },
    { name: "accentColor", label: "Accent Color", description: accentColorDescription },
    {
      name: "accentFgColor",
      label: "Accent Foreground",
      description: "Text color on accent background",
    },
  ]

  // Static class literals (both must appear verbatim so Tailwind's JIT emits them).
  const imageGridClassName =
    imageGridCols === "1" ? "grid gap-4 sm:grid-cols-1" : "grid gap-4 sm:grid-cols-3"

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {colorFields.map(({ name, label, description }) => (
          <FormField
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <ColorField placeholder={placeholders[name]} {...field} />
                </FormControl>
                <FormDescription>{description}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>

      <div className={imageGridClassName}>
        {IMAGE_FIELDS.map(({ name, label }) => (
          <FormField
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input placeholder={placeholders[name]} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </>
  )
}
