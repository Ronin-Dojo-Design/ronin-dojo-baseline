---
title: "Ronin Building Design × Mammoth Build"
subtitle: "DRAFT — pitch-deck outline (render-deck format), prepared for Michael Flores & the Mammoth Metal Buildings team"
brand: mmb
author: "Ronin Building Design"
date: "2026-07-24"
status: draft
session: 0659
---

## Starting point: mammoth.build already has real bones

Reviewed live at mammoth.build — everything below is something we actually observed on the page, not a guess.

**What's already working:**

- A confident dark hero with a direct headline and two clear CTAs above the fold — "Start a Successful Project" and "See Recent Builds"
- Live contact channels already wired — real `tel:` and `mailto:` links, not just text
- A real content engine already shipping — blog posts plus a "Planning Guides" pillar-guide format with read-time labels
- Structured data (schema.org), one `<h1>` per page, clean mobile reflow
- A lean technical foundation (Astro, WebP images, CDN) — not a bloated page-builder template

**Where the gaps are:**

- 6 of 18 homepage images ship with no alt text — accessibility and image search left on the table
- The title tag has no city or state — under-using local search relevance for a Colorado/Wyoming-heavy project list
- No testimonials, reviews, or third-party proof anywhere on the page
- On mobile, the live-chat bubble sits directly over the secondary CTA button, partially covering it
- The contact form appears one-way — no visible sign the inquiry becomes a tracked, owned record afterward

Notes: Everything on this slide is something we actually saw on the live site, not a guess — say that out loud. Let Michael react to the gaps list before moving to the next slide.

## The opportunity: what is a converted lead actually worth here?

Most website advice treats every visitor the same way — more traffic, lower cost-per-click, done. That math was built for a $40 checkout. It doesn't hold for a barn, a shop, or a commercial building.

- A Mammoth inquiry isn't an impulse buy — it's the front door to a real project
- If one converted lead is worth that much, a small lift in how many visitors become tracked, owned conversations is worth more here than in almost any other industry
- That reframes the whole conversation: not "how do we get more traffic," but "how do we make sure the right traffic never falls through a crack"

Notes: This is the frame the rest of the deck hangs on — get agreement here before the tactics slides. Do not quote a dollar figure on screen; the cost-per-customer math lives in the prep brief, not this slide.

## Site refresh: from a good static site to a lead-owning front door

**Today:** informational, confident, well-built — and still fundamentally a brochure. A visitor reads the page, then emails or calls. What happens after that is invisible to the site itself.

**The shift:** same voice, same confidence — plus a front door built to convert and to remember. Faster, mobile-first by design, and every inquiry becomes an owned record instead of an email sitting in an inbox.

Notes: Reassure early — this is not a rebuild-from-scratch pitch. Same voice, same confidence, on purpose.

## Site refresh: the concrete list

- Add descriptive alt text across the site — the 6 unlabeled homepage images first
- Bring city and region into title tags and headings instead of the brand name alone
- Move the mobile primary CTA out from under the chat widget, so it's always reachable with one thumb
- Keep the lean Astro foundation — audit before adding anything that isn't earning its weight in load time
- Replace the one-way contact form with a single lead form that creates an owned record, not just an email

Notes: This is the punch list — quick to scan, nothing here needs debate. Move fast unless Michael flags something specific.

## Automation: every inquiry becomes an owned Next Action, not an email

Mammoth already has the beginning of this — a purpose-built CRM and intake system scoped in Ronin's own build shop (see the Mammoth Build CRM PRD). Nothing here is a promise beyond what's already documented — it's the direction already under construction.

- Inquiry submitted → lead record created → routed to an owner → Next Action assigned → follow-up scheduled
- No inquiry drops silently — every open opportunity carries an owned Next Action or gets flagged
- No re-keying between a contact form, an inbox, and a spreadsheet
- Speed to first response is a conversion lever, not a nice-to-have — this isn't a hypothetical add-on, it's the same direction already scoped for Mammoth's own CRM

Notes: Walk the flow left to right out loud even though it renders as one line — this is where the CRM PRD becomes real to Michael. Tie it back to the lead-worth frame from the opportunity slide.

## SEO: best practice, not black magic

- Local + niche keyword targeting — city/region paired with building type, not just brand terms
- Technical basics done right: descriptive title tags, image alt text, schema markup, a clean sitemap, Core Web Vitals
- No invented rankings or promised positions on this deck — this is the foundation search engines reward, not a guarantee of where it lands. Results vary by market and competition.

Notes: Keep this one short and honest — no ranking promises, ever.

## SEO: build on what's already working

The Planning Guides and blog format already live on mammoth.build — that's the right instinct, already in motion.

- Expand the pillar-guide cadence already established
- Add location + building-type landing pages that guides can cross-link into
- Feed the photo pipeline (next section) back into content instead of starting from zero every post
- Same caveat as always — content compounds over time, results vary, no promised timeline

Notes: Compliment the existing blog before proposing anything — it's genuinely good work already, not a gap.

## Your customers can't find you where 90% of them look

> Over 90% of homeowners use Google to find local contractors — and mammoth.build has no Google Business Profile link anywhere on the site.

- Facebook and Instagram are linked from the site; Google Business Profile is not
- 93% of local-intent searches trigger Google's Local Pack — the map-plus-listings block above the organic results
- Once a buyer is looking at that Local Pack, reviews are the deciding input, and recency matters more than lifetime count
- This is the single highest-leverage, lowest-effort gap found in the review — no redesign, no new tool, no new habit required to fix it

Notes: New since the last draft — surfaced from the social/automation research pass (SESSION_0653). Confirm at kickoff whether an unclaimed GBP listing already exists for "Mammoth Metal Buildings" before framing this as claim vs. create.

## Social + marketing: the proof already exists on every job site

Options, not commitments — each of these can be picked up independently.

- A before/during/after photo pipeline (the same BuildPhoto concept already scoped in the CRM PRD) turns routine job-site documentation into ready-made content
- Finished projects become project-story posts, matching the "Featured Projects" format already live on the site
- Nothing here requires new equipment — just capturing what's already happening and routing it somewhere

Notes: Reinforce that this is curation of what the crew already does, not a new marketing workload for Michael.

## Social + marketing: turn a Satisfied Installation into visible proof

- A review-request flow tied to the CRM's own "Satisfied Installation" milestone — ask at the moment satisfaction is confirmed, not months later
- Short social clips sourced from the same photo pipeline
- Distribution — which platforms, what cadence — is deliberately left as options, not a plan. Results vary; no guarantees.

Notes: Connect this directly back to the GBP slide — the review engine is what feeds the gap named earlier.

## The shape of it

> Lead → Site → CRM → Follow-up → Signed Build — with a no-response loop that re-owns the follow-up automatically instead of letting it go silent.

Notes: Walk the arrow left to right verbally. The full version is an SVG infographic in the source deck (`docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html`); this outline collapses it to the one-line statement.

## Working together: pick where to start

- **Site Refresh** — fix what's costing conversions today: speed, mobile CTAs, alt text, and a lead form that creates a record instead of an email
- **Automation & CRM** — build on the CRM foundation already scoped: inquiry to owned Next Action, nothing silently dropped
- **Growth (SEO + Social)** — local + niche SEO, an expanded content cadence, and the photo/review pipeline sourced from real job sites

No numbers on this slide by design. Four ways to structure the engagement — Fixed-Scope Build, Build + Growth Retainer, Time & Materials, and Performance Hybrid (add-on) — are laid out with indicative ranges in the **Pricing options one-pager** (`docs/product/mammoth-build/engagement/pricing-options-onepager.md`).

Notes: Do not restate any dollar figure from the one-pager on this slide, or verbally, beyond pointing at the document — that's the one-pager's job, not the deck's.

## Next steps: let's pick one lane and start

- Review this deck together and flag anything that doesn't sound like Mammoth
- Walk through the CRM/intake direction already in build
- Pick one lane and one engagement option from the Pricing options one-pager and start there

Built all the way through — for the business, not just the build.

Notes: Close on the motto. Leave the actual option choice as Michael's decision — this slide invites it, it doesn't push for a specific answer.
