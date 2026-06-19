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
 * The founder behind Black Belt Legacy — Bob Bass (Dirty Dozen #8, 1st American
 * Black Belt under Rigan Machado). His lineage node carries this stable slug
 * (see `prisma/seed-baseline-lineage.ts`), so we detect "this is the founder
 * claiming his own profile" deterministically off the node — not a brittle name
 * string — to grant him the lifetime founder treatment + celebratory welcome.
 * (SESSION_0418 — self-serve claim wiring.)
 */
export const BBL_FOUNDER_NODE_SLUG = "bob-bass"
