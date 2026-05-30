---
title: "UI Library Integration Candidates — bklit + trophy.so"
slug: ui-library-candidates
type: runbook
status: research
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0303
pairs_with:
  - docs/runbooks/design/baseline-design-system.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# UI Library Integration Candidates

Research-only note (SESSION_0303). Evaluates two libraries as candidate **dirstarter extensions**
for Baseline v1. No integration performed this session. Live sites fetched 2026-05-29.

## Summary

**trophy.so/ui is the high-value candidate** — it is a shadcn copy-paste, Tailwind v4 + Next.js
gamification component kit whose achievement / badge / streak / leaderboard primitives map almost
one-to-one onto the martial-arts **Rank / Belt / RankSystem** domain. Stack matches Baseline exactly,
so integration is low-friction. **bklit is a narrower fit** — a React charting library; useful later
for the admin dashboard / analytics surfaces, not the public pages. Recommend: **pilot trophy.so**
for a rank/belt achievement surface in a later session; **watch bklit** for the admin analytics lane.

## bklit (ui.bklit.com)

- **What it is:** Open-source React **data-visualization / charting** component library (npm-distributed).
- **Components:** Area, Bar, Candlestick, Choropleth, Funnel charts; supporting Legend, Grid, Tooltip;
  a `useChart` hook. A "Studio" section (visual chart builder) and Charts/Showcase galleries.
- **Tech fit:** React-based. Charting libs are client components — fine inside Baseline's App Router
  as `"use client"` islands, but not RSC-renderable. No evidence of Tailwind-v4 token theming out of
  the box (charts usually carry their own color props → would need brand-token wiring).
- **License / model:** Open-source (GitHub + Discord). No pricing surfaced; npm package, self-hosted.
- **Effort:** Medium — npm dep + client-island wrapping + manual brand-token color mapping.
- **Best use case for Baseline:** Admin dashboard analytics (membership growth, registration funnels,
  revenue) — **not** public pages. Lower priority than trophy.so.
- **Verdict:** **Watch** — revisit when the admin analytics lane is scheduled.

## trophy.so (ui.trophy.so)

- **What it is:** Free, open-source **gamification UI kit** built on shadcn/ui + Tailwind CSS. A
  component library (not a backend/SaaS) — you own the data; it renders it.
- **Components (17):**
  - **Achievements:** Badge, Card, Grid, List, Unlocked (notification)
  - **Leaderboards:** Card, Podium, Rankings
  - **Points:** Awards, Badge, Boost, Chart, Level (List/Timeline)
  - **Streaks:** Badge, Calendar, Card
- **Tech fit:** **Excellent.** React 18+, Tailwind v4+, shadcn/ui, Next.js-compatible — this is
  Baseline's exact stack. Distributed via shadcn CLI (`npx shadcn@latest add https://ui.trophy.so/<component>`),
  so components land as local, editable source we can re-token to Baseline semantic colors. No runtime dep.
- **License / model:** Free, open-source (GitHub). No SaaS, no per-seat cost.
- **Effort:** **Low–medium** — copy-paste components, then swap their colors to Baseline tokens
  (`bg-primary`, `text-muted-foreground`, etc.) per the [design-system hub](baseline-design-system.md).
- **Best use case for Baseline:** **Rank / belt progression and achievements.** Maps to domain:
  - Achievement Card/Grid/List → earned ranks & certificates (`Rank`, `RegistrationEntry`)
  - Streaks Calendar → training/attendance consistency
  - Leaderboard Podium/Rankings → tournament results (`Tournament`, `Division`, `Registration`)
  - Points/Level → `RankSystem` progression visualization
- **Verdict:** **Pilot** — strongest candidate. Suggest a scoped pilot: one belt/rank achievement
  surface on a passport/profile page, re-tokened to Baseline. Defer to a dedicated session (not S6 launch).

## Recommendation

| Candidate | Fit | Effort | License | Verdict |
| --- | --- | --- | --- | --- |
| **trophy.so/ui** | High — rank/belt/achievement domain match, exact stack | Low–med | OSS, free | **Pilot** (later session) |
| **bklit** | Narrow — admin analytics charts only | Medium | OSS | **Watch** (admin lane) |

**Guardrails for any future integration:** components must be re-tokened to Baseline semantic colors
(no imported palette drift — see [design-system hub](baseline-design-system.md) + ADR 0022), keep
`focus-visible` parity, and prefer RSC where the component allows. Integration is out of scope for the
S6 launch push.

## Sources

- `https://ui.bklit.com/studio` — fetched 2026-05-29
- `https://ui.trophy.so/docs` — fetched 2026-05-29
