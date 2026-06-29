/**
 * card-surface-contract.ts — the pinned values of the ported L1 `Card` surface (doctrine §6).
 *
 * This is the SINGLE SOURCE for the "is-it-a-Card" shell that `card.css` (.mk-surface) must encode
 * and that the board `m-card` composes. `card.css.test.ts` asserts `card.css` + `tokens.css` against
 * it, so the kernel surface can never silently drift from the L1 contract it was ported from
 * (the anti-drift parity guard the doctrine §6 requires).
 *
 * Each value carries its L1 origin (apps/web/components/common/card.tsx + box.tsx) in a comment so
 * the provenance chain L1 → kernel is auditable. Changing a value here is a deliberate contract
 * change — update the L1 mapping comment + the doctrine §6 gap table in the same edit.
 */

/** Declarations that MUST appear verbatim in the `.mk-surface` rule of card.css. */
export const CARD_SURFACE_DECLARATIONS = [
  "background: var(--mk-elevated)", // L1 `bg-card`
  "border: 1px solid var(--mk-line)", // L1 `border`
  "border-radius: var(--mk-r-card)", // L1 `rounded-lg` (8px, reconciled §6 gap #4)
  "box-shadow: var(--mk-shadow-card)", // L1 one soft card shadow
  "padding: var(--mk-space-5)", // L1 `p-5` (20px)
  "flex-direction: column", // L1 `flex-col`
  "align-items: flex-start", // L1 `items-start`
  "width: 100%", // L1 `w-full`
] as const;

/** The reconciled card radius — pinned to the L1 `rounded-lg` value (doctrine §6 gap #4). */
export const CARD_RADIUS = "8px";

/** The token tokens.css must bind `--mk-r-card` to (so card.css resolves to CARD_RADIUS). */
export const CARD_RADIUS_TOKEN_DECLARATION = `--mk-r-card: ${CARD_RADIUS}`;
