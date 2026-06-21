"use client"

/**
 * THIN LOCAL m-card (PWCC-002) — scaffolded for the AdminTaskBoard (PWCC-001).
 *
 * ⚠ RECONCILE-WITH-UI-KIT: the canonical m-card is being built in
 * `packages/ui-kit` by a sibling PWCC-002 PR. That package is NOT in this
 * worktree, so per the PWCC-001 brief this is a minimal local stand-in built on
 * the Dirstarter L1 base (`~/components/common/card.tsx`). It implements ONLY the
 * `kind="task"` binding the board needs. When ui-kit lands, replace this import
 * with `@ronin-dojo/ui-kit` and delete this file. The prop names mirror the
 * m-card contract (`kind`, `data`, `density`, `selected`, `onSelect`, `actions`)
 * so the swap is mechanical.
 *
 * §4 card anatomy (design-system-grid-ratio-hierarchy.md): one focal value, an
 * identity cluster (checkbox + title + meta), muted secondary meta, accent tint
 * rail. Tokens only — `bg-primary` / `text-muted-foreground` — never a hex.
 */

import { CheckIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Card } from "~/components/common/card"
import { cx } from "~/lib/utils"
import type { LifecycleStatus, TaskLane, TaskPriority } from "~/lib/task-board/types"

export type MCardTaskData = {
  id: string
  title: string
  /** ISO date or null. */
  due?: string | null
  lane?: TaskLane | null
  status: LifecycleStatus
  priority?: TaskPriority | null
  project?: string
  projectLabel?: string
  labels?: string[]
  done: boolean
  /** True when not done and the due date is in the past. */
  overdue?: boolean
}

export type MCardProps = {
  kind: "task"
  data: MCardTaskData
  density?: "comfortable" | "compact"
  selected?: boolean
  onSelect?: (id: string) => void
  onToggleDone?: (id: string) => void
  actions?: ReactNode
}

function formatDue(due: string): string {
  // due is YYYY-MM-DD — render as "Aug 18" without timezone drift.
  const [y, m, d] = due.split("-").map(Number)
  if (!y || !m || !d) return due
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function LanePill({ lane }: { lane: TaskLane }) {
  const isHot = lane === "HF"
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        isHot ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      {lane}
    </span>
  )
}

/**
 * The one card skeleton. Today only the `task` kind is implemented locally;
 * roster/rank/loop/generic land with the ui-kit package.
 */
export function MCard({
  data,
  density = "comfortable",
  selected,
  onSelect,
  onToggleDone,
  actions,
}: MCardProps) {
  const deprecated = data.status === "deprecated"
  const broken = data.status === "broken"
  const inactive = data.status === "inactive"

  return (
    <Card
      hover={false}
      isHighlighted={selected}
      onClick={onSelect ? () => onSelect(data.id) : undefined}
      className={cx(
        "flex-row items-start gap-3 rounded-[14px] p-[10px]",
        density === "compact" && "gap-2 p-2",
        // Accent tint rail — left border lifts to brand red for HF / overdue / broken.
        "border-l-4",
        data.lane === "HF" || data.overdue || broken ? "border-l-primary" : "border-l-transparent",
        broken && "outline outline-1 outline-primary/40",
        inactive && "opacity-60",
        onSelect && "cursor-pointer",
      )}
    >
      {/* Checkbox — the toggle-done affordance. */}
      <button
        type="button"
        aria-label={data.done ? "Mark task active" : "Mark task complete"}
        aria-pressed={data.done}
        onClick={e => {
          e.stopPropagation()
          onToggleDone?.(data.id)
        }}
        className={cx(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
          data.done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 text-transparent hover:border-primary",
        )}
      >
        <CheckIcon className="size-3" />
      </button>

      {/* Identity cluster: title + meta, left-aligned (§4). */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-2">
          <span
            className={cx(
              "min-w-0 flex-1 truncate text-sm font-semibold text-foreground",
              (data.done || deprecated) && "text-muted-foreground line-through",
            )}
          >
            {data.title}
          </span>
          {actions}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {data.projectLabel ? <span className="truncate">{data.projectLabel}</span> : null}
          {data.due ? (
            <span className={cx("inline-flex items-center gap-1", data.overdue && "text-primary")}>
              <span aria-hidden className="text-primary">
                ●
              </span>
              {formatDue(data.due)}
            </span>
          ) : null}
          {data.lane ? <LanePill lane={data.lane} /> : null}
          {data.priority === "high" ? (
            <span className="font-semibold uppercase tracking-wider text-primary">High</span>
          ) : null}
          {(data.labels ?? []).map(label => (
            <span key={label} className="text-muted-foreground/80">
              #{label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  )
}
