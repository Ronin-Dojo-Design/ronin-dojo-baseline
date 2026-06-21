// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  dateBucket,
  doneTasks,
  overdueCount,
  projectCounts,
  sortTasks,
  tasksForInbox,
  tasksForToday,
  tasksForUpcoming,
} from "./board-logic"
import { migrateForgeState } from "./migrate-forge"
import { boardReducer } from "./use-task-board"
import type { BoardData, Task } from "./types"

const TODAY = "2026-06-20"

function task(partial: Partial<Task> & Pick<Task, "id" | "project" | "title">): Task {
  return {
    due: null,
    lane: null,
    status: "active",
    priority: null,
    done: false,
    createdAt: "2026-06-01T00:00:00Z",
    completedAt: null,
    ...partial,
  }
}

const board: BoardData = {
  projects: [
    { id: "bbl", name: "Black Belt Legacy", color: "accent", order: 1 },
    { id: "inbox", name: "Inbox", color: "muted", order: 2 },
  ],
  tasks: [
    task({ id: "a", project: "bbl", title: "Overdue", due: "2026-06-10" }),
    task({ id: "b", project: "bbl", title: "Due today", due: TODAY }),
    task({ id: "c", project: "bbl", title: "Future", due: "2026-07-01" }),
    task({ id: "d", project: "inbox", title: "No date" }),
    task({
      id: "e",
      project: "bbl",
      title: "Done",
      due: "2026-06-05",
      done: true,
      completedAt: "2026-06-06T00:00:00Z",
    }),
    task({ id: "hot", project: "bbl", title: "Hot fix", due: "2026-06-09", lane: "HF" }),
  ],
}

describe("dateBucket", () => {
  it("buckets by due date relative to today", () => {
    expect(dateBucket(board.tasks[0], TODAY)).toBe("overdue")
    expect(dateBucket(board.tasks[1], TODAY)).toBe("today")
    expect(dateBucket(board.tasks[2], TODAY)).toBe("upcoming")
    expect(dateBucket(board.tasks[3], TODAY)).toBe("none")
  })
})

describe("view rollups", () => {
  it("Today = overdue + due-today, not done", () => {
    const ids = tasksForToday(board, TODAY).map(t => t.id)
    expect(ids).toContain("a")
    expect(ids).toContain("b")
    expect(ids).toContain("hot")
    expect(ids).not.toContain("c")
    expect(ids).not.toContain("e") // done excluded
  })

  it("Upcoming = future, not done", () => {
    expect(tasksForUpcoming(board, TODAY).map(t => t.id)).toEqual(["c"])
  })

  it("Inbox = no due date, not done", () => {
    expect(tasksForInbox(board).map(t => t.id)).toEqual(["d"])
  })

  it("overdueCount counts only overdue + open", () => {
    expect(overdueCount(board, TODAY)).toBe(2) // a + hot
  })
})

describe("HF pin", () => {
  it("sorts HF lane to the top regardless of due date", () => {
    const sorted = tasksForToday(board, TODAY)
    expect(sorted[0].id).toBe("hot")
  })

  it("sortTasks puts HF before a non-HF with an earlier due date", () => {
    const hf = task({ id: "x", project: "bbl", title: "x", due: "2026-12-31", lane: "HF" })
    const normal = task({ id: "y", project: "bbl", title: "y", due: "2026-06-21" })
    expect([normal, hf].sort(sortTasks)[0].id).toBe("x")
  })
})

describe("done + counts", () => {
  it("doneTasks returns completed only", () => {
    expect(doneTasks(board).map(t => t.id)).toEqual(["e"])
  })

  it("projectCounts counts open tasks per project", () => {
    expect(projectCounts(board)).toEqual({ bbl: 4, inbox: 1 })
  })
})

describe("reducer", () => {
  it("add inserts an active task at the top", () => {
    const next = boardReducer(board, {
      type: "add",
      input: { project: "bbl", title: "New thing" },
    })
    expect(next.tasks[0].title).toBe("New thing")
    expect(next.tasks[0].done).toBe(false)
    expect(next.tasks[0].status).toBe("active")
    expect(next.tasks.length).toBe(board.tasks.length + 1)
  })

  it("toggleDone flips done and stamps completedAt", () => {
    const next = boardReducer(board, { type: "toggleDone", id: "b" })
    const t = next.tasks.find(x => x.id === "b")!
    expect(t.done).toBe(true)
    expect(t.completedAt).not.toBeNull()
  })

  it("reschedule changes the due date", () => {
    const next = boardReducer(board, { type: "reschedule", id: "c", due: "2026-08-01" })
    expect(next.tasks.find(x => x.id === "c")!.due).toBe("2026-08-01")
  })

  it("clearQF completes every open QF task", () => {
    const withQf: BoardData = {
      ...board,
      tasks: [...board.tasks, task({ id: "q", project: "bbl", title: "quick", lane: "QF" })],
    }
    const next = boardReducer(withQf, { type: "clearQF" })
    expect(next.tasks.find(x => x.id === "q")!.done).toBe(true)
  })
})

describe("migrateForgeState (AdminTaskForge → BoardData)", () => {
  it("maps lists 1:1 to projects and folds tasks with new fields", () => {
    const forge = {
      activeListId: "list1",
      lists: [
        {
          id: "list1",
          name: "Getting Started",
          tasks: [
            {
              id: "ft1",
              title: "Add your first task",
              description: "desc",
              priority: "low",
              done: false,
              createdAt: "2026-06-01T00:00:00Z",
              completedAt: null,
            },
          ],
        },
      ],
    }
    const migrated = migrateForgeState(forge)
    expect(migrated.projects).toEqual([
      { id: "list1", name: "Getting Started", color: "muted", order: 1 },
    ])
    expect(migrated.tasks[0]).toMatchObject({
      id: "ft1",
      project: "list1",
      title: "Add your first task",
      due: null,
      lane: null,
      status: "active",
      priority: "low",
      done: false,
    })
  })

  it("handles empty / malformed forge state", () => {
    expect(migrateForgeState({}).projects).toEqual([])
    expect(migrateForgeState({ lists: [] }).tasks).toEqual([])
  })
})
