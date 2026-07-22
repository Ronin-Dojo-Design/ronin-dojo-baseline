"use client"

import { useReducedMotion } from "@mantine/hooks"
import { ChevronRightIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { type ReactNode, useMemo, useState } from "react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { ADMIN_SECTION_GROUPS } from "~/config/admin-sections"
import { haptics } from "~/lib/haptics"
import { cx } from "~/lib/utils"

/**
 * Per-group tint ramp riding the theme's chart tokens (`--color-chart-1..5`,
 * the only multi-hue token family in `styles.css` — same idiom as the `/app`
 * metric charts). 7 groups cycle 5 tokens; no hardcoded hexes.
 */
const GROUP_TONES = [
  {
    pill: "border-chart-1/40 bg-chart-1/15 text-chart-1",
    tile: "bg-chart-1/10 hover:bg-chart-1/20",
    icon: "text-chart-1",
  },
  {
    pill: "border-chart-2/40 bg-chart-2/15 text-chart-2",
    tile: "bg-chart-2/10 hover:bg-chart-2/20",
    icon: "text-chart-2",
  },
  {
    pill: "border-chart-3/40 bg-chart-3/15 text-chart-3",
    tile: "bg-chart-3/10 hover:bg-chart-3/20",
    icon: "text-chart-3",
  },
  {
    pill: "border-chart-4/40 bg-chart-4/15 text-chart-4",
    tile: "bg-chart-4/10 hover:bg-chart-4/20",
    icon: "text-chart-4",
  },
  {
    pill: "border-chart-5/40 bg-chart-5/15 text-chart-5",
    tile: "bg-chart-5/10 hover:bg-chart-5/20",
    icon: "text-chart-5",
  },
] as const

type CommandDeckData = {
  /** Server-filtered reachable hrefs — same permission rules as the sidebar. */
  allowedHrefs: string[]
  /** Live counts keyed by href; missing/null = no badge. */
  counts: Record<string, number | null>
}

/**
 * The reusable grouped launcher — swipeable group pills + a live-count bento tile
 * grid over the 7-group `ADMIN_SECTION_GROUPS` SOT (no fork). Carries NO page
 * chrome (no `Wrapper`): the caller frames it. Consumed by the beta route
 * (`CommandDeck`) AND, promoted, by the `/app` landing (SESSION_0600 WS-1).
 */
export const CommandDeckLauncher = ({
  allowedHrefs,
  counts,
  heading,
}: CommandDeckData & { heading?: ReactNode }) => {
  const reduceMotion = useReducedMotion()

  const groups = useMemo(() => {
    const allowed = new Set(allowedHrefs)

    return ADMIN_SECTION_GROUPS.map((group, index) => ({
      ...group,
      tone: GROUP_TONES[index % GROUP_TONES.length]!,
      items: group.items.filter(item => allowed.has(item.href)),
    })).filter(group => group.items.length > 0)
  }, [allowedHrefs])

  const [activeKey, setActiveKey] = useState(groups[0]?.key)
  const active = groups.find(group => group.key === activeKey) ?? groups[0]

  if (!active) {
    return (
      <Stack direction="column" size="sm" className="w-full">
        {heading}
        <Note>No sections available.</Note>
      </Stack>
    )
  }

  return (
    <Stack direction="column" size="sm" className="w-full">
      {heading}

      {/* Group pill rail — horizontally swipeable/scrollable, active pill tinted per group. */}
      <Stack
        size="sm"
        wrap={false}
        className="-mx-1 w-full snap-x overflow-x-auto px-1 pb-2"
        aria-label="Section groups"
      >
        {groups.map(group => {
          const GroupIcon = group.icon
          const isActive = group.key === active.key

          return (
            <Button
              key={group.key}
              type="button"
              size="sm"
              variant="ghost"
              aria-pressed={isActive}
              prefix={<GroupIcon />}
              onClick={() => {
                haptics.tap()
                setActiveKey(group.key)
              }}
              className={cx(
                "shrink-0 snap-start rounded-full border",
                isActive
                  ? group.tone.pill
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {group.label}
            </Button>
          )
        })}
      </Stack>

      {/* Bento tile grid — swaps per active pill (reduced motion: instant swap). */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.key}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={
            reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }
          }
          className="grid w-full grid-cols-2 gap-3 md:grid-cols-3"
        >
          {active.items.map(item => {
            const ItemIcon = item.icon
            const count = counts[item.href]

            return (
              <Card
                key={item.href}
                hover={false}
                render={<Link href={item.href} onClick={() => haptics.tap()} />}
                className={cx("gap-3 rounded-xl border-transparent p-4", active.tone.tile)}
              >
                <Stack size="sm" className="w-full justify-between">
                  <ItemIcon className={cx("size-7", active.tone.icon)} />
                  {count != null && (
                    <Badge size="sm" variant="outline">
                      {count}
                    </Badge>
                  )}
                </Stack>

                <Stack size="xs" wrap={false} className="w-full justify-between">
                  <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Stack>
              </Card>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </Stack>
  )
}

/**
 * Beta route chrome (`/app/beta/command-deck`) — the expressive console framing
 * around the shared `CommandDeckLauncher`. The landing (SESSION_0600) frames the
 * same launcher with its own heading, so this beta copy stays on the beta route.
 */
export const CommandDeck = ({ allowedHrefs, counts }: CommandDeckData) => {
  return (
    <Wrapper size="lg" gap="xs">
      <Stack direction="column" size="xs">
        <H3>Command Deck</H3>
        <Note>
          Beta — the expressive console. Swipe a deck, tap a tile. The flat version lives at{" "}
          <Link href="/app/sections">/app/sections</Link>.
        </Note>
      </Stack>

      <CommandDeckLauncher allowedHrefs={allowedHrefs} counts={counts} />
    </Wrapper>
  )
}
