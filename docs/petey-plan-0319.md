---
title: "Petey Plan 0319 — PromotionEvent Display Surfaces Epic"
slug: petey-plan-0319
type: plan
status: active
created: 2026-05-31
updated: 2026-05-31
last_agent: claude-session-0319-plan
pairs_with:
  - docs/architecture/lineage/promotion-event-model.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/runbooks/dev-environment/autonomous-sessions.md
  - docs/sprints/SESSION_0318.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0319 — PromotionEvent Display Surfaces Epic

## Summary

A focused 3-session epic that takes the `PromotionEvent` model — landed additively and seeded for the
April 10, 2026 Coral Belt Ceremony in SESSION_0318 — and **proves its read surfaces**, then generalizes
the seed and finally begins the deferred write side. The model spine is done; this epic is about *display
and authoring*.

It is the planned continuation of SESSION_0318's "Next session" pointer and remediates the open
hostile-close findings:

- **SESSION_0318_FINDING_01** (medium, open) — the June 8, 2024 Oklahoma City ceremony (Bob Bass +
  Renato Magno) is still represented as date-matched `RankAward`s with no grouping event. The seed
  helper `ensurePromotionEvent` is hardcoded to the April-10 event.
- **SESSION_0318_FINDING_02** (low, open) — the April-10 cohort roster may be incomplete vs public
  reports; reconcile with citations (do not guess).

This epic was planned in a Petey grill on 2026-05-31. The four open forks were put to Brian and
**locked** (see "Locked decisions" below). It is designed to run **unattended** via the autonomous-sessions
driver — each session is a cold `claude -p` process that reads this plan + the latest SESSION file. Because
headless sessions cannot grill, every decision is pre-resolved here.

## What's already locked (SESSION_0318 — do not re-litigate)

- `PromotionEvent` schema is **shipped + migrated** additively (`20260601041817_add_promotion_event`):
  nullable `promotionEventId` (`SetNull`) on `RankAward`, `MediaAttachment`, `LineageVisualGroup`;
  `Organization.hostedPromotionEvents` back-relation; indexes. **No further schema change needed for the
  read surfaces** (the slug column in S0319 is the one small additive exception — see below).
- Verification stays role-gated on `RankAward` / `LineageRelationship.verificationStatus`. The event
  carries **no verification signal**. No attestor/attendee model.
- April-10 CSW event is seeded as one global `PromotionEvent` (`"Coral Belt Ceremony — CSW World
  Conference"`, `2026-04-10`), 6 awards linked, per-tree (Baseline + BBL) cohort `LineageVisualGroup`s
  linked, read-only ceremony badge wired into the Rank History tab.
- OKC bridge data exists: Bob Bass + Renato Magno, `CB7`, `2024-06-08`, `"Oklahoma City, OK"` — promoted
  by Rigan — but with **no grouping event yet**.

## Locked decisions (Petey grill, 2026-05-31 — ratified by Brian)

1. **Route shape = slug.** The ceremony/gallery page is global and shared across BBL/Baseline at
   **`/events/[slug]`**. Add a small additive `PromotionEvent.slug String? @unique` column + backfill
   (slugify title+year, idempotent). Brand-neutral page; the Rank-History badge and cohort label link
   into it.
2. **Gallery proof = seed real BBL ceremony photos + empty state.** Seed `MediaAttachment` rows onto both
   events so the gallery renders **populated**, AND ship the "No photos yet" empty state for eventless
   galleries. This proves the full read path end-to-end with **no upload UI** (upload stays deferred to
   S0321). The images are **real Black Belt Legacy photos** pulled from `ronin-dojo-monorepo`
   (`dist-bbl/brand/blackbeltlegacy/images/`) and committed to the app at
   **`apps/web/public/seed/events/`** in the planning commit (see "Seed media mapping" below) — served at
   `/seed/events/...`, no monorepo dependency at run time.
3. **Session split = read-first, editor in S0321.** S0319 = seed-gen + OKC event + `/events/[slug]`
   read/gallery page. S0320 = org/school promotions timeline + `/events` index page + cross-surface
   links. S0321 = **begin** the deferred event editor + media upload (capability-gated) now that the
   read surface is proven.
4. **Run mechanics = push is authorized.** Run the three sessions back-to-back via the autonomous-sessions
   driver (`scripts/auto-session.sh 3`); each session pushes its `auto/session-NNNN` branch and opens one
   PR (no auto-merge). Brian reviews + merges bottom-up in the morning. If any close gate fails
   (typecheck / lint / `wiki:lint` 0 errors / tests), the session leaves the tree **uncommitted** and the
   loop **halts** — never compound onto a bad base.

## The four display surfaces (from the model doc)

`promotion-event-model.md` defines four display surfaces for a `PromotionEvent`:

| # | Surface | Status |
| --- | --- | --- |
| (a) | Profile **Rank History** tab — read-only ceremony badge on linked awards | ✅ Done SESSION_0318 |
| (b) | **Lineage cohort group** (`LineageVisualGroup` linked to the event) | ✅ Done SESSION_0318 |
| (c) | **Dedicated event / gallery page** per ceremony (shareable across brands) | **S0319** |
| (d) | **Org / school profile promotions timeline** | **S0320** |

S0321 then opens the **write side** (editor + upload), which all four surfaces have been read-only until.

---

## Session 0319 — Seed generalization + OKC event + `/events/[slug]` read page

**Goal:** Generalize the single-event seed into a data-driven list, seed the June 8 2024 OKC ceremony,
add the additive `slug` column, and ship the read-only `/events/[slug]` ceremony/gallery page resolving a
`PromotionEvent` with its linked awards + shared `MediaAttachment` gallery (sample media seeded + empty
state). Cross-link the existing Rank-History badge and cohort label into the page.

### Tasks

#### SESSION_0319_TASK_01 — Generalize the event seed + seed OKC + slug

- **Agent:** Cody (build), Doug (verify)
- **What:** Replace the hardcoded `ensurePromotionEvent`/`ensureCeremonyCohortGroup` April-10 constants
  with a small data-driven `PROMOTION_EVENTS` list, and model the OKC ceremony.
- **Steps:**
  1. Define a `PromotionEventSeed` shape: `{ key, title, slug, eventDate, location, description,
     awardMatch (date+location predicate or explicit user keys), cohortKeys, cohortLabel, cohortSortOrder }`.
  2. Seed two entries: **April 10 2026 CSW** (existing constants, unchanged behavior) and **June 8 2024
     OKC** (`title: "Coral Belt Ceremony — Oklahoma City"`, `eventDate: 2024-06-08`, `location:
     "Oklahoma City, OK"`, awards = Bob Bass + Renato Magno CB7).
  3. Refactor `ensurePromotionEvent` to loop the list, idempotently upsert each event (findFirst by
     title+eventDate, as today), and link awards. **Replace the brittle `awardedAt === "2026-04-10"`
     collector** ([seed-baseline-lineage.ts:1187](apps/web/prisma/seed-baseline-lineage.ts#L1187)) with a
     per-event match on `(awardedAt, location)` so OKC awards group correctly without colliding with
     April-10.
  4. Generalize `ensureCeremonyCohortGroup` to run per event. **Cohort wrinkle (must handle, do not
     force):** Bob Bass is already in `DIRTY_DOZEN_KEYS` and `LineageTreeMember.visualGroupId` allows one
     group per member — so the OKC cohort box can hold only Renato Magno (a group of 1), or be skipped if a
     single-member group reads poorly. The *awards* link to the OKC event regardless. Choose the
     read-sensible option and document it; do not double-assign Bob Bass.
  5. **Additive slug:** add `PromotionEvent.slug String? @unique` to `schema.prisma`; generate the
     migration (purely additive — nullable `ADD COLUMN` + unique index only). Backfill `slug` in the seed
     (slugify `title` + year; idempotent on rerun). Run the FS-0006/FS-0008 schema pre-flight first.
- **Done means:** Two `PromotionEvent`s seeded idempotently (April-10 unchanged; OKC links Bob Bass +
  Renato Magno); slug column migrated additively + backfilled; `bunx prisma validate`, migration
  destructive-op scan clean, `bun run typecheck`, seed + seed-rerun (idempotency) all green; DB probe
  confirms OKC event links exactly Bob Bass + Renato Magno.
- **Depends on:** nothing (gate for TASK_02).

#### SESSION_0319_TASK_02 — `/events/[slug]` read-only ceremony/gallery page + sample media

- **Agent:** Cody (build), Desi (visual), Doug (verify)
- **What:** A brand-neutral, read-only page resolving a `PromotionEvent` by slug with its linked awards
  and shared media gallery.
- **Steps:**
  1. Server query: resolve `PromotionEvent` by `slug` → `{ title, eventDate, location, description,
     hostOrganization, rankAwards { user, rank, awardedBy, organization }, mediaAttachments { media } }`.
     Reuse the existing payload idiom in `server/web/lineage/payloads.ts` (the SESSION_0318
     `promotionEvent` selector at [payloads.ts:189](apps/web/server/web/lineage/payloads.ts#L189) is the
     pattern); add an `eventDetailPayload` if a new selector is cleaner.
  2. Page `app/(web)/events/[slug]/page.tsx` (+ `loading.tsx`, `not-found` on missing slug): header
     (title, date, host org, location, description), a **promotee list** (each award: person → rank badge
     using `Rank.colorHex` data, promoter, awarding school), and a **media gallery grid** from
     `mediaAttachments`. Empty gallery → polished "No ceremony photos yet" empty state. Compose with L1
     primitives (`Card`, `Avatar`, `Badge`, `Stack`) — no bespoke component unless inventoried.
  3. **Sample media seed (real BBL photos):** in the lineage seed, create `Media` rows (valid `brand` +
     `type: IMAGE`, `isPublic: true`, a system/admin `uploadedById`, `url` = the committed
     `/seed/events/...` paths in the "Seed media mapping" table below) + `MediaAttachment` rows with
     `promotionEventId` for both events. Idempotent (findFirst/upsert by `url`). This populates the gallery
     without upload. The assets are already committed to `apps/web/public/seed/events/`.
  4. **Cross-links:** make the Rank-History ceremony badge ([lineage-rank-history-tab.tsx](apps/web/components/web/lineage/lineage-rank-history-tab.tsx))
     and the cohort group label link to `/events/[slug]`. Widen the Rank-History `promotionEvent` selector
     to include `slug`.
  5. Respect reduced-motion; mobile-first; belt color = data, never hardcoded (per repo motion/haptics
     constraints).
- **Done means:** `/events/coral-belt-ceremony-…` renders both seeded ceremonies read-only with promotee
  list + populated gallery; an eventless gallery shows the empty state; Rank-History badge + cohort label
  link through; `typecheck` + changed-file Biome + focused tests + `wiki:lint` (0 errors) green.
  **Browser/device smoke is operator-side** — flag it, do not block the close on it (headless run skips it).
- **Depends on:** SESSION_0319_TASK_01.

#### Seed media mapping (S0319) — real BBL photos, already committed

Assets live under `apps/web/public/seed/events/` (pulled from `ronin-dojo-monorepo`
`dist-bbl/brand/blackbeltlegacy/images/`, downscaled). Seed one `Media` + `MediaAttachment` per row:

| Event | `Media.url` | Suggested `altText` / `title` |
| --- | --- | --- |
| OKC (June 8 2024) | `/seed/events/okc-2024/bob-bass-coral-belt-group.jpg` | Bob Bass coral belt — with Rigan, Renato Magno, Bill Hosken, Dave Meyer |
| OKC | `/seed/events/okc-2024/bob-bass-coral-belt.jpg` | Bob Bass receiving his 7th-degree coral belt |
| OKC | `/seed/events/okc-2024/renato-magno.jpg` | Renato Magno |
| OKC | `/seed/events/okc-2024/bob-bass-and-rigan.jpeg` | Bob Bass and Rigan Machado |
| CSW (April 10 2026) | `/seed/events/csw-2026/rigan-machado.jpg` | Rigan Machado (Red Belt, 9th degree) |
| CSW | `/seed/events/csw-2026/rick-williams.jpg` | Rick Williams |
| CSW | `/seed/events/csw-2026/erik-paulson-csw.png` | Combat Submission Wrestling (host school) |
| CSW | `/seed/events/csw-2026/belt-ceremony.jpg` | Black belt instruction (ceremony context) |

### Scope guard (S0319)

- No event editor, no media **upload** UI, no permission/capability model — S0321.
- No org promotions timeline, no `/events` index page — S0320.
- No roster reconciliation (FINDING_02) — separate data-quality pass, do not guess names.
- Slug is the **only** schema change; keep it additive + nullable.

---

## Session 0320 — Org/school promotions timeline + `/events` index + cross-links

**Goal:** Surface (d) — the org/school profile promotions timeline — and a shareable `/events` index that
lists all ceremonies, then complete the cross-surface link graph.

### Tasks (outline — the cold session refines at bow-in)

#### SESSION_0320_TASK_01 — Org/school promotions timeline

- On the org/school profile (`app/(web)/organizations/…` and/or `app/(web)/schools/…`), add a read-only
  **promotions timeline**: events the org **hosted** (`PromotionEvent.hostOrganizationId`) plus promotions
  **awarded under** the org (`RankAward.organizationId`), ordered by date, each linking to `/events/[slug]`.
- Reuse the existing org-profile data/query pattern; compose with L1 primitives. Empty state when an org
  has no events/awards.
- **Done means:** an org with hosted events / awarded ranks shows a dated promotions timeline linking to
  event pages; `typecheck` + Biome + `wiki:lint` green; browser smoke flagged operator-side.

#### SESSION_0320_TASK_02 — `/events` index page + cross-link completion

- `app/(web)/events/page.tsx`: a brand-aware list of all public `PromotionEvent`s (date, title, host,
  promotee count, thumbnail) linking to each `/events/[slug]`.
- Verify the full link graph is bidirectional where it makes sense: Rank-History badge → event page (done
  S0319), cohort label → event page (done S0319), org timeline → event page, event page → host org +
  promotee profiles.
- **Done means:** `/events` lists the seeded ceremonies and links through; cross-links resolve; gates green.

### Scope guard (S0320)

- Still **read-only**. No editor/upload/permissions. No schema change expected (if one surfaces, it must be
  additive + flagged in the SESSION file, not assumed).

---

## Session 0321 — Begin event editor + media upload (capability-gated)

**Goal:** Now that the read surfaces are proven, **begin** the deferred write side: an event editor and
media upload to the shared gallery, gated by the existing lineage capability/role model.

### Tasks (outline — the cold session refines at bow-in)

#### SESSION_0321_TASK_01 — Capability model + create/edit event action

- Define which roles may create/edit a `PromotionEvent` and attach media — reuse the existing lineage
  capability model (promoting instructor / admin / school-owner / instructor / user with granted lineage
  capability), exactly the verification-gating roster from ADR 0016 + the sync rules. Do **not** invent a
  new permission system.
- Server action(s) to create/update a `PromotionEvent` (title, date, location, description, host org) and
  to link/unlink `RankAward`s — capability-gated, audited. Admin/dashboard surface only; public stays
  read-only.
- **Done means:** a capability-holding user can create/edit an event from the dashboard; unauthorized users
  cannot (server-enforced, with a test); gates green.

#### SESSION_0321_TASK_02 — Media upload to the shared gallery

- Wire upload to the shared `MediaAttachment` gallery using the **existing Dirstarter media/storage
  pipeline** (do not fork it — check the live Dirstarter storage docs at plan time per the alignment rule).
  `Media` row (brand, type, uploader, dimensions) + `MediaAttachment` with `promotionEventId`.
- **Done means:** a capability-holder can upload a photo that appears in the `/events/[slug]` gallery;
  unauthorized upload rejected server-side; gates green.

### Scope guard (S0321)

- This **begins** the editor/upload — it does not need to ship every authoring affordance. Keep slices
  small; defer polish. Storage must extend, not replace, the Dirstarter media pipeline. Capability checks
  are **server-enforced**, never client-only.

---

## Autonomous run instructions

This epic is built to run unattended via
[`docs/runbooks/dev-environment/autonomous-sessions.md`](runbooks/dev-environment/autonomous-sessions.md):

```bash
scripts/auto-session.sh 3   # S0319 → S0320 → S0321, each a cold claude -p process, each a stacked PR
```

- Each cold session bow-ins on the highest SESSION file, reads **this plan** for its slice + locked
  decisions, does the next automatable code slice (Cody build, Doug verify), then full-bow-outs (fills the
  SESSION file, sweeps wiki index/log + component inventory, runs `wiki:lint` = 0 errors,
  typecheck/lint/tests, `graphify update` before the commit), and **commits**. The wrapper pushes the
  branch + opens one PR per session.
- **Operator-only browser/device smoke is skipped and flagged**, never faked — Brian verifies the rendered
  pages in the morning.
- **Halts on:** a dirty tree (close failed) or a no-op session (no commit). A failed gate leaves the tree
  uncommitted by design.
- **Merge:** review the three PRs and merge **bottom-up** (oldest/base-`main` first); GitHub auto-retargets
  the next onto `main`. Note the stacked-PR doc-collision lesson (SESSION_0306): the sessions all touch
  `wiki/index.md` + `log.md`, so expect to resolve those at merge — merge promptly, bottom-up.

## Cross-references

- [Promotion Event Model — design + plan](architecture/lineage/promotion-event-model.md) — the four
  display surfaces + the locked model
- [ADR 0016 — Lineage Promotion Source of Truth](architecture/decisions/0016-lineage-promotion-source-of-truth.md)
  — `RankAward` canonical; the SESSION_0318 `PromotionEvent` amendment
- [Lineage Domain Hub](runbooks/domain-features/lineage-hub.md)
- [Autonomous Sessions Runbook](runbooks/dev-environment/autonomous-sessions.md) — the cold-process driver
- [SESSION_0318](sprints/SESSION_0318.md) — landed the model spine; FINDING_01 (OKC) named this epic as the fix

## Session estimates

| Session | Scope | Schema change | Depends on |
| --- | --- | --- | --- |
| 0319 | Seed-gen + OKC event + `/events/[slug]` read/gallery page | `PromotionEvent.slug` (additive) | None (next) |
| 0320 | Org promotions timeline + `/events` index + cross-links | None expected | 0319 |
| 0321 | Begin event editor + media upload (capability-gated) | None expected | 0319, 0320 |
| **Total** | **3 sessions** | | |

## Open questions / risks

- **OKC cohort group:** Bob Bass occupies the Dirty Dozen group slot; the OKC cohort box can hold only
  Renato Magno. S0319 must choose group-of-one vs no-cohort-box and document it — awards link regardless.
- **Sample media fidelity:** seeded gallery uses **real Black Belt Legacy photos** from the monorepo
  (the OKC group shot is genuinely Bob Bass's coral-belt promotion with Renato Magno et al.; the CSW set
  is representative Rigan/lineage imagery, not literal April-10 photos). Real April-10 photos can be added
  later via the S0321 upload path. Assets are committed under `apps/web/public/seed/events/`.
- **Roster completeness (FINDING_02):** the April-10 cohort may be incomplete vs public reports; reconcile
  with citations in a separate pass — do not guess.
- **Local DB/dev-server instability** recurred in SESSION_0316; Turbopack 500s on DB-backed pages
  (`next dev --webpack` is the fallback). This only affects *operator* browser smoke, which the headless
  run skips — so it does not block the unattended sessions.
- **Stacked-PR doc collisions** on `wiki/index.md` + `log.md` across the three PRs — resolve at merge,
  bottom-up.
</content>
</invoke>
