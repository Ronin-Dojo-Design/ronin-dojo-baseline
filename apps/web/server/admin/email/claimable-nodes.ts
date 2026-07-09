import { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * SESSION_0515 TASK_06 — enumerate the BBL lineage nodes the admin invite composer can
 * bind a claim to. Scoping MIRRORS `bindPendingClaim` (mint-claim-magic-link.ts) exactly so
 * the composer only offers a node the durable-claim primitive would actually bind: a
 * `LineageTreeMember` that is `isClaimable`, whose node's passport is UNOWNED
 * (`passport.userId: null` — never re-bind a node someone already owns), on a PUBLISHED +
 * claimable BBL tree. A node picked here is guaranteed to survive the action's already-claimed
 * guard and `bindPendingClaim`'s own filter (no silent no-op).
 *
 * The label carries enough to DISAMBIGUATE (identity-critical: binding to the wrong node =
 * the wrong person claims): the person's display name + their tree, plus the cohort/visual-group
 * label when present (e.g. the Dirty Dozen box). Same care as the Truelson script's node resolve.
 */
export type ClaimableNodeOption = {
  /** LineageNode.id — the value `bindPendingClaim(email, nodeId)` binds to. */
  id: string
  /** Disambiguating label: "Chris Haueter — Rigan Machado Lineage · Dirty Dozen". */
  name: string
  /** The person's display name alone (fed to the email's `profileName`). */
  profileName: string
}

export async function findClaimableBblNodeOptions(): Promise<ClaimableNodeOption[]> {
  const members = await db.lineageTreeMember.findMany({
    where: {
      isClaimable: true,
      node: { passport: { userId: null } },
      tree: { brand: Brand.BBL, isPublished: true, isClaimable: true },
    },
    select: {
      node: {
        select: {
          id: true,
          passport: { select: { displayName: true } },
        },
      },
      tree: { select: { name: true } },
      visualGroup: { select: { label: true } },
    },
    orderBy: { node: { passport: { displayName: "asc" } } },
  })

  // A node can appear in several claimable trees (clone/consolidation leftovers). Dedupe on
  // nodeId, keeping the first (name-sorted) label so the operator sees one row per person.
  const byNode = new Map<string, ClaimableNodeOption>()
  for (const member of members) {
    if (byNode.has(member.node.id)) continue
    const profileName = member.node.passport.displayName?.trim() || "(unnamed)"
    const context = [member.tree.name, member.visualGroup?.label].filter(Boolean).join(" · ")
    byNode.set(member.node.id, {
      id: member.node.id,
      name: context ? `${profileName} — ${context}` : profileName,
      profileName,
    })
  }

  return Array.from(byNode.values())
}
