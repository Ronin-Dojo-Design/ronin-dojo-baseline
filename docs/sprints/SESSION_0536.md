---
title: "SESSION 0536 — RISK #2 CSP enforcement follow-up: report sink + nonce migration (Report-Only)"
slug: session-0536
type: session--implement
status: closed
created: 2026-07-13
updated: 2026-07-14
last_agent: claude-session-0536
sprint: S12
pairs_with:
  - docs/sprints/SESSION_0534.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0536 — RISK #2 CSP enforcement follow-up: report sink + nonce migration (Report-Only)

## Date

2026-07-13

## Operator

Brian + claude-session-0536

## Goal

Advance RISK #2 (global security headers / CSP, P0) toward an _enforceable_ CSP. The baseline — hardening
headers ENFORCED + CSP shipped Report-Only — already landed at SESSION_0465 and is live on prod. This session
takes the register's own follow-up, in two Report-Only (zero-blast-radius) stages: (1) add a CSP violation
**report sink** so prod violations are finally observable, and (2) **nonce migration** to drop `'unsafe-inline'`
from `script-src`/`style-src`. Both ship under Report-Only. The `CSP_ENFORCE=1` flip is explicitly HELD for a
later operator-gated session after a clean prod report stream.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0534.md`
- Carryover: 0534 drained the AdminCollection ecosystem (behavior-preserving). Its "Next session" block offered
  FI-028 (community freemium — being taken by a sibling in `../ronin-0535`) or the top board card
  (**RISK #2 P0** / G-002 P1). Operator pinned **RISK #2**. On reading the register row, RISK #2's baseline is
  already MITIGATED (0465) — this session is scoped to the _enforcement follow-up_, not net-new headers.

### Branch and worktree

- Branch: `session-0536-csp`
- Worktree: `/Users/brianscott/dev/ronin-0536`
- Status at bow-in: clean (fresh worktree off origin/main)
- Current HEAD at bow-in: `1b41fe80`

### Dirstarter alignment

| Field                       | Answer                                                                                                                                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dirstarter baseline touched | Hosting/theming edges (next.config `headers()`, middleware `proxy.ts`, root `layout.tsx` inline theme/brand style) — but the security-header layer is a Ronin custom (`config/security-headers.ts`), not a Dirstarter primitive. |
| Extension or replacement    | Extension: extends the existing `config/security-headers.ts` builder (nonce param + report directives) and `proxy.ts` middleware (nonce generation) — no new subsystem.                                                          |
| Why justified               | The CSP must move to per-request nonce emission; a nonce is inherently per-request so it belongs in middleware, while static hardening headers stay in `next.config.ts`.                                                         |
| Risk if bypassed            | Enforcing a CSP with `'unsafe-inline'` in `script-src` gives ~no XSS protection; without a report sink the flip is blind.                                                                                                        |

Live docs checked during planning: not applicable (security-header layer is Ronin custom, not a Dirstarter L1).

### Grill outcome

Petey reframe + operator scope-grill resolved before build:

- **Fork 1 — is this net-new headers?** No. RISK #2 baseline shipped 0465, verified live on origin/main
  (`config/security-headers.ts` wired at `next.config.ts:83`, 9 unit tests). Lane reframed to the follow-up.
- **Fork 2 — session scope (report sink only / nonce only / both / flip)?** Operator chose **sink + nonce, both
  Report-Only; HOLD the flip**. Rationale: only the `CSP_ENFORCE=1` flip carries blast radius; stages 1–2 ship
  under Report-Only and cannot break the app, so they are the maximal _safe_ advance.
- **Fork 3 — report sink storage (log-only vs DB model)?** Recommend **log-only** (structured console →
  Vercel logs) for a temporary observation window; a `CspViolation` Prisma model is over-engineering. Endpoint
  caps body size + samples/rate-limits to blunt log-flooding.
- **Fork 4 — `'strict-dynamic'` in the first nonce cut?** Recommend **no** — ship `script-src 'self'
'nonce-…'`, observe the Report-Only stream, revisit strict-dynamic in the flip session.
- **Fork 5 — CSP emission site.** Move ONLY the CSP to `proxy.ts` (per-request nonce); keep static hardening
  headers in `next.config.ts`. `proxy.ts` matcher covers all document routes (excludes only `_next/*`,
  favicon/robots/sitemap, `api/auth/`) — none need a document CSP, so no coverage narrowing that matters.

### Drift logged

None discovered at bow-in.

## Petey plan

### Goal

Ship the CSP report sink + nonce migration under Report-Only; browser-verify zero unexpected violations across
key surfaces; leave `CSP_ENFORCE` unset (Report-Only) pending a future operator-gated flip.

### Tasks

#### SESSION_0536_TASK_01 — CSP violation report sink (Report-Only observability)

- **Agent:** Cody
- **What:** Add a report collection endpoint + wire `report-to`/`report-uri` + `Reporting-Endpoints` so prod
  Report-Only violations are actually captured.
- **Steps:**
  1. `app/api/csp-report/route.ts` — POST handler accepting `application/reports+json` (Reporting API) and
     legacy `application/csp-report`; cap body size; log a compact structured line
     (`blockedURI`, `violatedDirective`, `documentURI`, `disposition`); return 204. Sample/guard against flood.
  2. Extend `buildContentSecurityPolicy` to append `report-uri /api/csp-report` and a `report-to csp` group.
  3. Emit a `Reporting-Endpoints: csp="/api/csp-report"` header from the security-header builder.
  4. Unit tests: directive presence + endpoint accepts both content-types + returns 204.
- **Done means:** POST to `/api/csp-report` returns 204 and logs; CSP string carries `report-uri` + `report-to`;
  `Reporting-Endpoints` header present; tests green.
- **Depends on:** nothing

#### SESSION_0536_TASK_02 — Nonce migration (drop `'unsafe-inline'` from `script-src` only, Report-Only)

- **Agent:** Cody
- **What:** Thread a per-request nonce through `proxy.ts` into the inline **script** surfaces + Next bootstrap;
  drop `'unsafe-inline'` from `script-src`. **Keep `style-src 'unsafe-inline'`** (justified below). Ships
  Report-Only.
- **Style-src decision (locked):** `style-src` keeps `'unsafe-inline'`. A CSP nonce covers `<style>` _elements_
  but NOT inline `style={{…}}` _attributes_, which are pervasive (46 files) and generated at runtime by
  `motion/react` (20 files). Dropping it would flood violations and break animations for a low-impact residual
  (CSS injection ≪ script injection). This refines the register follow-up (which aspired to drop both) with the
  React/motion reality. Consequence: the brand `<style>` (`layout.tsx:93`) and org `<style>`
  (`organizations/[slug]/layout.tsx:23`) need **no** nonce change — `'unsafe-inline'` already covers them.
- **Steps:**
  1. `proxy.ts` — generate a per-request nonce (`crypto`), forward via request header `x-nonce`
     (`NextResponse.next({ request: { headers } })`), and set the (Report-Only) CSP **response** header with the
     nonce. Preserve existing redirect/auth-guard branches exactly.
  2. `buildContentSecurityPolicy(env, nonce?)` — when a nonce is passed, `script-src` becomes
     `'self' 'nonce-…'` (no `'unsafe-inline'`); `style-src` stays `'self' 'unsafe-inline'`; keep dev
     `'unsafe-eval'`. Remove the CSP from the `next.config.ts` path so it is emitted only once (from middleware).
  3. `next.config.ts` `headers()` — keep hardening headers only (no CSP).
  4. Nonce the inline **script** surfaces: `<ThemeProvider nonce={nonce}>` (`app/layout.tsx`), and the JSON-LD
     `<script>` in `components/web/structured-data.tsx` (defensive — read nonce via `headers()`; JSON-LD is a
     non-executable data block but nonce it to be cross-browser safe). Next bootstrap auto-nonces via middleware.
  5. Unit tests: nonce'd policy omits `script-src 'unsafe-inline'` and includes the nonce; `style-src` retains
     `'unsafe-inline'`; no-nonce path unchanged.
- **Done means:** Report-Only CSP carries `script-src 'self' 'nonce-…'` (no `'unsafe-inline'`); `style-src`
  unchanged; the script surfaces + Next bootstrap carry the matching nonce; **zero unexpected
  CSP-Report-Only violations** in the browser console across landing / directory / lineage / technique-reel
  (YouTube) / Stripe checkout / /app admin.
- **Depends on:** SESSION_0536_TASK_01 (shared `buildContentSecurityPolicy` edits — sequential, same file)

### Parallelism

Sequential — both tasks edit `config/security-headers.ts`. One coherent Cody build (TASK_01 then TASK_02),
not a fan-out. Verification fans out (Doug + Giddy + Desi) after the build.

### Agent assignments

| Task                 | Agent               | Rationale                                                                                                            |
| -------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| SESSION_0536_TASK_01 | Cody                | Small, additive endpoint + directive wiring.                                                                         |
| SESSION_0536_TASK_02 | Cody                | Middleware + layout nonce threading; same-file dependency on TASK_01.                                                |
| Verify               | Doug + Giddy + Desi | Doug: browser violation audit + gates; Giddy: middleware/arch shape; Desi: no visual regression from nonce'd styles. |

### Open decisions

- **HELD for operator:** the `CSP_ENFORCE=1` flip (stage 3) — NOT this session. Requires a clean prod
  Report-Only stream first, then explicit operator go (blast-radius rule).

### Risks

- **Next auto-nonce under Report-Only.** Next applies the nonce to its own bootstrap scripts by reading the CSP
  header; it is documented against the enforcing `Content-Security-Policy` header. If Next does NOT auto-nonce
  when only `Content-Security-Policy-Report-Only` is set, the Report-Only stream would show false Next-bootstrap
  violations. **Verify empirically during build**; if confirmed, document it and decide (accept known-false
  Next-bootstrap reports under Report-Only, or adjust). This is the #1 verification gate.
- Middleware runs on every request — a broken `proxy.ts` breaks the app. The nonce addition is small but the
  auth-guard/redirect branches must be preserved exactly.

### Scope guard

- Do NOT flip `CSP_ENFORCE=1` (no enforcing CSP on prod this session).
- Do NOT touch middleware/next.config/security-header surfaces beyond the nonce+sink (sibling FI-028 in
  `../ronin-0535` was told to coordinate with this session on those files).
- Do NOT add a DB model for violations (log-only).
- Do NOT add `'strict-dynamic'` in the first cut.
- FI-001 stays PARKED.

### Dirstarter implementation template

- **Docs read first:** not applicable (Ronin custom security layer).
- **Baseline pattern to extend:** `config/security-headers.ts` builder + `proxy.ts` middleware.
- **Custom delta:** per-request nonce + CSP report sink.
- **No-bypass proof:** extends the existing 0465 security-header builder; no Dirstarter capability replaced.

## Cody pre-flight

- **Reuse check:** extended the existing 0465 `config/security-headers.ts` builder + the live
  `proxy.ts` middleware; no new subsystem. New file only: `app/api/csp-report/route.ts` (no existing
  report sink).
- **No new component:** the report route is a plain Next route handler; no UI primitive added.

## What landed

- **TASK_01 — CSP report sink** (`app/api/csp-report/route.ts`): public log-only POST sink (both the
  Reporting-API `application/reports+json` and legacy `application/csp-report` shapes), 64KB body cap +
  per-instance throttle, always-204, query-strings scrubbed from logs. Wired `report-uri`/`report-to` +
  `Reporting-Endpoints`.
- **TASK_02 — script-src nonce migration:** per-request nonce minted in `proxy.ts` (`renderWithCspNonce`
  helper), threaded via `x-nonce` + the forwarded CSP request header (Next auto-nonces its bootstrap;
  works under the Report-Only header name). `script-src` drops `'unsafe-inline'` for `'nonce-…'`;
  `style-src` keeps `'unsafe-inline'` (motion/inline-style reality); CSP emission moved from
  `next.config.ts` (hardening-only now) to middleware. `<ThemeProvider nonce>` set.
- **In-flight fixes:** JSON-LD `<script>` un-nonced (hydration-mismatch caught in the browser audit);
  middleware hot-path `try/catch` fallback; `cspEnforce` restored to module-private + nonce block
  extracted (fallow).
- CSP ships **Report-Only** — `CSP_ENFORCE` unset. The flip is a future operator-gated session.

## Review log

### SESSION_0536 — RISK #2 CSP enforcement follow-up (report sink + nonce, Report-Only)

**SESSION_0536_REVIEW_01 — verifier wave + hostile close**

- **Reviewed tasks:** SESSION_0536_TASK_01, SESSION_0536_TASK_02.
- **Dirstarter docs check:** not applicable — the security-header layer is a Ronin custom
  (`config/security-headers.ts`), not a Dirstarter baseline; the auth-guard middleware branches are
  byte-unchanged from origin/main. No Dirstarter-owned layer touched.
- **Sources:** register row #2 (`docs/security/ronin-security-risk-register.md` §2), next@16
  `app-render.parseRequestHeaders` (nonce fallback), live `:3006` runtime probes.
- **Verdict:** Doug **GO 9.6/10**, Giddy **PASS**, Desi **PASS**; fallow delta clean (dead-exports
  6.7%→0%, `proxy.ts` off the high-complexity list). All ships Report-Only → zero prod blast radius.
  Two Doug P3s (middleware `try/catch`, log query-scrub) were banked, not deferred.

**SESSION_0536_REVIEW_02 — /code-quality score (code-quality-matrix)**

Three units scored against `code-quality-matrix §2`, evidence from the fallow pass (MI 93.4, 0 dead
exports, no high-complexity in the CSP files) + behavioral verification (browser audit, runtime probes,
smoke e2e, sink POST). Gap-closing fixes applied: `cspEnforce` un-exported + nonce helper extracted (D3/D5,
fallow) and all three primitives inventoried in `custom-component-inventory` (D7 Class-C cap cleared).

| Unit                          | Class |  D1 |  D2 |  D3 |  D4 |  D5 |  D6 |  D7 | Composite | Verdict |
| ----------------------------- | ----- | --: | --: | --: | --: | --: | --: | --: | --------: | ------- |
| `config/security-headers.ts`  | B     |  10 |  10 |   9 |  10 |   9 |  10 |   9 |   **9.5** | Gold    |
| `proxy.ts` nonce middleware   | B     |   9 |  10 |   9 |  10 |   9 |   9 |   9 |   **9.3** | Strong  |
| `app/api/csp-report/route.ts` | C     |  10 |   9 |   9 |  10 |   9 |   9 |   9 |   **9.3** | Strong  |

- **Caps:** none (verification is behavioral → no 9.4 cap; the sink's security proof is present + it exposes
  nothing sensitive → no 8.9 cap; inventoried → no Class-C cap; no regression).
- **Apple/Facebook verdict:** gold-to-strong. The two sub-9.5 units carry only named nits — the middleware
  `try/catch` catch-path is not unit-tested (forcing a `crypto` throw is contrived), and the sink throttle is
  best-effort per-instance (a distributed limiter on a Report-Only observation sink is YAGNI). No
  behavior-preserving fix raises them materially; accepted-with-reason.

## Hostile close review

### Giddy + Doug hostile pass (authored by closing agent, personas applied)

1. **Plan sanity — PASS.** The plan's value was catching that RISK #2 was already MITIGATED (0465) and
   reframing to the real remaining work (sink + nonce) instead of re-shipping headers. The one empirical
   unknown (does Next auto-nonce under the _Report-Only_ header?) was flagged as risk #1 and **proven
   green at the DOM level** (71/71 scripts nonced, matching header nonce) — not assumed. The plan also
   self-corrected "drop `'unsafe-inline'` from script **and** style" → script-only after discovering the
   `motion/react` inline-style reality (46 files). No papered-over assumption.
2. **Dirstarter compliance — ALIGNED (extends).** Extends the 0465 app-agnostic builder; CSP moved to
   middleware because a nonce is per-request. No baseline replaced. Minor: the replication contract is
   now two call sites (next.config hardening + middleware CSP) — inherent to nonce-per-request,
   documented in the `security-headers.ts` header block.
3. **Security — NET IMPROVEMENT, no exposed path.** The change _removes_ an XSS-permissive token
   (`script-src 'unsafe-inline'`) and adds none. The new `/api/csp-report` is unauthenticated **by
   design** (browsers post reports without credentials) and abuse-hardened: 64KB cap, per-instance
   throttle, always-204/never-throws, logs only 4 non-sensitive CSP fields with query strings scrubbed.
   No sensitive data path exposed → **no 8.9 security cap**.
4. **Data integrity — N/A.** No schema/migration/data change.
5. **Lifecycle proof — PASS (scoped honestly).** Serves the register's "observe → enforce" journey: the
   sink is verified capturing both payload shapes; the nonce is verified across landing/directory/
   techniques/technique-detail. The ultimate journey (an _enforced_ CSP blocking XSS) is intentionally
   **not** realized this session — the flip is held.
6. **Verification honesty — STRONG.** 21 unit tests + runtime header probes on 6 surfaces + browser
   console audit (zero violations, incl. a live YouTube iframe) + end-to-end sink POST + smoke e2e 3/3 +
   fallow delta. A real regression (JSON-LD hydration mismatch) was **caught by the browser audit and
   fixed** — proving the verification was behavioral, not rubber-stamp. → **no 9.4 cap**.
7. **Workflow honesty — PASS.** Lane RISK #2; worktree `ronin-0536`; task IDs used; Petey → Cody →
   Giddy+Doug+Desi → fallow → close. Report-Only held per the blast-radius rule.
8. **Merge readiness — READY.** Complete gate green (typecheck/oxlint/oxfmt/21 tests/`next build`/smoke
   e2e 3/3); 3 verifier PASSes; fallow clean; Report-Only.

**Kaizen triage**

1. _Safe & secure? Tests that prove it?_ Provably safe now: Report-Only enforces nothing (pages render,
   zero violations, verified); hardening headers unchanged from 0465 (live ~2 weeks); sink abuse-hardened;
   nonce proven DOM-level. **Not yet behaviorally proven:** that the nonce'd policy holds under _enforcing_
   across all real prod traffic — closed only by observing the prod Report-Only stream (now possible via
   the new sink) for several days, then a canary flip.
2. _Failed steps preventable?_ ~2 minor slips, **both caught pre-merge** by layered verification:
   (a) JSON-LD over-nonced (browser audit caught the hydration mismatch) — prevention: playbook note that
   data-block scripts (`application/ld+json`) don't need nonces (now in the code comment); (b) `cspEnforce`
   needlessly exported (fallow caught it) — prevention: fallow-fix-loop as a standing pre-PR step, which we
   ran. No protocol miss. Simplification for the flip session: a sink dashboard beats grepping Vercel logs.
3. _Confidence at 100 / 1k / 10k?_ **10 / 10 / 9.** The nonce middleware is O(1) crypto per request; the
   layout was already dynamic (no new caching cost). The only 10k-scale caveat is the sink under a
   violation flood — throttled 50/10s/instance and not active under Report-Only. **Aggregate 9 → proceed
   as planned** (≥9 gate).

**Score:** 9.6/10 — no cap triggered (Dirstarter aligned, data-integrity N/A, verification behavioral,
security proof present for the new public path). No debt to carry beyond the named flip-session gate.

**Findings:** none open. All in-flight findings (JSON-LD hydration, middleware guard, log scrub, dead
export, complexity) were fixed and re-verified this session. Follow-up (not a finding, a gate): observe the
prod Report-Only stream before the `CSP_ENFORCE=1` flip; register row #2 wording amended
script-and-style → script-only at bow-out (done).

## Reflections — kaizen

- **The lane was mis-framed at bow-in — and catching that was the highest-value move.** The task read as
  "add a CSP + security headers," but the register's own row #2 said that baseline shipped at 0465 and was
  live on prod. Reading the ledger row _first_ (per the standing discovery rule) turned a re-build into the
  correct, smaller follow-up (sink + nonce). The memory `risk2-csp-status-and-nonce-flip` now push-guards
  against the next re-framing.
- **Report-Only is what made an aggressive change safe to ship autonomously.** Dropping `script-src
'unsafe-inline'` + moving CSP to middleware is high-blast-radius _if enforced_ — but under Report-Only it
  blocks nothing, so the whole session (build + exhaustive verify + PR + merge-ready) could run without
  risking the app. The one genuinely dangerous act (the flip) is cleanly isolated behind one env flag, held
  for a future gated session. Isolating the risk to a single flip is the design win.
- **The exhaustive browser audit paid for itself.** The JSON-LD hydration mismatch was invisible to
  typecheck, unit tests, and `next build` — only rendering every surface and reading the console caught it.
  "If you didn't render it, you didn't verify it" was literally true here.
- **The refinement beat the spec.** The register aspired to drop `'unsafe-inline'` from _both_ script and
  style; the honest engineering call (script-only, because a nonce can't cover inline `style` attributes in
  a `motion/react` app) was more correct than the plan. Recording _why_ in the register + inventory keeps
  the next agent from "finishing" the style-src drop and breaking animations.

## ADR / ubiquitous-language check

- **ADR update NOT required.** Operates under the existing **ADR 0034** (per-app security posture) + the
  0465 posture recorded in register row #2, which explicitly names the nonce migration + `CSP_ENFORCE` flip
  as the documented follow-up. Executing that follow-up is not a new architectural decision. The one
  deviation from the register's letter (keep `style-src 'unsafe-inline'`) is a scope refinement recorded in
  the register row, not a decision reversal → register annotation suffices.
- **Ubiquitous-language update NOT required** — no new domain term. New security primitives recorded in
  `custom-component-inventory` (§"Security headers + CSP nonce").

## Next session

### Goal

Operator's call. Top board candidates: **G-002 per-product DB separation (P1)**, or continue the RISK #2
arc only when ready to **observe the prod Report-Only stream + flip `CSP_ENFORCE=1`** (a dedicated,
operator-gated canary session — NOT before a few days of clean prod reports via the new sink). FI-001 stays
PARKED.

### First task

If the CSP flip: pull the prod `/api/csp-report` log stream, classify violation classes, allowlist/fix any
legit ones, then `CSP_ENFORCE=1` in a canary + re-run the SESSION_0536 browser audit against the enforcing
policy. Otherwise pick the top non-parked board card (`cd apps/web && bun scripts/board-backlog.ts --top=10`).

## Full close evidence

| Step                       | Proof                                                                                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task log                   | 2 tasks (TASK_01 sink, TASK_02 nonce) — both landed, in `## What landed`                                                                                                                                                                       |
| Build                      | `next build` run on the final push state — ✓ compiled, middleware + `/api/csp-report` present (gate runner's "docs-only/skipped" is the clean-tree blind spot; real diff = 6 app+doc commits)                                                  |
| Gates                      | typecheck ✓ · oxlint ✓ · oxfmt ✓ (1923 files) · 21 unit tests ✓ · smoke e2e 3/3 ✓ — **all green on CI (PR #204): typecheck, Oxc, unit tests, Playwright chromium/firefox/webkit, Vercel preview**                                              |
| Runtime verification       | browser console audit: 0 CSP violations across landing (live YouTube iframe) / directory / techniques / technique-detail; 71/72 scripts nonced (JSON-LD un-nonced); report sink end-to-end (both shapes → 204 + logged, query-scrubbed)        |
| Hostile close review       | SESSION_0536_REVIEW_01 — Doug GO 9.6 · Giddy PASS · Desi PASS; 8 Qs + 3 Kaizen (aggregate 9 → proceed); no caps                                                                                                                                |
| Code-quality gate          | SESSION_0536_REVIEW_02 — 3 units 9.3–9.5 (security-headers.ts Gold), no caps; primitives inventoried                                                                                                                                           |
| Fallow delta               | introduced findings **0** (dead-exports 6.7%→0%, middleware off high-complexity list, MI 93.0→93.4)                                                                                                                                            |
| Custom-component inventory | +§"Security headers + CSP nonce" (3 primitives)                                                                                                                                                                                                |
| ADR check                  | not required (ADR 0034 + register row #2 follow-up)                                                                                                                                                                                            |
| Memory sweep               | +`risk2-csp-status-and-nonce-flip` + MEMORY.md line; supersedes the 0465 CSP line                                                                                                                                                              |
| Register annotation        | row #2 + detail updated: sink+nonce done 0536, script-only scope correction, only the flip remains                                                                                                                                             |
| Graphify                   | refreshed by gate runner — nodes=13222 edges=29590 communities=1472                                                                                                                                                                            |
| Wiki lint                  | 0 err / 52 warn (pre-existing)                                                                                                                                                                                                                 |
| PR                         | [#204](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/204) **MERGED to `main` 2026-07-14** (rebase; merge commit `eefe069d`) · ALL CI GREEN · branch deleted. CSP stays **Report-Only** (`CSP_ENFORCE` unset — no prod enforce) |
| Push                       | branch pushed (operator-authorized); CSP stays **Report-Only** (`CSP_ENFORCE` unset) — no prod enforce                                                                                                                                         |
