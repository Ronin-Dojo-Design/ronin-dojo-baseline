---
title: "DRAFT — How RDD invoices flow into Mammoth's QuickBooks (Julie's one-pager)"
slug: quickbooks-julie-workflow-draft
type: client-facing-draft
status: DRAFT
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0672
client: "Mammoth Metal Buildings"
pairs_with:
  - docs/product/mammoth-build/billing/invoice-mmb-draft.md
  - docs/architecture/research/research-review-mmb-quickbooks-integration.md
backlinks:
  - docs/sprints/SESSION_0672.md
tags:
  - mammoth-build
  - billing
  - quickbooks
---

# How Ronin invoices reach your books — and what stays in your hands

> **DRAFT — internal working copy. Brian reviews all wording before this goes to Mammoth.**

*For Julie (bookkeeping) and Michael — one page, no jargon, nothing changes in your
QuickBooks unless one of you does it or approves it.*

---

## Today: simple on purpose

**1. We build the invoice.** Every line item is written up on our side, with hours and
plain-English descriptions of what you got.

**2. Brian personally approves it.** Nothing leaves our studio without his sign-off —
no auto-generated, auto-sent anything. **[APPROVAL GATE: Brian]**

**3. It lands in your inbox as a normal invoice** (PDF attached, numbers also right in the
email body so they're easy to copy).

**4. Julie enters it in QuickBooks the way she enters any vendor bill.** Vendor: Ronin
Building Design. Nothing about your QuickBooks setup changes; we never touch your books.
**[APPROVAL GATE: Julie — she's the only one who puts anything in your ledger]**

**5. You pay it however you normally pay vendors.** Terms and payment method are printed on
the invoice.

That's the whole system. Two humans approve everything: Brian before it's sent, Julie before
it's in your books.

## Soon (optional): let Claude do the typing — you keep the approvals

QuickBooks and Claude (the AI that Michael already uses) now connect officially — Intuit
built the connection themselves. If you want, we'll set it up on your side and show you how
to use it. What that looks like:

- **Entering our invoice:** drop the PDF into a Claude chat and say "enter this bill in
  QuickBooks." Claude fills everything in and **shows you what it's about to enter — nothing
  is saved until you confirm it in the chat.** **[APPROVAL GATE: Julie/Michael confirm every
  entry]**
- **Monthly numbers in plain English:** "How did we do in June?" — profit & loss, cash flow,
  and how you compare to similar businesses, summarized readably. (Reading your numbers only
  — this can't change anything.)
- **Categorizing transactions:** hand Claude a bank export or a stack of receipt photos; it
  *proposes* categories, you approve them.
- **Chasing what you're owed:** Claude can *draft* the reminder emails for your overdue
  customer invoices. **You read and send them — it never emails your customers on its own.**

The connection is yours, not ours: it's authorized from your QuickBooks login, and you can
switch it off any time from your Intuit account. We help set it up and train you on it;
we never hold keys to your books.

## What stays manual — always

- **Sending anything** — invoices, reminders, emails: a person hits send, every time.
- **Paying anything** — no automation ever moves money.
- **Approving entries** — nothing posts to your QuickBooks without Julie or Michael saying
  yes to that specific entry.

## Later (only if it earns it)

If down the road you want invoices from us appearing directly in your QuickBooks as
ready-to-review bills, that's buildable — same rules: they'd arrive **unpaid and unsent**,
waiting for Julie's review, never auto-anything. We'd only propose it if the volume ever
makes the current 2-minute entry feel like a chore.

---

*Questions → Brian. Nothing on this page changes how your books work until you say so.*
