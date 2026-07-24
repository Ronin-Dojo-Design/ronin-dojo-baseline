---
title: "SESSION 0644 — auto-codex MMB SEO/metadata foundation (mammothmb.com) (overnight auto lane, wave 2)"
slug: session-0644
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: codex-session-0644
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0644 — auto-codex MMB SEO/metadata foundation (mammothmb.com) (overnight auto lane, wave 2)

> Staged by the SESSION_0635 overnight orchestrator (wave 2, operator-directed). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Dispatch payload = the lane prompt; its HARD
> RULES are binding. Branch: `auto/session-0644-mmb-seo`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-codex MMB SEO/metadata foundation (mammothmb.com) — one tightly-scoped item, zero open forks (all pinned in the lane prompt).

## Bow-in

- Elected lane: Mammoth Build SEO/metadata foundation on the pinned `auto/session-0644-mmb-seo` worktree branch.
- Queue precedence: the operator-directed overnight lane supersedes the broader ledger/board and prior-session queues.
- Pivot: none; all implementation forks are pinned in the dispatch prompt.
- Parallel-lane assessment: one coherent, independently reviewable file set; no further fan-out.
- State of Dojo: live at `/app/state`; no frozen snapshot requested at lane start.
- Pre-flight: waived by Petey — Next.js metadata conventions only; no UI component, L1 area, schema, backend action, test, or dependency work.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0644_TASK_01 | complete | Added the Mammoth Build layout metadata, robots policy, public sitemap, and web manifest; verified and committed locally. |

## What landed

- Root metadata targeting the env-driven `NEXT_PUBLIC_SITE_URL`, with `https://mammothmb.com` as the production fallback.
- Title defaults/template, exact landing-page hero description, Open Graph, Twitter summary-card, and index/follow directives.
- Crawl policy allowing `/` while excluding `/app`, `/api`, and `/login`, with an env-driven sitemap reference.
- Static sitemap containing the only verified public page route, `/`.
- Mammoth Build web manifest using the existing `--bg` and `--primary` theme tokens.

## Files touched

| File | Change |
| --- | --- |
| `clients/mammoth-build-crm/app/layout.tsx` | Replaced CRM-demo metadata with the public Mammoth Build metadata foundation. |
| `clients/mammoth-build-crm/app/robots.ts` | Added public crawl rules and sitemap discovery. |
| `clients/mammoth-build-crm/app/sitemap.ts` | Added the verified public-route sitemap. |
| `clients/mammoth-build-crm/app/manifest.ts` | Added the Mammoth Build web manifest. |
| `docs/sprints/SESSION_0644.md` | Recorded lane adoption, work, review, evidence, and handoff. |

## Artifacts

None.

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `cd clients/mammoth-build-crm && bunx tsc --noEmit` | PASS — `exit=0` |
| `git diff --check` | PASS — `exit=0` |

## Review log

### SESSION_0644_REVIEW_01 — Mammoth SEO/metadata foundation

- **Reviewed tasks:** `SESSION_0644_TASK_01`
- **Class:** A — extends the Dirstarter SEO/environment convention.
- **Dirstarter docs check:** live docs checked.
- **Sources:** `https://dirstarter.com/docs/seo`; `https://dirstarter.com/docs/environment-setup`.
- **Fallow delta:** not applicable to thin, declarative framework metadata; D3/D5 reviewed manually.
- **Code-quality matrix:** D1 9.0 · D2 10.0 · D3 9.0 · D4 9.5 · D5 9.0 · D6 10.0 · D7 9.5.
- **Composite:** 9.4/10 after the no-runtime-verification cap (`code-quality-matrix` §4).
- **Verdict:** CLEARS the Giddy gate (≥9.0). The diff is scoped, type-safe, aligned with the live baseline, and contains no exposed data path or business-logic integrity risk.

## Hostile close review

- Plan sanity: pinned scope matched the standalone app and introduced no unsupported business claims.
- Dirstarter compliance: aligned with its typed Next.js Metadata API, metadata-route, and `NEXT_PUBLIC_SITE_URL` conventions.
- Security/data integrity: no data access, input boundary, authentication flow, or database rule changed.
- Lifecycle proof: route inventory verified `/` as the only public page; `/app/**` was excluded.
- Verification honesty: TypeScript and source review passed; no build or runtime smoke was claimed because the lane contract explicitly prohibits `next build`.
- Workflow honesty: work stayed on the named worktree/branch and within the five-file write allowlist; no dependencies, Prisma, push, PR, or deploy.
- Merge readiness: ready for the AM orchestrator's build-and-merge sweep.
- Kaizen: safe at this scope; a production build plus direct fetches of `/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest` would close the remaining runtime proof gap. Preventable failed steps: 0. Confidence: 100 = 10/10, 1,000 = 10/10, 10,000 = 10/10; all outputs are static and perform no per-request I/O.

## ADR / ubiquitous-language check

No new architectural decision or domain term; no ADR or glossary update needed.

## Proposed ledger edits

- **G-019 progress note:** Mammoth Build now has its SEO foundation: env-driven canonical base targeting `mammothmb.com`, root metadata/social cards, crawl exclusions, a public-route sitemap, and a theme-token-backed manifest.

## Open decisions / blockers

- None for this lane.

## Residual for AM merge

- Add a purpose-built Open Graph image asset, then wire it into Open Graph/Twitter metadata.
- Add per-page metadata after the remaining public landing sections/routes merge.
- The AM orchestrator should run the prohibited-in-lane production build and endpoint smoke checks before merge.

## Next lane

AM merge review: run the production build, smoke the generated metadata endpoints, and merge this commit if green. No next-session stub was staged because this autonomous lane explicitly ends at local commit.

## Reflections

The route inventory kept the sitemap honest: only `/` is public today. Reusing the hero subcopy verbatim avoided turning metadata into a second, drifting source of business claims.
