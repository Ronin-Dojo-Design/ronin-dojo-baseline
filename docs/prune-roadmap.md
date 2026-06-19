# BBL single-brand prune roadmap

> **Why this exists.** `ronin-dojo-baseline` (becoming `black-belt-legacy`) is a multi-brand app
> being pruned **in place** to BBL-only. It already deploys to `blackbeltlegacy.com`, so an in-place
> prune ships to the live domain with zero cutover. **Baseline / WEKAF / RDD don't matter** — break
> or delete them freely. The single-brand collapse (drop `brand` scoping → BBL constant) is the lever
> that's paying off; this doc stages the work so parallel cloud sessions don't collide.

## Standing context (every prune session needs this)

- Repo deploys to `blackbeltlegacy.com` on push (bun build).
- Public site is countdown-gated (`BBL_COUNTDOWN=1`); the **full site is behind the
  `/preview?token=bob-tony-BBL-preview` cookie** — keep that path working.
- Gates: `bun run typecheck` + `next build` must stay green.
- **Do not regress** the SESSION_0414 directory/lineage fixes: the BBL roster is placeholder
  Passports linked by **LineageTree membership** (not Membership/Affiliation), so directory queries
  match `Membership→Org→brand` **OR** `lineageNode.treeMembers.tree.brand`
  (`server/web/directory/profile-where.ts` + `queries.ts`). Schools/orgs likely need the same
  single-brand simplification.

## Ordering (avoid collisions)

1. **Run #2 (brand-resolution → BBL constant) FIRST.** It's the foundation; once `getRequestBrand()`
   returns `Brand.BBL`, the brand-scoping in #1 and #3 becomes trivial or unnecessary.
2. Then **#1 (school/org parity)** and **#3 (clients + theming)** can run **in parallel** — disjoint
   file sets (directory/schools vs services/theming).
3. Deferred follow-up (not yet scoped): inline/remove the ~159 `getRequestBrand()` call sites; drop
   the 42 brand columns + brand indexes (Prisma migration) once the code no longer reads them.

---

## #2 — Collapse brand resolution to a BBL constant *(run first; highest leverage)*

Make the whole app resolve to `Brand.BBL` and delete the host-based brand harness.

- `lib/brand-context.ts`: `getRequestBrand()` → always `Brand.BBL`. Collapse
  `resolveBrand`/`HOST_TO_BRAND`/`DEFAULT_BRAND`/`BRAND_TRUSTED_ORIGINS` to BBL only (localhost +
  `blackbeltlegacy.com`).
- `proxy.ts`: remove the `x-brand` header injection, the `brand` cookie, and the
  `FEATURE_ROUTE_PREFIXES → brandHasFeature` gate (the `/_gated` rewrite). **Keep** the auth +
  migrated-app redirects.
- `config/brand-features.ts`: remove the per-brand allowlist gate (or make `brandHasFeature` always
  true); delete routes/surfaces that were non-BBL-only.

**Do NOT** touch the ~159 `getRequestBrand()` call sites yet — once it returns BBL they all keep
working. **Done:** every request is BBL; no host switching; `/_gated` gone; countdown teaser
(`app/(web)/layout.tsx`) still works; localhost renders BBL; typecheck + build green; bob-tony
preview renders full BBL.

## #1 — School & Org card + detail parity *(parallel with #3, after #2)*

SESSION_0414 rebuilt the directory **person** cards as a premium, self-contained
`components/web/directory/facet-result-card.tsx` (big avatar + `object-cover`, full wrapping name,
belt-color rank chip from `Rank.colorHex`, gi-default fallback `/brand/bbl/default-black-belt.png`,
trust/claim badges, hover glow). Orgs and lineage-tree facet cards already route through it.

- School/org **detail** pages: `app/(web)/schools/[slug]/_components/school-detail/*` and
  `app/(web)/organizations/[slug]/*` → premium, consistent with the person profile + new cards.
- Standalone `SchoolCard` (grep it) → match `facet-result-card` or delegate.
- Debrand `server/web/schools/*` + the org facet in `server/web/directory/*` (collapse the
  `Membership→Org→brand` scoping; mirror the SESSION_0414 directory fix).

**Done:** `/schools/[slug]` + `/organizations/[slug]` premium + brand-neutral; school/org cards match
person cards; typecheck + build green; no regression to the SESSION_0414 directory/lineage queries.

## #3 — Collapse dual integration clients + theming to single BBL *(parallel with #1, after #2)*

Brand colors come from the `BrandSettings` DB table (injected in `layout.tsx`) — **don't blank them.**

- `services/stripe.ts`: brand→account routing → single BBL Stripe.
- `services/s3.ts`: brand→bucket routing → single BBL R2. Keep `lib/media.ts`
  `resolveDisplayAvatar`'s BBL gi default; collapse `BRAND_DEFAULT_AVATAR` to BBL.
- `services/resend.ts` / email seam → single BBL sender.
- Theming (arch-review Candidate 4): the HSL `--color-*` override chain is duplicated in
  `app/layout.tsx` (`[data-brand]`, **no** `isHslSafe` guard) and
  `app/(web)/organizations/[slug]/layout.tsx` (`[data-org]`, **has** the guard) — a latent injection
  seam. Collapse to ONE guarded `brandThemeCss(scope, settings)` helper, or a static BBL theme.

**Done:** one Stripe / one R2 / one Resend path; theme injection single + always guarded; BBL colors
correct; Stripe webhook→entitlement path intact; typecheck + build green.
