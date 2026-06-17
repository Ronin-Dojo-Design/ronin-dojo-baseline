---
title: "BBL — Launch Countdown / Coming-Soon Gate"
slug: bbl-launch-gate
type: runbook
status: active
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0403
pairs_with:
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
  - docs/sprints/SESSION_0402.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - bbl
  - blackbeltlegacy
  - launch
  - cutover
---

# BBL — Launch Countdown / Coming-Soon Gate

Lets the operator **flip `blackbeltlegacy.com` DNS now** while the public sees a launch countdown, so the
pricing seed (PR #81), the Dirty Dozen import (PR #82), the BBL Stripe rehearsal, and the rest of the cutover
can finish **with the DNS already flipped**. Ported from the monorepo BBLApp `LaunchCountdown.jsx`.

## How it works

- **Fail-open + brand-scoped.** The gate is active only when `NEXT_PUBLIC_BBL_LAUNCH_AT` is set to a **future**
  ISO instant **and** the resolved brand is `BBL`. Unset / in the past ⇒ no gating, the real site renders.
  Other brands (Baseline / Ronin / WEKAF) are never affected.
- **Middleware** (`proxy.ts`) rewrites BBL **public** routes to `/coming-soon` (the countdown page). It never
  gates operator / system surfaces — `/app`, `/admin`, `/dashboard`, `/me`, `/auth`, `/api`, `/coming-soon`,
  `/_gated`, `/monitoring` — so the team keeps working and the **BBL Stripe webhook (`/api/stripe/webhooks/bbl`)
  keeps receiving** while the gate is up.
- **Preview bypass.** Append `?preview` to any BBL URL to bypass the gate (persisted as the `bbl_preview`
  cookie); clear the cookie to see the countdown again. Lets the operator browse the real public site pre-launch.
- **Countdown** (`components/web/bbl/launch-countdown.tsx`) is brand-themed (`text-primary`, the brand logo from
  `useBrand()`) and shows days / hours / minutes / seconds to the target, then "We're live" once it passes.

Files: `lib/bbl-launch.ts` (edge-safe helpers), `proxy.ts` (gate), `app/coming-soon/page.tsx` (page),
`components/web/bbl/launch-countdown.tsx` (UI), `env.ts` + `.env.example` (`NEXT_PUBLIC_BBL_LAUNCH_AT`).

## Go live now (operator)

1. On the **BBL Vercel deployment**, set the launch instant (24h from now ≈):

   ```
   NEXT_PUBLIC_BBL_LAUNCH_AT=2026-06-18T04:30:00Z
   ```

   (ISO 8601; `Z` = UTC, or use an offset like `2026-06-18T12:00:00-08:00`. Adjust to taste.)
2. Redeploy BBL so the env var is baked into the client bundle.
3. Verify on a BBL preview URL / `bbl.local`: public routes show the countdown; `?preview` shows the real site;
   `/app` + `/admin` + `/api` are reachable.
4. **Flip the DNS** (SESSION_0402 checklist D). Keep building behind the gate.

## Disengage at launch

Unset `NEXT_PUBLIC_BBL_LAUNCH_AT` (or let it pass) and redeploy — the real BBL site renders immediately.
Because the gate is fail-open, clearing the var is the instant kill-switch if anything looks wrong.

## Cross-references

- SESSION_0402 — go-live cutover prep + checklist (`docs/sprints/SESSION_0402.md`, with PR #76)
- [CUTOVER_CHECKLIST](CUTOVER_CHECKLIST.md) — BBL go-live steps
