---
title: "SESSION 0527 — technique/podcast/media CRUD (Slice 0: per-video premium migration + gate rewire)"
slug: session-0527
type: session--implement
status: in-progress
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
  + 5 slices). This session executes that plan starting at Slice 0.

### Branch and worktree

- Branch: `session-0527-technique-crud`
- Worktree: `/Users/brianscott/dev/ronin-0527` (created off `origin/main`; bootstrapped — deps + `.env` +
  Prisma client generated; shadow-replay verified).
- Status at bow-in: clean fresh worktree off `origin/main`.
- Current HEAD at bow-in: `6de1056b`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (Media/MediaAttachment), Content/Media (freemium gate). Slices 2–4 also touch Media uploader + Monetization (tier/RBAC gate). |
| Extension or replacement | Extension — moves the existing freemium gate unit from Technique to MediaAttachment; reuses the existing tier policy + `can()` RBAC (no 5th authz). |
| Why justified | Operator decision (Fork 2): per-video premium so one technique can mix free + premium clips; unlocks author CRUD without seed scripts. |
| Risk if bypassed | Content stays hand-seeded; whole-technique gating can't express mixed free/premium curriculum. |

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

**New UX input (operator, this session):** the authoring entry point (Slices 3/4) is an **"Add ___" card**
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

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0527_TASK_00 | landed (held at push) | Slice 0 shipped on branch: migration applied to dev DB (0 mismatch backfill), gate rewired per-attachment with server-side url-strip, adversarial no-leak tests + anon runtime proof (0 premium url leaks). All gates green. HELD at push gate. |
| SESSION_0527_TASK_01 | landed (held at push) | Slice 1 belt-tag field on /app/techniques form (shared belt-options query, id-space = FK). `eae10497` |
| SESSION_0527_TASK_02 | core landed (held at push) | Slice 2 CORE: per-video premium authoring toggle on MediaAttachmentManager (technique-only) + setWebMediaPremium action + 3 authz tests + runtime mixed-case proof. `5ff5dc12`. DEFERRED to 3–4 design pass: URL-paste media input + admin-gating the R2 uploader (overlaps create-permission RBAC). |
| SESSION_0527_TASK_03 | pending (design pause) | Slice 3 create-permission 3-way OR + Fork-A scope + "Add technique" card→bottom-sheet |
| SESSION_0527_TASK_04 | pending (design pause) | Slice 4 profile podcast/match authoring member+staff (card→bottom-sheet) |

## What landed

<!-- Filled at bow-out. -->

## Decisions resolved

<!-- Filled at bow-out. -->

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | +`MediaAttachment.isPremium Boolean @default(false)` (staged, not yet committed) |
| `apps/web/prisma/migrations/20260711120000_add_media_attachment_is_premium/migration.sql` | additive ADD COLUMN + behavior-preserving backfill (staged) |

## Verification

| Command / smoke | Result |
| --- | --- |
| `prisma validate` | PASS |
| schema-delta `migrate diff` | DDL byte-identical to hand-authored ALTER TABLE |
| clean-room `migrate deploy` (throwaway DB) | exit 0 — full chain incl. backfill applies |
| read-only backfill preview (prodsnap) | 6 technique-attachments→free · 26→premium · 16 non-technique→stay false (matches SESSION_0525 6 free previews) |
| `migrate deploy` (dev DB) + backfill verify | applied; 6 free / 26 premium / 16 non-technique; **0 mismatch** vs parent technique |
| typecheck · lint:check · format:check | PASS (my files clean) |
| freemium tests (`bun run test`, 3 files) | 22 pass / 0 fail (gate 6 + profile 10 + access 6) |
| `bun run build` | PASS (exit 0) |
| anon runtime no-leak probe (4 surfaces) | **0** premium playable-url leaks: premium watch locked · free watch plays · rail posters-only · profile reels locked |

## Open decisions / blockers

- Slice-0 gate rewire + adversarial tests are HELD pending operator sign-off on the approach.

## Next session

### Goal

Continue the CRUD slices not completed this session.

### First task

Resume at the first pending slice.

## Review log

<!-- Filled at bow-out. -->

## Hostile close review

<!-- Filled at bow-out. -->

## ADR / ubiquitous-language check

- ADR update required — per-video premium (`MediaAttachment.isPremium` as the gate unit, replacing
  whole-technique `Technique.isPremium`) is a model change (SESSION_0526 flagged it). Capture as an ADR/SOT
  note during Slice 0. Amends memory `profile-media-freemium-model-0525`.

## Reflections

<!-- Filled at bow-out. -->

## Full close evidence

<!-- Filled at bow-out. -->
