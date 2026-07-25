---
title: "Meeting Prep Brief — Michael Flores (Mammoth Metal Buildings)"
slug: meeting-prep-brief-draft
type: internal-brief
status: draft
created: 2026-07-24
author: RDD
session: 0659
audience: "Internal — Brian only"
pairs_with:
  - docs/product/mammoth-build/pitch-deck-outline.md
  - docs/product/mammoth-build/engagement/pricing-options-onepager.md
  - docs/product/mammoth-build/PRD.md
  - docs/product/mammoth-build/BRAND_HEART_BEAT.md
  - docs/product/mammoth-build/assets/Michaels_Notes_Meeting.md
---

# Meeting Prep Brief — Michael Flores (Mammoth Metal Buildings)

> **DRAFT — internal, for Brian.** This prepares the meeting; it does not promise anything to
> Michael. Nothing on this page has been said to the client. No figure here is a quote.

## One-page agenda (the story arc)

Walk it in this order — it's the same order as the [pitch-deck outline](pitch-deck-outline.md):

1. **Site** — what's already good on mammoth.build, then the concrete gap list
2. **Automation** — the CRM/Next Action direction already scoped and under construction
3. **GBP / reviews** — the gap Michael doesn't know he has yet (no Google Business Profile link),
   and the review engine that would feed it
4. **Social** — the job-site photo pipeline as proof, not a new content burden
5. **Options** — hand off to the four engagement structures, by name only, no numbers spoken

## Value framing — cost per customer, not cost per click

The reframe to land before any tactic: **what does each customer cost to win, and what is a
converted lead worth?** — not "how much traffic," not "how many followers."

- Michael's own numbers put current purchased-lead spend at **~$1,500 for ~600 leads**, i.e.
  **~$2.50/lead** — captured in his meeting notes and confirmed in the social-automation research
  review (`docs/architecture/research/research-review-mmb-social-automation.md`, SESSION_0653).
- That figure is a **cost-per-lead** number on a low-intent, shared purchased list — not a
  cost-per-customer number, and not directly comparable to organic/inbound leads without his
  close-rate. Say this out loud if the number comes up — don't let it get treated as an
  apples-to-apples ROI claim.
- The honest version of the pitch: organic/inbound leads (GBP, reviews, referrals, site) are
  **exclusive and pre-warmed** in a way a shared purchased list structurally isn't — that's a
  quality argument, not a guaranteed-savings argument. No project-value number exists yet to
  finish the cost-per-customer math; that's a scope-definition-session question, not a meeting
  answer.

## The four engagement options (by name only)

Point at the one-pager for numbers — do not restate any range in the room:
[`docs/product/mammoth-build/engagement/pricing-options-onepager.md`](engagement/pricing-options-onepager.md).

1. **Fixed-Scope Build** — one site, one price, locked blueprint
2. **Build + Growth Retainer** — the build plus an ongoing monthly engine (site care, SEO, social,
   automation)
3. **Time & Materials** — hourly, loosely scoped, steered month to month
4. **Performance Hybrid (add-on)** — a per-qualified-lead bonus layered onto Option 2, once a
   baseline is established

## Decision asks — what we actually need Michael to decide

- **Which lane / which option** — Site Refresh, Automation & CRM, or Growth first; and which of
  the four engagement structures fits how he wants to buy
- **GBP access** — confirm whether an unclaimed listing already exists for "Mammoth Metal
  Buildings" (claim) or none does (create), and get admin access granted either way
- **Photo pipeline buy-in** — does the crew adopt a shot-list habit at the job site (this is the
  input the whole content/proof engine runs on — without it, nothing downstream has raw material)
- **Who posts** — RDD-managed with a weekly Michael handoff (the research review's lean default),
  Michael-posted, or a hybrid split; this is an open fork in the research review, not a decision
  made for him

## Objection prep

Three to four likely pushbacks, and the response line for each — scope definition, change
control, and "what's your guy worth" are the three legs to stand on:

1. **"Website work always turns into scope creep."**
   Fixed-Scope Build locks the page set and the price *before* work starts. Anything added after
   scope-lock — down to a font color — is a written change order with its own price. No surprises
   in either direction. That's not a sales line, it's literally how Option 1 is priced.

2. **"What if I need to change something mid-project?"**
   That's what change control is for. A locked scope plus a defined change-order process means
   changes are welcome — they just get written down and priced before we build them, not
   discovered as a surprise on an invoice after.

3. **"I could just have [an employee / a cheap freelancer] handle this."**
   Ask what that person's time is actually worth doing what *they're* best at, and what it costs
   when a lead sits un-followed because nobody owned it that week. The comparison isn't hourly
   rate against hourly rate — it's what a signed project is worth against what it costs when one
   gets quietly dropped. That's the "what's your guy worth" question, and it's Michael's own math
   to run, not ours to hand him a number for.

4. **"We already have a website and social presence — why touch it?"**
   Nothing here proposes tearing out what works. The deck opens by naming what's already good —
   the CTAs, the blog, the lean build. This is a punch list against a working foundation, not a
   rebuild pitch.

## Follow-up checklist (post-meeting)

- [ ] Do **not** send the deck as a polished file until it's actually rendered — the outline
      renders to HTML only once the `render-deck` script lands (tracked in PR #278); sharing the
      raw outline markdown as-is is not meeting-ready.
- [ ] If an engagement option is picked: schedule the scope-definition workshop before any fixed
      price is put in writing (Options 1 and 2 both require it).
- [ ] If GBP access is agreed: confirm claim-vs-create at Maps, then get admin/manager access
      added.
- [ ] If photo-pipeline buy-in lands: confirm who on the crew owns the shot-list habit day to day.
- [ ] Send the Pricing options one-pager separately if Michael wants the numbers in writing to sit
      with before deciding.
- [ ] Log the meeting outcome back into the Mammoth lead/project record — dogfooding the CRM's own
      "no silent drop" promise on our own pipeline with Michael.
- [ ] Update `docs/sprints/SESSION_0659.md` residuals (or the next session) with what was decided,
      so the operator dry-run and the outline render both have a fresh source of truth.
