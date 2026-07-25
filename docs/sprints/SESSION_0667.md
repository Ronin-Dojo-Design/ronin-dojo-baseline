---
title: "SESSION 0667 — Fable wave-9 MMB billing pack — State of the Building + itemized hours + invoice (F&F rate) (auto lane, wave 9/10 — final pair)"
slug: session-0667
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0667
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0667 — Fable wave-9 MMB billing pack — State of the Building + itemized hours + invoice (F&F rate) (auto lane, wave 9/10 — final pair)

> Staged by the SESSION_0635 orchestrator (waves 9+10 — operator-directed, morning-deadline work).
> Adopted; branch: `auto/session-0667-mmb-billing`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

Fable wave-9 MMB billing pack — State of the Building + itemized hours + invoice (F&F rate).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0667_TASK_01 | done | Discovery: timesheet tracker FOUND in Mammoth_Vault; MMB session sweep (canonical + 11 origin branches); BBL invoice pattern NOT found |
| SESSION_0667_TASK_02 | done | Four billing deliverables written to `docs/product/mammoth-build/billing/` |

## What landed

- **`docs/product/mammoth-build/billing/state-of-the-building.html`** — self-contained
  MMB-only State-of-Dojo analogue (inline CSS, Mammoth palette from the landing mock, DRAFT
  watermark, renders via `file://`): 18 area cards across CRM / web presence / growth &
  marketing / operations backbone, each with client-language description, honest status
  (Shipped vs In review), and session ids + PR numbers.
- **`docs/product/mammoth-build/billing/hours-worksheet.md`** — 26-row evidence table
  (session → date → one-liner → hours → source → running total). Tracked 6.95 h + estimated
  16.0 h = **~22.95 h evidence-based**; reconciled against the operator's ~20 h anchor
  (invoice uses 20 h — tracker does not clearly say otherwise; slightly client-favorable).
- **`docs/product/mammoth-build/billing/invoice-mmb-draft.md`** — email-composer-ready
  invoice DRAFT (RBD-2026-001): 7 itemized lines summing to 20.0 h, $100/hr F&F rate with the
  $200/hr standard rate struck through and the −$2,000 discount visible, **$2,000.00 due**,
  payment-terms placeholders, change-control note.
- **`docs/product/mammoth-build/billing/rdd-client-invoice-template.md`** — the reusable
  RDD_Client_Invoice fill-in-the-blank skeleton (slots for time / features / concepts /
  research, three-row rate table, itemization table, fill-in checklist); frontmatter notes
  relocation to `docs/product/rdd/` once that dir unfreezes.

## Discovery evidence

1. **Time-sheet tracker: FOUND.** `started`/`ended`/`duration_h` frontmatter on MMB session
   files in `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/clients/Mammoth_Vault/`
   (introduced MMB_SESSION_0004 / repo SESSION_0576, ticket #239) + rows in `MMB_LOGS.md`.
   Tracker rows: MMB_0003→2.0 h (repo 0573) · MMB_LOGS→~1 h (repo 0574) · MMB_0004→0.25 h
   (repo 0576) · MMB_0005→1.2 h (repo 0577) · MMB_0006→2.5 h (repo 0632). Total tracked
   **6.95 h**; all other sessions estimated (marked `est` in the worksheet). The
   `00_Inbox/TTT capture-promote pipeline + session timesheet (idea seed).md` note is the
   design seed for this tracker.
2. **MMB session sweep** (canonical grep `lane: mmb` + Mammoth/MMB mentions + origin
   branches): canonical 0568 · 0570 · 0571 · 0572 · 0573 · 0574 · 0576 · 0577 · 0582 · 0586 ·
   0625 · 0632 · 0633 · 0634 (+0635 orchestrator); tonight's origin branches 0638 · 0643 ·
   0644 · 0645 · 0646 · 0647 · 0653 · 0656 · 0659 · 0662 · 0665 (all PRs open → "in review").
3. **BBL email-composer invoice: NOT found.** Searched `apps/web/emails/` (no invoice
   template in the catalog), `apps/web/app/app/email/`, canonical docs/, and the Obsidian
   vaults (`mdfind` + grep). Closest precedents: `docs/business/leads/michael-flores-project-proposal.md`
   (proposal structure) and the `Invoice` Prisma model in the MMB CRM DB. The RDD template was
   designed fresh and says so in its provenance note.

## Files touched

| File | Change |
| --- | --- |
| docs/product/mammoth-build/billing/state-of-the-building.html | NEW — client-facing work-product summary (DRAFT) |
| docs/product/mammoth-build/billing/hours-worksheet.md | NEW — evidence table + reconciliation (DRAFT) |
| docs/product/mammoth-build/billing/invoice-mmb-draft.md | NEW — invoice draft, F&F rate (DRAFT) |
| docs/product/mammoth-build/billing/rdd-client-invoice-template.md | NEW — reusable RDD_Client_Invoice template (DRAFT) |
| docs/sprints/SESSION_0667.md | adopted + closed |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` before writes | `/Users/brianscott/dev/ronin-0667` · `auto/session-0667-mmb-billing` (0) |
| Vault tracker read (`MMB_SESSION_0003..0006` frontmatter) | duration_h rows confirmed (0) |
| Browser-pane render of state-of-the-building.html | pane unavailable (parallel-session MCP lock — known condition); static HTML, hand-verified structure |
| Explicit-path `git add` of the five files only | see commit |

## Proposed ledger edits

- **G-019 (Mammoth landing / MMB goal row):** add pointer — billing pack lives at
  `docs/product/mammoth-build/billing/` (State of the Building + hours worksheet + invoice
  draft + RDD_Client_Invoice template), SESSION_0667.
- (Deferred to merge owner — wiki ledgers are wave-frozen for this lane.)

## Open decisions / blockers

- Billed-hours number: worksheet evidence ~22.95 h vs operator anchor 20 h — invoice draft
  uses **20 h** per the standing rule; operator may override either direction.
- Payment terms + method are placeholders in the invoice draft.

## Residual for AM merge

- **Operator reviews every number before ANY send** — invoice, hours, and the State-of-the-
  Building statuses (statuses will drift as tonight's PRs merge; re-check "In review" cards
  at send time).
- Relocate `rdd-client-invoice-template.md` to `docs/product/rdd/` once that dir unfreezes.
