"use client"

import { Carousel, CarouselSlide } from "~/components/common/carousel"
import type { QuickAction } from "./app-quick-actions"
import { QuickActionTile } from "./quick-action-tile"

/**
 * The short quick-action carousel — the mobile swipe rail (SESSION_0599 pin:
 * grid + carousel, BOTH built). Reuses the shared Embla `Carousel` primitive
 * (`components/common/carousel.tsx`) — NO second carousel component, and none of
 * the 11 existing browse consumers are touched. Swipe-only (`controls="none"`),
 * since it renders on mobile where the sibling grid is hidden.
 */
export function QuickActionCarousel({ actions }: { actions: QuickAction[] }) {
  if (actions.length === 0) {
    return null
  }

  return (
    <Carousel ariaLabel="Quick actions" controls="none" className="-mx-1 px-1">
      {actions.map(action => (
        <CarouselSlide key={action.id} width={168}>
          <QuickActionTile action={action} className="h-full" />
        </CarouselSlide>
      ))}
    </Carousel>
  )
}
