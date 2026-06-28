---
session: 464
status: open
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
| SESSION_0464_TASK_01 | open | Mammoth Better Auth instance + auth tables + migration |
| SESSION_0464_TASK_02 | open | gate every action (session + owner scope) — closes task_9393f59c |
| SESSION_0464_TASK_03 | open | staging vercel.json + Neon env wiring |

## Next session

(TBD at close)
