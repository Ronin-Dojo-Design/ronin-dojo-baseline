import type { ReactNode } from "react"
import { H2 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Backdrop } from "~/components/web/ui/backdrop"
import { Section } from "~/components/web/ui/section"
import { Sticky } from "~/components/web/ui/sticky"

/**
 * ListingDetail — SESSION_0397 shared detail-page chrome (Tool→Listing parity, ADR 0028 follow-up).
 * Lifts the sticky hero + actions cluster + content/sidebar/related layout out of the L1 tool-detail
 * page (`app/(web)/[slug]/page.tsx`) so the bespoke `/directory/[slug]` and `/schools/[slug]` pages
 * render Tool-grade chrome. **Chrome only:** the divergent bodies and the three distinct claim systems
 * (tool dialog / ProfileClaimButton / OrgClaimCta) stay per-entity, passed in as slots — exactly how
 * `ListingCard` shares the card chrome but not the data. The L1 tool page keeps its own bespoke layout
 * (ToolButton / screenshot / Ad), so it is intentionally NOT routed through this.
 */

type ListingDetailProps = {
  /** Leading hero media — a Favicon (tools) or Avatar (people/schools). Optional. */
  media?: ReactNode
  /** Page H1 text. */
  title: ReactNode
  /** Hero badges shown inline after the title (verified, tier, trust, type, discipline). */
  badges?: ReactNode
  /** Actions cluster (Claim / Save / Share). Rendered in the hero on desktop, below body on mobile. */
  actions?: ReactNode
  /** One-line intro/description under the hero. */
  intro?: ReactNode
  /** Main column body (the per-entity sections). */
  children: ReactNode
  /** Categories/tags footer slot. */
  taxonomy?: ReactNode
  /** Right sidebar content (Overview / Contact / Affiliations). */
  sidebar?: ReactNode
  /** Full-width related section under the grid. */
  related?: ReactNode
}

export function ListingDetail({
  media,
  title,
  badges,
  actions,
  intro,
  children,
  taxonomy,
  sidebar,
  related,
}: ListingDetailProps) {
  return (
    <>
      <Section>
        <Section.Content className="max-md:contents">
          <Sticky isOverlay>
            <Stack className="self-stretch">
              {media}

              <Stack className="flex-1 min-w-0">
                <H2
                  render={props => <h1 {...props}>{props.children}</h1>}
                  className="leading-tight! truncate"
                >
                  {title}
                </H2>

                {badges}
              </Stack>

              {actions && <div className="max-sm:hidden">{actions}</div>}

              <Backdrop />
            </Stack>
          </Sticky>

          {intro}

          {children}

          {taxonomy}

          {actions && <div className="self-stretch sm:hidden max-md:order-last">{actions}</div>}
        </Section.Content>

        {sidebar && <Section.Sidebar className="max-md:contents">{sidebar}</Section.Sidebar>}
      </Section>

      {related}
    </>
  )
}
