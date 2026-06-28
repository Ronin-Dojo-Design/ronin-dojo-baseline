/**
 * KanbanCard ↔ kernel BoardCard mappers (loop-board Phase B, G-003).
 *
 * Pure row↔card translation for the Prisma `BoardStore` adapter. Kept out of the `"use server"`
 * module (which may only export async actions) so it stays plain + unit-testable.
 *
 * The loop-board renders `cardKind="task"`, so the deal-only kernel fields (`contact`, intake
 * `source`) are intentionally NOT persisted — only the task-relevant slice round-trips. `KanbanCard.source`
 * (the persistence ORIGIN enum) is distinct from the kernel `BoardCard.source` (the intake channel).
 */

import type { BoardCard, MCardBadge } from "@ronin-dojo/ui-kit"
import { type KanbanCard, type KanbanCardSource, Prisma } from "~/.generated/prisma/client"
import type { LegacyTaskInput } from "~/lib/loop-board/parse-legacy-tasks"

export type { LegacyTaskInput }

/** JSON helpers — store DB NULL (not JSON `null`) when a presentation bag is absent. */
function badgesToJson(
  badges: MCardBadge[] | undefined,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return badges?.length ? (badges as unknown as Prisma.InputJsonValue) : Prisma.DbNull
}

function fieldsToJson(
  fields: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return fields && Object.keys(fields).length ? (fields as Prisma.InputJsonValue) : Prisma.DbNull
}

function jsonToBadges(value: Prisma.JsonValue): MCardBadge[] | undefined {
  return value ? (value as unknown as MCardBadge[]) : undefined
}

function jsonToFields(value: Prisma.JsonValue): Record<string, unknown> | undefined {
  return value ? (value as Record<string, unknown>) : undefined
}

/** Read model: a persisted row → the kernel's BoardCard. Timestamps come from the row (never INERT_TS). */
export function rowToBoardCard(row: KanbanCard): BoardCard {
  return {
    id: row.id,
    stage: row.stage,
    order: row.order,
    title: row.title,
    status: (row.status as BoardCard["status"]) ?? undefined,
    lane: (row.lane as BoardCard["lane"]) ?? undefined,
    owner: row.owner ?? undefined,
    due: row.due ?? undefined,
    nextStep: row.nextStep ?? undefined,
    value: row.value ?? undefined,
    badges: jsonToBadges(row.badges),
    fields: jsonToFields(row.fields),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

/** The persisted task-slice of a BoardCard, shared by create/update. `order` = index within its stage. */
function cardScalars(card: BoardCard, order: number) {
  return {
    stage: card.stage,
    order,
    title: card.title,
    status: card.status ?? null,
    lane: card.lane ?? null,
    owner: card.owner ?? null,
    due: card.due ?? null,
    nextStep: card.nextStep ?? null,
    value: card.value ?? null,
    badges: badgesToJson(card.badges),
    fields: fieldsToJson(card.fields),
  }
}

/**
 * Create-branch data for a card the operator just added on the board. By construction this is always a
 * `manual` card: ledger/task cards only ever enter via their importers (which run before any save), so a
 * card unknown to the DB at save time can only be a kernel quick-add/intake. `sourceRef` stays null
 * (manual cards never collide on the `(configId, source, sourceRef)` unique — Postgres NULLs are distinct).
 */
export function cardToManualCreate(
  card: BoardCard,
  configId: string,
  order: number,
): Prisma.KanbanCardUncheckedCreateInput {
  return { id: card.id, configId, source: "manual", sourceRef: null, ...cardScalars(card, order) }
}

/** Update-branch data — never touches the immutable origin (`source`/`sourceRef`/`createdAt`). */
export function cardToUpdate(
  card: BoardCard,
  order: number,
): Prisma.KanbanCardUncheckedUpdateInput {
  return cardScalars(card, order)
}

/**
 * Importer create-row for a projected ledger card (insert-only via `createMany skipDuplicates`).
 * `order` = the card's rank index in the aggregated backlog, so the persisted column order is the
 * ledger's priority rank (not all-zero → scrambled). Relative order within a stage is what the
 * kernel renders by; a later operator edit renormalizes the stage to 0..n via `saveBoard`.
 */
export function ledgerCardToCreate(
  card: BoardCard,
  configId: string,
  order: number,
): Prisma.KanbanCardCreateManyInput {
  // The card id is already the stable `CODE:id` (e.g. `GL:G-003`) — reuse it as the dedup sourceRef.
  return {
    id: card.id,
    configId,
    source: "ledger",
    sourceRef: card.id,
    ...cardScalars(card, order),
  }
}

/** Importer create-row for a migrated legacy task (one-time localStorage → DB lift). */
export function legacyTaskToCreate(
  task: LegacyTaskInput,
  configId: string,
): Prisma.KanbanCardCreateManyInput {
  const source: KanbanCardSource = "task"
  return {
    id: `task:${task.id}`,
    configId,
    source,
    sourceRef: task.id,
    stage: task.done ? "done" : "backlog",
    order: 0,
    title: task.title,
    status: task.done ? "inactive" : "active",
    lane: task.lane ?? null,
    due: task.due ?? null,
    // Carry the origin project as a calm provenance badge so the migrated task keeps its context.
    badges: task.project
      ? ([{ label: task.project }] as unknown as Prisma.InputJsonValue)
      : Prisma.DbNull,
  }
}
