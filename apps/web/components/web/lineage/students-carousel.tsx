"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/common/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { H6 } from "~/components/common/heading"
import {
  memberAvatarSrc,
  memberInitials,
  memberTopRank,
  nodeDisplayName,
} from "~/lib/lineage/canvas-model"
import type { LineageTreeMemberRow } from "~/server/web/lineage/payloads"

type BeltGroup = {
  key: string
  label: string
  colorHex: string | null
  sortOrder: number
  students: LineageTreeMemberRow[]
}

/**
 * Group students by their shown belt rank (highest awarded in the tree's discipline —
 * the same awarded-truth source `memberTopRank`/`memberBeltColor` use, ADR 0035),
 * most-senior first. Keyed by rank name; unranked sorts last.
 */
function groupByBelt(students: LineageTreeMemberRow[], disciplineId?: string | null): BeltGroup[] {
  const byKey = new Map<string, BeltGroup>()

  for (const student of students) {
    const rank = memberTopRank(student.node, disciplineId)
    const key = rank?.name ?? "__unranked__"

    const group = byKey.get(key) ?? {
      key,
      label: rank?.name ?? "Unranked",
      colorHex: rank?.colorHex ?? null,
      sortOrder: rank?.sortOrder ?? Number.NEGATIVE_INFINITY,
      students: [],
    }
    group.students.push(student)
    byKey.set(key, group)
  }

  return [...byKey.values()].sort((a, b) =>
    a.sortOrder !== b.sortOrder ? b.sortOrder - a.sortOrder : a.label.localeCompare(b.label),
  )
}

/**
 * The focal member's students — their visual children in the lineage tree being
 * viewed — grouped by shown belt rank (senior first) as collapsible cards, each
 * a horizontally scrollable row of avatars. Tap an avatar to swap the drawer to
 * that student (recursive drill-down). Renders nothing when the member has no
 * children in the tree. Belt color is `Rank.colorHex` data only (BeltSwatch).
 */
export function StudentsCarousel({
  students,
  onSelectStudent,
  disciplineId,
}: {
  students: LineageTreeMemberRow[]
  onSelectStudent: (memberId: string) => void
  disciplineId?: string | null
}) {
  if (students.length === 0) return null

  return (
    <section aria-label="Students">
      <H6 className="mb-2 text-muted-foreground uppercase tracking-wide">Students</H6>
      <Accordion type="multiple" className="flex flex-col gap-2">
        {groupByBelt(students, disciplineId).map(group => (
          <AccordionItem key={group.key} value={group.key}>
            <AccordionTrigger className="p-3!">
              <span className="flex min-w-0 items-center gap-2">
                <BeltSwatch colorHex={group.colorHex} className="size-3.5" />
                <span className="truncate text-sm font-medium">{group.label}</span>
                <span className="text-xs text-muted-foreground">{group.students.length}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="p-3!">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {group.students.map(student => {
                  const name = nodeDisplayName(student.node)
                  const avatar = memberAvatarSrc(student.node)
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => onSelectStudent(student.id)}
                      title={name}
                      aria-label={`View ${name}`}
                      className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-lg p-1 outline-none transition hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <Avatar className="size-12 rounded-full">
                        {avatar && <AvatarImage src={avatar} alt={name} />}
                        <AvatarFallback>{memberInitials(name)}</AvatarFallback>
                      </Avatar>
                      <span className="w-full truncate text-center text-xs">
                        {name.split(/\s+/)[0] ?? name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
