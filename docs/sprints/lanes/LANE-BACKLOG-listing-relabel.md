---
title: "Lane Manifest: S040 — Tool → Directory Listing relabel"
slug: lane-s040-listing-relabel
type: lane-manifest
status: backlog
created: 2026-05-03
author: Petey
session_target: BACKLOG
primary_lane: Core platform
worktree: wt-core-platform
pairs_with:
  - docs/architecture/dirstarter-baseline-index.md
  - docs/sprints/SESSION_0039.md
---

## Lane Manifest: SESSION_0040 — Tool → Directory Listing Relabel

Executes D-014 Option B migration plan from baseline index §14.

## WORKFLOW 5.0 alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content pipeline (Tool CRUD), admin UI, public UI, Stripe tiers |
| Extension or replacement | **Neither** — relabel only, no structural changes |
| Why justified | Directory is a launch feature for Baseline; Tool pipeline is the substrate |
| Risk if bypassed | Confusing "Tool" labels in production UI for a martial arts platform |

## Deliverables (max 3)

1. Admin UI relabel: sidebar, breadcrumbs, page titles, form labels → "Listings"
2. Public UI relabel: card copy, page titles, meta → directory-appropriate language
3. Config updates: `submissions.ts`, `claims.ts` context strings

## What NOT to touch (per §14)

- ❌ Do NOT rename the Prisma `Tool` model (internal name stays)
- ❌ Do NOT rename file paths (`server/admin/tools/` stays)
- ❌ Do NOT build a separate directory system
- ❌ Do NOT rename routes (`/admin/tools` stays internally for now)

---

## Recipe 1: Admin sidebar + page titles

- **Template files to read:**

| File | Why |
| --- | --- |
| `components/admin/sidebar.tsx` | Contains "Tools" nav label |
| `app/admin/tools/page.tsx` | Page title + breadcrumb |
| `app/admin/tools/new/page.tsx` | "New Tool" → "New Listing" |
| `app/admin/tools/[slug]/page.tsx` | Detail page title |

- **Delta:** Find all user-facing strings containing "Tool"/"Tools" → replace with "Listing"/"Listings". Leave code identifiers (`tool`, `toolSchema`, etc.) unchanged.
- **New files:** None
- **Acceptance:** Admin sidebar shows "Listings". All admin tool pages show "Listings" in titles/breadcrumbs.

---

## Recipe 2: Public UI relabel

- **Template files to read:**

| File | Why |
| --- | --- |
| `components/web/tools/tool-card.tsx` | Card copy (tagline, labels) |
| `components/web/tools/tool-list.tsx` | List heading |
| `app/(web)/tools/page.tsx` | Public page title + meta |
| `app/(web)/tools/[slug]/page.tsx` | Detail page SEO |
| `config/metadata.ts` | Site-wide meta referencing "tools" |

- **Delta:** User-facing strings only. "Browse tools" → "Browse listings" / "Find a school". Keep component file names as-is.
- **New files:** None
- **Acceptance:** Public-facing pages show directory-appropriate copy. No "tool" visible to end users.

---

## Recipe 3: Config + submission context

- **Template files to read:**

| File | Why |
| --- | --- |
| `config/submissions.ts` | Submission form labels/descriptions |
| `config/claims.ts` | Claim ownership copy |

- **Delta:** "Submit a tool" → "Submit a listing" / "List your school". "Claim this tool" → "Claim this listing".
- **New files:** None
- **Acceptance:** Submission and claim flows use directory language.

---

## Pre-flight checklist (Cody reads before starting)

- [ ] Read this manifest (you're done after this bullet for context)
- [ ] `grep -r "Tool\|tool" --include="*.tsx" apps/web/components/admin/ | grep -i "label\|title\|heading\|breadcrumb"` — find all admin UI strings
- [ ] `grep -r "Tool\|tool" --include="*.tsx" apps/web/components/web/tools/ | grep -i "label\|title\|heading"` — find all public strings
- [ ] Do NOT rename any TypeScript identifiers, file names, or Prisma models
- [ ] Do NOT touch server logic — this is a copy/label pass only

## Token budget estimate

| Read | Tokens |
| --- | --- |
| This manifest | ~1K |
| sidebar.tsx | ~0.5K |
| 4-5 page.tsx files (titles only) | ~2K |
| config files | ~0.5K |
| grep results (targeted) | ~1K |
| **Total context load** | **~5K** |

---

## Score rubric targets (WORKFLOW 5.0)

| Category | How this lane scores |
| --- | --- |
| Dirstarter alignment (2.5) | Zero structural changes — pure relabel preserves all patterns |
| Data integrity (2.0) | No schema changes. No migrations. |
| Lifecycle coverage (1.5) | Directory discovery journey now has correct user-facing language |
| Test evidence (2.0) | Visual check: no "tool" string visible to end users |
| Merge/docs readiness (1.0) | SESSION closed, gap audit updated |
| Launch usefulness (1.0) | Unblocks directory as a branded feature for Baseline |

## Open decisions: 1

- **Should we rename routes?** `/admin/tools` → `/admin/listings`? SESSION_0039 §14 says "consider but don't rush." Recommendation: **leave routes for now**, relabel UI only. Route rename is a follow-up if needed.
