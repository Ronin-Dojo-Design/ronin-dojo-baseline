---
title: "Ronin Security Risk Register"
slug: ronin-security-risk-register
type: file
status: active
created: 2026-05-31
updated: 2026-07-14
last_agent: claude-session-0536
pairs_with:
  - docs/security/README.md
  - docs/security/brand-scope-hardening-plan.md
  - docs/security/security-test-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0313.md
---

# Ronin Security Risk Register

## Summary

This register captures the highest-priority security risks from the SESSION_0313 review. It is a roadmap and audit ledger, not proof that the system is secure.

The most important theme is **documented controls must become enforced, tested, and monitored controls**.

> **Single-brand update (2026-06-24, SESSION_0447).** ADR 0034 collapsed the
> 4-brand model to a single brand (BBL). Risk **#1 (runtime brand-scope DB
> enforcement)** below is now **superseded** — cross-brand data isolation is moot
> with one tenant. It is kept visible (not deleted) so the history and any future
> second-tenant re-activation stay traceable. The host→brand **origin** trust
> gate (`HOST_TO_BRAND` / `BRAND_TRUSTED_ORIGINS` / `resolveBrand` in
> `apps/web/lib/brand-context.ts`) is **KEEP-FOREVER** and is *not* part of risk
> #1's supersession — it survives even the eventual `brand` column drop. All
> other rows (#2–#10) are brand-agnostic web/payment/auth hardening and remain in
> force.

## Priority Register

| Priority | Risk | Severity | Current state | Target fix | Owner lane |
| --- | --- | --- | --- | --- | --- |
| 1 | ~~Missing runtime brand-scope DB enforcement~~ — **superseded (single-brand collapse, ADR 0034)** | ~~Critical~~ → N/A | Single brand (BBL); no second tenant for rows to leak into, so the multi-tenant data-isolation gap is moot. `db.ts` still wires only `uniqueSlugsExtension` (correct for single-brand). The host→brand **origin** gate in `brand-context.ts` stays KEEP-FOREVER. | None — shelved. Re-activate the brand-scope extension only if a second product tenant is introduced. | Security/platform |
| 2 | ~~No global security headers / CSP gate~~ — **✅ MITIGATED (0465); nonce + report sink shipped 0536 — only the enforce flip remains** | ~~Critical~~ → Low (enforce-CSP flip only) | `apps/web/config/security-headers.ts` (app-agnostic builder). ENFORCED hardening: X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, COOP same-origin, X-DNS-Prefetch-Control, + HSTS (prod-only). CSP ships **Report-Only**. **SESSION_0536 (PR #204):** added a CSP violation **report sink** (`app/api/csp-report/route.ts` + `report-uri`/`report-to`/`Reporting-Endpoints`) so the stream is finally observable, and the **script-src nonce migration** (nonce minted in `proxy.ts`; `script-src` dropped `'unsafe-inline'` for `'nonce-…'`). `style-src` KEEPS `'unsafe-inline'` (script-only — see follow-up). Verified: 21 unit tests, browser console audit (0 violations), Report-Only confirmed on every surface. | **Follow-up (one step left):** observe the prod Report-Only stream (now collected by the sink), then flip `CSP_ENFORCE=1` in a canary. **Scope correction (0536):** the nonce drop is **script-src only** — `style-src` keeps `'unsafe-inline'` because a nonce covers `<style>` elements, not inline `style={{…}}` attributes (pervasive + `motion/react`). | Web/platform |
| 3 | Admin route reliance risk — **triaged confirmed-managed (SESSION_0465)** | High → Low | `proxy.ts` is a UX **cookie-presence** redirect only (its header comment says "redirect", not "authorize") — `/admin`/`/dashboard`/`/me`. The SESSION_0452 review already verified **no unauthenticated/non-admin path reaches an admin action or admin data** (server-side enforcement via `assertOrgAdminAccess` + per-action guards holds); only the known #11 cross-org super-user + the LOW `updateUserRole` self-lockout footgun remain. No code change needed this session. | Keep the AuditLog gate (#11) green; treat `assertOrgAdminAccess` as the single write boundary for new org-mutating actions; periodic route/action coverage audit. | Admin/auth |
| 4 | Optional production secrets — **triaged, deferred (SESSION_0465)** | High | Stripe, Redis, S3, Printful, Resend, Plausible, AI keys are all `.optional()` in `env.ts`; no `PAYMENTS_ENABLED`-style feature-gate exists today, so a missing prod secret fails at first runtime use, not at build/deploy. | **Deferred (larger cross-cutting change):** add feature flags (`PAYMENTS_ENABLED` → requires `STRIPE_*`, etc.) enforced in `env.ts` so an enabled feature with a missing secret fails the build. Tracked here. | Platform/devops |
| 5 | ~~Rate limiter fail-open for sensitive actions~~ — **✅ FIXED (SESSION_0465)** | ~~High~~ → N/A | `isRateLimited()` now fails **closed** for the public/abuse-prone/auth-adjacent buckets (`claim`, `invite`, `evidence_upload`, `teaser_signup`, `email_notify`, `submission`, `report`) when Redis is configured but `.limit()` errors; authenticated actor-keyed write buckets stay fail-open. No-Redis path (dev/CI) unchanged. Pure `shouldFailClosed()` predicate + 3 unit tests (`lib/rate-limiter.test.ts`). | **Residual:** Better Auth magic-link/OTP send still has no explicit `rateLimit` block in `lib/auth.ts` (#5 SESSION_0452 note) — bounded only by Better Auth's in-memory default. Add an explicit fail-closed `rateLimit` config there. | Auth/platform |
| 6 | Private media boundary — **triaged, confirmed real + deferred (SESSION_0465)** | High | Re-confirmed (SESSION_0452): **no** media GET/proxy/signed-URL route exists; `Media.isPublic` filters public *payloads* but does not gate the object. Private cert PDFs / claim-evidence are world-readable by UUID URL (security-by-obscurity). | **Deferred (architectural):** signed-URL route OR private bucket/prefix (`private-media/`, `certificate-pdfs/`, `claim-evidence/`) + signed-URL authorization tests. Tracked here. | Media/storage |
| 7 | PII/payment log leakage — **triaged, no live leak + deferred guardrail (SESSION_0465)** | High → Medium | Re-verified: **no** `console.log(session/body/parsedInput)` exists in `server/**` today (no live leak); the Stripe webhook logs no secret/body. The gap is the **absence of a guardrail** against the next one + `userId` logged cleartext. | **Deferred:** add a `safeLog()`/redaction helper + oxlint-ban bare `console.log` in `server/**`. Tracked here. | Observability |
| 8 | Payment/access drift | Medium-high | Stripe webhook idempotency and refund/dispute logic exist; reconciliation must be operationalized | Nightly Stripe/internal entitlement drift audit + alerts/admin replay | Payments |
| 9 | Dirstarter template model debt | Medium | Template/reference models still exist during learning phase | Delete or quarantine unused template models/routes before production cutover | Product/platform |
| 10 | AI/MCP data leakage | Medium | AI/content tooling exists or is emerging | Add AI data safety policy, prompt redaction, tool audit, human approval gates | AI/content |
| 11 | Platform-admin org super-user scope (SESSION_0448) | Medium | `hasOrgAdminAccess` (`apps/web/server/web/organization/org-admin-access.ts`) now grants any `User.role === "admin"` READ + (via `assertOrgAdminAccess`) WRITE to **every** org's settings/members/invites/theme — not just owned/ORG_ADMIN orgs. Live on prod (PR #163); 2 platform admins today (Brian, Tony Hua). | Confirm `AuditLog` records cross-org admin writes; keep the platform-admin set minimal (review periodically); alert on unexpected `role:admin` grants | Admin/auth |
| 12 | Public org-resolution owner-email PII exposure (SESSION_0448) | Medium | `getOrganizationBySlug` is now brand-agnostic (any org resolves by slug on public `/organizations/[slug]`, no positive visibility gate). `organizationDetailPayload` selects `owner.email`; the public page renders `owner.name ?? owner.email`, so a null-name owner's email can appear publicly. The brand-scoping drop widened which orgs resolve publicly (incl. 3 BASELINE orgs). | Drop `owner.email` from the public payload or gate the email fallback; backfill `owner.name`; reconsider a visibility gate for non-public orgs | Web/privacy |
| 13 | Prod Neon DB credential exposed in session transcripts — **rotation overdue** (SESSION_0449/0450) | High | The prod Neon role password leaked into local shell/transcript output **twice** (`psql` error messages echoed the conninfo; root-caused in `docs/_archive/project-log/03-task-review-log.md:992`). Credential is **still live (never rotated)**; exposure is bounded to local Claude transcripts. Confirmed by the SESSION_0452 sweep that the secret is **not** committed anywhere (lives only in gitignored `apps/web/.env.prod` + Vercel env). | Rotate the Neon role password (Neon dashboard → reset), update `apps/web/.env.prod` + Vercel `DATABASE_URL`/`DIRECT_URL`, re-test the prod connect (`psql -h pg.neon.tech …`); going forward pass creds via `PG*` env vars and redact `postgres://…` in any error output | Platform/devops |
| 14 | ~~Authed/admin image+video uploads trust the client MIME → SVG **stored-XSS**~~ — **✅ RESOLVED** (PR #168, merged `8029657e` SESSION_0453, deployed) | ~~High~~ → N/A | `webMediaFileSchema` / `uploadMediaToLibrarySchema` / `createFileSchema` validate only `file.type.startsWith("image/")` (client-declared) and cap on `file.size` (client-reported). `image/svg+xml` passes; the **avatar** path makes the URL public, so an SVG with inline `<script>` is stored-XSS when opened directly. 3 user-upload sites: `applyWebMediaUpload`, `uploadMediaToLibrary`, `uploadMedia`. The guest evidence path (`lead/public-actions.ts`) was already byte-sniff-hardened. | **Fixing SESSION_0452 (PR):** shared `lib/media-guard.ts::sniffUploadBuffer` — sniff bytes via `file-type` (SVG → `undefined` → rejected), enforce ceiling on `buffer.byteLength`, derive type+mime from the sniff; applied at all 3 sites (folds the MED client-`file.size` issue) | Web/media |
| 15 | ~~Guest registrant email leaks to **public** tournament results~~ — **✅ RESOLVED** (PR #168, merged `8029657e` SESSION_0453; + regression guard in `results.smoke.test.ts`) | ~~High~~ → N/A | `findTournamentResults` (public, `"use cache"`, PUBLISHED-only, no auth) selects `guestEmail`; `bracket-results.tsx` / `medal-standings.tsx` render it as the display-name fallback (`… ?? r.guestEmail`). `guestName` is nullable, so a name-less guest's email prints in public SSR HTML (scraper-harvestable). | **Fixing SESSION_0452 (PR):** drop `guestEmail` from the results payload + remove the `?? r.guestEmail` fallback (and the prop types) in both components | Web/privacy |

## Risk Detail

### 1. Runtime brand-scope DB enforcement — SUPERSEDED (single-brand collapse, ADR 0034)

> **2026-06-24, SESSION_0447.** This risk assumed a one-app, one-database,
> **multi-brand** platform where a missed predicate could leak rows across
> brands. ADR 0034 collapsed the platform to a **single brand (BBL)**, so there
> is no second tenant and the cross-brand data-leak risk no longer exists. The
> proposed brand-scope Prisma extension is **shelved, not implemented** (see
> [brand-scope hardening plan](brand-scope-hardening-plan.md)). Org/role/owner
> scoping is still enforced at the app layer and remains live — it was never the
> brand axis.
>
> **Not superseded:** the host→brand **origin trust** gate
> (`apps/web/lib/brand-context.ts`) stays load-bearing forever. It is a request
> origin/host boundary (Better Auth `trustedOrigins`, OAuth/magic-link callback
> validation), not a DB-row data-isolation control, and survives the eventual
> schema-level `brand` column drop.
>
> **2026-06-26 sharpening (SESSION_0450/0451).** "No second tenant" is true at the
> *UI/chrome* layer but **not at the data layer**: prod still carries the original
> Baseline Martial Arts demo dataset — ~388 non-BBL rows co-resident in the BBL
> database (full audit in `[[brand-vestige-trim-inventory]]` / SESSION_0450). The
> `brand` column + brand-scoped query predicates (e.g. `searchCourses(...,
> Brand.BBL)`, `where:{brand}`) are what keep that legacy data **hidden from BBL
> surfaces today** — so the brand filter is still doing real isolation work and is
> load-bearing until that data is extracted to the future
> `baselinemartialarts.com` product. The supersession here is narrow and still
> correct: it shelves the *runtime brand-scope Prisma extension PR* (a
> multi-tenant defense-in-depth that assumed two live tenants writing concurrently)
> — it does **not** license dropping the existing brand predicates while the
> Baseline rows remain.
>
> *Original text (retained for history):* Ronin is a one-app, one-database,
> multi-brand platform. Every business-data query must be scoped by brand, org,
> role, and sometimes owner. One missed predicate in an admin query, profile
> drawer, certificate path, media query, or payment ledger can leak cross-brand
> data. The first implementation PR should enforce brand predicates at the
> database client boundary and test that missing predicates fail.

### 2. Security headers and CSP — ✅ MITIGATED (SESSION_0465)

> **2026-06-28, SESSION_0465 (RISK #2, P0).** Shipped `apps/web/config/security-headers.ts`
> (an app-agnostic builder) wired into `next.config.ts` `headers()` at `source: "/:path*"`,
> so the baseline applies to **every** route. The security posture lives **per-app** (ADR 0034
> locked decision) — each new product app (`apps/baseline`, …) calls `buildSecurityHeadersConfig()`
> from its own next config — **not** in root `vercel.json`.
>
> **Enforced now** (no app-breaking surface): `X-Content-Type-Options: nosniff`,
> `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
> `Permissions-Policy` (camera/mic/geo/topics off), `Cross-Origin-Opener-Policy: same-origin`,
> `X-DNS-Prefetch-Control: on`, and `Strict-Transport-Security` (2y, includeSubDomains, preload —
> **production only**).
>
> **CSP ships Report-Only first** (the register's "observe before enforce"). The policy string is
> identical in Report-Only and enforcing modes; `CSP_ENFORCE=1` (or `true`) promotes it from
> `Content-Security-Policy-Report-Only` to the enforcing `Content-Security-Policy` header — a
> one-flag change, no code edit. Allowlist (verified SESSION_0465): img R2 (`**.r2.dev` /
> `**.r2.cloudflarestorage.com`, matching `images.remotePatterns`) + `data:`/`blob:` + Google
> favicons; `script-src`/`style-src` `'self' 'unsafe-inline'` (inline `next-themes` bootstrap +
> inline brand `<style>` + Next bootstrap; dev also adds `'unsafe-eval'`); `connect-src 'self'`
> (Plausible is same-origin via `withPlausibleProxy`; dev adds `ws:`/`wss:` for HMR);
> `font-src 'self' data:` (`next/font/google` self-hosts at build); `frame-src` + `form-action`
> Stripe Checkout/Billing (Checkout is a server-side full-page **redirect** today, not an iframe —
> the origins are harmless + future-proof an embedded flow); `frame-ancestors 'none'`,
> `base-uri 'self'`, `object-src 'none'`, `upgrade-insecure-requests` (prod).
>
> **Verified live** via `curl -I` on the dev server (`/`, `/directory`, `/api` 404) — all headers
> present on every route; CSP correctly Report-Only. 9 unit tests in
> `apps/web/config/security-headers.test.ts`.
>
> **Follow-up before flipping to enforced:** (1) observe the Report-Only violation stream in prod;
> (2) migrate the inline `next-themes` script + brand `<style>` + Next bootstrap to a per-request
> **nonce** (threaded via a middleware rewrite) so `'unsafe-inline'` can be dropped from
> `script-src`/`style-src`; then (3) set `CSP_ENFORCE=1`. Until then the Report-Only header is
> defense-in-observability, not enforcement.

> **2026-07-14, SESSION_0536 (PR #204) — steps (1)-prereq + (2) done; only the flip remains.**
> Shipped both Report-Only (zero blast radius): a CSP violation **report sink**
> (`apps/web/app/api/csp-report/route.ts`, public log-only, both payload shapes, throttled,
> query-scrubbed) wired via `report-uri`/`report-to`/`Reporting-Endpoints` — so step (1)'s "observe the
> stream" is now *possible* (nothing was collected before; no sink existed) — and the **nonce migration**
> (nonce minted in `proxy.ts` `renderWithCspNonce`, threaded via `x-nonce` + the forwarded CSP request
> header; Next auto-nonces its own bootstrap and honours the Report-Only header name).
>
> **Scope correction to step (2):** the nonce drop is **`script-src` only** — `style-src` KEEPS
> `'unsafe-inline'`. A nonce covers `<style>` *elements* but NOT inline `style={{…}}` *attributes*, which
> are pervasive (46 files) and runtime-generated by `motion/react` (20 files); dropping it would flood
> violations and break animations for a low-impact residual (CSS injection ≪ script injection). The brand
> `<style>` + org `<style>` therefore need no nonce. The JSON-LD `<script type="application/ld+json">` is
> also *not* nonced (non-executable data block; `script-src` never governs it).
>
> **Remaining = step (3) only:** observe the prod Report-Only stream for a few days, then set
> `CSP_ENFORCE=1` in a canary (operator-gated — high blast radius). Verified 0536: 21 unit tests, browser
> console audit (0 violations incl. a live YouTube iframe), Report-Only on every surface, smoke e2e 3/3.

*Original baseline (retained for history):* a production security header baseline should include
`Content-Security-Policy` (Stripe-compatible), `Strict-Transport-Security`, `X-Frame-Options` /
CSP `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options`, COOP/CORP.
Start report-only, observe, then enforce.

### 3. Admin authorization

Middleware can redirect anonymous users for UX, but it must not be the authorization boundary. Admin pages, queries, and actions must deny unauthorized users server-side.

### 4. Feature-gated secrets

Optional env vars are useful during buildout. Before production launch, enabled features must fail build/deploy when required secrets are missing.

Suggested flags:

- `PAYMENTS_ENABLED=true` requires `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- `RATE_LIMITING_REQUIRED=true` requires Redis secrets.
- `MEDIA_UPLOADS_ENABLED=true` requires S3 secrets.
- `PRINTFUL_ENABLED=true` requires Printful secrets.
- `AI_ENABLED=true` requires AI gateway key and a privacy-mode flag.

### 5. Rate-limit failure modes — ✅ FIXED (app layer, SESSION_0465)

> **2026-06-28, SESSION_0465.** `isRateLimited()` (`apps/web/lib/rate-limiter.ts`) previously
> returned `false` (fail-open) on **any** limiter error, so a Redis outage silently removed the
> abuse control everywhere. Now the public / abuse-prone / auth-adjacent buckets — `claim`,
> `invite`, `evidence_upload`, `teaser_signup`, `email_notify`, `submission`, `report` — fail
> **closed** (block) when Redis is configured but `.limit()` errors; the authenticated,
> actor-keyed write buckets (`schedule_write`, `attendance_write`, …) stay fail-open (blocking a
> legit member's write on a transient blip is the worse failure there). The **no-Redis path**
> (`limiters === null`, e.g. local dev / CI) is unchanged — still fails open so dev works without
> Redis. The classification is a pure exported `shouldFailClosed(action)` predicate (3 unit tests,
> `lib/rate-limiter.test.ts`).
>
> **Residual (open):** Better Auth's **magic-link / OTP send** has no explicit `rateLimit` block in
> `lib/auth.ts` (SESSION_0452 note) — it's bounded only by Better Auth's in-memory default, not by
> the Upstash limiter above. Add an explicit, fail-*closed* `rateLimit` config for OTP/magic-link
> send. Certificate verification + checkout/payment creation + admin destructive actions should be
> audited for limiter coverage (not all route through `isRateLimited` today).

*Original guidance (retained):* low-risk marketing forms may fail open with an alert; sensitive
surfaces (magic links / OTP, invite generation, claim/evidence submission, certificate
verification, checkout/payment creation, admin destructive actions) should fail closed or degrade
safely when Redis is unavailable.

### 6. Private media

Private certificate PDFs, claim evidence, waiver-adjacent uploads, student videos, private curriculum, and review media must not be public URLs by default.

Use separate prefixes or buckets:

- `public-assets/`
- `private-media/`
- `certificate-pdfs/`
- `claim-evidence/`
- `student-media/`

### 7. Safe logging and errors

Production responses should be generic. Detailed errors belong in structured logs with redaction, not in user-facing responses. Logs should redact or hash emails, phone numbers, addresses, access tokens, webhook secrets, and unnecessary Stripe identifiers.

### 8. Payment/access drift

Refunds, disputes, subscription churn, failed renewals, and replayed webhooks can create access drift. Nightly reconciliation should compare Stripe state to Ronin invoices, payments, entitlements, registrations, and program access.

### 9. Template debt

Unused template models/routes/admin screens add attack surface and permission ambiguity. Before production cutover, decide which template areas are retained, removed, or quarantined.

### 10. AI/MCP safety

AI tooling should not access raw PII, rosters, payment state, waivers, or private evidence by default. Mutating AI tools require human approval, tool-call logs, and explicit scopes.

### 11. Platform-admin org super-user scope (SESSION_0448)

> **2026-06-26, SESSION_0448 (live on prod via PR #163).** `hasOrgAdminAccess`
> in `apps/web/server/web/organization/org-admin-access.ts` now grants
> org-settings READ — and, through `assertOrgAdminAccess`, WRITE — to any
> `User.role === "admin"` account. Platform admins are therefore super-users over
> **every** org's settings, members, invites, and theme, not just orgs they own
> or hold `ORG_ADMIN` on. This is intended (2 trusted platform admins today:
> Brian and Tony Hua), but it concentrates cross-org authority and must be
> monitored.

Controls and mitigations:

- Confirm `AuditLog` records every cross-org admin write (settings/members/invites/theme) with the acting admin id; a mutation with no audit event should fail the test gate (see security test plan).
- Keep the platform-admin set minimal — review the `role:admin` roster periodically and alert on any unexpected grant.
- Treat `assertOrgAdminAccess` as the single write boundary; new org-mutating actions must call it rather than re-deriving access.

### 12. Public org-resolution owner-email PII exposure (SESSION_0448)

> **2026-06-26, SESSION_0448 (live on prod via PR #163).** `getOrganizationBySlug`
> is now brand-agnostic: it resolves any org by slug on the public
> `/organizations/[slug]` route with no positive visibility gate. The brand-scoping
> drop widened which orgs resolve publicly (including 3 BASELINE orgs).

The related PII concern: `organizationDetailPayload` selects `owner.email`, and the public page renders `owner.name ?? owner.email`. For an owner whose `name` is null, the email falls through and can appear publicly.

Controls and mitigations:

- Drop `owner.email` from the public org payload, or gate the `owner.name ?? owner.email` fallback so a null name renders a non-PII placeholder instead of the email.
- Backfill `owner.name` for null-name owners on now-public orgs.
- Reconsider whether non-public orgs should resolve at all on the public route (a visibility gate), now that resolution is brand-agnostic.

### 13. Prod Neon credential exposure — rotation overdue (SESSION_0449/0450)

> **2026-06-26, SESSION_0452.** The prod Neon DB password leaked into local shell
> output twice (SESSION_0449 + 0450), each time via a `psql` error echoing the full
> connection string. Root cause: a host-only redaction regex left `USER:PASSWORD`
> before the `@` untouched (`docs/_archive/project-log/03-task-review-log.md:992`).
> Each session flagged "rotate" but the rotation never happened, so the credential
> should be treated as compromised. A SESSION_0452 secret sweep confirmed the value
> is **not** committed to the repo (current tree or history) — it lives only in the
> gitignored `apps/web/.env.prod` and Vercel env vars — so the blast radius is the
> local transcripts, not the public repo.

Controls and mitigations:

- **Rotate now:** reset the Neon role password in the dashboard; update
  `apps/web/.env.prod` (`DATABASE_URL`/`DIRECT_URL`) and the matching Vercel
  production env vars; redeploy/verify the prod connection (`psql -h pg.neon.tech …`).
- **Prevent re-leak:** pass DB creds via `PG*` env vars (never the URL on the command
  line) and redact `postgres(ql)://…` in any captured stderr — the pattern used in
  the SESSION_0452 prodsnap refresh.
- Consider a scoped, least-privilege Neon role for local prodsnap pulls instead of the
  primary owner role.

> **2026-06-28, SESSION_0465 — OPS HANDOFF PREPARED (NOT executed; operator-gated).**
> This session did **not** rotate the credential (rotating prod secrets + editing the Vercel
> dashboard are operator-gated; no push/deploy in this lane). The rotation is **still overdue**.
> Ready-to-run handoff for the operator:
>
> 1. **Neon dashboard** → project → Roles → reset the password on the prod role (or create a new
>    least-privilege role and repoint to it). Copy the new conninfo.
> 2. **Local** `apps/web/.env.prod` (gitignored) → update `DATABASE_URL` + `DIRECT_URL` with the
>    new password. Do **not** echo the URL to the terminal (it lands in transcripts — the original
>    leak). Edit the file directly.
> 3. **Vercel** (apps/web / BBL project) → Settings → Environment Variables (Production) → update
>    `DATABASE_URL` + `DIRECT_URL` → save. This requires a redeploy to take effect (next push, or a
>    manual redeploy of the latest prod deployment).
> 4. **Verify** the new credential connects **without** putting it on the command line — use `PG*`
>    env vars: `PGPASSWORD=… psql -h pg.neon.tech -U <role> -d <db> -c 'select 1'`. Confirm the BBL
>    prod app reads/writes after redeploy (any authed page).
> 5. **Invalidate** the old password (the reset in step 1 does this automatically for a same-role
>    reset; if you created a new role, drop/disable the old one once the app is confirmed on the new
>    one).
>
> After rotation, flip this row to RESOLVED with the date. The blast radius stays bounded (local
> transcripts only — confirmed not committed by the SESSION_0452 sweep), so this is a hygiene
> rotation, not an active-breach response — but it is overdue and should be done.

### 14. Authed/admin upload content-sniff gap — SVG stored-XSS (SESSION_0452)

> **2026-06-26, SESSION_0452 (parallel security-review agent).** The guest evidence
> path was hardened at SESSION_0445 (byte-sniff allowlist, SVG excluded), but the three
> **authenticated** image/video upload sites never received the same treatment — they
> trust `file.type` (client-declared) and `file.size` (client-reported). `image/svg+xml`
> passes `startsWith("image/")`; the avatar path promotes the URL to a public
> `Passport.avatarUrl`. **Fix (this session, PR):** a shared `sniffUploadBuffer` reads the
> bytes (`file-type`), rejects anything that doesn't sniff to `image/*`/`video/*` (SVG
> sniffs to `undefined` → rejected), and enforces the ceiling on `buffer.byteLength`.
> Applied at `applyWebMediaUpload`, `uploadMediaToLibrary`, and `uploadMedia`.
> `fetchMedia` (favicon/screenshot from Google/screenshotone) is server-fetched, not a
> user file — out of scope.

### 15. Guest email leak on public tournament results (SESSION_0452)

> **2026-06-26, SESSION_0452.** `findTournamentResults` selected `guestEmail` and the
> results components used it as the last display-name fallback. With a nullable
> `guestName`, a guest who registered with email only had that email printed in the
> public results HTML. **Fix (this session, PR):** drop `guestEmail` from the public
> payload and from the fallback chain; a name-less guest renders "Unknown".

### SESSION_0452 review confirmations (existing rows)

The parallel review re-confirmed three standing rows with concrete anchors (no new row needed):

- **#5 (rate-limit fail-open):** the app `isRateLimited` fail-open is deliberate, but
  Better Auth **magic-link / OTP send has no explicit `rateLimit` block** in `lib/auth.ts`
  and the `email_notify` bucket fails open — an auth-email flood is bounded only by Better
  Auth's in-memory default. Consider an explicit `rateLimit` config + fail-*closed* for
  OTP/magic-link send.
- **#6 (private media):** **confirmed real and unmitigated** — there is **no** media
  GET/proxy/signed-URL route anywhere; `Media.isPublic` only filters public *payloads*, it
  does not gate the object. Private cert PDFs / claim-evidence are world-readable by URL
  (security-by-obscurity on the UUID key). Architectural fix (signed-URL route or
  private bucket/prefix) — deferred, tracked here.
- **#7 (PII/secret logging):** **confirmed** — no `safeLog`/redaction helper exists;
  logging is raw `console.*`. No secret/body is logged today, but `userId` is logged
  cleartext and there is no guardrail against the next `console.log(session)`. Add a
  `safeLog` + lint-ban bare `console.log` in `server/**`.

**Verified safe (this review):** no unauthenticated/non-admin path reaches an admin action
or admin data (only the known #11 cross-org super-user + a LOW `updateUserRole` self-lockout
footgun); the Stripe webhook is signature-verified before processing, idempotent, and grants
entitlements only off Stripe-side price IDs + a server-set `metadata.userId` (no forgery
path); risk **#12 owner-email fallback is fixed** (`organizationOwnerPayload` = `{id,name}`,
no email).

## Relationships

- [Security review hub](README.md)
- [Brand-scope hardening plan](brand-scope-hardening-plan.md)
- [Security test plan](security-test-plan.md)
- [Privacy data classification](privacy-data-classification.md)
- [Payment security checklist](payment-security-checklist.md)

## Open Questions

> **2026-06-24, SESSION_0447.** The first two questions are **moot under the
> single-brand collapse** (no brand-scope allowlist / cross-brand admin bypass to
> design). The security-headers question (#3) is still open.

- ~~Which models are definitely brand-scoped and should be in the first allowlist?~~ *(moot — single brand)*
- ~~Should global admins bypass brand-scope enforcement by explicit helper only, or via a separate unscoped client?~~ *(moot — single brand)*
- Which security headers break current Stripe/analytics/media integrations in report-only mode?
