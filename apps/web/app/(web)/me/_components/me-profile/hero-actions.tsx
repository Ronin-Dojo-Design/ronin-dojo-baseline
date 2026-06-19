import { ExternalLinkIcon, PencilIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import type { MyProfile } from "~/server/web/directory/profile-projection"

/**
 * Hero actions cluster: edit the profile (always) and — only for a PUBLIC profile with
 * a slug — jump to the public `/directory/[slug]` view.
 */
export function HeroActions({ profile }: { profile: MyProfile }) {
  const isPublic = profile.visibility === "PUBLIC"

  return (
    <Stack size="sm">
      <Button
        variant="primary"
        size="md"
        prefix={<PencilIcon />}
        render={<Link href="/app/profile" />}
      >
        Edit profile
      </Button>
      {isPublic && profile.slug && (
        <Button
          variant="secondary"
          size="md"
          prefix={<ExternalLinkIcon />}
          render={<Link href={`/directory/${profile.slug}`} />}
        >
          View public profile
        </Button>
      )}
    </Stack>
  )
}
