---
title: "Research-Review — BBL social-media automation (the content flywheel from platform events)"
slug: research-review-bbl-social-automation
type: research-review
status: research-review
created: 2026-07-24
updated: 2026-07-24
author: "Claude (Fable 5) — /rr overnight lane, wave 4"
last_agent: claude-session-0654
session: SESSION_0654
operator: Brian (asleep — operator forks presented OPEN)
decision: "pending operator sign-off — all forks open"
pairs_with:
  - docs/product/black-belt-legacy/PRD.md
  - docs/product/black-belt-legacy/BRAND_HEART_BEAT.md
  - docs/product/black-belt-legacy/social-content-flywheel-draft.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Research-Review — BBL social-media automation (the content flywheel)

> Read-only `/rr` (research + recommend, operator forks OPEN). The question: **how should
> blackbeltlegacy.com turn its own platform events — verified lineage claims, belt promotions,
> published techniques, milestones — into a social-media content flywheel that drives claims and
> memberships?** Social's job is the North Star: feed the claim loop; revenue is exhaust.

## TL;DR

The platform already emits everything a social program needs: **verified claims, RankEntry belt
awards (with `Rank.colorHex`), published techniques (6 free preview reels), community posts, and
graph milestones**. The proven pattern (Strava share cards, Spotify Wrapped, chess.com's clip
pipeline) is *event → branded templated graphic → scheduled post*, with the member as the sharer
wherever possible. Recommended default: **approval-queue-first automation** — events generate
draft posts via a templated-graphics API (Bannerbear or Placid class, ~$19–49/mo at BBL volume)
into a scheduling tool with an approval workflow (Buffer Team class, ~$10/channel/mo); nothing
auto-publishes at v1. **Consent is the hard gate**: BBL member data is real-person data (much of
it *unclaimed placeholder* real-person data), so automation may only draw on verified-public,
member-consented profile info — the consent model itself is an open fork below.

---

## 1. What the platform already generates (the raw material)

Product facts, from the repo and the live site (fetched 2026-07-24):

| Asset / event | Where it lives | Social-ready? |
| --- | --- | --- |
| Verified lineage claim | `PassportClaimRequest` → reconciled via `claimNodeForUser` on sign-in | The core loop event — "X just claimed their place in the Machado / Bob Bass line" |
| Belt promotion recorded | `RankEntry` award (RankEntry is the ONE rank model); `Rank.colorHex` gives the exact belt color for graphics | Congrats graphic is near-free to template |
| Technique published | `Technique` (+ `isPremium` freemium flag; 6 free preview reels) | Free previews = designed top-of-funnel clips |
| Community post | `CommunityPost` (`/posts`, members) · staff blog `Post` (`/blog`) | Blog posts are owned-content; community posts are member content (consent-gated) |
| Lineage graph milestones | The graph itself (counts by branch, verified nodes, generations) | "Nth verified black belt in the X line" — aggregate stats, lowest privacy risk |
| Member profiles | Passport (avatar, bio, rank history) — paid tiers publish the full public profile | Tier posture already encodes a *publicity* signal (see fork F2) |

Live site context: blackbeltlegacy.com is public with Free / Premium ($35/yr) / Elite ($65/yr,
$45/yr verified-black-belt rate) tiers; primary CTAs are "Join the Legacy" and profile claiming.

**Key structural insight:** BBL's moat content (the verified lineage graph) is *about people*, and
most nodes are **placeholder profiles of real people who have not signed up**. That splits every
automation proposal into two very different risk classes:

- **Aggregate/graph content** (milestone stats, tree visuals without singling out an unclaimed
  person, technique clips, blog) — publishable with normal editorial care.
- **Person-centric content** (claim celebrations, promotion congrats, member spotlights) — requires
  an affirmative consent/publicity signal from that person. Never automatable for unclaimed nodes.

---

## 2. Evidence base

### 2.1 Platform strategy + cadence norms (martial-arts community product)

**Instagram — the community/celebration surface.** General brand research converges on 3–5 feed
posts/week as the reach-vs-burnout sweet spot ([Buffer, 2M-post study](https://buffer.com/resources/how-often-to-post-on-instagram/);
[Hootsuite](https://blog.hootsuite.com/how-often-to-post-on-social-media/);
[Socialinsider](https://www.socialinsider.io/blog/how-often-to-post-on-social-media/)), with
2–3/week linked to *higher engagement* for smaller accounts — over-posting depresses reach.
BJJ-specific guidance is slightly hotter: 4–6 posts/week + daily Stories, Reels ≤2 min, with Reels
generating ~36% more engagement than static posts
([Gymdesk BJJ social guide](https://gymdesk.com/blog/bjj-social-media-marketing)). Belt-promotion
celebration posts and "student wins/transformations" are repeatedly cited as the highest-converting
gym content class ([Gymdesk](https://gymdesk.com/blog/bjj-social-media-marketing);
[Zen Planner](https://zenplanner.com/blogs/online-marketing-strategies-to-increase-brazilian-jiu-jitsu-academy-member-growth-and-retention/)).

**TikTok + YouTube Shorts — technique previews as top-of-funnel.** Short-form norms: TikTok 3–5×/wk,
Shorts 2–3×/wk, and *consistency beats volume* — a sustained 3×/wk outperforms bursty daily posting
([Teleprompter 2026 guide](https://www.teleprompter.com/blog/short-form-video-strategy);
[Meteorra data roundup](https://www.meteorra.ai/blog/how-often-should-you-post-on-tiktok-youtube-shorts-instagram-reels)).
Optimal clip length 15–35s. TikTok has 65M+ BJJ-tagged posts and ~1.73% engagement (≈3× Instagram)
([Gymdesk](https://gymdesk.com/blog/bjj-social-media-marketing);
[Teleprompter](https://www.teleprompter.com/blog/short-form-video-strategy)). BBL's 6 free preview
reels are *exactly* this asset class — BJJ Fanatics runs the same funnel: teaser technique clips on
YouTube/Instagram driving to paid instructionals, with YouTube ≈61% and Instagram ≈17% of its
social traffic ([DS Weekly brand review](https://dsweekly.com/brand-reviews/bjj-fanatics-brand-review/);
[Gymdesk jiu-jitsu marketing guide](https://gymdesk.com/blog/jiu-jitsu-marketing)).

**Facebook — groups over pages.** 3–4 posts/week on the page for announcements/social proof;
Groups are where BJJ community discussion actually happens
([Gymdesk](https://gymdesk.com/blog/bjj-social-media-marketing);
[Hootsuite](https://blog.hootsuite.com/how-often-to-post-on-social-media/)). Skews to the older
demographic — which for BBL is a *feature*: lineage preservation resonates with the generation that
trained under the line's seniors.

**X / Reddit — organic only, never automated.** Reddit norms are explicit: ~90/10
participation-to-promotion, cross-posted promotional content is treated as spam, and moderators
ban for it ([Redship guide](https://redship.io/blog/reddit-self-promotion-rules);
[Conbersa](https://www.conbersa.ai/learn/reddit-self-promotion-rules)). r/bjj is a
culture-dense community; the right move is genuine participation (lineage-history answers,
"who promoted whom" threads) with rare, high-value links. **Automation should never touch Reddit.**

**Signup drivers.** The gym-marketing literature converges: 80–90% educational/community content vs
10–20% promotional; conversion comes from *outcome proof* (promotions, student stories) plus a
trackable CTA (UTM links) ([Gymdesk](https://gymdesk.com/blog/bjj-social-media-marketing);
[Zen Planner](https://zenplanner.com/blogs/online-marketing-strategies-to-increase-brazilian-jiu-jitsu-academy-member-growth-and-retention/)).
For BBL the CTA is always one of two: **claim your profile** or **join the legacy**.

### 2.2 Comparables — product events as social content (observed examples)

1. **Strava — the share-card native loop.** Sharing is core product, not marketing: every activity
   renders as a branded share card; the annual **Year in Sport** ships as 9:16 shareable images.
   Growth runs on members posting their own effort as social currency — peer-to-peer, near-zero ad
   spend ([Contrary Research](https://research.contrary.com/company/strava);
   [NoGood analysis](https://nogood.io/blog/strava-marketing-strategy/);
   [Strava support — Year in Sport sharing](https://support.strava.com/hc/en-us/articles/22067973274509-Your-Year-in-Sport)).
   *BBL analog:* the belt-promotion card and "my place in the lineage" card, shared by the member.
2. **Spotify Wrapped — the event→template→share archetype.** Product data rendered into 9:16
   branded templates; 2025's edition drew 200M+ engaged users in 24h, ~60M shared graphics in 2021,
   and ~14% of US users posting theirs ([NoGood](https://nogood.io/blog/spotify-wrapped-marketing-strategy/);
   [Statista](https://www.statista.com/statistics/1385158/spotify-wrapped-social-media/);
   [ADMA](https://adma.com.au/resources/personal-shareable-no-strings-attached-the-winning-formula-behind-spotify-wrapped)).
   *BBL analog:* an annual "Your Legacy, Wrapped" (rank history + lineage depth + techniques
   logged) — member-triggered, so consent is inherent.
3. **chess.com — clip pipeline + culture-native tone.** Targeted 13–24 on TikTok with memes and
   rapid-fire clips cut from its own broadcast/product material; daily traffic grew ~1.5M → 12M in
   a few years ([Smolov, LinkedIn case study](https://www.linkedin.com/pulse/how-chesscoms-stealth-marketing-campaign-spawned-social-anton-smolov);
   [Backlight/iconik case study](https://backlight.co/resources/case-study/iconik/chess-com)).
   *BBL analog:* technique-reel cutdowns and lineage-history storytelling in r/bjj-literate voice —
   editorial, not templated.
4. **BJJ Fanatics — the technique-teaser funnel.** Free technique snippets on YouTube/IG as
   top-of-funnel for paid instructionals; community-hub brand posture
   ([DS Weekly](https://dsweekly.com/brand-reviews/bjj-fanatics-brand-review/);
   [Knoji](https://bjjfanatics.knoji.com/questions/bjjfanatics-influencer-marketing/)).
   *BBL analog:* the 6 free preview reels are already built for this — post them as Shorts/Reels
   with the freemium gate as the CTA.

Pattern across all four: **the member/viewer does the sharing when the artifact makes *them* look
good**. Automation's highest-leverage job is generating beautiful member-facing share cards, not
firehosing a brand account.

### 2.3 Templated-graphics tooling (event data → branded graphic)

| Tool | Price (entry → scale) | Model | Fit notes |
| --- | --- | --- | --- |
| **Bannerbear** | $49/mo (1,000 credits) → $149 (10k) → $299 (20k); 30-credit free trial | REST API + Zapier/Make/Airtable; images + video | Mature API-first; per-image credit ([pricing](https://www.bannerbear.com/pricing/)) |
| **Placid** | $19/mo (500 credits) → $39 (2,500) → up to ~$249; free trial; credits roll over | REST + URL API; Zapier/Make/n8n/WordPress | Cheapest adequate tier at BBL volume ([pricing](https://placid.app/pricing); [TrustRadius](https://www.trustradius.com/products/placid.app/pricing)) |
| **Canva Connect (Autofill API)** | Requires **Canva Enterprise** membership to run (limited dev trial on paid plans) | Autofill brand templates from data | Best design tooling, worst gate — Enterprise-only kills it for v1 ([Canva docs](https://www.canva.dev/docs/connect/autofill-guide/); [Layerre comparison](https://layerre.com/compare/layerre-vs-canva-api/)) |
| **In-house (satori/@vercel/og class)** | $0 marginal — already a Next.js shop | JSX → image at the edge | Zero vendor cost, full token/brand control (`Rank.colorHex` straight from the DB); costs build time |

At BBL's realistic volume (a few dozen graphics/month), **Placid Basic ($19) or Bannerbear
Automate ($49) both clear the bar**; the in-house `@vercel/og` route is the only one that reads
`BrandSettings`/`Rank.colorHex` natively and doubles as OG-image infrastructure for profile pages —
a real "one kernel" argument. Fork F4 below.

### 2.4 Scheduling / posting automation

| Tool | Price | Fit |
| --- | --- | --- |
| **Buffer** | Free (3 channels, 10 queued posts/channel) → $5/channel Essentials → $10/channel Team (**approval workflows**) | Cheapest approval-queue; human stays in the loop ([pricing](https://buffer.com/pricing)) |
| **Ayrshare** | $149/mo (1 profile) → $299 (10 profiles); 13+ networks, unlimited scheduling, webhooks | Full API posting — the "platform posts for itself" endgame, overkill at v1 ([pricing](https://www.ayrshare.com/pricing/)) |
| **Meta Graph API (direct)** | Free; requires IG professional account + linked FB page + approved `instagram_business_content_publish` app review | Up to 100 API posts/24h ([Meta docs](https://developers.facebook.com/docs/instagram-platform/content-publishing/)); third-party auto-publish commonly capped ~50 ([Later](https://help.later.com/hc/en-us/articles/1500002144742-Instagram-Auto-Publish-Post-Limit)). App review is real friction |

The seam order that matches ADR-style incrementalism: **v1 = event → draft graphic + caption →
human approves in a queue → Buffer schedules.** The DB already has everything needed to enqueue
drafts on the three trigger events (claim verified, RankEntry created, Technique published) — the
"webhook" can start life as a nightly job that diffs new rows; no realtime infra required.
Graduating to API auto-posting (Ayrshare or direct Graph API) is a config change in this
architecture, not a rebuild — which is exactly why the auto-vs-approval decision can stay open.

### 2.5 Consent / publicity — the constraint that shapes everything

Best practice across fitness/community operators is unambiguous: **written, specific, revocable
consent before posting identifiable member content**, consent captured as a separate un-pre-ticked
choice (not bundled into T&Cs), and children's content needing separate parental consent
([GDPRWise](https://gdprwise.eu/en/kennisbank/nieuws/instagram-photo-gdpr/);
[GymMaster GDPR guide](https://www.gymmaster.com/blog/gdpr-fitness-industry/);
[Gym Lawyers](https://www.gymlawyers.com/uncategorized/the-hidden-dangers-of-photography-and-videography-in-your-gym-protect-your-business-now);
[ASAE](https://www.asaecenter.org/resources/articles/an_plus/2019/march/when-can-you-use-images-of-members-from-your-events)).

BBL's twist: the graph contains **unclaimed placeholder profiles of real people**. A "celebration
post" about an unclaimed person is publishing about someone with *no* relationship to the platform.
Hard floor for any proposal: person-centric automation triggers **only** on (a) a claimed,
verified profile, (b) whose owner has an affirmative publicity signal, (c) using only
already-public profile fields. Aggregate stats and the member-shares-their-own-card pattern
sidestep most of this — another reason to prefer them. The exact consent mechanism is fork F2 —
flagged, not assumed.

---

## 3. The proposed flywheel (conceptual — no code)

```
platform event ──► eligibility gate ──► template render ──► approval queue ──► schedule ──► post
 (DB row/webhook)   (consent + tier +     (graphics API or   (human yes/no,    (Buffer     (IG/FB/
                     verified-public)      @vercel/og card)    edit caption)     queue)      Shorts/TikTok)
                                                                                              │
        the claim loop ◄── claim/join CTA + UTM link ◄────────────────────────────────────────┘
```

Event→content map, cadence grid, and rollout live in the companion draft:
[`docs/product/black-belt-legacy/social-content-flywheel-draft.md`](../../product/black-belt-legacy/social-content-flywheel-draft.md).

---

## 4. Recommendation (default — operator may override any fork)

1. **Approval-queue-first**: nothing auto-posts at v1. Events generate drafts; a human ships them.
   Cost: minutes/week. Benefit: zero consent/brand accidents while the templates and voice mature.
2. **Platform priority: Instagram first** (community + celebration + Reels), **YouTube Shorts +
   TikTok second** (the 6 free technique reels, recut to 15–35s), Facebook page third, **Reddit/X
   manual-organic only**.
3. **Lead with the two lowest-risk content classes**: aggregate graph milestones and
   member-triggered share cards (Strava/Wrapped pattern) — person-centric brand posts only for
   consented, claimed, verified members.
4. **Graphics: bias to in-house `@vercel/og`-class rendering** (brand tokens + `Rank.colorHex`
   straight from the DB, doubles as profile OG images); Placid ($19/mo) as the buy-option if build
   time is the constraint. Skip Canva (Enterprise-gated API).
5. **Scheduling: Buffer** (free → Team $10/channel when approval workflow is wanted); revisit
   Ayrshare/direct Graph API only after the queue proves volume and the operator opts into
   auto-posting.
6. **Cadence: start at the floor** — see the 4-week starter grid in the draft (≈3 IG/wk, 2
   Shorts/TikTok per week, 1 FB/wk) — consistency over volume, per every cadence source above.

## 5. OPEN FORKS (operator decisions — argued, not decided)

- **F1 — Platform priority.** Default: IG → Shorts/TikTok → FB. *Counter-case:* TikTok-first
  (chess.com playbook; 3× engagement, 65M BJJ posts) if the goal is net-new audience rather than
  activating the existing lineage community; FB-groups-first if the Machado/Bass generation is the
  claim target. The claim loop argues for where the *unclaimed nodes'* people actually are — likely
  IG + FB, not TikTok.
- **F2 — Consent/publicity gating model.** Options: (a) explicit per-member "celebrate me
  publicly" toggle on the Passport (cleanest, GDPR-conformant, adds product work); (b) treat
  paid-tier full-public profiles as implied publicity consent (zero product work, legally/ethically
  thinner — publicity ≠ profile visibility); (c) per-post DM/email opt-in before each celebration
  post (highest-touch, slowest). **Flagged as the blocking fork for all person-centric automation.**
- **F3 — Auto-post vs approval-queue.** Default argued: approval-queue at v1. *Counter-case:*
  aggregate-stats posts (no person named) are safe to full-auto immediately, and a split policy
  (auto for aggregates, queue for people) captures most of the automation win. Decide after 4 weeks
  of queue data.
- **F4 — Graphics tooling.** Build (`@vercel/og`, $0, brand-native, more build time) vs buy
  (Placid $19/Bannerbear $49, faster, another vendor + template drift from the design system).
  If the same renderer also produces profile/lineage OG images, build wins on kernel logic.
- **F5 — Technique-clip rights posture.** The 6 free reels feature real instructors. Before
  recutting for TikTok/Shorts: whose likeness/IP consent governs redistribution to third-party
  platforms (platform ToS grant vs explicit instructor agreement)? Also the freemium boundary —
  posting full free previews vs 15s teasers of them. Needs an owner decision + possibly a standard
  instructor-content agreement clause.
- **F6 — Account ownership/ops.** Who owns the social accounts, the posting credentials, and the
  weekly approval slot (operator? a VA? a standing agent lane with the operator as approver)?
  Cheap to decide, blocks nothing, but unowned queues die.

## Sources

Cadence/platform: [Buffer](https://buffer.com/resources/how-often-to-post-on-instagram/) ·
[Hootsuite](https://blog.hootsuite.com/how-often-to-post-on-social-media/) ·
[Socialinsider](https://www.socialinsider.io/blog/how-often-to-post-on-social-media/) ·
[Teleprompter](https://www.teleprompter.com/blog/short-form-video-strategy) ·
[Meteorra](https://www.meteorra.ai/blog/how-often-should-you-post-on-tiktok-youtube-shorts-instagram-reels) ·
[Gymdesk BJJ social](https://gymdesk.com/blog/bjj-social-media-marketing) ·
[Gymdesk jiu-jitsu marketing](https://gymdesk.com/blog/jiu-jitsu-marketing) ·
[Zen Planner](https://zenplanner.com/blogs/online-marketing-strategies-to-increase-brazilian-jiu-jitsu-academy-member-growth-and-retention/) ·
[Redship](https://redship.io/blog/reddit-self-promotion-rules) ·
[Conbersa](https://www.conbersa.ai/learn/reddit-self-promotion-rules).
Comparables: [Contrary on Strava](https://research.contrary.com/company/strava) ·
[NoGood on Strava](https://nogood.io/blog/strava-marketing-strategy/) ·
[Strava support](https://support.strava.com/hc/en-us/articles/22067973274509-Your-Year-in-Sport) ·
[NoGood on Wrapped](https://nogood.io/blog/spotify-wrapped-marketing-strategy/) ·
[Statista](https://www.statista.com/statistics/1385158/spotify-wrapped-social-media/) ·
[ADMA](https://adma.com.au/resources/personal-shareable-no-strings-attached-the-winning-formula-behind-spotify-wrapped) ·
[chess.com case study (LinkedIn)](https://www.linkedin.com/pulse/how-chesscoms-stealth-marketing-campaign-spawned-social-anton-smolov) ·
[Backlight/iconik](https://backlight.co/resources/case-study/iconik/chess-com) ·
[DS Weekly on BJJ Fanatics](https://dsweekly.com/brand-reviews/bjj-fanatics-brand-review/) ·
[Knoji](https://bjjfanatics.knoji.com/questions/bjjfanatics-influencer-marketing/).
Tooling: [Bannerbear pricing](https://www.bannerbear.com/pricing/) ·
[Placid pricing](https://placid.app/pricing) ·
[TrustRadius Placid](https://www.trustradius.com/products/placid.app/pricing) ·
[Canva Connect autofill](https://www.canva.dev/docs/connect/autofill-guide/) ·
[Layerre vs Canva](https://layerre.com/compare/layerre-vs-canva-api/) ·
[Buffer pricing](https://buffer.com/pricing) ·
[Ayrshare pricing](https://www.ayrshare.com/pricing/) ·
[Meta content publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing/) ·
[Later auto-publish limits](https://help.later.com/hc/en-us/articles/1500002144742-Instagram-Auto-Publish-Post-Limit).
Consent: [GDPRWise](https://gdprwise.eu/en/kennisbank/nieuws/instagram-photo-gdpr/) ·
[GymMaster](https://www.gymmaster.com/blog/gdpr-fitness-industry/) ·
[Gym Lawyers](https://www.gymlawyers.com/uncategorized/the-hidden-dangers-of-photography-and-videography-in-your-gym-protect-your-business-now) ·
[ASAE](https://www.asaecenter.org/resources/articles/an_plus/2019/march/when-can-you-use-images-of-members-from-your-events).
Live site: [blackbeltlegacy.com](https://blackbeltlegacy.com) (fetched 2026-07-24).
