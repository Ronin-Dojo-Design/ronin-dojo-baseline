---
title: Drift Register
slug: drift-register
type: protocol
status: active
created: 2026-04-27
updated: 2026-07-12
last_agent: claude-session-0529
source_pages:
  - docs/knowledge/wiki/concepts/open-brain-repo-memory.md
  - docs/sprints/SESSION_0017.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Drift Register

Track contradictions, stale claims, and unresolved tensions between sources. Each entry stays open until resolved by a session or ADR.

## Entries

### D-DRIFT-0394-1 — Cinematic explorer ignores promotion-date cohort grouping

- **Source A:** `LineageVisualGroup` cohort model (`schema.prisma:2631`, `groupType: PROMOTION_DATE`) — the board view (`lineage-tree-board.tsx`) renders members grouped into promotion-date cohort bands under each parent.
- **Source B:** the cinematic explorer (`lineage-view-a-island.tsx` via `to-family-chart-data.ts`) — the vendored family-chart engine has no cohort concept and `toFamilyChartData` drops `member.visualGroupId`, so all of a parent's descendants render in one flat row.
- **Decision:** **B — build a custom cohort-timeline layout and retire family-chart for View A** (operator, SESSION_0394 close; no prototype). Recorded as `ADR 0027` (supersedes `ADR 0026`).
- **Status:** decided — build pending
- **Found in:** SESSION_0394 (operator browser review). **Build:** SESSION_0395.

### D-001 — Wiki log stale after SESSION_0007

- **Source A:** `wiki/log.md`
- **Source B:** SESSION files 0008–0016
- **Decision needed:** Backfill log
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-002 — S2–S4 entities missing `payloads.ts`

- **Source A:** `s2-s4-pattern-audit.md`
- **Source B:** Dirstarter `tools/payloads.ts` pattern
- **Decision needed:** Create payload files
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-003 — Org queries use `include` not `select`

- **Source A:** `organization/queries.ts`
- **Source B:** Dirstarter pattern, payload-based `select`
- **Decision needed:** Refactor queries
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-004 — `/me` page uses raw headings, not `<Intro>`

- **Source A:** `app/(web)/me/page.tsx`
- **Source B:** Dirstarter page shell pattern
- **Decision needed:** Update page
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-005 — Cache pattern not applied to read queries

- **Source A:** Ronin queries using React `cache` only
- **Source B:** Dirstarter `"use cache"` + `cacheTag` + `cacheLife`
- **Decision needed:** Needs research; auth-scoped data risk
- **Status:** resolved
- **Resolved in:** SESSION_0059; public queries upgraded to `"use cache"` + `cacheTag` + `cacheLife`, auth-scoped queries intentionally kept with React `cache()`.

### D-006 — `packages/api-client` not installed in workspace

- **Source A:** SESSION_0016
- **Source B:** `pnpm-workspace.yaml`
- **Decision needed:** Run `pnpm install`
- **Status:** resolved
- **Resolved in:** SESSION_0060 confirmed no consumers; SESSION_0221 verified package installs correctly in workspace (`pnpm ls` shows `@ronin-dojo/api-client@0.0.1`). Kept for future use.

### D-007 — Dirstarter package identity vs Ronin identity

- **Source A:** `package.json` name field
- **Source B:** Project identity
- **Decision needed:** Rename later as transitional cleanup
- **Status:** resolved
- **Resolved in:** SESSION_0221; renamed `"name": "dirstarter"` → `"@ronin-dojo/web"` in `apps/web/package.json`. Updated `vercel.json` build command and `.claude/hooks/biome-unsafe-nudge.sh` filter references. All gates green.

### D-008 — Local `dirstarter_template/` inaccessible to remote agents

- **Source A:** SESSION_0016 L1 constraint
- **Source B:** GitHub/Codex context
- **Decision needed:** Document expected reference; consider committing key patterns as wiki pages
- **Status:** resolved
- **Resolved in:** SESSION_0039; `dirstarter-baseline-index.md` created.

### D-009 — ADR 0010 status conflict

- **Source A:** `0010-cache-strategy.md` said accepted
- **Source B:** SESSION_0018 said draft/proposed
- **Decision needed:** Revert to `proposed`; create cache risk register
- **Status:** resolved
- **Resolved in:** SESSION_0019

### D-010 — Program plan superseded by May 18 all-brand launch

- **Source A:** `program-plan.md`, 12-sprint MVP
- **Source B:** Brian directive SESSION_0019
- **Decision needed:** Lock launch strategy in SESSION_0020
- **Status:** resolved
- **Resolved in:** SESSION_0060; WORKFLOW_5.0 governs session calendar, program-plan layered architecture sections remain valid, frontmatter updated.

### D-011 — 13+ schema entities missing for full launch

- **Source A:** `SCHEMA_NEEDS_MANIFEST.md`
- **Source B:** `schema.prisma`, 31 models at the time
- **Decision needed:** Schema reconciliation in SESSION_0020
- **Status:** resolved
- **Resolved in:** SESSION_0059; manifest deprecated, all gaps addressed in `s2-schema-additions.md`.

### D-012 — Dirstarter source audit not completed

- **Source A:** SESSION_0019 plan
- **Source B:** none
- **Decision needed:** Carry to future session
- **Status:** resolved
- **Resolved in:** SESSION_0039; `dirstarter-baseline-index.md` inventoried 300+ files.

### D-013 — Admin auth behavior: 404 vs redirect

- **Source A:** `auth-hoc.tsx`, redirects to `/`
- **Source B:** `auth.md`, says 404
- **Decision needed:** Pick one and align both
- **Status:** resolved
- **Resolved in:** SESSION_0058; aligned to 404 via `notFound`.

### D-014 — Dirstarter `Tool` residue conflicts with monetization reuse

- **Source A:** `schema.prisma` TODO(remove-before-prod), MB-005
- **Source B:** `directory-monetization-roadmap.md`, active `/submit` and `/advertise` flows
- **Decision needed:** Decide quarantine, promotion, or replacement before production
- **Status:** resolved
- **Resolved in:** SESSION_0039; Option B, repurpose Tool to Directory Listing. See `dirstarter-baseline-index.md` section 14.

### D-015 — `wiki/log.md` claimed active append-only status but was stale since SESSION_0031

- **Source A:** `docs/knowledge/wiki/log.md` frontmatter/status
- **Source B:** Current closing/project practice uses SESSION files, Project Log, wiki index, and MB registry
- **Decision needed:** Mark old wiki log as superseded historical context
- **Status:** resolved
- **Resolved in:** 2026-05-08; `wiki/log.md` marked superseded. Routine docs/runbook changes should not be appended there.

### D-016 — Radix → @base-ui/react primitive runtime migration

- **Source A:** Ronin `apps/web/components/common/*.tsx` — 23 primitives on `radix-ui ^1.4.3` + `cmdk ^1.1.1` + `radix-ui` `Slot.Root` for `asChild` composition.
- **Source B:** Upstream `dirstarter_template @ 7e724b6 components/common/*.tsx` — 18 primitives on `@base-ui/react ^1.3.0` + `cmdk-base ^1.0.0` + custom `~/lib/slot.ts` util + `useRender` consumer API (`render={…}` replacing `asChild`).
- **Decision needed:** Migrate all Ronin common primitives to upstream's `@base-ui/react` runtime; remove `radix-ui` and `cmdk` from `apps/web/package.json` when complete.
- **Status:** closed. All 8 phases complete. `radix-ui`, `cmdk`, `cva`, `@radix-ui/react-accordion` removed from `apps/web/package.json`. Zero `radix-ui`/`cmdk`/`cva`/`asChild` residuals across `apps/web/`.
- **Opened:** SESSION_0209 (2026-05-20). Replaces the prior SESSION_0208 partial deferral for `<PopoverTrigger render={…}>` alone — that work is rolled into Phase 7 here.
- **Re-phased at SESSION_0210 bow-in (2026-05-20):** original Phase 2 framing assumed Box/Heading/AnimatedContainer were "mechanical Slot-only swaps." Bow-in audit proved upstream Box deletes the `Box` component (59 JSX + 14 internal consumers) and upstream Heading adopts `useRender` (140 `<Hn as="…">` rewrites). Only AnimatedContainer is mechanical. Phase 2 re-split into 2a (utils + AnimatedContainer + cva import sweep), 2b (Heading), 2c (Box). Phases 3-8 shift by 2 session targets (now SESSION_0213-0218).

#### Phase 1 — SESSION_0209 (2026-05-20) ✅ complete

- [x] Install `@base-ui/react ^1.3.0`, `cmdk-base ^1.0.0`, `tailwind-variants ^3.2.2` in `apps/web`.
- [x] Port `apps/web/lib/slot.ts` from upstream.
- [x] Reconcile `apps/web/components/common/toaster.tsx` (next-themes integration + CSS-variable styling).
- [x] Move `empty-list.tsx` from `components/web/` → `components/common/`; repath 10 import sites.
- [x] Migrate `separator.tsx` (Radix → `@base-ui/react/separator`; 0 `decorative` consumer sites).
- [x] Migrate `avatar.tsx` (Radix → `@base-ui/react/avatar`; 11 consumer sites unchanged).

#### Phase 2a — SESSION_0210 (2026-05-20) ✅ complete

- [x] Migrate `apps/web/lib/utils.ts` from `cva` package to `tailwind-variants` — re-export `tv as cva`, `cn as cx`, `VariantProps`; drop unused `compose`/`defineConfig`/`extendTailwindMerge` wiring. Keep `popoverAnimationClasses` Radix-state shape (Phase 7 will swap to Base UI semantics).
- [x] Migrate `apps/web/components/common/animated-container.tsx` (`Slot.Root` → `slot()` from `~/lib/slot`; 12 consumer sites unchanged).
- [x] Repath stray `import { cx } from "cva"` consumers (`apps/web/components/web/ads/ads-picker.tsx`, `apps/web/components/admin/sidebar.tsx`) onto `~/lib/utils`.

#### Phase 2b — SESSION_0211 (2026-05-20) ✅ complete

- [x] Migrate `apps/web/components/common/heading.tsx`. Adopt `useRender` + `render={…}` per upstream. Drop legacy `as` and `asChild` props.
- [x] Rewrite legacy Heading `as="…"` call sites to the new `render={…}` shape. Exact AST residual check found 211 direct Heading JSX tags plus 60 `IntroTitle` wrapper tags with 0 remaining `as`/`asChild` props, 61 direct Heading render callbacks, and 1 `IntroTitle` render callback. The prior 140-count handoff was treated as an estimate; residual AST/typecheck gates are the close proof.

#### Phase 2c — SESSION_0212 (2026-05-20) ✅ complete

- [x] Migrate `apps/web/components/common/box.tsx`. Delete the `Box` component and `BoxProps` export; upstream only ships `boxVariants`.
- [x] Refactor current `Box` / `BoxProps` consumers to inline `boxVariants` on a real element. Exact AST close proof found 0 remaining `<Box>` JSX tags and 0 `Box` / `BoxProps` imports; current tree has 12 `boxVariants` import consumers. The earlier 59-call-site handoff was superseded by exact current-tree AST counts.

#### Phase 3 — SESSION_0213 (2026-05-20) ✅ complete

- [x] Migrate Slot-only primitives with `asChild` consumer migration: `badge.tsx`, `card.tsx`, `stack.tsx`, `form.tsx`, `button.tsx`. Adopt `useRender` + `render={…}` API.
- [x] Additional `Slot.Root` → `slot()` cleanup landed in direct consumers (`command.tsx`, data-table/header/filter, web nav, dashboard table). `Slottable` intentionally retained for `nav-link.tsx` and `tag.tsx`.

#### Phase 4 — SESSION_0215 (2026-05-21) ✅ complete

- [x] Migrate `tooltip.tsx` from Ronin's Radix wrapper API to upstream Base UI compound parts.
- [x] Rewrite 43 legacy `<Tooltip tooltip="…">` wrapper call sites plus 3 provider call sites. Close proof found zero residual `tooltip`, `delayDuration`, `disableHoverableContent`, or `Tooltip.Provider` usage on imported Tooltip parts.

#### Phase 5 — SESSION_0214 (2026-05-21) ✅ complete

- [x] Migrate `hover-card.tsx` (PreviewCard rename + Positioner wrapper). `ToolHoverCard` now uses Base UI trigger `render` instead of Radix `asChild`.
- [x] Migrate `accordion.tsx` (depends on Phase 3 Card render-prop; `data-[state=*]` → `data-*`; `Content` → `Panel`).
- [x] Phase 5 intentionally ran before Phase 4 because bow-in counts showed Tooltip at 46 JSX tags across 25 files, while HoverCard + Accordion were 7 JSX tags across 2 files.

#### Phase 6 — SESSION_0216 (complete)

- [x] Migrate `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `label.tsx`.
- [x] Sanity pass on `field.tsx` and `button-group.tsx` (already L5-ported).
- [x] Consumer fixes: 4 DataTable select-all columns migrated from `checked="indeterminate"` to `indeterminate={bool}` prop.
- [x] Label dropped Radix `LabelPrimitive.Root` for plain `<label>`; preserved Ronin `labelVariants` + `isRequired`.

#### Phase 7 — SESSION_0217 (complete)

- [x] Migrate `dialog.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `select.tsx`, `drawer.tsx`.
- [x] Sweep `<PopoverTrigger asChild>` → `<PopoverTrigger render={…}>` across all call sites including data-table-faceted-filter, data-table-view-options, date-range-picker, combobox-selector (the L5-deferred work).
- [x] Sweep all `<DropdownMenuTrigger asChild>`, `<DialogTrigger asChild>`, `<DropdownMenuItem asChild>`, `<DialogClose asChild>` → `render={}` across ~55 consumer call sites.
- [x] Update `popoverAnimationClasses` constant in `apps/web/lib/utils.ts` to Base UI semantics (`data-open`/`data-closed`, `--transform-origin`).
- [x] Fix Select `onValueChange` type signatures (`value: unknown` → cast `as string`).
- [x] Fix consumer `data-[state=open]` → `data-open` selectors.

#### Phase 8 — SESSION_0218 (2026-05-21) ✅ complete

- [x] Migrate `command.tsx` (cmdk → cmdk-base; 1 import line + `border-0` class addition).
- [x] Migrate `tabs.tsx` (Radix → `@base-ui/react/tabs`; `data-[state=active]` → `data-selected`).
- [x] Migrate 5 `web/ui/` Slot consumers (`tile.tsx`, `container.tsx`, `nav-link.tsx`, `tag.tsx`, `sticky.tsx`) from `Slot` (radix-ui) → `useRender` + `render={…}` per upstream. `navLinkVariants` upgraded to cva `slots` API with `affix` slot.
- [x] Consumer `asChild` → `render={}` sweep: layout.tsx, [slug]/page.tsx, pagination.tsx, bottom.tsx, tag-card.tsx, category-card.tsx, user-menu.tsx, theme-switcher.tsx, header.tsx (9 consumer sites).
- [x] Consumer `navLinkVariants()` → `navLinkVariants().base()` fixes (footer.tsx, pagination.tsx).
- [x] Delete `slottable.tsx` (zero consumers after nav-link/tag migration).
- [x] Install `@dirstack/utils`; nav-link.tsx switched from deprecated `@primoui/utils`.
- [x] Build new admin Cmd+K palette (`apps/web/components/admin/command-palette.tsx`), wired into admin shell.
- [x] Remove `radix-ui`, `cmdk`, `cva`, `@radix-ui/react-accordion` from `apps/web/package.json` (−66 packages).
- [x] Full sweep: zero residual `radix-ui`/`cmdk`/`cva`/`asChild` imports across `apps/web/`.
- [x] tsc pass, biome pass, 244 tests pass, build pass, wiki-lint 0 errors.

#### Follow-up (SESSION_0333) — migration scanned imports, not Menu.Item semantics

The D-016 residual sweep checked for radix *imports* but missed a *semantic* difference: Radix `Menu.Item` fires `onSelect`; Base UI `Menu.Item` fires **`onClick`** and has no `onSelect` (it resolves to the `<div>` text-selection event — typechecks, never fires). SESSION_0333 found the lineage on-card actions menu was silently dead from this (fixed), and the same dead `onSelect`-without-`onClick` pattern in ~6 admin action menus (`components/admin/tournaments/registration-actions.tsx`, `app/admin/leads|tools|tags|categories/_components/*-actions.tsx`). **Status:** closed — SESSION_0334 swept all 11 instances across 6 files (the file list undercounted: `app/admin/users/_components/user-actions.tsx` had it too) to `onClick`-only, and added a `bun test` regression guard (`apps/web/components/common/dropdown-menu.guard.test.ts`) that fails CI if any `DropdownMenuItem` reintroduces `onSelect`. Confirmed at Base UI source that `Menu.Item` activates on `onClick` for pointer + keyboard (it synthesizes a click via `useButton`), so `onClick`-only is sufficient. Tracked-resolved in [`wiring-ledger.md`](wiring-ledger.md) (WL-P1-3 ✅).

### D-017 — `updateOrganization` auth diverges from org-settings access model

- **Source A:** `apps/web/server/web/school/actions.ts` — `updateOrganization` gates on a Membership with role code `OWNER` (a role-assignment).
- **Source B:** `apps/web/server/web/organization/org-admin-access.ts` — `hasOrgAdminAccess` / `assertOrgAdminAccess` (org `ownerId` OR `ORG_ADMIN` role), used across org settings (theme, members, invites, general-info).
- **Decision needed:** Consolidate `updateOrganization` onto `assertOrgAdminAccess` and retire the OWNER-role check, so the dashboard school-form and the settings surface share one auth model. An `ownerId` owner without an `OWNER` role-assignment currently passes the settings gate but would fail `updateOrganization`.
- **Status:** closed
- **Opened:** SESSION_0298 (2026-05-29). **Closed:** SESSION_0300 (2026-05-29). `updateOrganization` now uses `assertOrgAdminAccess` — same auth model as all org settings surfaces. The OWNER role-assignment check is retired.

### D-018 — CUTOVER "test card on Baseline" assumed test-mode prod; prod is live-mode

- **Source A:** `CUTOVER_CHECKLIST.md` §"Baseline staging-prod proxy procedure" step 4 — "run the same lineage membership tier shape on Baseline with a test-mode Stripe card".
- **Source B:** `.env.production.local` Stripe key prefix `sk_live` (Baseline prod is live-mode); MB-013 / SESSION_0171 corroborate live-key intent.
- **Decision needed:** A test card cannot run against live-mode prod (rejected; a real card = real money). Prove the real signed-webhook path off prod (Stripe CLI local test-mode rehearsal — done SESSION_0345 — or a Preview deploy); the deployed prod domain gets only a money-free webhook-destination/secret verification + a launch-day real-charge-and-refund smoke decision.
- **Status:** resolved
- **Resolved in:** SESSION_0345 — CUTOVER proxy step 4 corrected; rehearsal procedure documented in `stripe-setup-runbook.md`; bug caught in the same rehearsal tracked as `SESSION_0345_FINDING_01`.

### D-019 — Tier ladder still documented BASIC and code lacked LEGEND lineage policy

- **Source A:** `docs/architecture/decisions/0012-tier-auto-grant.md` — qualifying tier table still listed `BASIC`
  level 1 and `LEGEND` level 4.
- **Source B:** SESSION_0349 operator direction — `basic` should be retired; `legend` is the all-features,
  free-for-life tier used across brands for lifetime cohorts.
- **Decision needed:** Retire `BASIC` from active tier docs and recognize `LEGEND` in lineage policy code without
  expanding checkout/webhook/seed migration in this trust-badge session.
- **Status:** resolved
- **Resolved in:** SESSION_0349 — ADR 0012 tier-auto-grant table removed `BASIC`; lineage comp/policy helpers recognize
  `LINEAGE_LEGEND`; broad checkout/webhook/seed migration deferred to a follow-up.

### D-020 — Overlapping enum vocabularies (visibility / lifecycle-status / tier)

- **Source A:** `apps/web/prisma/schema.prisma` enums — three visibility vocabularies coexist:
  `DirectoryVisibility { HIDDEN, MEMBERS_ONLY, PUBLIC }`, `LineageVisibility { PUBLIC, UNLISTED, RESTRICTED, PRIVATE }`,
  and `Organization` (no visibility enum — brand-scoped + `isPublished`/listing tier only).
- **Source B:** ~6 lifecycle enums share the `ACTIVE / EXPIRED / CANCELLED`(+variant) shape —
  `MembershipStatus`, `SubscriptionStatus`, `EntitlementStatus`, `CertificationStatus`, `ContractStatus`,
  `EnrollmentStatus` — and two tier vocabularies coexist: `ToolTier { Free, Standard, Premium }` (PascalCase, Tool
  substrate) vs the profile/lineage tier string union `free | premium | elite | legend` (code-only, lowercase).
- **Decision needed:** none forced. The visibility enums are semantically distinct (member-gating vs web-style
  unlisted/restricted), the lifecycle enums are domain-distinct (a membership ≠ a subscription ≠ an entitlement), and the
  tier vocabularies sit on different substrates — so consolidation is a deliberate cross-domain migration, not a quick win.
  Recorded here as the consolidation backlog; `DirectoryFacetResult` (SESSION_0350) deliberately added **no** enum
  (presentation-only TS union `"person" | "organization" | "lineageTree"`).
- **Status:** documented (deferred)
- **Logged in:** SESSION_0350 — enum inventory taken during the faceted `/directory` grill; operator chose document-only.
  Revisit if/when a session has a concrete reason to unify one vocabulary (most likely the tier dualism, building on the
  SESSION_0349 `legend` work).

### D-021 — oRPC: governing docs contradict; the deciding ADR was never written

- **Source A:** `docs/architecture/uplift/epic-2026-05-19.md` — locks *"oRPC stance: ADR_0019 + lineage canvas pilot (3 sessions)"* → do a pilot.
- **Source B:** `docs/knowledge/wiki/dirstarter-gap-audit.md` line 124 — *"No migration to oRPC planned. Deliberate long-term choice."* → don't. And `dirstarter-baseline-index.md` §13k — *"ADR-level at L10; ADR required before implementation"* → undecided.
- **Decision needed:** the deciding ADR was never written ("ADR_0019" was reused for membership-lifecycle), and the pilot lanes (L10–L14) were displaced by the Base UI migration (L6) ballooning to 8 phases. oRPC sits undecided + unbuilt (`@orpc/*` + `@tanstack/react-query` absent; no `/api/rpc`), while misremembered as "done." Toolchain is already modern (Next 16 / React 19), so no bump blocks it.
- **Status:** resolved
- **Resolved in:** SESSION_0356 — **ADR 0024** (`0024-orpc-vs-next-safe-action.md`, status `proposed`): hybrid + scoped lineage-canvas pilot; next-safe-action stays default; no mass migration. Awaiting operator ratification.

### D-022 — `LineageProfileDetailRenderPolicy` is unused by the lineage profile drawer

- **Source A:** `apps/web/lib/entitlements/lineage-tier-policy.ts` — `LineageProfileDetailRenderPolicy` (FREE = `bio`/`rankHistory`/`organizations`/etc. `false`) is defined and **unit-tested** (`lineage-tier-policy.test.ts`).
- **Source B:** `apps/web/components/web/lineage/lineage-profile-drawer.tsx` — consumes **no** detail policy (only `isAdmin`); the drawer shows the full public profile to any viewer. The detail policy is consumed **only** by the directory (`server/web/directory/profile-projection.ts`, `directory/queries.ts`, `search-profiles.ts`).
- **Decision needed:** none — operator ruled (SESSION_0356) **funnel-first**: the drawer's full public view for everyone is intended (discovery→claim), and it is **not** a privacy leak (the server payload allowlist is the real boundary — guarded by `queries.visibility.test.ts`). The detail policy is therefore intentionally directory-only.
- **Status:** documented (accepted)
- **Logged in:** SESSION_0356 — surfaced while verifying the drawer-gate removal (FINDING_01). The operator's "tier gates the drawer's contents" assumption was false *for the drawer*; intent confirmed as full-public-view. Cleanup option (delete the now-directory-only detail policy or rename it `Directory…`) left as a non-urgent backlog item.

### D-023 — Person identity fragmented across Membership / DirectoryProfile / LineageNode (vs documented Passport SoT)

- **Source A (documented intent):** `docs/knowledge/wiki/concepts/passport-and-shells.md` — **Passport** is the global identity SoT; DirectoryProfile is a presentation *view*; rank/affiliation are contextual shells.
- **Source B (impl drift):** the same person is read from different stores per surface — the black-belt-rail read `Membership.rank` (empty for BBL), `/directory` reads `DirectoryProfile` (empty for BBL placeholders), lineage reads `LineageNode`/`RankAward`. No store was canonical; the documented Passport+Shells model was never enforced, so surfaces render different/empty people.
- **Decision:** consolidate onto Passport (operator-ratified SESSION_0357). `RankAward` = single rank source (+ `source`/`verificationStatus`); new `Affiliation` model = person↔org (display-only); school is NOT `Membership` for BBL.
- **Status:** in progress — schema foundation landed (SESSION_0357 TASK_02); read-repoint (TASK_04) + add-person (TASK_03) + discoverability (TASK_05: link `passport-and-shells` at bow-in) carry forward. **Editor layer paid down (SESSION_0398):** the owner self-edit surface had drifted into two divergent editors over the same Passport+DirectoryProfile (`/me`'s `PassportEditor` + `/app/profile`'s `ProfileForm`) via two query-helper pairs; collapsed to one `PassportEditor` over the one `server/web/passport/queries` path — the duplicate `ProfileForm` + the `findUserPassport`/`findUserDirectoryProfile` dashboard pair retired.
- **Logged in:** SESSION_0357. Sibling pattern: brand-color had the same two-layer shape (DB `BrandSettings` overrides `styles.css`) — resolved as intended (DB canonical + admin-editable), documented in `baseline-design-system.md`.

### D-024 — Deploy toolchain is bun; deploy runbooks still say pnpm

- **Source A (impl):** active `apps/web/vercel.json` uses `bun install --frozen-lockfile` + `bun run --filter @ronin-dojo/web …`; the lockfile contract is `bun.lock`.
- **Source B (docs):** `docs/runbooks/deploy/vercel-deploy.md` + `vercel-domain-setup-runbook.md` describe a **pnpm** monorepo (`corepack pnpm@9.0.0 install --frozen-lockfile`, "commit `pnpm-lock.yaml` or the build silently fails"). Stale.
- **Impact:** a session trusting the runbook would chase a pnpm lockfile that isn't the gate.
- **Status:** **RESOLVED SESSION_0454.** Flipped `vercel-deploy.md`, `vercel-domain-setup-runbook.md`, and
  `bbl-production-runbook.md` (cross-ref descriptors) to the bun toolchain — `bun install --frozen-lockfile`
  + `bun run --filter @ronin-dojo/web db:generate && … build`, gate `bun.lock` — verified against the live
  `apps/web/vercel.json`. **Logged in:** SESSION_0407. **Also resolved this session (fold-in):** the
  `ignoreCommand` lockfile name `pnpm-lock.yaml` → `bun.lock` in `CLAUDE.md` and
  `docs/runbooks/dev-environment/verification-and-testing.md:115` (now matches the live `vercel.json`
  `ignoreCommand`), and `sop-email-runbook.md`'s email-preview command `pnpm --filter @ronin-dojo/web email`
  → `bun run --filter @ronin-dojo/web email`.

### D-025 — Media-pull script slugifies keys; profile import resolves by exact basename

- **Source A:** `apps/web/scripts/import-bbl-wp-media.ts:305` builds the S3 key via `slugify(basename)` → lowercased (`old-school-bob.jpg`).
- **Source B:** `apps/web/scripts/import-bbl-lineage-profiles.ts:277` (`resolveProfileMedia`) builds the avatar URL from the **exact, case-preserved** basename (`Old-school-Bob.jpg`). R2 keys are case-sensitive.
- **Impact:** uploading avatars via the media-pull script would 404 every imported avatar. SESSION_0407 worked around it with name-preserving `aws s3 cp`. The two SESSION_0403 scripts were meant to pair but disagree.
- **Status:** open — fix the slugify path in `import-bbl-wp-media.ts` (or retire it for `aws s3 cp`). **Logged in:** SESSION_0407 (FINDING_01).

### D-026 — Full-member importer's Affiliation step is not idempotent

- **Source:** `apps/web/scripts/import-bbl-members-full.ts` (Affiliation create) — a post-run `--dry-run` still
  reports "Affiliations: 4 would create" although those rows exist; every other step correctly reports 0 creates.
- **Impact:** re-running the **real** import would insert duplicate `Affiliation` rows (no `findFirst` dedup on
  `{passportId, organizationId}` before create). Harmless to reads, dirties data.
- **Status:** **RESOLVED SESSION_0409.** The real-run path already had the `findFirst({passportId, organizationId})`
  guard (committed at 0408 close; the finding/impact line was stale). The actual defect was the **dry-run counter**
  unconditionally counting matched schools as "would create" — fixed so a post-run dry-run reports accurate
  new-only counts (proven against prod: a re-run dry-run shows 0 affiliation creates for existing rows).

### D-027 — WP school-name matching too strict (punctuation / pod-id)

- **Source:** `import-bbl-members-full.ts` maps a person's `school` to an Organization by exact name; 4/8
  resolved. Misses: `"South Bay Jiu Jitsu"` (export) vs `"South Bay Jiu-Jitsu"` (canonical), `"Mat Fitness"`
  (absent from the `bbl_school` export), `"231"` (a stray Pods post-id, not a name).
- **Impact:** unmatched members keep a `schoolName` free-text fallback but no Organization-linked Affiliation,
  so they don't appear under the school's org facet.
- **Status:** **RESOLVED SESSION_0409.** Added `normSchool()` (strip punctuation/case, expand `&`) +
  `matchSchoolForPerson()` (skips numeric Pods post-ids; warns only on real unresolved tokens). Verified against
  prod: "South Bay Jiu Jitsu" now resolves to "South Bay Jiu-Jitsu" (2 South Bay affiliations realized for
  Brian Scott + Bob Bass); "231" silenced; only "Mat Fitness" (genuinely no org) still warns.

### D-028 — SESSION_0408 import captured only ~8 of 95 `bbl_member` Pods fields (full provenance missed)

- **Source:** `reconcile.mjs` (SESSION_0408) consumed a thin WP export — name, rank-string, school, instructor,
  bio, featured image, email. The **`bbl_member` Pods CPT has 95 fields**, including the entire per-belt
  **promotion ladder** (`<belt>_promotion_date`, `who_promoted_you_to_<belt>`, `where_you_were_promoted_to_<belt>`,
  `<belt>_pictures`) — the lineage-timeline USP — plus galleries, rank-with-degree, school roles, DOB, residence,
  socials, current_rank. All confirmed populated for the core figures (live Pods CSV exports + `local.sql` postmeta).
- **Impact:** prod members have rank-only RankAwards (no dates/promoters); the timeline can't show "Promoted by X ·
  date · at Y". The directory is missing real provenance, galleries, and profile depth.
- **Status:** **planned** — see [`BBL_PODS_FULL_IMPORT_SPEC.md`](../../product/black-belt-legacy/BBL_PODS_FULL_IMPORT_SPEC.md).
  SESSION_0409 proved Phase 0 (the `reconcile-pods.mjs` extractor resolves real dated/attributed ladders from the
  rich Pods CSVs). The promotion ladder maps onto the **existing** `RankAward` schema (no migration for the core
  timeline); secondary fields (residence/galleries/sizes) need a small Phase 1 migration. **Logged in:** SESSION_0409.

### D-029 — Lineage "current rank" had three disagreeing sources of truth (SESSION_0430, resolved)

- **Source:** the profile drawer/canvas/focus card read rank from up to three places that disagreed:
  free-text `LineageNode.bio` vs structured `Passport.rankAwardsEarned[0]` vs the editorial
  `LineageTreeMember.selectedRankAward` FK. `[0]` was ordered `awardedAt desc` (Postgres NULLS-FIRST
  floated null-dated lower belts to the top); `selectedRankAward` overrode `[0]` for the header/canvas
  with stale importer values; and `Rank.sortOrder` for base "Black Belt" was corrupt (31, above Red 10th).
- **Impact:** 7 of 10 multi-award founders displayed a lower belt than awarded (e.g. David Meyer "Black
  Belt 5th" instead of "Coral 7th"); bio and structured rank visibly contradicted.
- **Status:** **resolved** — [ADR 0035](../../architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md):
  structured `RankAward` canonical, bio narrative-only; display = highest *awarded* belt by sortOrder;
  `selectedRankAward` repurposed as a pending claim (not a display override); `sortOrder` corrected.
  Code + prodsnap data fixed and live-verified. **Follow-up:** re-run the data script on prod Neon.
  **Logged in:** SESSION_0430.

### D-030 — seed-baseline-lineage.ts drifted from SESSION_0430 SQL corrections (SESSION_0432)

- **Source:** the SESSION_0430 roster corrections (Bill Hosken→BB5th + bio, Jerry Smith→Black Belt,
  Rikki→4th, base "Black Belt" sortOrder, Posnik/Poznik + Brian Scott merges, Andre TKD, Rorion R9)
  were applied via one-off SQL to prodsnap + prod, but **never folded back into
  `apps/web/prisma/seed-baseline-lineage.ts`**. The seed still has Bill Hosken as "Coral Belt",
  still contains `chris-posnik` (merged/deleted), etc., and is upsert-based.
- **Impact:** running the full seed would **regress** the 0430 corrections (re-create the deleted
  duplicate, reset ranks). Safe today because prod deploy is migrate-only, not seeded (D-024) — but
  the seed is a latent regression and cannot be run to apply Hélio/Rorion without reconciliation.
- **Status:** **resolved** (SESSION_0433, PR #161, FI-008). `seed-baseline-lineage.ts` reconciled with
  the 0430/0432 corrections — data folded in (Hosken→BK5, Jerry→base Black Belt, Poznik replaces
  chris-posnik, Rikki→BK4, Hélio node) plus imperative corrective blocks (B1/B2 award fixes, C1/C2
  identity merges) that self-heal stale data on run. **Verified:** ran the seed against prodsnap (which
  held the corrected state) — all 5 corrections survived (no regression), Hélio created, base "Black
  Belt" sortOrder = 21; 210 lineage tests pass. The seed is now safe to run again.
  SESSION_0432 had worked around it surgically (`scripts/data/SESSION_0432-helio-rorion-promoter-link.sql`).
  **Logged in:** SESSION_0432; **resolved in:** SESSION_0433.

### D-031 — `profileClaimSelect` selected the Phase-3c-removed `DirectoryProfile.user` relation (SESSION_0438, resolved)

- **Source:** `apps/web/server/admin/claims/claim-queries.ts` `profileClaimSelect` selected
  `directoryProfile.user.{name,isPlaceholder,passport.displayName}`, but Phase 3c (SESSION_0392)
  dropped the `DirectoryProfile.user` satellite relation (Passport became the identity root).
- **Impact:** `findPendingProfileClaims` / `findProfileClaimById` threw `PrismaClientValidationError`
  on every render — the admin/manager profile-claim queue (`/app/claims`) had been **500ing since
  Phase 3c**, latent because the page wasn't exercised until P5's org-only filter hit it.
- **Status:** **resolved** (SESSION_0438). `profileClaimSelect` now reads
  `directoryProfile.passport.displayName` (identity SoT, ADR 0025); `profileClaimSubjectLabel`
  updated to match. `/app/claims` renders green (browser-verified, 0 console errors).
  **Logged + resolved in:** SESSION_0438 (surfaced during ADR 0036 P5).

### D-032 — `/admin` and `/app` admin route trees are duplicated and drifting (SESSION_0441, partially resolved)

- **Source:** the platform-admin `app/admin/*` route tree and the org-admin `app/app/*` tree carry
  near-duplicate pages; `/admin/*` largely 308-redirects to `/app/*` already (noted SESSION_0438). The
  copies have **drifted**: `/admin/lineage/claims/[id]` rendered a "Claimed Rank" card that its
  `/app/lineage/claims/[id]` twin (the surface the operator actually lands on) lacked. fallow flags ~7
  more dup pairs: `tool-form`, `pricing-plan-form`, `tool-publish-actions`, lineage `[treeId]`, merch
  orders, `subscription-form`, `category-form`.
- **Impact:** two-sources-of-truth — a fix applied to one tree silently misses the other; the operator
  sees the stale `/app` copy.
- **Direction:** operator (SESSION_0441) — **`app/admin/*` (the ROUTE tree) is being retired; only
  `app/app/*` remains.** `server/admin/*` modules stay (server logic, not routes).
- **Status:** **partially resolved** (SESSION_0441) — the lineage-claim review was consolidated into one
  shared `ClaimReviewDetail` **relocated under `/app`** (the `/admin` page is now a thin wrapper that
  deletes cleanly at the purge); this also backported the missing Claimed Rank card to `/app`. The
  remaining ~7 dup pairs + the full `/admin` route removal are a dedicated migration (SESSION_0442+).
  **Logged in:** SESSION_0441 (operator direction also recorded in session memory).
- **Topology finding (SESSION_0442 — sharpens the remaining work):** the consolidation is NOT a delete,
  it is a **component-topology migration.** Every `/admin/*` route is already redirect-shadowed via
  `config/app-redirects.ts` (`MIGRATED_ADMIN_APP_ROUTES`; `curl /admin/tools` → 308 → `/app/tools`), so
  the `app/admin/*/page.tsx` files are **dead/unreachable** — BUT the `app/admin/*/_components/*` are
  **LIVE**: ~20 live `app/app/*` pages import them via `~/app/admin/...`. So the dead `page.tsx` files
  can be deleted, but the shared `_components` must first be **moved to `/app` and their ~20 importers
  repointed**. **Exception:** `app/admin/task-board` is live (no redirect, no `/app` twin) — keep it.
  TASK_04 was scoped + **deferred to its own PR** (operator decision SESSION_0442); the claim wrapper was
  NOT deleted this session (deferred with the rest so it lands atomically with the move).

### D-033 — Two divergent BBL lineage trees; public page showed the thin clone (RESOLVED SESSION_0444 — applied on prod)

- **Source:** BBL had TWO `LineageTree` rows — `bbl-lineage` (the real 77-member WP roster, Rigan-rooted
  via edges but with `defaultRootMemberId`/`disciplineId` unset and 0 visual groups) and the cloned
  `rigan-machado-bjj-lineage` (20 curated members WITH the bjj discipline + Dirty Dozen / Coral Belt
  groups). The public discipline embed rendered the **thin clone**, not the full roster.
- **Impact:** the public lineage page showed 20 curated members instead of the real 77; the full roster
  was un-rendered dark data. The clone was produced by the now-dead Baseline→BBL brand projection in
  `seed-bbl-org.ts` (vestigial under single-brand collapse).
- **Resolution (SESSION_0443):** `scripts/consolidate-rigan-machado-tree.ts` makes `bbl-lineage`
  canonical — sets root + discipline, migrates the visual groups (the Dirty Dozen group also drives the
  lifetime-comp decision in `claim-finalize`, so it MUST carry over), renames slug → `rigan-machado-lineage`,
  unpublishes the clone. Idempotent, backup-on-apply, `--rollback` proven on prodsnap. Code repointed
  (brand-agnostic embed, join href, script defaults; `seed-bbl-org.ts` slimmed to just the BBL Org).
  Browser-verified on prodsnap.
- **Status: RESOLVED (SESSION_0444, PR #162 merged `720a54da`).** Consolidation APPLIED on prod: `bbl-lineage`
  renamed → `rigan-machado-lineage` (77 members, root Rigan, bjj discipline), the clone unpublished, 3 visual
  groups migrated. Backup `/tmp/rigan-consolidate-backup-1782331827952.json`.
- **Prod/prodsnap-drift lesson:** prod actually carried a SECOND published `rigan-machado-bjj-lineage` clone
  (17 members) **plus** a standalone `bbl-dirty-dozen` tree (7) that prodsnap (where the script was validated)
  did NOT have, so the single-clone consolidation script silently missed them; both were unpublished by hand
  (the Dirty Dozen is now a visual group). Lesson: after a prodsnap-validated data migration, audit the FULL
  prod table, not the script's self-report.

### D-034 — Founding ancestors absent from the canonical published lineage tree (SESSION_0457)

- **Source:** while scoping WL-P2-21, `apps/web/scripts/audit-clone-member-coverage.ts` showed the published
  `rigan-machado-lineage` (77m) **omits Carlos Gracie Sr, Carlos Gracie Jr, Erik Paulson, Rick Minter** — these
  4 exist ONLY on the now-pruned unpublished `rigan-machado-bjj-lineage` clones (BBL 16m + BASELINE 17m),
  with `onCanonical:false / lastPlacement:true`.
- **Impact:** the public canonical tree lacks the Gracie roots above Rigan; the 4 are publicly invisible
  (their sole home is unpublished). Also **blocks safe retirement of the clone trees** — deleting them would
  orphan these 4 (drop their last `LineageTreeMember`), which is why SESSION_0457 removed only Brian's
  redundant memberships and **kept the clone trees**.
- **Status: ✅ RESOLVED (SESSION_0508).** `scripts/migrate-founders-to-canonical.ts` (rehearsed on prodsnap,
  render-verified, JSON-backup + rollback) placed all 4 founders onto the published canonical tree (77→80):
  Carlos Gracie Sr (root) → Carlos Gracie Jr → Rigan, Erik Paulson + Rick Minter under Rigan; Erik was a
  swap-in-place (repointed the 0493 placeholder member to the rich `erik-paulson` node, deleted the dup).
  `defaultRootMemberId` repointed to Carlos Sr. Prod coverage audit post-apply: **0 not-on-canonical, 0
  would-be-orphans** on both clones → unblocked the clone retirement (WL-P2-21, also resolved SESSION_0508 via
  `scripts/remove-residual-lineage-clones.ts`). Backup: `/tmp/migrate-founders-backup-1783453504203.json`.
  Follow-up (separate): the repointed `erik-james-paulson` directory slug was renamed to `erik-paulson`
  (`scripts/fix-lineage-dedup-followups.ts`).

### D-035 — Community feed duplicates the blog feed's pill-tab + row shells (SESSION_0493)

- **What:** `components/web/community/community-feed.tsx` carries verbatim copies of the blog feed's
  pill-tab/toggle classes (`components/web/posts/post-feed.tsx:52–68`), and `community-post-row.tsx` is a
  ~85% structural duplicate of `posts/post-row.tsx` (same `Card isRevealed` shell / thumbnail / byline).
  Deliberate at build time (Desi §5: "the divergences — flair, share, admin — are real"), but two
  hand-rolled implementations of the same visual pattern WILL drift.
- **Why it matters:** the third feed (Baseline/WEKAF or any catalog surface) would mint a third copy —
  the exact horizontal-drift failure the design-system doctrine exists to prevent.
- **Fix shape:** extract a shared `FeedFilterTabs`/pill-tab helper (a `components/web/ui/*` candidate)
  consumed by both feeds; consider one slotted feed-row over `Card` behind it.
- **Status: RESOLVED (SESSION_0495, Epic C C2-1).** Extracted `components/web/ui/feed-filter-bar.tsx` — the
  shared presentation-only sticky tabs/toggle bar — now consumed by BOTH `community-feed.tsx` and
  `post-feed.tsx`; the verbatim ~90-line dup is gone and the C1 mobile fixes (sticky/edge-fade/style-facet)
  land once, so `/blog` inherits them. Filter state stays in each feed (the blog precedent); feed-specific
  controls go through the bar's `trailing` slot. Verified by Giddy (9.6) + Desi (9.6). (The row-shell dup
  `community-post-row`↔`posts/post-row` was NOT merged — deliberate, the divergences are real; row extraction
  stays a future call if a third feed lands.)

### D-036 — `isAdmin` consolidation incomplete: two residual forks + an undecided admin-route (SESSION_0495)

- **What:** Epic C's C2-8 consolidated the client admin check onto the db-free `isAdmin`
  (`lib/authz-predicates.ts`, re-exported by `lib/authz.ts`) across `nav-sheet`, `user-menu`, `search`. Two
  residuals remain: (a) `components/admin/auth-hoc.tsx:25` still hand-rolls `session.user.role === "admin"`
  (pre-existing, not this session's diff); (b) `components/common/search.tsx:83-88` carries a fenced
  `isAdminPath = pathname.startsWith("/admin")` for search-result `[slug]` admin-detail hrefs — those detail
  routes exist under **neither** `/admin` nor `/app`, so it's dormant (`/admin` 308s to `/app`) but needs a
  target-route decision before the branch can be repaired-or-deleted.
- **Why it matters:** one predicate with two import doors is the goal; every residual fork is a place admin
  visibility can silently diverge. Ruled ACCEPT+log by Giddy this session (dormant, not a live hole).
- **Fix shape:** migrate `auth-hoc.tsx` to `isAdmin`; decide the admin-detail route target, then repair or
  delete the `isAdminPath` branch in `search.tsx`.
- **Status: OPEN** (LOW — opportunistic; no live security impact).

### D-037 — Feed fetch bound divergence: community capped, blog unbounded (SESSION_0495)

- **What:** Epic C capped `findCommunityPosts` at `take: FEED_TAKE = 100`
  (`server/web/community/queries.ts`, a Petey-ratified MVP safety bound), but the sibling blog
  `findPublishedPosts` (`server/web/posts/queries.ts:27`) stays unbounded. Also `posts/page.tsx:82`'s hero
  total under-reports once the table exceeds `FEED_TAKE`.
- **Why it matters:** the two feeds now disagree on a scalability guard; the blog bound + real cursor
  pagination are the same follow-up. Left per plan scope (blog volume is staff-controlled, low risk today).
- **Fix shape:** cursor pagination on both feed queries when volume warrants; the hero-count under-report
  resolves with it.
- **Status: OPEN** (P3 — deferred until post volume warrants).

### D-038 — Seed-drifted local BrandSettings rows (SESSION_0496) — RESOLVED, mechanism corrected

- **What (as found):** local `BrandSettings.accentColor` for BBL (+ WEKAF) carried `"51 100% 50%"` (the
  SESSION_0357 wrong-tear-sheet gold) while the checked-in `scripts/seed-brand-settings.ts` ratifies
  `accentColor: null`. SESSION_0496 hit it as a ~1.4:1 selected-row contrast bug that looked like CSS; the
  root cause was the data layer.
- **Mechanism correction (verified at close):** the hypothesized "prodsnap re-imports the drift" was WRONG —
  the pre-seed prod read showed `BrandSettings` **empty** (prod ran on the clean `styles.css` fallback). The
  stale rows were local-only pre-ratification leftovers that no snapshot refresh had replaced.
- **Resolution:** local reseeded mid-session; prod seeded at close on operator GO (TD-003 ✅) — both now
  hold the ratified rows (red primary, null accents), post-run reads verified. No re-drift vector remains:
  prod is the SoT prodsnap copies, and prod now matches the seed.
- **Lesson:** a two-sources-of-truth bug needs BOTH sources read before the mechanism is asserted.
- **Status: RESOLVED** (SESSION_0496).

### D-039 — `DrawerFooter.hasClaim` mirrors `ClaimCtaButton`'s render conditions (SESSION_0497)

- **What:** in `apps/web/components/web/lineage/lineage-profile-drawer/index.tsx`, `DrawerFooter` computes a
  `hasClaim` boolean (`CLAIMED_MINE || PENDING_MINE || (UNCLAIMED && isClaimable && isTreeClaimable && treeSlug)`)
  that hand-mirrors the three internal `if` branches of `ClaimCtaButton` — two sources of truth for "does the
  claim CTA render."
- **Risk:** add a 6th claim state or loosen a condition in `ClaimCtaButton` and forget `hasClaim`, and you get
  either an empty bordered footer (border + padding, no button) or a suppressed CTA — a silent visual bug CI
  won't catch. Correct today (both live in one file/screen), so drift is currently visible.
- **Fix direction (Giddy):** make `ClaimCtaButton` the single source — render it and let it return `null`, then
  decide the container on "did either child produce output." Low severity.
- **Status: OPEN** (follow-up; bundle into any lineage-drawer touch).

### D-040 — `passport-and-shells.md` carries a stale "Passport → User (1:1)" + a 2026-04 open question (SESSION_0498)

- **What:** `docs/knowledge/wiki/concepts/passport-and-shells.md` still states the Passport→User link as a
  strict 1:1 and carries an unresolved RankAward open question from 2026-04. Both predate the ratified model:
  `Passport.userId` is **nullable `@unique`** (an accountless Passport IS the placeholder person — ADR 0025;
  claim binding ADR 0032), and the RankAward question was settled by ADR 0035/0043 (awarded truth; Passport-keyed
  provenance). Surfaced by the Giddy passport/node research-review
  (`docs/architecture/research/research-review-passport-node-id.md`).
- **Risk:** the concepts page is identity-canon read-path material (opening.md step 3) — a fresh agent reading
  "1:1" could design a surface assuming every Passport has a User, re-introducing the placeholder-person class
  of bug. Low likelihood (ADR 0025 is also in the read-path and wins), but it's a canon page contradicting canon.
- **Fix direction:** one-line correction ("1:0..1 — `userId String? @unique`; accountless Passport = placeholder
  person") + resolve/remove the stale open question with pointers to ADR 0035/0043. Next wiki sweep; not a code
  change.
- **Status: OPEN** (wiki-sweep one-liner; flagged from SESSION_0498 bow-out).

### D-041 — local `.env` S3 endpoint points at Next itself; MinIO down → all local media uploads fail (SESSION_0499)

- **What:** `apps/web/.env` has `S3_ENDPOINT="http://localhost:3000"` + `S3_PUBLIC_URL="http://localhost:3000/ronindojo-dev"` — the runbook (`local-dev-auth-storage.md` §1) says MinIO on **:9000**. :3000 is the Next dev server, so every local media upload dies with an S3 XML-deserialization error (the SDK parsing Next's HTML 404). Docker daemon (MinIO host) was also down at discovery.
- **Risk:** any local upload-path work silently blames the code (the 0499 uploader verification had to build a session-local S3 shim on :9100 + a corrected private worktree `.env` to proceed). Prod unaffected (R2).
- **Fix direction:** restore the runbook values in the operator's `.env` + `docker compose up -d minio minio-init`. Operator's call (agents must not edit the canonical `.env` — [[operator-script-caution]] + env is gitignored).
- **Status: OPEN** (operator action; workaround pattern documented in SESSION_0499 findings).

### D-042 — ADR 0045 D5 lists `/app/leads-pipeline` as an AdminCollection conformance target, but it's a kanban on the shared `AdminKanban` kernel (SESSION_0515)

- **What:** ADR 0045 D5 (and WL-P2-34) enumerate `/app/leads-pipeline` among the non-kit stragglers to migrate onto the `AdminCollection` (data-table) frame. But `app/app/leads-pipeline/_components/leads-pipeline.tsx:10` imports `AdminKanban` from `@ronin-dojo/ui-kit/kanban` and renders board m-cards — it is a **kanban** on a shared ui-kit kernel, already kernel-conformant. `/app/leads` already provides the data-table view of the same `Lead` data.
- **Risk:** a future conformance sweep, taking the ADR/ledger literally, would convert the CRM pipeline board into a flat table — a **feature regression** (loses the kanban UX) + duplicates `/app/leads`. SESSION_0515 caught this at bow-in and swapped `/app/media` in for the batch instead.
- **Fix direction:** amend ADR 0045 D5 to STRIKE `/app/leads-pipeline` from the conformance-target list (a kanban is not an `AdminCollection` candidate; the AdminKanban kernel is the correct shared primitive for board surfaces). WL-P2-34 already annotated. Amendment is a docs-only edit.
- **Status: OPEN** (ADR 0045 D5 amendment pending — flagged by Giddy hostile-close, SESSION_0515).

### D-043 — `lib/safe-actions.ts` generic P2002 handler reads `meta.target`, which does not exist under the live pg driver adapter (SESSION_0529)

- **What:** the shared next-safe-action error handler maps Prisma P2002 to a friendly "A {model} with this
  {field} already exists" by reading `e.meta.target[0]` — but Doug's live probe (SESSION_0529) proved that
  under `@prisma/adapter-pg` the error carries NO `meta.target` (`metaKeys: ["modelName","driverAdapterError"]`;
  the constraint name lives in `meta.driverAdapterError.cause.originalMessage`). So in prod, EVERY action's
  unique-constraint violation degrades to the generic fallback message. Unit tests pass because they use the
  classic error shape.
- **Risk:** silent UX degradation on every duplicate-value submit across the app; future devs "fix" it
  per-action instead of at the seam (the technique path already had to — `isAuthoredSlugConflict`).
- **Fix direction:** port the adapter-shape parsing from `server/web/techniques/apply-technique.ts`
  (`isAuthoredSlugConflict`, live-verified SESSION_0529) into the shared handler, keeping `meta.target` as the
  second recognized shape; add a test using the real captured adapter error shape.
- **Status: OPEN** — scheduled in the WL-P2-49 shared-seams cleanup lane (SESSION_0529 grill Q6, operator-ratified).
