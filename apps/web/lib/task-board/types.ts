/**
 * AdminTaskBoard (PWCC-001) — core data shapes.
 *
 * Spec: docs/knowledge/wiki/files/bbl-admin-task-board.md ("Lean JSON" section).
 * Runtime data is plain JSON (no YAML at runtime). Optional fields are omitted
 * when empty to keep the localStorage / sync payloads small.
 *
 * The `LifecycleStatus` enum is the SHARED status vocabulary (ADR 0033 D3 / the
 * m-card spec) — tasks and the component catalog reuse the same four values.
 */

/** Shared lifecycle vocabulary — reused by tasks and the design-system inventory. */
export type LifecycleStatus = "active" | "inactive" | "deprecated" | "broken"

/** Lane: how urgent / what kind of fix. `null`/absent = a normal task. */
export type TaskLane = "QF" | "HF"

export type TaskPriority = "high" | "medium" | "low"

/** One flat task. Mirrors the spec's "Lean JSON — task". */
export type Task = {
  id: string
  project: string
  title: string
  /** ISO date (YYYY-MM-DD) or null. */
  due?: string | null
  lane?: TaskLane | null
  status: LifecycleStatus
  priority?: TaskPriority | null
  labels?: string[]
  done: boolean
  /** ISO timestamp. */
  createdAt: string
  completedAt?: string | null
}

/** One flat project (list). Mirrors the spec's "Lean JSON — project". */
export type Project = {
  id: string
  name: string
  /** Token name, never a hex — resolves via the design system. */
  color: "accent" | "muted"
  order: number
}

/** The whole persisted board document. */
export type BoardData = {
  projects: Project[]
  tasks: Task[]
}

/** Which derived view the main column renders. */
export type BoardView = "today" | "upcoming" | "inbox" | "project"

/** Bucket a task falls into for the Today-view date rollups. */
export type DateBucket = "overdue" | "today" | "upcoming" | "none"
