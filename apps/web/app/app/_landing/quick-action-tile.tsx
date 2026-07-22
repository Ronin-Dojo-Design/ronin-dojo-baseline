"use client"

import { ChevronRightIcon } from "lucide-react"
import { Card } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { haptics } from "~/lib/haptics"
import { cx } from "~/lib/utils"
import type { QuickAction } from "./app-quick-actions"

/**
 * ONE quick-action tile — the Command Deck bento idiom (icon chip + label +
 * description + chevron), shared by the grid and the carousel so both surfaces
 * render identically. `link` renders as a `<Link>`; `trigger` renders as a
 * `<button>` firing `onSelect`. `haptics.*` is best-effort (no-op on iOS Safari) —
 * it augments, never replaces, the visual affordance.
 *
 * Accent chip uses the brand `primary` token (red on BBL) — never a hardcoded hue.
 */
export function QuickActionTile({
  action,
  className,
}: {
  action: QuickAction
  className?: string
}) {
  const Icon = action.icon

  const body = (
    <>
      <Stack size="sm" className="w-full justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Stack>

      <Stack direction="column" size="xs" wrap={false} className="w-full">
        <span className="truncate text-sm font-medium text-foreground">{action.label}</span>
        <span className="truncate text-xs text-muted-foreground">{action.description}</span>
      </Stack>
    </>
  )

  const tileClassName = cx("h-full gap-3 rounded-xl p-4", className)

  if (action.kind === "link") {
    return (
      <Card
        hover
        render={<Link href={action.href} onClick={() => haptics.tap()} />}
        className={tileClassName}
      >
        {body}
      </Card>
    )
  }

  return (
    <Card
      hover
      render={
        <button
          type="button"
          aria-label={action.label}
          onClick={() => {
            haptics.tap()
            action.onSelect()
          }}
        />
      }
      className={cx("text-left", tileClassName)}
    >
      {body}
    </Card>
  )
}
