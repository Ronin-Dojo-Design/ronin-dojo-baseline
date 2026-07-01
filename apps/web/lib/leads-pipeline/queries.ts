"use server"

/**
 * BBL Lead Pipeline — the read side (Slice 6, Petey Plan 0477).
 *
 * Loads BBL's OWN `Lead` rows (+ their `Organization`), gated on `leads.manage`, and
 * projects them to the flat `PipelineLead` read-model via the pure `toPipelineLead`.
 * Brand-scoped to BBL (ADR 0004); NOTHING from `clients/mammoth-build-crm`
 * (ADR 0034/0038: share the kernel, not the data). This is the board's `load` source
 * AND the page's SSR read — the "Schools to invite" rail derives from the same rows.
 */

import { Brand } from "~/.generated/prisma/client"
import { requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { db } from "~/services/db"
import { type PipelineLeadRow, toPipelineLead } from "./project"
import type { PipelineLead } from "./types"

const pipelineLeadSelect = {
  id: true,
  status: true,
  firstName: true,
  lastName: true,
  email: true,
  meta: true,
  organizationId: true,
  organization: { select: { name: true } },
  createdAt: true,
  updatedAt: true,
} as const

/** Load every BBL lead as a `PipelineLead` (most-recently-updated first). */
export async function loadPipelineLeads(): Promise<PipelineLead[]> {
  await requirePermission(APP_AREA_PERMISSIONS.leads)

  const rows = await db.lead.findMany({
    where: { brand: Brand.BBL },
    select: pipelineLeadSelect,
    orderBy: [{ updatedAt: "desc" }],
  })

  return rows.map(row => toPipelineLead(row as PipelineLeadRow))
}
