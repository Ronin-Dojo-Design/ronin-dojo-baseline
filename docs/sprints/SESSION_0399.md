---
title: "SESSION 0399 — /me Passport MediaAttachmentManager parity with the dashboard Profile tab (D-023 / ADR 0025)"
slug: session-0399
type: session--implement
status: in-progress
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0399
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0398.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0399 — /me Passport MediaAttachmentManager parity with the dashboard Profile tab (D-023 / ADR 0025)

> **Unattended cloud run.** Executed by claude-session-0399 in an isolated remote container while the operator (Brian)
> is away. Work is on branch `session-0399-me-media-parity` with a draft PR; **no push to `main`, no force-push**. The
> full bow-out/close ritual (reflections, hostile close, graphify refresh, inventory/drift updates, memory sweep) and
> the authenticated `/me` render proof happen on the operator's machine — there is no Postgres or browser in this
> sandbox, so CI (full suite + Playwright) on the PR is the authoritative behavioural gate.

## Date

2026-06-17

## Operator

Brian + claude-session-0399 (unattended cloud run)

## Goal

Close the one intentional gap SESSION_0398 left when it collapsed the two owner-edit surfaces onto a single canonical
`PassportEditor` rendered by both `/me` and the `/app/profile` Profile tab: the dashboard tab renders a Passport
`MediaAttachmentManager` beneath the editor and `/me` did not. This session adds that one render to `/me` so it reaches
full entry-point parity. Additive, low-risk, no schema change, no shared-code change.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0398.md`
- Carryover: SESSION_0398 (HEAD `11697578`) collapsed `PassportEditor` + `ProfileForm` into one canonical editor over
  one query path, rendered by both entry points. Its `Open decisions / blockers` + `Next session` flagged this exact
  follow-up: "`/me` lacks the Passport `MediaAttachmentManager` the dashboard tab has — by design; adding it to `/me`
  for full parity is an optional follow-up, no capability lost today."

### Branch and worktree

- Branch: `session-0399-me-media-parity` (off `main` at `11697578`)
- Status at bow-in: clean
- Current HEAD at bow-in: `11697578` (SESSION_0398 — "refactor(passport): one canonical PassportEditor for /me +
  dashboard")

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Media surface** (the capability-gated web media pipeline, read-only wiring) + the owner-facing Passport edit page. No Prisma/storage/payments change. |
| Extension or replacement | **Extension** — render the existing shared `MediaAttachmentManager` on a second entry point with the exact props the dashboard tab already uses. No new component, no new action, no new query. |
| Why justified | ADR 0025 names the Passport the identity SoT; the dashboard tab already exposes Passport media. Entry-point parity means `/me` (the canonical owner self-edit route) offers the same. |
| Risk if bypassed | Owners see a different capability set depending on which route they entered from — exactly the entry-point drift D-023 is paying down. |

Live docs checked: SESSION_0398, ADR 0025, `custom-component-inventory.md` §10. Media/Storage alignment URLs
cached-sufficient (no new L1 surface; the media query + manager are reused verbatim from `profile-tab.tsx`).

## Petey plan

### Goal

Add the Passport `MediaAttachmentManager` to `/me` beneath the shared `PassportEditor`, mirroring `profile-tab.tsx`'s
fetch + props exactly; change nothing else.

### Tasks

#### SESSION_0399_TASK_01 — Render the Passport media manager on /me (Cody)

- **Agent:** Cody
- **What:** In `apps/web/app/(web)/me/page.tsx`, fetch the passport media attachments and render
  `<MediaAttachmentManager>` beneath `<PassportEditor>`, mirroring `profile-tab.tsx`.
- **Steps:**
  1. Import `MediaAttachmentManager` (`~/components/web/media/media-attachment-manager`) and
     `getDashboardMediaAttachments` (`~/server/web/media/queries`).
  2. Parallelize the new query alongside the existing `canUploadMedia` call with `Promise.all` (matches the page's
     fetch style and profile-tab's): `getDashboardMediaAttachments({ brand, user: session.user, target: { kind:
     "passport", id: passport.id } })`.
  3. Wrap `<PassportEditor>` + `<MediaAttachmentManager>` in a `Stack direction="column" size="lg" className="w-full"`
     inside `Section.Content` (mirrors profile-tab's column); the sidebar (Completeness + Quick Links) is untouched.
  4. `MediaAttachmentManager` props identical to profile-tab: `target={{ kind: "passport", id: passport.id }}`,
     `initialAttachments={passportAttachments ?? []}`, `avatarUrl={passport.avatarUrl}`, `title="Passport media"`,
     `description="Upload profile images or clips tied to this Passport. Private items stay dashboard-only."`.
- **Done means:** `/me` renders the media manager beneath the editor; the auth redirect, `robots:noindex`, Completeness
  sidebar, and Quick Links are unchanged; static gates green.
- **Depends on:** nothing.

#### SESSION_0399_TASK_02 — Gates + fallow + PR (Doug)

- **Agent:** Doug
- **What:** Run the static gates and open the PR.
- **Steps:** `bun run typecheck`, `lint:check`, `format:check` (from `apps/web`), `wiki:lint` (root), `npx fallow
  audit`; format the touched file with `oxfmt`; open a draft PR. No DB-backed tests / browser proof in the sandbox —
  CI is the authoritative gate.
- **Done means:** gates recorded; PR opened.
- **Depends on:** SESSION_0399_TASK_01.

### Open decisions

- **None requiring sign-off.** Props, placement, and fetch style all follow directly from `profile-tab.tsx`. The one
  layout default — wrapping editor + manager in a `Stack` inside `Section.Content` — mirrors profile-tab's own
  `Stack direction="column" size="lg"` wrapper.

### Risks

- **Unavoidable, intended duplication** — reproducing profile-tab's media block "with identical props" (the task's
  explicit requirement) textually mirrors profile-tab's 16-line render. The task forbids touching/extracting shared
  code, so this clone IS the parity. `fallow audit` flags it as a warn-level clone group; introduced dead-code = 0 and
  the default audit gate passes (exit 0). Recorded transparently below rather than papered over.

### Scope guard

- ADDITIVE only. No schema change. Do **not** modify the shared `PassportEditor`, the server actions, the query layer,
  or `profile-tab.tsx`. Do **not** remove or restructure the `/me` sidebar, the auth redirect, or `robots:noindex`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0399_TASK_01 | landed | `me/page.tsx`: added `MediaAttachmentManager` + `getDashboardMediaAttachments` imports; parallelized the media query with `canUploadMedia` via `Promise.all`; wrapped `PassportEditor` + `MediaAttachmentManager` in a `Stack` inside `Section.Content`. Props identical to profile-tab. Sidebar/redirect/noindex untouched. |
| SESSION_0399_TASK_02 | landed | typecheck 0 · oxlint 0 errors (touched file unflagged) · oxfmt clean · wiki:lint 0 · `fallow audit` default gate pass (exit 0). PR opened (draft). |

## What landed

- **One render added to `/me`** — `apps/web/app/(web)/me/page.tsx` now fetches the passport media attachments
  (`getDashboardMediaAttachments`, parallelized with the existing `canUploadMedia` call) and renders
  `<MediaAttachmentManager>` beneath `<PassportEditor>` inside `Section.Content`, with the **same props**
  `profile-tab.tsx` uses (`target`, `initialAttachments`, `avatarUrl`, `title="Passport media"`, the same
  `description`). `/me` reaches full entry-point parity with the dashboard Profile tab.
- **Nothing else changed** — the auth redirect, `robots:noindex`, the Profile Completeness sidebar, and Quick Links are
  byte-identical. No schema change; the shared `PassportEditor`, the media query, the server actions, and
  `profile-tab.tsx` are untouched.

## Decisions resolved

- **Mirror profile-tab exactly** — identical fetch (`getDashboardMediaAttachments({ brand, user, target })`) and
  identical `MediaAttachmentManager` props. No new abstraction extracted, per the additive-only / don't-touch-shared-code
  scope guard.
- **Layout** — editor + manager wrapped in `Stack direction="column" size="lg" className="w-full"` inside
  `Section.Content`, mirroring profile-tab's own column wrapper; the sidebar stays Completeness + Quick Links.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/me/page.tsx` | Added `MediaAttachmentManager` + `getDashboardMediaAttachments` imports; parallelized the passport-media query with `canUploadMedia`; rendered `<MediaAttachmentManager>` beneath `<PassportEditor>` in a `Stack` inside `Section.Content`, mirroring `profile-tab.tsx`'s props. |
| `docs/sprints/SESSION_0399.md` | This session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (apps/web, CI dummy env) | PASS — 0 errors (next typegen + tsc). |
| `bun run lint:check` (oxlint) | PASS — 0 errors; only pre-existing warnings, none in `me/page.tsx`. |
| `bun run format:check` (oxfmt) | PASS — clean (1420 files); touched file formatted with `oxfmt`. |
| `bun run wiki:lint` (root) | PASS — 0 violations. |
| `npx fallow audit` (default gate, 1 changed file vs main) | **PASS (exit 0)** — excluded 5 inherited findings. **Introduced dead-code = 0** (the 4 dead-code findings are pre-existing unused npm deps in `apps/web/package.json`: `@paralleldrive/cuid2`, `d3`, `tailwind-merge`, `@react-email/preview-server` — not from this change). Duplication: 2 warn-level clone groups — `dup:78d36869` (16-line `MediaAttachmentManager` render mirroring `profile-tab.tsx:39-54`, the task's mandated parity block) + `dup:b8963afd` (11-line import-block overlap with `events/[eventId]/page.tsx`). Complexity: `MePage` is a warn (114 lines / CRAP 72) from the additive fetch+render. All warn-level; gate passes. |
| DB-backed tests / authenticated `/me` render | **Deferred to CI + operator** — no Postgres/browser in sandbox. CI runs the full suite + Playwright on the PR; authenticated `/me` render proof happens on the operator's machine at bow-out. |

## Open decisions / blockers

- **Intended duplication, not a blocker** — the 16-line `MediaAttachmentManager` parity block is, by the task's own
  requirement ("render with the SAME props profile-tab uses") and scope guard (don't touch/extract shared code), a
  faithful mirror of `profile-tab.tsx`. It is the parity. The default `fallow audit` gate passes (exit 0); introduced
  dead-code = 0. If a future session wants to dedupe, the move is a shared "Passport media section" wrapper rendered by
  both pages — but that would touch `profile-tab.tsx`, out of scope here.
- **Authenticated `/me` render proof + full bow-out** happen on the operator's machine (no Postgres/browser in the
  cloud sandbox). CI on the PR is the authoritative behavioural gate.

## Next session

### Goal

On the operator's machine: run the authenticated `/me` render proof (logged-in `/me` should now SSR the editor + the
Passport media manager + live hero, with the Completeness sidebar preserved and the dashboard Profile tab unchanged),
then complete the full bow-out (hostile close, inventory/drift/memory sweep, graphify refresh) and merge once CI is
green. Afterwards, either continue the D-023 identity lane (e.g. fold the lineage-node profile form onto shared field
primitives) or pivot back to the BBL launch gates.

### First task

Pull `session-0399-me-media-parity`, run the dev server, and confirm `/me` renders the Passport media manager beneath
the editor with the Completeness sidebar intact and the dashboard Profile tab unchanged; then merge the PR if CI is
green and run the closing ritual.
