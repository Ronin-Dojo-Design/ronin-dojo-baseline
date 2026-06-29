import type { ReactNode } from "react";
import type {
  MCardConnectorRow,
  MCardDensity,
  MCardFocal,
  MCardKind,
  MCardProps,
  MCardRecordData,
  MCardTaskData,
} from "./m-card.types";

/**
 * m-card — the kernel BOARD card for `task | deal | record` (doctrine §5; ADR 0033 D3 / ADR 0040).
 *
 * Renders a single skeleton — identity cluster (glyph + title + meta) · ONE focal value · badges,
 * and in `density="rich"`, a golden-ratio hero + connector-motif rows. Only the LEADING GLYPH and
 * a couple of small behaviours branch on `kind`; everything else is shared. It is "uniform within
 * the board" (doctrine §5) — that is what satisfies the board's uniform-stream need, NOT a `kind`
 * god-union spanning catalog + person + board.
 *
 * SURFACE: composes the ported L1 `Card` surface — the root renders `class="mk-surface mk-card"`,
 * so the shell (bg · border · radius · shadow · base padding · focus-visible) comes from `card.css`
 * and `m-card.css` adds only the board anatomy (Option B port, doctrine §6 / [[kernel-extracts-
 * dirstarter-l1-not-cleanroom]]). Token-driven: all color is `var(--mk-*)`. NO brand identifier
 * lives here. Load on an ancestor, in order: `@ronin-dojo/ui-kit/tokens.css` → `card.css` → `m-card.css`.
 */
export function MCard<K extends MCardKind>(props: MCardProps<K>): ReactNode {
  const {
    kind,
    data,
    density = "compact",
    href,
    icon,
    selected,
    onSelect,
    actions,
    className,
  } = props;

  const isRich = density === "rich";
  const interactive = Boolean(href ?? onSelect);

  // Composes the ported L1 surface (card.css) + the board anatomy (m-card.css). See header.
  const rootClassName = className ? `mk-surface mk-card ${className}` : "mk-surface mk-card";

  const body = (
    <>
      <div className="mk-card__top">
        <Glyph kind={kind} data={data} icon={icon} />

        <div className="mk-card__identity">
          {data.eyebrow ? <span className="mk-card__eyebrow">{data.eyebrow}</span> : null}
          <p className="mk-card__title">{data.title}</p>
          {data.meta ? <span className="mk-card__meta">{data.meta}</span> : null}
        </div>

        {data.focal ? <Focal focal={data.focal} /> : null}
        {actions ? <div className="mk-card__actions">{actions}</div> : null}
      </div>

      {data.badges && data.badges.length > 0 ? (
        <div className="mk-card__badges">
          {data.badges.map((badge, i) => (
            <span
              // eslint-disable-next-line react/no-array-index-key -- badges are positional + static
              key={`${badge.label}-${i}`}
              className="mk-card__badge"
              data-tone={badge.tone ?? "neutral"}
            >
              {badge.label}
            </span>
          ))}
        </div>
      ) : null}

      {isRich && data.heroUrl ? (
        <div className="mk-card__hero">
          {/* eslint-disable-next-line @next/next/no-img-element -- kernel is framework-agnostic */}
          <img src={data.heroUrl} alt={data.heroAlt ?? ""} loading="lazy" />
        </div>
      ) : null}

      {isRich && data.rows && data.rows.length > 0 ? (
        <div className="mk-card__rows">
          {data.rows.map((row, i) => (
            // eslint-disable-next-line react/no-array-index-key -- rows are positional + static
            <ConnectorRow key={`${row.from}-${i}`} row={row} />
          ))}
        </div>
      ) : null}

      {isRich && data.footnote ? <span className="mk-card__footnote">{data.footnote}</span> : null}
    </>
  );

  const dataAttrs = {
    "data-kind": kind,
    "data-density": density,
    "data-interactive": interactive ? "true" : undefined,
    "data-selected": selected ? "true" : undefined,
  } as const;

  if (href) {
    return (
      <a className={rootClassName} href={href} {...dataAttrs}>
        {body}
      </a>
    );
  }

  if (onSelect) {
    return (
      <button
        type="button"
        className={rootClassName}
        onClick={() => onSelect(data.id)}
        {...dataAttrs}
      >
        {body}
      </button>
    );
  }

  return (
    <article className={rootClassName} {...dataAttrs}>
      {body}
    </article>
  );
}

/** Leading glyph — kind-default: task → checkbox, record → avatar circle, deal/other → icon slot. */
function Glyph({
  kind,
  data,
  icon,
}: {
  kind: MCardKind;
  data: MCardProps["data"];
  icon?: ReactNode;
}): ReactNode {
  if (kind === "task") {
    const done = (data as MCardTaskData).done ?? false;
    return (
      <span className="mk-card__check" data-done={done ? "true" : "false"} aria-hidden="true">
        {done ? "✓" : ""}
      </span>
    );
  }

  if (kind === "record") {
    const avatarUrl = (data as MCardRecordData).avatarUrl;
    if (avatarUrl) {
      return (
        <span className="mk-card__glyph">
          {/* eslint-disable-next-line @next/next/no-img-element -- framework-agnostic kernel */}
          <img src={avatarUrl} alt="" loading="lazy" />
        </span>
      );
    }
  }

  if (icon) {
    return <span className="mk-card__glyph">{icon}</span>;
  }

  // default glyph — a small token-tinted disc with the kind initial
  return (
    <span className="mk-card__glyph" aria-hidden="true">
      {kindInitial(kind)}
    </span>
  );
}

function kindInitial(kind: MCardKind): string {
  if (kind === "deal") return "$";
  if (kind === "record") return "◍";
  return "•";
}

/** The ONE focal value, accent-emphasised. */
function Focal({ focal }: { focal: MCardFocal }): ReactNode {
  return (
    <span className="mk-card__focal" data-tone={focal.tone ?? "accent"}>
      <span className="mk-card__focal-value">{focal.value}</span>
      {focal.label ? <span className="mk-card__focal-label">{focal.label}</span> : null}
    </span>
  );
}

/** A connector-motif row: from ····> to, with a muted sub-line. */
function ConnectorRow({ row }: { row: MCardConnectorRow }): ReactNode {
  return (
    <div className="mk-card__row">
      <div className="mk-card__row-main">
        <span className="mk-card__row-endpoint">{row.from}</span>
        {row.to ? (
          <>
            <span className="mk-card__row-connector" aria-hidden="true" />
            <span className="mk-card__row-endpoint">{row.to}</span>
          </>
        ) : null}
      </div>
      {row.sub ? <span className="mk-card__row-sub">{row.sub}</span> : null}
    </div>
  );
}

export type { MCardDensity };
