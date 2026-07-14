---
title: "SESSION 0538 — G-002: Baseline Phase 2 (local) — own-DB wiring, per-product auth, public Lead funnel + gated admin board"
slug: session-0538
type: session--implement
status: in-progress
created: 2026-07-14
updated: 2026-07-14
last_agent: claude-session-0538
sprint: S12
pairs_with:
  - docs/sprints/SESSION_0536.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0538 — G-002: Baseline Phase 2 (local) — own-DB wiring, per-product auth, public Lead funnel + gated admin board

## Date

2026-07-14

## Operator

Brian + claude-session-0538

## Goal

Advance **G-002 (per-product DB separation, ADR 0038, P1)** by bringing `apps/baseline` from a Phase-1
scaffold up to **Mammoth's phase (full parity)**, entirely **local** (no cloud/Neon — that half stays
operator/SHIP-gated). Baseline currently has its own DB _target_ (`baseline_dev`) but **no migration
applied**, a **fully static** token-driven funnel (nothing imports `lib/db`), and **no auth**. This
session wires it onto its own DB and adds per-product identity: (1) the first `baseline_dev` migration
(Lead / LeadStatus / SchoolSettings + Better Auth tables), (2) Baseline's **own** Better Auth instance
(ADR 0038 D5 — no shared identity), (3) the **public** inquiry funnel → `Lead` (deliberately
un-authenticated — that's how prospects submit), and (4) an **auth-gated** admin Leads board on the
shared `AdminKanban` kernel. Mirrors the proven Mammoth 0460 (local wiring) + 0464 (per-product auth)
recipe, compressed into one coherent lane.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0536.md` (RISK #2 CSP sink + nonce, Report-Only — closed,
  PR #204 merged `eefe069d`). Its "Next session" block offered **G-002 (P1)** or the CSP flip; the CSP
  flip is a future operator-gated canary (not before a few days of clean prod reports, i.e. ~2026-07-17),
  so it is NOT this session. Operator pinned **G-002**.
- Carryover: CSP is DONE + LIVE on prod (Report-Only); only the `CSP_ENFORCE=1` flip remains, deferred.
  The consolidated docs PR (glossary/ubiquitous-language + Giddy LR 0014/0015) is **already merged** into
  origin/main (`7f39cedb`, `de966faf`) — hands off those files.

### Branch and worktree

- Branch: `session-0538-g002`
- Worktree: `/Users/brianscott/dev/ronin-0538`
- Status at bow-in: clean (fresh worktree off origin/main; only this SESSION file untracked). `bun install`
  re-saved the root lockfile as a no-op (no `bun.lock` diff). Prisma client generated.
- Current HEAD at bow-in: `de966faf` (= origin/main; includes CSP merge `eefe069d`)
- Concurrency: lane **0537** (`session-0537-fi028b`) is live in `../ronin-0537`. G-002 this session is
  **local-only, entirely inside `apps/baseline/**`** — it does NOT touch `.github/workflows/clients-ci.yml`
  (already covers `apps/baseline/**`), CI, or shared files, so no coordination collision with 0537.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/database (per-app `DATABASE_URL` + `prisma/`), Auth (Better Auth per product), Hosting/deploy edges (none this session — cloud deferred). |
| Extension or replacement | **Extension** — extends Dirstarter's single-DB Prisma + Better Auth patterns to a **per-app** instance (ADR 0038 D1/D5), mirroring the already-landed Mammoth product. Same Prisma client/migration + Better Auth workflow, scoped to `baseline_dev`. |
| Why justified | ADR 0038 ratified one DB + one identity per product; Baseline was scaffolded (0463) but never wired. This finishes its local half, closing the biggest phase asymmetry in the per-product table. |
| Risk if bypassed | Leaving Baseline static means G-002 is half-done and the "repeatable per-product" claim is unproven for an `apps/*` peer (only `clients/*` Mammoth proved it). |

Live docs checked during planning: not applicable — mirrors an in-repo proven recipe (Mammoth
`clients/mammoth-build-crm`), not a net-new Dirstarter integration.

### Graphify check

- Discovery was **direct-read + a scoped Explore recon** (paths known from ADR 0038 + the per-app-db
  runbook), not a graphify query — the lane is a single-product mirror of a known recipe, so exact files
  were opened directly (ADR 0038, `clients-ci.yml`, Mammoth `lib/{auth,actions,board-config,board-store-db}.ts`
  + `app/app/page.tsx`, Baseline `prisma/schema.prisma` + `lib/db.ts` + `app/page.tsx`). Recon verified the
  16-day-old memory was stale (Mammoth auth landed 0464; Baseline is Phase-1 scaffold only).

### Grill outcome

Two forks resolved with the operator before build:

1. **Baseline Phase 2 scope — Option 2 (full Mammoth parity).** Operator chose the funnel + per-product
   Better Auth + a DB-backed admin board in one session (vs. the leaner funnel-only Option 1). Avoids ever
   shipping an unauthenticated admin surface and brings Baseline to Mammoth's exact phase.
2. **Board data separation — structural, not policed.** Operator asked that Baseline tasks never appear on
   Mammoth's board (shared feature/behavior, separate data). This is **guaranteed by ADR 0038**: Baseline
   `Lead`s live in `baseline_dev`, Mammoth `Project`s in `mammoth_dev`, loop-board `KanbanCard`s in BBL's DB
   — three databases. `AdminKanban` is shared only as a **kernel UI component**; each board reads its own DB
   via its own `BoardStore` adapter. No cross-over is possible; zero extra work.

Also surfaced (not re-litigated): the operator's other named forks are **already resolved** — CI matrix
(`clients-ci.yml` dynamic discover already covers `apps/baseline`), local provisioning path, and per-app
migration isolation are all shipped. The **cloud half (Neon + Vercel + `baselinemartialarts.com` cutover)
is deferred** — it needs operator provisioning I can't do autonomously, and **RISK #13 (a prod Neon
credential exposed in transcripts — rotation overdue) must be cleared before standing up new Neon projects.**

### Drift logged

None new. Noted for the register at bow-out: the board still shows `G-002 in-progress` while G-003 /
MB-DATA-002/003 / G-004 sub-items are already done — the remaining scope is the Baseline local half (this
session) + the deferred cloud batch.

## Petey plan

### Goal

Wire `apps/baseline` onto its own `baseline_dev` DB with per-product Better Auth, a public `Lead` funnel,
and an auth-gated admin Leads board — mirroring the Mammoth recipe, entirely local.

### Tasks

#### SESSION_0538_TASK_01 — `baseline_dev` schema + first migration (domain + auth tables)

- **Agent:** Cody
- **What:** Add Better Auth tables to `apps/baseline/prisma/schema.prisma` (mirror the Mammoth
  User/Session/Account/Verification + role enum block) alongside the existing Lead/LeadStatus/SchoolSettings;
  create + apply the **first** `baseline_dev` migration; add the `better-auth` dependency.
- **Steps:**
  1. Extend `apps/baseline/prisma/schema.prisma`: add `User`, `Session`, `Account`, `Verification` +
     a `BaselineRole` enum (`owner | member`) — copy the shape from
     `clients/mammoth-build-crm/prisma/schema.prisma` (lines ~54–117). Keep the existing Lead/SchoolSettings.
     **No `TeamMember`/owner-entity** — Baseline is single-tenant (one school); the `User.role` is the gate.
  2. Add `"better-auth": "^1.6.16"` to `apps/baseline/package.json` deps; `bun install` in-dir.
  3. `createdb baseline_dev` (if absent), then generate + apply a single hand-reviewed `init` migration
     (greenfield DB → one comprehensive migration is cleanest). **Commit the SQL file.** Honor
     "hand-authored migrations only": review the generated SQL before commit; `baseline_dev` is a **fresh,
     isolated** DB, so the shared-DB `migrate dev` reset trap does NOT apply here.
  4. **Isolation proof** (ADR 0038): confirm `ronindojo_prodsnap`/`ronindojo_dev` **and** `mammoth_dev` are
     untouched (table counts / digests unchanged) after the Baseline migration.
- **Done means:** `baseline_dev` has Lead/SchoolSettings + auth tables; migration SQL committed; Prisma
  client regenerates; other product DBs byte-unchanged; `better-auth` installed.
- **Depends on:** nothing

#### SESSION_0538_TASK_02 — Baseline per-product Better Auth (ADR 0038 D5)

- **Agent:** Cody
- **What:** Stand up Baseline's **own** Better Auth instance (no shared identity), mirroring Mammoth 0464.
- **Steps:**
  1. `apps/baseline/lib/auth.ts` — mirror `clients/mammoth-build-crm/lib/auth.ts`: `betterAuth` +
     `prismaAdapter(db)` + `admin()` plugin with `owner`/`member` roles + `getServerSession()`. Email+password
     only (no email infra → no magic-link/social). Simpler than Mammoth: **no `TeamMember` resolution** —
     the session `user` + `role` is the owner.
  2. `apps/baseline/app/api/auth/[...all]/route.ts` — mirror Mammoth's handler.
  3. Env: add `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL` to `apps/baseline/.env.example` **and** the local
     `.env` (generate a dev secret locally). Validate-loud on missing (mirror `lib/db.ts`'s pattern).
  4. A minimal **sign-in path** for local dev so the gated admin is reachable: mirror whatever Mammoth does
     (a sign-in page or a seeded owner). Prefer a tiny `app/(auth)/login` email+password page + an owner
     seed in `prisma/seed.ts` (idempotent upsert) so the board is testable headless.
- **Done means:** an owner can sign in locally; `getServerSession()` returns the session; unauth requests
  resolve to `null`. No shared User/session with BBL or Mammoth.
- **Depends on:** SESSION_0538_TASK_01 (auth tables must exist)

#### SESSION_0538_TASK_03 — Public inquiry funnel → `Lead` (un-authenticated, hardened)

- **Agent:** Cody
- **What:** Replace the static mailto "visit" section of `apps/baseline/app/page.tsx` with a real inquiry
  form that POSTs to a **public** `createLead` server action.
- **Steps:**
  1. `apps/baseline/lib/actions.ts` (`"use server"`) — `createLead(input)`: **public / un-authenticated**
     (prospects aren't logged in). Validate (name+email required, email shape, length caps, trim); insert a
     `Lead` with `status: NEW`, capture `source` (e.g. `"web_form"`). No admin data returned. Keep it the
     ONLY public export; every other action in this module is auth-gated (TASK_04).
  2. A client `InquiryForm` component (name / email / phone? / interest / message) wired to `createLead`,
     with a success/confirmation state and inline validation. Token-driven styling (match the existing page).
  3. Swap the `#visit` section to render `<InquiryForm />` (keep the mailto as a secondary fallback if clean).
- **Done means:** submitting the public form inserts a `Lead` row in `baseline_dev` (verified headless);
  invalid input is rejected client+server; no session required to submit.
- **Depends on:** SESSION_0538_TASK_01

#### SESSION_0538_TASK_04 — Auth-gated admin Leads board (own-DB `BoardStore` adapter)

- **Agent:** Cody
- **What:** A DB-backed admin board over `Lead` on the shared `AdminKanban` kernel, gated by Baseline's auth.
  Baseline's **own** board — leads only (separate DB guarantees no Mammoth cross-over).
- **Steps:**
  1. `apps/baseline/lib/board-config.ts` — `BASELINE_BOARD` `BoardConfig`: a **Lead pipeline** whose stages
     map the `LeadStatus` enum (`NEW → CONTACTED → TRIAL_BOOKED → ENROLLED → CLOSED`), `intake: true` on NEW,
     terminal on CLOSED. Plus a `leadToCard(lead)` mapper (mirror `board-config.ts` `projectToCard`).
  2. Extend `apps/baseline/lib/actions.ts` with **auth-gated** exports (session required via a simple
     `requireAuth()` — single-tenant, **no per-lead `ownerId`/IDOR** scoping needed): `listLeads()`,
     `setLeadStatus(id, status)`, `reconcileBoard(cards)` (card.stage → LeadStatus; existing → update, new →
     create; preserve the kernel card id).
  3. `apps/baseline/lib/board-store-db.ts` — `createDbBoardStore()` implementing the kernel `BoardStore`
     port (load → `listLeads` → `leadToCard`; save → `reconcileBoard`). Mirror Mammoth exactly.
  4. `apps/baseline/app/app/page.tsx` (or `app/admin`) — mount `<AdminKanban config={BASELINE_BOARD}
     store={store} />`, **gated**: server-check `getServerSession()`, redirect unauth to the login. Pure wiring.
- **Done means:** signed-in owner sees Baseline leads as a pipeline board, can drag/advance status
  (persists to `baseline_dev`); unauth is redirected; a public-funnel `Lead` shows up on the board. No
  Mammoth data appears (different DB).
- **Depends on:** SESSION_0538_TASK_01, _02 (auth gate), _03 (shared `lib/actions.ts`)

### Parallelism

**Sequential — one coherent Cody build.** All four tasks live in `apps/baseline/**`, share files
(`schema.prisma` → everything; `lib/actions.ts` spans TASK_03+04; auth gates the board), and mirror one
proven recipe. Build order: 01 → 02 → 03 → 04, running gates at checkpoints. **Verification fans out**
(Doug + Giddy + Desi) after the build.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0538_TASK_01–04 | Cody | One coherent per-product mirror of a proven in-repo recipe; sequential shared-file build. |
| Verify | Doug + Giddy + Desi | Doug: migration isolation + gates + headless funnel/board proof; Giddy: ADR 0038 D1/D5 compliance + per-product boundary (no shared identity, no cross-DB FK); Desi: public funnel UX + admin board parity with Mammoth. |

### Open decisions

- **Migration approach** — greenfield `baseline_dev` gets ONE hand-reviewed `init` migration (Lead +
  SchoolSettings + auth tables). `migrate dev` is acceptable here because the DB is fresh + isolated (the
  banned-`migrate dev` rule is about the shared BBL local DB). Cody proves isolation. (Confirm at build; the
  default is one comprehensive init.)
- **Sign-in surface** — a tiny local login page + seeded owner (default) vs. relying on the Better Auth API
  only. Default: login page + idempotent owner seed so the gated board is headless-verifiable.

### Risks

- **Compressing two Mammoth sessions (0460 + 0464) into one.** Mitigation: mirror the exact recipe files;
  build in dependency order with gate checkpoints; strong review wave catches gaps. Split into a second Cody
  pass if TASK_04 destabilizes.
- **`@ronin-dojo/ui-kit/kanban` import in an `apps/*` workspace member.** Mammoth is standalone-bun; Baseline
  is a workspace member (`workspace:*`). The kernel import already works in Baseline's scaffold — confirm the
  board mount resolves under Turbopack (watch the `link-ui-kit`/`transpilePackages` gotcha from the memory).
- **Public `createLead` is un-authenticated by design** — must be validated + not leak admin data; it is the
  ONLY public export. (Not a DB-write-abuse risk locally; a rate-limit is a cloud-phase concern.)

### Scope guard

- **Local only.** Do NOT provision Neon, create a Vercel project, or touch `baselinemartialarts.com` DNS /
  the BBL redirect — the cloud half is deferred/operator-gated (and RISK #13 rotation precedes any new Neon).
- Do NOT touch `apps/web` (BBL), `clients/mammoth-build-crm`, `.github/workflows/*`, or any shared/kernel
  file beyond consuming `@ronin-dojo/ui-kit`. No cross-product FKs; no shared identity.
- Do NOT start the `getRequestBrand`/`Brand` vestige prune (B4) — separate deferred sub-lane.
- FI-001 stays PARKED.

### Dirstarter implementation template

- **Docs read first:** not applicable — mirrors the in-repo Mammoth product (`clients/mammoth-build-crm`).
- **Baseline pattern to extend:** per-app Prisma client (`lib/db.ts`, already scaffolded) + Better Auth
  per product (Mammoth `lib/auth.ts`) + kernel `AdminKanban` via a `BoardStore` adapter (ADR 0033 D2).
- **Custom delta:** Baseline's `Lead` funnel (public capture) + `LeadStatus` pipeline board; single-tenant
  auth (no `TeamMember`/IDOR layer Mammoth needed).
- **No-bypass proof:** consumes the shared kernel + the Dirstarter Prisma/auth patterns per-app; replaces
  nothing. Extends ADR 0038's already-proven per-product separation to the `apps/baseline` peer.

## Cody pre-flight

### Pre-flight: SESSION_0538_TASK_01–04

#### 1. Existing component scan

- Reference recipe (READ, then mirror): `clients/mammoth-build-crm/lib/{auth,actions,board-config,board-store-db}.ts`,
  `clients/mammoth-build-crm/app/app/page.tsx`, `clients/mammoth-build-crm/app/api/auth/[...all]/route.ts`,
  `clients/mammoth-build-crm/prisma/schema.prisma` (auth block) + its `better_auth` migration SQL.
- Baseline current state: `apps/baseline/lib/db.ts` (ready), `apps/baseline/prisma/schema.prisma`
  (Lead/LeadStatus/SchoolSettings), `apps/baseline/app/page.tsx` (static funnel), `.env.example`.

#### 2. L1 template scan

- Kernel: `@ronin-dojo/ui-kit/kanban` (`AdminKanban`, `BoardStore`, `BoardConfig`, `BoardCard`). Consumed,
  not modified.

#### 3. Composition decision

- Extending: Baseline's own `lib/db.ts` + the Mammoth per-product recipe. Composing the shared `AdminKanban`.

#### 4. Lane docs loaded

- ADR read: `docs/architecture/decisions/0038-per-product-database-separation.md`.
- Runbooks: `docs/runbooks/database/per-app-db-separation.md`, `docs/runbooks/onboarding/new-client-runbook.md`.

#### 5. Dev environment confirmed

- Dev server: `cd apps/baseline && next dev` (own port). DB: local `baseline_dev` (Postgres.app).
- Working directory: `/Users/brianscott/dev/ronin-0538` (worktree).

#### 6. FAILED_STEPS check

- Watch: standalone/workspace `file:`-link ui-kit Turbopack gotcha; shared-DB `migrate dev` reset trap (N/A
  on fresh `baseline_dev` but verify isolation). Mitigations acknowledged in Risks above.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0538_TASK_01 | landed | `baseline_dev` first migration `20260714141517_init` (Lead/SchoolSettings + Better Auth tables); `better-auth` dep; isolation proven |
| SESSION_0538_TASK_02 | landed | Baseline own Better Auth (D5) — `lib/auth.ts`, `api/auth/[...all]`, login page, owner seed; `disableSignUp` (F1 fix) |
| SESSION_0538_TASK_03 | landed | Public `createLead` funnel + `InquiryForm` → `Lead(NEW)` |
| SESSION_0538_TASK_04 | landed | Auth-gated admin Leads board (`BASELINE_BOARD` on shared `AdminKanban` via own `createDbBoardStore`) |

## What landed

Baseline (`apps/baseline`) advanced from a Phase-1 static scaffold to Mammoth's phase — full local
per-product separation. Two commits on `session-0538-g002` (`1c1eaec1` build, `b66dd746` hardening):

- **TASK_01 — `baseline_dev` schema + first migration.** Added `User/Session/Account/Verification` +
  `BaselineRole` enum to the schema (kept `Lead/LeadStatus/SchoolSettings`); one greenfield `init` migration
  (`20260714141517_init`, 6 tables + 2 enums, auth FKs CASCADE, **no cross-product FK**); `better-auth`
  dep added. **Isolation proven**: `ronindojo` (147 tables/3590 rows) + `mammoth_dev` (11/7) byte-unchanged.
- **TASK_02 — Baseline's OWN Better Auth (D5).** `lib/auth.ts` (`prismaAdapter` + `admin()` owner/member,
  fail-loud secret), `app/api/auth/[...all]`, `lib/auth-client.ts`, `app/login` staff sign-in, idempotent
  owner seed. **No shared identity.** `disableSignUp: true` (F1 hardening) — seed reworked to a direct
  User+credential-Account insert using Better Auth's own hasher (owner still signs in; public sign-up → 400).
- **TASK_03 — public inquiry funnel → `Lead`.** `createLead` — the ONLY un-authenticated export; validated
  (name+email required, email shape, length caps, server-set `status:NEW`/`source:web_form`), returns only
  `{ok,id}`. `components/inquiry-form.tsx` (client form, try/catch/finally on submit — F2 hardening). The
  static mailto `#visit` section swapped for `<InquiryForm />` (mailto kept as a secondary line).
- **TASK_04 — auth-gated admin Leads board.** `BASELINE_BOARD` (a `LeadStatus` pipeline
  NEW→CONTACTED→TRIAL_BOOKED→ENROLLED→CLOSED) on the shared `AdminKanban` kernel via a Baseline-local
  `createDbBoardStore` over `baseline_dev`. Single-tenant `requireAuth` (no `ownerId`/IDOR layer);
  `reconcileBoard` wrapped in `db.$transaction` (F3 hardening); `app/app/page.tsx` server-gated (redirect
  unauth → `/login`). Board separation from Mammoth is **structural** (separate DBs), not policed.

Local only — no Neon/Vercel/domain cutover (deferred, operator-gated).

## Decisions resolved

- Fork 1: Baseline Phase 2 scope = **Option 2 (full parity: funnel + auth + admin board)**.
- Fork 2: board data-separation is **structural** (per-product DBs), not a policing task.
- Cloud half (Neon/Vercel/domain) = **deferred**, operator-gated, RISK #13 rotation first.

## Files touched

| File | Change |
| --- | --- |
| `apps/baseline/prisma/schema.prisma` | +`User/Session/Account/Verification` + `BaselineRole` enum |
| `apps/baseline/prisma/migrations/20260714141517_init/migration.sql` | new — greenfield init (6 tables, 2 enums) |
| `apps/baseline/prisma/seed.ts` | owner seed (direct User+credential insert, BA hasher) + settings + 3 demo leads |
| `apps/baseline/package.json` · `bun.lock` | +`better-auth ^1.6.16` (Baseline dep edge) |
| `apps/baseline/lib/auth.ts` | new — own Better Auth (`admin()`, `disableSignUp`, fail-loud secret) |
| `apps/baseline/lib/auth-client.ts` | new — Better Auth React client |
| `apps/baseline/app/api/auth/[...all]/route.ts` | new — `toNextJsHandler(auth)` |
| `apps/baseline/app/login/page.tsx` | new — staff email+password sign-in |
| `apps/baseline/lib/actions.ts` | new — public `createLead` + gated `listLeads`/`setLeadStatus`/`reconcileBoard` (`$transaction`) |
| `apps/baseline/lib/types.ts` | new — DTOs (kept out of the `"use server"` module) |
| `apps/baseline/lib/board-config.ts` | new — `BASELINE_BOARD` + `leadToCard` |
| `apps/baseline/lib/board-store-db.ts` | new — `createDbBoardStore` (kernel `BoardStore` port) |
| `apps/baseline/app/app/page.tsx` · `app/app/leads-board.tsx` | new — server-gated board page + client island |
| `apps/baseline/components/inquiry-form.tsx` | new — public funnel form (try/catch) |
| `apps/baseline/app/page.tsx` | `#visit` mailto → `<InquiryForm />` |
| `apps/baseline/.env.example` | +auth vars + explicit-user note |
| `docs/architecture/decisions/0038-per-product-database-separation.md` | impl-status: Baseline local Phase 2 landed + cloud-cutover gate |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (baseline) | ✅ green |
| `bun run build` (baseline) | ✅ 5 routes (`/`+`/login` static, `/app`+`/api/auth/[...all]` dynamic) |
| `oxfmt --check` | ✅ baseline 25 + apps/web 1925 files (no regression) |
| `oxlint` (baseline) | 1 pre-existing warning (`lib/db.ts:29` globalThis, scaffold pattern — not introduced) |
| Migration isolation | ✅ `ronindojo` 147t/3590r + `mammoth_dev` 11t/7r byte-unchanged (Doug re-verified) |
| Headless data-layer smoke | ✅ Cody 16-check + Doug 19-check — public/gated boundary, `disableSignUp` 400, owner sign-in, `$transaction` rollback |
| Live render (lead-driven, `:3100`) | ✅ funnel submit → `Lead` in `baseline_dev` → gated board after owner sign-in; `/app`→`/login` unauth; **0 console errors** |
| Verifier wave | Doug **GO 9.5** · Giddy **PASS** (ADR 0038 D1/D5 confirmed) |

## Open decisions / blockers

- **G-002 cloud half remains** (operator/SHIP-gated) — recorded in ADR 0038 impl-status. **Baseline
  cloud-cutover gate** before `baselinemartialarts.com` detaches from BBL: rate-limit/captcha the public
  `createLead`, real `BETTER_AUTH_SECRET`/`URL`, decide `requireEmailVerification`, and **RISK #13 Neon
  rotation FIRST**. Mammoth cloud half + the `getRequestBrand`/`Brand` prune are separate deferred sub-lanes.
- **Banked polish (non-blocking):** board cards render the name twice (`title` + `contact.name` are the same
  value); the kernel `cardKind:"deal"` renders a `$` glyph that reads oddly for a non-monetary school lead —
  a future Desi pass. `lib/db.ts` globalThis oxlint warning is a pre-existing repo-wide scaffold pattern.

## Next session

### Goal

Operator's call. Top G-002-adjacent candidates: the **cloud batch** (Neon + Vercel provisioning for
Mammoth/Baseline + the Baseline domain cutover — operator-gated, RISK #13 rotation first), OR the next top
board card. G-002 stays **in-progress** (local half done for all products; cloud half remains).

### First task

If the cloud batch: rotate the exposed Neon credential (RISK #13), then provision Baseline's Neon + Vercel
project (rooted `apps/baseline`) with a real `BETTER_AUTH_SECRET`/`URL`, add a rate-limit to `createLead`,
and cut `baselinemartialarts.com` over from BBL (verify `blackbeltlegacy.com` stays on BBL first — ADR 0039
D5). Otherwise pick the top non-parked board card (`cd apps/web && bun scripts/board-backlog.ts --top=10`).

## Review log

### SESSION_0538_REVIEW_01 — verifier wave (Doug + Giddy) + lead live render

- **Reviewed tasks:** SESSION_0538_TASK_01–04.
- **Dirstarter docs check:** not applicable — mirrors the in-repo Mammoth product; extends the per-app
  Prisma + Better Auth baselines (no Dirstarter capability replaced).
- **Sources:** ADR 0038, the Mammoth `clients/mammoth-build-crm` recipe, the migration SQL, live `:3100`
  render + DB probes.
- **Verdict:** Doug **GO 9.5/10** (gates green, migration isolation empirically re-proven, 19-check smoke +
  a signup PoC that confirmed F1); Giddy **PASS** (faithful mirror, surgically scoped to `apps/baseline/**`,
  ADR 0038 D1/D5 confirmed, Baseline improves on Mammoth twice). **F1** (open self-serve sign-up +
  session-only board gate) was fixed in-session (`disableSignUp` + seed rework), re-verified. P3-a
  (form error path) + P3-b (atomic `reconcileBoard`) also fixed. Lead live render: full funnel → gated-board
  round-trip green, 0 console errors.
- **Score:** 9.5/10.
- **Follow-up:** cloud-cutover gate (ADR 0038 impl-status). `/fallow-fix-loop` + `/code-quality` +
  hostile-close + `/pr-review-fix` run post-PR (operator-requested).

### SESSION_0538_REVIEW_02 — /fallow-fix-loop + /code-quality (code-quality-matrix)

- **fallow-fix-loop:** pruned 3 introduced dead exports (`useSession`/`admin` in `auth-client.ts`,
  `setLeadStatus` in `actions.ts`, the `Session` type in `auth.ts`) — behavior-preserving (typecheck confirms
  no broken consumer). Delta: **dead exports 16.0%→0.0%, dead-code issues 5→1** (the 1 = inherited `pg` dep
  from the 0463 scaffold), **MI 93.3→93.8**. 3 complexity findings (`createLead` 7-cyc, reconcile arrow 6-cyc,
  `onSubmit` 5-cyc) **accepted-with-reason** (modest cyclomatic; CRAP is a 0-coverage estimate artifact).
  Committed `bf896d06`.
- **/code-quality (code-quality-matrix §2):** roll-up — `lib/actions.ts` **9.0**, `inquiry-form.tsx` **9.1**,
  `seed.ts` **9.2**, `board-config`/`board-store-db` **9.4**, `lib/auth.ts` **9.4**. **Aggregate ≈ 9.2
  (Strong)**, no cap. **Apple/Facebook verdict:** gold-adjacent; gap to 9.5 = durable committed tests + a
  `createLead` rate-limit (cloud) — both correctly deferred. No new forced fix (fallow already cleaned the
  diff; inventing churn would violate no-regression/YAGNI).

### SESSION_0538_REVIEW_03 — /pr-review-fix (PR #207 CI triage)

- **CI status:** green except **Playwright (chromium)**. Diagnosed as an **unrelated flake / pre-existing
  apps/web env issue**, NOT a regression from this diff: chromium-only (firefox + webkit green); the diff
  touches **zero `apps/web` files** (BBL e2e only ran on the additive `bun.lock` edge); failures were
  `BJJ_DISCIPLINE_NOT_FOUND` (apps/web test-seed gap) + a chromium `Clipboard.writeText` permission error.
  Typecheck / unit tests / Oxc / both Products-CI checks / **Vercel deploy** all passed. **No fix owed by
  #207**; a re-run clears it. If chromium persistently fails it's a separate apps/web test-seed lane.

## Hostile close review

### Giddy + Doug hostile pass (closing agent, personas applied)

**Dirstarter docs check:** cached docs sufficient — the per-app Prisma + Better Auth extension mirrors the
already-aligned Mammoth product (0459/0460/0464); the one novel bit (`disableSignUp`) was verified
empirically against live `better-auth` 1.6.16 (public sign-up → `400 EMAIL_PASSWORD_SIGN_UP_DISABLED`).
**Sources:** ADR 0038, the Mammoth recipe, live `:3100` render + DB probes. **Verdict:** aligned (extends).

1. **Plan sanity — PASS.** The plan's highest-value move was catching that the 16-day-old memory understated
   progress (Mammoth auth landed 0464; both products already scaffolded), so the operator's named forks were
   partly stale — reframed to the ONE buildable-now slice (Baseline local Phase 2), mirroring a proven recipe
   rather than inventing. The one real risk (compressing two Mammoth sessions into one) was flagged with a
   split-if-destabilizes contingency; it did not destabilize.
2. **Dirstarter compliance — ALIGNED (extends).** Per-app Prisma + Better Auth, kernel consumed via
   `@ronin-dojo/ui-kit/kanban`. No `packages/ui-kit` edit, no cross-product FK, no shared identity
   (Giddy confirmed). No baseline bypassed → **no 8.9 cap**.
3. **Security — NET-SAFE, no exposed path.** The session added a public un-authenticated `createLead` —
   hostile-checked: validated (name+email required, email regex, length caps, trim), server-sets
   `status`/`source` (no mass-assignment), returns only `{ok,id}` (no admin leak). The admin board is
   `requireAuth` + server-redirect gated. The verify wave's **F1** (open self-serve sign-up let a `member`
   reach the single-tenant board — Doug reproduced it live) was **fixed in-session** (`disableSignUp`; PoC now
   `400`). No sensitive-data path exposed without authz → **no 8.9 security cap**. Residual: `createLead`
   rate-limit = cloud-cutover precondition (no prod exposure — Baseline still redirects to BBL).
4. **Data integrity — ENFORCED.** `LeadStatus`/`BaselineRole` are DB enums (invalid → DB rejects); auth FKs
   CASCADE; single-tenant → no `ownerId` invariant. Soft spot: `reconcileBoard` can mint an empty-email Lead
   (deliberate "never fail the board create" fallback, commented) — a data-quality nicety, not an
   only-documented business rule. **No 8.9 data-integrity cap.**
5. **Lifecycle proof — PASS (scoped honestly).** The prospect→Lead→pipeline-board journey is proven
   end-to-end by the live render (funnel submit → Casey Rivera Lead in `baseline_dev` → gated board after
   owner sign-in). The ultimate journey (a real school in prod) is intentionally **not** realized — cloud
   cutover deferred.
6. **Verification honesty — STRONG but EPHEMERAL.** Behavioral, not "it compiles": Cody 16-check + Doug
   19-check headless smoke (public/gated boundary, `disableSignUp` 400, owner sign-in, `$transaction`
   rollback) + lead-driven live render (0 console errors) + empirically re-measured migration isolation. The
   gap: smoke scripts were **deleted** — no committed test durably codifies the boundary. Credible
   verification exists → **no 9.4 cap**; durable regression protection is a named follow-up.
7. **Workflow honesty — PASS.** Lane G-002 (operator-pinned); worktree `ronin-0538`; task IDs
   TASK_01–04; Petey plan + grill (2 forks) → Cody → Doug+Giddy verify → batched fix → live render → PR #207
   → fallow + code-quality gauntlet. Held at the push gate for the operator's word. Caps applied honestly
   (scored Strong, not inflated to Gold).
8. **Merge readiness — READY (on green CI + operator word).** Gates green (typecheck/oxfmt/`next build`;
   oxlint 1 pre-existing warn), wiki-lint 0 err, verify wave GO+PASS, fallow clean (dead exports 0%), live
   render green, isolation proven, F1 fixed. Blast radius flagged: `bun.lock` change → BBL prod redeploy
   (byte-identical `apps/web`).

**Kaizen triage**

1. _Safe & secure? Tests that prove it?_ Provably safe now: `createLead` validated/bounded/no-leak (Doug
   PoC); board session-gated + `disableSignUp` (signup → 400); migration isolation empirical. **Not durably
   proven:** no committed test codifies the public/gated boundary or the sign-up gate (smoke was ephemeral).
   Closing tests: a bun integration spec asserting (a) `createLead` rejects invalid + inserts NEW, (b)
   `listLeads`/`reconcileBoard` throw without a session, (c) sign-up returns 400 — deferred (Baseline has no
   test harness + `clients-ci` runs no product tests; that wiring is its own small lane).
2. _Preventable failed steps?_ ~1 real slip: the plan's forks were partly stale (16-day memory), **caught by
   the Explore recon _before_ grilling** — no wasted build; keep the recon-before-grill step. Micro-slip: F1
   was mirrored from Mammoth's posture rather than hardened at build — caught by the verify wave + fixed
   same-session. Prevention: a "new public/unauthenticated surface → default-deny self-registration" item on
   the per-product-auth checklist. No simplification cut warranted — the recon + verify-wave + fix-loop caught
   everything pre-merge.
3. _Confidence 100/1k/10k?_ **100: 10** (a school's dozens of leads — trivial). **1k: 9** (full-table
   `listLeads` fine; indexed). **10k: 8** (a 10k-lead school would want board pagination + `createLead`
   rate-limit — both named, both cloud-cutover-lane work; no single-tenant school hits 10k before that
   remediation window). **Aggregate 9 → proceed as planned** (≥9 gate).

**Score:** ~9.2/10 (Strong) — no cap triggered (Dirstarter aligned · data-integrity enforced · verification
behavioral → no 9.4 cap · security proof present → no 8.9 cap). Gap to Gold (9.5) = durable committed tests +
cloud-hardening (rate-limit), both correctly deferred and named, not hidden.

### Findings (severity ≥ medium)

None open. F1 (high, cloud-precondition) was **fixed in-session** and re-verified. All other items are
low/banked follow-ups (durable tests, `createLead` rate-limit, empty-email board quick-add, the two cosmetic
board nits) — recorded in `Open decisions / blockers` + ADR 0038 impl-status, not hidden.

## ADR / ubiquitous-language check

- **ADR update NOT required (new ADR).** Executes **ADR 0038**'s Phase 2 for the `apps/baseline` peer;
  Giddy confirmed the ADR valid. Its Implementation-status block was refreshed (Baseline local Phase 2
  landed + the cloud-cutover gate) — a living-status update, not a decision change.
- **Ubiquitous-language update NOT required** — no new domain term (Lead/LeadStatus/pipeline already exist).

## Reflections — kaizen

- **The highest-value move was NOT building — it was reframing stale forks.** The operator's bow-in named
  four forks (which product first, CI wiring, provisioning, migration story) that a 16-day-old memory made
  look open. A scope-recon _before_ grilling showed all four were already answered by shipped work
  (both products scaffolded, `clients-ci` already discovers them) — so the lane collapsed to the one
  buildable-now slice. Trusting the point-in-time memory would have re-litigated settled decisions. Recon
  before grill, always, for an in-progress epic.
- **A faithful recipe mirror can import a latent issue that's _worse_ in the new context.** F1 (open
  self-serve sign-up) was a byte-faithful copy of Mammoth's auth posture — but Mammoth scopes reads by
  `ownerId`, so a stray member sees only their own rows, whereas single-tenant Baseline let any self-
  registrant read _every_ lead. "Mirror the proven recipe" is the right default, but each new
  public/unauthenticated surface still needs its own security check — the verify wave caught it and the fix
  (`disableSignUp` + a seed reworked to a direct credential insert) was one config line plus a small seed
  change.
- **Verification was thorough but ephemeral — that's the honest gap to Gold.** The funnel→Lead→board journey
  was proven by two headless smokes + a live render, but the smoke scripts were deleted and Baseline has no
  committed test (product CI runs typecheck/lint only). Credible verification exists, durable regression
  protection does not — which is exactly why the code-quality score landed Strong (~9.2), not Gold, and why
  the follow-up is named rather than hidden.
- **The gauntlet's real payoff was the pr-review-fix triage.** fallow pruned 3 dead exports and code-quality
  confirmed the shape; but the pr-review-fix pass was what correctly read the red chromium check as an
  unrelated apps/web flake (`BJJ_DISCIPLINE_NOT_FOUND` seed gap + a chromium clipboard-permission error;
  firefox/webkit green; zero apps/web files in the diff) rather than a regression — the difference between
  "my change broke CI" and "a pre-existing flake fired on an unrelated e2e."

## Full close evidence

<!-- completed at true close -->

| Step | Proof |
| --- | --- |
| Task log | 4 tasks, all landed (`## What landed`) |
| Gates | typecheck ✓ · oxfmt ✓ (baseline 25 + web 1925) · `next build` ✓ · oxlint (1 pre-existing warn) |
| Verifier wave | Doug GO 9.5 · Giddy PASS (SESSION_0538_REVIEW_01) |
| Live render | funnel→Lead→gated board round-trip, 0 console errors (`:3100`) |
| Migration isolation | `ronindojo` + `mammoth_dev` byte-unchanged |
| Finding routing | F1 fixed in-session; cloud residual → ADR 0038 impl-status (correct router dest = phased-work, not WL) |
| ADR check | ADR 0038 confirmed valid; impl-status refreshed |
| Fallow delta | dead exports 16%→0%, dead-code 5→1 (inherited `pg`), MI 93.3→93.8 (REVIEW_02) |
| Code-quality | aggregate ≈9.2 Strong, no cap (REVIEW_02) |
| Hostile close | ~9.2, Kaizen aggregate 9 → proceed, no caps, no open findings |
| PR + CI | [#207](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/207) — green except a chromium flake (unrelated apps/web e2e; REVIEW_03); Vercel deployed |
| wiki-lint | 0 err / 52 warn (all pre-existing) |
| Memory sweep | updated `separation-separate-dbs-per-product` (local half done all products; 0538 Baseline) |
| Graphify | refresh deferred to post-merge (canonical checkout; a worktree `graphify update` builds a throwaway graph) |
