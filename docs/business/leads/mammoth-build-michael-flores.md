---
title: Lead — Mammoth Metal Buildings (Michael Flores)
slug: lead-mammoth-build
type: lead
status: INTAKE_SCHEDULED
source: REFERRAL
created: 2026-06-20
last_agent: petey
client:
  company: Mammoth Metal Buildings
  site: https://mammoth.build
  contact: Michael Flores
  role: General Manager
engagement: HubSpot Commerce Hub — lead-to-order revenue operations
backlinks:
  - docs/business/calendar-of-events.md
  - docs/business/README.md
---

# Lead — Mammoth Metal Buildings · Michael Flores (GM)

> Playing **Petey** (plan, not build). This is the intake brief and engagement plan for
> Ronin Dojo Design's **first intake client conversation**. It is a plan, not a contract —
> open decisions are flagged; nothing here is locked without sign-off.

## 0. Lead record

| Field | Value |
|---|---|
| Company | Mammoth Metal Buildings — `https://mammoth.build` |
| Contact | Michael Flores, General Manager |
| Status | `INTAKE_SCHEDULED` |
| Source | Referral (confirm) |
| Engagement | HubSpot Commerce Hub **retrofit** — de-friction an existing instance: lead → deal → quote/contract → invoice → **actual order** |
| Intake meeting | **PROPOSED: Wed 2026-06-24, 10:00 AM (client tz TBC)** — see calendar |
| Owner | Brian (Ronin Dojo Design) |

> **Confirmed on follow-up (2026-06-20):** Mammoth is **already on HubSpot** and hitting
> **friction** — this is a clean-up/retrofit, not a net-new build. **Stripe is integrated
> through HubSpot** for payments. Two hard requirements: (1) the process must end in an
> **actual order**, not a quote left sitting; (2) the CRM must make **dropping a project
> impossible**. The friction audit (§3a) is now the center of gravity.

## 1. Who the client is (verified)

- Mammoth Metal Buildings sells / project-manages **pre-engineered metal buildings
  (PEMBs)** — agricultural, commercial, residential; auto-service, retail, flex space,
  offices. ([mammoth.build](https://mammoth.build))
- **Differentiator, in their own words:** most metal-building companies *"quote, ship, and
  disappear."* Mammoth stays in the project end-to-end — design → fabrication → sequenced
  delivery → construction coordination. They frame every job as carrying *"context, budget
  pressure, timelines, and people who will live or work inside the finished space."*
- **Implication for us:** their brand promise *is* lead-to-order continuity. The CRM build
  should operationalize that promise — one record per project, nothing dropped between
  inquiry and delivery. That is the spine of the plan below.

> Note: `mammoth.build` blocks automated fetches (HTTP 403). The above is from
> search-indexed content. **Live site walkthrough is an intake agenda item** — confirm
> their current forms, quote flow, and any existing HubSpot wiring on the call.

## 2. The theory of the plan (what Brian asked for)

Brian's target flow: **Lead → Deal → Contract → Invoice → converted to full Order**, run
through **HubSpot Commerce Hub** ("Commerce Pro" = Sales/Commerce **Professional** tier).

The theory in one line: **collapse the lead-to-order lifecycle onto a single revenue
object (the Deal) with its artifacts attached (quote → e-signature → invoice → payment →
order handoff), gated by stage and driven by automation — so the "merger friction"
between a lead and an order disappears.** Today that friction is re-keying data, lost
quotes, and the gap between "sold" and "in fabrication." HubSpot's **quote-to-cash** model
removes the handoffs that create it.

## 3. Current HubSpot standards vs. the upgrade (the "improve upon" ask)

"Current HubSpot standards" = a vanilla install: one generic deal pipeline, free-form
quotes, a single invoice, manual follow-up. The upgrade — what Commerce **Professional**
unlocks:

| Lifecycle stage | Vanilla HubSpot | Commerce Pro upgrade for Mammoth |
|---|---|---|
| **Lead** | Contact form → inbox | Web forms → HubSpot Contact + Lead, **source tracking + lead scoring + SLA follow-up tasks** (embodies the anti-"disappear" promise) |
| **Deal** | One generic pipeline | **PEMB-tailored pipeline** with stage exit-criteria + required properties (gate progression) |
| **Quote** | Free-form, inconsistent | **CPQ + product library** of building systems/components; **custom quote templates**; AI-assisted quoting |
| **Contract** | Separate tool / PDF | **E-signature on the quote** (25/user/mo on Pro) → signed quote *is* the contract |
| **Invoice** | One invoice, manual | **Milestone invoicing + payment links** via HubSpot Payments/Stripe (deposit → engineering → fabrication → delivery → final) |
| **Order** | Deal closed, then silence | **Closed-Won automation** → fulfillment handoff (ticket/project), retained record |
| **Reporting** | Basic | **Commerce analytics**: pipeline value, win rate by building type, time-in-stage, AR aging |

## 3a. Friction audit — where an existing HubSpot leaks (retrofit)

They're on HubSpot and feeling friction. These are the seven zones where a project/
quote-to-order business almost always leaks, each with the Commerce Pro fix. Items marked
**[CONFIRM]** need a look at their live instance on the call — don't assume.

| # | Friction zone | Symptom (the leak) | Frictionless fix |
|---|---|---|---|
| 1 | **Lead intake** | Web-form fields don't map to required props; duplicate contacts; no source/owner | Form → required props + **dedup**; auto-assign owner; **first-touch SLA task** so no lead sits cold |
| 2 | **Ungated pipeline** | Deals advance (or stall) with no criteria; "sold" deals just sit | **Stage exit-gates** with required properties — e.g. can't leave "Quote" without an attached quote, can't leave "Contract" without an e-signature |
| 3 | **Quote sprawl** | Free-form quotes, inconsistent pricing, slow turnaround | **Product library + templates + CPQ** — quotes built from reusable building systems/line items |
| 4 | **Quote ≠ order** *(the big one)* | An accepted quote does **not** become a committed order; nothing triggers fabrication or billing | **E-sign accepted → workflow** advances the deal to **Order Confirmed**, auto-creates the deposit invoice (Stripe) **and** a fabrication ticket. The order is a *system event*, not a sticky note |
| 5 | **Manual invoicing** | Invoices/payment chasing done by hand; AR slips | **Milestone invoices auto-generated** on stage change; Stripe payment links; **AR-aging** dashboard |
| 6 | **Project-drop risk** | No idle-deal detection; deals "rot" with no next step | **Deal-inactivity ("rotting") workflows** → escalation tasks; **every active deal must carry a next-step task with an owner** (see below) |
| 7 | **No single source of truth** | Status spread across email/sheets; no real reporting | Everything on the **deal record**; dashboards: pipeline value, win rate by building type, time-in-stage, **deals-at-risk** |

### 3a.1 The must-have: quote → an *actual order*

Brian's hard requirement — *"must result in an actual order, not just a quote."* Mechanism:

1. Quote is **e-signed/accepted** (Commerce Hub e-signature).
2. A **workflow fires** on acceptance →
   - deal advances to **Order Confirmed** stage,
   - **deposit invoice + Stripe payment link** auto-generated,
   - **fabrication ticket/project** created and assigned (the order's fulfillment record),
   - downstream **milestone invoices** scheduled (engineering → fabrication → delivery → final).
3. The deal cannot be marked Won until the **Order Confirmed** gate is satisfied (signed
   quote + paid/sent deposit). *Accepted quote alone ≠ Won.*

### 3a.2 The other must-have: make dropping a project *impossible*

*"The CRM should prevent dropping a project."* Guardrails, layered:

- **No naked deals** — every open deal must have an **open next-step task with an owner**;
  a workflow creates/re-creates one if it's missing.
- **Rotting detection** — if a deal sits with no activity past its stage's SLA, it auto-
  flags **At Risk** and escalates a task to the owner (then the manager).
- **Stage gates** (§3a #2) stop deals from silently skipping steps.
- **Required-on-close** — can't close-lost without a reason code (kills silent drops).
- **Deals-at-risk dashboard** so Michael can *see* anything going quiet in one glance.

## 4. Proposed PEMB deal pipeline (for the intake whiteboard)

Stages, each with an **exit gate** (required before advancing):

1. **New Lead** — contact + source captured.
2. **Qualified / Discovery** — building use, region, rough dimensions captured.
3. **Design & Quote (CPQ)** — quote built from product library; engineering inputs on record.
4. **Contract / Signature** — e-signed quote on file (= the contract gate).
5. **Deposit Invoiced** — deposit payment link sent/paid.
6. **Engineering Released** — PE stamp obtained for the stamp-state (gate before fabrication).
7. **Fabrication / Production** — fabrication-milestone invoice issued.
8. **Delivery & Erection** — sequenced delivery; delivery-milestone invoice.
9. **Closed-Won / Order Complete** — final invoice; fulfillment handoff; record retained.
   (Mirror stage: **Closed-Lost / Nurture**.)

## 5. PEMB-specific custom properties (ties CRM to the engineering reality)

Capture the inputs that make a metal-building quote real — so the deal record *is* the
project brief (their "context, budget, timeline, people"):

- **Use / occupancy** (warehouse, garage, commercial, ag).
- **Site & loads** — region; ASCE 7 snow / seismic / wind; ground snow load; wind speed.
- **Geometry** — width × length × eave height; roof pitch; bay spacing.
- **Codes & stamp** — governing local code; **PE-stamp state** (must match erection state).
- **Deflection/drift limits** chosen — frame wind drift (H/100…H/400), purlins (L/180–L/240),
  girts (L/120) — so quoting assumptions and the PE-stamp gate are tracked in-CRM.

> This is also the bridge to the design-code material Brian sent: the CRM holds the
> engineering envelope, and **Stage 6 (Engineering Released)** enforces the PE-stamp-before-
> fabrication rule as a pipeline gate, not a sticky note.

## 6. Milestone billing model (Commerce Hub invoices / subscriptions)

PEMB cash flow is milestone-based, which matches Commerce Hub natively:

- **Deposit** at contract (payment link).
- **Engineering release** on PE stamp.
- **Fabrication** at production start.
- **Delivery** on sequenced shipment.
- **Final** at completion.

Each milestone = an auto-generated invoice/payment link triggered by the deal entering the
matching stage (quote-to-cash automation). Recurring/scheduled billing via Commerce Hub
subscriptions where applicable.

## 7. Open decisions (need Michael / Brian sign-off — do not lock yet)

1. ✅ **RESOLVED — already on HubSpot (retrofit).** Engagement is de-frictioning an existing
   instance, not a net-new build. *Still confirm the exact tier on the call — milestone
   invoicing, e-signature, and quote-to-cash automation need Commerce/Sales **Professional**.*
2. ✅ **RESOLVED — Stripe via HubSpot.** Payments rail is Stripe integrated through HubSpot.
   *Still confirm: deposit %, milestone split, refund policy.*
3. **Quote = contract?** — is an e-signed quote sufficient legally, or do they need a
   separate MSA/contract doc (DocuSign)? Affects Stage 4.
4. **Fulfillment system of record** — does "Order" live in HubSpot (tickets/projects) or a
   separate ops/ERP tool we sync to?
5. **Scope of this engagement** — advisory/blueprint only, or hands-on HubSpot configuration
   + onboarding? Drives proposal size.
6. **Intake date/time + timezone** — proposed Wed 2026-06-24 10:00 AM is **unconfirmed**.

## 8. Intake call agenda (first conversation)

1. **Live screen-share of their HubSpot** — walk the seven friction zones (§3a) in *their*
   instance: current pipeline stages, a real deal, a real quote, how an invoice goes out.
2. Pin down the **quote → order gap** (§3a.1) — what happens today when a quote is accepted?
   Where do orders fall through?
3. Pin down **where projects get dropped** (§3a.2) — examples of deals that went quiet.
4. Confirm HubSpot **tier** (need Professional for the automation), and the **Stripe** deposit/
   milestone/refund terms.
5. Volume & deal shape — # leads/mo, avg deal size, sales-cycle length, who touches a deal.
6. Validate the proposed pipeline + milestone-billing model (§4–§6).
7. Resolve remaining open decisions (§7); next step: scope + proposal.

## 9. Done means

- This brief committed (✅ this file).
- Intake logged on the [calendar of events](../calendar-of-events.md) (✅).
- After the call: open decisions §7 resolved → a scoped proposal authored as the next doc.

## Sources

- [mammoth.build](https://mammoth.build) (search-indexed; live fetch blocked 403)
- HubSpot Commerce Hub / Professional tier — quotes (CPQ), e-signature, invoicing,
  payment links, subscriptions, commerce analytics, quote-to-cash automation.
  ([HubSpot Revenue/Commerce pricing](https://www.hubspot.com/pricing/revenue),
  [Commerce Hub guide](https://hubxpert.com/blog/hubspot-commerce-hub-guide))
- PEMB design-code context (MBMA, AISC 360, AISI, ASCE 7, AWS D1.1, IAS AC472) — from
  Brian's brief; drives the §5 custom properties and the §4 PE-stamp gate.
