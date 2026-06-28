/**
 * The Prisma-backed `BoardStore` adapter for the loop-board (Phase B, G-003).
 *
 * The kernel persists through the `BoardStore` port (ADR 0033 D2); here the adapter is just the two
 * server actions, which already match the port shape. The board never names a backend — swap this
 * adapter for the memory/localStorage ones and the same kernel is in-memory or browser-local instead.
 */

import type { BoardStore } from "@ronin-dojo/ui-kit/kanban"
import { loadBoard, saveBoard } from "~/server/loop-board/board-store"

export function createServerActionBoardStore(): BoardStore {
  return { load: loadBoard, save: saveBoard }
}
