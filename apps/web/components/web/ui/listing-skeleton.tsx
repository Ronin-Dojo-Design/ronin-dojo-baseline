import { Skeleton } from "~/components/common/skeleton"
import { Grid } from "~/components/web/ui/grid"

type ListingSkeletonProps = {
  /** Number of card placeholders to render. */
  count?: number
  /** Render the Intro-style heading + description bars above the grid. */
  withIntro?: boolean
}

/**
 * Route-level loading placeholder for card-grid listing pages. Composes the
 * `Skeleton` primitive into an Intro-shaped header + a faithful `Grid` of card
 * skeletons so navigation gets an instant boundary (Next.js `loading.tsx`) that
 * matches the real page shape. See docs/runbooks/design/motion-system.md
 * (skeleton → content crossfade) and SESSION_0304.
 */
export function ListingSkeleton({ count = 6, withIntro = true }: ListingSkeletonProps) {
  return (
    <>
      {withIntro && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      )}
      <Grid>
        {[...Array(count)].map((_, index) => (
          <Skeleton key={index} className="h-44 w-full rounded-lg" />
        ))}
      </Grid>
    </>
  )
}
