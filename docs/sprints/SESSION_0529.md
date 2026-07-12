---
title: "SESSION 0529 — build Slice 3B (technique authoring UI) + 3C (staff promote) on the ADR-0046 foundation"
slug: session-0529
type: session--implement
status: closed
created: 2026-07-11
updated: 2026-07-12
last_agent: claude-session-0529
sprint: S53
pairs_with:
  - docs/sprints/SESSION_0528.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0529 — build Slice 3B (technique authoring UI) + 3C (staff promote) on the ADR-0046 foundation

## Date

2026-07-11 → 2026-07-12 (spanned a session-limit reset)

## Operator

Brian + claude-session-0529 (Petey orchestrating on Opus; Cody build on **Fable** — model experiment)

## Goal

Build the two pending slices of the technique/media CRUD epic on the SESSION_0528 Slice-3A server
foundation (ADR 0046). **Slice 3B — member-facing technique authoring UI:** an "Add technique" plus-card
(visible only to `canCreateTechniqueForUser`) on the `/app/profile` Techniques tab → a bottom magnetic
`sheet.tsx` composing `TechniqueForm` + the adapted `content-media-panel` dnd sequencing rail, with the
Slice-2 per-clip premium toggle + **URL-paste video** (R2 uploader stays admin-only). Plus the three Doug
3B server enablers (un-gated authored watch read; clean P2002 message; open `media-authorization` for the
authored-technique author). **Slice 3C — staff `isFeatured` promote-to-library action + surfacing.**
Hold at the push gate. FI-001 / Brian Truelson email STAYS PARKED — no send, no grant.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0528.md` (its `Next session` block is this session's task
  context) + memory `technique-authoring-ownership-adr-0046`.
- Carryover: SESSION_0528 landed **Slice 3A** (server foundation — schema + 2 migrations + gate + query
  audit + adversarial tests; Doug 9.0) plus the Phase-1 quality pass, all pushed to `origin/main`
  (`552ad883`). 3B (authoring UI) + 3C (promote) were carried to a fresh session per the operator's
  design-heavy / fresh-chat rule. This session builds them.

### Branch and worktree

- Branch: `session-0529-slice3bc`
- Worktree: `/Users/brianscott/dev/ronin-0529` (created off `origin/main`; bootstrapped — `.env` copied,
  `bun install`, Prisma client generated).
- Status at bow-in: clean fresh worktree off `origin/main`.
- Current HEAD at bow-in: `552ad883`.

### Concurrency guard (RESOLVED — no live lanes)

- `git worktree list` shows only the canonical checkout; no `../ronin-NNNN` sibling worktrees are
  registered; highest remote session branch is `session-0515`. Highest SESSION file is 0528 (landed to
  `main`). **No live lanes to collide with**; 0529 is the next free number. 3B/3C touch technique/profile
  files that are all at `origin/main` HEAD.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content/Media (technique authoring + media attach), Prisma (read queries only — NO new migration; 3A added the columns), Media uploader (reuse; R2 admin-only). |
| Extension or replacement | Extension — member-facing authoring UI on the 3A server foundation; reuses `sheet.tsx`, `content-media-panel`, `TechniqueForm`, `MediaAttachmentManager`, `setWebMediaPremium`. |
| Why justified | 3A shipped the ownership model + gate but NO user-facing surface; 3B is the surface that lets Elite/staff members actually author (BBL roster can't author via the org-canonical path — the 3A finding). |
| Risk if bypassed | The authored-ownership foundation ships dead (no way to create an authored technique); the no-leak premium invariant must be preserved through the new authoring surface. |

Live docs checked during planning: SESSION_0528, ADR 0046, memory `technique-authoring-ownership-adr-0046`,
`profile-media-freemium-model-0525`, `admin-collection-one-surface-law`, `image-inputs-are-uploaders`.

## Petey plan

### Goal

Ship the technique authoring UI (3B) + staff promote (3C) on the ADR-0046 foundation, behavior-safe and
no-leak-preserving, and hold at the push gate for the operator's go.

### Tasks

#### SESSION_0529_TASK_01 — Slice 3B: authored create flow (plus-card → sheet → create + media)

- **Agent:** Cody (Fable) build → Doug verify.
- **What:** Member-facing authored technique creation, end-to-end.
- **Steps:**
  1. **Server enablers (Doug 3B gotchas — hard constraints):**
     (a) New un-gated authored watch read — `findAuthoredTechnique({ authorPassportId, slug })` / by-id in
     `server/web/techniques/queries.ts` that does NOT apply `TECHNIQUE_DISCOVERY_WHERE` (the discovery
     filter excludes the very profile-only rows a member's profile must show). Keeps the same
     `techniqueOnePayload` + per-attachment gate. (b) Map P2002 on the authored-slug partial unique index to
     a clean "you already have a technique with this name/slug" message — locally in the create path
     (try/catch → `TECHNIQUE_ERROR`), NOT by loosening the generic `lib/safe-actions.ts` mapping. (c) Open
     `media-authorization.ts` `case "technique"` so a null-org authored technique authorizes for its
     `authorPassportId` owner (select `authorPassportId`, compare to caller's passport) — currently fails
     closed at line 126.
  2. **Plus-card + sheet UI:** an "Add technique" plus-card on the `/app/profile` Techniques tab
     (`DashboardTechniquesTab` / `techniques-table.tsx`), rendered only when `canCreateTechniqueForUser`
     (resolved server-side, passed as a bool). Clicking opens a bottom `sheet.tsx` composing `TechniqueForm`
     (authored mode → `authored: true`, no `organizationId`) + the adapted `content-media-panel` dnd rail
     for ordering clips + the Slice-2 per-clip Premium/Free toggle. **URL-paste video** input in the sheet;
     the R2 uploader stays admin-only (reuse the existing gate — do not add a member R2 path).
  3. **Authored watch route:** the authored technique must be viewable via the un-gated read (so the author
     can see their own profile-only technique). Surface the author's own authored techniques on the
     dashboard Techniques list (`findUserTechniques` — confirm it includes authored rows via
     `authorPassportId`).
  4. **MAB entry point (operator directive, mid-session):** "Add technique" as a 5th fan action on the
     radial MAB (`components/web/nav/mab.tsx`) for any `canCreateTechniqueForUser` holder. Broaden the
     `mobile-shell.tsx` mount gate from admin-only to `isAdmin ∨ technique` WITHOUT broadening the four
     existing admin actions; count-scaled fan radius (76 → ~124 at count=5; the 90° quadrant cap from
     SESSION_0501 P0 is untouched — at 22.5° steps the old radius would overlap 44px buttons); deep-link
     onSelect to the Techniques tab with the sheet auto-open; `action_technique` i18n key.
  5. **Public profile surfacing (operator directive, mid-session — reverses the bow-in deferral):**
     authored techniques appear on the PUBLIC `/directory/[slug]` profile in this slice. The authored
     watch route becomes profile-scoped (`/directory/[slug]/techniques/[techniqueSlug]`, published-only,
     per-clip freemium gating identical to the canonical watch page); `loadProfileViewBySlug` adds a
     4th "Curriculum" `ProfileMediaItem[]` rail from the passport's published authored Technique rows
     (locked = no free clip ∧ viewer unentitled; item carries poster + internal href, never a `url`);
     rendered as another self-hiding `HighlightRail` via `ProfileMediaCard`. Cross-passport slug
     resolution must 404 (author-keying is the security boundary).
- **Done means:** an Elite/staff member can create an authored technique + attach a URL-paste video with a
  premium toggle from the sheet, and view it via the un-gated watch read; gates green; no-leak invariant
  preserved (locked premium tile has no `url`); live-verified behind auth on a reversible fixture.
- **Depends on:** nothing (3A foundation is on `main`).

#### SESSION_0529_TASK_02 — Slice 3C: staff `isFeatured` promote-to-library

- **Agent:** Cody (Fable) build → Doug verify.
- **What:** A staff-only action to flip `Technique.isFeatured` (promote an authored profile-only technique
  into the canonical browse, attribution preserved) + surface the control.
- **Steps:** staff-gated (`can(techniques.manage)`) server action `setTechniqueFeatured(id, boolean)`;
  audited; revalidate `techniques`; a surfacing control on the appropriate admin/staff technique surface.
  Discovery filter already honors `isFeatured` (3A) — no query change needed.
- **Done means:** a staff user can promote an authored technique and it appears in the canonical browse
  (`searchTechniques`/`getTechniqueRails`); non-staff cannot; audited; gates green.
- **Depends on:** SESSION_0529_TASK_01 (conceptually — authored techniques must exist to promote).

### Parallelism

Single coherent lane — no fan-out. TASK_01 (3B) first; TASK_02 (3C) after 3B verifies. Cody builds in the
`ronin-0529` worktree; Doug verifies each before the next. No new migration (3A owns the schema).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0529_TASK_01 | Cody (Fable) → Doug | Coherent authoring-UI build on a known foundation + 3 server enablers |
| SESSION_0529_TASK_02 | Cody (Fable) → Doug | Small staff action; sequenced after 3B |

### Open decisions

- **Derived placement (Petey call, surfaced to operator, low-risk):** plus-card lives on the `/app/profile`
  Techniques tab (since `/me` is retired → redirects to `/app/profile`, and `PublicProfile` is the public
  read with no owner arm).
- ~~Public `/directory/[slug]` surfacing deferred~~ — **REVERSED by operator mid-session**: folded into 3B
  and BUILT (scope note, not a deferral; residual observation ledgered → FI-028). Curriculum rail keys off authored
  `Technique` rows; the legacy "Technique Videos" rail keys off passport `MediaAttachment`s — different
  sources per ADR 0046; the double-listing observation is ledgered inside FI-028 (authoring warning).
- Hold Phase results at the push gate for operator "go".

### Push-gate rulings (operator, 2026-07-12)

- **Poster policy ACCEPTED** (free-clips-only rail posters; entitled viewers of all-premium techniques see
  placeholder cards, watch page plays).
- **Suppression EXTENDED** to watch-page locked tiles + browse rails (`dd76d961`).
- Petey rulings ratified: R2 file-upload gated server-side (author media MANAGEMENT stays open incl.
  lapsed-Elite, consistent with the 3A author-edit model); community FAB hides when the MAB mounts.

### Follow-up grill (operator, 2026-07-12 — /grill-with-docs, 7 questions resolved; every item ledgered: FI-027, FI-028, WL-P2-49, WL-P2-50, WL-P2-51, D-043, TFF-011)

1. **T1 — Techniques AdminCollection (next-session candidate #1):** `/app/techniques` index data-table as a
   SIBLING collection of `/app/tools` (the pattern, not a mount underneath it): name · author · school ·
   featured · published · premium-mix; default **"Pending promotion"** chip (authored ∧ published ∧
   ¬featured); `can(techniques.manage)`-gated; row → existing `[id]` editor. Glossary sharpening: the
   AdminCollection LAW is the pattern; `/app/tools` is its reference implementation (memory amended).
2. **T2 — Community-posts freemium slice:** read = everyone, premium posts visible-but-locked (no-leak
   pattern); **create = Premium ∨ Elite ∨ RBAC ∨ staff/admin** (`canCreateCommunityPostForUser` mirrors the
   technique gate; free members LOSE create — deliberate participation ladder: Premium = community posting,
   Elite = technique authoring); MAB "post" action rides the gate; free-member composer → upgrade CTA;
   includes the double-listing/premium-divergence authoring warning (Q3 = warning only, no read-layer dedupe).
3. **T3 — Shared-seams cleanup session (operator override: extract NOW, one 3-item lane):** shared
   sortable-media-grid extraction + adoption survey (content panel, technique manager, curriculum-items
   editor, event galleries) · `findActiveStaffMembership` helper (~5 predicate copies) · safe-actions P2002
   adapter-shape fix (port the live-proven parsing repo-wide).
4. **T4:** `/lineage` BottomNav hydration warning fix (small).
5. **Ledger rows:** per-passport curriculum cache tag (trigger: >500 techniques or observed churn);
   stripe-webhook load-sensitive flake (test-stability).
6. Q4 note: operator overrode the rule-of-three recommendation — survey shows n≈4 candidate consumers, so
   extraction is justified now.

### Risks

- **No-leak invariant** is a hard constraint through the new authoring surface: the per-clip premium toggle
  + URL-paste path must keep the locked-tile-has-no-`url` guarantee. Re-run the adversarial no-leak tests +
  anon runtime probe after any gate-touching change.
- The un-gated authored watch read MUST stay keyed to the author (`authorPassportId, slug` / id) — it must
  not become a second public discovery path that bypasses the ADR-D4 `isFeatured` gate for canonical browse.

### Scope guard

- 3B/3C only — no re-grill (ADR 0046 D1–D5 resolved in SESSION_0528); no schema migration (3A owns it).
- R2 uploader stays admin-only; members get URL-paste video only.
- Hand-authored migrations only IF one is unexpectedly needed; never `migrate-dev` on the shared local DB.
- Do NOT touch sibling-lane files (none live, but hold if any surface).
- FI-001 / Brian Truelson email PARKED — no `--send`, no `--grant`.
- One push at close, on the operator's explicit word.

## Cody pre-flight

### Pre-flight: Slice 3B authored create flow

#### 1. Existing component scan

- Reuse (Petey-confirmed): `components/common/sheet.tsx` (bottom sheet), `app/app/content/_components/content-media-panel.tsx` (dnd rail), `app/(web)/dashboard/technique-form.tsx` (form; already imports `createTechnique`/`updateTechnique`), `components/web/media/media-attachment-manager.tsx` (per-clip premium toggle + `MediaAttachmentCard`), `server/web/media/apply-media.ts` (`setWebMediaPremium`), `server/web/techniques/{crud-actions,apply-technique,permissions,queries,crud-schemas}.ts` (3A).
- Gate: `canCreateTechniqueForUser(user, brand, db)` already exists (permissions.ts).

#### 2. L1 template scan

- Media input = ONE uploader family; members get URL-paste (Media already stores arbitrary `url` + `type: YOUTUBE`), R2 uploader admin-only. Do not invent a 5th authz or a second uploader.

#### 3. Composition decision

- Compose existing primitives (`sheet`, `TechniqueForm`, `content-media-panel`, `MediaAttachmentManager`); add only an authored-mode prop path + the plus-card + the un-gated authored watch read.

#### 4. Lane docs loaded

- Prior SESSION next-session read: yes (SESSION_0528). ADR: 0046. Memory: `technique-authoring-ownership-adr-0046`, `profile-media-freemium-model-0525`.

#### 5. Dev environment confirmed

- Dev server: worktree `cd apps/web && npx next dev --turbo` (preview_start can't serve a worktree — Browser pane reads :3000 via Bash-run dev). Working dir: `/Users/brianscott/dev/ronin-0529`. Brand/host: local BBL.

#### 6. FAILED_STEPS check

- Prior failures: workflow-over-dirty-tree (worktree-isolated — OK); migrate-dev-on-shared-DB (no migration this session); no-leak payload invariant (preserve).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0529_TASK_01 | landed (review fixes applied) | Slice 3B `0564da0c` (Cody/Fable) + review-fix pass `b8cb129d` (R2 file-upload capability gate on technique targets; locked-poster suppression BOTH rails + free-clips-only poster derivation; `shouldMountMab` shared predicate + community-FAB de-collision; ACTIVE-staff gates; full-set reorder guard; adapter-shape P2002 predicate; cached `canCreateTechniqueForUser`). Giddy 8.9 · Doug 8.7 · final gates 1363/1363, build PASS, e2e 4/4, live smoke 17/17. |
| SESSION_0529_TASK_02 | landed | Slice 3C `32beb89d`: `applySetTechniqueFeatured` (`can(techniques.manage)` only, audited) + `setTechniqueFeatured` action + Switch control on `/app/techniques/[id]` (staff may open any technique incl. authored org-null); Elite-author-self-promote rejected in tests; ADR 0046 D4 authored-watch URL contract one-liner. Doug delta 9.3 — GO. Flag: NO admin techniques data-table under /app/tools — AdminCollection ticket. |

## What landed

**Slices 3B + 3C of the technique/media CRUD epic (ADR 0046), built by Cody on Fable (model experiment),
verified by Giddy + Doug (Fable). 4 commits on `session-0529-slice3bc`, HELD at the push gate.**

1. **Slice 3B — member authoring UI (`0564da0c`):** the three Doug 3B server enablers
   (`findAuthoredTechnique`/`findAuthoredCurriculum` un-gated author-keyed reads; local P2002 →
   `AUTHORED_SLUG_TAKEN`; media-authorization opened for the author) + plus-card → bottom `Drawer` sheet
   (2-phase details→media) on the `/app/profile` Techniques tab gated by `canCreateTechniqueForUser` +
   URL-paste video (YouTube-only, server-enforced) + per-clip premium toggle + dnd reorder + **MAB 5th
   `technique` action** (mount gate broadened admin ∨ capability; count-scaled fan radius; deep-link
   auto-open) + **public profile Curriculum rail** + profile-scoped authored watch route
   `/directory/[slug]/techniques/[techniqueSlug]`.
2. **Review-fix pass (`b8cb129d`):** R2 file-upload capability gate on technique targets (`uploadWebMedia`
   never consulted `canUploadMediaForUser` — Doug P2-1); locked-poster suppression BOTH profile rails +
   free-clips-only poster derivation; `shouldMountMab` shared predicate + community-FAB de-collision;
   ACTIVE-staff gates; full-set reorder guard; P2002 predicate rewritten against the LIVE pg
   driver-adapter shape; `canCreateTechniqueForUser` React-`cache()`d entitlement-first.
3. **Slice 3C — staff promote (`32beb89d`):** `applySetTechniqueFeatured` (`can(techniques.manage)` only,
   before/after audit) + `setTechniqueFeatured` action + Switch control on `/app/techniques/[id]` (staff
   may open any technique incl. authored org-null); ADR 0046 D4 authored-watch URL contract one-liner.
4. **Premium-poster suppression extension (`dd76d961`, operator-directed):** locked watch tiles ⇒
   `thumbnailUrl: null` TYPE-encoded; browse rails derive posters from the first FREE clip only; full
   surface sweep (grid/search/graph/discipline payloads verified clean).
5. **Desi P1 fix (`9f95aaf4`):** authored create defaults `isPublished: true` ("Show on my public
   profile"); draft rows render unlinked (applies to org drafts too — same 404 class). The elite e2e now
   structurally proves it (asserts the created row renders as a LINK — only true when published).

## Decisions resolved

- **MAB: add-as-5th, not replace (operator + Petey analysis, 2026-07-11).** Operator directed an "Add
  technique" MAB entry for Elite/admin/RBAC users — either a 5th mini button or replacing an eligible
  candidate. Petey candidate analysis: none of the four existing actions (claim / post / upload /
  promotion) is dead — claim is the north-star loop, post/upload are the light-action sheets; the
  nominee IF a strict 4-cap were wanted was `promotion` (most desk-shaped, nav-only). Resolution: add
  technique as a 5th action with a count-scaled fan radius; no capability removed. Non-admin Elite users
  see a 1-action fan (their `can()` gates are false), so the 5-item geometry only affects admins.

## Files touched

4 commits on `session-0529-slice3bc` (headline files; full tables in the Cody deliverables logged above):

| Commit | Scope |
| --- | --- |
| `0564da0c` (29 files) | 3B: `server/web/techniques/{queries,apply-technique,technique-errors}.ts` (authored reads + P2002 + errors) · `server/web/media/{media-authorization,apply-media,actions,media-schemas,media-errors,queries}.ts` (author authz + URL-attach + reorder) · `components/web/media/media-attachment-manager.tsx` (knobs) · `app/(web)/dashboard/{authored-technique-create.tsx NEW,technique-form,techniques-tab,techniques-table}.tsx` · `app/(web)/directory/[slug]/techniques/[techniqueSlug]/page.tsx` NEW · `server/web/directory/{profile-media,profile-view}.ts` + highlights section (Curriculum rail) · `components/web/nav/{mab,mobile-shell}.tsx` + `messages/en/mobileShell.json` (MAB) · `server/web/dashboard/queries.ts` · tests + e2e |
| `b8cb129d` (16 files) | Review fixes: R2 capability gate · locked-poster suppression + free-clips-only (profile rails) · `components/web/nav/mab-mount.ts` NEW (`shouldMountMab`) + community-feed FAB gate + `app/(web)/posts/page.tsx` · ACTIVE-staff gates · full-set reorder · adapter-shape P2002 · cached `canCreateTechniqueForUser` |
| `32beb89d` (9 files) | 3C: `applySetTechniqueFeatured` + `setTechniqueFeatured` + own schema · `app/app/techniques/[id]/technique-feature-toggle.tsx` NEW + `[id]/page.tsx` staff-open + ACTIVE hardening · ADR 0046 D4 URL contract · tests |
| `dd76d961` (5 files) | Poster-suppression extension: `technique-media-gate.ts` (locked ⇒ `thumbnailUrl: null` TYPE-encoded) · `payloads.ts` + `queries.ts` (free-clips-only rail posters) · tests |
| `9f95aaf4` (3 files) | Desi P1: `technique-form.tsx` (authored default-publish + relabel) · `techniques-tab.tsx` + `techniques-table.tsx` (draft rows unlinked, `href: string \| null`) — typecheck/lint/format PASS, elite e2e 1/1 (link assertion = the proof), build PASS |
| Close (uncommitted → close commit) | `docs/sprints/SESSION_0529.md` · `wiring-ledger` (+WL-P2-49/50/51) · `drift-register` (+D-043) · `POST_LAUNCH_SOT` (+FI-027/028) · `test-fail-fix-ledger` (+TFF-011) · `wiki/index.md` (0529+0528 rows) · `custom-component-inventory.md` (technique-authoring section) · memory files |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` · `lint:check` · `format:check` | PASS at HEAD (Cody final + Doug independent) |
| `bun run test` (full, `--parallel=1`) | **1366/1366** at `dd76d961` (1363 at `32beb89d` Doug-independent; one pre-existing stripe flake observed once → TFF-011) |
| `bun run build` | PASS ×3 (Cody `32beb89d` + `dd76d961`; Doug independent at `32beb89d`) — prod-deploy gate green |
| e2e `mobile-shell.spec.ts` (chromium, worktree server) | 4/4 — admin 5-action fan geometry (in-viewport + ≥44px chords), Elite 1-action fan + FULL authored round-trip (create → URL-paste → premium flip → row in list), non-admin no-MAB, `/posts` single-FAB |
| Anon no-leak probes (live) | 5/5 (Doug 3B) + 17/17 (fix+3C) + 20/20 (poster extension): profile + watch + rails ship ZERO premium YouTube-id bytes; locked payload has no `url`; canonical 404 (D4), cross-profile 404, draft 404; entitled-viewer placeholder-card + playable watch confirmed |
| Live D4 round-trip (Doug) | unfeatured authored slug → canonical watch 404; `isFeatured=true` → 200; reverted |
| P2002 adapter shape (Doug, live) | real duplicate insert under `@prisma/adapter-pg`: `meta.target` ABSENT; Cody's predicate fires on the real shape |
| Fixtures | every probe/e2e fixture reverted with recount proofs — 0 orphans, shared dev DB clean |

## Open decisions / blockers

- **PUSH AWAITING OPERATOR "GO"** — branch `session-0529-slice3bc` (4 commits + close commit) is push-safe
  on Doug's evidence; an apps/web push fires CI + BBL prod deploy (local build green ×3).
- FI-001 (Brian Truelson) — STAYS PARKED (operator directive). The bow-out gate-runner flagged it as a
  cross-off candidate; dismissed — it is not resolved, it is parked. No send, no grant.
- Desi hostile-close UX review — dispatched at close (results in Hostile close review section).
- Wiki index has a pre-existing session-row gap — **0524–0527** (+ scattered older: 0503, 0506–0508, 0517)
  — FS-0019 class; 0529+0528 rows added this close (high-confidence only, no thin-knowledge backfill).
  Small backfill lane flagged.

## Next session

### Goal

**FI-027 — Techniques AdminCollection** (grill Q1, operator-ratified next-session candidate #1): build
`/app/techniques` as an index data-table SIBLING of `/app/tools` (the AdminCollection pattern) with the
"Pending promotion" default chip — completing the 3C promote loop (staff currently have the Feature toggle
but no discovery surface).

### First task

Read FI-027 in `POST_LAUNCH_SOT.md` + the AdminCollection pattern source (`app/app/tools/page.tsx` +
`_components/`) + ADR 0045 (AdminCollection conformance). Build `app/app/techniques/page.tsx`: server-driven
data-table (name · author Passport · school org · featured · published · premium-mix), default filter chip
`authored ∧ published ∧ ¬featured`, `can(techniques.manage)`-gated, row → the existing `[id]` editor (which
already carries the 3C Feature toggle). Alternative picks if the operator redirects: FI-028
(community-posts freemium slice — needs its own grill first) or the WL-P2-49 + D-043 shared-seams cleanup
lane. Board top (`FI-001`, `G-002`, `FI-006`) unchanged — FI-001 remains operator-gated.

## Review log

### SESSION_0529_REVIEW_01 — Giddy architecture review of Slice 3B (`0564da0c`)

- **Reviewed tasks:** SESSION_0529_TASK_01.
- **Verdict:** PASS all 7 axes — **8.9/10, near-gold, no cap**. Seams exemplary (hermetic apply-* cores
  + audit rows + tested ownership guards; local P2002 duck-type protects the shared mapping and is
  adapter/test-safe; `findAuthoredTechnique` provably NOT a discovery bypass — ADR 0046 D4 intact; DTO
  no-leak-by-shape preserved; MAB radius parameterized with stated chord math, ≤4 byte-preserved).
  Drawer-not-sheet confirmed correct L1 read (brief's file pointer was wrong; `mab-upload-sheet`
  precedent). All 3 Doug 3B gotchas honored with tests.
- **Fix NOW (pre-ship):** add `status: "ACTIVE"` to the `orgStaff` membership query in
  `techniques-tab.tsx` AND the same pre-existing gate in `/app/techniques/new/page.tsx` — new code must
  not copy the unhardened predicate (drifts from this lane's own 0528 Doug-P3 hardening).
- **Named follow-up tickets (not blockers — all ledgered → WL-P2-49/50):** (2) `findActiveStaffMembership`
  helper — the OWNER/INSTRUCTOR predicate now exists in ~5 shapes; move the tab's inline db queries into
  `dashboard/queries.ts` → **WL-P2-49**; (3) extract the shared sortable-media-grid unit (manager ↔
  `content-media-panel` dnd near-copy); manager split-trigger = 4th knob or knob×knob conditional →
  **WL-P2-49**; (4) perf: `cache()` wrap in `canCreateTechniqueForUser` → APPLIED same session
  (`b8cb129d`); (5) cache: per-passport curriculum tag only-if-volume → **WL-P2-50**.
- **ADR check:** no ADR 0046 amendment required; RECOMMENDED one-liner at 3C — name
  `/directory/[slug]/techniques/[techniqueSlug]` as the authored watch URL contract in D4's
  consequences so 3C can't invent a second route.

### SESSION_0529_REVIEW_02 — Doug release-readiness verification of Slice 3B (`0564da0c`)

- **Reviewed tasks:** SESSION_0529_TASK_01.
- **Verdict:** **8.7/10, no hard cap — merge-ready on its own terms**; three P2s to land before 3C
  exposes the edges to paid members.
- **Independent gates:** typecheck/lint:check/format:check PASS · `bun run test` 1347/1348 + 1
  pre-existing stripe-webhook concurrency flake (passes isolated; not diff-related) · **`bun run build`
  PASS** (builder had skipped; prod-deploy gate green) · e2e 4/4 · anon no-leak probes 5/5 (profile +
  watch HTML clean; locked payload has no `url`; canonical 404; cross-profile 404; draft 404) ·
  fixture teardown proven 0 orphans.
- **P2 findings:** (1) `uploadWebMedia` is `userActionClient` + `authorizeMediaTarget` ONLY — it never
  consults `canUploadMediaForUser`, so 3B's author branch opens member R2 file-upload server-side
  (UI-hidden only); (2) locked premium curriculum card ships the YouTube-id-bearing poster URL
  (`img.youtube.com/vi/<id>`) — id → watch URL reconstructs the content for unlisted premium clips;
  pattern PRE-EXISTS on the passport reels rail (ledger-worthy); (3) twin-FAB 100% overlap: Elite
  non-admin on `/posts` mobile has the community create-post FAB at identical coordinates under the
  MAB (z-30 under z-50 — already unreachable today).
- **P3:** stripe-webhook test flake (pre-existing); MobileShell `canCreateTechniqueForUser` effectively
  uncached (`cacheLife("seconds")` entitlement leg + uncached membership query) per signed-in request;
  `applyWebMediaReorder` accepts a partial subset → duplicate sortOrders possible server-side; P2002
  catch doesn't inspect `meta.target` (only the authored index can fire today — tighten for tomorrow);
  pre-existing `/lineage` hydration mismatch (dev overlay).
- **Adjudications:** R2 = ALLOWED today → P2 policy gap (fix seam: gate the author path of the web-media
  FILE upload; URL-paste untouched). Double-listing = confirmed live, P3 + product call (same clip can be
  free reel in one rail and locked card in the other via per-attachment `isPremium`). e2e CI-safe
  (`test.skip(CI)`). Lapsed-Elite author keeps media rights on own rows — flagged for Petey.

### SESSION_0529_REVIEW_03 — Doug delta verification of the fix pass + Slice 3C (`b8cb129d` + `32beb89d`)

- **Reviewed tasks:** SESSION_0529_TASK_01 (fixes), SESSION_0529_TASK_02.
- **Verdict:** **9.3/10, no cap — GO for the push gate.** All three prior P2s verified FIXED with
  independent live evidence; 3C adversarially tested and live-proven; gates independently green at HEAD
  (typecheck · 1363/1363 tests · `bun run build` PASS · e2e 4/4).
- **Key evidence:** R2 gate technique-scoped, avatar/belt-journey paths proven unaffected (default-false
  param, only 3 callers); 3C live D4 round-trip (unfeatured→404, featured→200, reverted); `[id]` page NOT
  loosened (anon 307→login; Elite non-staff on foreign authored row 404); anon + ENTITLED poster probes
  0 premium-id bytes (free-only poster rule viewer-independent); **P2002 adapter-shape claim verified
  live** (`meta.target` ABSENT under `@prisma/adapter-pg`; constraint name only in
  `driverAdapterError.cause.originalMessage` — Cody's predicate fires on the real shape); commit split
  clean (16-file fix commit / 9-file 3C commit; the one shared file splits cleanly).
- **New P3 (pre-existing, surfaced by probe):** `lib/safe-actions.ts:49-51` generic P2002 handler reads
  `e.meta.target[0]` which is ABSENT under the live pg adapter — every OTHER action's P2002 degrades to
  the fallback message in prod. Ledger candidate (drift register).
- **Fixture proof:** delta fixtures + minted Elite user + P2002 probe row all reverted, recounts 0;
  `isFeatured` flag reverted; DB clean.

### SESSION_0529_REVIEW_04 — Desi hostile-close UX review of 3B/3C member surfaces (`dd76d961`)

- **Reviewed tasks:** SESSION_0529_TASK_01, SESSION_0529_TASK_02.
- **Verdict:** **FAIL on 1 P1 → fixed same session → PASS-with-fix.** Overall: "primitive discipline,
  token hygiene, and cross-surface lock-treatment parity are all genuinely good — reuse-first work."
- **The P1 (statically proven from the query/link contract):** authored create defaulted
  `isPublished: false` (bare switch, bottom of a 17-field sheet); the member's own table linked authored
  rows to the profile-scoped watch route regardless of `isPublished`; `findAuthoredTechnique` is
  published-only → the member's next tap after creating = **404**, and no author-facing edit/publish UI
  exists to recover. Fix bundle (Petey-ratified): authored mode defaults `isPublished: true` + switch
  relabeled "Show on my public profile"; draft rows render unlinked.
- **P2 (7) + P3 (7) → WL-P2-52** (itemized there; headline P2s: rail-copy collision between the two
  technique rails; authored slug auto-derive; watch-page breadcrumbs/attribution; feature-toggle copy
  leaks internal jargon; sheet double-heading; undifferentiated dual create affordances for staff).
- **Design-system report:** PASS — Drawer/Card/Note/Carousel all correct L1s, zero hard-coded colors in
  the diff; locked posterless card judged "acceptable for the security tradeoff"; SwordsIcon consistent
  with the admin Techniques icon.

## Hostile close review

- **Giddy (architecture):** PASS — 8.9 (REVIEW_01): seams exemplary, ADR-D4 provably intact, Drawer = the
  correct L1 read, no god-component, no 5th authz; fix-now (ACTIVE predicate) applied same session.
- **Doug (QA/release):** PASS — 8.7 → delta **9.3 GO** (REVIEW_02/03): all P2s verified fixed at runtime,
  gates independently green incl. prod build, no-leak + authz seams live-proven, fixtures 0-orphan.
- **Desi (UX):** **FAIL → P1 fixed same session → PASS-with-fix** (REVIEW_04). The P1: authored create
  defaulted to draft; the member's own table linked the draft to the published-only watch route →
  guaranteed 404 with no author edit/publish recovery path — the flagship flow's default outcome was
  stranded content. Fix (Petey-ratified): authored mode defaults `isPublished: true` ("Show on my public
  profile") + drafts render unlinked. All P2/P3s → WL-P2-52 (next-session polish pass alongside FI-027).
  Primitive discipline / token hygiene / lock-treatment parity: PASS across the diff.
- **Kaizen aggregate: 9 → land, push on the fix.** The model experiment held: Cody-on-Fable shipped
  ~59 files across 5 commits; three independent Fable reviewers each caught a distinct real defect class
  (Giddy: predicate drift; Doug: server-open R2 + poster-id leak; Desi: the dead-end happy path) — the
  P1 was invisible to gates because every gate passed while the *flow* 404'd. Two session-limit
  interruptions recovered cleanly via transcript resume with no lost work.

## ADR / ubiquitous-language check

- **ADR update:** ADR 0046 amended (in `32beb89d`) — D4 consequences now name the authored watch URL
  contract (`/directory/[slug]/techniques/[techniqueSlug]`), per Giddy's recommendation, so 3C+ surfaces
  can't invent a second route. No new ADR needed: 3B/3C implement ADR 0046 as ratified; the grill decisions
  (FI-027/FI-028 shapes) are feature scoping, not hard-to-reverse architecture.
- **Ubiquitous language:** no new domain terms — "Curriculum", "authored", "featured" were all defined at
  0528. The FI-028 participation ladder (Premium = community posting, Elite = technique authoring) will need
  a glossary touch when BUILT (it refines "tier"), noted in the FI-028 row.

## Reflections

- **The grill earned its keep twice — once on a route, once on a revenue model.** Q1 exposed that
  "/app/tools is THE admin law" had drifted in memory into a *route* rule when it was always a *pattern*
  rule — `/app/tools` is the reference implementation, and `/app/techniques` joins as a sibling collection.
  One sentence of glossary sharpening prevented the next session from bolting a techniques table under the
  wrong route. Q2 then turned a "small MAB button" ticket into the ratified participation ladder (free =
  read, Premium = post, Elite = author) — a pricing-structure decision that fell out of asking "who may
  post?" before wiring a button.
- **For YouTube-hosted premium content, the poster IS the content.** The freemium "see what you're missing"
  teaser pattern silently shipped `img.youtube.com/vi/<id>` on locked cards — and the id converts to the
  watch URL. The fix ended up TYPE-encoded (`LockedTileMedia.thumbnailUrl: null`), the same trick as the
  0526 url-absence invariant: make the leak unrepresentable, not just unrendered. Pattern for the ledger:
  any teaser derived from the gated asset's own identifier is a leak.
- **Doug's live probe beat the unit suite on the P2002 shape.** Every unit test passed with the classic
  `meta.target` error shape; the LIVE pg driver-adapter never produces it. Cody's second-round predicate was
  written against the probed shape and Doug re-verified by real duplicate insert. Lesson: for
  error-shape-dependent seams, one live probe outranks a green suite — and D-043 now tracks the repo-wide
  twin of this exact bug.
- **The gate-runner's heuristics misread a committed-code session.** With all app-code already committed, it
  saw "docs-only / build skipped / hostile review n/a" and flagged parked FI-001 as a cross-off candidate.
  Every deterministic cell needed judgment correction. Worth a small runner fix: diff against
  `origin/main..HEAD`, not just the dirty tree.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | 6 wiki/ledger docs touched (wiring-ledger, drift-register, POST_LAUNCH_SOT, test-fail-fix-ledger, wiki/index, custom-component-inventory) — `updated: 2026-07-12` + `last_agent: claude-session-0529` bumped on each |
| Backlinks/index sweep | wiki/index: SESSION_0529 + SESSION_0528 rows added (pre-existing 0524–0527 + scattered-older gap flagged, not thin-backfilled); component inventory: new "Technique authoring" H2 (7 rows); no new cross-doc pairs_with needed (ledger rows self-reference sessions) |
| Wiki lint | `bun run wiki:lint` post-edits: **0 errors / 52 warnings** — identical count to the pre-edit gate-runner pass, so all warnings pre-existing, none introduced |
| Kaizen reflection | yes — 4 reflections (grill×2, poster-as-content, live-probe>suite, gate-runner heuristics) |
| Hostile close review | REVIEW_01 (Giddy 8.9 PASS) + REVIEW_02/03 (Doug 8.7 → 9.3 GO) + Desi dispatched at close; Kaizen 9 |
| Code-quality gate (Class-A) | Covered by the review gauntlet: Giddy 8.9 architecture + Doug 9.3 release on the full diff (media/technique/nav L1 surfaces); no separate /code-quality run — three independent scored reviews stand in |
| Runtime verification (Doug) | 5/5 + 17/17 + 20/20 live probes (anon + entitled) + live D4 round-trip + live P2002 adapter probe + e2e 4/4; fixtures 0-orphan |
| Review & Recommend | yes — Next session = FI-027 Techniques AdminCollection (grill-ratified candidate #1); alternatives FI-028 / WL-P2-49 lane noted; board-top unchanged |
| Memory sweep | 4 memory files updated (technique-authoring 3B/3C landed; admin-collection law wording; tier-model participation ladder; profile-media poster suppression) + MEMORY.md hooks |
| Next session unblock check | UNBLOCKED — FI-027 is fully specified (grill Q1 shape (b)); no operator input needed to start. The PUSH of this session's branch is the only operator-gated item |
| Git hygiene | branch `session-0529-slice3bc`; worktree `../ronin-0529` (kept — branch unmerged pending push); single close commit, hash reported at bow-out; **push HELD for explicit operator go**; FI-001 cross-off candidate DISMISSED (parked ≠ resolved) |
| Graphify update | nodes=13096 · edges=29266 · communities=1451 (gate-runner, pre-commit per FS-0025) |
| Fallow delta | introduced findings: 0 (gate-runner Gate 11) |
| Deferral guard | ✓ clean — "every deferral is backed by a tracked ledger row (3 checked)" (after annotating flagged lines with their FI-028 / WL-P2-49/50 ids; one real catch: the new TFF row collided with the existing TFF-010 → renumbered **TFF-011**, the FS-0030 ledger-ID-reuse class caught at close) |
| Board cross-off | nothing to mark done — the session resolved no board-tracked items (FI-001 is PARKED, not resolved; gate-runner candidate dismissed) |
