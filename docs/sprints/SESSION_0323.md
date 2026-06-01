---
title: "SESSION 0323 — Passport media surface"
slug: session-0323
type: session--implement
status: closed
created: 2026-06-01
updated: 2026-06-01
last_agent: codex-session-0323
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0322.md
  - docs/knowledge/wiki/dirstarter-docs-inventory.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0323 — Passport media surface

## Date

2026-06-01

## Operator

Brian + codex-session-0323

## Goal

Wire the deferred Passport media UI onto the SESSION_0322 capability-gated web media pipeline by choosing the dashboard profile/passport edit surface, loading existing passport attachments server-side, and mounting the shared `MediaAttachmentManager` with `target={{ kind: "passport", id }}`.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0322.md`
- Carryover: SESSION_0322 shipped the shared non-admin media upload/remove pipeline and mounted it on PromotionEvent, Technique, and Organization surfaces. Passport and Course resolvers were already built and covered; this session consumes the Passport resolver with a dashboard surface mount.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `aefa276`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Storage, Media, Better Auth action protection, Prisma `Media`/`MediaAttachment`, dashboard App Router composition. |
| Extension or replacement | Extension: reuse the existing `uploadToS3Storage`/`Media`/`MediaAttachment` pipeline and `userActionClient` protection from SESSION_0322. |
| Why justified | Passport avatar/media upload is Ronin domain behavior because the authorized owner/admin scope is Passport-specific. |
| Risk if bypassed | A separate upload path or URL-only field would duplicate Dirstarter storage handling and skip the per-target capability resolver. |

Live docs checked during planning on 2026-06-01: Dirstarter Storage (`https://dirstarter.com/docs/integrations/storage`) and Media (`https://dirstarter.com/docs/integrations/media`). The docs continue to route server-side uploads through `lib/media.ts`/S3; this session extends that path rather than replacing it.

### Graphify check

- Graph status: current; stats at bow-in: 8961 nodes, 13763 edges, 1352 communities, 1541 files tracked.
- Queries used:
  - `Passport avatar media profile edit surface MediaAttachmentManager getDashboardMediaAttachments passport dashboard profile`
- Files selected from graph:
  - `apps/web/app/(web)/dashboard/profile-tab.tsx`
  - `apps/web/app/(web)/dashboard/profile-form.tsx`
  - `apps/web/app/(web)/me/page.tsx`
  - `apps/web/app/(web)/me/passport-editor.tsx`
  - `apps/web/components/web/media/media-attachment-manager.tsx`
  - `apps/web/server/web/media/queries.ts`
  - `apps/web/server/web/media/media-authorization.ts`
  - `apps/web/server/web/media/media-targets.ts`
  - `apps/web/server/web/media/media-schemas.ts`
- Verification note: exact files were opened after Graphify; Graphify was used as navigation, not proof.

### Grill outcome

- Surface chosen: `/dashboard` Profile tab (`DashboardProfileTab`) because the handoff explicitly asks for a dashboard passport/profile edit surface. `/me` remains a richer Passport editor and is treated as related context, not the target for this slice.
- Scope chosen: thin mount only. Do not redesign `Passport.avatarUrl` semantics or replace the existing URL field this session.

## Petey plan

### Goal

Mount Passport media management on the dashboard profile surface using the existing SESSION_0322 web media pipeline.

### Tasks

#### SESSION_0323_TASK_01 — Dashboard Passport media mount

- **Agent:** Cody + Doug
- **What:** Load the current user's Passport media attachments in `DashboardProfileTab` and render `MediaAttachmentManager` for `target={{ kind: "passport", id: passport.id }}`.
- **Steps:**
  1. Import the existing media manager, dashboard media query, request-brand helper, and layout primitive in the dashboard profile tab.
  2. Fetch the request brand, Passport, and DirectoryProfile server-side.
  3. When a Passport exists, fetch `getDashboardMediaAttachments` for the passport target and render the manager below the profile form.
  4. Verify typecheck/lint/tests appropriate to the changed surface.
- **Done means:** `/dashboard` profile tab shows a Passport media manager backed by the existing capability-gated upload/remove actions and server-loaded attachment list.
- **Depends on:** nothing.

### Parallelism

Sequential. This is one narrow mount over the existing shared pipeline.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0323_TASK_01 | Cody + Doug | Small code slice with authorization-sensitive server loading; build and verify inline. |

### Open decisions

- None for this slice.

### Risks

- The manager stores `Media`/`MediaAttachment` rows for the Passport target; it does not automatically rewrite `Passport.avatarUrl`. That behavior is intentionally out of scope because the handoff requested a thin manager mount.
- Upload smoke still depends on a reachable S3/MinIO bucket; local static/type/test gates remain the non-S3 proof.

### Scope guard

- No new authorization resolver; reuse the existing Passport resolver.
- No schema changes.
- No second upload path.
- No Course image UI unless the Passport mount is complete and there is time.
- No `Passport.avatarUrl` migration or public directory rendering rewrite in this session.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Storage and Media live docs, checked 2026-06-01.
- **Baseline pattern to extend:** `lib/media.ts`, `Media`/`MediaAttachment`, `userActionClient`, existing `MediaAttachmentManager`, dashboard App Router server component composition.
- **Custom delta:** Passport-specific dashboard mount and server-side attachment list.
- **No-bypass proof:** The mount calls `getDashboardMediaAttachments`, which reuses `authorizeMediaTarget` for `passport` before returning private dashboard attachments.

## Cody pre-flight

### Pre-flight: Dashboard Passport media mount

#### 1. Existing component scan

- Graphify query used: `Passport avatar media profile edit surface MediaAttachmentManager getDashboardMediaAttachments passport dashboard profile`
- Found: `DashboardProfileTab`, `ProfileForm`, `/me` `PassportEditor`, `MediaAttachmentManager`, `getDashboardMediaAttachments`, `authorizeMediaTarget` passport resolver.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes
- Consulted live alignment URLs: yes
- Closest L1 pattern: existing SESSION_0322 `MediaAttachmentManager` mounts in dashboard Event/Technique and Organization settings pages.
- Primitive API spot-check: `MediaAttachmentManager` props are `target`, `initialAttachments`, optional `title`, optional `description`; `Stack` supports `size: "xs" | "sm" | "md" | "lg"`, `direction: "row" | "column"`, and `wrap`.

#### 3. Composition decision

- Extending existing component: `DashboardProfileTab`
- Composing existing components: `ProfileForm`, `MediaAttachmentManager`, `Stack`

#### 4. Lane docs loaded

- Prior SESSION next session read: yes
- ADR read: none required; SESSION_0322 media authorization plan is the governing handoff.
- Runbook consulted: `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs; `docs/runbooks/dev-environment/dev-environment.md` referenced through Cody pre-flight.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo`
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: local dashboard, `http://localhost:3000/dashboard`

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0006, FS-0008, FS-0024, FS-0025
- Mitigation acknowledged: Graphify ran before broad search; task IDs and pre-flight were recorded before code; primitive and Prisma fields were read from source; FS-0024 git guard will run before commit.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0323_TASK_01 | landed | Dashboard Profile tab now server-loads Passport media attachments and renders `MediaAttachmentManager` for the current user's Passport target. |

## What landed

- `/dashboard` Profile tab now chooses the requested dashboard passport/profile surface for Passport media management.
- `DashboardProfileTab` loads the current request brand, current user's Passport/DirectoryProfile, and a server-authorized `getDashboardMediaAttachments` list for `target: { kind: "passport", id: passport.id }`.
- The existing `MediaAttachmentManager` is mounted below `ProfileForm` with Passport-specific title/copy, reusing the SESSION_0322 upload/remove actions and Passport resolver.
- Component inventory and wiki index now record SESSION_0323 and the new Passport mount.

## Decisions resolved

- Passport media UI is mounted on `/dashboard` Profile tab, not `/me`, because the handoff requested a dashboard passport/profile edit surface.
- This session intentionally keeps `Passport.avatarUrl` semantics unchanged. Attached Passport media is managed through `Media`/`MediaAttachment`; a future sync/primary-avatar behavior would be a separate decision.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/dashboard/profile-tab.tsx` | Server-load Passport attachments and mount `MediaAttachmentManager` for the Passport target. |
| `docs/sprints/SESSION_0323.md` | Bow-in, plan, pre-flight, verification, review, and close ledger. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0323 session index row and bumped `last_agent`. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Updated `MediaAttachmentManager` inventory row to include the Passport dashboard mount. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun run typecheck` | Pass. |
| `cd apps/web && bun test server/web/media/apply-media.test.ts` | Pass — 9 tests, 20 expects. |
| `cd apps/web && bun biome check 'app/(web)/dashboard/profile-tab.tsx'` | Pass — checked 1 file, no fixes applied. |
| `git diff --check` | Pass. |
| `bun run wiki:lint` | Pass with 0 errors; 3 stale-frontmatter warnings are pre-existing (`architecture/data-model.md`, `knowledge/wiki/aliases-and-canonical-ids.md`, `knowledge/wiki/repo-truth-index.md`). |
| `cd apps/web && bun run lint` | Blocked by pre-existing `promotion-event-editor-form.tsx` a11y lint issue (`lint/a11y/noLabelWithoutControl`); Biome auto-format fallout was reverted so this session's diff stays scoped. |
| Browser smoke | Blocked by local environment: Browser plugin exposes no `iab`/`chromium` target; HTTP dev-login route returned 404 because the dev-login env gate is not enabled. Unauthenticated `/dashboard` returns the expected 307 to `/auth/login?next=/dashboard`. |

## Open decisions / blockers

- Course image UI remains deferred; the resolver exists, but this session only mounted Passport media.
- Live upload/browser smoke remains operator-side until a Browser target and dev-login/S3-MinIO setup are available locally.
- `Passport.avatarUrl` is still an independent field; syncing a selected attached media item into that field is a future product decision, not part of this thin mount.

## Next session

### Goal

Wire the deferred Course image media surface if an existing dashboard/admin course edit surface is available; otherwise make an explicit decision on whether Passport media should promote one image into `Passport.avatarUrl`.

### Inputs to read

- `docs/sprints/SESSION_0322.md`
- `docs/sprints/SESSION_0323.md`
- `apps/web/server/web/media/media-authorization.ts`
- `apps/web/components/web/media/media-attachment-manager.tsx`
- Course edit/admin route files identified by Graphify.

### First task

Run Graphify for course edit/media nouns, locate the existing Course edit surface, then mount `MediaAttachmentManager` with `target={{ kind: "course", id }}` and a server-loaded `getDashboardMediaAttachments` list. If no web course edit surface exists, stop at a Petey decision note instead of inventing a new route.

## Review log

### SESSION_0323_REVIEW_01 — Passport media mount

- **Reviewed tasks:** SESSION_0323_TASK_01
- **Dirstarter docs check:** live docs checked
- **Sources:** `https://dirstarter.com/docs/integrations/storage`, `https://dirstarter.com/docs/integrations/media`
- **Verdict:** Aligned. The slice extends the existing Dirstarter-compatible server-side S3/media path through the SESSION_0322 per-target web pipeline, with no schema change and no second upload path. The only verification gap is live browser/upload smoke, which is honestly blocked by local browser/dev-login/S3 setup rather than hidden as complete.
- **Score:** 9.5/10
- **Follow-up:** Course media mount remains the next thin consumer, unless Passport avatarUrl sync is prioritized first.

## Hostile close review

- **Giddy:** pass — one primary lane, one task, Dirstarter Storage/Media checked live, Graphify-first discovery used, and the final diff is scoped.
- **Doug:** pass with caveat — typecheck, focused media tests, changed-file Biome, diff check, and wiki lint passed; live dashboard/upload smoke is blocked by local auth/browser setup and recorded as such.
- **Desi:** pass — uses the existing shared manager and restrained dashboard copy; no new custom UI pattern.
- **Dirstarter docs check:** live docs checked. Sources: `https://dirstarter.com/docs/integrations/storage`, `https://dirstarter.com/docs/integrations/media`. Verdict: aligned.
- **Kaizen aggregate:** 9/10 — the server-side behavior is low-risk and reuses covered authorization; browser/upload proof needs an enabled local smoke environment.

### Findings (severity ≥ medium)

None.

## ADR / ubiquitous-language check

- ADR update not required. This session consumes the SESSION_0322 media authorization design without changing architecture.
- Ubiquitous language update not required. Existing terms `Passport`, `Media`, and `MediaAttachment` are used.

## Reflections

This was a deliberately narrow slice. The main decision was surface selection: `/dashboard` Profile tab matches the handoff better than `/me`, even though `/me` has the richer Passport editor. Keeping the mount in the dashboard avoided inventing a new route or expanding the Passport editor contract.

The one thing that almost caused churn was the repo-wide `bun run lint` command. It hit a pre-existing PromotionEvent a11y error and auto-formatted unrelated files before failing. I reverted that incidental formatting and used changed-file Biome as the scoped lint proof.

The browser smoke could not run in this Codex session because the Browser plugin did not expose an in-app browser target and local `dev-login` was disabled. That is an environment boundary, not a code result; it stays visible in verification and blockers.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0323.md` created with JETTY frontmatter; `docs/knowledge/wiki/index.md` and `docs/knowledge/wiki/custom-component-inventory.md` checked and `last_agent` updated to `codex-session-0323`. Code file has no wiki annotation. |
| Backlinks/index sweep | `wiki/index.md` now links SESSION_0323; SESSION_0323 backlinks to wiki index and pairs with SESSION_0322 + custom component inventory; custom component inventory pairs with SESSION_0323. |
| Wiki lint | `bun run wiki:lint` returned 0 errors and 3 pre-existing stale-frontmatter warnings. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0323_REVIEW_01` recorded; no findings severity >= medium. |
| Review & Recommend | Next session goal, inputs, and first task written. |
| Memory sweep | No operator memory update needed; the session-scoped facts are captured in SESSION_0323 and custom component inventory. |
| Next session unblock check | Unblocked for Course media discovery/mount; browser/upload smoke still depends on local operator env setup. |
| Git hygiene | FS-0024 guard passed: cwd `/Users/brianscott/dev/ronin-dojo-app`, remote `Ronin-Dojo-Design/ronin-dojo-baseline`, branch `main`; worktree list shows only this main worktree. Final staged set contains the Passport tab code + SESSION/wiki docs; commit hash reported at bow-out — see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` completed before commit; post-update `graphify stats`: 8959 nodes, 13765 edges, 1345 communities, 1541 files tracked. |
