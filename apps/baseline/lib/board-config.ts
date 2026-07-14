/**
 * Baseline inquiries — the ONE per-product board file.
 *
 * The whole "Baseline instance" of AdminKanban: a pure BoardConfig (data, no code)
 * + a Lead→BoardCard mapper. No board logic lives here — it all lives in the shared
 * kernel (@ronin-dojo/ui-kit/kanban). Swapping this config + the token bridge in
 * app/globals.css is the entire cost of targeting a new school (ADR 0033 D5).
 *
 * Stages map the `LeadStatus` enum 1:1 (uppercase stage ids = enum members), so the
 * card.stage ↔ LeadStatus round-trip in lib/actions.ts is a direct value.
 */

import type { BoardCard, BoardConfig } from "@ronin-dojo/ui-kit/kanban";
import type { LeadRecord } from "./types";

export const BASELINE_BOARD: BoardConfig = {
  id: "baseline-inquiries",
  title: "Baseline · Inquiries",
  brand: "baseline",
  cardKind: "deal",
  stages: [
    { id: "NEW", name: "New Inquiry", gate: "Name + contact captured", intake: true, sla: 1 },
    { id: "CONTACTED", name: "Contacted", gate: "First follow-up made", sla: 3 },
    { id: "TRIAL_BOOKED", name: "Trial Booked", gate: "Intro class scheduled", sla: 7 },
    { id: "ENROLLED", name: "Enrolled", gate: "Signed up as a student" },
    { id: "CLOSED", name: "Closed", gate: "No longer pursuing", terminal: true },
  ],
  // Follow-up hygiene only: `rotting` flags a stale inquiry, `stage-sla` a lead
  // sitting past its stage window. (No `order-guard`/`lost-reason` — a school
  // lead has no order concept, and Lead has no reason column to persist to.)
  automations: ["rotting", "stage-sla"],
};

/** Map a Baseline Lead (read-model) to a kernel BoardCard. */
export function leadToCard(l: LeadRecord): BoardCard {
  return {
    id: l.id,
    stage: l.status,
    title: l.name,
    status: "active",
    contact: {
      name: l.name,
      email: l.email,
      ...(l.phone ? { phone: l.phone } : {}),
    },
    // Surface the program they asked about as a card badge (no dedicated field).
    ...(l.interest ? { badges: [{ label: l.interest }] } : {}),
    ...(l.source ? { source: l.source } : {}),
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}
