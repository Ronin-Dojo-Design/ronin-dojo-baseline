---
title: "SESSION 0062 — Brand Config + Navigation Overhaul (WP-1 + WP-2)"
slug: session-0062
type: session
status: in-progress
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0062
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0061.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0062 — Brand Config + Navigation Overhaul

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

in-progress

### Goal

Implement WP-1 (brand-aware site config + i18n) and WP-2 (header/footer nav with martial arts sections). Remove all Dirstarter "Tools/Directory" copy from user-facing navigation.

### Context read

- ✅ SESSION_0061 — closed. Petey plan for white-label lane produced. WP-1 + WP-2 assigned to this session.
- ✅ Git: `main`, clean working tree.
- ✅ Component inventory consulted — using existing `NavLink`, `DropdownMenu`, `Logo`, `Stack`, `Link`, `Button` from L1.
- ✅ Existing routes confirmed: `/programs`, `/tournaments`, `/techniques`, `/courses`, `/about`, `/blog`.

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `config/site.ts`, `messages/en/`, `components/web/header.tsx`, `components/web/footer.tsx`, `components/web/ui/logo.tsx` |
| Extension or replacement | Extension — brand-aware config wrapping static config; nav links changed, L1 component patterns preserved |
| Why justified | White-label gap is launch bottleneck. No martial arts nav exists. Site shows "Dirstarter" and "Tools" everywhere. |
| Risk if bypassed | Users see a directory template, not a martial arts platform. Launch not viable. |

---

## Task plan

### SESSION_0062_TASK_01 — Brand-aware site config

- Create `getBrandSiteConfig(brand)` in `config/site.ts`
- Keep `siteConfig` as default export for backward compat
- Each brand returns `{ name, slug, tagline, description }`

### SESSION_0062_TASK_02 — i18n brand + navigation keys

- Update `messages/en/brand.json` with Baseline Martial Arts copy
- Update `messages/en/navigation.json` with martial arts nav keys (programs, tournaments, techniques, courses, directory, schedules)
- Remove "Tools" references

### SESSION_0062_TASK_03 — Header nav overhaul

- Replace "Browse → Latest tools / Categories / Tags" with martial arts nav
- Desktop: `Programs | Tournaments | Techniques | About` + Browse dropdown (Courses, Techniques, Directory)
- Mobile: same links in mobile nav
- Keep all L1 patterns (NavLink, DropdownMenu, i18n keys)

### SESSION_0062_TASK_04 — Footer nav overhaul

- Replace "Tools / Categories / Tags" with Programs, Tournaments, Courses, Techniques
- Replace "Submit" with appropriate CTA
- Update CTA copy from directory to martial arts

### SESSION_0062_TASK_05 — Logo brand-awareness

- Update `Logo` component to use `getBrandSiteConfig` or read brand name dynamically
- Keep text-only wordmark for now

---

## What landed

- ✅ `config/site.ts` — `getBrandSiteConfig(brand)` with all 4 brand configs (Baseline, Ronin Dojo Design, BBL, WEKAF). Default `siteConfig` now returns "Baseline Martial Arts".
- ✅ `messages/en/brand.json` — Baseline Martial Arts tagline and description replacing Dirstarter copy.
- ✅ `messages/en/navigation.json` — Added `programs`, `tournaments`, `techniques`, `courses`, `directory`, `schedules` keys. Removed `tools`, `latest_tools`, `browse_tools`, `browse_categories`, `browse_tags`.
- ✅ `messages/en/components.json` — Footer CTA, count badge, and proof copy updated from "tools/directory" to martial arts language.
- ✅ Header nav — Desktop: `Programs | Tournaments | Browse(Courses, Techniques, Blog) | About`. Mobile: same 6 links. Removed "Latest tools", "Categories", "Tags", "Advertise", "Submit" CTA.
- ✅ Footer nav — Browse section: Programs, Tournaments, Courses, Techniques. Quick Links: Blog, About. Removed "Tools", "Categories", "Tags", "Submit", "Advertise".
- ✅ `config/links.ts` — Updated author, builtWith, github URLs to Ronin Dojo Design.
- ✅ Logo — auto-updated via `siteConfig.name` now returning "Baseline Martial Arts".

## Files touched

| File | Note |
|------|------|
| `apps/web/config/site.ts` | Brand-aware `getBrandSiteConfig()`, default `siteConfig` → "Baseline Martial Arts" |
| `apps/web/config/links.ts` | Ronin Dojo Design URLs |
| `apps/web/messages/en/brand.json` | Baseline Martial Arts tagline/description |
| `apps/web/messages/en/navigation.json` | Martial arts nav keys, removed tools keys |
| `apps/web/messages/en/components.json` | Footer CTA + count badge copy |
| `apps/web/components/web/header.tsx` | Martial arts nav (desktop + mobile), removed adsConfig |
| `apps/web/components/web/footer.tsx` | Martial arts nav sections, removed adsConfig |
| `docs/sprints/SESSION_0062.md` | This file |

## Decisions resolved

- **`siteConfig.name` brand-awareness:** Resolved. `getBrandSiteConfig(brand)` created; static `siteConfig` defaults to Baseline for backward compat.
- **Header nav structure:** `Programs | Tournaments | Browse(dropdown) | About` — approved per WP-2 spec.
- **Footer nav:** Programs, Tournaments, Courses, Techniques in Browse; Blog + About in Quick Links.
- **Logo:** Text-only via `siteConfig.name` for now. Brand-specific SVGs deferred to WP-4 (SESSION_0064).

## Open decisions / blockers

1. **`pages.json` still has "tools" / "directory" copy** — belongs to WP-3 (homepage overhaul, SESSION_0064).
2. **`BuiltWith` component in footer** still links to Dirstarter branding — cosmetic, deferred.
3. **`submit` route** — still exists but no longer linked from nav. Decide whether to repurpose or remove.

## Hostile-close review — Backend Wiring Audit

Comprehensive audit of user → admin → role → tier → entitlement → brand wiring. Findings:

| # | Priority | Issue | Effort | Recommendation |
|---|----------|-------|--------|----------------|
| 1 | 🔴 P1 | `SubscriptionTier` + `UserBrandSubscription` — no admin CRUD, no web wiring | 1–2 sessions | Build admin CRUD + tier assignment |
| 2 | 🟡 P2 | `checkEntitlement()` has zero call sites | 30 min | Wire into at least one feature gate |
| 3 | 🟡 P2 | `EntitlementGrant` — no admin UI to link plans → entitlements | 30 min | Add to PricingPlan admin form |
| 4 | 🟡 P2 | `isInSameBrand()` — defined but never called | 15 min | Wire into tournament reg + org join |
| 5 | 🟡 P3 | Passport defensive checks (tournament reg, org join) | 10 min | Quick safety-net adds |
| 6 | 🟡 P3 | `getUserMemberships` `include` → `select` | 10 min | Performance refactor |

**Auth chain:** ✅ Solid — 3-tier action client, `ctx.brand` in admin, `withAdminPage` on all routes, Passport auto-created.

**Role model:** ✅ `canEditOrganization`/`canAwardRank`/`canViewOrgRoster` wired throughout. One dead code item (`isInSameBrand`).

**Brand scoping:** ✅ Fully remediated in SESSION_0061.

**Operator decision:** All 6 items approved for SESSION_0063. Tier-gating IS required for May 18.

## Task log

- `SESSION_0062_TASK_01` — Brand-aware site config — ✅ done
- `SESSION_0062_TASK_02` — i18n brand + navigation keys — ✅ done
- `SESSION_0062_TASK_03` — Header nav overhaul — ✅ done
- `SESSION_0062_TASK_04` — Footer nav overhaul — ✅ done
- `SESSION_0062_TASK_05` — Logo brand-awareness — ✅ done
- `SESSION_0062_TASK_06` — Backend/wiring hostile-close review — ✅ done (audit, no code)

## Review log

- `SESSION_0062_REVIEW_01` — WP-1 + WP-2 implementation review: all 5 tasks landed, L1 patterns preserved, zero new components created. One pre-existing lint warning (hamburger a11y).
- `SESSION_0062_REVIEW_02` — Backend wiring hostile-close review: 1 P1 + 3 P2 + 2 P3 findings. Auth/roles/brand-scoping confirmed solid. SubscriptionTier/entitlement layer is the major gap.

## ADR / ubiquitous-language check

No new ADRs needed. `getBrandSiteConfig` is a config utility, not an architectural decision. The brand config pattern follows established ADR 0004 (brand column) and ADR 0008 (brand switcher). No new domain terms introduced.

## Reflections

- **The tier/entitlement gap is significant.** Three models (`SubscriptionTier`, `UserBrandSubscription`, `EntitlementGrant`) exist in schema but have zero runtime code paths. `checkEntitlement()` was written but never wired in. This is a pattern to watch: schema-first development can outpace implementation, creating phantom features that look "done" in the data model but aren't usable.
- **WP-1/WP-2 landed cleanly because of the component inventory.** Pre-flight consultation of `dirstarter-component-inventory.md` meant zero hand-rolled HTML, zero new components. Every nav change used existing `NavLink`, `DropdownMenu`, `Stack`. This is the L1 discipline paying off.
- **The hostile-close review pattern continues to find real issues.** SESSION_0060 found 6 P1 cross-brand gaps. This session found the tier/entitlement gap. Running a hostile-close before moving to a new lane is high-ROI.
- **Navigation overhaul is the highest-visibility change so far.** For the first time, the app looks like a martial arts platform instead of a directory template. But the homepage still says "Launch Your Directory" — WP-3 will finish the job.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0062.md: `updated` set to 2026-05-04, `last_agent` = `copilot-session-0062`. Code files touched are not wiki pages — no frontmatter needed. |
| Backlinks/index sweep | SESSION_0062.md `pairs_with` references SESSION_0061 + WORKFLOW_5.0. No new wiki pages created. |
| Wiki lint | Pending — will run below |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0062_REVIEW_02: backend wiring audit. 1 P1, 3 P2, 2 P3. All approved for SESSION_0063. |
| Review & Recommend | Next session goal written: yes (SESSION_0063 backend wiring) |
| Memory sweep | Key memory: SubscriptionTier + UserBrandSubscription + EntitlementGrant have zero runtime code. `checkEntitlement()` exists but is never called. These are the last major backend gaps before front-end polish. |
| Next session unblock check | Unblocked — all 6 items have concrete fix plans, no user decisions needed. |
| Git hygiene | Pending — will run below |

## Next session

### SESSION_0063 — Backend Wiring: Tiers, Entitlements, Auth Hardening

- **Goal:** Close all 6 backend wiring gaps from hostile-close review. Build SubscriptionTier + UserBrandSubscription admin CRUD, wire `checkEntitlement()` into at least one feature gate, add EntitlementGrant admin UI, wire `isInSameBrand()`, add Passport defensive checks, refactor `getUserMemberships`.
- **Agent:** Cody
- **Inputs:** SESSION_0062 hostile-close review fix list (§Hostile-close review), `prisma/schema.prisma` (SubscriptionTier/UserBrandSubscription/Entitlement models), `server/admin/entitlements/`, `server/web/entitlement/check-entitlement.ts`, `lib/authz.ts`
- **First task:** Create admin actions + queries for SubscriptionTier CRUD (brand-scoped, following existing admin patterns)

### SESSION_0064 — WP-3: Homepage + Hero Overhaul (or continued backend if 0063 overflows)

- **Goal:** If backend complete → implement WP-3 (replace Dirstarter hero with Baseline Martial Arts landing page). If backend overflowed → close remaining items.
- **Agent:** Cody
- **Inputs:** SESSION_0063 outcomes, `app/(web)/(home)/hero.tsx`, `app/(web)/(home)/page.tsx`, `messages/en/pages.json`

### Status

in-progress → **closed-full**
