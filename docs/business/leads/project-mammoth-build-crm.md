---
title: Project — Mammoth Build CRM (replace HubSpot)
slug: project-mammoth-build-crm
type: project-plan
status: MVP-FOR-REVIEW
created: 2026-06-20
last_agent: petey
review:
  when: 2026-06-21 (Sunday)
  reviewer: Brian
app: clients/mammoth-build-crm/
backlinks:
  - docs/business/leads/mammoth-build-michael-flores.md
  - docs/business/leads/hubspot-integration-best-practices.md
  - docs/business/README.md
---

# Project — Mammoth Build CRM

> **PD (plan)** + **GD (backend architecture)** lens. Decision + MVP + roadmap, set for
> **Sunday 2026-06-21 review**. Going for simple.

## 1. The decision (for sign-off Sunday)

**Stop tuning HubSpot → build Mammoth their own custom CRM.** The HubSpot work isn't
wasted — it's now the **feature-parity + requirements spec** for what we replicate, leaner
and cheaper. See [`hubspot-integration-best-practices.md`](./hubspot-integration-best-practices.md)
for the "what HubSpot does" reference and [the brief](./mammoth-build-michael-flores.md) for
the 7 friction zones we're designing out.

**Why custom over HubSpot:** their real differentiator — *staying in the whole build with
proof at every step* — isn't a HubSpot-native motion. Build-process **photo documentation
(before/during/after)** tied to the project record is the centerpiece, and it's awkward to
bolt onto HubSpot. A purpose-built tool does it natively and drops their monthly seat +
platform-fee cost. *(Recommend: proceed. Alternative considered — stay on HubSpot and
integrate a photo tool — rejected: more glue, more cost, weaker proof story.)*

## 2. What shipped this session (MVP — frontend only)

App: **`clients/mammoth-build-crm/`** — Next.js 16 (App Router) + TypeScript + Tailwind,
dark theme + orange. **localStorage only, no backend.** Verified: `tsc` clean, `next build`
green (5 routes).

| Route | Feature |
|---|---|
| `/` | Landing/marketing page — recreated + polished per **Desi's** spec (mirror-reflection hero, scroll micro-animations, save-interest, inquiry-draft persistence). |
| `/app` | **Pipeline board** — Lead → Order with confirmed-order + at-risk counts. |
| `/app/new` | **Job order form** — start of job; creates a project. |
| `/app/project/[id]` | **Project detail + build documentation** (before/during/after photos), stage gates, and the next-step "can't-drop" guardrail. |

The two must-haves are demonstrated in the frontend logic (`lib/store.ts`):

- **Becomes an actual order** — crossing into the deposit stage stamps an order number +
  `orderConfirmed`; a project can't reach Complete without it.
- **Can't be dropped** — an open project with no next-step task is flagged *at risk*;
  closing as Lost requires a reason.

## 3. GD — backend architecture sketch (what replaces HubSpot)

HubSpot, structurally, is: a hosted CRM object store (contacts / deals / products / quotes /
invoices / line-items) + a workflow/automation engine + files + payments + a CMS. Our leaner
equivalent:

| HubSpot piece | Our lean stack |
|---|---|
| CRM object store | **Postgres + Prisma** (the dirtstarter app already uses this) |
| Files / photos | **S3-compatible object storage** (full-res build photos; thumbnails cached) |
| Workflow/automation engine | **Cron + a small job queue** (rotting detection, quote→order, reminders) |
| Quotes / e-sign | Quote records + a signature provider (or simple e-sign) |
| Payments | **Stripe direct** (they already use Stripe) — deposit + milestone invoices |
| Marketing email | Transactional/marketing email provider (Resend/Postmark) |
| CMS / website | The Next.js app itself (landing already built) |

**Cost angle (for Sunday):** swap recurring HubSpot Pro seats + platform fees for
commodity hosting (app + Postgres + S3 + email + Stripe's standard rates). At their volume
this is materially cheaper and fully owned. *(Put real numbers to it before committing.)*

## 4. Roadmap (phased, simple)

- **P1 — Frontend MVP** ✅ *this session.*
- **P2 — Backend + persistence + auth** — port localStorage models to Postgres/Prisma; basic auth.
- **P3 — Photo storage** — S3 originals + before/after **public proof links** to share with clients.
- **P4 — Automation** — rotting/at-risk detection, quote→order, next-step reminders, notifications.
- **P5 — Payments** — Stripe deposit + milestone invoices.
- **P6 — Marketing** — website polish + lifecycle email.

## 5. Sunday review checklist

```bash
cd clients/mammoth-build-crm && npm install && npm run dev   # http://localhost:3000
```
- [ ] Landing page feel — dark/orange, mirror hero, animations (touch-up, not redesign?).
- [ ] `/app` pipeline — does the lead→order flow read right?
- [ ] `/app/new` — is the job order form capturing the right start-of-job fields?
- [ ] Project detail — upload before/during/after photos; confirm the proof story lands.
- [ ] Guardrails — try to Complete a non-order; clear a next-step (watch it flag at-risk).

## 6. Open decisions for review

1. **Go/no-go** on replacing HubSpot (vs. integrate-with).
2. **Brand hex** — provisional palette in place; drop in the real logo colors.
3. **Roadmap priority** — is the **photo proof** (P3) the thing to build next, ahead of automation?
4. **Hosting/stack** sign-off (Postgres + S3 + Stripe + email).
5. Scope of the paid engagement (build it for them vs. with them).

## 7. Done means

- App committed + building green (✅).
- This plan + the HubSpot reference committed (✅).
- Reviewed Sunday → decisions in §6 resolved → P2 scoped.
