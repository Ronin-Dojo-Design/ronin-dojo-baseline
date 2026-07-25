"use server";

/**
 * Review-request engine — server actions (SESSION_0685).
 *
 * Two actions, matching the app's "use server" pattern (lib/actions.ts) and
 * reusing its ONE owner-gate rather than building a second auth path:
 *
 *   - `generateReviewRequestDraft` — the completed-job trigger. Renders
 *     review-request-sequences.md copy (lib/reviews/generator.ts) into a
 *     `draft` ReviewRequest row. Never sends, never approves.
 *   - `approveReviewRequest` — `draft` → `approved`. STOPS THERE. The actual
 *     send is a later wired step + operator action (HOLD EXTERNAL ACTIONS,
 *     SESSION_0685) — nothing in this module or its callees ever calls a
 *     live email/SMS provider, and no code path here writes `sent`.
 *
 * Callers wire the completed-job trigger itself (e.g. off `Project.stage`
 * crossing into `complete`, the CRM's Satisfied Installation gate per
 * review-request-sequences.md) — that hook is a later step; this module is
 * the render/persist + approve halves only.
 */

import { db } from "../db";
import { requireOwner, requireOwnedProject } from "../actions";
import { getReviewRequestSenderConfig } from "./config";
import { planReviewRequest } from "./generator";
import { assertApprovable } from "./transitions";
import type { ReviewRequestCustomerInput, ReviewSequenceStep } from "./types";

const OPEN_TASK_STATUSES = ["open", "at_risk"] as const;

/**
 * Render + persist one DRAFT review request for a project's primary contact.
 * Owner-gated + ownership-scoped like every mutation in lib/actions.ts.
 */
export async function generateReviewRequestDraft(
  projectId: string,
  step: ReviewSequenceStep = "first_touch",
) {
  const ownerId = await requireOwner();
  await requireOwnedProject(projectId, ownerId);

  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: {
      contact: true,
      activities: { where: { type: "task", status: { in: [...OPEN_TASK_STATUSES] } } },
    },
  });

  const customer: ReviewRequestCustomerInput = {
    customerFirstName: project.contact.name.trim().split(/\s+/)[0] || project.contact.name,
    buildingType: project.buildingType || "building",
    smsConsent: project.contact.smsConsent,
    // No stored channel-preference field yet — the generator's default (email
    // unless explicitly preferred + consented) covers this until one exists.
    preferredChannel: null,
    hasOpenResolutionTask: project.activities.length > 0,
  };

  const config = getReviewRequestSenderConfig();
  const rendered = planReviewRequest(customer, config, step);

  return db.reviewRequest.create({
    data: {
      projectId,
      contactId: project.contact.id,
      route: rendered.route,
      sequenceStep: rendered.sequenceStep,
      channel: rendered.channel,
      consentBasis: rendered.consentBasis,
      smsConsent: customer.smsConsent,
      subject: rendered.subject,
      body: rendered.body,
      optOutNotice: rendered.optOutNotice,
      status: "draft",
    },
  });
}

/**
 * `draft` → `approved`. Re-checks LIVE consent (the current `Contact.smsConsent`
 * + this request's own `optOut` flag) rather than trusting the draft-time
 * snapshot, since consent can be revoked or an opt-out recorded between
 * drafting and approval. STOPS at `approved` — see module docstring.
 */
export async function approveReviewRequest(reviewRequestId: string) {
  const ownerId = await requireOwner();

  const existing = await db.reviewRequest.findUniqueOrThrow({
    where: { id: reviewRequestId },
    include: {
      project: { select: { ownerId: true } },
      contact: { select: { smsConsent: true } },
    },
  });
  if (existing.project.ownerId !== null && existing.project.ownerId !== ownerId) {
    throw new Error("Forbidden: this review request belongs to another owner's project.");
  }

  assertApprovable({
    status: existing.status,
    channel: existing.channel,
    smsConsent: existing.contact.smsConsent,
    optOut: existing.optOut,
  });

  return db.reviewRequest.update({
    where: { id: reviewRequestId },
    data: { status: "approved", approvedAt: new Date(), approvedBy: ownerId },
  });
}
