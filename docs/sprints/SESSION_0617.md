---
title: "SESSION 0617 — RISK #2: flip CSP_ENFORCE to enforcing"
slug: session-0617
type: session--implement
status: in-progress
created: 2026-07-22
updated: 2026-07-22
last_agent: claude-session-0617
sprint: S12
lane: repo
recipe: ""
goal_ids: []
tickets: ["RISK #2"]
pairs_with:
  - docs/sprints/SESSION_0614.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0617 — RISK #2: flip CSP_ENFORCE to enforcing

> **Pre-staged stub (ADR 0049), staged 2026-07-22 by SESSION_0614 bow-out.** Adopt at bow-in: flip
> `staged` → `in-progress`, run the FS-0035 canonical-occupancy check, then execute the task below.

## Operator

Brian + <agent>-session-0617

## Goal

Close **RISK #2** (top open P0). Per the `risk2-csp-status-and-nonce-flip` memory the CSP headers +
Report-Only mode + report-sink + script-nonce are already shipped — **only the `CSP_ENFORCE` flip (and a
report-review pass) remains.** Do NOT re-build the headers.

## Next session

**First task:** review the CSP violation-report sink for outstanding report volume / legit-surface
violations. If clean, flip `CSP_ENFORCE` to enforcing and verify no real surface breaks. This is an
**app-code deploy** — run `cd apps/web && bun run build` + the affected e2e before the push gate; hold
for the operator's go.

Inputs to read: the `risk2-csp-status-and-nonce-flip` memory + the CSP header/report-sink source it names.

## Bow-in

- **Canonical-occupancy (FS-0035):** free — clean tree, no `.canonical-session` claim; claimed for 0617.
  Note: `canonical-claim.sh check` has a `set -euo pipefail` bug — on a clean tree the internal `grep`
  (no matches, exit 1) aborts before the "free" line prints, exiting 1 instead of 0. Worked around by
  writing the claim file directly. → candidate FS/D at bow-out.
- **Parallel-lane assessment (1d):** single focused lane (one env-flag deploy). No 2+ disjoint candidates
  — no fan-out. Proceed as a single inline lane.
- **State verified against register/memory:** code matches `risk2-csp-status-and-nonce-flip` + register #2.
  `security-headers.ts` emits Report-Only; `cspHeaderName()` flips on `CSP_ENFORCE=1|true`; report sink
  (`app/api/csp-report/route.ts`) is **log-only to Vercel logs** (`console.warn "[csp-report]"`, no
  persistence). The flip = a **Vercel prod env var + redeploy**, not a code change → operator-gated deploy.

## Task log

**SESSION_0617_TASK_01 — RISK #2 CSP enforce flip (observe → go/no-go → operator-gated flip).**
- Done-means: prod Report-Only `[csp-report]` stream reviewed for legit-surface violations; if clean, the
  operator sets `CSP_ENFORCE=1` in Vercel prod + redeploys (or authorizes the CLI flip), then post-flip
  smoke confirms no real surface breaks. Held at the deploy gate for the operator's explicit go.
- **Pivot (operator):** before touching the flip, assess the security-header/CSP posture across ALL RDD
  apps. Findings + priced options captured in
  [`research-review-security-headers-posture.md`](../architecture/research/research-review-security-headers-posture.md).

**SESSION_0617_TASK_02 — Research-review: RDD security-header/CSP posture (DONE).**
- Read-only cross-brand assessment. Key finding: only `apps/web` (BBL) wires any security headers; the
  design's "replicate per app" (ADR 0034) was never carried to `apps/baseline` / `apps/rdd` / `mammoth`
  (all ship nothing). CSP report sink is log-only → can't prove a clean window. Published as an artifact.
- **Operator decisions (2026-07-22):** ① Fork 1 → **1B** (make report sink durable first). ② Fork 2 →
  **2B** (lift the header baseline into the kernel `packages/ui-kit`). ③ Sequence: durable sink → observe
  → flip BBL → kernel-lift. ④ Keep as research-review (not wayfinder).

**SESSION_0617_TASK_03 — Durable CSP report sink (build; operator-approved "store CSP warning"). BUILT + VERIFIED.**
- Persist CSP violations (was log-only) to a **dedup-rollup** `CspViolationReport` model (upsert on
  `sha256(violatedDirective|blockedUri|documentUri)`, insert-or-increment `count`), rate-limited via a new
  fail-closed `csp_report` bucket. All prior protections kept (64KB cap, throttle, always-204, never-throw,
  query-scrub). Additive migration `20260722000000_add_csp_violation_report`. Review: `bun scripts/csp-violations.ts`.
- **Doug verify:** launch-safe (8.7/10). Confirmed CI runs `migrate deploy` before `bun test` (`ci.yml`), so the
  new real-DB persist test passes in CI. One mechanical blocker (oxfmt format-red on 2 test files) FIXED.
  Gates green: typecheck ✓ · oxlint ✓ · format:check ✓ · 16 tests pass.
- **Residual (P3, not a blocker):** table has no TTL/retention — operator should `TRUNCATE` it after the
  `CSP_ENFORCE` flip. Path-varying can mint distinct rows but bounded by the 60/min/IP limit (tiny rows).
- **HELD at push gate** — app-code → deploys on push; awaiting operator "go".

**SESSION_0617_TASK_04 — Queue G-030 (DONE).** Filed the branded doc-rendering system (frontmatter →
branded artifact for SOPs/rituals/workflows/data-wiring) to the goals ledger as G-030.

## Status

Single source of truth is the frontmatter `status:` field.
