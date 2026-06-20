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
| Engagement | HubSpot Commerce Hub setup/upgrade — lead → deal → quote/contract → invoice → order |
| Intake meeting | **PROPOSED: Wed 2026-06-24, 10:00 AM (client tz TBC)** — see calendar |
| Owner | Brian (Ronin Dojo Design) |

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

1. **Existing HubSpot tier & instance** — are they already on HubSpot? Which tier? Net-new
   build vs. retrofit changes the whole estimate. *(Confirm on intake.)*
2. **Payments rail** — HubSpot Payments (US) vs. Stripe integration; deposit %; refund policy.
3. **Quote = contract?** — is an e-signed quote sufficient legally, or do they need a
   separate MSA/contract doc (DocuSign)? Affects Stage 4.
4. **Fulfillment system of record** — does "Order" live in HubSpot (tickets/projects) or a
   separate ops/ERP tool we sync to?
5. **Scope of this engagement** — advisory/blueprint only, or hands-on HubSpot configuration
   + onboarding? Drives proposal size.
6. **Intake date/time + timezone** — proposed Wed 2026-06-24 10:00 AM is **unconfirmed**.

## 8. Intake call agenda (first conversation)

1. Their current lead → order flow, drawn on a whiteboard (find the friction).
2. Live walk of `mammoth.build` — forms, quote request, any existing automation.
3. Current tools — HubSpot? Spreadsheets? Email? Where deals/quotes/invoices live today.
4. Volume & deal shape — # leads/mo, avg deal size, sales-cycle length, who touches a deal.
5. Validate the proposed pipeline + milestone-billing model (§4–§6).
6. Resolve the open decisions (§7) we can, park the rest.
7. Next step: scope + proposal.

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
