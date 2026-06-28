"use client";

/**
 * AdminKanban (PWCC-007) — the config-driven column/stage board.
 *
 * ZERO per-project code (ADR 0033 D5): everything project-specific arrives as a
 * `BoardConfig` (stages + automations + brand + cardKind) and a token block. To target a
 * new project you write only its config + token block — never edit this file.
 *
 * - columns = `config.stages` (terminal stages collapse into a Won/Lost column)
 * - cards = m-card(kind=config.cardKind), at-risk bumped to top (the one loud signal)
 * - drag between columns (HTML5 DnD) + keyboard-free menu move for a11y
 * - quick-add at each column foot (title → enter)
 * - "+ New lead" intake form → card in the intake stage (deal boards only; a `task`
 *   board has no leads, so it gets quick-add without the contact form)
 * - blocked moves (order-guard / lost-reason) → toast + no state change
 *
 * Theming is tokens only — no hex, no brand name. Dark/light inherited from the token layer.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MCard } from "../m-card/m-card";
import type { MCardBadge, MCardTaskData } from "../m-card/m-card.types";
import { sortColumn } from "./automations";
import type { BoardStore } from "./board-store";
import { useBoard } from "./use-board";
import type { BoardCard, BoardConfig, CardFlags, StageConfig } from "./types";

export interface AdminKanbanProps {
  config: BoardConfig;
  store: BoardStore;
  seed?: BoardCard[];
  /** Injectable clock for deterministic tests/stories. */
  now?: () => number;
  /**
   * Read-only projection mode (default false). Suppresses every edit affordance —
   * the intake form, per-column quick-add, card drag, and the move menu — so the
   * board renders as a pure, non-mutating view (e.g. a ledger-status projection).
   */
  readOnly?: boolean;
}

const RISK_LABEL: Record<string, string> = {
  rotting: "Rotting — no recent activity",
  "no-next-step": "No next step set",
  "stage-sla": "Past stage SLA",
};

/**
 * Project a board card onto the shared kernel m-card view-model (MCardTaskData).
 *
 * The kernel card carries no `atRisk`/`due`/`lane`/`status` fields — those are board-domain
 * concerns. We surface them through the card's generic anatomy: at-risk becomes the ONE loud
 * signal as a `critical`-tone badge, `due` folds into the muted meta line, and the order-guard
 * field rides a neutral badge. The card stays a pure presentation slice (ADR 0033 D3).
 */
/** The badge row: at-risk (the one loud signal) → order-guard → generic passthrough. */
function buildBadges(card: BoardCard, flags?: CardFlags): MCardBadge[] | undefined {
  const badges: MCardBadge[] = [];
  if (flags?.atRisk) {
    const reason = flags.reasons[0];
    badges.push({ label: (reason && RISK_LABEL[reason]) || "At risk", tone: "critical" });
  }
  if (card.fields?.orderNumber) {
    badges.push({ label: `Order ${String(card.fields.orderNumber)}` });
  }
  // Generic passthrough badges (e.g. a ledger code + priority) ride after the computed ones.
  if (card.badges?.length) {
    badges.push(...card.badges);
  }
  return badges.length > 0 ? badges : undefined;
}

/** The muted meta line: next step (or contact) · due date. */
function buildMeta(card: BoardCard): string | undefined {
  const metaParts: string[] = [];
  const next = card.nextStep?.trim() ? `Next: ${card.nextStep}` : card.contact?.name;
  if (next) {
    metaParts.push(next);
  }
  if (card.due) {
    metaParts.push(`Due ${card.due}`);
  }
  return metaParts.length > 0 ? metaParts.join(" · ") : undefined;
}

function cardToMData(card: BoardCard, flags?: CardFlags): MCardTaskData {
  return {
    id: card.id,
    title: card.title,
    meta: buildMeta(card),
    focal:
      typeof card.value === "number"
        ? { value: formatValue(card.value), label: "value" }
        : undefined,
    badges: buildBadges(card, flags),
  };
}

function formatValue(v: number): string {
  return v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`;
}

export function AdminKanban({ config, store, seed, now, readOnly = false }: AdminKanbanProps) {
  const board = useBoard({ config, store, seed, now });
  const [toast, setToast] = useState<string | null>(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Lead intake is a deal-board concept (a lead becomes a deal). A `task` board (e.g. a
  // governance backlog) has no leads, so it gets quick-add only — never the contact form,
  // whose contact fields the task mapper would silently drop on save.
  const showIntake = !readOnly && config.cardKind === "deal";

  function flash(message: string) {
    setToast(message);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  const columns = useMemo(() => {
    return config.stages.map((stage) => {
      const inStage = board.cards.filter((c) => c.stage === stage.id);
      const sorted = sortColumn(inStage, board.flags);
      return { stage, cards: sorted };
    });
  }, [config.stages, board.cards, board.flags]);

  function handleDrop(cardId: string, toStageId: string) {
    const result = board.move(cardId, toStageId);
    if (!result.ok) {
      flash(result.message);
    }
  }

  return (
    <section data-board={config.brand} aria-label={config.title} style={shell}>
      <header style={headerRow}>
        <div>
          <p style={eyebrow}>{config.title}</p>
          <p style={subtle}>
            {board.cards.length} cards
            {board.atRiskCount > 0 ? ` · ${board.atRiskCount} at risk` : ""}
          </p>
        </div>
        {showIntake ? (
          <button type="button" style={primaryBtn} onClick={() => setIntakeOpen((v) => !v)}>
            + New lead
          </button>
        ) : null}
      </header>

      {intakeOpen && showIntake ? (
        <IntakeForm
          onSubmit={(input) => {
            const result = board.intake(input);
            if (!result.ok) {
              flash(result.message);
            } else {
              setIntakeOpen(false);
            }
          }}
          onCancel={() => setIntakeOpen(false)}
        />
      ) : null}

      <BoardColumns
        columns={columns}
        renderColumn={(stage, cards) => (
          <Column
            key={stage.id}
            stage={stage}
            cards={cards}
            cardKind={config.cardKind}
            flags={board.flags}
            stages={config.stages}
            hydrated={board.hydrated}
            readOnly={readOnly}
            onDrop={(cardId) => handleDrop(cardId, stage.id)}
            onQuickAdd={(title) => board.quickAdd(stage.id, title)}
            onMenuMove={(cardId, to) => handleDrop(cardId, to)}
          />
        )}
      />

      {toast ? (
        <div role="alert" style={toastStyle}>
          {toast}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Carousel controller — owns the rail ref + derived scroll state (active column, can-scroll
 * left/right) and the smooth scroll-to-index. Recomputes on scroll + resize. The view (BoardColumns)
 * stays pure JSX. Column step = first column width + the inter-column gap.
 */
function useColumnCarousel(count: number) {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const stepWidth = useCallback((rail: HTMLDivElement) => {
    const first = rail.querySelector<HTMLElement>("[data-stage]");
    return first ? first.getBoundingClientRect().width + COLUMN_GAP_PX : rail.clientWidth;
  }, []);

  const update = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    setCanLeft(rail.scrollLeft > 4);
    setCanRight(rail.scrollLeft < max - 4);
    const step = stepWidth(rail);
    setActive(step > 0 ? Math.min(count - 1, Math.round(rail.scrollLeft / step)) : 0);
  }, [count, stepWidth]);

  useEffect(() => {
    update();
    const rail = railRef.current;
    if (!rail) return;
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const rail = railRef.current;
      if (!rail) return;
      rail.scrollTo({ left: index * stepWidth(rail), behavior: "smooth" });
    },
    [stepWidth],
  );

  return { railRef, active, canLeft, canRight, scrollToIndex };
}

/**
 * BoardColumns — the mobile-first swipe carousel that hosts the stage columns.
 *
 * Generic + presentation-only (ADR 0033 D5): no project/brand concepts leak in. On a phone the
 * columns are a snap-mandatory horizontal rail (one column + a peek of the next), navigable by
 * swipe, by the tappable column pager (name + count), or by the prev/next arrows; edge-fade
 * gradients signal more off-screen. On a wide desktop all columns sit side-by-side and the
 * affordances quietly disable themselves (nothing to scroll). The same idiom as the BBL/TuffBuffs
 * `CarouselRail` (snap-x mandatory, fixed item width, arrows-when-scrollable, edge fades).
 */
function BoardColumns({
  columns,
  renderColumn,
}: {
  columns: { stage: StageConfig; cards: BoardCard[] }[];
  renderColumn: (stage: StageConfig, cards: BoardCard[]) => ReactNode;
}) {
  const { railRef, active, canLeft, canRight, scrollToIndex } = useColumnCarousel(columns.length);

  return (
    <div style={boardWrap}>
      <div style={pagerRow}>
        <div style={pagerChips} role="tablist" aria-label="Jump to column">
          {columns.map(({ stage, cards }, index) => (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={active === index}
              style={active === index ? { ...pagerChip, ...pagerChipActive } : pagerChip}
              onClick={() => scrollToIndex(index)}
            >
              {stage.name}
              <span style={pagerCount}>{cards.length}</span>
            </button>
          ))}
        </div>
        <div style={pagerArrows}>
          <button
            type="button"
            aria-label="Previous column"
            disabled={!canLeft}
            style={canLeft ? arrowBtn : { ...arrowBtn, ...arrowBtnDisabled }}
            onClick={() => scrollToIndex(Math.max(0, active - 1))}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next column"
            disabled={!canRight}
            style={canRight ? arrowBtn : { ...arrowBtn, ...arrowBtnDisabled }}
            onClick={() => scrollToIndex(Math.min(columns.length - 1, active + 1))}
          >
            ›
          </button>
        </div>
      </div>

      <div style={railWrap}>
        <div ref={railRef} className="mk-board-rail" style={railStyle} role="list">
          {columns.map(({ stage, cards }) => renderColumn(stage, cards))}
        </div>
        {canLeft ? <div aria-hidden style={fadeLeft} /> : null}
        {canRight ? <div aria-hidden style={fadeRight} /> : null}
      </div>

      {/* Hide the rail scrollbar (webkit) — Firefox/IE use the inline scrollbarWidth. */}
      <style>{".mk-board-rail::-webkit-scrollbar{display:none}"}</style>
    </div>
  );
}

function Column({
  stage,
  cards,
  cardKind,
  flags,
  stages,
  hydrated,
  readOnly,
  onDrop,
  onQuickAdd,
  onMenuMove,
}: {
  stage: StageConfig;
  cards: BoardCard[];
  cardKind: BoardConfig["cardKind"];
  flags: Map<string, CardFlags>;
  stages: StageConfig[];
  hydrated: boolean;
  readOnly: boolean;
  onDrop: (cardId: string) => void;
  onQuickAdd: (title: string) => void;
  onMenuMove: (cardId: string, toStageId: string) => void;
}) {
  const [over, setOver] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <div
      role="listitem"
      data-stage={stage.id}
      style={{ ...columnStyle, ...(over ? columnOver : null) }}
      onDragOver={
        readOnly
          ? undefined
          : (e) => {
              e.preventDefault();
              setOver(true);
            }
      }
      onDragLeave={readOnly ? undefined : () => setOver(false)}
      onDrop={
        readOnly
          ? undefined
          : (e) => {
              e.preventDefault();
              setOver(false);
              const id = e.dataTransfer.getData("text/card-id");
              if (id) {
                onDrop(id);
              }
            }
      }
    >
      <div style={columnHead}>
        <span style={columnTitle}>{stage.name}</span>
        <span style={countChip}>{cards.length}</span>
      </div>
      {stage.gate ? <p style={gateLine}>{stage.gate}</p> : null}

      <div style={columnBody}>
        {!hydrated ? (
          <p style={emptyState}>Loading…</p>
        ) : cards.length === 0 ? (
          <p style={emptyState}>{stage.intake ? "No leads yet — add one" : "—"}</p>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              draggable={!readOnly}
              onDragStart={
                readOnly ? undefined : (e) => e.dataTransfer.setData("text/card-id", card.id)
              }
              style={readOnly ? undefined : { cursor: "grab" }}
            >
              <MCard
                kind={cardKind}
                data={cardToMData(card, flags.get(card.id))}
                actions={
                  readOnly ? undefined : (
                    <MoveMenu
                      cardId={card.id}
                      currentStage={stage.id}
                      stages={stages}
                      onMove={onMenuMove}
                    />
                  )
                }
              />
            </div>
          ))
        )}
      </div>

      {!stage.terminal && !readOnly ? (
        adding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onQuickAdd(draft);
              setDraft("");
              setAdding(false);
            }}
          >
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => setAdding(false)}
              placeholder="Card title…"
              style={quickAddInput}
              aria-label={`Quick add to ${stage.name}`}
            />
          </form>
        ) : (
          <button type="button" style={quickAddBtn} onClick={() => setAdding(true)}>
            + quick add
          </button>
        )
      ) : null}
    </div>
  );
}

/** Keyboard/menu move — a11y path so a card moves without a drag. */
function MoveMenu({
  cardId,
  currentStage,
  stages,
  onMove,
}: {
  cardId: string;
  currentStage: string;
  stages: StageConfig[];
  onMove: (cardId: string, toStageId: string) => void;
}) {
  return (
    <label style={{ fontSize: "0.6875rem", color: "var(--text-muted, #9ba1a8)" }}>
      Move
      <select
        value={currentStage}
        onChange={(e) => {
          if (e.target.value !== currentStage) {
            onMove(cardId, e.target.value);
          }
        }}
        aria-label="Move card to stage"
        style={moveSelect}
      >
        {stages.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function IntakeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: {
    title: string;
    contact?: { name?: string; phone?: string; email?: string };
    source?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("web");

  return (
    <form
      style={intakeFormStyle}
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) {
          return;
        }
        onSubmit({ title, contact: { name, email, phone }, source });
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Lead title"
        style={intakeInput}
        aria-label="Lead title"
        autoFocus
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Contact name"
        style={intakeInput}
        aria-label="Contact name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={intakeInput}
        aria-label="Email"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
        style={intakeInput}
        aria-label="Phone"
      />
      <select
        value={source}
        onChange={(e) => setSource(e.target.value)}
        style={intakeInput}
        aria-label="Source"
      >
        <option value="web">Web form</option>
        <option value="manual">Manual</option>
        <option value="email">Email</option>
      </select>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" style={primaryBtn}>
          Add lead
        </button>
        <button type="button" style={ghostBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ---- token-only styles (no hex except graceful CSS-var fallbacks) ---- */

import type { CSSProperties, ReactNode } from "react";

/** Inter-column gap in px — kept in sync with `railStyle.gap` for the carousel step math. */
const COLUMN_GAP_PX = 12;

const shell: CSSProperties = {
  color: "var(--text-primary, inherit)",
  fontFamily: "var(--font-sans, inherit)",
};
const headerRow: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "1rem",
  flexWrap: "wrap",
};
const eyebrow: CSSProperties = {
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "var(--accent, #6366f1)",
  fontWeight: 600,
};
const subtle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--text-muted, #9ba1a8)",
  marginTop: "0.125rem",
};
const boardWrap: CSSProperties = { marginTop: "1rem" };
const pagerRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "0.625rem",
};
const pagerChips: CSSProperties = {
  display: "flex",
  gap: "0.375rem",
  overflowX: "auto",
  flex: "1 1 auto",
  scrollbarWidth: "none",
  paddingBottom: "0.125rem",
};
const pagerChip: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  flex: "0 0 auto",
  borderRadius: "999px",
  border: "1px solid var(--border, #2a2e33)",
  background: "color-mix(in srgb, var(--surface, #16181b) 60%, transparent)",
  color: "var(--text-muted, #9ba1a8)",
  padding: "0.25rem 0.625rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
const pagerChipActive: CSSProperties = {
  background: "var(--accent, #6366f1)",
  // Full `border` shorthand (not `borderColor`) so it doesn't mix with the base
  // chip's shorthand on the active rerender — React warns on shorthand/longhand mixing.
  border: "1px solid var(--accent, #6366f1)",
  color: "var(--accent-foreground, #0e0f11)",
};
const pagerCount: CSSProperties = { fontSize: "0.6875rem", opacity: 0.85 };
const pagerArrows: CSSProperties = { display: "flex", gap: "0.25rem", flex: "0 0 auto" };
const arrowBtn: CSSProperties = {
  width: "1.75rem",
  height: "1.75rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  border: "1px solid var(--border, #2a2e33)",
  background: "var(--surface, #16181b)",
  color: "var(--text-primary, inherit)",
  fontSize: "1rem",
  lineHeight: 1,
  cursor: "pointer",
};
const arrowBtnDisabled: CSSProperties = { opacity: 0.35, cursor: "default" };
const railWrap: CSSProperties = { position: "relative" };
const railStyle: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  overflowX: "auto",
  paddingBottom: "1rem",
  scrollSnapType: "x mandatory",
  scrollbarWidth: "none",
};
const fadeEdge: CSSProperties = {
  position: "absolute",
  top: 0,
  bottom: "1rem",
  width: "1.5rem",
  pointerEvents: "none",
};
const fadeLeft: CSSProperties = {
  ...fadeEdge,
  left: 0,
  background: "linear-gradient(to right, var(--surface, #16181b), transparent)",
};
const fadeRight: CSSProperties = {
  ...fadeEdge,
  right: 0,
  background: "linear-gradient(to left, var(--surface, #16181b), transparent)",
};
const columnStyle: CSSProperties = {
  width: "min(86vw, 18rem)",
  flex: "0 0 auto",
  scrollSnapAlign: "start",
  borderRadius: "0.75rem",
  padding: "0.625rem",
  background: "color-mix(in srgb, var(--surface, #16181b) 60%, transparent)",
  border: "1px solid var(--border, #2a2e33)",
};
const columnOver: CSSProperties = {
  // Full `border` shorthand (not `borderColor`) to avoid mixing with `columnStyle`'s
  // shorthand on the drag-over rerender (React shorthand/longhand warning).
  border: "1px solid var(--accent, #6366f1)",
  background: "color-mix(in srgb, var(--accent, #6366f1) 8%, transparent)",
};
const columnHead: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: "0.375rem",
  borderBottom: "1px solid var(--border, #2a2e33)",
};
const columnTitle: CSSProperties = {
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontWeight: 600,
  color: "var(--text-muted, #9ba1a8)",
};
const countChip: CSSProperties = { fontSize: "0.6875rem", color: "var(--text-muted, #9ba1a8)" };
const gateLine: CSSProperties = {
  marginTop: "0.25rem",
  fontSize: "0.625rem",
  color: "var(--text-muted, #9ba1a8)",
};
const columnBody: CSSProperties = {
  marginTop: "0.625rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  minHeight: "2rem",
};
const emptyState: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--text-muted, #9ba1a8)",
  textAlign: "center",
  padding: "0.75rem",
  border: "1px dashed var(--border, #2a2e33)",
  borderRadius: "0.5rem",
};
const primaryBtn: CSSProperties = {
  borderRadius: "0.5rem",
  background: "var(--accent, #6366f1)",
  color: "var(--accent-foreground, #0e0f11)",
  padding: "0.4375rem 0.875rem",
  fontSize: "0.8125rem",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
};
const ghostBtn: CSSProperties = {
  borderRadius: "0.5rem",
  background: "transparent",
  color: "var(--text-muted, #9ba1a8)",
  padding: "0.4375rem 0.875rem",
  fontSize: "0.8125rem",
  border: "1px solid var(--border, #2a2e33)",
  cursor: "pointer",
};
const quickAddBtn: CSSProperties = {
  marginTop: "0.5rem",
  width: "100%",
  borderRadius: "0.5rem",
  background: "transparent",
  color: "var(--text-muted, #9ba1a8)",
  padding: "0.375rem",
  fontSize: "0.75rem",
  border: "1px dashed var(--border, #2a2e33)",
  cursor: "pointer",
};
const quickAddInput: CSSProperties = {
  marginTop: "0.5rem",
  width: "100%",
  borderRadius: "0.5rem",
  background: "var(--surface, #16181b)",
  color: "var(--text-primary, inherit)",
  padding: "0.4375rem",
  fontSize: "0.8125rem",
  border: "1px solid var(--accent, #6366f1)",
};
const moveSelect: CSSProperties = {
  marginLeft: "0.375rem",
  background: "var(--surface, #16181b)",
  color: "var(--text-primary, inherit)",
  border: "1px solid var(--border, #2a2e33)",
  borderRadius: "0.375rem",
  fontSize: "0.6875rem",
  padding: "0.125rem 0.25rem",
};
const intakeFormStyle: CSSProperties = {
  marginTop: "1rem",
  display: "grid",
  gap: "0.5rem",
  maxWidth: "24rem",
  padding: "0.875rem",
  borderRadius: "0.75rem",
  border: "1px solid var(--border, #2a2e33)",
  background: "var(--surface, #16181b)",
};
const intakeInput: CSSProperties = {
  borderRadius: "0.5rem",
  background: "color-mix(in srgb, var(--surface, #16181b) 60%, transparent)",
  color: "var(--text-primary, inherit)",
  padding: "0.4375rem 0.625rem",
  fontSize: "0.8125rem",
  border: "1px solid var(--border, #2a2e33)",
};
const toastStyle: CSSProperties = {
  position: "fixed",
  bottom: "1.5rem",
  left: "50%",
  transform: "translateX(-50%)",
  background: "var(--surface-elevated, #1f2226)",
  color: "var(--text-primary, inherit)",
  border: "1px solid var(--accent, #6366f1)",
  borderRadius: "0.625rem",
  padding: "0.625rem 1rem",
  fontSize: "0.8125rem",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  zIndex: 50,
};
