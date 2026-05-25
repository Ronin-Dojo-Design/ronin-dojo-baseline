---
title: "SESSION 0250 - Authenticated lineage lifecycle plan"
slug: session-0250
type: session--plan
status: closed
created: 2026-05-25
updated: 2026-05-25
last_agent: codex-session-0250
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0249.md
  - docs/runbooks/graphify-repo-memory.md
  - docs/runbooks/sop-e2e-user-lifecycle.md
  - docs/runbooks/lineage-listing-runbook.md
  - docs/runbooks/sop-test-writing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0250 - Authenticated lineage lifecycle plan

## Date

2026-05-25

## Operator

Brian + codex-session-0250 (Petey planning; Cody, Doug/Giddy, and Desi staged for SESSION_0251)

## Goal

Plan the smallest real authenticated lineage lifecycle browser suite around implemented owner/editor, claim, admin review, profile edit, and visibility paths without faking unimplemented `PRIVATE` owner-only public-route reads.

## Bow-in

### Previous session

- SESSION_0249 proved anonymous `/lineage` listing/detail no-leak behavior with Playwright and existing query/materializer tests.
- Remaining staged work: authenticated non-owner, owner/editor, claim, admin review, dashboard preview, and profile edit browser proof where implementation exists.
- Explicit guard: public `/lineage/[treeSlug]` remains public-only; do not claim authenticated `PRIVATE` reads on that route.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Confirmed this plan targets the Ronin repo, not `dirstarter_template`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Better Auth, Prisma, content/admin workflows, and project structure. |
| Extension or replacement | Extension. Keep Better Auth route/action gates, Prisma fixtures, feature-local server actions, and existing Playwright harness. |
| Docs checked | `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/content`, `https://dirstarter.com/docs/codebase/structure` on 2026-05-25. |
| Risk if bypassed | Browser proof could accidentally validate test-only behavior or widen a public route beyond the implemented product contract. |

### Graphify check

- Graph status: available; `graphify stats` returned 6958 nodes / 10828 edges / 1118 communities / 1351 files tracked.
- Query used: `graphify query "lineage authenticated lifecycle claim profile edit admin review Playwright Bun fixture auth helper" --budget 4000`.
- Files selected from graph and direct verification:
  - `apps/web/app/(web)/lineage/[treeSlug]/claim/page.tsx`
  - `apps/web/app/(web)/lineage/[treeSlug]/edit/[nodeId]/page.tsx`
  - `apps/web/app/admin/lineage/claims/page.tsx`
  - `apps/web/app/admin/lineage/claims/[id]/page.tsx`
  - `apps/web/e2e/helpers/auth.ts`
  - `apps/web/e2e/lineage/public-visibility.spec.ts`
  - `apps/web/server/admin/lineage/claim-review-actions.safe-action.test.ts`
  - `apps/web/server/web/lineage/node-profile-actions.safe-action.test.ts`
- Verification note: Graphify pointed at the implemented claim/review/profile paths and existing safe-action proof. The missing browser layer is a lifecycle journey, not new product behavior.

## Petey plan

### SESSION_0250_TASK_01 - Stage authenticated lifecycle implementation

- **Agent:** Petey
- **What:** Convert the SESSION_0249 next-session note into a bounded SESSION_0251 implementation plan.
- **Done means:** SESSION_0250 records the intended task slices, Graphify query, Dirstarter alignment, scope guard, and handoff to Cody.
- **Status:** complete

### SESSION_0251 implementation tasks

1. Fix stale lineage auth redirects from `/auth/sign-in` to `/auth/login?next=...` where implemented route gates already exist.
2. Move Playwright auth DB create/cleanup work behind a Bun CLI bridge so Node-side Playwright helpers do not import the generated Prisma TS client.
3. Add a Bun-backed authenticated lineage lifecycle fixture with public and hidden members, claimant, admin reviewer, tree editor, and placeholder owner.
4. Add `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts` covering anonymous gates, authenticated non-owner claim access/no-leak behavior, denied edit access, claim submission, admin approval, dashboard preview, and approved profile edit.
5. Keep `PRIVATE` testing scoped to the implemented dashboard editor preview, not public `/lineage/[treeSlug]`.
6. Verify with Playwright, lineage safe-action/query tests, app typecheck, diff check, wiki lint, git hygiene, push, and Graphify update.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| Scope and route contract | Petey | Prevents fake owner-only public reads. |
| Fixture/spec implementation | Cody | Clear code execution against existing patterns. |
| Security/no-leak review | Doug/Giddy | Hidden names, serialized HTML, ownership transfer, and grant assertions. |
| UX selector/dashboard sanity | Desi | Claim form, dashboard tab, editor preview, and profile edit flow. |

### Risks

- Playwright's Node runtime cannot safely import the generated Prisma TS client; use the documented Bun bridge pattern.
- Better Auth browser sessions must be signed with the same `BETTER_AUTH_SECRET` loaded by the app.
- Server-action modules must not export non-async values from `"use server"` files under Next 16.
- The E2E should be long enough to cover the journey, but not broad enough to become a privacy/performance stress suite.

## Task log

### SESSION_0250_TASK_01

- **Status:** complete
- **Started:** 2026-05-25
- **Completed:** 2026-05-25
- **Notes:** Planning-only session. No code implementation belongs to SESSION_0250.

## What landed

- Created the planning artifact for authenticated lineage lifecycle browser coverage.
- Staged SESSION_0251 as the implementation session with explicit scope guard against unimplemented public-route private reads.

## Files touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0250.md` | Planning artifact and SESSION_0251 handoff. |

## Decisions resolved

- `PRIVATE` member visibility may be asserted in `/dashboard/lineage/[treeId]` editor preview where implemented, not in public `/lineage/[treeSlug]`.
- No Prisma schema change is needed for the lifecycle coverage.
- Existing safe-action tests remain contract proof; Playwright adds browser journey proof.

## Open decisions / blockers

- None for SESSION_0251 implementation.

## Verification

| Check | Result |
| --- | --- |
| Planning scope check | Pass; no code implementation recorded in SESSION_0250. |
| Graphify-first discovery | Pass; query and selected files recorded above. |

## Review log

### SESSION_0250_REVIEW_01 - Plan review

- **Reviewed tasks:** SESSION_0250_TASK_01
- **Verdict:** Aligned. The plan is small, implementation-backed, and explicitly avoids fake public-route owner/private behavior.
- **Open findings:** None.

## Hostile close review

- **Safe and secure?** Yes for planning. The security-sensitive assertion scope is explicit and limited to implemented gates.
- **Dirstarter alignment?** Yes. Better Auth, Prisma, Content, and Project Structure docs checked before handoff.
- **Data integrity?** No data touched.
- **Workflow score:** 9.8/10. Planning artifact is actionable and bounded.

## ADR / ubiquitous-language check

- No ADR needed for the planning session.
- No ubiquitous-language update needed.

## Next session

- **Goal:** Implement the authenticated lineage lifecycle browser coverage staged above.
- **Inputs to read:**
  - `docs/sprints/SESSION_0249.md`
  - `docs/sprints/SESSION_0250.md`
  - `docs/runbooks/sop-e2e-user-lifecycle.md`
  - `docs/runbooks/lineage-listing-runbook.md`
  - `docs/runbooks/sop-test-writing.md`
  - `apps/web/server/admin/lineage/claim-review-actions.safe-action.test.ts`
  - `apps/web/server/web/lineage/node-profile-actions.safe-action.test.ts`
- **First task:** Cody implements the Bun-backed auth/lineage fixture bridge, then adds the smallest `authenticated-lifecycle.spec.ts` that proves implemented flows only.

## Reflections

- The most important planning constraint is negative: do not make public `/lineage/[treeSlug]` act like an authenticated owner/editor route until the product intentionally implements that behavior.
- The Bun bridge pattern from SESSION_0249 should be reused immediately for auth fixtures, not rediscovered during implementation.

### Status

closed
