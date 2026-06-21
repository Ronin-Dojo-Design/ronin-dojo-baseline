/**
 * Pure board logic — date rollups, view derivation, HF pinning, ordering.
 *
 * Every function here is side-effect-free so the rollup / overdue / pin rules
 * (spec "Behavior expectations" 3–5) are unit-testable without React or a DOM.
 */

import type { BoardData, DateBucket, Project, Task } from "./types"

/** Today as a YYYY-MM-DD string in the local timezone. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Classify a task by its due date relative to `today` (spec behavior #3). */
export function dateBucket(task: Task, today: string = todayIso()): DateBucket {
  if (!task.due) return "none"
  if (task.due < today) return "overdue"
  if (task.due === today) return "today"
  return "upcoming"
}

/** HF lane pins to the top; otherwise keep due-date then created order. */
export function sortTasks(a: Task, b: Task): number {
  const aHot = a.lane === "HF" ? 0 : 1
  const bHot = b.lane === "HF" ? 0 : 1
  if (aHot !== bHot) return aHot - bHot
  const aDue = a.due ?? "9999-99-99"
  const bDue = b.due ?? "9999-99-99"
  if (aDue !== bDue) return aDue < bDue ? -1 : 1
  return a.createdAt < b.createdAt ? -1 : 1
}

/** Tasks shown in the Today view: not done, overdue or due today (spec #6). */
export function tasksForToday(data: BoardData, today: string = todayIso()): Task[] {
  return data.tasks
    .filter(
      t => !t.done && (dateBucket(t, today) === "overdue" || dateBucket(t, today) === "today"),
    )
    .sort(sortTasks)
}

/** Tasks shown in the Upcoming view: not done, due in the future. */
export function tasksForUpcoming(data: BoardData, today: string = todayIso()): Task[] {
  return data.tasks.filter(t => !t.done && dateBucket(t, today) === "upcoming").sort(sortTasks)
}

/** Inbox: not done, no due date. */
export function tasksForInbox(data: BoardData): Task[] {
  return data.tasks.filter(t => !t.done && !t.due).sort(sortTasks)
}

/** Active (not done) tasks for one project, HF-pinned. */
export function tasksForProject(data: BoardData, projectId: string): Task[] {
  return data.tasks.filter(t => !t.done && t.project === projectId).sort(sortTasks)
}

/** Completed tasks — rendered in the collapsed "done" group. */
export function doneTasks(data: BoardData, projectId?: string): Task[] {
  return data.tasks
    .filter(t => t.done && (projectId ? t.project === projectId : true))
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
}

/** Overdue count for the Today header / Overdue group. */
export function overdueCount(data: BoardData, today: string = todayIso()): number {
  return data.tasks.filter(t => !t.done && dateBucket(t, today) === "overdue").length
}

/** Active-task count per project, for the sidebar badges. */
export function projectCounts(data: BoardData): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const t of data.tasks) {
    if (!t.done) counts[t.project] = (counts[t.project] ?? 0) + 1
  }
  return counts
}

/** Projects in display order. */
export function orderedProjects(data: BoardData): Project[] {
  return [...data.projects].sort((a, b) => a.order - b.order)
}

/** Karma = simple completion count (spec gamify strip; +1 per done task). */
export function karma(data: BoardData): number {
  return data.tasks.filter(t => t.done).length
}
