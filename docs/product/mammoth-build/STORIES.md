---
title: "Mammoth Build CRM Stories"
slug: mammoth-build-stories
type: stories
status: draft
created: 2026-06-20
updated: 2026-07-19
author: Brian + Petey
last_agent: claude-session-0573
backlinks:
  - docs/product/README.md
  - docs/product/mammoth-build/PRD.md
pairs_with:
  - docs/product/mammoth-build/PRD.md
  - docs/business/leads/project-mammoth-build-crm.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
  - docs/product/mammoth-build/CONTEXT.md
tags:
  - product
  - mammoth-build
  - stories
  - backlog
  - crm
---

# Mammoth Build CRM Stories

## Story map

Mammoth Build carries a relationship through this chain — with a Next Action, education, and proof
captured along the way:

```txt
Prospect -> Lead -> Opportunity -> Confirmed Order -> Engineering -> Fabrication -> Delivery
                                                                       |-> Mammoth-Installed --|
                                                                       |-> Customer-Installed -|-> Satisfied Installation -> Successful Close
                                  \-> Activities + Next Actions + Proof + Stage-Specific Enablement -------------------------->/
```

Story IDs use the `MB-` prefix. Status: 🟢 in MVP · ⚪ planned.

## Epic 1 — Landing & Inquiry

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-LAND-001 | As a visitor, I want a clear landing page so I trust Mammoth and understand both supported installation paths. | Leads with **“Built all the way through.”** Explains delivery + satisfied Mammoth-Installed or Customer-Installed outcomes; “we don't quote, ship, and disappear” remains supporting proof. | ⚪ copy delta (surface exists) |
| MB-LAND-002 | As a visitor, I want to save building types I'm interested in so my inquiry is pre-filled. | Saved types persist (localStorage) and pre-fill the inquiry's building-type field. | 🟢 |
| MB-LAND-003 | As a visitor, I want my inquiry draft kept if I leave so I don't retype it. | Draft auto-saves and rehydrates; on submit it's stored and the form clears with a "saved locally" note. | 🟢 |
| MB-LAND-004 | As a client, I want my inquiry to become a CRM lead so Mammoth follows up. | Submitted inquiry creates a Lead with a first-touch next step. | ⚪ (needs backend) |

## Epic 2 — Pipeline (Lead → Order)

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-PIPE-001 | As the GM, I want a board of projects by stage so I see the whole pipeline at a glance. | Board shows the 9 PEMB stages with per-stage counts and project cards. | 🟢 |
| MB-PIPE-002 | As a coordinator, I want to advance a project to the next stage so progress is tracked. | Advance moves to the next stage; stage gate/criterion is shown. | 🟢 |
| MB-PIPE-003 | As the GM, I want confirmed-order and at-risk counts so I know what's real and what's slipping. | Summary shows project count, confirmed orders, and at-risk count. | 🟢 |
| MB-PIPE-004 | As the GM, I want a lead roster beside the project board so I can work outreach without overloading the fulfillment pipeline. | Roster shows source, owner, lifecycle/status, last touch, Attempt 1/2/3, Next Action, and due date; accepted Lead can open or join an Opportunity. | ⚪ |

## Epic 3 — Job Order

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-ORDER-001 | As a coordinator, I want a job order form so the start of a job creates a project. | Form captures contact, building type, use, region, dimensions, notes; creates a project at Lead. | 🟢 |
| MB-ORDER-002 | As an engineer, I want PEMB fields on the record so the project brief lives in the CRM. | Dimensions (W×L×eave) captured; loads/PE-stamp fields modeled. | 🟢 (dimensions) / ⚪ (full loads) |

## Epic 4 — Build Documentation (the differentiator)

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-PHOTO-001 | As an installer or customer-installer, I want to upload before/during/after photos so either installation path is proven. | Photos grouped by phase, captured from a phone, tagged with stage + Installation Path, and visible to the appropriate roles. | 🟢 base / ⚪ path metadata |
| MB-PHOTO-002 | As the GM, I want photos tied to the project record so proof and project are inseparable. | Photos persist on the project; thumbnails shown in the grouped view. | 🟢 (local thumbnails) |
| MB-PHOTO-003 | As a client, I want a shareable proof link so I can see delivery, installation, and the satisfied outcome. | Secure proof view renders appropriate before/during/after evidence for either Installation Path. | ⚪ (needs S3 + backend) |

## Epic 5 — Guardrails (the two must-haves)

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-GUARD-001 | As the GM, I want an accepted quote to become an actual order without pretending the customer journey is complete. | Deposit stamps an order number; Successful Close remains blocked until installation-path and satisfaction gates pass. | 🟢 order gate / ⚪ close gate |
| MB-GUARD-002 | As the GM, I want relationships to never be silently dropped through installation and satisfaction. | Every live Opportunity/Project/installation concern has an owner + Next Action; Lost requires a reason; unresolved concerns create Resolution Tasks. | 🟢 sales base / ⚪ installation extension |
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

## Epic 8 — Sales Cockpit (Roster → Next Action)

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-LEAD-001 | As sales, I want a lead roster so I can work the right person next. | Table supports source, owner, lifecycle/status, last touch, Attempt 1/2/3, Next Action, due date, filters, and safe row/card drill-in. | ⚪ |
| MB-LEAD-002 | As sales ops, I want CSV/JSON import preview and dedupe so purchased or BuildingGuides prospects enter cleanly. | Upload → map → validate → dedupe → preview → explicit commit → error/rollback export; no real rows write before approval. | ⚪ |
| MB-ACT-001 | As sales, I want calls, emails, attempts, notes, tasks, and due dates on one contact workspace so context is never scattered. | `tel:` + email-composer actions; Activity timeline records disposition and attempt sequence; quick note/task leaves one owned Next Action. | ⚪ |
| MB-ACT-002 | As Michael, I want a daily work queue and calendar view so I know what to do at 8:00 AM. | Today/overdue/upcoming views sort owned Next Actions; completing one requires or suggests the next. | ⚪ |
| MB-AUTO-001 | As Michael, I want safe outreach sequences so follow-up is consistent without losing the personal relationship. | Approved templates; consent + unsubscribe rules; Attempt 1/2/3 scheduling; reply/connect/stage/manual stop rules; delivery/reply/failure telemetry; test mode and audit log. | ⚪ |
| MB-AUTO-002 | As sales, I want call transcription to suggest notes and tasks so admin work is reduced. | Provider-consented transcription produces reviewable drafts; a human approves before CRM notes/tasks are committed or messages are sent. | ⚪ |

## Epic 9 — Delivery, Installation & Satisfaction

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-INSTALL-001 | As a coordinator, I want every order to select an Installation Path before delivery so ownership is explicit. | Exactly one of Mammoth-Installed or Customer-Installed is selected; changing it records reason, owner, and affected checklist. | ⚪ |
| MB-INSTALL-002 | As Mammoth installation staff, I want a stage checklist with ownership, proof, and issue resolution so the customer finishes satisfied. | Role assignments, prerequisites, safety/sequence steps, proof, completion review, and open Resolution Tasks are visible. | ⚪ |
| MB-INSTALL-003 | As a Customer-Installed client, I want a guided readiness and installation wizard so I can build confidently. | Project-specific prerequisites, expected time, safety boundaries, current guides, acknowledgements, progress, proof, and a clear human support path. | ⚪ |
| MB-EDU-001 | As a person doing the work, I want role-specific SOPs/how-tos at the relevant stage so I receive only what I need. | Guides are brand-specific, versioned, printable, mobile-friendly, tied to stage/role/building, and show escalation contacts. | ⚪ |
| MB-EDU-002 | As Mammoth, I want guide-version acknowledgement and progress so support can see readiness without guessing. | Assigned guide version, opened/acknowledged/completed state, exceptions, and support requests are auditable. | ⚪ |
| MB-CLOSE-001 | As the GM, I want Successful Close blocked until installation and satisfaction are real. | Delivery + selected-path gates + required proof + customer satisfaction confirmation pass, or an owned Resolution Task keeps the Project open. | ⚪ |
| MB-CARE-001 | As a customer, I want any unresolved concern to stay owned so “complete” never means abandoned. | Concern records owner, Next Action, due date, communication history, resolution proof, and satisfaction re-check. | ⚪ |
| MB-PORTAL-001 | As a customer, I want one dashboard for order, blueprint, delivery, Installation Path, guides, proof, and support. | Secure project-scoped view uses Brand Heartbeat language, clear next steps, useful milestone microdelights, and no internal-only data. | ⚪ |

## Epic 10 — Brand Heartbeat & Enablement Quality

| ID | Story | Acceptance criteria | Status |
| --- | --- | --- | --- |
| MB-BRAND-001 | As a customer, I want every Mammoth surface to express one promise so the experience feels coherent and trustworthy. | Mission, **“Built all the way through”** motto, Product North Star, and two Installation Paths match PRD + ubiquitous language across landing, CRM, portal, email, and guides. | ⚪ |
| MB-BRAND-002 | As a user, I want clear, encouraging microcopy and restrained microdelights so complex work feels manageable. | Every stage explains why + next action; meaningful milestones are acknowledged; no childish gamification, vague confetti, or pressure language. | ⚪ |
| MB-BRAND-003 | As the business, I want automation to be efficient without becoming impersonal. | Automation removes repeated work, exposes status/failure/ownership, preserves personal context, and always offers a human escalation path. | ⚪ |

## Notes

Epic 7 tracks the move onto Mammoth's **own database** (ADR 0038): MB-DATA-001 (the DB + schema) landed
SESSION_0459; **MB-DATA-002 (the app off localStorage onto `mammoth_dev` — Prisma adapter, server actions,
a DB-backed AdminKanban, guardrails preserved, one Project SoT, headless-verified) landed SESSION_0460**;
MB-DATA-003 (per-product Better Auth login) is P2. The MVP Epics 1–6 surfaces (pipeline, job-order form,
build photos) now read/write the DB, not localStorage. Remaining planned stories (⚪) are gated on the
backend phases in `docs/business/leads/project-mammoth-build-crm.md` (P2–P6) and the grill decisions in
SESSION_0570. Epics 8–10 translate Michael's 2026-07-18 intake into acceptance-testable sales, installation,
enablement, and Brand Heartbeat work; they are a prioritized backlog, not authorization to connect accounts,
import real leads, or send communications.
