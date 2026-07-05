# ADR 0002 — Expo for mobile

**Status:** Accepted (Expo choice) · **Amended 2026-07-05 (SESSION_0501)** — the native **data-contract**
clause in the Decision below (`app/api/v1/*` via `packages/api-client`) is **superseded** by the
[2026-07-05 reconciliation](#2026-07-05-reconciliation--native-api-contract-session_0501) at the end of this
ADR. The Expo-at-`apps/mobile/` decision itself stands unchanged.
**Date:** 2026-04-25

## Context

Need iOS + Android from a fresh build, sharing a single Postgres backend with the web app. Dirstarter (Next.js) is web-only — mobile must be a separate app. Three candidate stacks: Capacitor + React (web shell), React Native CLI (bare), Expo (managed RN).

## Decision

Use **Expo** at `apps/mobile/`. ~~Mobile consumes the web app's `app/api/v1/*` routes via a typed client in `packages/api-client/`.~~ **(data-contract clause superseded — see the [2026-07-05 reconciliation](#2026-07-05-reconciliation--native-api-contract-session_0501); `app/api/v1/*` was never built and is not the current native contract.)** Auth handled by Better-Auth's mobile flow (or a JWT bridge if its mobile UX is thin) — settled by [ADR 0009](0009-mobile-auth-strategy.md) (Better-Auth mobile SDK), which still stands.

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

## 2026-07-05 Reconciliation — native API contract (SESSION_0501)

**Ratified by the operator, SESSION_0501.** This reconciles the stale data-contract clause in the Decision
above against the ratified oRPC direction (ADR 0024 / SOT-ADR D3). Decision input:
[`native-api-contract-research-review.md`](../native-api-contract-research-review.md) (Giddy, SESSION_0500).

### Why the original clause is stale

ADR 0002 (2026-04-25) predates the **FULL oRPC** decision (ADR 0024 / SOT-ADR D3) and was never reconciled
with it. As of SESSION_0501 the ground truth is:

- **`app/api/v1/*` was never built.** `apps/web/app/api/` holds `ai`, `auth`, `cron`, `og`, `printful`,
  `rpc`, `stripe` — no `v1`. The REST contract this ADR imagined does not exist.
- **oRPC is the one internal contract**, served at `/api/rpc` (`RPCHandler` over `appRouter`). Migration is
  early — ~4 of ~140 modules (`ping`, `health.brand`, `lineage`, `promotion`, `belt`); the rest are still
  server-actions. "FULL oRPC" is the destination, not the current state.
- **`packages/shared` does not exist** and **`packages/api-client` is an auth-only stub** — the "typed client
  consuming `api/v1`" is aspirational, not built.
- **The hybrid seam is already type-modeled**: `apps/web/server/orpc/context.ts` defines
  `Source = "rpc" | "openapi" | "rsc"` and documents `openapi` as `/api/v1/*` Bearer-auth;
  `apps/web/server/orpc/procedure.ts` already branches on `source`. A REST facade is a handler mount + an
  auth branch away — not a rewrite.

### Ratified direction — Option C (hybrid), deferred

**The native data contract is oRPC as the single internal contract, with a generated versioned
`/api/v1` OpenAPI facade mounted over the *same* `appRouter` — built only WHEN a native client actually
ships.** Rationale (full analysis in the research review §7):

- **One source of truth, two transports.** Procedures + zod schemas authored once; `RPCHandler` serves the
  web, oRPC's `OpenAPIHandler` (`@orpc/openapi`) serves native/3rd-party as versioned REST. No duplicate
  business logic — best fit for the ONE-kernel doctrine (ADR 0034/0040).
- **Real versioning at the boundary.** `/api/v1` is the stable, externally-safe contract; the internal RPC
  shape stays free to refactor. A shipped App Store binary can't be redeployed like `main`, so the versioned
  facade is the safety boundary that Option A (native-consumes-oRPC-directly) lacks.
- **Not premature.** The repo already *models* the `openapi` transport without serving it. Correct posture:
  **keep the seam, do NOT build `api/v1` until a real native client needs it (YAGNI).**

**Fallback (time-boxed):** if a native MVP must ship *before* the oRPC migration covers its surfaces AND
there are no 3rd-party/public-API consumers, use **Option A scoped to the already-migrated moat routers**
(`lineage`, `belt`, `promotion`) as a deliberate, time-boxed bridge — then graduate to the C facade before
the app is externally distributed. Option B (a hand-written duplicate REST surface) is rejected: duplicate
contract forever, worst-fit for a solo dev.

### Confirmed still standing

- **[ADR 0009](0009-mobile-auth-strategy.md) (Better-Auth mobile SDK)** — auth-transport-agnostic; holds
  under A, B, or C. The already-configured `oneTimeToken` plugin is the deep-link → session bridge.

### Do-regardless prerequisite (own future slice, not this session)

- **Extract `packages/shared`** — RN-safe zod schemas + domain types + pure helpers (no `next/*`, no
  `~/services/db`, no RSC) out of `apps/web/server/**`. De-risks *every* option and is useful even if native
  never ships. Slice it (first cut: `belt`/`lineage` schemas), don't big-bang. Tracked as a Giddy-scoped
  follow-up.

### Scope of this reconciliation

Docs-only. No Expo scaffolding, no `apps/mobile/`, no `api/v1` surface, no `packages/shared` extraction were
performed in SESSION_0501 — this amendment records the ratified *direction* so future native work starts from
the correct contract instead of re-deriving the fork or building a duplicate REST surface.
