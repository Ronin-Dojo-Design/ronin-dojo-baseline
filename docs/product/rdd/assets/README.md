---
title: "RDD client-onboarding templates — raw assets"
slug: rdd-onboarding-assets
type: reference
status: draft
created: 2026-07-21
last_agent: claude-session-0598
backlinks:
  - docs/protocols/recipes/new-brand-interview-client.md
---

# RDD client-onboarding templates — raw assets

> ⚠️ **TEMPLATE — not legal advice.** All files here are **blank boilerplate** (unfilled placeholders
> like `YOUR COMPANY, LLC`, `XXXX`, jurisdiction). Replace placeholders and **review with counsel
> before execution.** Governing law is placeholder Colorado/Denver.

Uploaded by the operator, SESSION_0598. Consumed by
[`new-brand-interview-client.md`](../../../protocols/recipes/new-brand-interview-client.md) (signing
order: **NDA → discovery → MSA + SOW → handoff**).

| File | What it is |
| --- | --- |
| `NDA_Template.docx` | Mutual (two-way) NDA — signed **before** confidential discovery |
| `Initial_Client_Meeting_Template.docx` | Discovery-call agenda (15-question intake questionnaire — *not* legal) |
| `Master_Service_Agreement_Template.docx` | Engagement contract + Exhibit A SOW. §6.2/6.3 **Background-Technology retention** = the legal expression of "the kernel is the moat" + [ADR 0033](../../../architecture/decisions) D1 extract-on-handoff |

## Flags (Brandon /rr, SESSION_0598)

- **De-Tableau re-scope needed** — the Initial Client Meeting + MSA recitals carry Tableau/data-viz-firm
  language; re-scope to RDD's **software + design agency** framing before use.
- **Do NOT commit executed instances.** Once filled with a real client's name/terms, an executed
  contract carries confidential business terms — store it only in the app's **gated uploader/R2 seam**
  (never in git). See **G-028** (branding these into interactive forms; its own plan session).
- **Counsel / ESIGN-UETA gate** before any generated MSA/NDA is executable.
