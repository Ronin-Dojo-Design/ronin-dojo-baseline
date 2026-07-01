/**
 * BBL Lead Pipeline — the pure DB-row → `PipelineLead` projection (Slice 6).
 *
 * Kept OUT of the `"use server"` query module (which may only export async fns) so it
 * stays a plain, unit-testable function — mirroring how the loop-board keeps `map-card.ts`
 * separate from its `"use server"` store. It reuses Slice 1's canonical
 * `SCHOOL_OUTREACH_KIND` so the "is this a school-outreach demand row?" test can never
 * drift from the emitter. This file is NEVER imported by the client board (that only
 * imports `board-config.ts`), so its server-only transitive import is bundle-safe.
 */

import type { LeadStatus } from "~/.generated/prisma/browser"
import { SCHOOL_OUTREACH_KIND } from "~/server/web/school-lead/emit-school-lead"
import type { PipelineLead } from "./types"

/** The subset of a BBL `Lead` row (+ its `Organization`) the projection needs. */
export type PipelineLeadRow = {
  id: string
  status: LeadStatus
  firstName: string
  lastName: string | null
  email: string | null
  meta: unknown
  organizationId: string
  organization: { name: string }
  createdAt: Date
  updatedAt: Date
}

function metaRecord(meta: unknown): Record<string, unknown> {
  return meta && typeof meta === "object" && !Array.isArray(meta)
    ? (meta as Record<string, unknown>)
    : {}
}

/** Map a BBL `Lead` DB row to the flat `PipelineLead` read-model. Pure — no I/O. */
export function toPipelineLead(row: PipelineLeadRow): PipelineLead {
  const meta = metaRecord(row.meta)
  const isSchoolOutreach = meta.kind === SCHOOL_OUTREACH_KIND
  const rawDemand = meta.demandCount
  const demandCount =
    typeof rawDemand === "number" && Number.isFinite(rawDemand) && rawDemand > 0 ? rawDemand : 0
  const lostReason = typeof meta.lostReason === "string" ? meta.lostReason : null

  // A school-outreach lead's meaningful title is the school (org) name; a person lead's
  // is their name (first + last), falling back to the org.
  const contactName = [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || null
  const title = isSchoolOutreach ? row.organization.name : contactName || row.organization.name

  return {
    id: row.id,
    status: row.status,
    title,
    organizationName: row.organization.name,
    organizationId: row.organizationId,
    contactName: isSchoolOutreach ? null : contactName,
    contactEmail: row.email,
    isSchoolOutreach,
    demandCount,
    lostReason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
