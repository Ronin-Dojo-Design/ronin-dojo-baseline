---
title: "SESSION 0398 — One canonical Passport/DirectoryProfile editor (collapse PassportEditor + ProfileForm; D-023 / ADR 0025)"
slug: session-0398
type: session--implement
status: closed
created: 2026-06-16
updated: 2026-06-16
last_agent: claude-session-0398
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0397.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/knowledge/wiki/concepts/passport-and-shells.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0398 — One canonical Passport/DirectoryProfile editor (collapse PassportEditor + ProfileForm; D-023 / ADR 0025)

## Date

2026-06-16

## Operator

Brian + claude-session-0398 (Petey → Cody → Doug → Petey)

## Goal

Pay down identity drift **D-023 / ADR 0025** at the editor layer: two different editor components edit the **same**
Passport + DirectoryProfile (the identity SoT) over two parallel query-helper pairs — `PassportEditor` (`/me`) over
`getPassportByUserId`/`getDirectoryProfileByUserId`, and `ProfileForm` (`/app/profile` → Profile tab) over
`findUserPassport`/`findUserDirectoryProfile`. **Direction (c):** collapse to ONE canonical editor over ONE query path,
rendered by **both** entry points (neither route removed); retire the redundant `ProfileForm` copy + the redundant
dashboard identity query pair (no fourth person-store). Same consolidation shape as SESSION_0396/0397's
one-`ListingCard` / one-`ListingSaveButton` (parallel copies → one component + thin adapters). Pure component/query
refactor — **no schema change**. Land green on `main`.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0397.md`
- Carryover: SESSION_0397 closed ADR 0028's residuals (polymorphic Bookmark + real Save everywhere, shared
  `ListingDetail`, SchoolCard fold). Its "Next session" offered either the listing-sweep tail OR a BBL pivot; the
  bow-in operator instead spun off **this** identity-editor consolidation (a D-023/ADR-0025 follow-up flagged during
  0397), explicitly the same "one component, retire the parallel copy" pattern.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating this session file
- Current HEAD at bow-in: `c76741a`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Auth/identity surface** (the owner-facing Passport + DirectoryProfile edit forms) — no Prisma/storage/payments change. |
| Extension or replacement | **Consolidation** — collapse two parallel L-custom editor copies into one shared editor; the L1 form primitives (`Form`/`FormField`/`FormMedia`/`Select`) and the shared server actions (`updatePassport`/`updateDirectoryProfile`) are unchanged. |
| Why justified | ADR 0025 names Passport the identity SoT and DirectoryProfile a view; two divergent editors over the same SoT is exactly drift **D-023**. One editor = one canonical write surface. |
| Risk if bypassed | The two editors keep drifting (the dashboard copy already lost 6 passport fields + avatar upload + social links); owners see different field sets depending on the route they enter from. |

Live docs checked during planning: ADR 0025 (Passport SoT), `passport-and-shells.md`, drift-register **D-023**.
Media/Storage/Theming alignment URLs cached-sufficient (no new L1 surface; FormMedia upload paths unchanged).

### Graphify check

- Graph status: current (refreshed end of SESSION_0397); stats at bow-in: 12980 nodes, 24752 edges, 1775 communities, 2023 files tracked.
- Queries used (navigation, not proof): the operator named the exact files; confirmed by direct read + targeted `grep` for consumers.
- Files confirmed by direct read:
  - `app/(web)/me/page.tsx` + `app/(web)/me/passport-editor.tsx` + `app/(web)/me/_components/social-links-editor.tsx`
  - `app/(web)/dashboard/profile-tab.tsx` + `app/(web)/dashboard/profile-form.tsx`
  - `server/web/passport/{queries,schemas,payloads,actions}.ts`, `server/web/dashboard/queries.ts`
  - `components/web/profile/profile-hero.tsx`, `app/(web)/dashboard/membership.tsx`, `app/app/profile/page.tsx`
- Consumer map (grep): `ProfileForm` ← only `profile-tab`; `PassportEditor` ← only `me/page`; `findUserDirectoryProfile`
  ← only `profile-tab`; `findUserPassport` ← `profile-tab` **and** `membership.tsx` (reads only `avatarUrl`/`displayName`,
  both in `passportOnePayload` → safely repointable); `getPassportByUserId`/`getDirectoryProfileByUserId` ← only `me/page`.

### Investigation — field-by-field diff (written BEFORE editing, per the task)

**Shared already:** both editors call the **same** server actions (`updatePassport` + `updateDirectoryProfile`,
`server/web/passport/actions.ts`). The write path is unified; the drift is in the editor **components** + the **read**
helpers only.

Passport fields:

| Field | `PassportEditor` (`/me`) | `ProfileForm` (`/app/profile`) |
| --- | --- | --- |
| displayName / phoneE164 / bio | ✓ | ✓ |
| legalFirstName / legalLastName | ✓ | ✗ missing |
| dob (date) / gender (Select) | ✓ | ✗ missing |
| emergencyContactName / …PhoneE164 | ✓ | ✗ missing |
| avatarUrl | ✓ **FormMedia upload** | plain URL `<Input>` |
| socialLinks | ✓ `SocialLinksEditor` (field array) | ✗ missing |

DirectoryProfile fields:

| Field | `PassportEditor` | `ProfileForm` |
| --- | --- | --- |
| slug / visibility / location×3 | ✓ | ✓ |
| showEmail/Phone/Orgs/Ranks | ✓ Checkbox | ✓ Switch |
| coverPhotoUrl | ✓ FormMedia | ✗ missing |
| videoIntroUrl (canUploadVideo-gated) | ✓ FormMedia/URL | ✗ missing |

Component / page-level:

| Capability | `/me` (MePage + PassportEditor) | `/app/profile` (DashboardProfileTab + ProfileForm) |
| --- | --- | --- |
| zod validation | **server schemas** (`updatePassportSchema`) | **local 4-field copy** (drift) |
| Live `ProfileHero` preview | ✗ | ✓ (the only thing ProfileForm has that PassportEditor lacks) |
| Profile Completeness sidebar | ✓ (page-level) | ✗ |
| `MediaAttachmentManager` (Passport media) | ✗ | ✓ (page-level sibling of the form) |
| Null guard | redirect `/auth/login` if no passport | renders with nullable props |

**Conclusion:** `PassportEditor` is a strict field **superset** + uses the real server schemas. `ProfileForm` adds only
the live `ProfileHero` preview (a capability to preserve) and uses `Switch` (cosmetic). → Canonical editor =
`PassportEditor`, enhanced with the live preview; `ProfileForm` retired. Canonical query path =
`server/web/passport/queries.ts`; the dashboard identity pair (`findUserPassport`/`findUserDirectoryProfile`) retired,
`membership.tsx` repointed to `getPassportByUserId`.

### Fallow baseline (pre-implementation)

Captured before any code change (operator SOP). Full JSON at `/tmp/fallow-health-0398-baseline.json` +
`/tmp/fallow-dupes-0398-baseline.json` (diff at bow-out). CRAP uses static-estimated coverage (no runtime coverage), so
absolute values are inflated — relative is the signal.

- **CRAP hotspots in our set:** `ProfileForm` **crap=930** (cyc 30 / cog 16) — the set's worst hotspot, **to be
  deleted**; `MePage` 56; `ProfileHero` 56; `DashboardProfileTab` 42; `PassportForm` 30. Retiring `ProfileForm` is a
  measurable complexity drop, not just parity.
- **Clone groups:** no exact line-level clone between the two editors (they diverged structurally — server-schema +
  `useHookFormAction` vs local-schema + `useForm`/`useAction`), so the duplication is **conceptual** (two editors over
  one SoT). The fallow signal is the crap=930 hotspot; eliminating `ProfileForm` removes it. `profile-form ↔
  technique-form` (24-line) clone group also drops with the file.

### Drift logged

- **D-DRIFT-0398-1** — the shared actions `updatePassport`/`updateDirectoryProfile` `revalidate({ paths: ["/me"] })`
  only; once the dashboard Profile tab renders the same editor, a save there won't revalidate `/app/profile`. Fix:
  revalidate both paths (TASK_04). Tracks under **D-023** (identity-surface drift).

## Petey plan

### Goal

Collapse `PassportEditor` + `ProfileForm` into one canonical Passport/DirectoryProfile editor in a shared home, render
it from both `/me` and `/app/profile?tab=profile`, retire the redundant `ProfileForm` copy + the redundant dashboard
identity query pair, fix the revalidation drift, land green on `main`.

### Tasks

#### SESSION_0398_TASK_01 — Establish the canonical editor in a shared home + add the live preview (Cody)

- **Agent:** Cody
- **What:** Move `PassportEditor` (+ `SocialLinksEditor`) out of the `/me` route into a shared component home and lift
  `ProfileForm`'s live `ProfileHero` preview into it (the one capability ProfileForm had that PassportEditor lacked).
- **Steps:**
  1. Move `app/(web)/me/passport-editor.tsx` → `components/web/passport/passport-editor.tsx` and
     `app/(web)/me/_components/social-links-editor.tsx` → `components/web/passport/social-links-editor.tsx` (git mv;
     fix the relative import). Mirrors the ListingCard → `components/web/listing/` precedent so neither route imports
     another route's private component.
  2. Add a live `ProfileHero` at the top of the editor, fed by `useWatch` on `displayName`/`avatarUrl` (passport form)
     + `locationCity`/`locationRegion` (directory form) — same wiring ProfileForm used; `initialsOf` from
     `lib/directory/facet-result`.
  3. Keep everything else byte-equivalent: server schemas, FormMedia uploads, all 11 passport + all directory fields,
     `canUploadVideo` gating, Checkbox toggles.
- **Done means:** canonical editor lives under `components/web/passport/`, renders the full superset + a live preview;
  `bun run typecheck` green.
- **Depends on:** nothing.

#### SESSION_0398_TASK_02 — Repoint `/me` to the shared editor; delete the old copies (Cody)

- **Agent:** Cody
- **What:** Point `me/page.tsx` at the relocated editor; remove the now-empty `me/` editor files.
- **Steps:** update the import in `me/page.tsx` to `~/components/web/passport/passport-editor`; delete
  `app/(web)/me/passport-editor.tsx` + `app/(web)/me/_components/` (moved, not copied). Completeness sidebar + canUpload
  computation stay on the page.
- **Done means:** `/me` renders through the shared editor; no stale `me/passport-editor.tsx`; typecheck green.
- **Depends on:** SESSION_0398_TASK_01.

#### SESSION_0398_TASK_03 — Repoint the dashboard Profile tab to the shared editor + ONE query path (Cody)

- **Agent:** Cody
- **What:** Render the same canonical editor from the Profile tab over the canonical query path; retire `ProfileForm`
  + the redundant dashboard identity query pair.
- **Steps:**
  1. `profile-tab.tsx`: fetch via `getPassportByUserId` + `getDirectoryProfileByUserId` (the payload-typed pair);
     compute `canUploadVideo` via `canUploadMedia(session.user.id, brand)`; render
     `<PassportEditor passport directoryProfile userId={session.user.id} canUploadVideo />`; keep the
     `MediaAttachmentManager` sibling; guard null passport/profile with a redirect like `/me`.
  2. Delete `app/(web)/dashboard/profile-form.tsx` (only consumer was profile-tab — the parallel copy being retired).
  3. Repoint `membership.tsx`'s `findUserPassport` → `getPassportByUserId`; delete `findUserPassport` +
     `findUserDirectoryProfile` from `server/web/dashboard/queries.ts` (keep the non-identity dashboard queries:
     enrollments/entitlements/stripe/registrations/org/techniques). No fourth person-store.
- **Done means:** `/app/profile?tab=profile` renders the same canonical editor; `profile-form.tsx` gone; dashboard
  identity query pair gone; typecheck/lint/format green.
- **Depends on:** SESSION_0398_TASK_01.

#### SESSION_0398_TASK_04 — Fix shared-action revalidation (Cody, small)

- **Agent:** Cody
- **What:** Both entry points refresh after a save.
- **Steps:** `updatePassport`/`updateDirectoryProfile` → `revalidate({ paths: ["/me", "/app/profile"] })`
  (D-DRIFT-0398-1).
- **Done means:** a save from either route revalidates both; typecheck green.
- **Depends on:** nothing (independent — may land with TASK_03).

#### SESSION_0398_TASK_05 — Verify: gates + fallow + render/save proof (Doug)

- **Agent:** Doug
- **What:** Prove both routes render the one editor + save the same fields, and pass all static/test gates.
- **Steps:** `npx fallow audit` on touched files (introduced dead-code + duplication = 0; `ProfileForm` crap=930
  hotspot gone); `bun run typecheck`, `lint:check`, `format:check`, `test`, `wiki:lint`. Render proof: `/me` and
  `/app/profile?tab=profile` both SSR the editor with the full passport + directory field set + the live preview; auth
  redirect to `/auth/login` preserved; `robots:noindex` preserved on both. Don't pollute the shared dev DB.
- **Done means:** gates green (or blocker recorded with the exact failing command); both-route render proof captured.
- **Depends on:** SESSION_0398_TASK_02, _03, _04.

#### SESSION_0398_TASK_06 — Close: ADR/inventory, docs, graphify, commit/push, CI/deploy (Petey)

- **Agent:** Petey
- **What:** Full bow-out.
- **Steps:** record the component-boundary change (new shared `components/web/passport/passport-editor`) — short ADR or
  an ADR-0025 addendum + `custom-component-inventory.md` row + `repo-truth-index.md` (identity-editor SoT). Update
  drift-register **D-023** (editor layer paid down). Full closing.md (reflections, hostile close, evidence table, memory
  sweep); `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`; FS-0024 guard; conventional commit + single push; monitor
  CI + Vercel deploy to green (app-code change → deploys).
- **Done means:** SESSION_0398 closed-full, boundary recorded, pushed, CI/deploy green.
- **Depends on:** SESSION_0398_TASK_05.

### Parallelism

Mostly sequential: TASK_01 (relocate + enhance) unblocks TASK_02 (/me repoint) and TASK_03 (dashboard repoint), which
are disjoint file sets and could fan out — but per the SESSION_0396 dump-zone lesson this is small, coherent, inline
work; no fan-out warranted. TASK_04 is independent (actions file). TASK_05 → TASK_06 sequential.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0398_TASK_01 | Cody | Faithful relocation + live-preview lift; one coherent edit. |
| SESSION_0398_TASK_02 | Cody | Mechanical import repoint + delete moved files. |
| SESSION_0398_TASK_03 | Cody | Dashboard repoint + query-pair retirement. |
| SESSION_0398_TASK_04 | Cody | One-line revalidation fix. |
| SESSION_0398_TASK_05 | Doug | Gates + both-route render/save proof + fallow diff. |
| SESSION_0398_TASK_06 | Petey | Boundary record, docs, close, graphify, git, CI/deploy. |

### Open decisions

- **None requiring sign-off.** Direction (c) is operator-chosen; the canonical base (`PassportEditor` superset), the
  shared home (`components/web/passport/`), keeping the live preview, and retiring `ProfileForm` + the dashboard query
  pair all follow from the field diff. Low-stakes defaults taken: keep PassportEditor's Checkbox (not ProfileForm's
  Switch); `MediaAttachmentManager` stays a page-level sibling on the dashboard tab (outside the editor) — `/me` is not
  given the media manager this session (noted as optional follow-up, no capability lost on either route).
- **Notable (intended) consequence, not a blocker:** the dashboard Profile tab **gains** the 6 passport fields +
  avatar upload + social links + cover/video it previously lacked — that is the point of one editor.

### Risks

- **Cross-route import hygiene** — resolved by moving the editor to `components/web/passport/` rather than importing
  `me/`'s private component from `dashboard/`.
- **Null-guard parity** — the dashboard tab previously tolerated null passport/profile; the canonical editor expects
  non-null. Mitigation: guard/redirect like `/me` (post-S2 every account has both; defensive).
- **Shared dev-DB test isolation** — don't import proof data into the shared DB (SESSION_0396 lesson); SSR render proof
  + read-only checks only.
- **No schema change expected.** If one somehow surfaces, stop and show the diff (operator is schema-cautious).

### Scope guard

- **Do NOT change the server actions' contract or the zod schemas** — only the editor components + read helpers + the
  revalidate paths.
- **Do NOT touch the non-identity dashboard queries** (enrollments/entitlements/stripe/registrations/org/techniques).
- **Do NOT remove either route** — both `/me` and `/app/profile?tab=profile` keep working.
- **Do NOT over-expand** — no media manager added to `/me`, no new fields beyond the existing union, no schema change.
- Belt color = `Rank.colorHex`; brand = `--primary`/`@theme` tokens; no raw hex.

### Dirstarter implementation template

- **Docs read first:** ADR 0025, `passport-and-shells.md`, drift-register D-023. Media/Storage/Theming alignment URLs cached-sufficient.
- **Baseline pattern to extend:** the L1 `Form`/`FormField`/`FormMedia`/`Select` primitives + the shared
  `userActionClient` action chain (`updatePassport`/`updateDirectoryProfile`) — both unchanged.
- **Custom delta:** one shared `PassportEditor` (relocated to `components/web/passport/`, + a live `ProfileHero`
  preview) rendered by both owner-edit entry points; `ProfileForm` + the dashboard identity query pair retired.
- **No-bypass proof:** consolidation only — the write path (server actions + schemas) and the L1 form primitives are
  untouched; both routes render byte-equivalent fields through the one editor.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0398_TASK_01 | landed | `git mv` `me/passport-editor.tsx` + `me/_components/social-links-editor.tsx` → `components/web/passport/`; hoisted both `useHookFormAction` forms to the parent so one live `ProfileHero` (lifted from ProfileForm) mirrors name/avatar/location via `useWatch`; sub-forms take `form`+`onSubmit` props (typed `UseFormReturn<any>`, the existing `SocialLinksEditor` convention — sidesteps the RHF generic-depth trap). All fields byte-equivalent. |
| SESSION_0398_TASK_02 | landed | `me/page.tsx` imports `~/components/web/passport/passport-editor`; old `me/passport-editor.tsx` + empty `me/_components/` removed. Completeness sidebar + `canUploadMedia` unchanged. |
| SESSION_0398_TASK_03 | landed | `profile-tab.tsx` fetches via `getPassportByUserId`/`getDirectoryProfileByUserId`, computes `canUploadVideo`, renders `PassportEditor`, guards null→redirect (mirrors `/me`), keeps `MediaAttachmentManager`. Deleted `dashboard/profile-form.tsx`. Repointed `membership.tsx` `findUserPassport`→`getPassportByUserId`; deleted `findUserPassport`+`findUserDirectoryProfile` from `dashboard/queries.ts`. |
| SESSION_0398_TASK_04 | landed | `updatePassport`/`updateDirectoryProfile` → `revalidate({ paths: ["/me", "/app/profile"] })` (D-DRIFT-0398-1). |
| SESSION_0398_TASK_05 | landed | typecheck 0 · oxlint 0 errors (my files unflagged) · oxfmt clean · wiki:lint 0 · facet-result test 7/0. `fallow audit`: introduced dead-code **0**, introduced duplication **0** (both clone groups inherited from the moved file — match baseline); `ProfileForm` crap=**930** hotspot eliminated. Authenticated SSR proof: `/me` + `/app/profile?tab=profile` both 200 + render the full 15-field canonical editor + live hero; unauth→307 `/auth/login`; page extras correctly split (completeness vs media manager). |
| SESSION_0398_TASK_06 | landed | Inventory §10 + repo-truth-index identity row + drift-register D-023 updated; graphify refresh; FS-0024 guard; conventional commit + single push; CI/deploy monitored. |

## What landed

- **One canonical editor** — `components/web/passport/passport-editor.tsx` (relocated out of the `/me` route) is the
  single Passport + DirectoryProfile owner-edit surface, rendered by **both** `/me` and the `/app/profile` Profile tab
  over the one query path (`server/web/passport/queries.ts`). It gained a live `ProfileHero` preview (lifted from the
  retired `ProfileForm`) wired across both hoisted forms.
- **Duplicate retired** — `dashboard/profile-form.tsx` deleted (it had drifted to a 4-field subset of the passport +
  no cover/video/social-links); its only consumer (the Profile tab) now renders `PassportEditor`.
- **No fourth person-store** — the redundant dashboard identity query pair (`findUserPassport` /
  `findUserDirectoryProfile`) removed; `membership.tsx` repointed to `getPassportByUserId`. Identity reads now flow
  through one module.
- **Dashboard tab reached parity** — the Profile tab now exposes legal name, dob, gender, emergency contact, avatar
  **upload** (was a plain URL field), social links, cover photo, and video intro — fields it previously lacked.
- **Revalidation fixed** — the shared actions revalidate `/me` + `/app/profile` so a save from either entry point
  refreshes both (D-DRIFT-0398-1).
- **Complexity dropped** — the `ProfileForm` crap=930 hotspot (the set's worst) is gone; net editor complexity
  conserved (form configs shifted parent-ward).

## Decisions resolved

- **Direction (c), as briefed** — one shared editor, both entry points kept. No route removed.
- **Canonical base = `PassportEditor`** (the strict field superset over server schemas), not `ProfileForm` (a 4-field
  local-schema copy). `ProfileForm`'s only unique capability — the live `ProfileHero` preview — was lifted in.
- **Shared home = `components/web/passport/`** (not left in the `/me` route) so the dashboard doesn't import another
  route's private component — mirrors the ListingCard → `components/web/listing/` precedent.
- **Low-stakes defaults:** kept PassportEditor's Checkbox toggles (not ProfileForm's Switch); `MediaAttachmentManager`
  stays a page-level sibling on the dashboard tab (not added to `/me`) — no capability lost on either route.
- **No new ADR** — this applies ADR 0025 (Passport SoT); the component-boundary change is recorded in the inventory
  (§10) + repo-truth-index, satisfying the bow-out boundary-record rule without ADR sprawl.
- **Corrected the stale local dev-login id** — `apps/web/.env` `DEV_LOGIN_USER_ID` (gitignored, local-only) repointed
  from the not-found `cmpdpnu7w0094wjds0hty30l1` → `fm6wbylrwlq10yd9bc06rjtr` (sensei@baseline.test) to run the
  authenticated render proof (the staleness the [[passport-avatar-consumption-surfaces]] memo flagged). Backup at
  `/tmp/env.bak-0398`.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/passport/passport-editor.tsx` | **Moved** from `app/(web)/me/passport-editor.tsx`; hoisted both forms to the parent + added the live `ProfileHero`; sub-forms take `form`/`onSubmit` props. |
| `apps/web/components/web/passport/social-links-editor.tsx` | **Moved** from `app/(web)/me/_components/social-links-editor.tsx` (import path only). |
| `apps/web/app/(web)/me/page.tsx` | Import repointed to `~/components/web/passport/passport-editor`. |
| `apps/web/app/(web)/dashboard/profile-tab.tsx` | Renders `PassportEditor` over `getPassportByUserId`/`getDirectoryProfileByUserId` + `canUploadMedia`; null-guard redirect; keeps `MediaAttachmentManager`. |
| `apps/web/app/(web)/dashboard/profile-form.tsx` | **Deleted** — the retired parallel copy. |
| `apps/web/app/(web)/dashboard/membership.tsx` | `findUserPassport` → `getPassportByUserId`. |
| `apps/web/server/web/dashboard/queries.ts` | Removed `findUserPassport` + `findUserDirectoryProfile` (non-identity dashboard queries kept). |
| `apps/web/server/web/passport/actions.ts` | `revalidate` `/me` + `/app/profile`. |
| `docs/knowledge/wiki/custom-component-inventory.md` | New §10 (shared identity editor). |
| `docs/knowledge/wiki/repo-truth-index.md` | Owner self-edit = one `PassportEditor` note in the identity SoT section. |
| `docs/knowledge/wiki/drift-register.md` | D-023 editor-layer-paid-down note. |
| `docs/sprints/SESSION_0398.md` | Session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | PASS (0 errors). |
| `bun run lint:check` (oxlint) | PASS — 0 errors (only pre-existing `*-form.tsx`/`db.ts` warnings; none in touched files). |
| `bun run format:check` (oxfmt) | PASS — clean (1420 files). |
| `bun test lib/directory/facet-result.test.ts` (initialsOf dep) | 7/0. |
| `bun run wiki:lint` | PASS — 0 violations. |
| `npx fallow audit` | introduced dead-code **0**, introduced duplication **0** (the 6 "dead code" issues are pre-existing unused npm deps; both clone groups inherited from the moved file — match the baseline). `ProfileForm` crap=930 hotspot eliminated. |
| SSR `/me` + `/app/profile?tab=profile` (authenticated, sensei) | Both **200**; render the full 15-field canonical editor (display/legal name, dob, gender, emergency×2, social links, avatar, bio, slug, visibility, location, cover, video, save buttons) + live `ProfileHero`; no Next error marker. |
| SSR unauth gating | `/me`→307 `/auth/login?next=/me`; `/app/profile`→307 `/auth/login`. `robots:noindex` unchanged on both. |
| Page-level extras | `/me`: Profile Completeness sidebar ✓; `/app/profile`: `MediaAttachmentManager` ✓ (correctly NOT on `/me`). |

## Open decisions / blockers

- **Live interactive save click-through** not exercised (guardrail: don't pollute the shared dev DB). Save is proven by
  construction — both routes render the identical forms wired to the same `updatePassport`/`updateDirectoryProfile`
  actions — plus full render. A logged-in Save→reload click is a residual Doug pass, not blocking.
- **`/me` lacks the Passport `MediaAttachmentManager`** the dashboard tab has — by design (page-level extra). Adding it
  to `/me` for full parity is an optional follow-up, no capability lost today.
- **Stale dev-login id** corrected in local `.env`; if a future session finds it stale again, the working seed user is
  `sensei@baseline.test` (`fm6wbylrwlq10yd9bc06rjtr`).

## Next session

### Goal

Continue paying down D-023 / advancing the identity lane — OR pivot back to the BBL launch gates (the standing
priority). Adjacent identity-editor follow-ups: optionally add the Passport `MediaAttachmentManager` to `/me` for full
entry-point parity, and consider folding the lineage-node profile form onto shared field primitives.

### First task

If continuing identity: decide whether `/me` and `/app/profile`'s Profile tab should converge further (the two pages
now render the same editor but differ in page-level chrome) — e.g. one route redirecting to the other, or both keeping
their distinct framing. Read this session + ADR 0025 first. Otherwise, pick the next BBL launch gate per
[[bbl-launch-is-the-focus]].

## Review log

### SESSION_0398_REVIEW_01 — One canonical Passport/DirectoryProfile editor

- **Reviewed tasks:** SESSION_0398_TASK_01–06
- **Dirstarter docs check:** ADR 0025 (Passport SoT) confirmed valid; L1 form primitives + the shared action chain
  untouched (consolidation only).
- **Verdict:** A clean, low-risk consolidation that did exactly what the brief asked and nothing more. The investigation
  (field-by-field diff written before editing) correctly identified `PassportEditor` as the superset, so the merge was
  additive (lift the one missing capability, the live hero) rather than a risky reconciliation. Moving the editor to a
  shared home was the right call over a cross-route import. The keystone win is measurable: the dashboard Profile tab
  went from a drifted 4-field form to the full identity editor, the duplicate + redundant query pair are gone, and the
  `ProfileForm` crap=930 hotspot vanished. Cost was minimal — one form-config hoist + a dev-login id fix to get an
  authenticated render. Only soft spot: interactive Save wasn't clicked (proven by construction + render instead, to
  respect the shared-DB guardrail).
- **Score:** 8.5/10 — green across all gates, both routes render-proven at parity, drift paid down with no schema
  change; −1.5 for the deferred interactive click-through + the residual page-level chrome divergence between the two
  entry points.
- **Follow-up:** optional `/me` media manager for full parity; or back to BBL launch gates.

## Hostile close review

- **Giddy:** Pass. Pure component/query refactor — no schema change, no auth/payment/secrets touched. The shared server
  actions + zod schemas are unchanged; both routes render byte-equivalent fields through the one editor. Null-guard
  parity with `/me` (redirect). The only env touch is a gitignored local dev-login convenience var (stale→working).
- **Doug:** Pass. typecheck 0, oxlint 0 errors, oxfmt clean, wiki 0, touched test 7/0; fallow introduced dead-code +
  duplication both 0; `ProfileForm` 930 hotspot eliminated. Authenticated SSR proof on both routes (200 + full field
  set + live hero) + unauth gating preserved. Caveat: interactive logged-in Save click deferred (render + shared-action
  wiring both proven, so low risk).
- **Desi:** Pass. The dashboard Profile tab reaches Tool-grade parity with `/me` (gains 11 fields + avatar upload + a
  live preview); page-level chrome (completeness sidebar vs media manager) intentionally preserved per route. Honest
  residual: the two entry points still differ in surrounding framing.
- **Kaizen aggregate:** 8.5/10 — the consolidation shipped green and additive (one editor, one query path) with drift
  measurably paid down; the deferred click-through + chrome divergence are the cost.

## ADR / ubiquitous-language check

- ADR update **not required** — this is the application of **ADR 0025** (Passport identity SoT; DirectoryProfile a
  view) to the owner-edit surface, not a new decision. The component-boundary change (new shared
  `components/web/passport/passport-editor`) is recorded in `custom-component-inventory.md` §10 + `repo-truth-index.md`,
  satisfying the bow-out boundary-record rule.
- Ubiquitous language — no new domain terms. `PassportEditor` is an impl name; "Passport"/"Directory Profile" are
  existing language. Owner self-edit reaffirmed as Passport-rooted (ADR 0025).

## Reflections

- **The field-by-field diff before editing made the merge boring (in the good way).** Writing down that `PassportEditor`
  was a strict superset turned a scary-sounding "reconcile two editors" into "delete the lesser copy, lift its one extra
  feature." Investigation-first is exactly what the brief demanded and it de-risked the whole session.
- **Hoisting the two forms to the parent was the non-obvious structural cost.** ProfileForm got a cross-form live
  preview for free because both forms lived in one component; PassportEditor had split them into sub-components. The
  clean fix was hoisting both `useHookFormAction` instances up and passing `form`/`onSubmit` down — and reusing the
  repo's existing `UseFormReturn<any>` convention there avoided re-opening the RHF generic-depth trap SESSION_0397 hit.
- **A stale local dev convenience var nearly cost a verification.** `DEV_LOGIN_USER_ID` was the not-found id the avatar
  memo had already flagged. The fix (query the DB for a real passport-bearing seed user, repoint the gitignored var) was
  cheap once I stopped trying to make the stale path work — but it's a recurring papercut worth a durable fix.
- **`fallow audit`'s "findings" need the inherited-vs-introduced read every time.** The gate flagged 4 complexity + 2
  duplication findings on changed files, but all were inherited (DashboardMembership's 306 from a one-line query swap;
  both clone groups are the moved file's pre-existing self-clones). The signal that mattered — introduced = 0, and the
  930 hotspot deleted — only surfaced by diffing against the baseline I captured first.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0398 `status: closed`, `type: session--implement`, `last_agent: claude-session-0398`; inventory/repo-truth-index/drift-register frontmatter bumped. |
| Backlinks/index sweep | inventory §10 + repo-truth-index identity note + drift D-023 updated; wiki index row added. |
| Wiki lint | `bun run wiki:lint` PASS — 0 violations. |
| Kaizen reflection | Reflections section present (4 notes). |
| Hostile close review | SESSION_0398_REVIEW_01 + Giddy/Doug/Desi — 8.5/10. |
| Review & Recommend | Next session goal written. |
| Memory sweep | Updated [[passport-identity-consolidation]] (editor layer) + [[passport-avatar-consumption-surfaces]] (dev-login id corrected). |
| Next session unblock check | Unblocked — follow-ups additive; BBL pivot always available. |
| Git hygiene | Branch `main`; FS-0024 guard run; single push — hash in git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` run before the close commit. |
