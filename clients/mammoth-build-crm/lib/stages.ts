import type { Stage, StageId } from "./types";

// PEMB pipeline — mirrors the engagement brief (§4). Each stage carries an exit gate.
export const STAGES: Stage[] = [
  { id: "lead", label: "New Lead", gate: "Contact + source captured" },
  { id: "qualified", label: "Qualified", gate: "Use, region, rough dimensions captured" },
  { id: "quote", label: "Design & Quote", gate: "Quote built from product library" },
  { id: "contract", label: "Contract", gate: "Quote e-signed (= the contract)" },
  { id: "deposit", label: "Deposit", gate: "Deposit invoice sent / paid" },
  { id: "engineering", label: "Engineering", gate: "PE stamp obtained for the state" },
  { id: "fabrication", label: "Fabrication", gate: "Fabrication-milestone invoice issued" },
  { id: "delivery", label: "Delivery & Erection", gate: "Sequenced delivery + milestone invoice" },
  { id: "complete", label: "Order Complete", gate: "Final invoice; order confirmed" },
  { id: "lost", label: "Closed-Lost", gate: "Reason required (no silent drops)" },
];

const STAGE_BY_ID = new Map<StageId, Stage>(STAGES.map((s) => [s.id, s]));

export function getStage(id: StageId): Stage {
  return STAGE_BY_ID.get(id) ?? STAGES[0];
}

/** Ordered, active (non-lost) stages — the forward path lead → order. */
export const ACTIVE_STAGES: Stage[] = STAGES.filter((s) => s.id !== "lost");

/** The stage at which a project becomes a real, committed order. */
export const ORDER_STAGE: StageId = "deposit";

export function stageIndex(id: StageId): number {
  return ACTIVE_STAGES.findIndex((s) => s.id === id);
}

export function nextStage(id: StageId): StageId | null {
  const i = stageIndex(id);
  if (i < 0 || i >= ACTIVE_STAGES.length - 1) {
    return null;
  }
  return ACTIVE_STAGES[i + 1].id;
}
