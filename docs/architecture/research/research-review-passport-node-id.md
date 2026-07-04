---
title: "Research-Review — Passport.id vs LineageNode.id: one id or two?"
type: research-review
persona: giddy
status: complete
created: 2026-07-04
last_agent: claude-session-0498
domain: lineage / identity
pairs_with:
  - apps/web/prisma/schema.prisma
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0037-lineage-branch-heads-and-visual-placement.md
  - docs/knowledge/wiki/concepts/passport-and-shells.md
  - docs/runbooks/domain-features/lineage-hub.md
backlinks:
  - docs/sprints/SESSION_0498.md
---

# Passport.id vs LineageNode.id — one id or two?

## TL;DR verdict — **KEEP SEPARATE. This is not a DRY violation.**

Two ids is the correct design. `LineageNode.passportId` is a foreign key doing its
ordinary job (pointing at the identity it projects), **not** duplicated data. Collapsing
`LineageNode.id` into `Passport.id` would fuse two aggregates with different lifecycles,
different cardinalities, and different populations, and would buy nothing — you would still
need the FK relationship, you would just have overloaded one of the two PKs to also mean
"the other thing." DRY is about *not storing the same fact twice*; a 1:1 FK stores a
**relationship** once. There is no redundant fact here.

**The rule (so this is never re-litigated):**
> A 1:1 FK is a relationship stored once, not a fact stored twice — `LineageNode` is a
> *position in the lineage graph* (its own lifecycle, edges, and tree membership) that
> *references* a `Passport` identity; sharing the PK would encode "every identity is a graph
> position," which is false for the ~majority of Passports that have no node.

---

## 1. The two models — fields, relations, lifecycle asymmetry

### `Passport` (`schema.prisma:1052`) — the identity aggregate root

Owns identity attributes: `displayName`, `legalFirstName/Last`, `dob`, `gender`, `phoneE164`,
emergency contact, `avatarUrl`, `bio`, `socialLinks`, `coverPhotoUrl`, `videoIntroUrl`,
`placeOfBirth`, `currentResidence`, `startedTrainingAt`. PK `id cuid(2)` (`:1053`).

- **`userId String? @unique`** (`:1081`) — nullable. An accountless Passport **is** the placeholder
  person (comment `:1100`). Identity exists before any account.
- Back-relations (the satellites it roots): `directoryProfile?`, **`lineageNode?`** (`:1102`),
  `affiliations[]`, `rankAwardsEarned[]`, `rankAwardsPromoted[]`, `fightRecords[]`,
  `categories[]`, `tags[]`, `bookmarks[]`, `mediaAttachments[]`, `claimRequests[]`.

Passport is the **identity source of truth** — ratified by ADR 0025 §1: *"`LineageNode` is the
lineage-graph projection of a person, not a second identity."*

### `LineageNode` (`schema.prisma:2673`) — the graph-position aggregate

Owns **graph/lineage** attributes, none of which are identity:
`visibility (LineageVisibility)`, `isVerified`, `verificationStatus (LineageVerificationStatus)`,
`slug @unique`, `bio`, **`archivedAt`** (its own soft-delete lifecycle), `createdAt/updatedAt`.
PK `id cuid(2)` (`:2674`).

- **`passportId String @unique`** + `onDelete: Cascade` (`:2688–2689`) — the 1:1 link. Comment
  `:2684`: *"Passport is the identity root; the claim flow attaches an account to this node's
  Passport, never moving the node."*
- Back-relations (what *targets the node id*): `relationshipsFrom[]` / `relationshipsTo[]`
  (edges), `ownedLineageTrees[]`, `treeMembers[]`, `accessGrants[]`, `claimRequests[]`,
  `pendingClaims[]`, `passportClaimRequests[]`, `trainedUnderInPassportClaims[]`.

### Cardinality and lifecycle — precisely

| Question | Answer | Evidence |
|---|---|---|
| Can a `LineageNode` exist without a `Passport`? | **No.** `passportId` is `@unique NOT NULL`. | `:2689` |
| Can a `Passport` exist without a `LineageNode`? | **Yes, and most do.** `lineageNode` back-relation is `?`. | `:1102` |
| Relationship shape | **1:0..1** — from Passport it is `1 → 0..1`; from Node it is `1 → 1`. Not symmetric 1:1. | `:1102`, `:2688` |
| Delete semantics | Deleting the Passport cascades the node. Deleting the node leaves the Passport untouched. | `onDelete: Cascade` on node's FK, `:2688` |

**Population asymmetry (the load-bearing fact):** the canonical `rigan-machado-lineage` tree
has **77 members** (ADR 0037 status note `:24`; lineage-hub `:106`). The Passport population is
the full BBL roster + directory people + Baseline placeholder persons — a superset an order of
magnitude larger. **Not everyone is in the lineage.** The set of `LineageNode`s is a *sparse
subset* of `Passport`s. (Live DB counts were not readable from the review checkout —
`@prisma/adapter-pg` was not installed there — but the 77-vs-many asymmetry is documented and
structurally guaranteed by the nullable back-relation.)

This asymmetry alone kills the "make the node PK = passport PK" idea: a shared PK implies a
1:1 total mapping. The mapping is 1:0..1. You cannot make one id serve both without either
(a) minting a node row for every Passport (false data — most people are not lineage positions),
or (b) leaving the "node id" meaningless for non-lineage Passports.

---

## 2. Blast radius of unifying the ids

**FK columns that target `LineageNode.id` today (9 relations across the schema):**

| Owner model | Column(s) | Line | onDelete |
|---|---|---|---|
| `LineageRelationship` | `fromNodeId`, `toNodeId` | 2716 / 2718 | Cascade |
| `LineageTree` | `ownerNodeId` | 2754 | SetNull |
| `LineageTreeMember` | `nodeId` (`@@unique[treeId,nodeId]`) | 2792 | Cascade |
| `LineageTreeAccess` | `nodeId` | 2863 | Cascade |
| `LineageClaimRequest` | `nodeId` | 2887 | Cascade |
| `LineagePendingClaim` | `nodeId` (`@@unique[email,nodeId]`) | 2925 | Cascade |
| `PassportClaimRequest` | `nodeId`, `trainedUnderNodeId` | 3057 / 3080 | SetNull |

**FK columns that target `Passport.id` today (8 owners):** `Bookmark` (`:373`),
`DirectoryProfile` (`:1132`), `Affiliation` (`:1451`), **`RankAward`** (`:2168`),
`LineageNode` (`:2689`), `PassportClaimRequest` (`:3050`), `FightRecord` (`:3487`),
`MediaAttachment` (`:3689`), plus `RankAward.awardedByPassportId` promoter ref (`:2177`).

**Code surface:** ~383 `nodeId` / `node.id` references in `server/web/lineage` +
`server/admin/lineage`; ~341 `passportId` references across `server`/`lib`/`app`. 54 server
files touch `LineageNode`; 62 touch passport-id resolution. Every one is a query, a projection,
or a test that assumes the two id-spaces are distinct.

**What a unify migration would actually cost:**
1. Rewrite 9 lineage FK columns to reference the Passport id-space, plus a data migration
   repointing every edge, tree-member, access grant, and claim row for all 77 nodes.
2. Reconcile the two `@@unique` composites (`[treeId,nodeId]`, `[email,nodeId]`) — now
   `nodeId` = `passportId`, which changes what "same node twice" means.
3. Audit every one of ~383 lineage call-sites for the assumption `node.id !== passportId`.
   The repo already has a **do-not-merge-twins** hazard on file (`WL-P1-8`: node-keyed vs
   passport-keyed picker id-spaces caused a P2003 masked by a bare `catch{}`, 0497). Collapsing
   the id-spaces *removes the type-level tripwire* that keeps those two picker families apart —
   it makes the exact class of bug that already bit us *unrepresentable-as-distinct*, i.e. worse.
4. The claim flow (`LineageClaimRequest`, `LineagePendingClaim`, `PassportClaimRequest`,
   `LineagePendingClaim @@unique[email,nodeId]`) is keyed to attach an *account* to a *node's
   Passport*. That indirection (`node → passport → user`) is the whole claim design (ADR 0025 §1;
   ADR 0032 email-bound claims). Unifying the ids doesn't simplify it — the three-hop stays.

**Payoff of unifying:** none that survives inspection. You still need the row (nodes carry
`slug`, `visibility`, `archivedAt`, `verificationStatus`, edges, tree membership — none of which
belong on Passport, per ADR 0025 which explicitly moved identity media *onto* Passport and left
lineage/graph state *off* it). You still need the relationship. You'd trade an honest FK for an
overloaded PK, and you'd delete a safety boundary. **Risk enormous, payoff zero.**

---

## 3. DDD framing — one aggregate or two?

**Two aggregates. Not a projection-of-identity in the DDD sense.**

- **`Passport` = Identity aggregate root.** Invariants: one identity per human, name/DOB/avatar,
  optional account binding. It is referenced *by* satellites; it does not know graph topology.
- **`LineageNode` = a position in the lineage graph — its own aggregate.** Its invariants are
  *graph* invariants, not identity ones: it participates in `LineageRelationship` edges
  (multi-parent provenance graph, lineage-hub `:42`), it is a member of trees via
  `LineageTreeMember`, it can *own* trees (`ownerNodeId`), it can be a **branch head** (a graph
  role, ADR 0037 §1), it carries `archivedAt` and a `verificationStatus` that move on graph
  events, not identity events. ADR 0037 consolidated/orphaned nodes independently of any Passport
  change — proof the node has a lifecycle of its own.

The word "projection" in ADR 0025 §1 is a *display/authority* statement (name+avatar resolve
**from** Passport, so identity isn't re-stored on the node), **not** a claim that the node is a
derived read-model with no independent state. It has independent state and independent lifecycle.
It is a distinct aggregate that *holds a reference to* the identity aggregate.

**The tell that they must stay separate: `RankAward` is Passport-keyed, not node-keyed.**
`RankAward.passportId` (`:2168`) hangs promotion provenance off the **identity**, and
`LineageRelationship.rankAwardId` (`:2719`) links the **graph edge** to that award. The two
aggregates already meet *through a third thing* (the award), deliberately — provenance lives on
identity, the graph edge references it. If node id and passport id were the same value, this
carefully-separated dual model (ADR 0016 provenance-vs-display) would have its two axes silently
share a key, inviting exactly the "which id-space am I in" confusion that ADR 0016/0037 work hard
to keep apart. Collapsing the ids would **couple two aggregates that the entire lineage
architecture is built to keep independent.**

---

## 4. The four lenses

**(a) DRY vs KISS.** No DRY violation. DRY forbids storing the same *fact* twice; a 1:1 FK stores
a *relationship* once. There is no duplicated fact — `LineageNode` stores zero identity fields
(name/avatar resolve from Passport, ADR 0025 §1). KISS *favors* keeping them separate: two
single-purpose tables with one honest FK is simpler to reason about than one PK that means two
things depending on whether the row is "acting as identity" or "acting as graph node."

**(b) What would Apple / Facebook / YouTube ship.** The senior data-model answer is **separate
surrogate keys with an FK**, every time. Facebook does not make your `friendship_edge` PK equal
your `user` PK; YouTube does not make a `playlist_membership` PK equal the `video` PK. Graph
edges and node-participations get their **own** stable ids so the graph can evolve (merge, split,
archive, re-parent — ADR 0037 did exactly this) without touching identity ids that are referenced
everywhere else. Overloading identity PKs as graph PKs is the *junior* move that looks clever and
ossifies the schema. The mantra ("one foundation + single-purpose pieces, tokens/ids as contract")
points **at** separation here, not against it.

**(c) General best practice.** Surrogate `cuid(2)` PKs per table + explicit FKs is textbook.
"Shared primary key" 1:1 (making child PK = parent PK) is a real pattern, but it is reserved for
*mandatory, total, co-lifecycle* 1:1 (e.g. table-per-type inheritance where the child is
literally the parent seen through another lens). This relationship is **not total** (most
Passports have no node) and **not co-lifecycle** (node has `archivedAt` + Cascade-from-Passport,
not shared birth/death). Shared-PK is the wrong tool.

**(d) DDD vertical-slice / aggregate boundary.** Two aggregates (§3). Keeping the ids separate
*is* the aggregate boundary made physical. Unifying them would delete the boundary and couple
Identity to Graph-topology — the opposite of what vertical-slice/aggregate design wants.

---

## 5. Verdict, risks, and the rule

**Verdict: KEEP SEPARATE.** Do not unify. This should not be revisited absent a schema change
that makes the node population *total and co-lifecycle* with Passport (it won't — not everyone is
in the lineage, by design).

**Addressing the DRY worry head-on:** `LineageNode.passportId @unique NOT NULL` is a foreign key
doing its normal job. It is not duplication. Duplication would be copying `displayName` or
`avatarUrl` onto the node — which the schema explicitly does **not** do (ADR 0025 resolves those
reads to Passport). One FK column = one relationship, stored once. That is the *definition* of
normalized, DRY-compliant design.

**Risks of the (rejected) unify path:** repoint 9 FK columns + data-migrate all 77 nodes' edges/
memberships/claims; reconcile two `@@unique` composites; audit ~383 lineage call-sites; and —
worst — **delete the type-level id-space boundary** that already failed once (WL-P1-8 P2003),
making that bug class unrepresentable-as-distinct. High risk, zero payoff.

**Risk of keeping separate:** effectively none. The one ongoing discipline it demands is already
a known, logged hazard: **never cross the node-id / passport-id streams** in pickers and FKs
(WL-P1-8). The separation is what lets a lint/type boundary catch that — an argument *for* two
ids, not against.

**The canonical rule (pin this):**
> **A 1:1 FK is a relationship stored once, not a fact stored twice.** `Passport` is the identity
> aggregate; `LineageNode` is a *position in the lineage graph* (its own lifecycle — edges, tree
> membership, `archivedAt`, verification — and referenced by 9 FK columns). Most Passports have no
> node (77 nodes vs a far larger roster), so the mapping is 1:0..1, not a total 1:1 — a shared PK
> would encode the false invariant "every identity is a graph position." Keep two ids; the FK is
> correct, non-redundant, and the physical form of the aggregate boundary.

---

## Drift flagged (out of scope here)

`docs/knowledge/wiki/concepts/passport-and-shells.md` still carries a stale "Passport → User (1:1)"
line and an unresolved RankAward open question from 2026-04 — it predates ADR 0025/0032/0037 and
the nullable `userId`. One-line fix for the next wiki sweep, not this session.
