---
title: "SESSION 0436 — Brian Truelson happy-path: diagnose claim/dashboard/cert, then green-gated real send"
slug: session-0436
type: session--plan
status: closed
created: 2026-06-23
updated: 2026-06-23
last_agent: claude-session-0436
sprint: S43
pairs_with:
  - docs/sprints/SESSION_0435.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
  - docs/petey-plan-0436-claim-unification.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0436 — Brian Truelson happy-path: diagnose claim/dashboard/cert, then green-gated real send

## Date

2026-06-23

## Operator

Brian + claude-session-0436

## Goal

Give **Brian Truelson** (`btruelson@gmail.com`, a long-time loyal member who emailed frustrated that the
*old* site never showed his profile or certificates) a verified happy-path first experience on the new
site: an email with **functioning** links that lets him claim his existing placeholder profile (from the
tree **or** the invite email — the two flows reconciling to the same node), sign in, edit his profile and
see the results on his public profile, land on a coherent member dashboard, see his rank + certificate, and
receive the correct lifecycle emails. **The real send is gated on a GREEN dry-run** (operator decision):
diagnose the gaps first, fix what's needed, prove the whole path on `ronindojo_prodsnap` with a throwaway
account, preview to the operator's inbox, and only then send the real email to Brian.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0435.md` (FI-009 BJJ technique-graph + curriculum verify +
  prod import; LIVE on prod).
- Carryover: 0435's "Next session" block (helio-gracie `TREE_SEEDS` + FI-009 graph follow-ups) is
  **superseded** by this operator-directed lane (per `operator-drives-nothing-canonical` — no autopilot of
  the stale block). Helio `TREE_SEEDS` remains a deferred tail.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `c028f110`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth (claim/sign-in reconcile), member dashboard surface, Content (Certificate subsystem), Prisma (read-only verify; possible cert/claim wiring) |
| Extension or replacement | Extension + diagnosis: verify/repair existing claim + dashboard + cert wiring; no new framework |
| Why justified | A real frustrated VIP must get a coherent first experience; current member-landing topology is incoherent (two overlapping homes + an admin-gated `/app`) |
| Risk if bypassed | Broken claim link / dead-end dashboard / missing certificate to an already-frustrated loyal member — bad first impression on the flagship |

Live docs to check during diagnosis: Dirstarter member-dashboard pattern (which surface is the intended
member home), Better Auth (claim reconcile on sign-in). To confirm in TASK_01.

### Graphify check

- `graphify stats` → 14,901 nodes / 28,294 edges / 2,463 files.
- `graphify query "member dashboard consolidate admin to app role gating"` → surfaced **three** shells:
  `app/(web)/dashboard/` (tabbed member home), `app/admin/*` (legacy), `app/app/*` (consolidated,
  `hasAnyLineageGrant`-gated). Confirms a prior `/admin → /app` consolidation and a separate `/dashboard`
  member surface. Direct inspection then confirmed `/me` ("My Passport") overlaps `/dashboard`'s
  profile+lineage tabs, and `/app/layout.tsx` is grant-gated (NOT a plain-member home).

### Grill outcome (Petey, bow-in)

Forks resolved with the operator before planning:

1. **Send safety:** Full dry-run on prodsnap → fix → preview to operator inbox → real send once green.
2. **Send path:** Claim staged via the bespoke `scripts/send-bbl-truelson-thankyou.ts`
   (`--backfill` + `--grant`); the actual email sent via the `/app/email` admin composer (live preview).
3. **Certificates:** A **member-facing "my certificate" view is in scope** — likely the core of his
   frustration. Found admin issuance + public `/certificates/verify`, but no confirmed member view.
4. **Dashboard:** Both `/me` and a member home are in scope, and **wiring is suspected broken**. Operator's
   intuition was "`/app` should be the member dashboard," but `/app` is grant-gated admin tooling — so the
   canonical member-landing is itself unresolved. Operator directive: **diagnose first, then decide**
   consolidate-now vs defer once the real cost is visible.
5. **Flow awareness (tree-claim ⇄ invite-email):** **both** a precaution AND an observed defect — the
   operator saw it **misbehave with Tony Hua** (fellow admin/PM). Reproduction + fix is in scope.
6. **Timing:** Real send is **green-gated**; if diagnosis surfaces real work, the send moves to the next
   session. Operator accepted the slip to protect the VIP first impression.

Prior art (do NOT rebuild): node `brian-truelson` (1st-degree BJJ BB under Bill Hosken, claimable);
`emails/bbl-first-tester-welcome.tsx`; `scripts/send-bbl-truelson-thankyou.ts`
(`--verify/--backfill/--grant/--send`); `LineagePendingClaim` reconcile-on-every-sign-in via `lib/auth.ts`
→ `claimNodeForUser` (`social-signin-claim-binding`); `/app/email` composer + lifecycle catalog (PR #129);
lifecycle emails LIVE in prod (`EMAIL_LIFECYCLE_DRYRUN=0`).

### Drift logged

- **Member-landing topology incoherence** (candidate drift): `/dashboard` (tabbed) + `/me` (passport)
  overlap, and `/app` is grant-gated not member-home. To be characterized in TASK_01; route to the drift
  register at close if confirmed structural.

## Phase 2 re-scope (post-diagnosis; operator decided LARGE cert + `/app/me` consolidation)

### Dirstarter parity finding (the real end-state)

- Dirstarter changelog **"Unified dashboard" (2026-06-03):** merge `/admin/*` + `/dashboard/*` into ONE
  role-adaptive `/app` workspace; **legacy `/dashboard` + `/admin` 308-redirect to `/app/*`.**
- Dirstarter template `/app` routes: `bookmarks, tools, posts, users, categories, tags, ads, api-keys,
  reports` + root `page.tsx`. **No `/app/me` / `/app/account`** — so `/app/me` is a BBL-custom name, not a
  boilerplate convention.
- **BBL is half-migrated:** `app/app/profile/page.tsx` already imports ALL the `/dashboard` tab components
  (events/lineage/profile/saved/school/membership/techniques/tools) → the consolidation target exists. But
  the `/dashboard → /app` 308 redirects were **never added** (so `/dashboard` 404s), the member nav still
  points at the dead `/dashboard`, and `/me` (passport) was never folded in. **Two overlapping member homes
  (`/app/profile` + `/me`) + a 404 the nav links to** = the incoherence the operator sensed.

### Operator decisions (Phase 2)

- **Certificate = LARGE:** build the real `CertificateIssuance` subsystem (templates + PDF + member "my
  certificates" + RankAward→issuance bridge). Own epic; the tables are currently empty.
- **Member home = `/app/me`:** consolidate `/app/profile` (dashboard tabs) **and** `/me` (passport) into one
  canonical `/app/me`, completing the Dirstarter unified-dashboard migration. Operator-coined route name.
- **Tony fix:** apply the SMALL already-claimed guard (Gap 1) + dangling-request cleanup (Gap 2); his prod
  data is already clean (self-resolved), so this is latent-risk hardening, not a live repair.

### Re-scoped epics (staged — these are their own sessions + warrant an ADR)

- **E1 — `/app/me` canonical member home (MEDIUM):** merge `/app/profile` tabs + `/me` passport into one
  role-adaptive personal area; 308-redirect `/dashboard` + `/me` → `/app/me`; repoint nav; default member
  post-login to `/app/me`. Completes the unified-dashboard migration for BBL.
- **E2 — Certificate issuance subsystem (LARGE):** templates, PDF generation, member-facing "my
  certificates" gallery, and a RankAward→`CertificateIssuance` bridge so a black belt yields a real cert.
- **Brian's send is decoupled:** gate his claim email on **E1** (coherent member home rendering his profile
  + black-belt belt-history), **NOT E2.** Certificates ship as a follow-up he's notified about — otherwise
  his first email waits on the entire LARGE subsystem.

### Recommended THIS-session work (safe, no-regression, unblocks every member)

- ~~**TASK_04a:** Add `/dashboard → /app/profile` 308 redirect + repoint dead nav.~~ **FALSE ALARM —
  not needed.** Verified `next.config.ts:31-32` already wires `buildMigratedDashboardAppRedirects()`, and
  `config/app-redirects.ts:73` already maps `/dashboard → /app/profile` (308). Doug saw "no `page.tsx`" and
  inferred a 404 without checking `next.config`. The nav link works. The real member incoherence is the
  `/me` (claim-accept landing, `lineage/claim/accept/route.ts:48`) vs `/app/profile` (nav landing) duality
  → that's **E1**, not a 404. (Lesson: verify the runtime/redirect, not just file presence.)
- **TASK_04b (SMALL — Gap 1 LANDED):** already-claimed guard in `submitLineageClaimRequest` — confirmed real
  (the lineage path gated only on `member.isClaimable`, never `node.passport.userId`). Added the guard +
  `NODE_ALREADY_CLAIMED` error; **typecheck clean (exit 0).** Interim safety; subsumed by E0. Gap 2
  (dangling-claim cancel on finalize) folded into E0 finalize.

### E0 — Claim unification (operator pivot; design done via subagent)

Operator questioned having two claim systems → **decided: unify PERSON claims onto the Passport (one
system, two doors), org stays a sibling; unify BEFORE Brian's send.** Architect subagent produced the full
design + ADR 0036 draft → **`docs/petey-plan-0436-claim-unification.md`**. Core: new `PassportClaimRequest`
keyed on `passportId`; `submitLineageClaimRequest` + `submitProfileClaimRequest`(person) become thin
adapters; `finalizeLineageNodeClaim` generalizes to `finalizePassportClaim` (node-optional → un-stubs the
directory-person approval); email path mints the unified record; org `ProfileClaimRequest` untouched.

- **ADR 0036 status: PROPOSED — awaiting operator approval before build.** ADR number 0036 confirmed free.
- **Brian's real claim email is now gated on E0 P2+P3+P4** (his claim arrives via email→reconcile; it must
  write the unified record). The **holding note** (no claim link) can still go on operator preview-approval.

### Re-scoped epic set (staged)

- **E0 — claim unification (the new priority; gates Brian).** Spec + ADR 0036 draft ready.
- **E1 — `/app/profile` canonical member home:** fold `/me` passport into `/app/profile` (operator: skip
  `/app/me`, stay close to Dirstarter); redirect `/me` → `/app/profile`; repoint claim-accept landing.
- **E2 — certificate issuance subsystem (LARGE):** decoupled follow-up (not a Brian gate).

## Petey plan

### Goal

Diagnose the claim / dashboard / certificate gaps blocking Brian's happy path, report for an operator scope
decision, fix the agreed gaps, prove the full flow GREEN on prodsnap, then (gated) preview + real-send.

### Tasks

This is a phased lane. **Phase 1 (diagnosis) is the immediate executable; the session pauses for the operator
scope decision before Phase 3 fixes.**

#### SESSION_0436_TASK_01 — Diagnose member-landing topology + certificate surface (Doug)

- **Agent:** Doug
- **What:** Map where a freshly-claimed member actually lands and what they see; determine the canonical
  member home among `/dashboard` vs `/me` vs `/app`; check the Dirstarter member-dashboard baseline; find/
  characterize the member-facing certificate view (or its absence) and whether a black-belt RankAward
  renders as a "certificate."
- **Steps:** trace post-sign-in/claim redirect (`lib/auth.ts`, login callbackURL) → compare `/dashboard`,
  `/me`, `/app` gating + content overlap → check Dirstarter docs for the intended member dashboard → audit
  Certificate models (`CertificateTemplate/Issuance/Order`, legacy `Certification`) for a member view +
  whether any issuance exists for a BB → write findings + a canonical-home recommendation.
- **Done means:** a findings note (in this SESSION file) stating the canonical member landing, the cert-view
  state, and a recommended fix-set with cost estimates — enough for the operator to choose consolidate-now
  vs defer.
- **Depends on:** nothing

#### SESSION_0436_TASK_02 — Reproduce the tree-claim ⇄ invite-email reconcile bug (Tony Hua) (Doug)

- **Agent:** Doug
- **What:** Reproduce the observed Tony Hua misbehavior where the tree-claim path and the emailed
  `LineagePendingClaim` don't converge; identify the defect (double-claim / dead-end / wrong node / Google
  vs magic-link gap).
- **Steps:** review `claimNodeForUser` + `LineagePendingClaim` reconcile in `lib/auth.ts` + the tree-side
  claim CTA → inspect Tony Hua's prod/prodsnap claim state → reproduce on prodsnap with a throwaway account
  walking BOTH entry paths → capture the exact failure + root cause.
- **Done means:** a reproduced failure with root-cause writeup (or a proof the paths converge cleanly);
  feeds the Phase 3 fix.
- **Depends on:** nothing (parallel with TASK_01)

#### SESSION_0436_TASK_03 — Verify Brian's prod claim state (read-only, gated) (Cody)

- **Agent:** Cody
- **What:** Run `send-bbl-truelson-thankyou.ts --verify` against **prod** (read-only) to learn whether his
  `LineagePendingClaim` is already backfilled and whether any email has already gone to him.
- **Steps:** obtain prod `DATABASE_URL` (operator-provided, inline, gitignored — deleted after) → run
  `--verify` only → report his node, pending-claim, comp, and send-history state.
- **Done means:** known current prod state of Brian's claim → determines whether the eventual send is a
  first-send or a re-send.
- **Depends on:** explicit operator go for prod read

#### SESSION_0436_TASK_04 — (Phase 3, after operator decision) Fix the agreed gaps (Cody)

- **Agent:** Cody
- **What:** Implement the operator-approved fix-set from the Phase 1/2 findings (canonical member landing +
  Brian's coherent path; tree⇄email reconcile fix; member cert view if in scope).
- **Steps:** TBD by findings — scoped at the Phase 2 decision point.
- **Done means:** agreed fixes land, typecheck/oxlint/oxfmt clean, touched-area tests green.
- **Depends on:** TASK_01, TASK_02, operator scope decision

#### SESSION_0436_TASK_05 — (Phase 4) Full happy-path dry-run on prodsnap (Doug)

- **Agent:** Doug
- **What:** Walk Brian's entire journey on `ronindojo_prodsnap` with a throwaway account: claim from tree
  AND from the emailed link (both reconcile to his node), sign in, edit profile, see results on the public
  profile, land on the coherent dashboard, see rank + certificate, confirm the correct lifecycle emails
  fire (with the email seam stubbed/dry-run so no real send during rehearsal).
- **Done means:** screenshots of each step, zero console errors, both claim entry paths green, lifecycle
  emails confirmed firing correctly.
- **Depends on:** TASK_04

#### SESSION_0436_TASK_06 — (Phase 5, gated) Preview + real send (Cody)

- **Agent:** Cody
- **What:** Stage Brian's real claim in prod (`--backfill` + `--grant`), compose his email in the
  `/app/email` composer, send a PREVIEW to the operator's inbox; on explicit operator go, send the real
  email to `btruelson@gmail.com`.
- **Done means:** operator-approved preview, then a confirmed real send (or an explicit deferral to next
  session if the dry-run wasn't green).
- **Depends on:** TASK_05 GREEN + explicit operator go

### Parallelism

- TASK_01, TASK_02, TASK_03 run in parallel (disjoint: dashboard/cert diagnosis · claim-reconcile bug ·
  read-only prod verify). **Barrier:** operator scope decision after Phase 1.
- TASK_04 → TASK_05 → TASK_06 sequential.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0436_TASK_01 | Doug | diagnosis / verification (no writes) |
| SESSION_0436_TASK_02 | Doug | bug reproduction |
| SESSION_0436_TASK_03 | Cody | gated prod read (creds handling) |
| SESSION_0436_TASK_04 | Cody | code fixes (post-decision) |
| SESSION_0436_TASK_05 | Doug | browser dry-run verification |
| SESSION_0436_TASK_06 | Cody | gated prod write + send |

### Open decisions

- **Canonical member home** (`/dashboard` vs `/me` vs consolidate) — operator decides after Phase 1.
- **Consolidate-now vs defer** the member-dashboard surface refactor — operator decides after Phase 1.
- **Member certificate view scope** — confirm at Phase 2 whether to build it this session.
- Prod `DATABASE_URL` source for `--verify` (operator-provided; creds rotated).

### Risks

- Diagnosis may surface a real missing member-cert view or a dashboard consolidation that's too big for one
  session → the real send slips (operator already accepted this).
- `LineagePendingClaim` reconcile fix risks regressing the existing Google/magic-link claim binding
  (`social-signin-claim-binding`) — re-run that path's checks after any change.
- Real prod write (`--backfill`/`--grant`/send) to a live, frustrated VIP — must be green-gated + previewed.
- Lifecycle emails are LIVE in prod (`EMAIL_LIFECYCLE_DRYRUN=0`) — the rehearsal must stub/dry-run the email
  seam so no accidental real send fires during the dry-run (see `unit-tests-send-real-resend-emails`).

### Scope guard

- Phase 1 is diagnosis only — **no fixes** until the operator scope decision.
- Do NOT do a broad `/admin → /app` consolidation unless the operator chooses consolidate-now.
- Do NOT send any real email to Brian (or Tony) without a green dry-run + operator go.
- Helio-gracie `TREE_SEEDS` tail stays deferred (out of scope this session).

### Dirstarter implementation template

- **Docs read first:** Dirstarter member-dashboard pattern + Better Auth claim/redirect — to read at the
  start of TASK_01 (alignment URLs in `dirstarter-docs-inventory.md`).
- **Baseline pattern to extend:** the Dirstarter member dashboard + Better Auth sign-in callback; the
  existing `LineagePendingClaim` reconcile seam and `/app/email` composer.
- **Custom delta:** lineage-claim reconcile across tree + email entry; member-facing certificate rendering
  of a RankAward; BBL-branded onboarding email.
- **No-bypass proof:** reusing the purchased member-dashboard + auth + email scaffolding; not replacing it.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0436_TASK_01 | landed (findings) | Diagnose member-landing topology + certificate surface — see Phase 1 findings |
| SESSION_0436_TASK_02 | landed (findings) | Reproduce tree-claim ⇄ invite-email reconcile bug (Tony Hua) — see Phase 1 findings |
| SESSION_0436_TASK_03 | landed (findings) | Verified Brian's prod claim state (operator-provided URL, read-only) — see Phase 1 findings §D |

## Phase 1 findings (Doug ×2, read-only)

### A — Member-landing topology (the "broken" dashboard)

- **`/dashboard` is a 404.** `app/(web)/dashboard/` has NO `page.tsx`/`layout.tsx` — only orphaned tab
  components (only `profile-tab` is imported, by `app/app/profile/page.tsx`). **The member nav links to it:**
  `components/web/user-menu.tsx:97` ("Dashboard") and `components/web/nav/nav-sheet.tsx:130` both `href="/dashboard"`
  → **404 dead-end. There is NO nav link to `/me`.** This is the core member-experience bug.
- **`/me` is the real, working member home** — and is already the claim-accept landing target
  (`app/(web)/lineage/claim/accept/route.ts:55` → `/me`). It renders identity + affiliations + gallery +
  **belt-history timeline** (his black-belt promotions, via `LineageRankHistoryTab`).
- **`/app` is auth-only** (`requireUser()`, NOT grant-gated as assumed) — a plain member gets a bare
  "Welcome, your workspace areas appear in the sidebar." Not a member home; specific sub-areas
  (`/app/certificates`, lineage) are permission-gated.
- **Default post-login destination = `/` (BBL home)**, not any member surface — `use-auth-callback-url.ts`
  falls back to `/` for `/auth/*` origins. `lib/auth.ts` sets no member default.

### B — Certificate surface

- **No member-facing "my certificate" view exists.** `app/app/certificates/` is admin issuance management
  (`requirePermission`); `app/(web)/certificates/verify/[code]` is public QR verify only.
- **Certificate tables are EMPTY in prodsnap:** 0 `CertificateIssuance` / 0 `CertificateTemplate` /
  0 `CertificateOrder`; 1 legacy `Certification` (not Brian's). `CertificateIssuance` is **User-rooted**
  (not Passport/RankAward) and links to legacy `Certification`, not `RankAward`.
- Brian's RankAwards exist (**"Black Belt" + "Black Belt - 1st Degree"**) and render as belt-history rows,
  **not** as a certificate artifact. His node is **UNCLAIMED** (`Passport.userId` NULL).

### C — Tree-claim ⇄ invite-email reconcile (Tony Hua root cause)

- Local snapshot is **stale** (0 `LineagePendingClaim` rows; no Tony User row — his real state is prod-only).
  Root cause reasoned from code (unambiguous); Tony's email is `tonyhua08@gmail.com`.
- **Gap 1 (primary):** `submitLineageClaimRequest` (`claim-actions.ts:59-72`) has **no "already claimed"
  guard** — it doesn't check `node.passport.userId`, only same-claimant dedup. So a tree-claim can be filed
  against a node the email reconciler **already auto-claimed** → a stuck PENDING in the admin queue that
  **throws `NODE_ALREADY_APPROVED` on approval** (`claim-finalize.ts:104`). Asymmetry: email-after-tree
  converges cleanly (`claim-node-for-user.ts:117-126` upgrades the PENDING), tree-after-email dead-ends.
- **Gap 2:** when the email path auto-claims, stale PENDING requests from *other* claimants on the same node
  are never cancelled → dangle and dead-end at review.
- **Gap 3 (secondary):** `mintClaimMagicLink:91` creates the User at **raw WP-export casing**; Google returns
  canonical casing → possible duplicate/link fragility (the known `social-signin-claim-binding` fault line).
  The reconciler lowercases on match, so the binding survives — Gap 3 is secondary to Gap 1.
- **Fix cost: SMALL** — (1) already-claimed guard in `submitLineageClaimRequest`; (2) cancel other
  non-terminal `LineageClaimRequest`s on finalize; (3) optional lowercase-normalize in `mintClaimMagicLink`.
- **Prod confirm (optional):** query prod for `User WHERE email ILIKE 'tonyhua08%'` (casing/dupes),
  `LineagePendingClaim`/`LineageClaimRequest WHERE nodeId='uz6bv38prs7u35avccwuuowa'`.

### D — Prod confirm (read-only, operator-provided Neon URL; credential NOT persisted)

- **Tony Hua — data is clean / self-resolved.** One `User` (`tonyhua08@gmail.com`, lowercase, verified;
  created 2026-06-20) — **no casing duplicate** (Gap 3 ruled out for him). Node `tony-hua` Passport
  `userId` = his user → **claimed to himself**. His single `LineageClaimRequest` is **APPROVED**; **no
  dangling `LineagePendingClaim`.** So the observed misbehavior either self-resolved via the reconcile or
  was manually approved — Gap 1 remains a **latent** code risk, not a live corruption.
- **Brian Truelson — clean slate, first-send confirmed.** Node `brian-truelson` exists, Passport `userId`
  **NULL → unclaimed**. **No `User` account, no `LineagePendingClaim`, no claim request** for
  `btruelson@gmail.com`. His pending-claim was **never backfilled in prod** (SESSION_0420 checklist item
  never ran). The eventual onboarding is a genuine first-touch: `--backfill` + `--grant` + send all pending
  the green-gate.
- **Security:** operator pasted the prod Neon credential in chat — used inline for read-only queries only,
  not written to disk or committed. **Recommend rotating that Neon password** (now in the transcript).
| SESSION_0436_TASK_04 | pending | (Phase 3) Fix agreed gaps |
| SESSION_0436_TASK_05 | pending | (Phase 4) Full happy-path dry-run on prodsnap |
| SESSION_0436_TASK_06 | pending | (Phase 5, gated) Preview + real send |

## What landed

- **Full diagnosis of Brian's happy path** (3 read-only tasks): member-landing topology, the tree⇄email
  claim reconcile (Tony Hua), the certificate surface, and prod state of both Brian + Tony.
- **Corrected a Doug false alarm:** the `/dashboard` "404" does not exist — `next.config.ts:31-32` already
  308-redirects it to `/app/profile` (`config/app-redirects.ts:73`). The real member incoherence is the
  `/me` vs `/app/profile` duality (→ E1), not a dead nav. Verified before "fixing."
- **Interim Gap 1 guard landed** in `submitLineageClaimRequest` (already-claimed check on `node.passport.userId`
  + `NODE_ALREADY_CLAIMED`); `bun run typecheck` clean. Latent-risk hardening; subsumed by E0.
- **Prod confirms (read-only):** Tony Hua's claim is clean/self-resolved (node claimed to him, one APPROVED
  request, no dangling pending, no casing dupe); **Brian is a clean slate** (unclaimed node, no account, no
  pending claim — his pending-claim was never backfilled in prod → genuine first-touch).
- **Operator pivot → E0 claim unification.** Decided to collapse the two person-claim systems into one
  Passport-keyed claim (org sibling), unify BEFORE Brian's send. Architect subagent produced the design +
  **ADR 0036 (ratified)** + fan-out phase prompts → `docs/petey-plan-0436-claim-unification.md`.
- **SESSION_0437 staged as the E0 orchestration hub** (Next session block): bow-in fans out P0–P6 prompts to
  subagents/cloud, consolidates back. P2+P3+P4 gate Brian's send.
- **Brian's holding note drafted** (warm, no claim link) — pending operator copy edits, then preview + send.
- AdminTaskBoard assessed: `ContentTask` is content-bound (not a general eng tracker) — flagged optional
  generalization, not an E0 gate.

## Decisions resolved

- Session task is the operator-directed **Brian Truelson happy-path** lane, superseding 0435's helio/FI-009
  "Next session" block.
- Send is **green-gated**: diagnose → fix → prodsnap dry-run → operator-inbox preview → real send.
- Claim staged via the bespoke script; email sent via the `/app/email` composer.
- Certificates: a **member-facing view is in scope** (pending Phase 2 cost confirmation).
- Member dashboard: **diagnose first, then operator decides** consolidate-now vs defer.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/lineage/claim-actions.ts` | Interim Gap 1 guard: reject claim when `node.passport.userId != null` (+ `NODE_ALREADY_CLAIMED`) |
| `docs/architecture/decisions/0036-unified-passport-claim.md` | NEW — ADR 0036 (ratified): unified Passport-keyed person claim |
| `docs/petey-plan-0436-claim-unification.md` | NEW — E0 epic spec + fan-out phase prompts (P0–P6) |
| `docs/sprints/SESSION_0436.md` | This file |
| `docs/knowledge/wiki/index.md` | Session 0436 row added |
| `apps/web/emails/bbl-truelson-holding-note.tsx` | NEW — Brian holding-note email (no claim link) |
| `apps/web/scripts/send-bbl-truelson-holding.ts` | NEW — dry-run/preview/send script for the holding note |
| `docs/protocols/send-email-flow.md` | NEW — SEND_EMAIL_FLOW SOP (draft→preview→gated send) |
| prod `Passport.avatarUrl` (Brian) + R2 `bbl-media` | Cropped avatar uploaded + avatarUrl repointed (prod data, no repo change) |

## Verification

| Command / check | Result |
| --- | --- |
| `bun run typecheck` (interim Gap 1 guard) | clean (exit 0) — `next typegen && tsc --noEmit` |
| `next.config.ts` dashboard-redirect wiring | confirmed `buildMigratedDashboardAppRedirects()` wired (lines 31-32); `/dashboard → /app/profile` 308 already live (false-alarm 404 disproven) |
| Prod read-only confirm (Tony + Brian) | Tony: node claimed to self, 1 APPROVED request, no dangling pending, lowercase email (no dupe). Brian: node unclaimed, no user/pending/request (clean first-touch) |
| ADR 0036 number free | confirmed (highest existing = 0035) |
| `bun run wiki:lint` | see Full close evidence |
| Full unit suite | Not run — only code change is the defensive guard (typecheck clean); E0 build will add claim tests. Deferred to CI |

## Open decisions / blockers

- **ADR 0036 ratified; E0 build deferred to SESSION_0437** (operator: build next session via fan-out). Not blocked.
- **Brian's holding note** — pending operator copy edits (operator chose "tweak first"), then preview to
  `mrbscott@gmail.com`, then gated send to `btruelson@gmail.com`. BLOCKED ON USER (copy edits).
- **E1** (`/app/profile` member-home consolidation, fold in `/me`) + **E2** (certificate subsystem) — staged,
  not started.
- **Rotate prod Neon password** (pasted in chat for read-only verify).
- Interim Gap 1 guard deploys to prod on push (touches `apps/web`) — safe/defensive; operator confirms push.

## Next session

### Goal

**SESSION_0437 = E0 claim-unification orchestration hub.** Build the unified Passport-keyed person claim
(ADR 0036) by fanning out the phase prompts in `docs/petey-plan-0436-claim-unification.md` (§"Fan-out
prompts") to subagents / cloud agents, then consolidating their results back into SESSION_0437 as the single
canonical ledger. This is the local session that holds all goals + tasks; agents do the work; SESSION_0437
captures it.

- **Run order:** P0 (schema) → P1 (core+adapters) → P2 (finalize+review) → P3 (email path) → P4 (migrate) →
  P5 (retire). P2 depends on P0/P1; P3 depends on P2; P4 after P3. **P2+P3+P4 gate Brian's real claim email.**
- Number each phase as `SESSION_0437_TASK_01..06`; each agent must typecheck clean + keep named tests green +
  NOT push (operator pushes once at close).
- After E0 P2+P3+P4 land + verify: send Brian's full claim email (script `--backfill`/`--grant` + compose via
  `/app/email`, preview to operator inbox, gated real send). Then E1 (`/app/profile` member-home consolidation,
  fold in `/me`) and E2 (certificate subsystem) as follow-on lanes.

### First task

`SESSION_0437_TASK_01` — **P0 schema**: add the `PassportClaimRequest` model (+ `PassportClaimEvidence`) to
`apps/web/prisma/schema.prisma` per ADR 0036 §1, generate the additive migration, apply locally, typecheck.
Fan this out via the §P0 fan-out prompt. (Interim Gap 1 guard from SESSION_0436 is deleted in P1.)

### Parallel task (disjoint from E0 — run alongside, slot early)

`SESSION_0437_TASK_0A` — **Admin "set placeholder avatar" path** (operator-requested). Disjoint from the E0
claim work (media-authz + admin UI, not claim records), so it runs in parallel with the E0 fan-out — slot it
early since it's small + fixes a live cosmetic defect on placeholder profiles.

- **Problem:** `uploadAndPromotePassportAvatar` (`server/web/actions/passport-avatar.ts`) is self-service only
  (`where:{userId:user.id}`), and `applyWebMediaUpload` → `authorizeMediaTarget` enforces passport-OWNERSHIP.
  So no admin can set a placeholder (unclaimed) person's avatar in-app. Many imported member photos are
  full-body shots a centered square crop decapitates (Brian's was fixed by hand this session).
- **Build:** an `adminActionClient` action `setPassportAvatarAsAdmin({ passportId, file })` that uploads +
  promotes for ANY passport, gated by admin authz — extend `authorizeMediaTarget` to allow an admin actor
  WITHOUT weakening the ownership check for non-admins (security-sensitive — review carefully). Wire an admin
  surface that reuses the existing circle cropper (`components/web/uploader/cropper.tsx` +
  `use-photo-upload.ts`) so an admin crops + sets a placeholder's avatar. Likely host: the admin lineage
  node / person area.
- **Done means:** an admin can crop+set any placeholder person's avatar in-app; non-admin ownership boundary
  unchanged (add a test); browser-verified. Backfill consideration: a batch re-crop pass for already-imported
  full-body placeholder photos is a separate follow-up.

### Carryover / deferred

- Helio-gracie `TREE_SEEDS` membership (deferred since 0433/0434) — still open, unrelated to E0.
- Brian's **holding note** (warm, no claim link) — drafted SESSION_0436; operator chose "tweak copy first",
  so pending operator wording edits → preview to `mrbscott@gmail.com` → gated send to `btruelson@gmail.com`.
- Rotate the prod Neon password (pasted in chat SESSION_0436 for read-only verify).
- E0 tracking board: use the **Mammoth `AdminKanban`** (`packages/ui-kit/src/kanban/`, config-driven,
  content-agnostic) — NOT BBL's content-bound `AdminTaskBoard`. Small reusable task: implement a DB-backed
  `BoardStore` (port exists) + engineering `BoardConfig` for E0 P0–P6. See `petey-plan-0436`.
- Brian holding-note **operator-approved copy captured** in `petey-plan-0436`; **note SENT** (Resend
  `681a8d65…`); real claim invite = 2nd touch after E0.
- **Admin "set placeholder avatar" path** (staged build): admins currently can't set a placeholder person's
  avatar (`uploadAndPromotePassportAvatar` is self-only + media-authz enforces ownership). Build an
  admin-gated action + surface reusing the circle cropper (`components/web/uploader/cropper.tsx`); fixes the
  systemic full-body-photo decapitation. Security-sensitive — own focused, browser-verified task.
- Brian's avatar **fixed in prod this session** (face-crop uploaded + avatarUrl repointed).

## Review log

### SESSION_0436_REVIEW_01 — Brian happy-path diagnosis + E0 claim-unification design

- **Reviewed tasks:** SESSION_0436_TASK_01–04 (diagnosis + interim guard + E0 design).
- **Dirstarter docs check:** changelog "Unified dashboard" (2026-06-03) + template `/app` route inventory
  read — confirmed the unified-`/app` pattern and that `/app/me` is not a boilerplate convention; BBL is
  half-migrated (`/app/profile` holds the dashboard tabs, redirects already wired).
- **Verdict:** The highest-value acts were **not building** — diagnosis turned a "fix the broken dashboard +
  send Brian" brief into (a) disproving a false-alarm 404 before coding it, (b) surfacing that the two claim
  systems are the real defect, and (c) ratifying ADR 0036 + staging E0 for a clean fan-out build. The interim
  Gap 1 guard is a minimal defensive change (typecheck clean). Prod writes were read-only + credential not
  persisted.
- **Score:** 8/10 (deducted: a planning-heavy session with no shipped feature; the holding-note send is still
  open pending operator copy; full claim-test suite deferred to the E0 build).
- **Follow-up:** SESSION_0437 fans out E0 P0–P6; operator copy-edits the holding note; rotate Neon password.

## Hostile close review

- **Giddy:** pass — claims are backed by evidence (next.config redirect wiring quoted, prod read-only counts,
  typecheck exit 0, ADR number checked). Honest about the false-alarm correction and about what was NOT done
  (no feature shipped, holding note unsent, suite deferred). No prod write beyond read-only verify.
- **Doug:** pass — the only code change is a defensive guard (extra read + early throw), null-safe
  (`node?.passport?.userId`), no `"use server"` export shape change, no schema change, typecheck clean. ADR
  0036 design reuses the proven `finalizeLineageNodeClaim` side-effects; migration is additive + idempotent.
- **Desi:** n/a — no UI shipped this session (diagnosis + design only). Member-home consolidation (E1) carries
  the UX work; the `/me`-vs-`/app/profile` duality is logged for it.
- **Kaizen aggregate:** 8/10 — disciplined "diagnose + verify before build," operator-driven scope pivot to
  the root architectural fix (claim unification) rather than patching symptoms.

## ADR / ubiquitous-language check

- **ADR created:** [ADR 0036 — Unified Passport-keyed person claim](../architecture/decisions/0036-unified-passport-claim.md)
  (ratified). Touches the Prisma/Better-Auth baseline; design grounds in ADR 0023/0025/0032. (Dirstarter
  proof: claim is BBL-custom domain logic over the Better-Auth/Prisma baseline — no Dirstarter capability
  replaced; the unified-`/app` member-shell parity is logged under E1.)
- **Ubiquitous language:** new term **`PassportClaimRequest`** (the single Passport-keyed person-claim
  record) — to add to Ubiquitous Language when E0 P0 lands the model. No other new terms.

## Reflections

- **Verify the runtime, not the file tree.** A diagnosis subagent reported `/dashboard` as a 404 because the
  folder has no `page.tsx` — but `next.config` 308-redirects it. One `grep` of `next.config.ts` before
  coding saved a "fix" for a non-bug. Subagent findings are leads, not verdicts; confirm the load-bearing
  claim against the actual mechanism (redirect config, not directory listing).
- **A symptom question can expose an architecture decision.** "Make sure the two claim flows are aware of
  each other" looked like a guard to add. Asking *why there are two* turned it into ADR 0036 — one
  Passport-keyed claim that makes the awareness question moot by construction. Operator's "should we even
  have two?" was the highest-leverage line of the session.
- **Diagnose-then-decide beats fix-fast for a VIP.** Gating Brian's real send on a green path (now on E0)
  cost us the quick win but avoided emailing a frustrated loyal member a half-working claim — the exact
  failure mode that made him email in the first place.
- **The prod snapshot lies about freshness.** Tony/Brian's real claim state lived only in prod Neon (the
  local prodsnap had zero pending claims); reading `createdAt`/account rows in prod was what distinguished
  "self-resolved" from "stuck."

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0436 full frontmatter; ADR 0036 + petey-plan-0436 frontmatter set (`last_agent: claude-session-0436`) |
| Backlinks/index sweep | ADR 0036 ↔ petey-plan-0436 ↔ SESSION_0436 `pairs_with`; wiki/index 0436 row added; MEMORY.md pointer updated |
| Wiki lint | `bun run wiki:lint` → result reported in bow-out chat |
| Kaizen reflection | Reflections section present (4 lessons) |
| Hostile close review | SESSION_0436_REVIEW_01; Giddy/Doug pass, Desi n/a; 8/10 |
| Review & Recommend | Next session goal written (SESSION_0437 = E0 orchestration hub) |
| Memory sweep | Added [claim-unification-adr-0036]; updated [profile-claim-vs-lineage-claim] (superseded by E0) — see close report |
| Next session unblock check | SESSION_0437 first task (P0 schema) is doable from the fan-out prompt; holding note BLOCKED ON USER (copy edits) |
| Git hygiene | branch `main`; worktrees: pr115/pr117 + fallow caches left (not this session's); single push — hash reported at bow-out / see git log |
| Graphify update | node/edge/community count reported in bow-out chat (run before close commit) |

## Post-close addendum (same-session continuation)

After the close commit (`1546b46b`), the operator continued with VIP follow-through for Brian:

- **Holding note SENT** — drafted `emails/bbl-truelson-holding-note.tsx` (no claim link) +
  `scripts/send-bbl-truelson-holding.ts` (dry-run/preview/send). Previewed to `mrbscott@gmail.com`
  (Resend `4baf8764…`), operator approved, **sent to `btruelson@gmail.com`** (Resend `681a8d65…`).
  Copy = operator's, softened "by tonight" → "coming very soon" (E0-first), dropped an odd duplicate
  lineage clause. Real **claim invite is the second touch, after E0**.
- **Avatar de-decapitated** — his source `Black-Belt1-3.webp` is a 248×512 full-body gi shot; the
  centered square avatar crop chopped his head. Cropped a face-square (crop B, 512×512 webp via `sharp`),
  uploaded to R2 `bbl-media` at `media/bbl/profiles/brian-truelson-avatar.webp` (operator-provided R2
  creds, inline, not persisted), verified public 200, and **updated prod `Passport.avatarUrl`** (UPDATE 1).
  Source image untouched.
- **SEND_EMAIL_FLOW SOP** — `docs/protocols/send-email-flow.md` captures the draft→preview→gated-send
  flow + the reusable seams (`BblEmailWrapper`, `sendEmail`, the 3-flag script template).
- **Systemic finding:** many imported placeholder avatars are full-body shots that a centered square crop
  decapitates. `uploadAndPromotePassportAvatar` is **self-service only** (`where:{userId:user.id}`) +
  `applyWebMediaUpload` enforces passport-ownership — so admins can't fix a placeholder's avatar in-app.
  → **Staged task (next session):** admin "set placeholder avatar" path (extend the media-authz boundary
  for admins + an admin surface reusing the existing circle cropper `components/web/uploader/cropper.tsx`).
  Security-sensitive (don't weaken the ownership boundary) — warrants its own focused, browser-verified build.

⚠️ **Rotate both pasted credentials** (prod Neon password + R2 access/secret keys) — both are in this
session's chat transcript.
