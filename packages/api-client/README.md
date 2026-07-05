# @ronin-dojo/api-client

Typed client package for the Expo mobile app (`apps/mobile/`).

## Purpose

Provides the mobile auth client following the same `createAuthClient` pattern used in the web app (`apps/web/lib/auth-client.ts`). See [ADR 0009](../../docs/architecture/decisions/0009-mobile-auth-strategy.md).

> **Scope today: auth stub only.** This package currently ships *only* the Better-Auth mobile wrapper — no
> data/API client. The original ADR 0002 plan (a typed client consuming `app/api/v1/*`) is **superseded**:
> `app/api/v1/*` was never built, and the ratified native data contract is **oRPC-internal + a generated
> versioned `/api/v1` OpenAPI facade, deferred until a native client ships** (Option C hybrid — see the
> [ADR 0002 reconciliation](../../docs/architecture/decisions/0002-expo-for-mobile.md#2026-07-05-reconciliation--native-api-contract-session_0501)
> and [research review](../../docs/architecture/native-api-contract-research-review.md)). When native is
> real, the data client added here consumes that facade and imports types from a future `packages/shared`.

## Usage

```typescript
import { createMobileAuthClient } from "@ronin-dojo/api-client/auth"

const auth = createMobileAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
})

// auth.signIn, auth.signOut, auth.useSession — same API as web
```

## L1 Pattern Reference

This package mirrors `dirstarter_template/lib/auth-client.ts`. The only differences:

- **Base URL** — comes from Expo env vars instead of Next.js env
- **Storage** — will use `expo-secure-store` for token persistence (added when `apps/mobile/` is scaffolded)
- **No SSR** — React Native doesn't need server-side session helpers
