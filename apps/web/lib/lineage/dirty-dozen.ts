/**
 * The "Dirty Dozen" cohort — Rigan Machado's first black belts (1992–96).
 *
 * Single source of truth for the cohort label shared by the lineage seed
 * (which creates the `LineageVisualGroup`) and runtime comp-grant detection
 * (BBL claim → lifetime Elite). Must byte-match the seeded group label.
 * (SESSION_0403 — graphify comp gift epic.)
 */
export const DIRTY_DOZEN_LABEL = "The Dirty Dozen — Rigan's First Black Belts (1992–96)"

/**
 * Comp-term rule: a claimed node in the Dirty Dozen visual group earns LIFETIME
 * Elite; everyone else earns a complimentary first year. One predicate shared by
 * the claim-card UI (`/lineage/join` page → PathStep) and the grant path
 * (`createJoinLegacyInterest` → `finalizeLineageNodeClaim`) so the card can never
 * promise a term the grant won't honor (SESSION_0445 #1 — lifted from 3 inline copies).
 */
export function isLifetimeComp(visualGroupLabel: string | null | undefined): boolean {
  return visualGroupLabel === DIRTY_DOZEN_LABEL
}

/**
 * The founder behind Black Belt Legacy — Bob Bass (Dirty Dozen #8, 1st American
 * Black Belt under Rigan Machado). His lineage node carries this stable slug
 * (see `prisma/seed-baseline-lineage.ts`), so we detect "this is the founder
 * claiming his own profile" deterministically off the node — not a brittle name
 * string — to grant him the lifetime founder treatment + celebratory welcome.
 * (SESSION_0418 — self-serve claim wiring.)
 */
export const BBL_FOUNDER_NODE_SLUG = "bob-bass"

/**
 * Bob Bass's known email addresses. The founder "Long Road" claim email shows
 * "intended for …" these addresses (in the footer) so he recognizes it as
 * personally his — regardless of which of his inboxes it's actually delivered
 * to. Display-only; not the delivery target. (SESSION_0418.)
 */
export const BBL_FOUNDER_EMAILS = ["sbjjitsu30@gmail.com", "Bobbassjj@gmail.com"] as const
