/**
 * Follow-up automations — a small PURE evaluator over the card list (PWCC-007).
 *
 * No heavyweight workflow builder: just the listed rules, config-toggled per board.
 * Pure functions (no React, no clock dependency beyond an injected `now`) so the whole
 * rule set is unit-testable and runs client-side now / in a cron job later (CRM P4).
 */

import type {
  AutomationRule,
  BoardCard,
  BoardConfig,
  CardFlags,
  RiskReason,
  StageConfig,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(iso: string, now: number): number {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) {
    return 0;
  }
  return (now - then) / DAY_MS;
}

function enabled(rule: AutomationRule, config: BoardConfig): boolean {
  return config.automations.includes(rule);
}

function stageById(config: BoardConfig, id: string): StageConfig | undefined {
  return config.stages.find((s) => s.id === id);
}

/**
 * Evaluate one card against the board's enabled rules.
 *
 * - `rotting` / `stage-sla`: card sat in a non-terminal stage past its `sla` days → at-risk.
 * - `next-step-reminder`: open card with an empty `nextStep` → at-risk.
 *
 * Terminal stages are never at-risk (Won/Lost are done).
 */
export function evaluateCard(
  card: BoardCard,
  config: BoardConfig,
  now: number = Date.now(),
): CardFlags {
  const reasons: RiskReason[] = [];
  const stage = stageById(config, card.stage);

  if (!stage?.terminal) {
    const overSla = typeof stage?.sla === "number" && daysSince(card.updatedAt, now) > stage.sla;

    if (overSla && enabled("rotting", config)) {
      reasons.push("rotting");
    }
    if (overSla && enabled("stage-sla", config)) {
      reasons.push("stage-sla");
    }
    if (enabled("next-step-reminder", config) && !card.nextStep?.trim()) {
      reasons.push("no-next-step");
    }
  }

  return { cardId: card.id, atRisk: reasons.length > 0, reasons };
}

/** Evaluate every card; returns a flags map keyed by card id. */
export function evaluateBoard(
  cards: BoardCard[],
  config: BoardConfig,
  now: number = Date.now(),
): Map<string, CardFlags> {
  const out = new Map<string, CardFlags>();
  for (const card of cards) {
    out.set(card.id, evaluateCard(card, config, now));
  }
  return out;
}

/**
 * Sort within a column: at-risk cards bump to the top (the only loud signal),
 * then by persisted rank (`order`, ascending) when BOTH cards carry one, else by
 * most-recently-updated first. Stable, pure.
 *
 * The `order` tier is opt-in: a board whose cards never set `order` (e.g. the CRM
 * deal board) sorts exactly as before. A board that persists a rank (the ledger
 * backlog) gets that rank as the render order — so it survives reload instead of
 * being scrambled by save-time `updatedAt` churn.
 */
export function sortColumn(cards: BoardCard[], flags: Map<string, CardFlags>): BoardCard[] {
  return [...cards].sort((a, b) => {
    const aRisk = flags.get(a.id)?.atRisk ? 1 : 0;
    const bRisk = flags.get(b.id)?.atRisk ? 1 : 0;
    if (aRisk !== bRisk) {
      return bRisk - aRisk;
    }
    if (typeof a.order === "number" && typeof b.order === "number" && a.order !== b.order) {
      return a.order - b.order;
    }
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  });
}
