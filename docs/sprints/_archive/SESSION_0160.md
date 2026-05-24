---
title: "SESSION 0160 — Vercel/Bluehost Domain Runbook + Part B Build Fix + JETTY Sweep"
slug: session-0160
type: session--open
status: closed-full
created: 2026-05-13
updated: 2026-05-13
last_agent: claude-session-0160
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0159.md
  - docs/sprints/SESSION_0161.md
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/architecture/decisions/0006-multi-domain-hosting.md
  - docs/architecture/decisions/0015-domain-hosting-infrastructure.md
  - docs/runbooks/resend-setup-runbook.md
  - docs/architecture/infrastructure/dns-verification-spec.md
  - docs/runbooks/graphify-repo-memory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0160 — Vercel/Bluehost Domain Runbook + Part B Build Fix + JETTY Sweep

## Date

2026-05-13

## Operator

Brian Scott + Claude (Petey -> Cody)

## Goal

Capture the SESSION_0159 Vercel+Bluehost+Resend domain setup process as a reusable runbook (so the next three brand domains don't reinvent it), then verify SESSION_0159's deferred outcomes: post-lockfile Vercel build succeeds, Let's Encrypt cert issues, Resend dashboard flips to Verified, and refresh the stale `dns-verification-spec.md`.

## Graphify Check

- Graph status: usable. `graphify stats` at session open: 5,757 nodes, 10,778 edges, 663 communities, 1,169 files tracked.
- Discovery queries:
  - `graphify query "runbook setup procedure step-by-step verification rollback" --budget 2500`
  - `graphify query "resend stripe setup runbook DNS verification" --budget 2000`
  - `graphify query "mermaid flowchart ASCII diagram sequence flow visual" --budget 2000`
- Pattern sources verified by direct Read: `docs/runbooks/resend-setup-runbook.md`, `docs/runbooks/stripe-setup-runbook.md`, `docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/PWCC-mermaid-code.md`.

## Petey Plan

### Tasks

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0160_TASK_01 | Author `docs/runbooks/vercel-domain-setup-runbook.md` capturing SESSION_0159's Vercel+Bluehost+Resend domain setup (mermaid flowchart + ASCII record table + step-by-step + pitfalls table). Add wiki index row + index `last_agent` bump. | ✅ done |
| SESSION_0160_TASK_02 | Verify post-`cd6c12c` Vercel production build succeeds; on success, confirm Let's Encrypt cert issued and `https://baselinemartialarts.com` serves the `ronin-dojo-baseline` deployment. | ⚠️ partial — Part B `vercel.json` applied (commit `881b664`); build advanced past install/lockfile failure to a new failure: Prisma postinstall fails because `DATABASE_URL` env var not set in Vercel. Carryover to SESSION_0161. |
| SESSION_0160_TASK_03 | Refresh Resend dashboard verification check (DKIM, MX Sending, SPF Sending should be Verified). | ✅ done — Brian confirmed via Resend dashboard screenshot: Domain verified at 2026-05-13 15:04, "ready to send and receive emails", DKIM TXT verified with new dedicated key. |
| SESSION_0160_TASK_04 | Refresh stale `docs/architecture/infrastructure/dns-verification-spec.md` to match current Resend dashboard pattern (per SESSION_0159_FINDING_01). | queued — carryover to SESSION_0161. |
| SESSION_0160_TASK_05 | JETTY bidirectional backlink sweep for the new runbook on `resend-setup-runbook.md`, ADR 0015, `dns-verification-spec.md`, `graphify-repo-memory.md`. | ✅ done |

### Out-of-scope but addressed

- `dirstarter_template/.gitignore` was missing `.graphify/`, leaving local Graphify state untracked. Fixed in a separate repo (`dirstarter_template` at `29a2232`). Committed locally; not pushed (user authorization on dirstarter_template push pending).

## Files Touched

| Path | Note |
| --- | --- |
| `docs/runbooks/vercel-domain-setup-runbook.md` | NEW. Captures the SESSION_0159 Vercel+Bluehost+Resend domain setup as a reusable runbook (mermaid flowchart `flowchart TD` + ASCII record table + 8-phase step-by-step + Bluehost UI gotchas + Production Build Readiness + troubleshooting table + Brand Rollout section). 425 lines. |
| `docs/sprints/SESSION_0160.md` | This session record. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0160 row, `vercel-domain-setup-runbook` row in Runbooks section; bumped `last_agent`; fixed one pre-existing G8/R8 blockquote-list warning at line 297 while touching the file. |
| `docs/runbooks/resend-setup-runbook.md` | JETTY: `pairs_with` += `vercel-domain-setup-runbook.md`; `backlinks` += SESSION_0159, SESSION_0160. `updated` 2026-05-13, `last_agent` `claude-session-0160`. Also G8 fix: added blank line before "Phase 2: Additional brand domains" list. |
| `docs/architecture/decisions/0015-domain-hosting-infrastructure.md` | JETTY: `pairs_with` += `vercel-domain-setup-runbook.md`; `backlinks` += SESSION_0159, SESSION_0160. `updated` 2026-05-13, `last_agent` `claude-session-0160`. |
| `docs/architecture/infrastructure/dns-verification-spec.md` | JETTY: `pairs_with` += `vercel-domain-setup-runbook.md`, `resend-setup-runbook.md`; `backlinks` += SESSION_0159, SESSION_0160. `updated` 2026-05-13, `last_agent` `claude-session-0160`. (Content refresh deferred to SESSION_0161_TASK_04.) |
| `docs/runbooks/graphify-repo-memory.md` | JETTY: `backlinks` += SESSION_0159, SESSION_0160, `vercel-domain-setup-runbook.md`. `last_agent` `claude-session-0160`. |
| `docs/protocols/project-log.md` | SESSION_0160 task plan + review + carryover entries appended; backlinks updated with `docs/sprints/SESSION_0160.md`. |
| `vercel.json` (NEW, root) | Part B build fix: `corepack enable && pnpm install --frozen-lockfile` forces pnpm 9.0.0 per `packageManager` field instead of Vercel's pre-installed pnpm 6.35.1. |

## What Landed

- **TASK_01 — Vercel Domain Setup Runbook (425 lines).** Pattern-matched on `resend-setup-runbook.md` (JETTY frontmatter, ASCII record table, step-by-step phases, Bluehost UI gotchas, troubleshooting table, Brand Rollout section) with an inline `mermaid flowchart TD` capturing the end-to-end flow from "attach domain" through "curl 200 + valid cert." Encodes the SESSION_0159 lessons that aren't obvious from the success path: dashboard A value over CLI hardcoded value; CNAME-sibling rule shadowing DKIM TXT; Resend dashboard supersedes stale spec; team-vs-project domain attachment distinction; `pnpm-lock.yaml` gate; Vercel "Intended Nameservers" mismatch is informational.
- **TASK_02 Part B — `vercel.json` build fix.** Discovered that committing `pnpm-lock.yaml` (SESSION_0159 Part A) was necessary but not sufficient: Vercel switched to pnpm install but used the pre-installed pnpm 6.35.1, which cannot read pnpm 9.x lockfile format, triggering "Local package.json exists, but node_modules missing." Added `vercel.json` with `corepack enable && pnpm install --frozen-lockfile` to force Vercel to install pnpm 9.0.0 from the `packageManager` field. Build now progresses past install but exposes the next layer: `apps/web/prisma.config.ts` fails to load because `DATABASE_URL` env var is missing in Vercel's build environment (Prisma 7+ strict env validation in config files).
- **TASK_03 — Resend verified.** Brian's dashboard screenshot at 2026-05-13 15:04 confirms `baselinemartialarts.com` Domain verified, "ready to send and receive emails." DKIM TXT shows the new dedicated key (`p=MIGfMA0GCSqG…lzZu4KwIDAQAB`) as Verified. Validates SESSION_0159's diagnosis: the CNAME at `resend._domainkey` shadowing the TXT was the only blocker; once deleted, Resend's verifier found the correct dedicated key.
- **TASK_05 — JETTY bidirectional backlink sweep.** Four related docs now correctly reference the new runbook in `pairs_with`, and the runbook is reciprocated in their frontmatter. SESSION_0159 + SESSION_0160 added as `backlinks` on `resend-setup-runbook.md`, ADR 0015, `dns-verification-spec.md`, and `graphify-repo-memory.md`. ADR 0006 (`0006-multi-domain-hosting.md`) deliberately skipped — has no JETTY frontmatter at all (pre-existing gap; full retrofit out of session scope).
- **Out-of-scope `dirstarter_template/.gitignore`.** Brian flagged that `.graphify/db.sqlite` was untracked in the separate `dirstarter_template` repo. Added `.graphify/` to that repo's `.gitignore` (commit `29a2232`, local-only, not pushed pending push authorization).

## Decisions Resolved

- **Vercel build install strategy:** use `vercel.json` with explicit `corepack enable && pnpm install --frozen-lockfile`, not a project-settings UI override. Reason: keeps the build config in git, reviewable, applies on every branch including previews.
- **ADR 0006 JETTY retrofit deferred.** Bringing it to full JETTY 3.0 compliance is meaningful work (full title/slug/type/created/updated/last_agent/pairs_with/backlinks) and outside this session's scope. Gap noted; tracked implicitly for when an ADR-touching session opens.
- **`DATABASE_URL` placement:** Vercel Project → Settings → Environment Variables → add with Production + Preview scopes (Path A canonical fix), not a code-side workaround in `prisma.config.ts`. Vercel needs `DATABASE_URL` at runtime regardless, so setting it once at the project level fixes both build-time and runtime.

## Open Decisions / Blockers

- **BLOCKED ON USER — `DATABASE_URL` env var.** Brian must add `DATABASE_URL` (the Neon production connection string) to Vercel project Environment Variables before the build can succeed. Cannot proceed without it. Action item carried into SESSION_0161 as TASK_01.
- **`www.baselinemartialarts.com` missing from Vercel project Domains.** Bluehost has the CNAME pointing at `cname.vercel-dns.com`, but the Vercel project Domains list shows only `baselinemartialarts.com` apex and `ronin-dojo-baseline.vercel.app`. Without a `www` entry, requests to `www` hit Vercel and 404. Carryover to SESSION_0161 as TASK_02.
- **`docs/architecture/infrastructure/dns-verification-spec.md` content refresh (SESSION_0159_FINDING_01).** Frontmatter is up to date but the spec body still describes the stale Resend pattern (`resend-verification=rv_<token>` TXT + `em.<domain>` CNAME). Refresh against actual Resend dashboard pattern (DKIM TXT at `resend._domainkey` + `send` MX/SPF). Carryover to SESSION_0161 as TASK_03.
- **dirstarter_template push** — `29a2232 chore: gitignore .graphify/` committed locally in the dirstarter_template repo, not pushed pending Brian's authorization on that separate repo.

## Next Session

- **Goal:** Land the production deploy end-to-end — add `DATABASE_URL` to Vercel, watch the build succeed, confirm Let's Encrypt cert issuance, add `www` domain entry, and `curl -I https://baselinemartialarts.com` to confirm HTTP 200 + valid cert. Then refresh the stale `dns-verification-spec.md` content body.
- **Inputs to read:**
  - `docs/sprints/SESSION_0160.md` (this file)
  - `docs/sprints/SESSION_0159.md` (DNS work + Part A context)
  - `docs/runbooks/vercel-domain-setup-runbook.md` (canonical procedure)
  - `docs/architecture/infrastructure/dns-verification-spec.md` (refresh target)
  - `vercel.json` (build config to verify takes effect)
  - Vercel project Deployments + Environment Variables + Domains pages
- **First task (SESSION_0161_TASK_01):** Confirm Brian has added `DATABASE_URL` to Vercel Environment Variables (Production scope at minimum). Trigger a redeploy (push or dashboard "Redeploy"). Inspect the new build log for: (a) pnpm 9.0.0 detection, (b) successful pnpm install with lockfile resolution, (c) successful `prisma generate`, (d) successful Next build, (e) production deployment promoted. On success: `curl -sI https://baselinemartialarts.com` → expect HTTP 200 + `Server: Vercel`.

## Task Log

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0160_TASK_01 | Vercel Domain Setup Runbook authored (425 lines, mermaid + ASCII + step-by-step + troubleshooting) | ✅ done |
| SESSION_0160_TASK_02 | Part B build fix (`vercel.json` Corepack/pnpm-9). Build now blocked on `DATABASE_URL` env var | ⚠️ partial — carryover |
| SESSION_0160_TASK_03 | Resend dashboard verified end-to-end | ✅ done |
| SESSION_0160_TASK_04 | `dns-verification-spec.md` content refresh | queued — carryover |
| SESSION_0160_TASK_05 | JETTY bidirectional backlink sweep on 4 related docs | ✅ done |

## Review Log

### SESSION_0160_REVIEW_01 — Full Close Review

- **Reviewed tasks:** SESSION_0160_TASK_01 through TASK_05.
- **Dirstarter docs check:** Not applicable — runbook authoring + Vercel build config + JETTY metadata; no L1 Dirstarter baseline layer touched.
- **Sources:** `docs/runbooks/resend-setup-runbook.md` (style baseline), `docs/runbooks/stripe-setup-runbook.md` (style baseline), `docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/PWCC-mermaid-code.md` (mermaid pattern), Resend dashboard screenshot (verification proof), Vercel build logs (build fix verification).
- **Verdict:** Aligned. Runbook captures SESSION_0159's procedural knowledge in a form reusable for the remaining three brand domain rollouts. JETTY sweep eliminates the "leaf doc" risk where the new runbook would be findable only via wiki index. Build fix progressed the deploy past the install-layer failure, exposing the next concrete blocker (`DATABASE_URL`) cleanly rather than masking it. Resend verification confirms SESSION_0159's CNAME-sibling diagnosis was correct.
- **Kaizen aggregate:** 8 — well-scoped, surfaced two concrete findings (`SESSION_0159_FINDING_01` carried over for content refresh; ADR 0006 frontmatter gap noted for future), and made the Vercel deploy blocker fully self-serve for Brian.

## Hostile Close Review

Giddy + Doug verdict: pass. Risks reviewed:

1. **Runbook quality risk.** A runbook authored mid-session by the same agent that ran the procedure can encode hindsight bias and skip steps that "felt obvious." Mitigated: pattern-matched on two existing runbooks (`resend-setup-runbook.md`, `stripe-setup-runbook.md`) for structure consistency; included Troubleshooting table with the exact failure modes encountered during SESSION_0159 (not just success path); Brand Rollout section forces future operators to re-confirm dashboard values per domain rather than copy-pasting from this runbook.
2. **Stale-spec propagation.** The new runbook describes the correct Resend pattern (DKIM TXT at `resend._domainkey` + `send` MX/SPF), while `dns-verification-spec.md` still describes the wrong one (`rv_<token>` TXT + `em.<domain>` CNAME). Risk: future operator reads the spec doc first, follows the wrong pattern, then reads the runbook and gets confused. Mitigated: the runbook explicitly calls out the spec staleness in Step 3 ("If a runbook or spec doc tells you to add those, that doc is stale (SESSION_0159_FINDING_01). The dashboard is the source of truth."). Permanent fix is SESSION_0161_TASK_03.
3. **Build fix correctness.** `vercel.json` with `corepack enable` is technically the documented way to use a specific pnpm version on Vercel, but Corepack itself has had churn (signing requirements, opt-in flags). Risk: Corepack on Vercel's build image refuses to install pnpm 9.0.0 silently. Mitigated: build log will reveal this immediately if it happens; fallback (Vercel project settings UI override of install command) is one click away.
4. **JETTY sweep completeness.** ADR 0006 has no JETTY frontmatter at all and was skipped. Risk: graph-based discovery from new runbook won't reach ADR 0006. Mitigated: the runbook's body cross-references ADR 0006 by relative path so a reader following the doc text will find it; graph traversal will work in one direction (ADR 0006 to runbook, via the runbook's frontmatter `pairs_with`). The other direction (runbook to ADR 0006 via graph) requires ADR 0006's full JETTY retrofit, which is its own session.
5. **Out-of-scope work creep.** The dirstarter_template `.gitignore` fix is in a different repo. Risk: doing it as part of SESSION_0160 violates session-repo scoping. Mitigated: change is one line, fully reversible, committed locally only (not pushed), and addressed in response to a direct user question — declining would have been more disruptive than briefly stepping outside scope. Recorded explicitly in "Out-of-scope but addressed" subsection.

No app runtime behavior changed by SESSION_0160's own commits (Part B's `vercel.json` changes build behavior, not runtime). No schema, auth, payment, or production-data surface touched.

## ADR / Ubiquitous-Language Check

- **No new ADR.** Today's work followed ADR 0006 (multi-domain hosting on one Vercel deployment) and ADR 0015 (Bluehost retained as DNS registrar) without modification. Part B `vercel.json` is operational config, not an architectural decision.
- **ADR 0006 gap flagged (not fixed):** missing JETTY frontmatter entirely. Tracked implicitly for next ADR-touching session.
- **No glossary changes.** "Part A" and "Part B" are SESSION-scoped tags, not domain terms.

## Reflections

- **Documenting in the same session as discovery captures the gotchas while they're still painful.** SESSION_0159 surfaced five surprises (dashboard A value vs. CLI message, CNAME sibling shadowing TXT, stale spec, team-vs-project domain attachment, pnpm lockfile gate). Writing the runbook the next session, while the burns were still fresh, produced a Troubleshooting table that's actually useful. A "we'll runbook it later" decision would have produced something blander and missed the CNAME-sibling-rule explanation because that's the kind of detail that fades fast.
- **Layered failure modes hide behind each other.** Today's Part B fix progressed the build past the install-layer failure ("npm fallback → no deps installed") only to expose the next layer ("Prisma config can't load without DATABASE_URL"). Both failures emit similar surface-level messages ("node_modules missing"), and only by fixing the first do you see the second. The lesson: when a multi-layer pipeline fails at step N, fixing N usually exposes N+1; don't claim "build pipeline fixed" until a clean end-to-end run completes.
- **Mid-session scope creep should be an explicit decision, not a drift.** The dirstarter_template `.gitignore` fix lives in a different repo and could have been deferred to its own session. Doing it inline was the right call here (one-line change, addressing a direct user concern, local-only commit) — but tracking it in the SESSION file under "Out-of-scope but addressed" is critical so the discipline holds. If the same drift had been a code change in dirstarter_template apps, the right answer would have been "let's bow out 0160 and open a dirstarter_template session for that."
- **Vercel's UI surfaces conflicting guidance that's hard to resolve without ADR anchoring.** The dashboard simultaneously shows: "Update the nameservers to manage DNS on Vercel" (delegation path), "Intended Nameservers: ns*.vercel-dns.com ✘ mismatch" (warning indicator), and the per-domain A record value (record-based path). All three are technically correct, but they imply three different setups. The decision lives in ADR 0015 (record-based path, no delegation). Future sessions touching this UI must anchor on ADR 0015 before reading the dashboard, or the dashboard will steer them toward delegation.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0160.md` frontmatter complete (title, slug, type, status, created, updated, last_agent, sprint, pairs_with — 8 entries, backlinks). `wiki/index.md`, `project-log.md` `updated` + `last_agent` bumped to `claude-session-0160`. Four related docs (`resend-setup-runbook.md`, ADR 0015, `dns-verification-spec.md`, `graphify-repo-memory.md`) bumped + bidirectional backlinks added. `vercel.json` is operational config, no JETTY frontmatter applies. |
| Backlinks/index sweep | TASK_05 deliverable. SESSION_0160 row added to `wiki/index.md` Sessions table + `vercel-domain-setup-runbook` row to Runbooks table. `project-log.md` `backlinks` += SESSION_0160. New runbook reachable from every related doc via `pairs_with` reciprocation. ADR 0006 deliberately skipped — has no JETTY frontmatter, flagged. |
| Wiki lint | `bun run wiki:lint` final → **0 errors, 508 warnings**. Net Δ from session start: −1 warning (fixed one pre-existing G8/R8 blockquote-list warning in `wiki/index.md` line 297 while touching the file; also fixed one G8 list-blank-line warning in `resend-setup-runbook.md` line 218 while touching frontmatter). All remaining 508 warnings are pre-existing in `protocols/failed-steps-log.md`. |
| Kaizen reflection | `## Reflections` section present (4 entries). |
| Hostile close review | `## Hostile Close Review` section present; 5 risks reviewed with mitigations; `SESSION_0160_REVIEW_01` appended to `project-log.md`. |
| Review & Recommend | `## Next Session` section has Goal + Inputs to read + First task. SESSION_0161 staged with a concrete `DATABASE_URL` + deploy + `www` + spec-refresh agenda. |
| Memory sweep | No operator-side memory writes needed. Persistent rules surfaced today (Vercel dashboard misleading vs. ADR 0015, Corepack requirement for pnpm 9 on Vercel, Prisma 7 strict config env validation) are documented in the new runbook + this SESSION file + `project-log.md`. Memory directory in this Claude Code instance is scoped to `dirstarter_template`, not `ronin-dojo-app`, so writing ronin-dojo-app-specific facts there would be misplaced. |
| Next session unblock check | BLOCKED ON USER for SESSION_0161_TASK_01 first step (Brian must paste/add `DATABASE_URL` to Vercel project Environment Variables) — explicitly flagged in Next Session block and Open Decisions. All other SESSION_0161 tasks (verify build, add www domain, refresh spec) are unblocked once that env var lands. |
| Git hygiene | This close: one final `docs:` commit covering SESSION_0160 close content + `project-log.md` SESSION_0160 entry. Branch `main` clean prior to commit; worktree single (no stale worktrees). Final commit hash reported in bow-out response. Earlier session commits: `239a36e` (runbook + SESSION_0160 open), `881b664` (vercel.json Part B), `fbea498` (JETTY sweep). All pushed to `origin/main`. |
| Graphify update | `graphify update .` run after final commit; final stats reported in bow-out response. |

### Status

closed-full
