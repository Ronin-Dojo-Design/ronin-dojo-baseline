"use client"

import { SparklesIcon, TrophyIcon } from "lucide-react"
import type { CSSProperties } from "react"
import { Badge } from "~/components/common/badge"
import { H6 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Separator } from "~/components/common/separator"
import { Stack } from "~/components/common/stack"
import {
  type AchievementUnlock,
  type BeltProgression,
  buildAchievementsUnlocked,
  buildBeltProgressions,
  type ProgressionLevel,
  totalProgressionPoints,
} from "~/lib/lineage/rank-progression"
import { cx } from "~/lib/utils"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"

/**
 * Trophy.so-style rank-progression panel (SESSION_0332 / Phase 4 Slice 2 proof).
 *
 * Composes existing L1 primitives (`Badge`, `Stack`, `H6`, `Note`, `Separator`)
 * to render a Points/Levels belt ladder + Achievements Unlocked rail derived
 * purely from existing `RankAward` + `Rank` data. No new schema, no
 * `GamificationEvent` writes — see `lib/lineage/rank-progression.ts` for the
 * pure read-model and `apps/web/prisma/seed-baseline-platform.ts:203` for the
 * mirrored `BELT_PROMOTION.defaultPoints = 100` value.
 *
 * Static surface — no entrance animation, reduced-motion safe by construction.
 */

function formatDate(date: Date | null): string | null {
  if (!date) return null
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function LineageRankProgressionPanel({ profile }: { profile: LineageNodeProfile }) {
  const awards = profile.passport?.rankAwardsEarned ?? []
  const progressions = buildBeltProgressions(awards)
  const achievements = buildAchievementsUnlocked(awards)

  if (progressions.length === 0 && achievements.length === 0) return null

  const totalPoints = totalProgressionPoints(progressions)

  return (
    <Stack direction="column" size="md" className="w-full">
      <Stack size="xs" className="items-center justify-between">
        <H6 className="text-muted-foreground uppercase tracking-wide">Belt Progression</H6>
        <Badge variant="primary" size="sm" prefix={<TrophyIcon />}>
          {totalPoints} pts
        </Badge>
      </Stack>

      {progressions.length > 0 && (
        <Stack direction="column" size="sm">
          {progressions.map(progression => (
            <ProgressionRow key={progression.rankSystem.id} progression={progression} />
          ))}
        </Stack>
      )}

      {achievements.length > 0 && (
        <>
          <Separator />
          <Stack direction="column" size="sm">
            <H6 className="text-muted-foreground uppercase tracking-wide">Achievements Unlocked</H6>
            <Stack direction="column" size="xs">
              {achievements.map(achievement => (
                <AchievementRow key={achievement.id} achievement={achievement} />
              ))}
            </Stack>
          </Stack>
        </>
      )}
    </Stack>
  )
}

function ProgressionRow({ progression }: { progression: BeltProgression }) {
  const disciplineName = progression.rankSystem.discipline?.name ?? progression.rankSystem.name
  const subtitle = progression.rankSystem.discipline?.name ? progression.rankSystem.name : null

  return (
    <article className="rounded-md border bg-background p-3">
      <Stack direction="column" size="sm">
        <Stack size="xs" className="items-center justify-between">
          <Stack size="xs" direction="column" className="min-w-0">
            <span className="text-sm font-medium truncate">{disciplineName}</span>
            {subtitle && <Note className="text-xs truncate">{subtitle}</Note>}
          </Stack>
          <Badge variant="soft" size="sm">
            {progression.earnedCount} / {progression.totalLevels} belts
          </Badge>
        </Stack>

        <ul
          aria-label={`${disciplineName} belt ladder`}
          className="flex flex-row flex-wrap gap-1.5"
        >
          {progression.levels.map(level => (
            <li key={level.rank.id}>
              <ProgressionChip level={level} />
            </li>
          ))}
        </ul>

        <Note className="text-xs">
          {progression.earnedCount === 0
            ? `0 of ${progression.totalLevels} belts earned`
            : `${progression.earnedCount} of ${progression.totalLevels} belts earned · ${progression.points} pts`}
        </Note>
      </Stack>
    </article>
  )
}

function ProgressionChip({ level }: { level: ProgressionLevel }) {
  const isCurrent = level.status === "current"
  const isEarned = level.status === "earned" || isCurrent
  const colorStyle: CSSProperties | undefined = level.rank.colorHex
    ? ({ "--rank-color": level.rank.colorHex } as CSSProperties)
    : undefined

  const labelDate = formatDate(level.awardedAt)
  const ariaLabel = `${level.rank.name}${
    isCurrent ? " — current belt" : isEarned ? " — earned" : " — locked"
  }${labelDate ? `, awarded ${labelDate}` : ""}`

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      title={ariaLabel}
      data-status={level.status}
      className={cx(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-xs font-medium leading-none",
        isEarned
          ? "border-foreground/15 bg-(--rank-color)/85 text-background shadow-sm"
          : "border-dashed border-foreground/15 bg-(--rank-color)/15 text-muted-foreground",
        isCurrent && "ring-2 ring-primary ring-offset-1 ring-offset-background",
      )}
      style={colorStyle}
    >
      <span
        aria-hidden
        className={cx(
          "inline-block size-2 rounded-[2px] border border-foreground/20 bg-(--rank-color)",
          !isEarned && "opacity-60",
        )}
      />
      <span className="whitespace-nowrap">{level.rank.shortName ?? level.rank.name}</span>
      {isCurrent && (
        <span aria-hidden className="ml-0.5 text-[0.6rem] uppercase tracking-wide opacity-80">
          now
        </span>
      )}
    </span>
  )
}

function AchievementRow({ achievement }: { achievement: AchievementUnlock }) {
  const colorStyle: CSSProperties | undefined = achievement.rank.colorHex
    ? ({ "--rank-color": achievement.rank.colorHex } as CSSProperties)
    : undefined
  const date = formatDate(achievement.awardedAt) ?? "Date pending"
  const lineageLabel = achievement.disciplineName ?? achievement.rankSystemName ?? null

  return (
    <article
      className="relative overflow-hidden rounded-md border bg-background/80 p-3"
      style={colorStyle}
    >
      {achievement.rank.colorHex && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-(--rank-color)" />
      )}
      <Stack direction="column" size="xs" className="pl-2">
        <Stack size="xs" className="items-center" wrap>
          <Badge variant="primary" size="sm" prefix={<SparklesIcon />}>
            Achievement Unlocked
          </Badge>
          <Badge variant="outline" size="sm">
            +{achievement.points} pts
          </Badge>
        </Stack>
        <span className="text-sm font-medium">
          {achievement.rank.name}
          {lineageLabel && (
            <span className="text-muted-foreground font-normal"> · {lineageLabel}</span>
          )}
        </span>
        <Note className="text-xs">
          {date}
          {achievement.awarderName && <> · awarded by {achievement.awarderName}</>}
          {achievement.organizationName && <> · {achievement.organizationName}</>}
        </Note>
      </Stack>
    </article>
  )
}
