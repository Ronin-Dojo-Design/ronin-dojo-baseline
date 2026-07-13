import type { ExtendedSortingState } from "~/types"
import type { PostAdminRow } from "./queries"

/**
 * The one Posts-collection default sort: most-recently-updated first. Parked in a leaf module
 * (WL-P2-56) so both the params schema (parser default) and the query's `resolvePostSort`
 * fallback import the same value without an ESM value-cycle between `schema.ts` ↔ `queries.ts`
 * (they only ever type-import each other). Multi-column by design — do NOT collapse to a
 * single-column resolver.
 */
export const DEFAULT_POST_SORT: ExtendedSortingState<PostAdminRow> = [{ id: "updatedAt", desc: true }]
