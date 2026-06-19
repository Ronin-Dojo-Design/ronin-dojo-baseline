---
title: "lineage/join/join-legacy-landing.tsx"
slug: bbl-join-landing-composition
type: file
status: active
created: 2026-06-19
updated: 2026-06-19
author: Brian + Claude
last_agent: claude-session-0416
pairs_with:
  - knowledge/wiki/files/bbl-home-landing
  - knowledge/wiki/files/bbl-join-form-wizard
backlinks:
  - sprints/SESSION_0416
wiring:
  - "apps/web/app/(web)/_components/bbl-teaser/phone-marquee.tsx — PhoneMarquee (scrolling-phone hero bg)"
  - "apps/web/app/(web)/_components/bbl-teaser/bbl-teaser-types.ts — HERO_IMAGES, BBL_LOGO_WHITE, MarqueeColumn"
  - "apps/web/app/(web)/_components/bbl-teaser/email-capture.tsx — EmailCapture (bottom-of-page signup)"
  - "apps/web/app/(web)/lineage/join/join-legacy-form.tsx — JoinLegacyForm (the claim wizard, in the drawer)"
  - "apps/web/app/(web)/(home)/bbl/bbl-landing-content.ts — heroContent/value props/features/faq content"
tags: [bbl, landing, composition, client, hero, s6]
---

# lineage/join/join-legacy-landing.tsx

**Path:** `apps/web/app/(web)/lineage/join/join-legacy-landing.tsx`

The shared **landing composition** (client) rendered by both `/` (`bbl-join-landing`) and
`/lineage/join`. Section order (SESSION_0416): **scrolling-phone hero** (logo + headline +
Claim/Join CTAs + "Explore the lineage" → `/lineage/bbl-lineage`) → **Rigan** (`riganSlot`) →
**Rigan video** (`videoSlot`) → value props / features / FAQ / final CTA → **EmailCapture** →
the **Join drawer** (opens `JoinLegacyForm`).

## Type treatment

Root applies the BBL heading-scope class so every `h1/h2` (incl. the slotted `H2`s) is
Poppins **800 italic uppercase**; the local `HEADING` const carries `font-extrabold`.

## Slots, not imports

`riganSlot` (`<BblHeritage>`) and `videoSlot` (`<BblVideo>`) are **server components** passed
as props — never imported into this client file.
