---
title: "Topic Index — Feature Area Lookup"
slug: topic-index
type: index
status: active
created: 2026-05-05
updated: 2026-05-05
last_agent: copilot-session-0074
pairs_with:
  - docs/knowledge/wiki/index.md
backlinks:
  - docs/sprints/SESSION_0074.md
---

# Topic Index — "Did we do X?"

Quick lookup by feature area. For each area: the concept page (if it exists), the sessions that touched it, and the key code paths.

## Tournament Operations

- **Concept page:** [`wiki/concepts/tournament-ops.md`](concepts/tournament-ops.md)
- **Sessions:** 0026 (schema), 0042–0050 (feature build), 0051–0052 (L1 refactor), 0058 (snapshots)
- **Key paths:** `server/{admin,web}/tournaments/`, `app/admin/tournaments/`, `app/(web)/tournaments/`, `components/{admin,web}/tournaments/`
- **Status:** Mid-stream. Admin CRUD + registration + brackets + scoring shipped. Staff roles, weigh-ins, mat assignment, fight records, rule sets not yet built.

## School Operations

- **Concept page:** _(none yet)_
- **Sessions:** 0028 (programs), 0030–0032 (schedules + attendance), 0033 (enrollment/family/waiver/lead), 0037–0038.5 (lead admin), 0055 (lead CRM)
- **Key paths:** `server/web/{program,schedule,attendance,enrollment,family,waiver,lead}/`, `app/(web)/programs/`
- **Status:** Shipped. Full lifecycle: programs → schedules → attendance → enrollment → lead intake → trial conversion.

## Directory

- **Concept page:** _(none yet)_
- **Sessions:** 0014 (initial), 0067–0071 (detail pages + listings), 0072 (TS fixes), 0073 (slug gen + filters)
- **Key paths:** `server/web/directory/`, `app/(web)/{members,schools,directory}/`, `components/web/{members,schools}/`
- **Status:** Shipped. Member + school listings with filters, detail pages, dashboard tabs, slug-based routing.

## Commerce / Monetization

- **Concept page:** [`wiki/content-engine/directory-monetization-roadmap.md`](content-engine/directory-monetization-roadmap.md)
- **Sessions:** 0029 (roadmap), 0035–0036 (entitlement plan + implementation), 0053–0054 (Stripe products + enrollment checkout + dashboard)
- **Key paths:** `server/admin/{entitlements,pricing-plans,subscription-tiers}/`, `app/admin/{entitlements,pricing-plans}/`
- **Status:** Shipped. Stripe products, entitlements, pricing plans, enrollment checkout, webhook fulfillment, user dashboard.

## Content + Curriculum

- **Concept page:** _(none yet)_
- **Sessions:** 0040 (course + certificate admin), 0041–0041.5 (techniques + tests), 0056 (course publishing + certificates + media)
- **Key paths:** `server/{admin,web}/{courses,techniques,certificates}/`, `app/(web)/techniques/`
- **Status:** Shipped. Course + curriculum + certificate + technique + media admin CRUD; public technique pages.

## Brand / White-Label

- **Concept page:** _(none yet)_
- **Sessions:** 0061 (brand scoping), 0062 (brand-aware config + nav), 0065 (homepage), 0066 (listing pattern ADR)
- **Key paths:** `lib/brand-context.ts`, `config/blog.ts`, `app/(web)/page.tsx`
- **Status:** Shipped. Brand-aware config, nav, homepage, listing pattern repurposing.

## Listing Pattern (Tool → Directory Listing)

- **Concept page:** [`wiki/concepts/listing-pattern-repurposing.md`](concepts/listing-pattern-repurposing.md)
- **Sessions:** 0066 (ADR 0013), 0067–0071 (directory implementation)
- **Status:** Shipped for profiles + schools. Tool model still in schema for backward compat.

## Auth / Security

- **Sessions:** 0007 (Better-Auth), 0058 (admin auth HOC), 0059 (enrollment Passport check), 0063 (entitlement + brand gates)
- **Key paths:** `lib/auth.ts`, `lib/authz.ts`, `components/admin/auth-hoc.tsx`
- **Status:** Shipped. Better-Auth + Passport + brand scoping + role-based access. No integration tests yet (P2 from SESSION_0073).

## Governance / Process

- **Sessions:** 0015 (SOP adoption), 0024–0027 (protocol hardening), 0034 (merge-to-main), 0039 (Dirstarter index), 0051 (component inventory), 0060 (hostile review), 0073 (unclean-close recovery + hostile review), 0074 (lookup system rebuild)
- **Key docs:** `protocols/`, `rituals/`, `agents/`
- **Status:** Active. Ongoing.
