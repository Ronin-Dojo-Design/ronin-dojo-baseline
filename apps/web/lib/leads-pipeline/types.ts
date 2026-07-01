/**
 * BBL Lead Pipeline (Slice 6, Petey Plan 0477) — the card DTO + read-model shape.
 *
 * "The Mammoth CRM for BBL" the doctrine-correct way (ADR 0034/0038 — share the
 * KERNEL, not the DATA): the `AdminKanban` kernel (`@ronin-dojo/ui-kit/kanban`) is
 * mounted over BBL's OWN `Lead`/`LeadFollowUp`/`Organization` models. NOTHING here
 * imports from `clients/mammoth-build-crm` or touches its DB (ADR 0038 isolation).
 *
 * `PipelineLead` is the flat read-model the board-store projects a `Lead` row into
 * (mirrors Mammoth's `Project` public contract): the DB is normalized (Lead ↔
 * Organization, meta bag); this shape flattens `Organization.name` and the
 * school-outreach demand-count so the card mapper stays a pure function.
 */

import type { LeadStatus } from "~/.generated/prisma/browser"

/** The single board config id — also the stable partition key for the pipeline board. */
export const LEADS_PIPELINE_CONFIG_ID = "bbl-leads-pipeline"

/**
 * Flat read-model for one BBL `Lead`, projected from the DB row. The store maps a
 * `Lead` (+ its `Organization`) into this; `pipelineLeadToCard` maps it to a kernel
 * `BoardCard`. Keeping the projection here (not in the `"use server"` actions module)
 * makes the mapper plain + unit-testable.
 */
export interface PipelineLead {
  id: string
  /** The canonical BBL lead status (drives the board stage). */
  status: LeadStatus
  /** Display title — the school/contact name (school-outreach → the school name). */
  title: string
  /** Flattened `Organization.name` (the school). */
  organizationName: string
  organizationId: string
  contactName: string | null
  contactEmail: string | null
  /** True when this lead is a Slice-1 school-outreach demand row (`meta.kind`). */
  isSchoolOutreach: boolean
  /** School-outreach demand-count from `Lead.meta.demandCount` (0 when absent). */
  demandCount: number
  /** Loss reason, surfaced on LOST cards (from `Lead.meta.lostReason`). */
  lostReason: string | null
  createdAt: string
  updatedAt: string
}
