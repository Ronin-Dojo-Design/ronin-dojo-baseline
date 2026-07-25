---
title: "RDD -> Mammoth Metal Buildings -- Proposal & Statement of Work (Draft)"
slug: mammoth-engagement-proposal-sow-draft
type: reference
status: draft
created: 2026-07-24
author: RDD
session: 0643
---

> **DRAFT -- not an executed agreement.** Every date, milestone, and figure below is a placeholder or
> an option, not a commitment. This document is structured to lift directly into the `apps/rdd`
> interactive-form build (G-028) once that work resumes -- headings and field shapes are deliberately
> stable. Pricing lives in a separate exhibit; this document carries **zero dollar figures**.
>
> **Provenance:** scope sections below are grounded in `docs/product/mammoth-build/{PRD.md,
> STORIES.md,CONTEXT.md,BRAND_HEART_BEAT.md,assets/Michaels_Notes_Meeting.md}` -- the CRM/automation
> and site-refresh sections cite the specific epics/goals they come from. SEO, social/marketing, and
> AI-consulting are named per the lane brief but have no grounding yet in Mammoth-specific docs, so
> they stay open placeholders pending discovery (see the Initial Client Meeting questionnaire).

# RDD -> Mammoth Metal Buildings -- Proposal & Statement of Work

**Service provider:** RDD (Ronin Dojo Design), [RDD LEGAL ENTITY TYPE / STATE], [RDD ADDRESS]
**Client:** Mammoth Metal Buildings, attn. Michael Flores (GM), [MAMMOTH LEGAL ENTITY TYPE / STATE],
[MAMMOTH ADDRESS]
**Effective Date:** [TBD -- not set]
**Governed by:** the Master Service Agreement between the Parties (`msa-core-draft.md`); this
document is the initial Statement of Work ("SOW" / Exhibit A) under that Agreement.

## 1. Engagement summary

RDD proposes to replace Mammoth's friction-heavy generic HubSpot setup with a purpose-built CRM and
enablement system, alongside a marketing/web refresh, so that every prospect is known personally, no
building opportunity is silently dropped, and every delivered building reaches a documented,
satisfied installation -- Mammoth's brand promise, **"Built all the way through."**
(`docs/product/mammoth-build/PRD.md`, `BRAND_HEART_BEAT.md`.)

This SOW is organized as five scope areas. Not all areas are committed in this draft -- each is
marked with its current grounding status.

## 2. Scope of work

### 2.1 Site refresh -- grounded

Source: PRD "MVP surfaces", STORIES Epic 1 (Landing & Inquiry).

- Landing/marketing page refresh (dark + orange brand treatment, hero section).
- Building-type interest capture that pre-fills the inquiry form (localStorage today; server-backed
  as CRM lands).
- Inquiry-draft persistence so a visitor's in-progress inquiry survives a page leave.
- Inquiry submission creates a CRM Lead with a first-touch Next Action (MB-LAND-004).
- Copy pass to keep every surface aligned to the Brand Heartbeat and the two supported Installation
  Paths (Mammoth-Installed / Customer-Installed).

### 2.2 CRM & automation -- grounded

Source: PRD Goals 1-10, STORIES Epics 2-3, 5, 7-9 (`docs/product/mammoth-build/STORIES.md`).

- One record per opportunity: Prospect -> Lead -> Opportunity -> Confirmed Order -> Engineering ->
  Fabrication -> Delivery -> Installation Path -> Satisfied Installation -> Successful Close.
- Pipeline board with per-stage counts, confirmed-order and at-risk counts (MB-PIPE-001/003).
- Lead roster: source, owner, lifecycle/status, last touch, Contact Attempt 1/2/3, Next Action, due
  date (MB-PIPE-004, MB-LEAD-001).
- Job-order form creating a project at Lead stage, with PEMB fields (dimensions, loads) on the
  record (MB-ORDER-001/002).
- Drop-proofing guardrails: every live Opportunity/Project carries an owned Next Action; Lost
  requires a reason (MB-GUARD-001/002).
- Before/during/after build-documentation photos tied to the project record (Epic 4).
- Installation Path selection (Mammoth-Installed or Customer-Installed) with matching readiness,
  proof, and satisfaction gates before Successful Close (Epic 9).
- Own database, own auth, isolated from any other RDD/Baseline product (ADR 0038 -- internal
  architecture note, not a client-facing commitment).
- CSV/JSON lead-sheet import (BuildingGuides.com, purchased lists) with preview/dedupe before commit
  (MB-LEAD-002); safe outreach automation only after consent/stop-rule design (MB-AUTO-001/002) --
  **out of initial scope pending the discovery-call decision on automation posture.**
- HubSpot Pro and QuickBooks: coexistence/cutover posture and the QuickBooks write boundary are open
  items pending the Initial Client Meeting and a follow-up conversation with Julie
  (`assets/Michaels_Notes_Meeting.md`).

### 2.3 SEO -- placeholder, ungrounded

No SEO-specific requirements are recorded in Mammoth's discovery notes yet. Scope, deliverables, and
success measures to be defined during discovery; nothing committed in this draft.

### 2.4 Social / marketing -- placeholder, ungrounded

No social/marketing-specific requirements are recorded in Mammoth's discovery notes yet. Scope,
cadence, and channels to be defined during discovery; nothing committed in this draft.

### 2.5 AI consulting -- placeholder, ungrounded

No AI-consulting-specific requirements are recorded in Mammoth's discovery notes yet. Scope
(process automation guidance, tooling recommendations, or other) to be defined during discovery;
nothing committed in this draft.

## 3. Deliverables & milestones (placeholder)

| Milestone | Deliverable | Acceptance criteria | Target date |
| --- | --- | --- | --- |
| M1 | [deliverable] | [acceptance criteria] | [TBD] |
| M2 | [deliverable] | [acceptance criteria] | [TBD] |
| M3 | [deliverable] | [acceptance criteria] | [TBD] |

Milestones and dates are placeholders only, to be filled once scope is confirmed at or after the
Initial Client Meeting.

## 4. Acceptance criteria (placeholder)

Each deliverable above is accepted when its stated acceptance criterion is demonstrated and Mammoth
confirms in writing (email is sufficient unless the MSA specifies otherwise). No acceptance standard
is agreed in this draft.

## 5. Pricing exhibit

Pricing is intentionally **not** included in this document. See the separate pricing exhibit:
**`pricing-options-onepager.md`** (drafted in a parallel session in this same `engagement/`
directory). This proposal contains no dollar figures, rates, or payment amounts.

## 6. Change control

**Operator doctrine, binding on this SOW:** once scope is fixed-price, changes to that scope happen
**only** through a written change order -- **any change, however small, is a change order.** No
verbal agreement, email aside, or informal "small ask" modifies the fixed-price scope above. A
change order states the requested change, its impact on scope/timeline/price, and requires written
sign-off from both Parties before work on that change begins.

## 7. Term & assumptions

- This SOW is effective only once signed by both Parties and incorporated under the MSA
  (`msa-core-draft.md`).
- Assumes Mammoth provides timely access to information/materials reasonably necessary for RDD to
  perform (mirrors the MSA's "Company's Obligations" clause).
- Nothing in this SOW commits either Party to future phases; later phases (sales cockpit, automation,
  installation/satisfaction tracking, billing) are backlog per `STORIES.md`, not authorized work.

## 8. Signatures (placeholder)

| | RDD | Mammoth Metal Buildings |
| --- | --- | --- |
| Name | [TBD] | [TBD] |
| Title | [TBD] | Michael Flores, GM |
| Date | [TBD] | [TBD] |
