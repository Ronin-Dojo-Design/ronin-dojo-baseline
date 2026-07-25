/**
 * Posting-draft status transitions (SESSION_0687) — pure rules, no DB/session access.
 *
 * Mirrors the BBL approval-queue posture: EVERY draft starts at `draft`. This module's ONLY
 * forward transition is draft → approved — there is no function here (or anywhere in
 * lib/posting/**) that produces `posted`. Publishing to a platform is a LATER wired step + an
 * explicit operator action; approving a draft never posts it (hard rule, SESSION_0687 §8).
 */

import { hasUnresolvedPlaceholders } from "./generator";

export type PostingStatus = "draft" | "approved" | "posted";

/** The minimal shape a caller needs to ask "can this draft be approved?". */
export type PostingDraftLike = {
  status: PostingStatus;
  body: string;
};

export type ApprovalPlan =
  | { ok: true; status: "approved"; approvedAt: Date }
  | { ok: false; reason: string };

/**
 * Decide whether `draft` may advance to `approved`, and what to write if so. Refuses (does not
 * throw — the caller decides how to surface `reason`) when:
 *   - the draft isn't currently `draft` (no re-approving an approved/posted row, no skipping
 *     straight from nothing to approved);
 *   - the rendered body still has an unresolved `[PLACEHOLDER]` — "never turn a placeholder into
 *     a guess" (posting-templates.md's shared rule) applies at the approval gate too.
 * `now` is injectable for deterministic tests.
 */
export function planApprovePostingDraft(
  draft: PostingDraftLike,
  now: Date = new Date(),
): ApprovalPlan {
  if (draft.status !== "draft") {
    return {
      ok: false,
      reason: `Only a draft may be approved (current status: "${draft.status}").`,
    };
  }
  if (hasUnresolvedPlaceholders(draft.body)) {
    return {
      ok: false,
      reason: "This draft still has unfilled [PLACEHOLDER] tokens — resolve them before approving.",
    };
  }
  return { ok: true, status: "approved", approvedAt: now };
}
