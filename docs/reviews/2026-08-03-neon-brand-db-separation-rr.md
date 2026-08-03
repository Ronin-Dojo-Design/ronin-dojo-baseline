---
title: "Research & Recommend — DB-separation strategy (claim shared-legacy Neon as BBL; new DBs for other brands)"
type: research-recommend
status: draft
persona: giddy
mode: rr
created: 2026-08-03
session: SESSION_0738
governing_adr: docs/adr/0057-per-app-databases.md
supersedes_source: docs/architecture/decisions/0038-per-product-database-separation.md
goal_row: G-002
issues: [398, 380]
---

# R&R — DB separation: claim the shared-legacy Neon as BBL, stand up new DBs for the others

## 1. Context & ground truth (verified this session)

- **Vercel:** BBL deploys from the project literally named `ronin-dojo-baseline` (misnamed legacy),
  root `apps/web`, git-connected only to `black-belt-legacy` → every Preview build there is BBL-only.
  That same project still owns stale prod domains `mammothmb.com` (Invalid Configuration; DNS moving
  to a `mammoth-website` project **not yet git-wired**) and `baselinemartialarts.com` (DNS-change
  recommended), plus the active `blackbeltlegacy.com`. One Vercel team.
- **Neon:** ONE project, one primary branch, **no branches beyond primary**.
- **Env vars:** a SINGLE shared `DATABASE_URL` + `DIRECT_URL`, both scoped **Production, Preview** —
  this is the #398 defect (Preview carries prod DB creds). BBL-suffixed vars exist for S3/Stripe/Resend
  but **not** for the DB URL.
- **Landed code:** `apps/web/scripts/prebuild-migrate.ts` gates migrations on `VERCEL_ENV`
  (prod/local apply; preview/dev SKIP). #398/#380 remain blocked.

## 2. Prior art — and the single-DB-vs-per-brand resolution

**The governing law is already written and already matches the operator's instinct.**

- **ADR 0057 (current law)** `docs/adr/0057-per-app-databases.md:26-34` — "One DB per app: own
  `DATABASE_URL`, own `prisma/` schema + migrations, own env. No cross-app foreign keys… Phases 1–2
  (local) are landed; **cloud cutover remains operator-gated**."
- **ADR 0038 (tombstoned source, still the detailed rationale)**
  `docs/architecture/decisions/0038-per-product-database-separation.md:98-103` — Implementation step 2
  literally prescribes the operator's plan: *"Provision a dedicated BBL database… **keep the current
  shared DB as the BBL DB initially if cleanest (rename/rescope), so BBL doesn't move data — clients
  get new DBs.**"* Alternatives (`:140-145`): *"Schema-per-product in one DB — **rejected**: still one
  failure domain / one backup / one migration surface; doesn't enable clean handoff."*
- **Per-App DB runbook** `docs/runbooks/database/per-app-db-separation.md:55-60` — "The Postgres that
  `apps/web` already rides **is** BBL's dedicated database — no data moves, no rename… Clients get
  **new** DBs; BBL keeps its. **Do not rename the BBL DB or its env var** — that would break every BBL
  connection for zero benefit." Prod-provision step (`:148-152`): create the product's **own Neon
  project**, wire `DATABASE_URL`/`DIRECT_URL` in its Vercel project, never `--accept-data-loss` on prod.
- **new-brand-setup recipe** `docs/protocols/recipes/new-brand-setup.md:59-61` — a new brand gets its
  own `schema.prisma` + `<name>_dev`, an **isolation proof**, and a **new Vercel project (Root Dir = app
  dir)**. RDD worked example → `rdd_dev`.
- **G-002** `docs/knowledge/wiki/goals-ledger.md:57-71` — in-progress, P1. Phase 1 + Phase 2 local half
  LANDED; **Phase 2 cloud half (Neon provision + Vercel wiring) is the remaining, operator-gated slice.**
  This R&R *is* that slice's plan.

**Single-shared vs per-brand — RESOLVED: BBL's DB is a single multi-tenant DB, not per-brand databases.**

- `apps/web/prisma/schema.prisma` is ONE datasource (`postgresql`, `:8-9`), ONE schema, **136 models**,
  with a `Brand` enum `{ RONIN_DOJO_DESIGN, BASELINE_MARTIAL_ARTS, BBL, WEKAF }` (`:430-435`) used as a
  `where: { brand }` scoping column on **~40 models** (e.g. `:1183, :1401, :1548, :1954, :2164, :2408`).
  That is textbook single-DB multi-tenancy, not separate per-brand databases.
- Physical proof from the local `ronindojo_prodsnap` mirror: `Rank` rows = **195 NULL-brand (BBL — BBL
  ranks are `brand=null` by convention), 20 BASELINE_MARTIAL_ARTS, 1 BBL**. **Baseline data physically
  lives inside the DB the runbook calls "BBL's dedicated database."**
- Local per-app scaffolds already exist (`baseline_dev`, `mammoth_dev`, `rdd_dev`, plus
  `ronindojo_e2e`/`_shadow`/scratch) — the **local** half of separation is done. **Prod is still one
  shared multi-tenant DB.**

> **Correction the operator must internalize before executing:** there are **not** multiple per-brand
> Postgres databases inside the Neon project. There is **one** multi-tenant database, brand-scoped by an
> enum column that is now a *vestige* (brand-per-deploy is the live model — CLAUDE.md). "BBL's dedicated
> DB" today is a **declaration on paper**, not a physical fact — the other brands' rows are still in it.

## 3. The decision (restated)

Is the operator's plan — *"claim the existing shared-legacy Neon DB as BBL's dedicated DB, then stand up
NEW Neon DBs for MMB / Baseline / RDD and migrate them off"* — architecturally sound versus (a) own Neon
**project** per brand, (b) multiple **databases** in one Neon project, (c) Neon **branches** for
isolation, or (d) defer? And how does it interact with per-app-DB canon, the five-repo era, the 08-05
MMB cutover, Vercel env scoping, and #398 / #380?

## 4. Options

**Granularity primer:** a Neon **project** is the failure / billing / access / handoff boundary (own
compute, own Postgres, own connection strings, own team access, own backups). A Neon **branch** is a
copy-on-write child *inside* a project, designed for ephemeral/preview environments. ADR 0038's asks
(independent backup, scaling, failure domain, clean handoff) map to **project**-level separation.

| Option | Fit to ADR 0038/0057 | Blast radius | Effort | Reversibility | 08-05 MMB / #398 / #380 |
| --- | --- | --- | --- | --- | --- |
| **A — operator's: claim existing as BBL, NEW project per other brand** | **Exact match** (0038 impl. step 2; runbook) | Low — additive; BBL never moves | Medium (per-brand, staggered) | High — new projects are drop-in; declaration reversible | Decouples cleanly; #398 is its prerequisite; unblocks #380 |
| **B — own Neon PROJECT per brand (general principle)** | Same as A — A *is* B applied, with BBL reusing the existing project | Low | Medium | High | Same as A |
| **C — multiple databases in ONE Neon project** | **Rejected by 0038** — one compute/backup/failure domain; can't hand off a DB without migrating it out | Medium (shared project) | Low upfront, high later | Low (handoff = re-migrate) | Doesn't fix #398 isolation; leaves #380 risk |
| **D — Neon BRANCHES for isolation** | Wrong tool for *prod* per-brand; **right tool for Preview** | N/A for prod | Low | High (branches are ephemeral) | **This is the #398 fix**, one level below A — complementary, not an alternative |
| **E — do-nothing / defer** | Stalls G-002 Phase-2 | — | None | — | #398 + #380 stay blocked; Preview keeps prod creds |

**Reading:** A and B are the same recommendation. C is explicitly rejected by the ADR. D is not a
competitor — it is the missing Preview layer *within* A. E leaves the two blocking issues open.

## 5. Recommendation — ONE

**Adopt Option A/B: per-brand Neon PROJECT. BBL keeps the existing project (claim by declaration + env
scoping, no rename, no data move); MMB / Baseline / RDD each get a NEW Neon project as they cut over.
Layer a Neon Preview BRANCH inside the BBL project to close #398.**

- **The operator's instinct is right — and it is already ratified law** (ADR 0038 impl. step 2 + ADR
  0057 + the per-app-DB runbook + G-002). This is **execution of the deferred Phase-2 cloud half, not a
  new architecture decision.** No ADR conflict; no re-litigation needed.
- **Three adjustments, not a change of direction:**
  1. **"Claim" = declare-by-env-scoping now + physically purge non-BBL rows LATER.** The DB still holds
     Baseline (and enum-implied RDD/WEKAF) rows. Declaring it BBL's is safe today; *purging* the foreign
     rows is a separate, destructive, gated lane (the parked "cut Baseline/non-lineage from BBL repo"
     work) that runs only after each brand's data lives in its own verified new DB.
  2. **Neon branches are the #398 answer, not a rival.** Add one Preview branch in the BBL project; that
     is the actual first executable move and it is what de-risks #380.
  3. **Do NOT rename the BBL DB or its env var** (runbook `:60`). Keep bare `DATABASE_URL`/`DIRECT_URL`
     on BBL's own project; the S3/Stripe/Resend BBL-suffix pattern is not worth breaking every BBL
     connection for.
- **"Is this how Giddy would handle it?" — yes.** It is additive-first, lineage-preserving (BBL never
  moves, never renames), incremental (staggered per brand), and it lands nothing destructive before a
  proof gate. The only Giddy flag is the **factual correction in §2** — the operator's mental model of
  "multiple per-brand DBs already inside the project" is wrong; steps that assume existing separation
  would mis-fire.

## 6. Safe ordered sequence (nothing destructive precedes proof)

All steps are **operator-dashboard** (Vercel/Neon) unless marked **[code]**. No secret values printed.

| # | Step | Where | Destructive? |
| --- | --- | --- | --- |
| 0 | **DB-identity confirmed** (this report: single multi-tenant DB, Brand enum, Baseline rows present). No action beyond recording it. | — | No |
| 1 | **#398a — create a Neon Preview branch** off the BBL primary branch. | Neon | No |
| 2 | **#398b — scope env vars.** Set Preview-scoped `DATABASE_URL`/`DIRECT_URL` → the Preview branch; **narrow the prod pair to Production-only.** Record the Deployment-Protection decision. | Vercel | No (strictly *reduces* Preview's blast radius) |
| 3 | **#398c — pick + record an explicit Preview-migration mechanism** (the landed prebuild guard *skips* Preview by design — keep the skip until DB identity is proven). | **[code]** + docs | No |
| 4 | **#398 PROOF GATE — throwaway additive-migration PR:** no new row in prod `_prisma_migrations`; Preview logs its branch/DB identity (no creds); the explicit mechanism migrates the branch; Preview app renders; prod unchanged. **This gate unblocks both the claim and #380.** | Vercel/Neon | No |
| 5 | **Claim/declare** the existing Neon project as BBL's dedicated project (no rename, no data move — runbook `:57-60`). Optional: update G-002 progress. | docs/ledger | No |
| 6 | **Per-brand new projects, staggered by each brand's own cutover** — run `new-brand-setup` for MMB/Baseline/RDD: new Neon **project** + own Vercel project env + isolation proof. **Not a fan-out dependency of BBL's claim; each brand proceeds on its own timeline.** | Neon/Vercel + **[code]** | No (additive) |
| 7 | **#380 (now unblocked by step 4)** — separate attended lane: additive expand → backfill → dual-read/write proof → writer cutover → guard → **destructive RankAward drop LAST**, with foreground prod preflight + parity proof. | **[code]** + prod | Yes — gated, last |
| 8 | **LAST, separate lane — purge non-BBL rows** from the claimed BBL DB (the "cut Baseline/non-lineage" work), only after each foreign brand's data is in its own verified new DB. | prod | Yes — gated, last |

- **Where #398 slots in:** steps 1–4 — it is the **prerequisite**, not a follow-on. Everything else
  waits on the step-4 proof gate.
- **How it de-risks #380:** step 2 removes prod creds from Preview and step 4 proves a Preview build
  cannot write prod `_prisma_migrations`; #380's destructive drop then cannot be triggered by an
  incidental Preview build — exactly the failure that blocked it.

## 7. Risks & rollback

| Step | Risk | Mitigation / rollback |
| --- | --- | --- |
| 1–2 | Preview app can't connect (branch URL wrong / branch not migrated). | Preview-only; prod untouched. Rollback = revert the Preview-scoped var. Prod stays Production-scoped throughout. |
| 2 | Narrowing prod creds accidentally starves a prod build. | Prod build reads Production-scoped var — verify the prod scope is set *before* removing the Preview overlap; keep prodsnap for restore. |
| 3–4 | Chosen Preview-migration mechanism drifts from prod. | The throwaway proof (step 4) is the gate; do not relax the prebuild skip speculatively (#398 note). |
| 5 | Someone "tidies" by renaming the DB/env var. | Runbook `:60` forbids it — breaks every BBL connection for zero benefit. Declaration is metadata only. |
| 6 | New brand's migration touches BBL (isolation regression). | Mandatory isolation proof (runbook `:154-177`) — empty before/after diff on BBL DB. |
| 7 | Destructive RankAward drop before parity proven. | #380's own guard: no destructive step before the verified point-of-no-return; foreground prod preflight; reversible per stage. |
| 8 | Purge deletes rows a not-yet-migrated brand still needs. | Runs only after each foreign brand's new DB is seeded + verified; prodsnap restore is the rollback. |

## 8. Open questions / confirm before executing

1. **Does the 08-05 MMB cutover need the MMB *CRM* prod DB, or only the marketing site?** Ground truth
   shows `mammothmb.com` DNS moving to a `mammoth-website` project (not git-wired) — that reads as a
   **website/DNS** cutover, a different deploy unit from the `clients/mammoth-build-crm` DB. If the site
   doesn't need the CRM live, **do not couple the DB lane to the 2-days-out deadline** — MMB's Neon
   project can be stood up on its own schedule (step 6).
2. **What actually lives in prod for Baseline/RDD/WEKAF?** prodsnap shows 20 Baseline `Rank` rows — is
   that live Baseline data a new Baseline DB must carry, or import/seed cruft? Needs an operator-run prod
   read (not the agent — never prod creds) before any purge (step 8).
3. **Neon plan limits + cost** of one Preview branch and N new projects (billing/compute per project).
4. **Env-var naming:** keep bare `DATABASE_URL` on BBL's project (recommended) vs adopt a BBL-suffix like
   S3/Stripe/Resend. Runbook says don't rename; confirm the operator agrees.
5. **Per-app Better Auth on each new DB** (ADR 0057 D5) — confirm each new brand's auth tables land on
   its own DB, not a shared identity table.
6. **Vercel domain hygiene (adjacent):** `mammothmb.com` + `baselinemartialarts.com` still ride the
   misnamed BBL Vercel project. Part of the separation story but orthogonal to the DB lane — move each to
   its own git-wired project when that brand cuts over.

## 9. Routing (review-recommend §5 — stage, don't build)

- **Goal row:** update **G-002** (`docs/knowledge/wiki/goals-ledger.md:57-71`) — record the confirmed
  single-multi-tenant-DB finding and mark this sequence as the **Phase-2 cloud-half** plan. No new doc
  family; this extends the existing lane.
- **Next-session staging (one slice only):** stage **"#398 Preview-isolation: Neon Preview branch +
  Production-only env scoping + explicit preview-migration mechanism + throwaway additive-PR proof"**
  (steps 1–4). That single operator-gated slice unblocks *both* the BBL claim (step 5) and #380 (step 7).
- **Do NOT stage as next:** the per-brand new projects (step 6, staggered), the #380 drop (step 7), or
  the non-BBL purge (step 8) — all sit behind the step-4 proof gate.
- **Inputs for that next session's bow-in:** `docs/adr/0057-per-app-databases.md` ·
  `docs/runbooks/database/per-app-db-separation.md` · `apps/web/scripts/prebuild-migrate.ts` ·
  `gh issue view 398` · this report.
