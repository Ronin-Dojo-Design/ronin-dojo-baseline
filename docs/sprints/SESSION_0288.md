---
title: "SESSION 0288 — Harden web upload auth (media CRUD epic, Thread-1 TASK_02)"
slug: session-0288
type: session--implement
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0288
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0287.md
  - docs/sprints/petey-plan-0287.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0288 — Harden web upload auth (media CRUD epic, Thread-1 TASK_02)

## Date

2026-05-29

## Operator

Brian + claude-session-0288 (Petey orchestrating, Cody executing, Doug verifying)

## Goal

Resolve open decision **D1** from [`petey-plan-0287.md`](petey-plan-0287.md) and
implement **Thread-1 TASK_02**: move the public, ungated web `uploadMedia`/`fetchMedia`
actions to an authenticated safe-action client gated by `canUploadMedia(user.id, brand)`,
keeping `form-media.tsx` working for authorized users, with a safe-action test proving
the gate.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0287.md` (closed). It landed Slice 1 of the
  media epic (uploads persist `Media`, deletes clean up S3, `MediaType` enum fix, admin
  gallery CRUD) and **surfaced + queued D1**: web `uploadMedia`/`fetchMedia` use the base
  `actionClient` — no auth, no entitlement check. SESSION_0287's `Next session` block
  recommends TASK_02 (this session).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth / safe-action client layer (`lib/safe-actions.ts` next-safe-action clients) + the storage/media upload actions |
| Extension or replacement | **Extension** — adds a new entitlement-gated client alongside the existing `userActionClient`/`adminActionClient` chain; does not replace the safe-action factory or the storage primitive |
| Why justified | The two web media actions trust the client: any unauthenticated visitor can push bytes to S3 (`uploadMedia`) or trigger a server-side fetch+store (`fetchMedia`). The UI already gates upload on `canUploadMedia` ([me/page.tsx:46]) but the server never enforced it. |
| Risk if bypassed | Public write access to the S3 bucket (cost/abuse), unauthenticated SSRF-flavored fetch-and-store via `fetchMedia`, untracked object spam. |

### FAILED_STEPS check

- No open/mitigated entries in the media/storage or auth area.
- FS-0024 (Bash cwd drift): honored — cwd `/Users/brianscott/dev/ronin-dojo-app`;
  `pwd` + `git remote` guard run at bow-in (remote = `ronin-dojo-baseline`).
- No new env vars and no migration this session (entitlement + clients pre-exist).

### Drift register

- No open drift entry affecting the auth/media lane. D1 was recorded in SESSION_0287
  `Open decisions` and is resolved this session (decision below).

### Graphify check

- Graph status: current (7387 nodes / 11956 edges / 1422 files).
- Queries used: `"web uploadMedia fetchMedia safe-action auth gate canUploadMedia
  entitlement public action client"` (BFS depth 2 from `safe-actions.ts`,
  `node-profile-actions.safe-action.test.ts`).
- Files confirmed from graph + direct read: `lib/safe-actions.ts`,
  `server/web/actions/media.ts`, `server/web/entitlements/queries.ts`,
  `hooks/use-media-action.ts`, `components/common/form-media.tsx`,
  `lib/test/safe-action-env.ts`, `app/(web)/me/page.tsx`,
  `server/web/shared/schema.ts`.
- Verification note: opened each directly. Confirmed `use-media-action.ts` is the only
  consumer of `uploadMedia`/`fetchMedia`, and `/me` already computes `canUploadMedia` for
  the UI — the action just never enforced it.

## Petey plan

Executes [`petey-plan-0287.md`](petey-plan-0287.md) Thread-1 **TASK_02**.

| ID | Status | Description | Owner |
| --- | --- | --- | --- |
| SESSION_0288_TASK_01 | in-progress | Decide D1 (public vs tighten) and add `mediaUploadActionClient` (auth + `canUploadMedia` gate) to `safe-actions.ts`; switch `uploadMedia`/`fetchMedia` to it | Cody |
| SESSION_0288_TASK_02 | pending | Add `media.safe-action.test.ts` proving unauth + unentitled rejection and entitled success | Cody |
| SESSION_0288_TASK_03 | pending | Verify: bun test, biome, typecheck | Doug |

## Task log

### SESSION_0288_TASK_01 — gate the web upload actions (Cody)

Pre-flight: read `safe-actions.ts` (5 existing clients: base/`user`/`admin`/
`tournamentAdmin`/`public`), `server/web/actions/media.ts`,
`entitlements/queries.ts` (`canUploadMedia` — entitlement OR privileged membership
OR org owner), `use-media-action.ts` + `form-media.tsx` (only consumers),
`app/(web)/me/page.tsx` (already gates UI on `canUploadMedia`), and
`server/web/shared/schema.ts`.

Changes:

- `lib/safe-actions.ts` — new `mediaUploadActionClient`: extends `userActionClient`
  (auth), resolves `getRequestBrand()`, throws `"User not authorized to upload media"`
  unless `canUploadMedia(ctx.user.id, brand)`; passes `{ brand }` into ctx for
  downstream media actions. Added the `canUploadMedia` import.

- `server/web/actions/media.ts` — `uploadMedia` and `fetchMedia` switched from the
  public base `actionClient` to `mediaUploadActionClient` (the only edit; action
  bodies unchanged).

No new client primitive invented — applied the existing next-safe-action client +
entitlement pattern. No raw HTML, no migration, no env vars.

### SESSION_0288_TASK_02 — safe-action gate test (Cody)

`server/web/actions/media.safe-action.test.ts` (new, 5 cases) using the shared
`lib/test/safe-action-env` harness. Mocks `~/lib/media` (S3/HTTP), the entitlement
query, and `next-intl/server` so the test isolates the gate wiring; the entitlement
*logic* is already covered by `entitlements/queries.integration.test.ts`. Cases:
uploadMedia unauth-reject, uploadMedia entitled-reject, uploadMedia entitled-success
(asserts S3 store happened), fetchMedia unauth-reject, fetchMedia entitled-reject.

### SESSION_0288_TASK_03 — verification (Doug)

- `bun test server/web/actions/media.safe-action.test.ts` → **5 pass / 0 fail** (11 assertions).
- `bun biome check` (3 touched code files) → **clean, 0 fixes**.
- `bun run typecheck` (`next typegen && tsc --noEmit`) → **0 errors** (whole project).
- The new client is **additive** — no existing client modified; the gate test imports
  `safe-actions.ts` transitively and loads cleanly (no import cycle from the new
  `entitlements/queries` import).
- **Not run:** full DB-backed suite / live MinIO upload smoke — local `S3_*` env blank
  and DB fixtures out of scope (same constraint as SESSION_0287). Verification this
  session is gate-unit + lint + typecheck.

## Decisions resolved

- **D1 — RESOLVED: tighten (the public exposure was an unintentional gap, not an
  intended Dirstarter public form).** Evidence:
  1. All `FormMedia`/`useMediaAction` consumers are authenticated surfaces — `/me`
     (passport editor), `/admin/**` (tools, content, users, media), and lineage node
     edit. None are public/unauthenticated forms.
  2. `app/(web)/me/page.tsx:46` already computes `canUploadMedia(user.id, brand)` and
     passes it to the editor — the UI is gated, the server action was not (client-trust
     gap).
  3. `publicActionClient` exists for genuinely public forms (newsletter, feedback,
     report-tool, claim); media upload is not in that set.

  - **Behavioral note:** the gate is `canUploadMedia`, which is *narrower than "any
    authenticated user"* — a signed-in user with no S3_UPLOAD entitlement, no
    instructor/coach/owner/org-admin membership, and no owned org will now be rejected
    by the action (and the `/me` UI already hides upload from them). This matches the
    existing UI gate, so no authorized flow regresses.

## What landed

- Thread-1 TASK_02 of the media epic: web `uploadMedia`/`fetchMedia` are no longer
  public. They now run through `mediaUploadActionClient`, which requires an
  authenticated session and enforces `canUploadMedia(user.id, brand)` — closing a
  public-write-to-S3 / unauthenticated server-side-fetch exposure.

- D1 resolved (tighten). The `/me` UI already gated upload on `canUploadMedia`; the
  server now matches that gate, so authorized users are unaffected.

- New `media.safe-action.test.ts` (5 cases) proving the gate.

## Files touched

- `apps/web/lib/safe-actions.ts` — new `mediaUploadActionClient` (#6) + `canUploadMedia` import
- `apps/web/server/web/actions/media.ts` — both actions switched to the gated client
- `apps/web/server/web/actions/media.safe-action.test.ts` (new) — 5-case gate test
- `docs/sprints/SESSION_0288.md` (this file)
- `docs/sprints/petey-plan-0287.md` — TASK_02 marked done, D1 resolved
- `docs/knowledge/wiki/index.md` — SESSION_0288 row

## Open decisions / blockers

- **D2/D3/D4** (per-brand asset path; explicit `Media.key` column; `MediaAttachment`
  relations) remain open for later Thread-1/Thread-2 slices — unchanged this session.

- No new blockers. The next slice (TASK_03 attach/detach, or TASK_04 metadata, or
  Thread-2 TASK_05/06) is doable without user input.

## Next session

### Goal

Continue the media epic ([`petey-plan-0287.md`](petey-plan-0287.md)) with one more
Thread-1 slice — recommend **TASK_03 (MediaAttachment attach/detach CRUD)** now that
upload is both persisted (SESSION_0287) and gated (this session); or pivot to
**Thread-2 TASK_05/06** (per-brand BBL assets via `resolvePublicMediaUrl`) if the
BBL demo-asset polish is the priority.

### Inputs to read

- `docs/sprints/petey-plan-0287.md` (TASK_03/04 + open decisions D3/D4)
- `apps/web/server/admin/media/{queries,actions}.ts`, `schema.prisma` `MediaAttachment`
- SESSION_0288 (this file)

### First task

If TASK_03: decide D4 (wire the 5 bare FK columns to Prisma relations vs keep id-only
polymorphic), then build attach/detach server actions + a consuming surface + tests.

## Review log

- **SESSION_0288_REVIEW_01 (Doug + Petey):** TASK_01–03 reviewed. The fix closes a
  source-confirmed security gap (web upload used the base `actionClient` — no auth, no
  entitlement). The new `mediaUploadActionClient` reuses the established
  next-safe-action client chain (`userActionClient`) + the existing `canUploadMedia`
  entitlement, so it is an enforcement fix, not a new auth architecture. The gate
  matches the UI gate already present at `me/page.tsx:46`, so no authorized flow
  regresses. Gates: 5/5 unit tests, biome clean, typecheck 0 errors. Honest gap: no
  live MinIO upload smoke / full DB suite (local env blank). Unresolved findings: none
  new; D2/D3/D4 remain queued.

## Hostile close review

- **Plan sanity:** One security slice (TASK_02), exactly as queued by SESSION_0287. No
  scope creep — D2/D3/D4 left untouched; the `MediaAttachment` and per-brand-asset
  work was *not* pulled in.

- **Dirstarter alignment:** **Extension, not bypass.** Reused the existing
  next-safe-action client factory and the Wave-D `canUploadMedia` entitlement; added a
  6th client alongside the existing 5. No parallel auth path, no new storage client.
  *Live Better-Auth/Dirstarter docs not re-fetched — no auth-architecture change was
  made (existing client pattern applied), so §6.6 ADR proof is not triggered.*

- **Verification honesty:** Gates are literal command output (5/5, biome clean, 0 tsc
  errors). Missing live upload smoke + full DB suite stated plainly.

- **Data integrity / security:** **Net security improvement** — removes public write
  access to S3 and an unauthenticated server-side fetch-and-store vector. No migration,
  no data touched. Behavioral narrowing (non-entitled signed-in users now rejected by
  the action) is documented and matches the existing UI gate.

- **WORKFLOW 5.0 compliance:** One lane; 3 numbered tasks + task log + review log;
  Petey plan (0287) referenced and updated.

- **Score:** 9.5/10. No hard cap (no bypass, no data-integrity failure). Half-point off
  for the deferred live upload smoke (same local-env constraint as SESSION_0287).

- **Unresolved findings:** none new.

## ADR / ubiquitous-language check

- **ADR:** None needed. This session **applied** the existing safe-action-client +
  entitlement pattern to enforce a gate that was already intended (the `/me` UI gated
  on `canUploadMedia`); it did not make, change, or reject an architectural decision.
  The Better-Auth / next-safe-action baseline is unchanged — no new client factory, no
  new auth mechanism. SESSION_0287 flagged a *possible* ADR here; the determination is
  **not warranted** because no baseline architecture changed. (If the operator wants
  the "media writes require `canUploadMedia`" policy recorded formally, that is a
  lightweight optional follow-up, not a blocker.)

- **Ubiquitous language:** No new or changed domain terms.

## Reflections

- The strongest D1 evidence wasn't the threat model — it was `me/page.tsx` already
  computing `canUploadMedia` for the UI. The intended policy existed; only enforcement
  was missing. Reading the *consumer* settled the decision faster than reasoning about
  exposure in the abstract.

- Putting the gate in `safe-actions.ts` (vs inline in `media.ts`) cost one import but
  bought a reusable client for TASK_03/04 and kept the "all clients live in one file"
  convention intact.

- Mocking `canUploadMedia` in the safe-action test (rather than DB fixtures) is correct
  *because* the entitlement logic already has its own integration test — the new test
  is about gate wiring, not re-proving the entitlement. Knowing the existing coverage
  prevented a redundant, slower DB-backed test.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0288 created with full JETTY frontmatter (`last_agent: claude-session-0288`, `updated: 2026-05-29`). petey-plan-0287 + wiki/index updated (content edits; their frontmatter `updated` already 2026-05-29). Code files carry no frontmatter. |
| Backlinks/index sweep | SESSION_0288 `pairs_with` SESSION_0287 + petey-plan-0287; added SESSION_0288 row to `wiki/index.md`. petey-plan-0287 already `pairs_with` the session line. |
| Wiki lint | `bun run wiki:lint` result recorded in bow-out response (0 errors introduced vs SESSION_0287 baseline). |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | Recorded above (9.5/10, no cap). |
| Review & Recommend | Next session goal written: yes (TASK_03 or Thread-2 TASK_05/06). |
| Memory sweep | None needed — the fix is in code + commit; no new cross-session project fact, user preference, or gotcha beyond what the SESSION/plan already record. |
| Next session unblock check | Unblocked — next slice is a code change + a decision (D4) I can make/recommend; no hard user dependency. |
| Git hygiene | Branch `main`; `git worktree list` checked; staged code + docs; conventional commit; pushed to `origin/main` (standing authorization). Commit hash in bow-out response. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` after git hygiene; final stats in bow-out response. |
