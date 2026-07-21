---
title: "Recipe — New-Brand Client Interview (client requirements + handoff)"
slug: recipe-new-brand-interview-client
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0598
pairs_with:
  - docs/protocols/recipes/new-brand-setup.md
  - docs/protocols/recipes/new-brand-interview-business.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - client
  - recipe
  - onboarding
---

# Recipe — New-Brand Client Interview

Sibling interview card: capture **client-specific** requirements, approvals, and handoff terms — for
`clients/*` brands headed for a contractual handoff. **N/A for a first-party brand** (RDD, BBL,
Baseline stay in-repo forever) — but the card exists so future client work is a first-class,
repeatable session. **Rung-2 card; not yet run end-to-end — Mammoth is the nearest real precedent.**

## Persona pack

- **Petey / Brandon** — run the interview (Petey for scope/handoff mechanics; Brandon for brand/voice).
- **Operator** — the client liaison; carries approvals (testimonials, metrics, sign-off) back and forth.
- **Giddy** — the handoff structural check (extract-on-handoff, ADR 0033 D1).

## Load-set

1. The client lead/proposal under `docs/business/leads/<client>`.
2. ADR **0033** D1 — client apps live in-repo until a contractual handoff, then extract to their own repo consuming the published `ui-kit`.
3. The showcase entry template (from the [business interview](new-brand-interview-business.md) §5) — what the client must approve to be shown.
4. **RDD client-onboarding templates** (`docs/product/rdd/assets/`) — `NDA_Template.docx` (pre-engagement mutual NDA), `Master_Service_Agreement_Template.docx` (engagement contract + Exhibit A SOW), `Initial_Client_Meeting_Template.docx` (discovery-call agenda). **Blank templates — not legal advice** (see the assets README).

## Step sequence

Signing order: **NDA (pre-discovery) → discovery meeting → MSA + SOW (engagement) → handoff.**

0. **Pre-engagement / NDA** — mutual NDA (`NDA_Template`) signed **before** confidential discovery.
1. **Client requirements** — driven by the `Initial_Client_Meeting_Template` discovery agenda; what the client's app must do; domain objects; brand assets they supply → emits the requirements doc.
2. **Approvals** — testimonial + metric + name/logo sign-off (nothing published without it).
3. **Engagement + handoff (legal)** — MSA + Exhibit A SOW (scope, fees, expenses); align **§6.2/6.3 Background-Technology retention with ADR 0033 D1** (extract-on-handoff — the kernel is licensed, not sold; the legal expression of "the kernel is the moat"); data ownership per §6.1/6.4; who runs the deploy after handoff.
4. **Emit** — a client requirements doc + a handoff checklist under `docs/business/leads/<client>` or `docs/product/<client>/`.

## Minimum-output contract

1. **Client requirements** doc.
2. **Approvals ledger** — signed-off testimonials/metrics/assets (or explicit "not yet").
3. **Handoff checklist** — the extract-on-handoff plan (ADR 0033).
4. **Prepared NDA + MSA/SOW** (from templates) attached to the approvals/handoff ledger.

## Session stub

```yaml
type: session--plan            # or a section within a new-brand-setup session
lane: <client-slug>
recipe: new-brand-interview-client
```

## Worked example — RDD (SESSION_0598)

**N/A for onboarding RDD-the-brand** (first-party, owns the kernel, never handed off) — but **RDD-as-agency
owns the client-onboarding templates** this card consumes: `docs/product/rdd/assets/{NDA,Master_Service_Agreement,Initial_Client_Meeting}_Template.docx`
(SESSION_0598; blank boilerplate, pending a de-Tableau re-scope to RDD's software+design framing — see the
assets README). Nearest real client precedent: **Mammoth** (`clients/mammoth-build-crm`). Branding these
templates into interactive forms = **G-028** (its own plan session).

## Cross-references

- [`new-brand-setup.md`](new-brand-setup.md) · [`new-brand-interview-business.md`](new-brand-interview-business.md) · [`new-brand-interview-design.md`](new-brand-interview-design.md).
- ADR 0033 (client handoff) · `docs/business/leads/`.
