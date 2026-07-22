---
title: "Research-Review — Security-Header & CSP posture across RDD apps"
slug: research-review-security-headers-posture
type: research-review
status: active
created: 2026-07-22
created_at: 2026-07-22T18:04Z
updated: 2026-07-22
author: "Claude (Opus 4.8) — Petey lane"
last_agent: claude-session-0617
session: SESSION_0617
operator: Brian
decision: "operator-accepted 2026-07-22 — 1B (durable sink first) · store CSP warnings · 2B (lift baseline into kernel) · keep as research-review (not wayfinder)"
pairs_with:
  - docs/security/ronin-security-risk-register.md
  - docs/sprints/SESSION_0617.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Research-Review — Security-Header & CSP posture across the RDD apps

> **What this document is.** A read-only assessment (no code was changed) that grounds one
> architectural question in the *actual* state of the repo, prices the options, and lands a
> recommendation for the operator to accept or reject. It is a decision brief, not a build.
> It was written because RISK #2 (the "flip CSP to enforcing" task) turned out to sit on top of
> a bigger, unasked question: **what is our security posture across *all* the RDD apps, not just BBL?**

---

## TL;DR (read this first)

1. **Only one app has any security headers at all.** `apps/web` (which serves Black Belt Legacy)
   ships a full set of protective HTTP headers plus a "watch-but-don't-block" Content-Security-Policy.
   The other three apps in the repo — `apps/baseline`, `apps/rdd`, `clients/mammoth-build-crm` —
   ship **nothing**: no CSP, no clickjacking protection, no HTTPS-pinning header. They aren't live
   yet, so this is a **launch-gate**, not a live hole — but every one of them will go live naked
   unless we fix the pattern.

2. **The immediate "flip" (RISK #2) is low-risk and only touches BBL.** Turning the CSP from
   "watch" to "block" is a single environment-variable change. Because the other apps aren't
   deployed and the Baseline domain just redirects to BBL, the blast radius is **one live site**,
   not two. It was already tested clean in July.

3. **There is one real snag before we flip anything: we can't *prove* it's safe.** The system that
   records CSP warnings from real users only writes them to disposable server logs — nothing is
   stored. So we can watch for problems live, but we can't look back and say "zero issues for a
   week." That gap applies to every app, not just this flip.

4. **The strategic fork is "copy vs. kernel."** As Baseline, RDD, and Mammoth become their own
   live sites, do we **copy** the security setup into each one (today's model), or **lift it into
   the shared kernel** (`packages/ui-kit`) so every app inherits it automatically and correctly?

**Recommendation in one line:** don't flip blind and don't copy-paste four times — **make the CSP
report sink durable, flip BBL behind that evidence, and lift the header baseline into the kernel so
new brands inherit it.** Details and the exact decisions you need to make are at the bottom.

---

## Decisions — operator-accepted (Brian, 2026-07-22, SESSION_0617)

All four open questions were resolved by the operator; this section is the record (the recommendations
below became decisions):

1. **Observability first (Fork 1 → 1B).** Make the CSP report sink **durable** (store the violations)
   before flipping BBL. Accepted: *"yes store CSP warning."*
2. **Copy vs. kernel (Fork 2 → 2B).** **Lift the security-header baseline into the shared kernel**
   (`packages/ui-kit`) so Baseline / RDD / Mammoth inherit it. Accepted: *"lift into kernel for question 2."*
3. **Sequence.** Durable sink → observe → flip BBL's `CSP_ENFORCE` behind evidence → kernel-lift as
   launch-prep for the other apps. (Per recommendation.)
4. **Right-sized tool.** Keep this as a **research-review**, not a `/wayfinder` epic. (Per recommendation.)

**Also queued (not part of this lane):** a repo-wide *branded doc-rendering system* — render frontmatter-
carrying docs (research-reviews, SOPs, rituals, workflows, data-wiring) as consistently branded HTML
artifacts with a metadata header (created / author / session / status) derived from the YAML. Filed to
the goals ledger as **G-030**.

---

## Plain-English primer (skip if this is old hat)

- **HTTP headers** are little instructions a website sends the browser alongside every page. Some
  of them are *security* instructions: "never let another site put me in a frame" (anti-clickjacking),
  "always use HTTPS" (HSTS), "don't guess file types" (nosniff).
- **CSP = Content-Security-Policy.** The strongest of these headers. It's an allow-list that tells
  the browser *exactly* which scripts, styles, images, and connections are allowed to run on the
  page. If a hacker injects a `<script>` from evil.com, a good CSP means the browser refuses to run
  it. It's the single best defense against a whole class of attacks (cross-site scripting / XSS).
- **The catch with CSP:** it's easy to write one that accidentally blocks something *legitimate*
  (your own analytics, a YouTube embed, an animation library). If you get it wrong in "block" mode,
  real features silently break for real users. So the standard playbook is **two phases**:
  1. **Report-Only ("watch") mode** — the browser *reports* what the policy *would* have blocked,
     but blocks nothing. You collect those reports, confirm they're all noise (not real features),
     and only then…
  2. **Enforcing ("block") mode** — flip the switch; now the policy actually blocks.
- **RISK #2 / "the flip"** is exactly step 2 above, for BBL. Everything is already built and running
  in "watch" mode. The only thing left is to decide it's safe and turn on "block."

---

## The question this resolves

> Before we flip BBL's CSP to enforcing, and as we prepare Baseline / RDD / Mammoth for launch:
> **what security-header posture do we want across all RDD apps, and how should it be structured so
> it's applied consistently instead of one-app-at-a-time?**

---

## Grounded current state (what's actually true in the repo today)

### The apps

| App / folder | What it is | Live in production? | Security headers | CSP |
|---|---|---|---|---|
| **`apps/web`** | Black Belt Legacy flagship (also answers the Baseline domain) | ✅ **Yes** — `blackbeltlegacy.com`; `baselinemartialarts.com` redirects here | ✅ Full set, enforced | ⚠️ **Report-Only (watch)** |
| **`apps/baseline`** | The White-Labeled Dojo product | ❌ Not deployed | ❌ None | ❌ None |
| **`apps/rdd`** | RDD umbrella site (`ronindojodesign.com`, goal G-027) | ❌ Not deployed | ❌ None | ❌ None |
| **`clients/mammoth-build-crm`** | Mammoth CRM (goal G-021) | ❌ Not deployed | ❌ None | ❌ None |

*Verification:* one Vercel project exists (`ronin-dojo-baseline`); the other three apps aren't linked
to any Vercel project. The security-header code (`apps/web/config/security-headers.ts`) is imported by
**`apps/web` only** — confirmed by a repo-wide search. The other three apps have no middleware and no
header configuration of any kind.

### What BBL actually ships (the good citizen)

- **Enforced hardening headers** (live now, no risk): anti-clickjacking (`X-Frame-Options: DENY`),
  HTTPS-pinning (`HSTS`, 2 years), no-MIME-sniff, referrer policy, a locked-down permissions policy,
  and cross-origin isolation.
- **A Report-Only ("watch") CSP** on essentially every page (everything except static files and the
  auth API). Confirmed live: `blackbeltlegacy.com` returns a `content-security-policy-report-only`
  header today.
- **A per-request nonce system** so inline scripts are individually signed and `'unsafe-inline'`
  could be dropped from scripts. (Styles deliberately keep `'unsafe-inline'` — a nonce can't cover
  the inline `style={{…}}` attributes used in 46 files + the animation library; blocking those would
  break animations for near-zero security gain.)
- **A CSP report sink** at `/api/csp-report` — the endpoint browsers send violation reports to.

### The design intent that never happened (the drift)

The header code was **deliberately written to be app-agnostic** — the comments and ADR 0034 say each
new product app is supposed to call the same builder from its own config, so "the posture lives
per-app." That's a reasonable plan. **But it was only ever wired into `apps/web`.** Nobody replicated
it into `apps/baseline`, `apps/rdd`, or `mammoth`. This is the classic *"built but not pointed-to"*
failure: the capability exists, the instruction to reuse it exists, but the reuse never happened, and
nothing enforces it. Left alone, each new brand launches with zero security headers.

---

## Fork 1 — The immediate decision: flip BBL's CSP to enforcing (RISK #2)

### What "flip" means, concretely

Set one environment variable in Vercel — `CSP_ENFORCE=1` — and redeploy. That single flag promotes
BBL's existing, already-live CSP from the `-Report-Only` header name to the enforcing one. **No code
changes.** The policy string is byte-for-byte identical in both modes.

### Blast radius (smaller than it first looks)

- Only **`apps/web`** is live, so only **BBL** is affected.
- `baselinemartialarts.com` 307-redirects to BBL, so it doesn't independently serve app pages — the
  redirect isn't affected.
- The other three apps have no CSP, so they can't be affected.
- Verified clean in **SESSION_0536**: 21 unit tests, a browser console audit with **0 violations**
  (including a live YouTube embed), Report-Only confirmed on every surface, smoke tests 3/3.

### The one genuine risk

If the July audit missed a page — or a page added *since* July introduces a new script/style/embed —
"block" mode would silently break it for real users. The mitigation is *observation*: watch the
violation reports from real production traffic before flipping. Which brings us to the snag…

### The snag — we can't prove "clean"

The report sink is **log-only**. It writes each violation to a `console.warn` line that lands in
Vercel's runtime logs and then ages out. Nothing is stored in a database. So:

- We **cannot** query "how many violations in the last 7 days, and from which pages?" after the fact.
- We can only **live-watch** the logs for a window, which is weaker evidence.

This is a real gap and it's the thing standing between "the code is ready" and "we can flip with
confidence." It also applies to *every* future app's flip, not just this one — so it's worth fixing
once, properly.

### Options for Fork 1

| Option | What we do | Pro | Con |
|---|---|---|---|
| **1A — Flip on the July evidence** | Trust the 0536 audit, flip now, watch live, roll back fast if needed | Fastest; closes RISK #2 today | No fresh multi-day proof; a page added since July could break |
| **1B — Make the sink durable first, observe, then flip** *(recommended)* | Add lightweight storage to the report sink (a DB table or a log drain), collect a few days of real traffic, confirm clean, then flip | Real evidence; reusable for every future app | ~half a day of work before the flip; small schema/infra add |
| **1C — Defer indefinitely** | Leave it in watch mode | Zero risk | RISK #2 stays open forever; watch-mode blocks nothing, so we get the reporting but none of the protection |

---

## Fork 2 — The strategic decision: how should the posture live across RDD? ("copy vs. kernel")

Right now the header baseline is a ~190-line file in `apps/web` plus a ~90-line nonce routine in its
middleware. As Baseline, RDD, and Mammoth become their own live sites, each needs the same protection.
Two ways to get there:

| Option | What we do | Pro | Con |
|---|---|---|---|
| **2A — Copy per app** (today's stated model, ADR 0034) | Each app gets its own copy of the header file + middleware | Simple; each app can diverge if it truly needs to; matches the "posture lives per-app" wording | Four copies drift over time; a fix to one doesn't reach the others; **easy to simply forget** (which is exactly what happened — 3 of 4 apps have nothing) |
| **2B — Lift into the kernel** (`packages/ui-kit`) *(recommended)* | Move the header builder + nonce helper into the shared kernel; every app imports and calls it in ~3 lines | One source of truth; a hardening fix reaches all brands at once; a new brand is secure by default | The kernel today only exports UI components/CSS — this adds a new "config helpers" category to it; needs a small, clean export surface |
| **2C — Hybrid** | Kernel owns the *baseline*; each app supplies only its own allow-list additions (e.g. Mammoth's own analytics domain) | Best of both — shared floor, per-brand extension | Slightly more design work to define the extension seam |

The reason 2A already failed once is the strongest argument against it: "remember to copy the security
config into every new app" is a human checklist, and human checklists silently rot. Putting it in the
kernel makes *secure* the default and *insecure* the deviation.

---

## Is this worth a formal research-review at all? (honesty check)

Yes. The two forks above are cheap to get wrong and expensive to unwind (a broken CSP breaks a live
paying site; a per-app copy model quietly ships naked apps). But it is **not** a giant multi-session
epic — it's one or two decisions plus a modest build. So this document (a single research-review), not
a full `/wayfinder` map, is the right-sized tool. If, once you read it, you feel it fractures into many
independent per-brand decisions across the launch timeline, *that's* the signal to promote it into a
wayfinder map — and this doc becomes that map's opening evidence.

---

## Recommendation

1. **Fork 1 → Option 1B.** Add durable storage to the CSP report sink first (a small table or a Vercel
   log drain), observe real production traffic for a few days, confirm the violations are all noise,
   then flip `CSP_ENFORCE=1` for BBL behind that evidence. Never enforce blind on a live paying site.
2. **Fork 2 → Option 2B (or 2C).** Lift the header baseline into `packages/ui-kit` so Baseline, RDD,
   and Mammoth inherit it in a few lines and can't launch naked. Do this *before* those apps go live,
   not after.
3. **Sequence:** the observability fix (1B) is the shared prerequisite — it makes *every* app's
   eventual flip provable — so do it first, use it to close BBL's RISK #2, then generalize the
   baseline into the kernel as the launch-prep for the other brands.

### Canonical rule (so this is never re-litigated)

> **Every RDD app that serves HTML to the public wires the shared security-header baseline, and ships
> its CSP in Report-Only until its own violation stream is observed clean, then enforcing. The baseline
> lives in the kernel; an app may *extend* the allow-list, never *skip* the baseline.**

---

## Open questions for Brian (this is what I need from you)

1. **Observability before flipping:** do you agree we should make the report sink durable (store the
   violations) *before* flipping BBL — even though it delays closing RISK #2 by ~half a day — so we
   have real proof instead of a live-glance? (Fork 1: 1B vs 1A.)
2. **Copy vs. kernel:** do you want the security baseline lifted into the shared kernel so new brands
   inherit it automatically (2B/2C), or do you specifically want each app to own its own copy (2A)?
3. **Scope of this session:** should SESSION_0617 stay narrow (just decide + prep the BBL flip), or do
   you want to widen it to include the kernel-lift now, since the other apps are pre-launch?
4. **Wayfinder or not:** having read the above — does this feel like "one or two decisions + a small
   build" (keep it as this research-review), or does it feel big and foggy enough to chart as a
   multi-session `/wayfinder` map?
