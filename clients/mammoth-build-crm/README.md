# Mammoth Build CRM — MVP

A frontend-only (localStorage) MVP of a **custom CRM for Mammoth Metal Buildings**, built
to replace HubSpot with something leaner. Next.js (App Router) + TypeScript + Tailwind.
Dark theme with orange accents (palette provisional — swap when brand hex is confirmed).

> Status: **MVP for review**. No backend, no auth, no real persistence beyond the browser.
> See `docs/business/leads/project-mammoth-build-crm.md` in the repo root for the plan,
> roadmap, and the backend/architecture sketch.

## Run

```bash
cd clients/mammoth-build-crm
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run typecheck
```

## What's in the MVP

| Route | What it is |
|---|---|
| `/` | Landing / marketing page — recreated + polished (mirror hero, micro-animations, save-interest, inquiry draft). Per Desi's design spec. |
| `/app` | **Pipeline board** — projects moving Lead → Order, with confirmed-order and at-risk counts. |
| `/app/new` | **Job order form** — start of job; creates a project. |
| `/app/project/[id]` | **Project detail** + **build documentation** (before / during / after photos), stage gates, and the next-step "can't-drop" guardrail. |

## Design decisions

- **localStorage only.** All state in the browser. Photos are downscaled to thumbnails
  (`lib/image.ts`) to fit the storage quota — full-res originals belong in S3 (backend phase).
- **One shared `useLocalStorage` hook** + one `Reveal` (IntersectionObserver) primitive — per Desi.
- **Palette via CSS variables** (`app/globals.css`) → brand swap is a one-file change.
- **Accessibility:** orange is used for large text / accents / CTAs only (WCAG note in Desi spec);
  `prefers-reduced-motion` respected; focus rings on all interactive elements.
- **"Becomes an actual order"** logic lives in `lib/store.ts` — crossing into the deposit stage
  stamps an order number and sets `orderConfirmed`; a project can't reach Complete without it.

## Not in the MVP (backend / next phase)

Real auth, server persistence, S3 photo storage, automation/notifications, e-sign, Stripe
payments, and marketing email. These are the "Giddy / backend architecture" track.
