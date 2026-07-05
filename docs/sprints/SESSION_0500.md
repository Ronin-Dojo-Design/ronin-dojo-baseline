---
title: "SESSION 0500 — G-004 BBLApp feature adaptation (N1 + N2)"
slug: session-0500
type: session--implement
status: in-progress
created: 2026-07-05
updated: 2026-07-05
last_agent: claude-session-0500
sprint: S50
pairs_with:

  - docs/knowledge/wiki/goals-ledger.md
  - docs/protocols/cody-preflight.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0500 — G-004 BBLApp feature adaptation (N1 + N2)

## Date

2026-07-05

## Goal

G-004 — swap the verified instructor/school creatable-combobox into the post-claim
profile-enhancement wizard (N1); member-dashboard ports (N2). Read-and-translate, no Playwright port.

---

## Lane B (N1) — Cody pre-flight: profile-enhancement-wizard instructor/school combobox

### 1. Existing component scan
- Searched `components/common/` for: `creatable-combobox`, `CreatableCombobox`, `CreatableValue`, `CreatableOption`
- Searched `components/web/` for: `profile-enhancement`, `wizard`, `combobox`, instructor/school inputs
- Found (REUSE, do not rebuild):
  - `components/common/creatable-combobox.tsx` — the ONE creatable combobox primitive. Props:
    `options: CreatableOption[]`, `value: CreatableValue`, `onValueChange`, `allowCustom?`,
    `placeholder?`, `searchPlaceholder?`, `emptyMessage?`, `renderCreateLabel?`, `clearable?`,
    `clearLabel?`, `size?` (ButtonProps size, defaults `lg`), `disabled?`, `id?`.
    `CreatableOption = { id, name, content? }`; `CreatableValue = { id: string|null, label: string }`.
    `EMPTY_CREATABLE_VALUE` exported.
  - The verified usage to port FROM: `app/(web)/lineage/join/join-legacy-wizard/lineage-step.tsx`'s
    `CreatableField` — binds the combobox to TWO form fields (text label + id ref). Writes BOTH on
    change: `field.onChange(next.label)` + `form.setValue(idName, next.id ?? "")`.
  - Steward-side render of the resulting typed refs: `app/app/leads/[id]/_components/lead-lineage-selections.tsx`
    and `app/app/lineage/claims/[id]/_components/claim-review-detail.tsx` (lines 129+, ungated on type).
  - Options source: `server/web/lineage/join-options.ts` → `getJoinWizardOptions()` (cached 300s;
    `schools` = Organization.id, `instructors` = LineageNode.id).

### 2. L1 template scan
- The combobox itself is the L1 primitive (`components/common/creatable-combobox.tsx`); no Dirstarter
  template equivalent — this is a repo-native primitive (ADR 0036 claim-wiring, SESSION_0441).
- Primitive API spot-check done above (§1).
- WL-P3-24 debt check: the primitive renders its own trigger (`Button` via `PopoverTrigger render`),
  dropping FormControl's slot wiring. In the join wizard this is handled by wrapping the combobox in
  a `FormItem`/`FormControl` around a hidden text field. **This wizard uses bare `Label` + `DataSelect`
  (NOT react-hook-form's `FormField`/`FormControl`)** — it is a plain `useForm` with `form.register` /
  `form.watch` / `form.setValue`. So FormControl slot wiring is NOT in play here → WL-P3-24 does not
  bite. I bind the combobox to `form.watch`/`form.setValue` directly (the DataSelect pattern already
  used at line 222-231), no FormControl.

### 3. Composition decision
- [x] Composing existing components: `CreatableCombobox` (primitive) driven by the wizard's existing
  `useForm` state, mirroring the `DataSelect` binding already in the belt step. NO new component,
  NO new storage shape.

### 4. Lane docs loaded
- [x] Goals ledger § G-004 read (N1 = swap verified combobox into post-claim wizard)
- [x] Memory `creatable-combobox-and-typed-claim-refs`: selectors store ref-id + text; refs = typed FK cols
- [x] Memory `belt-picker-id-space-p2003` (SESSION_0497): instructor picker is NODE-keyed
  (`trainedUnderNodeId`), belt promoter picker is PASSPORT-keyed (`awardedByPassportId`). DO NOT merge.

### 5. Dev environment confirmed
- Dev server: `cd apps/web && npx next dev --turbo -p 3500` (FS-0002), bg output → file (SIGPIPE trap)
- Working directory: `apps/web/`
- Host for testing: `localhost:3500` (dev-login as admin)
- Verification: `bun run typecheck`, `bun run lint` (FIXER), `bunx oxfmt --check .`, `bun run test`
- No test file rewrite planned beyond extending `actions.safe-action.test.ts` for the new refs.

### 6. FAILED_STEPS check
- Prior failures in this area: SESSION_0497 P2003 (belt picker id-space) — mitigated: the wizard's
  claim path uses `trainedUnderNodeId` (NODE id, from `join-options.instructors`) + `claimedSchoolId`
  (Organization id, from `join-options.schools`), matching `PassportClaimRequest`'s existing FK columns
  exactly. I do NOT touch the belt promoter (passport-keyed) FK — that's N2 territory.
- Mitigation acknowledged: yes.

### Storage-shape decision (N1)
- The wizard action `setPassportRank` files a **RANK_PROMOTION `PassportClaimRequest`** (B1, ADR 0035
  Amdt 1) — NOT a `RankAward`. `PassportClaimRequest` already carries `claimedSchoolId` (→Organization)
  and `trainedUnderNodeId` (→LineageNode) FK columns (SESSION_0441). **No migration.**
- School → `claimedSchoolId` (Organization.id, `join-options.schools`).
- Instructor → `trainedUnderNodeId` (LineageNode.id, `join-options.instructors`).
- Custom (typed) entries leave the ref null; the text still rides `claimantNote` (as today).
- ⚠ NUANCE for Doug/N2: `finalizeRankPromotion` (the RANK_PROMOTION approve path) does NOT consume
  these two refs (only `finalizePassportClaim`, the IDENTITY path, materializes the Affiliation +
  INSTRUCTOR_STUDENT edge). For a RANK_PROMOTION claim the refs are **steward-display**: they render
  as resolved verifiable links in `claim-review-detail.tsx` (ungated on type) instead of raw free
  text. Strictly better than the current free-text `promotedBy`/`schoolName` note, and it matches the
  settled typed-ref shape — but it does not auto-wire lineage on promotion approve. Flagged, not fixed
  (out of N1 scope).
