import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"

/** "Social" sidebar card — external profile links as outline badges. */
export function SocialCard({ socialLinks }: { socialLinks: Record<string, string> | null }) {
  if (!socialLinks || Object.keys(socialLinks).length === 0) {
    return null
  }

  return (
    <Card hover={false}>
      <CardHeader>
        <H5 className={bblHeadingFontClass}>Social</H5>
      </CardHeader>
      <Stack size="sm" wrap className="w-full">
        {Object.entries(socialLinks).map(([platform, url]) => (
          <Link key={platform} href={url} target="_blank" rel="noopener noreferrer">
            <Badge variant="outline">{platform}</Badge>
          </Link>
        ))}
      </Stack>
    </Card>
  )
}
