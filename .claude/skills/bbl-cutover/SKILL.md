---
name: bbl-cutover
description: Drive or verify the Black Belt Legacy gated DNS cutover and reveal — flip blackbeltlegacy.com to the Vercel countdown holding page, and later reveal the full app. Use for any "BBL launch / go-live / DNS flip / cutover / reveal / countdown" task.
---

Black Belt Legacy launches as a **gated cutover**, not a full launch. The whole BBL brand renders
`<BblCountdown/>` whenever `BBL_COUNTDOWN=1` and the request brand is BBL — `apps/web/app/(web)/layout.tsx`
short-circuits the layout before the app/DB. The **reveal** = flip `BBL_COUNTDOWN` off + redeploy.

Canonical docs (read for current state + mechanics): the latest `docs/sprints/SESSION_NNNN.md`,
`docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md`, `docs/runbooks/deploy/bbl-production-runbook.md`,
`docs/runbooks/deploy/vercel-domain-setup-runbook.md`. Launched SESSION_0407.

## Guards — read before doing anything

- **NO Stripe for launch** (operator). BBL transacts on its own account once `STRIPE_WEBHOOK_SECRET_BBL` arrives.
- **DO NOT flip `BBL_COUNTDOWN` off (the reveal)** until the operator confirms the webhook secret **and** the
  claim-invite emails are sent.
- Vercel **Sensitive** env vars pull **empty** (`vercel env pull` won't get them — the operator pastes).
- Apex Vercel IP = **`216.198.79.1`** (what live `baselinemartialarts.com` uses on this project), **not** the
  CLI's `76.76.21.21`. Both are valid anycast; trust the working value.
- One Vercel project (`ronin-dojo-baseline`) serves all brands (ADR 0006). One Neon project, brand-scoped.

## A. Establish actual live state (read-only — always first)

- `dig +short blackbeltlegacy.com A @1.1.1.1` — Fastly/WordPress = `151.101.66.159`; Vercel = `216.198.79.1`.
- Preview prod without touching DNS (force-resolve): `curl -k --resolve blackbeltlegacy.com:443:216.198.79.1 -s https://blackbeltlegacy.com/`
  → check `data-brand="BBL"` and whether it serves `<BblCountdown/>` ("A new home for the lineage") vs the full app.
- `vercel ls ronin-dojo-baseline` — confirm a green Production deploy.

## B. Make the countdown gate effective in prod — BEFORE any flip

- Set prod env (rm+add; values are Sensitive so confirm by behavior, not by reading them back):
  `vercel env rm BBL_COUNTDOWN production --yes; printf 1 | vercel env add BBL_COUNTDOWN production`.
  Same for `NEXT_PUBLIC_BBL_LAUNCH_AT` (ISO + offset, e.g. `2026-06-17T20:51:00-06:00`).
- `NEXT_PUBLIC_*` is **build-time inlined** — set it then push to `main` (app-code) so the fresh build inlines it.
- Re-verify by force-resolve that prod now serves the **countdown** (200), not the full app.
  **Flipping DNS while prod serves the full app = premature reveal of a half-built site.**

## C. Flip the apex (operator's hands at Bluehost)

- Bluehost DNS → apex `A @`: `151.101.66.159` → `216.198.79.1`. (`www` is already on Vercel.) TTL ~15 min.
- Background-watch propagation, then verify: poll `dig +short blackbeltlegacy.com A @1.1.1.1` until `216.198.79.1`,
  then `curl -s https://blackbeltlegacy.com/` for 200 + the countdown text. The apex TLS cert auto-issues
  ~1-2 min after DNS resolves to Vercel (the `www` cert already exists).
- Screenshot the live domain (logo/font/timer). **Rollback = revert apex A to `151.101.66.159`.**

## D. Reveal — ONLY when the webhook secret + claim emails are ready

- `vercel env rm BBL_COUNTDOWN production --yes` (or set to `0`) → redeploy → the full app shows.
- Verify the Dirty Dozen render on `/directory` + `/lineage`. Past the launch time, an un-revealed countdown
  shows "Launching soon" (not broken) — so a slipped webhook secret is safe.
