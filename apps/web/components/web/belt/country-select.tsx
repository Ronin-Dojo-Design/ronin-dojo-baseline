"use client"

import { useMemo } from "react"
import { ComboboxSelector } from "~/components/common/combobox-selector"
import { COUNTRIES, countryFlagEmoji } from "~/lib/countries"

/**
 * `CountrySelect` — an ISO 3166-1 alpha-2 country picker for the belt-journey
 * school location (Slice 4 — Petey Plan 0477 Locked #7). Reuse-first: it feeds a
 * static {@link COUNTRIES} array through the shared `ComboboxSelector` (the
 * long/searchable combobox family) and STORES THE ALPHA-2 CODE — never the name.
 *
 * The flag is a Unicode Regional-Indicator emoji derived from the code
 * ({@link countryFlagEmoji}); the option label is `🇧🇷 Brazil` so the search
 * matches the country name. Presentational — value + change come from the parent.
 */
export function CountrySelect({
  value,
  onValueChange,
  placeholder = "Select a country...",
}: {
  /** The currently selected alpha-2 code, or `null`/empty when unset. */
  value: string | null | undefined
  /** Called with the alpha-2 code (or `""` when cleared). */
  onValueChange: (code: string) => void
  placeholder?: string
}) {
  const options = useMemo(
    () =>
      COUNTRIES.map(country => {
        const flag = countryFlagEmoji(country.code)
        return { id: country.code, name: flag ? `${flag} ${country.name}` : country.name }
      }),
    [],
  )

  return (
    <ComboboxSelector
      options={options}
      value={value ?? null}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search countries..."
      emptyMessage="No matching country."
      clearable
      size="lg"
      clearLabel="Clear country"
    />
  )
}
