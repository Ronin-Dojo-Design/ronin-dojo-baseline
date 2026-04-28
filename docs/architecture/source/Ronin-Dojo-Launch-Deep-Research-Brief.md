# Ronin Dojo Launch Deep Research Brief

## Executive findings

The repo’s operating rituals are clear: bow-in starts by reading the latest `SESSION` file and the program plan, and bow-out is not complete until the active `SESSION` file is updated with what landed, blockers, and the next-session goal. That matters here because the research already in-repo is not hypothetical anymore: `SESSION_0019` produced a Dirstarter docs inventory, a gap audit, and a cache risk register, while `SESSION_0020` produced a substantial schema expansion draft that is still marked `draft-for-review`, not implemented or signed off. fileciteturn9file0 fileciteturn10file0 fileciteturn11file0 fileciteturn12file0 fileciteturn18file0

The most important conclusion is that the repo now has a **strong design direction** but not yet a **launch-ready execution state**. The original program plan targeted a twelve-sprint MVP culminating in a Baseline Martial Arts public launch first, with other brands after MVP. The newer launch document explicitly supersedes that and sets a hard all-brands target for May 18, 2026, while also estimating roughly **30–42 days of work** against **20 calendar days**. The gap between plan and date is therefore structural, not cosmetic. fileciteturn23file0 fileciteturn13file0

Dirstarter remains the correct first baseline. Live Dirstarter docs now present a coherent reference stack around Next.js 16, Prisma, Better Auth, Tailwind v4, modular server feature folders, Stripe, S3-compatible storage, Plausible analytics, and Vercel-oriented deployment and cron workflows. That baseline is strong for architecture and code organization, but it is a **directory starter**, not a martial-arts operating system. The Ronin platform therefore has to keep building from Dirstarter while extending it significantly in the backend for scheduling, attendance, promotions, billing, family accounts, tournament operations, white-label site generation, and branded launch operations. citeturn1view0turn9view2turn9view3turn9view0turn2view3turn2view4turn2view5turn8view1turn8view3

My recommendation is an **Option A-plus launch interpretation**: all brands go publicly live on May 18, but with differentiated depth. Baseline should be the most complete operational brand; Black Belt Legacy should prioritize migration-critical and community-critical flows; WEKAF should launch with real registration and bracket visibility but not a full long-tail tournament rules engine; Ronin Dojo Design should launch with assisted white-label sales and onboarding rather than a fully self-serve wizard unless that wizard is simplified aggressively. That interpretation is the only one that respects both the promise and the repo’s actual state. fileciteturn13file0 fileciteturn18file0

## Dirstarter as the baseline

Live Dirstarter docs currently expose a stable documentation surface across Setup, Codebase, Integrations, Features, Others, and Database/Deployment. The main introduction page describes Dirstarter as a Next.js 16 App Router and TypeScript boilerplate, and the project-structure page confirms its modular architecture with feature-oriented `server/admin/*` and `server/web/*` folders. That part maps cleanly to how the Ronin baseline should continue organizing backend domains. citeturn1view0turn9view2

Dirstarter’s live baseline is especially useful in six areas. First, authentication: it uses Better Auth, with route protection, role separation, and the `nextCookies` plugin shown in the docs. Second, data: Prisma is the ORM with `prisma/schema.prisma`, `prisma/seed.ts`, and `services/db.ts` as the expected backbone. Third, environment discipline: the docs stress `.env` hygiene and type-safe validation. Fourth, formatting and editor setup: OXC, not ESLint/Biome, is the documented lint/format tooling. Fifth, frontend theming: Tailwind CSS v4 plus Radix and shadcn/ui. Sixth, platform integrations: Resend for email, Stripe for payments, Amazon S3 or compatible storage, Redis-based rate limiting, and Plausible analytics. citeturn9view0turn9view3turn8view4turn2view3turn9view1turn6view6turn8view1turn6view7turn6view9turn6view10

One subtle but important live-doc drift surfaced during this audit: the sidebar labels still say **Content Management** and **Search Engine Optimization**, but the live pages resolve to `/docs/content` and `/docs/seo`, not the older longer slugs. The repo’s Dirstarter inventory page still records the older `/docs/content-management` and `/docs/search-engine-optimization` links. For JETTY 3.0 wiki work, that means backlinking should use the **live canonical paths**, or at minimum store both the repo snapshot link and the live canonical link to avoid stale references. citeturn1view0turn5view0turn5view1 fileciteturn11file0

The repo has already noticed several real Dirstarter drifts. The in-repo gap audit says the live docs describe Better Auth plus `oRPC` middleware and a `REDIS_URL` pattern, while the repo uses `next-safe-action`, Upstash REST variables, and a different cache configuration story. It also flags that the live docs show `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` while the repo’s env story is not aligned, and that the repo still has an internal conflict on admin auth behavior. Those are not theoretical polish items; they are exactly the kind of baseline mismatches that can silently compound during a compressed launch. fileciteturn12file0 citeturn9view0turn6view10turn6view9

The cache decision is also not closed. The repo’s ADR for cache strategy is currently `proposed`, not `accepted`, and the cache risk register says public-only caching may proceed later while auth-variant and private data should stay conservative until isolation tests exist. That caution is reinforced by the official Next.js docs: `use cache` now lives under `cacheComponents`, cache keys include serialized arguments and captured outer-scope variables, and `'use cache: private'` is explicitly marked experimental and “not recommended for production.” For this launch window, the repo should keep the current conservative line: **public shared data only** for any new cache work, and no production dependency on `'use cache: private'`. fileciteturn20file0 fileciteturn21file0 citeturn21search0turn21search1turn21search2turn21search3

## Repo reality against the plan

The current repo state is best understood as **S1–S5 foundation plus design documents for the next major backend expansion**. The Prisma schema already contains the identity shell, organizations and disciplines, rank systems and ranks, memberships and role assignments, rank awards, courses and curriculum, tournaments and divisions and registrations, gamification, style hierarchy, subscriptions, lineage, waivers, certifications, and a content engine. In other words, the baseline already covers a real martial-arts identity/membership/tournament substrate rather than a vanilla directory app. fileciteturn19file0

At the same time, the launch-critical expansion work is mostly still design-side. The `S2 Schema Additions` draft proposes **33 new models** and **25 new enums** in total, covering programs, schedules, class sessions, check-ins, attendance, belt testing, family groups, invoicing, Stripe Connect, promo codes, contracts, notifications, org relationships, org settings, invites, generic events, bracket execution, fight records, and audit logging. The sign-off checklist at the bottom is still unchecked, and the document explicitly says it becomes the implementation spec “once signed off.” That is the clearest evidence that the platform’s next backend wave is planned in detail but not yet landed. fileciteturn18file0

Against the likely `SESSION_0020` task set, the repo reads as follows. **Schema reconciliation** is well underway, but only as design. **Per-brand launch strategy** exists as an options memo in the launch document, but not as an approved decision. **Sprint replanning** exists at a high level, but not as an execution board. **Parallel workstream definition** is suggested, not operationalized. **Cache strategy finalization** is explicitly still pending. In short: the repo has excellent research and decision artifacts, but several of the actual management decisions needed to compress the launch are still open. fileciteturn13file0 fileciteturn18file0 fileciteturn20file0

There is one more important delta: the original program plan assumed **Baseline Martial Arts first**, with Ronin Dojo Design, BBL, and WEKAF cascading later. The new launch document reverses the risk profile by insisting on all brands in the same window. That does not invalidate the original architecture, but it does invalidate the original sequencing assumptions. The right response is not to throw away the architecture. It is to redefine “launch-complete” per brand, while keeping the shared backend generic and multi-brand from the start. fileciteturn23file0 fileciteturn13file0

## Competitor requirements to beat

On the school-management side, PushPress has the clearest martial-arts operator framing. Its official martial-arts pages emphasize member management, billing, scheduling, belt promotions, family billing structures, branded member apps, digital waivers and contracts, lead nurturing, capacity limits and waitlists, and reporting. That means the Ronin backend cannot stop at organizations, memberships, and courses; it must expose durable primitives for **programs, recurring classes, enrollments, family accounts, payments, waivers/contracts, lead pipelines, retention signals, and reporting-ready attendance histories**. citeturn16view0

Wodify reinforces the same shape but adds several edges that matter. Its martial-arts solution highlights family management under one guardian account, automated belt and rank progression using attendance and skill mastery requirements, mobile/in-studio content libraries, mobile product selling rolled into upcoming invoices, lead conversion tooling, event and seminar registration with waiver signing, and a multi-location control model. That implies Ronin needs strong support for **guardian-led household accounts, configurable promotion rules, curriculum/media entitlements, invoice composition, events/seminars as first-class objects, and multi-org or multi-location administrative scopes**. citeturn17view0turn17view1turn19view0turn19view1turn19view2

For the “ZenDesk” portion of your request, the direct martial-arts management product that surfaced in the official scan was **Zen Planner**, not Zendesk. Zen Planner’s martial-arts positioning centers on belt-progress tracking, family memberships, automated payments and revenue recovery, class scheduling, app-based check-ins, shared curriculums, reporting dashboards, marketing automation, branded mobile apps, and retention tooling. In practical terms, that means the Ronin platform has to treat **curriculum access, class bookings, payment recovery, family lifecycle, branded app surfaces, and CRM-grade communications** as core backend concerns rather than add-ons. citeturn12search0turn17view4turn17view6turn17view7turn20view0turn20view4turn20view5turn20view6turn20view7

On the tournament side, Kihapp is notable because it positions itself as fully online tournament software for martial artists with registration, payments, brackets, and results, and its own “about” page says it supports a wide spread of martial arts including BJJ, Filipino Martial Arts, Taekwondo, Karate, Kickboxing, and Judo, with no-install browser access and large historical registration volume. That validates your instinct that WEKAF cannot be modeled as a narrow one-sport tournament tool. The backend has to be modular enough for art-specific entries, rule variations, and organization-specific tournament setup. citeturn18view1turn18view0

Smoothcomp shows what “serious tournament software” looks like in practice. Its official knowledge base documents multiple bracket types including single elimination, double elimination, round robin, best-of-three, and multistage formats; repechage choices inside double elimination; batch bracket creation with reusable bracket packages; automatic academy/team separation in bracket generation; in-app registration; notifications; and live countdown through the mobile app. That means Ronin’s tournament backend should not stop at `Tournament`, `Division`, `Registration`, and `RegistrationEntry`. It needs **bracket packages, seeding strategies, anti-same-team separation rules, schedule/mat assignment, results publication, and event-facing/mobile-facing notification primitives** if WEKAF is meant to feel competitive. citeturn18view2turn18view3turn18view4

BJJBuddy represents the smaller but still important consumer expectation at the athlete level. Its App Store listing centers on rolling/submission/tap tracking, notes, charts, training analysis, video recommendations based on stats, social sharing, and HealthKit integration. The opportunity for Ronin is obvious: beat BJJBuddy not by copying its journal in isolation, but by making the athlete record **contextual**. A Ronin user should be able to see training notes, attendance, coach feedback, curriculum completion, belt progression, seminar participation, event registration, match history, and health/fitness integrations in one system rather than one journal app plus several academy tools. citeturn18view5

## Backend schema and data logic priorities

The best part of the repo is that it already points in the right direction. The current schema proves the project is not starting from zero, and the `S2 Schema Additions` draft captures most of the school-operations expansion needed to compete with PushPress, Wodify, and Zen Planner. In particular, the proposed `Program`, `ProgramEnrollment`, `ClassSchedule`, `ClassSession`, `CheckIn`, `Attendance`, `FamilyGroup`, `FamilyMember`, `PricingPlan`, `Invoice`, `Payment`, `MembershipContract`, `NotificationPreference`, `Announcement`, `StripeAccount`, `OrgRelationship`, and `OrgSettings` models are exactly the kinds of backend primitives those competitors implicitly require. fileciteturn18file0 citeturn16view0turn17view0turn17view1turn17view6turn20view2

The same is true on the tournament side. The proposed `Bracket`, `Match`, `MatchCompetitor`, `Invite`, `Event`, `EventRegistration`, `FightRecord`, and `AuditLog` additions move the repo much closer to what Kihapp and Smoothcomp demonstrate in production. They create a credible path from registration into actual bracket execution and athlete history, instead of stopping at a registration shell. fileciteturn18file0 citeturn18view0turn18view2turn18view3turn18view4

The main issue is not direction. It is **coverage completeness** relative to your full product promise. The launch memo and the schema-needs manifest still call out white-label `Sites`, `Templates`, `Client intake`, `Onboarding wizard state`, and sales/demo preview configuration as missing for Ronin Dojo Design. My reading of the current `S2 Schema Additions` draft is that it deeply strengthens school operations and tournament execution, but it does **not** yet add first-class `Site`, `Template`, `Client`, `Lead`, `OnboardingSession`, or `DemoEnvironment` models. That is why P4 remains the least ready brand in the repo’s own launch assessment. fileciteturn17file0 fileciteturn13file0 fileciteturn18file0

There is also a second under-modeled area: the **competition rules engine**. Your schema manifest explicitly asks for varied rule sets, divisions, weight categories, scoring systems, bracket types, referee/judge courses, volunteer courses, and fight records across many combat sports. Smoothcomp and Kihapp show that real tournament software distinguishes bracket logic, scoreboards, category values, and registration periods very explicitly. The current schema draft gets closer through bracket entities plus flexible JSON fields such as `scoreData`, but it still reads more like a strong competition core than a full first-class rules/configuration engine. My inference is that Ronin still needs explicit models for something like `RuleSet`, `ScoringTemplate`, `WeighInRecord`, `OfficialAssignment`, and `RankingSeries` if WEKAF is supposed to become a reusable tournament platform rather than just a single event system. fileciteturn17file0 fileciteturn18file0 citeturn18view2turn18view3turn18view4

The migration order should therefore be compressed into three backend waves, not one giant schema dump. The first wave should be school operations: programs, schedules, sessions, attendance, family accounts, contracts, billing, waivers, notifications, and org settings. The second wave should be promotions and curriculum depth: belt testing, prerequisite configs, class instructor assignments, program-course mapping, and member-facing curriculum delivery. The third wave should be event and tournament execution: events, invitations, brackets, matches, fight records, audit logs, rules/configuration extensions, and only then white-label sales/onboarding. That order matches both the competitor realities and the repo’s own Baseline-first architecture. fileciteturn23file0 fileciteturn18file0 citeturn16view0turn17view0turn20view2turn18view2turn18view3

A practical data-logic spine for the product should look like this:

```text
Lead
  -> User
  -> Passport
  -> FamilyGroup
  -> WaiverSignature + MembershipContract
  -> ProgramEnrollment
  -> ClassSession Booking
  -> CheckIn
  -> Attendance
  -> Curriculum / Program progress
  -> BeltTestEligibility
  -> RankAward
  -> EventRegistration
  -> Tournament RegistrationEntry
  -> Match history / FightRecord
  -> Retention, billing, and coaching insights
```

That spine is not speculative; it is the minimum unification layer implied by the repo’s schema draft and by the market leaders’ combined feature sets. fileciteturn18file0 citeturn16view0turn17view0turn17view6turn18view5

## Launch operating model

The launch should be managed as a **multi-lane implementation program**, with Petey orchestrating, Giddy handling architecture and GitHub strategy, Desi handling design contract reviews, Brandon owning brand/marketing rollout, Doug owning QA readiness, and Cody serving as implementation reviewer and code-quality gate. Since you said these personas are not coding in this phase, their role is to produce constraints, sequencing, acceptance criteria, and review questions that implementation can follow in `SESSION_0021` and onward.

**Petey** should lock the operating truth: Dirstarter is L1 baseline, the repo’s launch memo is the current schedule pressure, and the schema manifest is the product-scope ceiling. Petey’s immediate output should be a short signed-off launch definition per brand, because the current repo still contains an unresolved tension between “all brands by May 18” and “20 days is not enough for the full scope.” fileciteturn23file0 fileciteturn13file0 fileciteturn17file0

**Giddy** should formalize workstream boundaries and keep the repo from mixing design, schema, white-label, and tournament changes in one branch. The clean split is five worktrees: `dirstarter-compliance`, `school-ops-core`, `tournament-engine`, `brand-content-launch`, and `bbl-migration`. That split follows the repo’s own layer model and keeps the hardest merge conflicts away from the Prisma/schema center. fileciteturn23file0 fileciteturn18file0

**Desi** should treat frontend as “mostly done” only in the sense the user requested: the front-end MVPs are references, not proof of launch readiness. Her job is to verify that each important screen has the backend contracts it actually needs: class bookings, family switching, promotion timelines, curriculum access, event purchase flows, weigh-ins, brackets, athlete profiles, and branded sales pages. Dirstarter’s theming and modular route structure support that approach, but the contract review must happen before implementation starts closing tickets. citeturn9view1turn9view2 fileciteturn18file0

**Brandon** should run a launch narrative that is synchronized with actual feature completeness. The product pages for Wodify, PushPress, and Zen Planner all sell clarity, retention, and simplicity more than pure feature lists. Brandon should therefore position Baseline around “student journey,” BBL around “legacy and lineage,” WEKAF around “competition operations,” and Ronin Dojo Design around “launch-ready white-label martial arts infrastructure.” That messaging should not promise self-serve site generation on day one unless the sales workflow truly lands. citeturn16view0turn17view0turn17view4turn20view4turn20view6

**Doug** should focus on failure modes, not screenshots. The highest-risk boundaries are brand isolation, auth consistency, family billing correctness, promotion logic, tournament bracket correctness, rules/scoring configuration, cache isolation, and migration integrity. The repo’s cache risk register already names auth-sensitive caching as a major risk area, so Doug’s QA board should explicitly separate “public-cache safe” from “viewer-sensitive / user-private” read paths. fileciteturn21file0 fileciteturn20file0 citeturn21search1turn21search2

**Cody** should act as a gatekeeper for implementation standards: no route-level hacks to compensate for missing schema, no white-label wizard before core data entities exist, no tournament UI without bracket execution primitives, no cache rollout beyond public data, and no launch-page claims without matching backend capability. The repo already has enough planning material to justify strict review during implementation. fileciteturn18file0 fileciteturn13file0

The compressed launch board below is the most realistic ASCII Kanban I can justify from the repo and market evidence:

```text
BACKLOG
  - White-label self-serve wizard
  - Full multi-sport rules engine
  - Deep scoring/referee workflows
  - App-level BJJBuddy-plus analytics

NOW
  - Dirstarter compliance refresh
  - School ops schema wave
  - Auth/env/cache decision cleanup
  - Brand launch definitions

NEXT
  - Schedules / attendance / family billing
  - Belt testing / curriculum mapping
  - Event registration / invitations
  - BBL migration rehearsal

READY FOR LAUNCH
  - Baseline core member lifecycle
  - BBL public launch + migration-safe profile/community flows
  - WEKAF public event registration + brackets visibility
  - Ronin Dojo Design branded funnel + assisted onboarding

POST-LAUNCH
  - Full self-serve white-label templating
  - Advanced competition rulesets and scoring
  - Deeper mobile athlete intelligence
  - Cross-brand analytics and automation
```

That board is the cleanest way to honor the hard date without pretending every advanced capability can land before launch. fileciteturn13file0 fileciteturn18file0 citeturn16view0turn17view0turn18view2turn18view5

## Bow-out and next-session intent

The closing ritual says the active session should capture what landed, blockers, and the next-session goal, and it explicitly requires a clear “Next session” entry so the next bow-in is cheap. Since this environment only exposed read/search/fetch access and not write access to the selected GitHub repo, no direct wiki edits or `SESSION_0020` edits were made here. But the next-session intent is now clear enough to write immediately. fileciteturn10file0

**Recommended `SESSION_0021` goal:** implement the first launch-blocking backend wave from the `S2 Schema Additions` draft, beginning with `Program`, `ProgramEnrollment`, `ClassSchedule`, `ClassSession`, `CheckIn`, `Attendance`, `FamilyGroup`, `FamilyMember`, `PricingPlan`, `Invoice`, `Payment`, and `MembershipContract`, while also fixing the Dirstarter compliance/documentation mismatches around auth config, env variable docs, and live Dirstarter canonical links. That is the highest-leverage move because it closes the biggest gap between repo design and the feature floor established by PushPress, Wodify, and Zen Planner. fileciteturn18file0 fileciteturn12file0 citeturn9view0turn8view4turn16view0turn17view0turn17view6

**Recommended first task inside `SESSION_0021`:** freeze the school-operations model names and relations, then implement the migration before any additional UI or marketing work. If schema freeze slips, every downstream lane—branding, BBL migration, tournament registration, and app-facing progress features—keeps drifting. The repo’s own launch memo and the draft schema spec already support that sequencing. fileciteturn13file0 fileciteturn18file0

A short bow-out line, following the ritual, would therefore read like this: **“Bowed out — research and launch framing are complete. Next session goal: land Launch Wave A schema and Dirstarter compliance fixes so implementation can proceed on stable backend contracts.”** That is faithful to the repo’s opening/closing system and to the actual state of the work. fileciteturn9file0 fileciteturn10file0

## Open questions and limitations

The biggest open product question is not technical. It is definitional: what exactly counts as “100%” for Black Belt Legacy and “launched” for the other brands on May 18? The repo currently documents options and risks, but not a signed launch-definition matrix per brand. Until that is locked, implementation can still optimize the wrong things. fileciteturn13file0

The biggest open schema question is whether Ronin Dojo Design’s white-label sales/onboarding system needs to be truly self-serve at launch. The schema-needs manifest says yes at the idea level, but the current schema expansion draft does not yet model first-class sites, templates, client intake, or onboarding sessions. If those are truly day-one requirements, they belong in the next schema wave rather than in a “later” bucket. fileciteturn17file0 fileciteturn18file0

The biggest tournament-design question is how formal you want the rules engine to become before launch. Kihapp and Smoothcomp prove there is real value in first-class bracket packages, sport-specific configuration, registration periods, weight handling, and live event/mobile operations. The current draft is strong, but it still looks closer to a flexible tournament core than a complete cross-sport competition operating system. citeturn18view0turn18view2turn18view3turn18view4 fileciteturn18file0

Two practical limitations also matter. First, no direct repo wiki or session-file edits were possible from the available GitHub tool surface in this environment. Second, I did **not** reproduce Dirstarter docs verbatim in full, because that would exceed safe quotation limits; instead, I used short anchors, live-path verification, and repo-to-doc mapping. For the actual wiki refresh, the right move is a JETTY 3.0 page-per-topic summary with canonical backlinks to the live Dirstarter pages, not a raw mirrored dump. citeturn1view0turn5view0turn5view1 fileciteturn11file0