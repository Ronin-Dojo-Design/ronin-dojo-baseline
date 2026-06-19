import { Badge } from "~/components/common/badge"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import type { DirectoryProfile } from "./directory-profile-data"

/** Social links (full profile only) — rendered as outbound badge links. */
export function SocialSection({ profile }: { profile: DirectoryProfile }) {
  const { socialLinks } = profile.user

  if (!socialLinks || Object.keys(socialLinks).length === 0) {
    return null
  }

  return (
    <Section>
      <H4>Social</H4>
      <Stack size="sm" className="flex-wrap">
        {Object.entries(socialLinks as Record<string, string>).map(([platform, url]) => (
          <Link key={platform} href={url} target="_blank" rel="noopener noreferrer">
            <Badge variant="outline">{platform}</Badge>
          </Link>
        ))}
      </Stack>
    </Section>
  )
}
