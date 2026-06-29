"use server";

/**
 * Mammoth Build CRM — server-side data layer (ADR 0038 Phase 2).
 *
 * Replaces the `lib/store.ts` localStorage hooks. The flat `Project` shape the
 * components consume is the PUBLIC contract; internally the DB is normalized
 * (Project ↔ Contact, BuildPhoto relation). The read-model (`toProject`)
 * flattens; the write paths normalize — so components don't churn.
 *
 * Guardrails preserved from the localStorage model:
 *   - crossing into the `deposit` stage = the project becomes a real order
 *     (orderConfirmed + a stamped order number);
 *   - a deal can't reach `complete` unless it's a confirmed order;
 *   - "no silent drop" — close-lost requires a reason (enforced in the UI /
 *     the board's `lost-reason` automation).
 *
 * Every export in this "use server" module MUST be an async function (Next
 * server-action rule). Helpers below are non-exported local functions.
 */

import { ORDER_STAGE, nextStage, stageIndex } from "./stages";
import { db } from "./db";
import { getServerSession } from "./auth";
import type { BuildPhoto, NewProjectInput, Project, StageId } from "./types";
import type { BoardCard } from "@ronin-dojo/ui-kit/kanban";

// ---------------------------------------------------------------------------
// Auth gate (TASK_02 — ADR 0038 D5: per-product identity)
// ---------------------------------------------------------------------------
//
// Every server action below is owner-gated: it must run as an authenticated
// Better Auth user that resolves to a CRM owner (`TeamMember`). Two layers:
//   1. SESSION — `requireOwner` throws if there's no session (no anonymous writes
//      or reads of the pipeline).
//   2. OWNERSHIP — reads + mutations are scoped to the caller's TeamMember id via
//      `Project.ownerId`, so a forged/guessed project id can't read or mutate
//      another owner's row (closes the IDOR surface flagged by task_9393f59c).
//
// Legacy/seed rows have `ownerId = NULL` (created before ownership existed). The
// gate treats an unowned row as claimable: the caller may read it, and the first
// mutation stamps it to the caller. It can NEVER cross to a DIFFERENT owner's row.

/** Thrown when an action runs without an authenticated session. */
class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized: sign in to access the Mammoth pipeline.");
    this.name = "UnauthorizedError";
  }
}

/** Thrown when the caller tries to touch a project owned by someone else. */
class ForbiddenError extends Error {
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
async function requireOwnedProject(
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

// ---------------------------------------------------------------------------
// Read-model mappers (DB row → the flat Project the components expect)
// ---------------------------------------------------------------------------

const PROJECT_INCLUDE = {
  contact: true,
  photos: { orderBy: { createdAt: "asc" } },
} as const;

type DbPhoto = {
  id: string;
  phase: string;
  stage: string;
  dataUrl: string;
  caption: string;
  takenAt: Date;
};

type DbProject = {
  id: string;
  name: string;
  contact: { name: string; email: string };
  buildingType: string;
  use: string;
  region: string;
  width: number | null;
  length: number | null;
  eaveHeight: number | null;
  stage: string;
  nextTask: string;
  orderConfirmed: boolean;
  orderNumber: string | null;
  notes: string;
  photos: DbPhoto[];
  createdAt: Date;
  updatedAt: Date;
};

function toPhoto(p: DbPhoto): BuildPhoto {
  return {
    id: p.id,
    phase: p.phase as BuildPhoto["phase"],
    stage: p.stage as StageId,
    dataUrl: p.dataUrl,
    caption: p.caption,
    takenAt: p.takenAt.toISOString(),
  };
}

function toProject(row: DbProject): Project {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact.name,
    contactEmail: row.contact.email,
    buildingType: row.buildingType,
    use: row.use,
    region: row.region,
    width: row.width,
    length: row.length,
    eaveHeight: row.eaveHeight,
    stage: row.stage as StageId,
    nextTask: row.nextTask,
    orderConfirmed: row.orderConfirmed,
    orderNumber: row.orderNumber,
    notes: row.notes,
    photos: row.photos.map(toPhoto),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Allocate an order number no project holds yet. 6 digits + an existence check (the `@unique`
 * on `Project.orderNumber` is the hard DB backstop); retries on the rare collision rather than
 * silently stamping a duplicate business key.
 */
async function genOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = `MB-${Math.floor(100000 + Math.random() * 900000)}`;
    const clash = await db.project.findFirst({
      where: { orderNumber: candidate },
      select: { id: true },
    });
    if (!clash) {
      return candidate;
    }
  }
  throw new Error("could not allocate a unique order number after 20 attempts");
}

/** Whether reaching `stage` makes the project a committed order (deposit+). */
function becomesOrderAt(stage: StageId): boolean {
  return stageIndex(stage) >= stageIndex(ORDER_STAGE);
}

/**
 * The order-stamp fields for a project entering `stage`. Crossing into `deposit`
 * (or beyond) confirms the order and stamps a number if it doesn't have one yet;
 * otherwise the existing values carry through. The single home for the
 * order-confirm guardrail — shared by setStage, advance, and the board create.
 */
async function orderFieldsFor(
  stage: StageId,
  current: { orderConfirmed: boolean; orderNumber: string | null },
): Promise<{ orderConfirmed: boolean; orderNumber: string | null }> {
  if (!becomesOrderAt(stage)) {
    return { orderConfirmed: current.orderConfirmed, orderNumber: current.orderNumber };
  }
  return { orderConfirmed: true, orderNumber: current.orderNumber ?? (await genOrderNumber()) };
}

async function loadProject(id: string): Promise<Project> {
  const row = await db.project.findUniqueOrThrow({ where: { id }, include: PROJECT_INCLUDE });
  return toProject(row as unknown as DbProject);
}

/** Find a contact by email (CRM dedupe), else create one. */
async function findOrCreateContact(name?: string, email?: string) {
  const trimmedEmail = (email ?? "").trim();
  if (trimmedEmail) {
    const existing = await db.contact.findFirst({ where: { email: trimmedEmail } });
    if (existing) {
      return existing;
    }
  }
  return db.contact.create({
    data: { name: (name ?? "").trim() || "Unknown", email: trimmedEmail },
  });
}

// ---------------------------------------------------------------------------
// Project read + mutations (the useProjects surface)
// ---------------------------------------------------------------------------

export async function listProjects(): Promise<Project[]> {
  const ownerId = await requireOwner();
  // Owner-scoped: the caller's projects + any unowned legacy/seed rows (claimable);
  // never another owner's rows. This is the read half of the IDOR gate.
  const rows = await db.project.findMany({
    where: { OR: [{ ownerId }, { ownerId: null }] },
    include: PROJECT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => toProject(r as unknown as DbProject));
}

export async function createProject(input: NewProjectInput): Promise<Project> {
  const ownerId = await requireOwner();
  const contact = await findOrCreateContact(input.contactName, input.contactEmail);
  const row = await db.project.create({
    data: {
      name: input.name,
      contactId: contact.id,
      ownerId,
      buildingType: input.buildingType,
      use: input.use,
      region: input.region,
      width: input.width,
      length: input.length,
      eaveHeight: input.eaveHeight,
      notes: input.notes,
      stage: "lead",
      nextTask: "First-touch follow-up within 24h",
      orderConfirmed: false,
    },
    include: PROJECT_INCLUDE,
  });
  return toProject(row as unknown as DbProject);
}

export async function patchProject(id: string, changes: Partial<Project>): Promise<Project> {
  const ownerId = await requireOwner();
  await requireOwnedProject(id, ownerId);
  const data: Record<string, unknown> = {};
  // Claim an unowned legacy row to the caller on first mutation (no-op if already owned).
  data.ownerId = ownerId;
  // Project scalar columns the UI patches (next step, notes, name, dims, etc.).
  // Deliberately NOT patchable here: `stage` and the order state (`orderConfirmed`/`orderNumber`)
  // are owned by the guardrail — stage moves go through `setProjectStage`/`advanceProject` so they
  // run `orderFieldsFor`; a raw `patch({ stage })` would bypass the order-confirm rule.
  const scalarKeys: (keyof Project)[] = [
    "name",
    "nextTask",
    "notes",
    "buildingType",
    "use",
    "region",
    "width",
    "length",
    "eaveHeight",
  ];
  for (const key of scalarKeys) {
    if (changes[key] !== undefined) {
      data[key] = changes[key];
    }
  }
  // Contact fields ride a nested update (kept general; the current UI doesn't use it).
  const contactData: Record<string, unknown> = {};
  if (changes.contactName !== undefined) {
    contactData.name = changes.contactName;
  }
  if (changes.contactEmail !== undefined) {
    contactData.email = changes.contactEmail;
  }
  if (Object.keys(contactData).length > 0) {
    data.contact = { update: contactData };
  }
  const row = await db.project.update({
    where: { id },
    data,
    include: PROJECT_INCLUDE,
  });
  return toProject(row as unknown as DbProject);
}

export async function setProjectStage(id: string, stage: StageId): Promise<Project> {
  const ownerId = await requireOwner();
  await requireOwnedProject(id, ownerId);
  const current = await db.project.findUniqueOrThrow({ where: { id } });
  const row = await db.project.update({
    where: { id },
    data: { stage, ownerId, ...(await orderFieldsFor(stage, current)) },
    include: PROJECT_INCLUDE,
  });
  return toProject(row as unknown as DbProject);
}

export async function advanceProject(id: string): Promise<Project> {
  const ownerId = await requireOwner();
  await requireOwnedProject(id, ownerId);
  const current = await db.project.findUniqueOrThrow({ where: { id } });
  const next = nextStage(current.stage as StageId);
  // Guardrail: a deal cannot reach "complete" unless it became a real order.
  if (!next || (next === "complete" && !current.orderConfirmed)) {
    return loadProject(id);
  }
  const row = await db.project.update({
    where: { id },
    data: { stage: next, ownerId, ...(await orderFieldsFor(next, current)) },
    include: PROJECT_INCLUDE,
  });
  return toProject(row as unknown as DbProject);
}

export async function addPhoto(
  projectId: string,
  photo: Omit<BuildPhoto, "id">,
): Promise<Project> {
  const ownerId = await requireOwner();
  await requireOwnedProject(projectId, ownerId);
  await db.buildPhoto.create({
    data: {
      projectId,
      phase: photo.phase,
      stage: photo.stage,
      dataUrl: photo.dataUrl,
      caption: photo.caption,
      takenAt: new Date(photo.takenAt),
    },
  });
  return loadProject(projectId);
}

export async function removePhoto(projectId: string, photoId: string): Promise<Project> {
  const ownerId = await requireOwner();
  await requireOwnedProject(projectId, ownerId);
  // Scope the delete to its project: a wrong/forged photoId must not delete another project's
  // photo. `deleteMany` no-ops (count 0) on a mismatch instead of throwing or crossing projects.
  await db.buildPhoto.deleteMany({ where: { id: photoId, projectId } });
  return loadProject(projectId);
}

export async function removeProject(id: string): Promise<void> {
  const ownerId = await requireOwner();
  await requireOwnedProject(id, ownerId);
  // Project cascades to its photos/activities/quotes/invoices (schema onDelete: Cascade).
  await db.project.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Board reconcile (the AdminKanban BoardStore.save path)
// ---------------------------------------------------------------------------

type LeadSourceValue = "referral" | "web_form" | "phone" | "email" | "trade_show" | "other";

const SOURCE_BY_CARD: Record<string, LeadSourceValue> = {
  web: "web_form",
  email: "email",
  phone: "phone",
  manual: "other",
};

function mapSource(source?: string): LeadSourceValue {
  return (source && SOURCE_BY_CARD[source]) || "web_form";
}

// The board persists through the kernel's BoardStore port (ADR 0033 D2):
// `reconcileBoard` maps each card back to a Project row. Order state
// (orderConfirmed / orderNumber) stays owned by the project-detail actions —
// the board's `order-guard` already blocks reaching deposit without a confirmed
// order, so a card at deposit+ implies the DB is already confirmed.

/** Update an existing Project from its board card (board-mutable fields only). */
async function updateProjectFromCard(
  existing: { nextTask: string; lostReason: string | null },
  card: BoardCard,
  stage: StageId,
  ownerId: string,
): Promise<void> {
  await db.project.update({
    where: { id: card.id },
    data: {
      name: card.title,
      stage,
      ownerId, // claim an unowned legacy row to the caller (no-op if already owned)
      nextTask: card.nextStep ?? existing.nextTask,
      lostReason: card.lostReason ?? existing.lostReason,
    },
  });
}

/** Create a Project from a board-originated card (intake / quick-add). */
async function createProjectFromCard(
  card: BoardCard,
  stage: StageId,
  ownerId: string,
): Promise<void> {
  const contact = await findOrCreateContact(card.contact?.name, card.contact?.email);
  await db.project.create({
    data: {
      id: card.id, // preserve the kernel card id so subsequent saves UPDATE, not dupe
      name: card.title,
      contactId: contact.id,
      ownerId,
      buildingType: "",
      use: "",
      region: "",
      stage,
      source: mapSource(card.source),
      nextTask: card.nextStep?.trim() || "First-touch follow-up within 24h",
      ...(await orderFieldsFor(stage, { orderConfirmed: false, orderNumber: null })),
      lostReason: card.lostReason ?? null,
    },
  });
}

/** Reconcile the kernel board's cards back into Project rows (existing → update, new → create). */
export async function reconcileBoard(cards: BoardCard[]): Promise<void> {
  const ownerId = await requireOwner();
  for (const card of cards) {
    const stage = card.stage as StageId;
    const existing = await db.project.findUnique({
      where: { id: card.id },
      select: { ownerId: true, nextTask: true, lostReason: true },
    });
    if (existing) {
      // Ownership gate: never let a board save mutate another owner's project.
      if (existing.ownerId !== null && existing.ownerId !== ownerId) {
        throw new ForbiddenError();
      }
      await updateProjectFromCard(existing, card, stage, ownerId);
    } else {
      await createProjectFromCard(card, stage, ownerId);
    }
  }
}
