---
title: "ADR 0045 — AdminCollection: one admin-surface frame, one editor, Passport-backed People"
slug: 0045-admin-collection-one-surface-law
type: adr
status: accepted
created: 2026-07-07
updated: 2026-07-07
last_agent: claude-session-0510
pairs_with:
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0040-design-system-doctrine-and-card-architecture.md
  - docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md
backlinks:
  - docs/sprints/SESSION_0510.md
  - docs/knowledge/wiki/index.md
---

# ADR 0045 — AdminCollection: one admin-surface frame, one editor, Passport-backed People

**Status:** accepted (SESSION_0510). Ratifies the operator's "one admin surface" law articulated at
SESSION_0508 after ~500 sessions of it not landing; the `AdminCollection` frame + the `/app/users`
People conformance shipped this session as the first exemplar.

## Context

Admin-surface sprawl was the drift. ~30 `/app/*` list pages each **hand-assembled** the
`components/data-table/*` TanStack kit via their own near-identical `*-table.tsx` wrapper, and the
"conform, don't hand-roll" rule was smeared across CLAUDE.md, Dirstarter-L1 doctrine, the wiki,
cody-preflight, and two component inventories — so every agent read a different fragment and nothing
was enforced. Concretely: `/app/users` was a **stunted account list** (name/email/role only — an
`db.user.findMany` that filtered `isPlaceholder:false`, so accountless roster People never appeared),
and `/app/brand-settings` was a vestigial multi-brand surface. The governance layer was itself the
snowflake sprawl the operator hates. Ratify one law in the read-path; the mechanism must make
divergence *harder* than conformance.

## Decisions

### D1 — `AdminCollection` is THE frame for every admin surface that lists records

`components/admin/admin-collection.tsx` (SESSION_0510) is one generic `AdminCollection<TData>` over the
`components/data-table/*` kit (sortable headers, faceted filters, search toolbar, select checkboxes,
pagination). Every admin list surface — `/app/users`, `/app/schools`, `/app/techniques`,
`/app/organizations`, `/app/claims`, `/app/anything` — is the **same frame** with different **columns +
data source**, never a hand-rolled list/grid/card. "Make an admin surface" = define columns + a query
and get the whole `/app/tools` experience for free. The component owns only the frame; per-entity
columns, the query, filter fields, toolbar actions, and row-id/selection rules stay with the caller.

### D2 — Row → detail → the ONE entity editor; the lineage tree is not a management surface

An admin collection row opens a detail that edits through the entity's single canonical editor (for a
person, the one `PassportEditor`). The lineage **tree/canvas** is a PUBLIC *viewing* surface for
relationships — it is **not** the people-management surface. Managing people = the table. Handing the
operator the tree, cards, or a thin account list when he asks to manage people is the wrong turn.

### D3 — `/app/users` is the Passport-backed People collection

Identity SoT is **Passport** (ADR 0025); a `User` is a Passport with an account (`Passport.userId
String? @unique`, nullable). The People list keys on `db.passport.findMany` so all three populations
surface: accountless roster placeholders (`userId == null`), add-person placeholders
(`user.isPlaceholder`), and real accounts — only a Passport-keyed query can see userless roster People.
Member columns (Name / Account / Belt / School / Verified / Listed-under) reuse the canonical
resolvers (`lib/lineage/canvas-model.ts`; `node.isVerified`; the `INSTRUCTOR_STUDENT` edge).
**Account-only row actions** (role change, ban, delete-account, the RBAC grant path from ADR-adjacent
FI-019) hide/disable when `passport.userId == null`. (Unifying row→detail→PassportEditor for
accountless People — re-keying `/app/users/[id]` from userId→passportId — is sequenced as a follow-up;
the list conformance shipped first.)

### D4 — `/app/brand-settings` is the single-brand Appearance editor (not deleted)

SESSION_0508's law said "delete `/app/brand-settings`" because *multi-brand* died in the single-brand
collapse. The operator's SESSION_0510 revision: what remains after the collapse (the form already
hard-codes BBL) is a **live appearance editor over the `BrandSettings` SoT** (colors/logo/favicon/og,
injected by `app/layout.tsx`) — a legitimate single-purpose settings form, **not** sprawl. Keep the
capability; kill only the multi-brand framing. Reframed + relabelled "Appearance." Font settings and an
`appearance.manage` per-user RBAC grant (so a granted non-admin can edit appearance) are queued
follow-ups. A single-record settings form is deliberately **not** an `AdminCollection` (that frame is
for *lists*).

### D5 — One law in the read-path; conform incrementally, do not big-bang

This ADR + the `admin-collection-one-surface-law` memory are the single authoritative statement; the
redundant enforcement docs/inventories are slated to collapse into it (a separate docs lane, not mixed
into code sessions). The frame + one exemplar (`/app/users`) satisfy the law; the remaining ~29 kit
pages and the non-kit stragglers (`/app/media` hand-rolled gallery, `/app/organizations`,
`/app/claims`, `/app/leads-pipeline`) conform incrementally on the cheap path the frame now provides —
tracked as a follow-up conformance sweep, never a 30-page big-bang in one session.

## Dirstarter docs proof

Extension, not replacement: `AdminCollection` wraps the existing `components/data-table/*` L1 kit and
the `/app/tools` pattern; no Dirstarter baseline capability is replaced. The Appearance editor keeps the
established `BrandSettings` theming SoT and its `layout.tsx` injection.

## Consequences

- New admin surfaces cost "columns + query" — divergence is now harder than conformance (self-enforcing
  law, not a doc to remember).
- The People table is the honest management surface: placeholders are visible, account-only actions are
  gated, and identity edits route to the one Passport editor.
- Brand appearance stays operator-editable in-app; the multi-brand vestige is gone.
- Follow-ups are explicit and ledgered (row→detail→PassportEditor unification; the ~29-page conformance
  sweep; Appearance fonts + `appearance.manage` grant), so "the law is satisfied" never over-claims.
