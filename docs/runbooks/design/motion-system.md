---
title: "Motion System — Epic Spec"
slug: motion-system
type: runbook
status: active
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0304
pairs_with:
  - docs/runbooks/design/baseline-design-system.md
  - docs/runbooks/design/ui-library-candidates.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Motion System — Epic Spec

## Summary

The motion language for **Baseline Martial Arts** — a martial-arts-inspired vocabulary of
durations, easings, and per-surface choreography layered on top of the frozen token system.
Motion is **the third axis of the design system** after color and type; it inherits the same
discipline as the [Baseline Design System hub](baseline-design-system.md) (token-first, no ad-hoc
values) and respects the brand architecture in [ADR 0022](../../architecture/decisions/0022-brand-chrome-resolution.md).

This doc is the **staged epic spec** for SESSION_0304. The `motion` lib (v12) is installed but
currently **unused anywhere** in `apps/web`; existing motion is CSS-only (`--animate-fade-in`,
`--animate-reveal`, `tailwindcss-animate`). This session lights up the first `motion`-driven
surface (the black-belt-rail rank reveal) and lays the token + accessibility rules every later
surface must follow.

## Authority and scope

- **Token source of truth:** [`apps/web/app/styles.css`](../../../apps/web/app/styles.css) — the
  Tailwind v4 `@theme` block. Existing motion tokens: `--animate-fade-in` (`0.3s ease-in-out`),
  `--animate-reveal` (scroll-driven via `view()`), `--animate-accordion-up/down`
  (`cubic-bezier(0.87, 0, 0.13, 1)`), plus the global `a/button` rule `ease-out` / `duration-100`.
- **Libraries:** `tailwindcss-animate` (CSS keyframe utilities, already wired via `@plugin`) for
  declarative/enter-exit cases; **`motion` v12** for orchestrated, stateful, or staggered motion
  that CSS cannot express cleanly (rank reveal, layout, gesture).
- **Governing decision:** [ADR 0022](../../architecture/decisions/0022-brand-chrome-resolution.md).
  Motion must not encode brand identity — no per-brand spring personalities in v1. Brands differ by
  color, not by tempo.

## 1. Motion principles

Premium feels **earned, not flashy**. The aesthetic is the dojo: control over spectacle.

- **Restraint over flash.** If motion does not clarify a state change or guide attention, it does
  not ship. No decorative parallax, no scroll-jacking, no motion-for-motion's-sake.
- **Precision and control.** Movements are short and exact. Default to opacity + small transforms
  (≤8px translate, ≤1.02 scale). A strike lands clean — it does not wobble.
- **Weight and follow-through.** Ease-out for entrances (fast in, settle gently) gives mass without
  bounce. Reserve spring physics for the rare deliberate accent; **no bouncy-spring overuse**.
- **Intentional stillness.** Negative space in motion is a feature. Idle UI is calm; nothing
  loops or pulses unless it communicates ongoing status (e.g. `--animate-ping` on a live badge).

## 2. Motion tokens

Canonical scale. Express in `motion` as `transition={{ duration, ease }}` (seconds) and in CSS via
`tailwindcss-animate` utilities / `@theme` `--animate-*` (ms). New `--animate-*` tokens land in
`styles.css` so they stay token-first per the design hub — **no inline magic numbers in components**.

### Durations

| Token | Value | Use |
| --- | --- | --- |
| `instant` | ~100ms | Button press / hover feedback (matches the existing global `duration-100` on `a`/`button`). |
| `quick` | 150ms | Small hover lifts, icon nudges (matches the existing `arrow-*` `duration-150` idiom). |
| `base` | 200ms | Default for most enter/exit and crossfades. |
| `deliberate` | 250–300ms | Flagship reveals, accordions (existing accordion tokens use `0.3s`). |

### Easing curves

| Token | Curve | Use |
| --- | --- | --- |
| `ease-out` (entrance) | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements entering / settling — fast in, gentle stop. Conceptual extension of the base-layer `ease-out`. |
| `ease-in-out` (move) | `cubic-bezier(0.4, 0, 0.2, 1)` | On-screen movement, layout shifts, hover→rest round-trips. Matches `--animate-fade-in`'s `ease-in-out` intent. |
| `emphasis` (accent) | `cubic-bezier(0.87, 0, 0.13, 1)` | Sharp, controlled accent — reuse of the existing accordion curve. Sparingly. |

### Stagger

| Token | Value | Use |
| --- | --- | --- |
| `stagger-tight` | 40ms/item | Dense lists, table rows. |
| `stagger-base` | 60ms/item | Cards, rank rail belts (the flagship). |
| Cap | ~6–8 items | Beyond the cap, switch to a single group fade to avoid a long, draggy cascade. |

## 3. `prefers-reduced-motion` discipline (MANDATORY)

**Non-negotiable, every animation, no exceptions.** When reduced motion is requested, the surface
renders its **final state statically** — visible, in position, fully opaque. We never hide content
behind an animation that a reduced-motion user will never see.

- **`motion` lib surfaces:** read `useReducedMotion()` and branch. When `true`, skip transforms and
  set the animate target to the resting state with `transition={{ duration: 0 }}` (or render the
  final variant directly). The element must be present and final on first paint.
- **CSS / `tailwindcss-animate` surfaces:** guard keyframes with
  `@media (prefers-reduced-motion: reduce)` resetting `animation`/`transition` to `none` and pinning
  opacity/transform to the end state.
- **Stagger:** a reduced-motion list appears all-at-once, fully rendered — no per-item delay.
- **Review gate:** a surface without a reduced-motion fallback is a blocking bug, not a polish item.
  This pairs with the design hub's `focus-visible` discipline — accessibility is enforced from day one.

## 4. Per-surface animation catalog

| Surface | Animation | Duration / easing | Reduced-motion behavior | Priority | Risk |
| --- | --- | --- | --- | --- | --- |
| **Black-belt-rail rank reveal** (flagship) | Staggered fade-in-up of rank/belt items (opacity 0→1, translateY 8px→0) | `deliberate` 250–300ms, `ease-out` entrance, `stagger-base` 60ms | All belts render final/in-place, no stagger | **P0** (prototyped this session) | Med — first `motion` usage; verify SSR/hydration + cap stagger length |
| **Card hover lift** | translateY −2px + subtle shadow/border emphasis on hover | `instant`–`quick` 100–150ms, `ease-in-out` | No transform; static rest state | P1 | Low — CSS-only, reuses base-layer hover idiom |
| **List/grid item stagger on load** | Sequential fade-in-up across `--grid-template-columns-*` items | `base` 200ms, `ease-out`, `stagger-tight`/`base` | All items render at once, final state | P1 | Low–med — cap item count, avoid layout thrash |
| **Route / page transitions** | Cross-route fade/slide via App Router `template.tsx` wrapper | `base` 200ms, `ease-in-out` | Instant cut, no transition | **P2 (staged — NOT this session)** | **High — launch risk.** `template.tsx` re-mounts subtree each nav; can mask loading, break scroll restoration, and regress LCP. Defer until post-launch and measure. |
| **Toast / sonner entrances** | Slide-in + fade from edge, fade-out on dismiss | `quick`–`base` 150–200ms, `ease-out` | Appear/disappear with no slide | P1 | Low — sonner has native reduced-motion support; verify it's honored |
| **Button press feedback** | scale 0.98 on `:active`, settle on release | `instant` ~100ms, `ease-out` | No scale; rely on color/focus state | P1 | Low — reuses global `duration-100` |
| **Skeleton → content crossfade** | Skeleton fades out as content fades in (replaces hard swap) | `base` 200ms, `ease-in-out` | Hard swap, no crossfade | P0–P1 (skeletons this session) | Low — keep skeleton shape matching final layout to avoid shift |

## 5. Staged epic / rollout

| Phase | Scope | Status |
| --- | --- | --- |
| **Phase 0 — this session** | Black-belt-rail rank-reveal prototype (first `motion` surface) + loading skeletons (skeleton→content crossfade) + a progressive `lib/haptics.ts` util. | SESSION_0304 |
| **Phase 1** | Card / list micro-interactions (hover lift, on-load stagger, button press, toast entrances) — formalize tokens into `styles.css`. | Next |
| **Phase 2** | Global page transitions via `template.tsx`. **Post-launch only** — launch-risk surface (see catalog). | Deferred |
| **Phase 3** | Real haptics + [trophy.so](ui-library-candidates.md) achievement / rank-unlock motion (badge unlock, streak, level-up). | Future |

### Haptics constraint (Phase 0 util, real haptics deferred)

- **iOS Safari has no `navigator.vibrate`** — the Vibration API is unsupported on iOS web entirely.
  Android Chrome supports it but only after a user gesture.
- This session adds a **progressive `apps/web/lib/haptics.ts`** util that feature-detects
  `navigator.vibrate` and **no-ops silently** on unsupported platforms. Call sites stay clean and
  never assume haptics fire.
- **Real, reliable haptics require a PWA / native shell** (e.g. Capacitor or a native wrapper).
  That is out of scope for web and tracked as a future platform decision, aligned with the
  trophy.so achievement pilot in Phase 3 (rank-unlock is the natural first haptic moment).

## 6. Cross-references

- [Baseline Design System — Hub](baseline-design-system.md) — color/type tokens, component idioms,
  the token-first + `focus-visible` discipline motion extends.
- [UI Library Integration Candidates](ui-library-candidates.md) — trophy.so is the flagged
  gamification / achievement pilot that Phase 3 achievement motion builds on.
- [ADR 0022 — Brand Chrome Resolution](../../architecture/decisions/0022-brand-chrome-resolution.md) —
  brand architecture; motion stays brand-neutral (color differentiates brands, not tempo).
- `docs/sprints/SESSION_0304.md` — the session executing Phase 0 (rank-reveal prototype, skeletons, haptics util).

## Open questions

- Should the canonical durations/easings ship as `--duration-*` / `--ease-*` `@theme` tokens (not
  just `--animate-*` bundles) so `motion` and CSS share one literal source? (Lean yes; formalize in Phase 1.)
- Stagger cap: hard ceiling at 6 items, or scale delay down as item count grows? (Decide against real rail data.)

## Sources

- `apps/web/app/styles.css` (live motion tokens + base-layer transition rules)
- `motion` v12 (`useReducedMotion`, transition API), `tailwindcss-animate` plugin
- `docs/runbooks/design/baseline-design-system.md`, `docs/runbooks/design/ui-library-candidates.md`, ADR 0022
