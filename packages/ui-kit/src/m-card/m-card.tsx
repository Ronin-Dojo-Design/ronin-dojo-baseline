/**
 * m-card — THIN LOCAL STUB (PWCC-002).
 *
 * ⚠ RECONCILE: PWCC-002 (`m-card`) is being built in parallel. This stub exists only
 * so AdminKanban (PWCC-007) can compile and ship its first slice. When the real m-card
 * lands in this package, replace this file with the canonical contract and re-point the
 * board's import — the public shape below (`kind`, `data`, `density`, `selected`,
 * `onSelect`, `actions`) intentionally matches the spec in
 * docs/knowledge/wiki/files/m-card-pattern.md so the swap is a one-line import change.
 *
 * It is presentation-only and brand-agnostic: styling rides design tokens (CSS vars),
 * never a hex value or a brand name. See ADR 0033 D3 (one card, distinct aggregates).
 */

import type { CSSProperties, ReactNode } from "react"

export type MCardKind = "roster" | "rank" | "task" | "deal" | "loop" | "generic"

export type MCardLifecycle = "active" | "inactive" | "deprecated" | "broken"

export interface MCardTaskData {
  id: string
  title: string
  due?: string
  lane?: "QF" | "HF"
  status?: MCardLifecycle
  meta?: string
  /** One focal value (design-system §4) — e.g. a deal value, right-aligned. */
  focal?: string
  /** At-risk = the only loud signal; renders the accent rail + ⚠. */
  atRisk?: boolean
  atRiskLabel?: string
  badges?: string[]
}

export interface MCardProps {
  kind: MCardKind
  data: MCardTaskData
  href?: string
  density?: "comfortable" | "compact"
  selected?: boolean
  onSelect?: (id: string) => void
  actions?: ReactNode
}

const STATUS_TINT: Record<MCardLifecycle, string> = {
  active: "var(--accent, #6366f1)",
  inactive: "var(--text-muted, #9ca3af)",
  deprecated: "var(--text-muted, #9ca3af)",
  broken: "var(--danger, var(--accent, #ef4444))",
}

/**
 * Stub renderer — eyebrow → title → focal → meta → badges → actions, matching the
 * m-card skeleton. Loud only on at-risk (accent rail). Tokens only.
 */
export function MCard({
  kind,
  data,
  href,
  density = "comfortable",
  selected,
  onSelect,
  actions,
}: MCardProps) {
  const tint = data.atRisk
    ? "var(--danger, var(--accent, #ef4444))"
    : STATUS_TINT[data.status ?? "active"]

  const pad = density === "compact" ? "0.5rem 0.625rem" : "0.625rem 0.75rem"

  const style: CSSProperties = {
    position: "relative",
    display: "block",
    width: "100%",
    minWidth: 0,
    padding: pad,
    borderRadius: "0.75rem",
    border: `1px solid ${selected ? "var(--accent, #6366f1)" : "var(--border, #2a2e33)"}`,
    background: "var(--surface, #16181b)",
    color: "var(--text-primary, inherit)",
    textAlign: "left",
    cursor: onSelect || href ? "pointer" : "default",
    boxShadow: data.atRisk ? `inset 3px 0 0 0 ${tint}` : "none",
  }

  const body = (
    <>
      <div
        style={{
          fontSize: "0.625rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--text-muted, #9ba1a8)",
          fontWeight: 600,
        }}
      >
        {kind}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.5rem",
          marginTop: "0.125rem",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "0.9375rem", minWidth: 0 }}>{data.title}</span>
        {data.focal ? (
          <span style={{ fontWeight: 700, color: "var(--accent, #6366f1)", whiteSpace: "nowrap" }}>
            {data.focal}
          </span>
        ) : null}
      </div>
      {data.meta ? (
        <div
          style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted, #9ba1a8)" }}
        >
          {data.meta}
        </div>
      ) : null}
      {data.atRisk ? (
        <div style={{ marginTop: "0.375rem", fontSize: "0.75rem", fontWeight: 600, color: tint }}>
          ⚠ {data.atRiskLabel ?? "At risk"}
        </div>
      ) : null}
      {data.badges?.length ? (
        <div style={{ marginTop: "0.375rem", display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
          {data.badges.map(b => (
            <span
              key={b}
              style={{
                fontSize: "0.6875rem",
                padding: "0.0625rem 0.375rem",
                borderRadius: "9999px",
                background: "color-mix(in srgb, var(--accent, #6366f1) 15%, transparent)",
                color: "var(--accent, #6366f1)",
              }}
            >
              {b}
            </span>
          ))}
        </div>
      ) : null}
      {actions ? <div style={{ marginTop: "0.5rem" }}>{actions}</div> : null}
    </>
  )

  if (onSelect) {
    return (
      <button type="button" style={style} aria-pressed={selected} onClick={() => onSelect(data.id)}>
        {body}
      </button>
    )
  }
  return <div style={style}>{body}</div>
}
