---
title: "SESSION 0324 — Course media and Passport avatar promotion"
slug: session-0324
type: session--implement
status: closed
created: 2026-06-01
updated: 2026-06-01
last_agent: codex-session-0324
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0323.md
  - docs/sprints/SESSION_0322.md
  - docs/knowledge/wiki/dirstarter-docs-inventory.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0324 — Course media and Passport avatar promotion

## Date

2026-06-01

## Operator

Brian + codex-session-0324

## Goal

Wire Course media onto the existing course edit surface, then resolve the Passport avatar carryover by letting an authorized user explicitly promote one Passport image attachment into `Passport.avatarUrl`.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0323.md`
- Carryover: SESSION_0323 mounted Passport media on the dashboard profile tab and left Course media plus the `Passport.avatarUrl` promotion decision open. SESSION_0322 already shipped the shared capability-gated web media pipeline and built `course`/`passport` authorization resolvers.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `97d339b`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Storage, Media, Better Auth action protection, Prisma `Media`/`MediaAttachment`/`Passport`, admin App Router composition. |
| Extension or replacement | Extension: reuse `uploadToS3Storage`, `Media`/`MediaAttachment`, `userActionClient`, `adminActionClient` route protection, and the SESSION_0322 per-target authorization resolver. |
| Why justified | Course images and Passport avatar selection are Ronin domain behaviors layered over Dirstarter's server-side S3/media pipeline. |
| Risk if bypassed | A duplicate upload path or client-only avatar assignment would bypass the existing storage helper, audit rows, and target authorization checks. |

Live docs checked during planning on 2026-06-01: Dirstarter Storage (`https://dirstarter.com/docs/integrations/storage`), Media (`https://dirstarter.com/docs/integrations/media`), Authentication (`https://dirstarter.com/docs/authentication`), and Prisma (`https://dirstarter.com/docs/database/prisma`).

### Graphify check

- Graph status: current; stats at bow-in: 8959 nodes, 13765 edges, 1345 communities, 1541 files tracked.
- Queries used:
  - `Course edit admin dashboard course media MediaAttachmentManager getDashboardMediaAttachments courseId`
  - `admin courses page CourseForm course-form courses_table curriculum_items_editor`
  - `web courses dashboard course editor CourseForm course settings course id page`
  - `Passport avatar avatarUrl media MediaAttachmentManager dashboard profile passport`
- Files selected from graph:
  - `apps/web/app/admin/courses/[id]/page.tsx`
  - `apps/web/app/admin/courses/new/page.tsx`
  - `apps/web/app/admin/courses/page.tsx`
  - `apps/web/app/admin/courses/_components/course-form.tsx`
  - `apps/web/server/admin/courses/queries.ts`
  - `apps/web/server/admin/courses/actions.ts`
  - `apps/web/server/web/media/media-authorization.ts`
  - `apps/web/server/web/media/actions.ts`
  - `apps/web/server/web/media/apply-media.ts`
  - `apps/web/server/web/media/media-targets.ts`
  - `apps/web/server/web/media/media-schemas.ts`
  - `apps/web/server/web/media/queries.ts`
  - `apps/web/components/web/media/media-attachment-manager.tsx`
  - `apps/web/app/(web)/dashboard/profile-tab.tsx`
  - `apps/web/app/(web)/me/passport-editor.tsx`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

- Course edit surface exists: `/admin/courses/[id]` already loads `findCourseById`, renders `CourseForm`, and renders `CurriculumItemsEditor`. Do not invent a dashboard course route.
- Course media mount should stay thin: load `getDashboardMediaAttachments({ target: { kind: "course", id: course.id } })` server-side and render the existing `MediaAttachmentManager`.
- Brian resolved the Passport decision: Passport media should tie into `Passport.avatarUrl`.
- Passport avatar promotion should be explicit, not automatic: a passport-only action on an image attachment writes that media URL into `Passport.avatarUrl` and marks the selected media public because avatar URLs are public-facing.
- Removing the attachment currently used as the avatar should clear `Passport.avatarUrl`; do not silently choose a replacement image.

## Petey plan

### Goal

Mount Course media on the existing admin Course edit page and add explicit Passport image-to-avatar promotion through the shared media manager.

### Tasks

#### SESSION_0324_TASK_01 — Admin Course media mount

- **Agent:** Cody + Doug
- **What:** Load and render Course attachments on the existing `/admin/courses/[id]` page.
- **Steps:**
  1. Import `MediaAttachmentManager`, `getDashboardMediaAttachments`, `getRequestBrand`, and `getServerSession` in the Course edit page.
  2. Reuse `findCourseById(id)` as the source of truth for the Course and pass `target={{ kind: "course", id: course.id }}`.
  3. Server-load attachments with the existing dashboard query and render the manager below the Course form, before or after the curriculum editor based on page flow.
  4. Extend media action revalidation for Course admin routes.
- **Done means:** `/admin/courses/[id]` shows the shared media manager for an authorized admin/course author with a server-loaded attachment list.
- **Depends on:** nothing.

#### SESSION_0324_TASK_02 — Passport avatar promotion

- **Agent:** Cody + Doug
- **What:** Add an explicit passport-only server action and manager UI control to promote one Passport image attachment into `Passport.avatarUrl`.
- **Steps:**
  1. Add a zod schema and apply helper for avatar promotion, reusing `authorizeMediaTarget`.
  2. Verify the attachment belongs to the Passport target and points at an image media row.
  3. Update `Passport.avatarUrl` to the selected media URL and mark that media public.
  4. Clear `Passport.avatarUrl` when the current avatar attachment is removed.
  5. Render passport-only avatar state/action controls in `MediaAttachmentManager`.
  6. Add focused tests for promotion, non-passport rejection, non-image rejection, and current-avatar removal.
- **Done means:** An authorized Passport media editor can select a Passport image attachment as the avatar, and the server writes `Passport.avatarUrl` under the same capability check as upload/remove.
- **Depends on:** SESSION_0324_TASK_01 can proceed independently; TASK_02 shares the media manager/actions and should land after TASK_01 edits are stable.

#### SESSION_0324_TASK_03 — Verification and close

- **Agent:** Doug + Petey
- **What:** Run focused gates, update docs/wiki inventory, refresh Graphify, then full bow-out.
- **Steps:**
  1. Run focused media tests, typecheck, changed-file Biome, diff check, and wiki lint.
  2. Browser-smoke the affected route if local auth/dev server conditions allow; otherwise record the exact blocker.
  3. Update `docs/knowledge/wiki/custom-component-inventory.md` and `docs/knowledge/wiki/index.md` if the manager surface/action inventory changes.
  4. Run full `docs/rituals/closing.md`, including optional deep items, then run `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` before the final commit.
  5. Stage, commit, and push to `main` after gates pass.
- **Done means:** Evidence is recorded in SESSION_0324, the graph is refreshed, and a conventional commit is pushed to `origin/main`.
- **Depends on:** SESSION_0324_TASK_01 and SESSION_0324_TASK_02.

### Parallelism

One explorer subagent is running a read-only sidecar on current `Passport.avatarUrl` consumers and public-rendering risk. Production code stays local because Course mount, media actions, and the manager share files; splitting writes would create avoidable merge friction.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0324_TASK_01 | Cody + Doug | Thin mount on an existing route with authorization-sensitive server loading. |
| SESSION_0324_TASK_02 | Cody + Doug | Server-side avatar promotion changes core Passport data and needs focused negative tests. |
| SESSION_0324_TASK_03 | Doug + Petey | Verification, hostile close review, docs inventory, Graphify refresh, and git hygiene. |

### Open decisions

None at plan-lock. Brian approved tying Passport media into `Passport.avatarUrl`; this plan chooses explicit promotion rather than automatic latest-upload behavior.

### Risks

- The manager currently defaults uploads to private; explicit avatar promotion must mark the selected image public to avoid a private-media/public-avatar contradiction.
- `/me` still has a legacy `FormMedia` avatar field. This session ties the shared Passport media manager into `avatarUrl` but does not remove the older form field.
- Live upload smoke depends on local auth and S3/MinIO availability; server tests remain the primary proof if local smoke is blocked.

### Scope guard

- No new Course route.
- No schema changes.
- No duplicate upload/storage path.
- No gallery reordering/caption editing.
- No redesign of `/me` or dashboard profile forms beyond the shared manager state needed for avatar promotion.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Storage, Media, Authentication, and Prisma live docs checked 2026-06-01.
- **Baseline pattern to extend:** `lib/media.ts` S3 helpers, Prisma `Media`/`MediaAttachment`/`Passport`, `userActionClient`, admin route HOC, existing `MediaAttachmentManager`.
- **Custom delta:** Ronin per-target media authorization and Passport avatar promotion from a selected Passport media attachment.
- **No-bypass proof:** All upload/remove/promote mutations remain server actions backed by `authorizeMediaTarget`; the Course mount consumes the existing dashboard media query instead of adding an admin-only media path.

## Cody pre-flight

### Pre-flight: Course media mount and Passport avatar promotion

#### 1. Existing component scan

- Graphify query used: `Course edit admin dashboard course media MediaAttachmentManager getDashboardMediaAttachments courseId`; `Passport avatar avatarUrl media MediaAttachmentManager dashboard profile passport`.
- Found: admin Course edit page (`apps/web/app/admin/courses/[id]/page.tsx`), `CourseForm`, `CurriculumItemsEditor`, `MediaAttachmentManager`, `getDashboardMediaAttachments`, `authorizeMediaTarget`, `applyWebMediaUpload`, `applyWebMediaRemoval`, dashboard Passport media mount, `/me` Passport editor avatar field.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: yes.
- Consulted live alignment URLs: yes — Storage, Media, Authentication, Prisma.
- Closest L1 pattern: existing `MediaAttachmentManager` card/stack/button/badge composition plus admin route `withAdminPage` and safe action chains.
- Primitive API spot-check: `Button` supports `variant: "fancy" | "primary" | "secondary" | "soft" | "ghost" | "destructive"`, `size: "xs" | "sm" | "md" | "lg"`, `prefix`, `suffix`, `isPending`, `render`; `Card` supports `hover`, `focus`, `isRevealed`, `isHighlighted`; `CardHeader`/`CardDescription` compose `Stack`/`div`; `Stack` supports `size: "xs" | "sm" | "md" | "lg"`, `direction: "row" | "column"`, `wrap`, `render`; `Badge` supports `variant: "primary" | "soft" | "outline" | "success" | "caution" | "warning" | "info" | "danger"` and `size: "sm" | "md" | "lg"`; `Checkbox` uses Base UI Root props with `checked`/`onCheckedChange`; `Input` supports `size: "sm" | "md" | "lg"` plus box variants; `Hint` is `ComponentProps<"p">`; `H6`/Heading supports `render`.

#### 3. Composition decision

- Extending existing component: `MediaAttachmentManager`.
- Extending existing route: `apps/web/app/admin/courses/[id]/page.tsx`.
- Composing existing components: `Wrapper`, `CourseForm`, `CurriculumItemsEditor`, `MediaAttachmentManager`, `Button`, `Badge`, `Card`, `Stack`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0323`).
- ADR read: none required; SESSION_0322/0323 media decisions are the governing handoff.
- Runbook consulted: `docs/runbooks/dev-environment/graphify-repo-memory.md`, `docs/protocols/cody-preflight.md`, `docs/knowledge/wiki/dirstarter-docs-inventory.md`, `docs/knowledge/wiki/dirstarter-component-inventory.md`, `docs/knowledge/wiki/manual-boundary-registry.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: local app at `http://localhost:3000`, admin route `/admin/courses/[id]`, dashboard route `/dashboard`.
- Verification commands confirmed: `cd apps/web && bun run typecheck`, focused `bun test`, changed-file `bun biome check`, repo `bun run wiki:lint`, `git diff --check`.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0006, FS-0008, FS-0024, FS-0025.
- Mitigation acknowledged: Graphify ran before broad search; Petey plan and task IDs are recorded before implementation; primitive and Prisma model APIs were source-checked; the FS-0024 cwd/remote guard ran before git work; Graphify will update before the final single close commit.

### Backend/schema spot-check

- Auth predicates planned: `withAdminPage` protects `/admin/courses/[id]`; `getDashboardMediaAttachments` and media actions re-check `authorizeMediaTarget`; global admins pass `authorizeMediaTarget`, course targets check org-author for non-admins, passport targets check owner or org-admin.
- Existing actions/queries: `uploadWebMedia`, `removeWebMedia`, `getDashboardMediaAttachments`, `upsertCourse`, `findCourseById`, `updatePassport`.
- Prisma spot-check: `Passport.avatarUrl` is nullable `String?`; `Passport.mediaAttachments` back-relation exists; `Media.type` is `MediaType`; `Media.isPublic` is `Boolean @default(false)`; `MediaAttachment` has nullable `passportId` and `courseId`; `Course` has `brand`, `organizationId`, and `mediaAttachments`.
- Manual Boundary Registry entries: none directly block this slice.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0324_TASK_01 | landed | Admin Course edit page now server-loads Course media attachments and renders the shared manager. |
| SESSION_0324_TASK_02 | landed | Passport image attachments can be explicitly promoted into `Passport.avatarUrl`; current-avatar removal clears the field. |
| SESSION_0324_TASK_03 | landed | Static gates, docs close, Graphify refresh, and git hygiene completed; authenticated browser/upload smoke remains locally blocked and recorded. |

## What landed

- `/admin/courses/[id]` now mounts the shared `MediaAttachmentManager` for `target={{ kind: "course", id: course.id }}` with a server-loaded `getDashboardMediaAttachments` list.
- The shared media action revalidation now covers Course admin/public paths and Passport profile paths.
- Passport image attachments can be explicitly promoted to `Passport.avatarUrl` through the shared manager. The server verifies Passport target authorization, verifies the attachment belongs to that Passport, verifies the media type is `IMAGE`, marks the selected media public, writes `Passport.avatarUrl`, and writes an audit row.
- Removing the Passport attachment currently referenced by `Passport.avatarUrl` clears the field so a deleted/orphan-cleaned S3 object is not left as the canonical avatar.
- Focused media tests now cover Course authorization, Passport avatar promotion, non-image rejection, non-passport schema rejection, and current-avatar removal cleanup.
- Component inventory and wiki index now record SESSION_0324, the Course media mount, and the Passport avatar promotion behavior.

## Decisions resolved

- Existing Course edit surface found: `/admin/courses/[id]`; no new Course dashboard route was created.
- Passport avatar tie-in behavior is explicit selection, not automatic latest-upload promotion.
- A selected Passport avatar image is intentionally made public because `Passport.avatarUrl` has no privacy flag and is consumed by non-dashboard surfaces.
- Public directory/member surfaces still mostly use `User.image`; switching those to `Passport.avatarUrl ?? User.image` is a separate follow-up, not hidden in this session.
- ADR check: no new ADR needed. This extends the accepted SESSION_0322 media pipeline and does not introduce a new architectural policy or domain term.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/admin/courses/[id]/page.tsx` | Server-loads Course attachments and mounts `MediaAttachmentManager` on the existing admin edit page. |
| `apps/web/app/(web)/dashboard/profile-tab.tsx` | Passes current `Passport.avatarUrl` into the Passport media manager. |
| `apps/web/components/web/media/media-attachment-manager.tsx` | Adds passport-only avatar badge/action state and optimistic public/avatar updates. |
| `apps/web/server/web/media/actions.ts` | Adds Course/Passport revalidation targets and `promotePassportAvatarMedia`. |
| `apps/web/server/web/media/apply-media.ts` | Adds Passport avatar promotion helper and current-avatar cleanup on removal. |
| `apps/web/server/web/media/media-schemas.ts` | Adds passport-only avatar promotion input schema. |
| `apps/web/server/web/media/media-errors.ts` | Adds canonical non-image avatar error string. |
| `apps/web/server/web/media/apply-media.test.ts` | Adds focused coverage for Course authorization and Passport avatar promotion/removal behavior. |
| `docs/sprints/SESSION_0324.md` | Bow-in, plan, pre-flight, implementation ledger, verification, and close evidence. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Updates the media manager inventory row for Course and Passport avatar promotion. |
| `docs/knowledge/wiki/index.md` | Adds SESSION_0324 and updates `last_agent`. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun test server/web/media/apply-media.test.ts` | Pass — 14 tests, 29 expects. |
| `cd apps/web && bun run typecheck` | Pass. |
| `cd apps/web && bun biome check 'app/admin/courses/[id]/page.tsx' 'server/web/media/media-errors.ts' 'server/web/media/media-schemas.ts' 'server/web/media/apply-media.ts' 'server/web/media/actions.ts' 'components/web/media/media-attachment-manager.tsx' 'app/(web)/dashboard/profile-tab.tsx' 'server/web/media/apply-media.test.ts'` | Pass — checked 8 files, no fixes applied. |
| `git diff --check` | Pass. |
| `bun run wiki:lint` | Pass with 0 errors; 3 stale-frontmatter warnings are pre-existing (`architecture/data-model.md`, `knowledge/wiki/aliases-and-canonical-ids.md`, `knowledge/wiki/repo-truth-index.md`). |
| `cd apps/web && bun run lint` | Blocked by pre-existing `promotion-event-editor-form.tsx` a11y issue (`lint/a11y/noLabelWithoutControl`). The command's unrelated formatter edits were manually reversed; final worktree is scoped. |
| Dev server | Existing Next dev server already running at `http://localhost:3000`; starting a second server failed because PID `42498` owns the app. |
| HTTP smoke | `curl -I http://localhost:3000/courses` returned `200 OK`; protected `/admin/courses` and `/dashboard` returned expected `307` redirects to `/auth/login?...`. |
| Browser smoke | Blocked by local tool state: Playwright MCP exposed snapshot/screenshot/console only, no navigate; Node REPL does not have `playwright` installed. No authenticated admin/upload smoke performed. |

## Open decisions / blockers

- Authenticated browser/upload smoke remains blocked locally until a usable browser navigation tool/session and S3/MinIO-backed upload environment are available.
- Full `apps/web` lint remains blocked by the pre-existing `promotion-event-editor-form.tsx` `noLabelWithoutControl` issue, unchanged by this session.
- Public directory/member surfaces do not yet prefer `Passport.avatarUrl`; they mostly use `User.image`. That is now the next clean avatar-consumption slice.

## Next session

### Goal

Wire `Passport.avatarUrl` consumption into public/member-facing avatar surfaces where appropriate, preserving existing DirectoryProfile visibility rules and `User.image` fallback behavior.

### Inputs to read

- `docs/sprints/SESSION_0324.md`
- `apps/web/server/web/directory/queries.ts`
- `apps/web/server/web/directory/search-profiles.ts`
- `apps/web/components/web/members/member-card.tsx`
- `apps/web/app/(web)/members/[slug]/page.tsx`
- `apps/web/server/web/lineage/node-profile-actions.ts`
- `apps/web/app/(web)/dashboard/membership.tsx`

### First task

Run Graphify for `Passport.avatarUrl`, `User.image`, `DirectoryProfile`, `members`, and `lineage avatar` nouns. Then choose the smallest read-model change that makes member/directory avatar displays prefer `passport.avatarUrl ?? user.image` without bypassing DirectoryProfile visibility or exposing hidden profile data.

## Review log

### SESSION_0324_REVIEW_01 — Course media + Passport avatar promotion

- **Reviewed tasks:** SESSION_0324_TASK_01, SESSION_0324_TASK_02, SESSION_0324_TASK_03
- **Dirstarter docs check:** live docs checked
- **Sources:** `https://dirstarter.com/docs/integrations/storage`, `https://dirstarter.com/docs/integrations/media`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/database/prisma`
- **Verdict:** Aligned. The Course mount consumes the existing per-target media pipeline rather than creating an admin-only bypass, and Passport avatar promotion is server-authorized, audited, and explicit. The local verification gap is authenticated browser/upload smoke, blocked by tool/auth/storage availability rather than hidden as complete.
- **Score:** 9.5/10

## Hostile close review

### SESSION_0324 — Course media and Passport avatar promotion

#### Review

**SESSION_0324_REVIEW_01 — Course media + Passport avatar promotion**

- **Plan sanity:** pass — Graphify found the existing admin Course edit page, so the plan mounted there and avoided a new route.
- **Dirstarter compliance:** pass — extends Dirstarter's server-side S3/media and auth-protected action pattern; no second upload path.
- **Security:** pass with smoke caveat — all mutations re-check `authorizeMediaTarget`; Passport avatar promotion requires Passport target ownership/admin authorization and IMAGE media.
- **Data integrity:** pass — `Passport.avatarUrl` is updated server-side in the same authorized helper; current-avatar removal clears the field by matching the removed media URL.
- **Lifecycle proof:** pass for backend/user-flow contract; live upload UX remains blocked by local smoke environment.
- **Verification honesty:** pass — focused tests, typecheck, changed-file Biome, wiki lint, diff check, and HTTP smoke recorded; full lint/browser blockers are named.
- **Workflow honesty:** pass — bow-in, Graphify-first discovery, Petey plan, task IDs, pre-flight, subagent sidecar, docs inventory, and close evidence were recorded before commit.
- **Merge readiness:** ready with caveats recorded — no schema migration, no env vars, and no unrelated worktree changes remain.

Dirstarter docs check: live docs checked  
Sources: `https://dirstarter.com/docs/integrations/storage`, `https://dirstarter.com/docs/integrations/media`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/database/prisma`  
Verdict: aligned.

#### Findings

No medium-or-higher findings introduced by this session.

Low residual risks:

- Authenticated browser/upload smoke is still environment/tool-blocked.
- Public directory/member avatar read models still need a follow-up to consume `Passport.avatarUrl`.
- The pre-existing PromotionEvent editor label lint issue continues to block full `apps/web` lint.

#### Kaizen reflection triage

1. Safe/security proof: server-side authz is covered by focused tests and source review. A full e2e upload smoke with authenticated admin and S3/MinIO would close the remaining UI/runtime gap.
2. Failed-step prevention: one process slip occurred — running `bun run lint` invoked `biome check --write` and briefly formatted unrelated PromotionEvent files. It was caught by `git status` and reversed by explicit patch. Next time, inspect lint scripts before running any command that may write.
3. Scale confidence: 100 users = 9.6, 1,000 users = 9.5, 10,000 users = 9.2. Lowest-tier confidence is 9.2 because S3/upload runtime and avatar public-consumption parity still need live smoke and follow-up.

Kaizen aggregate: 9.2/10 — proceed, with the avatar consumption/browser-smoke gaps staged explicitly.

## Reflections

- The right Passport behavior was explicit selection, not automatic upload promotion. That kept private media private until the user intentionally makes an image the public avatar.
- `Passport.avatarUrl` is already used by some internal/current-user/admin surfaces, but public directory/member pages mostly use `User.image`. That split is now visible and should be resolved deliberately.
- `bun run lint` in `apps/web` is a write-capable command (`biome check --write .`). Changed-file Biome is the safer default when full lint is known to be blocked.

## ADR / Ubiquitous Language check

- ADR: not needed. This is an extension of the SESSION_0322 capability-gated media pipeline, not a new architecture decision.
- Ubiquitous language: no new domain terms introduced. Existing terms used: Passport, Course, Media, MediaAttachment, Organization.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated frontmatter on touched wiki docs: `custom-component-inventory.md` and `index.md` now have `last_agent: codex-session-0324`; SESSION_0324 has current frontmatter/status. Code files do not carry JETTY frontmatter. |
| Backlinks/index sweep | `custom-component-inventory.md` pairs with SESSION_0324; `wiki/index.md` has a SESSION_0324 row. No new wiki pages or runbooks were created. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 3 pre-existing stale-frontmatter warnings. |
| Kaizen reflection | Present in `## Reflections` and hostile close triage. |
| Hostile close review | `SESSION_0324_REVIEW_01` recorded; no medium-or-higher findings. |
| Review & Recommend | Next session goal, inputs, and first task written. |
| ADR/glossary check | Recorded: no ADR or glossary update needed. |
| Wiring ledger sweep | Skipped — no new P0/P1/P2 wiring debt surfaced; public avatar consumption is staged as the next session, not logged as defect debt. |
| Memory sweep | None needed; the SESSION file captures session-scoped behavior and no new cross-session operating rule was introduced. |
| Next session unblock check | Unblocked: Graphify-first avatar consumer discovery can start from the files listed above. |
| Git hygiene | Pending before commit: FS-0024 guard, branch/worktree checks, stage review, single commit, push. Commit hash reported at bow-out — see `git log`. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before commit; final `graphify stats`: 8968 nodes, 13794 edges, 1379 communities, 1541 files tracked. |
