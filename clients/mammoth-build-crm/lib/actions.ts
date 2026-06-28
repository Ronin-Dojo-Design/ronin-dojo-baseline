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
import type { BuildPhoto, NewProjectInput, Project, StageId } from "./types";
import type { BoardCard } from "@ronin-dojo/ui-kit/kanban";

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

function genOrderNumber(): string {
  return `MB-${Math.floor(1000 + Math.random() * 9000)}`;
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
function orderFieldsFor(
  stage: StageId,
  current: { orderConfirmed: boolean; orderNumber: string | null },
): { orderConfirmed: boolean; orderNumber: string | null } {
  if (!becomesOrderAt(stage)) {
    return { orderConfirmed: current.orderConfirmed, orderNumber: current.orderNumber };
  }
  return { orderConfirmed: true, orderNumber: current.orderNumber ?? genOrderNumber() };
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
  const rows = await db.project.findMany({
    include: PROJECT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => toProject(r as unknown as DbProject));
}

export async function createProject(input: NewProjectInput): Promise<Project> {
  const contact = await findOrCreateContact(input.contactName, input.contactEmail);
  const row = await db.project.create({
    data: {
      name: input.name,
      contactId: contact.id,
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
  const data: Record<string, unknown> = {};
  // Project scalar columns the UI patches (next step, notes, name, dims, etc.).
  const scalarKeys: (keyof Project)[] = [
    "name",
    "stage",
    "nextTask",
    "notes",
    "orderConfirmed",
    "orderNumber",
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
  const current = await db.project.findUniqueOrThrow({ where: { id } });
  const row = await db.project.update({
    where: { id },
    data: { stage, ...orderFieldsFor(stage, current) },
    include: PROJECT_INCLUDE,
  });
  return toProject(row as unknown as DbProject);
}

export async function advanceProject(id: string): Promise<Project> {
  const current = await db.project.findUniqueOrThrow({ where: { id } });
  const next = nextStage(current.stage as StageId);
  // Guardrail: a deal cannot reach "complete" unless it became a real order.
  if (!next || (next === "complete" && !current.orderConfirmed)) {
    return loadProject(id);
  }
  const row = await db.project.update({
    where: { id },
    data: { stage: next, ...orderFieldsFor(next, current) },
    include: PROJECT_INCLUDE,
  });
  return toProject(row as unknown as DbProject);
}

export async function addPhoto(
  projectId: string,
  photo: Omit<BuildPhoto, "id">,
): Promise<Project> {
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
  await db.buildPhoto.delete({ where: { id: photoId } });
  return loadProject(projectId);
}

export async function removeProject(id: string): Promise<void> {
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
): Promise<void> {
  await db.project.update({
    where: { id: card.id },
    data: {
      name: card.title,
      stage,
      nextTask: card.nextStep ?? existing.nextTask,
      lostReason: card.lostReason ?? existing.lostReason,
    },
  });
}

/** Create a Project from a board-originated card (intake / quick-add). */
async function createProjectFromCard(card: BoardCard, stage: StageId): Promise<void> {
  const contact = await findOrCreateContact(card.contact?.name, card.contact?.email);
  await db.project.create({
    data: {
      id: card.id, // preserve the kernel card id so subsequent saves UPDATE, not dupe
      name: card.title,
      contactId: contact.id,
      buildingType: "",
      use: "",
      region: "",
      stage,
      source: mapSource(card.source),
      nextTask: card.nextStep?.trim() || "First-touch follow-up within 24h",
      ...orderFieldsFor(stage, { orderConfirmed: false, orderNumber: null }),
      lostReason: card.lostReason ?? null,
    },
  });
}

/** Reconcile the kernel board's cards back into Project rows (existing → update, new → create). */
export async function reconcileBoard(cards: BoardCard[]): Promise<void> {
  for (const card of cards) {
    const stage = card.stage as StageId;
    const existing = await db.project.findUnique({ where: { id: card.id } });
    if (existing) {
      await updateProjectFromCard(existing, card, stage);
    } else {
      await createProjectFromCard(card, stage);
    }
  }
}
