---
session: 464
status: closed
---

# SESSION 0464 — Mammoth: Better Auth + staging deploy

## Date

2026-06-28 (pre-staged for the 0463/0464/0465 parallel sprint)

## Operator

Brian

## Goal

Close the Mammoth auth SHIP-gate — **MB-DATA-003**: wire Better Auth into the Mammoth app (per-product
identity + auth tables, ADR 0038 D5) and gate every server action in `clients/mammoth-build-crm/lib/actions.ts`
— then stand up a **Mammoth staging deploy** so the local site is demoable on a live URL before the
`mammothbuild.com` handoff from Michael Flores.

## Status

open

## Locked decisions (sprint planning, 2026-06-28)

- Staging = Mammoth's OWN Vercel preview/project rooted at `clients/mammoth-build-crm` + a Neon staging DB.
- NOT GitHub Pages (can't run a Next server app — server actions + Prisma DB) and NOT a
  `baselinemartialarts.com` proxy (collides with the 0463 Baseline restore; re-entangles two products).
- Builds on pushed `95854acf` (removePhoto IDOR + patch-guardrail fixes). Pull `main` first.

## Bow-in

### Parallel session awareness

- **SESSION_0463** — Baseline restore — dir `apps/baseline` (new) — own DB.
- **SESSION_0464 (THIS)** — Mammoth auth + staging — dir `clients/mammoth-build-crm` — DB `mammoth_dev`
  → Neon staging — worktree `../ronin-0464` (branch `session-0464-mammoth`).
- **SESSION_0465** — Platform security + `apps/*` CI/deploy.

### Branch and worktree

- Branch `session-0464-mammoth`, worktree `../ronin-0464`.

### Bow-out cleanup

- Fold worktree/branch self-clean into the close once merged to `main`.

## Petey plan

### Tasks

**TASK_01 — Mammoth Better Auth.** Add Mammoth's own Better Auth instance + auth tables to
`clients/mammoth-build-crm/prisma/schema.prisma` (hand-author the migration per the repo's String→enum
discipline), mirroring `apps/web/lib/auth.ts` (per-product identity, ADR 0038 D5).

**TASK_02 — gate the actions.** Add a session + owner gate to every server action in
`clients/mammoth-build-crm/lib/actions.ts` and scope `listProjects`/mutations to the caller's `TeamMember`.
Closes the spawned SHIP-gate task `task_9393f59c`. Optionally add the `stage='complete' ⇒ orderConfirmed`
DB CHECK.

**TASK_03 — staging deploy config.** Add a `clients/mammoth-build-crm/vercel.json` + env wiring for the
Neon staging DB so the dir is a deployable Vercel project. Actual provisioning is operator-gated.

### Pull ledger

- MB-001 (auth/S2), MB-007 (staging deploy), MB-014 (prod multi-domain + server-action hardening).

### Gates

- `cd clients/mammoth-build-crm && bun run typecheck`; mammoth Prisma regenerate after schema changes.

### Operator-gated handoff

- Provision Mammoth's Neon (staging) + the Vercel project; attach a `*.vercel.app`/temporary subdomain.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0464_TASK_01 | done (`2de398f4`) | Mammoth Better Auth instance + auth tables + hand-authored migration |
| SESSION_0464_TASK_02 | done (`09ae6297`) | gate every action (session + owner scope) — closes task_9393f59c |
| SESSION_0464_TASK_03 | done (`71bd57e2`) | staging vercel.json + Neon env wiring |

## What was built

**TASK_01 — Mammoth Better Auth (`2de398f4`).** Mammoth owns its OWN auth tables in
`mammoth_dev` (no shared identity across products, ADR 0038 D5):
`User`/`Session`/`Account`/`Verification` + a `MammothRole` enum (`owner`/`member`),
matching the Dirstarter/apps-web Better Auth model shapes minus BBL's lineage satellites.
`lib/auth.ts` is Mammoth's own Better Auth instance — **email+password** + the `admin()`
role plugin (NO magic-link/social: Mammoth has no Resend/OAuth infra; conservative call,
add later if needed). `app/api/auth/[...all]/route.ts` mounts the API surface like apps/web.
`TeamMember` gained an optional `userId` link (auth `User` → CRM owner). `better-auth@^1.6.16`
added to the standalone bun project. **Migration hand-authored** (`20260628130000_mammoth_better_auth`),
NOT auto-diffed — purely additive (new tables + `TeamMember.userId` NULL default); validated
byte-equivalent to Prisma's own offline `migrate diff`.

**TASK_02 — owner gate on every action (`09ae6297`).** Every export in `lib/actions.ts` now
runs through `requireOwner()`: no session → `UnauthorizedError`; the caller's `User` resolves
to its `TeamMember` (auto-provisioned, or adopts a same-email imported owner row, on first
action). `listProjects` is owner-scoped (caller's projects + claimable unowned legacy rows);
every mutation (`patch`/`setStage`/`advance`/`addPhoto`/`removePhoto`/`remove`/`reconcileBoard`)
pre-checks ownership and refuses another owner's row (`ForbiddenError`) — **closes the IDOR
surface (`task_9393f59c`)**. An unowned legacy row is claimed to the caller on first mutation.
The optional `stage='complete' ⇒ orderConfirmed` DB CHECK was **deliberately not added** — Prisma
7 can't model CHECK constraints, so a raw one reads as perpetual schema drift on every
migrate/reset, and `advanceProject` already enforces the rule server-side.

**TASK_03 — staging deploy config (`71bd57e2`).** `clients/mammoth-build-crm/vercel.json` makes
the dir a deployable per-product project (standalone-bun install/build, no `cd ../..`; an
`ignoreCommand` scoping deploys to this dir per the ADR-0034 deploy-unit pattern).
`prisma.config.ts` grew the Neon pooled/direct split (mirrors apps/web — Migrate runs on
`DIRECT_URL`, runtime keeps pooled `DATABASE_URL`) + the seed hook. `.env.example` documents
the full staging env contract (`DATABASE_URL` pooled, `DIRECT_URL`, `BETTER_AUTH_SECRET`,
`BETTER_AUTH_URL`) with no committed secrets. **Config only — nothing provisioned.**

## Evidence

| Check | Result |
| --- | --- |
| `bunx prisma generate` (after schema + config changes) | ✅ Prisma Client 7.8.0 generated |
| Hand-authored auth migration vs Prisma's offline `migrate diff` | ✅ byte-equivalent superset (same tables/cols/indexes/FKs/constraint names) |
| `bun run typecheck` (final, post-all-tasks) | ✅ clean (tsc --noEmit, exit 0) |
| `bun run build` (`next build` — catches use-server + Prisma-in-browser + runtime config) | ✅ green; `/api/auth/[...all]` route compiles + 5 routes built |
| `next build` caught a real bug | ✅ `BetterAuthError: Invalid admin roles: owner` — fixed by registering owner/member via `createAccessControl` |
| All `lib/actions.ts` exports are async fns (`"use server"` rule) | ✅ 9 exports, all async; gate helpers are non-exported locals |

## Operator-gated handoffs (NOT done — require operator action)

1. **Provision Mammoth's Neon staging DB** — create the Neon project/branch (`mammoth_staging`),
   run `prisma migrate deploy` against it (DIRECT_URL). The schema + migrations are ready.
2. **Create the Mammoth Vercel project** — point Root Directory at `clients/mammoth-build-crm`;
   `vercel.json` supplies install/build/ignore. Set env vars: `DATABASE_URL` (pooled),
   `DIRECT_URL`, `BETTER_AUTH_SECRET` (generate fresh), `BETTER_AUTH_URL` (the staging origin).
3. **Attach a `*.vercel.app` / temporary subdomain** for the demoable staging URL (pre the
   `mammothbuild.com` handoff from Michael Flores).
4. **Push / PR / merge to `main`** — three commits on `session-0464-mammoth` await the operator's
   "go" (explicit-push-authorization). No push performed this session.
5. **(Optional) Provision an initial `owner` login** — once the DB is up, create the first
   Better Auth user (email+password) and set its `role = 'owner'` so the pipeline is reachable.

## Decisions made (autonomous, documented)

- **Auth strategy = email+password + `admin()` role plugin**, no magic-link/social (no email/OAuth
  infra in Mammoth). The cleanest correct per-product identity for an internal CRM.
- **`MammothRole` enum = `owner`/`member`**, registered via `createAccessControl` so `admin()`'s
  `adminRoles` validates (the `next build` fix).
- **`TeamMember.userId` (optional, unique)** is the auth↔CRM bridge; ownership scoping keys off
  `Project.ownerId`. Unowned legacy/seed rows are readable + claim-on-first-mutation, so the demo
  seed survives the gate while IDOR (cross-owner access) is fully closed.
- **No raw `stage='complete'` CHECK constraint** (optional item declined — schema-drift cost vs.
  redundant server-side rule).
- **Known minor edge:** two concurrent first-actions from a brand-new login could race the
  `TeamMember` create (the `@unique` on `userId`/`email` throws the loser, surfaced as a handled
  error). Acceptable for an internal-tool MVP; revisit with an upsert if it ever bites.

## Next session

(TBD at close)
