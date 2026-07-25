---
title: "Research-Review — RDD social-media automation setup (agency presence + packageable client offering)"
slug: research-review-rdd-social-automation
type: research-review
status: research-review
created: 2026-07-24
created_at: 2026-07-24T08:00Z
updated: 2026-07-24
author: "Claude (Fable 5) — overnight /rr lane, wave 4"
last_agent: claude-session-0652
session: SESSION_0652
operator: Brian
decision: "pending operator sign-off — every fork below is OPEN"
pairs_with:
  - docs/product/rdd/brand-brief.md
  - docs/sprints/SESSION_0652.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Research-Review — RDD social-media automation setup

> Read-only `/rr`. The question, two angles: **① RDD's own agency presence** (credibility for the
> umbrella brand + the industry-niche variants — "Ronin Building Design" first, Plumbing/Landscape
> later; one system, per-niche skins), and **② the packageable social-automation service** RDD sells
> to clients (structurewebworks-style productized framing). Research + recommend only — every
> operator fork presented OPEN at the end. All sources accessed 2026-07-24.

## TL;DR (recommended default — operator ratifies)

**One system, staged rollout.** LinkedIn-first **founder-led** posting for the RDD umbrella (2–3
posts/week from Brian's personal profile, company page mirrors), YouTube as the long-form
proof-of-craft anchor that everything else is cut from, and the niche-variant accounts
(Facebook/Instagram-centric) started **only when each variant has real work-product to show**.
Tooling default: **Metricool Advanced** (per-brand pricing + approval workflows — the only SaaS
model that fits one operator running many brands) with a **self-hosted Postiz + n8n** path held open
as the kernel-ethos alternative. AI drafts, human approves, **nothing auto-publishes** — the
brand-brief hard rules (no numbers, no client names without sign-off) become a literal pre-publish
checklist gate. The client-facing service ships as a **care-plan add-on retainer** (retainer up
front, then billed hourly — operator doctrine), tiers sketched below, **no prices on-site until
ratified** (brand-brief rule; also exactly what the structurewebworks comp does).

## Context (grounded)

- **ronindojodesign.com is live** (fetched 2026-07-24): "One kernel. Many brands. Built to last." —
  white-label / custom build / care plan engagement models, BBL as proof-of-craft, founder bio,
  contact. **No social links exist on the site today** — the presence starts from zero.
- **Brand-brief hard rules** ([`docs/product/rdd/brand-brief.md`](../../product/rdd/brand-brief.md)):
  proof-of-craft over promises; **no numbers on-site until ratified**; **no testimonial/metric/client
  name without sign-off**; placeholders render story + process only, never invented outcomes. These
  translate directly into content-gate rules for any automated pipeline.
- **Operator retainer doctrine (pinned):** SEO/social/automation = **retainer up front, then billed
  hourly**. The service sketch below conforms to it.
- **The comp — structurewebworks.com** (fetched 2026-07-24): niche agency (automotive, home-services
  trades, contractors, legal, financial). Key packaging lessons: **no public pricing anywhere** —
  fixed-scope framing ("From brief to launch in 12 weeks", "Fixed quotes, no surprises"), a linear
  4-phase process (Discover → Design → Build → Launch & Grow), trust signals (rating, client count,
  "One senior team — strategy, design, build and growth under one roof"), and marketing framed as
  operationally integrated: "Growth tied to revenue", not vanity metrics. Everything funnels to a
  consultation call. **The productization lives in the process narrative and the phase model, not in
  a published price grid** — which is compatible with RDD's no-numbers-until-ratified rule.
- **Pricing ties:** the unmerged pricing research (`research-review-mmb-services-pricing.md`,
  `research-review-creator-payout-model.md` — referenced by filename only, owned by open PRs) covers
  the adjacent service-pricing question; this doc sketches social-tier *shape* and defers final
  numbers to that lane + the operator.

## 1. Platform strategy (with evidence)

### Angle ①-a: the RDD umbrella (B2B — selling software/design to niche-business owners)

**LinkedIn is the evidence-backed first platform for a B2B agency, and the founder's personal
profile beats the company page by a wide margin.**

- LinkedIn drives ~80% of B2B social leads and is rated the most effective B2B lead-gen platform by
  ~75–89% of B2B marketers surveyed ([Sopro, LinkedIn lead-gen statistics](https://sopro.io/resources/blog/linkedin-lead-generation-statistics/);
  [Martal, LinkedIn statistics 2026](https://martal.ca/linkedin-statistics-lb/);
  [DigitalApplied, LinkedIn statistics 2026](https://www.digitalapplied.com/blog/linkedin-statistics-2026-b2b-marketing-data)).
- Visitor→lead conversion benchmarks: ~2.74% for LinkedIn vs ~0.77% Facebook / ~0.69% X for B2B
  ([MarketingLTB](https://marketingltb.com/blog/statistics/linkedin-ads-statistics/);
  [SalesSo](https://salesso.com/blog/linkedin-b2b-statistics/)).
- Personal profiles out-engage company pages roughly 5–8× (Sprout's Q1 2026 index: ~4.7% median
  engagement for personal content vs 1–2% for pages; company-page posts get ~5% of feed allocation
  vs ~65% for personal; page organic reach fell 60–66% from 2024 to early 2026)
  ([DigitalApplied, personal vs company pages](https://www.digitalapplied.com/blog/linkedin-personal-profiles-vs-company-pages-8x-engagement);
  [Blueberry Media](https://blueberry-media.co.uk/blog/linkedin-personal-profile-vs-company-page);
  [Refine Labs](https://www.refinelabs.com/article/personal-linkedin-engagement-vs-company-page) —
  note the 5× figure originates from vendor measurement, not an independent benchmark; treat the
  *direction* as solid, the multiplier as approximate).
- **Caveat (also sourced):** organic social for agencies is a credibility/nurture layer, not the
  primary lead engine — referrals and partnerships still drive the highest-quality agency leads
  ([Sembly, agency client acquisition](https://www.sembly.ai/blog/how-to-get-clients-for-your-marketing-agency-proven-strategies/);
  [SocialSellinator](https://socialsellinator.com/digital-marketing-agency-clients/)). The realistic
  goal for RDD's own presence: **be findable and credible when a referral checks you out**, and give
  the founder spine (brand-brief §4) a public home. That matches RDD's proof-of-craft doctrine.

**Cadence norms (2026 data):** LinkedIn 2–5 posts/week (consistent 2–3/week correlates with
materially higher follower growth than bursts); Instagram 3–5 feed posts/week; YouTube ~1
video/week or biweekly if quality is high; most working social managers land at 2–5 posts/week
per platform ([Buffer frequency guide](https://buffer.com/resources/social-media-frequency-guide/);
[HeyOrca 2026 frequency guide](https://www.heyorca.com/blog/social-media-posting-frequency-by-platform-2026);
[SocialChamp](https://www.socialchamp.com/blog/how-often-to-post-on-social-media/);
[Socialinsider](https://www.socialinsider.io/blog/social-media-posting-frequency/)). Consistency
beats volume everywhere in the 2026 data — which suits a solo operator.

**X (Twitter): deprioritize.** Lowest measured B2B conversion of the big platforms (above), and the
API moved to pay-per-use in Feb 2026 ($0.015/post, $0.20 if the post contains a link — and agency
posts almost always carry links; no new free tier)
([Postproxy, X API pricing 2026](https://postproxy.dev/blog/x-api-pricing-2026/);
[GetXAPI](https://www.getxapi.com/twitter-api-pricing);
[SocialCrawl](https://www.socialcrawl.dev/blog/x-twitter-api-2026)). Cost is trivial at RDD volume,
but the platform's B2B numbers don't justify a dedicated lane; schedulers that still bundle X cover
it if wanted.

### Angle ①-b: the niche variants (Ronin Building Design → Plumbing → Landscape)

The variants sell to **trade/contractor business owners**, and the sourced picture of where those
owners already live and market is consistent: **Facebook first, then Instagram (before/after
visual proof) and YouTube**, with LinkedIn secondary for commercial work
([ServiceTitan, plumber social guide 2026](https://www.servicetitan.com/blog/social-media-marketing-for-plumbers);
[Homeyou Pro](https://www.homeyou.com/pro/blog/2025/04/11/social-media-for-plumbers);
[Gatorworks, home-services social](https://gatorworks.net/home-service-social-media-strategies/);
[Plumbing Webmasters](https://www.plumbingwebmasters.com/social-media-guide/)). Supporting local
stats: ~55% of consumers discover small businesses on social; ~60% of users visit a local business
because of what they saw on social; Instagram/TikTok increasingly serve as local review surfaces
([ServiceTitan](https://www.servicetitan.com/blog/social-media-marketing-for-plumbers);
[Gatorworks](https://gatorworks.net/home-service-social-media-strategies/)).

Implication: **the variant playbook is different from the umbrella playbook** (visual
before/after + local proof on FB/IG, vs founder-led B2B essays on LinkedIn) — but both are the same
*system*: one content spine, per-niche skins, exactly the kernel→brand→app pattern applied to
content. The fork on *when* to start the variant accounts is argued in §7 (F5).

## 2. Tooling comparison (solo operator, multi-brand — the critical axis)

Pricing verified against vendor pages where fetchable (Buffer, Metricool — 2026-07-24) plus ≥1
secondary source each; others via ≥2 secondary sources. The decisive difference is the **billing
unit**: per-channel (Buffer) vs per-social-set (Later) vs per-brand (Metricool) vs per-account
(Publer) vs per-server (self-hosted).

| Tool | Model / entry price | Multi-brand fit (1 operator, RDD + variants + clients) | Approval workflow | Notes |
| --- | --- | --- | --- | --- |
| **Metricool** | Per-**brand**. Free (1 brand, 20 posts/mo) · Starter from $20/mo (5 brands, $36 → 10) · **Advanced from $53/mo (15 brands** → $85/25 → $159/50), annual ≈ −24% ([metricool.com/pricing](https://metricool.com/pricing/); [Buffer vs Metricool](https://buffer.com/resources/buffer-vs-metricool/)) | **Best-in-class** — a "brand" = a whole profile set, so RDD + RBD + future clients each = 1 brand | Advanced: team/client roles + post-approval system | Also analytics, competitor tracking, Looker connector, API on Advanced. The standard "agency of brands" pick ([Hashtag Tools comparison](https://hashtagtools.io/blog/buffer-vs-later-vs-metricool-best-scheduler-2026)) |
| **Buffer** | Per-**channel**. Free (3 ch) · Essentials $5–6/ch/mo · Team $10–12/ch/mo, annual −20% ([buffer.com/pricing](https://buffer.com/pricing); [Buffer vs Metricool](https://buffer.com/resources/buffer-vs-metricool/)) | Weak at scale — 5 channels ≈ $30–60/mo; each brand multiplies channels | Team plan only | Polished UX; fine for 1 brand, cost curve wrong for many |
| **Publer** | Per-**account**. Professional from ~$5/mo per account (~$4/acct at volume; base $12/mo for 3), Business ~$7/acct ([SocialChamp Publer pricing](https://www.socialchamp.com/blog/publer-pricing/); [socialk.it](https://socialk.it/en/pricing/publer)) | Cheapest per-account SaaS; workspaces exist but pricing still climbs per account | On paid plans (sources conflict on which tier — verify in trial) | Bulk scheduling, RSS automations; budget pick |
| **Later** | Per-**social-set**, from $25/mo, no free plan ([Hashtag Tools](https://hashtagtools.io/blog/buffer-vs-later-vs-metricool-best-scheduler-2026); [Planable, Metricool alternatives](https://planable.io/blog/metricool-alternatives/)) | Weak — IG/visual-first heritage, set-based pricing | Higher tiers | Skip: wrong shape for this portfolio |
| **Native scheduling** (Meta Business Suite, LinkedIn native, YouTube) | $0 | Per-platform silos; no cross-brand calendar | None | Viable week-1 bootstrap for a single brand; doesn't scale to the portfolio, no unified queue/analytics |
| **Postiz** (open-source, AGPL-3.0) | **$0 self-hosted** + VPS; hosted tier also exists ([GitHub gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app); [TeqVolt](https://teqvolt.com/open-source/postiz-29-6k-star-open-source-social-scheduler-buffer-alternative)) | Unlimited brands/accounts at $0 license — strongest multi-brand economics | Basic (teams); thinner than Metricool | ~29.6k GitHub stars; widest platform list incl. Bluesky/Mastodon/Reddit; has an API (n8n-friendly). **Hidden cost:** you register your own developer apps per platform (Meta/LinkedIn app review) + you run the server |
| **Mixpost** (open-source, self-hosted) | License-based self-host ([mixpost.app](https://mixpost.app/); [OpenApps](https://openapps.pro/apps/mixpost)) | Built explicitly for agencies: workspaces, role-based permissions | Team roles | 11 platforms incl. Google Business Profile (relevant to trade-niche variants); same self-host caveats as Postiz |
| **Zapier** (glue) | Per-**task**, from ~$19.99/mo ([DoIt comparison](https://doit.software/blog/n8n-vs-make-vs-zapier); [Toolradar](https://toolradar.com/blog/zapier-pricing-2026)) | n/a (pipes, not a scheduler) | n/a | Fastest to wire, most expensive at volume (per-task billing) |
| **Make** (glue) | Per-**operation**, from ~$9/mo ([DoIt](https://doit.software/blog/n8n-vs-make-vs-zapier); [DigitalApplied automation comparison](https://www.digitalapplied.com/blog/zapier-vs-make-vs-n8n-2026-automation-comparison)) | n/a | n/a | Middle ground; ~70% cheaper than Zapier at 10K tasks/mo |
| **n8n** (glue) | **$0 self-hosted** (VPS ~$15–25/mo) or ~$20/mo cloud; bills per-execution ([DoIt](https://doit.software/blog/n8n-vs-make-vs-zapier); [Cipher Projects](https://www.cipherprojects.com/blog/posts/n8n-vs-zapier-vs-make-automation-comparison/)) | n/a — but the natural repo→social bridge for RDD | n/a | 80–95% cheaper than Zapier at volume; self-hostable, data stays home, AI-agent-friendly — the kernel-ethos pick |

**Read of the table:** for ONE operator running RDD + niche variants + eventually client accounts,
only two models price correctly: **Metricool's per-brand SaaS** (approval workflows + client
management included at Advanced — which is also the client-service enabler) and **self-hosted
Postiz/Mixpost + n8n** (near-zero marginal cost per brand, full control, but you own uptime, platform
app registrations/reviews, and upgrades). Buffer/Later's billing units fight the portfolio shape.
This is fork F2/F3 — argued open in §7.

## 3. Recommended automation flows (content-from-work-product)

The moat framing applies to content too: RDD's work-product (launches, case-study entries,
before/afters, build logs) is the content source-of-truth; social posts are **projections of it**
— same pattern as State-of-Dojo (one kernel artifact, many rendered surfaces). Repurposing one
strong asset into platform-native variants is the standard 2026 pipeline
([Beplan, repurposing strategies](https://beplan.io/blog/content-repurposing-strategies/);
[PostQuick, repurpose video guide](https://www.postquick.ai/blog/repurpose-video-content)).

**Flow A — launch/case-study pipeline (the default):**

```
showcase entry published / deploy shipped / ADR-worthy milestone
  → trigger (n8n webhook, or manual "post-worthy" flag in the repo)
  → AI DRAFT: 1 LinkedIn founder post + 1 page mirror + 1 IG/FB variant (niche skin if applicable)
      [voice gate: brand-brief rules applied at draft time]
  → HUMAN APPROVAL QUEUE (scheduler's approval workflow — nothing auto-publishes)
      [hard-rule checklist: no numbers unratified · no client names w/o sign-off ·
       no invented outcomes · placeholders = story+process only]
  → scheduler queues to the per-brand calendar → platforms
```

**Flow B — repurposing ladder (when a long-form anchor exists):**

```
long-form asset (case-study write-up · YouTube build-log · founder essay)
  → clips: OpusClip ($0 free / $15 Starter / $29 Pro — [TrustRadius](https://www.trustradius.com/products/opusclip/pricing), [eesel](https://www.eesel.ai/blog/opusclip-pricing))
    or Descript for transcript-first editing (Free / ~$16–24 Hobbyist / ~$24–35 Creator — [Sonix](https://sonix.ai/resources/descript-pricing/), [CostBench](https://costbench.com/software/ai-video-generators/descript/))
  → carousels/threads cut from the same transcript
  → same approval queue as Flow A → schedule
(distribution-heavy alternative: Repurpose.io $35/79/179 per mo — [SocialRails](https://socialrails.com/blog/repurpose-io-pricing), [Castmagic review](https://www.castmagic.io/software-reviews/repurpose-io) — overkill until video volume is real)
```

**AI-assist posture (recommended): "AI drafts, operator publishes."** Draft generation +
variant-cutting is where automation pays; judgment, voice, and the sign-off rules stay human. No
auto-publish at any tier of automation until the operator explicitly ratifies otherwise — the
brand's no-slop voice rules are a hard gate, and every cited cadence source agrees consistency of
*quality* beats volume. (Fork F4.)

## 4. Starter 4-week cadence template (placeholder slots — no invented claims)

Umbrella (RDD) only; variants get the same grid re-skinned when activated. Slot types, not copy:
**[CRAFT]** proof-of-craft (shipped work, screenshots, before/after) · **[PROCESS]** behind the
kernel (how one-kernel-many-brands works) · **[POV]** founder perspective (brand-brief §4 spine) ·
**[CASE]** case-study beat (BBL story — only sign-off-cleared material) · **[NOTE]** launch/update
note. Cadence per the 2026 norms above (LinkedIn 3×/wk personal, 1×/wk page mirror; YouTube
biweekly optional anchor).

| Week | LinkedIn (founder, 3×) | LinkedIn (page, 1×) | YouTube (biweekly, optional) |
| --- | --- | --- | --- |
| 1 | [POV: why one kernel] · [CRAFT: BBL live surface] · [PROCESS: kernel→brand→app] | mirror of best-performing | — |
| 2 | [CASE: BBL beat 1] · [POV: founder spine beat] · [CRAFT: ui-kit detail] | mirror | [Build-log #1: placeholder] |
| 3 | [PROCESS: white-label instance model] · [CRAFT: before/after] · [POV] | mirror | — |
| 4 | [CASE: BBL beat 2] · [NOTE: site/feature launch] · [POV] | mirror | [Build-log #2: placeholder] |

Every [CASE]/[CRAFT] slot inherits the sign-off rule; empty slot > invented content.

## 5. The packageable service (angle ②) — tier sketch

**Market anchors (cited):** solo/freelance small-business management runs ~$300–$1,500/mo
(basic ≈ $300–500: 8–12 posts, 2–3 platforms · standard ≈ $500–1,000: 15–20 posts, 3–4 platforms,
light engagement · premium ≈ $1,000–2,000+: strategy, community management, reporting)
([Planable pricing guide](https://planable.io/blog/social-media-management-pricing/);
[MySocial](https://mysocial.io/blog/social-media-management-pricing-guide/);
[Boomp](https://boomp.net/blog/freelance-social-media-manager-charge-cost)). Agency retainers run
far higher (~$2,000–6,000/mo starter; $4,500–15,000 typical professional range)
([Eclincher](https://www.eclincher.com/articles/social-media-management-pricing-rates-and-costs-for-2026);
[DigitalApplied costs guide](https://www.digitalapplied.com/blog/social-media-marketing-costs-2026-pricing-guide);
[NewMedia](https://newmedia.com/blog/social-media-marketing-cost)). RDD's wedge sits between:
solo-priced, agency-shaped — and **the automation stack in §2–3 is exactly what makes the margin
work** (Metricool Advanced's client/approval features, or the self-hosted stack, let one operator
serve N clients).

**Shape (conforms to the operator retainer doctrine — setup retainer up front, then billed
hourly; final numbers deferred to the pricing lane + operator, per the no-numbers rule):**

| Tier (working names) | What's in it | Cadence anchor (from §1 norms) |
| --- | --- | --- |
| **Presence** (foundation) | Profile setup/rescue, 1–2 platforms, 8–12 posts/mo from client-supplied material, monthly snapshot report | ~2–3 posts/wk on the primary platform |
| **Growth** | 3–4 platforms, 15–20 posts/mo incl. produced before/after content, light engagement/inbox, monthly report + quarterly review | platform-norm cadence per §1 |
| **Engine** (full) | Everything above + repurposing ladder (long-form → clips/carousels), community management, strategy input, ad-ready content | daily-capable, video-inclusive |

Structural notes (from the comp + the market data): (a) structurewebworks publishes **process, not
prices** — RDD can ship the tier *page* without violating the no-numbers rule by driving to a
consult; (b) every pricing source warns the retainer quote must separate **management fee vs ad
spend vs tool subscriptions** ([NewMedia](https://newmedia.com/blog/social-media-marketing-cost);
[Eclincher](https://www.eclincher.com/articles/social-media-management-pricing-rates-and-costs-for-2026))
— the retainer-then-hourly doctrine handles scope creep cleanly; (c) the same per-niche skin system
RDD uses for itself (§1-b) IS the deliverable for trade clients — dogfooding as sales proof.

## 6. Cost-to-run estimates (RDD's own stack, monthly)

| Stack | Components | Est. range | Sources |
| --- | --- | --- | --- |
| **SaaS default** | Metricool Advanced ($53, →15 brands) + OpusClip Starter ($15, when video starts) | **~$53–68/mo** (Starter $20 works until brands > 5 or approvals needed) | [metricool.com/pricing](https://metricool.com/pricing/) · [TrustRadius OpusClip](https://www.trustradius.com/products/opusclip/pricing) |
| **Self-hosted** | Postiz + n8n on one VPS ($15–25) + own platform apps ($0) | **~$15–25/mo** + ops time (server, upgrades, Meta/LinkedIn app review) | [DoIt n8n comparison](https://doit.software/blog/n8n-vs-make-vs-zapier) · [Postiz GitHub](https://github.com/gitroomhq/postiz-app) |
| **Bootstrap (week 1)** | Native scheduling (Meta Business Suite, LinkedIn, YouTube) | **$0** | vendor-native; no unified calendar |
| **If X included** | Pay-per-use API via scheduler | ~$0.015–0.20/post — negligible at RDD volume | [Postproxy](https://postproxy.dev/blog/x-api-pricing-2026/) · [GetXAPI](https://www.getxapi.com/twitter-api-pricing) |
| Glue (only if SaaS scheduler + no n8n) | Make from ~$9/mo, Zapier from ~$20/mo | $9–20/mo | [DoIt](https://doit.software/blog/n8n-vs-make-vs-zapier) · [DigitalApplied](https://www.digitalapplied.com/blog/zapier-vs-make-vs-n8n-2026-automation-comparison) |

Net: **the whole program runs at roughly $0–70/mo in tooling**; the scarce resource is operator
attention, which is what the approval-queue design minimizes.

## 7. OPEN FORKS for the operator (argued, not decided)

- **F1 — Platform priority.** (a) LinkedIn-founder-first, YouTube anchor later ⭐ *rec: the B2B
  evidence in §1 all points here, and it feeds the founder-spine work already in the brand brief* ·
  (b) YouTube-first (build-log anchor, everything cut from it — strongest repurposing economics but
  highest production cost per unit) · (c) balanced multi-platform from day one (against the solo
  cadence data — spreads thin). The variants' FB/IG-first playbook (§1-b) is separate and starts
  with F5.
- **F2 — SaaS tool choice.** (a) Metricool (Starter now → Advanced when approvals/brands demand) ⭐
  *rec: the only per-brand pricing model; approval workflow doubles as the client-service seam* ·
  (b) Publer (cheapest, but per-account pricing climbs with the portfolio and approval-tier
  reporting conflicts in sources) · (c) Buffer (best UX, wrong billing unit for many brands).
- **F3 — Self-hosted vs SaaS.** (a) Start SaaS, hold the Postiz+n8n path open, revisit when client
  accounts arrive ⭐ *rec: SaaS is faster to first-post; the self-host case strengthens exactly when
  brand-count × client-count grows — and it's the on-doctrine "own the kernel" answer long-term* ·
  (b) Self-host now (lowest cost, full control, but platform app-review friction before post #1) ·
  (c) SaaS forever (simplest, permanent per-brand rent). Genuine tension between kernel ethos and
  time-to-first-post — operator call.
- **F4 — AI-assist level.** (a) AI drafts + human approves every post ⭐ *rec: §3 posture; honors
  the no-slop voice rules at near-zero risk* · (b) human-written only (highest voice fidelity,
  highest attention cost — the cadence data says consistency will slip) · (c) auto-publish
  low-risk classes (e.g., [NOTE] launch posts) after a proving period (revisit-later candidate, not
  a v1 setting).
- **F5 — When to start the niche-variant accounts.** (a) Reserve handles/pages for Ronin Building
  Design now, post nothing until real work-product exists ⭐ *rec: zero-cost option-preservation
  that honors "placeholders never invent outcomes"* · (b) launch RBD presence now with
  process/POV-only content (earlier compounding, but content without proof contradicts
  proof-of-craft) · (c) wait entirely until the first variant client (purest, risks losing clean
  handles).
- **F6 — Ship the service page now?** (a) Publish tiers-without-prices on ronindojodesign.com
  (structurewebworks pattern; consult-driven) · (b) hold until the pricing lane
  (`research-review-mmb-services-pricing.md`) merges and numbers are ratified ⭐ *rec: sequencing —
  the page copy depends on tier shape survivorship, and the site just went live; one clean
  services update beats two* · (c) soft-launch as a care-plan bullet only.

## Sources (all accessed 2026-07-24)

Primary/vendor: [ronindojodesign.com](https://ronindojodesign.com) · [structurewebworks.com](https://structurewebworks.com/) (+ /services) ·
[metricool.com/pricing](https://metricool.com/pricing/) · [buffer.com/pricing](https://buffer.com/pricing) ·
[github.com/gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) · [mixpost.app](https://mixpost.app/) ·
[repurpose.io/pricing](https://repurpose.io/pricing/)

Platform/lead-gen: [sopro.io](https://sopro.io/resources/blog/linkedin-lead-generation-statistics/) ·
[martal.ca](https://martal.ca/linkedin-statistics-lb/) · [digitalapplied.com LinkedIn stats](https://www.digitalapplied.com/blog/linkedin-statistics-2026-b2b-marketing-data) ·
[marketingltb.com](https://marketingltb.com/blog/statistics/linkedin-ads-statistics/) · [salesso.com](https://salesso.com/blog/linkedin-b2b-statistics/) ·
[digitalapplied.com personal-vs-page](https://www.digitalapplied.com/blog/linkedin-personal-profiles-vs-company-pages-8x-engagement) ·
[blueberry-media.co.uk](https://blueberry-media.co.uk/blog/linkedin-personal-profile-vs-company-page) ·
[refinelabs.com](https://www.refinelabs.com/article/personal-linkedin-engagement-vs-company-page) ·
[sembly.ai](https://www.sembly.ai/blog/how-to-get-clients-for-your-marketing-agency-proven-strategies/) ·
[socialsellinator.com](https://socialsellinator.com/digital-marketing-agency-clients/)

Cadence: [buffer.com frequency guide](https://buffer.com/resources/social-media-frequency-guide/) ·
[heyorca.com](https://www.heyorca.com/blog/social-media-posting-frequency-by-platform-2026) ·
[socialchamp.com](https://www.socialchamp.com/blog/how-often-to-post-on-social-media/) ·
[socialinsider.io](https://www.socialinsider.io/blog/social-media-posting-frequency/)

Trades/home-services: [servicetitan.com](https://www.servicetitan.com/blog/social-media-marketing-for-plumbers) ·
[homeyou.com](https://www.homeyou.com/pro/blog/2025/04/11/social-media-for-plumbers) ·
[gatorworks.net](https://gatorworks.net/home-service-social-media-strategies/) ·
[plumbingwebmasters.com](https://www.plumbingwebmasters.com/social-media-guide/)

Tooling: [buffer.com/resources/buffer-vs-metricool](https://buffer.com/resources/buffer-vs-metricool/) ·
[hashtagtools.io](https://hashtagtools.io/blog/buffer-vs-later-vs-metricool-best-scheduler-2026) ·
[planable.io Metricool alternatives](https://planable.io/blog/metricool-alternatives/) ·
[socialchamp.com Publer pricing](https://www.socialchamp.com/blog/publer-pricing/) · [socialk.it](https://socialk.it/en/pricing/publer) ·
[teqvolt.com](https://teqvolt.com/open-source/postiz-29-6k-star-open-source-social-scheduler-buffer-alternative) ·
[openapps.pro Mixpost](https://openapps.pro/apps/mixpost) · [doit.software](https://doit.software/blog/n8n-vs-make-vs-zapier) ·
[digitalapplied.com automation](https://www.digitalapplied.com/blog/zapier-vs-make-vs-n8n-2026-automation-comparison) ·
[cipherprojects.com](https://www.cipherprojects.com/blog/posts/n8n-vs-zapier-vs-make-automation-comparison/) ·
[toolradar.com](https://toolradar.com/blog/zapier-pricing-2026)

X API: [postproxy.dev](https://postproxy.dev/blog/x-api-pricing-2026/) · [getxapi.com](https://www.getxapi.com/twitter-api-pricing) ·
[socialcrawl.dev](https://www.socialcrawl.dev/blog/x-twitter-api-2026)

Repurposing: [trustradius.com OpusClip](https://www.trustradius.com/products/opusclip/pricing) ·
[eesel.ai OpusClip](https://www.eesel.ai/blog/opusclip-pricing) · [sonix.ai Descript](https://sonix.ai/resources/descript-pricing/) ·
[costbench.com Descript](https://costbench.com/software/ai-video-generators/descript/) ·
[socialrails.com Repurpose.io](https://socialrails.com/blog/repurpose-io-pricing) ·
[castmagic.io Repurpose.io](https://www.castmagic.io/software-reviews/repurpose-io) ·
[beplan.io repurposing](https://beplan.io/blog/content-repurposing-strategies/) ·
[postquick.ai](https://www.postquick.ai/blog/repurpose-video-content)

Retainer pricing: [eclincher.com](https://www.eclincher.com/articles/social-media-management-pricing-rates-and-costs-for-2026) ·
[digitalapplied.com costs](https://www.digitalapplied.com/blog/social-media-marketing-costs-2026-pricing-guide) ·
[newmedia.com](https://newmedia.com/blog/social-media-marketing-cost) ·
[planable.io pricing](https://planable.io/blog/social-media-management-pricing/) ·
[mysocial.io](https://mysocial.io/blog/social-media-management-pricing-guide/) ·
[boomp.net](https://boomp.net/blog/freelance-social-media-manager-charge-cost)
