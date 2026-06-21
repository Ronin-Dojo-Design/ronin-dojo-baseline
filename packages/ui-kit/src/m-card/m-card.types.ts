import type { ReactNode } from "react";

/**
 * m-card — the ONE card contract for the shared kernel (ADR 0033 D3).
 *
 * `m-card` is a PRESENTATION view-model over THREE distinct domain aggregates. Its props are
 * already-projected DISPLAY VALUES (strings, formatted dates, a hex tint), never a domain model.
 * A Task, a Deal, and a Record keep separate aggregates/invariants upstream; the card binds to a
 * pre-mapped slice. It never fetches, and it must never receive a non-public field for a public
 * surface — all redaction stays in the projection/mapper.
 *
 * Anatomy it encodes (design-system §4):
 *   - ONE focal value      → `focal` (the single accent-emphasised element; the eye lands once).
 *   - identity cluster     → `icon` + `title` + `meta` (leading glyph, title, secondary meta).
 *   - progressive          → `density` ("compact" | "rich") on ONE component; "rich" reveals the
 *     enrichment           hero + connector rows. Same data, two presentations — never a fork.
 *   - connector-motif rows → `rows` (sequential origin→destination pairs, dotted connector idiom).
 *   - muted secondary meta → `meta`, `rows[].sub`, `footnote` (all `--mk-muted`).
 */

export type MCardKind = "task" | "deal" | "record";

/** Visual density / enrichment level. ONE component renders both. */
export type MCardDensity = "compact" | "rich";

/** A status that maps to a small dot/pill tone. Shared across kinds + the future AdminTaskBoard. */
export type MCardTone = "neutral" | "accent" | "positive" | "warning" | "critical";

/** The single focal value — the one element that gets the accent + emphasis. */
export type MCardFocal = {
  /** The formatted display value, e.g. "$32.45", "Due Fri", "92%". Already a string. */
  value: string;
  /** Tiny caption above/under the value, e.g. "amount", "deadline". Optional, muted. */
  label?: string;
  /** Override the focal tone; defaults to the brand accent. */
  tone?: MCardTone;
};

/** A status badge / pill in the badge row. */
export type MCardBadge = {
  label: string;
  tone?: MCardTone;
};

/**
 * A connector-motif row: a sequential pair (origin → destination) joined by the dotted
 * pin-to-pin connector idiom borrowed from the lineage timeline-tree. Used in `density="rich"`.
 */
export type MCardConnectorRow = {
  /** Leading endpoint label, e.g. an origin / from / start. */
  from: string;
  /** Trailing endpoint label, e.g. a destination / to / end. Omit for a single waypoint. */
  to?: string;
  /** Muted sub-line under the row (time, distance, owner). */
  sub?: string;
};

/** Common, kind-agnostic anatomy. Every kind extends this. */
export type MCardBaseData = {
  /** Stable id for selection callbacks. */
  id: string;
  /** The title — the identity anchor (renders as the H4/semibold title). */
  title: string;
  /** Eyebrow / kicker above the title (kind label · category · project). Muted, uppercase. */
  eyebrow?: string;
  /** Secondary meta line under the title (date · owner · location). Muted, never competes. */
  meta?: string;
  /** The ONE focal value (accent-emphasised). Omit if the card has no headline metric. */
  focal?: MCardFocal;
  /** Badge/pill row (status, tags). */
  badges?: MCardBadge[];
  /** Connector-motif rows — only surfaced in `density="rich"`. */
  rows?: MCardConnectorRow[];
  /**
   * Hero image URL — only surfaced in `density="rich"`. The compact card omits it entirely;
   * the SAME data + this field renders the enriched card (progressive enrichment).
   */
  heroUrl?: string;
  /** Alt text for the hero. */
  heroAlt?: string;
  /** A muted footnote line at the very bottom of a rich card. */
  footnote?: string;
};

/** kind="task" — a board task / list-maker row. */
export type MCardTaskData = MCardBaseData & {
  /** Done-state for the leading checkbox glyph. */
  done?: boolean;
};

/** kind="deal" — a CRM pipeline deal. */
export type MCardDealData = MCardBaseData;

/** kind="record" — a roster / directory / generic entity record. */
export type MCardRecordData = MCardBaseData & {
  /** Avatar URL for the leading identity glyph (records lead with an avatar, not an icon). */
  avatarUrl?: string;
};

export type MCardDataByKind = {
  task: MCardTaskData;
  deal: MCardDealData;
  record: MCardRecordData;
};

export type MCardProps<K extends MCardKind = MCardKind> = {
  kind: K;
  data: MCardDataByKind[K];
  /** "compact" (text-only) ↔ "rich" (+ hero + connector rows). Defaults to "compact". */
  density?: MCardDensity;
  /** Deep-link wrapper (records/deals). Omit for inline task rows. */
  href?: string;
  /** Leading glyph override (icon/avatar slot). Falls back to a kind-default glyph. */
  icon?: ReactNode;
  /** Selected highlight state (board selection / multi-select). */
  selected?: boolean;
  /** Click/select callback — receives the card id. */
  onSelect?: (id: string) => void;
  /** Trailing actions slot (overflow menu, save button) — surface-supplied. */
  actions?: ReactNode;
  /** Extra className merged onto the root. */
  className?: string;
};
