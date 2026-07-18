"use client"

import { useReducedMotion } from "@mantine/hooks"
import { BadgeCheckIcon, XIcon } from "lucide-react"
import { motion } from "motion/react"
import { useCallback, useRef, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/common/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Button } from "~/components/common/button"
import { Carousel, CarouselSlide } from "~/components/common/carousel"
import { H6 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { groupByBelt } from "~/components/web/lineage/students-carousel"
import { countryFlagEmoji, getCountryLabel } from "~/lib/countries"
import {
  memberAvatarSrc,
  memberInitials,
  memberSchool,
  memberTopRank,
  memberTrustStatus,
  nodeDisplayName,
} from "~/lib/lineage/canvas-model"
import { cx } from "~/lib/utils"
import type { LineageTreeMemberRow } from "~/server/web/lineage/payloads"

/**
 * StudentsCarousel V2 (SESSION_0496, Epic A0.5) — the "baseball-card" bake-off variant
 * of the drawer students rail. Additive sibling of `StudentsCarousel` (V1 untouched);
 * the drawer picks V1/V2 via the threaded `studentsCarouselVariant` prop (`?cards=v2`
 * on the tree page — undefined → V1 everywhere, the regression guarantee).
 *
 * Same belt-group Accordion + BeltSwatch header as V1 (grouping shared via V1's
 * exported `groupByBelt`, ADR 0035 awarded truth); the inner row is the L1 Embla
 * `Carousel` of 168px player cards — dominant square avatar (verified corner check,
 * `memberTrustStatus` — top non-PENDING RankEntry), 2-line name, `BeltSwatch belt` + rank, country flag
 * (`countryFlagEmoji`) + school logo + name (paired via `memberSchool` so the logo
 * always matches the label's org). NO premium ring/gold.
 *
 * Behavior: first tap SELECTS (ring + aria-expanded + inline preview panel under the
 * rail with an "Open profile" CTA that fires `onSelectStudent` — the same recursive
 * drawer drill-down as V1); tap-again or Escape deselects (Escape returns focus to the
 * card). The card avatar carries `layoutId="student-avatar-<nodeId>"` so opening the
 * profile morphs it into the drawer identity-header avatar (shared-element, gated off
 * under `useReducedMotion` → instant swap).
 */
export function StudentsCarouselV2({
  students,
  onSelectStudent,
  disciplineId,
}: {
  students: LineageTreeMemberRow[]
  onSelectStudent: (memberId: string) => void
  disciplineId?: string | null
}) {
  const reduceMotion = useReducedMotion() ?? false
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const cardRefs = useRef(new Map<string, HTMLButtonElement>())

  const registerCard = useCallback((memberId: string, el: HTMLButtonElement | null) => {
    if (el) cardRefs.current.set(memberId, el)
    else cardRefs.current.delete(memberId)
  }, [])

  const toggleSelect = useCallback((memberId: string) => {
    setSelectedId(prev => (prev === memberId ? null : memberId))
  }, [])

  const deselect = useCallback((returnFocusTo?: string) => {
    setSelectedId(null)
    if (returnFocusTo) cardRefs.current.get(returnFocusTo)?.focus()
  }, [])

  const openProfile = useCallback(
    (memberId: string) => {
      setSelectedId(null)
      onSelectStudent(memberId)
    },
    [onSelectStudent],
  )

  if (students.length === 0) return null

  return (
    <section
      aria-label="Students"
      // w-full min-w-0 is load-bearing: InfoTab's parent Stack is `items-start`, so without
      // an explicit width this section sizes to max-content (measured 930px inside the 526px
      // drawer) — embla never engages and cards past the viewport are unreachable (pass-2 P1).
      className="w-full min-w-0"
      onKeyDown={event => {
        // Escape deselects the previewed card (and returns focus to it) instead of
        // bubbling on to the drawer's dismiss handling.
        if (event.key === "Escape" && selectedId) {
          event.preventDefault()
          event.stopPropagation()
          deselect(selectedId)
        }
      }}
    >
      <H6 className="mb-2 text-muted-foreground uppercase tracking-wide">Students</H6>
      <Accordion type="multiple" className="flex flex-col gap-2">
        {groupByBelt(students, disciplineId).map(group => {
          const selected = selectedId
            ? (group.students.find(student => student.id === selectedId) ?? null)
            : null
          return (
            <AccordionItem key={group.key} value={group.key}>
              <AccordionTrigger className="p-3!">
                <span className="flex min-w-0 items-center gap-2">
                  <BeltSwatch colorHex={group.colorHex} className="size-3.5" />
                  <span className="min-w-0 truncate text-sm font-medium">{group.label}</span>
                  <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                    {group.students.length} {group.students.length === 1 ? "student" : "students"}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="p-3!">
                {/* Touch moves that start on the rail stay on the rail — the drawer's
                    bottom-sheet swipe-dismiss tracks deltaY on ANY content touchmove, so
                    a diagonal Embla drag would otherwise drag/dismiss the sheet. */}
                <div
                  onTouchStart={event => event.stopPropagation()}
                  onTouchMove={event => event.stopPropagation()}
                >
                  <Carousel edgeFades controls="desktop" ariaLabel={`${group.label} students`}>
                    {group.students.map(student => (
                      <CarouselSlide key={student.id} width={168}>
                        <StudentCard
                          student={student}
                          disciplineId={disciplineId}
                          selected={selectedId === student.id}
                          reduceMotion={reduceMotion}
                          onToggle={() => toggleSelect(student.id)}
                          registerRef={registerCard}
                        />
                      </CarouselSlide>
                    ))}
                  </Carousel>
                </div>
                {selected && (
                  <StudentPreview
                    member={selected}
                    disciplineId={disciplineId}
                    onOpenProfile={() => openProfile(selected.id)}
                    onClose={() => deselect(selected.id)}
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </section>
  )
}

/** One 168px player card — avatar-dominant, data-null-safe on every slot. */
function StudentCard({
  student,
  disciplineId,
  selected,
  reduceMotion,
  onToggle,
  registerRef,
}: {
  student: LineageTreeMemberRow
  disciplineId?: string | null
  selected: boolean
  reduceMotion: boolean
  onToggle: () => void
  registerRef: (memberId: string, el: HTMLButtonElement | null) => void
}) {
  const name = nodeDisplayName(student.node)
  const avatar = memberAvatarSrc(student.node)
  const rank = memberTopRank(student.node, disciplineId)
  // Trust from the member's current rank (top non-PENDING RankEntry, LR 0008), discipline-scoped
  // to this tree — the SAME source the card badge/drawer read, not the retired `node.isVerified`.
  const isVerified = memberTrustStatus(student.node, disciplineId) === "VERIFIED"
  const school = memberSchool(student.node)
  const country = student.node.passport?.directoryProfile?.locationCountry ?? null
  const flag = countryFlagEmoji(country)
  const countryLabel = getCountryLabel(country)

  const avatarElement = (
    <Avatar className="aspect-square size-auto w-full rounded-lg">
      {avatar && <AvatarImage src={avatar} alt={name} />}
      <AvatarFallback className="text-xl">{memberInitials(name)}</AvatarFallback>
    </Avatar>
  )

  return (
    <button
      type="button"
      ref={el => registerRef(student.id, el)}
      onClick={onToggle}
      aria-expanded={selected}
      aria-label={`Preview ${name}`}
      className={cx(
        // h-full: slots are equal-height flex children, so mixed-content cards (2-line vs
        // 1-line names, missing school row) keep aligned bottoms instead of ragged heights.
        "flex size-full flex-col gap-2 rounded-xl border bg-card p-2 text-left outline-none transition",
        "hover:bg-muted motion-safe:hover:scale-[1.02]",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        selected && "ring-2 ring-ring",
      )}
    >
      <span className="relative block w-full">
        {/* The morph source: shares its layoutId with the drawer identity-header avatar
            (`student-avatar-<nodeId>`) so "Open profile" grows this avatar into the
            header. Reduced motion drops the layoutId → instant swap. */}
        {reduceMotion ? (
          avatarElement
        ) : (
          // relative z-10 lifts the morph launch above sibling cards; the residual clip by
          // AccordionContent's overflow-hidden during the flight is ACCEPTED cosmetic
          // (pass-2 review — no portal surgery).
          <motion.span
            layoutId={`student-avatar-${student.nodeId}`}
            className="relative z-10 block"
          >
            {avatarElement}
          </motion.span>
        )}
        {isVerified && (
          // Color pair intentionally mirrors the Badge `success` variant recipe (badge.tsx) — if
          // that palette shifts, update this chip in lockstep. Kept hand-rolled (not an icon-only
          // Badge) while V2 is in the FI-018 bake-off: zero visual churn on a frozen candidate.
          <span
            title="Verified"
            className="absolute right-1 top-1 z-10 flex items-center justify-center rounded-full border bg-background p-0.5 text-green-700 dark:text-green-300"
          >
            <BadgeCheckIcon className="size-4" aria-hidden />
            <span className="sr-only">Verified</span>
          </span>
        )}
      </span>

      <span className="line-clamp-2 min-h-10 text-sm font-medium">{name}</span>

      {/* Rank label on its own line, then a full-width belt below — degrees stay countable at
          the card width and the rank name never fights the belt for horizontal room. */}
      <span title={rank?.name ?? "Unranked"} className="truncate text-xs text-muted-foreground">
        {rank?.name ?? "Unranked"}
      </span>
      <BeltSwatch
        variant="belt"
        size="full"
        colorHex={rank?.colorHex ?? null}
        secondaryColorHex={rank?.secondaryColorHex ?? null}
        degree={rank?.degree ?? null}
        beltFamily={rank?.beltFamily ?? null}
      />

      {(flag || school) && (
        <span className="flex min-w-0 items-center gap-1.5">
          {flag && (
            <span role="img" title={countryLabel} aria-label={countryLabel} className="text-sm">
              {flag}
            </span>
          )}
          {school?.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- public media URL (R2/S3), no Next loader
            <img
              src={school.logoUrl}
              alt=""
              className="size-5 shrink-0 rounded border bg-card object-contain"
              loading="lazy"
            />
          )}
          {school && <span className="truncate text-xs text-muted-foreground">{school.name}</span>}
        </span>
      )}
    </button>
  )
}

/** Inline mini-preview under the rail — identity recap + the "Open profile" CTA. */
function StudentPreview({
  member,
  disciplineId,
  onOpenProfile,
  onClose,
}: {
  member: LineageTreeMemberRow
  disciplineId?: string | null
  onOpenProfile: () => void
  onClose: () => void
}) {
  const name = nodeDisplayName(member.node)
  const rank = memberTopRank(member.node, disciplineId)
  const school = memberSchool(member.node)
  const countryLabel = getCountryLabel(member.node.passport?.directoryProfile?.locationCountry)

  return (
    <Stack
      direction="column"
      size="sm"
      role="group"
      aria-label={`${name} preview`}
      className="mt-3 w-full rounded-lg border bg-muted/40 p-3"
    >
      <Stack size="sm" className="w-full items-start justify-between">
        <Stack direction="column" size="xs" className="min-w-0">
          <span className="text-sm font-semibold">{name}</span>
          <Note className="text-xs">{rank?.name ?? "Unranked"}</Note>
          {school && <Note className="truncate text-xs">{school.name}</Note>}
          {countryLabel && <Note className="text-xs">{countryLabel}</Note>}
        </Stack>
        {/* size="icon" = 44px square — the minimum touch-target (pass-2 P2; was ~27px). */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Close ${name} preview`}
          onClick={onClose}
          prefix={<XIcon />}
          className="-mr-2 -mt-2 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </Stack>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={onOpenProfile}
        className="w-full focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Open profile
      </Button>
    </Stack>
  )
}
