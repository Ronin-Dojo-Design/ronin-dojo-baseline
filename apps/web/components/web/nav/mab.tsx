"use client"

import { useReducedMotion } from "@mantine/hooks"
import {
  BadgeCheckIcon,
  EyeOffIcon,
  ImageUpIcon,
  MedalIcon,
  PenSquareIcon,
  PlusIcon,
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
  writeMabEnabled,
} from "~/lib/mab-preferences"
import { cx } from "~/lib/utils"

/**
 * Mab — the B1 net-new movable radial Multi-Action Button (SESSION_0500).
 *
 * Reddit-style radial fan-out of up to 4 actions, thumb-right by default (`bottom-right`).
 * ADMIN-ONLY for now: the whole component is mounted only for admins (the shell gates it);
 * each fan action is additionally `can()`-gated upstream and the permitted set is threaded in
 * via `actions` (server-resolved booleans — keeps `can()`/`SessionUser` off the client).
 *
 * Movable: drag to reposition (`motion` drag), 4-corner snap on release (nearest corner by
 * pointer position), position persisted per-device (`lib/mab-preferences`). User-toggle-able
 * off (persisted); re-enable lives in the bottom-nav "More" drawer.
 *
 * Reduced-motion (motion-system runbook §3): the fan renders/dismisses instantly (no arc
 * spring, no rotate) under `prefers-reduced-motion`; drag still works (it's direct
 * manipulation, not decorative motion).
 *
 * ABSORBS the former community-feed create-post FAB — `community-feed.tsx` hides its mobile
 * FAB for admins (`!viewer.isAdmin`), and the MAB is admin-only, so there is never a second FAB.
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
   * Which actions this admin is permitted (server-resolved `can()` booleans). Absent/false
   * keys are simply not passed. Order is stable: claim, post, upload, promotion.
   */
  permissions: {
    claim: boolean
    post: boolean
    upload: boolean
    promotion: boolean
  }
  /** Approved community styles for the Create-Post dialog (server-fetched once in the shell). */
  postStyles: { id: string; name: string }[]
}

// Fan radius (px) and per-item spread. Four items fan across a quarter-arc from the FAB.
const FAN_RADIUS = 76
const ITEM_ARC_DEGREES = 68

// Corner → the base angle (deg, standard math orientation) the fan sweeps FROM, and the
// fixed-position anchor classes. Bottom corners fan upward; top corners fan downward.
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

/** Offset of a fanned item from the FAB center, given its index and the corner geometry. */
function fanOffset(index: number, count: number, corner: MabCorner) {
  const { baseAngle, direction } = CORNER_CONFIG[corner]
  // Center the spread around the base angle.
  const spread = (count - 1) * ITEM_ARC_DEGREES
  const start = baseAngle - (spread / 2) * direction
  const angle = start + index * ITEM_ARC_DEGREES * direction
  const rad = (angle * Math.PI) / 180
  return { x: Math.cos(rad) * FAN_RADIUS, y: -Math.sin(rad) * FAN_RADIUS }
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

  const handleDisable = useCallback(() => {
    haptics.select()
    setEnabled(false)
    setOpen(false)
    writeMabEnabled(false)
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

  // Nothing to offer, or toggled off, or pre-hydration → render nothing. (The dialogs are
  // still mounted below when enabled so an open sheet survives a fan close.)
  if (!mounted || !enabled || actions.length === 0) return null

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

            {/* Disable ("turn off MAB") affordance — sits opposite the fan, only while open. */}
            {open && (
              <motion.button
                key="disable"
                type="button"
                onClick={handleDisable}
                aria-label={t("mab_disable")}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={
                  reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 460, damping: 30 }
                }
                className="absolute -top-14 left-1/2 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-chrome-border bg-background text-muted-foreground shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline"
              >
                <EyeOffIcon className="size-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* The FAB itself — tap toggles the fan; drag repositions. */}
          <motion.button
            type="button"
            onClick={handleToggleFan}
            aria-label={open ? t("mab_close") : t("mab_open")}
            aria-expanded={open}
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
      />
      <MabUploadSheet isOpen={isUploadOpen} setIsOpen={setIsUploadOpen} />
    </>
  )
}
