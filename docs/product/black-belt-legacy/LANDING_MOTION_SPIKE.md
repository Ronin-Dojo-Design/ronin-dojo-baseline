---
title: "BBL Landing Motion Spike — GSAP / Lenis / three.js direction"
slug: bbl-landing-motion-spike
type: spec
status: active
created: 2026-06-16
updated: 2026-06-16
last_agent: claude-session-0394
author: Brian + Petey + Desi
pairs_with:
  - docs/sprints/SESSION_0394.md
  - docs/knowledge/wiki/concepts/motion-system.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# BBL Landing Motion Spike — GSAP / Lenis / three.js direction

> Teed up at **SESSION_0394** as the next-session lane. The cinematic *lineage explorer*
> polish landed using the existing `motion/react` idiom (the canvas pans/zooms, so the
> scroll-card idiom does not map to it). The operator's appetite for **GSAP + Lenis +
> three.js** ("could really shine") belongs on the **landing page**, which IS a
> scroll-driven editorial surface. This doc is the decision + direction frame for that
> build — it is **not** a build. Nothing here ships until a session picks it up and the
> dependency budget below is signed off.

## Why these libraries fit the landing (and not the explorer)

| Surface | Interaction model | Right tool |
| --- | --- | --- |
| Lineage explorer (`?view=explore`) | pan / zoom d3 canvas, selection-driven focus | `motion/react` + CSS (shipped SESSION_0394) |
| BBL landing (`bbl-landing.tsx`) | long vertical scroll, editorial reveal | **GSAP ScrollTrigger + Lenis + (light) three.js** |

The landing already uses `BblReveal` for entrance reveals and the BBL Poppins type system
(now shared via `lib/fonts.ts::bblHeadingFont`). The spike extends that, it does not replace it.

## Library roles

- **Lenis** (`lenis`, ~3 kB) — smooth, inertial vertical scroll for the whole landing.
  The substrate every scroll-driven effect rides on. Lowest risk; adopt first.
- **GSAP + ScrollTrigger** (`gsap`, ~hooked via `@gsap/react` `useGSAP`) — the
  CapCut / MasterCourse "scroll cards": pinned sections, cards that shrink / slide /
  stack as the user scrolls, parallax timelines. This is the headline effect.
- **three.js** (`three` + `@react-three/fiber` + `drei`) — ONE lightweight, high-impact
  hero moment only (e.g. a slow-rotating belt-knot or a particle field behind the hero),
  lazy-loaded and `Suspense`-gated. NOT a full 3D scene. ~150 kB+ gzipped — this is the
  dependency that needs the hardest justification.

## Budget + supply-chain note (operator is script-cautious — [[operator-script-caution]])

- Adding all three is **3 net-new runtime deps**. Lenis is cheap; GSAP is medium; three.js
  is the heavy one. Recommend a **phased adoption**: (1) Lenis, (2) GSAP scroll-cards,
  (3) three.js hero — each as its own session with a Lighthouse/bundle check before the next.
- three.js must be **dynamically imported** (`next/dynamic`, `ssr: false`) and code-split
  so it never enters the main landing bundle or blocks LCP.
- Pin exact versions; review the install diff before running (host-based, no Docker).

## Hard constraints (carry from the explorer work)

- **Reduced-motion is mandatory.** Every GSAP timeline + Lenis instance must check
  `prefers-reduced-motion` and degrade to instant/native scroll (mirror the explorer's
  `useReducedMotion` discipline). Lenis: do not instantiate under reduced motion.
- **No glassmorphism, no AI slop.** Same brand bar the explorer just cleared — solid
  legacy chrome, Poppins italic 800 headings, belt color from `Rank.colorHex` if belts appear.
- **Brand parity.** The landing is BBL-branded today, but keep brand accents on the
  `--primary` token where the surface is shared; gold stays editorial chrome only.
- **LCP / CLS budget.** Scroll-pinning and 3D must not regress Core Web Vitals — measure
  with `lighthouse_audit` before/after each phase.

## Suggested first task (next session)

1. Adopt **Lenis** behind a reduced-motion guard on `bbl-landing.tsx`; confirm no CLS/LCP regression.
2. Prototype ONE GSAP ScrollTrigger "scroll-card" section (the value-props or timeline block)
   with `useGSAP`; pin it, verify reduced-motion fallback, measure bundle delta.
3. Defer three.js to its own session with an explicit hero concept + lazy-load proof.

## Open questions

- Which landing section is the hero scroll-card moment — value props, the timeline, or the
  belt-progression story?
- Is a 3D hero worth the three.js weight, or does a GSAP/CSS parallax deliver 90% of the impact
  at a fraction of the bytes? (Recommend prototyping the GSAP version first and A/B-ing the feel.)
