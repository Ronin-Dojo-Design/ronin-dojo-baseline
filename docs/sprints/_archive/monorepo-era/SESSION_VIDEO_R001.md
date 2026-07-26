---
title: "SESSION VIDEO_R001 — Video Components System: Review & Recommend"
slug: session-video-r001
type: session
status: closed-full
created: 2026-05-10
updated: 2026-05-10
last_agent: copilot-session-VIDEO_R001
sprint: S3-review
pairs_with:
  - docs/sprints/SESSION_0109.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
tags:
  - off-number
  - review-recommend
  - video
  - planning-only
---

# SESSION VIDEO_R001 — Video Components System: Review & Recommend

> **Off-number session.** This session is outside the main SESSION_01**.md numbering sequence.
> It is a dedicated **review-and-recommend** session run by Petey.
> No code is executed in this session. Output is a plan + architecture recommendation for
> Cody to execute in a subsequent numbered session.

## Date

2026-05-10

## Operator

Brian Scott + Copilot acting as Petey (planner, review/recommend mode)

## Status

closed-full

## Goal

Research, analyze, and produce a complete implementation plan for the Video Components System:
video player component, video taxonomy + schema, entitlement gating, multi-dimension tagging
(disciplines × brands × orgs × schools × users × roles), admin dashboard UI, and public-facing
video sections for tournament, technique, course, and curriculum pages.

---

## Graphify Check

- Graph status: skipped — this is a cross-domain planning session; graphify is not installed in CI environment
- Manual graph strategy used: targeted grep across schema.prisma, admin folder tree, component inventory, existing media/entitlement models
- Query equivalent: `"video player tournament technique curriculum entitlement gating media admin tagging"`
- Files reviewed from manual query:
  - `apps/web/prisma/schema.prisma` — Media, Technique, Course, CurriculumItem, Tournament, Entitlement, SubscriptionTier, UserEntitlement, EntitlementGrant
  - `apps/web/app/admin/media/page.tsx` — existing media gallery (baseline for video admin)
  - `apps/web/app/admin/entitlements/` — existing entitlement CRUD
  - `apps/web/app/admin/subscription-tiers/` — existing tier CRUD
  - `docs/knowledge/wiki/dirstarter-component-inventory.md` — full component inventory (sections 1–9)
  - `apps/web/components/admin/` — Shell, withAdminPage, DataTable, DeleteDialog, RelationSelector
- External research: framecn (shadcn-labs/framecn) registry.json analyzed — **verdict below**

---

## framecn Research — Verdict

**Repository:** `https://github.com/shadcn-labs/framecn`

**What it is:** A Remotion-based video *composition and generation* library. Built on Editframe.
Components are text animation effects for creating/exporting MP4 videos programmatically
(blur-reveal, typewriter, staggered-fade-up, masked-slide-reveal, etc.).
All components depend on the `remotion` package.

**What it is NOT:** A video *player* component library. framecn does not render/play
existing video files — it renders video compositions for export to MP4.

**Verdict: NOT suitable for our needs.**

Our use case is *playback* of existing videos (hosted, YouTube embeds, or Mux streams) —
not video generation. framecn solves a different problem.

**Recommended alternative:** See Player Stack section below.

---

## Petey Plan

### Goal

Design a complete, layered Video Components System that handles:
- Six video type categories across all platform surfaces
- Multi-dimension tagging (12 disciplines × 4 brands × orgs × schools × users × roles)
- Entitlement gating (free / paid tiers, assignable to users and roles)
- Video player component supporting hosted, Mux, and YouTube sources
- Admin CRUD + settings UI following the Gold Standard admin pattern
- Public-facing video sections for tournament, technique, course/curriculum pages

---

### Architecture Layer Map

| Decision | Layer | Source of truth |
|---|---|---|
| File/component organization | L1 | Dirstarter Gold Standard admin pattern |
| Video domain behavior (types, tagging, gating) | L2 | This plan + user spec |
| Brand column, host routing | L3 | ADR 0004 |
| Player visual design, embed styling | L4 | Per-brand design tokens |

---

### Dirstarter Alignment

| Area | Dirstarter provides | Our delta |
|---|---|---|
| Admin CRUD list | DataTable + Gold Standard pattern | Video-specific columns + faceted filters |
| Admin form | Form + useHookFormAction + RelationSelector | VideoType select, discipline/brand multi-tag |
| Delete dialog | Generic DeleteDialog | Thin Video wrapper |
| Media upload | FormMedia + `admin/media/page.tsx` | Extend to upload video to Mux or S3 |
| Entitlement gating | Entitlement + UserEntitlement + EntitlementGrant | VideoEntitlementGate join model |
| Tier management | SubscriptionTier | No changes — reuse |
| Player | None provided | New VideoPlayer component (L2 custom) |
| Tagging | Tag model (generic) + RelationSelector | VideoTag polymorphic join |

---

### Video Type Taxonomy

Six video types map to six platform surfaces:

| VideoType enum | Platform surface | Example |
|---|---|---|
| `TOURNAMENT_RULES` | Tournament detail pages/sections | "Rules for BJJ gi division" |
| `TOURNAMENT_HIGHLIGHT` | Tournament recap, homepage | "2026 Nationals highlight reel" |
| `ATHLETE_INTERVIEW` | Athlete/coach profile, tournament page | "Coach Mike pre-event interview" |
| `CERTIFICATION_COURSE` | Course pages (gated) | "Level 1 Certification Module 3" |
| `TECHNIQUE` | Technique detail pages; usable across disciplines | "Rear naked choke breakdown" |
| `CURRICULUM` | Curriculum item in a Course; may share technique videos | "Curriculum Week 4 — Guard passing" |

---

### Schema Plan

#### New enum: `VideoType`

```prisma
enum VideoType {
  TOURNAMENT_RULES
  TOURNAMENT_HIGHLIGHT
  ATHLETE_INTERVIEW
  CERTIFICATION_COURSE
  TECHNIQUE
  CURRICULUM
}
```

#### New enum: `VideoTagScope`

```prisma
enum VideoTagScope {
  DISCIPLINE
  BRAND
  ORGANIZATION
  SCHOOL
  USER
  ROLE
}
```

#### New model: `Video`

```prisma
/// @jetty S3 — Video entity (playback domain object, separate from raw Media storage)
/// @owner Brian Scott / Cody
/// @since 2026-05-10
model Video {
  id            String    @id @default(cuid())
  brand         Brand                              // ADR 0004 — brand column required
  type          VideoType
  title         String
  slug          String
  description   String?
  // Source — exactly one of these should be set
  muxPlaybackId String?                            // Mux streaming (primary for hosted)
  youtubeId     String?                            // YouTube embed (public/marketing)
  mediaId       String?                            // S3/Media record fallback
  thumbnailUrl  String?
  durationSec   Int?
  isPublic      Boolean   @default(false)          // Free-tier visible without entitlement
  isPublished   Boolean   @default(false)
  sortOrder     Int       @default(0)
  meta          Json?                              // Extensible: captions, transcript, chapters
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  uploadedBy    User      @relation("VideoUploadedBy", fields: [uploadedById], references: [id])
  uploadedById  String
  media         Media?    @relation(fields: [mediaId], references: [id])
  tags          VideoTag[]
  entitlementGates VideoEntitlementGate[]
  tournamentVideos TournamentVideo[]
  techniqueVideos  TechniqueVideo[]
  curriculumVideos CurriculumItemVideo[]

  @@unique([brand, slug])
  @@index([brand, type])
  @@index([brand, isPublished])
  @@index([muxPlaybackId])
}
```

#### New model: `VideoTag` (polymorphic tagging)

```prisma
/// @jetty S3 — VideoTag (multi-dimension tagging: discipline, brand, org, school, user, role)
model VideoTag {
  id        String        @id @default(cuid())
  scope     VideoTagScope // DISCIPLINE | BRAND | ORGANIZATION | SCHOOL | USER | ROLE
  scopeId   String        // The ID of the tagged entity (disciplineId, brandName, orgId, etc.)
  createdAt DateTime      @default(now())

  video   Video  @relation(fields: [videoId], references: [id], onDelete: Cascade)
  videoId String

  @@unique([videoId, scope, scopeId])
  @@index([scope, scopeId])
  @@index([videoId])
}
```

#### New model: `VideoEntitlementGate`

```prisma
/// @jetty S3 — VideoEntitlementGate (links an Entitlement to a Video for gating)
model VideoEntitlementGate {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  video         Video       @relation(fields: [videoId], references: [id], onDelete: Cascade)
  videoId       String
  entitlement   Entitlement @relation(fields: [entitlementId], references: [id], onDelete: Cascade)
  entitlementId String

  @@unique([videoId, entitlementId])
  @@index([videoId])
  @@index([entitlementId])
}
```

#### New join models (surface associations)

```prisma
/// Links Video to Tournament pages
model TournamentVideo {
  tournamentId String
  videoId      String
  sortOrder    Int    @default(0)
  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  video        Video      @relation(fields: [videoId], references: [id], onDelete: Cascade)
  @@id([tournamentId, videoId])
  @@index([tournamentId])
}

/// Links Video to Technique pages
model TechniqueVideo {
  techniqueId String
  videoId     String
  sortOrder   Int    @default(0)
  technique   Technique @relation(fields: [techniqueId], references: [id], onDelete: Cascade)
  video       Video     @relation(fields: [videoId], references: [id], onDelete: Cascade)
  @@id([techniqueId, videoId])
  @@index([techniqueId])
}

/// Links Video to CurriculumItem (replaces loose mediaUrl/mediaType)
model CurriculumItemVideo {
  curriculumItemId String
  videoId          String
  sortOrder        Int    @default(0)
  curriculumItem   CurriculumItem @relation(fields: [curriculumItemId], references: [id], onDelete: Cascade)
  video            Video          @relation(fields: [videoId], references: [id], onDelete: Cascade)
  @@id([curriculumItemId, videoId])
  @@index([curriculumItemId])
}
```

#### Reverse relations to add

```prisma
// On Tournament:    videos  TournamentVideo[]
// On Technique:     videos  TechniqueVideo[]
// On CurriculumItem: videos CurriculumItemVideo[]
// On Entitlement:   videoGates VideoEntitlementGate[]
// On Media:         videos  Video[]
// On User:          uploadedVideos Video[] @relation("VideoUploadedBy")
```

---

### Video Player Stack

**Primary (Mux-hosted):** `@mux/mux-player-react`
- Adaptive streaming via Mux CDN
- Signed playback tokens — perfect for entitlement gating (generate token server-side when user is entitled)
- Poster/thumbnail support

**Secondary (YouTube embed):**
- `<iframe src="https://www.youtube.com/embed/{youtubeId}" ...>` wrapped in aspect-ratio container
- Used for public/marketing content (TOURNAMENT_HIGHLIGHT, interviews)

**Fallback (S3/direct):**
- HTML5 `<video src={mediaUrl}>` for direct-uploaded files

**Wrapper component: `VideoPlayer`**
- Checks `video.muxPlaybackId` → renders `MuxPlayer`
- Checks `video.youtubeId` → renders YouTube iframe
- Falls back to `<video>` for `mediaUrl`
- Accepts `isEntitled: boolean` prop; if `false` and `!video.isPublic`, renders `VideoGate` overlay

**Gating component: `VideoGate`**
- Blurred thumbnail with centered CTA
- "Upgrade to access" button → links to pricing page or opens pricing modal
- Accepts tier name + CTA copy as props (brand-customizable)

---

### Component Architecture

#### New components (Layer 2 custom — not in Dirstarter inventory)

```
components/web/videos/
  video-player.tsx          # Master player: Mux | YouTube | HTML5
  video-gate.tsx            # Paywall overlay (shown when not entitled)
  video-card.tsx            # Card: thumbnail + title + duration + lock icon
  video-list.tsx            # Grid of VideoCards
  video-section.tsx         # Embeddable section (title + VideoList) for tournament/technique pages
  video-query.tsx           # Server component — fetches + gates, passes to VideoList

components/admin/videos/    # (not currently in admin components)
  — follows Gold Standard pattern, lives under app/admin/videos/_components/
```

#### Admin components (under `app/admin/videos/_components/`)

```
videos-table.tsx            # DataTable wrapper
videos-table-columns.tsx    # Columns: title, type, brand, duration, isPublic, isPublished, actions
videos-table-toolbar-actions.tsx  # Bulk delete
videos-delete-dialog.tsx    # Thin DeleteDialog wrapper
video-form.tsx              # Create/edit form: title, slug, type, source fields, thumbnail,
                            #   isPublic, isPublished, discipline tags, brand tags, entitlement gates
video-actions.tsx           # Row dropdown: Edit | View | Duplicate | Delete
```

#### Admin settings (under `app/admin/videos/settings/`)

```
page.tsx                    # Brand-level video settings:
                            #   - Default access tier for new videos
                            #   - Player theme/color overrides
                            #   - Mux environment key configuration
                            #   - YouTube allowed/blocked flag
```

---

### Admin Route Structure

Following Gold Standard pattern (§9 of component inventory):

```
app/admin/videos/
  page.tsx                  # List page — DataTable of all videos for brand
  new/page.tsx              # Create page
  [id]/page.tsx             # Edit page
  settings/page.tsx         # Brand-level video settings
  _components/
    video-form.tsx
    video-actions.tsx
    videos-table.tsx
    videos-table-columns.tsx
    videos-table-toolbar-actions.tsx
    videos-delete-dialog.tsx

server/admin/videos/
  actions.ts                # adminActionClient: upsertVideo, deleteVideo
  queries.ts                # findVideos(), findVideoById(), findVideosByType()
  schema.ts                 # Zod schema + table params cache
```

---

### Public Route Integration

| Surface | Integration |
|---|---|
| `app/(web)/tournaments/[slug]/page.tsx` | Add `<VideoSection type="TOURNAMENT_RULES">` + `<VideoSection type="TOURNAMENT_HIGHLIGHT">` |
| `app/(web)/techniques/[slug]/page.tsx` | Add `<VideoSection type="TECHNIQUE">` (already has `[slug]` route) |
| `app/(web)/courses/[slug]/page.tsx` | Add `<VideoSection type="CERTIFICATION_COURSE">` gated behind enrollment entitlement |
| Curriculum item render | Replace `mediaUrl`/`mediaType` loose strings with `CurriculumItemVideo` join + `<VideoPlayer>` |
| Athlete/coach profile | Add `<VideoSection type="ATHLETE_INTERVIEW">` filtered by athlete tag |

---

### Entitlement Gating Logic

1. **`isPublic: true`** → Always accessible, no entitlement check
2. **`isPublic: false, entitlementGates: []`** → Logged-in only (membership required)
3. **`isPublic: false, entitlementGates: [...]`** → Requires at least one matching `UserEntitlement`
4. **Mux signed token** → Generated server-side in `video-query.tsx` only when entitled. Token is time-limited. Never exposed to unauthenticated requests.

**Server action: `getVideoPlaybackToken(videoId)`**
- Check user session
- Check `UserEntitlement` for all `VideoEntitlementGate` keys on the video
- If entitled: call Mux signing API, return short-lived JWT
- If not entitled: return `null` → client renders `VideoGate`

---

### Tasks

#### VIDEO_R001_TASK_01 — Schema: Video model + enums + join tables
- **Agent:** Cody
- **What:** Add `VideoType`, `VideoTagScope` enums; `Video`, `VideoTag`, `VideoEntitlementGate`, `TournamentVideo`, `TechniqueVideo`, `CurriculumItemVideo` models; reverse relations on Tournament, Technique, CurriculumItem, Entitlement, Media, User
- **Done means:** `bunx prisma validate` passes; `bunx prisma migrate dev --name add-video-system` succeeds
- **Depends on:** nothing

#### VIDEO_R001_TASK_02 — Server layer: queries + actions + schema
- **Agent:** Cody
- **What:** `server/admin/videos/` — queries.ts (findVideos, findVideoById, findVideosByType, findVideosForSurface), actions.ts (upsertVideo, deleteVideo, getVideoPlaybackToken), schema.ts (Zod + table params)
- **Done means:** Type-checks clean; actions callable from admin forms
- **Depends on:** TASK_01

#### VIDEO_R001_TASK_03 — VideoPlayer component + VideoGate
- **Agent:** Cody + Desi (design review)
- **What:** `components/web/videos/video-player.tsx` (Mux | YouTube | HTML5 switcher), `video-gate.tsx` (blurred overlay + upgrade CTA), `video-card.tsx`, `video-list.tsx`, `video-section.tsx`, `video-query.tsx` (server component with entitlement check)
- **Player package:** `@mux/mux-player-react` (check advisory before installing)
- **Done means:** VideoPlayer renders all three source types; VideoGate displays when not entitled; type-check clean
- **Depends on:** TASK_02

#### VIDEO_R001_TASK_04 — Admin CRUD: videos list + form + actions
- **Agent:** Cody
- **What:** `app/admin/videos/` — page.tsx, new/, [id]/, _components/ (following Gold Standard §9). Form includes: title, slug (auto-computed), type select, source fields (muxPlaybackId | youtubeId | mediaId), thumbnail, duration, isPublic switch, isPublished switch, discipline tags (RelationSelector), brand tags (CheckboxGroup), entitlement gates (RelationSelector)
- **Done means:** Admin can create/edit/delete videos; table lists with type/brand filters; type-check clean
- **Depends on:** TASK_02, TASK_03

#### VIDEO_R001_TASK_05 — Admin settings page
- **Agent:** Cody
- **What:** `app/admin/videos/settings/page.tsx` — brand-level settings: default access tier selector, player color/theme override (stored in OrgSettings or a new VideoSettings model), Mux env key field (masked), YouTube embed flag
- **Done means:** Settings page renders and saves; type-check clean
- **Depends on:** TASK_04

#### VIDEO_R001_TASK_06 — Public surface integration
- **Agent:** Cody
- **What:** Wire `VideoSection` into tournament/technique/course `[slug]` pages. Replace `CurriculumItem.mediaUrl` loose string with `CurriculumItemVideo` join in curriculum render. Add sidebar `VideoSection` to athlete/coach profile pages.
- **Done means:** Tournament detail page shows rules + highlight videos; technique page shows technique videos; course page shows gated certification videos; type-check clean
- **Depends on:** TASK_03, TASK_04

#### VIDEO_R001_TASK_07 — Doug QA: type-check + entitlement gate smoke test
- **Agent:** Doug (QA)
- **What:** `bunx tsc --noEmit` zero new errors; manual smoke test of VideoGate (unauthenticated user sees overlay, authenticated entitled user sees player, authenticated non-entitled user sees gate)
- **Done means:** Clean type-check; entitlement gate behavior confirmed
- **Depends on:** TASK_06

---

### Parallelism

```
TASK_01 → TASK_02 → TASK_03, TASK_04 (parallel) → TASK_05, TASK_06 (parallel) → TASK_07
```

TASK_03 (player components) and TASK_04 (admin CRUD) can run in parallel after TASK_02 (server layer).
TASK_05 and TASK_06 can run in parallel after TASK_03 + TASK_04.

---

### Agent Assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Schema additions, clear pattern from SESSION_0109 |
| TASK_02 | Cody | Server layer, mechanical extension of existing query patterns |
| TASK_03 | Cody + Desi | New component family — needs design review on VideoGate + VideoCard |
| TASK_04 | Cody | Gold Standard admin CRUD, well-established pattern |
| TASK_05 | Cody | Settings form, straightforward |
| TASK_06 | Cody | Surface wiring, mechanical |
| TASK_07 | Doug | QA verification |

---

### Open Decisions

1. **Mux vs. direct upload:** Do we provision Mux credentials now? Or use `Media.type=VIDEO` (S3 direct) as the v1 player source and add Mux later?
   - **Petey recommends:** Build the schema and player to support all three sources. Wire Mux as the primary path if credentials are available; fallback to S3/direct if not. This avoids re-architecting later.

2. **VideoSettings model vs. OrgSettings JSON:** Should brand-level video settings (player theme, default tier) live in a new `VideoSettings` model or extend the existing `OrgSettings.meta` JSON field?
   - **Petey recommends:** Extend `OrgSettings.meta` JSON for now (zero migration cost). Promote to dedicated model if settings grow beyond 4–5 fields.

3. **CurriculumItem.mediaUrl migration:** Keep existing `mediaUrl`/`mediaType` loose strings alongside new `CurriculumItemVideo` join, or migrate?
   - **Petey recommends:** Keep backward-compat. Add `CurriculumItemVideo` join as the preferred new path; existing `mediaUrl` remains for pre-existing data. Schedule migration in a later session.

4. **framecn adoption:** Should we use framecn for any future video generation features (automated highlight reels, curriculum preview clips)?
   - **Petey flags:** framecn + Remotion is a legitimate option for programmatic video generation. If Brian wants auto-generated highlight reels or promo clips in the future, this is the right tool. NOT for video playback.

5. **User-sign-off required before TASK_01 execution:** Schema is the hardest thing to change. Confirm the `Video` model design, particularly the source field approach (one nullable per source) and the join table approach for surface associations, before Cody executes TASK_01.

---

### Risks

- **Pre-existing type errors:** Prisma stack depth errors are pre-existing (SESSION_0109) — will not block but will appear in tsc output.
- **Mux credentials:** If Mux is not provisioned, TASK_03 must fall back to direct `<video>` only. Build the abstraction layer first, fill in Mux token generation second.
- **@mux/mux-player-react advisory:** Must run `gh-advisory-database` check before installing this package.
- **CurriculumItem migration:** Leaving `mediaUrl` as deprecated-in-place creates tech debt. Flag in drift register.

---

### Dirstarter Implementation Template

| Item | Value |
|---|---|
| Docs read first | dirstarter-component-inventory.md §2 (admin), §3 (DataTable), §8 (action clients), §9 (Gold Standard) |
| Baseline pattern to extend | `app/admin/categories/` Gold Standard; `app/admin/entitlements/` for gating UI |
| Custom delta | Video model, VideoPlayer component, VideoGate overlay, VideoTag polymorphic join, VideoEntitlementGate |
| No-bypass proof | All admin UI uses DataTable, withAdminPage HOC, adminActionClient, Form + useHookFormAction, RelationSelector for tagging |

---

### Scope Guard

Execution sessions following this plan must NOT expand scope to:
- Auto-generate videos (Remotion/framecn) — that is a separate future feature
- Migrate existing CurriculumItem.mediaUrl data — deferred, flagged in open decisions
- Rebuild the Media gallery admin — extend it minimally if needed; don't rewrite

---

## What Landed

- Petey plan written (this file)
- Off-number session file created
- framecn research complete (verdict: not a video player — wrong tool for playback)
- Schema design proposed: Video model, VideoTag, VideoEntitlementGate, TournamentVideo, TechniqueVideo, CurriculumItemVideo
- Player stack decided: @mux/mux-player-react (primary), YouTube iframe (public), HTML5 video (fallback)
- Admin route structure designed: `app/admin/videos/` + settings page
- 7 tasks defined with agent assignments, parallelism map, open decisions

## Files Touched

- `docs/sprints/SESSION_VIDEO_R001.md` — this file (planning output)

## Task Log

- `VIDEO_R001_TASK_01` — ⏳ pending (schema — user sign-off required first)
- `VIDEO_R001_TASK_02` — ⏳ pending
- `VIDEO_R001_TASK_03` — ⏳ pending
- `VIDEO_R001_TASK_04` — ⏳ pending
- `VIDEO_R001_TASK_05` — ⏳ pending
- `VIDEO_R001_TASK_06` — ⏳ pending
- `VIDEO_R001_TASK_07` — ⏳ pending

## Decisions Resolved

- ✅ framecn: NOT a video player. Not adopted for playback. Flagged as future candidate for video generation only.
- ✅ Player stack decided: Mux (primary) / YouTube iframe (public) / HTML5 (fallback)
- ✅ VideoType taxonomy: 6 types covering all requested surfaces
- ✅ Tagging approach: polymorphic VideoTag join (scope + scopeId) — covers 6 dimensions
- ✅ Gating: reuse existing Entitlement system via VideoEntitlementGate join

## Open Decisions / Blockers

- ⚠️ **BLOCKING TASK_01:** User must sign off on Video schema design before Cody executes
- ❓ Mux credentials: available or deferred?
- ❓ OrgSettings.meta extension vs. new VideoSettings model for brand-level settings
- ❓ CurriculumItem.mediaUrl: keep deprecated-in-place or migrate in same session?

## Next Session

### Goal

Execute VIDEO_R001 TASK_01 (schema) through TASK_04 (admin CRUD) — contingent on user schema sign-off.

### Inputs to read

- This file (`SESSION_VIDEO_R001.md`) — full plan + schema designs
- `apps/web/prisma/schema.prisma` — current state before additions
- `apps/web/app/admin/categories/` — Gold Standard CRUD reference
- `apps/web/app/admin/entitlements/` — entitlement gating pattern reference
- `docs/knowledge/wiki/dirstarter-component-inventory.md` §9 — Gold Standard admin pattern

### First task

After user signs off on schema: run `bunx prisma validate` on proposed Video model additions,
then `bunx prisma migrate dev --name add-video-system`.

---

## Reflections

1. **framecn is a trap:** Its name and placement in `shadcn-labs` made it look like a video player component library. The README says "video components for React" but it's actually a video *generation/composition* tool (Remotion + Editframe). Any agent looking for a video player and landing on framecn should immediately check the dependencies list — `remotion` is the tell. Always read the registry.json or package.json before assuming fit.

2. **The existing schema is closer to ready than expected:** `Media.type` already has `VIDEO` and `YOUTUBE`. `Entitlement` + `UserEntitlement` + `EntitlementGrant` cover the gating pattern exactly. The work is adding the `Video` domain model on top of existing infrastructure, not building a parallel system.

3. **Polymorphic VideoTag is the right call:** The tagging requirement (disciplines × brands × orgs × schools × users × roles) could have been done with 6 separate join tables. The `scope + scopeId` pattern handles all 6 dimensions in one table, is queryable, and mirrors how tags/categories work in similar systems. No over-engineering.

4. **Surface associations are first-class:** The `TournamentVideo`, `TechniqueVideo`, `CurriculumItemVideo` join tables are necessary to avoid putting videoIds in every parent model. They're also how we get "which videos belong to this tournament" queries without grep-ing a JSON field.

5. **Player abstraction matters:** Don't reach for Mux as the only path. The three-source switcher (Mux → YouTube → HTML5) makes the VideoPlayer component robust against "we don't have Mux credentials yet" situations. Build the abstraction first, fill in Mux signing second.

6. **CurriculumItem.mediaUrl is tech debt in plain sight:** Loose `mediaUrl String?` + `mediaType String?` on CurriculumItem vs. a proper `CurriculumItemVideo` join is exactly the "hardcoded array" vs. "join table" problem that SESSION_0109 solved for gear. Same pattern, same fix. Should be done in the same session as VIDEO_R001_TASK_01.

---

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_VIDEO_R001.md: full JETTY 3.0 frontmatter (title, slug, type, status, created, updated, last_agent, sprint, pairs_with, backlinks, tags). `status: closed-full` updated in YAML frontmatter and body simultaneously (FS-0015 compliant). `updated: 2026-05-10` stamped. |
| Backlinks/index sweep | SESSION_VIDEO_R001.md `pairs_with` → SESSION_0109.md and `backlinks` → wiki/index.md + project-log.md. No new wiki pages created — no index.md update required. |
| Wiki lint | `bun` not available in CI environment — command not executable. Pre-existing condition (wiki-lint not runnable in agent sandbox). No new wiki pages touched; no backlink changes outside SESSION file. |
| Kaizen reflection | Reflections section present: yes. Six observations. |
| Hostile close review | VIDEO_R001_REVIEW_01 in project-log.md. Planning session only — no code executed. Plan aligned to Dirstarter Gold Standard. Open decisions documented. |
| Review & Recommend | Next session goal written: yes — "Execute VIDEO_R001 TASK_01 through TASK_04 contingent on user schema sign-off." |
| Memory sweep | No operator memory update needed — plan is fully self-contained in SESSION_VIDEO_R001.md. framecn verdict (wrong tool) is the key fact worth persisting; noted in Reflections. |
| Next session unblock check | BLOCKED ON USER — schema sign-off required before TASK_01. Explicitly noted in Open Decisions. |
| Git hygiene | Branch: `copilot/open-feat-videos-components`. Files: SESSION_VIDEO_R001.md (created), docs/protocols/project-log.md (appended). Committed via report_progress. No secrets, no .env, no node_modules. |

---

## Review Log

### VIDEO_R001_REVIEW_01 — Hostile Close Review

**Reviewed tasks:** VIDEO_R001_TASK_PLAN_01 (planning only)

**Dirstarter docs check:** Not applicable — no Dirstarter code touched in this session. Plan references inventory §2, §3, §8, §9.
**Verdict:** aligned

#### Review questions

1. **Plan sanity:** 7 tasks, clear sequential-then-parallel dependency graph. No scope creep (framecn correctly excluded, CurriculumItem migration marked as deferred). Planning session output matches stated goal.
2. **Dirstarter compliance:** Plan explicitly requires Gold Standard admin CRUD pattern (§9), withAdminPage HOC, adminActionClient, RelationSelector for tagging, DataTable for list views. No raw HTML.
3. **Security:** Mux signed token approach is correct — generate server-side only when entitled, never expose to unauthenticated requests. VideoGate overlay is UX-only; real gating is at the query/token level.
4. **Data integrity:** VideoEntitlementGate uses FK constraints + cascade delete. VideoTag `@@unique([videoId, scope, scopeId])` prevents duplicate tags. Surface join tables use composite PKs.
5. **Lifecycle proof:** BLOCKED ON USER correctly flagged. No execution tasks auto-approved.
6. **Verification honesty:** All 7 tasks listed as ⏳ pending — accurate reflection of planning-only session.
7. **Workflow honesty:** Off-number session clearly marked. TASK_PLAN_LOG entries filed.
8. **Merge readiness:** Session file + project-log update ready to commit.

#### Kaizen reflection triage

1. **Is this safe and secure?** Yes — plan-only, no code executed, no attack surfaces opened.
2. **How many failed steps could we have prevented?** Zero this session. framecn research saved future sessions from installing the wrong dependency.
3. **Confidence 1–10:** 9/9/9

**Kaizen aggregate: 9**

---

## ADR / Ubiquitous-Language Check

No new ADRs created this session. New domain terms introduced:

- `Video` — domain entity distinct from raw `Media` (which is file storage). Needs to be added to `docs/architecture/ubiquitous-language.md` before TASK_01 execution.
- `VideoType` — the six-category taxonomy (TOURNAMENT_RULES, TOURNAMENT_HIGHLIGHT, ATHLETE_INTERVIEW, CERTIFICATION_COURSE, TECHNIQUE, CURRICULUM).
- `VideoTag` — polymorphic multi-dimension tagging join.
- `VideoEntitlementGate` — the link between a Video and an Entitlement key.

**Action:** Cody must add these four terms to ubiquitous-language.md as part of VIDEO_R001_TASK_01.
