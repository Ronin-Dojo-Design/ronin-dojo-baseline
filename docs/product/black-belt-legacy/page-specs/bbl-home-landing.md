---
title: "(home)/bbl-join-landing.tsx"
slug: bbl-home-landing
type: file
status: active
created: 2026-06-19
updated: 2026-06-19
author: Brian + Claude
last_agent: claude-session-0416
pairs_with:
  - product/black-belt-legacy/page-specs/bbl-join-landing-composition
backlinks:
  - sprints/SESSION_0416
wiring:
  - "apps/web/app/(web)/(home)/page.tsx — renders <BblJoinLanding/> for Brand.BBL (was <BblLanding/>)"
  - "apps/web/app/(web)/lineage/join/join-legacy-landing.tsx — JoinLegacyLanding (the shared composition)"
  - "apps/web/app/(web)/(home)/bbl/bbl-landing/bbl-heritage.tsx — BblHeritage (Rigan slot)"
  - "apps/web/app/(web)/(home)/bbl/bbl-landing/bbl-video.tsx — BblVideo (Rigan YouTube slot)"
  - "apps/web/app/(web)/(home)/bbl/bbl-landing/bbl-rank-colors.ts — getStaticBblRankColors (belt badge)"
  - "apps/web/server/web/billing/lineage-membership.ts — findLineageMembershipPlans"
  - "apps/web/services/db.ts — db.lineageTree.findFirst (claimable tree, generic)"
tags: [bbl, landing, home, page, ssr, s6]
---

# (home)/bbl-join-landing.tsx

**Path:** `apps/web/app/(web)/(home)/bbl-join-landing.tsx`

The **BBL home / main landing** (SESSION_0416). Server component that fetches the
generic claimable tree + membership plans + rank colors, then renders the shared
`JoinLegacyLanding` composition with the Rigan + video server-rendered slots. The
`/lineage/join` route keeps its own copy (preselect-node variant); this is the no-`?node`
variant promoted to `/`.

## Why this is the SOT for the BBL landing

- The home page (`(home)/page.tsx`) renders **this** for `Brand.BBL` — `<BblLanding/>`
  (the older 15-section composer) is retired from the home route.
- Sits **behind the countdown gate** — only the bob-tony preview cookie sees it; the public
  still hits `<BblTeaserPage/>`. The gate (`app/(web)/layout.tsx`) is untouched.
- Section order: scrolling-phone hero → Rigan heritage → Rigan video → claim wizard → email capture.

## Server/client boundary

`BblHeritage` + `BblVideo` are server components passed as **slots** (props) into the client
`JoinLegacyLanding` — the correct Next pattern (never import them into the client tree).
