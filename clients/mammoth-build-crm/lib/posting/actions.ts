"use server";

/**
 * Mammoth posting pipeline — server-side data layer (SESSION_0687).
 *
 * Thin "use server" wrapper over the pure lib/posting/generator.ts + lib/posting/status.ts
 * modules — same split as lib/lead-commit.ts / lib/actions.ts: business rules stay pure and
 * hermetically testable, this file only does DB I/O + the owner gate.
 *
 * STOPS AT APPROVED. `approvePostingDraft` is the only status-advancing export; there is no
 * export here (or anywhere in this app) that sets status "posted" — publishing to a platform is a
 * later wired step + an explicit operator action (SESSION_0687 hard rule §8).
 *
 * `requireOwner` below is a deliberate DUPLICATE of lib/actions.ts's helper of the same name, not
 * an import — this lane is scoped to lib/posting/** only (parallel-lane isolation guard) and
 * lib/actions.ts is a shared file a sibling lane may be editing concurrently. See
 * docs/sprints/SESSION_0687.md "## Proposed ledger edits" for the follow-up to extract ONE shared
 * `requireOwner` once both lanes land.
 */

import type { PostingDraft } from "../../.generated/prisma/client";
import { db } from "../db";
import { getServerSession } from "../auth";
import { extractPlaceholders, renderPostingTemplate } from "./generator";
import { planApprovePostingDraft } from "./status";
import type {
  GeneratePostingDraftInput,
  PostingDraftRecord,
  PostingPlatform,
  PostingStatus,
  PostingTemplateKey,
} from "./types";

/** Thrown when an action runs without an authenticated session. */
class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized: sign in to access the Mammoth posting pipeline.");
    this.name = "UnauthorizedError";
  }
}

/**
 * Resolve the caller's CRM owner (`TeamMember`) from the Better Auth session, provisioning the
 * owner record on first authenticated action. Throws `UnauthorizedError` when unauthenticated.
 * Duplicate of lib/actions.ts's `requireOwner` — see the file-header note above.
 */
async function requireOwner(): Promise<string> {
  const session = await getServerSession();
  const user = session?.user;
  if (!user?.id) {
    throw new UnauthorizedError();
  }

  const existing = await db.teamMember.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (existing) {
    return existing.id;
  }

  const byEmail = user.email
    ? await db.teamMember.findUnique({ where: { email: user.email }, select: { id: true } })
    : null;
  if (byEmail) {
    await db.teamMember.update({ where: { id: byEmail.id }, data: { userId: user.id } });
    return byEmail.id;
  }

  const created = await db.teamMember.create({
    data: { userId: user.id, name: user.name ?? user.email ?? "Owner", email: user.email },
    select: { id: true },
  });
  return created.id;
}

function toRecord(row: PostingDraft): PostingDraftRecord {
  return {
    approvedAt: row.approvedAt?.toISOString() ?? null,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    // Re-derived from the persisted body rather than stored — a single source of truth for
    // "which placeholders remain" that can't drift from the actual text.
    missingPlaceholders: extractPlaceholders(row.body),
    platform: row.platform as PostingPlatform,
    postedAt: row.postedAt?.toISOString() ?? null,
    projectId: row.projectId,
    scheduledFor: row.scheduledFor?.toISOString() ?? null,
    status: row.status as PostingStatus,
    templateKey: row.templateKey as PostingTemplateKey,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Owner-gated drafts, newest first. */
export async function listPostingDrafts(): Promise<PostingDraftRecord[]> {
  await requireOwner();
  const rows = await db.postingDraft.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((r) => toRecord(r));
}

/**
 * Render a template into a NEW draft (always lands at status "draft" — never pre-approved). The
 * server re-runs the SAME render rules the generator exposes; client-shaped bodies are never
 * trusted.
 */
export async function generatePostingDraft(
  input: GeneratePostingDraftInput,
): Promise<PostingDraftRecord> {
  await requireOwner();
  const rendered = renderPostingTemplate(input.templateKey, input.platform, input.context);
  const row = await db.postingDraft.create({
    data: {
      body: rendered.body,
      platform: input.platform,
      projectId: input.projectId,
      scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
      status: "draft",
      templateKey: input.templateKey,
    },
  });
  return toRecord(row);
}

/**
 * Advance one draft to "approved". Refuses (throws) when the draft isn't currently `draft` or
 * still has an unresolved `[PLACEHOLDER]` — see lib/posting/status.ts for the rule. NEVER
 * transitions to "posted"; there is no code path here that does.
 */
export async function approvePostingDraft(id: string): Promise<PostingDraftRecord> {
  const ownerId = await requireOwner();
  const existing = await db.postingDraft.findUniqueOrThrow({ where: { id } });
  const plan = planApprovePostingDraft({
    body: existing.body,
    status: existing.status as PostingStatus,
  });
  if (!plan.ok) {
    throw new Error(plan.reason);
  }
  // Guarded write: `status: "draft"` in the WHERE closes the read→plan→write race (TOCTOU) — a
  // concurrent approve/delete between the read above and this update can no longer double-apply.
  const updated = await db.postingDraft.updateMany({
    where: { id, status: "draft" },
    data: { approvedAt: plan.approvedAt, approvedById: ownerId, status: plan.status },
  });
  if (updated.count === 0) {
    // Lost the race — re-read and surface the SAME outcome the pre-check above produces:
    // not-found if the row vanished, otherwise the plan's refusal reason for the row's CURRENT
    // state.
    const current = await db.postingDraft.findUniqueOrThrow({ where: { id } });
    const replan = planApprovePostingDraft({
      body: current.body,
      status: current.status as PostingStatus,
    });
    throw new Error(replan.ok ? `Draft "${id}" changed while approving — retry.` : replan.reason);
  }
  const row = await db.postingDraft.findUniqueOrThrow({ where: { id } });
  return toRecord(row);
}
