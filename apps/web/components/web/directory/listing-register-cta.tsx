import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"

/**
 * Inviting "register / join" callout for the public listing pages
 * (SESSION_0355). Surfaces the existing self-serve create/onboarding flows so a
 * visitor can add their school or join the directory — the discoverability gap
 * the claim funnel doesn't cover (claim = take over an existing owner-less
 * entity; register = create a new one).
 *
 * The unified "search-first → claim if it exists, else create" funnel (the
 * Dirstarter submit pattern adopted for all registers/claims/invites) is staged
 * in the profile/onboarding epic; this is the interim discoverable entry point.
 */
export function ListingRegisterCta({
  title,
  description,
  href,
  cta,
}: {
  title: string
  description: string
  href: string
  cta: string
}) {
  return (
    <Card className="border-primary/30 bg-primary/5 p-4">
      <Stack direction="row" className="flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-base">{title}</p>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <Button render={<Link href={href} />} className="shrink-0">
          {cta}
        </Button>
      </Stack>
    </Card>
  )
}
