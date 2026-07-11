---
title: "SESSION 0527 — technique/podcast/media CRUD (Slice 0: per-video premium migration + gate rewire)"
slug: session-0527
type: session--implement
status: closed
created: 2026-07-11
updated: 2026-07-11
last_agent: claude-session-0527
sprint: S53
pairs_with:
  - docs/sprints/SESSION_0526.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0527 — technique/podcast/media CRUD (Slice 0: per-video premium migration + gate rewire)

## Date

2026-07-11

## Operator

Brian + claude-session-0527 (Petey)

## Goal

Build the technique/podcast/media authoring CRUD per the SESSION_0526 fully-grilled 5-slice plan (6 operator
decisions locked). **Start at Slice 0** — the schema-touching, security-sensitive foundation: add
`MediaAttachment.isPremium` (hand-authored additive migration, never `migrate-dev` on the shared local DB) and
rewire the freemium gate off whole-technique `Technique.isPremium` onto the per-attachment flag, so a technique
can mix free + premium clips. **The rewire must preserve the SESSION_0526 A1/A2 payload-layer no-leak
invariants** — treat as a security gate: adversarial/negative tests FIRST (a free/unauth request can never
receive a premium video url/payload), then rewire. Then Slices 1–4; Slice 5 (`/app/tools` AdminCollection
conform) is a fast-follow, not this build.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0526.md` (pulled to local `main` this session: `69bd2ecd..6de1056b`).
- Carryover: SESSION_0526 shipped the Phase-1 behavior-preserving quality pass (A1/A2 payload-layer no-leak
  hardening on `/techniques` rail + `buildProfileMedia`) and fully grilled + planned Phase-2 CRUD (6 decisions
  - 5 slices). This session executes that plan starting at Slice 0.

### Branch and worktree

- Branch: `session-0527-technique-crud`
- Worktree: `/Users/brianscott/dev/ronin-0527` (created off `origin/main`; bootstrapped — deps + `.env` +
  Prisma client generated; shadow-replay verified).
- Status at bow-in: clean fresh worktree off `origin/main`.
- Current HEAD at bow-in: `6de1056b`.

### Dirstarter alignment

| Field                       | Answer                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dirstarter baseline touched | Prisma (Media/MediaAttachment), Content/Media (freemium gate). Slices 2–4 also touch Media uploader + Monetization (tier/RBAC gate).                |
| Extension or replacement    | Extension — moves the existing freemium gate unit from Technique to MediaAttachment; reuses the existing tier policy + `can()` RBAC (no 5th authz). |
| Why justified               | Operator decision (Fork 2): per-video premium so one technique can mix free + premium clips; unlocks author CRUD without seed scripts.              |
| Risk if bypassed            | Content stays hand-seeded; whole-technique gating can't express mixed free/premium curriculum.                                                      |

Live docs checked: `docs/runbooks/database/schema-migration.md` (migration path), memory `profile-media-freemium-model-0525` (payload-layer invariant), `parallel-session-shared-db-migrate-dev-reset-trap` (migrate-dev ban).

### Graphify check

- Graph status: worktree graph empty (lives in canonical checkout) — Slice-0 scope is a known set of files
  (the 3 gate sites named in the SESSION_0526 plan), so discovery was direct source read, not a graph query.

### Grill outcome (SESSION_0526 — 6 decisions, carried in)

1. **View-all** = existing `canRenderRichMedia` gate (no new work).
2. **Create scope (Fork A):** Elite-created techniques attach to the creator's OWN profile/curriculum
   (belt-tagged); staff promote/feature the best into the canonical BBL library.
3. **Create permission (Fork B):** 3-way OR — Elite tier ∨ staff role (OWNER/INSTRUCTOR) ∨ grantable RBAC
   `can()` (operator can grant to any user). Reuse existing authz — no 5th system.
4. **Media input (Fork 1):** BOTH — URL-paste field (general) + R2 uploader (admin-only, experimental).
5. **Premium granularity (Fork 2):** PER-VIDEO (`MediaAttachment.isPremium`) — this session's Slice 0.
6. **Podcast/match authoring (Fork 3):** member self-service (`/me` ProfileEditDrawer) + staff admin path.
7. **Manage surface (Fork 4):** add fields to the existing `/app/techniques` form this build; `/app/tools`
   AdminCollection conform = fast-follow (Slice 5).

**New UX input (operator, this session):** the authoring entry point (Slices 3/4) is an **"Add \_\_\_" card**
(plus-sign + "Add technique / match / podcast" text) appended to the relevant rail, visible to a logged-in
authorized user, that opens a **bottom magnetic sheet** for the create flow (mobile-first). Captured for
Slices 3/4 — does not touch Slice 0.

## Petey plan

### Goal

Land per-video premium (Slice 0) with the payload-layer no-leak invariant proven by adversarial tests, then
proceed through Slices 1–4. Hold at each gate for operator sign-off where flagged.

### Tasks

#### SESSION_0527_TASK_00 — Slice 0: per-video premium migration + gate rewire (SECURITY-SENSITIVE)

- **Agent:** Petey (design + migration, inline) → Cody (rewire) → Doug (verify)
- **What:** Add `MediaAttachment.isPremium` (additive migration + behavior-preserving backfill from parent
  `Technique.isPremium`); rewire the 3 gate sites (watch tile, browse-card badge, `buildProfileMedia`) to gate
  per-attachment; extract a pure `gateTechniqueMedia` server helper that strips a locked premium attachment's
  url BEFORE any client payload.
- **Steps:** (1) hand-author migration + shadow-replay ✓; (2) write adversarial no-leak tests FIRST;
  (3) rewire callers; (4) apply migration to dev DB; (5) gates + anon runtime re-verify (0 url leaks) + mixed
  free/premium test.
- **Done means:** migration applied; 3 sites gate per-attachment; adversarial tests green; anon runtime proof
  0 premium url leaks (rail + watch + profile); A1/A2 invariants preserved.
- **Depends on:** operator sign-off on the migration + gate approach (this hold).

#### SESSION_0527_TASK_01 — Slice 1: belt tag on authored techniques

- **Agent:** Cody → Doug. Belt-tag the create/edit path (`beltLevelMin`) per Fork A (belt-tagged curriculum).
- **Depends on:** TASK_00.

#### SESSION_0527_TASK_02 — Slice 2: video attach (URL field + admin-only R2 uploader)

- **Agent:** Cody → Doug. URL-paste (general) + R2 uploader (admin-only). ONE uploader family
  (`components/web/uploader/*` + ONE R2 seam) per memory `image-inputs-are-uploaders-never-url-fields`
  (video excepted). Per-attachment `isPremium` toggle in the attach UI.
- **Depends on:** TASK_00.

#### SESSION_0527_TASK_03 — Slice 3: `canCreateTechnique` 3-way OR + Fork-A scope + "Add technique" card→sheet

- **Agent:** Petey (authz seam) → Cody → Doug. Elite tier ∨ staff role ∨ grantable RBAC `can()`; Elite-created
  → own profile; staff promote to library (open sub-fork: `Technique.isFeatured`/library-scope flag).
  Entry point = "Add technique" plus-card → bottom magnetic sheet.
- **Depends on:** TASK_00, TASK_02.

#### SESSION_0527_TASK_04 — Slice 4: profile podcast/match authoring (member `/me` + staff)

- **Agent:** Cody → Doug. `MediaAttachment{passportId, purpose}` create via `/me` ProfileEditDrawer + staff
  path; "Add podcast" / "Add match" plus-card → bottom magnetic sheet on the profile rails.
- **Depends on:** TASK_00.

### Parallelism

Slice 0 is sequential + gated (security-critical foundation). Slices 1, 2, 4 are largely disjoint once Slice 0
lands; Slice 3 depends on Slice 2 (needs the attach UI). Fan out only where genuinely disjoint.

### Open decisions

- **Slice-0 migration + gate approach — operator sign-off required (this hold).**
- Slice 3 sub-fork: the staff "promote Elite technique → canonical library" mechanism (proposed:
  `Technique.isFeatured`/library-scope flag + staff action) — resolve at Slice-3 build time.
- Role of `Technique.isPremium` after per-video (recommend: keep as browse-badge signal + create-time default
  for new clips; drop is a post-send epic, not this slice).

### Risks

- Payload-layer leak if a locked premium url reaches any client boundary — mitigated by server-side strip +
  adversarial tests FIRST + anon runtime proof.
- Live sibling lanes may own some of the touched files (profile-view/-projection under WL-P2-37/-46,
  AdminCollection+Passport). Slice-0 gate sites (technique-media, technique-card, buildProfileMedia,
  getPublicPassportMedia, page.tsx) are freemium net-new (SAFE per the SESSION_0526 merge-risk map) — flag
  before touching any CAUTION file.

### Scope guard

- Slice 0 is per-video premium ONLY — no create UI yet (that's Slices 2–4).
- Do NOT `migrate-dev` on the shared local DB (worktrees share one DB). Hand-author + shadow-replay + apply
  via `migrate deploy`.
- Do NOT drop `Technique.isPremium` this slice (post-send epic).
- FI-001 / Brian Truelson email PARKED — no `--send`, no `--grant`.
- One push at close, on the operator's explicit word.

## Task log

| ID                   | Status                     | Summary                                                                                                                                                                                                                                                                                              |
| -------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SESSION_0527_TASK_00 | landed (held at push)      | Slice 0 shipped on branch: migration applied to dev DB (0 mismatch backfill), gate rewired per-attachment with server-side url-strip, adversarial no-leak tests + anon runtime proof (0 premium url leaks). All gates green. HELD at push gate.                                                      |
| SESSION_0527_TASK_01 | landed (held at push)      | Slice 1 belt-tag field on /app/techniques form (shared belt-options query, id-space = FK). `eae10497`                                                                                                                                                                                                |
| SESSION_0527_TASK_02 | core landed (held at push) | Slice 2 CORE: per-video premium authoring toggle on MediaAttachmentManager (technique-only) + setWebMediaPremium action + 3 authz tests + runtime mixed-case proof. `5ff5dc12`. DEFERRED to 3–4 design pass: URL-paste media input + admin-gating the R2 uploader (overlaps create-permission RBAC). |
| SESSION_0527_TASK_03 | pending (design pause)     | Slice 3 create-permission 3-way OR + Fork-A scope + "Add technique" card→bottom-sheet                                                                                                                                                                                                                |
| SESSION_0527_TASK_04 | pending (design pause)     | Slice 4 profile podcast/match authoring member+staff (card→bottom-sheet)                                                                                                                                                                                                                             |

## What landed

**Slices 0, 1, 2-core — 4 commits on `session-0527-technique-crud` (`d284b9f7..8b0bc2da`), HELD at push.**

- **Slice 0 — per-video premium (security-critical).** `MediaAttachment.isPremium` (additive migration +
  behavior-preserving backfill from parent `Technique.isPremium`); the freemium gate unit moved from
  whole-technique to per-attachment. New pure `gateTechniqueMedia` server helper strips a locked premium
  tile's playable url at the PAYLOAD layer (encoded in the type — a locked tile has no `url` field). Watch
  page gates + strips per-tile; profile rail (`buildProfileMedia`) + `getPublicPassportMedia` gate on the
  attachment flag. Preserves the SESSION_0526 A1/A2 no-leak invariants.
- **Slice 1 — belt tag.** `beltLevelMinId` on the `/app/techniques` create/edit form; shared
  `getTechniqueBeltOptions` (id-space = the `beltLevelMinId` FK, reused by the browse facet).
- **Slice 2 core — authoring toggle.** Per-clip Premium/Free toggle on the shared `MediaAttachmentManager`
  (technique targets only); `setWebMediaPremium` action + `applyWebMediaPremium` (authorize → verify
  attachment-belongs-to-target → flip + audit → revalidate public technique surfaces). New uploads default
  FREE. DEFERRED: URL-paste media input + admin-gating the R2 uploader (fold into Slice 3-4 design).
- **Slice 3-4 — design + reuse map captured** (this file's Next-session block); build deferred to a fresh
  session (operator's fresh-chat rule for the design-heavy sheet).

## Decisions resolved

- **Per-video premium** (`MediaAttachment.isPremium` as the gate unit, replacing whole-technique
  `Technique.isPremium`) — shipped Slice 0. `Technique.isPremium` retained as the browse-badge signal +
  create-time default; column drop is a post-send epic (not this slice).
- **New uploads default FREE** — the author opts a clip into premium via the toggle (nothing gated by accident).
- **Slice-3 sheet = FULL create + dnd sequencing media rail** (operator); **promote-to-library DEFERRED**.
- **Create-permission reuse** — extend the existing gate via a `canUploadMediaForUser`-style
  `canCreateTechniqueForUser` (`can()` RBAC ∨ staff role ∨ Elite entitlement); no 5th authz.

## Files touched

25 files, +1015/−100 (`git diff --stat origin/main..HEAD`). Highlights:

| File                                                                                                                                                     | Change                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `apps/web/prisma/schema.prisma` + `migrations/20260711120000_add_media_attachment_is_premium/`                                                           | +`MediaAttachment.isPremium` (additive) + behavior-preserving backfill               |
| `server/web/techniques/technique-media-gate.ts` (+`.test.ts`)                                                                                            | NEW pure per-video gate helper (payload-layer url-strip) + adversarial no-leak tests |
| `app/(web)/techniques/[slug]/{page,_components/technique-detail/*}`                                                                                      | watch page gates + strips per-tile (mixed free/premium render)                       |
| `server/web/directory/{profile-media,profile-media.test}.ts` · `server/web/media/queries.ts`                                                             | profile rail gates on attachment flag                                                |
| `server/web/media/{apply-media,actions,media-schemas}.ts` (+`apply-media.test.ts`)                                                                       | `setWebMediaPremium` authoring action + 3 authz tests                                |
| `components/web/media/media-attachment-manager.tsx`                                                                                                      | per-clip Premium toggle (technique-only)                                             |
| `server/web/techniques/{queries,actions,crud-actions,payloads}.ts` · `app/(web)/dashboard/technique-form.tsx` · `app/app/techniques/{new,[id]}/page.tsx` | Slice 1 belt tag                                                                     |
| `scripts/seed-bbl-technique-videos.ts`                                                                                                                   | seed sets attachment `isPremium` (fresh-reseed correctness)                          |

## Verification

| Command / smoke                             | Result                                                                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `prisma validate`                           | PASS                                                                                                                 |
| schema-delta `migrate diff`                 | DDL byte-identical to hand-authored ALTER TABLE                                                                      |
| clean-room `migrate deploy` (throwaway DB)  | exit 0 — full chain incl. backfill applies                                                                           |
| read-only backfill preview (prodsnap)       | 6 technique-attachments→free · 26→premium · 16 non-technique→stay false (matches SESSION_0525 6 free previews)       |
| `migrate deploy` (dev DB) + backfill verify | applied; 6 free / 26 premium / 16 non-technique; **0 mismatch** vs parent technique                                  |
| typecheck · lint:check · format:check       | PASS (my files clean)                                                                                                |
| freemium tests (`bun run test`, 3 files)    | 22 pass / 0 fail (gate 6 + profile 10 + access 6)                                                                    |
| `bun run build`                             | PASS (exit 0)                                                                                                        |
| anon runtime no-leak probe (4 surfaces)     | **0** premium playable-url leaks: premium watch locked · free watch plays · rail posters-only · profile reels locked |

## Open decisions / blockers

- Slice-0 gate rewire + adversarial tests are HELD pending operator sign-off on the approach.

## Next session — Slice 3 (create sheet + sequencing rail) then Slice 4

### Goal

Build the public "Add technique" authoring flow: a plus-card in the `/techniques` rail (shown only to
authorized creators) opens a scrollable bottom magnetic sheet = the FULL technique create form + a
dnd-sequenced mixed photo/video media rail (add photo cards + video cards, drag to order), with the
per-clip Premium toggle (Slice 2) and URL-paste video input. Then Slice 4 (profile podcast/match
authoring, same card→sheet). Defer promote-to-library (`Technique.isFeatured`) to a fast-follow.

### Operator design decisions (2026-07-11)

- **Sheet = FULL create** (not quick-add), **scrollable**, WITH a **sequencing media rail**: add photo
  cards + video cards (mixed), drag to sequence. Per-clip premium toggle in the rail.
- **Promote-to-library: DEFERRED** to a fast-follow (this session: authored techniques attach to the
  creator's own profile/curriculum, belt-tagged — Fork A).
- Defaults (operator can override): plus-card visible to authorized creators only; video via URL-paste
  (R2 uploader stays admin-only on the full `/app/techniques` form).

### Reuse map (scoped this session — reuse-first, no 5th authz)

- **Bottom sheet:** `components/common/sheet.tsx` (base). Patterns: `nav/mab-upload-sheet.tsx`,
  `directory/directory-filter-sheet.tsx`.
- **Sequencing media rail:** `app/app/content/_components/content-media-panel.tsx` — dnd-kit sortable
  cards (grip-drag, reorder, save-order, remove). Adapt for technique + add the Slice-2 premium toggle
  - URL-paste video. Reorder action pattern: `reorderContentAtomMediaAttachments`.
- **Form:** existing `app/(web)/dashboard/technique-form.tsx` (now has belt tag) — mount scrollable in
  the sheet.
- **Create-permission (Fork B):** mirror `server/web/media/permissions.ts#canUploadMediaForUser` →
  new `canCreateTechniqueForUser` = `can()` RBAC ∨ staff role (OWNER/INSTRUCTOR, already in
  `createTechnique`) ∨ Elite entitlement (`server/web/entitlements/queries.ts`). Extend the existing
  `createTechnique` gate; do NOT build a 5th authz.
- **Media attach/premium:** reuse Slice-2 `setWebMediaPremium` + the `apply-media` pipeline; new
  uploads default FREE.
- **Flow:** create technique (draft, unpublished) → the sequencing rail operates on its id
  (repo-consistent attach-after-create, like `MediaAttachmentManager` / `ContentMediaPanel`).

### First task

Build `canCreateTechniqueForUser` (extend the `createTechnique` gate), then the "Add technique"
plus-card → bottom-sheet composing `TechniqueForm` + the adapted sequencing media rail. Cody builds →
Doug verifies. Then Slice 4.

## Review log

### SESSION_0527_REVIEW_01 — per-video premium + authoring (Doug/Giddy lens, inline)

- **Reviewed:** TASK_00 (Slice 0), TASK_01 (Slice 1), TASK_02 (Slice 2 core).
- **Verdict:** Slice 0 is the headline and it's clean — the gate unit moved with the no-leak invariant
  intact and PROVEN three ways (schema-delta migrate-diff, adversarial unit tests, anon runtime probe across
  4 surfaces + a runtime mixed-case proof), and the invariant is now encoded in the return type (a locked
  tile has no `url` field) rather than relying on discipline. Reuse-first throughout: belt options shared
  with the facet (id-space = FK), the authoring toggle rides the existing media pipeline's authz (no 5th
  system), Slice-3 scoped onto `content-media-panel` + `sheet` + `permissions.ts`. Backfill 0-mismatch =
  behavior-preserving.
- **Score:** 9.0/10 (−1: Slice 2's URL-paste + admin-uploader deferred; live-form UI unverified behind auth).
- **Follow-up:** Slice 3 fresh session; push held.

## Hostile close review

### SESSION_0527 — per-video premium migration + gate rewire + authoring toggle

1. **Plan sanity:** Sound. Operator gated Slice 0 pre-land (migration + gate approach shown + approved); the
   security-sensitive rewire led with adversarial tests, not after.
2. **Dirstarter compliance:** Extends — reuses the tier policy + `can()` + media pipeline + belt facet; no
   god-component, no 5th authz.
3. **Security:** IMPROVED and the crux. Per-video gating could have widened the leak surface (some tiles
   render, some don't); instead the url is stripped server-side for locked tiles and the no-leak property is
   TYPE-encoded. Anon runtime proof: 0 premium playable-url leaks across watch (all-premium + mixed) / rail /
   profile. `setWebMediaPremium` re-authorizes + enforces attachment-belongs-to-target (same guard as removal).
4. **Data integrity:** Backfill inherits parent `Technique.isPremium` — 0 mismatch on prodsnap (6 free / 26
   premium / 16 non-technique), identical to SESSION_0525's 6 previews. Additive, `migrate deploy`-safe.
5. **Lifecycle proof:** Migration replayed clean-room (throwaway DB) + applied to dev DB; gate proven at
   runtime incl. a genuine mixed technique (temp data, reverted, 0 orphans).
6. **Verification honesty:** typecheck · lint · format · `bun run build` exit 0 · 44 scoped tests · anon
   runtime. Full `bun test` NOT run (standing Resend hazard) — mitigated by hermetic scoped tests + runtime.
   The `/app/techniques` form + toggle UI are behind auth → source+type verified, not live-clicked (Doug
   follow-up).
7. **Workflow honesty:** Own worktree; no live-lane/CAUTION file touched; 4 commits, none pushed; migrate-dev
   never run on the shared DB (hand-authored + shadow-replayed).
8. **Merge readiness:** Held at push gate for operator "go". Gates green; apps/web push → CI + BBL prod deploy.

**Kaizen aggregate: 9 → proceed (hold at push).**

## ADR / ubiquitous-language check

- ADR update required — per-video premium (`MediaAttachment.isPremium` as the gate unit, replacing
  whole-technique `Technique.isPremium`) is a model change (SESSION_0526 flagged it). Capture as an ADR/SOT
  note during Slice 0. Amends memory `profile-media-freemium-model-0525`.

## Reflections

- **Encoding the invariant in the type beat re-asserting it.** SESSION_0526 hardened the no-leak gate as a
  discipline ("strip the url server-side"). Slice 0 made a locked tile's media type literally lack a `url`
  field (discriminated union), so the leak can't be reintroduced by a future edit without a type error. When
  a security invariant can be a type, make it one.
- **The security-sensitive slice was the cheapest to prove.** Because Slice 0 is a pure gate over a small
  payload, three independent proofs (schema-delta diff, adversarial unit tests, anon runtime probe) were each
  fast — and together far more convincing than any one. The operator's "show me before it lands" gate cost
  minutes and de-risked the whole epic.
- **Slice 2 shrank the moment I read the code.** "Video attach + admin uploader" sounded like a new
  subsystem; the edit page already had a shared `MediaAttachmentManager`, so Slice 2's core became one
  authz-gated toggle + one flag. The recurring lesson: read the surface before scoping the build.
- **Stale `.next` from a mid-session `bun run build` broke the dev server** (every route 404'd) — cleared
  `.next` and dev recovered. Worth a note: don't `next dev` over a production build dir in the same worktree.

## Full close evidence

| Gate                      | Result                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| Task log                  | PASS (5 tasks; TASK_00/01/02 landed-held, TASK_03/04 → fresh session)                                 |
| Format / lint / typecheck | PASS (typecheck 0 · lint clean on touched · format clean)                                             |
| Build                     | PASS (`bun run build` exit 0)                                                                         |
| Tests                     | PASS (44 scoped: gate 6 + access 6 + profile 10 + apply-media 22; full suite skipped — Resend hazard) |
| Migration                 | PASS (validate · schema-delta byte-identical · clean-room deploy · dev-DB backfill 0-mismatch)        |
| Runtime verify            | PASS (anon: 0 premium url leaks across watch/rail/profile + runtime mixed-case proof)                 |
| Graphify                  | refreshed (nodes=13046 edges=29071 communities=1414)                                                  |
| Git state                 | branch=session-0527-technique-crud · 4 commits `d284b9f7..8b0bc2da` · clean · **HELD at push**        |
| Boundary                  | no live-lane/CAUTION file touched; migrate-dev never run on shared DB                                 |
| Ledger cross-off          | none (FI-001 PARKED per operator; WL-P2-37 owned by another lane)                                     |
| Hostile review            | SESSION_0527 hostile close — aggregate 9 → proceed                                                    |
