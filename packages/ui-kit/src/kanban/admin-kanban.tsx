"use client"

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
 * - "+ New lead" intake form → card in the intake stage
 * - blocked moves (order-guard / lost-reason) → toast + no state change
 *
 * Theming is tokens only — no hex, no brand name. Dark/light inherited from the token layer.
 */

import { useMemo, useRef, useState } from "react"
import { MCard, type MCardTaskData } from "../m-card/m-card"
import { sortColumn } from "./automations"
import type { BoardStore } from "./board-store"
import { useBoard } from "./use-board"
import type { BoardCard, BoardConfig, CardFlags, StageConfig } from "./types"

export interface AdminKanbanProps {
  config: BoardConfig
  store: BoardStore
  seed?: BoardCard[]
  /** Injectable clock for deterministic tests/stories. */
  now?: () => number
}

const RISK_LABEL: Record<string, string> = {
  rotting: "Rotting — no recent activity",
  "no-next-step": "No next step set",
  "stage-sla": "Past stage SLA",
}

function cardToMData(card: BoardCard, flags?: CardFlags): MCardTaskData {
  const reason = flags?.reasons[0]
  return {
    id: card.id,
    title: card.title,
    due: card.due,
    lane: card.lane,
    status: flags?.atRisk ? "broken" : card.status,
    meta: card.nextStep?.trim() ? `Next: ${card.nextStep}` : card.contact?.name,
    focal: typeof card.value === "number" ? formatValue(card.value) : undefined,
    atRisk: flags?.atRisk,
    atRiskLabel: reason ? RISK_LABEL[reason] : undefined,
    badges: card.fields?.orderNumber ? [`Order ${String(card.fields.orderNumber)}`] : undefined,
  }
}

function formatValue(v: number): string {
  return v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`
}

export function AdminKanban({ config, store, seed, now }: AdminKanbanProps) {
  const board = useBoard({ config, store, seed, now })
  const [toast, setToast] = useState<string | null>(null)
  const [intakeOpen, setIntakeOpen] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function flash(message: string) {
    setToast(message)
    if (toastTimer.current) {
      clearTimeout(toastTimer.current)
    }
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  const columns = useMemo(() => {
    return config.stages.map(stage => {
      const inStage = board.cards.filter(c => c.stage === stage.id)
      const sorted = sortColumn(inStage, board.flags)
      return { stage, cards: sorted }
    })
  }, [config.stages, board.cards, board.flags])

  function handleDrop(cardId: string, toStageId: string) {
    const result = board.move(cardId, toStageId)
    if (!result.ok) {
      flash(result.message)
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
        <button type="button" style={primaryBtn} onClick={() => setIntakeOpen(v => !v)}>
          + New lead
        </button>
      </header>

      {intakeOpen ? (
        <IntakeForm
          onSubmit={input => {
            const result = board.intake(input)
            if (!result.ok) {
              flash(result.message)
            } else {
              setIntakeOpen(false)
            }
          }}
          onCancel={() => setIntakeOpen(false)}
        />
      ) : null}

      <div style={columnsRow} role="list">
        {columns.map(({ stage, cards }) => (
          <Column
            key={stage.id}
            stage={stage}
            cards={cards}
            cardKind={config.cardKind}
            flags={board.flags}
            stages={config.stages}
            hydrated={board.hydrated}
            onDrop={cardId => handleDrop(cardId, stage.id)}
            onQuickAdd={title => board.quickAdd(stage.id, title)}
            onMenuMove={(cardId, to) => handleDrop(cardId, to)}
          />
        ))}
      </div>

      {toast ? (
        <div role="alert" style={toastStyle}>
          {toast}
        </div>
      ) : null}
    </section>
  )
}

function Column({
  stage,
  cards,
  cardKind,
  flags,
  stages,
  hydrated,
  onDrop,
  onQuickAdd,
  onMenuMove,
}: {
  stage: StageConfig
  cards: BoardCard[]
  cardKind: BoardConfig["cardKind"]
  flags: Map<string, CardFlags>
  stages: StageConfig[]
  hydrated: boolean
  onDrop: (cardId: string) => void
  onQuickAdd: (title: string) => void
  onMenuMove: (cardId: string, toStageId: string) => void
}) {
  const [over, setOver] = useState(false)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")

  return (
    <div
      role="listitem"
      data-stage={stage.id}
      style={{ ...columnStyle, ...(over ? columnOver : null) }}
      onDragOver={e => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData("text/card-id")
        if (id) {
          onDrop(id)
        }
      }}
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
          cards.map(card => (
            <div
              key={card.id}
              draggable
              onDragStart={e => e.dataTransfer.setData("text/card-id", card.id)}
              style={{ cursor: "grab" }}
            >
              <MCard
                kind={cardKind}
                data={cardToMData(card, flags.get(card.id))}
                actions={
                  <MoveMenu
                    cardId={card.id}
                    currentStage={stage.id}
                    stages={stages}
                    onMove={onMenuMove}
                  />
                }
              />
            </div>
          ))
        )}
      </div>

      {!stage.terminal ? (
        adding ? (
          <form
            onSubmit={e => {
              e.preventDefault()
              onQuickAdd(draft)
              setDraft("")
              setAdding(false)
            }}
          >
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
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
  )
}

/** Keyboard/menu move — a11y path so a card moves without a drag. */
function MoveMenu({
  cardId,
  currentStage,
  stages,
  onMove,
}: {
  cardId: string
  currentStage: string
  stages: StageConfig[]
  onMove: (cardId: string, toStageId: string) => void
}) {
  return (
    <label style={{ fontSize: "0.6875rem", color: "var(--text-muted, #9ba1a8)" }}>
      Move
      <select
        value={currentStage}
        onChange={e => {
          if (e.target.value !== currentStage) {
            onMove(cardId, e.target.value)
          }
        }}
        aria-label="Move card to stage"
        style={moveSelect}
      >
        {stages.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function IntakeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: {
    title: string
    contact?: { name?: string; phone?: string; email?: string }
    source?: string
  }) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [source, setSource] = useState("web")

  return (
    <form
      style={intakeFormStyle}
      onSubmit={e => {
        e.preventDefault()
        if (!title.trim()) {
          return
        }
        onSubmit({ title, contact: { name, email, phone }, source })
      }}
    >
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Lead title"
        style={intakeInput}
        aria-label="Lead title"
        autoFocus
      />
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Contact name"
        style={intakeInput}
        aria-label="Contact name"
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        style={intakeInput}
        aria-label="Email"
      />
      <input
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="Phone"
        style={intakeInput}
        aria-label="Phone"
      />
      <select
        value={source}
        onChange={e => setSource(e.target.value)}
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
  )
}

/* ---- token-only styles (no hex except graceful CSS-var fallbacks) ---- */

import type { CSSProperties } from "react"

const shell: CSSProperties = {
  color: "var(--text-primary, inherit)",
  fontFamily: "var(--font-sans, inherit)",
}
const headerRow: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "1rem",
  flexWrap: "wrap",
}
const eyebrow: CSSProperties = {
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "var(--accent, #6366f1)",
  fontWeight: 600,
}
const subtle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--text-muted, #9ba1a8)",
  marginTop: "0.125rem",
}
const columnsRow: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  overflowX: "auto",
  paddingBottom: "1rem",
  marginTop: "1rem",
  scrollSnapType: "x proximity",
}
const columnStyle: CSSProperties = {
  width: "min(86vw, 18rem)",
  flex: "0 0 auto",
  scrollSnapAlign: "start",
  borderRadius: "0.75rem",
  padding: "0.625rem",
  background: "color-mix(in srgb, var(--surface, #16181b) 60%, transparent)",
  border: "1px solid var(--border, #2a2e33)",
}
const columnOver: CSSProperties = {
  borderColor: "var(--accent, #6366f1)",
  background: "color-mix(in srgb, var(--accent, #6366f1) 8%, transparent)",
}
const columnHead: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: "0.375rem",
  borderBottom: "1px solid var(--border, #2a2e33)",
}
const columnTitle: CSSProperties = {
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontWeight: 600,
  color: "var(--text-muted, #9ba1a8)",
}
const countChip: CSSProperties = { fontSize: "0.6875rem", color: "var(--text-muted, #9ba1a8)" }
const gateLine: CSSProperties = {
  marginTop: "0.25rem",
  fontSize: "0.625rem",
  color: "var(--text-muted, #9ba1a8)",
}
const columnBody: CSSProperties = {
  marginTop: "0.625rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  minHeight: "2rem",
}
const emptyState: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--text-muted, #9ba1a8)",
  textAlign: "center",
  padding: "0.75rem",
  border: "1px dashed var(--border, #2a2e33)",
  borderRadius: "0.5rem",
}
const primaryBtn: CSSProperties = {
  borderRadius: "0.5rem",
  background: "var(--accent, #6366f1)",
  color: "var(--accent-foreground, #0e0f11)",
  padding: "0.4375rem 0.875rem",
  fontSize: "0.8125rem",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
}
const ghostBtn: CSSProperties = {
  borderRadius: "0.5rem",
  background: "transparent",
  color: "var(--text-muted, #9ba1a8)",
  padding: "0.4375rem 0.875rem",
  fontSize: "0.8125rem",
  border: "1px solid var(--border, #2a2e33)",
  cursor: "pointer",
}
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
}
const quickAddInput: CSSProperties = {
  marginTop: "0.5rem",
  width: "100%",
  borderRadius: "0.5rem",
  background: "var(--surface, #16181b)",
  color: "var(--text-primary, inherit)",
  padding: "0.4375rem",
  fontSize: "0.8125rem",
  border: "1px solid var(--accent, #6366f1)",
}
const moveSelect: CSSProperties = {
  marginLeft: "0.375rem",
  background: "var(--surface, #16181b)",
  color: "var(--text-primary, inherit)",
  border: "1px solid var(--border, #2a2e33)",
  borderRadius: "0.375rem",
  fontSize: "0.6875rem",
  padding: "0.125rem 0.25rem",
}
const intakeFormStyle: CSSProperties = {
  marginTop: "1rem",
  display: "grid",
  gap: "0.5rem",
  maxWidth: "24rem",
  padding: "0.875rem",
  borderRadius: "0.75rem",
  border: "1px solid var(--border, #2a2e33)",
  background: "var(--surface, #16181b)",
}
const intakeInput: CSSProperties = {
  borderRadius: "0.5rem",
  background: "color-mix(in srgb, var(--surface, #16181b) 60%, transparent)",
  color: "var(--text-primary, inherit)",
  padding: "0.4375rem 0.625rem",
  fontSize: "0.8125rem",
  border: "1px solid var(--border, #2a2e33)",
}
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
}
