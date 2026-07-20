// Domain types for the Mammoth Build CRM MVP. Frontend-only; persisted in localStorage.

import type { LeadSourceValue } from "./lead-source";

export type StageId =
  | "lead"
  | "qualified"
  | "quote"
  | "contract"
  | "deposit"
  | "engineering"
  | "fabrication"
  | "delivery"
  | "complete"
  | "lost";

export interface Stage {
  id: StageId;
  label: string;
  /** One-line exit criterion — the gate before a project may advance. */
  gate: string;
}

/** A build-process photo. Stored as a downscaled data URL (thumbnail) for the MVP. */
export type PhotoPhase = "before" | "during" | "after";

export interface BuildPhoto {
  id: string;
  phase: PhotoPhase;
  /** Stage the photo documents (e.g. "fabrication", "delivery"). */
  stage: StageId;
  dataUrl: string;
  caption: string;
  takenAt: string; // ISO
}

/** Intake payload for a new project (New Job Order form / programmatic create). */
export interface NewProjectInput {
  name: string;
  contactName: string;
  contactEmail: string;
  buildingType: string;
  use: string;
  region: string;
  width: number | null;
  length: number | null;
  eaveHeight: number | null;
  notes: string;
}

export interface Project {
  id: string;
  /** Short human label, e.g. "Flores — 60x100 Auto Service". */
  name: string;
  contactName: string;
  contactEmail: string;
  buildingType: string;
  use: string;
  region: string;
  width: number | null;
  length: number | null;
  eaveHeight: number | null;
  stage: StageId;
  /** Where the lead came in through (brief §3a #1 source tracking; `lib/lead-source.ts`). */
  source: LeadSourceValue;
  /** "Can't drop a project" guardrail: an open project must always have a next step. */
  nextTask: string;
  orderConfirmed: boolean;
  /** Stamped when the project becomes an actual order. */
  orderNumber: string | null;
  notes: string;
  photos: BuildPhoto[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
