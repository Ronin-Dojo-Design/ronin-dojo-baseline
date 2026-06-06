# ADR 0002 — Expo for mobile

**Status:** Accepted
**Date:** 2026-04-25

## Context

Need iOS + Android from a fresh build, sharing a single Postgres backend with the web app. Dirstarter (Next.js) is web-only — mobile must be a separate app. Three candidate stacks: Capacitor + React (web shell), React Native CLI (bare), Expo (managed RN).

## Decision

Use **Expo** at `apps/mobile/`. Mobile consumes the web app's `app/api/v1/*` routes via a typed client in `packages/api-client/`. Auth handled by Better-Auth's mobile flow (or a JWT bridge if its mobile UX is thin).

## Consequences

### Positive

- Best-in-class DX for solo dev: OTA updates via EAS Update, managed builds via EAS Build, Expo Router for file-based routing.
- React Native ecosystem (Reanimated, Gesture Handler, Skia) for native feel.
- Web/mobile share zod schemas and types via `packages/shared/`, but NOT screens — RN doesn't render in browsers.

### Negative

- Cannot deploy mobile UI to the WP site as a shortcode (was never on the table once WP was dropped, but worth recording).
- Two UI codebases to evolve in parallel (web in Next.js, mobile in RN).

## Alternatives considered

- **Capacitor + React (web shell):** one codebase to web + iOS/Android, but app-feel suffers and tight coupling between mobile UX and web routing constrains both. Rejected for app workload.
- **React Native CLI (bare):** more native config control. Rejected: solo dev doesn't need the lower-level access; EAS managed flow wins.
