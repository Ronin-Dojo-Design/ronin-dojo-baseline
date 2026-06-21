/**
 * AdminKanban (PWCC-007) — the config-driven board contract.
 *
 * One rule (ADR 0033 D5): the board is **config + data**. Everything project-specific
 * lives in `BoardConfig` + a token block; the kernel ships zero per-project code.
 *
 * Domain logic that ADR 0033 flagged as "config-that-is-code" (`requires`, `reasonOnLost`,
 * `sla`) is expressed declaratively here as generic stage *attributes* the pure engine
 * interprets — not as bespoke per-project branches inside the board component.
 */

/** Lifecycle taxonomy shared with the AdminTaskBoard / m-card (PWCC-001/002). */
export type LifecycleStatus = "active" | "inactive" | "deprecated" | "broken"

/** Effort lane shared with the AdminTaskBoard. QF = quick-fix, HF = high-focus. */
export type Lane = "QF" | "HF"

/** The m-card kind a board renders its cards as. */
export type CardKind = "task" | "deal"

/** Built-in follow-up automation rules. Config toggles which run on a given board. */
export type AutomationRule =
  | "rotting"
  | "next-step-reminder"
  | "stage-sla"
  | "order-guard"
  | "lost-reason"

/**
 * One stage = one column. Generic, declarative attributes only — no project names.
 */
export interface StageConfig {
  id: string
  name: string
  /** Short exit criterion shown under the column header (optional). */
  gate?: string
  /** Lead intake drops new cards into the stage flagged `intake`. */
  intake?: boolean
  /** Days a card may sit here before `rotting`/`stage-sla` flag it at-risk. */
  sla?: number
  /**
   * A card field that must be truthy before a card may MOVE INTO this stage.
   * Generic name (e.g. "orderConfirmed") resolved against `BoardCard.fields`.
   * The `order-guard` automation enforces it.
   */
  requires?: string
  /** Terminal stage (Won/Lost) — collapsed, excluded from SLA/rotting. */
  terminal?: boolean
  /** Moving here as a loss requires a reason (`lost-reason` automation). */
  reasonOnLost?: boolean
}

/**
 * The ONLY thing that changes per project. No code — pure data.
 */
export interface BoardConfig {
  id: string
  title: string
  /** Token-block id (design system). Skins the board; never a hex value. */
  brand: string
  /** Which m-card kind the cards render as. */
  cardKind: CardKind
  stages: StageConfig[]
  /** Subset of automation rules to run on this board. */
  automations: AutomationRule[]
}

/** A contact attached to a lead/deal card (optional, all fields optional). */
export interface CardContact {
  name?: string
  phone?: string
  email?: string
}

/**
 * Presentation card. Reuses the AdminTaskBoard task shape + CRM fields.
 *
 * `fields` is the open-ended bag the generic engine reads for `requires` checks
 * (e.g. `{ orderConfirmed: true }`) so the kernel stays domain-agnostic — a
 * consumer's domain attributes ride along without the engine knowing their names.
 */
export interface BoardCard {
  id: string
  stage: string
  title: string
  lane?: Lane
  status?: LifecycleStatus
  owner?: string
  /** ISO date the next action is due. */
  due?: string
  /** The next concrete action. Empty = `next-step-reminder` flags at-risk. */
  nextStep?: string
  /** Deal value (cents-free integer); rendered as the card's one focal value. */
  value?: number
  contact?: CardContact
  /** Loss reason — required when moving to a terminal stage as a loss. */
  lostReason?: string
  /** Open generic attribute bag the engine reads for `requires` guards. */
  fields?: Record<string, unknown>
  /** Source the lead came in through (web/manual/email), stamped at intake. */
  source?: string
  createdAt: string
  /** ISO timestamp of the last activity — drives rotting/SLA. */
  updatedAt: string
}

/** Why a card is flagged — surfaced as the calm-but-loud at-risk signal. */
export type RiskReason = "rotting" | "no-next-step" | "stage-sla"

/** Output of the automation evaluator for one card. */
export interface CardFlags {
  cardId: string
  atRisk: boolean
  reasons: RiskReason[]
}

/** The full persisted board state. */
export interface BoardState {
  configId: string
  cards: BoardCard[]
}
