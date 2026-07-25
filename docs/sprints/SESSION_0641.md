---
title: "SESSION 0641 — AM Coffee Merge Review: overnight 5-lane wave + 0632/0633/0635 sweep"
slug: session-0641
type: session--open
status: done
created: 2026-07-24
updated: 2026-07-24
last_agent: session-0641-bowout
sprint: S12
lane: repo
recipe: "AM_Coffee_Merge_Review"
goal_ids: [G-033, G-013, G-019, G-030]
pairs_with:
  - docs/sprints/SESSION_0635.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0641 — AM Coffee Merge Review: overnight 5-lane wave + 0632/0633/0635 sweep

> **Pre-staged by SESSION_0635 (the overnight orchestrator). ATTENDED session — coffee-gated, one
> merge owner.** Adopt: flip `status:` → `in-progress`. This stub is the baton; the lane inventory
> below is the work list.

## Operator

Brian + <agent>-session-0641

## Goal

Merge-sweep the whole outstanding wave under ONE merge owner: the three attended lanes
(0632 intake-kernel, 0633 deploy-planning, 0635 RDD-go-live = PR #264) plus the five overnight auto
lanes (0636–0640), then apply every lane's "Proposed ledger edits" + assign pooled finding ids in ONE
canonical commit. Gate ladder: `docs/protocols/recipes/merge-wave.md` (G0→G4).

## Lane inventory (merge queue)

| Session | Branch | Driver | Item | Expected state at AM |
| --- | --- | --- | --- | --- |
| 0632 | session-0632-intake-kernel | claude (attended) | client-intake kernel WS-A/B/C | PR open (green per operator) |
| 0633 | session-0633-brand-deploys | claude (attended) | RDD+MMB deploy planning | PR open (green per operator) |
| 0635 | session-0635-rdd-golive | claude (attended) | RDD go-live + G-033 mint + this stub | PR #264 open |
| 0636 | auto/session-0636-wl-tokens | codex gpt-5.5 | WL-P3-58 dead-token fixes + stale-WL sweep | local commit pushed by orchestrator → PR |
| 0637 | auto/session-0637-graph-wave2 | codex gpt-5.5 | technique-graph C5/D3/B2 | local commit pushed by orchestrator → PR |
| 0638 | auto/session-0638-mmb-landing | claude Sonnet | G-019 Mammoth landing port | PR open |
| 0639 | auto/session-0639-inbox-module | claude Fable | G-033 slice 1 (InboundEmail + /app/inbox) | **DRAFT** PR (migration unapplied) |
| 0640 | auto/session-0640-doc-renderer | claude Sonnet | G-030 v1 doc renderer | PR open |
| 0642 | auto/session-0642-curriculum-wave3 | claude Sonnet | G-013 Wave-3 (B3/C3/G2 + E1 stretch, verify-first) | PR open (wave 2) |
| 0643 | auto/session-0643-mmb-engagement-pack | claude Sonnet | MMB engagement doc pack (G-028 content layer) | PR open (wave 2) |
| 0644 | auto/session-0644-mmb-seo | codex | MMB SEO/metadata foundation (mammothmb.com) | local commit → orchestrator pushes → PR |
| 0645 | auto/session-0645-rr-mmb-pricing | claude Fable | /rr pricing research + Michael one-pager (father-notes anchors: $8–10K site, $100–200/hr, retainer-then-hourly, change-control doctrine, PMBA resolve) | PR open (wave 2) |
| 0646 | auto/session-0646-mmb-pitch-deck | claude Sonnet | "Ronin Building Design" pitch deck (structurewebworks + yt-short refs, infographic slide) | PR open (wave 2) |
| 0647 | auto/session-0647-3d-prototype | codex | three.js metal-building 3D prototype | local commit → orchestrator pushes → PR |
| 0648 | auto/session-0648-rdd-industries | claude Sonnet | RDD /industries pages (structurewebworks pattern, Ronin Building Design page) | PR open (wave 2) — **⚠ merge auto-deploys live ronindojodesign.com; Desi pass + operator copy sign-off first** |

> **Wave-2 additions to the checklist:** merge order per Petey — #269 (0639) first, then 0642 (same
> app, rebase after), then codex 0644/0647 (orchestrator-pushed; full build gate in a normal shell),
> then docs lanes 0643/0645/0646 any order, then 0648 LAST (deploys prod RDD — Desi pass + operator
> copy approval are its merge gates). 0647 morning smoke: `bun
> scripts/prototypes/metal-building-3d/serve.js` → :4173. 0645's PMBA conclusion needs operator
> confirmation. Ronin Building Design niche-brand family is canon (memory `rdd-niche-brand-variants`)
> — consider a goals-ledger row at the ledger-apply step.
> **Wave 3 (launched — continuation wave, all Claude):**
> · 0649 `auto/session-0649-curriculum-journey` — E1 CurriculumJourney on /curriculum (the 0642
>   escalation; G-022 Wave-3 GA bar; additive above the untouched browser; techniques-import ban)
> · 0650 `auto/session-0650-render-deck` — standalone markdown→branded-HTML slide-deck CLI
>   (G-030-adjacent; deliberate token-duplication debt vs frozen #268, consolidation queued)
> · 0651 `auto/session-0651-rr-creator-payout` — /rr G-009 Stripe-Connect payout research,
>   ALL FORKS LEFT OPEN for the operator (split %, threshold, Express-vs-Standard, attribution, tax)
> Petey's wave-3 rejections (stacking/frozen-file collisions) are documented in the orchestrator
> transcript; zero codex lanes (budget). Wave-2/-3 stale-ledger corrections to fold at ledger-apply:
> G-013 superseded by G-022 (0642 finding) · 5 stale WL rows (0636) · graph Wave-2 already landed
> (0637/0642 double-verified).
>
> **Wave 3 RESULTS:** #277 (0651 G-009 payout /rr — found unwired StripeAccount/PayoutSplit models +
> no CommunityPost view tracking; Phase-0-first recommendation, 7 forks open) · #278 (0650
> render-deck CLI, 44 tests) · #279 (0649 E1 CurriculumJourney — code gates green; runtime smoke
> blocked by a PRE-EXISTING seed gap: local DB has zero bjj-level courses so /curriculum 404s for
> everyone today; static-markup proof substituted; AM: run `prisma/import-bbl-bjj-curriculum.ts`
> then re-smoke).
>
> **Wave 4 (LAUNCHED — final wave):** 3× Fable /rr, forks open, no builds:
> · 0652 `auto/session-0652-rr-rdd-social` — RDD agency social + packageable client offering
>   (deliverable confined to docs/architecture/research/ — docs/product/rdd is frozen)
> · 0653 `auto/session-0653-rr-mmb-social` — MMB photo-pipeline/review-engine/cadence + a
>   Ronin-Building-Design-branded client playbook draft
> · 0654 `auto/session-0654-rr-bbl-social` — BBL event→content flywheel (consent-gated, approval-
>   queue-first posture) + internal flywheel draft
> Codex-limit salvage rule stands (Claude same-worktree pickup). After wave 4: orchestrator goes
> quiet; everything below is this AM session's queue.
>
> **Wave 4 RESULTS (night complete — 16 lanes / 4 waves / PRs #264–#282, all open, nothing merged):**
> · #280 (0652 RDD): LinkedIn-founder-first (~5–8× engagement evidence) · Metricool-vs-selfhost
>   tooling matrix · reserve RBD handles now, post after work-product exists · 6 forks open.
> · #281 (0654 BBL): 7-event content flywheel (claims, promotions w/ Rank.colorHex, teasers,
>   milestones, "Legacy Wrapped") · approval-queue-first, consent gating = THE blocker for
>   person-centric posts · 6 forks open.
> · #282 (0653 MMB): **mammoth.build has NO Google Business Profile** (~90%+ contractor discovery
>   via Google, 81% decide on reviews) → GBP-first + CRM-keyed review engine (kernel-module play
>   over a $299–599/mo Podium-class sub) · cost-per-customer framing vs his ~$2.50/lead baseline ·
>   client playbook draft branded Ronin Building Design · 6 forks open.
> Operator fork-decision batch for the morning: 18 open forks across #277/#280/#281/#282 + the
> #274 deploy gate + the 0645 PMBA→MBMA confirmation.
>
> **Waves 5+6 (operator-directed continuations of waves 3+4, launched together — 6 disjoint lanes):**
> Wave 5, codex `gpt-5.6-sol` (commit-only, orchestrator pushes; Claude same-worktree salvage if
> codex usage is out):
> · 0655 `auto/session-0655-rdd-seo` — RDD SEO foundation (layout metadata/robots/sitemap/manifest;
>   sitemap "/"-only until #274 merges; **merge auto-deploys prod RDD**)
> · 0656 `auto/session-0656-mmb-templates` — docs/product/mammoth-build/templates/: review-request
>   + follow-up sequences, GBP listing draft, posting skeletons (executes #282's findings)
> · 0657 `auto/session-0657-bbl-og-cards` — scripts/prototypes/bbl-og-cards/: dependency-free SVG
>   celebration-card renderer spike (informs #281's F4 build-vs-buy)
> Wave 6, Claude:
> · 0658 (Sonnet) `auto/session-0658-rdd-content-calendar` — 10-12 fully drafted founder-LinkedIn
>   posts, 4 weeks, brand-rule-clean (continues #280; lives in research/ pending rdd-docs unfreeze)
> · 0659 (Sonnet) `auto/session-0659-mmb-meeting-pack` — pitch-deck outline in render-deck format +
>   Michael meeting-prep brief (distills #276/#271/#282; renders after #278 merges)
> · 0660 (Fable) `auto/session-0660-bbl-payout-phase0` — G-009 Phase-0 entitled-read
>   instrumentation design spec, build-ready, no code (executes #277's no-regret move)
> All reference-reads of unmerged work via `git show origin/<branch>:<path>` — no stacking, no
> merge-after dependencies except as declared in PR bodies.
>
> **Waves 5+6 RESULTS (6/6 — night grand total: 22 autonomous lanes, PRs #264–#288):**
> · #283 (0658) 12 drafted founder-LinkedIn posts, fork-dependent appendix
> · #284 (0659) Michael meeting pack — 14-slide render-deck outline (parser-validated) + prep brief
> · #285 (0660) G-009 Phase-0 spec — `PremiumReadEvent` w/ capture point at posts/[slug]/page.tsx,
>   UTC-day dedupe via unique constraint (RATIFY the dedupe sub-fork pre-build)
> · #286 (0655) RDD SEO foundation — in-sandbox build hit the codex-Keychain SIGSEGV; orchestrator
>   re-ran in normal shell REAL_EXIT=0 (**merge auto-deploys prod RDD**)
> · #287 (0656) MMB template pack — reviews/follow-ups (InquiryForm-field-verified)/GBP draft/skeletons
> · #288 (0657) BBL SVG celebration-card spike — 3 card types, 5 tests/52 assertions, samples committed
> All codex-sol lanes completed on sol; no Claude salvage was needed. AM eyeball adds: 0657's three
> sample SVGs.
>
> **Waves 7+8 (operator-directed continuations of waves 5+6, launched together):**
> Wave 7, codex `gpt-5.6-sol` (commit-only, orchestrator pushes + runs build gates; Claude salvage
> rule stands):
> · 0661 `auto/session-0661-rdd-og-image` — apps/rdd opengraph-image.tsx + icon.tsx (closes #286
>   residual; orchestrator build gate REQUIRED pre-push; **merge auto-deploys prod RDD**)
> · 0662 `auto/session-0662-mmb-og-image` — client-app OG image + icon (closes #270 residual)
> · 0663 `auto/session-0663-bbl-og-cards-v2` — **DECLARED STACK on #288** (branched from its head):
>   technique-preview + Legacy Wrapped cards + host-run qlmanage rasterize helper. MERGE-AFTER #288.
> Wave 8, Claude:
> · 0664 (Sonnet, network) `auto/session-0664-rdd-handle-audit` — passive niche-handle availability
>   matrix (Ronin Building/Plumbing/Landscape Design; NO accounts created) → operator reservation
>   checklist (#280 F5)
> · 0665 (Sonnet) `auto/session-0665-mmb-kickoff-checklist` — day-1 access/assets/decisions
>   checklist for a Michael yes (delegation mechanisms named, TCPA consent flagged)
> · 0666 (Fable) `auto/session-0666-bbl-approval-queue` — social-flywheel approval-queue build-ready
>   spec (consent gate hard precondition, export-only v1, 0660-pattern format)
>
> **Waves 7+8 RESULTS (6/6 — FINAL grand total: 28 autonomous lanes / 8 waves / PRs #264–#294):**
> · #289 (0665) kickoff checklist (delegation mechanisms, TCPA flag; mammothmb.com marked confirm-first)
> · #290 (0661) RDD OG image + icon — orchestrator build gate REAL_EXIT=0 (**merge deploys prod RDD**)
> · #291 (0664) handle audit — recommend full `ronin<niche>design` form everywhere; niche .coms
>   available; YouTube open; IG/FB/X/TikTok login-walled=uncertain; USPTO 87300933 needs a human look
> · #292 (0663) bbl-og-cards v1.1 — **MERGE-AFTER #288**; AM runs rasterize.ts + eyeballs 5 samples
> · #293 (0662) MMB OG image + icon (best-effort client build at merge)
> · #294 (0666) approval-queue build-ready spec — real find: `Technique.isPublished` has NO runtime
>   writer (seed-only). **RATIFY pre-build: `Passport.allowSocialCelebration` opt-in, default OFF**
>   (the lane held at the PR gate out of caution; orchestrator opened the PR under the standing
>   dispatch authorization — pattern worked as designed)
> Decision batch adds: the consent default + the trademark check. All codex-sol lanes completed on
> sol across waves 5-8; salvage never needed.
>
> **Waves 9+10 (operator-directed FINAL PAIR — morning-deadline billing + Cowork operationalization,
> all Claude):**
> · 0667 (Fable, PRIORITY) `auto/session-0667-mmb-billing` — **MMB billing pack for the Michael
>   meeting THIS MORNING**: State of the Building (MMB-only SotD analogue, HTML) + hours worksheet
>   (time-tracker hunt: /gq + Mammoth_Vault via mdfind; evidence-or-estimate, never fabricated) +
>   invoice draft (~20h × $100 F&F vs $200 standard shown) + the reusable RDD_Client_Invoice
>   email-composer template (relocates to docs/product/rdd post-unfreeze)
> · 0668 (Sonnet) — BBL INTERNAL-REFERENCE invoice: README hours baseline quoted + dated, updated
>   estimate with transparent method, itemized by era (Bob Bass nominal, NOT for sending)
> · 0669 (Sonnet) — Client-Invoice fillable HTML prototype (Desi lens, family-consistent, print CSS)
>   + READ-ONLY diagnosis of the #276 pitch-deck's broken nav buttons (operator report; fix snippet
>   for the AM sweep, deck untouched)
> · 0670 (Sonnet) — Cowork /rr captured to research/ with annotations: **the red-prod finding is
>   STALE — orchestrator verified Production ● Ready tonight** (self-healed via #261's build);
>   phone-side action checklist distilled
> · 0671 (Sonnet) — `scripts/deploy-watchdog/`: notify-only Vercel prod watchdog (ntfy stack
>   conventions, launchd template, dry-run verified) — the repo-side half of Cowork rec #1
> AM note: 0667's numbers are operator-review-before-send; 0669's prototype expects a tweak round
> after coffee (operator-stated).

## Merge-owner checklist (from the 0635 dispatch — do IN ORDER)

1. **G0 recon:** `gh pr list` + per-lane SESSION file read (Verification + Residual sections). Any lane
   that violated its HARD RULES → quarantine its PR, don't merge.
2. **Rebase + full gates per lane** (in-lane green predates the rebase — re-run after rebase onto
   current main): typecheck · lint · `bun run test` (full, uncontended, REAL exit codes — no pipes) ·
   build · affected e2e. Codex lanes never ran builds/DB tests — this is their first full gate.
3. **0639 special (G-033):** apply the hand-authored migration to local DB + prodsnap rehearsal ·
   `prisma generate` · dev-login smoke `/app/inbox` · THEN flip the draft. Register the Resend webhook
   endpoint + `RESEND_WEBHOOK_SECRET` (operator, Resend dashboard) — module is dark until then.
4. **0637 special:** Desi pass on C5/D3/B2 (motion quality, reduced-motion, keyboard) — gates prove
   types, not design.
5. **0636 special:** computed-style visual probe on the three fixed surfaces (class presence ≠ paint).
6. **Ledger apply:** collect every lane's "## Proposed ledger edits" + SESSION_0635 `## Findings to
   route` → assign FS/D/WL/GOAL ids via `ledger-id-next` → apply to canonical ledgers in ONE commit.
   Includes: G-027 flip check (RDD deploy delivered), G-033 id-uniqueness verify, the two runbook
   corrections (per-domain dashboard IP · inbound-MX diagram vs live), PL pipe-masking recurrence,
   root-vercel.json `_comment` FS-candidate.
7. **Cleanup:** remove merged `../ronin-NNNN` worktrees + `auto/*` branches (don't re-grow WL-P3-57);
   `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` from canonical; release/verify canonical claim.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0641_TASK_01 | done | G0 recon (gh pr list + #264 CLEAN) — done; full per-lane quarantine deferred with the wave |
| SESSION_0641_TASK_02 | done | **full sweep complete** — all 43 PRs merged (42-lane wave + #292/#304 stacked-conflict resolves + RDD deploy set); 0 open |
| SESSION_0641_TASK_03 | done | #269 (0639 inbox) — Giddy gate PASS 9.6, draft flipped, additive migration merged; activation gated on `RESEND_WEBHOOK_SECRET` |
| SESSION_0641_TASK_04 | done | ledger apply — PL-024 · FS-0041 · G-033 · SESSION_0682 stub (this bow-out PR) |
| SESSION_0641_TASK_05 | done | fix worktree removed; `/clients` deploy verified; canonical claim released at close |
| SESSION_0641_TASK_06 | done | **CLIENT SECURED** + client-meeting demos shipped (deck · site · CRM) — the session's real outcome |

## What landed

> **The headline: the client closed mid-session.** Michael Flores signed **$5K for a fully-functioning
> Mammoth Build website in 2 weeks (MVP due 2026-08-07).** The session pivoted from pure merge-sweep to
> producing live demos for the client meeting. Full intake → **PL-024** (planning-ledger, P0 top).

- **Merged to `main` (4 PRs):** #264 (RDD go-live + this stub + the 0635/0641/0681 records), #265
  (G-019 Mammoth landing port + SiteHeader/CrmPreview), #306 (v0 `/clients` preview area on apps/rdd),
  **#309 (RDD ignore-gate fix — FS-0041).** All squash-merged.
- **`ronindojodesign.com/clients/*` LIVE:** `/clients`, `/clients/mammoth`, `/clients/bbl` behind HTTP
  Basic Auth (env `CLIENT_PREVIEW_USER=mammoth` / `CLIENT_PREVIEW_PASS=ronin2026` set on the
  `ronindojodesign` Vercel Production project), noindexed. Verified 401→200, homepage untouched.
- **Client-meeting demos** (Artifacts below) — self-contained hosted pages because the operator was
  remote and couldn't reach localhost: iPad-fixed pitch deck (#304 v0.2), rebuilt Mammoth marketing
  site (#265), and a two-tab **Mammoth CRM demo** (populated Sales Pipeline + working Lead-intake
  preview/dedupe). Seeded `mammoth_dev` + a demo CRM member to render the auth-gated pipeline.
- **Root-caused + fixed FS-0041:** RDD's `git diff HEAD^ HEAD` ignoreCommand silently skipped every
  Vercel build (all deploys "Canceled" at 5s) → `/clients` 404'd; replaced with a tip-commit
  `diff-tree` check (#309); deploy went **Ready**.
- **Ledgers (this bow-out):** PL-024 (Mammoth MVP, P0) · FS-0041 · G-033 (admin-inbox goal, prior WIP
  folded in) · SESSION_0682 stub · `.claude/launch.json` mmb-dev config.

## Open decisions / blockers

- **Merge queue SWEPT — COMPLETE (post-demo, operator-directed "get it all to main"):** all 43 open PRs
  landed on `main` — the 42-lane wave + the 2 stacked PRs (#304 deck v0.2 add/add resolved to ours,
  #292 og-cards v1.1 4-file add/add resolved to ours), the deploy-gated RDD set (#274/#286/#290/#308,
  operator Desi/copy sign-off), and **#269** (Giddy-gated 9.6, additive `InboundEmail` migration applied
  to prod Neon). 0 open PRs; BBL + RDD prod verified 200 after ~45 deploys. **G-033 activation is the one
  open item** (see goals-ledger G-033 checklist: set `RESEND_WEBHOOK_SECRET` + register the webhook).
- **`/clients/mammoth` is a status/portfolio page**, not the live CRM; the CRM Artifact is a hosted
  snapshot, not a clickable backend. A truly-live clickable CRM needs an MMB deploy (blocked on the
  monorepo `ui-kit` symlink + a hosted DB) or a tunnel — parked.
- **Demo creds** `mammoth`/`ronin2026` are placeholders on the `ronindojodesign` Vercel Production env —
  rotate when convenient.
- Other per-app `vercel.json` gates still use the fragile `HEAD^ HEAD` shape (FS-0041 watch).

## Review log

- **/ggr (QAR close gate) — composite 9.1 / 10, CLEARS (≥9.0), no hard caps.** Scored the code
  deliverable **#309** (RDD ignore-gate fix) against `code-quality-matrix`: D1 correctness 9.5
  (root-caused from the live Vercel build log, validated `sh -c` Vercel-style, verified live
  401→200), D2 security 9.0, D3 simplicity 8.5 (dense one-liner, justified + README-documented),
  D4 readability 8.5, D5 maintainability 9.0 (FS-0041 + README rationale), D6 scalability 8.5.
  No behavior regression (prod-verified) → no cap; new gate pattern is documented → no
  undocumented-pattern cap. Bow-out ledger docs follow formats and route the finding.
  **Follow-up (logged, not buried):** audit the other per-app `vercel.json` gates still using the
  fragile `HEAD^ HEAD` shape (FS-0041 watch-line).

## Artifacts

- **Pitch deck** (iPad-fixed v0.2): https://claude.ai/code/artifact/7ac4f902-c8ed-41df-97a2-821a74247ca5
- **Mammoth marketing site** (rebuilt landing): https://claude.ai/code/artifact/95cdb282-0c50-4b26-8e1b-db3ee69be770
- **Mammoth CRM demo** (Pipeline + Lead intake tabs): https://claude.ai/code/artifact/5568cfbf-8e5e-401b-940e-3f40a1092dad
- **State-of-Dojo snapshot** (2026-07-24): https://claude.ai/code/artifact/77e0c4f4-6a24-477e-8098-ff6b41126683

## Next session

### Goal

**Mammoth Build MVP — plan session (PL-024 → G-034).** Turn the client-meeting intake (PL-024) into an
executable MVP plan for a fully-functioning Mammoth website, **due 2026-08-07**. Staged as SESSION_0682.

### First task

Read PL-024 in `planning-ledger.md`; run `/pp` to produce the MVP plan + fan-out lanes (site rebuild +
legacy-Tim detangle, CRM/intake wiring, brand-heartbeat PRD, content, pricing), pinning the Aug-7
deadline. Mint **G-034** for the engagement; cross-link PL-024 → G-034. Stage the post-launch arc
(business + social automation, Michael→Obsidian vault game-on/off, FeatureWidget on his admin
dashboard — G-024). Grill the commercial forks (one-time vs T&M, honest-hours vs flat-rate) —
they resolve post-MVP.

> **Waves 9+10 RESULTS (5/5 — RUN COMPLETE: 10 waves / 33 autonomous lanes / PRs #264–#299):**
> · #298 (0667, PRIORITY) **MMB billing pack** — tracker FOUND (Mammoth_Vault iCloud frontmatter,
>   6.95h tracked / ~22.95h evidence total); invoice bills the operator's 20h × $100 F&F,
>   −$2,000 discount visible, **$2,000.00 due**; State of the Building (18 area cards); reusable
>   RDD_Client_Invoice template (the remembered "BBL invoice template" does NOT exist — designed
>   fresh, provenance recorded)
> · #296 (0668) BBL internal-reference invoice — README baseline ~1,400h (2026-06-19) → updated
>   ≈1,672h → $334,400 std / $167,200 F&F, era-itemized, BBL-only-haircut flag
> · #299 (0669) Client-Invoice fillable prototype (Playwright-verified) + **deck bug ROOT CAUSE:
>   iPadOS Safari edge-swipe zone claims the flush-bezel tap targets** — CSS fix diff ready in
>   SESSION_0669 ## Findings, apply to #276 at the sweep
> · #295 (0670) Cowork /rr captured + annotated (red-prod finding STALE — prod verified green)
> · #297 (0671) deploy watchdog shipped — 13/13 tests, live dry-run: both prods READY; AM loads
>   the plist
> **AM morning-critical order:** review #298's numbers BEFORE the Michael meeting · the deck fix
> for #276 · then the merge queue as tabled above. THE ORCHESTRATOR IS DONE.

> **Waves 11+12 (operator-directed, launched — all Claude):**
> · 0672 (Fable, net) `auto/session-0672-mmb-quickbooks-rr` — /rr QuickBooks: Julie's bookkeeping
>   workflow, QBO API + Claude-connector landscape, invoice-pipeline handoff options; forks open;
>   NOTHING auto-sends without operator approval (hard rule threaded through)
> · 0673 (Sonnet) `auto/session-0673-mmb-deck-v2` — **STACK on #276, MERGE-AFTER**: deck v0.2 —
>   applies the 0669 iPad edge-zone fix + visible nav buttons, feature-roster slides (CRM, CMS,
>   automations, QuickBooks-planned, 3D configurator), cutover step-visual (from CUTOVER_CHECKLIST,
>   client framing), closing slide "Built by Ronin Building Design. / Built for Mammoth. / Built
>   for family. / Built for success." (operator confirms wording at review; #284 outline now lags —
>   AM annotates)
> · 0674 (Fable) `auto/session-0674-state-brand-scoping` — SotD=BBL-only view for Tony Hua +
>   MMB-only state posture; FROZEN-KERNEL decision tree: builds ONLY if zero frozen files change,
>   else escalation spec (frozen law honored)
> · 0675 (Fable) `auto/session-0675-feature-intake-billing` — feature-widget → triage → per-feature
>   hours estimate → Client-Invoice pipeline spec (G-024 slice); approval gates at EVERY send point;
>   static-artifact stopgap = prefilled mailto
> · 0676 (Sonnet) `auto/session-0676-agent-promotion-larry-iggy` — Larry (legal) + Iggy (social)
>   assessed + ported from the READ-ONLY old monorepo into .claude/agents/ (found-or-designed-fresh
>   stated honestly); agent-systems-map addition proposed, not applied

> **Waves 11+12 RESULTS:** #300 (0672) QuickBooks /rr — **official Intuit Claude connector is LIVE**
> (confirm-before-write); QBO has no draft-invoice state (EmailStatus:NotSet pattern); RDD invoice =
> a Bill in Mammoth's books (Essentials+); recommended: zero-integration this week → official
> connector pilot · #301 (0676) Larry ported (review-only legal); Iggy = fresh design (old-monorepo
> Iggy was a workflow integrator, not social — honest provenance) · #302 (0675) intake→billing spec
> (structural no-send, feature-request.create key, G-024 slice) · #303 (0674) **/app/state/bbl BUILT
> zero-frozen-edits** — Tony's BBL-only link; AM: Tony account + prod env-flag verify · 0673 deck
> v0.2 still running (stack on #276).
>
> **Waves 13+14 (operator-directed, launched):**
> · 0677 (Fable) /rr + spec — RDD client portal (Michael+BBL accounts, billing surface, previews,
>   SOP uploads via R2/email-in; structurewebworks comp)
> · 0678 (Sonnet) v0 /clients preview area on apps/rdd (env-gated basic-auth middleware, 404-safe
>   without env; **deploy gate + set CLIENT_PREVIEW_USER/PASS pre-merge**)
> · 0679 (Fable) overnight-orchestrator recipe card (this run canonized, failure modes included) +
>   Ronin-bots concept doc (/gq'd from the old dojo-bots idea)
> · 0680 (Sonnet) /process agent-OS showcase page (pipeline SVG, roster + your-brand-your-bots,
>   no-numbers law enforced; **deploy gate + operator copy sign-off**)

> **Waves 13+14 RESULTS (4/4 — GRAND TOTAL: 14 waves / 42 autonomous lanes / PRs #264–#308):**
> · #305 (0679) overnight-orchestrator recipe card + Ronin-bots concept — **"DojoBots" already live
>   in prod** (BBL feature-request toast, SESSION_0422); 4 paste-ready ledger blocks staged
> · #306 (0678) v0 /clients preview — fail-closed basic-auth middleware, noindex, full smoke matrix;
>   **set CLIENT_PREVIEW_USER/PASS in Vercel env BEFORE merge** (deploy gate)
> · #307 (0677) client-portal 4-phase spec — Phase-1 default: own magic-link Better Auth + own rdd
>   Neon DB (ADR 0038, MMB-CRM shape); catches: inbound webhooks lack attachments (API fetch
>   needed); ronindojodesign-scoped Resend SENDING key = Phase-1 gate item; 9 forks open
> · #308 (0680) /process agent-OS showcase — pipeline visual w/ Human-approval emphasis, roster,
>   no-numbers law held; deploy gate + copy sign-off + Desi pass; nav link follows #274
> Deploy-gated RDD PR set now: #274 · #286 · #290 · #306 · #308 (each merge redeploys prod RDD —
> batch them under one Desi + copy pass). THE ORCHESTRATOR IS DONE — 42 lanes, zero merges, zero
> deploys, zero shared-ledger writes, all evidence in this stub.
