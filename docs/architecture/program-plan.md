---
title: Program Plan
slug: program-plan
type: file
status: partially-superseded
created: 2026-04-25
updated: 2026-04-28
last_agent: copilot-session-0020-preflight
pairs_with:
  - docs/architecture/plan-vs-current.md
  - docs/architecture/s1-schema-design.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Program plan — Ronin Dojo platform rebuild

> **⚠️ PARTIALLY SUPERSEDED (SESSION_0020):** The 12-sprint sequential schedule (S6–S12) is replaced by [WORKFLOW_5.0.md](../protocols/WORKFLOW_5.0.md) which defines a 20-session calendar (SESSION_0021–0040) targeting May 18 all-brand launch. The layered architecture, brand sequencing, and agent system sections remain valid.

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
| **S4** ✅ | Directory search with privacy | List view honoring `DirectoryProfile.visibility` and per-field flags. Filters by org/discipline/rank/location. Browser-verified SESSION_0017. **Plan Milestone 1 ✅** |
| **S5** ✅ | RankSystem + Rank seed data | Done — pulled forward into S1. 12 disciplines, 13 rank systems, 194 ranks seeded. Admin UI to add new rank systems deferred to future sprint. |
| **S6** | Course + CurriculumItem CRUD | **Superseded →** SESSION_0026 (Content + curriculum lane) |
| **S7** | Progress awarding + gamification ledger | **Superseded →** SESSION_0026 (Content + curriculum lane) |
| **S8** | Tournament create wizard | **Superseded →** SESSION_0027–0029 (Tournament operations lane) |
| **S9** | Registration + RegistrationEntry with snapshots | **Superseded →** SESSION_0028 (Tournament operations lane) |
| **S10** | Payments + capacity + waitlist | **Superseded →** SESSION_0024 (School operations lane) |
| **S11** | Baseline Martial Arts brand rollout | **Superseded →** SESSION_0031 (Baseline brand lane) |
| **S12** | Ronin Bar UI shell + Vercel/Neon staging deploy | **Superseded →** SESSION_0034 (Ronin Dojo Design lane) + SESSION_0039 (Launch readiness) |

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

### Bucket A — Bring forward (with refresh) ✅ DONE

All items ported and live:

- ✅ **`opening_v5.0.md`** — bow in ritual at `docs/rituals/opening.md`
- ✅ **`closing_v5.0.md`** — bow out ritual at `docs/rituals/closing.md`
- ✅ **`CHAT_HANDOFF.md`** — slimmed version at `docs/protocols/chat-handoff.md`
- ✅ **Petey persona** — at `docs/agents/petey.md`
- ✅ **Cody persona** — at `docs/agents/cody.md`

### Bucket B — Rework ✅ DONE

- ✅ **`WORKFLOW_5.0.md`** — created at `docs/protocols/WORKFLOW_5.0.md`. Defines 5 hard rules, 10-point score rubric, 20-session calendar, 6 personas, 5 worktrees, 3-pass review loop.
- ✅ **Doug persona** — active as QA/reviewer
- ⏸ **`COMPONENT_REVIEW_PROTOCOL.md`** — refresh scheduled for when UI work begins (SESSION_0030+)

### Bucket C — Drop or de-prioritize → PARTIALLY RESURRECTED

SESSION_0020 resurrected more personas than originally planned:

- ✅ **Giddy** — resurrected as Architecture + Git strategy persona (WORKFLOW 5.0)
- ✅ **Desi** — resurrected as UX + design consistency persona (WORKFLOW 5.0)
- ✅ **Brandon** — resurrected as Brand + marketing rollout persona (WORKFLOW 5.0)
- Remaining Bucket C items (session-specific handoffs, bash automation, nested optimization loops) stay archived as planned.

### Bucket D — Genuinely new for this project ✅ DONE

- ✅ `docs/runbooks/database.md`
- ✅ `docs/architecture/plan-vs-current.md`
- ✅ `docs/protocols/WORKFLOW_5.0.md` — the phase gate + session calendar doc
- ✅ `docs/architecture/s2-schema-additions.md` — schema migration spec

### Current active agent + ritual set

For SESSION_0021 onward (governed by WORKFLOW 5.0):

- **Personas**: Petey, Cody, Doug, Giddy, Desi, Brandon (all 6 active)
- **Rituals**: opening (bow in), closing (bow out)
- **Protocols**: WORKFLOW_5.0, chat-handoff, cody-preflight, code-guardrails, wiki-lint

---

## 5. Open decisions before we execute ✅ ALL RESOLVED

1. ✅ **Layer model signed off.** L1/L2/L3/L4 accepted as-is.
2. ✅ **Baseline-first signed off.** Build order: Baseline → BBL → WEKAF → Ronin Dojo Design.
3. ✅ **12-sprint scope signed off** (S1–S5 executed). S6–S12 superseded by WORKFLOW 5.0 session calendar.
4. ✅ **Naming locks**: `Style→Discipline`, `School→Organization`, `Profile→Passport`, `Belt→Rank` — all done in S1.
5. ✅ **Multi-role memberships from S1** — `MembershipRoleAssignment` implemented.
6. ✅ **Agent system ported** — Bucket A/B done, Bucket C partially resurrected (see Section 4 above).
7. ✅ **Agent system location** — `docs/agents/`, `docs/protocols/`, `docs/rituals/`, `docs/sprints/` as recommended.

---

## 6. What changed when the plan was accepted ✅ ALL DONE

- ✅ Paused the four in-progress backend pieces. Reworked after S1 schema rev.
- ✅ S1 became the next single task: schema rev migration + naming align. Completed SESSION_0003–0005.
- ✅ "Per-brand rollout #1: Ronin Dojo Design" todo removed. Replaced by Baseline-first approach, now superseded by Option A-plus (all brands May 18).
- ✅ Plan accepted and executed through S5. S6+ governed by WORKFLOW 5.0.

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
