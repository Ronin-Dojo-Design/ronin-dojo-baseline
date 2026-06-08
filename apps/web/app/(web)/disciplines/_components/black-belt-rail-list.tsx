"use client"

import { useReducedMotion } from "@mantine/hooks"
import { motion } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { memberInitials } from "~/lib/lineage/canvas-model"
import { cx } from "~/lib/utils"
import type { TopRankedMember } from "~/server/web/disciplines/top-ranked-queries"

/**
 * Client reveal for the Black Belt Rail honor strip. Staggered fade-in-up per the
 * martial-arts motion language (restraint, ~200ms, 40ms stagger — see
 * docs/runbooks/design/motion-system.md). Honors prefers-reduced-motion. Belt color
 * is data-driven from `Rank.colorHex`.
 *
 * @edited SESSION_0357 — consumes the shared `TopRankedMember` DTO (RankAward-backed)
 * + the canonical `memberInitials` view-model; belt color now uses the shared
 * `BeltSwatch` primitive (SVG `fill`, no inline style); rows are literal `<li>`
 * wrapping the motion element so the `<ol>` strictly contains `<li>`. Removed the
 * duplicate local `RankedMember` type + `initials()`.
 */
export function BlackBeltRailList({ members }: { members: TopRankedMember[] }) {
  const reduceMotion = useReducedMotion()

  return (
    <ol className="flex flex-col gap-2">
      {members.map((m, index) => {
        const isTop = index === 0
        return (
          <li key={m.id}>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.2, delay: index * 0.04, ease: "easeOut" }
              }
              className="flex items-center gap-2.5 text-sm"
            >
              <BeltSwatch colorHex={m.colorHex} />
              <Avatar className="size-7">
                {m.image && <AvatarImage src={m.image} alt="" />}
                <AvatarFallback>{memberInitials(m.name)}</AvatarFallback>
              </Avatar>
              <span className={cx("flex-1 truncate", isTop && "font-medium")}>{m.name}</span>
              {m.rankName && (
                <Badge variant={isTop ? "soft" : "outline"} size="sm">
                  {m.rankName}
                </Badge>
              )}
            </motion.div>
          </li>
        )
      })}
    </ol>
  )
}
