"use client"

import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/common/form"
import { CountrySelect } from "./country-select"

type CountryFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  placeholder?: string
  className?: string
}

/**
 * `CountryField` — the react-hook-form field wrapper around {@link CountrySelect}
 * (SESSION_0496). Same thin idiom as the `components/common/fields.tsx` primitives
 * (`FormField` + `FormItem` + `FormLabel` + `FormControl` + input + `FormMessage`),
 * but it lives HERE, not in `fields.tsx`: `components/common` never imports from
 * `components/web/*`, and the picker it wraps is the web-layer `CountrySelect`.
 *
 * Stores the ISO 3166-1 alpha-2 code; clearing writes `""` (the shared form-empty
 * convention — schemas map it to null/undefined). Consumers: the canonical
 * `PassportEditor` (`locationCountry`) and the join-the-legacy wizard (`country`).
 */
export function CountryField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
}: CountryFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <CountrySelect
              value={typeof field.value === "string" && field.value ? field.value : null}
              onValueChange={field.onChange}
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
