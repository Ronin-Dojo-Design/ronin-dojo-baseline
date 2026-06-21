/**
 * mapTaskToCard — task JSON → m-card task DTO (m-card-pattern.md "kind → DTO").
 *
 * Keeps the card presentation-only: the overdue flag and the human project label
 * are computed here, so the card never touches the board or the clock.
 */

import type { MCardTaskData } from "~/components/web/m-card/m-card"
import { dateBucket, todayIso } from "./board-logic"
import type { Project, Task } from "./types"

export function mapTaskToCard(
  task: Task,
  projects: Project[],
  today: string = todayIso(),
): MCardTaskData {
  const project = projects.find(p => p.id === task.project)
  return {
    id: task.id,
    title: task.title,
    due: task.due ?? null,
    lane: task.lane ?? null,
    status: task.status,
    priority: task.priority ?? null,
    project: task.project,
    projectLabel: project?.name,
    labels: task.labels,
    done: task.done,
    overdue: !task.done && dateBucket(task, today) === "overdue",
  }
}
