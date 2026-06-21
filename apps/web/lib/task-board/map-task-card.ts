/**
 * mapTaskToCard — task JSON → the REAL m-card task DTO (`@ronin-dojo/ui-kit`).
 *
 * m-card is a PRESENTATION view-model over pre-projected DISPLAY VALUES (strings,
 * formatted dates, tones) — never a domain model (m-card.types.ts). This mapper does
 * ALL the projection so the card never touches the board or the clock:
 *   - project name      → `eyebrow` (the muted kicker)
 *   - formatted due date → the ONE `focal` value (tone `critical` when overdue)
 *   - lane / priority / status / labels → `badges[]` with tones
 *   - `done` → `done` (the leading checkbox glyph)
 */

import type { MCardBadge, MCardTaskData } from "@ronin-dojo/ui-kit"
import { dateBucket, todayIso } from "./board-logic"
import type { Project, Task } from "./types"

/** YYYY-MM-DD → "Aug 18" without timezone drift. */
function formatDue(due: string): string {
  const [y, m, d] = due.split("-").map(Number)
  if (!y || !m || !d) return due
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/** Lane / priority / status / labels → the badge row. */
function taskBadges(task: Task, overdue: boolean): MCardBadge[] {
  const badges: MCardBadge[] = []
  // Lane: HF (hot fix) is the loudest, QF (quick fix) is a quieter accent.
  if (task.lane === "HF") badges.push({ label: "HF", tone: "critical" })
  else if (task.lane === "QF") badges.push({ label: "QF", tone: "accent" })

  if (task.priority === "high") badges.push({ label: "High", tone: "warning" })

  // Lifecycle status — surface anything that isn't a plain active task.
  if (task.status === "broken") badges.push({ label: "Broken", tone: "critical" })
  else if (task.status === "deprecated") badges.push({ label: "Deprecated", tone: "warning" })
  else if (task.status === "inactive") badges.push({ label: "Inactive", tone: "neutral" })

  if (overdue) badges.push({ label: "Overdue", tone: "critical" })

  for (const label of task.labels ?? []) badges.push({ label: `#${label}`, tone: "neutral" })
  return badges
}

export function mapTaskToCard(
  task: Task,
  projects: Project[],
  today: string = todayIso(),
): MCardTaskData {
  const project = projects.find(p => p.id === task.project)
  const overdue = !task.done && dateBucket(task, today) === "overdue"
  const badges = taskBadges(task, overdue)

  return {
    id: task.id,
    title: task.title,
    eyebrow: project?.name,
    // The ONE focal value: the due date. Omitted entirely for undated inbox tasks.
    focal: task.due
      ? { value: formatDue(task.due), label: "due", tone: overdue ? "critical" : "neutral" }
      : undefined,
    badges: badges.length > 0 ? badges : undefined,
    done: task.done,
  }
}
