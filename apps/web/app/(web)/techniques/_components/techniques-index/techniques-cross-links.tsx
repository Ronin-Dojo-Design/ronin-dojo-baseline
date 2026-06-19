import Link from "next/link"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { Grid } from "~/components/web/ui/grid"
import { Section } from "~/components/web/ui/section"

const CROSS_LINKS: Array<{ href: string; label: string; description: string }> = [
  {
    href: "/disciplines",
    label: "Disciplines",
    description: "Martial arts styles and rank systems",
  },
  { href: "/courses", label: "Courses", description: "Curriculum and certification programs" },
  { href: "/programs", label: "Programs", description: "Active training programs and offerings" },
]

/** Sibling-surface cross-links — below the technique grid, so this is the lazy boundary. */
export function TechniquesCrossLinks() {
  return (
    <Section>
      <Section.Content>
        <Grid>
          {CROSS_LINKS.map(link => (
            <Link key={link.href} href={link.href}>
              <Card>
                <CardHeader>
                  <H5>{link.label}</H5>
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
