---
title: "Mammoth Build CRM PRD"
slug: mammoth-build-prd
type: prd
status: draft
created: 2026-06-20
updated: 2026-06-28
author: Brian + Petey
last_agent: claude-session-0459
backlinks:
  - docs/product/README.md
  - docs/business/leads/project-mammoth-build-crm.md
pairs_with:
  - docs/product/mammoth-build/STORIES.md
  - docs/business/leads/project-mammoth-build-crm.md
  - docs/business/leads/hubspot-integration-best-practices.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
  - docs/runbooks/database/per-app-db-separation.md
  - clients/mammoth-build-crm/prisma/schema.prisma
tags:
  - product
  - mammoth-build
  - prd
  - crm
---

# Mammoth Build CRM PRD

## One-line product statement

Mammoth Build CRM runs a pre-engineered-metal-building project from first inquiry to a
finished, delivered order on a single record — with before/during/after photo proof at
every step — replacing HubSpot with a leaner, fully-owned tool.

## Product identity

A purpose-built CRM for Mammoth Metal Buildings (Michael Flores, GM). It operationalizes
their brand promise — *not* "quote, ship, and disappear," but stay in the whole build —
by making the project record, the order, and the documented proof inseparable.

This replaces a friction-ridden generic HubSpot instance. The HubSpot best-practices
reference (`docs/business/leads/hubspot-integration-best-practices.md`) is the feature-parity
spec for what we rebuild leaner.

## Audience

Primary users:

- **Sales / GM (Michael)** — sees the whole pipeline, what's at risk, what's a real order.
- **Project coordinators** — move a job through stages, keep the next step owned.
- **Field crew** — capture before/during/after build photos from a phone.

Secondary users:

- **Clients** — submit an inquiry; later, receive shareable before/after proof of their build.
- **Office/admin** — invoicing and order records (later phases).

## Core problem

Most metal-building sellers quote, ship, and disappear; quotes sit un-actioned, projects
get silently dropped, and there's no living proof of the work. A generic HubSpot setup
adds re-keying friction and recurring cost without solving the proof story.

Mammoth needs: (1) every accepted quote becomes an **actual order**, and (2) a project can
**never be silently dropped** — with photographic proof tying the record to the real build.

## Goals

1. Run one record from **Lead → Qualified → Quote → Contract → Deposit → Engineering → Fabrication → Delivery → Complete**.
2. Guarantee an accepted quote becomes a **confirmed order** (order number stamped; cannot Complete otherwise).
3. Make dropping a project **impossible** — every open project carries an owned next step or is flagged at risk; closing Lost requires a reason.
4. Capture **before/during/after photos** per project as first-class proof.
5. Replace HubSpot at materially lower, fully-owned cost.

## Scope

### MVP (shipped — frontend only, localStorage)

- Landing/marketing page (dark + orange; mirror hero; save-interest; inquiry draft).
- Pipeline board (lead → order; confirmed-order + at-risk counts).
- Job order form (start of job → creates a project).
- Project detail + **build documentation** (before/during/after photos).
- Order-confirmation gate + can't-drop guardrail.
- App: `clients/mammoth-build-crm/`. Static mockup: `files/mockup.html`.

### Phase 1 — own database scaffolded (SESSION_0459, local-first)

Per [ADR 0038](../../architecture/decisions/0038-per-product-database-separation.md), Mammoth has its
**own database** (`mammoth_dev`), its own `prisma/` schema, `prisma.config.ts`, and migrations —
isolated from BBL (proven: a Mammoth migration leaves BBL's DB byte-identical). The app is **not yet
wired** to it (still localStorage); Phase 2 connects them.

### Next phases (see roadmap in the project doc)

- **P2** wire the app off localStorage **onto its own Prisma DB** + auth · P3 S3 photo storage + public
  before/after proof links · P4 automation (rotting/at-risk, quote→order, reminders) · P5 Stripe
  payments (deposit + milestone) · P6 marketing site + lifecycle email.

## Data architecture

Mammoth owns its data end-to-end — no shared database with BBL or any other product (ADR 0038 D1).

- **Schema:** [`clients/mammoth-build-crm/prisma/schema.prisma`](../../../clients/mammoth-build-crm/prisma/schema.prisma)
  — the HubSpot-replacement CRM core, translated from the
  [Flores intake brief](../../business/leads/mammoth-build-michael-flores.md) and the
  [HubSpot-replacement epic](../../epics/mammoth-rebuild-crm-001.md):
  **Contact · Company · Project (the PEMB Deal) · Activity · Quote · LineItem · Product · Invoice ·
  BuildPhoto · TeamMember** (+ pipeline/source/lifecycle/quote/invoice enums).
- **HubSpot object → model:** Contacts→Contact, Companies→Company, Deals→Project, Tasks/Activities→
  Activity, Quotes→Quote, Line Items→LineItem, Products→Product, Invoices→Invoice, Owners→TeamMember.
- **PEMB custom properties** (§5 of the brief) are columns where the pipeline gates/filters
  (`peStampState`, `governingCode`, loads, geometry); the long-tail engineering envelope is a Json bag.
- **Identity** is Mammoth's own (Better Auth per app, Phase 2) — no shared `User` with BBL (ADR 0038 D5).
- **No cross-product foreign keys.** Any future cross-product data crosses an API/contract, not a FK.

## Non-goals

- Performing engineering / PE-stamp services (Mammoth's domain; we model them, not perform them).
- Replacing Stripe (we use it directly).
- A generic multi-tenant CRM — this is Mammoth-specific first.

## Key flows

1. **Inquiry → Lead:** visitor submits the landing inquiry → lands as a Lead with a first-touch next step.
2. **Quote → Order:** quote accepted → project advances to the order stage, stamps an order number, becomes a confirmed order.
3. **Build → Proof:** crew uploads before/during/after photos against the project as it moves through fabrication and delivery.
4. **Drop-proofing:** any open project without a next step is flagged at risk; Lost requires a reason.

## Success metrics

- 100% of accepted quotes convert to a confirmed order (zero "accepted but no order").
- Zero open projects with no owned next step.
- Every delivered project has before + after photos on record.
- HubSpot retired; recurring cost reduced.

## Supporting docs

- Decision + architecture + roadmap: `docs/business/leads/project-mammoth-build-crm.md`
- HubSpot feature-parity reference: `docs/business/leads/hubspot-integration-best-practices.md`
- Engagement brief + friction audit: `docs/business/leads/mammoth-build-michael-flores.md`
- Stories: `docs/product/mammoth-build/STORIES.md`
