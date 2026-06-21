"use client"

import { MCard } from "~/components/web/m-card/m-card"
import { mapTaskToCard } from "~/lib/task-board/map-task-card"
import type { Project, Task } from "~/lib/task-board/types"

type TaskSectionProps = {
  label: string
  count?: number
  tasks: Task[]
  projects: Project[]
  today: string
  onToggleDone: (id: string) => void
  /** Optional accent on the header (e.g. Overdue group). */
  accent?: boolean
  emptyHint?: string
}

/**
 * A labeled group of task cards — "Overdue", "Today", per-project, etc.
 * (spec wireframe sections). Renders each task through the m-card (kind=task).
 */
export function TaskSection({
  label,
  count,
  tasks,
  projects,
  today,
  onToggleDone,
  accent,
  emptyHint,
}: TaskSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-center gap-2">
        <h3
          className={
            accent ? "text-sm font-semibold text-primary" : "text-sm font-semibold text-foreground"
          }
        >
          {label}
        </h3>
        {typeof count === "number" ? (
          <span className="text-xs text-muted-foreground">{count}</span>
        ) : null}
      </header>

      {tasks.length === 0 ? (
        emptyHint ? (
          <p className="rounded-[14px] border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
            {emptyHint}
          </p>
        ) : null
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map(task => (
            <li key={task.id}>
              <MCard
                kind="task"
                data={mapTaskToCard(task, projects, today)}
                onToggleDone={onToggleDone}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
