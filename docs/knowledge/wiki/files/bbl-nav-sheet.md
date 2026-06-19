---
title: "components/web/nav/nav-sheet.tsx"
slug: bbl-nav-sheet
type: file
status: active
created: 2026-06-19
updated: 2026-06-19
author: Brian + Claude
last_agent: claude-session-0416
pairs_with:
  - knowledge/wiki/files/bbl-current-user-avatar
backlinks:
  - sprints/SESSION_0416
wiring:
  - "apps/web/components/web/header.tsx — renders <NavSheet userAvatarUrl=.../> (header is 'use client')"
  - "apps/web/app/(web)/layout.tsx → getCurrentUserAvatar → Header → NavSheet (the avatar prop chain)"
  - "apps/web/components/web/auth/login-dialog.tsx — LoginDialog (Sign In opens it; magic link)"
  - "apps/web/config/brand-features.ts — brandHasFeature filter on PRIMARY_NAV_ITEMS"
tags: [bbl, nav, drawer, chrome, avatar, s6]
---

# components/web/nav/nav-sheet.tsx

**Path:** `apps/web/components/web/nav/nav-sheet.tsx`

The **right slide-in nav** (client `Sheet`). SESSION_0416 curation:

- **Curated links** (BBL): Lineage · Directory · Members · Schools · Curriculum · Techniques ·
  Posts · Blog · About. (Cut: Organizations, Disciplines, Tournaments, Courses, Gear, Merch,
  Programs.)
- **Avatar** = `userAvatarUrl` prop (server-resolved `Passport.avatarUrl ?? user.image`); guests
  + avatar-less users get the inlined `BBL_GI_AVATAR` (`/brand/bbl/default-black-belt.png`).
  **Never** import `lib/media`/`resolveDisplayAvatar` here — it pulls Prisma into the client
  bundle (the gi path is inlined instead).
- **Create Account** → `/lineage/join`. **Sign In** → opens `<LoginDialog>` (closes the sheet
  first; the dialog is mounted **outside** the `Sheet` so it survives the close).
