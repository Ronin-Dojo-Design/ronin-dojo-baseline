---
title: "SESSION 0325 — Passport.avatarUrl consumption on member/directory/lineage surfaces"
slug: session-0325
type: session--implement
created: 2026-06-01
updated: 2026-06-01
last_agent: claude-session-0325
sprint: S6
status: closed
pairs_with:
  - docs/sprints/SESSION_0324.md
  - docs/knowledge/wiki/index.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0325 — Passport.avatarUrl consumption on member/directory/lineage surfaces

## Date

2026-06-01

## Operator

Brian + claude-session-0325

## Goal

Wire `Passport.avatarUrl` consumption into public/member-facing avatar surfaces, preferring `passport.avatarUrl ?? user.image`, while preserving existing DirectoryProfile visibility rules and the `User.image` fallback behavior. SESSION_0324 shipped explicit Passport avatar promotion and flagged that public directory/member/lineage surfaces still render `User.image`; this session closes that read-side consumption gap.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0324.md`
- Carryover: SESSION_0324 added explicit Passport image-to-avatar promotion (writes `Passport.avatarUrl`, marks the media public) and explicitly staged "public directory/member avatar read models still need a follow-up to consume `Passport.avatarUrl`" as the next clean slice. This session is that follow-up.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `46b8d82`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (`Passport`/`User` selects), directory read-model query/payload layer, member/directory listing + detail UI composition. |
| Extension or replacement | Extension: reuse the existing privacy-aware directory read models and lineage payloads; only widen the user select to include `passport.avatarUrl` and resolve the fallback in the projection. |
| Why justified | Avatar source preference is a Ronin domain behavior layered over Dirstarter's directory/profile read models; no new query path or component is introduced. |
| Risk if bypassed | A component-level passport fetch or a new query path would duplicate the privacy-aware read model and risk exposing data the DirectoryProfile visibility gate is meant to withhold. |

Live docs checked during planning: not applicable — no L1 integration surface (storage/payments/media pipeline) changes; this is a read-model projection change over existing Prisma selects.

### Graphify check

- Graph status: current; stats at bow-in: 8968 nodes, 13794 edges, 1379 communities, 1541 files tracked.
- Queries used:
  - `Passport avatarUrl User image DirectoryProfile member directory avatar`
  - `lineage avatar passport user image node card honor strip`
- Files selected from graph:
  - `apps/web/server/web/directory/queries.ts`
  - `apps/web/server/web/directory/search-profiles.ts`
  - `apps/web/server/web/directory/payloads.ts`
  - `apps/web/components/web/members/member-card.tsx`
  - `apps/web/components/web/members/member-list.tsx`
  - `apps/web/components/web/directory/directory-query.tsx`
  - `apps/web/app/(web)/members/[slug]/page.tsx`
  - `apps/web/server/web/lineage/payloads.ts`
  - `apps/web/components/web/lineage/lineage-node-card.tsx`
  - `apps/web/components/web/lineage/lineage-honor-strip.tsx`
  - `apps/web/components/web/lineage/lineage-compact-child-list.tsx`
  - `apps/web/app/(web)/dashboard/membership.tsx`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

- Smallest read-model change: resolve `passport.avatarUrl ?? user.image` inside the directory read models (`getDirectoryProfiles`, `findProfileBySlug`, `searchDirectoryProfiles`) so the resolved value flows through the existing `image`/`avatarUrl` return fields — **zero member/directory component changes**.
- Privacy is preserved: DirectoryProfile visibility (HIDDEN never returned; MEMBERS_ONLY only for authenticated viewers) is enforced in the `where` clause and is untouched. The avatar is already rendered unconditionally for any profile that passes the visibility gate; `Passport.avatarUrl` is deliberately public (SESSION_0324). No new field is exposed and no per-field privacy flag governs the avatar.
- Lineage is in scope and closes a real disconnect: the lineage node-profile editor already writes `Passport.avatarUrl` + `displayName`, and the lineage cards already prefer `passport?.displayName ?? user.name` — but they render `user.image` for the avatar because `lineageUserPayload.passport.select` omits `avatarUrl`. Add `avatarUrl` to that select and prefer `passport?.avatarUrl ?? user.image` in the three display cards.
- `dashboard/membership.tsx` already renders `passport.avatarUrl` directly (the viewer's own self-view) with no `user.image` fallback to preserve; left unchanged to stay minimal.

## Petey plan

### Goal

Prefer `passport.avatarUrl ?? user.image` on member/directory/lineage avatar surfaces by widening the user selects to include `Passport.avatarUrl` and resolving the fallback at the read-model projection (directory) or in the existing display card (lineage), with no new components, no schema change, and no change to DirectoryProfile visibility.

### Tasks

#### SESSION_0325_TASK_01 — Directory read-model avatar preference

- **Agent:** Cody + Doug
- **What:** Resolve `passport.avatarUrl ?? user.image` inside the directory read models so member/directory surfaces prefer the promoted Passport avatar.
- **Steps:**
  1. Add `passport: { select: { avatarUrl: true } }` to `directoryUserPayload` (list payload) and `avatarUrl` to the existing `passport` select on the detail payload.
  2. `getDirectoryProfiles` map → `image: profile.user.passport?.avatarUrl ?? profile.user.image`.
  3. `findProfileBySlug` → `image: profile.user.passport?.avatarUrl ?? profile.user.image`.
  4. `searchDirectoryProfiles` → `avatarUrl: profile.user.passport?.avatarUrl ?? profile.user.image`.
- **Done means:** Directory listing, paginated member search, and member detail render `Passport.avatarUrl` when present and fall back to `User.image`, with no component edits and DirectoryProfile visibility unchanged.
- **Depends on:** nothing.

#### SESSION_0325_TASK_02 — Lineage avatar preference

- **Agent:** Cody + Doug
- **What:** Make lineage display cards prefer the Passport avatar that the lineage editor already writes.
- **Steps:**
  1. Add `avatarUrl: true` to `lineageUserPayload.passport.select` in `apps/web/server/web/lineage/payloads.ts`.
  2. In `lineage-node-card.tsx`, `lineage-honor-strip.tsx`, and `lineage-compact-child-list.tsx`, prefer `…user.passport?.avatarUrl ?? …user.image` for the `AvatarImage` src.
- **Done means:** Lineage node cards / honor strip / compact child list show the promoted Passport avatar when present and fall back to `User.image`.
- **Depends on:** nothing (disjoint files from TASK_01).

#### SESSION_0325_TASK_03 — Verification and close

- **Agent:** Doug + Petey
- **What:** Run focused gates, add focused directory-projection tests, update docs/wiki inventory if needed, refresh Graphify, then full bow-out.
- **Steps:**
  1. `bun run typecheck`, focused `bun test`, changed-file Biome, `git diff --check`, `bun run wiki:lint`.
  2. HTTP/route smoke where local auth/dev conditions allow; otherwise record the exact blocker.
  3. Full `docs/rituals/closing.md` incl. optional deep items; `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` before the final commit.
  4. Stage, commit (conventional), push to `main` after gates pass.
- **Done means:** Evidence recorded in SESSION_0325, graph refreshed, conventional commit pushed to `origin/main`.
- **Depends on:** SESSION_0325_TASK_01, SESSION_0325_TASK_02.

### Parallelism

TASK_01 (directory) and TASK_02 (lineage) touch disjoint files and could be parallelized, but the total change is ~6 one-line edits across 7 files; per CLAUDE.md ("do single coherent changes inline") executing inline is more token-efficient and faster than spawning parallel sub-agents. No worktrees needed.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0325_TASK_01 | Cody + Doug | Privacy-sensitive read-model projection change; needs a focused test proving the fallback + visibility. |
| SESSION_0325_TASK_02 | Cody + Doug | Thin display-card change over an existing payload; mirrors the existing `displayName` preference. |
| SESSION_0325_TASK_03 | Doug + Petey | Verification, hostile close review, docs inventory, Graphify refresh, git hygiene. |

### Open decisions

None at plan-lock. Brian's SESSION_0324 decision (Passport avatar is the public-facing source) governs; this session consumes it on the read side.

### Risks

- A read-model that selects `passport.avatarUrl` for a visible profile must not also pull other passport fields into a payload that lacks privacy gating — limit the new select to `avatarUrl` only.
- Authenticated browser/upload smoke remains environment-blocked locally (per SESSION_0324); server projection tests + typecheck are the primary proof.

### Scope guard

- No schema changes.
- No new query path or component.
- No change to DirectoryProfile visibility logic or per-field privacy flags.
- No edit to `dashboard/membership.tsx` (already prefers `passport.avatarUrl`; self-view, no `user.image` fallback to preserve).
- No `/me` or profile-form redesign.

### Dirstarter implementation template

- **Docs read first:** not applicable — no L1 integration boundary changed; read-model projection over existing Prisma selects.
- **Baseline pattern to extend:** privacy-aware directory read models + lineage payload allowlist selects.
- **Custom delta:** prefer the Ronin `Passport.avatarUrl` over `User.image` at the projection layer.
- **No-bypass proof:** the avatar source is resolved inside the existing privacy-aware read models; no component-level passport fetch and no new query path are introduced.

## Cody pre-flight

### Pre-flight: directory + lineage avatar preference

#### 1. Existing component scan

- Graphify query used: `Passport avatarUrl User image DirectoryProfile member directory avatar`; `lineage avatar passport user image node card honor strip`.
- Found: `getDirectoryProfiles`, `findProfileBySlug`, `searchDirectoryProfiles`, `directoryUserPayload`/`directoryProfileDetailPayload`, `MemberCard`/`MemberList`/`DirectoryQuery`, member detail page, `lineageUserPayload`, `LineageNodeCard`/`LineageHonorStrip`/`LineageCompactChildList`, `applyLineageNodeProfileUpdate` (writer of `Passport.avatarUrl`).

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: not required — no L1 integration surface changes.
- Consulted live alignment URLs: no — read-model projection only.
- Closest L1 pattern: existing privacy-aware DirectoryProfile read models and `Avatar`/`AvatarImage`/`AvatarFallback` composition.
- Primitive API spot-check: `Avatar`/`AvatarImage`/`AvatarFallback` already in use on every touched surface; no new primitive introduced.

#### 3. Composition decision

- Extending existing read models: `getDirectoryProfiles`, `findProfileBySlug`, `searchDirectoryProfiles`.
- Extending existing payloads: `directoryUserPayload`, `directoryProfileDetailPayload`, `lineageUserPayload`.
- Composing existing components: no change to `MemberCard`/`MemberList`/`DirectoryList`; `AvatarImage` src expression updated in the three lineage cards only.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0324`).
- ADR read: none required; the avatar-source decision is the SESSION_0324 handoff.
- Runbook consulted: `docs/runbooks/dev-environment/graphify-repo-memory.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: local app at `http://localhost:3000`; routes `/directory`, `/members`, `/members/[slug]`, `/lineage/[slug]`.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0008 (building components from scratch instead of reusing primitives), FS-0024 (cwd/remote git guard).
- Mitigation acknowledged: no new component built — only read-model selects and existing `AvatarImage` src expressions change; FS-0024 cwd/remote guard ran at bow-in; Graphify ran before broad search.

### Backend/schema spot-check

- Auth predicates: directory read models already gate by `DirectoryVisibility` (`PUBLIC`/`MEMBERS_ONLY`/never `HIDDEN`) in the `where` clause; unchanged. Lineage payloads already gate by node visibility in their queries; unchanged.
- Existing queries: `getDirectoryProfiles`, `findProfileBySlug`, `searchDirectoryProfiles`, lineage tree/profile reads.
- Prisma spot-check: `User.passport` is `Passport?` (nullable one-to-one); `Passport.avatarUrl` is `String?`; `User.image` is `String?`. Optional chaining + `??` fallback is type-safe.
- Manual Boundary Registry entries: none block this slice.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0325_TASK_01 | landed | Directory read models (`getDirectoryProfiles`, `searchDirectoryProfiles`, `findProfileBySlug`) project `passport.avatarUrl ?? user.image`; no component changes. |
| SESSION_0325_TASK_02 | landed | `lineageUserPayload` selects `avatarUrl`; `LineageNodeCard`, `LineageProfileDrawer`, `LineageHonorStrip`, `LineageCompactChildList`, and the black-belt rail prefer `passport.avatarUrl ?? user.image`. |
| SESSION_0325_TASK_03 | landed | typecheck, 3-case projection test, lineage suites, changed-file Biome, diff check, wiki lint, 6-route HTTP smoke (all 200), docs close, Graphify refresh, git hygiene. |

## What landed

- Directory read models now prefer the promoted Passport avatar: `directoryUserPayload` and the detail payload select `passport.avatarUrl`, and `getDirectoryProfiles`, `searchDirectoryProfiles`, and `findProfileBySlug` project `passport.avatarUrl ?? user.image` into their existing `image`/`avatarUrl` return fields. No member/directory component changed — `DirectoryList`, `MemberCard`, and `members/[slug]/page.tsx` consume the resolved value.
- Lineage display cards now consume the Passport avatar the lineage editor already writes: `lineageUserPayload.passport.select` adds `avatarUrl`, and `LineageNodeCard`, `LineageProfileDrawer`, `LineageHonorStrip`, and `LineageCompactChildList` prefer `…user.passport?.avatarUrl ?? …user.image`. Awarder avatars (`awardedBy.image`) intentionally stay on `user.image` (different person/select).
- The public discipline black-belt rail (`BlackBeltRail` server query) selects `passport.avatarUrl` and projects `passport.avatarUrl ?? user.image`.
- DirectoryProfile visibility (`HIDDEN`/`MEMBERS_ONLY`/`PUBLIC`) is unchanged; no per-field privacy flag governs the avatar, and `Passport.avatarUrl` is public-by-design (SESSION_0324), so no new data is exposed and the `User.image` fallback is preserved everywhere.
- New focused integration test proves prefer / fallback / HIDDEN-excluded on the directory projection.

## Decisions resolved

- Resolve the avatar source at the read-model projection layer (not in components) for the directory surfaces — keeps DirectoryProfile privacy in one place and requires zero component edits.
- Lineage is in scope and the right "appropriate" surface: the lineage node-profile editor already writes `Passport.avatarUrl`, so the cards rendering `user.image` was a real disconnect; the drawer header was included for the same reason.
- The black-belt rail (public discipline honor strip) is included for coherent public-member-avatar behavior.
- The schedule instructor list is deliberately excluded — it is an admin management tool (assign/unassign/set-primary, exposes email), not a public member-facing display.
- `dashboard/membership.tsx` left unchanged: it already prefers `passport.avatarUrl` (self-view) and has no `User.image` fallback to preserve.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/directory/payloads.ts` | `directoryUserPayload` + detail payload select `passport.avatarUrl` (avatarUrl only — no other Passport field widened). |
| `apps/web/server/web/directory/queries.ts` | `getDirectoryProfiles` + `findProfileBySlug` project `passport.avatarUrl ?? user.image` into `image`. |
| `apps/web/server/web/directory/search-profiles.ts` | `searchDirectoryProfiles` projects `passport.avatarUrl ?? user.image` into `avatarUrl`. |
| `apps/web/server/web/directory/queries.avatar-projection.integration.test.ts` | New test: prefer Passport avatar, fall back to `User.image`, exclude HIDDEN (anon + authed). |
| `apps/web/server/web/lineage/payloads.ts` | `lineageUserPayload.passport.select` adds `avatarUrl`. |
| `apps/web/components/web/lineage/lineage-node-card.tsx` | Avatar prefers `node.user.passport?.avatarUrl ?? node.user.image`. |
| `apps/web/components/web/lineage/lineage-profile-drawer.tsx` | Header avatar prefers `profile.user.passport?.avatarUrl ?? profile.user.image`. |
| `apps/web/components/web/lineage/lineage-honor-strip.tsx` | Avatar prefers `member.node.user.passport?.avatarUrl ?? member.node.user.image`. |
| `apps/web/components/web/lineage/lineage-compact-child-list.tsx` | Avatar prefers `member.node.user.passport?.avatarUrl ?? member.node.user.image`. |
| `apps/web/app/(web)/disciplines/_components/black-belt-rail.tsx` | Server query selects `passport.avatarUrl`; projects `passport.avatarUrl ?? user.image`. |
| `docs/sprints/SESSION_0325.md` | Bow-in, plan, pre-flight, ledger, verification, and close evidence. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Corrected stale BlackBeltRail fact; added §3i Passport avatar consumption. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0325 row; bumped `last_agent`. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun run typecheck` | Pass. |
| `cd apps/web && bun test server/web/directory/queries.avatar-projection.integration.test.ts` | Pass — 3 tests, 6 expects (prefer / fallback / HIDDEN-excluded). |
| `cd apps/web && bun test server/web/lineage/queries.visibility.test.ts` | Pass — 9 tests, 28 expects (payload widening did not regress visibility). |
| `cd apps/web && bun test server/web/lineage/node-profile-actions.test.ts` | Pass — 5 tests, 21 expects. |
| `cd apps/web && bun biome check <10 changed files>` | Pass — checked 10 files, no fixes applied. |
| `git diff --check` | Pass. |
| `bun run wiki:lint` | 0 errors; 3 pre-existing stale-frontmatter warnings (`architecture/data-model.md`, `aliases-and-canonical-ids.md`, `repo-truth-index.md`) — unchanged by this session. |
| HTTP route smoke (existing dev server :3000) | All 200: `/`, `/directory`, `/members`, `/disciplines`, `/disciplines/bjj`, `/members/sensei-demo` — every changed read model renders without runtime error. |

## Open decisions / blockers

- Authenticated/visual avatar verification (logging in and eyeballing a promoted Passport avatar on a directory/lineage card) was not performed — it needs an authenticated browser session and a Passport with a promoted avatar in the dev DB. The read-model render path is HTTP-smoke-proven (all 200) and unit-proven, but the pixel-level swap is unverified locally. Low risk: the projection is a typechecked `??` over an existing public field.
- The schedule instructor list and `dashboard/membership.tsx` were intentionally not migrated (see Decisions resolved); revisit only if either becomes a public member-avatar surface.

## Next session

### Goal

Optional polish, not a blocker: confirm the promoted-avatar swap visually on a real authenticated session, and decide whether any remaining `user.image` instructor surfaces (e.g., school staff lists, schedule instructor list if it gains a public face) should adopt `passport.avatarUrl ?? user.image`.

### First task

Seed (or locate) a dev user with a promoted `Passport.avatarUrl`, log in, and load `/directory`, `/members/<slug>`, a `/lineage/<slug>` tree, and `/disciplines/<slug>`; confirm the Passport avatar renders and that users without a promoted avatar still show `User.image`. Then Graphify `instructor avatar`, `school staff`, `user.image` to enumerate any remaining public instructor-avatar surfaces and decide per-surface whether the same projection applies.

## Review log

### SESSION_0325_REVIEW_01 — Passport avatar consumption

- **Reviewed tasks:** SESSION_0325_TASK_01, SESSION_0325_TASK_02, SESSION_0325_TASK_03
- **Dirstarter docs check:** not applicable — no L1 integration boundary changed; read-model projection over existing Prisma selects.
- **Verdict:** Aligned. The change is confined to the read layer: payloads select `passport.avatarUrl`, queries project `passport.avatarUrl ?? user.image`, and display cards mirror the existing `displayName` preference. DirectoryProfile visibility is untouched, the `User.image` fallback is preserved, and `Passport.avatarUrl` is public-by-design (SESSION_0324), so no new data is exposed. The one honest gap is authenticated/visual avatar verification, which is environment-dependent; the read-model render path is proven by a 3-case integration test plus a 6-route 200 HTTP smoke.
- **Score:** 9.4/10
- **Follow-up:** Visual confirmation on an authenticated session with a promoted avatar (staged as next session).

## Hostile close review

- **Doug:** pass — typecheck clean; focused projection test proves prefer/fallback/HIDDEN-excluded; lineage visibility + node-profile suites still green; changed-file Biome clean; diff clean; all 6 touched routes return 200. The avatar is shown only for profiles already past the visibility gate, and only a deliberately-public field is added. Caveat: no authenticated visual smoke (named, not hidden).
- **Kaizen aggregate:** 9.4/10 — read-only projection change, privacy-preserving by construction, well-tested at the unit + route level; only the pixel-level swap is unverified locally.

### Findings (severity ≥ medium)

None.

## ADR / ubiquitous-language check

- ADR update: **not required.** This extends the accepted SESSION_0322/0324 Passport-media decision (Passport.avatarUrl is the public avatar source) onto the read side. No new architectural policy, query path, or component is introduced.
- Ubiquitous language update: **not required.** No new domain terms; existing terms used (Passport, DirectoryProfile, User, Membership, Lineage).

## Reflections

- The cleanest place to express "prefer the Passport avatar" was the read-model projection, not the components. Resolving `passport.avatarUrl ?? user.image` into the existing `image`/`avatarUrl` return field meant the directory surfaces needed zero component edits and DirectoryProfile privacy stayed in exactly one place.
- The lineage surfaces were the real find: the node-profile editor has been *writing* `Passport.avatarUrl` since SESSION_0184, but every lineage card rendered `user.image` because `lineageUserPayload` only selected `passport.displayName`. The avatar feature was half-wired until this session.
- Scope discipline mattered: the enumeration of `AvatarImage src={…image}` surfaced two adjacent surfaces (black-belt rail, schedule instructor list). One is a clean public honor strip (included); the other is an admin management tool that exposes email (excluded). "Where appropriate" in the goal is doing real work — not every `user.image` is a public member avatar.
- Two `</content>` stray-text artifacts landed via the Write tool (SESSION file + test file) and broke a parse until removed. Worth watching when authoring long files.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Code files carry no frontmatter. Wiki docs updated: `custom-component-inventory.md` + `index.md` now `last_agent: claude-session-0325`, with SESSION_0325 added to `pairs_with`/session table. SESSION_0325 frontmatter current; `status: closed` set in YAML + body in the same pass (FS-0015). |
| Backlinks/index sweep | `custom-component-inventory.md` pairs_with SESSION_0325; `wiki/index.md` has the SESSION_0325 row. No new wiki pages or runbooks created. |
| Wiki lint | `bun run wiki:lint` — 0 errors, 3 pre-existing stale-frontmatter warnings (unrelated files), unchanged by this session. |
| Kaizen reflection | Present in `## Reflections` + hostile-close triage. |
| Hostile close review | `SESSION_0325_REVIEW_01` recorded; Doug pass; no findings ≥ medium. |
| Review & Recommend | Next session goal + first task written (visual confirmation + remaining instructor-avatar surfaces). |
| Wiring ledger sweep | No change — this resolved the SESSION_0324-staged avatar-consumption follow-up (never logged as defect debt); no new P0/P1/P2 debt surfaced. |
| ADR/glossary check | Recorded: no ADR or glossary update needed. |
| Memory sweep | Added one project memory: avatar surfaces prefer `passport.avatarUrl ?? user.image` at the projection layer; schedule instructor list intentionally excluded (admin tool). |
| Next session unblock check | Unblocked — next session is optional polish; first task is self-contained (seed avatar + visual smoke + enumerate). |
| Git hygiene | Branch `main`; no session worktrees; FS-0024 cwd/remote guard ran at bow-in. Single commit + push — hash reported at bow-out / see `git log` (no second evidence commit, FS-0025). |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before the close commit; `graphify stats`: 8972 nodes, 13808 edges, 1365 communities, 1542 files tracked. |
