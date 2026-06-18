import Link from "next/link"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Grid } from "~/components/web/ui/grid"
import { Section } from "~/components/web/ui/section"

const CROSS_LINKS: Array<{ href: string; label: string; description: string }> = [
  { href: "/schools", label: "Schools", description: "Dojos and academies in the network" },
  {
    href: "/disciplines",
    label: "Disciplines",
    description: "Martial arts styles and rank systems",
  },
  { href: "/programs", label: "Programs", description: "Training programs and curriculum" },
]

/**
 * Below-the-fold "explore the network" cross-links (Schools / Disciplines /
 * Programs). Lazy-loaded by the orchestrator via `next/dynamic` (SSR kept) since it
 * sits beneath the organizations grid. The link set is static config.
 */
export function OrganizationsCrossLinks() {
  return (
    <Section>
      <Section.Content>
        <Grid>
          {CROSS_LINKS.map(link => (
            <Link key={link.href} href={link.href}>
              <Card>
                <CardHeader>
                  <H4>{link.label}</H4>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </Grid>
      </Section.Content>
    </Section>
  )
}
