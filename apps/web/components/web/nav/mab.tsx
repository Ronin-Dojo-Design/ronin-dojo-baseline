"use client"

import { useReducedMotion } from "@mantine/hooks"
import {
  BadgeCheckIcon,
  ImageUpIcon,
  MedalIcon,
  PenSquareIcon,
  PlusIcon,
  SwordsIcon,
  XIcon,
} from "lucide-react"
import { AnimatePresence, motion, type PanInfo } from "motion/react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { type ComponentType, useCallback, useEffect, useState } from "react"
import { CreateCommunityPostDialog } from "~/components/web/community/create-community-post-dialog"
import { MabUploadSheet } from "~/components/web/nav/mab-upload-sheet"
import { haptics } from "~/lib/haptics"
import {
  MAB_ENABLED_EVENT,
  type MabCorner,
  readMabCorner,
  readMabEnabled,
  writeMabCorner,
} from "~/lib/mab-preferences"
import { cx } from "~/lib/utils"

/**
 * Mab — the B1 net-new movable radial Multi-Action Button (SESSION_0500).
 *
 * Reddit-style radial fan-out of up to 5 actions, thumb-right by default (`bottom-right`).
 * Mounted for admins AND capability-holding members (`shouldMountMab` — SESSION_0529 technique,
 * SESSION_0535 FI-028 post); each fan action is individually gated upstream and the permitted set
 * is threaded in via `permissions` (server-resolved booleans — keeps `can()`/`SessionUser` off the
 * client). The `post` + `technique` actions are member-capable; `claim`/`upload`/`promotion` stay
 * admin-gated.
 *
 * Movable: drag to reposition (`motion` drag), 4-corner snap on release (nearest corner by
 * pointer position), position persisted per-device (`lib/mab-preferences`). User-toggle-able
 * off AND back on via the bottom-nav "More" drawer's `MabToggle` (SESSION_0501: the former
 * in-fan EyeOff disable masqueraded as a fan action and was removed).
 *
 * Reduced-motion (motion-system runbook §3): the fan renders/dismisses instantly (no arc
 * spring, no rotate) under `prefers-reduced-motion`; drag still works (it's direct
 * manipulation, not decorative motion).
 *
 * ABSORBS the former community-feed create-post FAB — `community-feed.tsx` hides its mobile FAB
 * for any viewer the MAB mounts for (`!viewer.hasMab`, the shared `shouldMountMab` predicate), so
 * a MAB-holder never sees a second create FAB; free members (no MAB) keep the feed's own FAB.
 */

/** One fan action. `onSelect` fires when tapped; the shell decides navigate-vs-sheet. */
type MabAction = {
  id: string
  labelKey: string
  icon: ComponentType<{ className?: string }>
  onSelect: () => void
}

type MabProps = {
  /**
   * Which actions this user is permitted (server-resolved booleans). Absent/false
   * keys are simply not passed. Order is stable: claim, post, upload, promotion, technique.
   * `technique` (SESSION_0529 Slice 3B) is capability-gated (`canCreateTechniqueForUser`), not
   * admin-gated — an Elite non-admin gets a one-action fan.
   */
  permissions: {
    claim: boolean
    post: boolean
    upload: boolean
    promotion: boolean
    technique: boolean
  }
  /** Approved community styles for the Create-Post dialog (server-fetched once in the shell). */
  postStyles: { id: string; name: string }[]
}

// Fan radius (px) and the PREFERRED per-item spread (used as-is only while it fits).
const FAN_RADIUS = 76
const ITEM_ARC_DEGREES = 68

// Hard sweep cap: the fan may cover at most the inward 90° quadrant from its corner
// (SESSION_0501 P0 — the old spread-centered-on-straight-up geometry gave 4 items a 204°
// sweep, throwing the first item ~26px past the docked viewport edge at bottom-right).
const QUADRANT_DEGREES = 90

// Corner → the base angle (deg, standard math orientation) the fan sweeps FROM, and the
// fixed-position anchor classes. The sweep starts on the corner's vertical (straight up for
// bottom corners, straight down for top corners) and rotates `direction` toward the screen
// center — never toward the edges the FAB is docked against.
const CORNER_CONFIG: Record<MabCorner, { anchor: string; baseAngle: number; direction: 1 | -1 }> = {
  "bottom-right": { anchor: "bottom-20 right-5", baseAngle: 90, direction: 1 },
  "bottom-left": { anchor: "bottom-20 left-5", baseAngle: 90, direction: -1 },
  "top-right": { anchor: "top-20 right-5", baseAngle: 270, direction: -1 },
  "top-left": { anchor: "top-20 left-5", baseAngle: 270, direction: 1 },
}

/** Nearest corner to a viewport point (the drag-release snap). */
function nearestCorner(x: number, y: number): MabCorner {
  const vertical = y < window.innerHeight / 2 ? "top" : "bottom"
  const horizontal = x < window.innerWidth / 2 ? "left" : "right"
  return `${vertical}-${horizontal}` as MabCorner
}

// Minimum center-to-center distance between adjacent fanned items: the 44px (`size-11`) button
// plus breathing room, so neighbors never overlap.
const MIN_ITEM_CHORD = 48

/**
 * Count-scaled fan radius (SESSION_0529 Slice 3B). The sweep is hard-capped to the inward 90°
 * quadrant (SESSION_0501 P0 — the cap itself is untouched), so a 5th action shrinks the per-item
 * step to 22.5°; at the base 76px radius adjacent size-11 (44px) buttons would then sit ~30px
 * apart center-to-center → overlap. The chord between neighbors is `2·r·sin(step/2)`, so grow the
 * radius until it clears MIN_ITEM_CHORD. Counts ≤ 4 keep the shipped 76px geometry byte-for-byte
 * (the 4-item admin fan is unchanged); the sweep still points inward, so a larger radius cannot
 * cross the docked viewport edges in any corner.
 */
function fanRadius(count: number, stepDegrees: number) {
  if (count <= 4 || stepDegrees === 0) return FAN_RADIUS
  const stepRad = (stepDegrees * Math.PI) / 180
  return Math.max(FAN_RADIUS, MIN_ITEM_CHORD / (2 * Math.sin(stepRad / 2)))
}

/** Offset of a fanned item from the FAB center, given its index and the corner geometry. */
function fanOffset(index: number, count: number, corner: MabCorner) {
  const { baseAngle, direction } = CORNER_CONFIG[corner]
  // Clamp the sweep to the inward quadrant: shrink the per-item arc so the LAST item lands
  // exactly on the quadrant edge when the preferred spread would overflow it (4 items → 30°
  // steps, 90° total; 2 items keep the roomy 68°). Every offset therefore points up/down and
  // inward — nothing can cross the docked viewport edges in any corner.
  const step = count > 1 ? Math.min(ITEM_ARC_DEGREES, QUADRANT_DEGREES / (count - 1)) : 0
  const radius = fanRadius(count, step)
  const angle = baseAngle + index * step * direction
  const rad = (angle * Math.PI) / 180
  return { x: Math.cos(rad) * radius, y: -Math.sin(rad) * radius }
}

export const Mab = ({ permissions, postStyles }: MabProps) => {
  const t = useTranslations("mobileShell")
  const router = useRouter()
  const reduceMotion = useReducedMotion()

  // Hydration-stable: SSR + first paint render nothing until the effect reconciles the
  // per-device stored prefs (mirrors the header's mounted guard — no hydration mismatch).
  const [mounted, setMounted] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [corner, setCorner] = useState<MabCorner>("bottom-right")
  const [open, setOpen] = useState(false)
  const [isPostOpen, setIsPostOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    setEnabled(readMabEnabled())
    setCorner(readMabCorner())

    // Re-enabled from the "More" drawer (same-tab custom event) or another tab (storage event).
    const syncEnabled = () => setEnabled(readMabEnabled())
    window.addEventListener(MAB_ENABLED_EVENT, syncEnabled)
    window.addEventListener("storage", syncEnabled)
    return () => {
      window.removeEventListener(MAB_ENABLED_EVENT, syncEnabled)
      window.removeEventListener("storage", syncEnabled)
    }
  }, [])

  const closeFan = useCallback(() => setOpen(false), [])

  const handleToggleFan = useCallback(() => {
    haptics.tap()
    setOpen(prev => !prev)
  }, [])

  const handleDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      const next = nearestCorner(info.point.x, info.point.y)
      if (next !== corner) {
        haptics.select()
        setCorner(next)
        writeMabCorner(next)
      }
    },
    [corner],
  )

  const runAction = useCallback((fn: () => void) => {
    haptics.tap()
    setOpen(false)
    fn()
  }, [])

  // Build the permitted action set (order stable: claim, post, upload, promotion).
  const actions: MabAction[] = []
  if (permissions.claim) {
    actions.push({
      id: "claim",
      labelKey: "action_claim",
      icon: BadgeCheckIcon,
      onSelect: () => router.push("/app/lineage/claims"),
    })
  }
  if (permissions.post) {
    actions.push({
      id: "post",
      labelKey: "action_post",
      icon: PenSquareIcon,
      onSelect: () => setIsPostOpen(true),
    })
  }
  if (permissions.upload) {
    actions.push({
      id: "upload",
      labelKey: "action_upload",
      icon: ImageUpIcon,
      onSelect: () => setIsUploadOpen(true),
    })
  }
  if (permissions.promotion) {
    actions.push({
      id: "promotion",
      labelKey: "action_promotion",
      icon: MedalIcon,
      onSelect: () => router.push("/app/events/new"),
    })
  }
  if (permissions.technique) {
    // SESSION_0529 Slice 3B — deep-links to the /app/profile Techniques tab with the authored
    // create sheet auto-open (`DashboardTabs` reads ?tab, `AuthoredTechniqueCreate` reads ?create).
    actions.push({
      id: "technique",
      labelKey: "action_technique",
      icon: SwordsIcon,
      onSelect: () => router.push("/app/profile?tab=techniques&create=technique"),
    })
  }

  // Nothing to offer, or toggled off, or pre-hydration → render nothing. (The dialogs are
  // still mounted below when enabled so an open sheet survives a fan close.)
  if (!mounted || !enabled || actions.length === 0) return null

  // Direct-fire for a one-action fan (WL-P2-52 P3): an Elite non-admin's single "Add a technique"
  // shouldn't hide behind a fan-open detour — the FAB tap runs the action itself. `runAction`
  // keeps the haptic + fan-close bookkeeping identical to a fanned tap.
  const soleAction = actions.length === 1 ? actions[0] : null

  const { anchor } = CORNER_CONFIG[corner]

  return (
    <>
      {/* Scrim: tap-away closes the fan (mobile-only, above the bottom nav, below the FAB). */}
      {open && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={closeFan}
          className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[1px] md:hidden"
        />
      )}

      <div
        className={cx(
          // Mobile-only, above the scrim + bottom nav.
          "fixed z-50 md:hidden",
          anchor,
        )}
      >
        {/* Draggable wrapper — the FAB and its fan move together; snap on release. */}
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.12}
          onDragStart={closeFan}
          onDragEnd={handleDragEnd}
          // Snap-home: after release the corner class repositions the anchor, so reset the
          // drag transform to zero (spring, or instant under reduced motion).
          animate={{ x: 0, y: 0 }}
          transition={
            reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 34 }
          }
          className="relative touch-none"
        >
          {/* Fan items */}
          <AnimatePresence>
            {open &&
              actions.map((action, index) => {
                const offset = fanOffset(index, actions.length, corner)
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.id}
                    type="button"
                    onClick={() => runAction(action.onSelect)}
                    aria-label={t(action.labelKey)}
                    initial={
                      reduceMotion
                        ? { opacity: 1, x: offset.x, y: offset.y }
                        : { opacity: 0, x: 0, y: 0 }
                    }
                    animate={{ opacity: 1, x: offset.x, y: offset.y }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 0, y: 0 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 460, damping: 30, delay: index * 0.03 }
                    }
                    className="absolute inset-0 flex size-11 items-center justify-center rounded-full border border-chrome-border bg-background text-foreground shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline"
                  >
                    <Icon className="size-5" />
                  </motion.button>
                )
              })}
          </AnimatePresence>

          {/* The FAB itself — tap toggles the fan (or direct-fires a sole action); drag repositions. */}
          <motion.button
            type="button"
            onClick={soleAction ? () => runAction(soleAction.onSelect) : handleToggleFan}
            aria-label={
              soleAction ? t(soleAction.labelKey) : open ? t("mab_close") : t("mab_open")
            }
            aria-expanded={soleAction ? undefined : open}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
            className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline"
          >
            <motion.span
              animate={reduceMotion ? undefined : { rotate: open ? 45 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex"
            >
              {open ? <XIcon className="size-6" /> : <PlusIcon className="size-6" />}
            </motion.span>
          </motion.button>
        </motion.div>
      </div>

      {/* B2 light-action hosts (stay mounted while enabled so they survive fan close). */}
      <CreateCommunityPostDialog
        styles={postStyles}
        isOpen={isPostOpen}
        setIsOpen={setIsPostOpen}
        canCreate={permissions.post}
      />
      <MabUploadSheet isOpen={isUploadOpen} setIsOpen={setIsUploadOpen} />
    </>
  )
}
