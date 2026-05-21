"use client"

import { CheckCircle2Icon, CircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { AnimatedContainer } from "~/components/common/animated-container"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { Checkbox } from "~/components/common/checkbox"
import { H5 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { markItemComplete, markItemIncomplete } from "~/server/web/course-enrollment/actions"
import type { CourseOne } from "~/server/web/courses/payloads"

type CurriculumItem = CourseOne["curriculumItems"][number]

type Completion = {
  id: string
  curriculumItemId: string
  completedAt: string
}

type CurriculumCompletionListProps = {
  enrollmentId?: string | null
  items: CurriculumItem[]
  completions: Completion[]
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date))
}

export function CurriculumCompletionList({
  enrollmentId,
  items,
  completions,
}: CurriculumCompletionListProps) {
  const router = useRouter()
  const completionByItem = new Map(
    completions.map(completion => [completion.curriculumItemId, completion]),
  )

  const completeAction = useAction(markItemComplete, {
    onSuccess: ({ data }) => {
      toast.success(data?.courseCompleted ? "Course completed" : "Item marked complete")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Unable to mark complete")
    },
  })

  const incompleteAction = useAction(markItemIncomplete, {
    onSuccess: () => {
      toast.success("Item marked incomplete")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Unable to mark incomplete")
    },
  })

  const isPending = completeAction.isPending || incompleteAction.isPending

  return (
    <Stack asChild direction="column" size="md" className="list-none">
      <ol>
        {items.map((item, index) => {
          const completion = completionByItem.get(item.id)
          const isComplete = Boolean(completion)

          return (
            <li key={item.id}>
              <Card
                hover={false}
                className={
                  isComplete ? "border-green-600/30 bg-green-50/50 dark:bg-green-950/10" : ""
                }
              >
                <Stack wrap={false} className="w-full items-start">
                  <Stack className="size-8 shrink-0 justify-center rounded-full bg-muted text-sm font-semibold">
                    {index + 1}
                  </Stack>

                  {enrollmentId && (
                    <Checkbox
                      checked={isComplete}
                      disabled={isPending}
                      aria-label={`Mark ${item.title} ${isComplete ? "incomplete" : "complete"}`}
                      onCheckedChange={checked => {
                        if (checked === true) {
                          completeAction.execute({
                            enrollmentId,
                            curriculumItemId: item.id,
                          })
                          return
                        }

                        if (completion) {
                          incompleteAction.execute({ completionId: completion.id })
                        }
                      }}
                    />
                  )}

                  <Stack direction="column" size="sm" className="min-w-0 flex-1">
                    <Stack size="sm" className="w-full justify-between">
                      <H5
                        render={props => <h3 {...props}>{props.children}</h3>}
                        className="min-w-0 flex-1"
                      >
                        {item.title}
                      </H5>

                      <Badge
                        variant={isComplete ? "success" : "outline"}
                        prefix={isComplete ? <CheckCircle2Icon /> : <CircleIcon />}
                      >
                        {isComplete ? "Complete" : "Open"}
                      </Badge>
                    </Stack>

                    {item.notes && <Note>{item.notes}</Note>}

                    <AnimatedContainer height transition={{ ease: "linear", duration: 0.12 }}>
                      {completion && (
                        <Note className="text-green-700 dark:text-green-300">
                          Completed {formatDate(completion.completedAt)}
                        </Note>
                      )}
                    </AnimatedContainer>

                    {item.techniqueLinks.length > 0 && (
                      <Stack size="xs">
                        {item.techniqueLinks.map(({ technique }) => (
                          <Badge key={technique.id} variant="soft" asChild>
                            <Link href={`/techniques/${technique.slug}`}>{technique.name}</Link>
                          </Badge>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Card>
            </li>
          )
        })}
      </ol>
    </Stack>
  )
}
