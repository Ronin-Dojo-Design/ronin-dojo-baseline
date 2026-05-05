---
title: "SESSION 0071 — Cody: Detail Pages + Auth Integration"
slug: session-0071
type: session
status: closed-quick
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0071
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0070.md
  - docs/knowledge/wiki/concepts/listing-pattern-repurposing.md
  - docs/knowledge/wiki/dirstarter-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0071 — Cody: Detail Pages + Auth Integration

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Cody, orchestrated by Petey)

### Status

closed-quick

### Goal

Build `/members/[slug]` and `/schools/[slug]` detail pages; wire `viewerUserId` from session into member query for MEMBERS_ONLY visibility.

### Context read

- ✅ SESSION_0070 — closed-quick. Listing pages landed.
- ✅ `findProfileBySlug` in `server/web/directory/queries.ts` — privacy-aware, returns sanitized profile.
- ✅ `getOrganizationBySlug` in `server/web/organization/queries.ts` — brand+slug unique lookup.
- ✅ `getServerSession` in `lib/auth.ts` — returns session with user.id.
- ✅ Technique `[slug]` page as L1 reference pattern.

### Task log

- `SESSION_0071_TASK_01` — `/members/[slug]` detail page — ✅ done
- `SESSION_0071_TASK_02` — `/schools/[slug]` detail page — ✅ done
- `SESSION_0071_TASK_03` — Wire `viewerUserId` into `/members` listing page — ✅ done

## What landed

- ✅ **Member detail page** — `/members/[slug]` with privacy-aware profile via `findProfileBySlug`, session-based `viewerUserId`, dynamic metadata, avatar, bio, orgs, ranks, social links.
- ✅ **School detail page** — `/schools/[slug]` with brand-scoped org lookup via `getOrganizationBySlug`, address, disciplines, member list (capped at 20), owner, website link.
- ✅ **Auth pass-through** — `/members` listing page now calls `getServerSession()` and passes `viewerUserId` to `MemberQuery`, enabling MEMBERS_ONLY profiles for authenticated users.
- ✅ **Type check** — No errors in new files (`tsc --noEmit` clean for touched files).

## Files touched

| File | Note |
|------|------|
| `apps/web/app/(web)/members/[slug]/page.tsx` | New — member detail page with privacy-aware rendering |
| `apps/web/app/(web)/schools/[slug]/page.tsx` | New — school detail page with org info |
| `apps/web/app/(web)/members/page.tsx` | Modified — added `getServerSession` + `viewerUserId` pass-through |
| `docs/sprints/SESSION_0071.md` | This file |

## Decisions resolved

- **Avatar pattern** — Use `Avatar` + `AvatarImage` + `AvatarFallback` (Radix composable pattern from L1 component inventory), not a monolithic `<Avatar src=...>`.
- **Auth in listing** — Session retrieved at page level, userId passed as prop through MemberQuery → searchDirectoryProfiles. No auth in components.

## Open decisions / blockers

- **Pre-existing type errors** — ~18 unrelated TS errors in dashboard/admin files (schema drift from S1 — `role` field removed from Membership, `difficulty` removed from Technique, Avatar API mismatch in member-card). Not in scope; noted for future cleanup session.
- **Member detail links** — member-card doesn't yet link to `/members/[slug]`. Needs slug on the card data.

## Review log

- `SESSION_0071_REVIEW_01` — All 3 tasks executed. New files type-check clean. L1 components used (Avatar, AvatarImage, AvatarFallback, Badge, H4, Link, Prose, Stack, Intro, IntroTitle, IntroDescription, Section). No raw HTML violations.

## ADR / ubiquitous-language check

- No new ADR needed.
- No new domain terms.

## Next session

### SESSION_0072 — Cody: Card-to-Detail Links + Pre-existing Type Error Cleanup

- **Goal:** Wire slug links from member-card/school-card to detail pages; fix pre-existing TS errors (schema drift cleanup).
- **Agent:** Cody
- **Inputs:** SESSION_0071, member-card.tsx, school-card.tsx, dashboard type errors list.
- **First task:** SESSION_0072_TASK_01 — Add `href` to member-card linking to `/members/[slug]`.
- **Prerequisite:** Unblocked.
