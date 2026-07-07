"use server"

import { Brand } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import { CANONICAL_TREE_SLUG, placeLeadIntoLineage } from "~/server/admin/lineage/place-lead-core"
import { placeLeadOnLineageSchema } from "~/server/admin/lineage/schema"

/**
 * FI-003 — MANUAL steward fallback to place a Join-the-Legacy lead on the canonical lineage tree UNDER
 * the instructor they named on the registration form. This is NOT an approval or a verification —
 * membership is automatic (ADR 0035 / SESSION_0474): new signups auto-place at submit via
 * `autoPlaceSignupOnLineage`. This control covers leads that weren't auto-placed (instructor didn't
 * resolve at submit, or pre-existing leads) and is idempotent (re-run → no-op). The member lands
 * Unverified + NOT claimable; the separate Verify toggle is the only thing that verifies them.
 *
 * Thin `adminActionClient` wrapper (admin holds `lineage.manage` via `*`; NO new authz) around the
 * shared transactional core `placeLeadIntoLineage` — the SAME core auto-placement calls.
 */
export const placeLeadOnLineage = adminActionClient
  .inputSchema(placeLeadOnLineageSchema)
  .action(async ({ parsedInput: { leadId }, ctx: { db, revalidate, brand, user } }) => {
    const result = await db.$transaction(tx =>
      placeLeadIntoLineage(tx, { leadId, actorUserId: user.id, brand }),
    )

    revalidate({
      paths: [`/app/leads/${leadId}`, "/lineage", `/lineage/${CANONICAL_TREE_SLUG}`],
      tags: ["lineage", `lineage-tree-${Brand.BBL}-${CANONICAL_TREE_SLUG}`],
    })

    return result
  })
