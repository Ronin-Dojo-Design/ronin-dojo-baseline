---
title: Human Code Runbook — WordPress/Pods → TypeScript map
slug: human-code-runbook
type: reference
status: active
created: 2026-06-09
updated: 2026-07-09
last_agent: claude-session-0474
pairs_with:
  - docs/knowledge/wiki/concepts/passport-and-shells.md
  - docs/knowledge/wiki/repo-truth-index.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/product/black-belt-legacy/lineage-data-wiring-flow.md
  - docs/architecture/ubiquitous-language.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - porting
  - onboarding
  - bbl
---

# Human Code Runbook — WordPress/Pods → TypeScript

Plain-English bridge for a reader who knows the **old Black Belt Legacy WordPress/Pods** site but not the
new TypeScript app. It answers one question: *"the data I knew as a Pod field — where does it live now?"*
Source Pods are listed in `RoninDashboard/context/BBL_PODS_SCHEMA.md` (monorepo); the new home is the
Prisma schema (`apps/web/prisma/schema.prisma`). Canonical model: [passport-and-shells](../../knowledge/wiki/concepts/passport-and-shells.md)
and [ADR 0025](../../architecture/decisions/0025-passport-identity-source-of-truth.md).

## The big picture

- A WordPress **Pod** ≈ a database table. Each **Pod field** ≈ a column.
- One `bbl_member` Pod row becomes **several** rows in the new app, because the new app splits a person
  into purpose-built pieces instead of one wide row: **identity** (`User` + `Passport`), **each belt** (a
  `RankAward`), **their school** (an `Affiliation`), and **their place on the family tree**
  (`LineageTreeMember` + a `PROMOTED_BY` edge).
- One `bbl_school` Pod row becomes an **`Organization`**.

## `bbl_member` → identity (`User` + `Passport`)

| Pod field | New home | Notes |
| --- | --- | --- |
| `full_name` | `User.name` (+ `Passport.legalFirstName`/`legalLastName`) | `Passport.displayName` is the public name |
| `email_address` | `User.email` | Imports with no login get a synthetic placeholder + `isPlaceholder` |
| `bio` / `biography` | `Passport.bio` | |
| `cover_photo` | `Passport.coverPhotoUrl` | identity media lives on Passport |
| profile photo | `Passport.avatarUrl` | preferred over `User.image` everywhere |
| intro video | `Passport.videoIntroUrl` | |
| `date_of_birth` | `Passport.dob` | |
| `place_of_birth` | `Passport.placeOfBirth` | |
| `white_belt_start_date` | `Passport.startedTrainingAt` | when they began training |

## `bbl_member` belt fields → promotions (`RankAward`, one per belt)

Each belt group (`*_belt_promotion_date`, `who_promoted_you_to_*`, `where_you_were_promoted_to_*`,
`*_belt_pictures`) becomes **one `RankAward`** for that `Rank` (RankAward is the canonical promotion fact,
[ADR 0016](../../architecture/decisions/0016-lineage-promotion-source-of-truth.md)):

| Pod field | New home |
| --- | --- |
| `<belt>_promotion_date` | `RankAward.awardedAt` (with `rank` = that belt) |
| `who_promoted_you_to_<belt>` / `name_of_coaches_that_gave_you_…` | `RankAward.awardedBy` **and/or** the lineage `PROMOTED_BY` edge |
| `where_you_were_promoted_to_<belt>` | `RankAward.location` (free text) or `RankAward.organization` (linked school) |
| `<belt>_pictures` | `RankAward.mediaUrls` |

Imported promotions are `source = STATED`, `verificationStatus = IMPORTED`. The person's **current belt is
derived** — the highest **awarded** belt by rank order (`Rank.sortOrder`) — never stored as a single field.
Whether that belt is *verified* is a **separate yes/no flag** (`LineageNode.isVerified`), not a filter on which
belt shows; the per-award `verificationStatus` column is **not used for display** (ADR 0035; SESSION_0474). See
§8 below for the full walkthrough.

## `bbl_member` school → `Affiliation`

| Pod field | New home | Notes |
| --- | --- | --- |
| `current_school` / `home_gym` | `Affiliation` → linked `Organization` or free-text `schoolName`, `role = TRAINS_AT`, `isCurrent = true` | the **canonical** school axis — NOT `Membership` (that's Baseline enrollment) |
| `name_of_coaches` | lineage `PROMOTED_BY` / instructor relationships | who taught/promoted them |

## `bbl_school` → `Organization`

| Pod field | New home |
| --- | --- |
| `name_of_school` | `Organization.name` |
| `school_location_address` | `Organization.addressLine1` / `city` / `state` / `country` |
| `owner_names` | claimed via `Organization.ownerId` (profile-claim, ADR 0023); else shown as text |
| `history_biography_of_school` | `Organization.description` |
| `school_logo` | Organization media attachment |
| `phone_number` / `email_address` | `Organization.phoneE164` / contact fields |
| `facebook/instagram/youtube_…_school`, website | `Organization.websiteUrl` + social links |

## Putting a person on the family tree

The WordPress site implied lineage through "who promoted you" text. The new app makes it a real graph:
a person becomes a **`LineageTreeMember`** of a brand's `LineageTree`, hung under a **visual parent**, and
the promotion becomes a **`PROMOTED_BY` `LineageRelationship`** that references the `RankAward`. The admin
**add-person** flow (`/admin/users/new`) creates the whole set in one step — see
[ADR 0025](../../architecture/decisions/0025-passport-identity-source-of-truth.md).

## TypeScript — a learning guide for this codebase

> For a reader new to TypeScript who will read (and write) code here. Not a generic tutorial — TS **as used in
> this repo**. (Note: the identity *map* above is the current User-rooted shape; it shifts to **person-rooted**
> in `BBL-SOT-Spec.md` Phase 3 — `SOT-ADR.md` D1. The TS concepts below don't change.)

### 1. TypeScript in one breath

TypeScript is JavaScript **plus a type layer the compiler checks before the code runs**. At runtime it is plain
JS — **all the types are erased**. So types catch mistakes *while you write* (wrong field name, a missing
argument, a value that might be `null`), but they do not exist when the app actually runs. A `.ts` file holds
logic and types; a `.tsx` file adds JSX (React markup). "It type-checks" ≠ "it works" — it means "the shapes
line up"; you still prove behavior with tests and the live app.

### 2. The vocabulary you'll actually meet

| You'll see | It means | Example in this repo |
| --- | --- | --- |
| `type X = { a: string }` | a named object **shape** | `type LineageProfile = { id: string; ... }` |
| `a?: string` | **optional** — may be `undefined` | `displayName?: string` |
| `string \| null` | **union** — "this OR that" | `image: string \| null` |
| `"STATED" \| "EARNED"` | **string-literal union** — a fixed allowed set (enum-like) | `RankAwardSource` |
| `as const` | freeze a value to its exact literal type | `["admin"] as const` (roles) |
| `<T>` (generic) | a **type parameter** — "works for any T the caller plugs in" | `ensurePersonShells<T>`, RHF forms |
| `T extends FieldValues` | a **constraint** — "T must be at least a FieldValues" | `form-media.tsx` |
| `Pick<T,"a">` / `Omit<T,"a">` / `Partial<T>` | build a new type from another (subset / minus / all-optional) | `userSchema.pick({ id: true })` (Zod analog) |
| `import type { X }` | import **only the type** (erased; no runtime import) | top of most server files |
| `z.infer<typeof schema>` | derive a **static type from a Zod schema** | `type CreatePersonInput = z.infer<typeof createPersonSchema>` |
| `Prisma` types (`User`, `Passport`) | **auto-generated** from `schema.prisma` | `import type { User } from "~/.generated/prisma/client"` |
| `keyof` / `typeof` / `await` | "the keys of" / "the type of this value" / unwrap a `Promise<X>` to `X` | everywhere |

You rarely **hand-write** types here — you **derive** them (from Prisma, from Zod, from libraries). That's the
single most important habit: one source of truth, the type follows.

### 3. The data's journey — "what goes where"

The most useful mental model: data flows through typed stages, each living in **its own file**. Every arrow is a
type boundary the compiler checks.

```text
prisma/schema.prisma          ── Prisma generates the DB types (User, Passport, RankAward …)
        │
server/<entity>/schema.ts     ── Zod input schema (RUNTIME validation) + `z.infer` → its static type
        │
server/<entity>/actions.ts    ── (today) the mutation: validate input → write DB        ┐ "WRITES"
server/<entity>/router.ts     ── (oRPC, Phase 1) same job as a procedure + `can()` gate  ┘
server/<entity>/queries.ts    ── the READS (fetch from DB)
        │
server/<entity>/payloads.ts   ── the DTO: the ALLOWLISTED shape sent to the client (public-safe projection)
        │
components/.../*.tsx          ── the UI consumes the payload (the "view-model") and renders it
```

So "what goes where": **validation** → `schema.ts`; **writes** → `actions.ts`/`router.ts`; **reads** →
`queries.ts`; **the safe client shape** → `payloads.ts`; **rendering** → components. A **DTO** (payload) exists
so the database row never leaks to the browser — you hand-pick the public fields. A **view-model** is just
"the shape a component expects to render."

### 4. Worked example — the generics in `form-media.tsx` (your open file)

```ts
type FormMediaProps<T extends FieldValues> = ... & {
  form: UseFormReturn<T>
  field: ControllerRenderProps<T, FieldPath<T>>
}
```

- `<T extends FieldValues>` — "this component works for **any** form whose values are an object (`FieldValues`).
  `T` is *that specific form's* value shape." `extends` here = a **constraint**, not inheritance.
- `UseFormReturn<T>` — react-hook-form's typed form object, **specialized to your form `T`**, so
  `form.setValue("name", …)` only accepts real fields of `T`.
- `FieldPath<T>` — the **union of valid field names** of `T` (e.g. `"name" | "email"`). Typo a field → compile
  error. This is the payoff: the types make wrong field names impossible.
- `ControllerRenderProps<T, FieldPath<T>>` — the props RHF hands to one controlled field.
- These types ship **inside** `react-hook-form` (it's authored in TS). The "no type declarations" error you saw
  is **only** because the `dirstarter_template` copy has no `node_modules` installed — see "the big picture"
  above; in `apps/web` (installed) it resolves.

### 5. How to read a type error (don't panic)

Read it **bottom-up**: the last `Type 'X' is not assignable to type 'Y'` line is usually the real mismatch; the
lines above show the path to it. The three you'll hit most:

- **`string | null` where `string` is wanted** → handle the null (`value ?? ""`, or an `if (value)` guard).
- **wrong/abbreviated field name** → check the Zod schema or the Prisma model for the real name.
- **`Promise<X>` where `X` is wanted** → you forgot `await`.

### 6. Where types come from (no magic)

Three sources feed almost everything: **(a) Prisma** generates entity types from `schema.prisma`;
**(b) Zod** schemas give runtime validation **and** a static type via `z.infer` (one definition, both jobs);
**(c) libraries** (react-hook-form, oRPC) ship their own. When in doubt, follow a value back to one of these three.

### 7. When a save "doesn't stick" — it's usually the cache, not the database

A real symptom (SESSION_0451): in the admin, picking someone's belt rank said "saved," but leaving and
returning showed "no rank" again. It *looked* like the save failed. It hadn't — the database had the rank the
whole time. The page was showing a **remembered (cached) copy** because the code that says "forget the cached
page after a save" (`revalidatePath`) pointed at the wrong web address (a retired one). WordPress analogy: you
edited the post and it saved, but the site cache kept serving the old version until cleared. **What this teaches:
"it saved but didn't show" ≠ "it didn't save."** First check whether the *view* refreshed (a cache/`revalidatePath`
issue), before suspecting the save. A hard browser refresh that shows the new value is the tell — the data was
there all along. (See `[[admin-app-migration-revalidate-paths]]` and the glossary "Router Cache" entry.)

### 8. Worked example — how one person's belt renders on every surface (SESSION_0474)

This session fixed a real bug: **David Meyer showed "Black Belt – 5th Degree" in the honor strip but "Coral
Belt – 7th Degree" on his card** — the same person, two different belts on the same page. Walking through *why*
teaches the single most important pattern in the lineage code: **one read-model, read everywhere.**

**Idea 1 — the current belt is DERIVED, never stored.** There is no `currentBelt` column. A person has many
`RankAward` rows (one per promotion); the belt you *see* is **computed** = their highest awarded rank.
(WordPress analogy: instead of a `current_belt` Pod field you keep hand-updating, the site always recomputes it
from the promotion list — so it can never go stale or disagree with the record.) The function:

```ts
// lib/lineage/canvas-model.ts
export function memberTopRank(node) {
  return node.passport?.rankAwardsEarned?.[0]?.rank ?? null   // [0] = highest; the query sorts that way
}
```

`[0]` is the top because the database query asks for the awards **sorted highest-belt-first, take 1**:

```ts
// server/web/lineage/payloads.ts  (the DTO / payload — §3's "safe client shape")
rankAwardsEarned: {
  orderBy: [{ rank: { sortOrder: "desc" } }, { awardedAt: "desc" }],
  take: 1,
}
```

**Idea 2 — ONE resolver feeds every surface.** A person appears on ~6 surfaces (the board card, the dense child
rows, the mobile list, the cinematic timeline, the drawer). Before this session, each surface computed its own
avatar/belt/verified-badge — and they drifted apart. We collapsed them into **one function** that returns the
whole **view-model** (everything a surface needs to draw a person — §3):

```ts
// lib/lineage/canvas-model.ts — THE one ruleset
export function resolveLineageMemberView(node) {
  return { displayName, avatarSrc, beltColor, rankLabel,   // ← belt fields all come from memberTopRank
           schoolLabel, trustStatus, claimBadgeStatus }
}
```

Every surface now calls `resolveLineageMemberView(node)` and renders what it returns. **One place decides how a
person looks; change the rule once, every surface updates.**

**The bug, exactly.** The honor strip ("Top ranked") and the canvas tree were NOT reading `memberTopRank`. They
read a *different, deprecated* field — `selectedRank` — a leftover "pick which belt to display" override that
still pointed at Meyer's old WordPress-import belt (Black 5th) instead of his real top award (Coral 7th). So the
honor strip disagreed with his card. **The fix was essentially one line each: make those two surfaces read the
same resolver as everyone else.** That is the whole lesson — *when every surface reads one source they cannot
disagree; the moment one surface reads its own field, it drifts.*

**Idea 3 — "verified" is ONE flag, not many.** "Is this person's rank verified?" = a single field,
`LineageNode.isVerified` (true/false) → shown as one **Verified / Unverified** chip. It is NOT computed per
award. (We briefly tried a per-award `verificationStatus` and it made founders show "Verified AND Unverified" at
once — two sources disagreeing *again*. We deleted it.) One question, one field, one answer everywhere.

**The pattern to take away:** for any "what do we show for X?" question, find the **one** function that answers
it and make every surface call that function. If you ever see two places showing different things for the same
record, the cause is almost always *two of them reading two different fields* — and the fix is never "patch the
wrong one," it's "point them both at the one source." (Same family as §7's cache lesson; canon:
[ADR 0035](../../architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md),
[`lineage-data-wiring-flow`](../../product/black-belt-legacy/lineage-data-wiring-flow.md), `[[lineage-rank-display-awarded-truth]]`.)

## See also

- [Repo Truth Index → canonical-entity layer](../../knowledge/wiki/repo-truth-index.md) — entity → source-of-truth table.
- [Ubiquitous Language](../../architecture/ubiquitous-language.md) — domain term definitions.
- [Repo Code Glossary](../../knowledge/wiki/repo-code-glossary.md) — DTO, view-model, and other code terms.
