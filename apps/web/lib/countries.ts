/**
 * A compact ISO 3166-1 alpha-2 country list for the belt-journey school-location
 * field (Slice 4 — Petey Plan 0477 Locked #7). Reuse-first: a static array fed
 * through the shared `ComboboxSelector`, NO new dependency (a full i18n country
 * package would be dead weight for a single select). The stored value is always
 * the alpha-2 `code`; the label + flag are presentation only.
 *
 * The flag is derived from the alpha-2 code via Unicode Regional Indicator
 * symbols (`countryFlagEmoji`) — a pure two-codepoint transform, so no per-country
 * emoji table is maintained. Falls back to an empty string for a malformed code.
 */

export type Country = {
  /** ISO 3166-1 alpha-2 code — the persisted value. */
  code: string
  /** English short name — the searchable/display label. */
  name: string
}

/**
 * Curated list, skewed to where BJJ lineage concentrates (BR/US/EU) but broad
 * enough to cover the membership. Alphabetical by name. Extend as needed — the
 * `ComboboxSelector` search keeps a longer list usable.
 */
export const COUNTRIES: Country[] = [
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NO", name: "Norway" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RU", name: "Russia" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "RS", name: "Serbia" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Turkey" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
]

const CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  COUNTRIES.map(country => [country.code, country.name]),
)

/** Look up the display name for an alpha-2 code; returns the code itself if unknown. */
export function getCountryLabel(code: string | null | undefined): string {
  if (!code) return ""
  const upper = code.trim().toUpperCase()
  return CODE_TO_NAME[upper] ?? upper
}

/**
 * The flag emoji for a well-formed alpha-2 code, built from the two Regional
 * Indicator codepoints (`A`→U+1F1E6 … `Z`→U+1F1FF). Returns `""` for anything
 * that is not exactly two ASCII letters, so a stray value never crashes render.
 */
export function countryFlagEmoji(code: string | null | undefined): string {
  if (!code) return ""
  const upper = code.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(upper)) return ""
  const A = 0x41
  const REGIONAL_BASE = 0x1f1e6
  const first = REGIONAL_BASE + (upper.charCodeAt(0) - A)
  const second = REGIONAL_BASE + (upper.charCodeAt(1) - A)
  return String.fromCodePoint(first, second)
}
