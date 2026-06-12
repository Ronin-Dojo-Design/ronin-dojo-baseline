"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"

/**
 * Scroll-triggered section reveal for the BBL landing (SESSION_0370 polish
 * pass). Fade + rise on first viewport entry, GSAP-style staggered ease via
 * motion/react (repo motion idiom — no new dependency). Reduced motion:
 * renders static at rest per the motion-system runbook.
 */
export const BblReveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <>{children}</>

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}
