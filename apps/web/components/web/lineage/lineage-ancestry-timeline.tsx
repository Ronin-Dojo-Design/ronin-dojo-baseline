"use client"

import { useReducedMotion } from "@mantine/hooks"
import { motion } from "motion/react"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import type { LineageAncestryEntry } from "~/server/web/lineage/ancestry"
import { cx } from "~/lib/utils"
import { AncestryAvatar, RankByline } from "./lineage-ancestry-entry"

/**
 * Vertical ancestry timeline — founder at the top, the profile owner at the bottom
 * (SESSION_0493 TASK_05, the hand-coded BBLApp design Tony Hua asked for twice):
 * circular headshots on a connecting vertical line, brand-red italic name, the
 * belt-rank bar (`BeltSwatch belt` + degree marks), discipline subtitle, and
 * an optional narrative caption between nodes (`LineageRelationship.description`).
 *
 * Entries come pre-ordered [founder … member] from `getLineageAncestryForPassport`;
 * the profile owner is the LAST entry by contract and gets the highlight treatment.
 * Belt color is `Rank.colorHex` DATA (ADR 0022/0035) — never a hardcoded palette;
 * the name red is the `text-primary` brand token (BBL red via BrandSettings), and the
 * BBL type seam is carried per-component via the `--font-bbl-heading` fallback idiom
 * (this is a multi-brand surface — no `BrandTypography` wrapper, see the directory
 * profile orchestrator note).
 *
 * Renders nothing without a real up-chain (< 2 entries) — no empty shell.
 */
export function LineageAncestryTimeline({ entries }: { entries: LineageAncestryEntry[] }) {
  const reduceMotion = useReducedMotion()

  if (entries.length < 2) return null

  return (
    <ol className="relative flex flex-col gap-6">
      {/* the connecting vertical line, threaded through the avatar centers */}
      <span aria-hidden className="absolute inset-y-7 left-7 w-px bg-border" />

      {entries.map((entry, index) => (
        <TimelineEntry
          key={entry.nodeId}
          entry={entry}
          index={index}
          isOwner={index === entries.length - 1}
          reduceMotion={reduceMotion}
        />
      ))}
    </ol>
  )
}

/**
 * In-view entrance, once (Desi P1). This is a public SEO surface, so SSR must
 * ship the chain VISIBLE pre-hydration/no-JS: the hidden state lives in
 * whileInView KEYFRAMES ([0 → 1]) instead of `initial` (paired with
 * `initial={false}` on the consumer), which motion would render as `opacity:0`
 * inline styles on the server.
 */
const entranceMotion = (reduceMotion: boolean, index: number) => ({
  whileInView: reduceMotion ? { opacity: 1, y: 0 } : { opacity: [0, 1], y: [8, 0] },
  transition: reduceMotion
    ? { duration: 0 }
    : { duration: 0.25, delay: index * 0.05, ease: "easeOut" as const },
})

// The ring masks the vertical line behind non-owner avatars; the owner
// ("this member") swaps it for the brand-primary highlight ring.
const avatarRingClass = (isOwner: boolean) =>
  isOwner ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "ring-4 ring-background"

/** One timeline row: optional narrative caption + avatar + name/badge + rank byline. */
function TimelineEntry({
  entry,
  index,
  isOwner,
  reduceMotion,
}: {
  entry: LineageAncestryEntry
  index: number
  isOwner: boolean
  reduceMotion: boolean
}) {
  return (
    <li className="flex flex-col gap-6">
      {index > 0 && entry.narrative && (
        <p className="pl-[4.5rem] text-muted-foreground text-sm italic">{entry.narrative}</p>
      )}

      <motion.div
        initial={false}
        viewport={{ once: true }}
        {...entranceMotion(reduceMotion, index)}
        className="flex items-center gap-4"
      >
        <AncestryAvatar
          entry={entry}
          className={cx("relative size-14 rounded-full", avatarRingClass(isOwner))}
        />

        <Stack size="xs" direction="column" wrap={false} className="min-w-0">
          <Stack size="sm" direction="row" wrap className="items-center">
            {/* White member names (operator, SESSION_0525) — `text-foreground` reads white on the
                dark BBL profile (and dark on light), replacing the brand-red/pinkish name hue. */}
            <span className="truncate font-bold text-foreground italic [font-family:var(--font-bbl-heading),system-ui,sans-serif]">
              {entry.displayName}
            </span>
            {isOwner && (
              <Badge variant="primary" size="sm">
                This member
              </Badge>
            )}
          </Stack>

          <RankByline entry={entry} mutedClass="text-muted-foreground" />
        </Stack>
      </motion.div>
    </li>
  )
}
