import {
  ELITE_LINEAGE_LISTING_RENDER_POLICY,
  FREE_LINEAGE_LISTING_RENDER_POLICY,
  type LineageListingRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import { passportDisplayName } from "~/lib/identity/passport-display"
import type { PromoterChangeContext } from "~/components/web/lineage/promoter-change-modal"
import type { LineageEditorCapability } from "~/server/web/lineage/editor-queries"
import type { LineageNodeProfile, LineageTreeMemberRow } from "~/server/web/lineage/payloads"

/**
 * Pure derivation helpers for `LineageTreeBoard`.
 *
 * Extracted from the component body (WL-P2-22, SESSION_0500) so the client
 * island only owns drawer/selection state + JSX wiring. Each function is a
 * behavior-preserving move of an expression that previously lived inline in
 * `LineageTreeBoard`; nothing here reads or writes React state.
 */

export function displayNameForMember(member: LineageTreeMemberRow): string {
  return passportDisplayName(member.node.passport) ?? "Unnamed"
}

/**
 * All members reachable downward from `rootMemberId` via
 * `primaryVisualParentMemberId`. Used to exclude a member's own descendants
 * from the promoter candidate list (a member cannot be promoted by its child).
 */
export function descendantMemberIds(
  members: LineageTreeMemberRow[],
  rootMemberId: string,
): Set<string> {
  const childrenByParentId = new Map<string, string[]>()
  for (const member of members) {
    if (!member.primaryVisualParentMemberId) continue
    const children = childrenByParentId.get(member.primaryVisualParentMemberId) ?? []
    children.push(member.id)
    childrenByParentId.set(member.primaryVisualParentMemberId, children)
  }

  const descendants = new Set<string>()
  const stack = [...(childrenByParentId.get(rootMemberId) ?? [])]
  while (stack.length > 0) {
    const next = stack.pop()
    if (!next || descendants.has(next)) continue
    descendants.add(next)
    stack.push(...(childrenByParentId.get(next) ?? []))
  }
  return descendants
}

/**
 * Editors (canEditTree / canManageGroups) always see the ELITE render policy;
 * everyone else gets the explicit `renderPolicy` prop, defaulting to FREE.
 */
export function resolveEffectiveRenderPolicy(args: {
  capability?: LineageEditorCapability
  renderPolicy?: LineageListingRenderPolicy
}): LineageListingRenderPolicy {
  const { capability, renderPolicy } = args
  if (capability?.canEditTree || capability?.canManageGroups) {
    return ELITE_LINEAGE_LISTING_RENDER_POLICY
  }
  return renderPolicy ?? FREE_LINEAGE_LISTING_RENDER_POLICY
}

/** The member whose node matches `nodeId`, or null. */
export function findMemberByNodeId(
  members: LineageTreeMemberRow[] | undefined,
  nodeId: string | null,
): LineageTreeMemberRow | null {
  if (!nodeId || !members) return null
  return members.find(member => member.nodeId === nodeId) ?? null
}

/**
 * Build the promoter-change context passed to the profile drawer, or null when
 * the change-promoter path is unavailable (no tree, not an editor, or no
 * selected member/profile).
 *
 * Awarded truth (ADR 0035): defaults to the member's shown (top awarded) rank —
 * the same award every surface displays. Candidates exclude the member itself
 * and its descendants (a member cannot be promoted by one of its own students).
 */
export function buildPromoterChangeContext(args: {
  treeId?: string
  capability?: LineageEditorCapability
  selectedProfile: LineageNodeProfile | null
  selectedMember: LineageTreeMemberRow | null
  members?: LineageTreeMemberRow[]
}): PromoterChangeContext | null {
  const { treeId, capability, selectedProfile, selectedMember, members } = args

  if (!treeId || !capability?.canEditTree || !selectedProfile || !selectedMember || !members) {
    return null
  }

  const excludedIds = descendantMemberIds(members, selectedMember.id)
  const candidates = members
    .filter(member => member.id !== selectedMember.id && !excludedIds.has(member.id))
    .map(member => ({ memberId: member.id, label: displayNameForMember(member) }))

  return {
    treeId,
    memberId: selectedMember.id,
    currentRankAwardId: selectedProfile.passport?.rankAwardsEarned?.[0]?.id ?? null,
    rankAwards: selectedProfile.passport?.rankAwardsEarned ?? [],
    candidates,
  }
}
