---
title: "RDD — Brand & Business Brief (worked example, SESSION_0598)"
slug: rdd-brand-brief
type: brief
status: draft
created: 2026-07-21
last_agent: claude-session-0598
pairs_with:
  - docs/protocols/recipes/new-brand-interview-business.md
  - docs/sprints/SESSION_0598.md
backlinks:
  - docs/sprints/SESSION_0598.md
---

# RDD — Brand & Business Brief

> **Worked example** for [`new-brand-interview-business.md`](../../protocols/recipes/new-brand-interview-business.md)
> (Brandon-owned), captured at SESSION_0598. **Not canon until operator sign-off.** Legend:
> `[CONFIRMED]` = operator's words / ratified canon · `[REC]` = Brandon recommendation (operator
> ratifies) · `[operator to fill]` = concrete fact to supply.

## 1. Positioning

- `[REC]` **Ronin Dojo Design is a product studio that builds one durable kernel and reskins it into a
  portfolio of brands — so every school, gym, or niche business gets a real software platform, not a template.**
- `[CONFIRMED]` RDD = umbrella brand above 7 brands (RDD · BBL⭐ · Mammoth · Baseline · WEKAF · ACD ·
  Tuff Buffs instance); owns the kernel (`packages/ui-kit`) + brand-agnostic feature-module library = the moat.
- `[CONFIRMED]` RDD resells the **White Labeled Dojo** (= Baseline) and stands up first-party apps on the same kernel.

## 2. Mission (draft)

- `[REC]` **"We build one thing well, then make it many. RDD engineers a single durable software kernel
  and shapes it into brands that preserve craft, honor lineage, and give small operators software that
  usually only enterprises can afford."**
- `[REC]` Short alt (header): **"One kernel. Many brands. Built to last."**

## 3. Business philosophy / how RDD runs

- `[CONFIRMED]` **One kernel, many brands** (`kernel → brand → app`, ADR 0051); **any module runs on any
  app**; **per-brand apps are the deploy unit** (1 Vercel + 1 DB); **white-label resale** (Baseline =
  White Labeled Dojo, per-customer instances); **"what would Apple/Facebook do"** (lean over sprawl).
- `[REC]` Customer-facing translation of the internal efficiency ethos: *fast, reliable, no repeated
  work, only what you need* — never "token-efficient." Buyer benefit = "you stand on a platform four
  brands already hardened." **Proof-of-craft over promises** — lead with shipped (BBL live), not slideware.

## 4. Founder positioning (Brian) — credibility spine

Frame: the multi-domain background is *why RDD's work is different* — one person carries a project from
martial-arts domain truth → design → architecture → shipped software → the marketing that sells it.

- `[CONFIRMED]` Domains to feature: martial arts · web design/development · software engineering ·
  SEO/marketing · senior developer & systems architect.
- `[REC]` Four-beat spine (each `[operator to fill]` with specifics): **Practitioner** (art/rank/lineage/
  years/instructors) → **Builder** (web design/dev years, notable work) → **Engineer/architect** (senior
  roles, scale, systems designed) → **Growth** (SEO/marketing outcomes with numbers).
- `[REC]` Founder tag: **"A martial artist who became a systems architect — so the people who preserve
  craft get software built by someone who respects it."** First-person register ("I'm Brian…").

## 5. Portfolio / showcase model

- `[REC]` **Showcase entry = one content type.** Fields (feeds the schema + the Client-interview card):
  `title` · `brand` · `slug` · `status` (`live`|`in-build`|`placeholder`) · `one_line` · `problem` ·
  `story` · `process` (3–5 beats) · `outcome`/`metrics` `[per-project fill]` · `testimonial`
  {quote, attribution, role} `[client fill]` · `hero_media`+`gallery` (ONE R2 uploader seam) ·
  `live_url` (only when `live`) · `modules_used`.
- Showable: **BBL** `[CONFIRMED live blackbeltlegacy.com]` (strongest anchor) · **Baseline** (resold
  product) · **Mammoth** (pending client sign-off) · **Tuff Buffs** (instance story) · **WEKAF**/**ACD**
  = placeholder until built/approved (ACD = domain-agnostic proof).
- `[REC]` **No entry publishes a testimonial/metric/client name without sign-off**; placeholders render
  story + process only, never invented outcomes.

## 6. Revenue / model `[REC — needs operator confirm]`

- Three lines by leverage: **white-label resale** (recurring SaaS) → **custom builds** (project fee ±
  equity/rev-share `[fill]`) → **retainers/care plans** (hosting + SEO/marketing + features).
- `[operator to fill]` pricing tiers; fixed-fee vs equity; whether numbers go on-site at v1. **No numbers on-site until ratified.**

## 7. Kernel feature-modules RDD's app runs

| Module | Surface | Repo status |
| --- | --- | --- |
| Leads / contact intake | "Start a project" → admin inbox | `[REUSE]` `lib/leads-pipeline`, `server/web/lead`, `school-lead`, admin `leads` |
| Directory / portfolio listing | Portfolio grid + project pages | `[REUSE]` `lib/directory`, `components/web/directory`, ListingCard (thin adapter) |
| Testimonials | Quote blocks on showcase | `[NET-NEW]` small content type |
| State-of-the-Dojo admin | 7-brand umbrella dashboard (authed) | `[IN-FLIGHT]` SESSION_0593; board primitive exists |
| Auth + admin portal | Login + role-gated admin | `[REUSE]` Better Auth, `server/admin`, `server/entitlements` |
| Media / uploader | Showcase hero + gallery | `[REUSE]` ONE uploader family + R2 seam |

- **Net-new for apps/rdd = testimonials content type + portfolio adapter + public marketing shell.** Rest is reuse (the on-brand proof of "one kernel").

## 8. Entitlements / access `[REC]`

- **Public:** marketing/philosophy, founder page, portfolio index + published entries, testimonials,
  "start a project" lead form (allowlist payload — no drafts/placeholders/unpublished metrics).
- **Authed (staff):** 7-brand State-of-the-Dojo host, lead inbox/triage, showcase authoring, cross-brand
  roll-up. **Reuse existing role/entitlement gating — do not build a 5th authz system.**
- **No middle "member" tier at v1** — public marketing + private admin, two-state.

## 9. Open questions for the operator

1. **Domain** — `ronindojodesign.com` (task) vs `ronindojo.design` (ronin-project-context table). → **Resolved SESSION_0598: `ronindojodesign.com`; conform the wiki/ADR.**
2. Mission wording — ratify §2 draft / short alt / redirect.
3. Motto — approve "One kernel. Many brands. Built to last." or supply.
4. **Founder facts** (§4 `[operator to fill]`).
5. Revenue model (§6) — confirm three lines; fee vs equity; numbers on-site y/n.
6. Showcase approvals — which clients gave testimonial/metric sign-off (Mammoth + external).
7. ACD — feature now (domain-agnostic proof) or hold until it ships.
8. Founder-page voice — first-person vs agency third-person (Brandon rec: first-person).
