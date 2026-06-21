/**
 * @ronin-dojo/ui-kit/kanban — AdminKanban (PWCC-007) public surface.
 *
 * The board is config + data. Consumers import the board + the persistence port adapters,
 * write a BoardConfig + a token block, and ship — zero per-project board code (ADR 0033).
 */

export { AdminKanban, type AdminKanbanProps } from "./admin-kanban";
export { useBoard, type UseBoard, type UseBoardOptions } from "./use-board";

export {
  type BoardStore,
  createLocalStorageBoardStore,
  createMemoryBoardStore,
} from "./board-store";

export { evaluateBoard, evaluateCard, sortColumn } from "./automations";

export { moveCard, type MoveResult } from "./move";

export {
  createLead,
  intakeStageId,
  isDuplicateContact,
  type IntakeResult,
  type LeadInput,
} from "./intake";

export type {
  AutomationRule,
  BoardCard,
  BoardConfig,
  BoardState,
  CardContact,
  CardFlags,
  CardKind,
  Lane,
  LifecycleStatus,
  RiskReason,
  StageConfig,
} from "./types";
