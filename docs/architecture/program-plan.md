---
title: Program Plan
slug: program-plan
type: file
status: active
created: 2026-04-25
updated: 2026-04-26
last_agent: copilot-session-0006
health: 7
pairs_with:
  - docs/architecture/plan-vs-current.md
  - docs/architecture/s1-schema-design.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Program plan — Ronin Dojo platform rebuild

A real plan we can review together, edit, and execute against. Built to address four threads:

1. **Layered architecture** — what's the source of truth for code vs. data behavior vs. UI/UX
2. **Brand sequencing** — which brand gets built first and why
3. **12-sprint MVP** — week-by-week scope to get from today to a Baseline Martial Arts public launch
4. **Agent / protocol system triage** — what to bring forward from the legacy `RoninDashboard/`, what to rework, what to drop

Status: **draft for review.** Don't execute against it until we sign it off.

---

## 1. Layered architecture

The rebuild is **four layers**, each with its own source of truth. The layers are intentionally separate so we can change one without rewriting another.

| Layer | Source of truth | Authority |
|---|---|---|
| **L1 — Code patterns** | [Dirstarter](https://github.com/dirstarter/dirstarter) (Polarsoft template; copied into `apps/web/` at upstream `c42e8bb` — see `apps/web/.dirstarter-upstream`) | How files are organized; framework choices (Next.js + Prisma + Better-Auth + Bun); HOC patterns; action client chain; content collections; env config |
| **L2 — Data & behavioral spec** | [ChatGPT plan](source/chatgpt-original-plan.md) (sections 1–7) | What the system DOES: Passport + Shells, Org × Discipline × Membership, RankSystem per discipline, Tournament/Division/Registration with rank snapshots, Directory privacy, lifecycle states |
| **L3 — Multi-tenant** | Our addition ([ADR 0004](decisions/0004-multi-brand-as-column.md), [0006](decisions/0006-multi-domain-hosting.md), [0008](decisions/0008-brand-switcher.md)) | `brand` column on tenant-scoped tables; host→brand middleware; per-brand themes |
| **L4 — UX, content, theming** | TuffBuffs / BBL / WEKAF legacy frontends in [Ronin-Dojo-Design/ronin-dojo-monorepo](https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo) (paths `src/` and `wordpress/<brand>-theme/`) | Visual design tokens, branded copy, screen layouts, component idioms — ported on top of the new APIs |

**Critical rule:** these layers don't bleed into each other. We don't import legacy backend code. We don't put UI assumptions into the schema. We don't let Dirstarter's "tool directory" defaults drive the data model.

---

## 2. Which brand first

You raised the question: start with **Ronin Dojo Design** as a clean greenfield, or use **TuffBuffs (becoming Baseline Martial Arts)** as the foundation since it has the richest features (styles, curriculum, gamification, tournaments)?

**Recommendation:** **Build the foundation brand-agnostic, then make Baseline Martial Arts the first brand we expose to users.**

- TuffBuffs is the most behaviorally complete reference. We use it as the **"this is what done looks like"** cross-check, but we don't build *on top of* it. It keeps running on the legacy stack at tuffbuffs.com per [ADR 0005](decisions/0005-legacy-coexistence.md).
- The new build's foundation is **brand-aware from day one** but generic — every feature works for any brand because `brand` is a column, not a code path.
- **Baseline Martial Arts** becomes the first brand wired up because (a) zero existing users, so no migration risk, (b) we can lift TuffBuffs' UI/content as the visual reference, (c) it's a near-replica behaviorally so we exercise the full feature set.
- **Ronin Dojo Design** is the umbrella/admin domain — second priority. It hosts cross-brand admin tools, agency-style admin onboarding, the brand switcher's natural home. Smaller surface area; comes later.
- **BBL** ports third — port its UI on top of the working APIs, then plan its data migration ([ADR 0007](decisions/0007-bbl-migration.md)).
- **WEKAF** ports last — full greenfield rework since it has no users.

This way TuffBuffs is the **functional reference** for what Baseline must do, but we don't entangle the new build with the legacy stack.

### Why not start with Ronin Dojo Design as the "clean room"

It's tempting because there's no legacy to compare against. But that's the problem — you'd build features without a real-world cross-check, and discover gaps when you start porting BBL/WEKAF later. Better to pick a brand whose feature set we *already understand well* (TuffBuffs/Baseline) and let it stress-test the architecture.

---

## 3. 12-sprint MVP plan

One week per sprint, ~3 months from today (2026-04-25) to a Baseline Martial Arts public launch. Each sprint has one major deliverable + supporting work.

| Sprint | Major deliverable | Notes |
|---|---|---|
| **S1** ✅ | Phase 1 schema rev: rename `Style→Discipline`, `School→Organization`, `Profile→Passport`; add `RankSystem`, `Rank` (replacing `Belt`), `DirectoryProfile`, `MembershipRoleAssignment`; expand `Membership` with `disciplineId` + `status` enum; reshape `Tournament` into `Tournament + TournamentDiscipline + Division + Registration + RegistrationEntry`. Added `isSystem` + `brand` extensibility to Discipline/RankSystem/Rank. | Done — 31 models, all enums, seed data loaded (12 disciplines, 13 rank systems, 194 ranks). Sessions 0003–0005. |
| **S2** ✅ | Better-Auth + Passport bootstrap | Sign-up creates `User + Passport + DirectoryProfile` stubs. `/me` route renders the Passport editor. Brand cookie wired through middleware. Session 0007. |
| **S3** ✅ | Organization create + join flow | Create org (DOJO/LEAGUE/SCHOOL/CLUB) + owner ACTIVE membership + discipline links. Join button creates PENDING membership. Pages: list, create, detail. Smoke-tested SESSION_0013. **Deferred to future sprint:** invite link flow, multi-role assignment UI, status lifecycle transitions, address field expansion. Sessions 0008–0013. |
| **S4** | Directory search with privacy | List view honoring `DirectoryProfile.visibility` and per-field flags. Filters by org/discipline/rank/location. **Plan Milestone 1 ✅** |
| **S5** ✅ | RankSystem + Rank seed data | Done — pulled forward into S1. 12 disciplines, 13 rank systems, 194 ranks seeded. Admin UI to add new rank systems deferred to future sprint. |
| **S6** | Course + CurriculumItem CRUD | Instructors author courses tied to (Organization × Discipline × certificationType: BELT_RANK / SAFETY / COACH). MDX or rich-text notes; image/video uploads via S3. |
| **S7** | Progress awarding + gamification ledger | Instructor → student belt promotion flow. `GamificationEvent` ledger with point values. Level/badge computation as derived views. Resend email on promotion. |
| **S8** | Tournament create wizard | Draft → Published lifecycle. Add `TournamentDiscipline`s. Define `Division`s with format/age/weight/rank/gender constraints. |
| **S9** | Registration + RegistrationEntry with snapshots | User picks tournament → eligible divisions filtered by their current rank → submit creates Registration + Entries with `snapshot_rank_name` + `snapshot_org_name`. Idempotency key on submit. Audit log for staff review. |
| **S10** | Payments + capacity + waitlist | Stripe wiring for division fees. Capacity enforcement; auto-waitlist when full. Refund flow. **Plan Milestone 2 ✅** |
| **S11** | Baseline Martial Arts brand rollout | Theme tokens (colors/logos/copy), branded marketing pages, onboarding microcopy, port relevant TuffBuffs UI components onto the new APIs. Custom domain config in Vercel. |
| **S12** | Ronin Bar UI shell + Vercel/Neon staging deploy | Compact/full mode with traffic-light buttons, ⌘K command palette, context dropdown (Org/Tournament/Admin), notifications. Deploy to staging on Vercel + Neon. Smoke-test full flows end-to-end. |

**After S12 (post-MVP):**
- Per-brand rollout #2: Ronin Dojo Design (admin/umbrella)
- Per-brand rollout #3: BBL with one-time data migration ([ADR 0007](decisions/0007-bbl-migration.md))
- Per-brand rollout #4: WEKAF greenfield rebuild
- `apps/mobile/` Expo app
- Production launch

**Slip protection:** if any sprint runs over, the natural cut is to defer S11 (Baseline rollout) into S13 — i.e., build the Identity + Membership Shells + Tournament foundations first, then pretty up. Don't compromise the Phase 1/2 substrate to hit a brand launch date.

---

## 4. Agent / protocol system — bring forward, rework, or drop?

The legacy `RoninDashboard/` system is mature: 6 personas, 10+ protocol loops, versioned rituals up to v4.5, and 14 Petey session prompts spanning sessions 606–619. That's real operational ROI we shouldn't blanket-discard. But it was tuned for a multi-brand WP+React+Pods+REST stack — some of it doesn't map cleanly onto the new foundation.

Triage in three buckets:

### Bucket A — Bring forward (with refresh)

These deliver value on any project; carry over with version bumps to v5.0 to mark the new context.

- **`opening_v4.5.md` → `opening_v5.0.md`** (bow in ritual). Keep structure, re-tune to reflect new stack: Dirstarter conventions, Postgres/Prisma instead of MySQL/Pods, ChatGPT plan as behavioral spec, plan-vs-current.md as reference.
- **`closing_v4.5.md` → `closing_v5.0.md`** (bow out ritual). Same — carry forward, refresh to reference new doc paths and stack.
- **`CHAT_HANDOFF.md`** protocol. Slim it down — the new project benefits from session continuity, but the legacy version was tightly coupled to the old `RoninDashboard/sprints/active/` structure. Rewrite leaner.
- **Petey persona** — orchestrator/planner. Universally useful. Bring forward, retune the prompt to reference new stack.
- **Cody persona** — coder/builder. Universally useful. Bring forward.

### Bucket B — Rework

Worth keeping, but the v4.x shape was specific to the legacy stack and needs rethinking for the new one.

- **`WORKFLOW_4.4.md` → `WORKFLOW_5.0.md`** Petey orchestration script. The recipe was tuned for the legacy multi-brand WP+React work. New stack has different boundaries (single Next.js app, Prisma migrations as the schema gate, Vercel deploys, Neon for prod). Rewrite from a blank page using the v4.4 outline as scaffolding.
- **`PETEY_ORCHESTRATOR_LOOP.md`** — same. The orchestrator pattern is right; the steps need refresh to the new stack.
- **`DOUG_QA_LOOP.md`** — QA loop. Useful, but the new stack's QA needs are different (Prisma migration diff in CI, RLS-equivalent authz tests, Better-Auth flow tests, etc.). Refresh substantially.
- **Doug persona** — QA/reviewer. Keep, refresh role description for new stack.
- **`COMPONENT_REVIEW_PROTOCOL.md`** — code review loop. Worth retaining; refresh to account for Server Components, action clients, Biome instead of ESLint.

### Bucket C — Drop or de-prioritize

Either tightly tied to the legacy stack, or operational machinery that doesn't apply yet.

- **`PETEY_NEXT_SESSION_PROMPT_SESSION_606..619.md`** — these are session-specific handoffs from the legacy project, not reusable templates. Archive in place; don't import.
- **`OPERATOR_HANDOFF_ONE_PAGER_SESSION_*.md`** — same, session-specific. Archive.
- **`GIDDY_BRANCH_MONITOR.md` / `GIDDY_LOOP.md` / `GIDDY_COMMIT_GATE_PROTOCOL.md`** — branch/commit gating loops. Useful eventually, but only when we have multiple parallel work streams and a busy repo. Defer until post-MVP. (Drop **Giddy persona** for MVP; resurrect when load justifies it.)
- **`PETEY_BUBBLE_DICTIONARY.md`** — looked legacy-specific (BubbleBuilder/MAD-Bubble references in monorepo). Skip unless we discover we need it.
- **`PETEY_INTENT_SANITIZER_LOOP.md` / `PETEY_PARSE_PRIORITIZE_PREPARE_PLAN_LOOP.md` / `PERFECT_PETEY_PROMPT_LOOP.md`** — these are nested optimization loops. Useful at scale; overkill for MVP. Defer.
- **`DESIGN_REVIEW_MINI_SPRINT.md`** — pull in only when we hit a design-heavy sprint (S11–S12).
- **Brandon, Desi, Giddy personas** — defer. We don't have enough work parallelism in the MVP phase to justify 6 personas; Petey (orchestrator) + Cody (builder) + Doug (QA) is enough through S10.
- **`scripts/utilities/petey-orchestrator.sh` / `giddy-loop-audit.sh` / `petey-parse-prioritize-prepare-plan-loop.mjs`** — bash/JS automation that ran the legacy loops. Don't port verbatim — rewrite per-project if/when we need them.

### Bucket D — Genuinely new for this project

Things the legacy system didn't have but this project needs:

- **`docs/runbooks/database.md`** ✅ already written.
- **`docs/architecture/plan-vs-current.md`** ✅ already written — this is the cross-reference doc.
- **A "phase gate" doc** — what makes Phase 1 done, what makes Phase 2 done. So we don't drift past milestones.
- **Schema rev playbook** — the standard sequence we follow when reshaping Prisma models (write migration, run `migrate dev`, regenerate authz that touches the renamed model, etc.). Useful when S1 lands and likely again for future schema revs.

### Recommended initial agent + ritual set

For S1–S4 (foundation + Milestone 1):
- **Personas**: Petey, Cody, Doug
- **Rituals**: opening_v5.0, closing_v5.0
- **Protocols**: WORKFLOW_5.0, COMPONENT_REVIEW (refreshed), CHAT_HANDOFF (slimmed)
- Everything else stays archived in the legacy monorepo until we earn the right to bring it forward.

---

## 5. Open decisions before we execute

1. **Sign off on the layer model.** Are L1/L2/L3/L4 the right separation? Anything I'm missing?
2. **Sign off on Baseline-first.** Or do you want Ronin Dojo Design as the first public brand for a different reason (e.g., admin tooling needs come first)?
3. **Sign off on the 12-sprint scope.** Anything in/out vs. what's listed? Tournament registration is one of the heaviest features (S8–S10) — comfortable with that horizon, or pull it forward / push it back?
4. **Naming locks before S1 schema rev:**
   - `Style → Discipline` ✅ recommended
   - `School → Organization` ✅ recommended (with `type` enum)
   - `Profile → Passport` ✅ recommended
   - `Belt → Rank` (with `RankSystem` parent) ✅ recommended
5. **Multi-role memberships from S1?** (`MembershipRoleAssignment` join table) — recommended yes; small extra surface, future-proofs the lifecycle.
6. **Bucket A/B/C call on the agent system.** Want me to actually port the Bucket A files (opening_v5.0, closing_v5.0, Petey/Cody persona refreshes, slim CHAT_HANDOFF) into this repo as a separate task? Or stay heads-down on the schema/code work and do the agent setup later?
7. **Where does the agent system live?** Recommended path: `docs/agents/` (personas), `docs/protocols/` (loops), `docs/rituals/` (opening/closing), `docs/sprints/` (sprint plans + handoffs). Mirrors the legacy structure but lives in a single docs tree.

---

## 6. What changes if you accept this plan

- **Pause** the four backend pieces I started (authz.ts and middleware.ts stay; brand-scope extension and Better-Auth `lastActiveBrandId` deferred). They get reworked after S1's schema rev.
- **S1 becomes the next single task**: the schema rev migration + naming align. Everything downstream depends on this.
- **The current `Per-brand rollout #1: Ronin Dojo Design` todo is wrong** — replaced by the 12-sprint plan above. The first brand rolled out is Baseline Martial Arts in S11.

---

## Appendix — files referenced

- [docs/architecture/source/chatgpt-original-plan.md](source/chatgpt-original-plan.md) — full GPT plan, sections 1–7 are the spec
- [docs/architecture/plan-vs-current.md](plan-vs-current.md) — gap analysis
- [docs/architecture/data-model.md](data-model.md) — current Prisma model rationale (will be revised in S1)
- [docs/architecture/auth.md](auth.md) — Better-Auth + brand context
- [docs/architecture/legacy-conversion.md](legacy-conversion.md) — what to port from legacy frontends
- [docs/architecture/decisions/](decisions/) — ADRs 0001–0008
- Legacy monorepo `RoninDashboard/`: rituals at `RoninDashboard/rituals/`, protocols at `RoninDashboard/protocols/`, personas at `dashboard/personas/`

### Governance and canon registries (added SESSION_0010)

- [Repo Truth Index](../knowledge/wiki/repo-truth-index.md) — what each part of the repo is the truth for
- [Aliases and Canonical IDs](../knowledge/wiki/aliases-and-canonical-ids.md) — historical names → canonical IDs across brands, models, enums, sessions
- [Manual Boundary Registry](../knowledge/wiki/manual-boundary-registry.md) — every "smoke pending" / "code complete but not verified" item; the source for choosing the next real proof target
