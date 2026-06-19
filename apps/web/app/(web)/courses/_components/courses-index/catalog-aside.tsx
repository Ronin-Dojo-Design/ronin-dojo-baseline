import Link from "next/link"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"

type CrossLink = { href: string; label: string; description: string }

const CROSS_LINKS: CrossLink[] = [
  {
    href: "/programs",
    label: "Programs",
    description: "Multi-course curriculum tracks",
  },
  {
    href: "/disciplines",
    label: "Disciplines",
    description: "Martial arts styles and rank systems",
  },
  {
    href: "/schools",
    label: "Schools",
    description: "Dojos and academies in the network",
  },
]

/**
 * Catalog sidebar for the courses index: the total-count summary card plus the
 * "Explore related" cross-link card. Presentational — the `total` is resolved by the
 * route's lightweight top-N fetch and threaded in. Heading-into-`h2` render override
 * preserved verbatim from the prior inline page so the document outline is unchanged.
 */
export function CatalogAside({ total }: { total: number }) {
  return (
    <>
      <Card hover={false}>
        <Stack direction="column" size="sm">
          <H5 render={props => <h2 {...props}>{props.children}</h2>}>Catalog</H5>
          <Stack size="sm" className="flex-wrap">
            <Badge variant="soft">{total} courses</Badge>
          </Stack>
          <Note>
            Search, sort, and pagination live inside the catalog on the left to keep this surface
            focused.
          </Note>
        </Stack>
      </Card>

      <Card hover={false}>
        <Stack direction="column" size="sm">
          <H5 render={props => <h2 {...props}>{props.children}</h2>}>Explore related</H5>
          <Stack direction="column" size="xs" className="w-full">
            {CROSS_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-md p-2 -mx-2 hover:bg-accent"
              >
                <Stack direction="column" size="xs">
                  <span className="font-medium text-sm">{link.label}</span>
                  <span className="text-xs text-muted-foreground">{link.description}</span>
                </Stack>
              </Link>
            ))}
          </Stack>
        </Stack>
      </Card>
    </>
  )
}
