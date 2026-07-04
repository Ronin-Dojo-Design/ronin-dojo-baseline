"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"

/**
 * Scroll-triggered section reveal for the BBL landing (SESSION_0370 polish
 * pass). Fade + rise on first viewport entry, GSAP-style staggered ease via
 * motion/react (repo motion idiom — no new dependency). Reduced motion:
 * renders static at rest per the motion-system runbook.
 *
 * SSR-safe (SESSION_0495 C2-10): the hidden state lives in the `whileInView`
 * KEYFRAMES ([0 → 1]) with `initial={false}`, NOT in `initial` — the shipped
 * ancestry-timeline idiom. `initial={{ opacity: 0 }}` would emit `opacity:0`
 * inline on the server, hiding the section pre-hydration / with JS disabled.
 */
export const BblReveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <>{children}</>

  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: [0, 1], y: [36, 0] }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}
