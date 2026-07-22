---
title: "SESSION 0602 — PLAN: branded client-onboarding artifacts + interactive forms (G-028) (rdd)"
slug: session-0602
type: session--plan
status: in-progress
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0602
sprint: S12
lane: rdd
recipe: epic-plan
goal_ids: [G-028]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0598.md
  - docs/protocols/recipes/new-brand-interview-client.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0602 — PLAN: branded onboarding artifacts + interactive forms (G-028)

> **PLAN session (no build).** Turn RDD's client-onboarding templates (Initial Client Meeting / MSA /
> NDA; `docs/product/rdd/assets/`) — and future ones — into **branded artifacts + interactive forms**,
> reusable across brands/clients. Forks BELOW are UNRESOLVED (a plan's forks return to the operator);
> all lane prompts are **BLOCKED-on-grill** until they are pinned.

## Goal

`/pp` grill → executable, sliced plan; reuse-first (existing `can(...)` authz, existing form
primitives, the ONE R2 storage seam); template `[fill]` fields → typed-form schema, boilerplate stays
static; generate + store the branded PDF, attached to the client-onboarding record; typed-name
signature first (defer DocuSign-grade).

## Inherited pinned (SESSION_0598 + Brandon /rr — do NOT re-grill)

- **Home = the client path** (`new-brand-interview-client.md`); signing order **NDA → discovery → MSA + SOW → handoff**.
- **Reuse-first:** admin Client-Onboarding surface, existing `can(...)` authz — **NO 5th authz system**;
  template → typed-form schema (`[fill]` fields are inputs, boilerplate stays static); generate + store the
  branded PDF via the **ONE uploader/R2 seam** on the client-onboarding record; **typed-name signature first** (defer DocuSign).
- Templates are **BLANK boilerplate**; **de-Tableau re-scope** to RDD's software+design framing needed.
- **Counsel / ESIGN-UETA gate** before any generated MSA/NDA is executable (Brandon flag — recommend, not ratify).
- **Executed (filled) instances must NOT be committed to git** — gated R2 only.

## Source-reading findings (verified against tree — some CONTRADICT the stub's pins)

Read `apps/web/prisma/schema.prisma` (Lead L3692, Media L3802), `apps/web/lib/media.ts`,
`apps/web/components/web/uploader/*`, `apps/web/server/admin/leads/*`, `apps/web/app/app/leads/*`, `apps/web/package.json`.

1. **The "leads/CRM record" the pin names does NOT fit the artifact.** `Lead` (schema.prisma:3692) is a
   **dojo membership-funnel** record: required `brand Brand` + `organizationId` (→ a school Organization) +
   `programId` + `trialBookedAt` + `convertedToUserId` (lead → **member**). No document relation, no
   agency↔client-company concept. RDD-agency onboarding is a **B2B agency↔client-COMPANY** engagement
   (NDA/MSA between two LLCs) — a different domain. → **New fork #6 (record model).**
2. **"ONE uploader/R2 seam" is two different things.** `components/web/uploader/*` is an **image-only
   avatar/photo cropper** (`AvatarUploader` + react-easy-crop + `BeltPreview`) — it cannot store a
   server-generated PDF. The real R2 **storage** seam is `apps/web/lib/media.ts` (`@aws-sdk/lib-storage`
   `Upload` via `services/s3`) + the `Media` model + `server/web/media/apply-media.ts`. A generated PDF is
   PUT server-side via `lib/media.ts` and recorded as `Media`; the client cropper is NOT involved. Read the
   pin as "**the ONE R2 storage seam (`lib/media.ts` + `Media`)**," not the image uploader UI.
3. **No PDF-generation library exists** — `apps/web/package.json` carries only `@playwright/test` (dev).
   Generating a branded PDF needs a new dependency/approach. → **New fork #7 (PDF engine).**
4. **`apps/rdd` does not exist yet** — it is being scaffolded by the LIVE sibling `session-0601-rdd-scaffold`
   (Slice A of G-027). G-028 Slice-1 build cannot host there until 0601 lands. → sharpens **fork #5 (host app)**.
5. **The three templates are TWO archetypes, not three peers:**
   - **NDA** + **MSA/SOW** = signable legal **contracts** — share a party-block + signature-block core;
     each adds template-specific body fields. Need the de-Tableau re-scope (MSA WHEREAS recitals name
     "data visualization, data warehousing"; keep §6.2/6.3 Background-Technology = ADR 0033 anchor).
   - **Initial Client Meeting** = a **15-question discovery QUESTIONNAIRE** — *not* legal, *no* signature,
     *no* counsel gate; heavily Tableau/"data analytics" worded → biggest de-Tableau lift. Its OUTPUT feeds
     the requirements doc, not a signed PDF. → sharpens **fork #2 (schema shape)**.

## Template `[fill]` field inventory (verified from extracted `word/document.xml`)

| Template | Party fields | Signature fields | Body/variable fields | Static boilerplate |
| --- | --- | --- | --- | --- |
| **NDA** | Client legal name, entity type, address | Client signer name + title; RDD signer name + title; **date** | (none — pure mutual NDA) | §1–19; governing law CO/Denver |
| **MSA** | Client legal name, entity type, address; **Effective Date** | Both sides: name + title + date (typed-name) | Exhibit A SOW: SERVICES text, FEES (role · $/day · $/hour), expenses terms | §1–14; §6.2/6.3 = ADR 0033 anchor (KEEP) |
| **Initial Meeting** | (client name only, optional) | none | 15 discovery answers (long-text); de-Tableau re-scoped | agenda prose (not legal) |

RDD-provider side (name/title/address/logo) is **static once branded** — sourced from RDD `BrandSettings`
(brand-color SoT = DB), NOT re-typed per instance.

## Proposed slice plan (SEQUENTIAL — this is NOT a disjoint parallel fan-out)

Per `epic-plan.md` overlays: the slices **build on each other and share one new owned module**
(`server/onboarding/*` + schemas + surface), so the honest shape is **sequential sessions (or a §5b
in-session chain)**, not N parallel lanes. "Disjointness proof" therefore resolves to: *one owned module,
built in dependency order* — no parallel-lane intersection to prove empty. Merge order = slice order.

| Slice | Scope | Owned files (new, indicative) | Non-goals |
| --- | --- | --- | --- |
| **S1 — content + schema** | De-Tableau re-scope the 3 templates into structured **boilerplate-as-data** modules (RDD software+design framing); define typed **zod form schemas**: shared `partyBlock` + `signatureBlock` core + per-template `fields`; questionnaire schema separate | `server/onboarding/templates/*` (nda/msa/intake content), `server/onboarding/schema.ts` | no UI, no PDF, no DB |
| **S2 — record + admin surface + intake** | Client-onboarding **record model** (fork #6) + migration; **AdminCollection**-conformed Client-Onboarding surface via existing `can(...)`; the intake questionnaire form writing to the record | `prisma/schema.prisma` (+model), `app/<host>/onboarding/*`, `server/onboarding/{actions,queries}.ts` | no PDF yet |
| **S3 — branded PDF + R2 + signature** | Render a filled contract schema+boilerplate → branded PDF (engine per fork #7) → PUT via `lib/media.ts` → `Media` attached to the record; typed-name signature capture; gated download | `server/onboarding/pdf/*`, `server/onboarding/generate.ts` | no counsel gate logic |
| **S4 — executable gate + audit** | Counsel / ESIGN-UETA **gate** (fork #4): status/approval step blocking a generated MSA/NDA from "executable" until signed off; audit trail; assert executed instances never hit git | `server/onboarding/gate.ts`, status enum on the record | DocuSign-grade e-sign |

Reuse anchors (all verified present): form stack = zod + react-hook-form + (forward: **oRPC** `server/orpc/*`,
per the FULL-oRPC memory; next-safe-action is the retiring pattern in `leads` today); admin-list law =
**AdminCollection** (`/app/tools` ref impl); R2 = `lib/media.ts` + `Media`; authz = `can(...)` (`admin-upload-gate` memory).

## Open forks — RETURN TO OPERATOR (do NOT resolve here)

> Every fork below is **BLOCKED-on-grill**. No lane prompt ships until each is pinned. See the report to
> the orchestrator for the numbered list with recommended-default + open-question per fork. Summary keys:
> **F1** signature depth · **F2** schema shape · **F3** entitlement gating · **F4** counsel/ESIGN-UETA gate
> · **F5** host app · **F6** onboarding record model (NEW) · **F7** PDF engine (NEW).

## Draft build-stub (pending grill) — UNNUMBERED, do NOT adopt

> Content only. Do NOT mint a SESSION number, do NOT create a reservation branch, do NOT flip status.
> The operator adopts this **after** F1–F7 are pinned; paste the pinned verbatim answers into the
> "Pinned forks" block before dispatch.

```yaml
---
title: "SESSION <NNNN> — BUILD S1: onboarding template content + typed-form schema (G-028) (rdd)"
slug: session-<nnnn>
type: session--build
status: staged
lane: rdd
recipe: lane
goal_ids: [G-028]
pairs_with:
  - docs/sprints/SESSION_0602.md
---

# SESSION <NNNN> — BUILD S1: onboarding content + schema (G-028)

## Goal
De-Tableau re-scope the 3 RDD onboarding templates into structured boilerplate-as-data modules
(RDD software+design framing) + define the typed zod form schemas (shared partyBlock + signatureBlock
core + per-template fields; intake questionnaire separate). NO UI, NO PDF, NO DB — schema + content only.

## Pinned forks (paste operator-ratified answers before dispatch — currently BLOCKED)
- F1 signature depth: <PIN>
- F2 schema shape:   <PIN>
- F5 host app:       <PIN>   # determines the module path (apps/web vs apps/rdd)
- F6 record model:   <PIN>   # S2 dependency, but the schema shape must anticipate it
- F7 PDF engine:     <PIN>   # S3 dependency; S1 schema must be render-target-agnostic

## Owned files
- server/onboarding/templates/{nda,msa,intake}.ts  (boilerplate-as-data + de-Tableau'd copy)
- server/onboarding/schema.ts  (zod: partyBlock, signatureBlock, per-template fields, intake)

## Steps (recipe: lane invariants — see .claude/skills/seq-lane-build/SKILL.md)
1. Own worktree off main; /worktree-setup (this IS an app-code lane — bootstrap + gates).
2. Graphify recon on onboarding/lead/media nouns.
3. Encode de-Tableau'd boilerplate as data; keep MSA §6.2/6.3 verbatim (ADR 0033 anchor).
4. Author zod schemas; unit-test the shape (valid/invalid fixtures). NO executed data in fixtures.
5. Gates (typecheck/oxlint/oxfmt/test); runtime proof = schema parse test green.
6. Session record + proposed-ledger-edits; local commit, NO push.

## Done means
- 3 content modules + schema.ts committed; unit tests green; TEMPLATE banner preserved;
  zero executed/real-client data; ADR 0033 §6.2/6.3 text intact.
```

## Status

Single source of truth is the frontmatter `status:` field.

## Next session

### Goal

(set at plan close — after F1–F7 pinned, adopt the S1 build-stub above)
