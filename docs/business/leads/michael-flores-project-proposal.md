---
title: Project Proposal — Mammoth Metal Buildings (Michael Flores)
slug: proposal-mammoth-build
type: proposal
status: DRAFT
created: 2026-06-20
last_agent: petey
client:
  company: Mammoth Metal Buildings
  contact: Michael Flores
  role: General Manager
engagement: HubSpot Commerce Hub retrofit — frictionless lead-to-order
backlinks:
  - docs/business/leads/mammoth-build-michael-flores.md
  - docs/business/calendar-of-events.md
---

# Project Proposal — Mammoth Metal Buildings

**Prepared by:** Ronin Dojo Design · **For:** Michael Flores, GM · **Date:** 2026-06-20
**Status:** 🟡 DRAFT — pre-intake. Scope, timeline, and price firm up after the
[intake call](./mammoth-build-michael-flores.md) (proposed 2026-06-24). Numbers in
brackets are placeholders for Brian's rate card.

---

## 1. Objective

Take Mammoth's **existing HubSpot** from friction-ridden to frictionless, so every
inquiry runs cleanly **lead → deal → quote/contract → invoice → actual order** on a single
deal record — and **no project can be silently dropped.** This operationalizes Mammoth's
own brand promise: *not* "quote, ship, disappear," but stay in every project end-to-end.

Two non-negotiable outcomes (Michael's words):
1. The flow must end in an **actual order**, not a quote left sitting.
2. The CRM must make **dropping a project impossible.**

## 2. Background

Mammoth is already on HubSpot with Stripe integrated for payments, but is hitting friction
across intake, pipeline, quoting, the quote→order handoff, invoicing, and follow-through.
The friction audit lives in the engagement brief
([§3a](./mammoth-build-michael-flores.md)). This proposal scopes the fix.

## 3. Scope of work (phased)

### Phase 0 — Discovery & instance audit

- Live screen-share audit of their HubSpot against the seven friction zones.
- Confirm tier (Professional needed for automation/e-sign/milestone invoicing), Stripe
  deposit/milestone/refund terms, and the fulfillment system of record.
- **Deliverable:** friction findings + a prioritized fix list (the build backlog).

### Phase 1 — Pipeline & stage gates

- Rebuild the deal pipeline to the PEMB stages
  ([§4 of the brief](./mammoth-build-michael-flores.md)) with **exit-gate required
  properties** so deals can't skip steps or stall ungated.
- Add the PEMB custom properties (use, ASCE 7 loads, geometry, eave height, PE-stamp state,
  deflection limits) so the deal record *is* the project brief.
- **Deliverable:** configured pipeline + property schema + migration of open deals.

### Phase 2 — Quote-to-order engine *(the must-have #1)*

- Product library of building systems/components + quote templates + CPQ.
- **E-sign accepted → workflow:** advance deal to **Order Confirmed**, auto-create the
  Stripe deposit invoice **and** the fabrication ticket; schedule downstream milestone
  invoices. Deal can't be Won until the Order Confirmed gate is met.
- **Deliverable:** working quote→order automation, demoed end-to-end on a test deal.

### Phase 3 — Milestone billing (Stripe via HubSpot)

- Auto-generated milestone invoices on stage change: deposit → engineering → fabrication →
  delivery → final; Stripe payment links; AR-aging visibility.
- **Deliverable:** milestone billing live + AR-aging dashboard.

### Phase 4 — Drop-proofing guardrails *(the must-have #2)*

- **No naked deals** (every open deal carries an owner + next-step task; workflow recreates
  if missing), **deal-rotting** detection → At-Risk escalation, required-reason-on-close.
- **Deliverable:** guardrail workflows + a **Deals-at-Risk** dashboard for Michael.

### Phase 5 — Reporting & enablement

- Dashboards: pipeline value, win rate by building type, time-in-stage, AR aging, deals-at-risk.
- Team walkthrough + a short SOP/runbook so Mammoth's staff own it after handoff.
- **Deliverable:** dashboards + recorded enablement session + one-page SOP.

## 4. Out of scope (this engagement)

- New public website / `mammoth.build` rebuild (separate engagement if wanted).
- Migrating off HubSpot or replacing Stripe.
- Engineering/PE-stamp services themselves (Mammoth's domain) — we model them in CRM, we
  don't perform them.
- ERP/accounting integration beyond Stripe↔HubSpot, unless added as an option.

## 5. Assumptions & prerequisites

- HubSpot tier supports CPQ, e-signature, milestone invoicing, and workflows
  (**Commerce/Sales Professional** or above) — *confirm at intake; tier upgrade, if needed,
  is Mammoth's cost.*
- Stripe account is live and admin access is granted.
- A Mammoth point person is available for Phase 0 audit and Phase 5 enablement.

## 6. Timeline (indicative — confirm post-intake)

| Phase | Work | Est. duration |
|---|---|---|
| 0 | Discovery & audit | [~1 week] |
| 1 | Pipeline & gates | [~1 week] |
| 2 | Quote-to-order engine | [~1–2 weeks] |
| 3 | Milestone billing | [~1 week] |
| 4 | Drop-proofing guardrails | [~1 week] |
| 5 | Reporting & enablement | [~1 week] |

Phases 1–4 can overlap; total **~[5–7 weeks]** depending on instance complexity and deal volume.

## 7. Investment (placeholder — Brian's rate card)

- **Option A — Fixed-fee project:** `$[TBD]` for Phases 0–5 as scoped.
- **Option B — Phased:** pay per phase; Phase 0 audit `$[TBD]` is creditable toward the build.
- **Option C — Retainer (ongoing optimization):** `$[TBD]/mo` after go-live.
- *Stripe/HubSpot platform and transaction fees are Mammoth's, billed by those vendors.*

## 8. Success metrics

- 100% of accepted quotes auto-convert to an **Order Confirmed** deal with a deposit invoice — **zero** "accepted but no order."
- **Zero** open deals without an owner + next-step task (drop-proofing).
- Reduced quote turnaround time and reduced AR aging (baseline at Phase 0, re-measure post-go-live).

## 9. Next steps
1. Intake call (proposed 2026-06-24) — audit + confirm scope/tier/terms.
2. Ronin Dojo Design firms up timeline + price; Michael signs.
3. Kick off Phase 0.

---

> **Petey note:** this is a DRAFT for internal review before it goes to Michael. The
> bracketed numbers and durations need Brian's rate card and a look at Mammoth's live
> instance to firm up. It is deliberately consistent with the friction audit so the
> proposal and the brief tell one story.
