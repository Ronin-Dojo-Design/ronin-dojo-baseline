---
title: "Mammoth Build CRM Stories"
slug: mammoth-build-stories
type: stories
status: draft
created: 2026-06-20
updated: 2026-06-28
author: Brian + Petey
last_agent: claude-session-0460
backlinks:
  - docs/product/README.md
  - docs/product/mammoth-build/PRD.md
pairs_with:
  - docs/product/mammoth-build/PRD.md
  - docs/business/leads/project-mammoth-build-crm.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
tags:
  - product
  - mammoth-build
  - stories
  - backlog
  - crm
---

# Mammoth Build CRM Stories

## Story map

Mammoth Build runs a project through this chain — with proof captured along the way:

```txt
Inquiry -> Lead -> Quote -> Order -> Engineering -> Fabrication -> Delivery -> Complete
                                  \-> Build Photos (before / during / after) ->/
```

Story IDs use the `MB-` prefix. Status: 🟢 in MVP · ⚪ planned.

## Epic 1 — Landing & Inquiry

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-LAND-001 | As a visitor, I want a clear landing page so I trust Mammoth and understand they stay in the whole build. | Dark/orange landing with hero, "we don't quote-ship-disappear" promise, process, and build types. | 🟢 |
| MB-LAND-002 | As a visitor, I want to save building types I'm interested in so my inquiry is pre-filled. | Saved types persist (localStorage) and pre-fill the inquiry's building-type field. | 🟢 |
| MB-LAND-003 | As a visitor, I want my inquiry draft kept if I leave so I don't retype it. | Draft auto-saves and rehydrates; on submit it's stored and the form clears with a "saved locally" note. | 🟢 |
| MB-LAND-004 | As a client, I want my inquiry to become a CRM lead so Mammoth follows up. | Submitted inquiry creates a Lead with a first-touch next step. | ⚪ (needs backend) |

## Epic 2 — Pipeline (Lead → Order)

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-PIPE-001 | As the GM, I want a board of projects by stage so I see the whole pipeline at a glance. | Board shows the 9 PEMB stages with per-stage counts and project cards. | 🟢 |
| MB-PIPE-002 | As a coordinator, I want to advance a project to the next stage so progress is tracked. | Advance moves to the next stage; stage gate/criterion is shown. | 🟢 |
| MB-PIPE-003 | As the GM, I want confirmed-order and at-risk counts so I know what's real and what's slipping. | Summary shows project count, confirmed orders, and at-risk count. | 🟢 |

## Epic 3 — Job Order

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-ORDER-001 | As a coordinator, I want a job order form so the start of a job creates a project. | Form captures contact, building type, use, region, dimensions, notes; creates a project at Lead. | 🟢 |
| MB-ORDER-002 | As an engineer, I want PEMB fields on the record so the project brief lives in the CRM. | Dimensions (W×L×eave) captured; loads/PE-stamp fields modeled. | 🟢 (dimensions) / ⚪ (full loads) |

## Epic 4 — Build Documentation (the differentiator)

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-PHOTO-001 | As field crew, I want to upload before/during/after photos to a project so the build is proven. | Photos grouped by phase (before/during/after); captured from a phone; tagged with the current stage. | 🟢 |
| MB-PHOTO-002 | As the GM, I want photos tied to the project record so proof and project are inseparable. | Photos persist on the project; thumbnails shown in the grouped view. | 🟢 (local thumbnails) |
| MB-PHOTO-003 | As a client, I want a shareable before/after proof link so I can see my finished build. | Public proof link renders before/after for the project. | ⚪ (needs S3 + backend) |

## Epic 5 — Guardrails (the two must-haves)

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-GUARD-001 | As the GM, I want an accepted quote to become an actual order so quotes don't sit. | Crossing into the deposit stage stamps an order number and sets order-confirmed; a project can't reach Complete without it. | 🟢 |
| MB-GUARD-002 | As the GM, I want projects to never be silently dropped so nothing falls through. | An open project with no next step is flagged at risk; closing Lost requires a reason. | 🟢 |
| MB-GUARD-003 | As the GM, I want at-risk projects escalated so someone acts. | Rotting/inactivity detection escalates to owner then manager. | ⚪ (needs backend/automation) |

## Epic 6 — Billing & Reporting

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-BILL-001 | As the office, I want milestone invoices (deposit → engineering → fabrication → delivery → final) so cash flow matches the build. | Stage change generates the matching invoice + Stripe payment link. | ⚪ (P5) |
| MB-REPORT-001 | As the GM, I want pipeline value, win-rate by building type, time-in-stage, and AR-aging so I can manage the business. | Dashboards render from the project/order data. | ⚪ (P4/P5) |

## Epic 7 — Data layer & per-product database (ADR 0038)

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-DATA-001 | As the platform, I want Mammoth to have its **own database + schema**, isolated from BBL, so a Mammoth migration can never break another product. | Own `prisma/` + `prisma.config.ts` + `DATABASE_URL` (`mammoth_dev`); HubSpot-replacement CRM schema (Contact/Company/Project/Activity/Quote/LineItem/Product/Invoice/BuildPhoto/TeamMember); first migration applied; **isolation proven** (BBL DB byte-identical). No cross-product FK. | 🟢 (SESSION_0459) |
| MB-DATA-002 | As a coordinator, I want the app to read/write its **own Prisma DB** instead of localStorage so data persists across devices and users. | `lib/store.ts` localStorage hooks replaced by a Prisma data layer + server actions; pipeline/forms/photos verified against `mammoth_dev`. | 🟢 (SESSION_0460) |
| MB-DATA-003 | As a user, I want my **own Mammoth login** (separate from BBL) so identity is per-product. | Better Auth wired in the Mammoth app; own auth tables (ADR 0038 D5). | ⚪ (P2) |

## Notes

Epic 7 tracks the move onto Mammoth's **own database** (ADR 0038): MB-DATA-001 (the DB + schema) landed
SESSION_0459; **MB-DATA-002 (the app off localStorage onto `mammoth_dev` — Prisma adapter, server actions,
a DB-backed AdminKanban, guardrails preserved, one Project SoT, headless-verified) landed SESSION_0460**;
MB-DATA-003 (per-product Better Auth login) is P2. The MVP Epics 1–6 surfaces (pipeline, job-order form,
build photos) now read/write the DB, not localStorage. Remaining planned stories (⚪) are gated on the
backend phases in `docs/business/leads/project-mammoth-build-crm.md` (P2–P6).
