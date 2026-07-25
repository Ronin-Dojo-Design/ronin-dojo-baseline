---
title: "Research-Review + build-ready spec — the RDD client portal (ronindojodesign.com)"
slug: research-review-rdd-client-portal
type: research-review
status: draft
created: 2026-07-24
created_at: 2026-07-24T09:00Z
updated: 2026-07-24
author: "Claude (Fable 5) — autonomous /rr + spec lane, wave 13"
session: SESSION_0677
operator: Brian
decision: "pending operator sign-off — every fork in §7 is OPEN"
pairs_with:
  - docs/sprints/SESSION_0677.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
  - docs/architecture/decisions/0051-brand-platform-product-portfolio-taxonomy.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Research-Review + build-ready spec — the RDD client portal

> `/rr` + phased spec, SESSION_0677 (research + recommend; forks OPEN, nothing built). Operator
> directive: **Michael logs in to ronindojodesign.com as a CLIENT USER** — billing account details,
> project status, clickable preview links (State of the Building etc.), component previews, design
> previews with the feature widget — **and Black Belt Legacy onboarded as a client too (Tony)**.
> Plus **SOP/document uploads**: Michael creates SOPs/docs on his Claude and uploads them to
> ronindojodesign.com; Brian gets quick upload access + retrieval.

## TL;DR — Verdict

**Phase-1 default: `apps/rdd` gets its OWN Better Auth (magic-link, passwordless) on its OWN new
`rdd` Postgres — the ADR 0038 D1/D5 shape the MMB CRM already proved** (standalone
`betterAuth` + `prismaAdapter` + own schema, `clients/mammoth-build-crm/lib/auth.ts:39`), with the
login *mechanism* borrowed from `apps/web`'s magic-link plugin instead of the CRM's passwords —
clients should never manage a password for a portal they visit monthly. Reusing `apps/web`'s auth
cross-domain is **rejected**: `ronindojodesign.com` is not (and must not become) a BBL trusted
origin (`apps/web/lib/brand-context.ts:32-37`), cookies don't span registrable domains, and ADR
0038 D5 says identity is per-product, full stop. Client scoping is a two-table hand-rolled
`Client`/`ClientMembership` pair (Michael→MMB, Tony→BBL, Brian→all) — the Better Auth
*organization* plugin is the growth path, not the day-1 shape. Project status ships file-fed
(committed per-client content, no CRUD); billing + previews are Phase 2 read surfaces over the
0667/0672 pipeline; document exchange is Phase 3 with **the email-in channel first** (Michael's
Claude already creates + emails documents; `welcome@ronindojodesign.com` already receives; #269's
`InboundEmail` module needs only an attachment-persist step) and portal R2 uploads second.

---

## 0. Verify-first evidence (canonical checkout + named branches, read-only)

All claims verified against the `main`-based worktree and the named wave branches via `git show`;
cited `file:line` throughout.

| # | Claim | Evidence |
|---|---|---|
| V1 | **`apps/rdd` is a static, no-DB, no-auth Next.js app by design.** "Slice A: workspace-peer scaffold + hello-route only — no DB, no auth, no cloud yet." The whole app is 10 files (configs + `layout.tsx` + `page.tsx` + `globals.css`). | `apps/rdd/package.json:5`; `find apps/rdd -type f` |
| V2 | **The DB path is pre-planned in its own deploy config**: "No db:generate step — RDD has no Prisma schema yet (SESSION_0625; **if a DB lands, add it here the way apps/web does**)." Deploy unit is per-app (ADR 0034/0051); `ignoreCommand` rebuilds on `apps/rdd` + `packages` + root config only, markdown excluded. | `apps/rdd/vercel.json:6-7` |
| V3 | RDD already consumes the kernel: `"@ronin-dojo/ui-kit": "workspace:*"` + `transpilePackages` — any ui-kit component can render in the portal today. | `apps/rdd/package.json:13`, `apps/rdd/next.config.mjs:15` |
| V4 | **The kernel auth shape (BBL)**: Better Auth with `magicLink` (7-day expiry, branded `sendEmail` via Resend), `oneTimeToken`, `admin` plugins; `trustedOrigins: BRAND_TRUSTED_ORIGINS`. Those origins are **BBL-only** (`blackbeltlegacy.com`, `bbl.local`, `localhost`) and the single-brand collapse hardcodes `resolveBrand → Brand.BBL`. | `apps/web/lib/auth.ts:5,110,200-231`; `apps/web/lib/brand-context.ts:32-40` |
| V5 | **ADR 0038 D1/D5 are the law**: one database per product, no cross-product FKs (D1); "Identity is per-product… No shared `User`/session table across products — a shared identity service is out of scope. **Duplicated auth schema per app is correct, not duplication-to-fix**" (D5). | `docs/architecture/decisions/0038-per-product-database-separation.md:59-61,74-76` |
| V6 | **The standalone-auth precedent is live**: MMB CRM runs its own `betterAuth` + `prismaAdapter` on its own Postgres — email+password, `admin` plugin with `owner`/`member` roles, `BETTER_AUTH_URL`-or-`VERCEL_URL` baseURL. ADR 0038 Phase 1 landed at SESSION_0459 (own `prisma/schema.prisma`, own `prisma.config.ts`, own `DATABASE_URL`). | `clients/mammoth-build-crm/lib/auth.ts:39-85`; ADR 0038 "Implementation status" |
| V7 | **The ONE R2 seam**: `uploadToS3Storage(file, key, brand?)` — per-brand bucket routing via `getMediaConfig(brand)`, content-type sniffing via `fileTypeFromBuffer`. The uploader family (`components/web/uploader/*`) is image-shaped (crop presets) and feeds this seam. | `apps/web/lib/media.ts:53-60`; `apps/web/components/web/uploader/` |
| V8 | **PR #262 put the first client-facing module in the kernel**: `packages/ui-kit/src/intake/*` (questionnaire engine + `rdd-initial-client-meeting` + `metal-building-sales` questionnaires), consumed by the CRM's `/app/intake`. Precedent: portal features live in the kernel, apps mount them. | PR #262 file list (`gh pr view 262`) |
| V9 | **The 0675 feature-intake spec is the portal's sibling**: `FeatureRequest` model with brand pinned server-side by the mount, no-send-by-construction, the widget already flagged as a ui-kit extraction candidate ("the MMB mount is a separate fast-follow"). | `git show origin/auto/session-0675-feature-intake-billing:docs/product/mammoth-build/feature-intake-billing-spec-draft.md` §2-3; `apps/web/components/web/feature-widget.tsx:43-58` |
| V10 | **The 0667 billing pack (branch, unmerged) is the billing content**: `state-of-the-building.html` (self-contained 199-line client-status page, DRAFT watermark, no script/auth), `rdd-client-invoice-template.md` (paste-block + "nothing sends without the word" checklist), `invoice-mmb-draft.md` (F&F rate), `hours-worksheet.md`. | `git show origin/auto/session-0667-mmb-billing --stat` |
| V11 | **The QuickBooks flow (#300 /rr) keeps the markdown pipeline as ledger-of-record for now**: week-1 = zero-integration (PDF/email → Julie); step-2 = the official Intuit QuickBooks connector for Claude; custom API deferred; every future write creates **unsent/unpaid** records only. | `git show origin/auto/session-0672-mmb-quickbooks-rr:docs/architecture/research/research-review-mmb-quickbooks-integration.md` §TL;DR, §3 |
| V12 | **The inbound-email module exists (#269, in review)**: Resend `email.received` webhook with in-house svix verification (fail-closed in prod when secret unset) → idempotent `InboundEmail` upsert (`resendEmailId @unique`, from/to/subject/textBody/htmlBody/rawPayload/brand?/triageStatus) → `/app/inbox` AdminCollection gated on `email.manage`. Migration authored but **NOT applied** — the 0639 pattern. | PR #269 body; `git show origin/auto/session-0639-inbox-module:apps/web/prisma/schema.prisma:4603-4622` |
| V13 | `welcome@ronindojodesign.com` is wired on both sides of the fence: the platform's brand-sender map and the public RDD page's contact CTA. | `apps/web/lib/email.ts:30`; `apps/rdd/app/page.tsx:19` |
| V14 | **The email-auth trap memories bind any portal login design**: never embed a one-shot magic token as an email CTA (scanners consume it — bind to a durable `/auth/login`); keep `callbackURL` a single-query relative path (double-decode 403); Resend keys are domain-scoped (a wrong-domain key → 403 on send). | `email-links-durable-not-one-shot-magic-tokens`, `magic-link-callback-double-decode`, `bbl-resend-key-and-dogfood-teardown` memories |
| V15 | **Parallel lane 0678 is building the v0 preview area** — an env-gated *static* preview surface on `apps/rdd` (no branch pushed at research time). This spec treats it as Phase 0: the portal is the real thing it grows into; routes should survive, the gate gets replaced. | Wave-13 dispatch; no `origin/auto/session-0678-*` ref exists yet (`git branch -r`) |

---

## 1. Research — what agencies actually expose in a client portal

**Structure Webworks** (the operator's named comparable — an agency selling "dashboards, portals
and internal tools" to ops-heavy service businesses) sells *visibility as the product*: a working
**clickable demo every Friday**, weeks 5–11 as weekly releases, monthly reporting against the
client's own metrics, same-day response commitments, and "tracking portal" deliverables. The pitch
is not the portal software — it's *the client never has to ask what's happening*.

The 2026 client-portal literature converges on the same short list. Must-haves for a service-firm
portal: **branded login on your domain, project/task status the client can check without emailing,
file sharing with approval workflows, invoice view + history, per-stakeholder permissions, and
notifications from your domain**. The *most-used* features in agency portals are consistently
file sharing, approvals, and status visibility — billing co-located with them is what separates
"portal" from "shared folder."

Mapped onto the operator directive, Michael's asks are the standard set almost 1:1:

| Directive item | Industry pattern | This repo's asset |
|---|---|---|
| Billing account details | Invoice view + history (read, not pay) | 0667 invoice pipeline (V10) + QuickBooks flow (V11) |
| Project status | Live status page / activity feed | State-of-the-Building (V10), State-of-Dojo kernel (G-023) |
| Clickable preview links | Weekly clickable demos (Structure Webworks' core move) | Vercel preview deploys + committed HTML artifacts |
| Component/design previews + feature widget | Approval workflows on work-in-progress | ui-kit mounts (V3) + 0675 FeatureRequest spec (V9) |
| SOP/document uploads | File exchange with received/review states | R2 seam (V7) + InboundEmail (V12) |

The delta from "standard portal" is in our favor: no payments processing (drafts only, V10/V11),
no messaging surface (email stays email), two named clients — so the build is a *read-mostly*
portal plus one upload path, not a SuiteDash clone.

## 2. Research — auth for a two-client portal

**Better Auth's `organization` plugin** is the framework answer to multi-tenancy: it generates
`organization`/`member`/`invitation` tables plus `activeOrganizationId` on the session, with
role-based access per org. It is real and well-trodden — and it is the wrong first move here.
Two clients, three humans, no client-side self-service team management: the plugin's invitation
flows, org switchers, and four extra tables buy nothing yet. The lean shape is the one the repo
already uses twice: **the `admin` plugin for coarse roles** (CRM `owner`/`member`, V6; BBL
`admin()`, V4) **plus a small domain pair** — `Client` (slug `MMB`|`BBL`|…) and
`ClientMembership` (userId, clientId). Migrating to the organization plugin later is additive
(its tables are new, not reshaped). Fork §7.3.

**Mechanism**: magic-link over passwords. `apps/web` already solved every sharp edge — 7-day
expiry for slow email readers, branded sender, the send seam (`lib/auth.ts:200-224`) — and the
V14 memories pin the traps (durable `/auth/login` CTA in any *emailed* link, single-query relative
`callbackURL`). The CRM chose passwords because it had **no email infra** (its own comment:
"no public self-serve email-verification flow yet (no email infra)… flip this on once a sender is
wired"). RDD *has* the sender identity (V13) — the gate item is a **`ronindojodesign.com`-scoped
Resend API key** (V14: keys are domain-scoped; the Baseline key would 403).

**Cross-domain reuse of `apps/web`'s auth is rejected on three grounds**: (1) ADR 0038 D5 —
identity is per-product, no shared User/session table (V5); (2) mechanics — session cookies are
scoped to the registrable domain, and `ronindojodesign.com` ↔ `blackbeltlegacy.com` share nothing;
adding RDD to `BRAND_TRUSTED_ORIGINS` would re-grow the multi-brand harness the single-brand
collapse just killed (V4); (3) blast radius — BBL is live and paid; the portal must not be able
to break its auth. Fork §7.2 records it anyway.

## 3. Research — document exchange + the "Michael creates on his Claude" flow

**What Michael's Claude can already do** (all GA in 2026, Free tier included): create real
`.docx`/`.xlsx`/`.pptx`/PDF files in-conversation, download them or save to Google Drive, and
draft/send email through the Gmail connector. Anthropic also ships Word/Excel/PowerPoint add-ins
plus an Outlook beta. Practical consequence: **"Michael writes an SOP on Claude and emails it to
welcome@ronindojodesign.com" requires teaching Michael nothing** — create file → attach → send is
a native flow on his side.

**The receiving side is nearly free** (the mission's instinct verified): `welcome@` receives
today, and #269's `InboundEmail` module (V12) turns every received email into a triage row in
`/app/inbox`. Two real gaps, both small:

1. **Attachments are NOT in the webhook payload.** Resend's `email.received` event carries
   metadata only; the attachment list + `download_url`s come from a follow-up call to the
   Received-Emails/Attachments API. An SOP-by-email channel must fetch those URLs **at webhook
   time and persist the bytes to R2** — treat `download_url` as ephemeral, our R2 copy as
   canonical.
2. **`InboundEmail` lives in `apps/web`'s DB** (the platform inbox). That is *fine* for Brian's
   retrieval (the `/app/inbox` AdminCollection is his surface, day 1) but it is not
   client-visible. Portal-side visibility means mirroring a `SopDocument` row into the `rdd` DB —
   crossing products via API/contract, never FK (ADR 0038). Phase 3 sequences this deliberately.

**Portal upload vs shared-drive vs email** — the small-agency literature is unanimous that email
threads and ad-hoc drive links stop scaling almost immediately (no review states, no audit, "did
you get my email?"), while a portal upload gives received/under-review/approved visibility. But
the honest read for a two-client agency: **email-in with automatic capture IS a portal intake** —
the capture, idempotency, and triage queue exist (V12); only the attachment-persist step is
missing. Recommendation: email-in first (zero client friction, ~1 focused lane), portal
drag-and-drop second (when review-states and client-side listing earn their build). Fork §7.5.

---

## 4. The spec — phased, build-ready

Threaded through every phase, inherited from the 0675/0667 house rules: **nothing sends
automatically, ever** — no invoice, no estimate, no client notification without Brian's explicit
send; drafts remain drafts. And the standing repo laws: 4 authz systems never a 5th, migrations
via the 0639 pattern, `prisma migrate dev` banned.

### Phase 0 — exists / parallel: the 0678 env-gated preview area

**What it gives** (V15): a preview surface on `apps/rdd` behind an env gate — the fastest
possible "Michael can click a link tonight" move, zero DB, zero auth build.

**What it lacks — exactly the list Phase 1 exists to fix**: no identity (a shared secret is not
"Michael logs in"), no per-client scoping (anyone with the code sees everything), no audit trail,
no uploads, no billing data — and env-gate secrets leak by forward/screenshot with no revocation
story per person.

**Growth contract (do not collide)**: 0677 reserves the *shape*, 0678 owns the v0 files. The
portal adopts 0678's routes (whatever it ships under, e.g. `/preview/*`) rather than renaming
them; the env gate is replaced by session auth in Phase 1; static preview content becomes
authenticated content. Nothing in this spec requires 0678 to change.

### Phase 1 — real auth + client accounts + project status

**1a. The `rdd` database lands** (fork §7.1 — recommendation: yes, now):

- New Postgres (Neon project `rdd`) per ADR 0038 D1 — clients get *new* DBs (ADR 0038
  implementation note). `apps/rdd/prisma/schema.prisma` + `prisma.config.ts` (the CRM's Prisma-7
  shape, V6) + own `DATABASE_URL`.
- `vercel.json` gains the db:generate/migrate-deploy steps "the way apps/web does" — its own
  comment already reserves the slot (V2). Mind the PL-010 trap: `prisma generate` before build
  after any schema change; never mask exit codes with pipes.
- Migration rules — the 0639 pattern (V12): hand-authored migration committed WITH the schema,
  **unapplied by the lane**; the attended merge owner applies it. `migrate dev` banned.

**1b. Auth — standalone Better Auth, magic-link** (forks §7.2/§7.3):

- `apps/rdd/lib/auth.ts`: `betterAuth` + `prismaAdapter` (V6 precedent) with plugins
  `magicLink` (7-day expiry, the V4 shape) + `admin` (roles: `operator` — Brian; `client` —
  default). No social providers, no passwords, no oneTimeToken.
- Send seam: Resend with a **`ronindojodesign.com`-scoped key** (`RESEND_API_KEY_RDD`; V14).
  Gate item before build: confirm the domain is verified for *sending* in Resend (receiving
  already live). Emailed links bind to durable `/auth/login`, never a raw one-shot token (V14).
- `trustedOrigins`: `https://ronindojodesign.com` + localhost dev — RDD's own list; BBL's list
  untouched.
- Sign-up is closed: no self-serve registration. Brian provisions users (seed or a minimal
  operator action). Three users at launch: Brian (operator), Michael (client/MMB), Tony
  (client/BBL).

**1c. Client scoping — two tables, one helper**:

```
Client           { id, slug "MMB"|"BBL", name, createdAt }
ClientMembership { id, userId, clientId, role: "viewer" (default), @@unique([userId, clientId]) }
```

One server helper `requireClientAccess(clientSlug)` — session → memberships → allow if member or
operator. Every portal route under `/portal/[client]/…` calls it. That's the whole authz story;
no new authz *system* (the key/role vocabulary stays inside Better Auth's admin plugin + this
pair).

**1d. Project status page** (fork §7.9 — recommendation: file-fed, no CRUD):

- `/portal/[client]` renders a per-client status source committed in-repo:
  `apps/rdd/content/clients/<slug>/status.json` (or MDX) — period, current focus, shipped list,
  next-up, links. Lanes already produce status artifacts every session; committing a JSON
  projection is a bow-out step, not a product. A deploy on status change is acceptable and
  already scoped (`ignoreCommand` covers `apps/rdd`; note `.md` is excluded — use `.json`/`.mdx`
  or ship the content as `.ts`, V2).
- A DB-backed `ProjectStatus` + admin CRUD is deliberately deferred — build it when status
  updates outgrow the session cadence.

**Phase-1 gates**: `rdd` typecheck + build green; unit tests for `requireClientAccess` (member,
non-member, operator, signed-out); magic-link e2e smoke on preview deploy (send → durable login →
land on `/portal/mmb`); migration applied by merge owner only; secrets in Vercel (Sensitive vars
trap: verify they actually pull, `bbl-launch` memory).
**Kill-switch**: `PORTAL_ENABLED` env — middleware 404s `/portal/*` + `/auth/*` when unset;
the marketing page is untouched either way.
**Effort**: 2–3 lanes (DB+auth scaffold ≈1; portal shell + scoping + status ≈1; smoke/polish ≈½–1).

### Phase 2 — billing surface + preview links + component/design previews

**2a. Billing (read-only)**: `/portal/[client]/billing` renders the client's invoice artifacts
from the 0667 pipeline (V10) — status-labeled `DRAFT` / `SENT` / `PAID`, plus the rate-table
framing the template already ratifies (standard rate always visible next to F&F). The
ledger-of-record stays the markdown/QuickBooks flow (V11) — the portal is a *view*, never a
biller: **no pay buttons, no Stripe, no auto-send**. QuickBooks connector work stays in the #300
lane; if/when QBO becomes the record, this page reads exports, not the API.

**2b. Artifact hosting** (fork §7.4 — recommendation: R2 + `PortalDocument`): the State of the
Building, deck HTML, and future one-off client artifacts need an authenticated home. Options:

- **(a) Committed content** in `apps/rdd/content/` — works day 1 (self-contained HTML streams
  fine from a route handler), but every artifact update is a commit + deploy, and `docs/product/**`
  artifacts don't trigger RDD deploys (V2) so they'd have to be *copied* in — drift risk.
- **(b) R2 bucket (`rdd-portal`) + `PortalDocument` rows** (id, clientId, kind
  `STATUS_ARTIFACT`|`INVOICE`|`DECK`|`SOP`, title, r2Key, contentType, uploadedBy, createdAt) +
  an authenticated streaming route (`/portal/[client]/doc/[id]` → `requireClientAccess` → stream
  from R2; no public bucket, no signed-URL leakage into referrer logs). One storage story that
  Phase 3 reuses byte-for-byte. **Recommended.**
- **(c) Status quo** — claude.ai artifact links: private-by-default, not client-branded, no
  client-scoped access control. Bridge only.

Ship (a) for the first State-of-the-Building weeks if 0678 already committed it; land (b) inside
Phase 2 proper.

**2c. Component/design previews**: `/portal/[client]/previews` — ui-kit mounts render natively
(V3, `transpilePackages` already set). Pattern: a small registry of named preview entries
(component + props fixture), same law as the kernel — modules in `packages/ui-kit`, the portal is
just another mount. Clickable Vercel preview-deploy links live here too (the Structure Webworks
Friday-demo move, made permanent).

**2d. The feature widget** (fork §7.6 — recommendation: deep-link first): the 0675 spec puts
`FeatureRequest` intake ON the product surfaces (BBL `/app/state` for Tony via a
`feature-request.create` grant; an MMB CRM mount for Michael) with brand pinned server-side (V9).
The portal should **deep-link** to those mounts, not duplicate the write path — a portal-local
`FeatureRequest` table in the `rdd` DB would be a third intake store crossing no-cross-product
lines for no gain. Revisit only if clients demonstrably won't leave the portal to file requests.

**Phase-2 gates**: streaming route authz tests (member/non-member/operator × each kind);
contentType allowlist on serve (html/pdf/png/…); build green; no new send paths (grep-gate:
`sendEmail(` count in `apps/rdd` stays 1 — the magic-link seam).
**Kill-switch**: `PORTAL_BILLING_ENABLED` flag hides `/billing` independently.
**Effort**: ~2 lanes (billing view + artifact store ≈1; previews + registry ≈1).

### Phase 3 — document exchange (SOPs both directions)

**3a. Email-in channel — FIRST** (fork §7.5): Michael creates the SOP on his Claude, attaches,
sends to `welcome@ronindojodesign.com` (§3 — native on his side; zero training). Build on #269
(V12), in `apps/web` where the module lives:

- Extend the webhook handler: on `email.received`, after the idempotent upsert, fetch the
  attachment list + `download_url`s from Resend's API and **persist bytes to R2 via the existing
  seam** (`uploadToS3Storage`, V7) — `InboundEmailAttachment` rows (inboundEmailId FK, filename,
  contentType, size, r2Key). Fail-open on attachment fetch (the email row must land even if a
  fetch fails; retry queue = triageStatus).
- Size/type caps (pdf/docx/md/html/png; reject executables), and the existing fail-closed
  webhook posture stands (V12).
- **Brian's retrieval, day 1**: `/app/inbox` grows an attachments column/download action — his
  quick-retrieval ask is satisfied inside the surface #269 already built. ntfy notification on
  new inbound doc (the notification stack exists) = "quick access."
- Dependency honesty: #269 is in review with its migration unapplied — this slice **stacks on
  its merge**, and the attachment table is a second 0639-pattern migration.

**3b. Portal upload — SECOND**: `/portal/[client]/documents` — drag-and-drop upload (Michael;
Brian too) → route handler → size/type validation (`fileTypeFromBuffer`, the V7 pattern) → R2
`rdd-portal` bucket → `PortalDocument` row (kind `SOP`, status `RECEIVED`|`IN_REVIEW`|`ACCEPTED`).
This is a *document* seam patterned on `media.ts:53`, not the image-uploader family (crop presets
don't apply — the image-inputs law governs *images*; a doc-upload seam is a sibling, kept to ONE
implementation in `apps/rdd`). Listing + download for both sides; review-state chips give the
portal-visibility win email lacks.
- Brian's *push* direction (Brian → Michael: SOPs, guides): same `PortalDocument` store, uploaded
  via the same page (operator role) — retrieval UX is the same list Michael sees.

**3c. Cross-product visibility (deferred until wanted)**: mirroring 3a email-in docs into the
portal means an API/contract hop (`apps/web` → `rdd`), never a shared table (V5). Cheapest
honest bridge: Brian re-uploads the vetted SOP to the portal (a 10-second drag) — vetting is a
human step anyway. Automate only on demonstrated volume.

**Phase-3 gates**: upload route authz + validation tests; attachment-fetch unit tests (mock
Resend API); R2 bucket private + streaming-only; e2e: upload → listed → download round-trip;
migrations 0639-pattern (×2, one per app).
**Kill-switches**: `PORTAL_UPLOADS_ENABLED`; the webhook's existing fail-closed secret check.
**Effort**: 3a ≈1 lane (post-#269-merge); 3b ≈1–1.5 lanes.

### Tony / BBL as a client — scope (fork §7.7)

Tony onboards in Phase 1 as `client` on Client `BBL` — same model, zero extra build. His portal
view: BBL project status + previews + (Phase 2) BBL-relevant artifacts. **Recommended scope:
read-only + deep-links** — his feature-intake affordance is the 0675 BBL-side grant on
`/app/state` (V9), where he already lives; the brand-scoped State-of-Dojo work (#303) is the
natural status feed for his page. The portal gives Tony the *client-relationship* view (what RDD
is doing for BBL), not a second BBL product surface.

### Ronin-bots tie-in (reference only)

A parallel lane is drafting the client-facing agent-names concept ("Ronin-bots"). The portal is
its natural surface — status entries and delivered artifacts can carry agent bylines
("delivered by <bot>") once that lane ratifies names. No portal schema accommodation needed now
(a nullable `authoredBy` string on `PortalDocument`/status entries later). Fork §7.8 records the
tie-in so neither lane blocks the other.

---

## 5. Phase summary

| Phase | Ships | New DB objects | Gates headline | Effort |
|---|---|---|---|---|
| 0 (0678, parallel) | Env-gated static preview area | — | n/a (that lane's) | — |
| 1 | rdd DB + magic-link auth + Client scoping + status pages | Better Auth tables, `Client`, `ClientMembership` | authz unit tests + magic-link smoke + 0639 migration | 2–3 lanes |
| 2 | Billing view + artifact store/streaming + component previews | `PortalDocument` | streaming authz tests + no-send grep-gate | ~2 lanes |
| 3 | Email-in SOP capture (apps/web) + portal uploads (rdd) | `InboundEmailAttachment` (web) + `PortalDocument` kind SOP | upload validation + round-trip e2e | 2–2.5 lanes |

## 6. What this spec deliberately leaves alone

- **The 0675 `FeatureRequest` model and its forks** — referenced, not re-decided (V9).
- **#269's merge residuals** (webhook registration, migration apply, smoke) — that lane's list.
- **The QuickBooks forks (#300 F1–F6)** — the portal reads billing artifacts regardless of which
  QBO option the operator picks.
- **Payments** — no Stripe, no pay-now, nothing moves money from the portal, any phase.
- **The RDD marketing page** (`apps/rdd/app/page.tsx`) and its brand-brief guardrails — the
  portal lives beside it, not inside it.
- **The 0678 v0 preview build** — Phase 0 adopts it; nothing here changes its files.

## 7. OPEN FORKS — operator ratifies

| # | Fork | Options | Recommendation (open) |
|---|---|---|---|
| 7.1 | DB-or-not for Phase 1 | New `rdd` Neon DB now · stay env-gated static (defer DB) | **DB now** — "Michael logs in" is an identity feature; Better Auth requires a store; ADR 0038 D1 shape is proven (V6) and the vercel.json slot is reserved (V2) |
| 7.2 | Auth mechanism | Own Better Auth + magic-link (rec) · reuse apps/web auth cross-domain · CRM-style passwords | **Own + magic-link** — D5 law + cookie mechanics kill cross-domain (§2); passwords are wrong for monthly-visit clients; CRM chose them only for lack of email infra |
| 7.3 | Client scoping model | Hand-rolled `Client`/`ClientMembership` (rec) · Better Auth organization plugin | **Hand-rolled pair** — 2 clients, no self-serve teams; org plugin is the additive growth path |
| 7.4 | Artifact hosting | R2 + `PortalDocument` + streaming route (rec) · committed content in apps/rdd · claude.ai artifact links | **R2 + rows** — one storage story shared with Phase-3 SOPs; committed-content bridge acceptable first weeks |
| 7.5 | Upload channel priority | Email-in first (rec) · portal upload first · both at once | **Email-in first** — zero client friction, #269 does 80% (V12); only attachment-persist is new. Portal upload when review-states earn it |
| 7.6 | Feature-widget on the portal | Deep-link to the 0675 mounts (rec) · portal-local FeatureRequest table | **Deep-link** — no third intake store, no cross-product write path |
| 7.7 | Tony's scope | Read-only + deep-links (rec) · full feature-widget in-portal | **Read-only** — his intake grant lives on `/app/state` (V9); portal = the client-relationship view |
| 7.8 | Ronin-bots surfacing | Portal bylines when names ratify · keep agents invisible to clients | Defer to the naming lane; schema needs nothing today |
| 7.9 | Project-status source | Committed per-client content (rec) · DB-backed ProjectStatus + CRUD | **Committed content** — status is already a session-cadence artifact; CRUD when cadence outgrows commits |

## 8. Sources

**Repo / branches (read this session):** `apps/rdd/*` (package.json, vercel.json,
next.config.mjs, app/page.tsx) · `apps/web/lib/auth.ts` · `apps/web/lib/brand-context.ts` ·
`apps/web/lib/media.ts` · `apps/web/lib/email.ts` · `apps/web/components/web/feature-widget.tsx` ·
`clients/mammoth-build-crm/lib/auth.ts` · ADR 0038 · ADR 0051 (via CLAUDE.md) · PR #262/#269/#300
(`gh pr view`) · branches `auto/session-0675-feature-intake-billing`,
`auto/session-0667-mmb-billing`, `auto/session-0672-mmb-quickbooks-rr`,
`auto/session-0639-inbox-module` (`git show`) · memories: `email-links-durable…`,
`magic-link-callback-double-decode`, `bbl-resend-key…`, `prisma-prod-migration-flow`,
`image-inputs-are-uploaders…`, `notification-stack-ntfy`.

**Web (accessed 2026-07-24):**

- [Structure Webworks — home](https://structurewebworks.com/) (weekly Friday demos, tracking
  portals, monthly metric reporting)
- [Assembly — 11 must-have client portal features (2026)](https://assembly.com/blog/client-portal-features)
- [Assembly — client portal examples](https://assembly.com/blog/client-portal-examples)
- [WeWeb — best client portals 2026, buying guide](https://www.weweb.io/blog/client-portals-buying-guide)
- [Moxo — client document portals](https://www.moxo.com/blog/client-document-portals)
- [Zite — what is a client document portal (2026)](https://www.zite.com/blog/client-document-portal)
- [Better Auth — organization plugin docs](https://better-auth.com/docs/plugins/organization)
- [ZenStack — multi-tenant apps with Better Auth](https://zenstack.dev/blog/better-auth)
- [Resend — Inbound (receive emails)](https://resend.com/features/inbound)
- [Resend — receiving emails docs](https://resend.com/docs/dashboard/receiving/introduction)
- [Resend — inbound emails announcement](https://resend.com/blog/inbound-emails)
- [Claude Help Center — create and edit files with Claude](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)
- [Claude Cowork — integrations (Gmail, Drive)](https://claudecowork.im/integrations)

## 9. Method note

/rr lane, docs-only, worktree `ronin-0677`. Verify-first against the `main`-based tree + four
unmerged wave branches via `git show` (nothing asserted from memory where a file could be read);
web claims cross-checked across at least two sources where load-bearing (Resend
attachments-not-in-webhook; Claude file-creation GA). Forks presented with recommendations,
decisions left to the operator. Nothing built, nothing sent.
