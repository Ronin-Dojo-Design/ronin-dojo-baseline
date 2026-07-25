---
title: "RDD_Client_Invoice — reusable email-composer invoice template"
slug: rdd-client-invoice-template
type: template
status: DRAFT
created: 2026-07-24
last_agent: claude-session-0667
relocate_to: "docs/product/rdd/ — move there once that dir unfreezes (parked here because billing/ is the only 0667-writable home)"
pairs_with:
  - docs/product/mammoth-build/billing/invoice-mmb-draft.md
backlinks:
  - docs/sprints/SESSION_0667.md
tags:
  - rdd
  - billing
  - template
---

# RDD_Client_Invoice — reusable template

> Generic fill-in-the-blank invoice skeleton for any RDD-brand engagement. Each section is an
> email-composer paste block. First concrete instance: `invoice-mmb-draft.md`.
>
> **Provenance note:** the remembered "BBL email-composer invoice" was hunted (repo email catalog
> `apps/web/emails/` + `apps/web/app/app/email/`, docs/, and the Obsidian vaults) and **not found**
> — no invoice template exists in the BBL email catalog. This template is a fresh design; if the
> BBL one surfaces, reconcile the two.

---

**Subject:** Invoice {{INVOICE_NO}} — {{CLIENT_COMPANY}} · {{ENGAGEMENT_SHORT}}

---

## Header

**From:** {{RDD_STUDIO_NAME}} — a Ronin Dojo Design studio
**To:** {{CLIENT_COMPANY}} — Attn: {{CLIENT_CONTACT_NAME}}
**Invoice #:** {{INVOICE_NO}}
**Date:** {{INVOICE_DATE}}
**Period covered:** {{PERIOD_START}} → {{PERIOD_END}}
**Engagement:** {{ENGAGEMENT_DESCRIPTION}}

## Summary

{{ONE_PARAGRAPH — plain-language recap of the period: what was built, researched, and discussed,
and where it all stands. Link or attach the client-facing status page if one exists.}}

## Itemized work

> One row per area (or per session for fine-grained billing). Sum of Hours = Total hours.
> Categories to draw from: **time spent** · **features built** · **concepts/automations
> discussed** · **ideas & research delivered**.

| # | Line item | What you got | Hours |
| --- | --- | --- | ---: |
| 1 | {{AREA_1}} | {{CLIENT_LANGUAGE_DELIVERABLE_1}} | {{H1}} |
| 2 | {{AREA_2}} | {{CLIENT_LANGUAGE_DELIVERABLE_2}} | {{H2}} |
| 3 | {{AREA_3}} | {{CLIENT_LANGUAGE_DELIVERABLE_3}} | {{H3}} |
|   | **Total hours** |  | **{{TOTAL_HOURS}}** |

## Rate & total

> Rate card — keep whichever rows apply; always show the standard rate when discounting so the
> discount is visible.

| | Rate | Amount |
| --- | ---: | ---: |
| Standard studio rate | ~~$200 / hr~~ | ~~{{TOTAL_AT_STANDARD}}~~ |
| Friends & Family rate | $100 / hr | {{TOTAL_AT_FF}} |
| Retainer rate (pre-committed block) | $[RETAINER_RATE] / hr | {{TOTAL_AT_RETAINER}} |
| Discount applied | −{{DISCOUNT_PER_HR}} / hr | −{{DISCOUNT_TOTAL}} |

# **Amount due: {{AMOUNT_DUE}}** *({{TOTAL_HOURS}} h × {{APPLIED_RATE}})*

## Payment terms

- **Terms:** {{TERMS — due on receipt / Net 15 / Net 30}}
- **Payment method:** {{METHOD — check / Zelle / Stripe payment link / ACH}}

## Change control

This invoice covers the work listed above through {{PERIOD_END}}. Anything new or beyond this
scope gets a written estimate and your go-ahead **before** the work starts.

---

## Fill-in checklist (delete before sending)

- [ ] Invoice number minted ({{BRAND_PREFIX}}-{{YEAR}}-{{SEQ}})
- [ ] Hours reconciled against the engagement's hours worksheet / timesheet tracker
- [ ] Rate row(s) chosen; discount visible if any
- [ ] Payment terms + method filled
- [ ] Client-facing status page attached or linked
- [ ] Operator reviewed every number — nothing sends without the word
