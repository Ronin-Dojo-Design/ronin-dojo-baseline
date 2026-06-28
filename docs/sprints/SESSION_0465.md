---
session: 465
status: open
---

# SESSION 0465 — Platform: security hardening + `apps/*` CI/deploy

## Date

2026-06-28 (pre-staged for the 0463/0464/0465 parallel sprint)

## Operator

Brian

## Goal

Close the security-class ledger debt that gates going multi-domain/public, and generalize the `apps/*`
CI + deploy wiring so `apps/baseline` (SESSION_0463) gets a CI gate and its own deploy unit.

## Status

open

## Locked decisions (sprint planning, 2026-06-28)

- Security headers / CSP live per-app in `apps/web` (next.config / middleware), NOT root `vercel.json`,
  so each new product replicates the pattern.
- This lane OWNS the `apps/*` CI/deploy generalization (the 0463↔0465 coordination point).

## Bow-in

### Parallel session awareness

- **SESSION_0463** — Baseline restore — dir `apps/baseline` (new) — own DB. (Consumes this lane's CI/deploy.)
- **SESSION_0464** — Mammoth auth + staging — dir `clients/mammoth-build-crm`.
- **SESSION_0465 (THIS)** — Platform security + `apps/*` CI/deploy — dir `apps/web` + `.github/` +
  `vercel.json` — no DB — worktree `../ronin-0465` (branch `session-0465-platform`).

### Branch and worktree

- Branch `session-0465-platform`, worktree `../ronin-0465`.

### Bow-out cleanup

- Fold worktree/branch self-clean into the close once merged to `main`.

## Petey plan

### Tasks

**TASK_01 — RISK #2 (P0): global security headers / CSP.** Add the headers/CSP gate in `apps/web`
(next.config.mjs `headers()` or middleware). Verify the deployed headers with `curl -I`. Use
`/security-review`.

**TASK_02 — `apps/*` CI/deploy generalization.** Extend `ci.yml`/`playwright.yml` + `vercel.json`
`ignoreCommand` from `apps/web`-only to `apps/*` (so `apps/baseline` is covered), and add `scripts/**`
to BBL's `paths-ignore` (the SESSION_0462 queued follow-up — verified safe: `apps/web` doesn't import
root `scripts/`).

**TASK_03 — RISK cluster + cred rotation.** Triage a coherent 3–5 of RISK #3–8 (admin-route reliance,
optional prod secrets, rate-limiter fail-open, private-media boundary, PII/payment log leakage). RISK #13
(Neon prod cred exposed in transcripts — rotation overdue): PREP + document an ops handoff (operator
rotates).

### Pull ledger

- RISK #2 (P0), RISK #3–8 (security cluster), RISK #13 (cred rotation → ops handoff).

### Gates

- `apps/web` typecheck / oxlint / oxfmt / `bun run test`; all three workflow YAMLs must parse.

### Operator-gated handoff

- Rotate the Neon prod credential (RISK #13) in the Neon + Vercel dashboards.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0465_TASK_01 | open | RISK #2 — global security headers / CSP in apps/web |
| SESSION_0465_TASK_02 | open | apps/* CI/deploy generalization + scripts/** paths-ignore |
| SESSION_0465_TASK_03 | open | RISK #3–8 cluster triage + RISK #13 rotation handoff |

## Next session

(TBD at close)
