"use client";

import { LEAD_SOURCES, leadSourceLabel, type LeadSourceValue } from "@/lib/lead-source";

/**
 * Lead Source facet — the ONE filter-chip row shared by the Sales-cockpit lead
 * roster (`/app/sales`) and the pipeline board (`/app`) (SESSION_0586, G-021
 * loop 3b). Chips cover every canonical `LEAD_SOURCES` value, not just the
 * ones present in the current data — a zero-count source stays selectable so
 * the honest "No Referral leads" empty state is reachable, not just theoretical.
 */
export function LeadSourceFacet({
  counts,
  total,
  selected,
  onSelect,
}: {
  /** Per-source counts; missing keys read as 0. */
  counts: Partial<Record<LeadSourceValue, number>>;
  total: number;
  selected: LeadSourceValue | null;
  onSelect: (value: LeadSourceValue | null) => void;
}) {
  return (
    <div role="group" aria-label="Filter by Lead Source" className="flex flex-wrap gap-2">
      <FacetChip label="All" count={total} active={selected === null} onClick={() => onSelect(null)} />
      {LEAD_SOURCES.map((value) => (
        <FacetChip
          key={value}
          label={leadSourceLabel(value)}
          count={counts[value] ?? 0}
          active={selected === value}
          onClick={() => onSelect(value)}
        />
      ))}
    </div>
  );
}

function FacetChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted hover:border-primary hover:text-ink"
      }`}
    >
      {label}
      <span className={active ? "text-primary" : "text-muted"}>{count}</span>
    </button>
  );
}
