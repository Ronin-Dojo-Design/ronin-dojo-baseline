"use client"

/**
 * AdminTaskBoard (PWCC-001) — the BBL operator task/project board.
 *
 * Spec: docs/knowledge/wiki/files/bbl-admin-task-board.md.
 * - Projects (sidebar) → tasks → due dates → status, Todoist model.
 * - Absorbs AdminTaskForge (migration on first mount, in useTaskBoard).
 * - Borrows the column option from TuffBuffs TaskBoard via the view tabs.
 * - localStorage-first behind the BoardStore PORT (ADR 0033 D2).
 * - Cards are m-card (kind=task). Tokens only — BBL red flows via --color-primary.
 * - Mobile = horizontal scroll-snap of the view columns.
 */

import { CheckCircle2Icon, InboxIcon, LayersIcon, PlusIcon, ZapIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { H3 } from "~/components/common/heading"
import {
  dateBucket,
  doneTasks,
  karma,
  orderedProjects,
  overdueCount,
  projectCounts,
  tasksForInbox,
  tasksForProject,
  tasksForToday,
  tasksForUpcoming,
  todayIso,
} from "~/lib/task-board/board-logic"
import type { BoardData, BoardView } from "~/lib/task-board/types"
import { useTaskBoard } from "~/lib/task-board/use-task-board"
import { cx } from "~/lib/utils"
import { QuickAdd } from "./quick-add"
import { TaskSection } from "./task-section"

type ViewTab = { id: BoardView; label: string; icon: React.ReactNode }

const VIEW_TABS: ViewTab[] = [
  { id: "today", label: "Today", icon: <ZapIcon className="size-4" /> },
  { id: "upcoming", label: "Upcoming", icon: <LayersIcon className="size-4" /> },
  { id: "inbox", label: "Inbox", icon: <InboxIcon className="size-4" /> },
]

const DAILY_GOAL = 5
const WEEKLY_GOAL = 30

export function AdminTaskBoard({ initial }: { initial: BoardData }) {
  const board = useTaskBoard(initial)
  const { state, hydrated, addTask, toggleDone, clearQF } = board

  const [view, setView] = useState<BoardView>("today")
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [showDone, setShowDone] = useState(false)

  const today = todayIso()
  const projects = useMemo(() => orderedProjects(state), [state])
  const counts = useMemo(() => projectCounts(state), [state])
  const completed = karma(state)

  // Which task slice + label drives the main column.
  const mainView = activeProject ? "project" : view
  const headerLabel = activeProject
    ? (projects.find(p => p.id === activeProject)?.name ?? "Project")
    : (VIEW_TABS.find(t => t.id === view)?.label ?? "Today")

  const visibleTasks = activeProject
    ? tasksForProject(state, activeProject)
    : view === "today"
      ? tasksForToday(state, today)
      : view === "upcoming"
        ? tasksForUpcoming(state, today)
        : tasksForInbox(state)

  const overdue = activeProject ? 0 : view === "today" ? overdueCount(state, today) : 0
  const overdueTasks = visibleTasks.filter(t => dateBucket(t, today) === "overdue")
  const onTimeTasks = visibleTasks.filter(t => dateBucket(t, today) !== "overdue")
  const completedTasks = doneTasks(state, activeProject ?? undefined)
  const hasQF = state.tasks.some(t => t.lane === "QF" && !t.done)

  const defaultProject = activeProject ?? projects[0]?.id ?? "inbox"

  return (
    <div
      className="flex flex-col gap-0 lg:grid lg:grid-cols-12 lg:gap-6"
      data-testid="admin-task-board"
      data-hydrated={hydrated}
    >
      {/* Sidebar — projects (12-grid: 3 of 12 on desktop). */}
      <aside className="lg:col-span-3">
        <nav aria-label="Projects" className="flex flex-col gap-1 rounded-xl bg-card p-3">
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Views
          </p>
          {VIEW_TABS.map(tab => (
            <SidebarItem
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              count={tab.id === "today" ? tasksForToday(state, today).length : undefined}
              active={!activeProject && view === tab.id}
              onClick={() => {
                setActiveProject(null)
                setView(tab.id)
              }}
            />
          ))}

          <p className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Projects
          </p>
          {projects.map(p => (
            <SidebarItem
              key={p.id}
              icon={<span aria-hidden>#</span>}
              label={p.name}
              count={counts[p.id]}
              accent={p.color === "accent"}
              active={activeProject === p.id}
              onClick={() => setActiveProject(p.id)}
            />
          ))}
        </nav>
      </aside>

      {/* Main column (9 of 12). */}
      <div className="flex flex-col gap-4 lg:col-span-9">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <H3>{headerLabel}</H3>
            <span className="text-sm text-muted-foreground">{visibleTasks.length}</span>
          </div>
          {hasQF ? (
            <button
              type="button"
              onClick={clearQF}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <CheckCircle2Icon className="size-3.5" /> Clear all QF
            </button>
          ) : null}
        </div>

        <QuickAdd projects={projects} defaultProject={defaultProject} onAdd={addTask} />

        {/* Mobile = horizontal scroll-snap of the open + done columns; desktop = stacked. */}
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
          <div className="min-w-[85%] shrink-0 snap-start space-y-4 md:min-w-0 md:shrink">
            {mainView === "today" && overdue > 0 ? (
              <TaskSection
                label="Overdue"
                count={overdue}
                accent
                tasks={overdueTasks}
                projects={projects}
                today={today}
                onToggleDone={toggleDone}
              />
            ) : null}

            <TaskSection
              label={mainView === "today" && overdue > 0 ? "Today" : headerLabel}
              tasks={mainView === "today" && overdue > 0 ? onTimeTasks : visibleTasks}
              projects={projects}
              today={today}
              onToggleDone={toggleDone}
              emptyHint={emptyHintFor(mainView)}
            />
          </div>

          {/* Collapsed done group. */}
          <div className="min-w-[85%] shrink-0 snap-start md:min-w-0 md:shrink">
            <button
              type="button"
              onClick={() => setShowDone(s => !s)}
              className="flex w-full items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span aria-hidden>{showDone ? "▾" : "▸"}</span> done ({completedTasks.length})
            </button>
            {showDone ? (
              <TaskSection
                label="Completed"
                tasks={completedTasks}
                projects={projects}
                today={today}
                onToggleDone={toggleDone}
              />
            ) : null}
          </div>
        </div>

        {/* Gamify strip (spec wireframe). */}
        <GamifyStrip karma={completed} />
      </div>

      {/* Mobile MAB — the center quick-add button, elevated, never covers a row CTA. */}
      <button
        type="button"
        aria-label="Quick add task"
        onClick={() => {
          // Focus the quick-add input on mobile.
          const input = document.querySelector<HTMLInputElement>(
            'input[aria-label="New task title"]',
          )
          input?.focus()
          input?.scrollIntoView({ block: "center", behavior: "smooth" })
        }}
        className="fixed bottom-6 left-1/2 z-40 grid size-13 -translate-x-1/2 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-transform hover:scale-105 lg:hidden"
      >
        <PlusIcon className="size-7" />
      </button>
    </div>
  )
}

function emptyHintFor(view: BoardView): string {
  switch (view) {
    case "today":
      return "Nothing due today. Clear inbox or get ahead on Upcoming."
    case "upcoming":
      return "No upcoming tasks scheduled."
    case "inbox":
      return "Inbox zero. Nice."
    default:
      return "No tasks in this project yet."
  }
}

function SidebarItem({
  icon,
  label,
  count,
  active,
  accent,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  count?: number
  active?: boolean
  accent?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-primary/10 font-semibold text-foreground"
          : "text-secondary-foreground hover:bg-muted",
      )}
    >
      <span
        className={cx(
          "grid size-5 place-items-center",
          accent ? "text-primary" : "text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" && count > 0 ? (
        <span className="text-xs text-muted-foreground">{count}</span>
      ) : null}
    </button>
  )
}

function GamifyStrip({ karma: karmaValue }: { karma: number }) {
  const daily = Math.min(karmaValue, DAILY_GOAL)
  const pct = Math.round((daily / DAILY_GOAL) * 100)
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-3 text-xs text-muted-foreground">
      <span className="font-semibold uppercase tracking-wider text-foreground">
        Karma {karmaValue}
      </span>
      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span>
        Daily {daily}/{DAILY_GOAL}
      </span>
      <span>
        Weekly {Math.min(karmaValue, WEEKLY_GOAL)}/{WEEKLY_GOAL}
      </span>
    </div>
  )
}
