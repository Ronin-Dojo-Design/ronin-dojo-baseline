/**
 * Mammoth Build CRM — auth gate (TASK_02 — ADR 0038 D5: per-product identity).
 *
 * The ONE owner-gate every "use server" module in this app authenticates
 * through (lib/actions.ts + lib/reviews/actions.ts). Lives in a PLAIN module
 * — deliberately NO "use server" directive — so `requireOwner` /
 * `requireOwnedProject` are ordinary server-side helpers, not exported server
 * actions with their own POST endpoints (exporting them from a "use server"
 * file registered them as invocable actions — the SESSION_0685 review P1).
 *
 * Every server action is owner-gated: it must run as an authenticated Better
 * Auth user that resolves to a CRM owner (`TeamMember`). Two layers:
 *   1. SESSION — `requireOwner` throws if there's no session (no anonymous
 *      writes or reads of the pipeline).
 *   2. OWNERSHIP — reads + mutations are scoped to the caller's TeamMember id
 *      via `Project.ownerId`, so a forged/guessed project id can't read or
 *      mutate another owner's row (closes the IDOR surface flagged by
 *      task_9393f59c).
 *
 * Legacy/seed rows have `ownerId = NULL` (created before ownership existed).
 * The gate treats an unowned row as claimable: the caller may read it, and the
 * first mutation stamps it to the caller. It can NEVER cross to a DIFFERENT
 * owner's row.
 */

import { db } from "./db";
import { getServerSession } from "./auth";

/** Thrown when an action runs without an authenticated session. */
class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized: sign in to access the Mammoth pipeline.");
    this.name = "UnauthorizedError";
  }
}

/** Thrown when the caller tries to touch a project owned by someone else. */
export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden: this project belongs to another owner.");
    this.name = "ForbiddenError";
  }
}

/**
 * Resolve the caller's CRM owner (`TeamMember`) from the Better Auth session,
 * provisioning the owner record on first authenticated action (a fresh login has
 * a User but no TeamMember yet). Throws `UnauthorizedError` when unauthenticated.
 * The returned id is the ownership key for all scoping below.
 */
export async function requireOwner(): Promise<string> {
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

  // First authenticated action for this login: materialize its owner record.
  // `email` is unique on TeamMember, so adopt a pre-existing (imported) owner row
  // with the same email by linking it to this login rather than colliding.
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

/**
 * Load a project the caller is allowed to act on, or throw. Allowed = the row is
 * owned by the caller, OR it's an unowned legacy row (claimable). Used as the
 * ownership pre-check before every mutation on an existing project.
 */
export async function requireOwnedProject(
  id: string,
  ownerId: string,
): Promise<{ ownerId: string | null }> {
  const row = await db.project.findUnique({ where: { id }, select: { ownerId: true } });
  if (!row) {
    // Surface the same "not found" shape callers already handle from findUniqueOrThrow.
    throw new Error(`Project ${id} not found`);
  }
  if (row.ownerId !== null && row.ownerId !== ownerId) {
    throw new ForbiddenError();
  }
  return row;
}
