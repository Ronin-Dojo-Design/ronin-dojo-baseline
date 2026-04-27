# @ronin-dojo/api-client

Typed client package for the Expo mobile app (`apps/mobile/`).

## Purpose

Provides the mobile auth client following the same `createAuthClient` pattern used in the web app (`apps/web/lib/auth-client.ts`). See [ADR 0009](../../docs/architecture/decisions/0009-mobile-auth-strategy.md).

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
