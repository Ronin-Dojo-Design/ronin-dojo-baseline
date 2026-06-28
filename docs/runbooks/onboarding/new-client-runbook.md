---
title: "New Client Project Runbook (monorepo + separate database)"
slug: new-client-runbook
type: runbook
status: active
created: 2026-06-27
updated: 2026-06-28
last_agent: claude-session-0460
pairs_with:
  - docs/runbooks/database/per-app-db-separation.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
  - docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md
  - docs/architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md
  - docs/architecture/research-review-new-client-onboarding.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/runbooks/README.md
tags:
  - onboarding
  - new-client
  - monorepo
  - database
  - prisma
  - vercel
  - recipe
---

# New Client Project Runbook (monorepo + separate database)

The canonical, repeatable procedure for standing up a **new client product inside this monorepo with
its own database** — the model ratified in [ADR 0034](../../architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md)
(monorepo + per-product deploys) and [ADR 0038](../../architecture/decisions/0038-per-product-database-separation.md)
(one DB per product). This is the **source of truth**; the [`/new-client-recipe`](../../../.claude/skills/new-client-recipe/SKILL.md)
skill is the invokable entrypoint that executes these steps with operator gates (mirrors how `/bow-in`
executes `opening.md`).

> **Reference implementation:** [Mammoth Build CRM](../../product/mammoth-build/PRD.md)
> (`clients/mammoth-build-crm/`) — the first product through this recipe (SESSION_0459). When a step is
> ambiguous, copy what Mammoth does.

## When to use

A new, distinct **product** is joining the platform — a client engagement (e.g. a CRM rebuild), a new
brand surface, or any app that is not BBL (`apps/web`). Use it for the *first* setup; routine schema
changes after that use [schema-migration](../database/schema-migration.md).

## The model in one breath (read before you scaffold)

- **Stay monorepo.** The product lives at `clients/<product>/`. Shared tooling, one CI.
- **Share the kernel, not the data.** Consume `packages/ui-kit` (m-card, tokens, AdminKanban) via a
  `file:` dependency. *Separation is data + deploys + brands — not components* (ADR 0038 D3).
- **Own database.** Its own `prisma/` + `prisma.config.ts` + `DATABASE_URL` + migrations + local DB.
  No cross-product foreign keys (ADR 0038 D1).
- **Own deploy + brand.** Its own Vercel project (`ignoreCommand`) + its own token block (ADR 0034).
- **Own identity.** Its own auth tables (Better Auth per app) when it needs login — no shared `User`
  across products (ADR 0038 D5).
- **Standalone deps.** It is **not** a bun workspace member; it runs its own `bun install` → its own
  `bun.lock` (isolated dependency failure-domain + clean extraction on handoff).

## Operator gates (interactive)

The recipe pauses for the operator at each side-effecting boundary — **show the command, then run on the
word** (per `operator-script-caution` + `explicit-push-authorization`):

1. **Dependency install** (`bun install` in the new app dir).
2. **DB create + migrate** (`createdb`, `prisma migrate dev`) — local only; fine to run after showing.
3. **Deploy / Neon provision** — real cloud (Vercel project, Neon DB). Always operator-gated; deferred
   to SHIP.
4. **Push** to `main`.

## Steps

### 1. Intake → brief

Capture the client requirements before any schema. Author (or confirm) the lead/brief under
`docs/business/leads/` — who the client is, the friction being solved, the forms they collect, the
pipeline/stages, the domain objects. This brief is what the schema is *translated from*.
(Mammoth: `docs/business/leads/mammoth-build-michael-flores.md` + the
[HubSpot-replacement epic](../../epics/mammoth-rebuild-crm-001.md).)

> **Research note:** if the client has a live site, check it — but verify the domain (a marketing
> redirect or parked domain is not the app). Many sites block automated fetches; fall back to the
> in-repo brief + any existing MVP forms as the authoritative field source.

### 2. Scaffold the app directory

Create `clients/<product>/` as a standalone Next.js app. **Mechanical entrypoint — run the scaffold
script** (it does the deterministic copy-and-stamp; it is **dry-run by default**, so always preview
before applying per `operator-script-caution`):

```bash
bun scripts/new-client-scaffold.ts <product>            # DRY-RUN — prints the plan, writes nothing
bun scripts/new-client-scaffold.ts <product> --apply    # scaffold clients/<product>/
bun scripts/new-client-scaffold.ts <product> --apply --createdb   # + createdb <product>_dev (local)
```

The script copies the product-agnostic config verbatim (`tsconfig`, `next.config`, `postcss`,
`tailwind`, `.gitignore`, `prisma.config.ts`) and **generates name-stamped starters** (`package.json`,
`.env.example` → `<product>_dev`, a minimal `prisma/schema.prisma` with **no models**, a runnable
`app/` skeleton, `README.md`). It deliberately stops at the judgment/gated steps below — it never runs
`bun install`, never designs the schema, never deploys. (`--from=<reference>` copies a different
reference; default is `mammoth-build-crm`.)

What the script produces (the minimum set — equivalent to hand-copying `clients/mammoth-build-crm/`):

```text
clients/<product>/
  app/                 # Next.js app router (starter layout/page/globals)
  components/
  lib/
  prisma/schema.prisma # starter generator+datasource, NO models (you translate the brief)
  package.json         # name/version/description stamped; scripts + deps inherited
  prisma.config.ts
  .env.example         # DATABASE_URL → <product>_dev
  tsconfig.json
  next.config.mjs
  postcss.config.mjs
  tailwind.config.ts
  .gitignore           # MUST ignore .env, .env*.local, /.generated, node_modules
```

### 3. Wire the shared kernel + deps

In `clients/<product>/package.json`:

- `"@ronin-dojo/ui-kit": "file:../../packages/ui-kit"` (the shared kernel — ADR 0033).
- `"@prisma/client": "^7.8.0"` (dep) + `"prisma": "^7.8.0"` (devDep). When the app comes off localStorage,
  add the runtime driver adapter too: `"@prisma/adapter-pg"` + `"pg"` (+ `"@types/pg"` devDep) — Prisma 7
  `engineType="client"` needs an adapter at runtime (mirror `apps/web/services/db.ts`).
- `db:*` scripts: `db:generate`/`db:migrate`/`db:studio`/`db:push`/`db:reset` (copy Mammoth's).
- ⚠ **`"postinstall": "node scripts/link-ui-kit.mjs"`** — REQUIRED. A standalone-bun `file:` install of
  `ui-kit` materializes a per-file `package.json` symlink that Turbopack reads as a "redirect" and fails to
  parse. The postinstall reshapes it to a whole-dir symlink (copy Mammoth's `scripts/link-ui-kit.mjs`).
  Also set `transpilePackages: ["@ronin-dojo/ui-kit"]` + `turbopack.root` (monorepo top) in `next.config`.
  See [per-app-db-separation → the `file:` ui-kit link gotcha](../database/per-app-db-separation.md).

### 4. Standalone bun install ⛔ (gate 1)

`clients/*` is deliberately **not** in the root `workspaces` (`["apps/*","packages/*"]`). Install
standalone so the product gets its own lockfile and the root `bun.lock` is untouched:

```bash
cd clients/<product> && bun install   # creates clients/<product>/bun.lock
```

Verify afterward: `git diff --quiet bun.lock` at repo root → root lockfile unchanged.

### 5. Own database ⛔ (gate 2)

Follow [per-app-db-separation](../database/per-app-db-separation.md) — the DB deep-dive. In short:

1. `clients/<product>/prisma/schema.prisma` — own `generator` (`provider = "prisma-client"`,
   `engineType = "client"`, `output = "../.generated/prisma"`) + `datasource db { provider = "postgresql" }`
   (**provider only — Prisma 7 has no inline `url`**). Translate the brief's domain objects into models.
   No BBL models, no cross-product FKs.
2. `clients/<product>/prisma.config.ts` — carries the URL: `datasource: { url: env("DATABASE_URL") }`
   + `import "dotenv/config"` at the top (Prisma 7 disables auto-`.env` when a config file exists).
3. `.env.example` (committed) + `.env` (gitignored), each `DATABASE_URL=...<product>_dev` (a **new** DB
   name).
4. Create + migrate locally, then **prove isolation**:

   ```bash
   /Applications/Postgres.app/Contents/Versions/latest/bin/createdb <product>_dev
   cd clients/<product> && bunx prisma migrate dev --name init
   # then the isolation proof: diff every other product DB before/after — must be EMPTY
   ```

### 6. Brand token block

Add the product's brand as a token block in the design system (dark/light + brand hues) — the product
is "just another token block" over the shared kernel (the epic's thesis). Don't fork components for
brand; swap tokens.

### 7. Deploy + Neon ⛔ (gate 3 — deferred to SHIP)

Per ADR 0034 (per-product Vercel projects):

- Create a **separate Vercel project** rooted at `clients/<product>/`.
- Set its env (`DATABASE_URL`/`DIRECT_URL` → the product's **own** Neon DB; never BBL's).
- Add a `vercel.json` `ignoreCommand` so unrelated pushes don't rebuild it (mirror `apps/web`).
- Grow `prisma.config.ts` to mirror `apps/web/prisma.config.ts`'s Neon pooled/direct normalization.
- Prod migrates via `prisma migrate deploy` (never `--accept-data-loss`).

**Local-first:** skip this whole step until SHIP. Phase 1 is local-only.

### 8. Product docs

- `docs/product/<product>/PRD.md` + `STORIES.md` (copy the shape of an existing product's pair).
- Keep the `docs/business/leads/*` brief as the engagement record.

### 9. Governance wiring

- Add a goals-ledger `G-NNN` lane if the product is an active objective.
- Add the app + its docs to `docs/knowledge/wiki/index.md` and any relevant hub.
- If the product is destined for client handoff, note it (ADR 0033 D1 — extract to its own repo
  consuming the *published* `ui-kit` at handoff, not before).

### 10. Continuous integration (automatic — no per-client wiring)

Per-product CI is **dynamic** — a new client product gets its own gate with **zero workflow edits**
(SESSION_0462). The split mirrors the per-product deploy model (ADR 0034):

| Workflow | Fires on | Runs | For |
| --- | --- | --- | --- |
| `clients-ci.yml` | `clients/**` or `packages/**` | discover→matrix: per-client **typecheck** (+ `lint:check` if the client defines it) | every `clients/*` with a `package.json` |
| `ci.yml` (BBL) | everything **except** `docs/**`, `**.md`, `.claude/**`, **`clients/**`** | Oxc + typecheck + unit | `apps/web` + shared roots |
| `playwright.yml` (BBL) | same as `ci.yml` | chromium full + firefox/webkit lineage ×3 | `apps/web` e2e |

Why this shape:

- **A `clients/*`-only change no longer fires BBL's e2e** — `clients/**` is in BBL's `paths-ignore`. (The
  *deploy* was already skipped by `vercel.json`'s `ignoreCommand`; this closes the matching CI waste.)
- **`clients-ci.yml` also fires on `packages/**`** — clients consume the shared kernel
  (`@ronin-dojo/ui-kit`) via a `file:` dep (ADR 0033), so a kernel edit that breaks a client's typecheck
  is caught here too.
- **The matrix auto-discovers** — the `discover` job lists every `clients/*` holding a `package.json`, so
  the moment the scaffold (step 2) lands, the new product is in the matrix. **No CI file to touch.**
- **Contract for each client product:** a `typecheck` script (required — the scaffold writes it). A
  `lint:check` script is optional; `clients-ci.yml` runs it only if present (a client adopts oxlint when
  ready, mirroring `apps/web`).

> Full CI map (BBL side, jobs, services): [verification-and-testing](../dev-environment/verification-and-testing.md).

## Done means (checklist)

- [ ] `clients/<product>/` scaffolded; `.gitignore` covers `.env` / `/.generated` / `node_modules`.
- [ ] Standalone `bun.lock` in the app dir; **root `bun.lock` untouched**.
- [ ] Own `prisma/schema.prisma` + `prisma.config.ts` + `.env.example`; **no cross-product FK**.
- [ ] Local `<product>_dev` created + first migration applied.
- [ ] **Isolation proven** — every other product DB byte-identical (empty diff).
- [ ] PRD + STORIES under `docs/product/<product>/`.
- [ ] Governance: ledger/wiki/hub updated.
- [ ] Deploy + Neon: done at SHIP (operator-gated) or explicitly deferred.

## Cross-references

- [`scripts/new-client-scaffold.ts`](../../../scripts/new-client-scaffold.ts) — the mechanical scaffolder (step 2; dry-run by default).
- [Research review — best form for this recipe](../../architecture/research-review-new-client-onboarding.md)
- [Per-App Database Separation](../database/per-app-db-separation.md) — the DB half, in depth.
- [ADR 0038](../../architecture/decisions/0038-per-product-database-separation.md) · [ADR 0034](../../architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md) · [ADR 0033](../../architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md)
- [Learning record 0003 — context mapping + database-per-context](../../learning/ddd/learning-records/0003-context-mapping-and-database-per-context.md)
- [`/new-client-recipe` skill](../../../.claude/skills/new-client-recipe/SKILL.md)
