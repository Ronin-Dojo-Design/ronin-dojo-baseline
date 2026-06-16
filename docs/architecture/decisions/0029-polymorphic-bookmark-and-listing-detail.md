---
title: "ADR 0029 — Polymorphic Bookmark (Save anything) + shared ListingDetail chrome"
slug: adr-0029-polymorphic-bookmark-and-listing-detail
type: decision
status: accepted
created: 2026-06-16
updated: 2026-06-16
last_agent: claude-session-0397
deciders: Brian Scott
pairs_with:
  - docs/architecture/decisions/0028-shared-listing-card-and-taxonomy.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/sprints/SESSION_0397.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0029 — Polymorphic Bookmark (Save anything) + shared ListingDetail chrome

## Status

**Accepted** — 2026-06-16. Extends [ADR 0028](0028-shared-listing-card-and-taxonomy.md) (shared `ListingCard` +
cross-entity taxonomy) by closing its three deferred residuals: Save persistence for non-tool entities, the
detail-page template, and the `SchoolCard` fold-in.

## Context

ADR 0028 made one canonical `ListingCard` but left Save **fake** for non-tool entities (a sign-in-gated stub),
because the `Bookmark` model was tool-only (`Bookmark.toolId` required) and the saved-view page did not exist
(the tool actions revalidated a non-existent `/dashboard/bookmarks` — D-DRIFT-0397-2). The two domain **detail**
pages (`/directory/[slug]`, `/schools/[slug]`) were also still bespoke — not the Tool-grade chrome of the L1
tool-detail page — and the legacy hover-reveal `SchoolCard` had not been folded into `ListingCard`.

The operator's framing: **"everything is a listing"** — a user should be able to favorite a tool, a person, a
school, a technique, a post, or a whole lineage tree, and every detail page should share the professional tool
chrome. Per [ADR 0025](0025-passport-identity-source-of-truth.md), a **person is a Passport** (the identity SoT
that feeds the DirectoryProfile, the lineage node, and the board), so a person bookmark must key to the Passport.

## Decision

1. **Polymorphic `Bookmark`.** Add a `BookmarkSubjectType` discriminator (`TOOL | PERSON | ORGANIZATION |
   TECHNIQUE | POST | TREE`) + **nullable FKs** (`toolId` relaxed to optional, plus `passportId`,
   `organizationId`, `techniqueId`, `postId`, `lineageTreeId`), exactly one set per row — the same shape
   `ProfileClaimRequest` already uses (discriminator + nullable FKs, "exactly one set, enforced in the action").
   Chosen over a bare `subjectType`+`subjectId` string pair for **cascade-delete integrity**. Person → `passportId`
   (Passport, the SoT). Migration `20260616150339_add_polymorphic_bookmark_subject` is additive (zero column drops;
   existing rows default to `TOOL`).
2. **One Save button, one action set.** `ListingSaveButton` is the generic persisted Save (keyed on
   `{ subjectType, subjectId }`); the tool `ListingBookmarkButton` becomes a **thin adapter** over it
   (subjectType `TOOL`), mirroring the `ToolCard`→`ListingCard` adapter move. The old tool-only
   `check/set/removeBookmark` actions retire — `checkBookmarkSubject`/`setBookmarkSubject` back every entity.
3. **Saved view.** A new **"Saved" tab** on `/app/profile` renders a mixed-entity `ListingCard` grid via
   `getSavedListings(userId)` (normalizes all six subjects → `SavedListing`). The dead `/dashboard/bookmarks`
   revalidate path is repointed to `/app/profile`.
4. **Shared `ListingDetail` chrome.** A `ListingDetail` component lifts the L1 tool-detail sticky hero (media +
   title + badges + actions cluster) + content/sidebar/related layout. `/directory/[slug]` and `/schools/[slug]`
   render through it (hero + persisted Save + the existing per-entity claim affordance), **chrome only** — the
   divergent bodies, the three claim systems (tool dialog / `ProfileClaimTeaser` / `OrgClaimCta`), and the
   directory tier-gating stay per-entity slots. The L1 tool page keeps its own bespoke layout (not repointed).
5. **`SchoolCard` folded** into a thin `ListingCard` adapter (avatar media, type badge, disciplines→categories,
   persisted ORGANIZATION Save); the bespoke hover-reveals-contact behavior retires (contact → detail page).

## Consequences

### Positive

- Save **persists** for every listing entity through one model + one button; the saved page finally exists.
- Rebuilding the two detail pages on shared chrome **eliminated** the two worst complexity hotspots in the area
  (`SchoolDetailPage` CRAP 1056, `DirectoryProfilePage` 650 → both below threshold).
- The button-adapter consolidation removed the `ListingSaveButton ↔ ListingBookmarkButton` clone and the tool-only
  back-compat actions outright.

### Negative / deferred

- The L1 tool-detail page is not itself routed through `ListingDetail` (kept as the reference; lower-risk than
  repointing the live tool detail).
- Detail-page category/tag footers (the ADR 0028 taxonomy) are not yet wired into the two pages.
- Vestigial tool-only read queries (`findBookmarkedTools`/`findBookmarkedToolIds`) remain (superseded by
  `getSavedListings`; tested, harmless) — a follow-up cleanup.
- Full interactive logged-in Save click-through is a residual Doug verification (render + DB round-trip proven).

### Neutral

- No DB-level "exactly one FK set" constraint — enforced in the action layer, matching `ProfileClaimRequest`.

## Related decisions

- [ADR 0028 — Shared ListingCard + taxonomy](0028-shared-listing-card-and-taxonomy.md) — this completes its residuals.
- [ADR 0025 — Passport identity SoT](0025-passport-identity-source-of-truth.md) — person bookmark keys to the Passport.
- [ADR 0023 — Generic profile claim](0023-generic-profile-claim.md) — the claim affordance in the detail chrome.
