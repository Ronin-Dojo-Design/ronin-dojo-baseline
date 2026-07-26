---
title: "SESSION 0370 — BBL pre-flip runway orchestration"
slug: session-0370
type: session--implement
status: closed
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

#### SESSION_0370_TASK_04 — BBL email live-test ops

- **Agent:** Cody + Doug
- **What:** Bring the legacy BBL email catalog/composer/list concept into the current
  Dirstarter/Resend admin surface without enabling inbound receiving for the root domain.
- **Done means:** `/admin/email` has a BBL template catalog, live-test invite composer, and
  recent Join Legacy capture list; BBL sender/domain docs describe the sending/receiving boundary.
- **Depends on:** SESSION_0370_TASK_03 email/DNS boundary check

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
| SESSION_0370_TASK_03 | landed | DNS/Tony Hua operator packet delivered before implementation edits. Key boundary: Bluehost remains DNS authority; change only apex A + `www` CNAME for Vercel when flipping; keep existing BBL outbound Resend records; do **not** enable Resend inbound MX on root for this live test because `welcome@blackbeltlegacy.com` receiving stays on the existing cPanel/mailbox path. Tony test flow: send from `welcome@blackbeltlegacy.com`, Reply-To same mailbox, CTA to `/lineage/join`, confirm Lead + optional `LineageClaimRequest`; no public ownership until admin approval. |
| SESSION_0370_TASK_04 | landed | BBL email live-test ops integrated on current app stack: `/admin/email` now has a BBL template catalog, preview/test-send composer, and recent Join Legacy captures. Added React Email live-test invite, server catalog/action/query helpers, and catalog tests. Docs now state BBL sending is verified while receiving remains external unless a future inbound slice deliberately changes MX. |

## What landed

- Closed the two PR #68 cleanup items on main:
  - Free/Premium/Elite Join Legacy path cards now render as an accessible `RadioGroup` with
    real `RadioGroupItem` controls.
  - D9 copy no longer promises gated Dirstarter listings checkout or "Draft listing created";
    Premium/Elite paths now point users back to lineage membership support/checkout.
- Tightened Join Legacy evidence/profile URL validation to `http:`/`https:` on both client and
  server schemas.
- Changed successful Join Legacy lead submission routing to stay on `/lineage/join?submitted=true`
  and anchor Premium/Elite users to `#lineage-membership` instead of `/submit/[slug]`.
- Added a submitted-state card and lineage-membership anchor on `/lineage/join`.
- Added BBL email live-test admin tooling:
  - BBL React Email live-test invite template.
  - BBL email template catalog + server-side payload factory.
  - Admin safe action for catalog test sends using existing Resend sender resolution.
  - Recent BBL Join Legacy capture query/list for operator follow-up.
- Updated email SOP/spec docs to record the current BBL boundary: Resend sending verified;
  inbound receiving remains outside the app/root-domain Resend receiving is not enabled.
- Updated custom component inventory and wiki index for this session's new admin email surface.

## Decisions resolved

- D9 launch copy decision: Join Legacy may collect BBL lead/claim context and send users to
  lineage membership checkout, but must not imply that the gated Dirstarter listings flow is live
  on BBL.
- Email receiving decision: BBL outbound sending uses Resend and `welcome@blackbeltlegacy.com`,
  while inbound replies continue through the existing mailbox provider/cPanel route. Resend inbound
  MX on the root domain is out of scope until intentionally planned.
- Admin email integration decision: the legacy monorepo catalog/composer/list concept was ported
  into the current Dirstarter admin primitives and safe-action/Resend stack instead of copying the
  old JSX files verbatim.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/lineage/join/join-legacy-form.tsx` | Path-card radio semantics, D9-safe copy, http/https URL validation |
| `apps/web/app/(web)/lineage/join/page.tsx` | Submitted-state card, lineage membership anchor, copy corrected away from draft listings |
| `apps/web/server/web/lead/public-actions.ts` | Join Legacy post-submit routing stays on lineage join/membership; URL validation aligned |
| `apps/web/emails/bbl-join-legacy-confirmation.tsx` | Premium/Elite copy and CTA updated to lineage membership |
| `apps/web/emails/admin-bbl-join-legacy.tsx` | Admin notification copy/preview URL aligned to lineage membership |
| `apps/web/emails/bbl-live-test-invite.tsx` | New BBL live-test invite React Email template |
| `apps/web/app/admin/email/page.tsx` | Admin email page now mounts BBL catalog and capture-list surfaces |
| `apps/web/app/admin/email/_components/bbl-email-catalog-panel.tsx` | New BBL template preview/test-send composer |
| `apps/web/app/admin/email/_components/bbl-email-capture-list.tsx` | New recent Join Legacy capture list |
| `apps/web/server/admin/email/catalog.tsx` | New BBL email template catalog/payload factory |
| `apps/web/server/admin/email/actions.ts` | New admin safe action for BBL catalog test sends |
| `apps/web/server/admin/email/queries.ts` | New recent BBL Join Legacy capture query helpers |
| `apps/web/server/admin/email/catalog.test.tsx` | New catalog regression tests for BBL sender/copy boundary |
| `docs/architecture/infrastructure/email-delivery-spec.md` | BBL sending verified / inbound external boundary refreshed |
| `docs/runbooks/sops/sop-email-runbook.md` | `/admin/email` BBL live-test runbook flow added |
| `docs/knowledge/wiki/custom-component-inventory.md` | BBL admin email ops components documented |
| `docs/knowledge/wiki/index.md` | SESSION_0370 row and component inventory note updated |
| `docs/sprints/SESSION_0370.md` | Bow-out ledger and evidence |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` | 11707 nodes, 18086 edges, 1673 communities, 1878 files tracked |
| `git branch --show-current` | `main` |
| `git status --short` | clean at bow-in |
| `git remote -v` | `origin` = `Ronin-Dojo-Design/ronin-dojo-baseline` |
| `gh pr view 68 --json ...` | PR open, mergeable, checks green, review feedback present |
| `bun run --filter @ronin-dojo/web format` | passed |
| `bun run --filter @ronin-dojo/web format:check` | passed |
| `bun run --filter @ronin-dojo/web lint:check` | passed; existing warnings remain outside this change |
| `bun run --filter @ronin-dojo/web typecheck` | passed |
| `bun test 'apps/web/server/admin/email/catalog.test.tsx' 'apps/web/app/(web)/(home)/bbl/bbl-landing-content.test.ts'` | passed — 3 tests |
| `bun run --filter @ronin-dojo/web test` | passed — 558 tests, 0 failures |
| `bun run --filter @ronin-dojo/web build` | passed; generated 212 static pages and sitemap; existing Turbopack NFT tracing warning from `next.config.ts` → storage monitoring route |
| Playwright terminal smoke: `http://localhost:3000/lineage/join` | passed — path cards expose radio roles; no listing-checkout copy; membership copy present; no console errors |
| Playwright terminal smoke: `http://bbl.local:3000/lineage/join?submitted=true#lineage-membership` | passed — status 200; BBL title; radio roles; submitted banner; no listing-checkout copy; membership copy present; no console errors |
| Playwright terminal smoke: `http://bbl.local:3000/admin/email` | auth boundary proven — unauthenticated browser lands on login, not 404; authenticated admin UI smoke not run because no admin browser session was available |
| `bun run wiki:lint` | passed |

## Open decisions / blockers

- No implementation blocker remains for the PR #68 cleanup/email live-test lane.
- Residual proof gap: authenticated browser smoke of `/admin/email` remains pending because this
  Codex browser did not have an admin session. Build, typecheck, catalog tests, and auth-boundary
  smoke passed.
- D9 runway after this close remains: BBL OG/meta + robots/sitemap hygiene, minimal 301 map,
  prod render verify, then operator DNS flip.

## Next session

### Goal

Continue D9 pre-flip runway after the PR #68 cleanup: BBL OG image/metadata + robots/sitemap
hygiene, then minimal WordPress 301 map.

### First task

Open `docs/sprints/SESSION_0368.md`, `docs/sprints/SESSION_0369.md`,
`docs/sprints/SESSION_0370.md`, `docs/product/black-belt-legacy/SOT-ADR.md`,
`docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md`, and the deploy/domain/email runbooks.
First task: audit generated metadata/sitemap/robots for BBL feature gates and add the BBL OG image.

## Review log

- Doug: Implementation scope stayed inside existing Dirstarter primitives: `RadioGroup`, admin
  cards/forms, safe actions, React Email, and `sendEmail` brand sender resolution. No schema,
  auth, or inbound MX change was introduced.
- Cody: Code-level follow-up items from PR #68 are closed with local proof. The old listings copy
  is now guarded by a test that renders the catalog emails and checks against the forbidden
  checkout/submit language.
- Petey: Operator packet was delivered before implementation, so Brian can run DNS/Tony Hua steps
  independently without waiting on the admin email UI lane.

## Hostile close review

- Verdict: closeable after commit/push/CI. Scope matched D9 and the user's cleanup ask.
- Dirstarter alignment: reused existing L1/admin primitives, safe-action pattern, React Email, and
  Resend sender stack. No alternate payment/email/auth path was created.
- Security/data integrity: evidence/profile URLs now reject non-http(s) schemes; admin email send
  action is admin-gated; root-domain inbound MX was explicitly not changed.
- Risk cap: authenticated `/admin/email` visual smoke is the only local proof gap; mitigated by
  typecheck/build/tests and unauthenticated auth-boundary smoke.

## ADR / ubiquitous-language check

- ADR not needed: this session implemented the already-ratified D9 boundary and refreshed
  infrastructure docs for the current BBL email state.
- Ubiquitous language unchanged: existing terms remain `Lead`, `LineageClaimRequest`,
  `Membership`, and lineage membership checkout.

## Reflections

- The high-risk mistake would have been copying the old monorepo admin JSX directly; porting the
  behavior into the current admin/safe-action/Resend stack kept the surface aligned with main.
- The D9 copy drift was easy to miss because the old `Tool` intake artifact still exists behind
  the scenes. User-facing copy and routing now describe the real BBL product path instead of the
  implementation artifact.
- Resend receiving needs to remain a deliberate future slice. Sending verification does not imply
  root-domain inbound handling should move.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated `SESSION_0370.md`, email delivery spec, email SOP, custom component inventory, and wiki index stamps where touched. |
| Backlinks/index sweep | Added SESSION_0370 row to `docs/knowledge/wiki/index.md`; added `docs/sprints/SESSION_0370.md` to custom component inventory `pairs_with`. |
| Wiki lint | `bun run wiki:lint` passed with no violations. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Present above; no unresolved severity finding beyond authenticated admin UI smoke pending. |
| Review & Recommend | Next session goal and first task written. |
| Memory sweep | Email SOP/spec updated; no operator memory change needed. |
| Next session unblock check | Unblocked: next task can start from current docs/runbooks and generated app surfaces. |
| Git hygiene | `main`; worktree intentionally contains tracked session changes plus pre-existing untracked BBL screenshots left unstaged; single push planned — hash reported at bow-out / see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` completed; `graphify stats` after update: 11735 nodes, 18226 edges, 1706 communities, 1894 files tracked. |
