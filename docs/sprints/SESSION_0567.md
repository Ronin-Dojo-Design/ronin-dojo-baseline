---
title: "SESSION 0567 — Parallel recovery wave + merged-trunk quality suite"
slug: session-0567
type: session--open
status: closed
created: 2026-07-17
updated: 2026-07-17
last_agent: codex-session-0567
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0565.md
  - docs/sprints/SESSION_0545.md
  - docs/sprints/SESSION_0550.md
  - docs/sprints/SESSION_0559.md
  - docs/sprints/SESSION_0561.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0567 — Parallel recovery wave + merged-trunk quality suite

## Date

2026-07-17

## Operator

Brian + codex-session-0567

## Goal

Execute SESSION_0565's three next-session prompts through Codex-native Petey orchestration: mirror the
required Claude quality loops into discoverable Codex skills, run the merged-trunk quality suite, salvage
the SESSION_0545 billing lane, and bring the held 0550/0559/0561 lanes to evidence-backed Giddy push gates.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest closed session read: `docs/sprints/SESSION_0565.md`.
- Carryover: PRs #213–#216 landed; SESSION_0565 staged three explicit prompts for quality, billing salvage,
  and held-lane pickup. Operator directed Codex to execute them with worktrees, Petey fan-out, and Giddy gates.
- Numbering collision: `/Users/brianscott/dev/ronin-0566` already owns in-progress
  `session-0566-bbl-dashboard-build`; this independent orchestration lane uses SESSION_0567.

### Branch and worktree

- Branch: `main` (orchestration checkout; lane work stays in existing worktrees)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean after the authorized SESSION_0565 close push
- Current HEAD at bow-in: `36bbeef1`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Payments, monetization, hosting/deployment |
| Extension or replacement | Extension: preserve Dirstarter Stripe/webhook and Vercel/Next deployment patterns while reviewing Ronin billing and CSP deltas |
| Why justified | Billing and security hardening extend production-critical L1 seams already adapted by ADR 0030 and RISK #2 |
| Risk if bypassed | Payment/access drift, Stripe account misrouting, or a CSP enforcement outage |

Live docs checked during planning (2026-07-17):
`https://dirstarter.com/docs/integrations/payments`,
`https://dirstarter.com/docs/monetization`,
`https://dirstarter.com/docs/database/hosting`, and
`https://dirstarter.com/docs/deployment`.

### Graphify check

- Graph status: current; stats at bow-in: 17,583 nodes, 34,322 edges, 2,298 communities, 2,696 files tracked.
- Queries used:
  - `SESSION 0545 billing tab monetization Stripe`
  - `CSP security headers RISK 2 observation window`
  - `preview artifacts skill G-009 creator payout`
  - `quality suite fallow hostile close SESSION 0541 ledger`
- Files selected from graph:
  - `apps/web/server/web/billing/stripe-webhook.ts`
  - `apps/web/config/security-headers.ts`
  - `apps/web/config/security-headers.test.ts`
  - `docs/security/ronin-security-risk-register.md`
  - `docs/protocols/hostile-close-review.md`
- Verification note: exact files and lane SESSION docs are opened after Graphify; Graphify is navigation, not proof.

### Grill outcome

- Operator locked three independent tracks and requested worktree fan-out.
- Operator added a prerequisite: copy Claude's `fallow-fix-loop`, `code-quality`, and `pr-fix-loop` into
  Codex-native `.agents/skills/` before running them.
- Giddy posture: local commits allowed after gates; every new push, PR update, merge, CSP enforce flip, and
  deploy remains separately operator-gated.

## Petey plan

### Goal

Bring all three recovery tracks to auditable G3 push gates without merging, deploying, or flipping CSP.

### Tasks

#### SESSION_0567_TASK_01 — Codex quality-skill parity + merged-trunk quality suite

- **Agent:** Cody build/review agents → Doug/Giddy verify
- **What:** Mirror three Claude quality-loop skills into `.agents/skills`, then run fallow, code-quality,
  hostile-close, optional PR-fix, and the SESSION_0541 ledger-closure check against the PR #213–#216 wave.
- **Steps:** author and validate Codex skill copies; capture fallow baseline; score each scoped file; apply only
  behavior-preserving Class-A/hard-cap fixes; hostile-review `f8ac96cd..HEAD`; verify WL-P3-46/D-045/G-010.
- **Done means:** discoverable Codex skills, before/after metrics, per-file scores, hostile review, routed findings,
  and any bounded fixes committed locally at G3.
- **Depends on:** nothing.

#### SESSION_0567_TASK_02 — Salvage SESSION_0545 billing-tab lane

- **Agent:** Cody in `/Users/brianscott/dev/ronin-0545` → Doug verify
- **What:** Preserve the 16-file WIP, assess against SESSION_0545, rebase onto current main, complete missing
  billing behavior, and run payment-lifecycle gates.
- **Steps:** inspect diff; commit WIP; rebase with semantic conflict resolution; complete only recorded scope;
  run typecheck/lint/format/test plus focused billing proof; stop before push/PR.
- **Done means:** clean rebased branch, complete scope, green gates, Doug score, local commits at G3.
- **Depends on:** nothing.

#### SESSION_0567_TASK_03 — Held-lane pickup: 0550 CSP, 0559 payout plan, 0561 preview artifacts

- **Agent:** three isolated Doug/Cody lane agents; Giddy aggregates
- **What:** Rebase and verify each held lane in its existing worktree; keep CSP enforcement behind the separate
  observation-window decision; bootstrap 0559/0561 before gates.
- **Steps:** preserve/commit 0550 session doc; rebase each lane; run lane-appropriate gates; score and report
  branch SHA/blockers; stop before push/PR/merge.
- **Done means:** lane table with gate score, local head, blockers, and G3 disposition for all three lanes.
- **Depends on:** nothing.

### Parallelism

TASK_01, TASK_02, and TASK_03 use disjoint branches/file sets and run concurrently. TASK_03 sublanes are
separate worktrees and may run concurrently within the four-agent cap by queueing one lane after an early
readiness check. No agent edits canonical `main` outside TASK_01 governance/quality scope.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0567_TASK_01 | Cody + Doug + Giddy | Tooling authoring plus objective quality/hostile review |
| SESSION_0567_TASK_02 | Cody + Doug | Partial payment feature needs completion then lifecycle proof |
| SESSION_0567_TASK_03 | three lane agents + Giddy | Existing disjoint worktrees; release-readiness fan-out |

### Open decisions

- CSP production observation is now retrievable through Vercel CLI 54 historical queries; the sink and
  current Report-Only header are proven. Enforcement remains held until the scoped Plausible nonce fix,
  local enforcing rehearsal, and preview/canary proof are green.
- Every branch push, PR creation/update, merge, and deploy needs a new exact operator authorization.

### Risks

- SESSION_0545 is 21 commits behind and overlaps `stripe-webhook.ts`; conflict resolution must preserve both sides.
- 0559/0561 lack `apps/web/node_modules`; bootstrap failures are environment failures, not code findings.
- Full test suites are expensive and email-adjacent; use canonical `bun run test`, never bare multi-file `bun test`.
- SESSION_0566 is a live parallel lane; do not touch its worktree, branch, or session file.

### Scope guard

- No merge, deploy, force-push, production env mutation, Stripe live action, or CSP enforcement flip.
- No unrelated ledger paydown or inherited fallow cleanup.
- No edits in `ronin-dojo-monorepo` or the Dirstarter template.

### Dirstarter implementation template

- **Docs read first:** live Payments, Monetization, Postgres Hosting, and Deployment docs on 2026-07-17.
- **Baseline pattern to extend:** Dirstarter Stripe Checkout/webhook lifecycle and Next/Vercel deployment model.
- **Custom delta:** per-product/per-brand Stripe routing, entitlement ledger, member billing UI, CSP nonce/report sink.
- **No-bypass proof:** tasks review and complete existing adapters; no alternate payment or deployment stack is added.

## Cody pre-flight

### Pre-flight: Codex quality-skill mirrors

- Pre-flight waived by Petey for production-code checklists: files are concise mirrors of already-approved
  repository skills/protocols; no UI, schema, backend, or runtime behavior is introduced.
- Existing source read: `.claude/skills/fallow-fix-loop/SKILL.md`, `.claude/skills/code-quality/SKILL.md`,
  `.claude/skills/pr-fix-loop/SKILL.md`.
- Prior failures acknowledged: FS-0024, FS-0027, FS-0028; mirrors keep cwd, final-state gate, and test-runner guards.

### Pre-flight: billing-tab salvage

- Existing component/action scan and exact model/primitive checks are delegated to the 0545 Cody before edits.
- L1 reference: current Dirstarter payments/monetization docs plus ADR 0030 per-brand Stripe adapter.
- Runbooks required: Stripe setup/payment lifecycle docs named by SESSION_0545; FS-0018 and MB-013 acknowledged.
- Dev/gates: `/Users/brianscott/dev/ronin-0545/apps/web`; `npx next dev --turbo`; `bun run test`.

### Pre-flight: held lanes

- 0550: LR 0014 + RISK #2 are binding; observation evidence precedes enforce authorization.
- 0559: docs-only plan; production Cody pre-flight waived.
- 0561: skill-only change; validate structure/triggers and run declared deterministic checks after bootstrap.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0567_TASK_01 | completed | Codex skills at `e62fa312`; merged-wave quality fixes/metrics committed G3 at `f4d69d98` |
| SESSION_0567_TASK_02 | completed | 0545 preserved/rebased/completed at `903541db`; scoped gates green; quality-first integration hold recorded |
| SESSION_0567_TASK_03 | completed | 0550/0559/0561 stacked on quality; all local gates complete; CSP canary remains operator-held |

## What landed

- Codex-native `fallow-fix-loop`, `code-quality`, and `pr-fix-loop` skills at parent commit
  `e62fa312` (local main; unpushed).
- Merged-wave quality commit `f4d69d98`: corrected billing lifecycle CTAs, made lineage fixture
  cleanup concurrency/FK-safe, split the cleanup hard cap into explicit phases, restored WL-P3-46,
  and added focused regression coverage. Findings routed to `WL-P2-65` and `TFF-012`.
- SESSION_0545 billing salvage preserved the original WIP (`c5e409f2`), rebased it (`4bb28a8f`),
  and completed the member Portal/return-path/authz work at `903541db`.
- SESSION_0550 final stack `e9ee059f`: nonce/jitless/source-matrix/reporting/fail-closed fixes; 257/257
  build, 9/9 enforcing routes, 0 CSP blocks. Automatic browser report delivery remains unproven until
  authorized Preview deployment; production stays Report-Only.
- SESSION_0559 final stack `62c433ac`: corrected/verified G-009 creator-payout plan, 25/25 cited paths.
- SESSION_0561 final stack `8e5f1f50`: corrected preview-artifacts evidence; exclusive suite 1,536/0.

## Giddy lane table

| Lane | Local head | Evidence | Disposition |
| --- | --- | --- | --- |
| Quality | `f4d69d98` | all eight targets ≥9.5; lineage fixture 2/2; exclusive canonical 1,546/0 | G3 clean; merge first |
| Billing 0545 | `0e4d06ed` | quality-first stack; focused billing 46/46; webhook 10/10; isolated timeout owners all green | GO-with-note local; remote promotion HOLD |
| CSP 0550 | `e9ee059f` | 22/0 focused; 257/257 build; 9/9 enforcing routes, 0 blocks; absolute sink code | G3 local; canary FAIL/HOLD pending browser→Vercel proof |
| G-009 0559 | `62c433ac` | wiki 0 errors; 25/25 cited paths; clean stack | G3 PASS; plan grill before implementation |
| Preview 0561 | `8e5f1f50` | triggers/frontmatter/reference/type/lint/format/wiki green; exclusive 1,536/0 | G3 PASS; artifact acceptance downstream |

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |
| `.agents/skills/fallow-fix-loop/SKILL.md` | Codex-native fallow cleanup/re-measure loop |
| `.agents/skills/code-quality/SKILL.md` | Codex-native code-quality matrix executor |
| `.agents/skills/pr-fix-loop/SKILL.md` | Codex-native isolated PR review/fix loop |
| `docs/sprints/SESSION_0567.md` | Parent orchestration/session evidence ledger |
| `docs/knowledge/wiki/index.md` | Added current-session and recent-session index rows; updated JETTY metadata |

## Verification

| Command / smoke | Result |
| --- | --- |
| Skill frontmatter YAML validation (Ruby UTF-8) | 3/3 names + trigger descriptions valid |
| `wc -l .agents/skills/*/SKILL.md` | 82 / 76 / 59 lines; all under 100-line skill-authoring limit |
| `git diff --check -- .agents/skills docs/sprints/SESSION_0567.md` | PASS |
| `bun run wiki:lint` | PASS — 0 errors / 54 inherited warnings |
| `vercel logs --environment production --no-branch --since 7d --query "csp-report" --limit 1000 --json` | PASS — query works; zero captured entries is not a clean-stream claim |
| Production header probe (`https://blackbeltlegacy.com/`) | PASS — 200; nonce CSP Report-Only present; enforcing CSP absent |
| Synthetic POST `/api/csp-report` + Vercel log query | PASS — handler/log path proven; not browser-delivery proof |
| Production Chromium sweep (`/`, `/directory`, `/lineage`) | RED pre-fix — Plausible nonce, Zod eval, Google avatars; later hostile sweep found YouTube thumbnails, favicon redirects, tool screenshots |
| 0550 initial post-fix `CSP_ENFORCE=1` production Chromium | PASS only for shallow 5-route set; hostile matrix superseded it |
| Quality focused lineage fixture integration | PASS — 2/0, 28 assertions; no FK cleanup error |
| Quality exclusive `bun run test` | PASS — 1,546/0, 4,409 assertions, 208 files |
| Quality fallow remeasure | 692 → 689 clone groups; duplicated lines 22,239 → 22,175; fixture CRAP 40.4 → 26.5 |
| 0561 exclusive `bun run test` | PASS — 1,536/0, 4,370 assertions, 205 files |
| 0550 expanded enforcing Chromium | PASS — directory/detail, lineage, techniques, five tool slugs, auth; 9/9, 0 CSP blocks |
| 0550 automatic browser report probe | HOLD — Chrome queued report without POST/204; deployed Preview proof required |

## Open decisions / blockers

- No production env mutation, deployment, push, PR, merge, or CSP flip occurred.
- CSP code gates are green; canary remains blocked only on actual browser-generated report delivery to
  deployed Preview/Vercel logs. Production remains Report-Only.
- Quality-first stack complete. Remote promotion requires explicit authorization + authoritative CI.

## Next session

### Goal

Run authorized CSP Preview canary, verify browser reports in Vercel, then decide production enforcement.

### First task

Read lane SHAs and authorize only exact push/PR/merge/deploy/env actions desired.

## Review log

- TASK_01: quality mirrors + quality suite closed at `f4d69d98`; no medium+ hostile findings.
- TASK_02: billing rebase preserved quality CTA corrections + trusted-user reconciliation; isolated
  timeout owners passed.
- TASK_03: held lanes stacked on quality. CSP hostile review forced source-matrix and collector fixes;
  local enforcement green, deployed Preview report delivery open.

## Hostile close review

- Doug/Giddy: quality 9.2; billing 9.2; CSP 9.1; 0559/0561 9.4.
- CSP Giddy: G3 local pass, canary FAIL/HOLD until browser→Vercel report proof. No P0; no production
  mutation. Dirstarter baseline preserved; no architecture bypass.

## ADR / ubiquitous-language check

- No new ADR required. “CSP canary” = limited enforcing deployment before global `CSP_ENFORCE=1`.

## Reflections

- Parallel DB suites contaminated evidence; exclusive scheduling fixed this. Browser CSP events can queue
  without POST, so synthetic sink tests cannot substitute for deployed Preview proof.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0567 frontmatter updated; no new wiki page |
| Backlinks/index sweep | index updated for 0552/0554/0555/0564/0565/0567; no new cross-file wiki backlinks |
| Wiki lint | 0 errors / 54 inherited warnings |
| Kaizen reflection | present above |
| Hostile close review | lane findings + CSP FAIL/HOLD recorded above |
| Review & Recommend | next session goal written |
| Memory sweep | session/risk docs updated; no global memory change |
| Next session unblock check | blocked only on explicit Preview/canary authorization |
| Git hygiene | main close commit + one authorized push pending |
| Graphify update | nodes=17,606; edges=34,353; communities=2,375 |
