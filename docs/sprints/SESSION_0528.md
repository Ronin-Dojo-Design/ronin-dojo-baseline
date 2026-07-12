---
title: "SESSION 0528 — quality-pass the 0527 technique/media CRUD, then grill+plan Slice 3"
slug: session-0528
type: session--open
created: 2026-07-11
updated: 2026-07-11
last_agent: claude-session-0528
sprint: S53
pairs_with:
  - docs/sprints/SESSION_0527.md
backlinks:
  - docs/knowledge/wiki/index.md
status: in-progress
---

# SESSION 0528 — quality-pass the 0527 technique/media CRUD, then grill+plan Slice 3

## Date

2026-07-11

## Operator

Brian + claude-session-0528 (Petey)

## Goal

Two phases, in order. **Phase 1 — QUALITY PASS** over the landed SESSION_0527 technique/media CRUD diff
(`6de1056b..39557b71`): work the hostile-close carry-overs (live-verify the authoring UI behind auth; the
Slice-2 remainder is folded into the Phase-2 grill), then `/fallow-fix-loop` + `/code-quality`,
behavior-preserving, proving fallow deltas (CRAP / dupes / dead-code) DOWN with no functional regression.
Hold at the push gate. **Phase 2 — GRILL + PLAN Slice 3** (full-create sheet + sequencing rail) per the
SESSION_0527 restructure; bring the operator a `/grill-me` + concrete plan BEFORE any build. Do NOT build
Slice 3 until the operator answers the grill. FI-001 / Brian Truelson email STAYS PARKED.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0527.md` (its `Next session` restructure block is this
  session's task context).
- Carryover: SESSION_0527 landed Slices 0 (per-video premium + gate rewire, security-critical), 1 (belt
  tag), and 2-core (per-clip premium authoring toggle) — all now **merged + pushed to `origin/main`**
  (`d284b9f7`, `eae10497`, `5ff5dc12`). Slices 3–4 are at a design pause. Per the 0527 restructure, this
  session quality-passes the landed diff FIRST, then grills/plans Slice 3.

### Branch and worktree

- Branch: `session-0528-quality-slice3`
- Worktree: `/Users/brianscott/dev/ronin-0528` (created off `origin/main`; bootstrapped — `.env` copied,
  `bun install`, Prisma client generated).
- Status at bow-in: clean fresh worktree off `origin/main`.
- Current HEAD at bow-in: `39557b71`.

### Concurrency guard (RESOLVED — no live lanes)

- Initial scan flagged 5 sibling worktrees (0522-wl-p2-37, 0523-wl-p2-46, three 0525 sub-agents:
  profile/blog-dozen/galaxy) plus 0525-technique/-freemium and a Codex `technique-graph-curriculum`
  worktree as potential overlap on the technique/media files.
- **Directional (merge-base) ownership check + operator confirmation: NONE are live.** Every sibling
  worktree HEAD is an ancestor of `origin/main`, clean tree, 0 commits ahead, 0 owned files — all
  merged/parked. Operator (2026-07-11): "Nothing from the other lanes is going live currently; they are
  all done and pushed to main… nothing in flight or nothing to collide with."
- **Consequence:** the full 24-file 0527 quality-pass scope is safe. Nothing to skip. (The first-pass
  "24 files contested" reading was a false positive from a symmetric `origin/main..HEAD` diff, which lists
  files that merely differ in either direction — corrected via merge-base directional diff.)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (MediaAttachment), Content/Media (freemium gate), Media uploader. Behavior-preserving quality pass only — no baseline behavior changes. |
| Extension or replacement | Neither — refactor/hardening of already-landed extension code (the per-video premium gate + authoring toggle). |
| Why justified | 0527 shipped fast (Slice 0 strongly proven; authoring UI unverified-behind-auth, Slice-2 remainder deferred). Quality pass closes the proof + code-quality gaps before Slice 3. |
| Risk if bypassed | CRAP/dupes/dead-code accrue on the freemium core; authoring UI ships unverified. |

Live docs checked: SESSION_0527 (restructure + reuse map), memory `profile-media-freemium-model-0525`,
`code-quality-matrix-and-skill`, `fallow-baseline-before-implementation`.

## Petey plan

### Goal

Prove + polish the landed 0527 technique/media CRUD (behavior-preserving), then bring the operator a
Slice-3 grill + plan for sign-off. Hold at the push gate.

### Tasks

#### SESSION_0528_TASK_01 — Fallow baseline (BEFORE any edits)

- **Agent:** Petey (inline).
- **What:** Capture `fallow health` + `dupes` (+ `audit`) baseline over the 0527 diff so the Phase-1
  deltas can be proven DOWN at close.
- **Done means:** baseline metrics recorded in this file.

#### SESSION_0528_TASK_02 — Hostile-close carry-over: live-verify authoring UI behind auth

- **Agent:** Doug (verify) — inline drive via worktree `next dev` + Browser pane.
- **What:** Log in as owner/instructor; exercise `/app/techniques/new` + `/app/techniques/[id]` (belt-tag
  field saves + reloads) and the per-clip Premium/Free toggle on the technique `MediaAttachmentManager`
  (flips `isPremium`, badge updates, public gate flips). Source+type verified in 0527; not live-clicked.
- **Done means:** runtime proof (screenshots / DB check) the belt field + premium toggle round-trip.

#### SESSION_0528_TASK_03 — `/fallow-fix-loop` over the 0527 diff (behavior-preserving)

- **Agent:** Cody (fixes) → Doug (re-verify).
- **What:** CRAP/dupes/dead-code diagnosis + multi-angle review + behavior-preserving fixes + re-verify
  (headless) + re-run fallow to prove the delta DOWN.
- **Done means:** fallow deltas down, gates green, no functional regression.

#### SESSION_0528_TASK_04 — `/code-quality` the net-new files

- **Agent:** Giddy/Cody (inline).
- **What:** Score `technique-media-gate.ts`, the watch/profile gate rewire, `setWebMediaPremium` /
  `applyWebMediaPremium`, `getTechniqueBeltOptions`, the seed change against the code-quality matrix; apply
  gap-closing fixes (no behavior regression).
- **Done means:** /10 scores + applied fixes reported before landing.

#### SESSION_0528_TASK_05 — Phase 2: grill + plan Slice 3 (STOP before build)

- **Agent:** Petey/Desi (`/grill-me` + `/grill-with-docs`).
- **What:** Resolve Slice-3 open decisions (media-input policy from the Slice-2 remainder; promote-to-library
  deferral; plus-card visibility) and produce a concrete implement plan using the 0527 reuse map.
- **Done means:** grill + plan presented to operator; **HOLD for sign-off** — no Slice-3 build this task.

### Parallelism

TASK_01 first (baseline). TASK_02 (live-verify) and TASK_03 (fallow loop) can interleave. TASK_04 after
TASK_03. TASK_05 (Phase 2) only after Phase 1 lands + operator reviews. Single coherent lane — no fan-out.

### Open decisions

- **Phase-1 results reported before landing; HOLD at push gate for operator "go".**
- Slice-3 media-input policy (URL-paste vs admin-only R2 uploader) — resolve in the TASK_05 grill.

### Risks

- Behavior-preserving is a hard constraint on the freemium gate — any refactor must keep the no-leak
  invariant (locked premium tile has no `url` field). Re-run the adversarial no-leak tests + anon runtime
  probe after any gate-touching change.

### Cleanup review — scope locked (Giddy, read-only)

Only **3 fixes are 0527-INTRODUCED** (behavior-preserving, in priority order):

1. **`server/web/media/apply-media.ts`** — extract a shared `authorizeAndFindAttachment` helper. The
   `authorize → findFirst(id + target) → not-found-throw` preamble now appears 3× (removal, the
   0527-added `applyWebMediaPremium`, avatar-promotion). Collapses fallow dup:0e3c7b49 + dup:63515e5c → 0.
   Low-med risk (Prisma `select` generic inference); behavior-preserving (same authorize/where/throws).
2. **`app/app/techniques/{[id],new}/page.tsx`** — extract `getTechniqueFormOptions()` (disciplines
   `findMany` + `getTechniqueBeltOptions`) into `server/web/techniques/queries.ts`. Kills dup:cd729053.
   Do NOT merge the membership block (edit scopes by org, new by brand). Low risk.
3. **`components/web/media/media-attachment-manager.tsx`** — extract `MediaAttachmentCard` from the
   90-line/306-CRAP `attachments.map` arrow. Pure JSX relocation + prop threading; preserve the
   global-per-action `isPending` quirk (do not "fix"). Low-med risk. (Also covers the TASK_02 toggle live-verify.)

**INHERITED → named follow-ups, NOT this pass:** `revalidateForTarget` (0527 didn't touch it — reuses it
correctly), `buildProfileMedia` (0527 changed exactly 1 line: `techniqueIsPremium`→`isPremium`),
`TechniqueForm` 373-line/1482-CRAP (0527 added only the belt field — file a form-decomposition ticket),
dup:e10ef6b5 technique-form↔course-form (both regions untouched by 0527; pulls in a non-0527 file).

### Authoring-gate finding (Phase-2 grill input)

- The BBL org ("Black Belt Legacy") has **zero OWNER/INSTRUCTOR memberships** (BBL roster = placeholder
  Passports via LineageTree, not Membership). So the current `createTechnique`/`updateTechnique` gate
  (org-Membership OWNER/INSTRUCTOR) **cannot author any BBL technique** — direct evidence for why Slice 3's
  `canCreateTechniqueForUser` 3-way OR (Elite ∨ staff role ∨ RBAC `can()`) is required. Carried to the
  Phase-2 grill.
- Live-verify identity: Brian (`KBYcc…`) is OWNER/INSTRUCTOR of "Baseline Martial Arts" only → belt-field
  verify runs there (no fabrication); premium-toggle verify uses a minimal reversible Baseline fixture.

### Scope guard

- Phase 1 is behavior-preserving ONLY — no new features, no Slice-3 build.
- Do NOT build Slice 3 until the operator answers the TASK_05 grill.
- Hand-authored migrations only; never `migrate-dev` on the shared local DB.
- FI-001 / Brian Truelson email PARKED — no `--send`, no `--grant`.
- One push at close, on the operator's explicit word.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0528_TASK_01 | landed | Fallow baseline (`audit --changed-since 6de1056b --gate new-only`): complexity **8 findings** (top: technique-form TechniqueForm 38cyclo/1482 CRAP — pre-existing 373-line form; media-attachment-manager :182 arrow 306 CRAP; seed main 756 CRAP; buildProfileMedia 11cyclo/77ln; revalidateForTarget 56 CRAP); dead code **2** (seed unused-file [script, expected]; `pg` unused dep in apps/baseline [not 0527]); duplication **9 clone groups** — actionable-in-scope: `apply-media.ts` internal self-dup (dup:0e3c7b49 17ln + dup:63515e5c 11ln), techniques new↔[id] page.tsx (dup:cd729053 11ln); 16 inherited findings excluded. |
| SESSION_0528_TASK_02 | landed | Live-verify (dev-login as Brian, Baseline fixture): belt `<Select>` renders behind auth with tagged belt; refactored `MediaAttachmentManager` premium toggle renders + badge reflects `isPremium` flip; public watch page renders post-refactor; auth gates enforce. Fixture reverted (0 orphans). Toggle/belt server round-trips covered by 38 tests. |
| SESSION_0528_TASK_03 | landed | /fallow-fix-loop: 4 fixes (A cache-bug, B apply-media dedup, C page-options dedup, D card extraction). Dupes 9→6 (3 targeted gone). 38/38 tests green (behavior preserved). |
| SESSION_0528_TASK_04 | landed | /code-quality scores recorded in Review log (freemium gate 9.0, media actions 9.0, belt/form options 8.9, card extraction 8.6). Strong/near-gold; no caps. |
| SESSION_0528_TASK_05 | pending | Phase 2 grill + plan Slice 3 (hold for operator) |

## What landed

**Phase 1 — quality pass over the landed 0527 technique/media diff (behavior-preserving except one flagged bug fix). HELD at push.**

### Hostile-close carry-overs (from SESSION_0527)

1. **Live-verify authoring UI behind auth — DONE.** dev-login harness works (session cookie issued, no
   email — empty `RESEND_API_KEY` no-ops the send). On a minimal reversible Baseline technique fixture
   (Brian's legitimate OWNER org, reverted with 0 orphans): the belt `<Select>` renders behind auth with
   the tagged belt ("White Belt") selected; the refactored `MediaAttachmentManager` renders the per-clip
   **Free** toggle and the **Premium** badge/label correctly reflect an `isPremium` flip. Public watch page
   renders post-refactor (200, technique + premium content). Server round-trips (setWebMediaPremium authz +
   flip; belt via crud schema `...data`) covered by 38 green tests. **Access finding:** the technique
   authoring pages are gated to BBL-org OWNER/INSTRUCTOR members that don't exist in seed (BBL roster =
   LineageTree placeholder Passports, not Memberships) — the live click on a *real BBL* technique is
   seed-blocked, which is itself the Slice-3 `canCreateTechniqueForUser` finding (carried to the grill).
2. **Slice-2 remainder (URL-paste + admin-gating R2 uploader) — folded into the Phase-2 Slice-3 grill**
   (per the 0527 restructure — overlaps create-permission RBAC + media-input policy).

### Fixes applied (fallow-fix-loop + code-quality)

- **A — cache-invalidation bug (Doug P2, CONFIRMED; behavior-CHANGING — the one intentional behavior fix).**
  `setWebMediaPremium` busts tag `techniques` but the watch page (`findTechniqueBySlug`) was cached under
  `technique-${slug}` only → a free→premium flip left the watch page serving the clip's playable url to anon
  viewers until the TTL (~minutes). Fix: `findTechniqueBySlug` now also `cacheTag("techniques")`. Security-
  adjacent gate correctness on premium content — **flagged for operator awareness (not a pure refactor).**
- **B — apply-media dedup (behavior-preserving).** Extracted `authorizeAndFindAttachment` (fixed superset
  select) — the authorize→findFirst→throw preamble was triplicated. Removed fallow dup:0e3c7b49 + dup:63515e5c.
- **C — page-options dedup (behavior-preserving).** Extracted `getTechniqueFormOptions()` shared by the
  new/edit technique pages. Removed dup:cd729053.
- **D — MediaAttachmentCard extraction (behavior-preserving).** The 90-line inline map arrow → a named,
  testable component; parent shrank 240→171 lines. (CRAP 306 relocated, not reduced — inherent conditional-
  render complexity; named follow-up.)

### Fallow delta (`audit --changed-since 6de1056b --gate new-only`)

| Metric | Before | After | Note |
| --- | --- | --- | --- |
| Duplication clone-groups | 9 | **6** | 3 targeted (0e3c7b49, 63515e5c, cd729053) removed; remaining 6 all inherited (test-setup / technique-form↔course-form / seed) |
| Dead code | 2 | 2 | both false-positive/out-of-scope (seed = manual entry point; `pg` unused dep in apps/baseline, not 0527) |
| Complexity findings | 8 | 8 | media-attachment-manager god-arrow (306 CRAP) → named `MediaAttachmentCard` (306, relocated); rest inherited |

### Deferred / named follow-ups (not fixed — inherited, documented, or inherent)

- **Browse-badge drift** (Doug P3) — `technique-card.tsx` "Premium" badge keys off whole-technique
  `Technique.isPremium`; can drift from per-attachment on a mixed technique. Display-only, no leak; this is
  the documented SESSION_0527 `Technique.isPremium`-as-browse-signal deferral.
- **Belt clear** (Doug P3) — `technique-form.tsx` `beltLevelMinId || undefined` → `.partial()` omits → an
  author can set but not clear a belt tag. Low-value, seed-unreachable authoring gap. Behavior-changing → deferred.
- **Shared `isPending`** (Doug P3 / Giddy) — one pending flag per action across all cards. Preserved (behavior-preserving).
- **`getTechniqueFormOptions` sequential queries** — could `Promise.all` (independent). Optional perf; kept sequential in the strict pass.
- **`TechniqueForm` 373-line/1482-CRAP** + dup:e10ef6b5 (technique-form↔course-form) — pre-existing; file a form-decomposition ticket.

### Slice 3A — technique authored-ownership (server foundation; Cody build → Doug verify → hardening)

The ADR-0046 model, shipped as a self-contained server foundation (NO user-facing UI — that's 3B):

- **Additive migration** (hand-authored, shadow-replayed on a throwaway DB then applied to the shared dev DB —
  never `migrate-dev`): `Technique.organizationId` nullable, `+authorPassportId` (FK), `+isFeatured`; dropped
  the composite `@@unique`; two **partial unique indexes** (canonical `(brand,org,slug) WHERE author IS NULL`;
  authored `(brand,authorPassportId,slug) WHERE author IS NOT NULL`). Shadow-replay caught a real
  `DROP CONSTRAINT`→`DROP INDEX` bug (Prisma `@@unique` is an index, not a constraint) before it could hit prod.
- **Both ownership FKs `ON DELETE SET NULL`** (a 2nd migration flipped org from Cascade) — deleting a school
  demotes its techniques to profile-only, deleting a Passport un-authors them; **no member curriculum is ever
  hard-deleted** (both verified `confdeltype=n` on the dev DB).
- **Gate** `canCreateTechniqueForUser` = `can(techniques.manage)` ∨ active OWNER/INSTRUCTOR ∨ `LINEAGE_ELITE`
  entitlement (mirrors `canUploadMediaForUser`; no 5th authz). Authored create sets `authorPassportId` from the
  **session's own** passport (not spoofable via input) + derives the school from the caller's current `Affiliation`.
- **Discovery filter** (`org != null OR isFeatured`) on `searchTechniques`/`getTechniqueRails`/`findTechniqueBySlug`
  → authored profile-only techniques stay OFF the canonical browse until staff-featured.
- **Doug-hardening (P2/P3):** edit path strips `organizationId`/`slug`/`disciplineId` (an authored edit can't
  re-home into a school to skip the `isFeatured` gate); `findTechniqueBySlug` prefers the canonical row
  (nulls-first) on a `(brand,slug)` collision; `hasOrgStaffRole` filters `status: ACTIVE`.
- **Blast-radius:** seed/import scripts rewritten off the dropped composite-unique; `media-authorization` fails
  closed on null-org technique targets; the org-library editor 404s null-org techniques.

## Decisions resolved

### Phase-1 (quality pass)

- Fix A (cache-invalidation) applied as the one intentional behavior change (security-adjacent premium-gate
  correctness). B/C/D behavior-preserving. Held at push — awaiting operator go + keep-Fix-A confirm.

### Phase-2 Slice-3 grill (operator, 2026-07-11) — CONVERGED via /grill-with-docs → ADR 0046

The initial "Passport-owned → org nullable-as-owner" (Shape A) was grilled against the platform model and
**revised to Shape B-refined** (ratified: [ADR 0046](../architecture/decisions/0046-technique-ownership-org-nullable-and-authored-by.md);
glossary updated: Technique / canonical / authored-by / school-grouped curriculum / variant / featured):

1. **Ownership = TWO axes, not a polymorphic owner:** `Technique.organizationId String?` = the author's
   **school** (from `Affiliation`; null → profile-only, ungrouped); `Technique.authorPassportId String?` =
   the author (null = canonical/org-seeded). Ownership + variants key off `authorPassportId`, not the org.
2. **Variants = independent per-author rows** grouped in the UI (option A; no concept/variant entity).
   Uniqueness: canonical `(brand, org, slug)` partial `WHERE author IS NULL`; authored `(brand, authorPassportId, slug)`
   (keyed off the author, not the org — one person = one slug, different people = variants).
3. **`isFeatured`** = staff promote into canonical browse; attribution preserved. Browse/rails discovery
   filter `organizationId != null OR isFeatured`; school curriculum filters org; profile filters authorPassportId.
4. **Gate `canCreateTechniqueForUser`** = `can()` RBAC ∨ staff role ∨ Elite entitlement (mirror
   `canUploadMediaForUser`; no 5th authz). Edit: author edits own; staff/RBAC edit org; canonical = staff-only.
5. **Media input** = URL-paste in the sheet + R2 uploader admin-only. **Plus-card** = visible only to
   `canCreateTechniqueForUser`. **Brand** = `org.brand` when present, else creator's brand context.

Build sub-sliced: **3A** schema (3 additive cols + 2 partial unique indexes) + gate + query audit + adversarial
tests; **3B** plus-card → sheet (`TechniqueForm` + adapted `content-media-panel` rail + URL-paste); **3C** promote.

## Files touched

**Phase 1 (`a225b975`, pushed):** `server/web/media/apply-media.ts` (authorizeAndFindAttachment), `server/web/techniques/queries.ts` (Fix A cacheTag + getTechniqueFormOptions), `app/app/techniques/{new,[id]}/page.tsx`, `components/web/media/media-attachment-manager.tsx` (MediaAttachmentCard).

**Slice 3A (`2746d365`, `4cac7281`, `8b620527`, `bee0d4b3`, `612f16f3`):**

| File | Change |
| --- | --- |
| `docs/architecture/decisions/0046-*.md` + `docs/architecture/ubiquitous-language.md` | ADR 0046 + glossary (Technique/canonical/authored-by/variant/featured) |
| `prisma/schema.prisma` + 2 migrations (`_technique_authored_ownership`, `_technique_org_fk_set_null`) | org nullable, +authorPassportId, +isFeatured, 2 partial unique indexes, both FKs SET NULL |
| `server/web/techniques/{permissions,apply-technique,crud-schemas,crud-actions,technique-errors}.ts` (+ 2 `.test.ts`) | gate + authored create/edit cores + adversarial tests |
| `server/web/techniques/queries.ts` | ADR-D4 discovery filter + deterministic slug lookup |
| `server/web/media/media-authorization.ts` · `app/app/techniques/[id]/page.tsx` · 3 seed/import scripts | null-org blast-radius fixes |

## Verification

| Gate | Result |
| --- | --- |
| typecheck · lint:check · format | PASS (clean on touched) |
| Tests | Phase-1 38/38; Slice-3A 69/69 (apply-technique 11 + discovery 2 + queries 18 + apply-media 22 + profile 10 + gate 6) |
| Migrations | clean-room `migrate deploy` on throwaway DB (both migrations) + applied to dev DB; both FKs `confdeltype=n` (SET NULL); partial indexes verified |
| Runtime | Phase-1: live-verify behind auth (belt field + premium toggle render/flip) + public watch page. Slice-3A (Doug): transactional no-leak probe (profile-only absent from browse+slug, featured surfaces, 0 orphans) |
| Build | `bun run build` exit 0 (Phase-1; re-run at close via gate runner) |
| Reviews | Phase-1 code-quality 8.6–9.0; Slice-3A Doug 9.0 (no cap) |

## Open decisions / blockers

- **3B/3C carried to a fresh session** (operator directive — design-heavy UI, fresh-chat rule).
- **`Technique.isPremium` browse-badge drift** (SESSION_0527 deferral) — still open; resolve when `Technique.isPremium` is retired.
- Belt-clear authoring gap + shared `isPending` + `getTechniqueFormOptions` `Promise.all` — named Phase-1 follow-ups.

## Next session

### Goal

Build **Slice 3B** — the member-facing technique authoring UI on the ADR-0046 foundation: the "Add technique"
plus-card (visible only to `canCreateTechniqueForUser`) → bottom magnetic sheet composing `TechniqueForm`
+ the adapted `content-media-panel` dnd sequencing rail (with the Slice-2 premium toggle + **URL-paste video**;
R2 uploader stays admin-only). Then **Slice 3C** — the staff `isFeatured` promote-to-library action + surfacing.

### First task

Wire the authored create flow end-to-end. Reuse: `components/common/sheet.tsx`,
`app/app/content/_components/content-media-panel.tsx` (dnd rail), `app/(web)/dashboard/technique-form.tsx`,
`setWebMediaPremium`, `canCreateTechniqueForUser` + `applyCreateTechnique` (3A). **Doug's 3B gotchas (must-honor):**
(1) the **profile watch page must be an un-gated `(authorPassportId, slug)`/id read** — NOT `findTechniqueBySlug`
(its discovery filter excludes the very profile-only techniques a member's profile must show); (2) surface a clean
P2002 message for a duplicate authored slug (`lib/safe-actions.ts` currently maps it to "brand already exists");
(3) media authoring on a null-org authored technique currently fails closed in `media-authorization.ts` — open it
for the author. Live-verify behind auth (dev-login harness works; a reversible fixture, reverted). Then 3C.

## Review log

### SESSION_0528_REVIEW_01 — code-quality scores (code-quality-matrix §6)

Multi-angle inputs: Doug (correctness/security — no P1, 1 P2 fixed, 3 P3 noted) + Giddy (cleanup/reuse — 3
behavior-preserving fixes applied). Scored per `code-quality-matrix`. All Class A (media/content L1).

| Unit | Composite | Cap | Apple/Facebook verdict |
| --- | ---: | --- | --- |
| Freemium gate (`technique-media-gate.ts` + watch/profile rewire + cache fix) | **9.0** | none | Near-gold — no-leak invariant TYPE-encoded (locked tile has no `url`); anon-proven; cache P2 closed. Drag: inherited `buildProfileMedia` complexity + browse-badge drift (named). |
| Media authoring actions (`setWebMediaPremium`/`applyWebMediaPremium` + `authorizeAndFindAttachment`) | **9.0** | none | Strong — re-authz + attachment-belongs-to-target (Doug REFUTED bypass); triplicated preamble DRY'd; audited; 38 tests. |
| Belt/form options (`getTechniqueBeltOptions` + `getTechniqueFormOptions` + page dedup) | **8.9** | none | Strong — id-space = FK; shared loader kills page dup. Nit: sequential queries (optional `Promise.all`). |
| `MediaAttachmentCard` extraction | **8.6** | none | Functional/strong — named+testable, parent −69 lines; CRAP relocated not reduced (inherent conditional-render). Further split risks fragmentation (Apple mantra: cohesive card > micro-fragments). |
| `seed-bbl-technique-videos.ts` | ~7 | n/a | Manual seed script (fallow "unused file"/CRAP = expected script noise); not product code. |

No behavior regressions; security proven at every payload boundary; no caps triggered. Composite range
**8.6–9.0 (Strong / near-gold)**. `code-quality-matrix §5`: ship-with-named-follow-ups.

### SESSION_0528_REVIEW_02 — Slice 3A release-readiness (Doug)

- **Reviewed:** the ADR-0046 schema migration + `canCreateTechniqueForUser` + authored create/edit + discovery filter + adversarial tests.
- **Verdict:** **9.0/10, no hard cap — release-safe as server foundation.** Migration rehearsal clean (throwaway DB, prodsnap untouched, all indexes/FK match ADR); authz non-bypassable (author id from session, not input; A-can't-edit-B; canonical staff-only); no-leak proven at query + runtime (0 orphans); no regression; 53/53 tests.
- **Findings → all resolved this session:** P2 edit-path re-home strip + P2 org-FK SET NULL + P3 active-staff + the `findTechniqueBySlug` determinism flag — all applied and re-verified (69/69 tests). The remaining reads (P2002 copy, profile-watch keying, null-org media authoring) are explicit **3B** work, carried in the Next-session gotchas.

## Hostile close review

- **Giddy (architecture):** PASS — extends the existing model (org/brand-scoping invariant preserved: org = school axis, Passport = owner axis; no polymorphic owner, no 5th authz). ADR 0046 ratifies a hard-to-reverse decision *before* the migration, glossary updated, no god-component.
- **Doug (QA/release):** PASS — 9.0; migration additive + shadow-replayed (caught a real DROP-CONSTRAINT bug), both FKs SET NULL (no curriculum data-loss), authz non-bypassable, no-leak runtime-proven, 69/69 tests, build green.
- **Desi (UX):** N/A this session — 3A is server-only (no user-facing surface); the plus-card/sheet UX is 3B (Desi to review then).
- **Kaizen aggregate: 9 → proceed (land 3A, push on operator go).** The grill-before-migration is the headline: the first-cut "nullable org = owner" would have broken the platform's org/brand-scoping invariant and lost member curriculum on school deletion; grilling it against ADR 0034/0038 + the existing schema converged on the two-axis model and SET NULL FKs before a single prod-bound line shipped.

## ADR / ubiquitous-language check

- **ADR created:** [ADR 0046](../architecture/decisions/0046-technique-ownership-org-nullable-and-authored-by.md) — technique ownership (org-nullable=school + authored-by + variants + SET NULL FKs). Reconciled to as-built (D3 authored index).
- **Ubiquitous language updated:** `docs/architecture/ubiquitous-language.md` — Technique (vs CurriculumItem), canonical technique, authored-by, school-grouped curriculum, variant, featured.
- Amends memory `profile-media-freemium-model-0525`; new memory added for the authoring/ownership model.

## Reflections

- **The grill earned its keep before a prod migration, not after.** The operator stopped the build to grill the org-nullable decision — and it was the right call twice over: (1) the initial "Passport-owned, org nullable-as-owner" would have broken the platform's org/brand-scoping invariant (ADR 0034/0038); grounding it against the existing schema (org-nullable + passport-owned content *both* already have precedent, but not for the org-scoped *library*) converged on the cleaner two-axis model (org = school, Passport = owner). (2) The school-grouping/variants refinement then *vindicated* keeping the org — it's the grouping axis, not a dummy container. A decision that would have been painful to reverse post-migration cost one grill instead.
- **Shadow-replay is not ceremony — it caught a real bug.** Cody's first migration used `DROP CONSTRAINT` for a Prisma `@@unique` that is actually an *index*; the clean-room replay on a throwaway DB failed loudly before the file could auto-apply to Neon prod. The standing "hand-author + shadow-replay, never migrate-dev on the shared DB" rule paid for itself.
- **Two independent reviewers found what one lens misses.** Giddy (cleanup) scoped the Phase-1 fixes to exactly the 0527-introduced debt (killing my instinct to chase the inherited 373-line form); Doug (correctness) found the edit-path re-home hole that turns the ADR-D4 discovery gate into a bypass the moment 3B wires authored editing. Neither was visible from the other's angle.
- **The concurrency false-positive is a recurring trap.** `git diff origin/main..HEAD` lists files that differ *in either direction*, so every merged-but-parked sibling worktree looked like it "owned" all 24 of my files. The merge-base directional diff (`$(merge-base)..HEAD`) is the correct ownership question — worth making the default in the concurrency-guard step.

## Full close evidence

| Gate | Result |
| --- | --- |
| Task log | PASS (5 Phase-1 tasks landed; Slice 3A landed + hardened; 3B/3C → next session) |
| Format / lint / typecheck | PASS (clean on touched) |
| Build | PASS (`bun run build` exit 0; re-confirmed at close) |
| Tests | PASS (Phase-1 38/38 · Slice-3A 69/69) |
| Migrations | PASS (2 additive, shadow-replayed on throwaway + applied to dev; both FKs SET NULL verified) |
| Runtime verify | PASS (Phase-1 live-verify behind auth + watch page; Slice-3A Doug no-leak probe 0 orphans) |
| Reviews | code-quality 8.6–9.0 · Doug 3A 9.0 · hostile aggregate 9 |
| ADR / glossary | ADR 0046 + ubiquitous-language updated |
| Graphify | refreshed at close |
| Git state | Phase-1 pushed (`a225b975`); 5 commits `2746d365..612f16f3` + bow-out doc — landing on operator "Land 3A" go |
| Boundary | no live-lane collision (all siblings merged/parked); migrate-dev never run on shared DB |
| Memory | swept — new authoring/ownership memory added; concurrency-guard lesson captured |
