---
title: "SESSION 0360 — Bun PM normalization + Oxc migration + Dirstarter dependency uplift (TS6 / majors)"
slug: session-0360
type: session--implement
status: closed
created: 2026-06-10
updated: 2026-06-10
last_agent: claude-session-0360
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0359.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/runbooks/dev-environment/dev-environment.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0360 — Bun PM normalization + Oxc migration + Dirstarter dependency uplift

> **Scope grew across one long chat.** Three phases landed, not one: (1) Bun-canonical
> package-manager normalization, (2) the full Biome → Oxc toolchain migration (originally
> planned as 0361), and (3) the Dirstarter dependency uplift / version parity (TS 6 + 8 majors,
> originally a separate 0361 sub-lane). All three are committed under SESSION_0360. The oRPC
> scaffold (original goal) becomes **SESSION_0361**. See the three `## What landed` blocks below.

## Date

2026-06-10

## Operator

Brian + claude-session-0360

## Goal

**Pivoted mid-session.** Started as BBL-SOT-Spec Phase 1 slice 1a (oRPC scaffold). While installing the
oRPC deps, a dual-lockfile landmine + a Turbopack panic surfaced the real foundation problem: the repo ran
**three package managers** (bun local / pnpm prod / stray npm) with **four tracked lockfiles** and conflicting
`packageManager` fields. Per the BBL-SOT-Spec **upstream-uplift mission** (match current Dirstarter, which is
**Bun-first** — root `bun.lock` on `main`), the canonical toolchain must converge on **Bun**. This session
makes that normalization: **one repo, one package manager (Bun), one lockfile (`bun.lock`)** — Vercel + CI
included — proven by a cold-tree frozen install + build + typecheck.

The oRPC scaffold itself moves to **SESSION_0362** (its deps already landed here and are build-proven).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in / recovery context

- **Continued in-chat from SESSION_0359.** The previous chat froze on a long `tsc` run after `bun add`; a
  `next-panic-*.log` alarmed the operator. Diagnosis (this session):
  - The **panic was a dev-server crash**, not data loss: `bun add` rewrote `node_modules` under a live
    `next dev --turbo` (Turbopack HMR couldn't resolve a file mid-install). node_modules was intact after.
    **Rule: stop the dev server before any install.**
  - The **chat freeze** was a genuinely slow `tsc` (~1.5 min CPU observed), not corruption.
  - The 4 changed files (lockfiles + `package.json` + this SESSION doc) were correct; **nothing undone**.
  - A **pre-existing** dual-lockfile drift (root pnpm `node_modules` had next 16.2.x / resend 6.12.x vs
    apps/web bun next 16.0.9 / resend 6.6.0, dated **before** this session) was the *only* thing failing
    typecheck. Removing the stray root pnpm `node_modules` → typecheck **0 errors**. This drift is what the
    normalization below eliminates permanently.
- Branch `main`, started clean at `419f6b5` (SESSION_0359). FS-0024 guard run before any mutating git.

## What landed (Bun normalization)

| Change | Detail |
| --- | --- |
| Root `package.json` | `packageManager: bun@1.3.13`; added `workspaces: [apps/*, packages/*]` (Bun reads workspaces from `package.json`, **not** `pnpm-workspace.yaml` — that's why `bun.lock` previously landed in `apps/web`); scripts `pnpm --filter`/`pnpm -r` → `bun run --filter`; `trustedDependencies` for the postinstall/native deps (`@ronin-dojo/web` db:generate, `@swc/core`, `@parcel/watcher`, `prisma`, `@prisma/engines`, `esbuild`, `sharp`). |
| `apps/web/package.json` | dropped the conflicting `packageManager: pnpm@9.0.0` (inherits Bun from root). |
| Lockfiles | **removed** `pnpm-lock.yaml`, `package-lock.json`, `apps/web/package-lock.json`, `apps/web/bun.lock`, `pnpm-workspace.yaml`; **added** canonical root `bun.lock` (workspace-aware: `@ronin-dojo/api-client` linked). |
| `vercel.json` (root) | install `bun install --frozen-lockfile`; build `bun run --filter @ronin-dojo/web build`; `ignoreCommand` now watches `bun.lock` (was `pnpm-lock.yaml`). |
| `apps/web/vercel.json` | `cd ../.. && bun install --frozen-lockfile` + `bun run --filter @ronin-dojo/web build` (crons unchanged). |
| CI `ci.yml` + `playwright.yml` | dropped `pnpm/action-setup` + the pnpm node-cache; `pnpm install --frozen-lockfile` → `bun install --frozen-lockfile`. (Biome → Oxc done in Phase 2 below, same session.) |
| oRPC deps (from slice 1a) | `@orpc/{server,client,tanstack-query}`, `@tanstack/react-query`, `rate-limiter-flexible` — kept; build-proven, no scaffold yet. |

### Proof (cold tree, simulating Vercel)

- `rm -rf` all `node_modules` → `bun install --frozen-lockfile` = **EXIT 0**; trusted postinstalls fired
  (Prisma client, esbuild bin, sharp native all present; nothing blocked).
- `bun run build` (= `bun run --filter @ronin-dojo/web build` → `next build` + postbuild) = **EXIT 0**.
- `apps/web` typecheck = **EXIT 0, 0 errors**; root `bun run --filter '*' typecheck` = **EXIT 0** for *both*
  `@ronin-dojo/web` and `@ronin-dojo/api-client` (workspace filter works).

### Deliberately deferred (Phase 1)

- **Deploy proof:** operator chose local-proof + push-and-watch (site is live but idle, breakage acceptable),
  not a Vercel preview deploy. **This push is the first to `main` with the whole new toolchain + uplift — CI
  + Vercel are the integration gate; watch them and fix forward.**

## What landed (Phase 2 — Biome → Oxc migration)

The planned 0361 Oxc lane was pulled forward into this session. **Biome is fully removed; oxlint + oxfmt are
the toolchain.** Whole-tree gates green.

| Change | Detail |
| --- | --- |
| Deps + config | `apps/web/package.json`: `@biomejs/biome` → `oxlint`/`oxfmt`; scripts `lint`/`lint:check`/`format`/`format:check`. Added `apps/web/.oxfmtrc.json` (printWidth 100, no semi, double quotes, trailing-comma all, arrowParens avoid). **Removed** `apps/web/biome.json`. |
| Whole-repo format | `oxfmt` reformatted the tree (1227 files); style-level diffs only. |
| CI | `ci.yml` Biome job → Oxc: `bun run lint:check` (oxlint) + `bun run format:check` (oxfmt), read-only. |
| Source suppression comments | 13 `// biome-ignore lint/<cat>/<rule>: …` → `// oxlint-disable-next-line <oxlint-rule> -- …` (a11y `media-has-caption` / `label-has-associated-control` / `prefer-tag-over-role`; `typescript/no-explicit-any`; `no-cond-assign`). 0 oxlint errors, no unused-directive noise. |
| Automation scripts | `scripts/auto-session{,-automerge,-codex}.sh` close-prompts: `bunx biome check` → read-only `(cd apps/web && bun run lint:check && bun run format:check)`; stale "root lint broken (FS-0017 biome PATH)" caveat marked moot. |
| Hooks | renamed `.claude/hooks/biome-unsafe-nudge.sh` → `oxlint-fix-nudge.sh` (fires on `oxlint --fix`, preserves FS-0023 tsc-verify discipline); updated repo + global copies, README rows, `ronin-cwd-guard.sh` denylist. |
| Global harness config | `~/.claude/settings.json` (untracked, not in commit): removed 29 biome permission-allowlist entries + re-pointed the PostToolUse hook wiring to `oxlint-fix-nudge.sh`. |

**Left as historical record (operator-confirmed):** biome mentions in past `SESSION_*` / `_archive` / ledger /
lane-ledger / migration-epic docs record what was true then — do **not** rewrite session history.
`SESSION_TEMPLATE.md` checked: 0 biome refs.

## What landed (Phase 3 — Dirstarter dependency uplift / parity)

Per the **L14 toolchain-bundled-bump** lane ([epic-2026-05-19.md](../architecture/uplift/epic-2026-05-19.md))
and the operator's "get it done, accept non-green" call, `apps/web` deps were aligned to the in-repo
**`dirstarter_template/package.json`** upstream reference. Kept **all** Ronin-only deps (dnd-kit, embla,
next-safe-action, upstash, @ai-sdk/react, qrcode, playwright); did **not** add template-only deps Ronin
doesn't import (those arrive with their feature ports).

| Bump | From → To |
| --- | --- |
| typescript | `5.9.3` → `^6.0.3` (**major**) |
| stripe | `^18.5.0` → `^22.1.1` (**+4 majors**) |
| react-email | `^5.0.7` → `^6.3.3` (major) |
| @mantine/hooks | `^8.3.10` → `^9.2.1` (major) |
| lucide-react | `^0.544.0` → `^1.16.0` (major) |
| file-type / wretch / react-day-picker / @types/node / schema-dts / ai | majors |
| next / react / react-dom / better-auth / next-intl / resend / zod / satori / motion / … | minors |

**Result: only 2 source fixes needed** (both Stripe 22 `dahlia`):

1. `services/stripe.ts` — pinned `apiVersion` `"2025-08-27.basil"` → `"2026-05-27.dahlia"`.
2. `server/web/products/queries.ts` (`findStripeCoupon`) — Stripe 22 moved `PromotionCode.coupon` under
   `promotion.coupon`; updated the expand path → `data.promotion.coupon.applies_to` and narrowed the return
   to `Stripe.Coupon | undefined` (explicit annotation — `"use cache"` blocked inference of the narrowed ternary).

### Proof (Phase 2 + 3)

- `bun install` (post-uplift) clean; lockfile saved (31 packages updated).
- `oxlint .` = **EXIT 0, 0 errors**; `oxfmt --check .` = **EXIT 0** (1227 files); `apps/web` typecheck
  (`next typegen && tsc --noEmit`, **TS 6**) = **EXIT 0, 0 errors**.
- **Stripe `dahlia` runtime check (Stripe CLI test-mode, "Tuff Buffs"):** the exact expand path
  `data.promotion.coupon.applies_to` is **accepted** at `--stripe-version 2026-05-27.dahlia` (an invalid
  expand 400s — it returned 200/empty); the create-param error (`coupon` unknown) independently confirms the
  restructure (`coupon` nested under `promotion`). Generated `stripe@22.2.0` `.d.ts` confirms
  `PromotionCode.promotion.coupon`. Throwaway test coupon created + **deleted** (no cruft).
- **Not yet runtime-proven with live data:** a full coupon→checkout→entitlement rehearsal (real promo code
  data) — see Open follow-ups. Build is green; the discount read-path is type- + expand-path-verified.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0360_TASK_01 | done | Diagnose panic + recover working state (no undo; root-pnpm drift removed). |
| SESSION_0360_TASK_02 | done | Bun-canonical normalization: package.json, lockfiles, vercel.json, CI. |
| SESSION_0360_TASK_03 | done | Cold-tree proof: frozen install + postinstalls + build + typecheck all green. |
| SESSION_0360_TASK_04 | done | dev-environment + verification docs updated; close + push. |
| SESSION_0360_TASK_05 | done | Biome → Oxc migration (deps/config/CI/scripts/hooks/settings + 13 suppression comments); gates green. |
| SESSION_0360_TASK_06 | done | Dirstarter dep uplift (TS6 + majors) to template parity; 2 Stripe-22 fixes; gates green; `dahlia` expand-path verified via Stripe CLI. |
| SESSION_0360_TASK_07 | done | Tooling: Stripe CLI → 1.42.11; hosted Stripe MCP (OAuth) added; `session-ops-cookbook.md` created. |

## Next session

### SESSION_0361 — oRPC scaffold + brand-aware context (original Phase 1 goal)

The 0361 Oxc / Fallow / dep-parity lane all landed in 0360, so the oRPC scaffold (was "0362") becomes
**0361**. Deps already landed (0360, build-proven). Port the scaffold from upstream `76c8e1e`, brand-aware.

- **Upstream files (port source):** `server/orpc/{context,procedure,permissions,roles,rate-limit,revalidate}.ts`,
  `server/router.ts`, `lib/orpc-{server,client,query}.ts`, `app/api/rpc/[[...rest]]/route.ts`, `lib/auth.ts`.
- **KEY delta:** upstream `Context = { user, source, revalidate }` is **brand-less**. Ronin adds `brand` +
  a `withBrand` middleware (resolve host/`x-brand` server-side via `~/lib/brand-context` `getRequestBrand()`,
  mirroring `lib/safe-actions.ts`). `rsc()` must inject brand too. (Hard gate: oRPC preserves brand-scope, SOT-ADR D3.)
- **Scope:** scaffold + brand context + `ping`/`health.brand` smoke only. No entity routers, no Better-Auth
  change (that's the later permission slice), no `next-safe-action` removal.
- **First task is unblocked** — no user input required.

## Decisions resolved (this session)

- **Converge on one PM (Bun), one lockfile (`bun.lock`)** — Vercel + CI included. (Phase 1)
- **Biome is fully removed; Oxc (oxlint + oxfmt) is the toolchain.** Sprint history keeps its biome
  references (do not rewrite session logs); only living docs/config were updated. (Phase 2)
- **Do the full Dirstarter dep uplift now, in 0360, accepting non-green** (prod but no real users; iterate on
  `main`) — it came in green anyway. Reference = in-repo `dirstarter_template/package.json`. (Phase 3)
- **oRPC scaffold renumbered 0362 → 0361.**
- **Tooling:** Stripe CLI updated; hosted Stripe MCP added (OAuth, no stored key).

## Open decisions / blockers / follow-ups

- **Stripe runtime rehearsal (not blocking):** the discount coupon read-path is type- + expand-verified, but a
  full coupon → checkout → entitlement rehearsal with real test-mode data is still owed (per the
  live-mode-prod constraint, off-prod via the Stripe CLI / new Stripe MCP). First-class follow-up for a
  billing session.
- **First push to `main` with the whole toolchain + uplift** — watch CI (`ci.yml`) + the Vercel prod build
  after push; fix forward.
- No blockers for SESSION_0361.

## Reflections

- **`bunx` is the hang trap, not the Rust tools.** `bunx oxfmt .` stalled ~24 min (resolution/fetch); the
  direct `node_modules/.bin/oxfmt` does 1227 files in ~0.5s. Codified in `session-ops-cookbook.md`.
- **A "major dependency uplift" priced as scary came in at 2 fixes.** TS 6 + 8 majors (stripe +4, react-email,
  mantine, lucide, …) produced exactly two TS errors — both Stripe `dahlia` API-shape changes. Modern Ronin
  deps were already close to the template, so the carets absorbed most of it.
- **Stripe `dahlia` moved `PromotionCode.coupon` under `promotion.coupon`** — and dropped `coupon` as a
  top-level *create* param too. Types catch the read shape; only a live API call catches a bad *expand* path.
- **`"use cache"` blocks return-type inference** of a narrowing ternary — needed an explicit
  `Promise<Stripe.Coupon | undefined>` annotation.
- **Scope discipline vs. operator intent:** I twice mis-framed in-scope work (settings.json biome perms, the
  uplift) as "risky / out of scope." The operator's repeated correction — *this eradication IS the session* —
  was right. Surfacing real risk (the uplift's major bumps) was correct; gatekeeping scope was not.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | New `session-ops-cookbook.md` carries full JETTY frontmatter; touched runbooks already current; SESSION doc `last_agent: claude-session-0360`. |
| Backlinks/index sweep | Added `session-ops-cookbook.md` to `wiki/index.md` + runbooks hub; `pairs_with` ↔ verification-and-testing / dev-environment both directions. |
| Wiki lint | `bun run wiki:lint` — result captured in bow-out chat. |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | See `## Hostile close review` below. |
| Review & Recommend | Next session (0361 oRPC) written; first task unblocked. |
| Memory sweep | Cookbook captures the bunx-hang + dep-uplift recipes; `oxc-decision` memory already reflects Biome retired. No new standing operator fact. |
| Next session unblock check | Unblocked — 0361 oRPC needs no user input. |
| Git hygiene | Branch `main`; single push at close; hash reported at bow-out — see git log. FS-0024 guard run. |
| Graphify update | Ran `graphify update .` before the close commit — count captured in bow-out chat. |

## Hostile close review

- **Giddy + Doug verdict:** PASS with one carried risk. Toolchain + uplift are type/lint/format green and the
  Stripe API-shape change is verified at the type + expand-path level. **Carried risk:** no end-to-end runtime
  rehearsal of the discount/checkout path on the new Stripe SDK (logged as a follow-up, not a blocker;
  operator chose push-and-watch). First push to `main` carries the whole bundle — CI + Vercel are the gate.
- **Dirstarter alignment:** dep versions now match the in-repo `dirstarter_template` reference (L14 lane);
  Ronin-only product deps preserved; no template-only deps blindly added.
- **Honesty:** "green" claims are exit-0-backed (oxlint/oxfmt/tsc logs). The one unproven area (Stripe runtime)
  is called out explicitly, not papered over.

## ADR / ubiquitous-language check

- **No new ADR required.** The Biome → Oxc decision is already covered by `oxc-decision` (ADR 0024 superseded →
  full Oxc per SOT-ADR D3); the toolchain / dep uplift is an upstream-sync execution lane (L14), not a new
  architectural decision. No ubiquitous-language terms added or changed.

## Review log

- **SESSION_0360_REVIEW_01:** Covers TASK_01–07. Landed Bun PM normalization, full Biome → Oxc migration, and
  the Dirstarter dep uplift (TS6 + majors) — all gates green, single push to `main`. Open follow-up: Stripe
  runtime rehearsal (billing session). No unresolved blockers for 0361 (oRPC scaffold).
