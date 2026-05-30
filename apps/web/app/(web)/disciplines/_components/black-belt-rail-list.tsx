"use client"

import { useReducedMotion } from "@mantine/hooks"
import { motion } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { cx } from "~/lib/utils"

export type RankedMember = {
  id: string
  name: string
  image: string | null
  rankName: string | null
  colorHex: string | null
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/**
 * Client reveal for the Black Belt Rail honor strip. Staggered fade-in-up per the
 * martial-arts motion language (restraint, ~200ms, 40ms stagger — see
 * docs/runbooks/design/motion-system.md). Honors prefers-reduced-motion: when the
 * user opts out, rows render in their final state with no animation (identical to
 * the pre-SESSION_0304 static list). Belt color is data-driven from Rank.colorHex.
 */
export function BlackBeltRailList({ members }: { members: RankedMember[] }) {
  const reduceMotion = useReducedMotion()

  return (
    <ol className="flex flex-col gap-2">
      {members.map((m, index) => {
        const isTop = index === 0
        return (
          <motion.li
            key={m.id}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.2, delay: index * 0.04, ease: "easeOut" }
            }
            className="flex items-center gap-2.5 text-sm"
          >
            <span
              aria-hidden
              className={cx(
                "h-6 w-1 shrink-0 rounded-full",
                m.colorHex ? "" : "bg-muted-foreground/30",
              )}
              style={m.colorHex ? { backgroundColor: m.colorHex } : undefined}
            />
            <Avatar className="size-7">
              {m.image && <AvatarImage src={m.image} alt="" />}
              <AvatarFallback>{initials(m.name)}</AvatarFallback>
            </Avatar>
            <span className={cx("flex-1 truncate", isTop && "font-medium")}>{m.name}</span>
            {m.rankName && (
              <Badge variant={isTop ? "soft" : "outline"} size="sm">
                {m.rankName}
              </Badge>
            )}
          </motion.li>
        )
      })}
    </ol>
  )
}
