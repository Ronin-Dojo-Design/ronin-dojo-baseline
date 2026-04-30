---
title: Directory Monetization Roadmap
slug: directory-monetization-roadmap
type: concept
status: active
created: 2026-04-30
updated: 2026-04-30
last_agent: codex-directory-monetization-roadmap
pairs_with:
  - docs/architecture/source/directory-monetization-roadmap.md
  - docs/architecture/dirstarter-architecture-map.md
  - docs/knowledge/wiki/manual-boundary-registry.md
  - docs/protocols/project-log.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - dirstarter
  - monetization
  - content-engine
  - directory
---

# Directory Monetization Roadmap

## Summary

The pasted SESSION_0029 plan is a roadmap source, not the next numbered School Ops session. It should guide the long-term paid directory layer for Baseline Martial Arts, Black Belt Legacy, WEKAF, and Ronin Dojo Design without disrupting the current WORKFLOW 5.0 sequence for class schedules and attendance.

The raw source is preserved at `docs/architecture/source/directory-monetization-roadmap.md` because this repo uses `docs/architecture/source/` as its raw planning-source home. There is no active top-level `raw/` directory.

## Dirstarter Alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content management, automation, payments/Stripe, advertising, seed data, admin tools |
| Extension or replacement | Extension. Reuse `Tool`, `Ad`, `/submit`, `/advertise`, admin tools, Stripe checkout, webhooks, Jina scraping, ScreenshotOne media, and AI generation paths. |
| Why justified | Dirstarter already ships the monetized directory machinery. Rebuilding a parallel paid listing system would create duplicate workflows before the domain model is settled. |
| Risk if bypassed | Duplicate submissions, duplicate ad calendars, split payment flows, drift between `DirectoryProfile` identity search and paid listing monetization. |

## Repo Reuse Audit

| Plan area | Existing repo surface | DRY decision | Gap |
| --- | --- | --- | --- |
| Environment setup | `apps/web/package.json`, `.env.example`, `env.ts`, Prisma seed/run scripts | Reuse Dirstarter/Bun flow already in the repo. Do not clone Dirstarter again. | Credentials and DB connection remain owner-provided. |
| Seed data | `apps/web/prisma/seed.ts` | Extend existing `Tool` seed data for monetization testing; do not invent a CSV importer yet. | Full domain-specific paid listing model is still undecided. |
| Submission workflow | `/submit`, `/submit/[slug]`, `server/web/actions/submit.ts` | Reuse Dirstarter tool submission and plan-selection flow. | User-facing copy still uses generic tool language in places. |
| Admin review/scheduling | `/admin/tools`, `server/admin/tools/actions.ts`, cron publish route | Reuse admin tools and scheduling semantics. | Needs browser QA against future dates and email previews. |
| Automation | `lib/scraper.ts`, `/api/ai/*`, `server/web/actions/media.ts`, `lib/media.ts` | Reuse Jina, AI routes, ScreenshotOne, and favicon helpers. | AI route wiring needed current Vercel AI Gateway env vars. |
| Premium listings | `/submit/[slug]`, Stripe products, Stripe webhook | Reuse Checkout Sessions and webhook status changes. | Current schema has `isFeatured`, not a durable `tier` enum. |
| Advertising | `Ad`, `AdType`, `/advertise`, `AdsPicker`, `findAdWithFallback` | Reuse existing ad scheduling, date blocking, rotation, and fallback logic. | Picker did not expose all six placement types before this pass. |
| Payments | `createStripeCheckout`, `services/stripe.ts`, Stripe webhook | Keep Stripe Checkout Sessions. | Test keys, webhook secret, and CLI forwarding are not configured in repo. |

## Domain Guardrails

- `DirectoryProfile` is identity/search privacy. It is not a paid listing.
- `Organization` and `Program` are school operations entities. They should not silently become Dirstarter `Tool` clones.
- `Tool` remains the Dirstarter monetized listing substrate until MB-011 is resolved.
- `Ad` remains the only ad booking model. Extend it rather than creating a second calendar.
- `createStripeCheckout` remains the payment entry point for listing and ad purchases. Do not add a second payment provider path without an ADR.
- Premium listing behavior should first harden the existing `isFeatured` flow. Add a `tier` model only when the repo decides whether paid listings are tools, organizations, programs, events, or a generic `DirectoryListing`.

## What Landed From This Roadmap

- Preserved the pasted roadmap as raw source.
- Added this synthesized DRY audit and roadmap page.
- Updated AI automation wiring to use `AI_GATEWAY_API_KEY`, `AI_CHAT_MODEL`, and `AI_COMPLETION_MODEL`, with a shared `CONTENT_SYSTEM_PROMPT`.
- Extended seed data with martial-arts directory entries for Baseline Martial Arts, Black Belt Legacy, WEKAF USA, Ronin Dojo Design, USA Stick Fighting, Black Belt Wiki, and Smoothcomp.
- Aligned the Stripe product setup script to Free, Standard, and Premium listing language.
- Exposed all six Dirstarter ad placements in the ad picker: Banner, Tools, ToolPage, BlogPost, Bottom, and All.
- Added a Bottom ad render surface so the `Bottom` placement is not just an enum value.

## Phased Roadmap

### Phase 1 - Dirstarter machinery proof

Prove the current Tool/Ad monetization stack end to end with martial-arts seed data:

- user submits a listing
- admin reviews and schedules publication
- AI enrichment runs when credentials are present
- Standard listing payment notifies admin and submitter
- Premium subscription sets featured placement
- ad booking blocks dates and rotates active placements

### Phase 2 - Domain model decision

Resolve whether the paid directory should remain `Tool`-backed or become a Ronin-native listing model. Candidate targets:

- `Organization` paid profile
- `Program` paid profile
- `Event`/tournament paid profile
- generic `DirectoryListing` that can point at multiple entity types

Do not create the new model until the decision is made.

### Phase 3 - Brand rollout

- Baseline Martial Arts: paid school/program visibility and lead generation.
- Black Belt Legacy: lineage/certification visibility, claimed profiles, featured instructors or academies.
- WEKAF: event, official, academy, sponsor, and vendor visibility.
- Ronin Dojo Design: white-label client showcases and assisted setup packages.

### Phase 4 - Production hardening

- Stripe webhook proof with CLI and test products.
- Email preview and delivery proof.
- AI Gateway and Jina credential proof.
- Ad purchase success page QA.
- Cache invalidation and sitemap proof after scheduled publication.
- Decision on Dirstarter residue: quarantine, promote, or replace.

## Open Questions

- Should paid listings attach to `Tool` through launch, or should `Tool` be renamed/promoted into a generic `DirectoryListing`?
- Should Standard/Premium state become a `ToolTier` enum before production?
- Which brand owns the global ad inventory when an ad is booked as `All`?
- Should BBL profile monetization be handled by the same listing stack or by credential-specific purchase flows?

## Sources

- Raw source: `docs/architecture/source/directory-monetization-roadmap.md`
- Dirstarter Getting Started: https://dirstarter.com/docs/getting-started
- Dirstarter Content Management: https://dirstarter.com/docs/content
- Dirstarter Monetization: https://dirstarter.com/docs/monetization
- Dirstarter Automation: https://dirstarter.com/docs/automation
- Dirstarter Payments: https://dirstarter.com/docs/integrations/payments

## Closeout

### Close Status

Closed-full on 2026-04-30 as a roadmap artifact, not as a numbered `SESSION_NNNN.md`, per owner instruction that this work should not become a normal SESSION_0029 file.

### What Landed

- Raw roadmap source preserved under `docs/architecture/source/`.
- Synthesized roadmap page created with Dirstarter reuse audit and DRY guardrails.
- AI automation updated to use Vercel AI Gateway env vars and shared `CONTENT_SYSTEM_PROMPT`.
- Martial-arts seed entries added for Baseline Martial Arts, Black Belt Legacy, WEKAF USA, Ronin Dojo Design, USA Stick Fighting, Black Belt Wiki, and Smoothcomp.
- Stripe product setup aligned to Free, Standard, and Premium listing tiers.
- Ad purchase picker now exposes Banner, Tools, ToolPage, BlogPost, Bottom, and All placements.
- Bottom ad render surface added.
- MB-011 and D-014 added to keep the Dirstarter `Tool` reuse decision visible before production.
- MB-012 added to mark the accidental Local by Flywheel WordPress public-directory cleanup.

### Files Touched

- `docs/architecture/source/directory-monetization-roadmap.md` — raw roadmap source.
- `docs/knowledge/wiki/content-engine/directory-monetization-roadmap.md` — synthesized roadmap, DRY audit, closeout artifact.
- `apps/web/lib/ai.ts` — AI Gateway model helpers and content system prompt.
- `apps/web/env.ts`, `apps/web/.env.example` — AI Gateway env variables.
- `apps/web/app/api/ai/*` — AI routes now use configured AI Gateway models and graceful disabled response.
- `apps/web/server/admin/shared/schema.ts` — content generation schema language adjusted for martial-arts listings.
- `apps/web/prisma/seed.ts` — martial-arts directory seed entries and categories/tags.
- `apps/web/scripts/setup-stripe-products.ts` — Free/Standard/Premium listing product setup.
- `apps/web/components/web/ads/ads-picker.tsx`, `apps/web/components/web/ads/ads-calendar.tsx`, `apps/web/messages/en/ads.json` — six ad placements and All-placement booking behavior.
- `apps/web/components/web/bottom.tsx` — Bottom ad surface.
- `docs/knowledge/wiki/{index,log,manual-boundary-registry,drift-register}.md` — wiki registration, boundary, and drift updates.
- `docs/protocols/project-log.md` — build, task, review, and full-close evidence.

### Decisions Resolved

- The pasted plan is a roadmap source, not the canonical SESSION_0029.
- Dirstarter `Tool` and `Ad` are reused for near-term monetized directory proof.
- Production domain-model choice for paid listings remains unresolved and tracked as MB-011/D-014.
- The accidental Local by Flywheel WordPress public directory is marked as cleanup debt, not removed during this close.

### Open Decisions / Blockers

- MB-011: decide whether paid listings stay on Dirstarter `Tool`, become a generic Ronin `DirectoryListing`, or attach directly to `Organization`, `Program`, and `Event`.
- MB-012: delete or archive `/Users/brianscott/Local Sites/ronin-dojo/app/public/` only after explicit owner approval and path verification.
- Live Stripe/Jina/AI Gateway/ScreenshotOne/Resend QA remains blocked on credentials.
- Full `bunx tsc --noEmit --pretty false` still fails on pre-existing baseline issues outside this roadmap slice.

### Task Log

| Task ID | Status |
| --- | --- |
| ROADMAP_DIRECTORY_MONETIZATION_TASK_01 | landed |
| ROADMAP_DIRECTORY_MONETIZATION_TASK_02 | landed |
| ROADMAP_DIRECTORY_MONETIZATION_TASK_03 | landed |
| ROADMAP_DIRECTORY_MONETIZATION_TASK_04 | landed |

### Review Log

- `ROADMAP_DIRECTORY_MONETIZATION_REVIEW_01`
- `ROADMAP_DIRECTORY_MONETIZATION_REVIEW_02`

### Hostile Close Review

See `docs/protocols/project-log.md` entries `ROADMAP_DIRECTORY_MONETIZATION_REVIEW_01` and `ROADMAP_DIRECTORY_MONETIZATION_REVIEW_02`.

### Reflections

- The biggest risk was semantic duplication: the repo already has `DirectoryProfile`, `Organization`, `Program`, `Tool`, and `Ad`, and only `Tool`/`Ad` currently have Dirstarter monetization behavior.
- The right near-term move was to reuse the Dirstarter surfaces and explicitly mark the unresolved production model choice instead of inventing another paid listing layer.
- The accidental initial cwd inside Local by Flywheel is now a documented cleanup boundary. Future sessions should verify they are in `/Users/brianscott/dev/ronin-dojo-app` or the intended worktree before editing.
- `All` ad booking needed special handling: an All-placement booking should block against every existing ad date, not only other All bookings.

### Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Checked touched docs. New wiki page has JETTY frontmatter with current `updated`, `last_agent`, `pairs_with`, and `backlinks`. Existing touched wiki/protocol pages had `updated`/`last_agent` bumped where edited. Raw source file intentionally has no YAML frontmatter, matching other `docs/architecture/source/` raw captures. |
| Backlinks/index sweep | `wiki/index.md` links the new roadmap page and raw source. Roadmap pairs with `project-log.md`; `project-log.md` backlinks to the roadmap page. Wiki log updated. |
| Wiki lint | `bun run wiki:lint` — passed, 116 markdown files, no violations. |
| Kaizen reflection | Reflections section present in this closeout artifact. |
| Hostile close review | `ROADMAP_DIRECTORY_MONETIZATION_REVIEW_01` and `ROADMAP_DIRECTORY_MONETIZATION_REVIEW_02` recorded in `docs/protocols/project-log.md`. |
| Review & Recommend | Next session recommendation written below. |
| Memory sweep | Durable project facts captured in docs: Dirstarter `Tool`/`Ad` reuse is temporary pending MB-011; Local by Flywheel WordPress cleanup tracked as MB-012. No external memory update needed. |
| Next session unblock check | Class schedules session is unblocked. WordPress directory deletion is blocked on explicit owner confirmation. |
| Git hygiene | Branch `main`; changes intentionally left uncommitted because no commit/push was requested. `git status --short` reviewed; `git diff --check` passed. |

### Next Session

- **Goal:** Return to the WORKFLOW 5.0 School Ops lane and implement Class schedules, class sessions, and instructor assignment basics.
- **Inputs to read:**
  1. `docs/sprints/SESSION_0028.md`
  2. `docs/protocols/WORKFLOW_5.0.md`
  3. `docs/protocols/cody-preflight.md`
  4. `apps/web/server/web/program/`
  5. `apps/web/prisma/schema.prisma` (`Program`, `ClassSchedule`, `ClassSession`, `ClassInstructorAssignment`)
- **First task:** Confirm the intended worktree (`/Users/brianscott/dev/wt-school-ops`), create the real `SESSION_0029.md`, then run Cody backend/component pre-flight for ClassSchedule CRUD.
- **Candidates:**
  1. Class schedules vertical slice — recommended; it keeps the launch plan moving.
  2. Local WordPress cleanup — useful housekeeping, but blocked until the owner explicitly approves deleting or archiving `/Users/brianscott/Local Sites/ronin-dojo/app/public/`.
