---
title: "ADR 0009 — Mobile Auth Strategy: Better-Auth Mobile SDK"
slug: adr-0009-mobile-auth-strategy
type: decision
status: accepted
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0016
pairs_with:
  - docs/architecture/decisions/0002-expo-for-mobile.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/manual-boundary-registry.md
---

# ADR 0009 — Mobile Auth Strategy: Better-Auth Mobile SDK

**Status:** Accepted
**Date:** 2026-04-27
**Resolves:** MB-001 (Manual Boundary Registry)
**Supersedes:** The open decision branch in ADR 0002

## Context

ADR 0002 chose Expo for `apps/mobile/` and noted auth would be handled by "Better-Auth's mobile flow (or a JWT bridge if its mobile UX is thin)." Two options remained open:

- **Option A — Better-Auth mobile SDK:** Use `createAuthClient` from `better-auth/react` (or `better-auth/react-native`) in the mobile app. The mobile client talks to the same `/api/auth/*` endpoints as the web app. Session management is shared — same cookie/token contract, same server-side `auth` instance.

- **Option B — JWT bridge fallback:** Issue short-lived JWTs from a custom `/api/v1/auth/mobile-token` endpoint. Mobile stores the JWT, refreshes via a rotation endpoint. Server validates JWTs separately from Better-Auth sessions.

The decision was deferred until Better-Auth's mobile support matured and our auth foundation (S2) was stable.

## Decision

**Option A — Better-Auth mobile SDK.**

The mobile app at `apps/mobile/` will use `createAuthClient` from Better-Auth's React Native package, pointing at the same `NEXT_PUBLIC_SITE_URL/api/auth` base URL that the web app uses.

## Rationale

1. **One auth system, not two.** Dirstarter's `lib/auth.ts` already configures `betterAuth()` with plugins (magicLink, oneTimeToken, admin). The mobile client consumes the same server instance — no parallel token lifecycle to maintain.

2. **Dirstarter's proven pattern extends naturally.** Web uses `createAuthClient` in `lib/auth-client.ts` with `baseURL` pointing at the app. Mobile does the same with a React Native transport. No new server endpoints, no new middleware.

3. **Solo dev complexity budget.** JWT bridge requires: custom token signing, refresh rotation logic, revocation lists, separate session validation middleware. That's 4 new subsystems for a post-MVP mobile app that doesn't exist yet. Better-Auth SDK requires: one `createAuthClient` call with the right base URL.

4. **Better-Auth's React Native support is production-ready.** The library provides `better-auth/react` which works in React Native via `expo-secure-store` for token persistence.

5. **ADR 0002 already preferred this path.** JWT bridge was explicitly the fallback. The fallback condition ("Better-Auth's mobile UX is thin") no longer applies.

## Implementation Sketch (TASK_06)

Following Dirstarter's L1 patterns:

```typescript
// packages/api-client/src/auth.ts (or apps/mobile/lib/auth-client.ts)
import { createAuthClient } from "better-auth/react"
import { magicLinkClient } from "better-auth/client/plugins"

export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL, // e.g. https://baseline.local:3000
  plugins: [magicLinkClient()],
  // React Native: configure storage adapter for secure token persistence
  storage: {
    // expo-secure-store adapter
  },
})
```

The mobile auth client mirrors `dirstarter_template/lib/auth-client.ts` exactly — same function, same plugin pattern, different base URL and storage backend.

## Consequences

**Positive:**

- Zero new server-side code for mobile auth
- Session model is identical web/mobile — simplifies authorization logic
- Magic link login works on mobile (deep link → app → session established)
- Future plugins (social auth, passkeys) added once, work everywhere

**Negative:**

- Mobile app requires network access to the web app's auth endpoints (no offline-first auth)
- Deep link configuration required for magic link callback on iOS/Android
- If Better-Auth ever drops React Native support, we'd need to revisit (low risk — large community)

## Alternatives Rejected

**Option B — JWT bridge:** Rejected. Adds token signing, rotation, revocation, and a parallel validation path. Appropriate for third-party API consumers, not for a first-party mobile app owned by the same team.
