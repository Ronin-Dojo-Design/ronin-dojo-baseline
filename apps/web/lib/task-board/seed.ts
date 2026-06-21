/**
 * Seed board — doubles as the preview fixture and the test seed (spec
 * "Preview opportunities": fixture ≡ what tests assert). Mirrors the operator's
 * reference projects (BBL, Ronin Dojo Design, Web/Graphic Design, Inbox).
 *
 * `due` dates are computed relative to "now" so the Today / Overdue / Upcoming
 * groups are always populated in a fresh demo.
 */

import type { BoardData, Task } from "./types"
import { todayIso } from "./board-logic"

/** Short, collision-resistant id (no crypto dependency needed at this scale). */
export function makeId(prefix = "t"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`
}

function offsetDate(days: number, now: Date = new Date()): string {
  const d = new Date(now)
  d.setDate(d.getDate() + days)
  return todayIso(d)
}

export function seedBoard(now: Date = new Date()): BoardData {
  const created = now.toISOString()
  const t = (task: Omit<Task, "createdAt" | "status" | "done"> & Partial<Task>): Task => ({
    status: "active",
    done: false,
    createdAt: created,
    ...task,
  })

  return {
    projects: [
      { id: "bbl", name: "Black Belt Legacy", color: "accent", order: 1 },
      { id: "ronin", name: "Ronin Dojo Design", color: "muted", order: 2 },
      { id: "web-design", name: "Web/Graphic Design", color: "muted", order: 3 },
      { id: "inbox", name: "Inbox", color: "muted", order: 4 },
    ],
    tasks: [
      t({
        id: makeId(),
        project: "bbl",
        title: "Look at WEKAF quiz",
        due: offsetDate(-3, now),
        lane: "HF",
        priority: "high",
        labels: ["content"],
      }),
      t({
        id: makeId(),
        project: "bbl",
        title: "Drala Center promo videos",
        due: offsetDate(-1, now),
        priority: "medium",
      }),
      t({
        id: makeId(),
        project: "bbl",
        title: "Invite Dirty Dozen guys",
        due: todayIso(now),
        lane: "QF",
      }),
      t({
        id: makeId(),
        project: "bbl",
        title: "Feature: lineage improvement",
        due: offsetDate(5, now),
        priority: "high",
      }),
      t({
        id: makeId(),
        project: "ronin",
        title: "Video edits",
        due: offsetDate(2, now),
      }),
      t({
        id: makeId(),
        project: "ronin",
        title: "Prep for big push",
        due: offsetDate(7, now),
      }),
      t({
        id: makeId(),
        project: "web-design",
        title: "Refresh the brand one-pager",
        priority: "low",
      }),
      t({
        id: makeId(),
        project: "inbox",
        title: "Reply to membership emails",
      }),
      t({
        id: makeId(),
        project: "bbl",
        title: "Archive the launch checklist",
        done: true,
        completedAt: created,
      }),
    ],
  }
}
