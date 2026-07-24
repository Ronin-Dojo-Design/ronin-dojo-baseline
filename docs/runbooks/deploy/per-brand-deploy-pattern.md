---
title: "Per-Brand Deploy Pattern (monorepo → separate Vercel deploy units)"
slug: per-brand-deploy-pattern
type: runbook
status: active
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0633
pairs_with:
  - docs/runbooks/deploy/vercel-deploy.md
  - docs/runbooks/deploy/vercel-domain-setup-runbook.md
  - docs/runbooks/deploy/bbl-production-runbook.md
  - docs/runbooks/onboarding/new-client-runbook.md
  - docs/runbooks/database/per-app-db-separation.md
  - docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
  - docs/architecture/decisions/0051-brand-platform-product-portfolio-taxonomy.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0633.md
tags:
  - vercel
  - deploy
  - monorepo
  - brand
  - ignorecommand
  - ci
  - prisma
  - runbook
---

# Per-Brand Deploy Pattern

**The question this answers:** what *exactly* makes a brand a separate deploy unit out of this
monorepo? (ADR 0051: an **app** is the deploy unit — one Vercel project + one DB. ADR 0034: one
monorepo, per-app Vercel projects, no separate prod repos.)

**The answer is eight ingredients, none optional:**

| # | Ingredient | Mechanism |
| --- | --- | --- |
| 1 | Own Vercel project | Root Directory = the app dir |
| 2 | Own build-trigger scope | `ignoreCommand` in the app's `vercel.json` |
| 3 | Own install/build commands | workspace shape vs standalone shape |
| 4 | Own env + secret block | per-project Vercel env; brand-scoped keys |
| 5 | Own CI gate | `ci.yml`+`playwright.yml` (BBL) vs `clients-ci.yml` (everyone else) |
| 6 | Own database | ADR 0038: own Neon DB + own `prisma/` + `prisma.config.ts` |
| 7 | Own domain | attach per the domain runbook |
| 8 | **Exclusion from every OTHER project's trigger set** | the blast-radius guarantee (§8) |

Reference implementations, verified by direct read 2026-07-23:

| App | Dir | Workspace member? | `vercel.json` | Own DB | Deployed |
| --- | --- | --- | --- | --- | --- |
| BBL (flagship, live + paid) | `apps/web` | yes (`@ronin-dojo/web`) | `apps/web/vercel.json` **+** root `/vercel.json` (two-file topology, §1) | yes (Neon) | yes — `blackbeltlegacy.com` |
| RDD | `apps/rdd` | yes (`rdd`) | `apps/rdd/vercel.json` (landed SESSION_0625) | no DB yet | project stand-up in flight (SESSION_0633) |
| MMB (Mammoth Build CRM) | `clients/mammoth-build-crm` | **no** — standalone, own `bun.lock` | `clients/mammoth-build-crm/vercel.json` | yes (`mammoth_dev`; Neon at ship) | project stand-up in flight (SESSION_0633) |
| Baseline | `apps/baseline` | yes | **none** — cloud deploy deferred (SESSION_0598); `baselinemartialarts.com` currently rides the BBL project (SESSION_0617) | yes (`baseline_dev`) | no own project yet |

> **Stale-comment warning:** the root `/vercel.json` comment asserts `apps/baseline/vercel.json`
> exists ("SESSION_0463 stands it up"). It does **not** exist — SESSION_0463 scaffolded the app;
> the Vercel project + config were deferred. Do not go looking for it; the comment fix is queued
> with the SESSION_0633 merge owner.

---

## 1. Vercel project creation + Root Directory

One Vercel project per app. The project's **Root Directory** = the app dir
(`apps/web`, `apps/rdd`, `clients/mammoth-build-crm`) — never the repo root.

- **Modern shape (use this): ONE `vercel.json` inside the app dir** carrying framework, install,
  build, and `ignoreCommand`. RDD and MMB both do this.
- **BBL's legacy two-file topology (do not copy):** `apps/web/vercel.json` is the active config
  (install/build/crons per `vercel-deploy.md`), while the repo-root `/vercel.json` carries the
  `ignoreCommand` that was live-verified in SESSION_0501 (4/4 commit matrix). It works, it is
  proven, and it stays — but a new brand gets the single-file shape.
- Project creation is **operator-gated** (real cloud). Order: app builds locally + CI green →
  create project → set Root Directory → env block (§4) → first deploy → domain (§7).
- After first deploy, **confirm on the live dashboard** that the Root-Directory `vercel.json` is
  the one being read (the check SESSION_0598 queued for the first `apps/*` peer).

## 2. `ignoreCommand` scoping — the two shapes

`ignoreCommand` exit 0 = **skip** the build; exit 1 = build. Each project evaluates only its own
command — one project's `ignoreCommand` can never affect another project.

| App | Command | Shape |
| --- | --- | --- |
| BBL (root `/vercel.json`) | `git diff --quiet HEAD^ HEAD -- apps/web packages bun.lock package.json vercel.json ':(exclude)*.md' ':(exclude)*.mdx'` | **path-scoped**, repo-root-relative |
| RDD (`apps/rdd/vercel.json`) | `git diff --quiet HEAD^ HEAD -- apps/rdd packages bun.lock package.json ':(exclude)*.md' ':(exclude)*.mdx'` | **path-scoped**, repo-root-relative |
| MMB (`clients/mammoth-build-crm/vercel.json`) | `git diff --quiet HEAD^ HEAD -- .` | **whole-dir** (`.` = the app dir; Vercel's canonical monorepo recipe) |

**Why they differ:**

- BBL/RDD are **bun-workspace members**: a `packages/ui-kit` change or a root `bun.lock` /
  `package.json` change can break them, so those paths MUST be in the trigger set. The
  `*.md`/`*.mdx` excludes kill the docs-only false positive (a package README edit must not
  deploy a live paid app — SESSION_0501, verified both directions on real commits).
- MMB is **standalone**: own `bun.lock`, ui-kit via `file:../../packages/ui-kit`. Root lockfile
  churn is irrelevant to it, so watching only its own dir is correct and maximally quiet.
  **Known tradeoff:** a `packages/ui-kit` change does NOT redeploy MMB — the deployed build stays
  on the ui-kit code from its last own-dir commit. Acceptable for a handoff-bound client app;
  unacceptable for a workspace member.

**Which shape a new brand picks:**

| New brand is… | Shape | Template |
| --- | --- | --- |
| `apps/*` workspace member | path-scoped: `apps/<x> packages bun.lock package.json` + md/mdx excludes | copy `apps/rdd/vercel.json` |
| `clients/*` standalone | whole-dir: `-- .` | copy `clients/mammoth-build-crm/vercel.json` |

Never broaden a trigger set to `apps/*` or the repo root: a sibling's commit must never rebuild
BBL (§8).

## 3. Install / build commands

| App | installCommand | buildCommand |
| --- | --- | --- |
| BBL | `cd ../.. && bun install --frozen-lockfile` | `cd ../.. && bun run --filter @ronin-dojo/web db:generate && bun run --filter @ronin-dojo/web build` |
| RDD | `cd ../.. && bun install --frozen-lockfile` | `cd ../.. && bun run --filter rdd build` (no Prisma yet — add `db:generate` the day a schema lands) |
| MMB | `bun install --frozen-lockfile` (in-dir) | `bun run db:generate && bun run build` (in-dir) |

- **Workspace members `cd ../..`** because install/build run from the Root Directory but the
  lockfile + workspace graph live at repo root. **Standalone clients install in place** — their
  own `bun.lock` is the source of truth; root `bun.lock` must stay untouched.
- **Prisma ordering (repo lesson — do not re-learn):** `apps/web`'s `prebuild` runs
  `prisma migrate deploy` and does **NOT** generate. Generation happens in `postinstall` and —
  belt-and-braces — explicitly in the buildCommand (`db:generate && build`). A new DB-backed brand
  keeps that explicit `db:generate` in its buildCommand; never assume prebuild generates.
- MMB has no `prebuild`: migrations run via CLI (its `prisma.config.ts` already normalizes to
  Neon's DIRECT non-pooled host when `VERCEL_ENV` is set — pooler connections break Prisma
  Migrate's advisory locks). Wire a `prebuild: migrate deploy` when the brand wants auto-migrate
  on deploy, mirroring `apps/web`.

## 4. Env + secret block

Per-project Vercel env, Production + Preview both. Minimal set for a new brand app (subset of the
`vercel-deploy.md` contract — take only what the app actually uses):

| Variable | When needed | Notes |
| --- | --- | --- |
| `DATABASE_URL` | has a DB | pooled Neon URL (runtime) |
| `DIRECT_URL` | has a DB | direct Neon URL — Prisma CLI/migrate only |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` | has auth | per-app secret; URL = the app's own domain |
| `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_SITE_EMAIL` | always | canonical public URL + contact |
| `RESEND_API_KEY` (+ sender) | sends email | **domain-scoped per brand** — a cross-brand key silently 403s (BBL lesson) |
| Stripe keys | takes payment | per-brand account; note Baseline prod is `sk_live` — never "test card on prod" |

Gotchas (all proven in-repo):

- **Vercel "Sensitive" vars pull EMPTY via `vercel env pull`.** Keep a gitignored `.env.prod`
  overlay and run prod-scoped CLI ops with `bun --env-file` (SESSION_0598 pins this for new
  brands).
- No placeholder secret values in Vercel; add optional vars to Prod+Preview in one edit.
- Copy the name-parity-guard pattern (`scripts/check-vercel-env-parity.ts` — names and scopes
  only, never values) when the brand's env contract stabilizes.
- No secrets/values in git, ever — this runbook included.

## 5. The CI gate

| Deploy unit | Workflow | Gate |
| --- | --- | --- |
| `apps/web` (BBL) | `.github/workflows/ci.yml` + `playwright.yml` | rich: lint/typecheck/unit + 3-browser e2e |
| everything else (`clients/*`, `apps/baseline`, `apps/rdd`, future peers) | `.github/workflows/clients-ci.yml` ("Products CI") | typecheck required; test/lint opt-in |

How `clients-ci.yml` works (discover→matrix):

1. **discover** job: `find clients apps -mindepth 1 -maxdepth 1 -type d` → keep dirs with a
   `package.json`, drop `apps/web` → JSON matrix of full relative paths.
2. **check** matrix job per product: in-dir `bun install --frozen-lockfile` → `prisma generate`
   *iff* `prisma/schema.prisma` exists (dummy `DATABASE_URL`; generate never connects) →
   `bun run typecheck` (**mandatory — a missing script fails loudly**) → `test` and `lint:check`
   only if the product declares them.

So the *matrix* picks a new product up automatically — but two trigger lists are hand-enumerated
and MUST be edited for a new `apps/*` peer (a new `clients/*` app is covered by the existing
`clients/**` globs):

- `clients-ci.yml` `on.paths`: add `apps/<x>/**` (currently `clients/**`, `apps/baseline/**`,
  `apps/rdd/**`, `packages/**`).
- `ci.yml` + `playwright.yml` `paths-ignore`: add `apps/<x>/**`, or every commit to the new brand
  wastefully fires BBL's heavy e2e matrix (the exact miss SESSION_0598 pinned for RDD).

Root `bun run test` / `lint` never cover standalone clients — Products CI is their only gate.

## 6. Database separation (ADR 0038)

One DB per app — own Neon DB in prod, own `<x>_dev` locally, own `prisma/` schema + migrations,
own `prisma.config.ts`. **Mirror MMB's `clients/mammoth-build-crm/prisma.config.ts`:**

- Prisma 7: the Migrate URL lives in `prisma.config.ts`, not the schema.
- On Vercel (`VERCEL_ENV` preview/production) it prefers `DIRECT_URL` and normalizes Neon URLs —
  strips the `-pooler` host suffix + the `pgbouncer` param — because pooled connections break
  Prisma Migrate's advisory locks. Runtime keeps the pooled `DATABASE_URL`.
- `SHADOW_DATABASE_URL` is a conditional spread — absent unless set locally.

Hard rules: **no cross-app foreign keys; no BBL models in a brand schema; no shared prisma
package** — share the kernel (`packages/ui-kit`), never the data. `migrate dev` is banned against
any shared local DB (first-init of a brand-new private DB only). Isolation proof at stand-up:
every *other* app's DB byte-identical before/after. Full procedure:
`docs/runbooks/database/per-app-db-separation.md`.

## 7. Domain attach

Follow `docs/runbooks/deploy/vercel-domain-setup-runbook.md`: confirm a production deployment
exists → attach the domain to the brand's project → apply DNS in one batch → verify at
authoritative + cache layers → confirm SSL + `Server: Vercel` → Resend records if the brand sends
mail. That runbook is **Bluehost-specific** today (covers RDD's `ronindojodesign.com`); a
**Cloudflare section is forthcoming** from a sibling SESSION_0633 lane (MMB's `mammothmb.com`
lives in the client's Cloudflare) — do not duplicate it here.

## 8. Blast-radius proof — why a brand commit cannot rebuild BBL

BBL is live and paid. Its trigger set is closed: the root `/vercel.json` ignoreCommand diffs
**only** `apps/web packages bun.lock package.json vercel.json` (md/mdx excluded). Nothing under
`apps/rdd`, `apps/baseline`, or `clients/` appears in that list, so no commit confined to those
dirs can make the diff non-quiet — the build is skipped. Live-verified in SESSION_0501 on 4 real
commits (docs skip · code deploy · pkg-README skip · code+md deploy: 4/4 correct).

| Change under… | BBL deploy | RDD deploy | MMB deploy | Products CI | BBL CI/e2e |
| --- | --- | --- | --- | --- | --- |
| `apps/web/**` (code) | **yes** | no | no | no | yes |
| `apps/rdd/**` (code) | **no** | yes | no | yes | no (paths-ignore) |
| `clients/mammoth-build-crm/**` | **no** | no | yes | yes | no (paths-ignore) |
| `apps/baseline/**` | **no** | no | no | yes | no (paths-ignore) |
| `packages/**` (kernel) | **yes** | yes | **no** (§2 tradeoff) | yes | yes |
| root `bun.lock` / `package.json` | **yes** | yes | no (own lockfile) | no | yes |
| `docs/**`, any `*.md`/`*.mdx` | no | no | no | no | no |

What DOES fan out — exactly two shared surfaces: **`packages/**`** (the kernel — rebuilds every
workspace-member app, by design: a ui-kit change CAN break them) and the **root
`bun.lock`/`package.json`** (rebuilds all workspace members). Everything else is isolated. The
inverse holds too: each brand's ignoreCommand is evaluated only for its own project, so nothing a
brand does to its own `vercel.json` can widen BBL's triggers.

## 9. Worked checklist — stand up brand X

Gated steps marked ⛔ (operator authorizes before running). For `clients/*`, `/new-client-recipe`
+ `bun scripts/new-client-scaffold.ts <x>` automate steps 1–3.

1. **Pick the axis:** workspace member (`apps/x`, brand-owned, stays) or standalone client
   (`clients/x`, handoff-bound — ADR 0033 D1). This decides every shape below.
2. **Scaffold** the app dir: `package.json` (a `typecheck` script is MANDATORY — Products CI's
   contract), Next config, tsconfig. Wire ui-kit: `workspace:*` (apps) or
   `file:../../packages/ui-kit` + the whole-dir symlink `postinstall` (copy
   `clients/mammoth-build-crm/scripts/link-ui-kit.mjs` — bun's per-file `file:` materialization
   breaks Turbopack).
3. **Install:** workspace member → root `bun install`; standalone → in-dir install, own
   `bun.lock`, root lockfile untouched. ⛔
4. **Own DB** (§6): `prisma/` + migrations + `prisma.config.ts` copied from MMB; create `<x>_dev`;
   run the isolation proof. ⛔ for anything beyond local.
5. **`vercel.json` in the app dir** (§2–3): copy the RDD file (workspace) or the MMB file
   (standalone); adjust the app path in the ignoreCommand.
6. **CI wiring** (§5): new `apps/*` peer → add `apps/x/**` to `clients-ci.yml` `on.paths` AND to
   `ci.yml`/`playwright.yml` `paths-ignore`. New `clients/*` → nothing to edit. Confirm the
   discover job lists the app on the next PR.
7. **Vercel project** ⛔: create; Root Directory = the app dir; env block (§4 — mark secrets
   Sensitive, keep the gitignored `.env.prod` overlay); first deploy; confirm the app-dir
   `vercel.json` is being read on the dashboard.
8. **Verify blast radius both directions** (the SESSION_0501 matrix, non-negotiable): docs-only
   commit → X skips; X code commit → X deploys; X commit → **BBL does not deploy** (check the BBL
   project's deployments list shows a skip).
9. **Domain** ⛔ (§7): attach per the domain runbook; brand-scoped Resend key; per-brand Stripe if
   selling.
10. **Docs + governance:** PRD under `docs/product/<x>/`, goals-ledger lane, wiki index — per
    `docs/runbooks/onboarding/new-client-runbook.md`.
