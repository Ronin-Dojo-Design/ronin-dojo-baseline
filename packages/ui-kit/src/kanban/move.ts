/**
 * Stage-move rules (PWCC-007) — the `order-guard` and `lost-reason` automations,
 * expressed as a pure guard the board calls before committing a move.
 *
 * Generic by construction: the engine never knows what "orderConfirmed" means — it
 * reads the field name declared in `stage.requires` from the card's open `fields` bag.
 */

import type { BoardCard, BoardConfig, StageConfig } from "./types"

export type MoveResult =
  | { ok: true; card: BoardCard }
  | { ok: false; reason: "requires" | "lost-reason"; message: string; field?: string }

function stageById(config: BoardConfig, id: string): StageConfig | undefined {
  return config.stages.find(s => s.id === id)
}

function isLossMove(target: StageConfig, lostReason?: string): boolean {
  // A terminal stage that requires a reason on loss treats a move with an
  // explicit lostReason — or the absence of one — as a loss to validate.
  return Boolean(target.terminal && target.reasonOnLost) && !lostReason?.trim()
}

/**
 * Attempt to move a card to `toStageId`. Pure — returns the next card on success
 * or a typed rejection the UI turns into a toast (and a shake on the drop zone).
 *
 * `order-guard`: target stage `requires` a truthy card field → block if missing.
 * `lost-reason`: target is terminal + `reasonOnLost` → block without a reason.
 */
export function moveCard(
  card: BoardCard,
  toStageId: string,
  config: BoardConfig,
  opts: { lostReason?: string; now?: number } = {},
): MoveResult {
  const target = stageById(config, toStageId)
  if (!target) {
    return { ok: false, reason: "requires", message: `Unknown stage "${toStageId}".` }
  }

  const guardsOn = config.automations.includes("order-guard")
  if (guardsOn && target.requires) {
    const field = target.requires
    const value = card.fields?.[field]
    if (!value) {
      return {
        ok: false,
        reason: "requires",
        field,
        message: `Can't move to "${target.name}" until ${field} is set.`,
      }
    }
  }

  if (config.automations.includes("lost-reason") && isLossMove(target, opts.lostReason)) {
    return {
      ok: false,
      reason: "lost-reason",
      message: `Moving to "${target.name}" as a loss requires a reason.`,
    }
  }

  const nowIso = new Date(opts.now ?? Date.now()).toISOString()
  return {
    ok: true,
    card: {
      ...card,
      stage: toStageId,
      lostReason: opts.lostReason?.trim() ? opts.lostReason.trim() : card.lostReason,
      updatedAt: nowIso,
    },
  }
}
