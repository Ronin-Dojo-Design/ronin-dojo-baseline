"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/common/button"
import { Input } from "~/components/common/input"
import type { AddTaskInput } from "~/lib/task-board/use-task-board"
import type { Project, TaskLane } from "~/lib/task-board/types"

type QuickAddProps = {
  projects: Project[]
  /** Default project for new tasks (the active sidebar selection). */
  defaultProject: string
  onAdd: (input: AddTaskInput) => void
}

/**
 * Inline quick-add. On mobile the same handler is reached via the MAB / bottom
 * sheet; on desktop it's the always-visible "Add task" row at the top of the
 * main column (spec wireframe `[ + Add task ]`).
 */
export function QuickAdd({ projects, defaultProject, onAdd }: QuickAddProps) {
  const [title, setTitle] = useState("")
  const [project, setProject] = useState(defaultProject)
  const [due, setDue] = useState("")
  const [lane, setLane] = useState<TaskLane | "">("")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd({
      project,
      title: trimmed,
      due: due || null,
      lane: lane || null,
    })
    setTitle("")
    setDue("")
    setLane("")
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-center gap-2 rounded-[14px] border border-border bg-card p-[10px]"
    >
      <Input
        aria-label="New task title"
        placeholder="Add task…"
        value={title}
        onChange={e => setTitle(e.target.value)}
        size="sm"
        className="min-w-40 flex-1"
      />
      <select
        aria-label="Project"
        value={project}
        onChange={e => setProject(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1 text-[0.8125rem] text-foreground"
      >
        {projects.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <Input
        aria-label="Due date"
        type="date"
        value={due}
        onChange={e => setDue(e.target.value)}
        size="sm"
        className="w-36"
      />
      <select
        aria-label="Lane"
        value={lane}
        onChange={e => setLane(e.target.value as TaskLane | "")}
        className="rounded-md border border-border bg-background px-2 py-1 text-[0.8125rem] text-foreground"
      >
        <option value="">Lane</option>
        <option value="QF">QF · quick-fix</option>
        <option value="HF">HF · hot-fix</option>
      </select>
      <Button type="submit" variant="fancy" size="sm" prefix={<PlusIcon />}>
        Add
      </Button>
    </form>
  )
}
