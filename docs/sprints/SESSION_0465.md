---
session: 465
status: closed
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
| SESSION_0465_TASK_01 | done | RISK #2 (P0) — global security headers + Report-Only CSP in `apps/web` (`config/security-headers.ts` → `next.config.ts headers()`); verified live via `curl -I`; 9 unit tests. Commit `fbe28f98`. |
| SESSION_0465_TASK_02 | done | `apps/*` CI/deploy generalization: `clients-ci.yml` → Products CI (discovers `clients/*` + `apps/*`-except-web); `apps/baseline/**` + `scripts/**` added to BBL paths-ignore; `vercel.json` ignoreCommand adds `packages` (kept `apps/web`-scoped per ADR 0034). Commit `f616489e`. |
| SESSION_0465_TASK_03 | done | RISK #5 FIXED (rate-limiter fail-closed, commit `f2811e82`); #2 mitigated (TASK_01); #3 triaged confirmed-managed; #4/#6/#7 triaged + deferred (documented in register); #13 Neon rotation = ops handoff prepared (NOT executed — operator-gated). |

## Evidence

| Claim | Evidence |
| --- | --- |
| Security headers live on every route | `curl -I http://localhost:3399/` `/directory` `/api`(404) — all show X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, COOP, X-DNS-Prefetch-Control + `Content-Security-Policy-Report-Only`. CSP is Report-Only (not enforcing). HSTS absent in dev (prod-only — correct). |
| CSP allowlist correct | Report-Only value (dev): `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.r2.dev https://*.r2.cloudflarestorage.com https://www.google.com; font-src 'self' data:; connect-src 'self' ws: wss:; frame-src https://checkout.stripe.com https://billing.stripe.com; form-action 'self' …; frame-ancestors 'none'; base-uri 'self'; object-src 'none'`. |
| Gates green | `apps/web` typecheck ✓ (next typegen + tsc); oxlint ✓ (touched); oxfmt ✓ (touched); `security-headers.test.ts` 9/9 ✓; `rate-limiter.test.ts` 3/3 ✓; consumer suites (capture-email + lead) 15/15 ✓. |
| Workflow YAMLs + vercel.json valid | `yaml.safe_load` OK on ci.yml / playwright.yml / clients-ci.yml; `json.load` OK on vercel.json; discover-glob simulation finds `clients/mammoth-build-crm`, excludes `apps/web`. |
| `scripts/**` paths-ignore safe | Verified `apps/web` does NOT import root `scripts/` (grep empty) — a scripts-only change can't break the build/e2e. |
| RISK #5 fix non-breaking | Rate-limiter consumers mock the seam → unaffected (capture-email + lead suites green). No-Redis path unchanged (dev/CI fail-open preserved). |

## Decisions made (autonomous, conservative)

- **vercel.json NOT broadened to `apps/*`** (despite the literal task wording). Per ADR 0034
  per-product deploy units, broadening BBL's `ignoreCommand` to all `apps/` would make BBL rebuild
  on an `apps/baseline`-only change (deploy-coupling regression). BBL stays scoped to `apps/web` +
  the shared `packages` kernel it transpiles (a real latent gap — closed); `apps/baseline` gets its
  OWN Vercel project + `vercel.json` (SESSION_0463 stands it up). Documented inline in `vercel.json`.
- **CI generalization via the existing `clients-ci.yml` discovery** (renamed Products CI) rather than
  speculative `apps/baseline` workflow files (the dir doesn't exist yet). `apps/baseline` auto-onboards
  to the typecheck+lint gate the moment it lands — no future edit needed. `apps/web` keeps its own rich
  gate (ci.yml + playwright.yml).
- **CSP Report-Only, not enforced** — the app relies on inline `next-themes`/brand `<style>`/Next
  bootstrap; enforcing with `'unsafe-inline'` would be weak, and nonce migration is a middleware
  change out of this session's safe scope. Report-Only is the register's prescribed first step.
- **RISK #4/#6/#7 documented + deferred** (feature-gated secrets, private-media signed-URL route,
  `safeLog` + console-ban) — each is a larger cross-cutting/architectural change; triaged with the
  recommended fix in the register, no half-implementation.

## Operator-gated handoffs (NOT executed this session)

1. **RISK #13 — rotate the prod Neon DB credential (OVERDUE).** Step-by-step runbook prepared in
   `docs/security/ronin-security-risk-register.md` §13: Neon dashboard password reset → update
   gitignored `apps/web/.env.prod` → update Vercel Production `DATABASE_URL`/`DIRECT_URL` → redeploy
   → verify via `PG*` env vars (never the URL on the command line). Blast radius bounded to local
   transcripts (not committed — SESSION_0452 sweep). Operator executes.
2. **Promote CSP to enforced (RISK #2 follow-up).** After observing the prod Report-Only violation
   stream + migrating inline script/style to a nonce, set `CSP_ENFORCE=1` in prod env. (Code is
   ready; the flip is operator-gated.)
3. **Push / PR / deploy.** Branch `session-0465-platform` has 4 commits; no push performed
   (explicit-push-authorization). Operator gives the word.

## Next session

(TBD at close)
