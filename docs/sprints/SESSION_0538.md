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
| SESSION_0538_TASK_01 | pending | baseline_dev schema + init migration (domain + auth) |
| SESSION_0538_TASK_02 | pending | Baseline per-product Better Auth (D5) |
| SESSION_0538_TASK_03 | pending | Public inquiry funnel → Lead |
| SESSION_0538_TASK_04 | pending | Auth-gated admin Leads board |

## What landed

<!-- filled at bow-out -->

## Decisions resolved

- Fork 1: Baseline Phase 2 scope = **Option 2 (full parity: funnel + auth + admin board)**.
- Fork 2: board data-separation is **structural** (per-product DBs), not a policing task.
- Cloud half (Neon/Vercel/domain) = **deferred**, operator-gated, RISK #13 rotation first.

## Files touched

<!-- filled at bow-out -->

| File | Change |
| --- | --- |

## Verification

<!-- filled at bow-out -->

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

- Cloud half of G-002 (Neon provision + Vercel + `baselinemartialarts.com` cutover) remains — operator/SHIP
  gated; RISK #13 (Neon credential rotation) is its precondition.

## Next session

### Goal

<!-- filled at bow-out -->

### First task

<!-- filled at bow-out -->

## Review log

<!-- filled at bow-out -->

## Hostile close review

<!-- filled at bow-out -->

## ADR / ubiquitous-language check

<!-- filled at bow-out; expected: ADR 0038 confirmed valid (executes its Phase 2 for Baseline), no new ADR. -->

## Reflections

<!-- filled at bow-out -->

## Full close evidence

<!-- filled at bow-out -->

| Step | Proof |
| --- | --- |
