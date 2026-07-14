---
title: Human Code Runbook — WordPress/Pods → TypeScript map
slug: human-code-runbook
type: reference
status: active
created: 2026-06-09
updated: 2026-07-14
last_agent: claude-session-0535
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
new TypeScript app. It answers one question: _"the data I knew as a Pod field — where does it live now?"_
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

| Pod field               | New home                                                  | Notes                                                               |
| ----------------------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| `full_name`             | `User.name` (+ `Passport.legalFirstName`/`legalLastName`) | `Passport.displayName` is the public name                           |
| `email_address`         | `User.email`                                              | Imports with no login get a synthetic placeholder + `isPlaceholder` |
| `bio` / `biography`     | `Passport.bio`                                            |                                                                     |
| `cover_photo`           | `Passport.coverPhotoUrl`                                  | identity media lives on Passport                                    |
| profile photo           | `Passport.avatarUrl`                                      | preferred over `User.image` everywhere                              |
| intro video             | `Passport.videoIntroUrl`                                  |                                                                     |
| `date_of_birth`         | `Passport.dob`                                            |                                                                     |
| `place_of_birth`        | `Passport.placeOfBirth`                                   |                                                                     |
| `white_belt_start_date` | `Passport.startedTrainingAt`                              | when they began training                                            |

## `bbl_member` belt fields → promotions (`RankAward`, one per belt)

Each belt group (`*_belt_promotion_date`, `who_promoted_you_to_*`, `where_you_were_promoted_to_*`,
`*_belt_pictures`) becomes **one `RankAward`** for that `Rank` (RankAward is the canonical promotion fact,
[ADR 0016](../../architecture/decisions/0016-lineage-promotion-source-of-truth.md)):

| Pod field                                                        | New home                                                                     |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `<belt>_promotion_date`                                          | `RankAward.awardedAt` (with `rank` = that belt)                              |
| `who_promoted_you_to_<belt>` / `name_of_coaches_that_gave_you_…` | `RankAward.awardedBy` **and/or** the lineage `PROMOTED_BY` edge              |
| `where_you_were_promoted_to_<belt>`                              | `RankAward.location` (free text) or `RankAward.organization` (linked school) |
| `<belt>_pictures`                                                | `RankAward.mediaUrls`                                                        |

Imported promotions are `source = STATED`, `verificationStatus = IMPORTED`. The person's **current belt is
derived** — the highest **awarded** belt by rank order (`Rank.sortOrder`) — never stored as a single field.
Whether that belt is _verified_ is a **separate yes/no flag** (`LineageNode.isVerified`), not a filter on which
belt shows; the per-award `verificationStatus` column is **not used for display** (ADR 0035; SESSION_0474). See
§8 below for the full walkthrough.

## `bbl_member` school → `Affiliation`

| Pod field                     | New home                                                                                                | Notes                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `current_school` / `home_gym` | `Affiliation` → linked `Organization` or free-text `schoolName`, `role = TRAINS_AT`, `isCurrent = true` | the **canonical** school axis — NOT `Membership` (that's Baseline enrollment) |
| `name_of_coaches`             | lineage `PROMOTED_BY` / instructor relationships                                                        | who taught/promoted them                                                      |

## `bbl_school` → `Organization`

| Pod field                                      | New home                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `name_of_school`                               | `Organization.name`                                                              |
| `school_location_address`                      | `Organization.addressLine1` / `city` / `state` / `country`                       |
| `owner_names`                                  | claimed via `Organization.ownerId` (profile-claim, ADR 0023); else shown as text |
| `history_biography_of_school`                  | `Organization.description`                                                       |
| `school_logo`                                  | Organization media attachment                                                    |
| `phone_number` / `email_address`               | `Organization.phoneE164` / contact fields                                        |
| `facebook/instagram/youtube_…_school`, website | `Organization.websiteUrl` + social links                                         |

## Putting a person on the family tree

The WordPress site implied lineage through "who promoted you" text. The new app makes it a real graph:
a person becomes a **`LineageTreeMember`** of a brand's `LineageTree`, hung under a **visual parent**, and
the promotion becomes a **`PROMOTED_BY` `LineageRelationship`** that references the `RankAward`. The admin
**add-person** flow (`/admin/users/new`) creates the whole set in one step — see
[ADR 0025](../../architecture/decisions/0025-passport-identity-source-of-truth.md).

## TypeScript — a learning guide for this codebase

> For a reader new to TypeScript who will read (and write) code here. Not a generic tutorial — TS **as used in
> this repo**. (Note: the identity _map_ above is the current User-rooted shape; it shifts to **person-rooted**
> in `BBL-SOT-Spec.md` Phase 3 — `SOT-ADR.md` D1. The TS concepts below don't change.)

### 1. TypeScript in one breath

TypeScript is JavaScript **plus a type layer the compiler checks before the code runs**. At runtime it is plain
JS — **all the types are erased**. So types catch mistakes _while you write_ (wrong field name, a missing
argument, a value that might be `null`), but they do not exist when the app actually runs. A `.ts` file holds
logic and types; a `.tsx` file adds JSX (React markup). "It type-checks" ≠ "it works" — it means "the shapes
line up"; you still prove behavior with tests and the live app.

### 2. The vocabulary you'll actually meet

| You'll see                                   | It means                                                                | Example in this repo                                          |
| -------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| `type X = { a: string }`                     | a named object **shape**                                                | `type LineageProfile = { id: string; ... }`                   |
| `a?: string`                                 | **optional** — may be `undefined`                                       | `displayName?: string`                                        |
| `string \| null`                             | **union** — "this OR that"                                              | `image: string \| null`                                       |
| `"STATED" \| "EARNED"`                       | **string-literal union** — a fixed allowed set (enum-like)              | `RankAwardSource`                                             |
| `as const`                                   | freeze a value to its exact literal type                                | `["admin"] as const` (roles)                                  |
| `<T>` (generic)                              | a **type parameter** — "works for any T the caller plugs in"            | `ensurePersonShells<T>`, RHF forms                            |
| `T extends FieldValues`                      | a **constraint** — "T must be at least a FieldValues"                   | `form-media.tsx`                                              |
| `Pick<T,"a">` / `Omit<T,"a">` / `Partial<T>` | build a new type from another (subset / minus / all-optional)           | `userSchema.pick({ id: true })` (Zod analog)                  |
| `import type { X }`                          | import **only the type** (erased; no runtime import)                    | top of most server files                                      |
| `z.infer<typeof schema>`                     | derive a **static type from a Zod schema**                              | `type CreatePersonInput = z.infer<typeof createPersonSchema>` |
| `Prisma` types (`User`, `Passport`)          | **auto-generated** from `schema.prisma`                                 | `import type { User } from "~/.generated/prisma/client"`      |
| `keyof` / `typeof` / `await`                 | "the keys of" / "the type of this value" / unwrap a `Promise<X>` to `X` | everywhere                                                    |

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
  `T` is _that specific form's_ value shape." `extends` here = a **constraint**, not inheritance.
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

A real symptom (SESSION*0451): in the admin, picking someone's belt rank said "saved," but leaving and
returning showed "no rank" again. It \_looked* like the save failed. It hadn't — the database had the rank the
whole time. The page was showing a **remembered (cached) copy** because the code that says "forget the cached
page after a save" (`revalidatePath`) pointed at the wrong web address (a retired one). WordPress analogy: you
edited the post and it saved, but the site cache kept serving the old version until cleared. **What this teaches:
"it saved but didn't show" ≠ "it didn't save."** First check whether the _view_ refreshed (a cache/`revalidatePath`
issue), before suspecting the save. A hard browser refresh that shows the new value is the tell — the data was
there all along. (See `[[admin-app-migration-revalidate-paths]]` and the glossary "Router Cache" entry.)

### 8. Worked example — how one person's belt renders on every surface (SESSION_0474)

This session fixed a real bug: **David Meyer showed "Black Belt – 5th Degree" in the honor strip but "Coral
Belt – 7th Degree" on his card** — the same person, two different belts on the same page. Walking through _why_
teaches the single most important pattern in the lineage code: **one read-model, read everywhere.**

**Idea 1 — the current belt is DERIVED, never stored.** There is no `currentBelt` column. A person has many
`RankAward` rows (one per promotion); the belt you _see_ is **computed** = their highest awarded rank.
(WordPress analogy: instead of a `current_belt` Pod field you keep hand-updating, the site always recomputes it
from the promotion list — so it can never go stale or disagree with the record.) The function:

```ts
// lib/lineage/canvas-model.ts
export function memberTopRank(node) {
  return node.passport?.rankAwardsEarned?.[0]?.rank ?? null; // [0] = highest; the query sorts that way
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
  return {
    displayName,
    avatarSrc,
    beltColor,
    rankLabel, // ← belt fields all come from memberTopRank
    schoolLabel,
    trustStatus,
    claimBadgeStatus,
  };
}
```

Every surface now calls `resolveLineageMemberView(node)` and renders what it returns. **One place decides how a
person looks; change the rule once, every surface updates.**

**The bug, exactly.** The honor strip ("Top ranked") and the canvas tree were NOT reading `memberTopRank`. They
read a _different, deprecated_ field — `selectedRank` — a leftover "pick which belt to display" override that
still pointed at Meyer's old WordPress-import belt (Black 5th) instead of his real top award (Coral 7th). So the
honor strip disagreed with his card. **The fix was essentially one line each: make those two surfaces read the
same resolver as everyone else.** That is the whole lesson — _when every surface reads one source they cannot
disagree; the moment one surface reads its own field, it drifts._

**Idea 3 — "verified" is ONE flag, not many.** "Is this person's rank verified?" = a single field,
`LineageNode.isVerified` (true/false) → shown as one **Verified / Unverified** chip. It is NOT computed per
award. (We briefly tried a per-award `verificationStatus` and it made founders show "Verified AND Unverified" at
once — two sources disagreeing _again_. We deleted it.) One question, one field, one answer everywhere.

**The pattern to take away:** for any "what do we show for X?" question, find the **one** function that answers
it and make every surface call that function. If you ever see two places showing different things for the same
record, the cause is almost always _two of them reading two different fields_ — and the fix is never "patch the
wrong one," it's "point them both at the one source." (Same family as §7's cache lesson; canon:
[ADR 0035](../../architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md),
[`lineage-data-wiring-flow`](../../product/black-belt-legacy/lineage-data-wiring-flow.md), `[[lineage-rank-display-awarded-truth]]`.)

### 9. "It's green" vs "it works" — and why you still have to click the thing

> The compiler and the tests are your two robots. They are fast and tireless and they **cannot see your app.**

- **Typecheck** = "do the puzzle pieces _fit_?" (right field names, no missing values). It never runs your app.
- **Tests** = "does the _logic_ do what I said — for the situations I thought of?" They run tiny pieces against
  _made-up_ data. They cannot see the real database, an _empty_ result, or a page nobody wired up.
- **`next build`** = "will it _compile_ for production?" Catches a few things the fast typecheck misses, still
  never opens a browser.
- **The live app** = the only thing that checks _the actual journey, on the actual data, on the actual screen._

The WordPress parallel: a plugin can activate with no PHP errors (green) and still show a blank widget because
the _content_ isn't there, or the template never calls it. "No errors" was never "it works." Real examples from
this codebase, all **100% green** when they broke: a blog page that built and rendered locally but shipped
**empty** (posts are DB rows; the push doesn't carry data); a family-tree page that rendered **nothing** for a
member with no ancestry data yet; a brand-new admin page that passed 1,366 tests and was **completely
unreachable** because an old redirect sent the URL elsewhere before the page loaded. **What to do:** after "it's
green," drive the real thing — open the page, click the actual flow, on real data; for a locked/paid surface,
check what the _server actually sent_, not just what the screen hides. "Done" means "I watched it work." When
something looks broken, reproduce it live first — half the time "broken" is "built, works, just unreachable" (a
10-minute fix, not a rebuild). (Canon: `[[green-isnt-verified]]` — Learning Record 0009.)

### 10. Why a locked video has _no URL at all_ (the freemium / no-leak model)

> The senior way to hide something isn't to _cover_ it — it's to never hand it out.

Technique videos are **freemium**: some are free, most are locked. The lock is decided by the **viewer** — "are
_you_ entitled to watch this?" (a paid tier, the admin, or the clip's own author) — not by the owner. The one
helper that answers it is `isTechniqueViewerEntitled` (`server/web/techniques/technique-access.ts`).

Here's the counter-intuitive part. For a locked clip we do **not** send the video's address to the browser and
hide it with CSS. We make sure the page is **never even given the address.** Look at the locked shape in
`server/web/techniques/technique-media-gate.ts`: `LockedTileMedia` literally has **no `url` field** — and no
YouTube poster either (`thumbnailUrl: null`). Why kill the poster too? A YouTube thumbnail's address _contains
the video id_, and the id rebuilds the watch link — so for an unlisted premium clip **the poster IS the
content.** The gate strips the url and the thumbnail server-side, and the _type itself_ has no slot for them, so
no render branch can ever emit a src.

WordPress analogy: not "load the paid post, then hide it with CSS" — but "never query the paid post into the page
in the first place." Why build it this way: if the address isn't in the response, no amount of clever
inspecting-the-page can reveal it. The leak is **impossible**, not merely hidden. (This is the human version of
Learning Record 0010, "make the wrong state unrepresentable.")

### 11. Every admin list is the same table with different columns (the AdminCollection law)

Every staff "list of things" page — People, Schools, Techniques, Organizations, Claims, Blog posts — is the
**same table component**: `AdminCollection` (`components/admin/admin-collection.tsx`). You don't rebuild the
table. You pick your **columns** and write **one query**, and you get sorting, filtering, pagination, faceted
search, and select-checkboxes for free. A row opens a **detail page**, which opens the **one editor** for that
kind of thing (for a person, the single `PassportEditor`).

Look at two that already conform: `app/app/claims/_components/claims-table.tsx` and
`app/app/techniques/_components/techniques-table.tsx` — both are just `<AdminCollection ...>` with their own
columns and data. The frame owns the frame; the columns, the query, and the row actions stay with the caller.

WordPress analogy: it's the admin list-table you already know from custom post types — same table UI everywhere,
only the columns change per type. Why it matters: "make a new admin screen" shrinks to a tiny job, and every
admin screen looks and behaves the same, so there's nothing new to learn per screen. The rule (the operator's
500-session north star, ratified in
[ADR 0045](../../architecture/decisions/0045-admin-collection-one-surface-law.md)): **never hand-roll a bespoke
admin list — conform to the one frame.** A single-record _settings_ form (like Appearance) is deliberately not an
`AdminCollection`; that frame is for _lists_. (This is the one-source-of-truth idea from §8, applied to admin
screens.)

### 12. How a belt gets _verified_ (the RankEntry model) — companion to §8

§8 explained how a belt is **displayed** (the highest awarded rank, computed). This section explains how a belt
becomes **verified** — a different question.

A belt is a **fact**: a promotion record. In the schema that record is a `RankEntry` (with a `RankAward` row
still underneath it as the migration anchor — mid-transition; see the caveat below). "Is this belt verified?" is
a **separate yes/no** carried on that record, not part of _which_ belt shows. The status ladder is
`PENDING | UNVERIFIED | VERIFIED | DISPUTED` (`RankEntryStatus`). A member who self-enters a belt starts
**UNVERIFIED**. A steward reviewing the member's claim (a `RankEntryReview`) turns it **VERIFIED**. Historical
belts brought over from the old site count as verified-by-import (`RankAwardVerificationStatus.IMPORTED`).

Now the part that trips people up: there are **two facts that look like one but aren't.** "This _person_ is a
verified lineage member" is a single flag on the tree node (`LineageNode.isVerified`, from §8). "This _specific
belt_ is verified" is the status on the rank record above. They're different because some historical members are
well-documented (verified members) but have **no belt on file** — so both facts have to exist independently.

WordPress analogy: the old site had a belt field _and_ a separate "is this confirmed?" checkbox — same idea, but
now the confirmation is a real approval step (a steward review), not a manual toggle anyone can flip. **Caveat to
follow the code, not this summary:** the repo is mid-migration — `RankEntry` is the canonical target aggregate,
but the _display_ path in §8 still reads `RankAward` today, and there's also a per-award `verificationStatus` that
is **not** used for the display badge. If the model names shift under you, trust the schema
(`apps/web/prisma/schema.prisma`) and `rank-entry-unified-data-flow.md`.

### 13. Four kinds of "admin" that share words but not meaning (the authz axes)

"Admin," "permission," "role" — in this app those words name **four separate systems** that mean different
things. Don't merge them in your head:

1. **Platform role** — what you can do across the _whole_ app. This is the `can(user, "...")` / RBAC check
   (`server/orpc/permissions.ts`, keys in `server/orpc/roles.ts` `APP_AREA_PERMISSIONS`). `admin` = `"*"` (all
   of them).
2. **Membership role** — your standing _inside one school/org_ (Owner, Head Instructor). Local to that org, not
   the platform.
3. **Lineage access** — a grant to edit _part of the family tree_ (`TREE_ADMIN`, `TREE_EDITOR`, `BRANCH_EDITOR`,
   `NODE_EDITOR`; `LINEAGE_RESOURCE_GRANTS` in `roles.ts`).
4. **Commerce entitlement** — what your _paid tier_ unlocks (Premium/Elite/Legend rich media, etc.).

A person can be high on one axis and zero on another (a school Owner with no platform role; a paying member who
can't edit anything). The tempting mistake is to **merge them** because they all sound like "permissions" — but
they answer different questions, so the codebase deliberately keeps four and **forbids building a fifth**. When a
new capability is needed, you add a _key_ to an existing axis (the FI-019 precedent), never a new system.

WordPress analogy: not one "user role" dropdown, but **four independent capability systems** layered together.
(This is the human version of Learning Record 0011's "DRY polices _knowledge_, not similar-looking _shapes_ —
different axes doing different jobs don't merge"; ratified verdict at SESSION_0509: keep the four layered,
conform them, don't consolidate.)

### 14. The environment traps that look like bugs (but aren't your code)

> When something breaks in a way that makes no sense, check this list _before_ blaming your code.

A short field guide to gotchas that _look_ like your code failed but are really the environment or the tooling.

- **(a) The shared-database migrate trap (0487).** Several work-copies (git worktrees) share **one** local
  database. So the ordinary "create a migration" dev command can try to **reset** it — wiping everyone. Here,
  migrations are **hand-written** and replayed on a throwaway database instead. If a migrate command offers to
  reset, stop; that's the trap, not a broken schema.
- **(b) `bun run lint` edits your files (0493).** In `apps/web`, lint is the _fixing_ variant, not just the
  checking one. It can silently rewrite files — so a git diff can show "phantom" changes you never typed. If
  files changed and you didn't touch them, suspect the linter before suspecting a bug.
- **(c) The id-mixup hidden by a swallowed error (0497).** There are two different id systems — a family-tree
  **node** id and a person's **Passport** id — and both are just text. So putting one where the other belongs
  slips _past_ the type-checker and only blows up at runtime, often buried under a blanket "something went wrong"
  toast (`P2003`). The fix is to read the id from the _matching_ source, never to translate one into the other
  inside the handler.
- **(d) A rebase needs a reinstall (0490).** After you pull in other people's work, someone may have added a new
  dependency. Until you re-run `bun install`, the type-checker will fail on a file you _never touched_ — because
  the package it imports isn't on disk yet. After any rebase that touches `package.json`/`bun.lock`, reinstall.
- **(e) Form buttons that don't submit (0520).** The UI kit's buttons default to a **non-submitting** type
  (`type="button"`). So a form can silently do _nothing_ on click until its primary button is explicitly told
  `type="submit"`. One sweep found 19 forms with this — including a feedback widget mouse users could never send.
  "The form does nothing and throws no error" is almost always this.

### 15. How "who can post / who can author" is decided — the capability gate (companion to §13, SESSION_0535)

§13 said the app has four permission systems and **forbids a fifth**. Here's how a _new_ "can this person do
X?" question gets answered _on top of_ those four — the pattern you'll see repeated.

**The participation ladder.** Paid tiers unlock actions in steps: a **Free** member can _read_ the community;
a **Premium** member can _create_ community posts; an **Elite** member can _author_ techniques. Each upgrade
earns the next verb. (SESSION*0535 / FI-028 tightened posting to Premium-and-up, so free members \_lost* it —
the composer now shows an "upgrade" panel where the post form used to be.)

**The capability gate.** Instead of a new system, each such question is _one small server function_ that
**combines the checks that already exist**: your platform role (§13.1), your school role (§13.2), and your
paid tier (§13.4). If any one says yes, you're in. You'll meet a whole family named the same way:

- `canCreateCommunityPostForUser` — may you post to the community? (`server/web/community/permissions.ts`)
- `canCreateTechniqueForUser` — may you author a technique?
- `canUploadMediaForUser` — may you upload media?

They're near-identical **on purpose** — that's §13's "no fifth system" rule in action.

Two non-obvious things worth carrying:

- **The lock is on the server, not the button.** Hiding the "New post" button is _not_ the gate — a free
  member could still call the server directly. The real gate lives inside the server action
  (`createCommunityPost`), which refuses _before it writes anything_. Button-hiding is only courtesy. So when
  you wonder "is this feature actually locked, or just hidden?", look for the check in the **server action**,
  never the component.
- **It checks the tier, not one exact key.** A paying member might be Premium, Elite, _or_ Legend — the gate
  accepts **any** paid tier, not just the literal "Premium" record, because _which_ key a paid plan writes is
  decided in the database, not fixed in code. (The story behind that one line is Learning Record 0015.)

WordPress analogy: not a single `can_publish` flag, but a small function that says "yes if you're an editor,
**or** staff at this school, **or** on any paid plan" — assembled fresh from the systems you already have.

## See also

- [Repo Truth Index → canonical-entity layer](../../knowledge/wiki/repo-truth-index.md) — entity → source-of-truth table.
- [Ubiquitous Language](../../architecture/ubiquitous-language.md) — domain term definitions.
- [Repo Code Glossary](../../knowledge/wiki/repo-code-glossary.md) — DTO, view-model, and other code terms.
