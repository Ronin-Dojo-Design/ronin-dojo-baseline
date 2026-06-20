---
title: HubSpot Integration, Setup & Best Practices — Mammoth Metal Buildings
slug: hubspot-integration-best-practices
type: guide
status: active
created: 2026-06-20
last_agent: petey
client:
  company: Mammoth Metal Buildings
  site: https://mammoth.build
  contact: Michael Flores
  role: General Manager
engagement: HubSpot Commerce Hub — lead-to-order revenue operations (retrofit)
backlinks:
  - docs/business/leads/mammoth-build-michael-flores.md
  - docs/business/README.md
---

# HubSpot Integration, Setup & Best Practices — Mammoth Metal Buildings

> Companion to the intake brief
> ([`mammoth-build-michael-flores.md`](./mammoth-build-michael-flores.md)). The brief says
> **what** and **why** (the seven friction zones, the two hard requirements). This guide is
> the **HOW** — config-level, current to the 2025–2026 HubSpot Commerce/Sales **Professional**
> feature set. It assumes the established situation: Mammoth is **already on HubSpot**,
> **Stripe is connected through HubSpot**, and this is a **retrofit/clean-up**, not a net-new
> build. Friction-zone numbers (F1–F7) below map 1:1 to §3a of the brief.

> **Tier note carried from the brief (§7.1):** milestone invoicing, quote e-signature, CPQ,
> and quote-to-cash workflows require **Commerce/Sales Professional** (some approval-routing
> features are Enterprise). Confirm the exact tier on the live instance before building.

> **One caveat to call out up front (verified 2026-06):** HubSpot does **not** yet natively
> trigger an invoice on "project milestone reached." Native completion/milestone-triggered
> billing is on HubSpot's roadmap for **late Q3/Q4 2026**. Until then, milestone invoicing for
> Mammoth is built the way §5 below describes — **stage-change workflows + the "Convert to
> Invoice" action + scheduled invoices** — not a built-in milestone toggle. Design around this,
> don't wait for it.

---

## 0. The spine: one deal, artifacts attached

Everything below hangs off a single principle from the brief: **collapse lead-to-order onto
one Deal record**, with the quote → contract → invoice(s) → payment → order all *associated
to that deal*, gated by stage, driven by workflows. The retrofit job is to stop re-keying,
stop lost quotes, and close the "sold vs. in-fabrication" gap. Object map:

```
Contact (+ Lead)  ──associated──►  DEAL (the project, single source of truth)
                                     │
                                     ├─ Line items  ◄─ built from the Product Library (CPQ)
                                     ├─ Quote        ─ e-sign / accept ─►  Contract (auto)
                                     ├─ Invoice(s)   ─ deposit → engineering → fab → delivery → final
                                     ├─ Payment(s)   ◄─ Stripe (links on quote/invoice)
                                     ├─ Subscription ─ only if recurring (rare for PEMB)
                                     └─ Ticket/Project ─ the ORDER / fabrication record
```

---

## 1. Integration & object setup (HubSpot ↔ Stripe; how the objects relate)

### 1.1 Stripe connection model — pick the right one
HubSpot offers **two** ways to wire Stripe. Mammoth wants the first:

- **Stripe *payment processing* (Commerce Hub model) — USE THIS.** HubSpot CRM is the source
  of truth; Stripe is purely the payment gateway. Quotes, invoices, payment links, and
  subscriptions are **HubSpot objects**, and Stripe just clears the card/ACH. Keeps your
  existing Stripe processing rates **plus a 0.75% HubSpot platform fee**. This is what makes
  the deal record the single source of truth.
- **Stripe *data sync* (connector) — NOT this.** Pulls Stripe's own customer/invoice objects
  into HubSpot for context but leaves Stripe as billing system-of-record. That re-introduces
  the two-system friction we're removing.
- **Config path:** `Commerce → Payments → Set up payments → Stripe`, authenticate through the
  Stripe redirect (2FA). If they're on the **legacy Stripe-for-quotes** integration, migrate
  to Stripe payment processing (HubSpot has a documented migration path) — the legacy quote
  integration is not the Commerce Hub model.
- **[CONFIRM on instance]** Which connection they have today. A retrofit that's secretly on
  data-sync explains a lot of the "quote ≠ order" friction (F4).

### 1.2 Core objects and how they relate (the retrofit must make these explicit)
| Object | Role for Mammoth | Key relationship |
|---|---|---|
| **Contact** | The buyer/decision-maker | Dedup key = email; associate to Deal + Company |
| **Lead** (object) | Pre-deal qualification record | Created from form; converts → Deal at qualification |
| **Company** | The buying org (if commercial) | Dedup key = domain; associate to Deal |
| **Deal** | **The project** — single source of truth | Parent of quotes/invoices/payments/order |
| **Product** (library) | Reusable building systems/components | Pulled into Deal as **line items** |
| **Quote** | The priced offer + terms + e-sign | Built from line items; accepted → Contract |
| **Contract** | Signed quote = the agreement | Auto-created when quote accepted (setting on) |
| **Invoice** | A billable milestone | Generated via "Convert to Invoice"; paid via Stripe |
| **Payment** | A Stripe transaction | Links a paid invoice/quote back to the deal |
| **Subscription** | Recurring billing (rare here) | Only for service/retainer lines, not the building |

### 1.3 Setup hygiene before any automation
- Turn on the **invoicing tool** and a default **invoice template** (`Commerce → Invoices`),
  set company billing details, tax, and invoice numbering.
- Build/clean the **Product Library** first (§3) — workflows that "Convert to Invoice" only
  produce clean invoices if line items are clean.
- Decide **fulfillment system of record** (open decision §7.4 in brief): if "Order" lives in
  HubSpot, use a **Tickets pipeline** (or Projects) as the order/fabrication record; if it
  lives in an ERP, plan the sync. Build the rest assuming HubSpot Tickets until told otherwise.

---

## 2. Deal pipeline + stage-gate best practices (F2: ungated pipeline)

Use the PEMB pipeline from the brief §4. The retrofit value is **exit gates** — deals move on
*buyer actions*, not rep opinion. Name each stage after something that has happened.

### 2.1 Stages, required properties, and exit criteria
Configure **conditional stage properties** (`Settings → Objects → Deals → Pipelines → [stage] →
Set required properties`) — Starter+ lets you require fields *before a deal can enter a stage*.

| # | Stage | Required-to-ENTER (gate) | Exit criterion (what must be true to leave) |
|---|---|---|---|
| 1 | **New Lead** | Source, Deal Owner | Contact + source captured; owner assigned |
| 2 | **Qualified / Discovery** | Building use, Region, Rough dimensions | Use/region/size on record |
| 3 | **Design & Quote (CPQ)** | Geometry (W×L×eave), Loads (snow/wind/seismic), PE-stamp state | **An associated Quote exists** |
| 4 | **Contract / Signature** | (quote sent) | **E-signed/accepted quote on file** (= contract) |
| 5 | **Deposit Invoiced** | Deposit % | **Deposit invoice created & sent (Stripe link)** |
| 6 | **Engineering Released** | PE-stamp obtained (bool) | PE stamp on record for the erection state |
| 7 | **Fabrication / Production** | Fab start date | Fabrication-milestone invoice issued |
| 8 | **Delivery & Erection** | Delivery date | Delivery-milestone invoice issued |
| 9 | **Closed-Won / Order Complete** | Order Confirmed = true, Final invoice | Fulfillment handoff done; record retained |

Mirror stage: **Closed-Lost / Nurture** — requires a **Closed-Lost Reason** (§6).

### 2.2 Stage-gate rules of thumb
- **Don't over-stage.** Each stage must represent a distinct buyer action you can verify.
- The **biggest gate is between 3→4 and 8→9**: "can't leave Design & Quote without an attached
  quote," and "can't reach Closed-Won without `Order Confirmed = true`." That last one is the
  hard requirement (F4) — an accepted quote alone must **not** be allowed to mark the deal Won.
- Keep a custom prop **`Order Confirmed`** (boolean) and **`Order Number`** (text) on the deal;
  the §4 workflow sets these. Closed-Won's required-property gate keys off `Order Confirmed`.

---

## 3. CPQ / product library / quote templates / e-signature (F3: quote sprawl)

HubSpot **CPQ** (relaunched at INBOUND 2025, on Commerce Hub **Professional/Enterprise**) is
built on the **Product Library + discount rules + quote templates + approval workflows +
integrated payments**. This is the fix for free-form, inconsistent quotes.

### 3.1 Product Library — model the building, not just SKUs
- Create products for reusable **building systems/components**: primary frame, secondary
  (purlins/girts), roof/wall panel systems, insulation packages, trim, accessories
  (doors/windows/skylights), freight, erection, engineering/PE-stamp fee.
- Use **product properties / variants** for the dimensions that move price (gauge, span, finish).
- Keep pricing in the library so quotes are assembled, not hand-typed. This is what kills F3.

### 3.2 Quote templates (drag-and-drop, 2025 builder)
- Build **one or two standard PEMB templates** with pre-filled modules: cover letter, line
  items, **terms (incl. payment-milestone schedule)**, payment options, and **acceptance method**.
- Standardize terms so every quote carries the same milestone language (deposit → engineering →
  fabrication → delivery → final). This makes §5 invoicing predictable.
- **Breeze AI** can draft quotes from deal + line-item data; treat AI output as a starting
  draft, not the send.

### 3.3 E-signature = the contract gate (F4 setup, fires in §4)
- Enable **e-signatures on quotes** (`Settings → Objects → Quotes`; e-sign is ~$25/user/mo add-on
  on Pro). Add **billing/payment** to the quote so the buyer can sign **and** pay in one flow.
- Turn ON **"Automatically create contracts from accepted quotes."** When the buyer accepts/signs,
  HubSpot auto-creates a **Contract** record associated to the quote, deal, contact, and company.
  The signed quote *is* the contract (pending open decision §7.3 on whether a separate MSA is
  needed).
- **Approval routing** (Enterprise): if discounts beyond a threshold need GM sign-off, configure
  sequential approval chains so a rep can't send an underpriced quote.

---

## 4. Quote → an ACTUAL ORDER (the must-have, F4)

This is the hard requirement: an accepted quote must become a **committed order** that triggers
billing and fabrication — never a quote left sitting. Build it as a **quote-based workflow** plus
a **deal gate**.

### 4.1 The trigger
HubSpot exposes **quote-status workflow triggers**: created, sent, viewed, **signed/accepted**,
approved, paid. Enroll on **quote status = accepted/signed** (i.e., e-signature complete).

### 4.2 The workflow (config, step by step)
Create a **quote-based workflow**, enrollment trigger = *quote is signed/accepted*:

1. **Set deal stage → "Order Confirmed"** (between Contract and Deposit Invoiced, or fold into
   the Deposit-Invoiced gate). Set deal property **`Order Confirmed = true`** and stamp an
   **`Order Number`** (use a calculated/sequential value).
2. **Convert to Invoice** (HubSpot's native workflow action — free on all plans): generate the
   **deposit invoice** from the quote's line items (or a deposit-only line item). All pricing
   and terms carry over. Send it with a **Stripe payment link**.
3. **Create a Ticket/Project = the ORDER / fabrication record**, associated to the deal, assigned
   to the fabrication owner. This is the fulfillment object — the order as a *system event*, not
   a sticky note.
4. **Create a task** "Kick off engineering / confirm fab slot," due in N days, owner = fab owner.
5. **(Optional) Notify** ops/finance in Slack/email; the signed quote simultaneously bills,
   orders, and tasks — eliminating the sales→finance→ops handoff.
6. **Schedule the downstream milestone invoices** (§5) — either branch here or let stage-change
   workflows handle each milestone as the deal advances.

### 4.3 The gate that makes it real
- **Closed-Won requires `Order Confirmed = true`** (§2.1). An accepted quote advances the deal
  and creates the order/deposit, but the deal **cannot be marked Won** until the order is
  confirmed and the deposit invoice exists. *Accepted quote alone ≠ Won.* This is the structural
  guarantee the brief demands.

---

## 5. Milestone invoicing & Stripe payments (F5: manual invoicing)

PEMB cash flow is milestone-based: **deposit → engineering → fabrication → delivery → final.**
HubSpot collects one-time, deposit, partial, and recurring payments via Stripe links on
invoices/quotes/payment links.

### 5.1 How to build milestone billing TODAY (the workaround)
Because native completion-triggered billing isn't shipping until late 2026, drive each milestone
off a **deal-stage-change workflow**:

| Milestone | Trigger | Action |
|---|---|---|
| **Deposit** | Quote accepted (§4) | Convert to Invoice (deposit %), Stripe link |
| **Engineering** | Deal enters *Engineering Released* | Convert to Invoice (engineering milestone), send link |
| **Fabrication** | Deal enters *Fabrication / Production* | Convert to Invoice (fab milestone), send link |
| **Delivery** | Deal enters *Delivery & Erection* | Convert to Invoice (delivery milestone), send link |
| **Final** | Deal enters *Order Complete* / balance due | Convert to Invoice (remaining balance), send link |

- Model each milestone as a **line item** (or a % of contract) so each invoice pulls the right
  amount. Alternatively spell milestones in the quote's payment schedule and convert per stage.
- **Future-dated billing** is supported — you can set a recurring line item's billing start date
  in the future for any confirmed future charges.
- **Subscriptions** only for genuinely recurring lines (e.g., a maintenance retainer) — the
  building itself is milestone, not subscription.

### 5.2 Stripe payment best practices
- Put a **Stripe payment link on every invoice and on the quote** so buyers pay in-flow.
- Track **`Deposit %`**, **`Milestone split`**, and **refund policy** as deal props (open
  decision §7.2) so workflows compute amounts consistently.
- Build **AR-aging** reporting on unpaid invoices (§8). Payment status flows back to the deal
  via the Payment object, so "paid vs. outstanding" is visible on the record.

---

## 6. "Make dropping impossible" guardrails (F6 + the §3a.2 must-have)

Layer these so a project physically cannot go quiet unnoticed.

### 6.1 No naked deals — every open deal carries a next-step task
- Workflow: enrollment = *deal is open* **AND** *deal has no open task*; action = **create a task**
  ("Set next step") for the deal owner. Re-enroll so it regenerates if the task is closed without a
  new one. Result: an active deal **always** has an owned next action.

### 6.2 Deal-rotting / inactivity detection
- **Use the right filter.** Enroll on **`Days since last activity` is *more than* X** (per-stage
  SLA), **not** "has not been updated" (which schedules into the future and misbehaves). Track a
  custom **`Last stage change date`** too.
- **Exclude deals with a scheduled next activity** (meeting/task) so owners aren't pinged on deals
  that already have momentum.
- On trip: set **`At Risk = true`**, create an **escalation task** to the owner; if still idle past
  a second threshold, **escalate to the manager** (GM/Michael).

### 6.3 Owner rotation / SLA on intake
- **First-touch SLA:** new-lead workflow auto-assigns an owner and creates a **first-contact task**
  due within the SLA window (e.g., 1 business hour). No lead sits cold — directly embodies the
  anti-"quote, ship, disappear" promise.

### 6.4 Required reason on close (kills silent drops)
- Make **`Closed-Lost Reason`** a **required property to enter Closed-Lost** (conditional stage
  property). A deal cannot be dropped without a coded reason — no quiet disappearances, and the
  reasons feed a loss-analysis report.

### 6.5 Deals-at-risk dashboard
- A saved view / dashboard filtered on **`At Risk = true`** OR **`Days since last activity > SLA`**,
  so Michael sees everything going quiet **in one glance** (see §8).

---

## 7. Data hygiene (F1 + F7)

### 7.1 Deduplication
- HubSpot auto-dedupes **contacts by email** and **companies by domain**. Enforce **domain-based**
  company matching (not name), and run HubSpot's **duplicate management tool** periodically; for
  bulk/fuzzy cleanup an app like **Insycle/Dedupely** handles variants HubSpot's exact-match won't.
- **Require reps to search before creating** a record; enforce duplicate checks on import.

### 7.2 Required fields on lead-intake forms (F1)
- Map every web-form field to a **required deal/contact property**: name, email, **building use,
  region, rough dimensions, source**. Don't let a form create a half-populated contact.
- Use **conditional property logic by lifecycle stage** (Starter+) to require the deeper
  engineering fields (loads, geometry, PE-stamp state) only when the record reaches Discovery/Quote.

### 7.3 Lifecycle stages & lead status (keep them distinct)
- **Lifecycle Stage** = funnel position (Lead → MQL → SQL → Opportunity → Customer). Let
  **automation** set it (e.g., deal created → Opportunity; Closed-Won → Customer) — don't hand-edit.
- **Lead Status** = sub-state within qualification (New, Attempting, Connected, Qualified,
  Unqualified). Keep it for SDR activity tracking; reserve Lifecycle Stage for SQL/opportunity
  handoff reporting. Don't overload one field with both jobs.

---

## 8. Reporting & dashboards to build (F7)

Build these as saved dashboards so status lives on data, not in email:

1. **Pipeline value by stage** — total $ and deal count per PEMB stage.
2. **Win rate by building type** — segment by `Building use` (warehouse / garage / commercial / ag).
3. **Time-in-stage / sales-cycle length** — surfaces where deals stall (feeds SLA tuning).
4. **Deals-at-risk** (§6.5) — `At Risk = true` or idle past SLA; Michael's daily glance.
5. **AR aging** — outstanding invoices by age (0–30 / 31–60 / 61–90+), by milestone.
6. **Order/fulfillment board** — Tickets/Projects pipeline = orders in fabrication → delivery.
7. **Closed-Lost reasons** — loss analysis from the required reason code (§6.4).
8. **Quote-to-order conversion** — % of accepted quotes that reached `Order Confirmed = true`
   (proves the F4 mechanism is actually firing).

---

## 9. First-2-weeks implementation checklist

**Week 1 — foundation & gates**
- [ ] Confirm tier (Professional+) and Stripe connection type (**payment processing**, not data sync); migrate off legacy Stripe-for-quotes if needed.
- [ ] Audit the live instance against F1–F7; screenshot current pipeline, a real deal, a real quote, a real invoice.
- [ ] Run a **dedup pass** (contacts by email, companies by domain); enable duplicate management.
- [ ] Build/clean the **Product Library** (building systems, accessories, freight, erection, engineering fee).
- [ ] Add **PEMB custom properties** (use, region, loads, geometry, PE-stamp state, `Deposit %`, `Order Confirmed`, `Order Number`, `At Risk`, `Closed-Lost Reason`, `Last stage change date`).
- [ ] Rebuild the **deal pipeline** to the 9 PEMB stages with **conditional required properties** per §2.1.

**Week 2 — automation & guardrails**
- [ ] Build the **1–2 standard quote templates** (milestone payment terms baked in); enable **e-signature** + **"auto-create contracts from accepted quotes."**
- [ ] Build the **quote-accepted → ORDER workflow** (§4): set Order Confirmed, Convert to Invoice (deposit + Stripe link), create order ticket, create fab task.
- [ ] Gate **Closed-Won on `Order Confirmed = true`.**
- [ ] Build the **milestone-invoice stage workflows** (engineering / fabrication / delivery / final) per §5.
- [ ] Build the **guardrails** (§6): no-naked-deals task, rotting/at-risk detection, first-touch SLA, required Closed-Lost reason.
- [ ] Update **intake forms**: required fields mapped to properties; conditional engineering fields by stage.
- [ ] Build the **8 dashboards** (§8), especially **Deals-at-risk** and **Quote-to-order conversion**.
- [ ] Dry-run one full deal end-to-end (lead → quote → sign → deposit → order ticket → milestone invoices → Closed-Won) before go-live.

---

## Open decisions carried from the brief (don't lock here)
- **§7.3 Quote = contract?** Is the e-signed quote legally sufficient, or is a separate MSA/DocuSign needed? Affects Stage 4 and the auto-contract setting.
- **§7.4 Fulfillment system of record:** HubSpot Tickets/Projects vs. external ERP. This guide assumes HubSpot Tickets until told otherwise.
- **§7.2 Stripe terms:** deposit %, milestone split, refund policy — needed before milestone workflows compute amounts.
- **§7.1 Tier:** confirm Professional (CPQ/e-sign/quote-to-cash); some approval routing is Enterprise.

## Sources
- HubSpot Stripe / Commerce Hub payment processing model (CRM as source of truth; 0.75% platform fee; data-sync vs. payment-processing): [Stacksync](https://www.stacksync.com/blog/hubspot-stripe-data-synchronization-technical-architecture-business-impact-assessment), [TRooInbound](https://www.trooinbound.com/blog/hubspot-stripe-integration-step-by-step-guide/), HubSpot KB ([migrating from legacy Stripe quotes integration](https://knowledge.hubspot.com/payments/migrating-from-the-legacy-stripe-integration-for-quotes-to-stripe-payment-processing))
- Quote-based workflow triggers + "Convert to Invoice" action (signed/accepted → invoice; free on all plans): [VantagePoint — quote-based triggers](https://vantagepoint.io/blog/hs/hubspot-quote-based-workflow-triggers), [VantagePoint — workflow-based invoicing](https://vantagepoint.io/blog/hs/automate-invoice-creation-hubspot-workflow-based-invoicing), [HubSpot Community](https://community.hubspot.com/t5/Tips-Tricks-Best-Practices/How-can-I-automate-an-invoice-when-a-quote-is-signed/m-p/1229355)
- E-signature + auto-create contracts from accepted quotes: HubSpot KB ([use e-signatures with quotes](https://knowledge.hubspot.com/quotes/use-e-signatures-with-quotes), [create contracts](https://knowledge.hubspot.com/quotes/create-contracts))
- Deal stage exit criteria + conditional/required stage properties: [SmartBug Media](https://www.smartbugmedia.com/blog/mastering-hubspot-deal-stages-best-practices-for-an-effective-sales-pipeline), [Pixcell (2025 guide)](https://www.pixcell.io/blog/hubspot-deal-pipeline), [Prospeo — exit criteria framework](https://prospeo.io/s/crm-deal-stages)
- HubSpot CPQ 2025 (Product Library, drag-drop templates, Breeze AI, approval routing; Commerce Pro/Enterprise): [Frame of Work — INBOUND 2025](https://www.frameofwork.com/blog/inbound-updates), HubSpot KB ([getting started with CPQ](https://knowledge.hubspot.com/cpq/getting-started-with-hubspot-cpq)), [HubSpot CPQ product page](https://www.hubspot.com/products/revenue/cpq)
- Milestone / deposit / partial / recurring payments + future-dated billing; native milestone-trigger on roadmap late 2026: [HubSpot Payments product page](https://www.hubspot.com/products/revenue/payments), [HubSpot Community — payment schedules/milestones](https://community.hubspot.com/t5/Sales-Hub-Tools/Payment-Schedules-or-milestone-payments/m-p/1259691), HubSpot KB ([schedule future recurring payments](https://knowledge.hubspot.com/payments/schedule-recurring-payments-to-start-in-the-future))
- Deal-rotting / inactivity workflows ("days since last activity is more than X"; exclude scheduled next activity): [HubSpot Community — automatic task for idle deals](https://community.hubspot.com/t5/CRM/Automatic-task-for-idle-deals/m-p/883104), [Engaging Partners](https://www.engagingpartners.co/blog/when-deal-based-workflows-stop-working-in-hubspot)
- Deduplication, lifecycle stage vs. lead status, conditional required fields: HubSpot KB ([deduplication](https://knowledge.hubspot.com/crm-setup/deduplication-of-contacts-companies-deals-tickets)), [Insycle](https://www.insycle.com/hubspot/deduplication/), [Vaulted — lead status 2026](https://vaulted.co/blog/hubspot-lead-status)
- PEMB engagement context + the seven friction zones: [`mammoth-build-michael-flores.md`](./mammoth-build-michael-flores.md)
