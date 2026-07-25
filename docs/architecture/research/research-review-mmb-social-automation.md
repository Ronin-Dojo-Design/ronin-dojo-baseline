---
title: "Research Review — MMB Social-Media Automation (photo pipeline, reviews, cadence)"
slug: research-review-mmb-social-automation
type: research-review
status: research-review
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0653
session: SESSION_0653
pairs_with:
  - docs/product/mammoth-build/PRD.md
  - docs/product/mammoth-build/CONTEXT.md
  - docs/product/mammoth-build/BRAND_HEART_BEAT.md
  - docs/product/mammoth-build/social-automation-playbook-draft.md
backlinks:
  - docs/sprints/SESSION_0653.md
---

# Research Review — MMB Social-Media Automation

/rr lane, SESSION_0653 (overnight wave 4). Research + recommendation for a social-media
automation setup for **Mammoth Metal Buildings** (Michael Flores), sold as a service line of the
Ronin Building Design engagement. **Research and argument only — every fork below is OPEN for the
operator.** Companion client-facing draft:
[`social-automation-playbook-draft.md`](../../product/mammoth-build/social-automation-playbook-draft.md).

## TL;DR — Recommended default (not decided)

**GBP-first, Facebook/Instagram-second, YouTube-as-archive, LinkedIn/TikTok deferred.** The
highest-ROI "social" surface for a regional contractor is the Google Business Profile + review
engine, and Mammoth currently has **no GBP link on its site at all** while its CRM already captures
the two triggers that feed it (job completion → review request; `BuildPhoto` → post material). The
sustainable content engine is the **job-site photo pipeline the CRM already models** — crew photos
→ curated → branded posts — not a net-new content creation burden on Michael. Tooling default:
**Metricool (or Buffer) + a light Make/n8n automation seam + CRM-native review requests** rather
than a Podium-class subscription. RDD-managed posting, Michael supplies raw material. All argued
below; forks open.

---

## 1. Observed state (fetched 2026-07-24)

### mammoth.build

Live and content-rich (building-type taxonomy, resource hub with pillar guides, project gallery
with named builds — Castle Rock CO, Littleton CO, Grand Junction CO, Sheridan WY, Pinedale WY,
Spokane WA — leadership page listing Ryan Sullivan, Jeremy Sullivan, Tim Dodge, **Michael Flores**).
Blog is active (posts dated June 2026). Brand voice already social-ready: *"We sell 'em. We build
'em. We stand by 'em."* · *"Every metal building is huge to someone."* · the anti-pattern callout
*"Most metal building companies quote, ship, and disappear."*

Social presence **linked from the site**:

| Surface | State |
| --- | --- |
| Facebook | Linked — `facebook.com/people/Mammoth-Metal-Buildings/61590792876855/` (new-format page ID → recently created page) |
| Instagram | Linked — `@mammothmetalbuildings` |
| Phone | `tel:` 888-850-7564 |
| Google Business Profile | **No link found on site** |
| YouTube | Absent |
| LinkedIn | Absent |
| TikTok | Absent |

Read: the two "default" surfaces exist but are young; the highest-leverage local surface (GBP) is
not surfaced; there is zero video presence despite a gallery full of timelapse-able builds.

### The CRM seam (why this engagement is different from a generic social retainer)

The MMB CRM already models the two events a social/review engine needs — this is the automation
seam, described conceptually (no code in this lane):

1. **`BuildPhoto` (before/during/after per project)** is a first-class PRD goal ("Capture
   before/during/after photos per project as first-class proof"). The content flywheel is a
   *projection* of proof the crew already captures — curated → branded → scheduled.
2. **Successful Close / Satisfied Installation** is the canonical completion gate. A confirmed
   satisfaction event is the exact trigger review-request automation keys on — and it fires at the
   moment of maximum customer goodwill.
3. **Lead Source** is already a roster column, and "social interaction" is already a named intake
   source (Michael's meeting notes) — so social ROI is measurable *inside the CRM* as cost per
   customer, matching the operator's value doctrine (retainer up front, billed hourly, value framed
   as cost-per-customer / lead conversion).

Benchmark for that framing: Michael's current purchased-lead spend is ~$1,500 for ~600 leads
(~$2.50/lead, low intent, shared lists). Organic social + review leads are inbound, exclusive, and
pre-warmed — the comparison the value narrative should run on.

### structurewebworks.com framing study (as directed)

- **Homepage:** "SaaS, web apps & marketing that turn clicks into customers"; results framed as
  revenue-tied outcome metrics ("+92% organic traffic," "3.2× booked jobs," "−38% CAC"); "We own
  the outcome"; named industry verticals including contractors.
- **/industries/contractors:** the striking move is that the contractors page is **not** a
  marketing-services pitch — it is an *operational consolidation* pitch ("Run your whole business
  on one platform," margin leaking "between systems," "nothing re-typed," one fixed price you own).
- **Lesson for RDD:** the agency that wins contractors sells **operations, not impressions**. RDD's
  version is stronger than Structure Webworks' because the CRM is already the client's system of
  record: the pitch is "your CRM already captures the proof and the completion event — we turn
  those into leads," not "hire us to post." Frame every deliverable as pipeline math (cost per
  customer, review→call conversion), never follower counts.

---

## 2. Evidence base

Market facts below carry ≥2 sources; observed examples are single-source by nature (cited page).

### 2a. Where contractor leads actually come from (platform strategy)

- **Search + Maps dominates discovery.** 98% of consumers search online before hiring a home
  services business, and over 90% of homeowners use Google to find local contractors, with the Map
  Pack taking ~42% of clicks ([CallRail](https://www.callrail.com/blog/home-services-marketing-statistics),
  [Improve & Grow contractor market report](https://improveandgrow.com/contractors-and-trades/us-contractor-market-report-2025/),
  [Minyona GBP guide](https://minyona.com/blog/google-business-profile-contractors)). 93% of
  local-intent searches trigger the Local Pack
  ([BizIQ](https://biziq.com/blog/local-seo-statistics-2026/),
  [OnTheMap](https://www.onthemap.com/blog/local-seo-stats/)).
- **Reviews are the deciding input.** 81% of consumers use Google reviews to evaluate local
  businesses and 88% would use a business that responds to all its reviews
  ([Shapo review statistics](https://shapo.io/blog/google-review-statistics/),
  [BrightLocal](https://www.brightlocal.com/resources/local-seo-statistics/)). 98% read reviews;
  ~73% only trust reviews from the last 30 days — recency, not lifetime count, is the working
  metric ([BrightLocal](https://www.brightlocal.com/resources/local-seo-statistics/),
  [Shapo](https://shapo.io/blog/google-review-statistics/)). Businesses with 50+ Google reviews
  see materially more leads (one dataset: +266% vs <10 reviews)
  ([BizIQ](https://biziq.com/blog/local-seo-statistics-2026/),
  [OnTheMap](https://www.onthemap.com/blog/local-seo-stats/)).
- **Facebook + Instagram are the paid/organic social workhorses for local trades.** Facebook was
  the top-ROI platform for 28% of marketers (Instagram second at 22%)
  ([CallRail](https://www.callrail.com/blog/home-services-marketing-statistics)); contractor-niche
  guides consistently put FB local targeting + IG project visuals at the center of residential
  social ([Improve & Grow](https://improveandgrow.com/contractors-and-trades/us-contractor-market-report-2025/),
  [Constructo](https://constructomarketing.com/social-media-marketing-for-contractors/),
  [Oceanfront](https://oceanfront.agency/social-media-marketing-construction-companies/)). This
  matches Mammoth's buyer: barndominium/shop/ag buyers concentrate in rural TX/CO/OK-style markets
  — Mammoth's CO/WY footprint is squarely in it
  ([McElroy Metal barndominium trends](https://blog.mcelroymetal.com/metal-roofing-and-siding/barndominium-market-trends),
  [FastExpert 2026 barndominium guide](https://www.fastexpert.com/blog/barndominium-guide/)).
- **Short-form video is the organic-reach lever.** The formats that reliably travel for
  contractors: before/after transformations, satisfying process clips (timelapse, panel runs),
  and "what we found" stories ([Viryze contractor TikTok guide](https://viryze.com/blog/contractor-tiktok-content-ideas),
  [BuildBook timelapse guide](https://buildbook.co/blog/how-to-make-a-time-lapse-video-of-your-project)).
  One rig + phone timelapse settings make this near-zero-marginal-cost
  ([BuildBook](https://buildbook.co/blog/how-to-make-a-time-lapse-video-of-your-project),
  [CompanyCam](https://companycam.com/resources/blog/photos-every-contractor-should-be-taking-on-the-job)).
- **LinkedIn matters only for the commercial/B2B lane.** Effective for reaching
  developers/facility owners/engineers via title targeting and case-study content — but it is a
  precision channel, not a volume one
  ([GWP](https://gwpinc.com/making-the-most-of-linkedin-b2b-networking-in-the-construction-industry/),
  [Construction Digital Marketing](https://constructiondigitalmarketing.com/smm/why-linkedin-is-perfect-for-commercial-construction-marketing/),
  [BudgetBonds](https://budgetbonds.com/post/why-linkedin-works-for-b2b-construction-marketing)).
  Relevant to Mammoth's commercial/industrial building types, deferrable until the residential/ag
  engine runs.

### 2b. Cadence norms (what "consistent" means, sourced)

- Small-business baseline: **3–5 posts/week** beats sporadic volume; consistency drives ~5×
  the engagement of bursty posting
  ([Hootsuite](https://blog.hootsuite.com/how-often-to-post-on-social-media/),
  [Buffer](https://buffer.com/resources/social-media-frequency-guide/),
  [Constant Contact](https://www.constantcontact.com/blog/how-often-post-social-media/)).
- Instagram: 3–5 feed posts/week, Reels for reach, Stories ad-hoc
  ([Hootsuite](https://blog.hootsuite.com/how-often-to-post-on-social-media/),
  [HeyOrca](https://www.heyorca.com/blog/social-media-posting-frequency-by-platform-2026)).
- Facebook: 3–7/week is plenty; the algorithm rewards conversation over volume
  ([Hootsuite](https://blog.hootsuite.com/how-often-to-post-on-social-media/),
  [Buffer](https://buffer.com/resources/social-media-frequency-guide/)).
- **GBP: 1–2 posts/week + 2–3 photos/week.** Posts fall out of the prominent "What's New" slot
  after ~7 days; profiles silent for 30+ days see measurable impression drops
  ([Minyona](https://minyona.com/blog/google-business-profile-contractors),
  [Richwood](https://richwoodmarketing.com/blog/google-business-profile-posting-frequency/),
  [GMB API best practices](https://gmbapi.com/news/google-business-profile-posts-2025-best-practices/)).
- Implication: the whole program is **~5–8 content units/week**, most of which are *the same job
  photo repurposed across surfaces* — a curation problem, not a creation problem.

### 2c. The job-site content flywheel (operational workflow)

The sustainable pattern for a non-marketer owner, per contractor-photo-workflow literature
([CompanyCam](https://companycam.com/resources/blog/how-to-take-job-documentation-photos-that-actually-help-your-business),
[CompanyCam before/after tool](https://companycam.com/resources/blog/best-before-after-photo-tool-for-contractors),
[SD Marketing Pros workflow](https://sdmarketingpros.com/contractor-job-site-photos-workflow/),
[BuildBook](https://buildbook.co/blog/how-to-make-a-time-lapse-video-of-your-project)):

1. **Capture is a job-site SOP, not a marketing task.** Crew shoots a fixed shot list per stage
   (site/slab → frame day → sheeting → finished + drone/wide) from their phones; photos auto-file
   to the project record. The CRM's `BuildPhoto` (before/during/after per project) is exactly this
   — proof capture and content capture are the *same act*.
2. **Curate weekly, centrally.** One person (RDD, in the managed model) pulls the best 5–10 shots
   per week, pairs before/afters, and cuts one timelapse/Reel per finished build.
3. **Brand + schedule in batches.** Caption with location/building-type/spec (the gallery already
   proves the format: "60×84×20 Agricultural — Spokane, WA"), queue a week at a time in a
   scheduler; the same asset fans out to FB, IG, GBP with per-surface captions.
4. **Timelapse rig per flagship build.** A phone or dedicated cam on frame-up day; one finished
   build per month becomes the hero Reel/Short. A single well-documented job feeds the whole
   stack: portfolio entry, before/after post, timelapse reel, GBP photo set
   ([CompanyCam](https://companycam.com/resources/blog/photos-every-contractor-should-be-taking-on-the-job),
   [SD Marketing Pros](https://sdmarketingpros.com/contractor-job-site-photos-workflow/)).

Key argument: Mammoth should NOT buy CompanyCam-class capture software — the CRM *is* the capture
system (photos are already a PRD-level proof requirement). The gap is only the **curate → brand →
schedule** back half, which is the RDD service.

### 2d. The review engine

- **SMS beats email decisively for review requests:** 95–98% open rates vs 20–35% email; post-job
  SMS with a direct Google review link converts ~15–25% vs 3–4× worse for email
  ([Starworks](https://www.starworks.com.au/blog/sms-vs-email-review-requests-which-converts-better-in-2025),
  [Applause](https://www.applausehq.com/blog/sms-review-requests-are-helping-home-services-companies-double-their-google-reviews),
  [US Tech Automations](https://ustechautomations.com/resources/blog/home-service-review-automation-how-to-2026)).
- **Timing is the variable that matters:** the optimal window is ~90 minutes–3 hours after
  completion; waiting >48h cuts response ~40%
  ([Starworks](https://www.starworks.com.au/blog/sms-vs-email-review-requests-which-converts-better-in-2025),
  [WiserReview](https://wiserreview.com/blog/review-request-message/)). For Mammoth the natural
  trigger is **Satisfied Installation confirmation** — the CRM's own completion gate, which by
  definition fires when the customer has just said they're happy. A gentle 1–2 step follow-up
  sequence adds ~10%/touch before annoyance sets in
  ([TrueReview drip guide](https://www.truereview.co/post/how-to-set-up-automated-review-drip-campaign),
  [WiserReview](https://wiserreview.com/blog/google-review-automation/)).
- **Routing + reuse:** direct-link to the Google review form; respond to every review (88% factor
  above); harvest the best lines as quote-card posts — closing the loop back into the content
  flywheel. Testimonial harvesting is standard practice in the NiceJob-class tools
  ([TrueReview comparison](https://www.truereview.co/post/birdeye-vs-podium-vs-nicejob-vs-truereview-an-honest-comparison),
  [Authencio NiceJob review](https://www.authencio.com/blog/nicejob-pricing-is-it-the-best-value-reputation-tool)).
- **Consent note:** automated SMS requires prior express consent captured at intake (TCPA
  posture) — consistent with the PRD's existing "no automation without consent/stop rules"
  non-goal. The CRM already stores the phone + relationship context to do this correctly.

### 2e. Tooling landscape (costs are list prices, cited — no client pricing implied)

| Class | Options | Observed cost | Notes |
| --- | --- | --- | --- |
| Scheduler | Metricool · Buffer · Publer · Later | Free–~$19/mo entry ([Buffer](https://buffer.com/resources/social-media-scheduling-tools/), [Metricool vs Buffer](https://metricool.com/metricool-vs-buffer/), [Eclincher roundup](https://www.eclincher.com/articles/12-best-social-media-schedulers-in-2026-features-and-pricing)) | Metricool free tier covers ~11 channels incl. GBP + analytics; Buffer Essentials ~$6/mo/channel; Publer Pro ~$12/mo; Later from ~$18.75/mo |
| Automation glue | Make · Zapier · n8n | Zapier ~$20/mo entry; n8n ~€24/mo cloud or self-host on a $3–7 VPS; Make per-operation between them ([Digital Applied](https://www.digitalapplied.com/blog/zapier-vs-make-vs-n8n-2026-automation-comparison), [Zignuts](https://zignuts.com/blog/n8n-vs-zapier-2026-comparison), [FuturePicker](https://futurepicker.com/en/n8n-vs-zapier-2026-en/)) | RDD already operates in the n8n/Make class; CRM webhook → review SMS / post-queue seam is a handful of workflows |
| Review platform (buy) | NiceJob · Birdeye · Podium | NiceJob from ~$75/mo; Birdeye ~$299–449/location/mo; Podium ~$399–599/mo ([Authencio](https://www.authencio.com/blog/nicejob-pricing-is-it-the-best-value-reputation-tool), [Replifast Podium pricing](https://www.replifast.com/blog/podium-pricing-2026), [TrueReview comparison](https://www.truereview.co/post/birdeye-vs-podium-vs-nicejob-vs-truereview-an-honest-comparison), [WiserNotify](https://wisernotify.com/blog/podium-alternatives/)) | Podium/Birdeye are multi-location suites — overkill at Mammoth's scale per the comparison literature |
| Review engine (build) | CRM-native: completion event → SMS/email w/ Google link | Marginal (SMS provider + existing CRM) | The differentiated option — see Fork 4 |
| AI-assist posture | Caption drafting, review-reply drafts, timelapse cuts | Included in above tools' AI tiers | Draft-only; a human (RDD or Michael) approves everything outbound. Never auto-publish AI content on a brand this personal |

### 2f. How established metal-building brands run social (observed examples)

- **Morton Buildings** (the category gold standard): ~243K Facebook likes, ~31K Instagram
  followers; a YouTube channel running since ~2013 built on **finished-building tours** (customer
  walk-throughs, foreman interviews, planning guides) — proof-of-craft video as evergreen search
  collateral ([Morton Facebook](https://www.facebook.com/MortonBuildings/),
  [Morton Instagram](https://www.instagram.com/mortonbuildings/),
  [Morton YouTube](https://www.youtube.com/channel/UCEwp7Wg1hyzgs08Jj6zgZQw)). Notably Morton also
  runs **per-location Facebook pages** (e.g. Norton MA) — local pages for local trust
  ([example](https://www.facebook.com/mortonbuildingsnorton/)).
- **Nucor Buildings Group / Nucor Building Systems:** corporate FB + a YouTube channel of product
  and project videos aimed at its builder network — B2B posture, brand-awareness over lead-gen
  ([Nucor Buildings Group FB](https://www.facebook.com/nucorbuildingsgroup/),
  [Nucor Building Systems YouTube](https://www.youtube.com/user/nucorbuildingsystems)).
- **Nucor Corporation:** ~20K IG followers, safety/culture/people content — employer brand, not
  lead-gen ([Nucor IG](https://www.instagram.com/nucorcorporation/)).
- **Pattern:** the manufacturers (Nucor/Butler class) run *brand* social; the **dealer/builder
  tier — where Mammoth sits — wins on local project proof**, exactly the before/after +
  tour + review formats above. Morton, the one vertically-integrated builder in the set, is the
  model to imitate at regional scale: project tours + local pages + planning education (which
  Mammoth's resource hub already produces in written form — ready-made video scripts).

---

## 3. Recommendation (argued, not decided)

**The service is "proof-to-pipeline," not "social media management."** Concretely:

1. **Fix the free stuff first (weeks 0–2):** claim/complete the Google Business Profile (services,
   service areas across the CO/WY footprint, photos from the existing gallery), link all profiles
   from the site footer, seed GBP with the project gallery. Highest evidence-backed ROI, near-zero
   effort.
2. **Stand up the review engine on the CRM's completion event (weeks 1–4):** Satisfied
   Installation → consented SMS+email with direct Google review link → RDD responds to every
   review → best quotes become social posts. This compounds: reviews drive Map Pack rank, which
   drives the inbound leads the CRM attributes.
3. **Run the photo→post pipeline as a weekly batch (ongoing):** crew shot-list SOP feeding
   `BuildPhoto` → RDD curates/brands/schedules ~5–8 units/week to FB + IG + GBP → one timelapse
   Reel per finished flagship build/month → cross-post video to a YouTube channel as the evergreen
   archive (Morton pattern).
4. **Defer LinkedIn and TikTok** until the core engine demonstrates cost-per-customer beats the
   ~$2.50/purchased-lead baseline on *closed* business, then open LinkedIn only if commercial-lane
   Opportunities justify it.
5. **Report in CRM terms** (structurewebworks lesson): leads by source, review count/rating
   velocity, cost per customer vs purchased lists — never follower counts.

## 4. OPEN FORKS — operator decisions required

| # | Fork | Options | Argument sketch | Default lean |
| --- | --- | --- | --- | --- |
| 1 | **Platform priority** | (a) GBP-first, FB/IG second, YouTube archive, defer TikTok/LinkedIn · (b) FB/IG-first (double down on existing) · (c) video-first (YouTube/Reels) | Evidence (§2a) says discovery is Google+Maps and reviews decide; (b) reinforces what exists but ignores the highest-ROI gap; (c) has the best organic ceiling but the highest production floor | (a) |
| 2 | **Who posts** | (a) RDD-managed (Michael approves batches weekly) · (b) Michael posts, RDD supplies queue+templates · (c) hybrid: RDD runs GBP+reviews, Michael runs FB/IG voice | Michael is "pulled in many directions" (his own notes) — owner-posted programs die at week 3; but his voice is the brand's soul-of-sales asset. (c) risks the FB/IG lane going quiet | (a), with Michael's voice captured via a 15-min weekly photo/context handoff |
| 3 | **Scheduler** | (a) Metricool (free tier→paid; GBP + analytics in one) · (b) Buffer (simplest, cheapest per channel) · (c) Publer/Later | All adequate at this scale (§2e); Metricool's free tier covering GBP + competitor analytics fits the client-managed-account posture; Buffer wins on simplicity if RDD standardizes across future clients | (a) |
| 4 | **Review tool: buy vs CRM-native build** | (a) CRM-native: completion event → SMS/email via automation seam · (b) buy NiceJob-class (~$75/mo list) · (c) buy Podium/Birdeye-class | (a) is the moat play — review automation keyed on *Satisfied Installation* is a feature no off-the-shelf tool has, becomes a kernel feature-module (leads/CRM library) resellable to every future RDD client; (b) is fastest to live; (c) is overpriced for single-location per the comparison literature | (a), with (b) as a bridge only if the CRM seam is >a quarter out |
| 5 | **Budget tier** | (a) lean: schedule+review seam, ~2–3 posts/wk · (b) standard: full cadence (§2b) + monthly timelapse · (c) growth: standard + paid FB local ads + LinkedIn commercial lane | Operator doctrine is retainer + hourly; tier sets the hours. (b) matches the sourced cadence norms; (c) only once organic baseline exists to measure paid lift against | (b) |
| 6 | *(minor)* **YouTube now or later** | (a) create channel at launch as cross-post archive · (b) wait for 3+ timelapses in hand | (a) costs nothing and accrues search equity; (b) avoids an empty channel | (a) |

## 5. Residual gaps / honesty notes

- Could not verify the Mammoth Facebook/Instagram pages' actual post history (Meta blocks
  unauthenticated fetch) — recommendation assumes they are young/low-volume based on the
  new-format page ID and absent from search results; verify at engagement kickoff.
- No GBP was found linked from the site; whether an unclaimed/unlinked profile *exists* for
  "Mammoth Metal Buildings" needs a Maps check at kickoff before "claim" vs "create."
- Cadence/conversion figures are vendor-and-agency-published aggregates (typical for this space,
  flagged per-claim above); treat them as directionally solid, not lab-grade.
- Multi-state footprint (CO/WY/WA builds observed) raises a GBP service-area question (single
  profile w/ service areas vs future per-location pages, the Morton pattern) — surfaced in the
  playbook as a setup-phase question for Michael, not decided here.
