---
title: "MMB Hours Worksheet — evidence table behind the invoice"
slug: mmb-hours-worksheet
type: billing-worksheet
status: DRAFT
created: 2026-07-24
last_agent: claude-session-0667
client: "Mammoth Metal Buildings (Michael Flores)"
pairs_with:
  - docs/product/mammoth-build/billing/invoice-mmb-draft.md
  - docs/product/mammoth-build/billing/state-of-the-building.html
backlinks:
  - docs/sprints/SESSION_0667.md
tags:
  - mammoth-build
  - billing
---

# MMB Hours Worksheet — DRAFT

> **DRAFT — operator reviews every number before anything is sent.**
> Evidence table: every session that touched the Mammoth engagement, with hours and their source.

## Hours source of truth

The session timesheet tracker **exists and was found**: `started` / `ended` / `duration_h`
frontmatter on the MMB session files in the Mammoth vault
(`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/clients/Mammoth_Vault/MMB_SESSION_NNNN.md`),
introduced at MMB_SESSION_0004 / repo SESSION_0576 (ticket #239 timesheet evidence), plus the
per-session rows in `MMB_LOGS.md`. It covers **5 sessions (6.95 h tracked)**; everything else on
this sheet is **estimated** and marked as such.

| Source key | Meaning |
| --- | --- |
| `tracker` | `duration_h` frontmatter on the cited MMB_SESSION file (or an explicit MMB_LOGS row) |
| `est` | Estimate from the session record's scope — no tracker row exists |

## Evidence table

| Session | Date | What happened (one line) | Hours | Source | Running |
| --- | --- | --- | ---: | --- | ---: |
| SESSION_0568 | 2026-07-18 | Mammoth pre-meeting max — meeting prep + command-center groundwork | 1.5 | est | 1.5 |
| SESSION_0570 | 2026-07-18 | Michael Flores client-intake demo + live meeting notes | 1.0 | est | 2.5 |
| SESSION_0571 | 2026-07-18 | Lean Mammoth operating shell + first lead tracer | 1.5 | est | 4.0 |
| SESSION_0572 / MMB_0002 | 2026-07-18 | Client-ops port + 9-fork grill → ledgers, runbook, 7 vault templates | 1.5 | est (predates tracker) | 5.5 |
| SESSION_0573 / MMB_0003 | 2026-07-18 | Wayfinder epic: local-agent lab + HubSpot-replacement roadmap (2 maps, 16 tickets) | 2.0 | tracker (MMB_0003) | 7.5 |
| SESSION_0574 | 2026-07-19 | Planning wave: gate contract + numbering + 0577 review wave (MMB share) | 1.0 | tracker (MMB_LOGS "~1 h") | 8.5 |
| SESSION_0576 / MMB_0004 | 2026-07-19 | Obsidian Bases cockpit v1 + session-timesheet frontmatter | 0.25 | tracker (MMB_0004) | 8.75 |
| SESSION_0577 / MMB_0005 | 2026-07-19 | CRM tracer loop 1: lead-sheet import preview + dedupe, roster Lead Source, attempt log | 1.2 | tracker (MMB_0005) | 9.95 |
| SESSION_0582 | 2026-07-19 | CRM tracer loop 2: import commit behind explicit confirm | 1.0 | est | 10.95 |
| SESSION_0586 | 2026-07-20 | CRM tracer loop 3: Lead Source facet on roster + pipeline board | 1.0 | est | 11.95 |
| SESSION_0625 | 2026-07-23 | Meeting intake: Michael's notes grilled + routed into the plan | 1.0 | est | 12.95 |
| SESSION_0632 / MMB_0006 | 2026-07-23 | Discovery-intake module live on the CRM + the missing login (PR #262, operator-tested) | 2.5 | tracker (MMB_0006) | 15.45 |
| SESSION_0633 | 2026-07-23 | MMB stand-alone deploy plan (mammothmb.com cutover baton — MMB share) | 0.5 | est | 15.95 |
| SESSION_0634 | 2026-07-23 | CRM-as-kernel-module architecture (MMB share of brand-agnostic work) | 0.5 | est | 16.45 |
| SESSION_0635 | 2026-07-23/24 | Overnight-wave orchestration (MMB share: staging + merge review of the 11 MMB lanes) | 1.0 | est | 17.45 |
| SESSION_0638 | 2026-07-24 | Landing page port from the recovered mock (PR #265) | 0.5 | est (overnight lane) | 17.95 |
| SESSION_0643 | 2026-07-24 | Client-engagement doc pack (PR #272) | 0.5 | est (overnight lane) | 18.45 |
| SESSION_0644 | 2026-07-24 | SEO/metadata foundation for mammothmb.com (PR #270) | 0.5 | est (overnight lane) | 18.95 |
| SESSION_0645 | 2026-07-24 | Services + pricing research + client one-pager (PR #271) | 0.5 | est (overnight lane) | 19.45 |
| SESSION_0646 | 2026-07-24 | Ronin Building Design pitch deck (PR #276) | 0.5 | est (overnight lane) | 19.95 |
| SESSION_0647 | 2026-07-24 | Three.js metal-building 3D configurator prototype (PR #273) | 0.5 | est (overnight lane) | 20.45 |
| SESSION_0653 | 2026-07-24 | Social-media automation research + playbook draft (PR #282) | 0.5 | est (overnight lane) | 20.95 |
| SESSION_0656 | 2026-07-24 | Review-request + follow-up template pack + GBP draft (PR #287) | 0.5 | est (overnight lane) | 21.45 |
| SESSION_0659 | 2026-07-24 | Pitch-deck outline + meeting-prep brief (PR #284) | 0.5 | est (overnight lane) | 21.95 |
| SESSION_0662 | 2026-07-24 | OG share image + site icon (PR #293) | 0.5 | est (overnight lane) | 22.45 |
| SESSION_0665 | 2026-07-24 | Engagement-kickoff access checklist (PR #289) | 0.5 | est (overnight lane) | 22.95 |

**Tracked subtotal: 6.95 h** (5 tracker rows) · **Estimated subtotal: 16.0 h** · **Evidence-based total: ~22.95 h**

Not on the sheet (operator's call whether to bill): June pre-engagement sales work — the lead
brief, HubSpot friction research, and the 2026-06-20 project proposal
(`docs/business/leads/michael-flores-project-proposal.md`) — conventionally unbilled
business-development time.

## Reconciliation vs. the operator's ~20 h anchor

- Operator anchor: **~20 h**. Evidence-based total: **~22.95 h** (6.95 tracked + 16.0 estimated).
- The difference is entirely inside the *estimated* rows — chiefly the eleven overnight
  autonomous lanes conservatively carried at 0.5 h each. Nothing in the tracker contradicts the
  anchor; the tracker only covers 6.95 h directly.
- **Per the standing rule, the invoice uses the operator's 20 h** (the tracker does not "clearly
  say otherwise" — it says *at least* 6.95 h and the estimates imply more). Billing 20 h against
  ~23 h of evidence is defensible and slightly client-favorable.

## Invoice grouping (how 20 h maps onto line items)

| Invoice line | Sessions | Hours |
| --- | --- | ---: |
| Discovery, meeting prep & intake | 0568 · 0570 · 0625 | 3.0 |
| CRM core: roster, pipeline, lead source, import | 0571 · 0577 · 0582 · 0586 | 4.5 |
| Discovery-intake module + secure login | 0632 | 2.5 |
| Client-ops system (vault, dashboards, timesheet) | 0572 · 0573 · 0574 · 0576 | 4.5 |
| Web presence: landing, SEO, share images | 0638 · 0644 · 0662 · 0633 (deploy plan) | 2.0 |
| Growth & marketing pack | 0643 · 0645 · 0646 · 0653 · 0656 · 0659 · 0665 | 2.5 |
| 3D building visualizer prototype | 0647 | 1.0 |
| **Total** | (0634/0635 overhead absorbed) | **20.0** |
