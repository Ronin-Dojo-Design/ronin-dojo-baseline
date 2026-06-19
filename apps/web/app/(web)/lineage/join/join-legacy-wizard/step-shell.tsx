import type { ComponentType, ReactNode } from "react"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { cx } from "~/lib/utils"
import { bblHeadingClass } from "./constants"

export function StepShell({
  active,
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
}: {
  active: boolean
  icon: ComponentType<{ className?: string }>
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card
      hover={false}
      className={cx(
        "space-y-5 rounded-3xl border-white/10 bg-background/95 p-4 shadow-xl shadow-black/5 sm:p-6",
        !active && "hidden",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-500">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">{eyebrow}</p>
          <H3 className={cx("text-xl sm:text-2xl", bblHeadingClass)}>{title}</H3>
          <Note className="text-sm leading-6">{description}</Note>
        </div>
      </div>
      {children}
    </Card>
  )
}
