---
title: "SESSION 0370 — BBL pre-flip runway orchestration"
slug: session-0370
type: session--open
status: in-progress
created: 2026-06-12
updated: 2026-06-12
last_agent: codex-session-0370
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0368.md
  - docs/sprints/SESSION_0369.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0370 — BBL pre-flip runway orchestration

## Date

2026-06-12

## Operator

Brian + codex-session-0370

## Goal

Bow in under the BBL source-of-truth set, act as Petey to grill and lock the SESSION_0370
scope, review and follow up on remote PR #68, then advance the D9 pre-flip runway without
expanding beyond the launch-critical gates: PR review fixes, Stripe test-mode rehearsal,
BBL metadata/robots/sitemap hygiene, minimal 301 mapping, production render verification,
and operator-ready DNS/Tony Hua invite steps.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out,
per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest local session read: `docs/sprints/SESSION_0368.md`.
- Remote PR #68 already carries `docs/sprints/SESSION_0369.md`; this session is numbered
  `SESSION_0370` to avoid colliding with the PR ledger.
- Carryover: SESSION_0368 closed BBL lineage-first feature gating and ratified SOT-ADR D9.
  The remaining pre-flip order is Stripe rehearsal, OG/meta + robots/sitemap hygiene,
  minimal 301 map, prod render verify, then Bluehost DNS flip.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `ba9e7c8`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Payments/Stripe, content/SEO, deployment/hosting, i18n/form UX in PR #68 |
| Extension or replacement | Extension: BBL-specific launch gates layered on the existing Dirstarter/Vercel/Resend/Stripe stack |
| Why justified | SOT-ADR D9 moves the DNS flip to ASAP after the named pre-flip runway gates land |
| Risk if bypassed | BBL could flip with an unproven money path, stale SEO surfaces, broken legacy URLs, or invalid sender/domain assumptions |

Live docs checked during planning: local runbooks and infrastructure specs; live Dirstarter docs still
needed if implementation touches a Dirstarter-owned layer beyond the existing repo patterns.

### Graphify check

- Graph status: current enough for navigation; stats at bow-in: 11707 nodes, 18086 edges,
  1673 communities, 1878 files tracked.
- Queries used:
  - `BBL DNS flip deployment vercel domain setup Stripe checkout rehearsal PR 68 old WordPress 301 sitemap robots OG image Tony Hua invite claim profile`
  - `Tony Hua welcome blackbeltlegacy invite email claim profile resend better auth lineage claim`
- Files selected from graph:
  - `docs/runbooks/deploy/vercel-domain-setup-runbook.md`
  - `docs/runbooks/deploy/deployment.md`
  - `docs/architecture/infrastructure/README.md`
  - `docs/architecture/infrastructure/dns-verification-spec.md`
  - `docs/architecture/infrastructure/domain-hosting-registry.md`
  - `docs/architecture/infrastructure/email-delivery-spec.md`
  - `docs/architecture/infrastructure/hosting-data-flow.md`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

Pending Petey grill in chat. Initial unresolved forks:

- Whether SESSION_0370 should merge PR #68 first or keep PR #68 review/fixes separate from the
  D9 pre-flip runway tasks.
- Whether Stripe rehearsal is still the first implementation task after PR review, or whether PR
  #68 follow-up is the blocking lane because it already owns `SESSION_0369`.
- Whether DNS flip operator steps are informational-only this session or expected to proceed in
  parallel once prod render proof is green.
- Whether the Tony Hua live invite test should use the existing magic-link/claim flow only, or
  needs a new manual invitation artifact before the first live run.

## Petey plan

### Goal

Pending grill lock. Provisional target: close PR #68 review feedback, preserve the D9 launch order,
and leave Brian with safe operator steps for DNS and Tony Hua invite testing.

### Tasks

#### SESSION_0370_TASK_01 — Review PR #68 and address valid feedback

- **Agent:** Cody + Doug
- **What:** Inspect PR #68 against BBL D9 scope, verify CodeRabbit/Codex comments, fix only
  valid issues, run focused checks, and merge or prepare it for merge depending on grill outcome.
- **Done means:** actionable review feedback is resolved or explicitly rejected with evidence;
  checks pass; PR state is documented.
- **Depends on:** Petey grill lock

#### SESSION_0370_TASK_02 — Pre-flip runway execution

- **Agent:** Cody + Doug
- **What:** Execute the next launch-gating item(s) selected by the grill: Stripe test-mode
  rehearsal first unless PR #68 must land before continuing, followed by metadata/robots/sitemap
  and minimal redirect work if time and scope allow.
- **Done means:** selected runway gate has concrete local/remote proof and session evidence.
- **Depends on:** SESSION_0370_TASK_01 if PR #68 lands first

#### SESSION_0370_TASK_03 — DNS/Tony Hua operator packet

- **Agent:** Petey + Doug
- **What:** Produce exact operator steps for Bluehost DNS flip and first live invite/claim test
  using the deployment/domain/email infrastructure docs.
- **Done means:** Brian has a concise checklist safe to run in parallel or immediately after
  prod render verification.
- **Depends on:** Petey grill lock

### Parallelism

PR #68 code review and DNS/operator packet work can run in parallel because they touch disjoint
artifacts. Stripe rehearsal and prod render verification are sequential release gates.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0370_TASK_01 | Cody + Doug | Code fixes plus review-proof against PR comments and launch scope |
| SESSION_0370_TASK_02 | Cody + Doug | Stripe/SEO/deploy work needs execution plus release-readiness proof |
| SESSION_0370_TASK_03 | Petey + Doug | Operator checklist and risk review, not feature code |

### Open decisions

- Pending grill lock in chat before implementation begins.

### Risks

- PR #68 contains `SESSION_0369.md`; merge sequencing must avoid session-ledger conflicts.
- Stripe rehearsal may depend on local env/Stripe CLI secrets that are not safely printable in chat.
- DNS flip is operator-run at Bluehost; Codex can verify records but cannot safely click through
  private registrar UI without explicit browser/session instruction.
- `blackbeltlegacy.com` sending is documented as verified in the cutover checklist, but
  `email-delivery-spec.md` still says BBL is unverified; treat the cutover checklist/current
  dashboard truth as newer.

### Scope guard

- Do not touch schema or Phase 3 identity re-root in this session.
- Do not re-light gated BBL features from D9.
- Do not enable Resend receiving for `blackbeltlegacy.com`; inbound mail stays on existing cPanel
  mailbox unless explicitly changed.
- Do not force-push, reset, or rewrite PR history.

### Dirstarter implementation template

- **Docs read first:** BBL SoT set, `CUTOVER_CHECKLIST.md`, deploy/domain/email infrastructure docs.
- **Baseline pattern to extend:** existing brand-aware Vercel deployment, Resend sender resolution,
  Stripe checkout/webhook runbooks, and D9 brand feature gates.
- **Custom delta:** BBL pre-flip launch proof and lineage-first invite/claim test choreography.
- **No-bypass proof:** work extends existing shared infra and brand resolution; no alternate DNS,
  email, auth, or payment path is introduced.

## Cody pre-flight

Pending after Petey grill lock and before any production code edit.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0370_TASK_01 | landed | PR #68 reviewed (claude, this chat; full review posted on the PR). Verdict: direction ✅ — register→/lineage/join right (+regression test), landing polish token-driven with reduced-motion respected, step-grouped intake a real UX upgrade (browser-proven locally on bbl.local; the container font issue doesn't reproduce). MERGED 2cb1554 (main merged into branch eb0baf6: codex 0369 doc re-homed as SESSION_0371, landing = main structure + codex hero graft, register->/lineage/join kept; chromium flake rerun green). Remaining for codex cleanup: a11y radiogroup + D9 copy. Original pre-merge items: (1) rebase — conflicts are DOCS-ONLY (its SESSION_0369 doc collides with the real 0369 stripe rehearsal on main; renumber to 0371, drop the SESSION_0244 edit); (2) capture the proof note at rebase; (3) a11y — path cards need radiogroup semantics (`radio-group` primitive exists); (4) D9 copy conflict — "paid directory listing checkout"/"Draft listing created" promise the GATED listings system on BBL; soften copy, Premium→lineage-membership wiring is its own slice. |
| SESSION_0370_TASK_02 | partial | Stripe test-mode rehearsal (the first runway gate named here) completed in SESSION_0369 — GREEN on stripe@22, BBL brand (see that session). Remaining: OG/meta + robots/sitemap hygiene → minimal 301 map → prod render verify. |
| SESSION_0370_TASK_03 | pending | Produce DNS/Tony Hua operator packet. |

## What landed

Filled at bow-out.

## Decisions resolved

Filled at bow-out.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0370.md` | Bow-in ledger and provisional Petey plan |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` | 11707 nodes, 18086 edges, 1673 communities, 1878 files tracked |
| `git branch --show-current` | `main` |
| `git status --short` | clean at bow-in |
| `git remote -v` | `origin` = `Ronin-Dojo-Design/ronin-dojo-baseline` |
| `gh pr view 68 --json ...` | PR open, mergeable, checks green, review feedback present |

## Open decisions / blockers

Pending Petey grill.

## Next session

### Goal

Filled at bow-out.

### First task

Filled at bow-out.

## Review log

Filled at bow-out.

## Hostile close review

Filled at bow-out.

## ADR / ubiquitous-language check

Filled at bow-out.

## Reflections

Filled at bow-out if useful.

## Full close evidence

Filled at bow-out.
