/**
 * One-time migration: AdminTaskForge state → AdminTaskBoard BoardData.
 *
 * Spec "Migration note": Forge `{ lists:[{id,name,tasks}], activeListId }` maps
 * 1:1 → `{ projects, tasks }`. Each Forge task gains `project`, `due`, `lane`,
 * `status`. Pure + tested, so the mapping is provable without touching storage.
 *
 * Forge persisted under `bbl_admin_taskforge_v1` (monorepo source). We read that
 * key on first mount and fold it into the new board.
 */

import type { BoardData, Project, Task } from "./types"

export const FORGE_STORAGE_KEY = "bbl_admin_taskforge_v1"

type ForgeTask = {
  id: string
  title: string
  description?: string
  priority?: string
  done?: boolean
  createdAt?: string
  completedAt?: string | null
}

type ForgeList = {
  id: string
  name: string
  createdAt?: string
  tasks?: ForgeTask[]
}

type ForgeState = {
  lists?: ForgeList[]
  activeListId?: string
}

function normalizePriority(p?: string): Task["priority"] {
  if (p === "high" || p === "medium" || p === "low") return p
  return null
}

/** Map a parsed Forge state object into BoardData. */
export function migrateForgeState(forge: ForgeState): BoardData {
  const lists = Array.isArray(forge.lists) ? forge.lists : []
  const projects: Project[] = lists.map((list, index) => ({
    id: list.id,
    name: list.name,
    color: "muted",
    order: index + 1,
  }))

  const tasks: Task[] = lists.flatMap(list =>
    (list.tasks ?? []).map(t => ({
      id: t.id,
      project: list.id,
      title: t.title,
      due: null,
      lane: null,
      status: "active" as const,
      priority: normalizePriority(t.priority),
      done: Boolean(t.done),
      createdAt: t.createdAt ?? new Date().toISOString(),
      completedAt: t.completedAt ?? null,
    })),
  )

  return { projects, tasks }
}

/**
 * Read the Forge localStorage blob (browser only) and migrate it. Returns null
 * when no Forge data exists or the blob is unparseable — the caller then falls
 * back to the board's own store / seed.
 */
export function readAndMigrateForge(): BoardData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(FORGE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ForgeState
    const migrated = migrateForgeState(parsed)
    return migrated.projects.length > 0 ? migrated : null
  } catch {
    return null
  }
}
