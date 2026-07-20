/**
 * Mammoth pipeline — the ONE per-project file (PWCC-004).
 *
 * This is the whole "Mammoth instance" of AdminKanban: a pure BoardConfig (data, no code)
 * + a Project→BoardCard mapper. No board logic lives here — it all lives in the shared
 * kernel (@ronin-dojo/ui-kit/kanban). Swapping this config + the token block in
 * app/globals.css is the entire cost of targeting a new project (ADR 0033 D5).
 *
 * Stages mirror the existing PEMB pipeline (lib/stages.ts) declaratively:
 * `requires: "orderConfirmed"` = the order-guard; `terminal + reasonOnLost` = no silent drop.
 */

import type { BoardCard, BoardConfig } from "@ronin-dojo/ui-kit/kanban"
import { leadSourceLabel } from "./lead-source"
import type { Project } from "./types"

export const MAMMOTH_BOARD: BoardConfig = {
  id: "mammoth-pipeline",
  title: "Mammoth · Pipeline",
  brand: "mammoth",
  cardKind: "deal",
  stages: [
    { id: "lead", name: "New Lead", gate: "Contact + source captured", intake: true, sla: 1 },
    { id: "qualified", name: "Qualified", gate: "Use, region, rough dimensions", sla: 3 },
    { id: "quote", name: "Design & Quote", gate: "Quote built from product library", sla: 5 },
    { id: "contract", name: "Contract", gate: "Quote e-signed (= the contract)", sla: 5 },
    { id: "deposit", name: "Deposit", gate: "Deposit invoice sent / paid", requires: "orderConfirmed" },
    { id: "engineering", name: "Engineering", gate: "PE stamp for the state" },
    { id: "fabrication", name: "Fabrication", gate: "Fab-milestone invoice issued" },
    { id: "delivery", name: "Delivery & Erection", gate: "Sequenced delivery + milestone invoice" },
    { id: "complete", name: "Order Complete", gate: "Final invoice; order confirmed", requires: "orderConfirmed" },
    { id: "lost", name: "Closed-Lost", gate: "Reason required (no silent drops)", terminal: true, reasonOnLost: true },
  ],
  automations: ["rotting", "next-step-reminder", "stage-sla", "order-guard", "lost-reason"],
}

/**
 * Map an existing Mammoth Project (lib/store.ts) to a kernel BoardCard.
 *
 * `source` rides the kernel's existing `BoardCard.source` field (round-tripped from the
 * persisted `Project.source`, not just the intake-time value) so the pipeline page can filter
 * by it without the kernel knowing what a "Lead Source" is; the badge is the same generic
 * passthrough the order-guard badge uses, giving the roster's existing Lead Source badge its
 * board-side parity (SESSION_0586, G-021 loop 3b).
 */
export function projectToCard(p: Project): BoardCard {
  return {
    id: p.id,
    stage: p.stage,
    title: p.name,
    status: "active",
    nextStep: p.nextTask,
    contact: { name: p.contactName, email: p.contactEmail },
    fields: {
      orderConfirmed: p.orderConfirmed,
      ...(p.orderNumber ? { orderNumber: p.orderNumber } : {}),
    },
    source: p.source,
    badges: [{ label: leadSourceLabel(p.source) }],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}
