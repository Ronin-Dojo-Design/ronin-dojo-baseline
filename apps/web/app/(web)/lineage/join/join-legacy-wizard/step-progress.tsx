import { CheckCircle2Icon } from "lucide-react"
import { cx } from "~/lib/utils"
import { STEP_META } from "./constants"

export function StepProgress({ current }: { current: number }) {
  return (
    <div className="space-y-3" aria-label="Registration progress">
      <ol className="grid grid-cols-3 gap-2">
        {STEP_META.map((step, index) => {
          const isActive = index === current
          const isDone = index < current
          return (
            <li key={step.id}>
              <div
                className={cx(
                  "flex min-h-14 min-w-0 items-center gap-2 rounded-2xl border px-2.5 py-2 transition-colors sm:px-3",
                  isActive && "border-red-500 bg-red-500/10 text-foreground",
                  isDone && "border-emerald-500/40 bg-emerald-500/10 text-foreground",
                  !isActive && !isDone && "border-border bg-muted/40 text-muted-foreground",
                )}
              >
                <span
                  className={cx(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-black",
                    isActive && "bg-red-600 text-white",
                    isDone && "bg-emerald-600 text-white",
                    !isActive && !isDone && "bg-background text-muted-foreground",
                  )}
                >
                  {isDone ? <CheckCircle2Icon className="size-4" /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.65rem] font-black uppercase tracking-[0.12em]">
                    {step.label}
                  </span>
                  <span className="hidden truncate text-xs sm:block">{step.title}</span>
                </span>
              </div>
            </li>
          )
        })}
      </ol>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div
          className="h-full rounded-full bg-red-600 transition-all duration-300"
          style={{ width: `${((current + 1) / STEP_META.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
