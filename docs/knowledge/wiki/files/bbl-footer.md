---
title: "_components/bbl-footer.tsx"
slug: bbl-footer
type: file
status: active
created: 2026-06-19
updated: 2026-06-19
author: Brian + Claude
last_agent: claude-session-0416
backlinks:
  - sprints/SESSION_0416
wiring:
  - "apps/web/app/(web)/layout.tsx — renders <BblFooter/> full-bleed (replaced the Dirstarter <Footer/>)"
  - "apps/web/components/common/link.tsx — Link (internal nav)"
  - "public/brand/blackbeltlegacy/bbl-logo-white.png — wordmark"
tags: [bbl, footer, chrome, global, s6]
---

# _components/bbl-footer.tsx

**Path:** `apps/web/app/(web)/_components/bbl-footer.tsx`

The **global BBL footer** (SESSION_0416) — replaces the Dirstarter `components/web/footer.tsx`
in `app/(web)/layout.tsx` (full-bleed, outside the `Container`). Dark (`bg-[#0a0a0a]`), BBL
fonts: brand column (logo + tagline + Instagram/Facebook/YouTube socials), three link columns
(**Lineage Network / Explore / Legal** — no programs link), contact bar, copyright bar.

## Provenance

Recovered from the reverted SESSION_0411 holding-page footer (commit `5413dc15`); socials
un-gated (`SHOW_SOCIAL` removed) and the link columns restored, pointed at live app routes.
The Dirstarter `footer.tsx` is now unused.
