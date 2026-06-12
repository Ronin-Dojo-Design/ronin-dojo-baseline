# hostile-repo-review.md

# Ronin Dojo Baseline — Hostile Repo Review

**Repo reviewed:** `Ronin-Dojo-Design/ronin-dojo-baseline`  
**Live domain context:** `https://baselinemartialarts.com` is documented as live and verified in `SESSION_0161`.  
**Review lens:** Dirstarter alignment, live-domain risk, backend integrity, local-storage/client-state debt, hard-coded data, dynamic loading, and front/back wiring.

---

## 0. Brutal executive verdict

The repo is no longer a toy. It is a serious martial-arts SaaS build sitting on a Dirstarter/Next.js/Prisma/Better Auth base with a large domain schema, real Stripe/entitlement work, production deployment evidence, and meaningful test harnesses.

But the current danger is not lack of ambition. It is **too much architecture ahead of production proof**.

The hostile read:

1. **Production is live, but brand resolution still looks unsafe in `main`.** `baselinemartialarts.com` is documented as live and verified, but the production domain is still commented out in `HOST_TO_BRAND`. If that code is what production is running, Baseline requests can resolve to the default Ronin brand.
2. **The docs promise a Prisma brand-scope defense that the actual DB client does not appear to apply.** That is not a doc nit. That is a cross-brand data-leak class.
3. **Dirstarter template remnants are still embedded in the schema and product UI.** Keeping references is fine during learning; leaving sellable/listing template behavior active near launch is risk.
4. **Local storage usage is not catastrophic, but some of it controls behavior that should be account/server aware.** AI consent, pricing interval preference, and feedback dismissal are harmless only until they affect billing, compliance, analytics, or cross-device UX.
5. **The schema is powerful but overweight for the current launch surface.** It supports a multi-brand martial arts operating system, but the live Baseline site should be hardened around fewer verified flows.
6. **The biggest backend improvement is not adding more models.** It is making brand, entitlement, checkout, auth, content status, and public rendering pass through one boring, tested service layer every time.

---

## 1. Dirstarter baseline comparison

Dirstarter describes itself as a Next.js 16 + TypeScript directory boilerplate with Prisma, Tailwind, shadcn/Radix, and Better Auth as core stack pieces. It also positions the app around directory websites, SEO, deployment, monetization, authentication, content management, and integrations.

Ronin Baseline matches the high-level stack. The repo README says the web app is Dirstarter with Next.js 16, Prisma 7, Better Auth, Stripe, Resend, and S3, with Expo mobile and one Postgres backend. Good.

Where Ronin diverges from Dirstarter:

| Area | Dirstarter baseline | Ronin state | Hostile review |
|---|---|---|---|
| Directory model | Tool/listing directory | Martial arts identity, orgs, ranks, programs, courses, tournaments | Correct strategic divergence, but remove unused Dirstarter listing models before public launch hardening. |
| Content management | Admin review, scheduling, status workflow, cron publication, sitemap/cache invalidation | ContentAtom/Variant/Publication exists conceptually and in schema | Good direction, but prove one atom -> public page or one MDX/admin flow before widening. |
| Monetization | Stripe products/prices/webhooks, premium listings, subscriptions | Entitlements, pricing plans, invoices, program checkout, Stripe webhook tests | Stronger than baseline, but Stripe Price uniqueness and manual payment parity remain launch risks. |
| Auth | Better Auth, magic link, Google, role-based admin/user | Better Auth plus Passport, Membership roles, brand context | Stronger domain model, but mobile auth and brand-scope enforcement need production proof. |
| Deployment | Vercel + env variables + custom domain | Live Vercel production deploy documented | Good, but repo config still has host-map/commented-origin debt. |

---

## 2. P0 findings — fix before trusting the live app

### P0-1 — `baselinemartialarts.com` is live, but host-to-brand mapping is still commented out

**Finding:** `docs/sprints/SESSION_0161.md` says production is Ready, apex returns HTTP 200, and `www` redirects to apex. But `apps/web/lib/brand-context.ts` still has production host mappings commented out, including `baselinemartialarts.com`.

**Why this is dangerous:** `proxy.ts` resolves brand from the host and injects it as `x-brand`, then also sets a client-readable `brand` cookie. If the host is not in the map, `resolveBrand()` falls back to `DEFAULT_BRAND`, which is `RONIN_DOJO_DESIGN`. That can cause Baseline pages/actions/queries to run under the wrong brand context.

**Required fix:**

```ts
export const HOST_TO_BRAND: Record<string, Brand> = {
  "baselinemartialarts.com": Brand.BASELINE_MARTIAL_ARTS,
  "www.baselinemartialarts.com": Brand.BASELINE_MARTIAL_ARTS,
  "ronindojodesign.com": Brand.RONIN_DOJO_DESIGN,
  "blackbeltlegacy.com": Brand.BBL,
  "wekafusa.com": Brand.WEKAF,
  "ronindojo.local": Brand.RONIN_DOJO_DESIGN,
  "baseline.local": Brand.BASELINE_MARTIAL_ARTS,
  "bbl.local": Brand.BBL,
  "wekaf.local": Brand.WEKAF,
  localhost: Brand.BASELINE_MARTIAL_ARTS,
}
```

**Add tests:**

- `resolveBrand("baselinemartialarts.com") === BASELINE_MARTIAL_ARTS`
- `resolveBrand("www.baselinemartialarts.com") === BASELINE_MARTIAL_ARTS`
- `proxy` overwrites spoofed inbound `x-brand`
- unknown production host does not silently resolve to production app data without logging

**Severity:** critical.

---

### P0-2 — Brand-scope Prisma extension appears missing from actual DB client

**Finding:** The auth architecture says brand isolation uses both application-layer authz helpers and a data-layer Prisma client extension that requires brand-scoped models to include a brand filter. But `apps/web/services/db.ts` appears to instantiate Prisma with only `uniqueSlugsExtension`.

**Why this is dangerous:** Cross-brand leakage is the exact failure mode the docs already identify. If the repo relies only on discipline in each query, one missed `where: { brand }` becomes a serious data leak.

**Required fix:**

- Add the brand-scope Prisma extension or stop claiming it exists.
- In dev/test, throw if a brand-scoped model is queried without brand filtering.
- In production, at minimum log, alert, and fail closed for sensitive tables.
- Add integration tests for `Membership`, `Program`, `PricingPlan`, `ContentAtom`, `Invoice`, `Registration`, `Tournament`, `Course`, and `Organization` leakage.

**Recommended implementation shape:**

```ts
return new PrismaClient({ adapter })
  .$extends(uniqueSlugsExtension)
  .$extends(brandScopeExtension)
```

**Severity:** critical.

---

### P0-3 — Server Action allowed origins are still commented out after production domain is live

**Finding:** `next.config.ts` includes a clear note that once production apex domains land, `serverActions.allowedOrigins` should be filled. `SESSION_0161` says the Baseline apex domain has landed and is serving.

**Why this matters:** This is not necessarily exploitable by itself because Next defaults to same-origin behavior, but the file itself says multi-domain production is the moment to configure explicit origins. Leaving this as a comment after launch creates a silent divergence between architecture intent and deployment reality.

**Required fix:**

```ts
serverActions: {
  allowedOrigins: [
    "baselinemartialarts.com",
    "www.baselinemartialarts.com",
    "ronindojodesign.com",
    "blackbeltlegacy.com",
    "wekafusa.com",
  ],
}
```

**Severity:** high.

---

## 3. P1 findings — fix before adding more features

### P1-1 — Dirstarter template models remain in the production schema

The schema still carries Dirstarter `Tool`, `Category`, `Tag`, `Report`, and `Ad` models. The data-model doc explicitly says they are retained as reference and should be removed before production.

**Hostile read:** If Baseline is live, “before production” has arrived. If these are not used by the public product, they should be removed or isolated behind a clear legacy/reference gate.

**Risk:**

- extra admin surface
- wrong sitemap/public listing behavior
- mistaken Stripe/listing flow reuse
- confusing data ownership
- larger migration burden later

**Fix:**

- Create `SESSION_REMOVAL_DIRSTARTER_TEMPLATE_MODELS`.
- Remove or fully quarantine `Tool`, `Category`, `Tag`, `Report`, `Ad`.
- Confirm no public routes or server actions still depend on them.
- Keep Dirstarter patterns in docs, not live schema, unless a route genuinely uses them.

---

### P1-2 — Local storage is used for consent/preferences that should be evaluated by purpose

Current local/session storage uses found:

| File | Client storage | Current use | Review |
|---|---|---|---|
| `components/admin/ai/generate.tsx` | `${siteConfig.slug}-ai-consent` | AI overwrite/cost consent | Should be server/audit aware for admins. Local-only consent is weak if AI usage incurs cost or overwrites important content. |
| `components/web/feedback-widget.tsx` | `${siteConfig.slug}-feedback-dismissed`, session page views | Feedback prompt dismissal/engagement | Acceptable for anonymous UX, but logged-in dismissal should probably sync to user preference. |
| `components/web/products/product.tsx` | `${siteConfig.slug}-product-interval` | Monthly/yearly pricing interval | Fine as preference, but checkout should derive final price from server-validated Stripe Price/PricingPlan, never trust client interval. |
| `proxy.ts` | `brand` cookie | Client brand hint | Fine only as display hint. Must never be trusted for authorization/data scope. |

**Fix approach:**

- Keep harmless UI preferences local.
- Move cost/compliance consent to server-side `UserPreference` or audit log.
- Store product interval in URL search params for shareability and deterministic SSR, e.g. `?interval=year`.
- For logged-in users, sync feedback dismissal to `NotificationPreference` or a lightweight `UserUiPreference`.

---

### P1-3 — Product checkout still carries Dirstarter-generic checkout behavior alongside Ronin program checkout

The product component supports both `createStripeCheckout` and `createProgramEnrollmentCheckout`. That is probably intentional during migration, but it is dangerous if generic checkout remains available for protected Ronin access.

**Rule:** Protected curriculum, programs, certificates, memberships, and events must use server-derived metadata only:

```txt
User session -> active brand -> pricing plan -> entitlement grants -> checkout metadata
```

Never:

```txt
client props -> arbitrary metadata -> Stripe Checkout -> entitlement
```

**Fix:**

- Make `createProgramEnrollmentCheckout` the only path for program/course/certification purchases.
- Keep `createStripeCheckout` only for legacy Dirstarter listing monetization, if retained at all.
- Add a lint/test guard that protected checkout code cannot call the generic checkout action.

---

### P1-4 — Stripe Price mapping remains nullable / non-unique in docs

The monetization spec admits that `PricingPlan.stripePriceId` is nullable and not unique, and current webhook lookup uses `findFirst({ stripePriceId })`.

**Hostile read:** `findFirst` on money/access mapping is a launch smell.

**Fix:**

- If a plan is Stripe-backed, require a unique `stripePriceId`.
- Add a partial unique index if Prisma supports the needed shape, or enforce through migration SQL.
- Add a startup/admin drift audit that errors if two active plans share the same Stripe Price.

---

### P1-5 — Schema is massive; current proof surface should be smaller

The data model is impressive: Passport, DirectoryProfile, Memberships, Ranks, Programs, Courses, Attendance, Payments, Entitlements, ContentAtoms, Tournaments, CRM, Merch, CertificateOrders, and more.

The risk is that the codebase looks “done” because the nouns exist. It is not done until lifecycle proof exists.

**Minimum live Baseline proof lanes:**

1. Anonymous visitor sees correct Baseline brand from `baselinemartialarts.com`.
2. User signs in with Better Auth.
3. Passport + DirectoryProfile bootstrap correctly.
4. User joins one Organization.
5. User enrolls in one Program.
6. Program access is granted by entitlement.
7. Course progress persists server-side.
8. Instructor/admin can verify progress.
9. Payment/refund/revoke changes access correctly.
10. Brand leakage test fails closed.

Everything else can wait.

---

## 4. Backend wiring improvements

### 4.1 Create one `getCurrentRequestContext()` function

Current request state is spread across host brand, auth session, active brand, cookies, and authz helpers.

Create one server-only context function:

```ts
type RequestContext = {
  hostBrand: Brand
  activeBrand: Brand
  user: SessionUser | null
  isAdmin: boolean
  userBrands: Brand[]
}
```

Every server action and route should start with it.

---

### 4.2 Use service-layer gates instead of page-level data rules

Create boring services:

```txt
server/web/programs/
  queries.ts
  actions.ts
  access.ts

server/web/courses/
  queries.ts
  actions.ts
  access.ts

server/web/entitlements/
  queries.ts
  actions.ts
  access.ts
```

Pages should render. Services should decide.

---

### 4.3 Make data-loading states explicit

For public site pages:

```txt
brand -> public config -> public programs -> public content -> pricing summary
```

Do not load from scattered constants when the data already has Prisma models.

Create:

- `getPublicBrandHome(brand)`
- `getPublicPrograms(brand)`
- `getPublicDisciplineDirectory(brand)`
- `getPublicContentAtoms(brand, channel)`
- `getPublicPricing(brand)`

---

### 4.4 Push dynamic content out of code constants

The repo already has the right schema direction. Now use it.

Move these into DB/admin or MDX/content atoms:

- homepage hero copy
- program cards
- discipline blurbs
- schedule previews
- certification copy
- CTA blocks
- instructor bios
- FAQ entries
- featured content

Suggested model approach:

```txt
BrandPage
  brand
  slug
  status
  sections Json
  seoTitle
  seoDescription
```

or content atom approach:

```txt
ContentAtom -> ContentVariant(BRAND x CHANNEL) -> rendered public component
```

Keep only structural layout in code.

---

## 5. Frontend/UI wiring improvements

### 5.1 Make brand config request-aware, not global-default heavy

`siteConfig` defaults to Baseline for contexts where brand is not resolved. That is convenient but dangerous in a multi-brand app. Prefer explicit `getBrandSiteConfig(await getRequestBrand())` in server-rendered routes.

### 5.2 Make client brand cookie display-only

The `brand` cookie is `httpOnly: false`, so any client script can read or mutate it. That is fine for cosmetic UI. It must never affect protected query scope.

Add a code comment and tests: **brand cookie is untrusted.**

### 5.3 Replace local product interval with URL state

For price cards, use `nuqs` or native search params:

```txt
/programs/baseline-foundations?interval=year
```

Benefits:

- SSR deterministic
- shareable links
- analytics clarity
- no stale local preference affecting checkout

### 5.4 Make feedback widget brand/account aware

Anonymous: local/session storage is fine.  
Logged in: save dismissal to account preference and do not annoy the same person across devices.

---

## 6. Testing gaps to add now

### Domain/brand tests

- host maps to brand
- www maps to brand
- unknown host behavior is intentional
- inbound spoofed `x-brand` is overwritten
- brand cookie is not trusted for server scope

### Brand leakage tests

- user with Baseline membership cannot query BBL records
- admin can switch active brand intentionally
- server action without brand filter fails in test
- Prisma brand-scope extension catches missing filters

### Checkout/entitlement tests

- active pricing plan maps to one Stripe Price
- duplicate active Stripe Price mapping fails audit
- program checkout cannot use generic checkout action
- refund revokes entitlement
- subscription cancellation expires entitlement
- manual payment grants entitlement through same service path

### Content/public tests

- public page only shows `Published` records
- Draft/Pending/Scheduled content does not enter sitemap
- soft-deleted/rejected content behavior is explicit
- cache invalidation happens after publish/update

---

## 7. Dirstarter-aligned improvement roadmap

### Sprint A — Live-domain hardening

1. Add production host mappings.
2. Add allowed origins.
3. Add domain/brand tests.
4. Confirm `curl -I` plus page HTML references Baseline, not Ronin fallback.
5. Add smoke route `/api/health/brand` returning safe public brand diagnostic.

### Sprint B — Brand-scope hardening

1. Implement Prisma brand-scope extension.
2. Add tests for brand-scoped models.
3. Create `getCurrentRequestContext()`.
4. Ban direct brand cookie trust.
5. Add CI check for brand-scoped queries.

### Sprint C — Dirstarter cleanup

1. Remove or quarantine Dirstarter `Tool` models/routes.
2. Split Ronin checkout from Dirstarter listing checkout.
3. Remove stale docs saying “before production” after production is already live.
4. Rename package from `dirstarter` when stable, or document why it remains.

### Sprint D — Dynamic public content

1. Move homepage/program copy into DB or content atoms.
2. Add admin-controlled public page sections.
3. Add status workflow: Draft -> Review -> Published.
4. Connect sitemap/cache invalidation to published content.
5. Add content proof test.

### Sprint E — Money/access closure

1. Make Stripe Price mappings unique for active plans.
2. Add manual/admin payment parity.
3. Add staging payment/entitlement drift proof.
4. Decide certificate pricing bridge.
5. Add production webhook monitor alerting.

---

## 8. Bugs / likely bugs list

| Severity | Bug / smell | Why it matters | Fix |
|---|---|---|---|
| P0 | Live Baseline domain absent from host map | Requests may resolve to `RONIN_DOJO_DESIGN` | Add production host mappings + tests |
| P0 | Docs promise brand-scope Prisma extension; DB client only applies unique slugs | Cross-brand data leak risk | Implement extension or correct docs |
| P1 | Server Action allowed origins still commented | Multi-domain production drift | Configure domains explicitly |
| P1 | Generic Stripe checkout coexists with protected program checkout | Access metadata may be too client-driven | Restrict protected access to server-derived checkout |
| P1 | `stripePriceId` nullable/non-unique | Wrong plan can grant access | Unique active mapping + drift audit |
| P1 | AI generation consent local-only | Cost/overwrite consent not auditable | Store server-side for admins |
| P2 | Feedback dismissal local-only | Annoying cross-device UX, weak analytics | Sync for logged-in users |
| P2 | Product interval local-only | Non-shareable, stale checkout preference | URL param + server validation |
| P2 | Dirstarter models remain | Confusing production schema and route risk | Remove/quarantine |
| P2 | Site config has global default Baseline | Multi-brand mistakes can hide in build/static paths | Use request-aware config in routes |

---

## 9. Final hostile score

| Category | Score | Notes |
|---|---:|---|
| Architecture ambition | 9.2 | Strong platform spine. |
| Dirstarter alignment | 8.3 | Stack-aligned, but template remnants and config drift remain. |
| Production readiness | 7.1 | Live deploy proof is strong; brand mapping/config drift is not. |
| Backend integrity | 7.4 | Schema is strong; enforcement layer needs proof. |
| Frontend wiring | 7.6 | Good components, but too much global/default/client preference behavior. |
| Monetization safety | 7.5 | Entitlement-first is correct; uniqueness/manual parity must close. |
| Content system maturity | 7.3 | Great model direction; needs one proven public workflow. |
| Overall | **7.6 / 10** | Good build. Not yet boring enough to trust at scale. |

---

## 10. The next best commit

Make the next commit boring and surgical:

```txt
fix: harden production brand resolution for Baseline domain
```

Files likely touched:

```txt
apps/web/lib/brand-context.ts
apps/web/proxy.ts or proxy tests
apps/web/next.config.ts
apps/web/lib/brand-context.test.ts
apps/web/proxy.test.ts
```

Acceptance criteria:

```txt
[ ] baselinemartialarts.com resolves BASELINE_MARTIAL_ARTS
[ ] www.baselinemartialarts.com resolves BASELINE_MARTIAL_ARTS
[ ] x-brand spoofing is overwritten
[ ] server actions allowedOrigins includes production domains
[ ] live smoke confirms Baseline host does not fall back to Ronin
```

That is the highest-leverage fix because it protects every other layer.
