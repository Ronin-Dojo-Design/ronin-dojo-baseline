---
title: "SESSION 0368 — BBL brand feature gate (lineage-first launch, SOT-ADR D9)"
slug: session-0368
type: session--implement
status: in-progress
created: 2026-06-12
updated: 2026-06-12
last_agent: claude-session-0368
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0367.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0368 — BBL brand feature gate (lineage-first launch, SOT-ADR D9)

## Date

2026-06-12

## Operator

Brian + claude-session-0368

## Goal

Operator: strip non-lineage features from BBL **without deleting them** so they can return later;
DNS cutover ASAP, done right. Grill held in-chat (grill-me) → SOT-ADR **D9**: static per-brand
feature allowlist + central proxy 404 gate + nav/footer/dashboard/landing sweep. Early DNS flip
ratified (Phase 3 becomes the D7 user-carry migration).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0367.md` (BBL landing closed, `23a5a4f`).
- Carryover: D8 cutover-arm continues; operator redirected from 2b wave 3 to the gating slice.

### Branch and worktree

- Branch: `session-0368-brand-feature-gating` (off `main` @ `c226216`)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `c226216`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | proxy middleware, header/footer nav, listings detail page, dashboard tabs, home composition |
| Extension or replacement | Extension: per-brand allowlist layered on the existing brand resolution path (MB-002 single source) |
| Why justified | SOT-ADR D9 (operator grill): BBL launches lineage-first; nothing deleted; one-line re-enable |
| Risk if bypassed | BBL flips with off-brand features (Dirstarter listings rail, tournaments, gear) visible on day one |

### Grill outcome (grill-me, this chat — recorded as SOT-ADR D9)

- **Scope:** BBL keeps lineage(+join/entitlements), directory, members, schools, organizations,
  events, certificates, **posts + blog** (operator has content ready in
  `RONIN_DOJO-Baseline/00_Inbox/`). Gates off: tournaments, courses, programs, disciplines
  (browse), techniques, gear, merch, advertise, submit, listings (`/categories`,`/tags`,`/[slug]`).
- **Behavior:** HTTP 404 (operator-ratified) via proxy rewrite to a non-route.
- **Mechanism:** static `config/brand-features.ts` (no schema; brands without an entry = all
  features) — operator accepted recommendation.
- **Early flip ratified:** D8 post-Phase-3 default superseded; Phase 3 = D7 user-carry.
- **Pre-flip gate:** this slice → stripe@22 rehearsal → OG/meta + robots/sitemap hygiene →
  minimal 301 map → prod render verify.
- **Content:** ingest from the three 00_Inbox BBL files (not flip-blocking; one is a 51-byte stub).

## Petey plan

### Goal

Gated routes 404 on bbl.local, kept routes 200, every nav surface shows only the allowlist,
Baseline byte-identical behavior; gates + browser proof + PR.

### Tasks

#### SESSION_0368_TASK_01 — Allowlist config + proxy gate + surface sweep

- **Agent:** Cody (inline)
- **What:** `config/brand-features.ts` (+ pure tests), proxy.ts rewrite gate, `[slug]` in-page
  listings gate, header/NavSheet/footer/bottom-rail/dashboard-tab sweeps, landing techniques
  promo → Coming Soon, SOT-ADR D9.
- **Done means:** curl matrix (404 gated / 200 kept / Baseline 200), nav link assertions on live
  DOM, zero console errors, gates green, PR + CI.
- **Depends on:** nothing

### Open decisions

None — grill resolved all forks.

### Risks

- Generated-enum value imports are browser-fatal (hit during build — see Reflections).
- e2e runs on localhost (Baseline) in CI, so the BBL-side gate is covered by unit tests + local
  browser proof, not CI e2e (acceptable: gate logic is pure + middleware is 6 lines).

### Scope guard

- NOTHING deleted; no schema; no entitlement/Stripe logic changes; `/admin` + `/app` untouched.
- No robots/sitemap/OG work (next pre-flip slice). No content ingest (separate task).

### Dirstarter implementation template

- **Docs read first:** not applicable (repo-internal seams: proxy.ts brand resolution, MB-002).
- **Baseline pattern to extend:** middleware brand resolution + `getRequestBrand`/`useBrand`.
- **Custom delta:** feature allowlist + route gate; brand-neutral default-all.
- **No-bypass proof:** gate layered on the canonical brand path; no second resolution map.

## Cody pre-flight

1. **Existing component scan:** proxy.ts, brand-context (server+client), site config,
   header/footer/NavSheet, bottom rail, dashboard tabs, global search — all read directly.
2. **L1 template scan:** no new primitives; conditional rendering only.
3. **Composition decision:** one config module consumed everywhere; no per-page guards except
   the structurally-required `[slug]` in-page gate.
4. **Lane docs loaded:** SOT-ADR D6–D8, SESSION_0361 §Q4, SESSION_0367 close.
5. **Dev environment:** dev server live on bbl.local:3000 (from 0366).
6. **FAILED_STEPS check:** FS-0002 acknowledged (no installs).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0368_TASK_01 | landed | Allowlist + proxy gate + sweeps live. Curl matrix: 7 gated routes + random tool slug → 404 on bbl.local; 7 kept routes → 200; Baseline tournaments/programs/gear → 200 + SSR still renders gated-feature links. Live-DOM: header/sheet/footer show only allowlist (+ /posts added to sheet/footer — was never linked); Coming Soon badge on techniques promo; 0 console errors. One build break found+fixed: value-import of the Brand enum in a client-imported module pulled Prisma runtime into the browser (500s everywhere) → type-only import + literal key. |

## What landed

<!-- bow-out -->

## Decisions resolved

- SOT-ADR **D9** added (scope/mechanism/behavior/flip timing) — supersedes D8's flip default.
- `/posts` gained nav entries (sheet + footer Quick Links, feature-gated) — it was previously
  reachable only from the landing promo.

## Files touched

| File | Change |
| --- | --- |
| `config/brand-features.ts` (+`.test.ts`) | NEW — allowlist, `brandHasFeature`, route-prefix map; 5 pure tests |
| `proxy.ts` | feature gate: prefix match + rewrite → `/_gated` (404), brand headers forwarded |
| `app/(web)/[slug]/page.tsx` | in-page listings gate (root catch-all can't prefix-gate) |
| `components/web/{header,footer,nav/nav-sheet,bottom}.tsx` | nav/search/rail sweeps via `useBrand`+`brandHasFeature`; NavSheet nav now data-driven |
| `app/(web)/dashboard/page.tsx` | techniques + listings tabs and quick-links gated |
| `app/(web)/(home)/bbl/*` | techniques promo → Coming Soon (no dead links) |
| `messages/en/navigation.json` | `posts` label |
| `docs/product/black-belt-legacy/SOT-ADR.md` | D9 |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | EXIT 0 |
| `bun test config/brand-features.test.ts` | 5 pass / 0 fail (96 assertions) |
| `bun run lint:check` / `format:check` | clean (pre-existing warnings only) |
| Curl matrix bbl.local | gated ×8 → 404; kept ×7 → 200 |
| Curl matrix localhost (Baseline) | tournaments/programs/gear → 200; SSR renders gated links |
| Live DOM bbl.local | header links = {/, /about, /lineage/join, /auth/login}; sheet = allowlist; Coming Soon ×1; techniques/tournaments links ×0; console errors 0 |

## Open decisions / blockers

- Pre-flip remainder: stripe@22 rehearsal → OG/meta + robots/sitemap hygiene → 301 map → prod
  render verify (D9 order).
- Content ingest from 00_Inbox (posts/blog) — not flip-blocking.
- Post-flip: 2b wave 3+, 2c, Phases 3–5 (Phase 3 = user-carry per D9).

## Next session

### Goal

Next pre-flip gate item: stripe@22 test-mode rehearsal (lineage membership checkout), then
OG/meta + robots/sitemap hygiene for BBL.

### First task

Run the Stripe CLI local test-mode rehearsal per `stripe-setup-runbook.md` against the lineage
membership checkout; capture evidence in the session file.

## Review log

<!-- bow-out -->

## Hostile close review

<!-- bow-out -->

## ADR / ubiquitous-language check

- ADR update **required and done** — SOT-ADR D9 (consolidated record; no separate ADR file per
  the SoT rule "fix it here, don't write a new doc").
- Ubiquitous language: "brand feature" / `BrandFeature` introduced — documented in D9 + config.

## Reflections

<!-- bow-out -->

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | <at bow-out> |
| Backlinks/index sweep | <at bow-out> |
| Wiki lint | <at bow-out> |
| Kaizen reflection | <at bow-out> |
| Hostile close review | <at bow-out> |
| Review & Recommend | <at bow-out> |
| Memory sweep | <at bow-out> |
| Next session unblock check | <at bow-out> |
| Git hygiene | <at bow-out> |
| Graphify update | <at bow-out> |
