# Mammoth Build CRM — MVP

A DB-backed MVP of a **custom CRM for Mammoth Metal Buildings**, built to replace HubSpot with
something leaner. Next.js (App Router) + TypeScript + Tailwind + a product-owned Prisma database.
Dark theme with orange accents (palette provisional — swap when brand hex is confirmed).

> Status: **authenticated local MVP for review**. Projects, Contacts, and Activities persist in
> Mammoth's own database; external providers and production credentials remain disconnected.
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
| `/app/sales` | **Sales cockpit tracer** — due queue → roster → contact workspace → manual Contact Attempt → exactly one owned Next Action. |
| `/app/new` | **Job order form** — start of job; creates a project. |
| `/app/project/[id]` | **Project detail** + **build documentation** (before / during / after photos), stage gates, and the next-step "can't-drop" guardrail. |

## Design decisions

- **Per-product database.** Project, Contact, and Activity truth lives in Mammoth's isolated Prisma database.
- **Activity-backed anti-drop tracer.** A manual Contact Attempt atomically replaces the prior open task with
  one owned, due Next Action; `Project.nextTask` remains a compatibility projection.
- **Palette via CSS variables** (`app/globals.css`) → brand swap is a one-file change.
- **Accessibility:** orange is used for large text / accents / CTAs only (WCAG note in Desi spec);
  `prefers-reduced-motion` respected; focus rings on all interactive elements.
- **"Becomes an actual order"** logic lives in `lib/store.ts` — crossing into the deposit stage
  stamps an order number and sets `orderConfirmed`; a project can't reach Complete without it.

## Not in this tracer

Provider calls/emails/sends, imports, HubSpot/Todoist connections, schema changes, autonomous automation,
S3 photo storage, e-sign, Stripe payments, and marketing email.
