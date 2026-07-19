---
title: "Mammoth Build CRM PRD"
slug: mammoth-build-prd
type: prd
status: draft
created: 2026-06-20
updated: 2026-07-19
author: Brian + Petey
last_agent: claude-session-0573
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
  - docs/product/mammoth-build/CONTEXT.md
tags:
  - product
  - mammoth-build
  - prd
  - crm
---

# Mammoth Build CRM PRD

## One-line product statement

Mammoth Build CRM knows every prospect personally, makes the next action effortless, and carries every
building opportunity on one record from first inquiry through delivery and a **satisfied installation** —
whether Mammoth installs it or equips the customer to install it successfully.

## Product identity

A purpose-built CRM and enablement system for Mammoth Metal Buildings (Michael Flores, GM). It
operationalizes their brand promise — *not* "quote, ship, and disappear," but **Built all the way
through** — by making the relationship, project record, order, delivery, installation path, education,
satisfaction, and documented proof inseparable.

This replaces a friction-ridden generic HubSpot instance. The HubSpot best-practices
reference (`docs/business/leads/hubspot-integration-best-practices.md`) is the feature-parity
spec for what we rebuild leaner.

## Mission, motto, and Brand Heartbeat

### Mission statement

> Mammoth Metal Buildings helps people build with confidence — from a first shed to the facility that
> powers a million-dollar company — by knowing every customer personally and carrying every project
> through design, delivery, and a satisfied installation, whether Mammoth builds it or equips the
> customer to build it successfully.

### Brand motto

> **Built all the way through.**

Internal operating mantra: **Know the customer. Carry the build. Finish proud.**

The existing line, “We don't quote, ship, and disappear,” remains supporting differentiator copy. It
names the industry failure Mammoth rejects; the positive Mammoth promise leads.

### Product North Star

Know every prospect personally, make the next action effortless, and carry every building opportunity
through delivery and a satisfied installation without dropping the relationship.

### Brand Heartbeat (BHB)

Every Mammoth surface — sales, delivery, education, installation, support, and internal operations —
must feel:

- **Personal and proud:** know the person and why the building matters.
- **Clear and educational:** explain why, show the next step, and teach until confidence replaces uncertainty.
- **Enjoyable and cohesive:** consistent branding, purposeful microdelights, and plainspoken encouragement.
- **Efficient and automated:** remove repeated work, financial waste, and administrative friction.
- **Smooth and reliable:** visible ownership, predictable handoffs, honest status, and no silent drops.
- **Human under automation:** automate administration to create more time for relationships, never to erase them.

Canonical terms and boundaries live in [Mammoth Build Ubiquitous Language](CONTEXT.md).

## Canonical Successful Close

A **Successful Close** is not merely a signed quote, Confirmed Order, or delivery. The building is
delivered; the selected Installation Path is completed; required proof is captured; and the customer
confirms a Satisfied Installation — or an owned Resolution Task remains open.

Two paths meet the same satisfaction standard:

1. **Mammoth-Installed:** Mammoth's team completes installation, captures proof, resolves issues, and
   confirms customer satisfaction.
2. **Customer-Installed:** the client completes installation while Mammoth provides brand-specific
   readiness checks, SOPs, protocols, step-by-step guides, onboarding wizards, role how-tos, support,
   proof requirements, and satisfaction follow-through.

## Audience

Primary users:

- **Sales / GM (Michael)** — sees the whole pipeline, what's at risk, what's a real order.
- **Part-time sales / prospecting staff** — work an owned roster with clear attempts and next actions.
- **Project coordinators** — move a job through stages, keep the next step owned.
- **Mammoth installers / field crew** — execute the Mammoth-Installed path and capture proof from a phone.
- **Subcontractors** — receive only the role-specific instructions and project access they need.

Secondary users:

- **Customer-install clients** — receive readiness checks, project-specific education, guidance, and support.
- **All clients** — see order, blueprint, delivery, installation, guides, proof, and support status.
- **Office/admin** — invoicing and order records (later phases).

## Core problem

Most metal-building sellers quote, ship, and disappear; quotes sit un-actioned, projects
get silently dropped, and there's no living proof of the work. A generic HubSpot setup
adds re-keying friction and recurring cost without solving the proof story.

Mammoth needs: (1) every accepted quote becomes an **actual order**, (2) a project can **never be silently
dropped**, and (3) every delivered building reaches a **Satisfied Installation** on one of two supported
paths — with photographic and instructional proof tying the relationship to the real build.

## Goals

1. Run one record from **Lead → Qualified → Quote → Contract → Deposit → Engineering → Fabrication →
   Delivery → Installation Path → Satisfied Installation → Successful Close**.
2. Guarantee an accepted quote becomes a **confirmed order** (order number stamped; cannot Complete otherwise).
3. Make dropping a project **impossible** — every open project carries an owned next step or is flagged at risk; closing Lost requires a reason.
4. Capture **before/during/after photos** per project as first-class proof.
5. Replace HubSpot at materially lower, fully-owned cost.
6. Select and track one Installation Path before delivery: Mammoth-Installed or Customer-Installed.
7. Block Successful Close until the selected path's readiness, proof, issue-resolution, and satisfaction gates pass.
8. Serve brand-specific SOPs, protocols, wizards, guides, and role how-tos at the exact project stage where needed.
9. Preserve the customer's context and owned Next Action from Prospect through Satisfied Installation.
10. Make the product itself express the Brand Heartbeat through cohesive design, useful microdelights,
    plain language, efficient workflows, and reliable automation.

## Scope

### MVP surfaces (shipped; subsequently wired to Mammoth's own database)

- Landing/marketing page (dark + orange; mirror hero; save-interest; inquiry draft).
- Pipeline board (lead → order/delivery; confirmed-order + at-risk counts).
- Job order form (start of job → creates a project).
- Project detail + **build documentation** (before/during/after photos).
- Order-confirmation gate + can't-drop guardrail.
- App: `clients/mammoth-build-crm/`. Static mockup: `files/mockup.html`.

### Data foundation — own database + DB-backed pipeline (SESSION_0459–0460)

Per [ADR 0038](../../architecture/decisions/0038-per-product-database-separation.md), Mammoth has its
**own database** (`mammoth_dev`), its own `prisma/` schema, `prisma.config.ts`, and migrations —
isolated from BBL (proven: a Mammoth migration leaves BBL's DB byte-identical). SESSION_0460 wired the
pipeline and project surfaces onto Prisma/server actions; localStorage is no longer the CRM source of truth.

### Next phases (see roadmap in the project doc)

- **Sales cockpit:** lead roster, source/owner/attempts, safe CSV/JSON import, click-to-call/email,
  quick notes/tasks, activity timeline, and daily queue/calendar.
- **Safe automation:** approved sequences, stop/consent rules, success/failure telemetry, transcription,
  and human-approved action extraction.
- **Delivery + installation:** Installation Path, readiness, guides/wizards, proof, issue resolution,
  satisfaction confirmation, and customer dashboard.
- **Platform phases:** own auth · S3 photo storage + proof links · Stripe deposit/milestone payments ·
  HubSpot/QuickBooks/Calendar/Todoist adapters · production marketing and lifecycle email.

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
- **Target installation model (not yet in Prisma):** `InstallationPath` (`mammoth_installed` or
  `customer_installed`), readiness/progress, satisfaction state, completion confirmation, guide versions,
  acknowledgements, proof, and owned resolution work. Schema design follows the grill and a separate ADR check.

## Non-goals

- Performing engineering / PE-stamp services (Mammoth's domain; we model them, not perform them).
- Replacing Stripe (we use it directly).
- A generic multi-tenant CRM — this is Mammoth-specific first.
- A generic LMS or document dump — education is stage-specific enablement for a successful build.
- Autonomous outbound campaigns without consent, stop rules, test mode, audit history, and human control.
- A full subcontractor portal in the first sales-cockpit slice.

## Key flows

1. **Inquiry → Lead:** visitor submits the landing inquiry → lands as a Lead with a first-touch next step.
2. **Quote → Order:** quote accepted → project advances to the order stage, stamps an order number, becomes a confirmed order.
3. **Build → Delivery:** crew uploads before/during/after photos as the project moves through fabrication and delivery.
4. **Delivery → Installation Path:** customer selects Mammoth-Installed or Customer-Installed; the CRM
   serves the corresponding ownership, readiness, proof, education, support, and issue-resolution flow.
5. **Installation → Satisfaction:** completion remains blocked until satisfaction is confirmed or an owned
   Resolution Task keeps the concern open.
6. **Drop-proofing:** any open Opportunity or Project without a Next Action is flagged at risk; Lost requires a reason.

## Success metrics

- 100% of accepted quotes convert to a confirmed order (zero "accepted but no order").
- Zero open projects with no owned next step.
- Every delivered project has before + after photos on record.
- 100% of delivered projects have an explicitly selected Installation Path.
- 100% of Customer-Installed projects receive the required current guide/checklist before installation.
- 100% of successfully closed projects have satisfaction confirmation and required proof.
- Zero open installation concerns without an owner and Next Action.
- Reduced time spent re-keying, searching for context, and deciding what to do next.
- HubSpot retired; recurring cost reduced.

## Supporting docs

- Decision + architecture + roadmap: `docs/business/leads/project-mammoth-build-crm.md`
- HubSpot feature-parity reference: `docs/business/leads/hubspot-integration-best-practices.md`
- Engagement brief + friction audit: `docs/business/leads/mammoth-build-michael-flores.md`
- Stories: `docs/product/mammoth-build/STORIES.md`
