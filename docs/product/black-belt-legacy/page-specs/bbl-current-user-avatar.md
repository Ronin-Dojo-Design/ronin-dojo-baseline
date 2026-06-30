---
title: "server/web/account/current-user-avatar.ts"
slug: bbl-current-user-avatar
type: file
status: active
created: 2026-06-19
updated: 2026-06-19
author: Brian + Claude
last_agent: claude-session-0416
pairs_with:
  - product/black-belt-legacy/page-specs/bbl-nav-sheet
backlinks:
  - sprints/SESSION_0416
wiring:
  - "apps/web/lib/auth.ts — getServerSession"
  - "apps/web/lib/media.ts — resolveDisplayAvatar (server-only; pulls Prisma via services/s3)"
  - "apps/web/services/db.ts — db.passport.findFirst({ where: { userId } })"
  - "apps/web/app/(web)/layout.tsx — calls getCurrentUserAvatar(brand); passes to <Header userAvatarUrl=...>"
tags: [bbl, avatar, server, passport, identity, s6]
---

# server/web/account/current-user-avatar.ts

**Path:** `apps/web/server/web/account/current-user-avatar.ts`

The **server seam** that resolves the signed-in user's avatar for site chrome:
`Passport.avatarUrl ?? user.image`, falling back to the brand gi default for guests.

## Why it exists (the Prisma-in-browser rule)

The header + nav-sheet are **client** components; importing `resolveDisplayAvatar` (or
`lib/media`) there drags the Prisma client into the browser bundle → Turbopack build error
(`node:module` not bundleable). So the **layout** (server) calls this helper once and passes the
resolved string down: `layout.tsx → <Header userAvatarUrl> → <NavSheet userAvatarUrl>`. This is
the canonical pattern for surfacing Passport identity into client chrome.
