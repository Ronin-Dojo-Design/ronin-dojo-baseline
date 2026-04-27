# MANUAL_BOUNDARY_REGISTRY_BASELINE.md

## Purpose
Track every important thing that still depends on:
- human signoff
- credentials
- environment proof
- runtime validation
- release approval
- deferred architectural choice

This registry is for the new baseline repo.

---

## Status vocabulary
- `open`
- `waiting_on_owner`
- `waiting_on_credentials`
- `waiting_on_env`
- `scheduled`
- `verified`
- `archived`

## Blocker classes
- `auth_decision`
- `runtime_proof`
- `brand_migration`
- `docs_wiring`
- `data_model_decision`
- `deploy_env`
- `mobile_contract`
- `content_system_decision`
- `cleanup`
- `qa_proof`

---

## Registry

| ID | Lane | Boundary | Owner | Blocker class | Proof required | Status |
|---|---|---|---|---|---|---|
| MB-001 | S2 auth | Lock mobile auth path: Better-Auth mobile SDK vs JWT bridge fallback | owner + Cody | mobile_contract | one explicit architecture decision + implementation target | open |
| MB-002 | brand scope hardening | Decide and implement Prisma brand-scope enforcement layer | Cody | auth_decision | code path + test evidence + updated auth doc | open |
| MB-003 | brand switcher | Finish `activeBrandId` persistence + switch flow + smoke proof | Cody | runtime_proof | working end-to-end flow, session survives reload | open |
| MB-004 | S2 Passport bootstrap | Convert “code complete / smoke pending” into verified flow | Cody + Doug | qa_proof | signup → Passport stub → DirectoryProfile stub smoke proof | open |
| MB-005 | transitional cleanup | Remove Dirstarter reference models before prod or formally quarantine them | Petey + Cody | cleanup | tracked removal plan or quarantine ADR | open |
| MB-006 | Baseline rollout | Approve Baseline-first public rollout surfaces and alias rules | Brandon + owner | brand_migration | approved alias map + rollout checklist | open |
| MB-007 | staging deploy | Vercel + Neon staging environment proof | Cody + Doug | deploy_env | deploy succeeds + smoke checklist passes | open |
| MB-008 | docs/wiki quality | Backlinks and doc health upgrades on key pages | Petey + Doug | docs_wiring | wiki lint pass + index updates | open |
| MB-009 | content engine path | Decide current truth split: MDX-only now vs ContentAtom-backed intake-to-publish path | Petey + Iggy + owner | content_system_decision | written policy + phased adoption plan | open |
| MB-010 | legacy migration | Clarify when BBL/WEKAF porting resumes relative to Baseline-first milestone | Petey + owner | brand_migration | updated program lane note | open |

---

## Notes by boundary

### MB-001 — Mobile auth path
Current auth documentation explicitly preserves two viable mobile options.
That means the mobile contract is not fully closed.

### MB-002 — Brand scope enforcement
The docs already describe a future Prisma extension for stronger brand scoping.
Until that is real, the safety posture is partly procedural and partly architectural.

### MB-003 — Active brand persistence
The auth doc names the behavior clearly.
What matters now is operational proof.

### MB-004 — Passport bootstrap
Program plan notes this is code complete but still needs smoke proof.
That makes this a perfect tracked manual boundary instead of a vague “almost done.”

### MB-005 — Dirstarter residue
The schema literally marks template models for future removal before production.
That should stay visible until handled.

### MB-009 — Content system path
The repo has:
- MDX blog content now
- ContentAtom-style schema direction
- wiki/docs/session knowledge layer
This needs a crisp operating rule so the system does not fork into three half-truths.

---

## Closure rule
A boundary may only become `verified` when:
1. the choice/action is complete,
2. proof artifact exists,
3. owner is known,
4. next-state docs are updated.

If proof does not exist, it stays open.

---

## Review rhythm
Review this registry:
- at bow-in for planning-heavy sessions
- before declaring a milestone closed
- before staging/prod readiness
- whenever someone says “manual step” or “smoke pending”

---

## Petey close

Manual work is not weakness.

Hidden manual work is weakness.

Track it.
Name it.
Close it honestly.

**Planned Passion Produces Purpose.**
**OSSS.**
