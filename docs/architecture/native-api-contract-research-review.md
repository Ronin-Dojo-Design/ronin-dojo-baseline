---
title: "Native mobile API contract — oRPC vs REST api/v1 (research review)"
slug: native-api-contract-research-review
type: research
status: draft
created: 2026-07-05
updated: 2026-07-05
last_agent: giddy-session-0500
author: giddy
supersedes_input_for:
  - docs/architecture/decisions/0002-expo-for-mobile.md
pairs_with:
  - docs/architecture/decisions/0009-mobile-auth-strategy.md
  - docs/knowledge/wiki/orpc-decision-adr-0024.md
backlinks:
  - docs/sprints/SESSION_0500.md
---

# Native mobile API contract — oRPC vs REST `api/v1`

**Status: draft research review — decision input for the operator. NOT a ratified ADR.**
This document analyzes options for the API contract the future Expo native app
(`apps/mobile/`) will consume. It does not scaffold the app, change code, or ratify a
direction. It exists to let the operator pick a lane before the native client is built.

---

## 1. Current state (grounded)

### 1.1 What the API surface actually is today

- **oRPC is the internal RPC transport, served at one route.** A single catch-all handler
  wraps `appRouter` with `@orpc/server`'s `RPCHandler`, prefix `/api/rpc`
  (`apps/web/app/api/rpc/[[...rest]]/route.ts:1-30`). Web clients call it through
  `createORPCClient` + `RPCLink` with `credentials: "include"`
  (`apps/web/lib/orpc-client.ts:1-23`) and TanStack Query utils
  (`apps/web/lib/orpc-query.ts:1-4`).
- **The oRPC migration is early — ~4 surfaces, not the whole app.** `appRouter` currently
  exposes only `ping`, `health.brand`, `lineage`, `promotion`, `belt`
  (`apps/web/server/router.ts:29-40`). The rest of the domain — **~140 modules** under
  `apps/web/server/web/*` and `apps/web/server/admin/*` — is still **server actions /
  next-safe-action** (~90 `"use server"` files; 21 files still reference next-safe-action).
  So "FULL oRPC" (ADR 0024 / SOT-ADR D3) is the *destination*, not the *current state*.
- **`app/api/v1/*` does not exist.** `apps/web/app/api/` contains `ai`, `auth`, `cron`,
  `og`, `printful`, `rpc`, `stripe` — **no `v1`** (verified by directory listing). The
  REST public contract ADR 0002 imagined was **never built**.
- **oRPC's own context already models a REST transport.** `apps/web/server/orpc/context.ts:7-11`
  defines `Source = "rpc" | "openapi" | "rsc"` and documents `openapi` as
  *"REST-style HTTP via `/api/v1/*` (Bearer-auth public API)"*. The rate-limit and auth
  middleware already branch on `source` (`apps/web/server/orpc/procedure.ts:52-66`). **The
  hybrid facade is pre-wired into the type system but not yet served** — no `OpenAPIHandler`
  is mounted.

### 1.2 The ADR 0002 ↔ full-oRPC contradiction, stated plainly

- **ADR 0002 (2026-04-25)** says mobile "consumes the web app's `app/api/v1/*` routes via a
  typed client in `packages/api-client/`" (`docs/architecture/decisions/0002-expo-for-mobile.md:12`).
- **ADR 0024 / SOT-ADR D3** then chose **FULL oRPC** over `server/orpc/*` + `app/api/rpc`,
  retiring next-safe-action ([[orpc-decision-adr-0024]]).
- **These contradict.** ADR 0002 assumes a REST `api/v1` as the native contract; the oRPC
  decision made oRPC the one internal contract and never built `api/v1`. ADR 0002 predates
  the oRPC decision and was **never reconciled**. The `packages/api-client` README and ADR
  0009 still point at the old shape (see §1.3). **This review's job is to resolve that fork
  before native work starts.**

### 1.3 What's actually shareable web↔native today

- **`packages/api-client` is a stub, not a client.** It contains only a Better-Auth mobile
  wrapper (`packages/api-client/src/auth.ts`) — `createMobileAuthClient` calling
  `better-auth/react`'s `createAuthClient`. It has **no API/data client** and no dependency
  on the router types. Its README still describes consuming `app/api/v1/*`.
- **`packages/shared` does not exist.** ADR 0002's "share zod/types via `packages/shared/`"
  is **aspirational** — the directory is absent (`packages/` holds only `api-client` and
  `ui-kit`).
- **Zod schemas live inside `apps/web`, not in a shared package.** Each migrated router keeps
  its schemas locally, e.g. `apps/web/server/belt/schemas.ts:1` (`import { z } from "zod"`),
  `apps/web/server/lineage/storyboard-schemas.ts`. The schemas themselves are **pure zod and
  RN-portable**, but the **routers that use them import Prisma/Next** (e.g.
  `apps/web/server/belt/router.ts:24-27` imports `~/services/db`), so the router modules are
  **not** importable from React Native. Only the schema files are.
- **oRPC is on a mature line.** `@orpc/{client,server,shared,tanstack-query}@^1.14.3`, zod
  `^4.4.3` (`apps/web/package.json`). oRPC ships a separate `OpenAPIHandler` +
  `OpenAPIGenerator` (`@orpc/openapi`) that can serve the **same router** as a REST/OpenAPI
  API, and a fetch-based `@orpc/client` — both relevant below. `@orpc/openapi` is **not yet
  installed**.

### 1.4 Auth reality

- **Better Auth, cookie-session first.** `apps/web/lib/auth.ts` configures `betterAuth()`
  with `prismaAdapter`, plugins `magicLink`, `oneTimeToken`, `admin`
  (`apps/web/lib/auth.ts:5,198-231`), `cookieCache.enabled` session
  (`apps/web/lib/auth.ts:125-131`), and brand `trustedOrigins`. The web oRPC client relies on
  the **cookie** (`credentials: "include"`).
- **A bridge primitive already exists.** The `oneTimeToken` plugin is configured — the exact
  primitive a native client would use to exchange a magic-link/deep-link for a session
  without a browser cookie jar.
- **ADR 0009 already picked Better-Auth mobile SDK** (Option A) over a JWT bridge
  (`docs/architecture/decisions/0009-mobile-auth-strategy.md:33-49`): same `/api/auth/*`
  endpoints, `createAuthClient` from `better-auth/react`, `expo-secure-store` storage. That
  decision is **auth-transport agnostic** — it holds regardless of whether data flows over
  oRPC or REST.

---

## 2. Option A — native consumes oRPC directly

Native app uses `@orpc/client` + `RPCLink` against `/api/rpc`, typed by importing
`AppRouter` (`apps/web/server/router.ts:42`, `export type AppRouter`).

**Pros**
- **End-to-end type safety, zero codegen.** `RouterClient<AppRouter>` gives the native app
  the exact input/output types the web app has — same pattern as `orpc-client.ts:22`.
- **One contract to evolve.** No second surface; the native app rides the same router the
  web already uses. Best fit for the DRY / ONE-kernel doctrine.
- **Fetch-based client is RN-friendly.** `@orpc/client/fetch`'s `RPCLink` is a fetch
  transport with no browser-only deps; RN provides `fetch`.
- **Cheapest to start** if you accept the coupling — the client is ~20 lines.

**Cons**
- **Couples the native app to the web's internal RPC shape.** oRPC's RPC protocol is a
  private wire format, not a documented REST contract. A native binary in the App Store
  pins to a router shape that the web app refactors freely. **This is the core risk** —
  shipped native binaries can't be redeployed like `main`.
- **No versioning story out of the box.** RPC procedures aren't versioned; renaming
  `belt.*` or changing a schema is a silent breaking change for any old app build.
- **Type-import coupling needs the types to be reachable from RN.** `AppRouter` is defined
  in `apps/web/server/router.ts`, which transitively imports Prisma/Next router modules. The
  native app can `import type` (types erase at build), but the tooling/tsconfig path must be
  set up so a **type-only** import doesn't drag runtime code. Non-trivial but doable.
- **Only ~4 surfaces exist on oRPC today** (§1.1). Native would either wait for the
  migration or be limited to `lineage`/`belt`/`promotion`.

**External-client stability: weak.** RPC is a first-party, same-deploy contract. Fine when
client and server ship together (web); risky for an independently-shipped native binary.

---

## 3. Option B — dedicated REST `api/v1` for native (ADR 0002's vision)

Build hand-written REST routes under `apps/web/app/api/v1/*`; native consumes them via a
typed client in `packages/api-client`.

**Pros**
- **Clean, documented, public contract.** REST is legible to any consumer (native, future
  3rd-party, webhooks). Decoupled from internal RPC churn.
- **Versionable by construction** — `/api/v1`, `/api/v2`; old app builds keep working.
- **Bearer-auth is natural** for a REST public API (the `openapi`/Bearer path the context
  already anticipates, `context.ts:9`).

**Cons**
- **Duplicate surface to maintain** — every native-needed endpoint is written twice (once as
  oRPC/server-action for web, once as REST). Directly violates DRY and the ONE-kernel
  doctrine; worst-fit for a solo dev.
- **Loses oRPC's inference.** You hand-write request/response types and a client, or
  hand-maintain an OpenAPI spec. The `packages/api-client` typed client becomes real work,
  not a stub.
- **Premature.** `api/v1` doesn't exist and no native app consumes it. Building it now is
  speculative surface with a maintenance tax and no user. **YAGNI.**
- **Drift risk.** Two hand-kept contracts diverge over time unless generated from one source.

**External-client stability: strong** — but bought with duplication.

---

## 4. Option C — hybrid (oRPC internal + generated versioned `api/v1` facade)

Keep oRPC as the single internal contract. When native is real, mount oRPC's
**`OpenAPIHandler`** (from `@orpc/openapi`) on the **same `appRouter`** at `/api/v1/*`, and
generate an OpenAPI spec with `OpenAPIGenerator`. Native consumes the REST/OpenAPI surface
(or an oRPC OpenAPI-link client); the web keeps using `RPCHandler` at `/api/rpc`.

**This is the shape the repo already anticipates** — `context.ts:7-11` defines the `openapi`
source as `/api/v1/*` Bearer-auth, and `procedure.ts` branches on `source`. The facade is a
handler mount + auth branch away, **not** a rewrite.

**Pros**
- **One source of truth, two transports.** Procedures + zod schemas are authored once;
  `RPCHandler` serves the web, `OpenAPIHandler` serves native/3rd-party as REST. No
  duplicate business logic. Best fit for ONE-kernel doctrine (ADR 0034/0040).
- **Real versioning at the boundary** — the `/api/v1` REST facade is the stable, documented,
  externally-safe contract; the internal RPC shape stays free to refactor.
- **Generated OpenAPI** → typed native client without hand-writing it; feeds
  `packages/api-client` for free.
- **Auth already modeled** — Bearer on the `openapi` source, cookie on `rpc`, in-process on
  `rsc` (`context.ts`, `procedure.ts`).

**Cons**
- **Requires the oRPC migration to progress** — only ~4 surfaces are on oRPC; a REST facade
  only exposes what's on the router. Native-critical reads (lineage, belt) are already
  migrated, which happens to be the moat surface.
- **OpenAPIHandler needs REST-shaped routes.** oRPC procedures need `.route()` metadata
  (method/path) to produce clean REST — a modest annotation pass, not a rewrite.
- **`@orpc/openapi` not yet installed** — one dependency + one handler mount + an auth branch.
- **Slightly more moving parts than "just RPC"** — but no *duplicate contract*.

**External-client stability: strong, without duplication** — the win Option B pays double for.

---

## 5. Auth for native across the options

- **ADR 0009 already decided the auth transport: Better-Auth mobile SDK (Option A), not a
  custom JWT bridge** (`docs/architecture/decisions/0009-mobile-auth-strategy.md:33-49`).
  That decision is **orthogonal to the data-contract choice** — it holds under A, B, or C.
- **Session shape native needs:** the web oRPC client leans on a **cookie**
  (`credentials: "include"`, `orpc-client.ts:16`). A native app has no browser cookie jar,
  so it needs **bearer-token session** persistence via `expo-secure-store` — exactly ADR
  0009's sketch (`0009:55-70`) and the `packages/api-client` auth stub
  (`packages/api-client/src/auth.ts`).
- **The `oneTimeToken` plugin (already configured, `auth.ts:5,225-229`) is the deep-link
  bridge** — magic link opens the app, the app exchanges a one-time token for a stored
  session. No new auth subsystem required.
- **Per-option nuance:**
  - **A (oRPC):** the RPC transport must send the bearer token; `RPCLink.fetch` takes a
    custom `fetch`/headers hook (mirror `orpc-client.ts:14-19`) to inject `Authorization`.
  - **B (REST):** Bearer on `/api/v1/*` — clean, standard.
  - **C (hybrid):** Bearer on the `openapi` source, which `context.ts:9` and the middleware
    already anticipate — **least new auth code.**

---

## 6. Type / logic sharing — where zod + domain schemas should live

- **Today:** schemas are pure zod but **live inside `apps/web/server/**`** (e.g.
  `apps/web/server/belt/schemas.ts`), co-located with Prisma/Next-bound routers. RN can't
  import the routers; it *can* import type-only from them, but that's fragile.
- **Target regardless of A/B/C:** a **`packages/shared`** (the one ADR 0002 named but never
  created) holding **RN-safe zod schemas + domain types + pure helpers** — no Next, no
  Prisma, no RSC. Both `apps/web` routers and the native client import from it. This is the
  single-source-of-truth move that makes *any* option cheaper.
- **Constraint:** anything RN imports must be free of `next/*`, `~/services/db`, and RSC.
  Extraction is mechanical (move schema files, repoint imports) but touches many call sites —
  slice it, don't big-bang it.
- **`packages/api-client` becomes the transport layer** (auth client + data client),
  depending on `packages/shared` for types. Today it's an auth-only stub.

---

## 7. Recommendation

**Lean: Option C (hybrid) — oRPC as the one internal contract, a generated versioned
`/api/v1` OpenAPI facade over the *same* router when native actually ships. Do NOT build
`api/v1` now.**

Reasoning:
- **Solo-dev maintenance cost.** C authors business logic **once**. B doubles the surface
  forever; A is cheap now but pays in native-binary breakage later. C is the only option
  with *both* a stable external contract *and* no duplication.
- **Platform doctrine (ADR 0034/0040).** ONE kernel + modules → ONE contract, many
  transports. C is the doctrinal answer; B is an accidental second authority; A leaks the
  internal shape as the external contract.
- **External-contract stability.** A shipped App Store binary can't be redeployed like
  `main`. C's versioned REST facade is the safety boundary A lacks and B over-pays for.
- **Not prematurely building `api/v1`.** The repo already *models* the `openapi` transport
  (`context.ts:7-11`) without serving it. That's the correct posture — **keep the seam,
  don't build the surface until a real native client needs it.** YAGNI holds.

**Fallback:** if a native MVP must ship *before* the oRPC migration covers its surfaces, use
**Option A scoped to the already-migrated moat routers** (`lineage`, `belt`, `promotion`),
accepting the coupling as a **deliberate, time-boxed** measure, and graduate to C's facade
before the app is externally distributed / opened to 3rd parties.

### Smallest next step to de-risk (NO Expo scaffolding)

1. **Reconcile the ADRs (docs only).** Amend ADR 0002 to record that `app/api/v1` was never
   built and that the native contract is **deferred to this review**; note the hybrid seam
   already present in `context.ts`. Confirm ADR 0009 (Better-Auth SDK) still stands — it does.
2. **Fix the stale pointers.** `packages/api-client/README.md` and ADR 0009's sketch still
   reference `app/api/v1/*` as if it exists; mark them "planned, see this review."
3. **(Optional, low-risk spike, no app):** install `@orpc/openapi` in `apps/web` and mount an
   `OpenAPIHandler` + `OpenAPIGenerator` over the existing 4-surface `appRouter` at a scratch
   route to **prove the hybrid facade + OpenAPI spec generation** end-to-end. Throwaway; no
   native code, no `api/v1` commitment.
4. **Extract `packages/shared`** (first slice: move `belt`/`lineage` zod schemas out of
   `apps/web/server/**` into a Next/Prisma-free package). This de-risks **every** option and
   is useful even if native never ships. Do it as its own Giddy-scoped slice.

---

## 8. Open questions / forks for the operator

- **Timing.** Is native imminent, or post-MVP? If **imminent-before-migration** → Option A
  (scoped, time-boxed). If **post-MVP** → Option C, no rush.
- **3rd-party / public API ambition.** Any intent to expose the lineage graph to external
  developers or partners? **Yes → C now** (the versioned facade is mandatory). No → C later,
  A as a bridge.
- **How much of the app must the native client cover?** Moat only (lineage/belt) → A is
  viable today. Broad parity → wait for oRPC migration, then C.
- **Trigger to pick A:** a native MVP dated before the oRPC migration reaches its surfaces,
  and no external/3rd-party consumers.
- **Trigger to pick B:** only if oRPC's `OpenAPIHandler`/`@orpc/openapi` proves inadequate in
  the §7.3 spike (unlikely on v1.14.x) *and* a REST contract is required — i.e. C fails.
- **Trigger to commit C:** the spike proves OpenAPI generation from the router works, and
  native is real. This is the expected path.
- **Prereq for all of them:** `packages/shared` extraction — do this regardless.

---

## Appendix — comparison table

| Dimension | A — oRPC direct | B — REST `api/v1` | C — hybrid (oRPC + OpenAPI facade) |
|---|---|---|---|
| Type safety end-to-end | Best (native) | Manual / codegen | Generated (OpenAPI) |
| Duplicate surface | None | **Yes (2x)** | None (1 router, 2 transports) |
| Versioning / external stability | Weak (private wire) | Strong | Strong (versioned facade) |
| Couples native to internal shape | **Yes** | No | No |
| Solo-dev maintenance cost | Low now / risk later | **High (perpetual)** | Low-moderate |
| Doctrine fit (ADR 0034/0040) | Leaks internal contract | Second authority | **Best (ONE contract)** |
| Auth | Bearer via `RPCLink.fetch` | Bearer (REST) | Bearer on `openapi` source (pre-modeled) |
| Exists / build cost today | Client ~20 LOC; ~4 surfaces | **Build from zero** | 1 dep + handler mount + `.route()` pass |
| Premature? | No | **Yes (YAGNI)** | No — seam kept, surface deferred |
| Repo readiness | Router types exist | Nothing built | `context.ts` already models it |

*Citations: `apps/web/app/api/rpc/[[...rest]]/route.ts`, `apps/web/lib/orpc-client.ts`,
`apps/web/server/router.ts`, `apps/web/server/orpc/context.ts`,
`apps/web/server/orpc/procedure.ts`, `apps/web/lib/auth.ts`,
`apps/web/server/belt/schemas.ts`, `packages/api-client/src/auth.ts`,
`docs/architecture/decisions/0002-expo-for-mobile.md`,
`docs/architecture/decisions/0009-mobile-auth-strategy.md`.*
