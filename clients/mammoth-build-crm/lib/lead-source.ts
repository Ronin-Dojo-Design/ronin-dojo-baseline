/**
 * Lead Source vocabulary — the ONE home for the `LeadSource` enum values on the
 * app side (mirrors `enum LeadSource` in prisma/schema.prisma; brief §3a #1
 * source tracking). Shared by the lead-sheet ingest preview, the sales-cockpit
 * roster, and the board-card mapper so the label set can't drift per surface.
 */

export const LEAD_SOURCES = [
  "referral",
  "web_form",
  "phone",
  "email",
  "trade_show",
  "other",
] as const;

export type LeadSourceValue = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSourceValue, string> = {
  referral: "Referral",
  web_form: "Web form",
  phone: "Phone",
  email: "Email",
  trade_show: "Trade show",
  other: "Other",
};

/** Free-text spellings a lead sheet may use, keyed by canonical value. */
const SOURCE_ALIASES: Record<LeadSourceValue, string[]> = {
  referral: ["referral", "ref", "word of mouth", "referral partner", "referred"],
  web_form: ["web form", "webform", "web", "website", "online", "form", "inquiry form"],
  phone: ["phone", "call", "phone call", "inbound call", "cold call"],
  email: ["email", "e mail", "inbound email"],
  trade_show: ["trade show", "tradeshow", "expo", "event"],
  other: ["other", "unknown", "misc"],
};

const ALIAS_TO_SOURCE: ReadonlyMap<string, LeadSourceValue> = new Map(
  (Object.keys(SOURCE_ALIASES) as LeadSourceValue[]).flatMap((value) => [
    [value, value] as const,
    ...SOURCE_ALIASES[value].map((alias) => [alias, value] as const),
  ]),
);

/** Display label for a persisted enum value; total over strings for read models. */
export function leadSourceLabel(value: string): string {
  return (LEAD_SOURCE_LABELS as Record<string, string>)[value] ?? value;
}

export type NormalizedLeadSource = {
  value: LeadSourceValue;
  /** False only when a NON-EMPTY spelling wasn't recognized (fell back to `other`). */
  matched: boolean;
};

/**
 * Map a lead sheet's free-text source to the enum. Empty/missing maps to
 * `other` silently (a sheet without provenance is not an error); an
 * unrecognized non-empty spelling also maps to `other` but flags `matched:
 * false` so the ingest preview can surface it as a per-row issue.
 */
export function normalizeLeadSource(raw: string | null | undefined): NormalizedLeadSource {
  const key = (raw ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (!key) return { value: "other", matched: true };
  const value = ALIAS_TO_SOURCE.get(key);
  return value ? { value, matched: true } : { value: "other", matched: false };
}

/**
 * Tally a list of persisted Lead Source values by canonical bucket — the
 * per-source counts the roster facet and the pipeline board facet both need
 * (SESSION_0586, G-021 loop 3b). Routes every raw value through
 * `normalizeLeadSource` (the same normalizer the ingest preview uses) so a
 * stray non-canonical string folds into `other` instead of its own bucket;
 * persisted `Project.source`/`Contact.source` values are always already
 * canonical, so this is a defensive no-op on real data. Buckets with zero
 * items are omitted — callers that need every source to render a chip
 * (including at zero) iterate `LEAD_SOURCES` and default missing keys to 0.
 */
export function countLeadSources(
  values: readonly (string | null | undefined)[],
): Partial<Record<LeadSourceValue, number>> {
  const counts: Partial<Record<LeadSourceValue, number>> = {};
  for (const raw of values) {
    const { value } = normalizeLeadSource(raw);
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}
