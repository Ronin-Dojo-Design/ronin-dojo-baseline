import { redirect } from "next/navigation"

/**
 * /admin/task-board — RETIRED (SESSION_0461, G-003). The localStorage Todoist board collapsed into the
 * unified, DB-backed loop-board (one board, one engine). Any existing per-browser tasks migrate into
 * `KanbanCard` on the first visit to the loop-board. This stub just bounces to the live surface.
 */
export default function Page() {
  redirect("/app/loop-board")
}
