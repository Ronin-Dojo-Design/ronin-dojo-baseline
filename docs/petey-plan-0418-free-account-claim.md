---
title: "Cloud prompt — self-serve free account + magic-link claim + comp gift (BBL)"
slug: petey-plan-0418-free-account-claim
type: cloud-prompt
status: ready
created: 2026-06-19
pairs_with:
  - docs/sprints/SESSION_0417.md
  - docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md
---

# Cloud prompt — wire the join modal to the existing magic-link claim + comp-gift flow

> Paste everything below the line into a fresh cloud agent. It is self-contained.
> Research note (SESSION_0417): **almost all of this already exists** — the task is to
> WIRE the public join action to it, not to rebuild the claim/auth/comp machinery.

---

## Goal

When someone submits the **Join the Legacy** modal (`/lineage/join`, also the home `/`), make
the **FREE** path self-serve end-to-end:

- **Guest claiming an existing profile** (e.g. a Dirty Dozen member like Bob Bass, or a student
  like Chayce Johnson): on submit they get a **branded "claim your profile" email** containing an
  **email-bound magic link**. Clicking it → Better Auth verifies + sets the session → the
  preview-cookie hop → the token-accept route claims the node → **account attached, ownership
  transferred, and the comp ELITE / lifetime entitlement granted** (Dirty Dozen = lifetime,
  others = 1yr) → lands on `/me` with free-tier access. **No sign-in bounce.**
- **Free signup NOT claiming a node**: emailed magic link → click → a **free account is
  provisioned** (Better Auth creates the user on verify) → lands on `/me`, free-tier features on.
- **Premium / Elite**: continue to the lineage-membership **Stripe checkout** (already wired —
  `data.checkoutUrl` → `#lineage-membership`). Do not change this.

The join modal currently shows a **"Success! Check your email"** state on FREE submit (already
shipped), but the email it sends is **not yet the actionable magic-link claim email** — that is
the gap to close.

## The existing machinery to REUSE (do not rebuild)

| Concern | File / symbol | Notes |
| --- | --- | --- |
| Mint the magic link | `apps/web/scripts/send-bbl-claim-emails.ts` → `mintClaimMagicLink()` (~L160–198) | Calls `auth.api.signInMagicLink({ body: { email, callbackURL, metadata: { skipEmail: true } } })`, reads the token back from `verification` (plain storeToken → `identifier` IS the token; match `value contains "email":"<email>"`), builds `/api/auth/magic-link/verify?token=…&callbackURL=…` on the BBL origin. **Mint SERIAL.** |
| callbackURL shape | same | claim: `/preview?token=<previewToken>&next=/lineage/claim/accept?node=<nodeId>`; free-no-claim: `/preview?token=<previewToken>&next=/me`. `previewToken = process.env.BBL_PREVIEW_TOKEN ?? "bob-tony-BBL-preview"`. |
| Claim email | `apps/web/lib/notifications.ts` → `notifyMemberOfBblClaimYourProfile({ brand, to, firstName, profileName, claimUrl, compTier:"ELITE", isLifetime })` → `EmailBblClaimYourProfile` (`apps/web/emails/bbl-claim-your-profile.tsx`) | Already branded (BBL wrapper). |
| Claim finalize (account+comp) | `apps/web/server/web/lineage/claim-accept-actions.ts` → `acceptLineageClaimByToken` → `apps/web/server/admin/lineage/claim-finalize.ts` → `finalizeLineageNodeClaim` | **Already** returns `{ accessGrantId, compGrantIds, ownershipTransferred, passportAccountAttached }` — comp ELITE/lifetime grant + Passport account-attach + ownership transfer happen here. Just confirm; don't reimplement. |
| Token-accept route | `apps/web/app/(web)/lineage/claim/accept/route.ts` | Landing target of the magic link; arms preview then calls `acceptLineageClaimByToken`. |
| Dirty Dozen list | `apps/web/lib/lineage/dirty-dozen.ts` | Source of `isLifetime` (Dirty Dozen → lifetime). |
| Comp/gift spec | `docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md` + `apps/web/server/entitlements/lineage-comp-seed.ts`, `comp-grants.test.ts` | The comp/gift model (SESSION_0346/0347). |
| The action to wire | `apps/web/server/web/lead/public-actions.ts` → `createJoinLegacyInterest` | Already creates the lead, resolves `claimTree`/`claimMember`/`isClaimOfExistingNode`, and (when signed in) creates the claim. Add the mint+send for guests. |
| Success-state UI (shipped) | `apps/web/app/(web)/lineage/join/join-legacy-wizard/{use-join-wizard.ts,index.tsx}` | `onSuccess`: paid → `router.push(checkoutUrl)`; else `setSubmitted(true)` (success modal). Keep. |
| Magic-link plugin | `apps/web/lib/auth.ts` (`magicLink({ sendMagicLink })`) | `metadata.skipEmail` suppresses the generic login email so the branded one ships. |

## ⭐ Founder special-case — Bob Bass (HIGHEST PRIORITY, must work for the demo)

Bob Bass is **the founder** behind Black Belt Legacy. His claim must be flawless:

- **Comp ELITE, free for life.** Ensure Bob's node/Passport resolves to `isLifetime = true`
  (he should be in `apps/web/lib/lineage/dirty-dozen.ts`; if not, add/flag him as founder so the
  comp grant is **lifetime**, not 1yr). Verify the grant lands via `finalizeLineageNodeClaim`.
- **Custom founder success modal.** When Bob claims his profile, do NOT show the generic
  "Success! Check your email" / generic post-claim screen. Show a **personalized, celebratory**
  modal that:
  - recognizes him as **the founder and the genius behind Black Belt Legacy**,
  - thanks him for his **patience** through the build,
  - expresses genuine **excitement for the success** ahead.
  - Detect the founder deterministically by the claimed **node/Passport** (Bob Bass's node) — not
    by a brittle name string if a stable id/slug/flag exists. A `isFounder` flag on the node or a
    constant `BBL_FOUNDER_NODE_SLUG`/passport id is the clean way; surface it from the action so
    both the submit-time success state AND the post-claim `/me` landing can branded-welcome him.
- Bob's review addresses: `sbjjitsu30@gmail.com`, `bobbassjjitsu30@gmail.com` — make sure a claim
  email to either resolves to his node and the founder treatment.

## Build steps

1. **Extract `mintClaimMagicLink` into a shared server module** (e.g.
   `apps/web/server/web/lineage/mint-claim-magic-link.ts`) so BOTH the script and the public
   action import it. Keep the serial-mint + token-readback logic. Add a `nextPath` param so it
   can target `/lineage/claim/accept?node=…` (claim) **or** `/me` (free signup). Reuse the request
   host in the action context (synthesize Headers pinned to the BBL host as the script does).
2. **Wire `createJoinLegacyInterest` (FREE path):** after the lead is created and `isClaimOfExistingNode`
   is resolved:
   - **Guest + claim of existing node:** mint a claim magic link, compute `isLifetime` from the
     Dirty Dozen list for that node/person, then `notifyMemberOfBblClaimYourProfile({ claimUrl,
     compTier:"ELITE", isLifetime, … })`. Do **not** set the sign-in-bounce path.
   - **Guest + no node (plain free):** mint a `/me` magic link and send an appropriate welcome/verify
     email (reuse an existing template or `EmailMagicLink`).
   - **Signed-in user:** keep the existing immediate claim creation; no magic link needed.
   - Keep the action's return shape so the wizard still renders the success modal. `claimRequiresSignIn`
     should no longer drive a client bounce (the magic link replaces it).
3. **Confirm comp gating end-to-end:** after a magic-link claim, `finalizeLineageNodeClaim` must
   grant comp **ELITE** (lifetime for Dirty Dozen, 1yr otherwise) and the user must see **free-tier**
   features as an authenticated account. Verify against `GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md`;
   add/adjust only if a wiring gap exists.
4. **De-dupe identity:** the claim path attaches the account to the node's **existing placeholder
   Passport** — never create a second identity (Chayce/Bob already exist as nodes). For plain free
   signups, dedupe by email against existing member Passports before/instead of creating a new one.
5. **Tests:** **stub the Resend seam** (do not send live email in tests — known sender-rep hazard).
   Add coverage for: guest-claim → mint+send (no bounce), Dirty-Dozen `isLifetime=true`,
   non-Dirty-Dozen `isLifetime=false`, free-no-claim → `/me` link, signed-in → immediate claim.

## Constraints / gotchas

- **Serial minting only** (the `verification` read-back can grab a sibling's token under parallel mints).
- **`metadata.skipEmail: true`** when minting (the branded email is the one that ships).
- callbackURL must include the **preview-token hop** so the recipient passes the still-live countdown gate.
- Pin the verify URL to the **BBL origin** (not `BETTER_AUTH_URL`).
- **`next build` is the authoritative typecheck** (not bare `tsc`); a `"use server"` file may only
  export async functions.
- Single-brand BBL; prod sender is `welcome@blackbeltlegacy.com` (env already corrected).

## Done means

A guest submits a profile claim (e.g. for a Dirty Dozen member) → receives the branded claim email →
clicks → is signed in, their node is claimed, comp ELITE/lifetime is granted, and they land on `/me`
with free-tier access — **no sign-in bounce, no loop back into the form.** Free non-claim signups get
a free account the same way. Premium/Elite still go to Stripe checkout. `next build` green; tests stub
Resend; PR open.
