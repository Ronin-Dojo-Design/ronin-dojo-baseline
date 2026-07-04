"use client"

import { motion, useScroll, useTransform } from "motion/react"
import { useRef, type ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { H5 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { memberInitials } from "~/lib/lineage/canvas-model"
import { cx } from "~/lib/utils"
import type { LineageAncestryEntry } from "~/server/web/lineage/ancestry"
import { type ScenePalette, scenePaletteTokens } from "./scene-model"

/**
 * Lineage Journey scene sections (Epic A2-v1, SESSION_0498) — the scroll-driven
 * cinematic layer over the ancestry walk on `/directory/[slug]`.
 *
 * ONE section primitive (`SceneShell`, palette variant `black | red | white` —
 * token sets in `scene-model.ts`) × two content layouts:
 *
 * - `LineageStoryScene` — full cinematic beat for an entry WITH a story scene:
 *   full-bleed hero (heroImageUrl → typographic monogram; passport avatars are
 *   NEVER promoted to full-bleed — placeholder clip-art at hero scale is
 *   undignified (Desi A2 P1-3), the avatar's home is the node-echo chip) that
 *   starts LARGE and shrinks toward the top-left to "become" the timeline node,
 *   Poppins-800 display name (landing-page type parity via the
 *   `--font-bbl-heading` var the server section defines), sourced quote with the
 *   palette-accent underline, optional story bio.
 * - `LineageStoryNodeScene` — minimal beat for an entry WITHOUT a story scene
 *   (avatar + name + belt, the timeline-node vocabulary) so the chain stays a
 *   complete narrative walk down to the member.
 *
 * Motion (v1 bake-off — `motion/react` `useScroll` + `useTransform`, NO new dep):
 * every animated property is transform/opacity only (compositor-friendly, no
 * layout-triggering keyframes) and a **deterministic pure function of scroll
 * progress** — no scroll hijacking, no springs on the scroll map. SSR/no-JS ships
 * the full content visible with zero layout shift: initial progress is 0 → scale 1
 * / rotate 0, and the only opacity-hidden element is the decorative node-echo chip
 * (`aria-hidden`, duplicated content). The reduced-motion fallback lives one level
 * up in `LineageStorySequence` (the whole scroll mode swaps for today's stagger
 * timeline), so these components never render for reduced-motion viewers.
 *
 * Quote attribution renders the entry's `displayName` by contract — the stored
 * `quoteAttribution` is sourcing provenance, not display copy (SESSION_0498
 * orchestrator decision).
 */

/**
 * Landing-page display-type parity (`bbl-landing/index.tsx`): Poppins 800 italic
 * uppercase. Consumes the `--font-bbl-heading` var (defined by `AncestrySection`
 * via the shared `bblHeadingFont.variable`) with the app display font fallback.
 *
 * `font-[family-name:…]` (an arbitrary-VALUE font utility, not an arbitrary
 * property) so tailwind-merge resolves it in the font-family group — it must
 * beat `Heading`'s `font-sans` when composed onto `H5` (Desi A2 P2: real
 * heading semantics, display-type styling kept).
 */
const displayTypeClass =
  "font-[family-name:var(--font-bbl-heading,var(--font-display))] font-extrabold italic uppercase tracking-[0.02em]"

/** Accent underline on display type — thickness/offset shared across palettes. */
const accentUnderlineClass = "underline decoration-[0.06em] underline-offset-[0.15em]"

/** The ONE full-width section primitive — palette variant × shared chrome. */
function SceneShell({
  palette,
  className,
  children,
}: {
  palette: ScenePalette
  className?: string
  children: ReactNode
}) {
  return (
    <section
      data-testid="lineage-story-scene-section"
      data-scene-palette={palette}
      className={cx(
        // overflow-hidden clips the internal transforms (rotating marker, scaling
        // hero) so scene motion can never grow a horizontal scrollbar on mobile.
        "relative w-full overflow-hidden",
        scenePaletteTokens[palette].section,
        className,
      )}
    >
      {children}
    </section>
  )
}

/** Shared belt/discipline rows — the timeline-node vocabulary on a palette bg. */
function SceneRankRows({ entry, mutedClass }: { entry: LineageAncestryEntry; mutedClass: string }) {
  return (
    <>
      {entry.rank && (
        <Stack size="sm" direction="row" wrap={false} className="items-center">
          <BeltSwatch
            variant="flat-bar"
            colorHex={entry.rank.colorHex}
            secondaryColorHex={entry.rank.secondaryColorHex}
            degree={entry.rank.degree}
          />
          <span className={cx("truncate text-xs", mutedClass)}>{entry.rank.name}</span>
        </Stack>
      )}

      {entry.disciplineLabel && (
        <span className={cx("truncate text-xs", mutedClass)}>{entry.disciplineLabel}</span>
      )}
    </>
  )
}

/** Full cinematic scene — an ancestry entry WITH an enabled story scene. */
export function LineageStoryScene({
  entry,
  palette,
  sceneNumber,
  isOwner,
}: {
  entry: LineageAncestryEntry
  palette: ScenePalette
  /** 1-based chain position — the rotating scene marker ("01", "02", …). */
  sceneNumber: number
  isOwner: boolean
}) {
  const tokens = scenePaletteTokens[palette]
  const heroRef = useRef<HTMLDivElement>(null)

  // Deterministic scroll map (bake-off criterion d): progress 0 when the hero's
  // top reaches 85% of the viewport (just entered), 1 when its bottom reaches 35%
  // (scrolling away). Pure function of scroll position — reversing the scroll
  // replays the exact same frames backwards.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start 0.85", "end 0.35"],
  })

  // Hero: starts LARGE (scale 1) → shrinks + slides toward the top-left
  // (transform-origin top-left does the slide) to "become" the timeline node.
  // Holds full scale until ~viewport-center (Desi A2 P1-1 retime: the [0.2, 1]
  // map measured scale 0.71 at center — the hero was never witnessed large).
  const heroScale = useTransform(scrollYProgress, [0.45, 1], [1, 0.42])
  // The node echo (avatar chip) the hero shrinks into — fades in mid-shrink so
  // the "becomes the node" beat is WITNESSED (Desi A2 re-score P2: the [0.85, 1]
  // window played entirely above the viewport / under the sticky chrome —
  // opacity 1.0 landed at chip-top −137px mobile / −43px desktop). [0.6, 0.8]
  // reaches opacity 0.8 at p=0.76 with the chip ~71px (390×844) / ~154px
  // (1440×900) from viewport-top — below the ~50px / ~110px sticky stacks on
  // both. Decorative duplication (aria-hidden): opacity-0 never hides content.
  const chipOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1])
  // Operator direction: horizontal text flips to vertical on scroll — the scene
  // marker rotates 0° → 90° across the first two thirds of the scene.
  const markerRotate = useTransform(scrollYProgress, [0, 0.6], [0, 90])
  // Void reclaim (Desi A2 P1-2): the transform-scale shrink does NOT reclaim the
  // hero's layout box, leaving a ~(1 − 0.42) × heroHeight dead band (~250px) mid-
  // scene. The following content stack chases the shrinking hero with a transform-
  // only `y` (same scroll map — compositor-friendly, never layout-triggering),
  // keeping a 24px residual over the flex gap so the rest-state gap reads
  // intentional. SSR/no-JS: scale 1 → y 0 → transform none, zero layout shift.
  // Reading offsetHeight per frame is safe here: scroll frames with transform-only
  // animation leave layout clean, so the read never forces a reflow.
  const contentY = useTransform(heroScale, scale => {
    const heroHeight = heroRef.current?.offsetHeight ?? 0
    return -Math.max(0, (1 - scale) * heroHeight - 24)
  })

  const story = entry.story
  if (!story) return null

  const heroImage = story.heroImageUrl

  return (
    <SceneShell palette={palette} className="px-6 py-14 sm:px-10 sm:py-20">
      {/* Rotating scene marker — decorative chain position, flips to vertical. */}
      <motion.span
        aria-hidden
        style={{ rotate: markerRotate }}
        className={cx(
          "absolute top-8 right-6 text-xs font-semibold tracking-[0.4em] sm:top-12 sm:right-10",
          tokens.muted,
        )}
      >
        {String(sceneNumber).padStart(2, "0")}
      </motion.span>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        {/* The connecting edge's narrative — the caption between this person and
            the instructor above them, same contract as the timeline. */}
        {entry.narrative && <p className={cx("text-sm italic", tokens.muted)}>{entry.narrative}</p>}

        <div ref={heroRef} className="relative">
          <motion.figure
            style={{ scale: heroScale }}
            className="relative aspect-[4/5] w-full origin-top-left overflow-hidden rounded-2xl sm:aspect-[16/10]"
          >
            {heroImage ? (
              <img
                src={heroImage}
                alt={entry.displayName}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              // No hero image — the dignified palette-tinted monogram panel keeps
              // the shrink-to-node beat consistent. Deliberately NOT the passport
              // avatar: placeholder avatars at full-bleed are the worst frame
              // (Desi A2 P1-3); the avatar renders correctly in the node echo.
              <div className={cx("absolute inset-0 grid place-items-center", tokens.monogram)}>
                <span className={cx(displayTypeClass, "text-8xl")}>
                  {memberInitials(entry.displayName)}
                </span>
              </div>
            )}
            {/* Section overlay for text legibility over full-bleed media. */}
            <div aria-hidden className={cx("absolute inset-0", tokens.overlay)} />
          </motion.figure>

          {/* The timeline node the hero "becomes" — decorative echo, fades in as
              the shrink completes at the top-left. */}
          <motion.div
            aria-hidden
            style={{ opacity: chipOpacity }}
            className="pointer-events-none absolute top-3 left-3"
          >
            <Avatar className={cx("size-12 ring-2", tokens.ownerRing)}>
              {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt="" />}
              <AvatarFallback>{memberInitials(entry.displayName)}</AvatarFallback>
            </Avatar>
          </motion.div>
        </div>

        {/* The content stack chases the shrinking hero up (transform-only y —
            see contentY above), reclaiming the dead band the scale transform
            leaves in the layout. */}
        <motion.div style={{ y: contentY }} className="flex flex-col gap-8">
          <Stack size="xs" direction="column" wrap={false} className="min-w-0">
            <Stack size="sm" direction="row" wrap className="items-center">
              {/* Real heading semantics (document outline) with the display type
                  kept — H5's font-sans/font-medium/text-base lose the merge to
                  displayTypeClass + the size classes (Desi A2 P2). */}
              <H5
                className={cx(
                  displayTypeClass,
                  accentUnderlineClass,
                  tokens.underline,
                  "text-4xl leading-[1.05] sm:text-6xl",
                )}
              >
                {entry.displayName}
              </H5>
              {isOwner && (
                <Badge variant="primary" size="sm" className={tokens.badge}>
                  This member
                </Badge>
              )}
            </Stack>

            <SceneRankRows entry={entry} mutedClass={tokens.muted} />
          </Stack>

          {story.quote && (
            <figure className="flex flex-col gap-4">
              <blockquote className={cx(displayTypeClass, "text-2xl leading-tight sm:text-4xl")}>
                “{story.quote}”
              </blockquote>
              {/* Attribution = displayName by contract — stored quoteAttribution is
                  provenance notes, never display copy (SESSION_0498). */}
              <figcaption
                className={cx("text-sm font-semibold tracking-[0.2em] uppercase", tokens.muted)}
              >
                — {entry.displayName}
              </figcaption>
            </figure>
          )}

          {story.storyBio && (
            <p className={cx("text-base leading-7", tokens.muted)}>{story.storyBio}</p>
          )}
        </motion.div>
      </div>
    </SceneShell>
  )
}

/** Minimal scene — an ancestry entry WITHOUT a story scene (avatar + name + belt). */
export function LineageStoryNodeScene({
  entry,
  palette,
  isOwner,
}: {
  entry: LineageAncestryEntry
  palette: ScenePalette
  isOwner: boolean
}) {
  const tokens = scenePaletteTokens[palette]

  return (
    <SceneShell palette={palette} className="px-6 py-10 sm:px-10 sm:py-14">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {entry.narrative && <p className={cx("text-sm italic", tokens.muted)}>{entry.narrative}</p>}

        <Stack size="md" direction="row" wrap={false} className="items-center">
          <Avatar className={cx("size-14", isOwner && cx("ring-2", tokens.ownerRing))}>
            {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />}
            <AvatarFallback>{memberInitials(entry.displayName)}</AvatarFallback>
          </Avatar>

          <Stack size="xs" direction="column" wrap={false} className="min-w-0">
            <Stack size="sm" direction="row" wrap className="items-center">
              <span
                className={cx(
                  displayTypeClass,
                  accentUnderlineClass,
                  tokens.underline,
                  "truncate text-xl sm:text-2xl",
                )}
              >
                {entry.displayName}
              </span>
              {isOwner && (
                <Badge variant="primary" size="sm" className={tokens.badge}>
                  This member
                </Badge>
              )}
            </Stack>

            <SceneRankRows entry={entry} mutedClass={tokens.muted} />
          </Stack>
        </Stack>
      </div>
    </SceneShell>
  )
}
