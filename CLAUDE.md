# CLAUDE.md — ronin-dojo-app

Standing context for every Claude Code session in this repo: **session operations** (how to run a
session) and the **repo & product strategy** (the platform/monorepo model). Kept tight — this loads
into context each session; detailed rules live in referenced docs, read on demand.

## Session operations (bow-in / bow-out / orchestration)

### Repo & environment

- Repo: **ronin-dojo-app** (`/Users/brianscott/dev/ronin-dojo-app`, remote
  `Ronin-Dojo-Design/ronin-dojo-baseline`). VSCode's primary cwd is the **read-only**
  `dirstarter_template` boilerplate — never git/build/write there. Every Bash call
  operates from the ronin-dojo-app cwd; run the FS-0024 `pwd` + `git remote` guard
  before any mutating git (the shell guard blocks `git`/`gh`/`bun`/`vercel`/`graphify`
  from the template dir).
- App lives in `apps/web` (Next.js + Prisma + Better Auth, pnpm/bun workspace). Dev
  server: `cd apps/web && npx next dev --turbo` (FS-0002 — not `bun dev`/`pnpm dev`).
- Tooling available: **Vercel CLI, GitHub CLI (`gh`), Docker, MCP servers** — use for
  PRs/merges/rebases (`gh`), deploy checks (`vercel`), local S3 (MinIO via Docker).

### How sessions run

- **Bow-in and bow-out are mandatory** (`/bow-in`, `/bow-out` → the rituals in
  `docs/rituals/`). The default task is the **"Next session" block of the
  highest-numbered `docs/sprints/SESSION_NNNN.md`** — read it; it does not need pasting.
- **Discovery is Graphify-first**: `graphify stats`/`query` before repo-wide
  `grep`/`find`/`ls` on cross-area work (`docs/runbooks/graphify-repo-memory.md`).
- **Default to Petey orchestration** for multi-part or unclear lanes: plan via
  `docs/protocols/petey-plan.md` (grill open decisions first), then Cody builds and
  Doug verifies. Parallelize with sub-agents only when the work is genuinely disjoint;
  do single coherent changes inline.

### Bow-out = full close (default)

- Run the **full** closing ritual including optional deep items: Reflections, hostile
  close review, evidence table, ADR check, memory sweep, and documenting new components
  in `docs/knowledge/wiki/custom-component-inventory.md`.
- After git hygiene, refresh Graphify: `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`.
- Route findings to their canonical ledger via the **finding router** (closing.md §6.7):
  wiring→`wiring-ledger` (WL), drift→`drift-register` (D), SOP miss→`failed-steps-log` (FS),
  unclean close→`incidents`, smoke boundary→`manual-boundary-registry`, decision→ADR.
- **Push policy: explicit per-push authorization.** Stage + commit (conventional message) on
  completion, but **wait for the operator's "go" before any push / PR merge / deploy** — build,
  verify, show, then push on the word. Trunk-based flow (commits land on `main`); gates
  (typecheck / oxlint / oxfmt / tests / wiki-lint) must pass first; never force-push; run the
  FS-0024 git guard. (Operator standing preference — see the `explicit-push-authorization` memory.)
- **Push cadence:** one push per session at close — don't push mid-session. Production
  deploys are decoupled from pushes: `vercel.json`'s `ignoreCommand` skips the prod build
  unless `apps/web` / `bun.lock` / `package.json` / `vercel.json` changed, so docs /
  governance / CI / `scripts` sessions push without deploying. App-code sessions deploy on
  push as before. (SESSION_0335 — see `docs/runbooks/dev-environment/verification-and-testing.md`.)

---

## Repo & product strategy (ADR 0034)

- **North Star (RDD umbrella):** Ronin Dojo Design builds **ONE platform** — a shared kernel
  (`packages/ui-kit`) + a library of **brand-agnostic feature-modules** (leads/CRM, claims, payments,
  lineage graph, directory…). A *product* (BBL · Mammoth · Baseline · Tuff Buffs · WEKAF) = a **brand
  token-swap × a selection of those modules**, on its own DB/deploy. **Any feature can run on any
  project** (Mammoth exercises CRM/leads/payments; BBL exercises lineage/claims — but the modules belong
  to the **platform**, not the product). The kernel + the module library are the moat. (ADR 0040 +
  [`design-system-doctrine.md`](docs/knowledge/wiki/design-system-doctrine.md); portfolio map:
  `docs/knowledge/wiki/ronin-project-context.md`.)
- **Operating mantra — "What would Apple / Facebook do?"** Default to the senior design-system answer:
  one foundation + a few single-purpose pieces (never a god-component / `kind`-union), **ratify the law
  then conform** to it, kill confidently-wrong docs/imports on sight, tokens-as-contract, lean over
  sprawl. Apply it to **code, docs, and process** — not just UI. (Giddy lesson:
  [`learning-records/0006`](docs/learning/ddd/learning-records/0006-design-systems-and-ui-kits.md).)
- **One monorepo** (this repo) = the platform: `apps/web` (BBL flagship) · `clients/*` (client
  products, e.g. Mammoth CRM) · `packages/ui-kit` (the shared kernel). Deploy unit = **per-product
  Vercel projects** (`ignoreCommand`); `main` = prod, previews = staging. **No separate prod repos.**
- **BBL is permanent in-repo** (flagship + the living lineage graph — never handed off). **Client
  products live in-repo until a contractual handoff**, then extract to their own repo consuming the
  published `ui-kit` (ADR 0033 D1). A true separate repo is reserved for client handoff only.
- **Multi-*brand* is dead** (the 4-brand `Brand`-enum harness — single-brand collapse to BBL; the
  ~170 vestigial `getRequestBrand` sites are slated for full prune). **Multi-*product* (separate
  apps in one monorepo) is the model.** Repo name stays platform-neutral — **not** `black-belt-legacy`
  (BBL's identity is its Vercel project + `blackbeltlegacy.com`).
- **BBL north star:** the verified lineage **graph** is the asset/moat; the **mission** (preserve
  the Machado / Bob Bass lineage) is the engine; **revenue is exhaust**. Optimize the **claim loop**
  above all. Full vision: BBL PRD; portfolio map: `ronin-project-context.md`.

---

## LLM Wiki Schema

The wiki-maintenance rules (how to maintain `docs/knowledge/wiki/`) live in
[`docs/protocols/llm-wiki-schema.md`](docs/protocols/llm-wiki-schema.md) — read them when doing
wiki/knowledge work, not every turn. (Extracted from here at SESSION_0421 per ADR 0033 D7.)
