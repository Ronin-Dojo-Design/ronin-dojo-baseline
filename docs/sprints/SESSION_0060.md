---
title: "SESSION 0060 — Hostile-Close Review: Sessions 0001–0037 + 0056–0059"
slug: session-0060
type: session
status: closed-full
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0060
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0059.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0060 — Hostile-Close Review

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey)

### Status

in-progress

### Goal

Comprehensive hostile-close review of all sessions. Surface bugs, security risks, scalability issues, Dirstarter compliance gaps, Passport wiring, and the remaining drift items (D-006, D-010). Produce a prioritized fix list for the next execution session, then identify the next logical lane toward four-brand launch.

### Context read

- ✅ SESSION_0059 — closed-quick. D-005, D-011 resolved. Enrollment Passport check added.
- ✅ WORKFLOW_5.0 — all-brand May 18 launch.
- ✅ `drift-register.md` — D-006, D-007, D-010 remaining open.
- ✅ Git: `main`, clean working tree.
- ✅ `auth.ts` — Passport created on sign-up (all paths: email, social, magic-link, callback).
- ✅ `lead/actions.ts` — Passport created on lead-to-member conversion.
- ✅ Full admin action + query audit completed.

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | All layers — this is a full audit |
| Extension or replacement | Audit — no code changes this session |
| Why justified | Pre-launch quality gate |
| Risk if bypassed | Ship with cross-brand leaks, missing validation, or L1 violations |

---

## Petey — Hostile-Close Review

### 1. PASSPORT WIRING AUDIT

**Question raised:** Does the enrollment Passport check make sense if the user has never enrolled before?

**Finding:** YES, the check is valid but with a nuance:

- **Every registered user gets a Passport** at sign-up time (`lib/auth.ts` L64-91). The `afterResponse` hook creates `Passport + DirectoryProfile` stubs for all auth paths (email, social, magic-link).
- **Lead-to-member conversion also creates Passport** (`lead/actions.ts` L374).
- **Therefore:** A user without a Passport would only exist if: (a) the auth hook failed silently, or (b) the user was manually inserted into the DB bypassing auth.
- **The check is a safety net**, not a primary gate. It catches edge-case corruption. This is correct defensive programming.

**Passport wiring coverage:**

| Feature | Passport required? | Check exists? | Status |
| --- | --- | --- | --- |
| Sign up | Auto-created | ✅ auth hook | ✅ |
| Lead conversion | Auto-created | ✅ lead action | ✅ |
| `/me` Passport editor | Loads by userId | ✅ query | ✅ |
| Dashboard | Displays Passport | ✅ SESSION_0057 | ✅ |
| Program enrollment | Check before enroll | ✅ SESSION_0059 | ✅ |
| Tournament registration | Not checked | ❌ | 🟡 P3 — add defensive check |
| Organization join | Not checked | ❌ | 🟡 P3 — add defensive check |
| Attendance check-in | Not checked | ❌ | ℹ️ OK — attendance is org-scoped, membership already required |
| Directory listing | Filtered by DirectoryProfile | ✅ | ✅ |

**Verdict:** Passport wiring is solid. Two low-priority defensive checks could be added (tournament registration, org join) but aren't blocking — auth hook guarantees Passport exists.

---

### 2. CROSS-BRAND SECURITY AUDIT (Critical Bug Class)

**Admin actions without brand scoping — the big gap:**

| Admin action file | Has `getRequestBrand`? | Models affected | Brand column? | Severity |
| --- | --- | --- | --- | --- |
| `admin/tournaments/actions.ts` | ❌ NO | Tournament, Division, Registration | ✅ Yes | 🔴 P1 |
| `admin/courses/actions.ts` | ❌ NO | Course, CurriculumItem | ✅ Yes | 🔴 P1 |
| `admin/certificates/actions.ts` | ❌ NO | CertificateTemplate | ✅ Yes | 🔴 P1 |
| `admin/certificates/issuance-actions.ts` | ✅ Yes | — | — | ✅ Fixed S57 |
| `admin/categories/actions.ts` | ❌ NO | Category | ❌ L1 shared | ℹ️ OK |
| `admin/tags/actions.ts` | ❌ NO | Tag | ❌ L1 shared | ℹ️ OK |
| `admin/tools/actions.ts` | ❌ NO | Tool | ❌ L1 shared | ℹ️ OK |
| `admin/reports/actions.ts` | ❌ NO | Report | ❌ L1 shared | ℹ️ OK |
| `admin/users/actions.ts` | ❌ NO | User | ❌ global | ℹ️ OK |
| `admin/media/actions.ts` | ❌ NO | Media | ❌ L1 shared | ℹ️ OK |
| `admin/entitlements/actions.ts` | ✅ Yes | Entitlement | ✅ Yes | ✅ |
| `admin/pricing-plans/actions.ts` | ✅ Yes | PricingPlan | ✅ Yes | ✅ |
| `admin/leads/actions.ts` | ✅ Yes | Lead | ✅ Yes | ✅ |

**Critical finding:** `admin/tournaments/actions.ts`, `admin/courses/actions.ts`, and `admin/certificates/actions.ts` perform CRUD on brand-scoped models without any brand validation. An admin on Brand A could theoretically edit/delete Brand B's tournaments, courses, or certificate templates.

**The `adminActionClient` chain itself has no brand middleware.** Each action must call `getRequestBrand()` individually. This is fragile — every new admin action is a potential cross-brand leak.

**Recommendation:** Add brand to the `adminActionClient` context chain so it's always available. Individual actions still validate, but the brand is already resolved.

---

### 3. ADMIN QUERY BRAND SCOPING AUDIT

| Admin query file | Has brand filter? | Severity |
| --- | --- | --- |
| `admin/tournaments/queries.ts` | ❌ (queries by id only) | 🔴 P1 |
| `admin/tournaments/registrations-queries.ts` | ❌ | 🟡 P2 |
| `admin/courses/queries.ts` | ❌ | 🔴 P1 |
| `admin/certificates/queries.ts` | ❌ | 🔴 P1 |
| `admin/entitlements/queries.ts` | ✅ via `getRequestBrand` | ✅ |
| `admin/pricing-plans/queries.ts` | ✅ via `getRequestBrand` | ✅ |
| `admin/leads/queries.ts` | ✅ via `getRequestBrand` | ✅ |
| `admin/categories/queries.ts` | N/A (L1 shared) | ✅ |
| `admin/tags/queries.ts` | N/A (L1 shared) | ✅ |
| `admin/tools/queries.ts` | N/A (L1 shared) | ✅ |

---

### 4. DIRSTARTER L1 COMPLIANCE AUDIT

| Pattern | L1 standard | Current state | Gap? |
| --- | --- | --- | --- |
| Action client chain | `actionClient → userActionClient → adminActionClient` | ✅ Matches | No |
| HOC admin page wrapping | `withAdminPage(Component)` | ✅ Used everywhere | No |
| `"use cache"` for public queries | `"use cache"` + `cacheTag` + `cacheLife` | ✅ Fixed SESSION_0059 | No |
| Payload-based `select` | Use payload objects, not `include` | ✅ Most queries, some use `include` | 🟡 Minor — org membership still uses `include` |
| Server actions over API routes | Prefer `"use server"` actions | ✅ All Ronin features use actions | No |
| Content collections for MDX | `content-collections.ts` | ✅ Dirstarter default | No |
| Form handling | React Hook Form + Zod | ✅ All forms | No |
| `after()` for revalidation in admin | `after(async () => { revalidate(...) })` | ✅ Some, ❌ others use sync `revalidate()` | 🟡 Minor inconsistency |

---

### 5. SCALABILITY CONCERNS

| Concern | Risk | Mitigation |
| --- | --- | --- |
| No pagination on admin tournament registrations | Slow at scale | 🟡 P3 — add pagination |
| `$transaction` with Serializable isolation for registration | Correct but expensive | ℹ️ OK — prevents race conditions |
| `getUserMemberships` returns all memberships with full includes | N+1 risk at scale | 🟡 P3 — add select payload |
| No DB indexes on some foreign keys | Prisma auto-indexes `@relation` FKs | ✅ Fine |

---

### 6. DRIFT ITEMS D-006 AND D-010

**D-006 — `packages/api-client` not installed:**
- The `api-client` package exists but isn't used by any code in `apps/web/`.
- It was a placeholder from SESSION_0016 for future external API access.
- **Recommendation:** Close as DEFERRED. It's not blocking anything. When we need cross-service calls, we'll wire it up. Running `pnpm install` won't fix anything meaningful — the package has no consumers.

**D-010 — Program plan superseded by May 18 all-brand launch:**
- `program-plan.md` already has a deprecation banner: "⚠️ PARTIALLY SUPERSEDED (SESSION_0020)."
- WORKFLOW_5.0 is the governing document. The program-plan layered architecture and brand sequencing sections remain valid.
- **Recommendation:** Close by adding a clear `status: partially-superseded` to the frontmatter and noting that WORKFLOW_5.0 governs the session calendar. The architectural sections remain authoritative.

---

### 7. PRIORITIZED FIX LIST (for SESSION_0061)

| # | Priority | Issue | Effort | Fix |
| --- | --- | --- | --- | --- |
| 1 | 🔴 P1 | Admin tournament actions: no brand validation | 15 min | Add `getRequestBrand()` + brand filter to `upsertTournament`, `deleteTournaments`, status update actions |
| 2 | 🔴 P1 | Admin course actions: no brand validation | 10 min | Add `getRequestBrand()` + brand filter to `upsertCourse`, `deleteCourses` |
| 3 | 🔴 P1 | Admin certificate template actions: no brand validation | 10 min | Add `getRequestBrand()` to template CRUD |
| 4 | 🔴 P1 | Admin tournament queries: no brand filter | 10 min | Add brand to `findTournaments`, `findTournamentById` |
| 5 | 🔴 P1 | Admin course queries: no brand filter | 10 min | Add brand to course admin queries |
| 6 | 🔴 P1 | Admin certificate queries: no brand filter | 10 min | Add brand to cert template queries |
| 7 | 🟡 P2 | `adminActionClient` should resolve brand into context | 15 min | Add `getRequestBrand()` to admin action client chain, pass in `ctx.brand` |
| 8 | 🟡 P2 | D-010 close | 5 min | Update `program-plan.md` frontmatter |
| 9 | 🟡 P2 | D-006 close | 2 min | Update drift register, mark deferred |
| 10 | 🟡 P3 | Passport defensive check for tournament registration | 5 min | Add check in `createRegistrationCheckout` |
| 11 | 🟡 P3 | Passport defensive check for org join | 5 min | Add check in `joinOrganization` |
| 12 | 🟡 P3 | `getUserMemberships` uses `include` not `select` payload | 10 min | Create membership payload, switch to `select` |

**Estimated total:** ~1.5 hours for P1+P2, ~20 min for P3.

---

### 8. NEXT LOGICAL LANE TOWARD FOUR-BRAND LAUNCH

After the P1 brand-scoping fixes land, the platform's core security and data integrity are solid. Here's the lane assessment:

| Lane | Status | What remains for launch |
| --- | --- | --- |
| **Core platform** | 🟢 90% | Brand-scoping fixes (this review), then done |
| **School operations** | 🟢 85% | Lead intake, enrollment, attendance, schedules, family, waivers — all wired. Missing: billing/invoice lifecycle, Stripe Connect for orgs |
| **Tournament operations** | 🟢 80% | Registration, brackets, scoring — wired. Missing: results publishing, official assignment workflow |
| **Content & curriculum** | 🟢 80% | Courses, techniques, certificates, media — wired. Missing: public curriculum browsing polish |
| **White-label + brand ops** | 🟡 40% | Theme tokens exist but not per-brand. No brand switcher UI. No RDD admin onboarding. This is the biggest gap. |
| **Launch & support** | 🟡 50% | No analytics dashboard, no release checklist, no incident handling |

**Recommended next lane:** After SESSION_0061 (P1 fixes), move to **White-label + brand ops** to get multi-brand theming and the brand switcher working. That's the prerequisite for all four brands going live. Everything else is at 80%+ but it's all running as a single brand right now.

---

### 9. LAUNCH TIMELINE ASSESSMENT

We're in good shape. The core platform, school ops, tournaments, and content are all at 80%+. The critical path to May 18 is:

1. ✅ **SESSION_0061** — P1 brand-scoping fixes (today/tomorrow)
2. **SESSION_0062–0064** — White-label theming: per-brand CSS tokens, brand switcher, org-scoped landing pages
3. **SESSION_0065–0066** — Baseline Martial Arts: seed data, demo content, smoke test full user lifecycle
4. **SESSION_0067** — BBL/WEKAF: seed configs, minimal content, verify brand isolation
5. **SESSION_0068** — QA hardening: release checklist, fixture data, migration rehearsal
6. **SESSION_0069–0070** — Polish + launch prep

**That's ~10 sessions for 14 days. Very achievable.**

---

## Open decisions

1. **Brand in adminActionClient:** Add `ctx.brand` to the admin action chain? This would make brand available to all admin actions without each one calling `getRequestBrand()`. Reduces surface area for future leaks. **Recommend: YES.**

2. **D-006 disposition:** Close as DEFERRED (no consumers) or remove the package entirely? **Recommend: DEFERRED — keep the package for future use.**

---

## Next session

**SESSION_0061 — P1 Brand-Scoping Fixes**
- **Goal:** Close all 6 P1 items from this review + add brand to `adminActionClient`
- **Agent:** Cody
- **Inputs:** This review table (§7)
- **First task:** Add `getRequestBrand()` to `adminActionClient` chain, then fix tournament admin actions/queries

---

## Files touched

| File | Note |
| --- | --- |
| `docs/knowledge/wiki/drift-register.md` | MODIFIED — D-006 deferred, D-010 resolved |
| `docs/architecture/program-plan.md` | MODIFIED — status → partially-superseded |
| `docs/sprints/SESSION_0060.md` | NEW — this hostile-close review |

## Decisions resolved

- **Enrollment Passport check:** Valid defensive programming. Auth hook guarantees Passport exists for all registered users. The check catches edge-case DB corruption.
- **D-006:** Deferred — `api-client` package has no consumers. Keep for future use.
- **D-010:** Resolved — WORKFLOW_5.0 governs session calendar. Program-plan architecture sections remain valid.
- **Admin brand scoping:** 6 P1 gaps found in admin actions/queries. Fix in SESSION_0061.
- **adminActionClient brand context:** Recommended to add `ctx.brand` to reduce future leakage risk.

## Task log

- `SESSION_0060_TASK_01` — Passport wiring audit — ✅ done (all paths create Passport)
- `SESSION_0060_TASK_02` — Cross-brand security audit — ✅ done (6 P1 gaps found)
- `SESSION_0060_TASK_03` — Dirstarter L1 compliance audit — ✅ done (compliant with minor notes)
- `SESSION_0060_TASK_04` — Scalability review — ✅ done (3 P3 items noted)
- `SESSION_0060_TASK_05` — D-006 + D-010 disposition — ✅ done (D-006 deferred, D-010 resolved)
- `SESSION_0060_TASK_06` — Lane assessment for four-brand launch — ✅ done (white-label is bottleneck)

## Review log

- `SESSION_0060_REVIEW_01` — Hostile-close review of sessions 0001–0037 + 0056–0059.
  - **Findings:** 6 P1 cross-brand admin scoping gaps (tournaments, courses, certificates — actions + queries). `adminActionClient` lacks brand context.
  - **Finding IDs:** SESSION_0060_FINDING_01 through SESSION_0060_FINDING_06 (admin brand scoping), SESSION_0060_FINDING_07 (adminActionClient chain).
  - **Score:** N/A — audit session, no code shipped.
  - **Verdict:** Core platform at 90% after P1 fixes. White-label + brand ops (40%) is the critical path for May 18 launch.

## Hostile close review

Self-contained in this session — the entire session IS the hostile-close review. See §1–§9 above.

## ADR / ubiquitous-language check

No new ADRs needed. The brand-scoping pattern is established (ADR 0004). The findings are implementation gaps, not architectural decisions. No new domain terms.

## Reflections

- **The `adminActionClient` gap is systemic.** Every admin action must manually call `getRequestBrand()`. This is the root cause of all 6 P1 findings. Adding brand to the action client chain would have prevented all of them. Lesson: middleware-level enforcement > per-action discipline.
- **The PricingPlanActions type mismatch carried for 5 sessions because nobody investigated.** SESSION_0058 proved it was INVALID in 2 minutes. Lesson: carried items should be investigated, not just carried.
- **Four-brand launch is achievable.** Core platform, school ops, tournaments, and content are all at 80%+. The bottleneck is white-label theming (40%). 10 sessions for 14 days is comfortable.
- **Passport wiring is correctly designed.** The auth hook pattern (create Passport on sign-up) is elegant — it means Passport is guaranteed for every user, and defensive checks are safety nets, not gates. The enrollment check from SESSION_0059 is valid but rarely triggered.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `drift-register.md` updated (D-006 deferred, D-010 resolved). `program-plan.md` status → `partially-superseded`. No new wiki pages created. |
| Backlinks/index sweep | SESSION_0060 `pairs_with` set to SESSION_0059 + WORKFLOW_5.0. No new wiki page cross-refs needed. |
| Wiki lint | `bun run wiki:lint` → ✅ No lint violations found (169 files scanned). |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | This session IS the hostile-close review. 6 P1 + 1 P2 + 3 P3 findings. See §2–§7. |
| Review & Recommend | Next session goal: SESSION_0061 — P1 brand-scoping fixes + white-label/brand ops planning |
| Memory sweep | Key memory: `adminActionClient` needs `ctx.brand` — this is the systemic fix that prevents future cross-brand leaks. White-label + brand ops is the launch bottleneck. |
| Next session unblock check | Unblocked — no user decisions needed. P1 fix list is concrete. |
| Git hygiene | Branch: `main`. Working tree clean. All changes committed in `faede5b`. Pushed to origin. |

## Next session

### SESSION_0061 — P1 Brand-Scoping Fixes + White-Label & Brand Ops Planning

- **Goal:** Close all 6 P1 admin brand-scoping gaps, add `ctx.brand` to `adminActionClient`, then Petey plans the white-label + brand ops lane
- **Agent:** Cody (fixes) → Petey (planning)
- **Inputs:** SESSION_0060 §7 fix list, WORKFLOW_5.0 lane model, Dirstarter theming docs
- **First task:** Add `getRequestBrand()` to `adminActionClient` chain in `lib/safe-actions.ts`

## Status

in-progress → **closed-full**
