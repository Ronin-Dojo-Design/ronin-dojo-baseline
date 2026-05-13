---
title: "SESSION 0160 — Vercel/Bluehost Domain Runbook + 0159 Verification"
slug: session-0160
type: session--open
status: in-progress
created: 2026-05-13
updated: 2026-05-13
last_agent: claude-session-0160
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0159.md
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/architecture/decisions/0006-multi-domain-hosting.md
  - docs/architecture/decisions/0015-domain-hosting-infrastructure.md
  - docs/runbooks/resend-setup-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0160 — Vercel/Bluehost Domain Runbook + 0159 Verification

## Date

2026-05-13

## Operator

Brian Scott + Claude

## Goal

Capture the SESSION_0159 Vercel+Bluehost+Resend domain setup process as a reusable runbook (so the next three brand domains don't reinvent it), then verify SESSION_0159's deferred outcomes: post-lockfile Vercel build succeeds, Let's Encrypt cert issues, Resend dashboard flips to Verified, and refresh the stale `dns-verification-spec.md`.

## Graphify Check

- Graph status: usable. `graphify stats` after SESSION_0159 graphify update: 5,757 nodes, 10,778 edges, 663 communities.
- Queries used at session open:
  - `graphify query "resend stripe setup runbook DNS verification" --budget 2000`
  - `graphify query "mermaid flowchart ASCII diagram sequence flow visual" --budget 2000`
- Pattern sources for runbook style: `docs/runbooks/resend-setup-runbook.md`, `docs/runbooks/stripe-setup-runbook.md`, `docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/PWCC-mermaid-code.md`.

## Petey Plan

### Tasks

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0160_TASK_01 | Author `docs/runbooks/vercel-domain-setup-runbook.md` capturing SESSION_0159's Vercel+Bluehost+Resend domain setup (mermaid flowchart + ASCII record table + step-by-step + pitfalls table). Add wiki index row + index `last_agent` bump. | ✅ done |
| SESSION_0160_TASK_02 | Verify post-`cd6c12c` Vercel production build. Outcome: still failing with "node_modules missing, did you mean to install?" — Part A (lockfile commit) was not sufficient because Vercel used pnpm 6.35.1 which cannot read a pnpm 9.x lockfile. Part B applied: added `vercel.json` with `corepack enable && pnpm install --frozen-lockfile` to force pnpm 9.0.0 per `packageManager` field. | in progress (awaits next deploy) |
| SESSION_0160_TASK_03 | Refresh Resend dashboard verification check (DKIM, MX Sending, SPF Sending should be Verified). | queued |
| SESSION_0160_TASK_04 | Refresh stale `docs/architecture/infrastructure/dns-verification-spec.md` to match current Resend dashboard pattern (per SESSION_0159_FINDING_01). | queued |
| SESSION_0160_TASK_05 | JETTY sweep: add bidirectional backlinks on `resend-setup-runbook.md`, ADR 0015, `dns-verification-spec.md`, `graphify-repo-memory.md` for the new runbook + this session. | ✅ done |

## Files Touched

| Path | Note |
| --- | --- |
| `docs/runbooks/vercel-domain-setup-runbook.md` | NEW. Captures the SESSION_0159 Vercel+Bluehost+Resend domain setup as a reusable runbook (mermaid flowchart + ASCII record table + step-by-step + Bluehost UI gotchas + Production Build Readiness + troubleshooting table + Brand Rollout). |
| `docs/sprints/SESSION_0160.md` | This session record. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0160 row, vercel-domain-setup-runbook row; bumped `last_agent`; fixed one pre-existing G8/R8 blockquote-list warning. |
| `docs/runbooks/resend-setup-runbook.md` | JETTY sweep: added `vercel-domain-setup-runbook.md` to `pairs_with`; added SESSION_0159 + SESSION_0160 to `backlinks`; bumped `updated` + `last_agent`. |
| `docs/architecture/decisions/0015-domain-hosting-infrastructure.md` | JETTY sweep: added `vercel-domain-setup-runbook.md` to `pairs_with`; added SESSION_0159 + SESSION_0160 to `backlinks`; bumped `updated` + `last_agent`. |
| `docs/architecture/infrastructure/dns-verification-spec.md` | JETTY sweep: added `vercel-domain-setup-runbook.md` + `resend-setup-runbook.md` to `pairs_with`; added SESSION_0159 + SESSION_0160 to `backlinks`; bumped `updated` + `last_agent`. |
| `docs/runbooks/graphify-repo-memory.md` | JETTY sweep: added SESSION_0159 + SESSION_0160 + `vercel-domain-setup-runbook.md` to `backlinks`; bumped `last_agent`. |
| `vercel.json` | NEW (root). Part B build fix: forces `corepack enable && pnpm install --frozen-lockfile` so Vercel uses pnpm 9.0.0 per `package.json` `packageManager` field instead of the pre-installed pnpm 6.35.1 that cannot read a pnpm 9.x lockfile. |

## What Landed

- **TASK_01 done — Vercel Domain Setup Runbook.** Pattern-matched on `resend-setup-runbook.md` (ASCII record table + step-by-step + troubleshooting table) with an inline `mermaid flowchart TD` for the end-to-end flow. Encodes the SESSION_0159 lessons: dashboard A value over CLI hardcoded value, CNAME-sibling rule shadowing DKIM TXT, Resend dashboard supersedes stale spec, project-vs-team domain attachment distinction, `pnpm-lock.yaml` gate.
- **TASK_05 done — JETTY bidirectional backlink sweep.** Four related docs now correctly reference the new runbook in `pairs_with`, and the runbook is reciprocated in their frontmatter. SESSION_0159 + SESSION_0160 added as `backlinks` on `resend-setup-runbook.md`, ADR 0015, `dns-verification-spec.md`, and `graphify-repo-memory.md`. ADR 0006 (`0006-multi-domain-hosting.md`) deliberately skipped — it has no JETTY frontmatter at all (pre-existing gap; out of session scope to fully retrofit).
- **TASK_02 partial — Part B build fix applied.** Discovery: post-`cd6c12c` Vercel build still emitted `Local package.json exists, but node_modules missing, did you mean to install?` because the pre-installed pnpm 6.35.1 on Vercel cannot read pnpm 9.x lockfile format. Part A (commit lockfile) was necessary but not sufficient. Added `vercel.json` at repo root with `installCommand: "corepack enable && pnpm install --frozen-lockfile"` + `buildCommand: "pnpm -r build"`. Corepack will install the `pnpm@9.0.0` declared in `package.json`'s `packageManager` field. Next push triggers a fresh build that should succeed.

## Decisions Resolved

- **Vercel build install strategy:** use `vercel.json` with explicit `corepack enable && pnpm install --frozen-lockfile`, not a project-settings UI override. Reason: keeps the build config in git, reviewable, applies on every branch including previews.
- **ADR 0006 frontmatter retrofit deferred.** Bringing it to full JETTY 3.0 compliance is meaningful work (full title/slug/type/created/updated/last_agent/pairs_with/backlinks) and outside this session's scope. Tracked implicitly via the gap; will be fixed when an ADR-touching session opens.

## Open Decisions / Blockers

- **Vercel build verification pending push of `vercel.json`** — only the next deploy will prove Part B is sufficient. If it still fails, fallback options remain: (a) explicitly pin Node version in `engines` via `.nvmrc`, (b) override Vercel project settings UI to remove auto-detection, (c) inspect build log for whether Corepack itself failed (rare but possible).
- **Resend dashboard reverify still pending Brian's click** on the Domains page.

## Next Session

Will be staged at bow-out of this session. Likely shape: confirm Part B build succeeded, capture full close evidence for 0160, then continue with TASK_03 + TASK_04.
